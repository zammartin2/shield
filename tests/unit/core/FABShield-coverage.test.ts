import { FABShield } from '../../../src/core/FABShield';

describe('FABShield - Branch Coverage', () => {
  let shield: FABShield | undefined;
  let mockReq: any;
  let mockRes: any;
  let nextFn: jest.Mock;

  const baseConfig = {
    env: 'test' as const,
    headers: { enabled: false },
    csp: { enabled: false },
    ai: { enabled: false },
    monitoring: { enabled: false },
    rateLimit: { enabled: false },
  };

  const createRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    getHeader: jest.fn(),
    removeHeader: jest.fn(),
    statusCode: 200,
    headersSent: false,
  });

  const create = (config: any = {}): FABShield => {
    shield = new FABShield({ ...baseConfig, ...config });
    return shield;
  };

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      url: '/test',
      path: '/test',
      headers: {},
      ip: '127.0.0.1',
      body: {},
      query: {},
      params: {},
    };
    mockRes = createRes();
    nextFn = jest.fn();
  });

  afterEach(() => {
    if (shield) {
      shield.destroy();
    }
    shield = undefined;
    jest.restoreAllMocks();
  });

  describe('middleware error path', () => {
    it('should respond 500 JSON when a stage throws', async () => {
      const s = create();
      jest.spyOn((s as any).headers, 'apply').mockRejectedValue(new Error('boom'));

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal server error',
          requestId: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it('should emit error event and record metrics when a stage throws', async () => {
      const s = create();
      const emitted: any[] = [];
      s.on('error', (...args) => emitted.push(args));
      const recordError = jest.spyOn((s as any).metrics, 'recordError');
      jest.spyOn((s as any).csp, 'apply').mockRejectedValue(new Error('csp fail'));

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(emitted).toHaveLength(1);
      expect(emitted[0][0]).toMatchObject({ message: 'csp fail' });
      expect(emitted[0][1]).toBe(mockReq);
      expect(emitted[0][2]).toBe(mockRes);
      expect(recordError).toHaveBeenCalledTimes(1);
      expect(recordError.mock.calls[0][0]).toMatchObject({ message: 'csp fail' });
      expect(s.getMetrics().errors).toBe(1);
    });

    it('should pass the error to next when headers were already sent', async () => {
      const s = create();
      mockRes.headersSent = true;
      jest.spyOn((s as any).headers, 'apply').mockRejectedValue(new Error('late failure'));

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith(expect.objectContaining({ message: 'late failure' }));
      expect(mockRes.status).not.toHaveBeenCalledWith(500);
    });

    it('should forward MiddlewareError to next instead of a 500', async () => {
      const s = create();
      const err: any = new Error('middleware specific');
      err.name = 'MiddlewareError';
      jest.spyOn((s as any).headers, 'apply').mockRejectedValue(err);

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledWith(err);
      expect(mockRes.status).not.toHaveBeenCalledWith(500);
    });

    it('should respond 500 when ai.analyze rejects', async () => {
      const s = create();
      jest.spyOn((s as any).ai, 'analyze').mockRejectedValue(new Error('ai down'));

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(nextFn).not.toHaveBeenCalled();
    });
  });

  describe('rate limiting', () => {
    const rateConfig = {
      rateLimit: { enabled: true, default: { max: 1, windowMs: 60000 } },
    };

    it('should pass the first request and block the second with 429', async () => {
      const s = create(rateConfig);
      const middleware = s.middleware();

      await middleware(mockReq, mockRes, nextFn);
      expect(nextFn).toHaveBeenCalledTimes(1);

      const res2 = createRes();
      const next2 = jest.fn();
      await middleware(mockReq, res2, next2);

      expect(next2).not.toHaveBeenCalled();
      expect(res2.status).toHaveBeenCalledWith(429);
      const body = res2.json.mock.calls[0][0];
      expect(body).toEqual(
        expect.objectContaining({
          error: 'Too many requests',
          requestId: expect.any(String),
          limit: 1,
          remaining: 0,
          retryAfter: expect.any(Number),
        })
      );
      expect(body.reset).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should compute a reset timestamp when the rate result has no reset', async () => {
      const s = create(rateConfig);
      jest.spyOn(s.getRateLimiter()!, 'check').mockResolvedValue({
        blocked: true,
        limit: 1,
        remaining: 0,
        retryAfter: 2,
        windowMs: 60000,
      });

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      const body = mockRes.json.mock.calls[0][0];
      expect(body.reset).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(body.retryAfter).toBe(2);
    });

    it('should return silently when blocked and headers were already sent', async () => {
      const s = create(rateConfig);
      mockRes.headersSent = true;
      jest.spyOn(s.getRateLimiter()!, 'check').mockResolvedValue({
        blocked: true,
        limit: 1,
        remaining: 0,
        retryAfter: 1,
        windowMs: 60000,
      });

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(nextFn).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('threat blocking', () => {
    it('should block an XSS payload with 403 when AI is enabled', async () => {
      const s = create({ ai: { enabled: true, blocking: { enabled: true } } });
      mockReq.body = { q: '<script>alert(1)</script>' };
      const detected: any[] = [];
      s.on('threat:detected', (e) => detected.push(e));

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      const body = mockRes.json.mock.calls[0][0];
      expect(body.error).toBe('Request blocked due to security threat');
      expect(body.requestId).toEqual(expect.any(String));
      expect(body.threatScore).toEqual(expect.any(Number));
      expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(body.threats[0]).toEqual(
        expect.objectContaining({ type: 'XSS', severity: 'high' })
      );
      expect(detected).toHaveLength(1);
      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should block an SQL injection payload with 403', async () => {
      const s = create({ ai: { enabled: true, blocking: { enabled: true } } });
      mockReq.body = { q: "1' OR 1=1 --" };

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      const body = mockRes.json.mock.calls[0][0];
      expect(body.threats[0]).toEqual(
        expect.objectContaining({ type: 'SQL Injection', severity: 'critical' })
      );
      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should fall back to 0.9 for missing threatScore and confidence', async () => {
      const s = create({ ai: { enabled: true } });
      jest.spyOn((s as any).ai, 'analyze').mockResolvedValue({
        threats: [{ type: 'XSS', severity: 'high' }],
      });

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      const body = mockRes.json.mock.calls[0][0];
      expect(body.threatScore).toBe(0.9);
      expect(body.threats[0].confidence).toBe(0.9);
    });

    it('should not block non-critical threats', async () => {
      const s = create({ ai: { enabled: true } });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const recordThreats = jest.spyOn((s as any).metrics, 'recordThreats');
      jest.spyOn((s as any).ai, 'analyze').mockResolvedValue({
        threats: [{ type: 'Anomaly', severity: 'medium', confidence: 0.6 }],
        threatScore: 0.4,
      });

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalledWith(403);
      expect(recordThreats).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        '⚠️',
        expect.stringContaining('threats')
      );
    });

    it('should return silently when a threat is detected after headers were sent', async () => {
      const s = create({ ai: { enabled: true } });
      mockRes.headersSent = true;
      jest.spyOn((s as any).ai, 'analyze').mockResolvedValue({
        threats: [{ type: 'XSS', severity: 'high' }],
        threatScore: 0.95,
      });

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should ignore malformed analysis without a threats array', async () => {
      const s = create({ ai: { enabled: true } });
      jest.spyOn((s as any).ai, 'analyze').mockResolvedValue({ threats: 'nope' });

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalledWith(403);
    });

    it('should continue when analysis is falsy', async () => {
      const s = create({ ai: { enabled: true } });
      jest.spyOn((s as any).ai, 'analyze').mockResolvedValue(null);

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(nextFn).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalledWith(403);
    });

    it('should return early when a plugin already answered the request', async () => {
      const s = create();
      s.registerPlugin({
        name: 'answerer',
        version: '1.0.0',
        middleware: (req, res, cb) => {
          res.headersSent = true;
          res.status(200).json({ ok: true });
          cb();
        },
      });

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(mockRes.json).toHaveBeenCalledWith({ ok: true });
      expect(nextFn).not.toHaveBeenCalled();
    });

    it('should return early when a plugin blocks via onRequest', async () => {
      const s = create();
      mockRes.json = jest.fn().mockImplementation(() => {
        mockRes.headersSent = true;
        return mockRes;
      });
      s.registerPlugin({
        name: 'blocker',
        version: '1.0.0',
        onRequest: async () => ({ block: true, status: 401, message: 'denied' }),
      });

      await s.middleware()(mockReq, mockRes, nextFn);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(nextFn).not.toHaveBeenCalled();
    });
  });

  describe('protect (Fastify guard)', () => {
    it('should resolve when the middleware completes', async () => {
      const s = create();
      await expect(s.protect(mockReq, mockRes)).resolves.toBeUndefined();
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Shield-Status', 'active');
    });

    it('should reject when the middleware forwards an error', async () => {
      const s = create();
      mockRes.headersSent = true;
      jest.spyOn((s as any).headers, 'apply').mockRejectedValue(new Error('hook failure'));

      await expect(s.protect(mockReq, mockRes)).rejects.toThrow('hook failure');
    });
  });

  describe('koa guard', () => {
    it('should call next without arguments on success', async () => {
      const s = create();
      const next = jest.fn();
      const ctx = { request: mockReq, response: mockRes };

      await s.koa(ctx, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('should forward middleware errors to next', async () => {
      const s = create();
      const err: any = new Error('koa failure');
      err.name = 'MiddlewareError';
      jest.spyOn((s as any).headers, 'apply').mockRejectedValue(err);
      const next = jest.fn();
      const ctx = { request: mockReq, response: mockRes };

      await s.koa(ctx, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('plugin and context API', () => {
    it('should default a missing plugin version to 1.0.0', () => {
      const s = create();
      jest.spyOn(s.getPluginManager(), 'register').mockImplementation(() => {});
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      const versions: any[] = [];
      s.on('plugin:registered', (d) => versions.push(d.version));

      s.registerPlugin({ name: 'no-version', middleware: jest.fn() } as any);

      expect(versions).toEqual([undefined]);
      expect(logSpy).toHaveBeenCalledWith(
        'ℹ️',
        expect.stringContaining('v1.0.0')
      );
    });

    it('should report inactive in generateReport when stopped', async () => {
      const s = create();
      s.stop();
      const report = await s.generateReport();
      expect(report.summary.status).toBe('inactive');
    });

    it('should report inactive in getStatus when stopped', () => {
      const s = create();
      s.stop();
      const status = s.getStatus();
      expect(status.status).toBe('inactive');
      expect(status.active).toBe(false);
    });

    it('should use a caller-provided report period', async () => {
      const s = create();
      const period = {
        from: '2020-01-01T00:00:00.000Z',
        to: '2020-01-02T00:00:00.000Z',
      };
      const report = await s.generateReport({ period });
      expect(report.period).toEqual(period);
    });

    it('should list registered plugins in the report', async () => {
      const s = create();
      s.registerPlugin({
        name: 'listed',
        version: '2.3.4',
        middleware: jest.fn(),
      });
      const report = await s.generateReport();
      expect(report.plugins).toEqual([
        { name: 'listed', version: '2.3.4', enabled: true },
      ]);
    });

    it('should reflect disabled modules in getStatus', () => {
      const s = create();
      const status = s.getStatus();
      expect(status.modules).toEqual({
        headers: false,
        csp: false,
        ai: false,
        rateLimit: false,
        monitoring: false,
      });
    });

    it('should return the full config from getConfig() without a module name', () => {
      const s = create({ name: 'ctx-shield' });
      const context = (s as any).createPluginContext(mockReq);
      expect(context.getConfig()).toEqual(s.getConfig());
      expect(context.getConfig().name).toBe('ctx-shield');
    });

    it('should fall back to req.server when req.app is missing', () => {
      const s = create();
      const server = { fake: true };
      const context = (s as any).createPluginContext({ server });
      expect(context.getServer()).toBe(server);
    });

    it('should fall back to logger.info for an unknown log level', () => {
      const s = create();
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      const context = (s as any).createPluginContext(mockReq);

      context.log('trace', 'fallback message');

      expect(logSpy).toHaveBeenCalledWith('ℹ️', 'fallback message', '');
    });

    it('should use a throwaway store for get/delete/getAll when none exists', async () => {
      const s = create();
      const context = (s as any).createPluginContext(mockReq);
      const storage = context.getStorage();

      expect(await storage.get('missing')).toBeUndefined();
      await expect(storage.delete('missing')).resolves.toBeUndefined();
      expect(await storage.getAll()).toEqual({});
      expect((mockReq as any).__shield_store).toBeUndefined();
    });

    it('should return false from utils.isURL for invalid urls', () => {
      const s = create();
      const context = (s as any).createPluginContext(mockReq);
      const utils = context.getUtils();
      expect(utils.isURL('not a url')).toBe(false);
      expect(utils.isURL('https://example.com')).toBe(true);
    });

    it('should not log route registration without req.app', () => {
      const s = create();
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      const context = (s as any).createPluginContext({});

      context.registerRoutes('/api', {});

      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateConfig rate limiter lifecycle', () => {
    it('should reset and remove the rate limiter when disabled', () => {
      const s = create({
        rateLimit: { enabled: true, default: { max: 5, windowMs: 60000 } },
      });
      const limiter = s.getRateLimiter()!;
      expect(limiter).not.toBeNull();
      const resetAll = jest.spyOn(limiter, 'resetAll');

      s.updateConfig({ rateLimit: { enabled: false } });

      expect(resetAll).toHaveBeenCalled();
      expect(s.getRateLimiter()).toBeNull();
    });

    it('should create a rate limiter when re-enabled', () => {
      const s = create();
      expect(s.getRateLimiter()).toBeNull();

      s.updateConfig({
        rateLimit: { enabled: true, default: { max: 10, windowMs: 60000 } },
      });

      expect(s.getRateLimiter()).not.toBeNull();
    });

    it('should keep the same limiter instance while staying enabled', () => {
      const s = create({
        rateLimit: { enabled: true, default: { max: 5, windowMs: 60000 } },
      });
      const limiter = s.getRateLimiter();

      s.updateConfig({
        rateLimit: { enabled: true, default: { max: 10, windowMs: 30000 } },
      });

      expect(s.getRateLimiter()).toBe(limiter);
    });
  });

  describe('destroy', () => {
    it('should reset an active rate limiter on destroy', () => {
      const s = create({
        rateLimit: { enabled: true, default: { max: 5, windowMs: 60000 } },
      });
      const limiter = s.getRateLimiter()!;
      const resetAll = jest.spyOn(limiter, 'resetAll');

      s.destroy();

      expect(resetAll).toHaveBeenCalled();
      expect(s.getRateLimiter()).toBeNull();
      shield = undefined;
    });
  });
});
