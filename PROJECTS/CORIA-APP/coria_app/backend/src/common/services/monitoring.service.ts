import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StructuredLoggerService } from './structured-logger.service';
import { TokenBucketRateLimiterService } from './token-bucket-rate-limiter.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { SupabaseService } from './supabase.service';

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    heapUsed: number;
    heapTotal: number;
  };
  process: {
    uptime: number;
    pid: number;
    version: string;
  };
}

export interface ServiceMetrics {
  rateLimiter: {
    totalBuckets: number;
    blockedBuckets: number;
    topUtilized: Array<{
      bucket: string;
      utilization: number;
    }>;
  };
  circuitBreaker: {
    circuits: Record<string, {
      state: string;
      failureRate: number;
      totalCalls: number;
      lastFailure?: number;
    }>;
  };
  database: {
    activeConnections: number;
    queryCount: number;
    averageQueryTime: number;
    slowQueries: number;
  };
  solana: {
    rpcCalls: number;
    failedCalls: number;
    averageResponseTime: number;
    blockHeight?: number;
  };
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details?: Record<string, any>;
  lastCheck: Date;
}

export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'performance' | 'error' | 'security' | 'business';
  title: string;
  description: string;
  timestamp: Date;
  context: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
}

@Injectable()
export class MonitoringService implements OnModuleInit {
  private metricsInterval: NodeJS.Timeout;
  private healthCheckInterval: NodeJS.Timeout;
  private alerts = new Map<string, Alert>();
  private metrics: {
    system: SystemMetrics[];
    service: ServiceMetrics[];
  } = { system: [], service: [] };

  private performanceCounters = {
    apiCalls: 0,
    dbQueries: 0,
    solanaRpcCalls: 0,
    errors: 0,
    slowOperations: 0,
  };

  private thresholds = {
    cpu: 80, // percentage
    memory: 85, // percentage
    responseTime: 1000, // milliseconds
    errorRate: 5, // percentage per minute
    circuitBreakerFailures: 3,
    rateLimitUtilization: 90, // percentage
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: StructuredLoggerService,
    private readonly rateLimiter: TokenBucketRateLimiterService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly supabase: SupabaseService,
  ) {}

  async onModuleInit() {
    this.startMetricsCollection();
    this.startHealthChecks();
    this.logger.logWithMetadata('info', 'Monitoring service initialized', {
      metricsInterval: 30000, // 30 seconds
      healthCheckInterval: 60000, // 1 minute
      alertThresholds: this.thresholds,
    }, 'MonitoringService');
  }

  onModuleDestroy() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  /**
   * Start collecting system and service metrics
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(async () => {
      try {
        const systemMetrics = await this.collectSystemMetrics();
        const serviceMetrics = await this.collectServiceMetrics();

        // Store metrics (keep last 100 entries)
        this.metrics.system.push(systemMetrics);
        this.metrics.service.push(serviceMetrics);

        if (this.metrics.system.length > 100) {
          this.metrics.system = this.metrics.system.slice(-100);
        }
        if (this.metrics.service.length > 100) {
          this.metrics.service = this.metrics.service.slice(-100);
        }

        // Check for alerts
        await this.checkAlerts(systemMetrics, serviceMetrics);

        // Persist critical metrics to database
        await this.persistMetrics(systemMetrics, serviceMetrics);

      } catch (error) {
        this.logger.error('Error collecting metrics', error, 'MonitoringService');
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Start health checks for critical services
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const healthChecks = await this.performHealthChecks();

        // Log health status
        const unhealthyServices = healthChecks.filter(hc => hc.status === 'unhealthy');
        if (unhealthyServices.length > 0) {
          this.logger.logSecurity('service_health_critical', {
            severity: 'high',
            category: 'service_role',
            details: {
              unhealthyServices: unhealthyServices.map(s => s.service),
              totalServices: healthChecks.length,
            }
          });
        }

        // Create alerts for unhealthy services
        for (const healthCheck of unhealthyServices) {
          await this.createAlert({
            severity: 'high',
            type: 'performance',
            title: `Service Health Critical: ${healthCheck.service}`,
            description: `Service ${healthCheck.service} is unhealthy with response time ${healthCheck.responseTime}ms`,
            context: healthCheck.details || {},
          });
        }

      } catch (error) {
        this.logger.error('Error performing health checks', error, 'MonitoringService');
      }
    }, 60000); // Every minute
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      timestamp: new Date(),
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
        loadAverage: [], // Not available in Node.js by default
      },
      memory: {
        used: memUsage.rss,
        total: 0, // Would need additional library for system total
        percentage: 0,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
      },
      process: {
        uptime: process.uptime(),
        pid: process.pid,
        version: process.version,
      },
    };
  }

  /**
   * Collect service-specific metrics
   */
  private async collectServiceMetrics(): Promise<ServiceMetrics> {
    // Rate limiter metrics
    const rateLimiterStats = await this.rateLimiter.getRateLimitStats();
    const topUtilized = rateLimiterStats.bucketDetails
      .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
      .slice(0, 5)
      .map(bucket => ({
        bucket: bucket.key,
        utilization: bucket.utilizationPercent,
      }));

    // Circuit breaker metrics
    const circuitStats = this.circuitBreaker.getCircuitStats();
    const circuitMetrics: Record<string, any> = {};

    Object.entries(circuitStats).forEach(([key, metrics]) => {
      const failureRate = metrics.totalCalls > 0
        ? (metrics.failureCount / metrics.totalCalls) * 100
        : 0;

      circuitMetrics[key] = {
        state: metrics.state,
        failureRate,
        totalCalls: metrics.totalCalls,
        lastFailure: metrics.lastFailureTime,
      };
    });

    return {
      rateLimiter: {
        totalBuckets: rateLimiterStats.totalBuckets,
        blockedBuckets: rateLimiterStats.blockedBuckets,
        topUtilized,
      },
      circuitBreaker: {
        circuits: circuitMetrics,
      },
      database: {
        activeConnections: 0, // Would need pool metrics
        queryCount: this.performanceCounters.dbQueries,
        averageQueryTime: 0, // Would need to track query times
        slowQueries: 0,
      },
      solana: {
        rpcCalls: this.performanceCounters.solanaRpcCalls,
        failedCalls: 0, // Would need to track from circuit breaker
        averageResponseTime: 0,
      },
    };
  }

  /**
   * Perform health checks on critical services
   */
  private async performHealthChecks(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    // Database health check
    const dbCheck = await this.checkDatabaseHealth();
    checks.push(dbCheck);

    // Solana RPC health check
    const solanaCheck = await this.checkSolanaHealth();
    checks.push(solanaCheck);

    // Rate limiter health check
    const rateLimiterCheck = await this.checkRateLimiterHealth();
    checks.push(rateLimiterCheck);

    return checks;
  }

  /**
   * Check database connectivity and performance
   */
  private async checkDatabaseHealth(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Simple health check query
      const { data, error } = await this.supabase.getServiceClient()
        .from('users')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          service: 'database',
          status: 'unhealthy',
          responseTime,
          details: { error: error.message },
          lastCheck: new Date(),
        };
      }

      const status = responseTime > this.thresholds.responseTime ? 'degraded' : 'healthy';

      return {
        service: 'database',
        status,
        responseTime,
        details: { queryResult: 'success' },
        lastCheck: new Date(),
      };

    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: { error: error.message },
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Check Solana RPC connectivity
   */
  private async checkSolanaHealth(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // This would need access to SolanaService
      // For now, return a mock health check
      const responseTime = Date.now() - startTime;

      return {
        service: 'solana_rpc',
        status: 'healthy',
        responseTime,
        details: { endpoint: 'mainnet-beta' },
        lastCheck: new Date(),
      };

    } catch (error) {
      return {
        service: 'solana_rpc',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: { error: error.message },
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Check rate limiter health
   */
  private async checkRateLimiterHealth(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      const stats = await this.rateLimiter.getRateLimitStats();
      const responseTime = Date.now() - startTime;

      const utilizationRate = stats.totalBuckets > 0
        ? (stats.blockedBuckets / stats.totalBuckets) * 100
        : 0;

      const status = utilizationRate > this.thresholds.rateLimitUtilization
        ? 'degraded'
        : 'healthy';

      return {
        service: 'rate_limiter',
        status,
        responseTime,
        details: {
          totalBuckets: stats.totalBuckets,
          blockedBuckets: stats.blockedBuckets,
          utilizationRate,
        },
        lastCheck: new Date(),
      };

    } catch (error) {
      return {
        service: 'rate_limiter',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: { error: error.message },
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Check for alert conditions
   */
  private async checkAlerts(systemMetrics: SystemMetrics, serviceMetrics: ServiceMetrics): Promise<void> {
    // High memory usage alert
    if (systemMetrics.memory.heapUsed / systemMetrics.memory.heapTotal > this.thresholds.memory / 100) {
      await this.createAlert({
        severity: 'high',
        type: 'performance',
        title: 'High Memory Usage',
        description: `Memory usage is ${Math.round((systemMetrics.memory.heapUsed / systemMetrics.memory.heapTotal) * 100)}%`,
        context: { memoryMetrics: systemMetrics.memory },
      });
    }

    // Circuit breaker alerts
    Object.entries(serviceMetrics.circuitBreaker.circuits).forEach(async ([circuit, metrics]) => {
      if (metrics.state === 'open') {
        await this.createAlert({
          severity: 'critical',
          type: 'error',
          title: `Circuit Breaker Open: ${circuit}`,
          description: `Circuit breaker for ${circuit} is open with ${metrics.failureRate}% failure rate`,
          context: { circuitMetrics: metrics },
        });
      }
    });

    // Rate limiter alerts
    serviceMetrics.rateLimiter.topUtilized.forEach(async (bucket) => {
      if (bucket.utilization > this.thresholds.rateLimitUtilization) {
        await this.createAlert({
          severity: 'medium',
          type: 'performance',
          title: `High Rate Limit Utilization: ${bucket.bucket}`,
          description: `Rate limit bucket ${bucket.bucket} is ${bucket.utilization}% utilized`,
          context: { bucketMetrics: bucket },
        });
      }
    });
  }

  /**
   * Create and manage alerts
   */
  private async createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Promise<string> {
    const alertId = `${alertData.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const alert: Alert = {
      id: alertId,
      timestamp: new Date(),
      resolved: false,
      ...alertData,
    };

    this.alerts.set(alertId, alert);

    // Log the alert
    this.logger.logSecurity('monitoring_alert', {
      severity: alertData.severity === 'critical' ? 'critical' : 'high',
      category: 'service_role',
      details: {
        alertId,
        alertType: alertData.type,
        title: alertData.title,
        description: alertData.description,
        context: alertData.context,
      }
    });

    // Persist critical alerts to database
    if (alertData.severity === 'critical' || alertData.severity === 'high') {
      await this.persistAlert(alert);
    }

    return alertId;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();

    this.logger.logWithMetadata('info', 'Alert resolved', {
      alertId,
      title: alert.title,
      duration: alert.resolvedAt.getTime() - alert.timestamp.getTime(),
    }, 'MonitoringService');

    return true;
  }

  /**
   * Get current alerts
   */
  getAlerts(resolved = false): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.resolved === resolved);
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(limit = 10): SystemMetrics[] {
    return this.metrics.system.slice(-limit);
  }

  /**
   * Get service metrics
   */
  getServiceMetrics(limit = 10): ServiceMetrics[] {
    return this.metrics.service.slice(-limit);
  }

  /**
   * Record performance counter
   */
  recordPerformanceCounter(type: keyof typeof this.performanceCounters): void {
    this.performanceCounters[type]++;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): Record<string, number> {
    return { ...this.performanceCounters };
  }

  /**
   * Persist metrics to database for long-term storage
   */
  private async persistMetrics(systemMetrics: SystemMetrics, serviceMetrics: ServiceMetrics): Promise<void> {
    try {
      // Only persist every 5 minutes to reduce database load
      const now = new Date();
      if (now.getMinutes() % 5 !== 0) {
        return;
      }

      const { error } = await this.supabase.getServiceClient()
        .from('system_metrics')
        .insert({
          timestamp: systemMetrics.timestamp.toISOString(),
          cpu_usage: systemMetrics.cpu.usage,
          memory_used: systemMetrics.memory.heapUsed,
          memory_total: systemMetrics.memory.heapTotal,
          process_uptime: systemMetrics.process.uptime,
          rate_limiter_buckets: serviceMetrics.rateLimiter.totalBuckets,
          rate_limiter_blocked: serviceMetrics.rateLimiter.blockedBuckets,
          circuit_breaker_states: JSON.stringify(serviceMetrics.circuitBreaker.circuits),
        });

      if (error) {
        this.logger.error('Failed to persist metrics', error, 'MonitoringService');
      }

    } catch (error) {
      this.logger.error('Error persisting metrics', error, 'MonitoringService');
    }
  }

  /**
   * Persist alert to database
   */
  private async persistAlert(alert: Alert): Promise<void> {
    try {
      const { error } = await this.supabase.getServiceClient()
        .from('monitoring_alerts')
        .insert({
          alert_id: alert.id,
          severity: alert.severity,
          type: alert.type,
          title: alert.title,
          description: alert.description,
          context: JSON.stringify(alert.context),
          timestamp: alert.timestamp.toISOString(),
          resolved: alert.resolved,
          resolved_at: alert.resolvedAt?.toISOString(),
        });

      if (error) {
        this.logger.error('Failed to persist alert', error, 'MonitoringService');
      }

    } catch (error) {
      this.logger.error('Error persisting alert', error, 'MonitoringService');
    }
  }

  /**
   * Get monitoring dashboard data
   */
  async getDashboardData(): Promise<{
    health: HealthCheck[];
    metrics: {
      system: SystemMetrics;
      service: ServiceMetrics;
    };
    alerts: Alert[];
    performance: Record<string, number>;
  }> {
    const healthChecks = await this.performHealthChecks();
    const latestSystemMetrics = this.metrics.system[this.metrics.system.length - 1];
    const latestServiceMetrics = this.metrics.service[this.metrics.service.length - 1];
    const activeAlerts = this.getAlerts(false);

    return {
      health: healthChecks,
      metrics: {
        system: latestSystemMetrics,
        service: latestServiceMetrics,
      },
      alerts: activeAlerts,
      performance: this.getPerformanceSummary(),
    };
  }
}