import { NextResponse } from 'next/server';
import { performHealthCheck } from '@/lib/monitoring/uptime';

export async function GET() {
  try {
    const healthCheck = await performHealthCheck();
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthCheck, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}