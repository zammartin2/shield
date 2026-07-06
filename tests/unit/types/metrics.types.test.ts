import {
  Metrics,
  RequestMetrics,
  RequestMetricsSummary,
  SecurityMetrics,
  ThreatMetrics,
  PerformanceMetrics,
  MemoryUsage,
  AIMetrics,
  BusinessMetrics,
  SystemMetrics,
  PluginMetrics,
  RateLimitMetrics,
  RealTimeMetrics,
  AggregatedMetrics,
  Trend,
  MetricsHistory,
  MetricsHistoryOptions,
  MetricsReport,
  ReportSummary,
  ReportTrends,
  ReportThreats,
  ReportPerformance,
  Chart,
  ChartOptions,
  Alert,
  AlertAction,
  Dashboard,
  DashboardChart,
  MetricsExporter,
  MetricsCollector,
  MetricsProvider,
  MetricsStream,
  MetricsStreamOptions,
  PrometheusMetrics,
  JSONMetrics,
  CSVMetrics,
  METRIC_TYPES,
  METRIC_AGGREGATIONS,
  METRIC_INTERVALS
} from '../../../src/types/metrics.types'

describe('Metrics Types', () => {
  describe('METRIC_TYPES constants', () => {
    it('should have all expected metric types', () => {
      expect(METRIC_TYPES).toEqual({
        REQUEST: 'request',
        THREAT: 'threat',
        PERFORMANCE: 'performance',
        AI: 'ai',
        BUSINESS: 'business',
        SYSTEM: 'system',
        PLUGIN: 'plugin',
        RATE_LIMIT: 'rate_limit'
      })
    })

    it('should have correct values', () => {
      expect(METRIC_TYPES.REQUEST).toBe('request')
      expect(METRIC_TYPES.THREAT).toBe('threat')
      expect(METRIC_TYPES.PERFORMANCE).toBe('performance')
      expect(METRIC_TYPES.AI).toBe('ai')
      expect(METRIC_TYPES.BUSINESS).toBe('business')
      expect(METRIC_TYPES.SYSTEM).toBe('system')
      expect(METRIC_TYPES.PLUGIN).toBe('plugin')
      expect(METRIC_TYPES.RATE_LIMIT).toBe('rate_limit')
    })
  })

  describe('METRIC_AGGREGATIONS constants', () => {
    it('should have all expected aggregations', () => {
      expect(METRIC_AGGREGATIONS).toEqual({
        SUM: 'sum',
        AVG: 'avg',
        MIN: 'min',
        MAX: 'max',
        COUNT: 'count',
        LAST: 'last',
        FIRST: 'first'
      })
    })

    it('should have correct values', () => {
      expect(METRIC_AGGREGATIONS.SUM).toBe('sum')
      expect(METRIC_AGGREGATIONS.AVG).toBe('avg')
      expect(METRIC_AGGREGATIONS.MIN).toBe('min')
      expect(METRIC_AGGREGATIONS.MAX).toBe('max')
      expect(METRIC_AGGREGATIONS.COUNT).toBe('count')
      expect(METRIC_AGGREGATIONS.LAST).toBe('last')
      expect(METRIC_AGGREGATIONS.FIRST).toBe('first')
    })
  })

  describe('METRIC_INTERVALS constants', () => {
    it('should have all expected intervals', () => {
      expect(METRIC_INTERVALS).toEqual({
        SECOND: 1000,
        MINUTE: 60000,
        HOUR: 3600000,
        DAY: 86400000,
        WEEK: 604800000,
        MONTH: 2592000000
      })
    })

    it('should have correct values', () => {
      expect(METRIC_INTERVALS.SECOND).toBe(1000)
      expect(METRIC_INTERVALS.MINUTE).toBe(60000)
      expect(METRIC_INTERVALS.HOUR).toBe(3600000)
      expect(METRIC_INTERVALS.DAY).toBe(86400000)
      expect(METRIC_INTERVALS.WEEK).toBe(604800000)
      expect(METRIC_INTERVALS.MONTH).toBe(2592000000)
    })

    it('should have correct relationships', () => {
      expect(METRIC_INTERVALS.MINUTE).toBe(METRIC_INTERVALS.SECOND * 60)
      expect(METRIC_INTERVALS.HOUR).toBe(METRIC_INTERVALS.MINUTE * 60)
      expect(METRIC_INTERVALS.DAY).toBe(METRIC_INTERVALS.HOUR * 24)
      expect(METRIC_INTERVALS.WEEK).toBe(METRIC_INTERVALS.DAY * 7)
    })
  })

  describe('Metrics interface', () => {
    it('should have all required properties', () => {
      const metrics: Metrics = {
        totalRequests: 0,
        requestsPerSecond: 0,
        byMethod: {},
        byStatus: {},
        byPath: {},
        byIP: {},
        threatsDetected: 0,
        threatsBlocked: 0,
        byType: {},
        bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
        bySource: {},
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        memoryUsage: {
          heapUsed: 0,
          heapTotal: 0,
          external: 0,
          rss: 0,
          arrayBuffers: 0
        },
        cpuUsage: 0,
        aiAnalyses: 0,
        aiAccuracy: 0,
        aiFalsePositives: 0,
        aiFalseNegatives: 0,
        blockedByRateLimit: 0,
        activeRateLimits: 0,
        uptime: 0,
        activeConnections: 0,
        version: '1.0.0',
        environment: 'test',
        timestamp: new Date()
      }

      expect(metrics).toBeDefined()
      expect(metrics.totalRequests).toBe(0)
      expect(metrics.bySeverity).toEqual({ low: 0, medium: 0, high: 0, critical: 0 })
      expect(metrics.version).toBe('1.0.0')
    })
  })

  describe('RequestMetrics interface', () => {
    it('should have all required properties', () => {
      const requestMetrics: RequestMetrics = {
        method: 'GET',
        path: '/test',
        status: 200,
        duration: 100,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: new Date(),
        requestId: 'test-123',
        userId: 'user-123',
        size: 1024
      }

      expect(requestMetrics).toBeDefined()
      expect(requestMetrics.method).toBe('GET')
      expect(requestMetrics.status).toBe(200)
      expect(requestMetrics.duration).toBe(100)
    })

    it('should allow optional properties', () => {
      const requestMetrics: RequestMetrics = {
        method: 'POST',
        path: '/api',
        status: 201,
        duration: 50,
        ip: '192.168.1.1',
        userAgent: 'test',
        timestamp: new Date()
      }

      expect(requestMetrics.requestId).toBeUndefined()
      expect(requestMetrics.userId).toBeUndefined()
      expect(requestMetrics.size).toBeUndefined()
    })
  })

  describe('SecurityMetrics interface', () => {
    it('should have all required properties', () => {
      const securityMetrics: SecurityMetrics = {
        threatsDetected: 10,
        threatsBlocked: 8,
        byType: {
          xss: 5,
          sql_injection: 3,
          path_traversal: 2,
          csrf: 0,
          rce: 0,
          lfi: 0,
          rfi: 0,
          command_injection: 0,
          code_injection: 0,
          nosql_injection: 0,
          ldap_injection: 0,
          xxe: 0,
          ssrf: 0,
          open_redirect: 0,
          insecure_deserialization: 0,
          file_upload: 0,
          auth_bypass: 0,
          privilege_escalation: 0,
          sensitive_data_exposure: 0,
          security_misconfiguration: 0,
          other: 0
        },
        bySeverity: { low: 2, medium: 4, high: 3, critical: 1 },
        bySource: { '192.168.1.1': 5, '10.0.0.1': 3 },
        anomaliesDetected: 2,
        falsePositives: 1,
        falseNegatives: 0,
        detectionRate: 0.95,
        timestamp: new Date()
      }

      expect(securityMetrics).toBeDefined()
      expect(securityMetrics.threatsDetected).toBe(10)
      expect(securityMetrics.detectionRate).toBe(0.95)
    })
  })

  describe('PerformanceMetrics interface', () => {
    it('should have all required properties', () => {
      const performanceMetrics: PerformanceMetrics = {
        system: {
          cpu: {
            usage: 50,
            cores: 4,
            loadAvg: [1.5, 1.2, 1.0]
          },
          memory: {
            total: 16000000000,
            used: 8000000000,
            free: 8000000000,
            heapUsed: 4000000000,
            heapTotal: 8000000000,
            external: 1000000,
            rss: 9000000000,
            arrayBuffers: 100000
          },
          uptime: 3600,
          activeConnections: 100
        },
        responseTime: {
          avg: 100,
          p50: 80,
          p95: 200,
          p99: 300,
          p999: 500,
          max: 500,
          min: 10
        },
        throughput: {
          requestsPerSecond: 50,
          requestsPerMinute: 3000,
          requestsPerHour: 180000,
          dataPerSecond: 1024000,
          dataPerMinute: 61440000
        },
        errors: {
          total: 10,
          byType: { '500': 5, '404': 3 },
          byPath: { '/test': 5, '/api': 3 },
          errorRate: 0.02
        },
        timestamp: new Date()
      }

      expect(performanceMetrics).toBeDefined()
      expect(performanceMetrics.system.cpu.usage).toBe(50)
      expect(performanceMetrics.responseTime.p95).toBe(200)
    })
  })

  describe('MemoryUsage interface', () => {
    it('should have all required properties', () => {
      const memoryUsage: MemoryUsage = {
        heapUsed: 4000000,
        heapTotal: 8000000,
        external: 100000,
        rss: 9000000,
        arrayBuffers: 10000
      }

      expect(memoryUsage).toBeDefined()
      expect(memoryUsage.heapUsed).toBe(4000000)
      expect(memoryUsage.rss).toBe(9000000)
    })
  })

  describe('AIMetrics interface', () => {
    it('should have all required properties', () => {
      const aiMetrics: AIMetrics = {
        analysis: {
          total: 100,
          byModel: { 'gpt-4': 60, 'claude': 40 },
          averageTime: 150,
          maxTime: 300,
          minTime: 50
        },
        accuracy: {
          overall: 0.95,
          byType: { xss: 0.98, sql: 0.93 },
          falsePositiveRate: 0.02,
          falseNegativeRate: 0.03,
          confusionMatrix: {
            truePositive: 90,
            trueNegative: 5,
            falsePositive: 2,
            falseNegative: 3
          }
        },
        training: {
          lastTraining: new Date(),
          nextTraining: new Date(Date.now() + 86400000),
          status: 'completed',
          epoch: 10,
          loss: 0.01,
          accuracy: 0.99,
          samples: 1000,
          duration: 3600
        },
        models: {
          active: ['model-v1', 'model-v2'],
          versions: { 'model-v1': '1.0.0', 'model-v2': '2.0.0' },
          performance: {
            'model-v1': {
              accuracy: 0.95,
              speed: 100,
              memory: 500
            }
          }
        },
        timestamp: new Date()
      }

      expect(aiMetrics).toBeDefined()
      expect(aiMetrics.accuracy.overall).toBe(0.95)
      expect(aiMetrics.models.active).toContain('model-v1')
    })
  })

  describe('BusinessMetrics interface', () => {
    it('should have all required properties', () => {
      const businessMetrics: BusinessMetrics = {
        users: {
          total: 1000,
          active: 500,
          new: 50,
          returning: 450,
          byRole: { admin: 10, user: 990 }
        },
        sessions: {
          total: 2000,
          active: 100,
          averageDuration: 600,
          bySource: { web: 1500, mobile: 500 }
        },
        operations: {
          total: 5000,
          successful: 4900,
          failed: 100,
          byType: { create: 1000, update: 2000, delete: 500 },
          conversionRate: 0.85
        },
        transactions: {
          total: 1000,
          successful: 950,
          failed: 50,
          averageValue: 100,
          totalValue: 100000
        },
        timestamp: new Date()
      }

      expect(businessMetrics).toBeDefined()
      expect(businessMetrics.users.total).toBe(1000)
      // ✅ ИСПРАВЛЕНО: conversionRate находится в operations
      expect(businessMetrics.operations.conversionRate).toBe(0.85)
    })
  })

  describe('SystemMetrics interface', () => {
    it('should have all required properties', () => {
      const systemMetrics: SystemMetrics = {
        server: {
          hostname: 'localhost',
          platform: 'linux',
          arch: 'x64',
          nodeVersion: 'v18.0.0',
          uptime: 3600,
          pid: 1234
        },
        process: {
          memory: {
            heapUsed: 4000000,
            heapTotal: 8000000,
            external: 100000,
            rss: 9000000,
            arrayBuffers: 10000
          },
          cpu: {
            user: 30,
            system: 20,
            total: 50
          },
          handles: 100,
          requests: 1000
        },
        events: {
          total: 500,
          byType: { request: 400, error: 50, warning: 50 },
          errors: 50,
          warnings: 50
        },
        timestamp: new Date()
      }

      expect(systemMetrics).toBeDefined()
      expect(systemMetrics.server.hostname).toBe('localhost')
      expect(systemMetrics.process.cpu.total).toBe(50)
    })
  })

  describe('PluginMetrics interface', () => {
    it('should have all required properties', () => {
      const pluginMetrics: PluginMetrics = {
        total: 5,
        active: 3,
        disabled: 2,
        errors: 0,
        plugins: {
          'plugin-1': {
            enabled: true,
            errors: 0,
            lastRun: new Date(),
            executionTime: 50,
            memoryUsage: 1000
          }
        },
        performance: {
          avgExecutionTime: 50,
          totalExecutionTime: 250,
          slowestPlugin: 'plugin-3',
          fastestPlugin: 'plugin-1'
        },
        timestamp: new Date()
      }

      expect(pluginMetrics).toBeDefined()
      expect(pluginMetrics.total).toBe(5)
      expect(pluginMetrics.active).toBe(3)
    })
  })

  describe('RateLimitMetrics interface', () => {
    it('should have all required properties', () => {
      const rateLimitMetrics: RateLimitMetrics = {
        totalRequests: 1000,
        allowedRequests: 950,
        blockedRequests: 50,
        byKey: {
          '192.168.1.1': {
            requests: 100,
            blocked: 10,
            limit: 100,
            windowMs: 60000
          }
        },
        topBlocked: [
          { key: '192.168.1.1', count: 10, reason: 'Rate limit exceeded' }
        ],
        activeLimits: 100,
        timestamp: new Date()
      }

      expect(rateLimitMetrics).toBeDefined()
      expect(rateLimitMetrics.totalRequests).toBe(1000)
      expect(rateLimitMetrics.blockedRequests).toBe(50)
    })
  })

  describe('RealTimeMetrics interface', () => {
    it('should have all required properties', () => {
      const realTimeMetrics: RealTimeMetrics = {
        timestamp: new Date(),
        requests: {
          total: 100,
          perSecond: 10,
          byStatus: { '200': 80, '404': 10, '500': 10 }
        },
        threats: {
          detected: 5,
          blocked: 4,
          byType: { xss: 3, sql: 2 }
        },
        performance: {
          responseTime: 100,
          memory: 4000000,
          cpu: 50
        },
        connections: {
          active: 50,
          total: 1000
        }
      }

      expect(realTimeMetrics).toBeDefined()
      expect(realTimeMetrics.requests.perSecond).toBe(10)
      expect(realTimeMetrics.performance.cpu).toBe(50)
    })
  })

  describe('AggregatedMetrics interface', () => {
    it('should have all required properties', () => {
      const aggregatedMetrics: AggregatedMetrics = {
        period: {
          from: new Date(Date.now() - 3600000),
          to: new Date(),
          duration: 3600,
          label: 'Last hour'
        },
        summary: {
          totalRequests: 1000,
          averageRequestsPerSecond: 10,
          totalThreats: 50,
          blockedPercent: 0.9,
          averageResponseTime: 100,
          p95ResponseTime: 200,
          p99ResponseTime: 300,
          errorRate: 0.02,
          uptime: 0.999
        },
        trends: {
          requests: {
            direction: 'up',
            change: 10,
            description: 'Increasing',
            data: [{ timestamp: new Date(), value: 100 }]
          },
          threats: {
            direction: 'down',
            change: -5,
            description: 'Decreasing',
            data: [{ timestamp: new Date(), value: 5 }]
          },
          performance: {
            direction: 'stable',
            change: 0,
            description: 'Stable',
            data: [{ timestamp: new Date(), value: 100 }]
          },
          errors: {
            direction: 'down',
            change: -2,
            description: 'Improving',
            data: [{ timestamp: new Date(), value: 2 }]
          }
        },
        distribution: {
          byMethod: { GET: 600, POST: 300 },
          byStatus: { '200': 800, '404': 100 },
          byType: { xss: 30, sql: 20 },
          bySeverity: { low: 10, medium: 20, high: 15, critical: 5 }
        },
        timestamp: new Date()
      }

      expect(aggregatedMetrics).toBeDefined()
      expect(aggregatedMetrics.summary.totalRequests).toBe(1000)
      expect(aggregatedMetrics.trends.requests.direction).toBe('up')
    })
  })

  describe('MetricsReport interface', () => {
    it('should have all required properties', () => {
      const report: MetricsReport = {
        id: 'report-123',
        type: 'summary',
        period: {
          from: new Date(Date.now() - 86400000),
          to: new Date()
        },
        generatedAt: new Date(),
        format: 'json',
        summary: {
          totalRequests: 1000,
          totalThreats: 50,
          blockedPercent: 0.9,
          riskLevel: 'medium',
          incidents: 5,
          uptime: 0.999,
          responseTime: 100,
          errorRate: 0.02
        },
        trends: {
          requests: {
            direction: 'up',
            change: 10,
            description: 'Increasing',
            data: [{ timestamp: new Date(), value: 100 }]
          },
          threats: {
            direction: 'down',
            change: -5,
            description: 'Decreasing',
            data: [{ timestamp: new Date(), value: 5 }]
          },
          performance: {
            direction: 'stable',
            change: 0,
            description: 'Stable',
            data: [{ timestamp: new Date(), value: 100 }]
          },
          incidents: {
            direction: 'down',
            change: -2,
            description: 'Improving',
            data: [{ timestamp: new Date(), value: 2 }]
          },
          predictions: []
        },
        threats: {
          total: 50,
          byType: { xss: 30, sql: 20 },
          bySeverity: { low: 10, medium: 20, high: 15, critical: 5 },
          bySource: { '192.168.1.1': 30 },
          topAttacks: [],
          timeline: []
        },
        performance: {
          avgResponseTime: 100,
          p95ResponseTime: 200,
          p99ResponseTime: 300,
          requestsPerSecond: 10,
          errorRate: 0.02,
          memoryUsage: {
            heapUsed: 4000000,
            heapTotal: 8000000,
            external: 100000,
            rss: 9000000,
            arrayBuffers: 10000
          },
          cpuUsage: 50,
          uptime: 0.999
        },
        recommendations: [
          'Increase rate limiting',
          'Update security policies'
        ],
        data: {},
        content: {},
        charts: []
      }

      expect(report).toBeDefined()
      expect(report.id).toBe('report-123')
      // ✅ ИСПРАВЛЕНО: riskLevel находится в summary
      expect(report.summary.riskLevel).toBe('medium')
    })
  })

  describe('Alert interface', () => {
    it('should have all required properties', () => {
      const alert: Alert = {
        id: 'alert-123',
        name: 'High threat detected',
        metric: 'threats_detected',
        condition: '>',
        threshold: 10,
        currentValue: 15,
        severity: 'critical',
        timestamp: new Date(),
        status: 'active',
        message: 'High number of threats detected',
        actions: [
          {
            type: 'email',
            config: { to: 'admin@example.com' },
            status: 'pending'
          }
        ]
      }

      expect(alert).toBeDefined()
      expect(alert.id).toBe('alert-123')
      expect(alert.severity).toBe('critical')
    })
  })

  describe('Dashboard interface', () => {
    it('should have all required properties', () => {
      const dashboard: Dashboard = {
        id: 'dashboard-123',
        title: 'Main Dashboard',
        refreshInterval: 5000,
        charts: [
          {
            id: 'chart-1',
            type: 'line',
            title: 'Requests over time',
            metric: 'totalRequests',
            query: { period: '1h' },
            options: {
              xAxis: 'time',
              yAxis: 'requests'
            },
            position: {
              x: 0,
              y: 0,
              width: 6,
              height: 4
            }
          }
        ],
        layout: 'grid',
        theme: 'dark',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(dashboard).toBeDefined()
      expect(dashboard.id).toBe('dashboard-123')
      expect(dashboard.charts.length).toBe(1)
    })
  })
})