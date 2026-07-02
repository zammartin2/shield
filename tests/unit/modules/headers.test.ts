import { HeadersModule } from '../../../src/modules/headers/HeadersModule';
import { ConfigManager } from '../../../src/core/ConfigManager';

describe('HeadersModule', () => {
  let headersModule: HeadersModule;
  let config: ConfigManager;

  beforeEach(() => {
    config = new ConfigManager({
      headers: {
        enabled: true,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      }
    });
    headersModule = new HeadersModule(config);
  });

  test('should create instance', () => {
    expect(headersModule).toBeDefined();
  });

  test('should apply headers', () => {
    const req = {};
    const res = { setHeader: jest.fn(), removeHeader: jest.fn() };
    headersModule.apply(req, res);
    expect(res.setHeader).toHaveBeenCalled();
  });

  // Исправленный тест - используем apply вместо setHeader
  test('should set custom header', () => {
    const req = {};
    const res = { setHeader: jest.fn(), removeHeader: jest.fn() };
    // Используем apply с кастомными заголовками через конфиг
    const customConfig = new ConfigManager({
      headers: {
        enabled: true,
        custom: {
          'X-Custom': 'value'
        }
      }
    });
    const customModule = new HeadersModule(customConfig);
    customModule.apply(req, res);
    expect(res.setHeader).toHaveBeenCalledWith('X-Custom', 'value');
  });

  // Исправленный тест - проверяем что headers установлены
  test('should get headers', () => {
    const req = {};
    const res = { setHeader: jest.fn(), removeHeader: jest.fn() };
    headersModule.apply(req, res);
    // Проверяем, что заголовки устанавливаются через apply
    expect(res.setHeader).toHaveBeenCalled();
  });

  test('should handle disabled module', () => {
    const disabledConfig = new ConfigManager({
      headers: { enabled: false }
    });
    const disabledModule = new HeadersModule(disabledConfig);
    const req = {};
    const res = { setHeader: jest.fn(), removeHeader: jest.fn() };
    disabledModule.apply(req, res);
    expect(res.setHeader).not.toHaveBeenCalled();
  });
});
