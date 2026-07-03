import { RequestHandler } from '../../../src/core/RequestHandler';

describe('RequestHandler', () => {
  let requestHandler: RequestHandler;
  let mockContextManager: any;
  let mockHeaders: any;
  let mockCSP: any;
  let mockAI: any;
  let mockPlugins: any;
  let mockMetrics: any;
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockContextManager = {
      create: jest.fn().mockReturnValue({ id: 'test-context' })
    };

    mockHeaders = {
      apply: jest.fn().mockResolvedValue(undefined)
    };

    mockCSP = {
      apply: jest.fn().mockResolvedValue(undefined)
    };

    mockAI = {
      analyze: jest.fn().mockResolvedValue({
        threats: [],
        isThreat: false,
        threatScore: 0
      })
    };

    mockPlugins = {
      execute: jest.fn().mockResolvedValue(undefined)
    };

    mockMetrics = {
      recordThreats: jest.fn(),
      recordRequest: jest.fn(),
      recordError: jest.fn()
    };

    requestHandler = new RequestHandler(
      mockContextManager,
      mockHeaders,
      mockCSP,
      mockAI,
      mockPlugins,
      mockMetrics
    );

    mockReq = {
      method: 'GET',
      path: '/test',
      headers: {},
      ip: '127.0.0.1'
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // КОНСТРУКТОР
  // ============================================

  describe('constructor', () => {
    it('should create instance successfully', () => {
      expect(requestHandler).toBeInstanceOf(RequestHandler);
    });

    it('should store all dependencies', () => {
      expect((requestHandler as any).contextManager).toBe(mockContextManager);
      expect((requestHandler as any).headers).toBe(mockHeaders);
      expect((requestHandler as any).csp).toBe(mockCSP);
      expect((requestHandler as any).ai).toBe(mockAI);
      expect((requestHandler as any).plugins).toBe(mockPlugins);
      expect((requestHandler as any).metrics).toBe(mockMetrics);
    });
  });

  // ============================================
  // HANDLE - УСПЕШНЫЙ СЦЕНАРИЙ
  // ============================================

  describe('handle - successful', () => {
    it('should create context from request', async () => {
      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockContextManager.create).toHaveBeenCalledWith(mockReq);
    });

    it('should apply headers', async () => {
      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockHeaders.apply).toHaveBeenCalledWith(mockReq, mockRes);
    });

    it('should apply CSP', async () => {
      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockCSP.apply).toHaveBeenCalledWith(mockReq, mockRes);
    });

    it('should analyze request with AI', async () => {
      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockAI.analyze).toHaveBeenCalledWith(mockReq, { id: 'test-context' });
    });

    it('should execute plugins', async () => {
      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockPlugins.execute).toHaveBeenCalledWith(mockReq, mockRes, { id: 'test-context' });
    });

    it('should record request metrics', async () => {
      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordRequest).toHaveBeenCalledWith(mockReq, mockRes, expect.any(Number));
    });

    it('should call next on success', async () => {
      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle request without threats', async () => {
      mockAI.analyze.mockResolvedValue({
        threats: [],
        isThreat: false,
        threatScore: 0
      });

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordThreats).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  // ============================================
  // HANDLE - С УГРОЗАМИ
  // ============================================

  describe('handle - with threats', () => {
    it('should record threats when detected', async () => {
      const threats = [
        { type: 'XSS', severity: 'medium', confidence: 0.8 }
      ];
      mockAI.analyze.mockResolvedValue({
        threats,
        isThreat: true,
        threatScore: 0.8
      });

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordThreats).toHaveBeenCalledWith(threats);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should block request for critical threats', async () => {
      const threats = [
        { type: 'SQL Injection', severity: 'critical', confidence: 0.95 }
      ];
      mockAI.analyze.mockResolvedValue({
        threats,
        isThreat: true,
        threatScore: 0.95
      });

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Request blocked due to security threat',
        threats: [
          {
            type: 'SQL Injection',
            severity: 'critical',
            confidence: 0.95
          }
        ],
        timestamp: expect.any(String)
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should block request for high severity threats', async () => {
      const threats = [
        { type: 'XSS', severity: 'high', confidence: 0.9 }
      ];
      mockAI.analyze.mockResolvedValue({
        threats,
        isThreat: true,
        threatScore: 0.9
      });

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should not block request for low severity threats', async () => {
      const threats = [
        { type: 'Suspicious', severity: 'low', confidence: 0.3 }
      ];
      mockAI.analyze.mockResolvedValue({
        threats,
        isThreat: true,
        threatScore: 0.3
      });

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordThreats).toHaveBeenCalledWith(threats);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle multiple threats with mixed severity', async () => {
      const threats = [
        { type: 'XSS', severity: 'low', confidence: 0.3 },
        { type: 'SQL Injection', severity: 'high', confidence: 0.9 }
      ];
      mockAI.analyze.mockResolvedValue({
        threats,
        isThreat: true,
        threatScore: 0.9
      });

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordThreats).toHaveBeenCalledWith(threats);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Request blocked due to security threat',
        threats: [
          {
            type: 'SQL Injection',
            severity: 'high',
            confidence: 0.9
          }
        ],
        timestamp: expect.any(String)
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // HANDLE - С ОШИБКАМИ
  // ============================================

  describe('handle - with errors', () => {
    it('should handle headers error', async () => {
      const error = new Error('Headers error');
      mockHeaders.apply.mockRejectedValue(error);

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordError).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle CSP error', async () => {
      const error = new Error('CSP error');
      mockCSP.apply.mockRejectedValue(error);

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordError).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle AI analysis error', async () => {
      const error = new Error('AI analysis error');
      mockAI.analyze.mockRejectedValue(error);

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordError).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle plugins error', async () => {
      const error = new Error('Plugins error');
      mockPlugins.execute.mockRejectedValue(error);

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordError).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ============================================
  // HANDLE - КРАЕВЫЕ СЛУЧАИ
  // ============================================

  describe('handle - edge cases', () => {
    it('should handle null analysis from AI', async () => {
      mockAI.analyze.mockResolvedValue(null);

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordThreats).not.toHaveBeenCalled();
      expect(mockPlugins.execute).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle analysis without threats property', async () => {
      mockAI.analyze.mockResolvedValue({});

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordThreats).not.toHaveBeenCalled();
      expect(mockPlugins.execute).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle empty threats array', async () => {
      mockAI.analyze.mockResolvedValue({ threats: [] });

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordThreats).not.toHaveBeenCalled();
      expect(mockPlugins.execute).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle threats without severity', async () => {
      const threats = [{ type: 'Unknown', confidence: 0.5 }];
      mockAI.analyze.mockResolvedValue({
        threats,
        isThreat: true,
        threatScore: 0.5
      });

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordThreats).toHaveBeenCalledWith(threats);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle response json error', async () => {
      const threats = [
        { type: 'XSS', severity: 'high', confidence: 0.9 }
      ];
      mockAI.analyze.mockResolvedValue({
        threats,
        isThreat: true,
        threatScore: 0.9
      });
      mockRes.json.mockImplementation(() => {
        throw new Error('JSON error');
      });

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockMetrics.recordError).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // ============================================
  // ИНТЕГРАЦИОННЫЕ ТЕСТЫ
  // ============================================

  describe('integration', () => {
    it('should handle full request lifecycle', async () => {
      mockAI.analyze.mockResolvedValue({
        threats: [],
        isThreat: false,
        threatScore: 0
      });

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockContextManager.create).toHaveBeenCalled();
      expect(mockHeaders.apply).toHaveBeenCalled();
      expect(mockCSP.apply).toHaveBeenCalled();
      expect(mockAI.analyze).toHaveBeenCalled();
      expect(mockPlugins.execute).toHaveBeenCalled();
      expect(mockMetrics.recordRequest).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle request with critical threat', async () => {
      const threats = [
        { type: 'SQL Injection', severity: 'critical', confidence: 0.95 }
      ];
      mockAI.analyze.mockResolvedValue({
        threats,
        isThreat: true,
        threatScore: 0.95
      });

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordThreats).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalled();
      expect(mockPlugins.execute).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle request with error', async () => {
      const error = new Error('Test error');
      mockHeaders.apply.mockRejectedValue(error);

      await requestHandler.handle(mockReq, mockRes, mockNext);

      expect(mockMetrics.recordError).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
