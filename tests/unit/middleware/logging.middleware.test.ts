import { loggingMiddleware } from '../../../src/middleware/logging.middleware';

describe('Logging Middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      method: 'GET',
      path: '/test',
      url: '/test',
      ip: '127.0.0.1',
      id: 'test-request-id',
      connection: { remoteAddress: '127.0.0.1' },
      headers: { 'x-request-id': 'test-request-id' }
    };

    res = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          res._finishCallback = callback;
        }
        return res;
      }),
      removeAllListeners: jest.fn(),
      send: jest.fn(function(this: any, body: any) {
        this._body = body;
        return this;
      }),
      json: jest.fn(function(this: any, body: any) {
        this._body = body;
        return this;
      }),
      setHeader: jest.fn(),
      getHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      _body: null,
      _finishCallback: null
    };

    next = jest.fn();

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // БАЗОВЫЕ ТЕСТЫ
  // ============================================

  test('should call next', () => {
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should log request info', () => {
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('📝')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('test-request-id')
    );
  });

  test('should handle response finish', (done) => {
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    if (res._finishCallback) {
      res._finishCallback();
    }

    setTimeout(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('200')
      );
      done();
    }, 50);
  });

  // ============================================
  // ТЕСТЫ СТАТУСОВ
  // ============================================

  test('should log warnings for 4xx responses', (done) => {
    res.statusCode = 404;
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    if (res._finishCallback) {
      res._finishCallback();
    }

    setTimeout(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('⚠️')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('404')
      );
      done();
    }, 50);
  });

  test('should log errors for 5xx responses', (done) => {
    res.statusCode = 500;
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    if (res._finishCallback) {
      res._finishCallback();
    }

    setTimeout(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('500')
      );
      done();
    }, 50);
  });

  test('should log response body for 5xx errors', () => {
    res.statusCode = 500;
    const errorBody = { error: 'Internal server error' };
    
    const middleware = loggingMiddleware({ logResponseBody: true });
    middleware(req, res, next);
    
    // ✅ Вызываем json чтобы установить body
    res.json(errorBody);

    // ✅ Вызываем finish
    if (res._finishCallback) {
      res._finishCallback();
    }

    // ✅ Проверяем что второй вызов consoleErrorSpy содержит тело ответа
    // Первый вызов: "❌ [test-request-id] GET /test - 500 (0ms)"
    // Второй вызов: ("❌ [test-request-id] Response body:", {"error": "Internal server error"})
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('Response body:'),
      expect.objectContaining(errorBody)
    );
  });

  // ============================================
  // ТЕСТЫ С РАЗНЫМИ УРОВНЯМИ
  // ============================================

  test('should log debug level', (done) => {
    const middleware = loggingMiddleware({ level: 'debug' });
    middleware(req, res, next);

    setTimeout(() => {
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔍')
      );
      done();
    }, 50);
  });

  test('should include duration in log for debug level', (done) => {
    const middleware = loggingMiddleware({ level: 'debug' });
    middleware(req, res, next);

    if (res._finishCallback) {
      res._finishCallback();
    }

    setTimeout(() => {
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('📤')
      );
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('ms')
      );
      done();
    }, 50);
  });

  // ============================================
  // ТЕСТЫ ОБРАБОТКИ ОШИБОК
  // ============================================

  test('should handle missing on method', () => {
    const resWithoutOn = {
      statusCode: 200,
      send: jest.fn(),
      json: jest.fn()
    };
    const middleware = loggingMiddleware();
    middleware(req, resWithoutOn as any, next);

    expect(next).toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('should handle missing request headers', () => {
    req.headers = undefined;
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('should handle missing path', () => {
    req.path = undefined;
    req.url = undefined;
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('/')
    );
  });

  test('should handle missing ip', () => {
    req.ip = undefined;
    req.connection = undefined;
    
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('unknown')
    );
  });

  test('should generate requestId if not provided', () => {
    req.id = undefined;
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    expect(req.id).toBeDefined();
    expect(req.id).toMatch(/^req-\d+-[a-z0-9]+$/);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(req.id)
    );
  });

  // ============================================
  // ТЕСТЫ С ИНТЕРЦЕПЦИЕЙ ОТВЕТОВ
  // ============================================

  test('should intercept send method', () => {
    const originalSend = res.send;
    
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    const testBody = { data: 'test' };
    res.send(testBody);

    expect(originalSend).toHaveBeenCalledWith(testBody);
    expect(res._body).toBe(testBody);
  });

  test('should intercept json method', () => {
    const originalJson = res.json;
    
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    const testBody = { data: 'test' };
    res.json(testBody);

    expect(originalJson).toHaveBeenCalledWith(testBody);
    expect(res._body).toBe(testBody);
  });

  test('should handle multiple finish events without duplication', (done) => {
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    if (res._finishCallback) {
      res._finishCallback();
      res._finishCallback();
      res._finishCallback();
    }

    setTimeout(() => {
      const logCalls = consoleLogSpy.mock.calls.filter(
        call => call[0]?.includes('✅')
      );
      expect(logCalls.length).toBe(1);
      done();
    }, 50);
  });

  // ============================================
  // ТЕСТЫ С РАЗНЫМИ МЕТОДАМИ
  // ============================================

  test('should handle POST requests', () => {
    req.method = 'POST';
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('POST')
    );
  });

  test('should handle PUT requests', () => {
    req.method = 'PUT';
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('PUT')
    );
  });

  test('should handle DELETE requests', () => {
    req.method = 'DELETE';
    const middleware = loggingMiddleware();
    middleware(req, res, next);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('DELETE')
    );
  });

  // ============================================
  // ТЕСТЫ С КАСТОМНЫМИ ОПЦИЯМИ
  // ============================================

  test('should create middleware with custom options', () => {
    const middleware = loggingMiddleware({ level: 'debug' });
    expect(middleware).toBeDefined();
    expect(typeof middleware).toBe('function');
  });

  test('should use default options if none provided', () => {
    const middleware = loggingMiddleware();
    expect(middleware).toBeDefined();
    expect(typeof middleware).toBe('function');
  });

  // ============================================
  // ТЕСТЫ С createLoggingMiddleware
  // ============================================

  test('should create logging middleware with custom options', () => {
    const { createLoggingMiddleware } = require('../../../src/middleware/logging.middleware');
    const middleware = createLoggingMiddleware({ level: 'debug' });
    expect(middleware).toBeDefined();
    expect(typeof middleware).toBe('function');
  });
});