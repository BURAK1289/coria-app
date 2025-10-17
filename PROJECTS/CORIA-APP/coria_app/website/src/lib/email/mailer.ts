/**
 * Email Service for Foundation Applications
 *
 * Sends confirmation emails to applicants and notification emails to admins.
 * Supports HTML and plain text formats for accessibility.
 * Uses nodemailer with SMTP configuration.
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { FoundationApplication } from '../validation/foundation-application';

// Email configuration
const SMTP_HOST = process.env.MAIL_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.MAIL_PORT || '587');
const SMTP_SECURE = process.env.MAIL_SECURE === 'true';
const SMTP_USER = process.env.MAIL_USER;
const SMTP_PASS = process.env.MAIL_PASS;
const MAIL_FROM = process.env.MAIL_FROM || 'foundation@coria.app';
const MAIL_TO = process.env.MAIL_TO || 'foundation@coria.app';

// Transporter instance
let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter(): Transporter {
  if (!transporter) {
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn('[Email] SMTP credentials not configured, emails will not be sent');
      // Return a mock transporter for development
      return {
        sendMail: async (options: any) => {
          console.log('[Email] Mock send:', options.subject);
          return { messageId: 'mock-' + Date.now() };
        },
      } as any;
    }

    transporter = nodemailer.createTransporter({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    console.log(`[Email] Transporter initialized: ${SMTP_HOST}:${SMTP_PORT}`);
  }

  return transporter;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}

/**
 * Send confirmation email to applicant
 */
export async function sendConfirmationEmail(
  application: FoundationApplication & { id: string }
): Promise<void> {
  const transport = getTransporter();

  const subject = `CORIA Foundation Application Received - ${application.id}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #2C5530 0%, #4A7C4E 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">CORIA Foundation</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Application Confirmation</p>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <p>Dear ${application.contactName},</p>

    <p>Thank you for submitting your project application to the CORIA Foundation. We have received your application and our team will review it carefully.</p>

    <div style="background: white; border-left: 4px solid #2C5530; padding: 20px; margin: 20px 0; border-radius: 5px;">
      <h2 style="margin-top: 0; color: #2C5530;">Application Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Application ID:</strong></td>
          <td style="padding: 8px 0;">${application.id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Project Name:</strong></td>
          <td style="padding: 8px 0;">${application.projectName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Category:</strong></td>
          <td style="padding: 8px 0;">${application.category}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Requested Amount:</strong></td>
          <td style="padding: 8px 0;">${formatCurrency(application.requestedAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Submitted:</strong></td>
          <td style="padding: 8px 0;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
      </table>
    </div>

    <h3 style="color: #2C5530;">What happens next?</h3>
    <ol style="padding-left: 20px;">
      <li style="margin-bottom: 10px;">Our team will review your application within 2-4 weeks</li>
      <li style="margin-bottom: 10px;">We may contact you for additional information</li>
      <li style="margin-bottom: 10px;">You will be notified about the decision via email</li>
      <li style="margin-bottom: 10px;">If approved, we will work with you on project implementation</li>
    </ol>

    <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0;"><strong>📧 Keep this email for your records.</strong> Your application ID is important for tracking your application status.</p>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0;"><strong>🔒 Privacy Notice (KVKK/GDPR):</strong> Your personal data will be processed in accordance with our privacy policy. We will retain your application data for 24 months for compliance purposes. You have the right to access, correct, or request deletion of your data at any time.</p>
    </div>

    <p>If you have any questions, please contact us at <a href="mailto:${MAIL_FROM}" style="color: #2C5530;">${MAIL_FROM}</a>.</p>

    <p>Thank you for your commitment to sustainability!</p>

    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>CORIA Foundation Team</strong>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© ${new Date().getFullYear()} CORIA Foundation. All rights reserved.</p>
    <p>
      <a href="https://coria.app/privacy" style="color: #666; text-decoration: none;">Privacy Policy</a> |
      <a href="https://coria.app/terms" style="color: #666; text-decoration: none;">Terms of Service</a>
    </p>
  </div>
</body>
</html>
  `;

  const text = `
CORIA Foundation - Application Confirmation

Dear ${application.contactName},

Thank you for submitting your project application to the CORIA Foundation.

Application Details:
- Application ID: ${application.id}
- Project Name: ${application.projectName}
- Category: ${application.category}
- Requested Amount: ${formatCurrency(application.requestedAmount)}
- Submitted: ${new Date().toLocaleDateString()}

What happens next:
1. Our team will review your application within 2-4 weeks
2. We may contact you for additional information
3. You will be notified about the decision via email
4. If approved, we will work with you on project implementation

Keep this email for your records. Your application ID is important for tracking.

Privacy Notice (KVKK/GDPR):
Your personal data will be processed in accordance with our privacy policy.
We will retain your application data for 24 months for compliance purposes.
You have the right to access, correct, or request deletion of your data.

Questions? Contact us at ${MAIL_FROM}

Thank you for your commitment to sustainability!

Best regards,
CORIA Foundation Team

© ${new Date().getFullYear()} CORIA Foundation
  `;

  try {
    await transport.sendMail({
      from: MAIL_FROM,
      to: application.contactEmail,
      subject,
      html,
      text,
    });

    console.log(`[Email] Confirmation sent to: ${application.contactEmail}`);
  } catch (error) {
    console.error('[Email] Failed to send confirmation:', error);
    throw error;
  }
}

/**
 * Send notification email to admin
 */
export async function sendAdminNotification(
  application: FoundationApplication & { id: string },
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
): Promise<void> {
  const transport = getTransporter();

  const subject = `🚀 New Foundation Application: ${application.projectName} [${application.id}]`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Foundation Application</title>
</head>
<body style="font-family: monospace; padding: 20px; background: #f5f5f5;">
  <div style="background: white; border: 2px solid #2C5530; border-radius: 8px; padding: 20px; max-width: 800px; margin: 0 auto;">
    <h1 style="color: #2C5530; border-bottom: 2px solid #2C5530; padding-bottom: 10px;">🚀 New Foundation Application</h1>

    <h2>📋 Application Overview</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr><td style="padding: 5px; background: #f0f0f0;"><strong>ID:</strong></td><td style="padding: 5px;">${application.id}</td></tr>
      <tr><td style="padding: 5px; background: #f0f0f0;"><strong>Project:</strong></td><td style="padding: 5px;"><strong>${application.projectName}</strong></td></tr>
      <tr><td style="padding: 5px; background: #f0f0f0;"><strong>Category:</strong></td><td style="padding: 5px;">${application.category}</td></tr>
      <tr><td style="padding: 5px; background: #f0f0f0;"><strong>Org Type:</strong></td><td style="padding: 5px;">${application.orgType}</td></tr>
      <tr><td style="padding: 5px; background: #f0f0f0;"><strong>Country:</strong></td><td style="padding: 5px;">${application.country}</td></tr>
    </table>

    <h2>👤 Contact Information</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr><td style="padding: 5px; background: #f0f0f0;"><strong>Name:</strong></td><td style="padding: 5px;">${application.contactName}</td></tr>
      <tr><td style="padding: 5px; background: #f0f0f0;"><strong>Email:</strong></td><td style="padding: 5px;"><a href="mailto:${application.contactEmail}">${application.contactEmail}</a></td></tr>
      ${application.website ? `<tr><td style="padding: 5px; background: #f0f0f0;"><strong>Website:</strong></td><td style="padding: 5px;"><a href="${application.website}">${application.website}</a></td></tr>` : ''}
    </table>

    <h2>💰 Financial Details</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr><td style="padding: 5px; background: #f0f0f0;"><strong>Total Budget:</strong></td><td style="padding: 5px;">${formatCurrency(application.budget)}</td></tr>
      <tr><td style="padding: 5px; background: #f0f0f0;"><strong>Requested:</strong></td><td style="padding: 5px;"><strong style="color: #2C5530;">${formatCurrency(application.requestedAmount)}</strong></td></tr>
      <tr><td style="padding: 5px; background: #f0f0f0;"><strong>Timeline:</strong></td><td style="padding: 5px;">${application.timelineStart} → ${application.timelineEnd}</td></tr>
    </table>

    <h2>📝 Project Description</h2>
    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
      <h3 style="margin-top: 0;">Summary</h3>
      <p>${application.shortSummary}</p>
      <h3>Detailed Description</h3>
      <p style="white-space: pre-wrap;">${application.detailedDescription}</p>
      ${application.impactMetrics ? `<h3>Impact Metrics</h3><p>${application.impactMetrics}</p>` : ''}
    </div>

    <h2>📎 Attachments</h2>
    <p>${attachments && attachments.length > 0 ? `${attachments.length} file(s) attached to this email` : 'No attachments'}</p>

    <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
      <strong>✅ Next Steps:</strong>
      <ol style="margin: 10px 0 0 0; padding-left: 20px;">
        <li>Review application details and attachments</li>
        <li>Assess alignment with foundation goals</li>
        <li>Contact applicant for follow-up if needed</li>
        <li>Make funding decision within 2-4 weeks</li>
      </ol>
    </div>

    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
      Submitted: ${new Date().toLocaleString()}<br>
      Application ID: ${application.id}
    </p>
  </div>
</body>
</html>
  `;

  const text = `
CORIA FOUNDATION - NEW APPLICATION

Application ID: ${application.id}
Project: ${application.projectName}
Category: ${application.category}
Organization Type: ${application.orgType}
Country: ${application.country}

CONTACT:
Name: ${application.contactName}
Email: ${application.contactEmail}
${application.website ? `Website: ${application.website}` : ''}

FINANCIAL:
Total Budget: ${formatCurrency(application.budget)}
Requested Amount: ${formatCurrency(application.requestedAmount)}
Timeline: ${application.timelineStart} → ${application.timelineEnd}

PROJECT SUMMARY:
${application.shortSummary}

DETAILED DESCRIPTION:
${application.detailedDescription}

${application.impactMetrics ? `IMPACT METRICS:\n${application.impactMetrics}` : ''}

ATTACHMENTS: ${attachments && attachments.length > 0 ? attachments.length : 0} file(s)

---
Submitted: ${new Date().toLocaleString()}
  `;

  try {
    const emailOptions: any = {
      from: MAIL_FROM,
      to: MAIL_TO,
      subject,
      html,
      text,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailOptions.attachments = attachments.map(file => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType,
      }));
    }

    await transport.sendMail(emailOptions);

    console.log(`[Email] Admin notification sent to: ${MAIL_TO}`);
  } catch (error) {
    console.error('[Email] Failed to send admin notification:', error);
    throw error;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const transport = getTransporter();

    if (!SMTP_USER || !SMTP_PASS) {
      console.warn('[Email] Test skipped: No SMTP credentials configured');
      return false;
    }

    await transport.verify();
    console.log('[Email] Configuration test successful');
    return true;
  } catch (error) {
    console.error('[Email] Configuration test failed:', error);
    return false;
  }
}
