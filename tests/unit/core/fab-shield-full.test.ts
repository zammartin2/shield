import { FABShield } from '../../../src/core/FABShield';
import { ShieldConfig, Plugin } from '../../../src/types';

describe('FABShield - Core Tests', () => {
  let shield: FABShield;

  afterEach(() => {
    if (shield) {
      shield.destroy();
    }
    jest.restoreAllMocks();
  });

  // ============================================
  // КОНСТРУКТОР
  // ============================================

  describe('Constructor', () => {
    it('should create with default config', () => {
      shield = new FABShield();
      
      expect(shield).toBeDefined();
      expect(shield.isActive()).toBe(true);
      expect(shield.getVersion()).toBe('1.1.0');
    });

    it('should create with custom config', () => {
      const config: Partial<ShieldConfig> = {
        env: 'production',
        headers: { enabled: false },
        csp: { enabled: false },
        ai: { enabled: false },
        monitoring: { enabled: false },
        rateLimit: { enabled: false }
      };
      
      shield = new FABShield(config);
      
      expect(shield).toBeDefined();
      expect(shield.isActive()).toBe(true);
      
      const shieldConfig = shield.getConfig();
      expect(shieldConfig.env).toBe('production');
    });

    it('should handle null config', () => {
      shield = new FABShield(null as any);
      expect(shield).toBeDefined();
      expect(shield.isActive()).toBe(true);
    });

    it('should setup rate limiter if enabled', () => {
      shield = new FABShield({
        rateLimit: { enabled: true, default: { max: 100, windowMs: 60000 } }
      });
      
      expect(shield.getRateLimiter()).toBeDefined();
    });

    it('should set singleton instance', () => {
      shield = new FABShield();
      const instance = FABShield.getInstance();
      expect(instance).toBe(shield);
    });
  });

  // ============================================
  // SINGLETON
  // ============================================

  describe('Singleton', () => {
    it('should return null if no instance', () => {
      const instance = FABShield.getInstance();
      expect(instance).toBeNull();
    });

    it('should return existing instance', () => {
      shield = new FABShield();
      const instance = FABShield.getInstance();
      expect(instance).toBe(shield);
    });
  });

  // ============================================
  // MIDDLEWARE
  // ============================================

  describe('Middleware', () => {
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
      mockReq = {
        method: 'GET',
        path: '/test',
        headers: {},
        ip: '127.0.0.1',
        body: {}
      };
      
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
        removeHeader: jest.fn(),
        statusCode: 200
      };
    });

    it('should return middleware function', () => {
      shield = new FABShield();
      const middleware = shield.middleware();
      
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });

    it('should execute middleware successfully', (done) => {
      shield = new FABShield({
        headers: { enabled: false },
        csp: { enabled: false },
        ai: { enabled: false },
        monitoring: { enabled: false },
        rateLimit: { enabled: false }
      });
      
      const middleware = shield.middleware();
      
      middleware(mockReq, mockRes, () => {
        expect(mockRes.setHeader).toHaveBeenCalled();
        done();
      });
    });

    it('should handle rate limiting', (done) => {
      shield = new FABShield({
        rateLimit: { enabled: true, default: { max: 1, windowMs: 60000 } }
      });
      
      const middleware = shield.middleware();
      
      middleware(mockReq, mockRes, () => {
        const req2 = { ...mockReq, ip: '127.0.0.1' };
        const res2 = { ...mockRes, status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
        
        middleware(req2, res2, () => {});
        
        setTimeout(() => {
          expect(res2.status).toHaveBeenCalledWith(429);
          done();
        }, 50);
      });
    });
  });

  // ============================================
  // GET METRICS
  // ============================================

  describe('getMetrics', () => {
    it('should return metrics', () => {
      shield = new FABShield();
      const metrics = shield.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('threatsBlocked');
    });
  });

  // ============================================
  // GET CONFIG
  // ============================================

  describe('getConfig', () => {
    it('should return config', () => {
      shield = new FABShield({ env: 'test' });
      const config = shield.getConfig();
      
      expect(config).toBeDefined();
      expect(config.env).toBe('test');
    });
  });

  // ============================================
  // UPDATE CONFIG
  // ============================================

  describe('updateConfig', () => {
    it('should update config', () => {
      shield = new FABShield();
      
      shield.updateConfig({ env: 'production' });
      const config = shield.getConfig();
      
      expect(config.env).toBe('production');
    });

    it('should emit config:updated event', (done) => {
      shield = new FABShield();
      
      shield.on('config:updated', (data) => {
        expect(data.old).toBeDefined();
        expect(data.new).toBeDefined();
        done();
      });
      
      shield.updateConfig({ env: 'production' });
    });
  });

  // ============================================
  // GET VERSION
  // ============================================

  describe('getVersion', () => {
    it('should return version', () => {
      shield = new FABShield();
      expect(shield.getVersion()).toBe('1.1.0');
    });
  });

  // ============================================
  // START / STOP
  // ============================================

  describe('start/stop', () => {
    it('should start shield', () => {
      shield = new FABShield();
      shield.stop();
      expect(shield.isActive()).toBe(false);
      
      shield.start();
      expect(shield.isActive()).toBe(true);
    });

    it('should stop shield', () => {
      shield = new FABShield();
      expect(shield.isActive()).toBe(true);
      
      shield.stop();
      expect(shield.isActive()).toBe(false);
    });
  });

  // ============================================
  // REGISTER PLUGIN
  // ============================================

  describe('registerPlugin', () => {
    it('should register plugin', () => {
      shield = new FABShield();
      
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        middleware: jest.fn()
      };
      
      shield.registerPlugin(plugin);
      
      const plugins = (shield as any).plugins.getPlugins();
      expect(plugins).toContain('test-plugin');
    });
  });

  // ============================================
  // UNREGISTER PLUGIN
  // ============================================

  describe('unregisterPlugin', () => {
    it('should unregister plugin', () => {
      shield = new FABShield();
      
      const plugin: Plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        middleware: jest.fn()
      };
      
      shield.registerPlugin(plugin);
      shield.unregisterPlugin('test-plugin');
      
      const plugins = (shield as any).plugins.getPlugins();
      expect(plugins).not.toContain('test-plugin');
    });
  });

  // ============================================
  // EXPORT METRICS
  // ============================================

  describe('exportMetrics', () => {
    it('should export metrics as JSON', () => {
      shield = new FABShield();
      const result = shield.exportMetrics('json');
      
      expect(typeof result).toBe('string');
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should default to JSON', () => {
      shield = new FABShield();
      const result = shield.exportMetrics();
      
      expect(typeof result).toBe('string');
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  // ============================================
  // GENERATE REPORT
  // ============================================

  describe('generateReport', () => {
    it('should generate report', async () => {
      shield = new FABShield();
      const report = await shield.generateReport();
      
      expect(report).toBeDefined();
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('generatedAt');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('plugins');
    });
  });

  // ============================================
  // GET STATUS
  // ============================================

  describe('getStatus', () => {
    it('should return status', () => {
      shield = new FABShield();
      const status = shield.getStatus();
      
      expect(status).toBeDefined();
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('version');
      expect(status).toHaveProperty('uptime');
      expect(status).toHaveProperty('active');
      expect(status).toHaveProperty('modules');
    });
  });

  // ============================================
  // RESET
  // ============================================

  describe('reset', () => {
    it('should reset metrics', () => {
      shield = new FABShield();
      
      const before = shield.getMetrics();
      expect(before.totalRequests).toBe(0);
      
      shield.reset();
      
      const reset = shield.getMetrics();
      expect(reset.totalRequests).toBe(0);
    });
  });

  // ============================================
  // GETTERS
  // ============================================

  describe('Getters', () => {
    it('should get context manager', () => {
      shield = new FABShield();
      const manager = shield.getContextManager();
      
      expect(manager).toBeDefined();
    });

    it('should get plugin manager', () => {
      shield = new FABShield();
      const manager = shield.getPluginManager();
      
      expect(manager).toBeDefined();
    });

    it('should get AI module', () => {
      shield = new FABShield();
      const ai = shield.getAIModule();
      
      expect(ai).toBeDefined();
    });

    it('should get rate limiter', () => {
      shield = new FABShield({
        rateLimit: { enabled: true, default: { max: 100, windowMs: 60000 } }
      });
      
      const rateLimiter = shield.getRateLimiter();
      expect(rateLimiter).toBeDefined();
    });
  });

  // ============================================
  // DESTROY
  // ============================================

  describe('destroy', () => {
    it('should destroy instance', () => {
      shield = new FABShield();
      
      shield.destroy();
      
      expect(shield.isActive()).toBe(false);
      expect(FABShield.getInstance()).toBeNull();
    });
  });

  // ============================================
  // GET CONTEXT STATS
  // ============================================

  describe('getContextStats', () => {
    it('should return context stats', () => {
      shield = new FABShield();
      const stats = shield.getContextStats();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('max');
    });
  });
});