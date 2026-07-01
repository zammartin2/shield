# 🔌 Plugins API — Документация API плагинов

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Plugins API** — это система, которая позволяет расширять функциональность FAB Shield. Эта документация описывает все возможности для создания и управления плагинами.

---

## 🏗️ Структура плагина

### Базовый плагин

```typescript
interface Plugin {
    // Обязательные поля
    name: string
    version: string
    
    // Опциональные поля
    description?: string
    author?: string
    license?: string
    homepage?: string
    repository?: string
    
    // Конфигурация
    config?: Record<string, any>
    
    // Жизненный цикл
    onInit?: (context: PluginContext) => Promise<void>
    onStart?: (context: PluginContext) => Promise<void>
    onStop?: (context: PluginContext) => Promise<void>
    onDestroy?: (context: PluginContext) => Promise<void>
    
    // Обработчики событий
    onRequest?: (req: Request, context: PluginContext) => Promise<PluginResult>
    onResponse?: (res: Response, context: PluginContext) => Promise<void>
    onError?: (error: Error, context: PluginContext) => Promise<void>
    
    // Middleware
    middleware?: (req: Request, res: Response, next: NextFunction) => void
    
    // API методы
    api?: {
        [key: string]: (context: PluginContext, ...args: any[]) => any
    }
}
📝 Создание плагина
Шаг 1: Определение плагина
typescript
// plugins/my-plugin.ts

const myPlugin: Plugin = {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'Мой первый плагин для FAB Shield',
    author: 'DEVORBIT LLC',
    
    config: {
        enabled: true,
        logLevel: 'info',
        customOption: 'value'
    },
    
    onInit: async (context) => {
        console.log('🔧 Плагин инициализируется...')
        await context.loadConfig('my-plugin')
    },
    
    onStart: async (context) => {
        console.log('🚀 Плагин запущен!')
    },
    
    middleware: (req, res, next) => {
        console.log('📝 Плагин обрабатывает запрос')
        next()
    },
    
    onStop: async (context) => {
        console.log('🛑 Плагин остановлен')
    }
}
Шаг 2: Регистрация плагина
typescript
// app.ts
import { FABShield } from '@fab-registry/shield'
import myPlugin from './plugins/my-plugin'

const shield = new FABShield({
    plugins: [myPlugin]
})

app.use(shield.middleware())
🧩 Plugin Context
Доступ к контексту
typescript
onInit: async (context: PluginContext) => {
    // Доступ к конфигурации
    const config = context.getConfig('my-plugin')
    
    // Доступ к ядру FAB Shield
    const shield = context.getShield()
    
    // Доступ к логгеру
    const logger = context.getLogger()
    
    // Доступ к хранилищу
    const storage = context.getStorage()
    
    // Регистрация маршрутов
    context.registerRoutes('/plugin', router)
    
    // Регистрация событий
    context.on('threat:detected', (threat) => {
        console.log('🚨 Обнаружена угроза!', threat)
    })
}
PluginContext API
typescript
interface PluginContext {
    // Конфигурация
    getConfig(name?: string): any
    setConfig(config: any): void
    
    // Ядро
    getShield(): FABShield
    getMetrics(): Metrics
    getServer(): Server
    
    // Логирование
    getLogger(): Logger
    log(level: string, message: string, data?: any): void
    
    // Хранилище
    getStorage(): Storage
    set(key: string, value: any): void
    get(key: string): any
    delete(key: string): void
    
    // Маршруты
    registerRoutes(prefix: string, router: Router): void
    
    // События
    on(event: string, handler: Function): void
    emit(event: string, data: any): void
    
    // Утилиты
    getUtils(): Utils
    getTimestamp(): Date
    generateId(): string
}
🎯 Продвинутый плагин
Плагин с API
typescript
const advancedPlugin: Plugin = {
    name: 'advanced-plugin',
    version: '1.0.0',
    
    onInit: async (context) => {
        // Регистрируем маршруты
        const router = Router()
        router.get('/status', (req, res) => {
            res.json({ status: 'ok', plugin: 'advanced-plugin' })
        })
        context.registerRoutes('/advanced', router)
        
        // Регистрируем API методы
        context.registerAPI('getStats', async () => {
            const shield = context.getShield()
            return shield.getMetrics()
        })
    },
    
    middleware: (req, res, next) => {
        // Добавляем заголовок
        res.setHeader('X-Advanced-Plugin', 'active')
        next()
    },
    
    onRequest: async (req, context) => {
        // Анализируем запрос
        const shield = context.getShield()
        const analysis = await shield.ai.analyze(req)
        
        return {
            block: analysis.isThreat,
            reason: analysis.isThreat ? 'Threat detected by AI' : undefined
        }
    },
    
    onError: async (error, context) => {
        // Обрабатываем ошибки
        context.log('error', 'Plugin error:', error)
        await context.emit('plugin:error', { error, plugin: 'advanced-plugin' })
    }
}
🔌 Управление плагинами
Включение/выключение
typescript
// Включить плагин
await shield.plugins.enable('my-plugin')

// Выключить плагин
await shield.plugins.disable('my-plugin')

// Проверить статус
const status = shield.plugins.getStatus('my-plugin')
console.log(`Плагин ${status.enabled ? 'активен' : 'отключен'}`)
Обновление плагина
typescript
// Обновить конфигурацию плагина
await shield.plugins.updateConfig('my-plugin', {
    logLevel: 'debug',
    customOption: 'new-value'
})

// Перезагрузить плагин
await shield.plugins.reload('my-plugin')

// Обновить плагин (новая версия)
await shield.plugins.update('my-plugin', newVersion)
Удаление плагина
typescript
// Удалить плагин
await shield.plugins.remove('my-plugin')

// Удалить все плагины
await shield.plugins.removeAll()
📦 Система плагинов
Получение информации
typescript
// Список всех плагинов
const plugins = shield.plugins.getList()
console.log(`Загружено плагинов: ${plugins.length}`)

// Получить плагин по имени
const plugin = shield.plugins.get('my-plugin')

// Получить все активные плагины
const activePlugins = shield.plugins.getActive()

// Получить все отключенные плагины
const disabledPlugins = shield.plugins.getDisabled()
Метрики плагинов
typescript
// Метрики работы плагинов
const metrics = shield.plugins.getMetrics()
console.log({
    total: metrics.total,
    active: metrics.active,
    disabled: metrics.disabled,
    performance: {
        avgExecutionTime: metrics.avgExecutionTime,
        totalExecutionTime: metrics.totalExecutionTime,
        slowest: metrics.slowest
    },
    errors: metrics.errors
})
🛡️ Безопасность плагинов
Ограничения
typescript
const shield = new FABShield({
    plugins: {
        security: {
            sandbox: true,              // Изоляция
            maxExecutionTime: 1000,      // ms
            maxMemory: 50,              // MB
            allowedAPIs: [
                'getConfig',
                'setConfig',
                'log',
                'getMetrics'
            ],
            blockedAPIs: [
                'exec',
                'spawn',
                'fork',
                'eval',
                'require'
            ]
        }
    }
})
Валидация
typescript
// Валидация плагина перед загрузкой
function validatePlugin(plugin: Plugin): boolean {
    // Проверяем обязательные поля
    if (!plugin.name || !plugin.version) {
        throw new Error('Plugin must have name and version')
    }
    
    // Проверяем имя
    if (!/^[a-z0-9-]+$/.test(plugin.name)) {
        throw new Error('Plugin name must be kebab-case')
    }
    
    // Проверяем версию
    if (!/^\d+\.\d+\.\d+$/.test(plugin.version)) {
        throw new Error('Plugin version must be semver')
    }
    
    return true
}
📝 Примеры плагинов
1. Telegram Notifier
typescript
const telegramPlugin: Plugin = {
    name: 'telegram-notifier',
    version: '1.0.0',
    
    config: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID
    },
    
    onInit: async (context) => {
        const { botToken, chatId } = context.getConfig('telegram-notifier')
        
        // Инициализируем бота
        const bot = new Telegraf(botToken)
        context.bot = bot
        context.chatId = chatId
    },
    
    onError: async (error, context) => {
        await context.bot.telegram.sendMessage(
            context.chatId,
            `🚨 Ошибка в FAB Shield:\n${error.message}`
        )
    },
    
    onRequest: async (req, context) => {
        // Проверяем угрозы
        const shield = context.getShield()
        const threats = shield.getMetrics().threatsBlocked
        
        if (threats > 0) {
            await context.bot.telegram.sendMessage(
                context.chatId,
                `⚠️ Обнаружено ${threats} угроз!`
            )
        }
    }
}
2. WAF Integration
typescript
const wafPlugin: Plugin = {
    name: 'waf-integration',
    version: '1.0.0',
    
    config: {
        apiKey: process.env.CLOUDFLARE_API_KEY,
        zoneId: process.env.CLOUDFLARE_ZONE_ID
    },
    
    onInit: async (context) => {
        const { apiKey, zoneId } = context.getConfig('waf-integration')
        
        // Инициализируем клиент Cloudflare
        const client = new CloudflareClient(apiKey, zoneId)
        context.client = client
    },
    
    middleware: async (req, res, next) => {
        const client = context.client
        
        try {
            // Проверяем IP через Cloudflare
            const result = await client.checkIP(req.ip)
            
            if (result.blocked) {
                res.status(403).json({
                    error: 'Blocked by WAF',
                    reason: result.reason
                })
                return
            }
            
            next()
        } catch (error) {
            // В случае ошибки пропускаем
            next()
        }
    }
}
3. Audit Logger
typescript
const auditPlugin: Plugin = {
    name: 'audit-logger',
    version: '1.0.0',
    
    config: {
        logPath: './logs/audit.log',
        format: 'json'
    },
    
    onInit: async (context) => {
        const { logPath } = context.getConfig('audit-logger')
        context.logStream = fs.createWriteStream(logPath, { flags: 'a' })
    },
    
    onRequest: async (req, context) => {
        const log = {
            timestamp: new Date().toISOString(),
            type: 'request',
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        }
        
        context.logStream.write(JSON.stringify(log) + '\n')
    },
    
    onError: async (error, context) => {
        const log = {
            timestamp: new Date().toISOString(),
            type: 'error',
            error: error.message,
            stack: error.stack
        }
        
        context.logStream.write(JSON.stringify(log) + '\n')
    }
}
📊 Метрики плагинов
typescript
// Получение метрик
const pluginMetrics = shield.plugins.getMetrics()

console.log({
    totalPlugins: pluginMetrics.total,
    activePlugins: pluginMetrics.active,
    disabledPlugins: pluginMetrics.disabled,
    executionTime: {
        avg: pluginMetrics.avgExecutionTime,
        total: pluginMetrics.totalExecutionTime,
        slowest: pluginMetrics.slowestPlugin
    },
    errors: pluginMetrics.errors
})
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Plugins API — это:

🔌 Безграничная расширяемость — добавляйте любую функциональность

🎯 Гибкая архитектура — подстраивайте под свои нужды

🛡️ Безопасность — изоляция и ограничения

📊 Мониторинг — отслеживайте работу плагинов

🔧 Простота — создавайте плагины легко

Расширяйте FAB Shield без границ! 🔌

© 2026 ООО «Деворбит». Все права защищены.