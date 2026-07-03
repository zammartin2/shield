import { ConfigManager } from '../../../src/core/ConfigManager';
import { defaultConfig } from '../../../src/types';

// Мокаем fs и path
jest.mock('fs');
jest.mock('path');

import fs from 'fs';
import path from 'path';

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  let mockFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    mockFs = fs as jest.Mocked<typeof fs>;
    mockFs.existsSync.mockReturnValue(false);
    mockFs.readFileSync.mockReturnValue('{}');
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.watch.mockReturnValue({
      close: jest.fn(),
      on: jest.fn()
    } as any);
    
    (path.extname as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath.endsWith('.json')) return '.json';
      if (filePath.endsWith('.js')) return '.js';
      if (filePath.endsWith('.cjs')) return '.cjs';
      if (filePath.endsWith('.mjs')) return '.mjs';
      return '';
    });
  });

  afterEach(() => {
    if (configManager) {
      configManager.destroy();
    }
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      configManager = new ConfigManager();
      expect(configManager).toBeInstanceOf(ConfigManager);
      const config = configManager.get();
      expect(config).toHaveProperty('env');
      expect(config).toHaveProperty('headers');
      expect(config).toHaveProperty('csp');
      expect(config).toHaveProperty('ai');
      expect(config).toHaveProperty('rateLimit');
      expect(config).toHaveProperty('monitoring');
      expect(config).toHaveProperty('logging');
    });

    it('should create instance with custom config', () => {
      const customConfig = { env: 'production' as const, enabled: true, name: 'custom-shield' };
      configManager = new ConfigManager(customConfig);
      const config = configManager.get();
      expect(config.env).toBe('production');
      expect(config.enabled).toBe(true);
      expect(config.name).toBe('custom-shield');
    });

    it('should load config from file if exists', () => {
      const fileConfig = { env: 'test', name: 'file-config' };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(fileConfig));
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      expect(mockFs.readFileSync).toHaveBeenCalled();
      expect(configManager.get().env).toBe('test');
    });

    it('should handle invalid file config gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => { throw new Error('File read error'); });
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should load config from environment variables', () => {
      process.env.NODE_ENV = 'test';
      process.env.SHIELD_ENABLED = 'true';
      process.env.SHIELD_NAME = 'env-shield';
      configManager = new ConfigManager();
      const config = configManager.get();
      expect(config.env).toBe('test');
      expect(config.name).toBe('env-shield');
      delete process.env.NODE_ENV;
      delete process.env.SHIELD_ENABLED;
      delete process.env.SHIELD_NAME;
    });

    it('should watch file if watch option is true', () => {
      mockFs.existsSync.mockReturnValue(true);
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json', watch: true });
      expect(mockFs.watch).toHaveBeenCalled();
    });

    it('should emit initialized event', () => {
      // Подписываемся ДО создания экземпляра
      const callback = jest.fn();
      
      // Используем прототип для перехвата события
      const originalEmit = ConfigManager.prototype.emit;
      ConfigManager.prototype.emit = jest.fn(function(event: string, ...args: any[]) {
        if (event === 'initialized') {
          callback(...args);
        }
        return originalEmit.call(this, event, ...args);
      });
      
      configManager = new ConfigManager();
      
      expect(callback).toHaveBeenCalledWith(expect.any(Object));
      
      // Восстанавливаем оригинальный метод
      ConfigManager.prototype.emit = originalEmit;
    });
  });

  describe('get', () => {
    it('should return full config', () => {
      configManager = new ConfigManager({ env: 'development' });
      const config = configManager.get();
      expect(config).toBeDefined();
      expect(config.env).toBe('development');
    });

    it('should return a copy of config', () => {
      configManager = new ConfigManager();
      const config1 = configManager.get();
      const config2 = configManager.get();
      expect(config1).toEqual(config2);
      expect(Object.keys(config1)).toEqual(Object.keys(config2));
    });
  });

  describe('getModule', () => {
    it('should get module config', () => {
      configManager = new ConfigManager({ headers: { enabled: true, hsts: { maxAge: 31536000 } } });
      const headers = configManager.getModule('headers');
      expect(headers).toBeDefined();
      expect(headers?.enabled).toBe(true);
      expect(headers?.hsts?.maxAge).toBe(31536000);
    });

    it('should return undefined for non-existent module', () => {
      configManager = new ConfigManager();
      const module = configManager.getModule('nonExistent' as any);
      expect(module).toBeUndefined();
    });
  });

  describe('getPath', () => {
    it('should get value by path', () => {
      configManager = new ConfigManager({ headers: { hsts: { maxAge: 31536000 } } });
      const value = configManager.getPath('headers.hsts.maxAge');
      expect(value).toBe(31536000);
    });

    it('should return defaultValue if path not found', () => {
      configManager = new ConfigManager();
      const value = configManager.getPath('non.existent.path', 'default');
      expect(value).toBe('default');
    });

    it('should return undefined if path not found and no default', () => {
      configManager = new ConfigManager();
      const value = configManager.getPath('non.existent.path');
      expect(value).toBeUndefined();
    });
  });

  describe('hasPath', () => {
    it('should return true if path exists', () => {
      configManager = new ConfigManager({ headers: { enabled: true } });
      expect(configManager.hasPath('headers.enabled')).toBe(true);
    });

    it('should return false if path not exists', () => {
      configManager = new ConfigManager();
      expect(configManager.hasPath('non.existent.path')).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return true if module enabled', () => {
      configManager = new ConfigManager({ headers: { enabled: true } });
      expect(configManager.isEnabled('headers')).toBe(true);
    });

    it('should return false if module disabled', () => {
      configManager = new ConfigManager({ headers: { enabled: false } });
      expect(configManager.isEnabled('headers')).toBe(false);
    });

    it('should return false if module not found', () => {
      configManager = new ConfigManager();
      expect(configManager.isEnabled('nonExistent' as any)).toBe(false);
    });
  });

  describe('isEnabledPath', () => {
    it('should return true if path value is true', () => {
      configManager = new ConfigManager({ headers: { enabled: true } });
      expect(configManager.isEnabledPath('headers.enabled')).toBe(true);
    });

    it('should return false if path value is false', () => {
      configManager = new ConfigManager({ headers: { enabled: false } });
      expect(configManager.isEnabledPath('headers.enabled')).toBe(false);
    });

    it('should return false if path not found', () => {
      configManager = new ConfigManager();
      expect(configManager.isEnabledPath('non.existent')).toBe(false);
    });
  });

  describe('update', () => {
    it('should update config', () => {
      configManager = new ConfigManager({ env: 'development' });
      configManager.update({ env: 'production', name: 'updated' });
      const config = configManager.get();
      expect(config.env).toBe('production');
      expect(config.name).toBe('updated');
    });

    it('should emit update event', (done) => {
      configManager = new ConfigManager();
      configManager.on('update', (data) => {
        expect(data.old).toBeDefined();
        expect(data.new).toBeDefined();
        expect(data.new.env).toBe('production');
        done();
      });
      configManager.update({ env: 'production' });
    });

    it('should notify watchers', () => {
      configManager = new ConfigManager();
      const callback = jest.fn();
      configManager.onUpdate(callback);
      configManager.update({ name: 'test' });
      expect(callback).toHaveBeenCalled();
    });

    it('should save to file if configPath exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      configManager.update({ name: 'updated' });
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('updatePath', () => {
    it('should update value by path', () => {
      configManager = new ConfigManager({ headers: { hsts: { maxAge: 31536000 } } });
      configManager.updatePath('headers.hsts.maxAge', 604800);
      const value = configManager.getPath('headers.hsts.maxAge');
      expect(value).toBe(604800);
    });

    it('should emit updatePath event', (done) => {
      configManager = new ConfigManager();
      configManager.on('updatePath', (data) => {
        expect(data.path).toBe('test.path');
        expect(data.newValue).toBe('new-value');
        done();
      });
      configManager.updatePath('test.path', 'new-value');
    });

    it('should save to file if configPath exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      configManager.updatePath('test.path', 'value');
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('deletePath', () => {
    it('should delete value by path', () => {
      configManager = new ConfigManager({ headers: { hsts: { maxAge: 31536000, preload: true } } });
      configManager.deletePath('headers.hsts.preload');
      expect(configManager.hasPath('headers.hsts.preload')).toBe(false);
      expect(configManager.hasPath('headers.hsts.maxAge')).toBe(true);
    });

    it('should emit deletePath event', (done) => {
      configManager = new ConfigManager({ test: { path: 'value' } });
      configManager.on('deletePath', (data) => {
        expect(data.path).toBe('test.path');
        expect(data.oldValue).toBe('value');
        done();
      });
      configManager.deletePath('test.path');
    });

    it('should save to file if configPath exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      configManager.deletePath('test.path');
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset to default config', () => {
      configManager = new ConfigManager({ env: 'production', name: 'custom' });
      configManager.reset();
      const config = configManager.get();
      expect(config.env).toBe(defaultConfig.env);
      expect(config.name).toBe(defaultConfig.name);
    });

    it('should emit reset event', (done) => {
      configManager = new ConfigManager();
      configManager.on('reset', (config) => {
        expect(config).toBeDefined();
        done();
      });
      configManager.reset();
    });

    it('should save to file if configPath exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      configManager.reset();
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('onUpdate', () => {
    it('should register callback', () => {
      configManager = new ConfigManager();
      const callback = jest.fn();
      const unsubscribe = configManager.onUpdate(callback);
      configManager.update({ name: 'test' });
      expect(callback).toHaveBeenCalled();
      unsubscribe();
      configManager.update({ name: 'test2' });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle callback errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      configManager = new ConfigManager();
      const callback = jest.fn().mockImplementation(() => { throw new Error('Callback error'); });
      configManager.onUpdate(callback);
      expect(() => { configManager.update({ name: 'test' }); }).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('registerEnvMapping', () => {
    it('should register environment variable mapping', () => {
      configManager = new ConfigManager();
      const mapping = { CUSTOM_VAR: { path: 'custom.path', type: 'string' as const } };
      process.env.CUSTOM_VAR = 'custom-value';
      configManager.registerEnvMapping(mapping);
      expect(configManager.getPath('custom.path')).toBe('custom-value');
      delete process.env.CUSTOM_VAR;
    });

    it('should handle number type conversion', () => {
      configManager = new ConfigManager();
      const mapping = { NUM_VAR: { path: 'custom.number', type: 'number' as const } };
      process.env.NUM_VAR = '123';
      configManager.registerEnvMapping(mapping);
      expect(configManager.getPath('custom.number')).toBe(123);
      delete process.env.NUM_VAR;
    });

    it('should handle boolean type conversion', () => {
      configManager = new ConfigManager();
      const mapping = { BOOL_VAR: { path: 'custom.bool', type: 'boolean' as const } };
      process.env.BOOL_VAR = 'true';
      configManager.registerEnvMapping(mapping);
      expect(configManager.getPath('custom.bool')).toBe(true);
      delete process.env.BOOL_VAR;
    });

    it('should handle JSON type conversion', () => {
      configManager = new ConfigManager();
      const mapping = { JSON_VAR: { path: 'custom.json', type: 'json' as const } };
      process.env.JSON_VAR = '{"key":"value"}';
      configManager.registerEnvMapping(mapping);
      expect(configManager.getPath('custom.json')).toEqual({ key: 'value' });
      delete process.env.JSON_VAR;
    });

    it('should handle transform function', () => {
      configManager = new ConfigManager();
      const mapping = { TRANSFORM_VAR: { path: 'custom.transform', type: 'string' as const, transform: (value: string) => value.toUpperCase() } };
      process.env.TRANSFORM_VAR = 'test';
      configManager.registerEnvMapping(mapping);
      expect(configManager.getPath('custom.transform')).toBe('TEST');
      delete process.env.TRANSFORM_VAR;
    });

    it('should use default value if env not set', () => {
      configManager = new ConfigManager();
      const mapping = { MISSING_VAR: { path: 'custom.default', type: 'string' as const, default: 'default-value' } };
      configManager.registerEnvMapping(mapping);
      expect(configManager.getPath('custom.default')).toBe('default-value');
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      configManager = new ConfigManager({ env: 'test', name: 'test' });
      const json = configManager.toJSON();
      expect(json).toEqual(expect.objectContaining({ env: 'test', name: 'test' }));
    });

    it('should return a copy', () => {
      configManager = new ConfigManager();
      const json1 = configManager.toJSON();
      const json2 = configManager.toJSON();
      expect(json1).not.toBe(json2);
      expect(json1).toEqual(json2);
    });
  });

  describe('getSchema', () => {
    it('should return config schema', () => {
      configManager = new ConfigManager();
      const schema = configManager.getSchema();
      expect(schema).toHaveProperty('type', 'object');
      expect(schema).toHaveProperty('properties');
      expect(schema.properties).toHaveProperty('env');
      expect(schema.properties).toHaveProperty('enabled');
      expect(schema.properties).toHaveProperty('name');
      expect(schema.properties).toHaveProperty('headers');
    });
  });

  describe('stopWatching', () => {
    it('should stop watching file', () => {
      mockFs.existsSync.mockReturnValue(true);
      const closeMock = jest.fn();
      mockFs.watch.mockReturnValue({ close: closeMock, on: jest.fn() } as any);
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json', watch: true });
      configManager.stopWatching();
      expect(closeMock).toHaveBeenCalled();
    });

    it('should handle if no watcher exists', () => {
      configManager = new ConfigManager();
      expect(() => { configManager.stopWatching(); }).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('should destroy manager', () => {
      configManager = new ConfigManager();
      const callback = jest.fn();
      configManager.onUpdate(callback);
      configManager.destroy();
      expect(configManager.listenerCount('initialized')).toBe(0);
      expect(configManager.listenerCount('update')).toBe(0);
      expect(configManager.listenerCount('reset')).toBe(0);
    });

    it('should stop watching on destroy', () => {
      mockFs.existsSync.mockReturnValue(true);
      const closeMock = jest.fn();
      mockFs.watch.mockReturnValue({ close: closeMock, on: jest.fn() } as any);
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json', watch: true });
      configManager.destroy();
      expect(closeMock).toHaveBeenCalled();
    });
  });

  describe('clone', () => {
    it('should clone config', () => {
      configManager = new ConfigManager({ env: 'test', name: 'test' });
      const clone = configManager.clone();
      expect(clone).not.toBe(configManager.get());
      expect(clone).toEqual(configManager.get());
    });
  });

  describe('getKeys', () => {
    it('should return all config keys', () => {
      configManager = new ConfigManager();
      const keys = configManager.getKeys();
      expect(keys).toContain('env');
      expect(keys).toContain('headers');
      expect(keys).toContain('csp');
      expect(keys).toContain('ai');
      expect(keys).toContain('monitoring');
      expect(keys).toContain('rateLimit');
      expect(keys).toContain('logging');
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
    });
  });

  describe('hasModule', () => {
    it('should return true if module exists', () => {
      configManager = new ConfigManager();
      expect(configManager.hasModule('headers')).toBe(true);
      expect(configManager.hasModule('csp')).toBe(true);
    });

    it('should return false if module not exists', () => {
      configManager = new ConfigManager();
      expect(configManager.hasModule('nonExistent' as any)).toBe(false);
    });
  });

  describe('validation', () => {
    it('should throw error for invalid HSTS maxAge', () => {
      expect(() => { configManager = new ConfigManager({ headers: { hsts: { maxAge: -1 } } }); })
        .toThrow('HSTS maxAge must be a positive number');
    });

    it('should throw error for invalid rate limit max', () => {
      expect(() => { configManager = new ConfigManager({ rateLimit: { default: { max: 0, windowMs: 60000 } } }); })
        .toThrow('Rate limit max must be at least 1');
    });

    it('should throw error for invalid rate limit windowMs', () => {
      expect(() => { configManager = new ConfigManager({ rateLimit: { default: { max: 10, windowMs: 500 } } }); })
        .toThrow('Rate limit windowMs must be at least 1000ms');
    });

    it('should throw error for invalid log level', () => {
      expect(() => { configManager = new ConfigManager({ logging: { level: 'invalid' as any } }); })
        .toThrow('Invalid log level: invalid');
    });

    it('should throw error for invalid environment', () => {
      expect(() => { configManager = new ConfigManager({ env: 'invalid' as any }); })
        .toThrow('Invalid environment: invalid');
    });
  });

  describe('integration', () => {
    it('should handle full config lifecycle', () => {
      configManager = new ConfigManager({ env: 'development' });
      configManager.update({ name: 'test-shield' });
      expect(configManager.get().name).toBe('test-shield');
      configManager.updatePath('headers.hsts.maxAge', 604800);
      expect(configManager.getPath('headers.hsts.maxAge')).toBe(604800);
      configManager.deletePath('headers.hsts.preload');
      expect(configManager.hasPath('headers.hsts.preload')).toBe(false);
      configManager.reset();
      expect(configManager.get().name).toBe(defaultConfig.name);
    });

    it('should handle multiple watchers', () => {
      configManager = new ConfigManager();
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      configManager.onUpdate(callback1);
      configManager.onUpdate(callback2);
      configManager.update({ name: 'test' });
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });
});
