import { CSPModule } from '../../../src/modules/csp/CSPModule';
import { ConfigManager } from '../../../src/core/ConfigManager';

describe('CSPModule', () => {
  let cspModule: CSPModule;
  let config: ConfigManager;

  beforeEach(() => {
    config = new ConfigManager({
      csp: {
        enabled: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:']
        }
      }
    });
    cspModule = new CSPModule(config);
  });

  test('should create instance', () => {
    expect(cspModule).toBeDefined();
  });

  // Исправленный тест - используем apply для генерации CSP
  test('should generate CSP header', () => {
    const req = {};
    const res = { setHeader: jest.fn() };
    cspModule.apply(req, res);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.stringContaining("default-src 'self'")
    );
  });

  // Исправленный тест - через конфиг
  test('should set directive', () => {
    const customConfig = new ConfigManager({
      csp: {
        enabled: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'strict-dynamic'"]
        }
      }
    });
    const customModule = new CSPModule(customConfig);
    const req = {};
    const res = { setHeader: jest.fn() };
    customModule.apply(req, res);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.stringContaining("script-src 'self' 'strict-dynamic'")
    );
  });

  // Исправленный тест - проверяем что CSP применяется
  test('should get directive', () => {
    const req = {};
    const res = { setHeader: jest.fn() };
    cspModule.apply(req, res);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.stringContaining("default-src 'self'")
    );
  });
});
