/**
 * Foundation Application API Route
 *
 * Handles POST requests for foundation project applications.
 * Features:
 * - Rate limiting (5/min, 50/day per IP)
 * - Request validation with Zod
 * - File upload handling (max 3 files, 10MB each)
 * - Email notifications (confirmation + admin)
 * - Audit logging
 * - KVKK/GDPR compliance
 * - Anti-spam (honeypot + rate limiting)
 */

import { NextRequest, NextResponse } from 'next/server';
import { FoundationApplicationSchema } from '@/lib/validation/foundation-application';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';
import { logApplication, generateApplicationId } from '@/lib/security/audit';
import { sendConfirmationEmail, sendAdminNotification } from '@/lib/email/mailer';
import { ZodError } from 'zod';

// Force Node.js runtime for file upload support
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Maximum request size (12MB to handle 3x 10MB files + form data)
export const maxDuration = 30; // 30 seconds max execution time

/**
 * Parse multipart form data
 */
async function parseFormData(request: NextRequest): Promise<{
  data: Record<string, any>;
  files: Array<{ filename: string; content: Buffer; contentType: string }>;
}> {
  const formData = await request.formData();

  const data: Record<string, any> = {};
  const files: Array<{ filename: string; content: Buffer; contentType: string }> = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      // Handle file upload
      const arrayBuffer = await value.arrayBuffer();
      files.push({
        filename: value.name,
        content: Buffer.from(arrayBuffer),
        contentType: value.type,
      });
    } else {
      // Handle regular form field
      // Try to parse JSON values
      try {
        if (value.startsWith('{') || value.startsWith('[')) {
          data[key] = JSON.parse(value);
        } else if (value === 'true') {
          data[key] = true;
        } else if (value === 'false') {
          data[key] = false;
        } else if (!isNaN(Number(value)) && value !== '') {
          data[key] = Number(value);
        } else {
          data[key] = value;
        }
      } catch {
        data[key] = value;
      }
    }
  }

  return { data, files };
}

/**
 * POST /api/foundation/apply
 * Submit a new foundation application
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let applicationId: string | null = null;
  let clientIp: string = 'unknown';

  try {
    // 1. Extract client IP
    clientIp = getClientIp(request);
    console.log(`[API] Application request from IP: ${clientIp}`);

    // 2. Check rate limit
    const rateLimit = await checkRateLimit(clientIp);
    if (!rateLimit.success) {
      console.warn(`[API] Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter?.toString() || '900',
            'X-RateLimit-Limit': rateLimit.limit?.toString() || '5',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // 3. Parse form data
    const { data, files } = await parseFormData(request);
    console.log(`[API] Parsed form data with ${files.length} files`);

    // 4. Validate data with Zod
    let validatedData;
    try {
      validatedData = FoundationApplicationSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn('[API] Validation failed:', error.errors);
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // 5. Honeypot check (anti-spam)
    if (validatedData.website_url && validatedData.website_url.length > 0) {
      console.warn(`[API] Spam detected from IP: ${clientIp}`);

      // Log spam attempt
      applicationId = generateApplicationId();
      await logApplication({
        id: applicationId,
        ip: clientIp,
        email: validatedData.contactEmail,
        projectName: validatedData.projectName,
        category: validatedData.category,
        orgType: validatedData.orgType,
        country: validatedData.country,
        budgetRequested: validatedData.requestedAmount,
        filesCount: files.length,
        status: 'spam_detected',
      });

      // Return success to avoid revealing spam detection
      return NextResponse.json(
        {
          success: true,
          applicationId,
          message: 'Application received and will be reviewed.',
        },
        { status: 200 }
      );
    }

    // 6. Generate application ID
    applicationId = generateApplicationId();
    console.log(`[API] Generated application ID: ${applicationId}`);

    // 7. Validate file attachments
    if (files.length > 3) {
      return NextResponse.json(
        {
          error: 'Too many files',
          message: 'Maximum 3 attachments allowed',
        },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.content.length > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            error: 'File too large',
            message: `File ${file.filename} exceeds 10MB limit`,
          },
          { status: 400 }
        );
      }
    }

    // 8. Send emails (async, don't block response)
    const applicationWithId = { ...validatedData, id: applicationId };

    try {
      // Send confirmation to applicant
      await sendConfirmationEmail(applicationWithId);
      console.log(`[API] Confirmation email sent to: ${validatedData.contactEmail}`);
    } catch (emailError) {
      console.error('[API] Failed to send confirmation email:', emailError);
      // Continue despite email failure
    }

    try {
      // Send notification to admin with attachments
      await sendAdminNotification(applicationWithId, files);
      console.log('[API] Admin notification sent');
    } catch (emailError) {
      console.error('[API] Failed to send admin notification:', emailError);
      // Continue despite email failure
    }

    // 9. Log application (audit trail)
    await logApplication({
      id: applicationId,
      ip: clientIp,
      email: validatedData.contactEmail,
      projectName: validatedData.projectName,
      category: validatedData.category,
      orgType: validatedData.orgType,
      country: validatedData.country,
      budgetRequested: validatedData.requestedAmount,
      filesCount: files.length,
      storageRefs: files.map(f => f.filename),
      status: 'submitted',
    });

    // 10. Success response
    const processingTime = Date.now() - startTime;
    console.log(`[API] Application ${applicationId} processed in ${processingTime}ms`);

    return NextResponse.json(
      {
        success: true,
        applicationId,
        message: 'Application submitted successfully',
        processingTime,
      },
      {
        status: 200,
        headers: {
          'X-Application-ID': applicationId,
          'X-Processing-Time': processingTime.toString(),
        },
      }
    );
  } catch (error) {
    console.error('[API] Application processing failed:', error);

    // Log failure
    if (applicationId) {
      try {
        await logApplication({
          id: applicationId,
          ip: clientIp,
          email: 'unknown',
          projectName: 'unknown',
          category: 'veganism',
          orgType: 'nonprofit',
          country: 'unknown',
          budgetRequested: 0,
          filesCount: 0,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      } catch (logError) {
        console.error('[API] Failed to log error:', logError);
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process application. Please try again later.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/foundation/apply
 * Return API documentation
 */
export async function GET() {
  return NextResponse.json(
    {
      name: 'CORIA Foundation Application API',
      version: '1.0.0',
      description: 'Submit project applications for CORIA Foundation funding',
      endpoint: '/api/foundation/apply',
      methods: {
        POST: {
          description: 'Submit a new foundation application',
          contentType: 'multipart/form-data',
          rateLimit: {
            requests: 5,
            period: '1 minute',
            dailyLimit: 50,
          },
          requiredFields: [
            'projectName',
            'category',
            'orgType',
            'contactName',
            'contactEmail',
            'country',
            'shortSummary',
            'detailedDescription',
            'budget',
            'requestedAmount',
            'timelineStart',
            'timelineEnd',
            'consent',
          ],
          optionalFields: [
            'website',
            'socialMedia',
            'impactMetrics',
            'attachments',
            'marketingConsent',
          ],
          attachments: {
            max: 3,
            maxSize: '10MB',
            acceptedTypes: ['application/pdf', 'image/png', 'image/jpeg'],
          },
          responses: {
            200: 'Application submitted successfully',
            400: 'Validation error',
            429: 'Rate limit exceeded',
            500: 'Internal server error',
          },
        },
      },
      security: {
        rateLimiting: '5 requests/minute, 50 requests/day per IP',
        spam: 'Honeypot protection',
        validation: 'Zod schema validation',
        privacy: 'KVKK/GDPR compliant',
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
}

/**
 * OPTIONS /api/foundation/apply
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
