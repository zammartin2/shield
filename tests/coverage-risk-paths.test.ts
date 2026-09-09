import { PluginManager } from '../src/modules/plugins/PluginManager'
import { RateLimiter } from '../src/modules/rate-limit/RateLimiter'

describe('risk-path coverage', () => {
  afterEach(() => jest.restoreAllMocks())

  test('rate limiter supports a custom identity and removes expired buckets', async () => {
    const config = {
      getModule: jest.fn().mockReturnValue({
        keyGenerator: (req: any) => `tenant:${req.tenant}`,
        default: { max: 2, windowMs: 1000 }
      })
    } as any
    const limiter = new RateLimiter(config)

    await limiter.check({ tenant: 'alpha' })
    expect(limiter.getStats().keys).toEqual(['tenant:alpha'])

    ;(limiter as any).store.get('tenant:alpha').resetTime = Date.now() - 1
    limiter.cleanup()
    expect(limiter.getStats().totalKeys).toBe(0)
  })

  test('plugin context storage, configuration, logger and utilities work together', async () => {
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'debug').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()

    let context: any
    const plugin: any = {
      name: 'coverage-plugin',
      version: '1.2.3',
      enabled: true,
      config: { local: 'plugin-value' },
      middleware: (_req: any, _res: any, next: any) => next(),
      onInit: (ctx: any) => { context = ctx }
    }
    const manager = new PluginManager({ plugins: [plugin], global: 'manager-value' })

    expect(context.getConfig('global')).toBe('manager-value')
    expect(context.getConfig('local')).toBe('plugin-value')
    expect(context.getConfig()).toEqual({ local: 'plugin-value' })
    context.setConfig({ added: 42 })
    expect(context.getShield().getVersion()).toBe('1.0.0')
    expect(context.getShield().isActive()).toBe(true)
    expect(context.getShield().getMetrics()).toEqual({})
    expect(context.getShield().getConfig().added).toBe(42)
    expect(context.getMetrics()).toEqual({})
    expect(context.getServer()).toEqual({})

    const logger = context.getLogger()
    logger.debug('debug'); logger.info('info'); logger.warn('warn'); logger.error('error')
    context.log('info', 'message')

    const storage = context.getStorage()
    await storage.set('one', 1)
    expect(await storage.get('one')).toBe(1)
    expect(await storage.getAll()).toEqual({ one: 1 })
    await storage.delete('one')
    await storage.set('two', 2)
    await storage.clear()
    expect(await storage.getAll()).toEqual({})

    context.set('direct', 'value')
    expect(context.get('direct')).toBe('value')
    context.delete('direct')
    expect(context.get('direct')).toBeUndefined()
    expect(context.getUtils().isIP('127.0.0.1')).toBe(true)
    expect(context.getUtils().isURL('https://fab.devorbit.ru')).toBe(true)
    expect(context.getUtils().isURL('not a url')).toBe(false)
    expect(context.getUtils().generateId()).toMatch(/^plugin-/)
    expect(context.generateId()).toMatch(/^plugin-/)
    expect(context.getUtils().getTimestamp()).toBeTruthy()
    expect(context.getTimestamp()).toBeInstanceOf(Date)
    context.registerRoutes('/coverage', {})

    const handler = jest.fn()
    context.on('coverage:event', handler)
    context.emit('coverage:event', { ok: true })
    expect(handler).toHaveBeenCalledWith({ ok: true })
    expect(manager.getMetrics().active).toBe(1)
  })

  test('plugin middleware errors are counted and delegated to onError', async () => {
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
    const onError = jest.fn()
    const manager = new PluginManager({ plugins: [{
      name: 'failing-plugin', version: '1.0.0',
      middleware: (_req: any, _res: any, next: any) => next(new Error('failure')),
      onError
    }] })

    await manager.execute({}, {}, {})
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'failure' }), {})
    expect(manager.getStatus('failing-plugin')?.errors).toBe(1)
  })
})
