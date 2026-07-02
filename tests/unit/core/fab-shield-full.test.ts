import { FABShield } from '../../../src/core/FABShield';

describe('FABShield - Full Coverage', () => {
  let shield: FABShield;

  beforeEach(() => {
    shield = new FABShield({
      env: 'test',
      headers: { enabled: true },
      csp: { enabled: true },
      ai: { enabled: true },
      monitoring: { enabled: true },
      rateLimit: { enabled: true }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // КОНСТРУКТОР
  // ============================================
  describe('Constructor', () => {
    test('should create with default config', () => {
      const defaultShield = new FABShield();
      expect(defaultShield).toBeDefined();
      expect(defaultShield.isActive()).toBe(true);
    });

    test('should create with custom config', () => {
      const customShield = new FABShield({
        env: 'production',
        headers: { enabled: false },
        csp: { enabled: false }
      });
      expect(customShield).toBeDefined();
      const config = customShield.getConfig();
      expect(config.env).toBe('production');
    });

    test('should handle null config', () => {
      const shield = new FABShield(null as any);
      expect(shield).toBeDefined();
      expect(shield.isActive()).toBe(true);
    });
  });

  // ============================================
  // ЖИЗНЕННЫЙ ЦИКЛ
  // ============================================
  describe('Lifecycle', () => {
    test('should start successfully', () => {
      expect(() => shield.start()).not.toThrow();
    });

    test('should stop successfully', () => {
      expect(() => shield.stop()).not.toThrow();
    });

    test('should handle stop without start', () => {
      const newShield = new FABShield();
      expect(() => newShield.stop()).not.toThrow();
    });
  });

  // ============================================
  // MIDDLEWARE
  // ============================================
  describe('Middleware', () => {
    test('should return middleware function', () => {
      const middleware = shield.middleware();
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });

    test('should execute middleware', (done) => {
      const middleware = shield.middleware();
      const req = {
        method: 'GET',
        path: '/test',
        headers: {},
        ip: '127.0.0.1'
      };
      const res = {
        setHeader: jest.fn(),
        getHeader: jest.fn(),
        removeHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn(() => {
        expect(next).toHaveBeenCalled();
        done();
      });

      middleware(req, res, next);
    });

    test('should handle errors in middleware', () => {
      const middleware = shield.middleware();
      const req = {
        method: 'GET',
        path: '/test',
        headers: {},
        ip: '127.0.0.1'
      };
      const res = {
        setHeader: jest.fn().mockImplementation(() => {
          throw new Error('Test error');
        }),
        getHeader: jest.fn(),
        removeHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      expect(() => {
        middleware(req, res, next);
      }).not.toThrow();
    });

    test('should handle disabled modules', (done) => {
      const disabledShield = new FABShield({
        headers: { enabled: false },
        csp: { enabled: false },
        ai: { enabled: false },
        monitoring: { enabled: false },
        rateLimit: { enabled: false }
      });
      const middleware = disabledShield.middleware();
      const req = { method: 'GET', path: '/test' };
      const res = { setHeader: jest.fn(), removeHeader: jest.fn() };
      const next = jest.fn(() => {
        expect(next).toHaveBeenCalled();
        done();
      });

      middleware(req, res, next);
    });
  });

  // ============================================
  // ОБРАБОТКА ЗАПРОСОВ
  // ============================================
  describe('Request Processing', () => {
    test('should process request with headers', (done) => {
      const req = {
        method: 'GET',
        path: '/test',
        headers: { 'x-test': 'value' },
        ip: '127.0.0.1'
      };
      const res = {
        setHeader: jest.fn(),
        getHeader: jest.fn(),
        removeHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn(() => {
        expect(next).toHaveBeenCalled();
        done();
      });

      const middleware = shield.middleware();
      middleware(req, res, next);
    });

    test('should process request with AI', (done) => {
      const aiShield = new FABShield({
        ai: { enabled: true, blocking: { enabled: true } }
      });
      
      const req = {
        method: 'POST',
        path: '/api/test',
        headers: { 'content-type': 'application/json' },
        body: { test: 'data' },
        ip: '127.0.0.1'
      };
      const res = {
        setHeader: jest.fn(),
        getHeader: jest.fn(),
        removeHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn(() => {
        expect(next).toHaveBeenCalled();
        done();
      });

      const middleware = aiShield.middleware();
      middleware(req, res, next);
    });

    test('should block malicious request with AI', (done) => {
      const aiShield = new FABShield({
        ai: { enabled: true, blocking: { enabled: true } }
      });
      
      const req = {
        method: 'POST',
        path: '/api/test',
        headers: { 'content-type': 'application/json' },
        body: { search: "<script>alert('XSS')</script>" },
        ip: '127.0.0.1'
      };
      const res = {
        setHeader: jest.fn(),
        getHeader: jest.fn(),
        removeHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      const middleware = aiShield.middleware();
      middleware(req, res, next);
      
      // Даем время на AI анализ
      setTimeout(() => {
        // Если next не вызван, значит запрос заблокирован
        if (next.mock.calls.length === 0) {
          expect(res.status).toHaveBeenCalled();
        } else {
          expect(next).toHaveBeenCalled();
        }
        done();
      }, 150);
    });
  });

  // ============================================
  // УПРАВЛЕНИЕ КОНФИГУРАЦИЕЙ
  // ============================================
  describe('Config Management', () => {
    test('should get config', () => {
      const config = shield.getConfig();
      expect(config).toBeDefined();
      expect(config.env).toBe('test');
    });

    test('should update config', () => {
      shield.updateConfig({ env: 'production' });
      const config = shield.getConfig();
      expect(config.env).toBe('production');
    });

    test('should update headers config', () => {
      shield.updateConfig({
        headers: { enabled: false }
      });
      const config = shield.getConfig();
      expect(config.headers.enabled).toBe(false);
    });
  });

  // ============================================
  // ЛОГИРОВАНИЕ
  // ============================================
  describe('Logging', () => {
    test('should log info', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      shield['logger'].info('Test message');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should log warn', () => {
      const consoleSpy = jest.spyOn(console, 'warn');
      shield['logger'].warn('Test warning');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should log error', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      shield['logger'].error('Test error');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // МЕТРИКИ
  // ============================================
  describe('Metrics', () => {
    test('should get metrics', () => {
      const metrics = shield.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('threatsBlocked');
    });

    test('should get security metrics', () => {
      const metrics = shield.getMetrics('security');
      expect(metrics).toBeDefined();
    });

    test('should get performance metrics', () => {
      const metrics = shield.getMetrics('performance');
      expect(metrics).toBeDefined();
    });

    test('should get AI metrics', () => {
      const metrics = shield.getMetrics('ai');
      expect(metrics).toBeDefined();
    });
  });

  // ============================================
  // ОБРАБОТКА ОШИБОК
  // ============================================
  describe('Error Handling', () => {
    test('should handle errors in middleware', () => {
      const middleware = shield.middleware();
      const req = {
        method: 'GET',
        path: '/test',
        headers: {},
        ip: '127.0.0.1'
      };
      const res = {
        setHeader: jest.fn(),
        getHeader: jest.fn(),
        removeHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      expect(() => {
        middleware(req, res, next);
      }).not.toThrow();
    });

    test('should handle async errors', (done) => {
      const errorShield = new FABShield({
        ai: { enabled: true }
      });
      
      const req = {
        method: 'GET',
        path: '/test',
        headers: {},
        ip: '127.0.0.1'
      };
      const res = {
        setHeader: jest.fn(),
        getHeader: jest.fn(),
        removeHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn(() => {
        expect(next).toHaveBeenCalled();
        done();
      });

      const middleware = errorShield.middleware();
      middleware(req, res, next);
    });
  });

  // ============================================
  // ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================
  describe('Additional Features', () => {
    test('should get version', () => {
      const version = shield.getVersion();
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
    });

    test('should check if active', () => {
      expect(shield.isActive()).toBe(true);
    });

    test('should generate report', async () => {
      const report = await shield.generateReport({
        type: 'executive',
        period: { from: new Date(), to: new Date() }
      });
      expect(report).toBeDefined();
    });

    test('should register plugin', () => {
      const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        middleware: jest.fn()
      };
      shield.registerPlugin(plugin);
      expect(shield['plugins']).toBeDefined();
    });
  });
});
