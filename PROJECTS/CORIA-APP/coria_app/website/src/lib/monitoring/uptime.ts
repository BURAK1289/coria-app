// Uptime monitoring utilities and health check endpoints

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database?: boolean;
    cms?: boolean;
    external_apis?: boolean;
    cache?: boolean;
  };
  response_time: number;
  version: string;
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const checks: HealthCheckResult['checks'] = {};
  
  try {
    // Check CMS connectivity
    if (process.env.CONTENTFUL_SPACE_ID) {
      checks.cms = await checkContentfulHealth();
    }
    
    // Check external APIs
    checks.external_apis = await checkExternalAPIs();
    
    // Check cache (if using Redis or similar)
    checks.cache = true; // Placeholder for cache check
    
    const responseTime = Date.now() - startTime;
    const allChecksPass = Object.values(checks).every(check => check === true);
    
    return {
      status: allChecksPass ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
      response_time: responseTime,
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      response_time: Date.now() - startTime,
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    };
  }
}

async function checkContentfulHealth(): Promise<boolean> {
  try {
    const response = await fetch(
      `https://cdn.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
        },
        // Short timeout for health checks
        signal: AbortSignal.timeout(5000),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function checkExternalAPIs(): Promise<boolean> {
  try {
    // Check if we can reach Google Analytics (if configured)
    if (process.env.NEXT_PUBLIC_GA_ID) {
      const response = await fetch('https://www.google-analytics.com/analytics.js', {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    }
    return true;
  } catch {
    return false;
  }
}

// Monitoring configuration for external services
export const MONITORING_CONFIG = {
  // Endpoints to monitor
  endpoints: [
    {
      name: 'Homepage',
      url: '/',
      method: 'GET',
      expected_status: 200,
      timeout: 10000,
    },
    {
      name: 'Features Page',
      url: '/tr/features',
      method: 'GET',
      expected_status: 200,
      timeout: 10000,
    },
    {
      name: 'API Health',
      url: '/api/health',
      method: 'GET',
      expected_status: 200,
      timeout: 5000,
    },
    {
      name: 'Sitemap',
      url: '/sitemap.xml',
      method: 'GET',
      expected_status: 200,
      timeout: 5000,
    },
  ],
  
  // Alert thresholds
  thresholds: {
    response_time_warning: 2000, // 2 seconds
    response_time_critical: 5000, // 5 seconds
    uptime_warning: 99.5, // 99.5%
    uptime_critical: 99.0, // 99.0%
  },
  
  // Notification settings
  notifications: {
    email: process.env.ALERT_EMAIL,
    slack_webhook: process.env.SLACK_WEBHOOK_URL,
    discord_webhook: process.env.DISCORD_WEBHOOK_URL,
  },
};

// Utility function to send alerts
export async function sendAlert(
  type: 'warning' | 'critical' | 'recovery',
  message: string,
  details?: Record<string, any>
) {
  const alertData = {
    type,
    message,
    details,
    timestamp: new Date().toISOString(),
    site: process.env.NEXT_PUBLIC_SITE_URL,
    environment: process.env.NODE_ENV,
  };
  
  // Send to Slack if configured
  if (MONITORING_CONFIG.notifications.slack_webhook) {
    try {
      await fetch(MONITORING_CONFIG.notifications.slack_webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 CORIA Website Alert: ${message}`,
          attachments: [
            {
              color: type === 'critical' ? 'danger' : type === 'warning' ? 'warning' : 'good',
              fields: [
                { title: 'Type', value: type, short: true },
                { title: 'Environment', value: process.env.NODE_ENV, short: true },
                { title: 'Site', value: process.env.NEXT_PUBLIC_SITE_URL, short: false },
                ...(details ? Object.entries(details).map(([key, value]) => ({
                  title: key,
                  value: String(value),
                  short: true,
                })) : []),
              ],
              ts: Math.floor(Date.now() / 1000),
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
  
  // Log alert for debugging
  console.log(`[ALERT] ${type.toUpperCase()}: ${message}`, details);
}