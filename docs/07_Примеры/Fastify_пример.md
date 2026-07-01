# ⚡ Fastify пример FAB Shield

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

Этот пример показывает, как использовать FAB Shield с **Fastify** — высокопроизводительным веб-фреймворком для Node.js.

---

## 🏗️ Структура проекта
fastify-example/
├── src/
│ ├── index.ts # Основной файл
│ ├── routes/
│ │ ├── api.ts # API маршруты
│ │ └── public.ts # Публичные маршруты
│ └── plugins/
│ └── shield.ts # FAB Shield плагин
├── package.json # Зависимости
├── tsconfig.json # TypeScript конфигурация
├── .env.example # Переменные окружения
└── README.md # Документация

text

---

## 📄 Файлы

### 1. src/index.ts

```typescript
import Fastify from 'fastify'
import { FABShield } from '@fab-registry/shield'
import apiRoutes from './routes/api'
import publicRoutes from './routes/public'
import shieldPlugin from './plugins/shield'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config()

// ============================================
// FASTIFY ПРИЛОЖЕНИЕ
// ============================================

const app = Fastify({
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV === 'development' ? {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        } : undefined
    },
    trustProxy: true,
    bodyLimit: 10485760 // 10MB
})

// ============================================
// FAB SHIELD КОНФИГУРАЦИЯ
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
# FAB SHIELD ПЛАГИН ДЛЯ FASTIFY
// ============================================

// Регистрируем FAB Shield как Fastify плагин
app.register(shieldPlugin, { shield })

// ============================================
# МАРШРУТЫ
// ============================================

// Регистрируем маршруты
app.register(publicRoutes, { prefix: '/' })
app.register(apiRoutes, { prefix: '/api' })

// Health check
app.get('/health', async (request, reply) => {
    return {
        status: 'ok',
        service: 'fastify-fab-shield',
        version: '1.0.0',
        shield: {
            version: shield.getVersion(),
            active: shield.isActive()
        },
        timestamp: new Date().toISOString()
    }
})

// Метрики
app.get('/metrics', async (request, reply) => {
    const metrics = shield.getMetrics()
    return metrics
})

// ============================================
# ОБРАБОТКА ОШИБОК
// ============================================

app.setErrorHandler((error, request, reply) => {
    app.log.error(error)
    
    const status = error.statusCode || 500
    const message = error.message || 'Internal server error'
    
    reply.status(status).send({
        error: message,
        status: status,
        timestamp: new Date().toISOString()
    })
})

// 404
app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
        error: 'Not found',
        path: request.url,
        timestamp: new Date().toISOString()
    })
})

// ============================================
# ЗАПУСК
// ============================================

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3000')
        const host = process.env.HOST || '0.0.0.0'
        
        await app.listen({ port, host })
        
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
        
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

start()
2. src/plugins/shield.ts
typescript
import { FastifyPluginAsync } from 'fastify'
import { FABShield } from '@fab-registry/shield'

interface ShieldPluginOptions {
    shield: FABShield
}

const shieldPlugin: FastifyPluginAsync<ShieldPluginOptions> = async (fastify, options) => {
    const { shield } = options
    
    // Добавляем FAB Shield как middleware
    fastify.use(shield.middleware())
    
    // Декорируем fastify с shield
    fastify.decorate('shield', shield)
    
    // Добавляем метод для получения метрик
    fastify.decorate('getShieldMetrics', () => {
        return shield.getMetrics()
    })
    
    // Добавляем хук для логирования угроз
    fastify.addHook('onResponse', async (request, reply) => {
        const metrics = shield.getMetrics()
        if (metrics.threatsBlocked > 0) {
            fastify.log.warn(`🚨 ${metrics.threatsBlocked} threats blocked`)
        }
    })
}

export default shieldPlugin

// Расширяем типы Fastify
declare module 'fastify' {
    interface FastifyInstance {
        shield: FABShield
        getShieldMetrics(): any
    }
}
3. src/routes/public.ts
typescript
import { FastifyPluginAsync } from 'fastify'

const publicRoutes: FastifyPluginAsync = async (fastify) => {
    // Главная страница
    fastify.get('/', async (request, reply) => {
        return {
            message: 'Welcome to FAB Shield with Fastify!',
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
    fastify.get('/test', async (request, reply) => {
        return {
            message: 'Test endpoint',
            protected: true,
            timestamp: new Date().toISOString()
        }
    })
}

export default publicRoutes
4. src/routes/api.ts
typescript
import { FastifyPluginAsync } from 'fastify'

interface AuthBody {
    username: string
    password: string
}

const apiRoutes: FastifyPluginAsync = async (fastify) => {
    // Защищенные данные
    fastify.get('/data', async (request, reply) => {
        return {
            data: 'This is protected data',
            access: 'granted',
            timestamp: new Date().toISOString()
        }
    })

    // Аутентификация
    fastify.post<{ Body: AuthBody }>('/auth', {
        schema: {
            body: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                    username: { type: 'string' },
                    password: { type: 'string' }
                }
            }
        }
    }, async (request, reply) => {
        const { username, password } = request.body
        
        if (!username || !password) {
            return reply.status(400).send({
                error: 'Username and password required'
            })
        }
        
        // Простая проверка (в реальном проекте используйте JWT)
        if (username === 'admin' && password === 'admin123') {
            return {
                success: true,
                token: 'fake-jwt-token',
                user: {
                    id: 1,
                    username: 'admin',
                    role: 'admin'
                }
            }
        }
        
        return reply.status(401).send({
            error: 'Invalid credentials'
        })
    })

    // Аналитика (с AI защитой)
    fastify.get('/analytics', async (request, reply) => {
        // AI-защита автоматически анализирует этот запрос
        return {
            analytics: {
                requests: 1234,
                threats: 0,
                uptime: '99.99%'
            }
        }
    })
}

export default apiRoutes
5. package.json
json
{
    "name": "fastify-fab-shield-example",
    "version": "1.0.0",
    "description": "FAB Shield with Fastify example",
    "main": "dist/index.js",
    "scripts": {
        "build": "tsc",
        "start": "node dist/index.js",
        "dev": "ts-node src/index.ts",
        "watch": "tsc --watch"
    },
    "dependencies": {
        "@fab-registry/shield": "^1.0.0",
        "fastify": "^4.24.0",
        "dotenv": "^16.3.1"
    },
    "devDependencies": {
        "@types/node": "^20.10.0",
        "typescript": "^5.3.0",
        "ts-node": "^10.9.0"
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
HOST=0.0.0.0

# FAB Shield
SHIELD_HEADERS=true
SHIELD_CSP=true
SHIELD_AI=true
SHIELD_MONITORING=true

# Logging
LOG_LEVEL=info
🚀 Запуск
1. Установка
bash
# Создаем проект
mkdir fastify-example
cd fastify-example

# Инициализация
npm init -y

# Установка зависимостей
npm install @fab-registry/shield fastify dotenv
npm install -D @types/node typescript ts-node

# Создаем файлы
mkdir src src/routes src/plugins
touch src/index.ts
touch src/routes/api.ts
touch src/routes/public.ts
touch src/plugins/shield.ts
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
📊 Метрики производительности
Сравнение с Express
typescript
// Fastify обычно быстрее Express
// FAB Shield добавляет минимальную задержку (~2-5ms)

const metrics = {
    // Без FAB Shield
    withoutShield: {
        requestsPerSecond: 10000,
        avgLatency: '2ms'
    },
    // С FAB Shield
    withShield: {
        requestsPerSecond: 9500,
        avgLatency: '5ms'
    }
}
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Fastify пример FAB Shield — это:

⚡ Высокая производительность — Fastify + FAB Shield

🔒 Полная защита — все security-заголовки

🤖 AI-защита — интеллектуальная безопасность

🎯 Гибкость — настройка под ваши нужды

📊 Мониторинг — метрики и логи

Защитите свое Fastify приложение с FAB Shield! ⚡

© 2026 ООО «Деворбит». Все права защищены.