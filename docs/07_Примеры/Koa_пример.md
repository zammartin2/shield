# 🍃 Koa пример FAB Shield

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

Этот пример показывает, как использовать FAB Shield с **Koa** — минималистичным веб-фреймворком, созданным командой Express.

---

## 🏗️ Структура проекта
koa-example/
├── src/
│ ├── index.ts # Основной файл
│ ├── routes/
│ │ ├── api.ts # API маршруты
│ │ └── public.ts # Публичные маршруты
│ └── middleware/
│ └── shield.ts # FAB Shield middleware
├── package.json # Зависимости
├── tsconfig.json # TypeScript конфигурация
├── .env.example # Переменные окружения
└── README.md # Документация

text

---

## 📄 Файлы

### 1. src/index.ts

```typescript
import Koa from 'koa'
import Router from '@koa/router'
import { FABShield } from '@fab-registry/shield'
import apiRoutes from './routes/api'
import publicRoutes from './routes/public'
import { shieldMiddleware } from './middleware/shield'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config()

// ============================================
# KOA ПРИЛОЖЕНИЕ
// ============================================

const app = new Koa()
const router = new Router()

// ============================================
# FAB SHIELD КОНФИГУРАЦИЯ
// ============================================

const shield = new FABShield({
    env: process.env.NODE_ENV as any || 'development',
    
    // Security-заголовки
    headers: {
        enabled: true,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        custom: {
            'X-Security-Level': 'high'
        }
    },
    
    // Content Security Policy
    csp: {
        enabled: true,
        dynamic: true,
        directives: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", 'data:', 'https:']
        }
    },
    
    // AI-защита
    ai: {
        enabled: true,
        anomalyDetection: true,
        threatPrediction: true
    },
    
    // Мониторинг
    monitoring: {
        enabled: true,
        export: ['json']
    },
    
    // Rate Limiting
    rateLimit: {
        enabled: true,
        default: {
            windowMs: 60000,
            max: 100
        }
    }
})

// ============================================
# MIDDLEWARE
// ============================================

// 1. Логирование запросов
app.use(async (ctx, next) => {
    const start = Date.now()
    console.log(`📝 ${ctx.method} ${ctx.path}`)
    
    await next()
    
    const duration = Date.now() - start
    console.log(`📤 ${ctx.method} ${ctx.path} - ${ctx.status} (${duration}ms)`)
})

// 2. Body parsing
app.use(require('koa-bodyparser')())

// 3. FAB Shield — подключаем защиту
app.use(shieldMiddleware(shield))

// ============================================
# МАРШРУТЫ
// ============================================

// Публичные маршруты
router.use('/', publicRoutes.routes())

// API маршруты
router.use('/api', apiRoutes.routes())

// Health check
router.get('/health', async (ctx) => {
    ctx.body = {
        status: 'ok',
        service: 'koa-fab-shield',
        version: '1.0.0',
        shield: {
            version: shield.getVersion(),
            active: shield.isActive()
        },
        timestamp: new Date().toISOString()
    }
})

// Метрики
router.get('/metrics', async (ctx) => {
    const metrics = shield.getMetrics()
    ctx.body = metrics
})

// Применяем роутер
app.use(router.routes())
app.use(router.allowedMethods())

// ============================================
# ОБРАБОТКА ОШИБОК
// ============================================

app.on('error', (err, ctx) => {
    console.error('❌ Error:', err)
    ctx.status = err.status || 500
    ctx.body = {
        error: err.message || 'Internal server error',
        status: ctx.status,
        timestamp: new Date().toISOString()
    }
})

// 404
app.use(async (ctx) => {
    ctx.status = 404
    ctx.body = {
        error: 'Not found',
        path: ctx.path,
        timestamp: new Date().toISOString()
    }
})

// ============================================
# ЗАПУСК
// ============================================

const port = parseInt(process.env.PORT || '3000')

app.listen(port, () => {
    console.log('\n🚀 Server started successfully!')
    console.log(`📍 URL: http://localhost:${port}`)
    console.log(`🛡️ FAB Shield: ${shield.isActive() ? '✅ Active' : '❌ Inactive'}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log('\n📋 Available endpoints:')
    console.log(`  GET  /            - Home`)
    console.log(`  GET  /health      - Health check`)
    console.log(`  GET  /metrics     - Metrics`)
    console.log(`  GET  /api/data    - Protected API`)
    console.log(`  POST /api/auth    - Authentication`)
    console.log('\n✅ Ready to accept requests!\n')
})

export default app
2. src/middleware/shield.ts
typescript
import { Context, Next } from 'koa'
import { FABShield } from '@fab-registry/shield'

export const shieldMiddleware = (shield: FABShield) => {
    return async (ctx: Context, next: Next) => {
        // Получаем Express-совместимый middleware
        const expressMiddleware = shield.middleware()
        
        // Создаем Koa-совместимую обертку
        return new Promise((resolve, reject) => {
            // Создаем mock для Express req/res
            const req = ctx.req
            const res = ctx.res
            
            // Добавляем методы для Express совместимости
            res.setHeader = res.setHeader || res.set
            res.removeHeader = res.removeHeader || ((name: string) => {
                res.removeHeader(name)
            })
            
            // Вызываем Express middleware
            expressMiddleware(req, res, (err?: any) => {
                if (err) {
                    reject(err)
                    return
                }
                
                // Сохраняем заголовки в ctx
                // Koa использует ctx.response, Express использует res
                // Копируем заголовки из Express res в Koa ctx
                const headers = res.getHeaders()
                Object.entries(headers).forEach(([key, value]) => {
                    if (value !== undefined) {
                        ctx.set(key, value as string)
                    }
                })
                
                resolve(next())
            })
        })
    }
}
3. src/routes/public.ts
typescript
import Router from '@koa/router'

const router = new Router()

// Главная страница
router.get('/', async (ctx) => {
    ctx.body = {
        message: 'Welcome to FAB Shield with Koa!',
        description: 'This is a protected application',
        features: [
            '✅ Security Headers (25+)',
            '✅ Content Security Policy',
            '✅ AI Threat Detection',
            '✅ Rate Limiting',
            '✅ Monitoring & Metrics'
        ],
        docs: '/health',
        metrics: '/metrics',
        api: '/api'
    }
})

// Тестовый маршрут
router.get('/test', async (ctx) => {
    ctx.body = {
        message: 'Test endpoint',
        protected: true,
        timestamp: new Date().toISOString()
    }
})

export default router
4. src/routes/api.ts
typescript
import Router from '@koa/router'

const router = new Router()

// Защищенные данные
router.get('/data', async (ctx) => {
    ctx.body = {
        data: 'This is protected data',
        access: 'granted',
        timestamp: new Date().toISOString()
    }
})

// Аутентификация
router.post('/auth', async (ctx) => {
    const { username, password } = ctx.request.body as any
    
    if (!username || !password) {
        ctx.status = 400
        ctx.body = {
            error: 'Username and password required'
        }
        return
    }
    
    // Простая проверка (в реальном проекте используйте JWT)
    if (username === 'admin' && password === 'admin123') {
        ctx.body = {
            success: true,
            token: 'fake-jwt-token',
            user: {
                id: 1,
                username: 'admin',
                role: 'admin'
            }
        }
        return
    }
    
    ctx.status = 401
    ctx.body = {
        error: 'Invalid credentials'
    }
})

// Аналитика (с AI защитой)
router.get('/analytics', async (ctx) => {
    // AI-защита автоматически анализирует этот запрос
    ctx.body = {
        analytics: {
            requests: 1234,
            threats: 0,
            uptime: '99.99%'
        }
    }
})

export default router
5. package.json
json
{
    "name": "koa-fab-shield-example",
    "version": "1.0.0",
    "description": "FAB Shield with Koa example",
    "main": "dist/index.js",
    "scripts": {
        "build": "tsc",
        "start": "node dist/index.js",
        "dev": "nodemon --exec ts-node src/index.ts",
        "watch": "tsc --watch"
    },
    "dependencies": {
        "@fab-registry/shield": "^1.0.0",
        "koa": "^2.14.2",
        "koa-router": "^12.0.1",
        "koa-bodyparser": "^4.4.1",
        "dotenv": "^16.3.1"
    },
    "devDependencies": {
        "@types/koa": "^2.13.10",
        "@types/koa-router": "^7.4.7",
        "@types/koa-bodyparser": "^4.3.12",
        "@types/node": "^20.10.0",
        "typescript": "^5.3.0",
        "ts-node": "^10.9.0",
        "nodemon": "^3.0.0"
    }
}
6. tsconfig.json
json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "commonjs",
        "lib": ["ES2022"],
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
}
7. .env.example
bash
# Application
NODE_ENV=development
PORT=3000

# FAB Shield
SHIELD_HEADERS=true
SHIELD_CSP=true
SHIELD_AI=true
SHIELD_MONITORING=true

# Security
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true
🚀 Запуск
1. Установка
bash
# Создаем проект
mkdir koa-example
cd koa-example

# Инициализация
npm init -y

# Установка зависимостей
npm install @fab-registry/shield koa koa-router koa-bodyparser dotenv
npm install -D @types/koa @types/koa-router @types/koa-bodyparser @types/node typescript ts-node nodemon

# Создаем файлы
mkdir src src/routes src/middleware
touch src/index.ts
touch src/routes/api.ts
touch src/routes/public.ts
touch src/middleware/shield.ts
touch tsconfig.json
touch .env.example
2. Запуск
bash
# Режим разработки
npm run dev

# Сборка
npm run build

# Production
npm start
📊 Тестирование
Тестовые запросы
bash
# Health check
curl http://localhost:3000/health

# Главная страница
curl http://localhost:3000/

# API
curl http://localhost:3000/api/data

# Аутентификация
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Метрики
curl http://localhost:3000/metrics

# Проверка заголовков
curl -I http://localhost:3000
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Koa пример FAB Shield — это:

🍃 Минималистичная интеграция — идеально для Koa

🔒 Полная защита — все security-заголовки

🤖 AI-защита — интеллектуальная безопасность

🎯 Гибкость — настройка под ваши нужды

📊 Мониторинг — метрики и логи

Защитите свое Koa приложение с FAB Shield! 🍃

© 2026 ООО «Деворбит». Все права защищены.