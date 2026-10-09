# 📊 Metrics API — Документация API метрик

---

**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Metrics API** — программный интерфейс для получения, экспорта и отчётности
по метрикам FAB Shield. Описаны только реально реализованные методы класса
`FABShield`: `getMetrics()`, `getStatus()`, `exportMetrics()` и `generateReport()`.

---

## 📥 getMetrics()

Синхронный снимок текущих метрик (хранение — в памяти процесса).

```ts
shield.getMetrics(): Metrics
```

Пример:

```ts
const m = shield.getMetrics()

console.log(m.totalRequests)     // всего запросов
console.log(m.threatsBlocked)    // заблокировано угроз
console.log(m.p95ResponseTime)   // 95-й перцентиль, мс
```

### Поля ответа

| Поле | Тип | Описание |
|---|---|---|
| `totalRequests` | `number` | Всего запросов |
| `threatsBlocked` | `number` | Заблокировано угроз |
| `avgResponseTime` | `number` | Среднее время ответа, мс (округлено) |
| `p95ResponseTime` | `number` | 95-й перцентиль, мс |
| `p99ResponseTime` | `number` | 99-й перцентиль, мс |
| `errors` | `number` | Количество ошибок |
| `threats` | `array` | Последние 10 событий угроз |
| `threatTypes` | `string[]` | Типы угроз за период |
| `threatStats` | `Record<string, number>` | Счётчик по типам угроз |
| `byPath` | `Record<string, number>` | Счётчик по путям |
| `byMethod` | `Record<string, number>` | Счётчик по HTTP-методам |
| `byStatus` | `Record<string, number>` | Счётчик по кодам ответа |
| `uptime` | `number` | Время работы процесса, мс |
| `timestamp` | `Date` | Время снимка |

Аргументов метод не принимает: `getMetrics('security')` и подобные вызовы
**не поддерживаются** — для группировок используйте поля ответа
(`threatStats`, `byPath`, `byMethod`, `byStatus`).

---

## 🩺 getStatus()

```ts
shield.getStatus(): {
  status: 'ok' | 'inactive'
  version: string
  uptime: number
  active: boolean
  modules: {
    headers: boolean
    csp: boolean
    ai: boolean
    rateLimit: boolean
    monitoring: boolean
  }
  plugins: string[]
  metrics: Metrics
}
```

```ts
const status = shield.getStatus()
if (!status.active) console.warn('Shield не активен, версия', status.version)
```

---

## 📤 exportMetrics(format)

```ts
shield.exportMetrics(format: 'json' | 'prometheus' | 'csv'): string
```

### JSON

```ts
const json = shield.exportMetrics('json')
// → JSON-представление getMetrics() с отступами
```

### Prometheus

```ts
const prom = shield.exportMetrics('prometheus')
```

Пример вывода:

```text
# HELP total_requests Total requests processed
# TYPE total_requests counter
total_requests 12345

# HELP threats_blocked Total threats blocked
# TYPE threats_blocked counter
threats_blocked 67

# HELP avg_response_time Average response time in ms
# TYPE avg_response_time gauge
avg_response_time 42

# HELP p95_response_time 95th percentile response time
# TYPE p95_response_time gauge
p95_response_time 180

# HELP errors_total Total errors
# TYPE errors_total counter
errors_total 3

# HELP uptime_seconds System uptime in seconds
# TYPE uptime_seconds gauge
uptime_seconds 3600
```

HTTP-эндпоинт для Scrapera (ваш маршрут — Shield сам сервер не поднимает):

```ts
import express from 'express'

const app = express()

app.get('/metrics', (_req, res) => {
  res.type('text/plain')
  res.send(shield.exportMetrics('prometheus'))
})
```

### CSV

Одна строка заголовка + одна строка значений:

```text
totalRequests,threatsBlocked,avgResponseTime,p95ResponseTime,p99ResponseTime,errors
12345,67,42,180,420,3
```

```ts
const csv = shield.exportMetrics('csv')
fs.writeFileSync('metrics.csv', csv)
```

---

## 📄 generateReport(options?)

Асинхронная сводка для отчётов:

```ts
shield.generateReport(options?: { period?: { from: string; to: string } }): Promise<Report>
```

```ts
const report = await shield.generateReport({
  period: {
    from: new Date(Date.now() - 86400000).toISOString(),
    to: new Date().toISOString(),
  },
})

console.log(report.summary)
// { status, uptime, totalRequests, threatsBlocked, errors, avgResponseTime }
console.log(report.plugins) // [{ name, version, enabled }]
```

Возвращаемый объект: `id`, `generatedAt`, `period`, `summary`, `plugins`.

---

## 📌 Prometheus-метрики

| Метрика | Тип | Описание |
|---|---|---|
| `total_requests` | counter | Всего запросов |
| `threats_blocked` | counter | Заблокировано угроз |
| `avg_response_time` | gauge | Среднее время ответа, мс |
| `p95_response_time` | gauge | 95-й перцентиль, мс |
| `errors_total` | counter | Ошибок |
| `uptime_seconds` | gauge | Аптайм процесса, сек |

---

## ⚠️ Ограничения

Чего API **нет**:

- `getMetricsHistory()` — истории и запросов за диапазон данных нет,
  хранение только в памяти (снимайте `exportMetrics('json')` сами);
- `createDashboard()` / `createChart()` — встроенная визуализации нет,
  стройте дашборды поверх экспорта (Grafana и т.п.);
- `addAlertRule()` — исполнения правил `monitoring.alerts.rules` внутри
  библиотеки нет; правила — контейнер конфигурации, обрабатывает потребитель,
  либо используйте событие `shield.on('alert', ...)` (штатные алерты
  `threat:detected` / `rateLimit:exceeded`);
- `shield.metrics` — поле приватное, работайте через `getMetrics()`.

---

## 🔗 Связанные разделы

- **Обзор метрик** — [`Metrics.md`](../04_Функциональность/Metrics.md)
- **Rate Limiting** — [`Rate_Limiting.md`](../04_Функциональность/Rate_Limiting.md)
- Секция «Экспорт метрик» в [README](../../README.ru.md)

---

## 📞 Контакты

| Поле | Значение |
|---|---|
| Репозиторий | [github.com/zammartin2/shield](https://github.com/zammartin2/shield) |
| Пакет | [@fab-orbita/shield](https://www.npmjs.com/package/@fab-orbita/shield) |
| Email | Director@devorbit.ru |
| Живое демо | [shield.devorbit.ru](https://shield.devorbit.ru/) |

---

© 2026 ООО «Деворбит» (DEVORBIT LLC)
