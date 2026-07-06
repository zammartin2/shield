// ============================================
// ТЕСТ: PLUGIN MANAGER (ФИНАЛЬНАЯ ВЕРСИЯ)
// ============================================

import { PluginManager } from '../../../../src/modules/plugins/PluginManager'
import { Plugin } from '../../../../src/types'

describe('PluginManager', () => {
  let pluginManager: PluginManager
  let mockPlugin: Plugin
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    pluginManager = new PluginManager({
      plugins: []
    })

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

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  // ============================================
  // ✅ КОНСТРУКТОР И ЗАГРУЗКА
  // ============================================

  test('should create instance with config', () => {
    expect(pluginManager).toBeDefined()
    expect(pluginManager).toBeInstanceOf(PluginManager)
  })

  test('should load plugins from config', () => {
    const manager = new PluginManager({
      plugins: [mockPlugin]
    })
    
    expect(manager.getPlugins()).toContain('test-plugin')
  })

  test('should handle invalid plugin in config gracefully', () => {
    const manager = new PluginManager({
      plugins: [
        { invalid: true }
      ]
    })
    
    expect(manager.getPlugins()).toEqual([])
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  // ============================================
  // ✅ ВАЛИДАЦИЯ ПЛАГИНОВ
  // ============================================

  test('should validate plugin with valid data', () => {
    expect(() => pluginManager.register(mockPlugin)).not.toThrow()
  })

  test('should throw error when plugin has no name', () => {
    const invalidPlugin = {
      version: '1.0.0',
      middleware: jest.fn()
    } as Plugin

    expect(() => pluginManager.register(invalidPlugin)).toThrow('Plugin must have a name')
  })

  test('should throw error when plugin has no version', () => {
    const invalidPlugin = {
      name: 'no-version',
      middleware: jest.fn()
    } as Plugin

    expect(() => pluginManager.register(invalidPlugin)).toThrow('Plugin must have a version')
  })

  test('should throw error when plugin name is not kebab-case', () => {
    const invalidPlugin = {
      name: 'Invalid Name',
      version: '1.0.0',
      middleware: jest.fn()
    } as Plugin

    expect(() => pluginManager.register(invalidPlugin)).toThrow('Plugin name must be in kebab-case')
  })

  test('should throw error when plugin version is not semver', () => {
    const invalidPlugin = {
      name: 'invalid-version',
      version: '1.0',
      middleware: jest.fn()
    } as Plugin

    expect(() => pluginManager.register(invalidPlugin)).toThrow('Plugin version must be in semver format')
  })

  test('should throw error when plugin has no handlers', () => {
    const invalidPlugin = {
      name: 'no-handlers',
      version: '1.0.0'
    } as Plugin

    expect(() => pluginManager.register(invalidPlugin)).toThrow(
      'Plugin must have at least one handler (middleware, onRequest, or onResponse)'
    )
  })

  // ============================================
  // ✅ РЕГИСТРАЦИЯ
  // ============================================

  test('should register a plugin', () => {
    pluginManager.register(mockPlugin)
    expect(pluginManager.getPlugins()).toContain('test-plugin')
  })

  test('should call onInit when registering', () => {
    pluginManager.register(mockPlugin)
    expect(mockPlugin.onInit).toHaveBeenCalled()
  })

  test('should handle onInit async error', async () => {
    const errorPlugin: Plugin = {
      name: 'error-plugin',
      version: '1.0.0',
      middleware: jest.fn(),
      onInit: jest.fn().mockRejectedValue(new Error('Init error'))
    }

    pluginManager.register(errorPlugin)
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Plugin error-plugin init error:')
  })

  test('should emit plugin:registered event', () => {
    const emitSpy = jest.spyOn(pluginManager, 'emit')
    pluginManager.register(mockPlugin)
    
    expect(emitSpy).toHaveBeenCalledWith('plugin:registered', mockPlugin)
  })

  test('should log plugin registration', () => {
    pluginManager.register(mockPlugin)
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `✅ Plugin registered: test-plugin v1.0.0`
    )
  })

  // ============================================
  // ✅ УДАЛЕНИЕ
  // ============================================

  test('should unregister a plugin', () => {
    pluginManager.register(mockPlugin)
    pluginManager.unregister('test-plugin')
    
    expect(pluginManager.getPlugins()).not.toContain('test-plugin')
  })

  test('should call onDestroy when unregistering', () => {
    pluginManager.register(mockPlugin)
    pluginManager.unregister('test-plugin')
    
    expect(mockPlugin.onDestroy).toHaveBeenCalled()
  })

  test('should handle onDestroy async error', async () => {
    const errorPlugin: Plugin = {
      name: 'error-plugin',
      version: '1.0.0',
      middleware: jest.fn(),
      onDestroy: jest.fn().mockRejectedValue(new Error('Destroy error'))
    }

    pluginManager.register(errorPlugin)
    pluginManager.unregister('error-plugin')
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Plugin error-plugin destroy error:')
  })

  test('should throw error when unregistering non-existent plugin', () => {
    expect(() => pluginManager.unregister('non-existent')).toThrow('Plugin non-existent not found')
  })

  test('should emit plugin:unregistered event', () => {
    const emitSpy = jest.spyOn(pluginManager, 'emit')
    pluginManager.register(mockPlugin)
    pluginManager.unregister('test-plugin')
    
    expect(emitSpy).toHaveBeenCalledWith('plugin:unregistered', { name: 'test-plugin' })
  })

  test('should log plugin unregistration', () => {
    pluginManager.register(mockPlugin)
    pluginManager.unregister('test-plugin')
    
    expect(consoleLogSpy).toHaveBeenCalledWith(`🗑️ Plugin unregistered: test-plugin`)
  })

  // ============================================
  // ✅ ВЫПОЛНЕНИЕ
  // ============================================

  test('should execute plugin middleware', async () => {
    const req = { method: 'GET', path: '/test' }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const context = {}

    pluginManager.register(mockPlugin)
    await pluginManager.execute(req, res, context)

    expect(mockPlugin.middleware).toHaveBeenCalled()
  })

  test('should execute plugin onRequest', async () => {
    const pluginWithOnRequest: Plugin = {
      name: 'onrequest-plugin',
      version: '1.0.0',
      onRequest: jest.fn().mockResolvedValue({})
    }

    pluginManager.register(pluginWithOnRequest)
    await pluginManager.execute({}, {}, {})

    expect(pluginWithOnRequest.onRequest).toHaveBeenCalled()
  })

  test('should block request when plugin returns block', async () => {
    const blockingPlugin: Plugin = {
      name: 'blocking-plugin',
      version: '1.0.0',
      onRequest: jest.fn().mockResolvedValue({
        block: true,
        status: 403,
        message: 'Blocked by plugin',
        reason: 'Test reason'
      })
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    pluginManager.register(blockingPlugin)
    await pluginManager.execute({}, res, {})

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Blocked by plugin',
      reason: 'Test reason',
      plugin: 'blocking-plugin'
    })
  })

  test('should block request with default status and message', async () => {
    const blockingPlugin: Plugin = {
      name: 'blocking-plugin',
      version: '1.0.0',
      onRequest: jest.fn().mockResolvedValue({
        block: true
      })
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    pluginManager.register(blockingPlugin)
    await pluginManager.execute({}, res, {})

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Request blocked by plugin',
      reason: undefined,
      plugin: 'blocking-plugin'
    })
  })

  test('should handle plugin error gracefully', async () => {
    const errorPlugin: Plugin = {
      name: 'error-plugin',
      version: '1.0.0',
      middleware: jest.fn(() => {
        throw new Error('Plugin error')
      }),
      onError: jest.fn()
    }

    pluginManager.register(errorPlugin)
    await pluginManager.execute({}, {}, {})

    expect(errorPlugin.onError).toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Plugin error-plugin error:')
  })

  test('should skip disabled plugins', async () => {
    const disabledPlugin: Plugin = {
      name: 'disabled-plugin',
      version: '1.0.0',
      enabled: false,
      middleware: jest.fn()
    }

    pluginManager.register(disabledPlugin)
    await pluginManager.execute({}, {}, {})

    expect(disabledPlugin.middleware).not.toHaveBeenCalled()
  })

  test('should update lastRun timestamp', async () => {
    pluginManager.register(mockPlugin)
    await pluginManager.execute({}, {}, {})
    
    const status = pluginManager.getStatus('test-plugin')
    expect(status?.lastRun).toBeInstanceOf(Date)
  })

  test('should reset errors on successful execution', async () => {
    const errorPlugin: Plugin = {
      name: 'error-plugin',
      version: '1.0.0',
      middleware: jest.fn(() => {
        throw new Error('First error')
      })
    }

    pluginManager.register(errorPlugin)
    await pluginManager.execute({}, {}, {})
    
    let status = pluginManager.getStatus('error-plugin')
    expect(status?.errors).toBe(1)
    
    // Исправляем middleware
    errorPlugin.middleware = jest.fn((req, res, next) => next())
    
    await pluginManager.execute({}, {}, {})
    
    status = pluginManager.getStatus('error-plugin')
    expect(status?.errors).toBe(0)
  })

  // ============================================
  // ✅ GETTERS
  // ============================================

  test('should get plugins list', () => {
    pluginManager.register(mockPlugin)
    const plugins = pluginManager.getPlugins()
    
    expect(plugins).toContain('test-plugin')
  })

  test('should get plugin by name', () => {
    pluginManager.register(mockPlugin)
    const plugin = pluginManager.getPlugin('test-plugin')
    
    expect(plugin).toBeDefined()
    expect(plugin?.name).toBe('test-plugin')
  })

  test('should return undefined for non-existent plugin', () => {
    const plugin = pluginManager.getPlugin('non-existent')
    expect(plugin).toBeUndefined()
  })

  test('should get active plugins', () => {
    const plugin2: Plugin = {
      name: 'plugin-2',
      version: '1.0.0',
      enabled: false,
      middleware: jest.fn()
    }

    pluginManager.register(mockPlugin)
    pluginManager.register(plugin2)

    const active = pluginManager.getActivePlugins()
    expect(active).toContain('test-plugin')
    expect(active).not.toContain('plugin-2')
  })

  test('should get metrics', () => {
    const plugin2: Plugin = {
      name: 'plugin-2',
      version: '1.0.0',
      enabled: false,
      middleware: jest.fn()
    }

    pluginManager.register(mockPlugin)
    pluginManager.register(plugin2)

    const metrics = pluginManager.getMetrics()
    expect(metrics.total).toBe(2)
    expect(metrics.active).toBe(1)
    expect(metrics.disabled).toBe(1)
    expect(metrics.errors).toBe(0)
    expect(metrics.plugins).toHaveProperty('test-plugin')
    expect(metrics.plugins).toHaveProperty('plugin-2')
  })

  // ============================================
  // ✅ ENABLE/DISABLE
  // ============================================

  test('should enable a plugin', () => {
    pluginManager.register(mockPlugin)
    pluginManager.disable('test-plugin')
    expect(pluginManager.getStatus('test-plugin')?.enabled).toBe(false)
    
    pluginManager.enable('test-plugin')
    expect(pluginManager.getStatus('test-plugin')?.enabled).toBe(true)
  })

  test('should disable a plugin', () => {
    pluginManager.register(mockPlugin)
    pluginManager.disable('test-plugin')
    
    expect(pluginManager.getStatus('test-plugin')?.enabled).toBe(false)
  })

  test('should throw error when enabling non-existent plugin', () => {
    expect(() => pluginManager.enable('non-existent')).toThrow('Plugin non-existent not found')
  })

  test('should throw error when disabling non-existent plugin', () => {
    expect(() => pluginManager.disable('non-existent')).toThrow('Plugin non-existent not found')
  })

  test('should emit plugin:enabled event', () => {
    const emitSpy = jest.spyOn(pluginManager, 'emit')
    pluginManager.register(mockPlugin)
    pluginManager.enable('test-plugin')
    
    expect(emitSpy).toHaveBeenCalledWith('plugin:enabled', { name: 'test-plugin' })
  })

  test('should emit plugin:disabled event', () => {
    const emitSpy = jest.spyOn(pluginManager, 'emit')
    pluginManager.register(mockPlugin)
    pluginManager.disable('test-plugin')
    
    expect(emitSpy).toHaveBeenCalledWith('plugin:disabled', { name: 'test-plugin' })
  })

  // ============================================
  // ✅ СТАТУС
  // ============================================

  test('should get plugin status', () => {
    pluginManager.register(mockPlugin)
    const status = pluginManager.getStatus('test-plugin')
    
    expect(status).toBeDefined()
    expect(status?.enabled).toBe(true)
    expect(status?.errors).toBe(0)
    expect(status?.lastRun).toBeInstanceOf(Date)
  })

  test('should return undefined for non-existent plugin status', () => {
    const status = pluginManager.getStatus('non-existent')
    expect(status).toBeUndefined()
  })

  // ============================================
  // ✅ CONTEXT
  // ============================================

  test('should create context with getConfig', () => {
    pluginManager.register(mockPlugin)
    expect(mockPlugin.onInit).toHaveBeenCalled()
  })

  test('should create context with getConfig returning plugin config', () => {
    const pluginWithConfig: Plugin = {
      name: 'config-plugin',
      version: '1.0.0',
      config: { custom: 'value' },
      middleware: jest.fn(),
      onInit: jest.fn()
    }

    pluginManager.register(pluginWithConfig)
    
    const context = (pluginWithConfig.onInit as jest.Mock).mock.calls[0][0]
    const config = context.getConfig()
    
    expect(config).toEqual({ custom: 'value' })
  })

  test('should create context with setConfig', () => {
    pluginManager.register(mockPlugin)
    
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    
    expect(() => context.setConfig({ custom: 'value' })).not.toThrow()
    
    const config = context.getConfig()
    expect(config).toBeDefined()
  })

  test('should create context with getShield', () => {
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    const shield = context.getShield()
    
    expect(shield).toBeDefined()
    expect(shield.getVersion()).toBe('1.0.0')
    expect(shield.isActive()).toBe(true)
  })

  test('should create context with getMetrics', () => {
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    const metrics = context.getMetrics()
    
    expect(metrics).toEqual({})
  })

  test('should create context with getServer', () => {
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    const server = context.getServer()
    
    expect(server).toEqual({})
  })

  test('should create context with getLogger', () => {
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    const logger = context.getLogger()
    
    expect(logger).toHaveProperty('debug')
    expect(logger).toHaveProperty('info')
    expect(logger).toHaveProperty('warn')
    expect(logger).toHaveProperty('error')
  })

  test('should create context with log method', () => {
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    context.log('info', 'Test message', { data: 'test' })
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[test-plugin]', 'Test message', { data: 'test' }
    )
  })

  test('should create context with storage', () => {
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    
    expect(context.getStorage()).toHaveProperty('get')
    expect(context.getStorage()).toHaveProperty('set')
    expect(context.getStorage()).toHaveProperty('delete')
    expect(context.getStorage()).toHaveProperty('clear')
    expect(context.getStorage()).toHaveProperty('getAll')
  })

  test('should create context with set/get/delete', () => {
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    
    context.set('key', 'value')
    expect(context.get('key')).toBe('value')
    
    context.delete('key')
    expect(context.get('key')).toBeUndefined()
  })

  test('should create context with registerRoutes', () => {
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    context.registerRoutes('/api', {})
    
    expect(consoleLogSpy).toHaveBeenCalledWith('📌 Routes registered at /api')
  })

  test('should create context with on/emit', () => {
    const handler = jest.fn()
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    
    context.on('test:event', handler)
    context.emit('test:event', { data: 'test' })
    
    expect(handler).toHaveBeenCalledWith({ data: 'test' })
  })

  test('should create context with getUtils', () => {
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    const utils = context.getUtils()
    
    expect(utils).toHaveProperty('generateId')
    expect(utils).toHaveProperty('getTimestamp')
    expect(utils).toHaveProperty('isIP')
    expect(utils).toHaveProperty('isURL')
  })

  test('should create context with generateId', () => {
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    const id = context.generateId()
    
    expect(id).toMatch(/^plugin-\d+-[a-z0-9]+$/)
  })

  test('should create context with getTimestamp', () => {
    pluginManager.register(mockPlugin)
    const context = (mockPlugin.onInit as jest.Mock).mock.calls[0][0]
    const timestamp = context.getTimestamp()
    
    expect(timestamp).toBeInstanceOf(Date)
  })

  // ============================================
  // ✅ ДОПОЛНИТЕЛЬНЫЕ ТЕСТЫ
  // ============================================

  test('should handle plugin with config', () => {
    const pluginWithConfig: Plugin = {
      name: 'config-plugin',
      version: '1.0.0',
      config: { key: 'value' },
      middleware: jest.fn()
    }

    pluginManager.register(pluginWithConfig)
    expect(pluginManager.getPlugins()).toContain('config-plugin')
  })

  test('should handle plugin with onResponse hook', () => {
    const responsePlugin: Plugin = {
      name: 'response-plugin',
      version: '1.0.0',
      onResponse: jest.fn().mockResolvedValue(undefined),
      middleware: jest.fn()
    }

    pluginManager.register(responsePlugin)
    expect(pluginManager.getPlugins()).toContain('response-plugin')
  })

  test('should handle plugin onStart hook', () => {
    const startPlugin: Plugin = {
      name: 'start-plugin',
      version: '1.0.0',
      onStart: jest.fn().mockResolvedValue(undefined),
      middleware: jest.fn()
    }

    pluginManager.register(startPlugin)
    expect(pluginManager.getPlugins()).toContain('start-plugin')
  })

  test('should handle plugin onStop hook', () => {
    const stopPlugin: Plugin = {
      name: 'stop-plugin',
      version: '1.0.0',
      onStop: jest.fn().mockResolvedValue(undefined),
      middleware: jest.fn()
    }

    pluginManager.register(stopPlugin)
    expect(pluginManager.getPlugins()).toContain('stop-plugin')
  })

})