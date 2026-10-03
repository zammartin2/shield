import { ConfigManager } from '../../../src/core/ConfigManager';
import { defaultConfig } from '../../../src/types';

jest.mock('fs');
jest.mock('path');

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

describe('ConfigManager - Branch Coverage', () => {
  let configManager: ConfigManager;
  let mockFs: jest.Mocked<typeof fs>;
  const prevNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.NODE_ENV = 'test';
    mockFs = fs as jest.Mocked<typeof fs>;
    mockFs.existsSync.mockReturnValue(false);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({}));
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.watch.mockReturnValue({
      close: jest.fn(),
      on: jest.fn()
    } as any);
    mockFs.statSync.mockReturnValue({ size: 1024 } as any);
    mockFs.accessSync.mockImplementation(() => {});
    mockFs.realpathSync.mockImplementation((filePath) => filePath);
    mockFs.copyFileSync.mockImplementation(() => {});

    (path.extname as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath.endsWith('.json')) return '.json';
      if (filePath.endsWith('.js')) return '.js';
      if (filePath.endsWith('.cjs')) return '.cjs';
      if (filePath.endsWith('.mjs')) return '.mjs';
      return '';
    });

    (path.resolve as jest.Mock).mockImplementation((filePath: string) => filePath);
  });

  afterEach(() => {
    if (configManager) {
      configManager.destroy();
    }
    configManager = undefined as any;
    jest.restoreAllMocks();
    process.env.NODE_ENV = prevNodeEnv;
    for (const key of [
      'SHIELD_ENABLED', 'SHIELD_NAME', 'SHIELD_HEADERS', 'SHIELD_CSP',
      'SHIELD_AI', 'SHIELD_MONITORING', 'RATE_LIMIT_MAX',
      'RATE_LIMIT_WINDOW', 'RATE_LIMIT_ENABLED', 'LOG_LEVEL', 'LOG_FORMAT',
      'HSTS_MAX_AGE', 'HSTS_INCLUDE_SUBDOMAINS', 'HSTS_PRELOAD'
    ]) {
      delete process.env[key];
    }
  });

  describe('validateConfigFile', () => {
    it('should throw when path is undefined', () => {
      configManager = new ConfigManager();
      expect(() => (configManager as any).validateConfigFile(undefined)).toThrow(
        'Security: Config file path is required'
      );
    });

    it('should reject a .js config file during load', () => {
      mockFs.existsSync.mockReturnValue(true);
      expect(() => {
        configManager = new ConfigManager({}, { configPath: '/path/to/config.js' });
      }).toThrow('Only .json config files are allowed');
    });

    it('should reject a .mjs extension', () => {
      configManager = new ConfigManager();
      expect(() => (configManager as any).validateConfigFile('/path/to/config.mjs')).toThrow(
        'Only .json config files are allowed'
      );
    });

    it('should reject a path containing path traversal', () => {
      mockFs.existsSync.mockReturnValue(true);
      expect(() => {
        configManager = new ConfigManager({}, { configPath: '/home/user/../config.json' });
      }).toThrow('Path traversal is forbidden in config path');
    });

    it('should reject a path under /etc', () => {
      mockFs.existsSync.mockReturnValue(true);
      expect(() => {
        configManager = new ConfigManager({}, { configPath: '/etc/fab-shield.json' });
      }).toThrow('Access to system directories is forbidden');
    });

    it('should reject a Windows system path', () => {
      configManager = new ConfigManager();
      expect(() => (configManager as any).validateConfigFile('C:/Windows/config.json')).toThrow(
        'Access to system directories is forbidden'
      );
    });

    it('should skip stat and access checks when the file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      configManager = new ConfigManager({}, { configPath: '/missing/config.json' });
      expect(mockFs.statSync).not.toHaveBeenCalled();
      expect(mockFs.accessSync).not.toHaveBeenCalled();
      expect(configManager.get().name).toBe(defaultConfig.name);
    });

    it('should throw when config file exceeds 10MB in dev env', () => {
      process.env.NODE_ENV = 'development';
      configManager = new ConfigManager();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ size: 11 * 1024 * 1024 } as any);
      expect(() => (configManager as any).validateConfigFile('/path/to/config.json')).toThrow(
        'Config file too large'
      );
    });

    it('should warn and continue when config file exceeds 10MB in test env', () => {
      configManager = new ConfigManager();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ size: 11 * 1024 * 1024 } as any);
      expect(() => (configManager as any).validateConfigFile('/path/to/config.json')).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Size check skipped')
      );
    });

    it('should rethrow accessSync failure in dev env', () => {
      process.env.NODE_ENV = 'development';
      configManager = new ConfigManager();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });
      expect(() => (configManager as any).validateConfigFile('/path/to/config.json')).toThrow(
        'EACCES'
      );
    });

    it('should warn and continue on accessSync failure in test env', () => {
      configManager = new ConfigManager();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });
      expect(() => (configManager as any).validateConfigFile('/path/to/config.json')).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Readability check skipped')
      );
    });

    it('should reject a symlinked config path in dev env', () => {
      process.env.NODE_ENV = 'development';
      configManager = new ConfigManager();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.realpathSync.mockReturnValue('/real/location/config.json');
      expect(() => (configManager as any).validateConfigFile('/path/to/config.json')).toThrow(
        'Symlinks in config path are not allowed'
      );
    });

    it('should accept a valid config file in dev env', () => {
      process.env.NODE_ENV = 'development';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ name: 'dev-config' }));
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      expect(configManager.get().name).toBe('dev-config');
    });

    it('should return false from safeFileExists when existsSync throws', () => {
      configManager = new ConfigManager();
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('EACCES');
      });
      expect((configManager as any).safeFileExists('/path/to/config.json')).toBe(false);
    });
  });

  describe('loadFromFile', () => {
    it('should return {} for an empty file', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('');
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      expect(configManager.get().name).toBe(defaultConfig.name);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should return {} for a whitespace-only file', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('  \n\t ');
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      expect(configManager.get().name).toBe(defaultConfig.name);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should reject raw text containing a constructor key', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{"constructor": {"prototype": {"x": 1}}}');
      expect(() => {
        configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      }).toThrow('Dangerous key detected in config');
    });

    it('should reject raw text containing a prototype key', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{"name": "x", "prototype": 1}');
      expect(() => {
        configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      }).toThrow('Dangerous key detected in config');
    });

    it('should fall back to defaults when the file is missing (ENOENT)', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw Object.assign(new Error('ENOENT: no such file or directory'), {
          code: 'ENOENT'
        });
      });
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Config file not found, using default')
      );
      expect(configManager.get().name).toBe(defaultConfig.name);
    });

    it('should wrap invalid JSON in a security error message', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('not valid json');
      expect(() => {
        configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      }).toThrow('Invalid JSON in config file');
    });

    it('should reject a non-json extension that slips past validation', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{"name":"x"}');
      // validateConfigFile видит .json, сам loadFromFile — уже нет (защита в глубину)
      let extCalls = 0;
      (path.extname as jest.Mock).mockImplementation(() => (++extCalls === 1 ? '.json' : '.yaml'));

      expect(() => {
        configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      }).toThrow('Unsupported config format');
    });

    it('should stringify a non-Error value thrown while reading the config', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockFs.existsSync.mockReturnValue(true);
      const raw = { code: 'EWEIRD', payload: 1 };
      mockFs.readFileSync.mockImplementation(() => {
        throw raw;
      });

      let thrown: unknown;
      try {
        configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toEqual(raw);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('saveToFile and sanitizeConfig', () => {
    const buildWithPath = () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ name: 'initial' }));
      return new ConfigManager({}, { configPath: '/path/to/config.json' });
    };

    it('should warn and skip save for a non-json target in test env', () => {
      configManager = buildWithPath();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      let extCalls = 0;
      (path.extname as jest.Mock).mockImplementation(() => (++extCalls === 1 ? '.json' : '.js'));

      configManager.update({ name: 'updated' });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save config (test environment)'),
        expect.any(Error)
      );
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should throw for a non-json target in dev env', () => {
      process.env.NODE_ENV = 'development';
      configManager = buildWithPath();
      let extCalls = 0;
      (path.extname as jest.Mock).mockImplementation(() => (++extCalls === 1 ? '.json' : '.js'));

      expect(() => configManager.update({ name: 'updated' })).toThrow(
        'Cannot save to .js files'
      );
    });

    it('should swallow writeFileSync failure in test env', () => {
      configManager = buildWithPath();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('disk full');
      });

      expect(() => configManager.update({ name: 'updated' })).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save config (test environment)'),
        expect.any(Error)
      );
      expect(configManager.get().name).toBe('updated');
    });

    it('should rethrow writeFileSync failure in dev env', () => {
      process.env.NODE_ENV = 'development';
      configManager = buildWithPath();
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('disk full');
      });

      expect(() => configManager.update({ name: 'updated' })).toThrow('disk full');
    });

    it('should warn when backup creation fails but still save', () => {
      configManager = buildWithPath();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockFs.copyFileSync.mockImplementation(() => {
        throw new Error('backup failed');
      });

      configManager.update({ name: 'updated' });

      expect(warnSpy).toHaveBeenCalledWith(
        '⚠️ Failed to create backup:',
        expect.objectContaining({ message: 'backup failed' })
      );
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    });

    it('should skip save when the file does not exist in test env', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ name: 'initial' }));
      configManager = new ConfigManager({}, { configPath: '/path/to/config.json' });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      configManager.update({ name: 'updated' });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Config file not found, skipping save')
      );
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should pass null through sanitizeConfig unchanged', () => {
      configManager = new ConfigManager();
      expect((configManager as any).sanitizeConfig(null)).toBeNull();
    });

    it('should pass undefined through sanitizeConfig unchanged', () => {
      configManager = new ConfigManager();
      expect((configManager as any).sanitizeConfig(undefined)).toBeUndefined();
    });

    it('should strip dangerous keys on save', () => {
      configManager = new ConfigManager();
      const sanitized = (configManager as any).sanitizeConfig({
        name: 'ok',
        constructor: 'evil',
        prototype: 'evil'
      });
      expect(sanitized).toEqual({ name: 'ok' });
    });

    it('should strip function-valued keys on save', () => {
      configManager = new ConfigManager();
      const sanitized = (configManager as any).sanitizeConfig({
        name: 'ok',
        evil: () => 'payload'
      });
      expect(sanitized).toEqual({ name: 'ok' });
      expect(Object.keys(sanitized)).toEqual(['name']);
    });
  });

  describe('prototype pollution guards', () => {
    it('should reject a parsed object with an own __proto__ key', () => {
      const parsed = JSON.parse('{"__proto__": {"polluted": true}}');
      expect(() => new ConfigManager(parsed)).toThrow('__proto__ pollution detected');
    });

    it('should reject an own constructor key in the user config', () => {
      expect(() => new ConfigManager({ constructor: 1 } as any)).toThrow(
        'Dangerous key "constructor" detected in config at config'
      );
    });

    it('should reject a nested prototype key with its location', () => {
      expect(() => new ConfigManager({ ai: { prototype: 1 } } as any)).toThrow(
        'Dangerous key "prototype" detected in config at config.ai'
      );
    });

    it('should reject an object with a replaced prototype and no dangerous own keys', () => {
      expect(() =>
        new ConfigManager({ __proto__: { polluted: true } } as any)
      ).toThrow('__proto__ pollution detected');
    });

    it('should reject __proto__ as an updatePath segment', () => {
      configManager = new ConfigManager();
      expect(() => configManager.updatePath('__proto__', 'x')).toThrow(
        '__proto__ pollution detected'
      );
    });

    it('should reject a constructor segment in updatePath', () => {
      configManager = new ConfigManager();
      expect(() => configManager.updatePath('headers.constructor.x', 1)).toThrow(
        'Dangerous path segment "constructor" detected in config path'
      );
    });

    it('should rethrow security errors from json env mappings', () => {
      configManager = new ConfigManager();
      process.env.JSON_POLLUTED = '{"__proto__": {"polluted": true}}';
      expect(() =>
        configManager.registerEnvMapping({
          JSON_POLLUTED: { path: 'custom.polluted', type: 'json' as const }
        })
      ).toThrow('__proto__ pollution detected');
      delete process.env.JSON_POLLUTED;
    });

    it('should reject dangerous keys passed to update', () => {
      configManager = new ConfigManager();
      expect(() => configManager.update({ constructor: 1 } as any)).toThrow(
        'Dangerous key "constructor" detected in config at newConfig'
      );
    });

    it('should no-op when the checked value is null or undefined', () => {
      configManager = new ConfigManager();
      // без второго аргумента — заодно покрываем default-параметр location
      expect(() =>
        (configManager as any).assertSafeConfigValue(null)
      ).not.toThrow();
      expect(() =>
        (configManager as any).assertSafeConfigValue(undefined)
      ).not.toThrow();
    });
  });

  describe('watch and reload', () => {
    it('should ignore change events when there is no config path', () => {
      configManager = new ConfigManager();
      expect(() => (configManager as any).handleConfigChange()).not.toThrow();
    });

    it('should warn and not create a watcher when the file is missing', () => {
      configManager = new ConfigManager();
      mockFs.existsSync.mockReturnValue(false);
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      (configManager as any).configPath = '/missing/config.json';

      (configManager as any).watchFile();

      expect(warnSpy).toHaveBeenCalledWith(
        '⚠️ Config file not found, cannot watch: /missing/config.json'
      );
      expect(mockFs.watch).not.toHaveBeenCalled();
    });

    it('should not create a second watcher while already watching', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({}));
      configManager = new ConfigManager(
        {},
        { configPath: '/path/to/config.json', watch: true }
      );
      expect(mockFs.watch).toHaveBeenCalledTimes(1);

      (configManager as any).watchFile();

      expect(mockFs.watch).toHaveBeenCalledTimes(1);
    });

    it('should log watcher error events', () => {
      const onMock = jest.fn();
      mockFs.watch.mockReturnValue({ close: jest.fn(), on: onMock } as any);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({}));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      configManager = new ConfigManager(
        {},
        { configPath: '/path/to/config.json', watch: true }
      );

      const errorHandler = onMock.mock.calls.find((c) => c[0] === 'error')?.[1];
      expect(errorHandler).toBeDefined();
      errorHandler(new Error('watcher exploded'));

      expect(errorSpy).toHaveBeenCalledWith(
        '❌ fs.watch error:',
        expect.objectContaining({ message: 'watcher exploded' })
      );
    });

    it('should warn when fs.watch itself fails', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({}));
      mockFs.watch.mockImplementation(() => {
        throw new Error('watch unavailable');
      });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      configManager = new ConfigManager(
        {},
        { configPath: '/path/to/config.json', watch: true }
      );

      expect(warnSpy).toHaveBeenCalledWith(
        '⚠️ Failed to watch config file:',
        expect.objectContaining({ message: 'watch unavailable' })
      );
    });

    it('should warn when the file disappears mid-watch', () => {
      let changeCallback: any;
      mockFs.watch.mockImplementation((_p: string, callback: any) => {
        changeCallback = callback;
        return { close: jest.fn(), on: jest.fn() };
      });
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ name: 'initial' }));
      configManager = new ConfigManager(
        {},
        { configPath: '/path/to/config.json', watch: true }
      );

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockFs.existsSync.mockReturnValue(false);
      changeCallback('change');

      expect(warnSpy).toHaveBeenCalledWith(
        '⚠️ Config file disappeared: /path/to/config.json'
      );
    });

    it('should log and emit error when reload fails', () => {
      let changeCallback: any;
      mockFs.watch.mockImplementation((_p: string, callback: any) => {
        changeCallback = callback;
        return { close: jest.fn(), on: jest.fn() };
      });
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ name: 'initial' }));
      configManager = new ConfigManager(
        {},
        { configPath: '/path/to/config.json', watch: true }
      );
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const emitted: any[] = [];
      configManager.on('error', (e) => emitted.push(e));

      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('reload failed');
      });
      changeCallback('change');

      expect(errorSpy).toHaveBeenCalledWith(
        '❌ Security: Failed to reload config:',
        expect.objectContaining({ message: 'reload failed' })
      );
      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toMatchObject({
        source: 'file',
        error: expect.objectContaining({ message: 'reload failed' })
      });
    });

    it('should not emit update when reload yields an empty config', () => {
      let changeCallback: any;
      mockFs.watch.mockImplementation((_p: string, callback: any) => {
        changeCallback = callback;
        return { close: jest.fn(), on: jest.fn() };
      });
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ name: 'initial' }));
      configManager = new ConfigManager(
        {},
        { configPath: '/path/to/config.json', watch: true }
      );
      const onUpdate = jest.fn();
      configManager.on('update', onUpdate);

      mockFs.readFileSync.mockReturnValue('{}');
      changeCallback('change');

      expect(onUpdate).not.toHaveBeenCalled();
      expect(configManager.get().name).toBe('initial');
    });
  });

  describe('verifyIntegrity', () => {
    it('should return true when crypto throws', () => {
      configManager = new ConfigManager();
      jest.spyOn(crypto, 'createHash').mockImplementation(() => {
        throw new Error('crypto unavailable');
      });
      expect(configManager.verifyIntegrity()).toBe(true);
    });
  });

  describe('loadFromEnv', () => {
    it('should map SHIELD_HEADERS=true', () => {
      process.env.SHIELD_HEADERS = 'true';
      configManager = new ConfigManager();
      expect(configManager.get().headers?.enabled).toBe(true);
    });

    it('should map SHIELD_HEADERS=false', () => {
      process.env.SHIELD_HEADERS = 'false';
      configManager = new ConfigManager();
      expect(configManager.get().headers?.enabled).toBe(false);
    });

    it('should map HSTS_MAX_AGE', () => {
      process.env.HSTS_MAX_AGE = '3600';
      configManager = new ConfigManager();
      const hsts = configManager.get().headers?.hsts;
      expect(hsts?.maxAge).toBe(3600);
      expect(hsts?.includeSubDomains).toBe(true);
      expect(hsts?.preload).toBe(false);
    });

    it('should map SHIELD_CSP', () => {
      process.env.SHIELD_CSP = 'false';
      configManager = new ConfigManager();
      expect(configManager.get().csp?.enabled).toBe(false);
    });

    it('should map SHIELD_AI', () => {
      process.env.SHIELD_AI = 'false';
      configManager = new ConfigManager();
      expect(configManager.get().ai?.enabled).toBe(false);
    });

    it('should map SHIELD_MONITORING', () => {
      process.env.SHIELD_MONITORING = 'false';
      configManager = new ConfigManager();
      expect(configManager.get().monitoring?.enabled).toBe(false);
    });

    it('should map full rate limit env vars', () => {
      process.env.RATE_LIMIT_MAX = '7';
      process.env.RATE_LIMIT_WINDOW = '30000';
      process.env.RATE_LIMIT_ENABLED = 'true';
      configManager = new ConfigManager();
      expect(configManager.get().rateLimit).toEqual({
        enabled: true,
        default: { max: 7, windowMs: 30000 }
      });
    });

    it('should default the rate limit window when RATE_LIMIT_WINDOW is unset', () => {
      process.env.RATE_LIMIT_MAX = '5';
      configManager = new ConfigManager();
      expect(configManager.get().rateLimit).toEqual({
        enabled: true,
        default: { max: 5, windowMs: 60000 }
      });
    });

    it('should map RATE_LIMIT_ENABLED=false', () => {
      process.env.RATE_LIMIT_MAX = '10';
      process.env.RATE_LIMIT_ENABLED = 'false';
      configManager = new ConfigManager();
      expect(configManager.get().rateLimit?.enabled).toBe(false);
    });
  });
});
