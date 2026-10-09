# 🎯 Threat Detection — Обнаружение и блокировка угроз

---

**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Threat Detection** — обнаружение атак в каждом HTTP-запросе и блокировка
вредоносного трафика до того, как он дойдёт до приложения. Реализация —
AI-модуль (`AIEngine`, конфигурация `ai`) внутри middleware FAB Shield:
анализируются URL, строка запроса, тело, заголовки, User-Agent и IP.

Ключевые свойства:

- 🔍 **Регулярные шаблоны** — большие наборы паттернов по семействам атак;
- 🧠 **AI-скоринг** — аномалии, предсказание угроз, поведенческий анализ;
- 🛡️ **Мгновенная блокировка** — запросы уровня `high`/`critical` получают `403`;
- 📡 **События** — `threat:detected` и `alert` для вашей обработки;
- 📊 **Метрики** — каждый инцидент попадает в `getMetrics()` и Prometheus-экспорт.

---

## 🎯 Обнаруживаемые семейства атак

AI анализирует каждый запрос по большому набору шаблонов-регулярных выражений:

| Семейство атак | Шаблоны |
|---|---:|
| XSS | 60+ |
| SQL-инъекции | 50+ |
| NoSQL-инъекции | 50+ |
| Инъекции команд | 50+ |
| Обход путей | 30+ |
| LDAP-инъекции | 20+ |

Примеры запросов, которые помечаются:

```http
GET /search?q=<script>alert(1)</script>
POST /login  (body: username=admin' OR '1'='1)
GET /files?path=../../etc/passwd
GET /.env
```

Типы угроз, порождаемые движком: `XSS`, `SQL_INJECTION`, `NOSQL_INJECTION`, `CSRF`, `DDOS`, `BRUTE_FORCE`, `PATH_TRAVERSAL`, `COMMAND_INJECTION`, `FILE_INCLUSION`, `RCE`, `SSRF`, `XXE`, `LDAP_INJECTION`, `CUSTOM` — каждый со серьёзностью `low | medium | high | critical`.

Любая угроза уровня `critical` или `high` прерывает запрос с `403` и JSON-телом
`{ error, threats[], requestId, threatScore }`; инцидент фиксируется в метриках
и порождает событие `threat:detected`, а затем `alert`.

---

## ⚙️ Конфигурация

Анализ и блокировка управляются секцией `ai` (`AIConfig`):

```ts
const shield = new FABShield({
  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true,
    userBehaviorAnalysis: true,
    contentAnalysis: true,
    thresholds: { anomalyThreshold: 0.7, threatThreshold: 0.8, trustThreshold: 0.3 },
    blocking: { enabled: true, duration: 900000, maxAttempts: 5 },
  },
});
```

Модули детекторов включаются/выключаются через `ai.modules`
(`xssProtection`, `sqlInjectionProtection`, `userAgentAnalysis`, `ipReputation`,
`behavioralAnalysis`, `contentAnalysis`). Полностью отключить анализ —
`ai: { enabled: false }`.

> ⚠️ **Ограничения:** секция `threatDetection` (`autoBlock`, `detectors`,
> `thresholds`) и `rules` существуют в типах конфигурации, но runtime-логика
> по ним пока не подключена — не полагайтесь на них. Накопительные IP-баны и
> CAPTCHA в продукте отсутствуют; для пороговых действий используйте
> `ai.blocking` и плагины.

---

## 🔌 Кастомные правила

Свои правила детекции реализуйте плагином — `onRequest` может вернуть
`{ block: true, status, message, reason }`, и запрос будет прерван:

```ts
import { FABShield } from '@fab-orbita/shield'

const sqlInjectionRule = {
  name: 'sql-injection-rule',
  onRequest: async (req: any) => {
    const url = decodeURIComponent(req.url ?? '')
    if (/union[\s\S]*select/i.test(url)) {
      return {
        block: true,
        status: 403,
        message: 'Заблокировано кастомным правилом',
        reason: 'custom-sql-rule',
      }
    }
  },
}

const shield = new FABShield({
  plugins: [sqlInjectionRule],
})
```

Подробнее — [Создание плагина](../06_Плагины/Создание_плагина.md).

---

## 📡 События

```ts
// Каждый обнаруженный запрос с угрозами (threats[], requestId, req)
shield.on('threat:detected', ({ threats, requestId, req }) => {
  const types = threats.map((t: any) => t.type).join(', ')
  console.warn(`🚨 ${types} от ${req.ip} [${requestId}]`)
})

// Сводное событие алерта: { type: 'threat' | 'rateLimit', severity, data, timestamp }
shield.on('alert', (alert) => {
  notifier.send(`[${alert.severity}] ${alert.type}`)
})
```

События `threat:detected` и `alert` — штатные события класса `FABShield`
(наследует `EventEmitter`).

---

## 📊 Мониторинг угроз

```ts
const m = shield.getMetrics()

m.threatStats     // { [тип угрозы]: количество }
m.threatTypes     // список типов за период работы
m.threats         // последние 10 событий угроз

// Счётчик заблокированных в Prometheus-экспорте:
// # HELP threats_blocked Total threats blocked
```

Экспорт для внешних систем: `shield.exportMetrics('prometheus' | 'json' | 'csv')`
(см. [`Metrics.md`](./Metrics.md)).

---

## 🔗 Связанные разделы

- **AI-детекция** — [`AI_Detection.md`](./AI_Detection.md)
- **Rate Limiting** — [`Rate_Limiting.md`](./Rate_Limiting.md)
- Секция «Обнаружение атак» в [README](../../README.ru.md#обнаружение-атак)

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
