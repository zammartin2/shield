// ============================================
// ТЕСТ: PLUGINS MODULE
// ============================================

import { PluginsModule } from '../../../../src/modules/plugins/PluginsModule'
import { ConfigManager } from '../../../../src/core/ConfigManager'
import { Plugin } from '../../../../src/types'

describe('PluginsModule', () => {
  let configManager: ConfigManager
  let pluginsModule: PluginsModule
  let mockPlugin: Plugin

  beforeEach(() => {
    configManager = new ConfigManager({
      plugins: []
    })

    pluginsModule = new PluginsModule(configManager)

    mockPlugin = {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'Test plugin',
      author: 'Test Author',
      enabled: true,
      middleware: jest.fn((req, res, next) => next()),
      onInit: jest.fn(),
      onStart: jest.fn(),
      onStop: jest.fn(),
      onDestroy: jest.fn(),
      onRequest: jest.fn(),
      onResponse: jest.fn(),
      onError: jest.fn()
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ============================================
  // ✅ ТЕСТЫ КОНСТРУКТОРА
  // ============================================

  test('should create instance with config', () => {
    expect(pluginsModule).toBeDefined()
    expect(pluginsModule).toBeInstanceOf(PluginsModule)
  })

  test('should create instance with plugins in config', () => {
    const configWithPlugins = new ConfigManager({
      plugins: [mockPlugin]
    })
    const module = new PluginsModule(configWithPlugins)
    
    expect(module.getPlugins()).toContain('test-plugin')
  })

  test('should initialize with empty plugins', () => {
    expect(pluginsModule.getPlugins()).toEqual([])
    expect(pluginsModule.getCount()).toBe(0)
  })

  // ============================================
  // ✅ ТЕСТЫ REGISTER
  // ============================================

  test('should register a plugin', () => {
    pluginsModule.register(mockPlugin)
    expect(pluginsModule.getPlugins()).toContain('test-plugin')
    expect(pluginsModule.getCount()).toBe(1)
  })

  test('should register multiple plugins', () => {
    const plugin2: Plugin = {
      name: 'test-plugin-2',
      version: '1.0.0',
      middleware: jest.fn()
    }

    pluginsModule.register(mockPlugin)
    pluginsModule.register(plugin2)

    const plugins = pluginsModule.getPlugins()
    expect(plugins).toContain('test-plugin')
    expect(plugins).toContain('test-plugin-2')
    expect(plugins.length).toBe(2)
    expect(pluginsModule.getCount()).toBe(2)
  })

  test('should throw error when registering null plugin', () => {
    expect(() => {
      pluginsModule.register(null as any)
    }).toThrow('Plugin cannot be null or undefined')
  })

  test('should throw error when registering undefined plugin', () => {
    expect(() => {
      pluginsModule.register(undefined as any)
    }).toThrow('Plugin cannot be null or undefined')
  })

  test('should throw error when registering duplicate plugin', () => {
    pluginsModule.register(mockPlugin)
    
    expect(() => {
      pluginsModule.register(mockPlugin)
    }).toThrow(`Plugin ${mockPlugin.name} already registered`)
  })

  test('should validate plugin before registration', () => {
    const invalidPlugin = {
      name: 'invalid-plugin'
    } as Plugin

    expect(() => {
      pluginsModule.register(invalidPlugin)
    }).toThrow()
  })

  // ============================================
  // ✅ ТЕСТЫ UNREGISTER
  // ============================================

  test('should unregister a plugin', () => {
    pluginsModule.register(mockPlugin)
    expect(pluginsModule.getPlugins()).toContain('test-plugin')
    expect(pluginsModule.getCount()).toBe(1)
    
    pluginsModule.unregister('test-plugin')
    expect(pluginsModule.getPlugins()).not.toContain('test-plugin')
    expect(pluginsModule.getCount()).toBe(0)
  })

  test('should throw error when unregistering with empty name', () => {
    expect(() => {
      pluginsModule.unregister('')
    }).toThrow('Plugin name cannot be empty')
  })

  test('should throw error when unregistering non-existent plugin', () => {
    expect(() => {
      pluginsModule.unregister('non-existent')
    }).toThrow('Plugin non-existent not found')
  })

  test('should call onDestroy when unregistering', () => {
    pluginsModule.register(mockPlugin)
    pluginsModule.unregister('test-plugin')
    
    expect(mockPlugin.onDestroy).toHaveBeenCalled()
  })

  // ============================================
  // ✅ ТЕСТЫ EXECUTE
  // ============================================

  test('should execute plugin middleware', async () => {
    const req = { method: 'GET', path: '/test' }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const context = {}

    pluginsModule.register(mockPlugin)
    await pluginsModule.execute(req, res, context)

    expect(mockPlugin.middleware).toHaveBeenCalled()
  })

  test('should throw error when executing with null req', async () => {
    await expect(
      pluginsModule.execute(null as any, {}, {})
    ).rejects.toThrow('Request and Response are required')
  })

  test('should throw error when executing with null res', async () => {
    await expect(
      pluginsModule.execute({}, null as any, {})
    ).rejects.toThrow('Request and Response are required')
  })

  test('should execute plugin onRequest', async () => {
    const pluginWithOnRequest: Plugin = {
      name: 'onrequest-plugin',
      version: '1.0.0',
      onRequest: jest.fn().mockResolvedValue({})
    }

    pluginsModule.register(pluginWithOnRequest)
    await pluginsModule.execute({}, {}, {})

    expect(pluginWithOnRequest.onRequest).toHaveBeenCalled()
  })

  test('should block request when plugin returns block', async () => {
    const blockingPlugin: Plugin = {
      name: 'blocking-plugin',
      version: '1.0.0',
      onRequest: jest.fn().mockResolvedValue({
        block: true,
        status: 403,
        message: 'Blocked by plugin'
      })
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    pluginsModule.register(blockingPlugin)
    await pluginsModule.execute({}, res, {})

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Blocked by plugin',
      reason: undefined,
      plugin: 'blocking-plugin'
    })
  })

  test('should handle plugin errors gracefully', async () => {
    const errorPlugin: Plugin = {
      name: 'error-plugin',
      version: '1.0.0',
      middleware: jest.fn(() => {
        throw new Error('Plugin error')
      }),
      onError: jest.fn()
    }

    pluginsModule.register(errorPlugin)
    
    await expect(
      pluginsModule.execute({}, {}, {})
    ).resolves.not.toThrow()

    expect(errorPlugin.onError).toHaveBeenCalled()
  })

  test('should skip disabled plugins', async () => {
    const disabledPlugin: Plugin = {
      name: 'disabled-plugin',
      version: '1.0.0',
      enabled: false,
      middleware: jest.fn()
    }

    pluginsModule.register(disabledPlugin)
    await pluginsModule.execute({}, {}, {})

    expect(disabledPlugin.middleware).not.toHaveBeenCalled()
  })

  // ============================================
  // ✅ ТЕСТЫ GETTERS
  // ============================================

  test('should get plugins list', () => {
    pluginsModule.register(mockPlugin)
    const plugins = pluginsModule.getPlugins()
    
    expect(plugins).toBeInstanceOf(Array)
    expect(plugins).toContain('test-plugin')
  })

  test('should get plugin by name', () => {
    pluginsModule.register(mockPlugin)
    const plugin = pluginsModule.getPlugin('test-plugin')
    
    expect(plugin).toBeDefined()
    expect(plugin?.name).toBe('test-plugin')
  })

  test('should return undefined for empty plugin name', () => {
    const plugin = pluginsModule.getPlugin('')
    expect(plugin).toBeUndefined()
  })

  test('should return undefined for non-existent plugin', () => {
    const plugin = pluginsModule.getPlugin('non-existent')
    expect(plugin).toBeUndefined()
  })

  test('should get metrics', () => {
    pluginsModule.register(mockPlugin)
    const metrics = pluginsModule.getMetrics()
    
    expect(metrics).toBeDefined()
    expect(metrics.total).toBe(1)
    expect(metrics.active).toBe(1)
    expect(metrics.disabled).toBe(0)
  })

  test('should get plugin status', () => {
    pluginsModule.register(mockPlugin)
    const status = pluginsModule.getStatus('test-plugin')
    
    expect(status).toBeDefined()
    expect(status?.enabled).toBe(true)
    expect(status?.errors).toBe(0)
  })

  test('should return undefined for empty plugin name in getStatus', () => {
    const status = pluginsModule.getStatus('')
    expect(status).toBeUndefined()
  })

  test('should return undefined for non-existent plugin status', () => {
    const status = pluginsModule.getStatus('non-existent')
    expect(status).toBeUndefined()
  })

  // ============================================
  // ✅ ТЕСТЫ ENABLE/DISABLE
  // ============================================

  test('should enable a plugin', () => {
    pluginsModule.register(mockPlugin)
    pluginsModule.disable('test-plugin')
    expect(pluginsModule.getStatus('test-plugin')?.enabled).toBe(false)
    
    pluginsModule.enable('test-plugin')
    expect(pluginsModule.getStatus('test-plugin')?.enabled).toBe(true)
  })

  test('should disable a plugin', () => {
    pluginsModule.register(mockPlugin)
    pluginsModule.disable('test-plugin')
    
    expect(pluginsModule.getStatus('test-plugin')?.enabled).toBe(false)
  })

  test('should throw error when enabling with empty name', () => {
    expect(() => {
      pluginsModule.enable('')
    }).toThrow('Plugin name cannot be empty')
  })

  test('should throw error when disabling with empty name', () => {
    expect(() => {
      pluginsModule.disable('')
    }).toThrow('Plugin name cannot be empty')
  })

  test('should throw error when enabling non-existent plugin', () => {
    expect(() => {
      pluginsModule.enable('non-existent')
    }).toThrow('Plugin non-existent not found')
  })

  test('should throw error when disabling non-existent plugin', () => {
    expect(() => {
      pluginsModule.disable('non-existent')
    }).toThrow('Plugin non-existent not found')
  })

  // ============================================
  // ✅ ТЕСТЫ НОВЫХ МЕТОДОВ
  // ============================================

  test('should get count of plugins', () => {
    expect(pluginsModule.getCount()).toBe(0)
    
    pluginsModule.register(mockPlugin)
    expect(pluginsModule.getCount()).toBe(1)
    
    pluginsModule.register({
      name: 'plugin-2',
      version: '1.0.0',
      middleware: jest.fn()
    })
    expect(pluginsModule.getCount()).toBe(2)
  })

  test('should get active plugins', () => {
    const plugin2: Plugin = {
      name: 'plugin-2',
      version: '1.0.0',
      enabled: false,
      middleware: jest.fn()
    }

    pluginsModule.register(mockPlugin)
    pluginsModule.register(plugin2)

    const active = pluginsModule.getActivePlugins()
    expect(active).toContain('test-plugin')
    expect(active).not.toContain('plugin-2')
  })

  test('should get disabled plugins', () => {
    const plugin2: Plugin = {
      name: 'plugin-2',
      version: '1.0.0',
      enabled: false,
      middleware: jest.fn()
    }

    pluginsModule.register(mockPlugin)
    pluginsModule.register(plugin2)

    const disabled = pluginsModule.getDisabledPlugins()
    expect(disabled).toContain('plugin-2')
    expect(disabled).not.toContain('test-plugin')
  })

  test('should clear all plugins', () => {
    pluginsModule.register(mockPlugin)
    pluginsModule.register({
      name: 'plugin-2',
      version: '1.0.0',
      middleware: jest.fn()
    })

    expect(pluginsModule.getCount()).toBe(2)
    
    pluginsModule.clear()
    
    expect(pluginsModule.getCount()).toBe(0)
    expect(pluginsModule.getPlugins()).toEqual([])
  })

  test('should check if plugin exists', () => {
    pluginsModule.register(mockPlugin)
    
    expect(pluginsModule.hasPlugin('test-plugin')).toBe(true)
    expect(pluginsModule.hasPlugin('non-existent')).toBe(false)
  })

  test('should get manager instance', () => {
    const manager = pluginsModule.getManager()
    expect(manager).toBeDefined()
  })

  // ============================================
  // ✅ ТЕСТЫ С РЕАЛЬНЫМИ ПЛАГИНАМИ
  // ============================================

  test('should work with plugin that has all hooks', async () => {
    const fullPlugin: Plugin = {
      name: 'full-plugin',
      version: '1.0.0',
      onInit: jest.fn().mockResolvedValue(undefined),
      onStart: jest.fn().mockResolvedValue(undefined),
      onStop: jest.fn().mockResolvedValue(undefined),
      onDestroy: jest.fn().mockResolvedValue(undefined),
      onRequest: jest.fn().mockResolvedValue({}),
      onResponse: jest.fn().mockResolvedValue(undefined),
      onError: jest.fn().mockResolvedValue(undefined),
      middleware: jest.fn((req, res, next) => next())
    }

    pluginsModule.register(fullPlugin)
    await pluginsModule.execute({}, {}, {})

    expect(fullPlugin.onInit).toHaveBeenCalled()
    expect(fullPlugin.onRequest).toHaveBeenCalled()
    expect(fullPlugin.middleware).toHaveBeenCalled()
  })

  test('should handle plugin with async middleware', async () => {
    const asyncPlugin: Plugin = {
      name: 'async-plugin',
      version: '1.0.0',
      middleware: jest.fn(async (req, res, next) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        next()
      })
    }

    pluginsModule.register(asyncPlugin)
    await pluginsModule.execute({}, {}, {})
    
    expect(asyncPlugin.middleware).toHaveBeenCalled()
  })

  test('should handle plugin that returns custom response', async () => {
    const customPlugin: Plugin = {
      name: 'custom-plugin',
      version: '1.0.0',
      onRequest: jest.fn().mockResolvedValue({
        block: true,
        status: 429,
        message: 'Rate limited',
        reason: 'Too many requests',
        headers: { 'X-Retry-After': '60' }
      })
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    }

    pluginsModule.register(customPlugin)
    await pluginsModule.execute({}, res, {})

    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Rate limited',
      reason: 'Too many requests',
      plugin: 'custom-plugin'
    })
  })

  // ============================================
  // ✅ ТЕСТЫ С КОНФИГУРАЦИЕЙ
  // ============================================

  test('should load plugins from config', () => {
    const configWithPlugins = new ConfigManager({
      plugins: [mockPlugin]
    })
    const module = new PluginsModule(configWithPlugins)
    
    const plugins = module.getPlugins()
    expect(plugins).toContain('test-plugin')
  })

  test('should handle invalid plugins in config gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    const configWithInvalidPlugins = new ConfigManager({
      plugins: [
        { invalid: true }
      ]
    })
    
    const module = new PluginsModule(configWithInvalidPlugins)
    expect(module.getPlugins()).toEqual([])
    
    consoleSpy.mockRestore()
  })

  // ============================================
  // ✅ ТЕСТЫ СТАТИСТИКИ
  // ============================================

  test('should track metrics correctly', () => {
    const plugin2: Plugin = {
      name: 'plugin-2',
      version: '1.0.0',
      enabled: false,
      middleware: jest.fn()
    }

    pluginsModule.register(mockPlugin)
    pluginsModule.register(plugin2)

    const metrics = pluginsModule.getMetrics()
    expect(metrics.total).toBe(2)
    expect(metrics.active).toBe(1)
    expect(metrics.disabled).toBe(1)
  })

  test('should track plugin errors', async () => {
    const errorPlugin: Plugin = {
      name: 'error-plugin',
      version: '1.0.0',
      middleware: jest.fn(() => {
        throw new Error('Plugin error')
      })
    }

    pluginsModule.register(errorPlugin)
    await pluginsModule.execute({}, {}, {})

    const status = pluginsModule.getStatus('error-plugin')
    expect(status?.errors).toBeGreaterThan(0)
  })

  // ============================================
  // ✅ ТЕСТЫ С Edge Cases
  // ============================================

  test('should handle plugin without middleware', async () => {
    const pluginWithoutMiddleware: Plugin = {
      name: 'no-middleware',
      version: '1.0.0',
      onRequest: jest.fn().mockResolvedValue({})
    }

    pluginsModule.register(pluginWithoutMiddleware)
    await pluginsModule.execute({}, {}, {})
    
    expect(pluginWithoutMiddleware.onRequest).toHaveBeenCalled()
  })

  test('should handle plugin with invalid version', () => {
    const invalidPlugin: Plugin = {
      name: 'invalid-version',
      version: '1.0',
      middleware: jest.fn()
    }

    expect(() => {
      pluginsModule.register(invalidPlugin)
    }).toThrow('Plugin version must be in semver format')
  })

  test('should handle plugin with invalid name', () => {
    const invalidPlugin: Plugin = {
      name: 'Invalid Name',
      version: '1.0.0',
      middleware: jest.fn()
    }

    expect(() => {
      pluginsModule.register(invalidPlugin)
    }).toThrow('Plugin name must be in kebab-case')
  })
})