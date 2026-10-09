# 📈 Reporting — Генерация отчетов о безопасности

---

**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Reporting** в **FAB Shield** — это сводный JSON-отчёт и экспорт снимка метрик. Всё, что относится к отчётности, сводится к трём вызовам на инстансе:

| Метод | Что делает |
|:---|:---|
| `await shield.generateReport(options?)` | Асинхронный сводный отчёт: id, период, summary, список плагинов |
| `shield.exportMetrics(format?)` | Синхронный текстовый экспорт снимка метрик: `json` / `prometheus` / `csv` |
| `shield.getMetrics()` | Живой снимок счётчиков — подробнее в [Metrics.md](./Metrics.md) |

Встроенного PDF/HTML-рендера, шаблонов, плановой генерации и «отчётов для руководства» нет — см. раздел «Ограничения». Дашборды и графики строятся на стороне вашего приложения или Grafana поверх prometheus-экспорта (см. [Metrics.md](./Metrics.md)).

---

## 📊 Отчёт generateReport()

`generateReport()` — async-метод на инстансе `FABShield`. Возвращает обычный JS-объект (Promise); ничего не пишет на диск и ничего не рендерит.

### Пример

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield()
app.use(shield.middleware())

// Сводка «на сейчас»
const report = await shield.generateReport()

// С явным period — он лишь попадает в поле period ответа
const juneReport = await shield.generateReport({
  period: {
    from: new Date('2026-06-01').toISOString(),
    to: new Date('2026-07-01').toISOString()
  }
})

console.log(juneReport.id, juneReport.summary.totalRequests)
```

### Формат ответа

```typescript
interface GenerateReportResult {
  id: string                 // generateRequestId(): `req-<timestamp>-<rand>`
  generatedAt: string        // ISO-8601
  period: { from: string; to: string }  // options.period либо [создание инстанса, now]
  summary: {
    status: 'active' | 'inactive'      // isActive() на момент вызова
    uptime: number          // мс с момента создания инстанса
    totalRequests: number
    threatsBlocked: number
    errors: number
    avgResponseTime: number // округлённое среднее, мс
  }
  plugins: Array<{ name: string; version: string; enabled: boolean }>
}
```

> **Важно:** `options.period` влияет **только** на поле `period` в ответе. `summary` всегда берётся из текущих накопительных счётчиков `getMetrics()` — за всё время работы процесса Shield, без фильтрации по датам. В `plugins[].enabled` для каждого зарегистрированного плагина всегда `true`.

### getStatus() — статус модулей

```typescript
const status = shield.getStatus()

interface StatusResult {
  status: 'ok' | 'inactive'
  version: string           // например '1.4.2'
  uptime: number            // мс
  active: boolean
  modules: {
    headers: boolean
    csp: boolean
    ai: boolean
    rateLimit: boolean
    monitoring: boolean
  }
  plugins: string[]         // только имена
  metrics: object           // тот же снимок, что и getMetrics()
}
```

---

## 📤 Экспорт метрик exportMetrics()

Синхронный вызов, возвращает строку. Форматы — ровно три: `'json'` (по умолчанию), `'prometheus'`, `'csv'`.

```typescript
const json = shield.exportMetrics() // === 'json', pretty-print
const prom = shield.exportMetrics('prometheus')
const csv  = shield.exportMetrics('csv')
```

### JSON

`JSON.stringify(shield.getMetrics(), null, 2)` — полный снимок: счётчики, p95/p99, последние 10 угроз, `threatStats`, `byPath` / `byMethod` / `byStatus`, `uptime`, `timestamp`.

### Prometheus

Ровно шесть метрик; HELP-строки — из `MetricsCollector.export()`:

| Метрика | Тип | HELP |
|:---|:---|:---|
| `total_requests` | counter | Total requests processed |
| `threats_blocked` | counter | Total threats blocked |
| `avg_response_time` | gauge | Average response time in ms |
| `p95_response_time` | gauge | 95th percentile response time |
| `errors_total` | counter | Total errors |
| `uptime_seconds` | gauge | System uptime in seconds |

Пример вывода (фрагмент — остальные четыре метрики идут тем же формату):

```text
# HELP total_requests Total requests processed
# TYPE total_requests counter
total_requests 142

# HELP threats_blocked Total threats blocked
# TYPE threats_blocked counter
threats_blocked 3
```

### CSV

Один заголовок и одна строка значений — снимок на момент вызова:

```text
totalRequests,threatsBlocked,avgResponseTime,p95ResponseTime,p99ResponseTime,errors
142,3,12,31,40,0
```

### Эндпоинт для Prometheus

Shield **не поднимает** HTTP-эндпоинт сам: `integrations.prometheus` в типах конфигурации — лишь форма настроек, в рантайме порт и scrape-endpoint она не открывает. Отдавайте экспорт своим маршрутом:

```typescript
app.get('/metrics', (_req, res) => {
  res.set('Content-Type', 'text/plain')
  res.send(shield.exportMetrics('prometheus'))
})
```

Дальше Prometheus/Grafana скрейпят `/metrics` по обычной схеме; дашборды — на стороне Grafana (см. [Metrics.md](./Metrics.md)).

---

## 🔗 Связь с событиями

Для реактивной отчётности подписывайтесь на события инстанса (`FABShield extends EventEmitter`; полный список — в README):

| Событие | Полезная нагрузка |
|:---|:---|
| `threat:detected` | `{ threats, requestId, req }` |
| `rateLimit:exceeded` | `{ req, requestId, limit, retryAfter, … }` |
| `alert` | нормализованный `{ type, severity, data, timestamp }` |
| `error` | `(error, req, res)` |

Минимальный агрегатор на стороне приложения:

```typescript
const counters = { threats: 0, rateLimits: 0, errors: 0, alerts: 0 }

shield.on('threat:detected', () => { counters.threats++ })
shield.on('rateLimit:exceeded', () => { counters.rateLimits++ })
shield.on('error', () => { counters.errors++ })
shield.on('alert', () => { counters.alerts++ })

// Периодически снимайте сводку; историю храните на своей стороне
setInterval(async () => {
  const report = await shield.generateReport()
  await saveSnapshot({ ...report, counters: { ...counters } })
}, 60_000)
```

---

## ⚠️ Ограничения

Если вы видели более ранние черновики этой страницы — разделы про нижеперечисленное описывали **несуществующий** API. В текущей версии FAB Shield отчётность — это только `generateReport()`, `exportMetrics()` и `getMetrics()`.

Чего **нет**:

- отчётов `ExecutiveReport` / `SecurityReport` / `TechnicalReport` / `ComplianceReport`, «типов отчётов», секций, шаблонов (Handlebars и др.) и кастомизации через `registerDataProvider`;
- PDF/HTML-рендера, `exportPDF()` / `exportHTML()` / `report.save()`;
- плановой генерации (`reporting.schedule()`, cron, email/webhook-доставки, retention на диске);
- встроенных графиков, диаграмм и дашбордов (`createChart` / `createDashboard`) — дашборды строятся Grafana и иными внешними системами поверх prometheus-экспорта;
- полей `bySource`, `byTime`, `errorRate`, `requestsPerSecond` в `summary` отчёта, prometheus- и CSV-экспорте;
- исторического API: `generateReport()` не фильтрует счётчики по `period` — для истории делайте периодические снимки на своей стороне (см. [Metrics.md](./Metrics.md)).

Поля `byPath` / `byMethod` / `byStatus` / `threatStats` доступны в `getMetrics()` и `exportMetrics('json')`, но не входят в `summary` отчёта.

---

## 📞 Контакты

| | |
|:---|:---|
| **Автор** | Фабрициус Владимир Николаевич |
| **Компания** | ООО «Деворбит» (DEVORBIT LLC) |
| **Email** | [Director@devorbit.ru](mailto:Director@devorbit.ru) |
| **Реестр** | [fab.devorbit.ru](https://fab.devorbit.ru) |

---

## 🏆 Итог

**Reporting** в FAB Shield — это:

- 📊 сводный JSON-отчёт `generateReport()` — id, период, uptime, счётчики, плагины;
- 📤 экспорт снимка метрик `exportMetrics()` — json / prometheus / csv;
- 🔗 реактивная отчётность через события `alert`, `threat:detected`, `rateLimit:exceeded`, `error`;
- 📈 данные для Grafana и внешних дашбордов.

Для детальной аналитики и истории используйте [Metrics.md](./Metrics.md).

---

© 2026 ООО «Деворбит» (DEVORBIT LLC)
