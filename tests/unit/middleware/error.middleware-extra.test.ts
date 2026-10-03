import { errorMiddleware } from '../../../src/middleware/error.middleware';

describe('Error Middleware - Extra Coverage', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      method: 'GET',
      path: '/test',
      url: '/test',
      ip: '127.0.0.1',
      requestId: 'test-request-id',
      headers: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };

    next = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // ============================================
  // Branch sides of message extraction
  // ============================================

  test('should fall back to Internal server error for Error with empty message', () => {
    const middleware = errorMiddleware();
    middleware(new Error(''), req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error',
        status: 500
      })
    );
  });

  test('should prefer message when err.error is not a string', () => {
    const middleware = errorMiddleware();
    middleware({ error: { code: 1 }, message: 'fallback message' }, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'fallback message' })
    );
  });

  test('should JSON.stringify object with non-string error field and no message', () => {
    const middleware = errorMiddleware();
    middleware({ error: 400 }, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: '{"error":400}' })
    );
  });

  test('should JSON.stringify object with empty string message', () => {
    const middleware = errorMiddleware();
    middleware({ message: '' }, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: '{"message":""}' })
    );
  });

  // ============================================
  // Thrown primitives
  // ============================================

  test('should stringify thrown number', () => {
    const middleware = errorMiddleware();
    middleware(42, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: '42', status: 500 })
    );
    expect(next).toHaveBeenCalled();
  });

  test('should stringify thrown boolean', () => {
    const middleware = errorMiddleware();
    middleware(true, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'true', status: 500 })
    );
  });

  test('should stringify thrown zero', () => {
    const middleware = errorMiddleware();
    middleware(0, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: '0', status: 500 })
    );
  });

  // ============================================
  // Object message extraction paths
  // ============================================

  test('should JSON.stringify plain object without message or error field', () => {
    const middleware = errorMiddleware();
    middleware({ code: 'E1' }, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: '{"code":"E1"}', status: 500 })
    );
  });

  test('should return Internal server error for circular object without message', () => {
    const error: any = { code: 'CIRCULAR' };
    error.self = error;

    const middleware = errorMiddleware();
    expect(() => middleware(error, req, res, next)).not.toThrow();

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Internal server error' })
    );
  });

  test('should JSON.stringify when custom toString returns an [object ...] string', () => {
    const middleware = errorMiddleware();
    middleware({ toString: () => '[object Thing]' }, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: '{}' })
    );
  });

  test('should JSON.stringify when custom toString returns an empty string', () => {
    const middleware = errorMiddleware();
    middleware({ toString: () => '' }, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: '{}' })
    );
  });

  test('should fall back to JSON.stringify when custom toString throws', () => {
    const error = {
      toString: () => {
        throw new Error('toString boom');
      }
    };

    const middleware = errorMiddleware();
    expect(() => middleware(error, req, res, next)).not.toThrow();

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: '{}' })
    );
  });

  test('should JSON.stringify object without a toString function', () => {
    const middleware = errorMiddleware();
    middleware(Object.create(null), req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: '{}' })
    );
  });

  // ============================================
  // Logging fallbacks
  // ============================================

  test('should log unknown path and method when req has neither', () => {
    const bareReq = { requestId: 'bare-request' };

    const middleware = errorMiddleware();
    middleware(new Error('missing fields'), bareReq, res, next);

    expect(console.error).toHaveBeenCalledWith(
      '❌ [bare-request] Error:',
      expect.objectContaining({
        path: 'unknown',
        method: 'unknown',
        ip: 'unknown'
      })
    );
  });

  // ============================================
  // Response send fallbacks
  // ============================================

  test('should fall back to res.send when res.json throws', () => {
    res.json.mockImplementation(() => {
      throw new Error('json broke');
    });

    const middleware = errorMiddleware();
    middleware(new Error('boom'), req, res, next);

    expect(res.send).toHaveBeenCalledWith('boom');
    expect(next).toHaveBeenCalled();
  });

  test('should not throw when both res.json and res.send fail', () => {
    res.json.mockImplementation(() => {
      throw new Error('json broke');
    });
    res.send.mockImplementation(() => {
      throw new Error('send broke');
    });

    const middleware = errorMiddleware();
    expect(() => middleware(new Error('boom'), req, res, next)).not.toThrow();
    expect(next).toHaveBeenCalled();
  });
});
