import { FABShield } from '../../../src/core/FABShield';

describe('FABShield Core', () => {
  let shield: FABShield;

  beforeEach(() => {
    shield = new FABShield({
      env: 'test',
      headers: { enabled: true },
      csp: { enabled: false },
      ai: { enabled: false },
      monitoring: { enabled: false }
    });
  });

  test('should create instance', () => {
    expect(shield).toBeDefined();
    expect(shield.isActive()).toBe(true);
  });

  test('should get version', () => {
    const version = shield.getVersion();
    expect(version).toBeDefined();
    expect(typeof version).toBe('string');
  });

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

  test('should get metrics', () => {
    const metrics = shield.getMetrics();
    expect(metrics).toBeDefined();
    expect(metrics).toHaveProperty('totalRequests');
    expect(metrics).toHaveProperty('threatsBlocked');
  });

  test('should handle middleware', () => {
    const middleware = shield.middleware();
    expect(middleware).toBeDefined();
    expect(typeof middleware).toBe('function');
  });
});
