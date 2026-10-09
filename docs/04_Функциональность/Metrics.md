# 📊 Metrics — Сбор и анализ метрик

> Подробное руководство по системе **Metrics** в **FAB Shield**  
> Для сбора, анализа, экспорта и визуализации данных о безопасности и производительности Node.js-приложений.

---

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

- количество запросов (`totalRequests`);
- HTTP-методы и маршруты (`byMethod`, `byPath`);
- статусы ответов (`byStatus`);
- время ответа (`avgResponseTime`, `p95ResponseTime`, `p99ResponseTime`);
- ошибки (`errors`).

Размер ответа, requests per second и бакеты 1xx–5xx Shield не считает —
`byMethod`/`byStatus` учитывают фактические значения, которые встретились.

```typescript
// Реальные поля shield.getMetrics()
const m = shield.getMetrics()

console.log({
  totalRequests: m.totalRequests,
  avgResponseTime: m.avgResponseTime,
  errors: m.errors,
  byMethod: m.byMethod,     // { GET: 120, POST: 45, ... }
  byStatus: m.byStatus,     // { '200': 140, '404': 3, ... }
  byPath: m.byPath          // { '/api/data': 80, ... }
})
```

---

### 2. Security Metrics

**Security Metrics** показывают события безопасности.

### Что собирается

- заблокированные запросы (`threatsBlocked`);
- последние обнаруженные угрозы (`threats` — последние 10 записей);
- типы атак (`threatTypes`, `threatStats`).

Отдельных счётчиков аномалий, CSP violations, rate-limit событий и false
positives в `getMetrics()` нет — при необходимости считайте их на своей
стороне (например, в плагине через `onRequest`).

```typescript
// Реальные поля shield.getMetrics()
const m = shield.getMetrics()

console.log({
  threatsBlocked: m.threatsBlocked,
  recentThreats: m.threats,     // последние 10 событий
  threatTypes: m.threatTypes,   // ['xss', 'sqlInjection', ...]
  threatStats: m.threatStats    // { xss: 3, sqlInjection: 1, ... }
})
```

---

### 3. Performance Metrics

**Performance Metrics** помогают понимать влияние FAB Shield и приложения на скорость работы.

### Что собирается

Из метрик FAB Shield доступны (поля `shield.getMetrics()`):

- среднее время обработки запроса (`avgResponseTime`);
- p95 / p99 latency;
- общее число запросов и ошибок;
- uptime процесса Shield.

CPU, память, throughput и число активных соединений Shield **не собирает** —
снимайте их сами средствами Node.js (`process.memoryUsage()`, `os.loadavg()`)
или внешним APM.

```typescript
// Реальные поля, связанные с производительностью
const m = shield.getMetrics()

console.log({
  avgResponseTime: m.avgResponseTime, // мс
  p95ResponseTime: m.p95ResponseTime,
  p99ResponseTime: m.p99ResponseTime,
  totalRequests: m.totalRequests,
  errors: m.errors,
  uptime: m.uptime // мс
})
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

> **Важно:** в текущем API FAB Shield отдельного объекта AI-метрик нет —
> `shield.getAIModule()` возвращает рабочий модуль (`analyze()`, `train()`),
> а не отчёт по точности. Accuracy, false positives/negatives и время анализа
> считайте на своей стороне по размеченным данным; готовых
> `getAIMetrics()`/`accuracy` Shield не отдаёт.

---

### 5. Business Metrics

**Business Metrics** — опциональные пользовательские метрики приложения.
Shield не собирает их автоматически — определяйте и записывайте их в самом
приложении (например, через собственный плагин).

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
  monitoring: {
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
  monitoring: {
    enabled: true,

    // Форматы экспорта
    export: ['prometheus', 'json'],

    // Интервал сбора, сек
    interval: 60,

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
          metric: 'avg_response_time',
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
// Все текущие метрики (снимок)
const allMetrics = shield.getMetrics()

// Экспорт в разных форматах
const json = shield.exportMetrics('json')
const prometheus = shield.exportMetrics('prometheus')
const csv = shield.exportMetrics('csv')

// Текущий статус модулей
const status = shield.getStatus()
```

Истории и агрегаций за период API не хранит — делайте периодические снимки
`getMetrics()` или `exportMetrics('json')` и агрегируйте на своей стороне (см. «Анализ метрик» ниже).

---

### Через Prometheus

```typescript
import express from 'express'
import { FABShield } from '@fab-orbita/shield'

const app = express()
const shield = new FABShield({
  monitoring: {
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

### Данные для дашборда

FAB Shield не рендерит графики сам — он отдаёт данные, а отображение остаётся
за вашим приложением или внешней системой (например, Grafana).

```typescript
// Снимок текущих метрик — источник данных для любого виджета
const m = shield.getMetrics()

m.totalRequests        // всего запросов
m.threatsBlocked       // заблокировано угроз
m.avgResponseTime      // среднее время ответа, мс
m.p95ResponseTime      // 95-й перцентиль, мс
m.p99ResponseTime      // 99-й перцентиль, мс
m.threatStats          // { [тип угрозы]: количество }
m.byPath               // { [путь]: количество }
m.byMethod             // { [метод]: количество }
m.byStatus             // { [код]: количество }
m.uptime               // аптайм, мс
```

### Prometheus-экспорт для Grafana

Отдайте prometheus-экспорт своим маршрутом — Grafana подключается к нему напрямую:

```typescript
import express from 'express'

const app = express()

app.get('/metrics', (_req, res) => {
  res.type('text/plain')
  res.send(shield.exportMetrics('prometheus'))
})
```

JSON и CSV доступны так же — `shield.exportMetrics('json')` и `shield.exportMetrics('csv')` — ими можно питать любой свой фронтенд или чарт-библиотеку.

---

## 🚨 Алерты

### Настройка алертов

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  monitoring: {
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
          metric: 'avg_response_time',
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
| Latency Spike | `p95_response_time` | `> 2000 мс` | Warning |
| Error Rate | `errors_total` | `> 10` за 5 мин | Ops alert |
| Traffic Surge | `total_requests` | `> 10000` за 1 мин | Monitor / alert |

Имена метрик — реальные (Prometheus-экспорт). `monitoring.alerts.rules` — контейнер конфигурации в `MonitoringConfig`; сопоставление правил с метриками и отправку уведомлений реализует потребитель.

---

## 📊 Примеры использования

### 1. Мониторинг атак

```typescript
setInterval(() => {
  const metrics = shield.getMetrics()

  if (metrics.threatsBlocked > 100) {
    console.log('🔴 Обнаружено много атак!')
    sendAlert('Massive attack detected', metrics)
  }
}, 60000)
```

---

### 2. Оптимизация производительности

```typescript
const metrics = shield.getMetrics()

// p95ResponseTime — реальное поле getMetrics(); сам анализ — ваша функция
if (metrics.p95ResponseTime > 500) {
  console.log('⚠️ Высокая задержка, нужно оптимизировать')
  analyzePerformance(metrics) // собственный хелпер приложения
}
```

---

### 3. Анализ метрик

История в памяти не хранится — `getMetrics()` отдаёт текущий снимок.
Для трендов снимайте метрики по расписанию и агрегируйте на своей стороне:

```typescript
const m = shield.getMetrics()

console.log('📈 Текущее состояние:', {
  requests: m.totalRequests,
  threats: m.threatsBlocked,
  p95: m.p95ResponseTime,
  uptime: m.uptime
})

// Периодические снимки для тренда
setInterval(() => {
  fs.appendFileSync('metrics.log', shield.exportMetrics('json') + '\n')
}, 60000)
```

---

### 4. Экспорт security summary

```typescript
const m = shield.getMetrics()

const securitySummary = {
  generatedAt: m.timestamp,
  requests: m.totalRequests,
  threats: { total: m.threatsBlocked, byType: m.threatStats },
  latency: { avg: m.avgResponseTime, p95: m.p95ResponseTime, p99: m.p99ResponseTime },
  errors: m.errors,
  uptime: m.uptime
}

console.log(securitySummary)

// Или готовым JSON-файлом
fs.writeFileSync('security-summary.json', shield.exportMetrics('json'))
```

---

## 🧩 Хранение метрик

Метрики хранятся **только в памяти процесса** (`MetricsCollector`): счётчики,
агрегаты по путям/методам/статусам/типам угроз и буфер последних 1000 событий
угроз. Внешних хранилищ (Redis, база данных) у метрик нет, после перезапуска
процесса счётчики начинаются заново.

Исторического API (запрос за диапазоном дат) нет — для истории делайте
периодические снимки `exportMetrics('json')` и сохраняйте их на своей стороне.

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
shield.reset()
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
| **Email** | [Director@devorbit.ru](mailto:Director@devorbit.ru) |
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

© 2026 ООО «Деворбит» (DEVORBIT LLC)
