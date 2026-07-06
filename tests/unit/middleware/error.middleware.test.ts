import { errorMiddleware } from '../../../src/middleware/error.middleware';
import { FABShield } from '../../../src/core/FABShield';

describe('Error Middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;
  let shield: FABShield;
  let originalEnv: string | undefined;

  beforeEach(() => {
    // Сохраняем оригинальный NODE_ENV
    originalEnv = process.env.NODE_ENV;
    
    req = {
      method: 'GET',
      path: '/test',
      url: '/test',
      ip: '127.0.0.1',
      id: 'test-request-id',
      requestId: 'test-request-id',
      connection: { remoteAddress: '127.0.0.1' },
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      getHeader: jest.fn(),
      removeHeader: jest.fn()
    };
    
    next = jest.fn();
    
    // Mock shield
    shield = new FABShield({});
    (shield as any).metrics = {
      recordError: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Восстанавливаем NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  // ============================================
  // Базовые тесты
  // ============================================

  test('should handle error with status code', () => {
    const error = new Error('Test error');
    (error as any).status = 400;
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Test error',
      status: 400,
      requestId: 'test-request-id',
      timestamp: expect.any(String)
    });
  });

  test('should handle error with statusCode property', () => {
    const error = new Error('Test error');
    (error as any).statusCode = 403;
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Test error',
        status: 403
      })
    );
  });

  test('should handle error without status code', () => {
    const error = new Error('Internal error');
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal error',
      status: 500,
      requestId: 'test-request-id',
      timestamp: expect.any(String)
    });
  });

  // ============================================
  // Тесты для разных NODE_ENV
  // ============================================

  test('should handle error with stack trace in development', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Dev error');
    error.stack = 'Error: Dev error\n    at Test...';
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Dev error',
        status: 500,
        stack: expect.any(String)
      })
    );
  });

  test('should handle error without stack trace in production', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Prod error');
    error.stack = 'Error: Prod error\n    at Test...';
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    const call = res.json.mock.calls[0][0];
    expect(call).not.toHaveProperty('stack');
    expect(call).toEqual({
      error: 'Prod error',
      status: 500,
      requestId: 'test-request-id',
      timestamp: expect.any(String)
    });
  });

  test('should handle error with details in development', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Dev error');
    (error as any).details = { field: 'email', reason: 'Invalid format' };
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        details: { field: 'email', reason: 'Invalid format' }
      })
    );
  });

  // ============================================
  // Тесты для разных типов ошибок
  // ============================================

  test('should handle non-Error objects (string)', () => {
    const error = 'String error';
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'String error',
        status: 500
      })
    );
  });

  test('should handle non-Error objects (object with message)', () => {
    const error = { message: 'Object error', code: 'CUSTOM_ERROR' };
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Object error',
        status: 500
      })
    );
  });

  test('should handle non-Error objects (object with error property)', () => {
    const error = { error: 'Custom error message', status: 422 };
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Custom error message',
        status: 422
      })
    );
  });

  test('should handle null error', () => {
    const middleware = errorMiddleware();
    middleware(null, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error',
        status: 500
      })
    );
  });

  test('should handle undefined error', () => {
    const middleware = errorMiddleware();
    middleware(undefined, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error',
        status: 500
      })
    );
  });

  test('should handle Error with custom properties', () => {
    const error = new Error('Custom error');
    (error as any).status = 418;
    (error as any).code = 'I_AM_A_TEAPOT';
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Custom error',
        status: 418
      })
    );
  });

  // ============================================
  // Тесты для security headers
  // ============================================

  test('should set security headers for error response', () => {
    const error = new Error('Test');
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', 'test-request-id');
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Security-Policy', "default-src 'self'");
  });

  test('should set X-Request-ID header from request id', () => {
    const error = new Error('Test');
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', 'test-request-id');
  });

  test('should set X-Request-ID header from request requestId', () => {
    // Убираем id, оставляем только requestId
    delete req.id;
    req.requestId = 'custom-request-id';
    const error = new Error('Test');
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', 'custom-request-id');
  });

  // ============================================
  // Тесты для requestId
  // ============================================

  test('should handle missing request id', () => {
    const reqWithoutId = { 
      method: 'GET', 
      path: '/test',
      ip: '127.0.0.1',
      url: '/test'
    };
    const error = new Error('Test');
    
    const middleware = errorMiddleware();
    middleware(error, reqWithoutId, res, next);
    
    const call = res.json.mock.calls[0][0];
    expect(call).toHaveProperty('requestId');
    expect(call.requestId).toMatch(/^req-\d+-[a-z0-9]+$/);
  });

  test('should generate requestId if not provided', () => {
    const reqNoId = { method: 'GET', path: '/test' };
    const error = new Error('Test');
    
    const middleware = errorMiddleware();
    middleware(error, reqNoId, res, next);
    
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: expect.stringMatching(/^req-\d+-[a-z0-9]+$/)
      })
    );
  });

  // ============================================
  // Тесты для shield и метрик
  // ============================================

  test('should record error in metrics if shield provided', () => {
    const error = new Error('Test');
    
    const middleware = errorMiddleware(shield);
    middleware(error, req, res, next);
    
    expect((shield as any).metrics.recordError).toHaveBeenCalledWith(error);
  });

  test('should handle shield without metrics', () => {
    const shieldWithoutMetrics = new FABShield({});
    (shieldWithoutMetrics as any).metrics = undefined;
    
    const error = new Error('Test');
    const middleware = errorMiddleware(shieldWithoutMetrics);
    
    expect(() => middleware(error, req, res, next)).not.toThrow();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('should handle shield with metrics that has no recordError', () => {
    const shieldWithBadMetrics = new FABShield({});
    (shieldWithBadMetrics as any).metrics = {};
    
    const error = new Error('Test');
    const middleware = errorMiddleware(shieldWithBadMetrics);
    
    expect(() => middleware(error, req, res, next)).not.toThrow();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('should handle metrics.recordError throwing error', () => {
    const shieldWithFailingMetrics = new FABShield({});
    (shieldWithFailingMetrics as any).metrics = {
      recordError: jest.fn().mockImplementation(() => {
        throw new Error('Metrics error');
      })
    };
    
    const error = new Error('Test');
    const middleware = errorMiddleware(shieldWithFailingMetrics);
    
    expect(() => middleware(error, req, res, next)).not.toThrow();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ============================================
  // Тесты для next() и цепочки
  // ============================================

  test('should call next after handling error', () => {
    const error = new Error('Test');
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(next).toHaveBeenCalled();
  });

  test('should call next even if shield is not provided', () => {
    const error = new Error('Test');
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(next).toHaveBeenCalled();
  });

  test('should call next even if error is null', () => {
    const middleware = errorMiddleware();
    middleware(null, req, res, next);
    
    expect(next).toHaveBeenCalled();
  });

  // ============================================
  // Интеграционные тесты
  // ============================================

  test('should handle error with original error message if available', () => {
    const error = { message: 'Custom error message', status: 409 };
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Custom error message',
        status: 409
      })
    );
  });

  test('should handle error object with stringify fallback', () => {
    const error = { toString: () => 'Custom string' };
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: '{"toString":"Custom string"}'
      })
    );
  });

  test('should handle circular reference error object', () => {
    const error: any = { message: 'Circular error' };
    error.self = error;
    
    const middleware = errorMiddleware();
    
    expect(() => middleware(error, req, res, next)).not.toThrow();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('should preserve original status if error has both status and statusCode', () => {
    const error = new Error('Test');
    (error as any).status = 400;
    (error as any).statusCode = 404;
    
    const middleware = errorMiddleware();
    middleware(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
  });
});