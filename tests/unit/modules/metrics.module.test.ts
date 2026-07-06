import { MetricsModule } from '../../../src/modules/metrics/MetricsModule';
import { ConfigManager } from '../../../src/core/ConfigManager';

// Мокаем MetricsCollector
jest.mock('../../../src/modules/metrics/MetricsCollector');

import { MetricsCollector } from '../../../src/modules/metrics/MetricsCollector';

describe('MetricsModule', () => {
  let metricsModule: MetricsModule;
  let mockConfig: ConfigManager;
  let mockCollector: jest.Mocked<MetricsCollector>;

  beforeEach(() => {
    // Создаем мок ConfigManager
    mockConfig = {
      getModule: jest.fn()
    } as any;

    // Создаем мок MetricsCollector
    mockCollector = {
      recordRequest: jest.fn(),
      recordThreats: jest.fn(),
      recordError: jest.fn(),
      getMetrics: jest.fn().mockReturnValue({ totalRequests: 10, threatsBlocked: 5 }),
      reset: jest.fn(),
      export: jest.fn().mockReturnValue('{"test":"data"}')
    } as any;

    // Подменяем конструктор MetricsCollector
    (MetricsCollector as jest.Mock).mockImplementation(() => mockCollector);

    metricsModule = new MetricsModule(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // КОНСТРУКТОР
  // ============================================

  describe('constructor', () => {
    it('should create instance successfully', () => {
      expect(metricsModule).toBeInstanceOf(MetricsModule);
      expect(MetricsCollector).toHaveBeenCalled();
    });

    it('should store config reference', () => {
      expect((metricsModule as any).config).toBe(mockConfig);
    });

    it('should create collector instance', () => {
      expect((metricsModule as any).collector).toBe(mockCollector);
    });
  });

  // ============================================
  // RECORD REQUEST
  // ============================================

  describe('recordRequest', () => {
    const mockReq = { method: 'GET', path: '/test' };
    const mockRes = { statusCode: 200 };
    const duration = 100;

    it('should record request when monitoring enabled', () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      
      metricsModule.recordRequest(mockReq, mockRes, duration);
      
      expect(mockConfig.getModule).toHaveBeenCalledWith('monitoring');
      expect(mockCollector.recordRequest).toHaveBeenCalledWith(mockReq, mockRes, duration);
    });

    it('should not record request when monitoring disabled', () => {
      mockConfig.getModule.mockReturnValue({ enabled: false });
      
      metricsModule.recordRequest(mockReq, mockRes, duration);
      
      expect(mockCollector.recordRequest).not.toHaveBeenCalled();
    });

    it('should not record request when monitoring config is null', () => {
      mockConfig.getModule.mockReturnValue(null);
      
      metricsModule.recordRequest(mockReq, mockRes, duration);
      
      expect(mockCollector.recordRequest).not.toHaveBeenCalled();
    });

    it('should not record request when monitoring config is undefined', () => {
      mockConfig.getModule.mockReturnValue(undefined);
      
      metricsModule.recordRequest(mockReq, mockRes, duration);
      
      expect(mockCollector.recordRequest).not.toHaveBeenCalled();
    });

    it('should handle missing monitoring config', () => {
      mockConfig.getModule.mockReturnValue({});
      
      metricsModule.recordRequest(mockReq, mockRes, duration);
      
      // enabled не определен, поэтому не должно записывать
      expect(mockCollector.recordRequest).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // RECORD THREATS
  // ============================================

  describe('recordThreats', () => {
    const threats = [{ type: 'XSS', severity: 'high' }];

    it('should record threats when monitoring enabled', () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      
      metricsModule.recordThreats(threats);
      
      expect(mockConfig.getModule).toHaveBeenCalledWith('monitoring');
      expect(mockCollector.recordThreats).toHaveBeenCalledWith(threats);
    });

    it('should not record threats when monitoring disabled', () => {
      mockConfig.getModule.mockReturnValue({ enabled: false });
      
      metricsModule.recordThreats(threats);
      
      expect(mockCollector.recordThreats).not.toHaveBeenCalled();
    });

    it('should not record threats when monitoring config is null', () => {
      mockConfig.getModule.mockReturnValue(null);
      
      metricsModule.recordThreats(threats);
      
      expect(mockCollector.recordThreats).not.toHaveBeenCalled();
    });

    it('should handle empty threats array', () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      
      metricsModule.recordThreats([]);
      
      expect(mockCollector.recordThreats).toHaveBeenCalledWith([]);
    });
  });

  // ============================================
  // RECORD ERROR
  // ============================================

  describe('recordError', () => {
    const error = new Error('Test error');

    it('should record error when monitoring enabled', () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      
      metricsModule.recordError(error);
      
      expect(mockConfig.getModule).toHaveBeenCalledWith('monitoring');
      expect(mockCollector.recordError).toHaveBeenCalledWith(error);
    });

    it('should not record error when monitoring disabled', () => {
      mockConfig.getModule.mockReturnValue({ enabled: false });
      
      metricsModule.recordError(error);
      
      expect(mockCollector.recordError).not.toHaveBeenCalled();
    });

    it('should not record error when monitoring config is null', () => {
      mockConfig.getModule.mockReturnValue(null);
      
      metricsModule.recordError(error);
      
      expect(mockCollector.recordError).not.toHaveBeenCalled();
    });

    it('should handle null error', () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      
      metricsModule.recordError(null);
      
      expect(mockCollector.recordError).toHaveBeenCalledWith(null);
    });

    it('should handle string error', () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      
      metricsModule.recordError('String error');
      
      expect(mockCollector.recordError).toHaveBeenCalledWith('String error');
    });
  });

  // ============================================
  // COLLECT
  // ============================================

  describe('collect', () => {
    it('should return metrics from collector', () => {
      const metrics = { totalRequests: 10, threatsBlocked: 5 };
      mockCollector.getMetrics.mockReturnValue(metrics);
      
      const result = metricsModule.collect();
      
      expect(mockCollector.getMetrics).toHaveBeenCalled();
      expect(result).toEqual(metrics);
    });

    it('should return empty metrics when collector returns empty', () => {
      mockCollector.getMetrics.mockReturnValue({});
      
      const result = metricsModule.collect();
      
      expect(result).toEqual({});
    });
  });

  // ============================================
  // GET METRICS
  // ============================================

  describe('getMetrics', () => {
    it('should return metrics from collector', () => {
      const metrics = { totalRequests: 20, threatsBlocked: 10 };
      mockCollector.getMetrics.mockReturnValue(metrics);
      
      const result = metricsModule.getMetrics();
      
      expect(mockCollector.getMetrics).toHaveBeenCalled();
      expect(result).toEqual(metrics);
    });

    it('should return same as collect()', () => {
      const metrics = { totalRequests: 15 };
      mockCollector.getMetrics.mockReturnValue(metrics);
      
      const collectResult = metricsModule.collect();
      const getMetricsResult = metricsModule.getMetrics();
      
      expect(collectResult).toEqual(getMetricsResult);
    });
  });

  // ============================================
  // RESET
  // ============================================

  describe('reset', () => {
    it('should reset collector', () => {
      metricsModule.reset();
      
      expect(mockCollector.reset).toHaveBeenCalled();
    });

    it('should call collector.reset exactly once', () => {
      metricsModule.reset();
      
      expect(mockCollector.reset).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // EXPORT
  // ============================================

  describe('export', () => {
    it('should export metrics in JSON format by default', () => {
      mockCollector.export.mockReturnValue('{"test":"data"}');
      
      const result = metricsModule.export();
      
      expect(mockCollector.export).toHaveBeenCalledWith('json');
      expect(result).toBe('{"test":"data"}');
    });

    it('should export metrics in JSON format', () => {
      mockCollector.export.mockReturnValue('{"test":"data"}');
      
      const result = metricsModule.export('json');
      
      expect(mockCollector.export).toHaveBeenCalledWith('json');
      expect(result).toBe('{"test":"data"}');
    });

    it('should export metrics in Prometheus format', () => {
      const prometheusData = '# HELP test_metric Test metric';
      mockCollector.export.mockReturnValue(prometheusData);
      
      const result = metricsModule.export('prometheus');
      
      expect(mockCollector.export).toHaveBeenCalledWith('prometheus');
      expect(result).toBe(prometheusData);
    });

    it('should export metrics in CSV format', () => {
      const csvData = 'totalRequests,threatsBlocked\n10,5';
      mockCollector.export.mockReturnValue(csvData);
      
      const result = metricsModule.export('csv');
      
      expect(mockCollector.export).toHaveBeenCalledWith('csv');
      expect(result).toBe(csvData);
    });

    it('should handle export errors gracefully', () => {
      mockCollector.export.mockImplementation(() => {
        throw new Error('Export error');
      });
      
      expect(() => {
        metricsModule.export();
      }).toThrow('Export error');
    });
  });

  // ============================================
  // ИНТЕГРАЦИОННЫЕ ТЕСТЫ
  // ============================================

  describe('integration', () => {
    it('should handle full metrics workflow', () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      
      const req = { method: 'POST', path: '/api/test' };
      const res = { statusCode: 201 };
      
      // Record request
      metricsModule.recordRequest(req, res, 150);
      expect(mockCollector.recordRequest).toHaveBeenCalledWith(req, res, 150);
      
      // Record threat
      const threats = [{ type: 'SQL Injection', severity: 'critical' }];
      metricsModule.recordThreats(threats);
      expect(mockCollector.recordThreats).toHaveBeenCalledWith(threats);
      
      // Record error
      const error = new Error('Test error');
      metricsModule.recordError(error);
      expect(mockCollector.recordError).toHaveBeenCalledWith(error);
      
      // Get metrics
      mockCollector.getMetrics.mockReturnValue({
        totalRequests: 1,
        threatsBlocked: 1,
        errors: 1
      });
      
      const metrics = metricsModule.getMetrics();
      expect(metrics).toEqual({
        totalRequests: 1,
        threatsBlocked: 1,
        errors: 1
      });
      
      // Export metrics
      mockCollector.export.mockReturnValue('{"totalRequests":1,"threatsBlocked":1}');
      const exported = metricsModule.export();
      expect(exported).toBe('{"totalRequests":1,"threatsBlocked":1}');
      
      // Reset metrics
      metricsModule.reset();
      expect(mockCollector.reset).toHaveBeenCalled();
    });

    it('should handle disabled monitoring in workflow', () => {
      mockConfig.getModule.mockReturnValue({ enabled: false });
      
      metricsModule.recordRequest({}, {}, 100);
      expect(mockCollector.recordRequest).not.toHaveBeenCalled();
      
      metricsModule.recordThreats([]);
      expect(mockCollector.recordThreats).not.toHaveBeenCalled();
      
      metricsModule.recordError(new Error());
      expect(mockCollector.recordError).not.toHaveBeenCalled();
      
      // But collect and export should still work
      mockCollector.getMetrics.mockReturnValue({});
      const metrics = metricsModule.getMetrics();
      expect(metrics).toEqual({});
      
      mockCollector.export.mockReturnValue('{}');
      const exported = metricsModule.export();
      expect(exported).toBe('{}');
    });
  });
});
