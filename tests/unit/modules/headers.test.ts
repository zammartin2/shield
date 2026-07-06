import { HeadersModule } from '../../../src/modules/headers/HeadersModule';
import { ConfigManager } from '../../../src/core/ConfigManager';

describe('HeadersModule', () => {
  let headersModule: HeadersModule;
  let mockConfig: ConfigManager;
  let mockRes: any;

  beforeEach(() => {
    mockConfig = {
      getModule: jest.fn()
    } as any;

    headersModule = new HeadersModule(mockConfig);
    mockRes = {
      setHeader: jest.fn(),
      removeHeader: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance successfully', () => {
      expect(headersModule).toBeInstanceOf(HeadersModule);
    });

    it('should store config reference', () => {
      expect((headersModule as any).config).toBe(mockConfig);
    });
  });

  describe('apply', () => {
    it('should not set headers when disabled', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: false });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).not.toHaveBeenCalled();
    });

    it('should not set headers when config is null', async () => {
      mockConfig.getModule.mockReturnValue(null);

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).not.toHaveBeenCalled();
    });

    it('should set default headers when enabled', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });

      await headersModule.apply({}, mockRes);

      // Проверяем основные заголовки (без CSP, так как он теперь в CSPModule)
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-DNS-Prefetch-Control', 'off');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Download-Options', 'noopen');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Permitted-Cross-Domain-Policies', 'none');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Origin-Agent-Cluster', '?1');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cross-Origin-Opener-Policy', 'same-origin');
      // CSP не проверяем, так как он теперь в CSPModule
    });

    it('should set custom HSTS config', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        hsts: {
          maxAge: 86400,
          includeSubDomains: false,
          preload: false
        }
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=86400'
      );
    });

    it('should set custom X-Frame-Options', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        xFrame: {
          action: 'SAMEORIGIN'
        }
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'SAMEORIGIN');
    });

    it('should skip X-Content-Type-Options when disabled', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        xContentTypeOptions: false
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).not.toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    });

    it('should skip X-XSS-Protection when disabled', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        xXssProtection: false
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).not.toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    });

    it('should set custom Referrer-Policy', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        referrerPolicy: {
          enabled: true,
          policy: 'no-referrer'
        }
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'no-referrer');
    });

    it('should skip X-DNS-Prefetch-Control when disabled', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        xDnsPrefetchControl: false
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).not.toHaveBeenCalledWith('X-DNS-Prefetch-Control', 'off');
    });

    it('should skip X-Download-Options when disabled', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        xDownloadOptions: false
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).not.toHaveBeenCalledWith('X-Download-Options', 'noopen');
    });

    it('should skip X-Permitted-Cross-Domain-Policies when disabled', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        xPermittedCrossDomainPolicies: false
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).not.toHaveBeenCalledWith('X-Permitted-Cross-Domain-Policies', 'none');
    });

    it('should remove X-Powered-By', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });

      await headersModule.apply({}, mockRes);

      expect(mockRes.removeHeader).toHaveBeenCalledWith('X-Powered-By');
      expect(mockRes.removeHeader).toHaveBeenCalledWith('Server');
    });

    it('should set Cross-Origin headers', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        crossOrigin: {
          embedder: 'require-corp',
          opener: 'same-origin-allow-popups',
          resource: 'cross-origin'
        }
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Cross-Origin-Embedder-Policy', 'require-corp');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cross-Origin-Resource-Policy', 'cross-origin');
    });

    it('should set custom headers', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        custom: {
          'X-Custom-Header': 'custom-value',
          'X-Another-Header': 'another-value'
        }
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Custom-Header', 'custom-value');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Another-Header', 'another-value');
    });

    it('should remove disabled headers', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        disabled: ['X-Custom-Header', 'X-Another-Header']
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.removeHeader).toHaveBeenCalledWith('X-Custom-Header');
      expect(mockRes.removeHeader).toHaveBeenCalledWith('X-Another-Header');
    });

    it('should handle disabled array as non-array', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        disabled: 'X-Custom-Header' as any
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalled();
    });
  });

  describe('getActiveHeaders', () => {
    it('should return empty object when disabled', () => {
      mockConfig.getModule.mockReturnValue({ enabled: false });

      const result = headersModule.getActiveHeaders();

      expect(result).toEqual({});
    });

    it('should return empty object when config is null', () => {
      mockConfig.getModule.mockReturnValue(null);

      const result = headersModule.getActiveHeaders();

      expect(result).toEqual({});
    });

    it('should return default headers when enabled', () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });

      const result = headersModule.getActiveHeaders();

      expect(result['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains; preload');
      expect(result['X-Frame-Options']).toBe('DENY');
      expect(result['X-Content-Type-Options']).toBe('nosniff');
      expect(result['X-XSS-Protection']).toBe('1; mode=block');
      expect(result['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(result['X-DNS-Prefetch-Control']).toBe('off');
      expect(result['X-Download-Options']).toBe('noopen');
      expect(result['X-Permitted-Cross-Domain-Policies']).toBe('none');
      expect(result['Origin-Agent-Cluster']).toBe('?1');
      expect(result['Permissions-Policy']).toBe('geolocation=(), microphone=(), camera=()');
      expect(result['Cross-Origin-Opener-Policy']).toBe('same-origin');
      // CSP не проверяем, так как он теперь в CSPModule
    });

    it('should include custom headers', () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        custom: {
          'X-Custom-Header': 'custom-value',
          'X-Another': 'another'
        }
      });

      const result = headersModule.getActiveHeaders();

      expect(result['X-Custom-Header']).toBe('custom-value');
      expect(result['X-Another']).toBe('another');
    });

    it('should handle custom headers as non-object', () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        custom: null
      });

      const result = headersModule.getActiveHeaders();

      expect(result).toHaveProperty('Strict-Transport-Security');
    });
  });

  describe('integration', () => {
    it('should apply all headers correctly', async () => {
      mockConfig.getModule.mockReturnValue({
        enabled: true,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        },
        xFrame: {
          action: 'DENY'
        },
        crossOrigin: {
          opener: 'same-origin'
        }
      });

      await headersModule.apply({}, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cross-Origin-Opener-Policy', 'same-origin');
    });

    it('should handle apply called multiple times', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });

      await headersModule.apply({}, mockRes);
      await headersModule.apply({}, mockRes);

      // 11 заголовков * 2 вызова = 22
      expect(mockRes.setHeader).toHaveBeenCalledTimes(22);
    });
  });
});
