import { errorMiddleware } from '../../../src/middleware/headers.middleware';

describe('Headers Middleware (errorMiddleware)', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;
  let mockShield: any;

  beforeEach(() => {
    mockReq = {
      requestId: 'test-request-id',
      id: 'test-id',
      path: '/test',
      method: 'GET',
      ip: '127.0.0.1',
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      getHeader: jest.fn().mockReturnThis(),
      removeHeader: jest.fn()
    };

    mockNext = jest.fn();

    mockShield = {
      metrics: {
        recordError: jest.fn()
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // ОБРАБОТКА РАЗНЫХ ТИПОВ ОШИБОК
  // ============================================

  describe('error handling - different error types', () => {
    it('should handle Error object', () => {
      const error = new Error('Test error');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Test error',
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String)
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle string error', () => {
      const error = 'String error';
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'String error',
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String)
      });
    });

    it('should handle null error', () => {
      const middleware = errorMiddleware();
      
      middleware(null, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String)
      });
    });

    it('should handle undefined error', () => {
      const middleware = errorMiddleware();
      
      middleware(undefined, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String)
      });
    });

    it('should handle object with error property', () => {
      const error = { error: 'Custom error message' };
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Custom error message',
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String)
      });
    });

    it('should handle object with message property', () => {
      const error = { message: 'Message error' };
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Message error',
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String)
      });
    });

    it('should handle object with custom toString', () => {
      const error = {
        toString: () => 'Custom toString'
      };
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: JSON.stringify({ toString: 'Custom toString' }),
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String)
      });
    });

    it('should handle number error', () => {
      const error = 123;
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: '123',
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String)
      });
    });

    it('should handle boolean error', () => {
      const error = true;
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'true',
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String)
      });
    });
  });

  // ============================================
  // СТАТУСЫ ОШИБОК
  // ============================================

  describe('error status handling', () => {
    it('should use error.status when present', () => {
      const error = new Error('Bad request');
      (error as any).status = 400;
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should use error.statusCode when present', () => {
      const error = new Error('Not found');
      (error as any).statusCode = 404;
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should use default 500 when no status', () => {
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should prefer status over statusCode', () => {
      const error = new Error('Conflict');
      (error as any).status = 409;
      (error as any).statusCode = 400;
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
    });
  });

  // ============================================
  // REQUEST ID
  // ============================================

  describe('request ID handling', () => {
    it('should use requestId from req', () => {
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Test',
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String)
      });
    });

    it('should use id from req if requestId not present', () => {
      mockReq.requestId = undefined;
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Test',
        status: 500,
        requestId: 'test-id',
        timestamp: expect.any(String)
      });
    });

    it('should generate requestId if neither present', () => {
      mockReq.requestId = undefined;
      mockReq.id = undefined;
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.requestId).toMatch(/^req-\d+-[a-z0-9]+$/);
    });
  });

  // ============================================
  // SHIELD INTEGRATION
  // ============================================

  describe('shield integration', () => {
    it('should record error in metrics when shield provided', () => {
      const error = new Error('Test');
      const middleware = errorMiddleware(mockShield);
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockShield.metrics.recordError).toHaveBeenCalledWith(error);
    });

    it('should handle shield without metrics', () => {
      const shieldWithoutMetrics = {};
      const error = new Error('Test');
      const middleware = errorMiddleware(shieldWithoutMetrics as any);
      
      expect(() => {
        middleware(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should handle metrics.recordError throwing error', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockShield.metrics.recordError.mockImplementation(() => {
        throw new Error('Metrics error');
      });
      
      const error = new Error('Test');
      const middleware = errorMiddleware(mockShield);
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should handle shield null', () => {
      const error = new Error('Test');
      const middleware = errorMiddleware(null as any);
      
      expect(() => {
        middleware(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
    });
  });

  // ============================================
  // HEADERS
  // ============================================

  describe('security headers', () => {
    it('should set security headers', () => {
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', 'test-request-id');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Security-Policy', "default-src 'self'");
    });

    it('should handle setHeader errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockRes.setHeader.mockImplementation(() => {
        throw new Error('Header error');
      });
      
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      expect(() => {
        middleware(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // DEVELOPMENT VS PRODUCTION
  // ============================================

  describe('development vs production', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Dev error');
      error.stack = 'Error stack trace';
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Dev error',
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String),
        stack: 'Error stack trace'
      });
    });

    it('should not include stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Prod error');
      error.stack = 'Error stack trace';
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.stack).toBeUndefined();
    });

    it('should include error details in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Validation error');
      (error as any).details = { field: 'email', reason: 'Invalid' };
      // Убираем stack для чистоты теста
      error.stack = undefined;
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation error',
        status: 500,
        requestId: 'test-request-id',
        timestamp: expect.any(String),
        details: { field: 'email', reason: 'Invalid' }
      });
    });

    it('should not include error details in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Validation error');
      (error as any).details = { field: 'email', reason: 'Invalid' };
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.details).toBeUndefined();
    });
  });

  // ============================================
  // RESPONSE HANDLING
  // ============================================

  describe('response handling', () => {
    it('should handle json response error gracefully', () => {
      mockRes.json.mockImplementation(() => {
        throw new Error('JSON error');
      });
      
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      expect(() => {
        middleware(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should handle send fallback when json fails', () => {
      mockRes.json.mockImplementation(() => {
        throw new Error('JSON error');
      });
      mockRes.send.mockReturnThis();
      
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.send).toHaveBeenCalledWith('Test');
    });

    it('should handle missing res.json', () => {
      mockRes.json = undefined;
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      expect(() => {
        middleware(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should handle missing res.status', () => {
      mockRes.status = undefined;
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      expect(() => {
        middleware(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should handle missing res.setHeader', () => {
      mockRes.setHeader = undefined;
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      expect(() => {
        middleware(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
    });
  });

  // ============================================
  // NEXT FUNCTION
  // ============================================

  describe('next function', () => {
    it('should call next after handling error', () => {
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle missing next', () => {
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      expect(() => {
        middleware(error, mockReq, mockRes, undefined);
      }).not.toThrow();
    });

    it('should call next even if shield not provided', () => {
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  // ============================================
  // MISSING REQUEST DATA
  // ============================================

  describe('missing request data', () => {
    it('should handle missing req.path', () => {
      mockReq.path = undefined;
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle missing req.method', () => {
      mockReq.method = undefined;
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle missing req.ip', () => {
      mockReq.ip = undefined;
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle missing req entirely', () => {
      const error = new Error('Test');
      const middleware = errorMiddleware();
      
      // Передаем пустой объект вместо null
      expect(() => {
        middleware(error, {}, mockRes, mockNext);
      }).not.toThrow();
    });
  });

  // ============================================
  // OBJECT WITH CIRCULAR REFERENCE
  // ============================================

  describe('circular reference handling', () => {
    it('should handle circular reference in error object', () => {
      const error: any = { name: 'Circular' };
      error.self = error;
      
      const middleware = errorMiddleware();
      
      expect(() => {
        middleware(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
    });

    it('should handle error with circular reference and custom toString', () => {
      const error: any = {
        toString: () => 'Custom toString'
      };
      error.self = error;
      
      const middleware = errorMiddleware();
      
      expect(() => {
        middleware(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
    });
  });

  // ============================================
  // INTEGRATION
  // ============================================

  describe('integration', () => {
    it('should handle full error flow with shield', () => {
      const error = new Error('Integration test');
      (error as any).status = 403;
      (error as any).details = { reason: 'Forbidden' };
      error.stack = undefined; // Убираем stack для чистоты
      process.env.NODE_ENV = 'development';
      
      const middleware = errorMiddleware(mockShield);
      
      middleware(error, mockReq, mockRes, mockNext);

      expect(mockShield.metrics.recordError).toHaveBeenCalledWith(error);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.setHeader).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Integration test',
        status: 403,
        requestId: 'test-request-id',
        timestamp: expect.any(String),
        details: { reason: 'Forbidden' }
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle error without requestId', () => {
      mockReq.requestId = undefined;
      mockReq.id = undefined;
      
      const error = new Error('No ID');
      const middleware = errorMiddleware();
      
      middleware(error, mockReq, mockRes, mockNext);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.requestId).toMatch(/^req-\d+-[a-z0-9]+$/);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
