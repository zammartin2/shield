# 🔌 Plugin System — Система расширения

---

**Версия:** 1.1.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Plugin System** — это сердце расширяемости FAB Shield. Она позволяет добавлять новую функциональность без изменения кода ядра, делая фреймворк бесконечно гибким.

---

## 🎯 Что дает система плагинов

### Ключевые преимущества

| Преимущество | Описание |
|:---|:---|
| **Расширяемость** | Добавляйте любую функциональность |
| **Гибкость** | Подстраивайте под свои нужды |
| **Обновляемость** | Обновляйте плагины независимо |
| **Сообщество** | Делитесь своими плагинами |
| **Экосистема** | Создавайте экосистему вокруг фреймворка |

---

## 🏗️ Архитектура

### ### Структура плагина

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN STRUCTURE │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ PLUGIN METADATA │ │
│ │ • name │ │
│ │ • version │ │
│ │ • description │ │
│ │ • author │ │
│ │ • dependencies │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ LIFECYCLE HOOKS │ │
│ │ • onInit() - Инициализация │ │
│ │ • onStart() - Запуск │ │
│ │ • onRequest() - Обработка запроса │ │
│ │ • onResponse() - Обработка ответа │ │
│ │ • onError() - Обработка ошибки │ │
│ │ • onStop() - Остановка │ │
│ │ • onDestroy() - Уничтожение │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ MIDDLEWARE │ │
│ │ • Основная логика плагина │ │
│ │ • Обработка запросов/ответов │ │
│ │ • Взаимодействие с ядром │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Создание плагина

### Базовый плагин

```typescript
// plugins/custom-security.plugin.ts

const customSecurityPlugin = {
    // Метаданные
    name: 'custom-security',
    version: '1.0.0',
    description: 'Кастомная безопасность',
    author: 'DEVORBIT LLC',
    
    // Инициализация
    onInit: async (context) => {
        console.log('🔧 Инициализация плагина...')
        await context.loadConfig('custom-security')
    },
    
    // Запуск
    onStart: async (context) => {
        console.log('🚀 Плагин запущен')
        await context.registerMiddleware()
    },
    
    // Middleware
    middleware: async (req, res, next) => {
        // Добавляем кастомный заголовок
        res.setHeader('X-Custom-Header', 'CustomSecurity')
        
        // Проверяем кастомные правила
        if (req.headers['x-custom-token'] !== 'secret') {
            res.status(403).json({
                error: 'Custom security check failed'
            })
            return
        }
        
        next()
    },
    
    // Остановка
    onStop: async (context) => {
        console.log('🛑 Плагин остановлен')
    }
}
### Расширенный плагин с API

```typescript
typescript
import express from 'express'

const advancedPlugin = {
    name: 'advanced-security',
    version: '1.0.0',
    
    onInit: async (context) => {
        // Регистрируем кастомные маршруты
        const router = express.Router()
        router.get('/status', (req, res) => {
            res.json({
                status: 'active',
                rules: context.getRules()
            })
        })
        context.registerRoutes('/security', router)
    },
    
    onRequest: async (req, context) => {
        // Анализ каждого запроса
        const analysis = await context.analyze(req)
        if (analysis.threat) {
            context.reportThreat(analysis)
            return {
                block: true,
                reason: analysis.reason
            }
        }
        return { block: false }
    },
    
    onError: async (error, context) => {
        // Логирование ошибок
        await context.logError(error)
        await context.sendAlert(error)
    }
}
```

## 📦 Официальные плагины
### 1. WAF Integration

```typescript
typescript
// Плагин для интеграции с WAF
const wafPlugin = {
    name: 'waf-integration',
    version: '1.0.0',
    description: 'Интеграция с Cloudflare WAF',
    
    config: {
        apiKey: process.env.CLOUDFLARE_API_KEY,
        zoneId: process.env.CLOUDFLARE_ZONE_ID
    },
    
    middleware: async (req, res, next) => {
        // Проверка через WAF
        const result = await checkWAF(req)
        if (result.blocked) {
            res.status(403).json({
                error: 'Blocked by WAF'
            })
            return
        }
        next()
    }
}
```

### 2. Geo Blocking

```typescript
typescript
// Плагин для гео-блокировки
const geoPlugin = {
    name: 'geo-blocking',
    version: '1.0.0',
    description: 'Блокировка по геолокации',
    
    config: {
        blockedCountries: ['RU', 'BY', 'CN'],
        mode: 'block'  // 'block' | 'challenge' | 'monitor'
    },
    
    middleware: async (req, res, next) => {
        const country = await getCountry(req.ip)
        if (config.blockedCountries.includes(country)) {
            if (config.mode === 'block') {
                res.status(403).json({
                    error: 'Access denied in your region'
                })
                return
            }
            // challenge mode
            res.setHeader('X-Geo-Blocked', country)
        }
        next()
    }
}
```

### 3. Rate Limiting

```typescript
typescript
// Плагин для умного rate limiting
const rateLimitPlugin = {
    name: 'smart-rate-limit',
    version: '1.0.0',
    description: 'Адаптивный rate limiting',
    
    config: {
        defaultLimit: 100,
        window: 60,  // секунд
        userLimits: {
            admin: 1000,
            user: 100,
            guest: 50
        }
    },
    
    onRequest: async (req, context) => {
        const key = req.user?.id || req.ip
        const limit = getUserLimit(req)
        const current = await context.getRate(key)
        
        if (current > limit) {
            return {
                block: true,
                status: 429,
                message: 'Rate limit exceeded'
            }
        }
        
        await context.incrementRate(key)
        return { block: false }
    }
}
```

### 4. Audit Logger

```typescript
typescript
// Плагин для аудит-логирования
const auditPlugin = {
    name: 'audit-logger',
    version: '1.0.0',
    description: 'Аудит всех действий',
    
    onRequest: async (req, context) => {
        await context.log('REQUEST', {
            method: req.method,
            path: req.path,
            ip: req.ip,
            user: req.user?.id,
            timestamp: new Date()
        })
    },
    
    onResponse: async (res, context) => {
        await context.log('RESPONSE', {
            status: res.statusCode,
            duration: res.duration,
            size: res.size
        })
    },
    
    onError: async (error, context) => {
        await context.log('ERROR', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date()
        })
    }
}
```

## 🚀 Использование плагинов
### Подключение плагинов

```typescript
typescript
const shield = new FABShield({
    plugins: [
        // Официальные плагины
        wafPlugin,
        geoPlugin,
        rateLimitPlugin,
        auditPlugin,
        
        // Кастомные плагины
        customSecurityPlugin,
        advancedPlugin
    ]
})
```

### Управление плагинами

```typescript
typescript
// Получить список плагинов
const plugins = shield.plugins.getList()
console.log(`✅ Загружено плагинов: ${plugins.length}`)

// Включить/выключить плагин
await shield.plugins.enable('waf-integration')
await shield.plugins.disable('geo-blocking')

// Обновить плагин
await shield.plugins.update('rate-limit', {
    config: {
        defaultLimit: 200
    }
})

// Удалить плагин
await shield.plugins.remove('audit-logger')
```

## 📦 Создание плагинов
Структура плагина
```text
my-plugin/
├── ```

### package.json

```json
├── index.ts
├── config/
│   └── default.json
├── middleware/
│   └── index.ts
├── tests/
│   └── plugin.test.ts
└── README.md
package.json
json
{
    "name": "@fab-registry/plugin-my-security",
    "version": "1.0.0",
    "description": "Мой кастомный плагин",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "keywords": ["fab-shield", "security", "plugin"],
    "author": "DEVORBIT LLC",
    "license": "MIT",
    "peerDependencies": {
        "@fab-registry/shield": "^1.0.0"
    }
}
```

## 📊 Мониторинг плагинов
### Метрики плагинов

```typescript
typescript
const metrics = shield.plugins.getMetrics()
console.log({
    totalPlugins: metrics.total,
    activePlugins: metrics.active,
    performance: {
        totalExecutionTime: metrics.totalExecutionTime,
        averageTime: metrics.averageTime,
        slowest: metrics.slowestPlugin
    },
    errors: {
        total: metrics.errors.total,
        byPlugin: metrics.errors.byPlugin
    }
})
```

### Логирование плагинов

```typescript
typescript
// Логирование работы плагинов
shield.plugins.on('plugin:error', (plugin, error) => {
    console.error(`❌ Ошибка в плагине ${plugin.name}:`, error)
})

shield.plugins.on('plugin:success', (plugin, result) => {
    console.log(`✅ Плагин ${plugin.name} выполнен`)
})
```

## 🛡️ Безопасность плагинов
### Ограничения

```typescript
typescript
// Настройка ограничений для плагинов
const shield = new FABShield({
    plugins: {
        security: {
            sandbox: true,           // Изоляция плагинов
            maxExecutionTime: 1000,   // ms
            maxMemory: 50,            // MB
            allowedAPIs: [
                'getConfig',
                'setConfig',
                'log',
                'reportThreat'
            ],
            blockedAPIs: [
                'exec',
                'spawn',
                'fork',
                'eval'
            ]
        }
    }
})
```

### Валидация плагинов

```typescript
typescript
// Валидация плагина перед загрузкой
function validatePlugin(plugin) {
    const required = ['name', 'version', 'middleware']
    for (const field of required) {
        if (!plugin[field]) {
            throw new Error(`Плагин должен иметь поле: ${field}`)
        }
    }
    
    if (!/^[a-z0-9-]+$/.test(plugin.name)) {
        throw new Error('Имя плагина должно быть в kebab-case')
    }
    
    return true
}
```

## 📚 Примеры плагинов
### 1. Telegram Bot

```typescript
typescript
const telegramPlugin = {
    name: 'telegram-notifier',
    version: '1.0.0',
    
    config: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID
    },
    
    onInit: async (context) => {
        const bot = new Telegraf(config.botToken)
        context.bot = bot
    },
    
    onError: async (error, context) => {
        await context.bot.telegram.sendMessage(
            config.chatId,
            `🚨 Ошибка:\n${error.message}`
        )
    }
}
```

### 2. IP Whitelist

```typescript
typescript
const whitelistPlugin = {
    name: 'ip-whitelist',
    version: '1.0.0',
    
    config: {
        whitelist: ['10.0.0.1', '10.0.0.2', '192.168.1.100'],
        mode: 'whitelist'  // 'whitelist' | 'blacklist'
    },
    
    middleware: (req, res, next) => {
        const ip = req.ip
        const isWhitelisted = config.whitelist.includes(ip)
        
        if (config.mode === 'whitelist' && !isWhitelisted) {
            res.status(403).json({
                error: 'IP not whitelisted'
            })
            return
        }
        
        if (config.mode === 'blacklist' && isWhitelisted) {
            res.status(403).json({
                error: 'IP is blacklisted'
            })
            return
        }
        
        next()
    }
}
```

## 📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Plugin System — это:

🔌 Безграничная расширяемость — добавляйте любую функциональность

🎯 Гибкость — подстраивайте под свои нужды

🚀 Независимость — обновляйте плагины отдельно

📦 Экосистема — создавайте и делитесь плагинами

Создавайте свою экосистему безопасности! 🔌

© 2026 ООО «Деворбит». Все права защищены.