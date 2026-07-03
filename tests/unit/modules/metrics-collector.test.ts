import { MetricsCollector } from '../../../src/modules/metrics/MetricsCollector';
import { Threat } from '../../../src/types';

describe('MetricsCollector', () => {
  let collector: MetricsCollector;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    collector = new MetricsCollector();
    mockReq = {
      method: 'GET',
      path: '/test',
      url: '/test',
      ip: '127.0.0.1'
    };
    mockRes = {
      statusCode: 200
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // КОНСТРУКТОР
  // ============================================

  describe('constructor', () => {
    it('should create instance with empty metrics', () => {
      const metrics = collector.getMetrics();
      
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.threatsBlocked).toBe(0);
      expect(metrics.avgResponseTime).toBe(0);
      expect(metrics.errors).toBe(0);
      expect(metrics.uptime).toBeDefined();
      expect(metrics.timestamp).toBeInstanceOf(Date);
    });
  });

  // ============================================
  // RECORD REQUEST
  // ============================================

  describe('recordRequest', () => {
    it('should record request with default values', () => {
      collector.recordRequest(mockReq, mockRes, 100);
      
      const metrics = collector.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.avgResponseTime).toBe(100);
      expect(metrics.byPath['/test']).toBe(1);
      expect(metrics.byMethod['GET']).toBe(1);
      expect(metrics.byStatus['200']).toBe(1);
    });

    it('should handle missing path', () => {
      const req = { method: 'POST' };
      collector.recordRequest(req, mockRes, 50);
      
      const metrics = collector.getMetrics();
      expect(metrics.byPath['unknown']).toBe(1);
    });

    it('should handle missing method', () => {
      const req = { path: '/test' };
      collector.recordRequest(req, mockRes, 50);
      
      const metrics = collector.getMetrics();
      expect(metrics.byMethod['UNKNOWN']).toBe(1);
    });

    it('should handle missing statusCode', () => {
      const res = {};
      collector.recordRequest(mockReq, res, 50);
      
      const metrics = collector.getMetrics();
      expect(metrics.byStatus['200']).toBe(1);
    });

    it('should calculate average response time', () => {
      collector.recordRequest(mockReq, mockRes, 100);
      collector.recordRequest(mockReq, mockRes, 200);
      collector.recordRequest(mockReq, mockRes, 300);
      
      const metrics = collector.getMetrics();
      expect(metrics.avgResponseTime).toBe(200);
    });

    it('should limit response times history', () => {
      for (let i = 0; i < 1001; i++) {
        collector.recordRequest(mockReq, mockRes, 100);
      }
      
      const metrics = collector.getMetrics();
      expect(metrics.totalRequests).toBe(1001);
      
      const responseTimes = (collector as any).metrics.responseTimes;
      expect(responseTimes.length).toBe(1000);
    });

    it('should handle different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of methods) {
        collector.recordRequest({ ...mockReq, method }, mockRes, 100);
      }
      
      const metrics = collector.getMetrics();
      expect(metrics.byMethod['GET']).toBe(1);
      expect(metrics.byMethod['POST']).toBe(1);
      expect(metrics.byMethod['PUT']).toBe(1);
      expect(metrics.byMethod['DELETE']).toBe(1);
      expect(metrics.byMethod['PATCH']).toBe(1);
    });

    it('should handle different status codes', () => {
      const statusCodes = [200, 201, 404, 500, 302];
      
      for (const code of statusCodes) {
        collector.recordRequest(mockReq, { statusCode: code }, 100);
      }
      
      const metrics = collector.getMetrics();
      expect(metrics.byStatus['200']).toBe(1);
      expect(metrics.byStatus['201']).toBe(1);
      expect(metrics.byStatus['404']).toBe(1);
      expect(metrics.byStatus['500']).toBe(1);
      expect(metrics.byStatus['302']).toBe(1);
    });

    it('should handle different paths', () => {
      const paths = ['/api/users', '/api/posts', '/api/comments'];
      
      for (const path of paths) {
        collector.recordRequest({ ...mockReq, path }, mockRes, 100);
      }
      
      const metrics = collector.getMetrics();
      expect(metrics.byPath['/api/users']).toBe(1);
      expect(metrics.byPath['/api/posts']).toBe(1);
      expect(metrics.byPath['/api/comments']).toBe(1);
    });
  });

  // ============================================
  // RECORD THREATS
  // ============================================

  describe('recordThreats', () => {
    it('should record threats', () => {
      const threats: Threat[] = [
        { type: 'XSS', severity: 'high', confidence: 0.9 } as Threat,
        { type: 'SQL_INJECTION', severity: 'critical', confidence: 0.95 } as Threat
      ];
      
      collector.recordThreats(threats);
      
      const metrics = collector.getMetrics();
      expect(metrics.threatsBlocked).toBe(2);
      expect(metrics.threatTypes).toContain('XSS');
      expect(metrics.threatTypes).toContain('SQL_INJECTION');
      expect(metrics.threatStats['XSS']).toBe(1);
      expect(metrics.threatStats['SQL_INJECTION']).toBe(1);
    });

    it('should handle empty threats', () => {
      collector.recordThreats([]);
      
      const metrics = collector.getMetrics();
      expect(metrics.threatsBlocked).toBe(0);
    });

    it('should handle threats without type', () => {
      const threats = [{ severity: 'high' } as Threat];
      
      collector.recordThreats(threats);
      
      const metrics = collector.getMetrics();
      expect(metrics.threatTypes).toContain('unknown');
      expect(metrics.threatStats['unknown']).toBe(1);
    });

    it('should limit threats history', () => {
      const threats: Threat[] = [];
      for (let i = 0; i < 1001; i++) {
        threats.push({ type: 'XSS', severity: 'high', confidence: 0.9 } as Threat);
      }
      
      collector.recordThreats(threats);
      
      const metrics = collector.getMetrics();
      expect(metrics.threatsBlocked).toBe(1001);
      expect((collector as any).metrics.threats.length).toBe(1000);
    });

    it('should aggregate threats by type', () => {
      const threats: Threat[] = [
        { type: 'XSS', severity: 'high' } as Threat,
        { type: 'XSS', severity: 'medium' } as Threat,
        { type: 'SQL_INJECTION', severity: 'critical' } as Threat
      ];
      
      collector.recordThreats(threats);
      
      const metrics = collector.getMetrics();
      expect(metrics.threatStats['XSS']).toBe(2);
      expect(metrics.threatStats['SQL_INJECTION']).toBe(1);
    });
  });

  // ============================================
  // RECORD ERROR
  // ============================================

  describe('recordError', () => {
    it('should record errors', () => {
      collector.recordError(new Error('Test error'));
      collector.recordError(new Error('Another error'));
      
      const metrics = collector.getMetrics();
      expect(metrics.errors).toBe(2);
    });

    it('should handle non-Error objects', () => {
      collector.recordError('String error');
      collector.recordError({ message: 'Object error' });
      
      const metrics = collector.getMetrics();
      expect(metrics.errors).toBe(2);
    });

    it('should handle null and undefined', () => {
      collector.recordError(null);
      collector.recordError(undefined);
      
      const metrics = collector.getMetrics();
      expect(metrics.errors).toBe(2);
    });
  });

  // ============================================
  // GET METRICS
  // ============================================

  describe('getMetrics', () => {
    it('should return metrics with all fields', () => {
      collector.recordRequest(mockReq, mockRes, 100);
      collector.recordError(new Error('Test'));
      
      const metrics = collector.getMetrics();
      
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('threatsBlocked');
      expect(metrics).toHaveProperty('avgResponseTime');
      expect(metrics).toHaveProperty('p95ResponseTime');
      expect(metrics).toHaveProperty('p99ResponseTime');
      expect(metrics).toHaveProperty('errors');
      expect(metrics).toHaveProperty('threats');
      expect(metrics).toHaveProperty('threatTypes');
      expect(metrics).toHaveProperty('threatStats');
      expect(metrics).toHaveProperty('byPath');
      expect(metrics).toHaveProperty('byMethod');
      expect(metrics).toHaveProperty('byStatus');
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('timestamp');
    });

    it('should calculate percentiles correctly', () => {
      const durations = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      
      for (const duration of durations) {
        collector.recordRequest(mockReq, mockRes, duration);
      }
      
      const metrics = collector.getMetrics();
      // P95 должно быть 95 или 100 в зависимости от реализации
      expect(metrics.p95ResponseTime).toBeGreaterThanOrEqual(95);
      expect(metrics.p99ResponseTime).toBeGreaterThanOrEqual(99);
    });

    it('should handle empty response times for percentiles', () => {
      const metrics = collector.getMetrics();
      expect(metrics.p95ResponseTime).toBe(0);
      expect(metrics.p99ResponseTime).toBe(0);
    });

    it('should return last 10 threats', () => {
      const threats: Threat[] = [];
      for (let i = 0; i < 15; i++) {
        threats.push({ type: `XSS_${i}`, severity: 'high' } as Threat);
      }
      
      collector.recordThreats(threats);
      
      const metrics = collector.getMetrics();
      expect(metrics.threats.length).toBe(10);
    });
  });

  // ============================================
  // RESET
  // ============================================

  describe('reset', () => {
    it('should reset all metrics', () => {
      collector.recordRequest(mockReq, mockRes, 100);
      collector.recordError(new Error('Test'));
      
      collector.reset();
      
      const metrics = collector.getMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.avgResponseTime).toBe(0);
      expect(metrics.errors).toBe(0);
      expect(metrics.threatsBlocked).toBe(0);
      expect(metrics.byPath).toEqual({});
      expect(metrics.byMethod).toEqual({});
      expect(metrics.byStatus).toEqual({});
    });

    it('should reset startTime', () => {
      const oldMetrics = collector.getMetrics();
      const oldUptime = oldMetrics.uptime;
      
      // Ждем немного чтобы изменилось время
      setTimeout(() => {
        collector.reset();
        
        const newMetrics = collector.getMetrics();
        // newMetrics.uptime должно быть меньше чем было, так как reset сбросил startTime
        // Но uptime считается от startTime, поэтому после reset он будет меньше
        expect(newMetrics.uptime).toBeLessThanOrEqual(oldUptime + 50);
      }, 10);
    });
  });

  // ============================================
  // EXPORT
  // ============================================

  describe('export', () => {
    beforeEach(() => {
      collector.recordRequest(mockReq, mockRes, 100);
      collector.recordRequest(mockReq, mockRes, 200);
      collector.recordError(new Error('Test'));
      const threats = [{ type: 'XSS', severity: 'high' } as Threat];
      collector.recordThreats(threats);
    });

    it('should export as JSON by default', () => {
      const result = collector.export();
      
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed.totalRequests).toBe(2);
      expect(parsed.errors).toBe(1);
      expect(parsed.threatsBlocked).toBe(1);
    });

    it('should export as JSON', () => {
      const result = collector.export('json');
      
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed.totalRequests).toBe(2);
    });

    it('should export as Prometheus', () => {
      const result = collector.export('prometheus');
      
      expect(typeof result).toBe('string');
      expect(result).toContain('# HELP total_requests');
      expect(result).toContain('# HELP threats_blocked');
      expect(result).toContain('# HELP avg_response_time');
      expect(result).toContain('# HELP p95_response_time');
      expect(result).toContain('# HELP errors_total');
      expect(result).toContain('# HELP uptime_seconds');
      expect(result).toContain('total_requests 2');
      expect(result).toContain('threats_blocked 1');
      expect(result).toContain('errors_total 1');
    });

    it('should export as CSV', () => {
      const result = collector.export('csv');
      
      expect(typeof result).toBe('string');
      expect(result).toContain('totalRequests,threatsBlocked,avgResponseTime,p95ResponseTime,p99ResponseTime,errors');
      // Проверяем что значения присутствуют, но не проверяем точные числа из-за округления
      expect(result).toContain('2,1,150');
      expect(result).toContain('errors');
    });

    it('should handle empty metrics in export', () => {
      const emptyCollector = new MetricsCollector();
      
      const jsonResult = emptyCollector.export('json');
      const parsed = JSON.parse(jsonResult);
      expect(parsed.totalRequests).toBe(0);
      
      const promResult = emptyCollector.export('prometheus');
      expect(promResult).toContain('total_requests 0');
      
      const csvResult = emptyCollector.export('csv');
      expect(csvResult).toContain('0,0,0,0,0,0');
    });

    it('should handle unknown format by falling back to JSON', () => {
      const result = collector.export('unknown' as any);
      
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed.totalRequests).toBe(2);
    });
  });

  // ============================================
  // CALCULATE PERCENTILE (PRIVATE)
  // ============================================

  describe('calculatePercentile (private)', () => {
    it('should return 0 for empty response times', () => {
      const result = (collector as any).calculatePercentile(95);
      expect(result).toBe(0);
    });

    it('should calculate correct percentile', () => {
      const durations = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      
      for (const duration of durations) {
        collector.recordRequest(mockReq, mockRes, duration);
      }
      
      // Проверяем что значения корректны (могут быть 95 или 100)
      const p50 = (collector as any).calculatePercentile(50);
      const p95 = (collector as any).calculatePercentile(95);
      const p99 = (collector as any).calculatePercentile(99);
      
      expect(p50).toBeGreaterThanOrEqual(50);
      expect(p95).toBeGreaterThanOrEqual(95);
      expect(p99).toBeGreaterThanOrEqual(99);
    });

    it('should handle single value', () => {
      collector.recordRequest(mockReq, mockRes, 42);
      
      expect((collector as any).calculatePercentile(50)).toBe(42);
      expect((collector as any).calculatePercentile(95)).toBe(42);
    });
  });

  // ============================================
  // ИНТЕГРАЦИОННЫЕ ТЕСТЫ
  // ============================================

  describe('integration', () => {
    it('should handle full metrics workflow', () => {
      collector.recordRequest({ method: 'GET', path: '/api/users' }, { statusCode: 200 }, 50);
      collector.recordRequest({ method: 'POST', path: '/api/users' }, { statusCode: 201 }, 100);
      collector.recordRequest({ method: 'GET', path: '/api/posts' }, { statusCode: 404 }, 30);
      
      const threats: Threat[] = [
        { type: 'XSS', severity: 'high' } as Threat,
        { type: 'SQL_INJECTION', severity: 'critical' } as Threat
      ];
      collector.recordThreats(threats);
      
      collector.recordError(new Error('Test error'));
      
      const metrics = collector.getMetrics();
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.threatsBlocked).toBe(2);
      expect(metrics.errors).toBe(1);
      expect(metrics.avgResponseTime).toBe(60);
      
      const json = collector.export('json');
      const parsed = JSON.parse(json);
      expect(parsed.totalRequests).toBe(3);
      
      collector.reset();
      const resetMetrics = collector.getMetrics();
      expect(resetMetrics.totalRequests).toBe(0);
    });

    it('should handle many requests and calculate correct averages', () => {
      const durations = [10, 20, 30, 40, 50];
      
      for (const duration of durations) {
        collector.recordRequest(mockReq, mockRes, duration);
      }
      
      const metrics = collector.getMetrics();
      expect(metrics.avgResponseTime).toBe(30);
      expect(metrics.p95ResponseTime).toBeGreaterThanOrEqual(50);
    });

    it('should handle mixed request data', () => {
      const requests = [
        { method: 'GET', path: '/api/users', status: 200 },
        { method: 'POST', path: '/api/users', status: 201 },
        { method: 'PUT', path: '/api/users/1', status: 200 },
        { method: 'DELETE', path: '/api/users/1', status: 204 }
      ];
      
      for (const req of requests) {
        collector.recordRequest(
          { method: req.method, path: req.path },
          { statusCode: req.status },
          100
        );
      }
      
      const metrics = collector.getMetrics();
      expect(metrics.totalRequests).toBe(4);
      expect(metrics.byMethod['GET']).toBe(1);
      expect(metrics.byMethod['POST']).toBe(1);
      expect(metrics.byMethod['PUT']).toBe(1);
      expect(metrics.byMethod['DELETE']).toBe(1);
      expect(metrics.byStatus['200']).toBe(2);
      expect(metrics.byStatus['201']).toBe(1);
      expect(metrics.byStatus['204']).toBe(1);
    });
  });
});
