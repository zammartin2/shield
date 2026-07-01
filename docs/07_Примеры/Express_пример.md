# 🚀 Express пример FAB Shield

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

Этот пример показывает, как использовать FAB Shield с **Express.js**. Вы увидите, как легко защитить свое Express-приложение всего несколькими строками кода.

---

## 🏗️ Структура проекта
express-example/
├── src/
│ ├── index.ts # Основной файл
│ ├── routes/
│ │ ├── api.ts # API маршруты
│ │ └── public.ts # Публичные маршруты
│ └── middleware/
│ └── custom.ts # Кастомные middleware
├── package.json # Зависимости
├── tsconfig.json # TypeScript конфигурация
├── .env.example # Переменные окружения
└── README.md # Документация

text

---

## 📄 Файлы

### 1. src/index.ts

```typescript
import express from 'express'
import { FABShield } from '@fab-registry/shield'
import apiRoutes from './routes/api'
import publicRoutes from './routes/public'
import { customMiddleware } from './middleware/custom'
import dotenv from 'dotenv'

// Загружаем переменные окружения
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

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
        },
        custom: {
            'X-Security-Level': 'high',
            'X-Custom-Header': 'FAB-Shield-Protected'
        }
    },
    
    // Content Security Policy
    csp: {
        enabled: true,
        dynamic: true,
        reportOnly: false,
        directives: {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
            'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
            'img-src': ["'self'", 'data:', 'https:'],
            'font-src': ["'self'", 'https:', 'data:'],
            'connect-src': ["'self'", 'https://api.example.com']
        }
    },
    
    // AI-защита
    ai: {
        enabled: true,
        anomalyDetection: true,
        threatPrediction: true,
        modules: {
            xssProtection: true,
            sqlInjectionProtection: true,
            ipReputation: true
        }
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
        },
        paths: {
            '/api/auth/*': {
                windowMs: 60000,
                max: 10
            }
        }
    }
})

// ============================================
// MIDDLEWARE
// ============================================

// 1. Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 2. Кастомный middleware
app.use(customMiddleware)

// 3. FAB Shield — подключаем защиту!
app.use(shield.middleware())

// 4. Логирование запросов
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path} - ${req.ip}`)
    next()
})

// ============================================
// МАРШРУТЫ
// ============================================

// Публичные маршруты
app.use('/', publicRoutes)

// API маршруты
app.use('/api', apiRoutes)

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'express-fab-shield',
        version: '1.0.0',
        shield: {
            version: shield.getVersion(),
            active: shield.isActive()
        },
        timestamp: new Date().toISOString()
    })
})

// Метрики
app.get('/metrics', (req, res) => {
    const metrics = shield.getMetrics()
    res.json(metrics)
})

// ============================================
// ОБРАБОТКА ОШИБОК
// ============================================

app.use((err: any, req: any, res: any, next: any) => {
    console.error('❌ Error:', err)
    
    const status = err.status || 500
    const message = err.message || 'Internal server error'
    
    res.status(status).json({
        error: message,
        status: status,
        timestamp: new Date().toISOString()
    })
})

// 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path,
        timestamp: new Date().toISOString()
    })
})

// ============================================
// ЗАПУСК
// ============================================

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
2. src/routes/public.ts
typescript
import { Router } from 'express'

const router = Router()

// Главная страница
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to FAB Shield with Express!',
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
    })
})

// Тестовый маршрут
router.get('/test', (req, res) => {
    res.json({
        message: 'Test endpoint',
        protected: true,
        timestamp: new Date().toISOString()
    })
})

export default router
3. src/routes/api.ts
typescript
import { Router } from 'express'

const router = Router()

// Защищенные данные
router.get('/data', (req, res) => {
    res.json({
        data: 'This is protected data',
        access: 'granted',
        timestamp: new Date().toISOString()
    })
})

// Аутентификация
router.post('/auth', (req, res) => {
    const { username, password } = req.body
    
    if (!username || !password) {
        return res.status(400).json({
            error: 'Username and password required'
        })
    }
    
    // Простая проверка (в реальном проекте используйте JWT)
    if (username === 'admin' && password === 'admin123') {
        return res.json({
            success: true,
            token: 'fake-jwt-token',
            user: {
                id: 1,
                username: 'admin',
                role: 'admin'
            }
        })
    }
    
    res.status(401).json({
        error: 'Invalid credentials'
    })
})

// Аналитика (с AI защитой)
router.get('/analytics', (req, res) => {
    // AI-защита автоматически анализирует этот запрос
    res.json({
        analytics: {
            requests: 1234,
            threats: 0,
            uptime: '99.99%'
        }
    })
})

export default router
4. src/middleware/custom.ts
typescript
import { Request, Response, NextFunction } from 'express'

export const customMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Добавляем время начала
    (req as any).startTime = Date.now()
    
    // Кастомная логика
    console.log('🔧 Custom middleware executed')
    
    // Добавляем кастомные данные в запрос
    (req as any).custom = {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
    }
    
    next()
}

function generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(7)}`
}
5. package.json
json
{
    "name": "express-fab-shield-example",
    "version": "1.0.0",
    "description": "FAB Shield with Express.js example",
    "main": "dist/index.js",
    "scripts": {
        "build": "tsc",
        "start": "node dist/index.js",
        "dev": "nodemon --exec ts-node src/index.ts",
        "watch": "tsc --watch"
    },
    "dependencies": {
        "@fab-registry/shield": "^1.0.0",
        "express": "^4.18.2",
        "dotenv": "^16.3.1"
    },
    "devDependencies": {
        "@types/express": "^4.17.21",
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
mkdir express-example
cd express-example

# Инициализация
npm init -y

# Установка зависимостей
npm install @fab-registry/shield express dotenv
npm install -D @types/express @types/node typescript ts-node nodemon

# Создаем файлы
mkdir src
touch src/index.ts
touch src/routes/api.ts
touch src/routes/public.ts
touch src/middleware/custom.ts
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
Ожидаемые заголовки
http
Content-Security-Policy: ...
Strict-Transport-Security: max-age=31536000
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Custom-Header: FAB-Shield-Protected
X-Security-Level: high
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Express пример FAB Shield — это:

🚀 Простая интеграция — несколько строк кода

🔒 Полная защита — все security-заголовки

🤖 AI-защита — интеллектуальная безопасность

📊 Мониторинг — метрики и логи

🎯 Гибкость — настройка под ваши нужды

Защитите свое Express приложение с FAB Shield! 🚀

© 2026 ООО «Деворбит». Все права защищены.