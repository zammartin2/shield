import { FABShield } from '../../../src/core/FABShield';
import { Request, Response, NextFunction } from 'express';
import pkg from '../../../package.json';

describe('FABShield - Core Coverage', () => {
  let shield: FABShield;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFn: NextFunction;

  beforeEach(() => {
    shield = new FABShield({
      env: 'test',
      headers: { enabled: false },
      csp: { enabled: false },
      ai: { enabled: false },
      monitoring: { enabled: false },
      rateLimit: { enabled: false },
    });

    mockReq = {
      method: 'GET',
      url: '/test',
      path: '/test',
      headers: {},
      ip: '127.0.0.1',
      body: {},
      query: {},
      params: {},
      get: jest.fn(),
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      getHeader: jest.fn(),
      removeHeader: jest.fn(),
      statusCode: 200,
      headersSent: false,
    };

    nextFn = jest.fn();
  });

  afterEach(() => {
    if (shield) {
      shield.destroy();
    }
    jest.restoreAllMocks();
  });

  // ============================================
  // LIFECYCLE
  // ============================================

  describe('isActive', () => {
    it('should return active state', () => {
      expect(shield.isActive()).toBe(true);
      shield.stop();
      expect(shield.isActive()).toBe(false);
      shield.start();
      expect(shield.isActive()).toBe(true);
    });
  });

  // ============================================
  // MIDDLEWARE ERROR HANDLING
  // ============================================

  describe('Middleware error handling', () => {
    it('should handle errors in middleware', () => {
      const middleware = shield.middleware();

      const errorReq = {
        ...mockReq,
        get: jest.fn().mockImplementation(() => {
          throw new Error('Test error');
        }),
      };

      expect(() => {
        middleware(errorReq as Request, mockRes as Response, nextFn);
      }).not.toThrow();
    });
  });

  // ============================================
  // AI PATTERNS
  // ============================================

  describe('AI engine patterns', () => {
    it('should expose command injection patterns', () => {
      const aiShield = new FABShield({
        ai: { enabled: true },
      });

      const aiModule = aiShield.getAIModule() as any;
      expect(aiModule.engine.COMMAND_INJECTION_PATTERNS).toBeDefined();
      expect(Array.isArray(aiModule.engine.COMMAND_INJECTION_PATTERNS)).toBe(true);

      aiShield.destroy();
    });

    it('should expose all security pattern sets', () => {
      const aiShield = new FABShield({
        ai: { enabled: true },
      });

      const aiModule = aiShield.getAIModule() as any;
      const patterns = [
        'SQL_PATTERNS',
        'XSS_PATTERNS',
        'PATH_TRAVERSAL_PATTERNS',
        'COMMAND_INJECTION_PATTERNS',
        'NOSQL_PATTERNS',
        'LDAP_PATTERNS',
      ];

      for (const name of patterns) {
        expect(aiModule.engine[name]).toBeDefined();
        expect(Array.isArray(aiModule.engine[name])).toBe(true);
        expect(aiModule.engine[name].length).toBeGreaterThan(0);
      }

      aiShield.destroy();
    });
  });

  // ============================================
  // RATE LIMITER
  // ============================================

  describe('Rate limiter', () => {
    it('should create rate limiter when enabled', () => {
      const rateShield = new FABShield({
        rateLimit: {
          enabled: true,
          default: { max: 1, windowMs: 1000 },
        },
      });

      const rateLimiter = rateShield.getRateLimiter();
      expect(rateLimiter).toBeDefined();

      rateShield.destroy();
    });
  });

  // ============================================
  // CONTEXT MANAGER
  // ============================================

  describe('ContextManager integration', () => {
    it('should return context stats', () => {
      const stats = shield.getContextStats();
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('total');
    });

    it('should create context and track it', () => {
      const context = shield.getContextManager();
      const ctx = context.create({
        ip: '127.0.0.1',
        method: 'GET',
        path: '/test',
      } as any);

      expect(ctx).toBeDefined();
      expect(ctx).toHaveProperty('id');
      expect(ctx).toHaveProperty('startTime');
    });
  });

  // ============================================
  // MODULE ACCESSORS (new in 1.3.8)
  // ============================================

  describe('Module accessors', () => {
    it('should expose HeadersModule via getHeadersModule', () => {
      const headersModule = shield.getHeadersModule();
      expect(headersModule).toBeDefined();
      expect(typeof headersModule.apply).toBe('function');
    });

    it('should expose CSPModule via getCSPModule', () => {
      const cspModule = shield.getCSPModule();
      expect(cspModule).toBeDefined();
      expect(typeof cspModule.apply).toBe('function');
    });

    it('should expose PluginManager via getPluginManager', () => {
      const pm = shield.getPluginManager();
      expect(pm).toBeDefined();
      expect(typeof pm.register).toBe('function');
    });
  });

  // ============================================
  // OTHER COMPONENTS
  // ============================================

  describe('Other components', () => {
    it('should get version', () => {
      // Version must match package.json — do not hardcode
      expect(shield.getVersion()).toBe(pkg.version);
    });

    it('should get config', () => {
      const config = shield.getConfig();
      expect(config).toBeDefined();
      expect(config.env).toBe('test');
    });

    it('should update config', () => {
      shield.updateConfig({ env: 'production' });
      const config = shield.getConfig();
      expect(config.env).toBe('production');
    });

    it('should get metrics', () => {
      const metrics = shield.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('threatsBlocked');
    });

    it('should generate report', async () => {
      const report = await shield.generateReport();
      expect(report).toBeDefined();
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('generatedAt');
      expect(report).toHaveProperty('summary');
      expect(report.summary).toHaveProperty('status', 'active');
    });

    it('should get status', () => {
      const status = shield.getStatus();
      expect(status).toBeDefined();
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('version', pkg.version);
      expect(status).toHaveProperty('active');
    });

    it('should reset metrics', () => {
      const before = shield.getMetrics();
      expect(before.totalRequests).toBe(0);

      shield.reset();

      const after = shield.getMetrics();
      expect(after.totalRequests).toBe(0);
    });
  });
});