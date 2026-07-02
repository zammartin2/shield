# 📊 Metrics — Сбор и анализ метрик

> Подробное руководство по системе **Metrics** в **FAB Shield**  
> Для сбора, анализа, экспорта и визуализации данных о безопасности и производительности Node.js-приложений.

---

**Версия:** 1.1.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Metrics** — это система сбора, анализа и визуализации данных о работе **FAB Shield**.

Она помогает понимать, что происходит в приложении:

- сколько запросов проходит через приложение;
- какие угрозы обнаруживаются;
- сколько запросов блокируется;
- как меняется производительность;
- какие IP или маршруты создают нагрузку;
- какие правила и модули срабатывают чаще всего;
- когда нужно реагировать на инцидент.

Metrics превращает security-layer из «черного ящика» в наблюдаемую систему.

---

## 🎯 Что дают метрики

### Ключевые преимущества

| Преимущество | Описание |
|:---|:---|
| **Прозрачность** | Видно, что происходит в системе |
| **Аналитика** | Можно понимать тренды, угрозы и поведение |
| **Оптимизация** | Можно находить узкие места производительности |
| **Безопасность** | Можно быстрее реагировать на инциденты |
| **Отчетность** | Можно показывать эффективность защиты |
| **Диагностика** | Можно быстрее искать ошибки конфигурации |
| **Мониторинг** | Можно подключать Prometheus, Grafana и alerting |

---

## 📊 Типы метрик

### 1. Request Metrics

**Request Metrics** показывают активность HTTP-запросов.

### Что собирается

- количество запросов;
- HTTP-методы;
- маршруты;
- статусы ответов;
- время ответа;
- размер ответа;
- requests per second;
- ошибки клиента и сервера.

```typescript
interface RequestMetrics {
  total: number

  byMethod: {
    GET: number
    POST: number
    PUT: number
    PATCH: number
    DELETE: number
    OPTIONS: number
    OTHER: number
  }

  byStatus: {
    '1xx': number
    '2xx': number
    '3xx': number
    '4xx': number
    '5xx': number
  }

  averageResponseTime: number
  totalDataTransferred: number
  requestsPerSecond: number
}
```

---

### 2. Security Metrics

**Security Metrics** показывают события безопасности.

### Что собирается

- обнаруженные угрозы;
- заблокированные запросы;
- типы атак;
- источники угроз;
- аномалии;
- CSP violations;
- rate limit events;
- false positives.

```typescript
interface SecurityMetrics {
  threatsDetected: number
  threatsBlocked: number

  byType: {
    xss: number
    sqlInjection: number
    csrf: number
    ddos: number
    bruteForce: number
    pathTraversal: number
    commandInjection: number
    bot: number
    other: number
  }

  bySource: {
    [ip: string]: number
  }

  anomaliesDetected: number
  cspViolations: number
  rateLimitHits: number
  falsePositives: number
}
```

---

### 3. Performance Metrics

**Performance Metrics** помогают понимать влияние FAB Shield и приложения на скорость работы.

### Что собирается

- использование CPU;
- использование памяти;
- время обработки;
- p95 / p99 latency;
- throughput;
- active connections;
- latency отдельных модулей.

```typescript
interface PerformanceMetrics {
  cpuUsage: number

  memoryUsage: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }

  processingTime: {
    average: number
    p95: number
    p99: number
    max: number
  }

  throughput: number
  activeConnections: number
}
```

---

### 4. AI Metrics

**AI Metrics** показывают качество и производительность AI-анализа.

### Что собирается

- количество анализов;
- среднее время анализа;
- false positives;
- false negatives;
- найденные угрозы;
- найденные аномалии;
- статус обучения;
- версия модели.

```typescript
interface AIMetrics {
  totalAnalyses: number
  accuracy: number
  falsePositives: number
  falseNegatives: number
  averageAnalysisTime: number
  modelVersion: string
  lastTraining: Date

  trainingStatus:
    | 'idle'
    | 'training'
    | 'completed'
    | 'failed'
}
```

> Метрики точности имеют смысл только при наличии размеченных данных и процесса валидации.

---

### 5. Business Metrics

**Business Metrics** — опциональные пользовательские метрики приложения.

### Что может собираться

- активные пользователи;
- сессии;
- успешные операции;
- ошибки;
- транзакции;
- conversion rate;
- user retention.

```typescript
interface BusinessMetrics {
  activeUsers: number
  totalSessions: number
  successfulOperations: number
  failedOperations: number
  transactionCount: number
  conversionRate: number
  userRetention: number
}
```

> Business Metrics лучше включать только тогда, когда они действительно нужны. Не собирайте лишние персональные данные.

---

## 🔧 Использование

### Базовая конфигурация

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  metrics: {
    enabled: true
  }
})

const metrics = shield.getMetrics()

console.log(metrics)
```

---

### Расширенная конфигурация

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  metrics: {
    enabled: true,

    collect: {
      requests: true,
      security: true,
      performance: true,
      ai: true,
      business: false
    },

    interval: 60,

    storage: {
      type: 'memory',
      retention: 86400,
      maxSize: 10000
    },

    export: {
      prometheus: {
        enabled: true,
        port: 9090,
        path: '/metrics'
      },

      json: {
        enabled: true,
        path: './metrics.json',
        interval: 3600
      },

      webhook: {
        enabled: false,
        url: 'https://monitoring.example.com/metrics',
        interval: 300
      }
    },

    alerts: {
      enabled: true,

      rules: [
        {
          metric: 'threats_blocked',
          threshold: 10,
          window: 60,
          severity: 'high'
        },

        {
          metric: 'response_time',
          threshold: 1000,
          window: 30,
          severity: 'medium'
        }
      ]
    }
  }
})
```

---

## 📈 Доступ к метрикам

### Получение метрик через API FAB Shield

```typescript
// Получить все метрики
const allMetrics = shield.getMetrics()

// Получить конкретную группу метрик
const security = shield.getMetrics('security')

// Получить историю за период
const history = shield.getMetricsHistory({
  from: new Date('2026-06-01'),
  to: new Date('2026-07-01'),
  type: 'security'
})

// Получить агрегированные метрики
const aggregated = shield.getMetricsAggregated({
  groupBy: 'day',
  metrics: ['requests', 'threats']
})
```

---

### Через Prometheus

```typescript
import express from 'express'
import { FABShield } from '@fab-orbita/shield'

const app = express()
const shield = new FABShield({
  metrics: {
    enabled: true
  }
})

app.use(shield.middleware())

app.get('/metrics', async (req, res) => {
  const metrics = await shield.exportMetrics('prometheus')

  res.set('Content-Type', 'text/plain')
  res.send(metrics)
})
```

---

### Через JSON и CSV

```typescript
import fs from 'fs'

// Экспорт в JSON
const jsonMetrics = shield.exportMetrics('json')
fs.writeFileSync('metrics.json', jsonMetrics)

// Экспорт в CSV
const csvMetrics = shield.exportMetrics('csv')
fs.writeFileSync('metrics.csv', csvMetrics)
```

---

## 📊 Визуализация

### Веб-дашборд

```typescript
const dashboard = shield.createDashboard({
  refreshInterval: 5000,

  charts: [
    {
      type: 'line',
      title: 'Запросы в секунду',
      metric: 'requests_per_second'
    },

    {
      type: 'bar',
      title: 'Типы атак',
      metric: 'threats_by_type'
    },

    {
      type: 'gauge',
      title: 'CPU Usage',
      metric: 'cpu_usage',
      min: 0,
      max: 100
    },

    {
      type: 'table',
      title: 'Топ IP',
      metric: 'top_attackers',
      columns: ['ip', 'count', 'type']
    }
  ]
})

app.get('/dashboard', (req, res) => {
  res.send(dashboard.render())
})
```

> В production dashboard должен быть защищен авторизацией и доступен только администраторам.

---

### Графики

```typescript
const chart = shield.createChart({
  type: 'line',
  data: shield.getMetricsHistory(),

  options: {
    title: 'Угрозы по дням',
    xAxis: 'date',
    yAxis: 'count',
    legend: ['XSS', 'SQL Injection', 'DDoS', 'Brute Force']
  }
})

const chartHTML = chart.renderHTML()
```

---

## 🚨 Алерты

### Настройка алертов

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  metrics: {
    alerts: {
      enabled: true,

      rules: [
        {
          name: 'High Threat Rate',
          metric: 'threats_blocked',
          condition: '>',
          threshold: 50,
          window: 60,
          severity: 'critical',

          actions: [
            {
              type: 'email',
              to: 'security@example.com'
            },

            {
              type: 'telegram',
              chatId: process.env.TELEGRAM_CHAT_ID
            },

            {
              type: 'webhook',
              url: process.env.SECURITY_WEBHOOK_URL
            }
          ]
        },

        {
          name: 'Performance Degradation',
          metric: 'response_time',
          condition: '>',
          threshold: 2000,
          window: 120,
          severity: 'warning',

          actions: [
            {
              type: 'webhook',
              url: process.env.MONITORING_WEBHOOK_URL
            }
          ]
        }
      ]
    }
  }
})
```

---

### Примеры alert rules

| Правило | Метрика | Условие | Действие |
|:---|:---|:---|:---|
| High Threat Rate | `threats_blocked` | `> 50` за 60 сек | Critical alert |
| Performance Degradation | `response_time` | `> 2000ms` | Warning |
| CSP Spike | `csp_violations` | `> 20` за 5 мин | Security alert |
| Rate Limit Spike | `rate_limit_hits` | `> 100` за 1 мин | Monitor / alert |
| Error Rate | `5xx` | `> 5%` | Ops alert |

---

## 📊 Примеры использования

### 1. Мониторинг атак

```typescript
setInterval(() => {
  const metrics = shield.getMetrics('security')

  if (metrics.threatsBlocked > 100) {
    console.log('🔴 Обнаружено много атак!')
    sendAlert('Massive attack detected', metrics)
  }
}, 60000)
```

---

### 2. Оптимизация производительности

```typescript
const metrics = shield.getMetrics('performance')

if (metrics.processingTime.p95 > 500) {
  console.log('⚠️ Высокая задержка, нужно оптимизировать')
  analyzePerformance(metrics)
}
```

---

### 3. Анализ трендов

```typescript
const history = shield.getMetricsHistory({
  from: new Date(Date.now() - 7 * 86400000),
  to: new Date()
})

const trends = analyzeTrends(history)

console.log('📈 Тренды:', {
  requests: trends.requests,
  threats: trends.threats,
  performance: trends.performance
})
```

---

### 4. Экспорт security summary

```typescript
const securitySummary = shield.getMetricsAggregated({
  groupBy: 'hour',
  metrics: [
    'threats_detected',
    'threats_blocked',
    'rate_limit_hits',
    'csp_violations'
  ]
})

console.log(securitySummary)
```

---

## 🧩 Storage backends

### Memory

```typescript
const shield = new FABShield({
  metrics: {
    storage: {
      type: 'memory',
      retention: 3600,
      maxSize: 5000
    }
  }
})
```

Подходит для:

- разработки;
- тестов;
- небольших приложений;
- краткосрочной истории.

---

### Redis

```typescript
const shield = new FABShield({
  metrics: {
    storage: {
      type: 'redis',
      url: process.env.REDIS_URL,
      retention: 86400
    }
  }
})
```

Подходит для:

- нескольких инстансов;
- shared metrics;
- distributed rate limiting;
- production-среды.

---

### Database

```typescript
const shield = new FABShield({
  metrics: {
    storage: {
      type: 'database',
      url: process.env.DATABASE_URL,
      retention: 2592000
    }
  }
})
```

Подходит для:

- долгосрочной истории;
- аудита;
- отчетности;
- аналитики.

---

## 📋 Форматы экспорта

| Формат | Назначение |
|:---|:---|
| `prometheus` | Prometheus / Grafana |
| `json` | API и интеграции |
| `csv` | Табличный анализ |
| `html` | Отчеты для просмотра |
| `pdf` | Финальные отчеты |
| `webhook` | Передача в сторонние системы |

---

## 🔐 Безопасность метрик

Метрики могут содержать чувствительную информацию, поэтому их нужно защищать.

### Рекомендации

- не открывайте `/metrics` публично без защиты;
- используйте allowlist IP для Prometheus;
- защищайте dashboard авторизацией;
- не логируйте токены, пароли и cookie;
- маскируйте IP, если это требуется политикой privacy;
- ограничивайте доступ к историческим данным;
- используйте HTTPS;
- не отправляйте персональные данные во внешние системы без правового основания.

---

## 🧪 Отладка

### Проверка включенных метрик

```typescript
const config = shield.getConfig()

console.log(config.metrics)
```

---

### Сброс метрик

```typescript
shield.resetMetrics()
```

---

### Проверка Prometheus export

```bash
curl http://localhost:3000/metrics
```

---

## ✅ Production-чеклист

- [ ] Метрики включены только для нужных модулей
- [ ] `/metrics` не открыт публично без защиты
- [ ] Dashboard защищен авторизацией
- [ ] Настроен Prometheus / Grafana или другой мониторинг
- [ ] Настроены alerts
- [ ] Секреты webhook и Telegram вынесены в environment variables
- [ ] Логи не содержат токены, пароли и cookie
- [ ] Настроена retention policy
- [ ] Для нескольких инстансов используется shared storage
- [ ] Проверена нагрузка от сбора метрик
- [ ] Проверены false positives в security alerts

---

## ⚠️ Важные ограничения

Metrics не защищает приложение сам по себе.

Он помогает видеть, анализировать и реагировать, но не заменяет:

- CSP;
- security headers;
- rate limiting;
- AI Detection;
- IP Reputation;
- WAF;
- DDoS-защиту;
- аудит кода;
- pentest;
- DevSecOps-процессы.

Также важно помнить:

- слишком много метрик может создавать overhead;
- dashboard и `/metrics` нужно защищать;
- внешние webhook-интеграции могут передавать чувствительные данные;
- long-term хранение метрик может требовать compliance-проверки.

---

## 📞 Контакты

| | |
|:---|:---|
| **Автор** | Фабрициус Владимир Николаевич |
| **Компания** | ООО «Деворбит» (DEVORBIT LLC) |
| **Email** | [derector@devorbit.ru](mailto:derector@devorbit.ru) |
| **Реестр** | [fab.devorbit.ru](https://fab.devorbit.ru) |
| **Сайт** | [devorbit.ru](https://devorbit.ru) |
| **GitHub** | [zammartin2/shield](https://github.com/zammartin2/shield) |
| **npm** | [@fab-orbita/shield](https://www.npmjs.com/package/@fab-orbita/shield) |
| **Fab Registry** | [@fab-orbita/shield](https://fab.devorbit.ru/packages/@fab-orbita/shield) |
| **Telegram** | [@fab_shield](https://t.me/fab_shield) |

---

## 🏆 Итог

**Metrics** — это:

- 📊 полная картина работы системы;
- 📈 тренды и аналитика;
- 🚨 быстрые alerts об угрозах;
- 📉 данные для оптимизации производительности;
- 📋 база для отчетности;
- 🔍 инструмент диагностики и мониторинга.

Метрики помогают знать, что происходит в системе, быстрее реагировать на угрозы и принимать решения на основе данных.

---

<p align="center">
**FAB Shield — прозрачная аналитика безопасности для Node.js-приложений.**

Made with ❤️ by **Vladimir Fabrisius**

[GitHub](https://github.com/zammartin2/shield) •
[npm](https://www.npmjs.com/package/@fab-orbita/shield) •
[Fab Registry](https://fab.devorbit.ru/packages/@fab-orbita/shield) •
[Telegram](https://t.me/fab_shield)
</p>

---

© 2026 ООО «Деворбит». Все права защищены.
