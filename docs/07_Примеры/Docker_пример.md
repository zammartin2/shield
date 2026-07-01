# 🐳 Docker пример FAB Shield

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

Этот пример показывает, как использовать FAB Shield в Docker-контейнере. Мы создадим полностью работающее приложение с защитой, которое можно запустить одной командой.

---

## 🏗️ Структура проекта
docker-example/
├── src/
│ └── index.ts # Основной код приложения
├── Dockerfile # Docker образ
├── docker-compose.yml # Docker Compose
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

const app = express()
const port = process.env.PORT || 3000

// Создаем экземпляр FAB Shield
const shield = new FABShield({
    env: process.env.NODE_ENV as any || 'development',
    
    // Настройки безопасности из переменных окружения
    headers: {
        enabled: process.env.SHIELD_HEADERS !== 'false',
        hsts: {
            maxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000'),
            includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS === 'true',
            preload: process.env.HSTS_PRELOAD === 'true'
        }
    },
    
    csp: {
        enabled: process.env.SHIELD_CSP !== 'false',
        dynamic: true,
        trustedCDNs: [
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com'
        ]
    },
    
    ai: {
        enabled: process.env.SHIELD_AI === 'true',
        anomalyDetection: true,
        threatPrediction: true
    },
    
    monitoring: {
        enabled: process.env.SHIELD_MONITORING !== 'false',
        export: ['json']
    }
})

// Подключаем защиту
app.use(shield.middleware())

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'fab-shield-example',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString()
    })
})

// Метрики
app.get('/metrics', (req, res) => {
    const metrics = shield.getMetrics()
    res.json(metrics)
})

// Основной маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'Hello from FAB Shield!',
        protected: true,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    })
})

// Пример API с защитой
app.get('/api/data', (req, res) => {
    res.json({
        data: 'Protected data',
        secured: true
    })
})

// Обработка ошибок
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Error:', err)
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
})

// Запуск
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`)
    console.log(`🛡️ FAB Shield version: ${shield.getVersion()}`)
    console.log(`🔒 Protection: ${shield.isActive() ? 'Active' : 'Inactive'}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})
2. package.json
json
{
    "name": "fab-shield-docker-example",
    "version": "1.0.0",
    "description": "FAB Shield Docker example",
    "main": "dist/index.js",
    "scripts": {
        "build": "tsc",
        "start": "node dist/index.js",
        "dev": "ts-node src/index.ts",
        "docker:build": "docker build -t fab-shield-example .",
        "docker:run": "docker run -p 3000:3000 fab-shield-example"
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
        "ts-node": "^10.9.0"
    }
}
3. tsconfig.json
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
4. Dockerfile
dockerfile
# ============================================
# BUILD STAGE
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходники
COPY . .

# Собираем TypeScript
RUN npm run build

# ============================================
# PRODUCTION STAGE
# ============================================
FROM node:18-alpine

WORKDIR /app

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Копируем .env файл (если есть)
COPY .env .env.production

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# Открываем порт
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запускаем
CMD ["node", "dist/index.js"]
5. docker-compose.yml
yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fab-shield-example
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - SHIELD_HEADERS=true
      - SHIELD_CSP=true
      - SHIELD_AI=true
      - SHIELD_MONITORING=true
      - HSTS_MAX_AGE=31536000
      - HSTS_INCLUDE_SUBDOMAINS=true
      - HSTS_PRELOAD=true
    volumes:
      - ./logs:/app/logs
      - ./metrics:/app/metrics
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    networks:
      - fab-shield-network

  # Опционально: Redis для rate limiting
  redis:
    image: redis:7-alpine
    container_name: fab-shield-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - fab-shield-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Опционально: Grafana для мониторинга
  grafana:
    image: grafana/grafana:latest
    container_name: fab-shield-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=grafana-clock-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - fab-shield-network
    depends_on:
      - app

  # Опционально: Prometheus для метрик
  prometheus:
    image: prom/prometheus:latest
    container_name: fab-shield-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - prometheus_data:/prometheus
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - fab-shield-network
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

networks:
  fab-shield-network:
    driver: bridge

volumes:
  redis_data:
  grafana_data:
  prometheus_data:
6. .env.example
bash
# Application
NODE_ENV=production
PORT=3000

# FAB Shield
SHIELD_HEADERS=true
SHIELD_CSP=true
SHIELD_AI=true
SHIELD_MONITORING=true

# HSTS
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true

# Rate Limiting (если используется)
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100

# Redis (если используется)
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
7. README.md
markdown
# 🐳 FAB Shield Docker Example

## 🚀 Быстрый старт

```bash
# Клонируем
git clone https://github.com/fab-registry/shield-docker-example
cd shield-docker-example

# Копируем .env
cp .env.example .env

# Запускаем
docker-compose up -d

# Проверяем
curl http://localhost:3000
📊 Мониторинг
Приложение: http://localhost:3000

Метрики: http://localhost:3000/metrics

Health: http://localhost:3000/health

Grafana: http://localhost:3001 (admin/admin)

Prometheus: http://localhost:9090

🛠️ Команды
bash
# Сборка
docker-compose build

# Запуск
docker-compose up -d

# Логи
docker-compose logs -f app

# Остановка
docker-compose down

# Остановка с удалением томов
docker-compose down -v
📝 Лицензия
MIT

text

---

## 🚀 Запуск

### 1. Подготовка

```bash
# Создаем проект
mkdir docker-example
cd docker-example

# Создаем файлы (копируем содержимое выше)
nano src/index.ts
nano package.json
nano tsconfig.json
nano Dockerfile
nano docker-compose.yml
nano .env.example
2. Установка
bash
# Устанавливаем зависимости
npm install

# Собираем
npm run build

# Проверяем
npm start
3. Запуск в Docker
bash
# Сборка образа
docker build -t fab-shield-example .

# Запуск
docker run -p 3000:3000 fab-shield-example

# Или через Docker Compose
docker-compose up -d
📊 Мониторинг
Health Check
bash
curl http://localhost:3000/health
Метрики
bash
curl http://localhost:3000/metrics
API
bash
curl http://localhost:3000/api/data
Логи
bash
docker-compose logs -f app
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Docker пример FAB Shield — это:

🐳 Готовое решение — разворачивается одной командой

🔒 Защита из коробки — все security-заголовки включены

📊 Мониторинг — Grafana + Prometheus

🔧 Гибкость — настройка через .env

🚀 Простота — минимальная конфигурация

Развертывайте FAB Shield в Docker легко! 🐳

© 2026 ООО «Деворбит». Все права защищены.