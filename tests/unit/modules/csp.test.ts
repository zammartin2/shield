import { CSPModule } from '../../../src/modules/csp/CSPModule';
import { ConfigManager } from '../../../src/core/ConfigManager';

describe('CSPModule', () => {
  let cspModule: CSPModule;
  let mockConfig: ConfigManager;
  let mockRes: any;

  beforeEach(() => {
    mockConfig = {
      getModule: jest.fn()
    } as any;

    cspModule = new CSPModule(mockConfig);
    mockRes = {
      setHeader: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // КОНСТРУКТОР
  // ============================================

  describe('constructor', () => {
    it('should create instance successfully', () => {
      expect(cspModule).toBeInstanceOf(CSPModule);
    });

    it('should store config reference', () => {
      expect((cspModule as any).config).toBe(mockConfig);
    });
  });

  // ============================================
  // APPLY
  // ============================================

  describe('apply', () => {
    it('should not set CSP header when disabled', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: false });
      
      await cspModule.apply({}, mockRes);
      
      expect(mockRes.setHeader).not.toHaveBeenCalled();
    });

    it('should not set CSP header when config is null', async () => {
      mockConfig.getModule.mockReturnValue(null);
      
      await cspModule.apply({}, mockRes);
      
      expect(mockRes.setHeader).not.toHaveBeenCalled();
    });

    it('should set default CSP header when enabled', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      
      await cspModule.apply({}, mockRes);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining("default-src 'self'")
      );
    });

    it('should use custom directives from config', async () => {
      const customDirectives = {
        'default-src': ["'self'", 'https:'],
        'script-src': ["'self'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"]
      };
      
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        directives: customDirectives
      });
      
      await cspModule.apply({}, mockRes);
      
      const expectedCsp = "default-src 'self' https:; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'";
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expectedCsp
      );
    });

    it('should include trusted CDNs in script-src and style-src', async () => {
      const trustedCDNs = ['https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'];
      
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        trustedCDNs
      });
      
      await cspModule.apply({}, mockRes);
      
      const cspHeader = mockRes.setHeader.mock.calls[0][1];
      expect(cspHeader).toContain('https://cdn.jsdelivr.net');
      expect(cspHeader).toContain('https://cdnjs.cloudflare.com');
    });

    it('should handle empty trustedCDNs', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        trustedCDNs: []
      });
      
      await cspModule.apply({}, mockRes);
      
      expect(mockRes.setHeader).toHaveBeenCalled();
    });

    it('should handle null trustedCDNs', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        trustedCDNs: null
      });
      
      await cspModule.apply({}, mockRes);
      
      expect(mockRes.setHeader).toHaveBeenCalled();
    });

    it('should skip directives with empty arrays', async () => {
      const directives = {
        'default-src': ["'self'"],
        'script-src': [],
        'style-src': ["'self'"]
      };
      
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        directives
      });
      
      await cspModule.apply({}, mockRes);
      
      const cspHeader = mockRes.setHeader.mock.calls[0][1];
      expect(cspHeader).not.toContain('script-src');
    });

    it('should handle directives with multiple values', async () => {
      const directives = {
        'img-src': ["'self'", 'data:', 'https:', 'http:']
      };
      
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        directives
      });
      
      await cspModule.apply({}, mockRes);
      
      const cspHeader = mockRes.setHeader.mock.calls[0][1];
      expect(cspHeader).toContain("img-src 'self' data: https: http:");
    });

    it('should handle case where script-src is missing', async () => {
      const directives = {
        'default-src': ["'self'"],
        'style-src': ["'self'"]
      };
      
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        directives
      });
      
      await cspModule.apply({}, mockRes);
      
      const cspHeader = mockRes.setHeader.mock.calls[0][1];
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("style-src 'self'");
    });
  });

  // ============================================
  // GENERATE NONCE
  // ============================================

  describe('generateNonce', () => {
    it('should generate nonce with default length', () => {
      const nonce = cspModule.generateNonce();
      
      expect(nonce).toBeDefined();
      expect(nonce.length).toBe(32);
      expect(nonce).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate nonce with custom length', () => {
      const lengths = [8, 16, 24, 32, 64];
      
      for (const len of lengths) {
        const nonce = cspModule.generateNonce(len);
        expect(nonce.length).toBe(len);
        expect(nonce).toMatch(/^[A-Za-z0-9]+$/);
      }
    });

    it('should generate different nonces', () => {
      const nonce1 = cspModule.generateNonce();
      const nonce2 = cspModule.generateNonce();
      
      expect(nonce1).not.toBe(nonce2);
    });

    it('should generate nonce with length 1', () => {
      const nonce = cspModule.generateNonce(1);
      expect(nonce.length).toBe(1);
      expect(nonce).toMatch(/^[A-Za-z0-9]$/);
    });

    it('should generate nonce with length 100', () => {
      const nonce = cspModule.generateNonce(100);
      expect(nonce.length).toBe(100);
      expect(nonce).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should only contain alphanumeric characters', () => {
      const nonce = cspModule.generateNonce(100);
      expect(nonce).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  // ============================================
  // ИНТЕГРАЦИОННЫЕ ТЕСТЫ
  // ============================================

  describe('integration', () => {
    it('should apply CSP with custom config and CDNs', async () => {
      const directives = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-eval'"],
        'style-src': ["'self'"],
        'img-src': ["'self'", 'data:']
      };
      
      const trustedCDNs = ['https://cdn.jsdelivr.net'];
      
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        directives,
        trustedCDNs
      });
      
      await cspModule.apply({}, mockRes);
      
      const cspHeader = mockRes.setHeader.mock.calls[0][1];
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net");
      expect(cspHeader).toContain("style-src 'self' https://cdn.jsdelivr.net");
      expect(cspHeader).toContain("img-src 'self' data:");
    });

    it('should handle disabled CSP with custom config', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: false,
        directives: {
          'default-src': ["'none'"]
        }
      });
      
      await cspModule.apply({}, mockRes);
      
      expect(mockRes.setHeader).not.toHaveBeenCalled();
    });

    it('should handle apply called multiple times', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      
      await cspModule.apply({}, mockRes);
      await cspModule.apply({}, mockRes);
      
      expect(mockRes.setHeader).toHaveBeenCalledTimes(2);
    });

    it('should generate nonce and use in CSP', async () => {
      const nonce = cspModule.generateNonce();
      const directives = {
        'script-src': ["'self'", `'nonce-${nonce}'`]
      };
      
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        directives
      });
      
      await cspModule.apply({}, mockRes);
      
      const cspHeader = mockRes.setHeader.mock.calls[0][1];
      expect(cspHeader).toContain(`'nonce-${nonce}'`);
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================

  describe('edge cases', () => {
    it('should handle very long directive values', async () => {
      const longValue = 'a'.repeat(1000);
      const directives = {
        'default-src': ["'self'", longValue]
      };
      
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        directives
      });
      
      await cspModule.apply({}, mockRes);
      
      const cspHeader = mockRes.setHeader.mock.calls[0][1];
      expect(cspHeader).toContain(longValue);
    });

    it('should handle many directives', async () => {
      const directives: any = {};
      for (let i = 0; i < 20; i++) {
        directives[`directive-${i}`] = ["'self'"];
      }
      
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        directives
      });
      
      await cspModule.apply({}, mockRes);
      
      const cspHeader = mockRes.setHeader.mock.calls[0][1];
      for (let i = 0; i < 20; i++) {
        expect(cspHeader).toContain(`directive-${i}`);
      }
    });
  });
});
