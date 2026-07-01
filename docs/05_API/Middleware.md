# 🔌 Middleware API — Документация API middleware

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Middleware API** — это основной способ интеграции FAB Shield с вашим приложением. Эта документация описывает все возможности middleware и способы их использования.

---

## 🏗️ Основной middleware

### `.middleware()`

Основной middleware для подключения FAB Shield.

```typescript
shield.middleware(): (req: Request, res: Response, next: NextFunction) => void
Пример использования:

typescript
import express from 'express'
import { FABShield } from '@fab-registry/shield'

const app = express()
const shield = new FABShield()

// Подключаем middleware
app.use(shield.middleware())

// Ваши маршруты
app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' })
})
🎯 Конфигурация middleware
Базовая конфигурация
typescript
const shield = new FABShield({
    // Включаем/выключаем отдельные модули
    headers: { enabled: true },
    csp: { enabled: true },
    ai: { enabled: false },
    monitoring: { enabled: true }
})

app.use(shield.middleware())
Конфигурация через параметры
typescript
// Можно передать конфигурацию прямо в middleware
app.use(shield.middleware({
    // Переопределение настроек для конкретного маршрута
    headers: {
        'X-Custom-Header': 'custom-value'
    }
}))
🛣️ Middleware для конкретных путей
Применение к конкретным маршрутам
typescript
// Только для API
app.use('/api/*', shield.middleware({
    headers: {
        hsts: { maxAge: 31536000 }
    }
}))

// Только для админки
app.use('/admin/*', shield.middleware({
    headers: {
        hsts: { maxAge: 31536000 },
        csp: { strict: true }
    }
}))

// Разные настройки для разных путей
app.use('/api/public/*', shield.middleware({
    headers: { enabled: false }
}))

app.use('/api/private/*', shield.middleware({
    headers: { enabled: true }
}))
🔧 Кастомные middleware
Создание кастомного middleware
typescript
// Создаем кастомный middleware
const customMiddleware = (req, res, next) => {
    // Логика до обработки FAB Shield
    console.log('Custom middleware before shield')
    next()
}

// Применяем до FAB Shield
app.use(customMiddleware)
app.use(shield.middleware())

// Или после FAB Shield
app.use(shield.middleware())
app.use((req, res, next) => {
    // Логика после обработки FAB Shield
    console.log('Custom middleware after shield')
    next()
})
Middleware с конфигурацией
typescript
// Фабрика middleware
const createCustomMiddleware = (options) => {
    return (req, res, next) => {
        // Используем options
        if (options.logRequests) {
            console.log(`📝 ${req.method} ${req.path}`)
        }
        
        // Доступ к shield
        const shield = req.app.get('shield')
        const metrics = shield.getMetrics()
        
        // Добавляем данные в запрос
        req.custom = {
            timestamp: new Date(),
            metrics: metrics
        }
        
        next()
    }
}

app.use(createCustomMiddleware({ logRequests: true }))
app.use(shield.middleware())
🎯 Middleware по условию
Условное применение
typescript
// Применяем только в production
if (process.env.NODE_ENV === 'production') {
    app.use(shield.middleware())
}

// Применяем только для определенных методов
app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return shield.middleware()(req, res, next)
    }
    next()
})

// Применяем только для определенных IP
app.use((req, res, next) => {
    const trustedIPs = ['10.0.0.1', '10.0.0.2']
    if (!trustedIPs.includes(req.ip)) {
        return shield.middleware()(req, res, next)
    }
    next()
})
🔄 Порядок middleware
Рекомендуемый порядок
typescript
// 1. Безопасность
app.use(helmet())  // Если используете

// 2. Логирование
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

// 3. FAB Shield — основной middleware
app.use(shield.middleware())

// 4. Rate limiting (если не в FAB Shield)
app.use(rateLimit())

// 5. Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 6. Сессии
app.use(session())

// 7. Аутентификация
app.use(authMiddleware())

// 8. Роуты
app.use('/api', routes)

// 9. Обработка ошибок
app.use(errorHandler)
🎨 Продвинутые техники
Композиция middleware
typescript
// Комбинируем несколько middleware
const composeMiddleware = (...middlewares) => {
    return (req, res, next) => {
        let index = 0
        
        const nextMiddleware = (err) => {
            if (err) {
                next(err)
                return
            }
            if (index < middlewares.length) {
                const middleware = middlewares[index++]
                middleware(req, res, nextMiddleware)
            } else {
                next()
            }
        }
        
        nextMiddleware()
    }
}

app.use(composeMiddleware(
    loggingMiddleware,
    shield.middleware(),
    authMiddleware
))
Динамическое включение/выключение
typescript
// Динамическое отключение в зависимости от нагрузки
let shieldEnabled = true

app.use((req, res, next) => {
    // Отключаем при высокой нагрузке
    const metrics = shield.getMetrics()
    if (metrics.requestsPerSecond > 1000) {
        shieldEnabled = false
    }
    
    if (shieldEnabled) {
        return shield.middleware()(req, res, next)
    }
    next()
})
📊 Мониторинг middleware
Отслеживание производительности
typescript
// Middleware для мониторинга
const monitoringMiddleware = (req, res, next) => {
    const start = Date.now()
    
    res.on('finish', () => {
        const duration = Date.now() - start
        const shieldMetrics = shield.getMetrics()
        
        console.log({
            path: req.path,
            method: req.method,
            duration: `${duration}ms`,
            status: res.statusCode,
            threats: shieldMetrics.threatsBlocked,
            responseSize: res.get('Content-Length')
        })
    })
    
    next()
}

app.use(monitoringMiddleware)
app.use(shield.middleware())
Логирование
typescript
// Middleware для логирования
const loggingMiddleware = (req, res, next) => {
    const start = Date.now()
    
    res.on('finish', () => {
        const duration = Date.now() - start
        logger.info({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        })
    })
    
    next()
}

app.use(loggingMiddleware)
app.use(shield.middleware())
🛡️ Middleware безопасности
Дополнительные проверки
typescript
// Middleware для проверки безопасности
const securityCheckMiddleware = (req, res, next) => {
    // Проверка наличия токена
    if (!req.headers.authorization && req.path.startsWith('/api')) {
        return res.status(401).json({
            error: 'Authorization required'
        })
    }
    
    // Проверка CSRF
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const csrfToken = req.headers['x-csrf-token']
        const sessionToken = req.session?.csrfToken
        if (csrfToken !== sessionToken) {
            return res.status(403).json({
                error: 'Invalid CSRF token'
            })
        }
    }
    
    next()
}

app.use(securityCheckMiddleware)
app.use(shield.middleware())
🔌 Интеграция с фреймворками
Express.js
typescript
import express from 'express'
import { FABShield } from '@fab-registry/shield'

const app = express()
const shield = new FABShield()

app.use(shield.middleware())
Fastify
typescript
import fastify from 'fastify'
import { FABShield } from '@fab-registry/shield'

const app = fastify()
const shield = new FABShield()

app.use(shield.middleware())
Koa
typescript
import Koa from 'koa'
import { FABShield } from '@fab-registry/shield'

const app = new Koa()
const shield = new FABShield()

app.use(shield.middleware())
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Middleware API — это:

🔌 Простая интеграция — одна строка кода

🎯 Гибкая настройка — под каждый маршрут

⚡ Высокая производительность — минимальная задержка

🛡️ Максимальная защита — все модули включены

📊 Полный мониторинг — отслеживание работы

Интегрируйте FAB Shield легко и быстро! 🔌

© 2026 ООО «Деворбит». Все права защищены.