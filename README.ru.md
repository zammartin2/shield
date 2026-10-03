# FAB Shield

Мидлварь безопасности на TypeScript без рантайм-зависимостей для Node.js — заголовки безопасности, CSP, ограничение частоты запросов, обнаружение атак, метрики и плагины в одном пакете.

<p align="center">
  <a href="https://www.npmjs.com/package/@fab-orbita/shield"><img src="https://img.shields.io/npm/v/@fab-orbita/shield.svg?style=for-the-badge&logo=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@fab-orbita/shield"><img src="https://img.shields.io/npm/dt/@fab-orbita/shield.svg?style=for-the-badge&logo=npm" alt="npm downloads" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License: MIT" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D18.0-brightgreen?style=for-the-badge&logo=node.js" alt="Node.js >= 18" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-ready-blue?style=for-the-badge&logo=typescript" alt="TypeScript ready" /></a>
  <a href="#тестирование-и-покрытие"><img src="https://img.shields.io/badge/tests-1405%20passed-brightgreen?style=for-the-badge&logo=jest" alt="1405 tests passed" /></a>
  <a href="#статус-проекта"><img src="https://img.shields.io/badge/coverage-99.55%25-brightgreen?style=for-the-badge" alt="99.55% coverage" /></a>
</p>

<p align="center">
  <a href="https://lab.devorbit.ru/root/fab-shield">Репозиторий</a> ·
  <a href="https://www.npmjs.com/package/@fab-orbita/shield">npm</a> ·
  <a href="https://lab.devorbit.ru/root/fab-shield/-/tree/main/docs">Документация</a> ·
  <a href="./README.md">English</a> | <strong>Русский</strong>
</p>

---

## Содержание

- [О проекте](#о-проекте)
- [Почему FAB Shield](#почему-fab-shield)
- [Установка](#установка)
- [Быстрый старт](#быстрый-старт)
- [Конфигурация](#конфигурация)
- [Примеры для фреймворков](#примеры-для-фреймворков)
- [Заголовки безопасности](#заголовки-безопасности)
- [Политика безопасности контента](#политика-безопасности-контента)
- [Ограничение частоты запросов](#ограничение-частоты-запросов)
- [Обнаружение атак](#обнаружение-атак)
- [Система плагинов](#система-плагинов)
- [Метрики и мониторинг](#метрики-и-мониторинг)
- [Архитектура](#архитектура)
- [TypeScript](#typescript)
- [Тестирование и покрытие](#тестирование-и-покрытие)
- [Безопасность](#безопасность)
- [Что FAB Shield не заменяет](#что-fab-shield-не-заменяет)
- [Дорожная карта](#дорожная-карта)
- [Статус проекта](#статус-проекта)
- [История изменений](#история-изменений)
- [Участие](#участие)
- [Сообщество](#сообщество)
- [FAQ](#faq)
- [DEVORBIT LLC](#devorbit-llc)
- [Лицензия](#лицензия)

---

## О проекте

**FAB Shield** (`@fab-orbita/shield`) — фреймворк-мидлварь безопасности для приложений на Node.js, написанный на TypeScript. Вместо стопки отдельных пакетов он даёт один настраиваемый слой защиты: заголовки безопасности, Content Security Policy, ограничение частоты запросов, обнаружение атак по шаблонам, метрики с экспортом в JSON/Prometheus/CSV и расширяемый конвейер плагинов.

Ключевые свойства:

| Свойство | Значение |
|---|---|
| Рантайм-зависимости | **0** |
| Node.js | `>= 18` |
| Язык / форматы | TypeScript, типы в комплекте, ESM + CommonJS |
| Фреймворки | Express 4/5, Fastify 4, Koa 2 (необязательные peer-зависимости) |
| Лицензия | MIT |

FAB Shield подходит для REST- и GraphQL-интерфейсов, SaaS-бэкендов, админ-панелей, микросервисов и любых сервисов на Node.js, которым нужен единый базовый уровень HTTP-безопасности.

---

## Почему FAB Shield

Большинство проектов собирают безопасность из множества несвязанных пакетов: один — для заголовков, другой — для CSP, третий — для ограничения частоты запросов, четвёртый — для анализа запросов, плюс собственный «клей» для метрик и оповещений. Каждая интеграция — ещё одно место для расхождений и ошибок конфигурации.

FAB Shield объединяет эти задачи в одном мидлваре с единственным объектом конфигурации — см. [Быстрый старт](#быстрый-старт): настройка в три строки.

Принципы проектирования:

- **Ноль рантайм-зависимостей** — сверять придётся только сам пакет; сетевого I/O нет.
- **Безопасно по умолчанию, настраиваемо конфигурацией** — заголовки и CSP включены сразу; ограничение частоты запросов включается по желанию.
- **Работает там, где работаете вы** — мидлварь в стиле Express плюс отдельные защитные обёртки для Fastify и Koa.
- **Наблюдаемость** — структурированные метрики, события и отчёты вместо молчаливых блокировок.
- **Расширяемость** — плагины подключаются к конвейеру запросов без форка ядра.

---

## Установка

| Менеджер пакетов | Команда |
|---|---|
| npm | `npm install @fab-orbita/shield` |
| Yarn | `yarn add @fab-orbita/shield` |
| pnpm | `pnpm add @fab-orbita/shield` |
| Fab Registry | `npm install @fab-orbita/shield --registry=https://fab.devorbit.ru` |

### Требования

Node.js `>= 18.0.0`. TypeScript необязателен (типы входят в пакет). Фреймворки — **необязательные peer-зависимости** — установите только тот, которым пользуетесь: `express` `^4.18.2 || ^5.0.0`, `fastify` `^4.0.0` или `koa` `^2.0.0`. Самому FAB Shield ни один из них не нужен.

---

## Быстрый старт

```ts
import express from "express";
import { FABShield } from "@fab-orbita/shield";

const app = express();
const shield = new FABShield();

app.use(shield.middleware());

app.get("/", (req, res) => {
  res.json({ message: "FAB Shield protects this application" });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
```

Каждый ответ теперь содержит корреляционные заголовки, которые задаёт мидлварь (`X-Request-ID`, `X-Shield-Version: 1.4.0`, `X-Shield-Status: active`), а также заголовки безопасности из раздела [Заголовки безопасности](#заголовки-безопасности). Заблокированные запросы получают структурированный JSON:

- `429` — превышен лимит запросов (`retryAfter`, `limit`, `reset`);
- `403` — обнаружена угроза критической или высокой серьёзности (`threats[]` с типом, серьёзностью и достоверностью);
- `500` — непредвиденная ошибка мидлваря (`requestId` для корреляции в журналах).

---

## Конфигурация

Вся конфигурация задаётся одним объектом `Partial<ShieldConfig>`, который передаётся в конструктор:

```ts
const shield = new FABShield({ /* ShieldConfig */ });
```

### Справочник ключей конфигурации

Верхнеуровневые ключи `ShieldConfig`:

| Ключ | Тип | По умолчанию | Описание |
|---|---|---|---|
| `env` | `'development' \| 'production' \| 'test'` | `'development'` | Имя окружения (проверяется) |
| `enabled` | `boolean` | — | Главный флаг включения (см. `SHIELD_ENABLED`) |
| `name` | `string` | — | Имя экземпляра |
| `version` | `string` | — | Метка версии экземпляра |
| `headers` | `HeaderConfig` | enabled | Модуль заголовков безопасности |
| `csp` | `CSPConfig` | enabled, dynamic | Модуль Content Security Policy |
| `ai` | `AIConfig` | enabled | Модуль анализа атак и аномалий |
| `rateLimit` | `RateLimitConfig` | **disabled**, `100 / 60000` | Ограничитель частоты запросов |
| `monitoring` | `MonitoringConfig` | enabled, `export: ['json']` | Настройки сбора метрик |
| `threatDetection` / `ipReputation` / `rules` | `ThreatDetectionConfig` / `IPReputationConfig` / `any[]` | — | Пороги детекторов и правила авто-блокировки, источники репутации и гео-блокировка, хранилище пользовательских правил |
| `plugins` | `Plugin[]` | `[]` | Плагины, регистрируемые при создании экземпляра |
| `logging` | `LoggingConfig` | `info` / `json` | Уровень, формат и каналы журналирования |
| `cache` / `performance` / `integrations` / `webhooks` | `CacheConfig` / `PerformanceConfig` / `IntegrationConfig` / `WebhookConfig[]` | — | Хранилище кэша, настройки производительности, внешние интеграции, исходящие вебхуки |

Значения, переданные в конструктор, имеют приоритет над переменными окружения; переменные окружения — над встроенными значениями по умолчанию.

### Справочник вложенных объектов

**`headers`**

| Поле | Тип | По умолчанию | Действие |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Главный переключатель модуля заголовков |
| `disabled` | `string[]` | `[]` | Имена заголовков, удаляемых после применения |
| `custom` | `Record<string, string>` | `{}` | Произвольные заголовки, добавляемые в каждый ответ |
| `hsts` | `{ enabled, maxAge, includeSubDomains, preload }` | `31536000` / `true` / `true` | Значение `Strict-Transport-Security` |
| `xFrame` | `{ enabled, action, allowedOrigins[] }` | `action: 'DENY'` | `X-Frame-Options`: `DENY`, `SAMEORIGIN`, `ALLOW-FROM` |
| `referrerPolicy` | `{ enabled, policy }` | `strict-origin-when-cross-origin` | `Referrer-Policy` |
| `crossOrigin` | `{ embedder, opener, resource }` | `opener: 'same-origin'` | `Cross-Origin-Embedder/Opener/Resource-Policy` |
| `xContentTypeOptions` | `boolean` | `true` | `X-Content-Type-Options: nosniff` |
| `xXssProtection` | `boolean` | `true` | `X-XSS-Protection: 1; mode=block` |
| `xDnsPrefetchControl` | `boolean` | `true` | `X-DNS-Prefetch-Control: off` |
| `xDownloadOptions` | `boolean` | `true` | `X-Download-Options: noopen` |
| `xPermittedCrossDomainPolicies` | `boolean` | `true` | `X-Permitted-Cross-Domain-Policies: none` |
| `xPoweredBy` | `boolean` | — | Флаг обработки баннера фреймворка |

**`csp`**

| Поле | Тип | По умолчанию | Действие |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Выдавать `Content-Security-Policy` |
| `dynamic` | `boolean` | `true` | Флаг динамического режима политики |
| `reportOnly` | `boolean` | — | Флаг режима Report-Only |
| `strict` | `boolean` | — | Флаг строгого пресета |
| `directives` | `Record<string, string[]>` | встроенные значения по умолчанию | Директивы политики с каноническими именами CSP (`'default-src'`, `'script-src'`, …) |
| `trustedCDNs` | `string[]` | `[]` | Хосты, добавляемые в `script-src` и `style-src` |
| `trustedOrigins` | `string[]` | `[]` | Список доверенных источников |
| `nonceEnabled` | `boolean` | — | Флаг режима nonce (его длина — `nonceLength`) |
| `nonceLength` | `number` | `32` | Длина, используемая хелпером nonce |
| `reporting` | `{ enabled, uri, reportTo }` | — | Настройки точки отчётности |
| `exceptions` | `any[]` | `[]` | Исключения на уровне путей |

**`ai`**

| Поле | Тип | По умолчанию | Действие |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Запускать анализ запросов в конвейере |
| `anomalyDetection` | `boolean` | `true` | Оценка аномалий |
| `threatPrediction` | `boolean` | `true` | Прогнозная оценка угроз |
| `userBehaviorAnalysis` | `boolean` | — | Флаг анализа поведения |
| `contentAnalysis` | `boolean` | — | Флаг анализа содержимого тела запроса |
| `modules` | `{ xssProtection, sqlInjectionProtection, userAgentAnalysis, ipReputation, behavioralAnalysis, contentAnalysis }` | — | Шесть отдельных переключателей детекторов |
| `thresholds` | `{ anomalyThreshold, threatThreshold, trustThreshold }` | — | Пороги принятия решений по аномалиям, угрозам и доверию |
| `learning` | `{ enabled, mode: 'continuous' \| 'batch', interval, sampleSize, feedbackEnabled }` | — | Настройки цикла обучения |
| `blocking` | `{ enabled, duration, maxAttempts }` | — | Временная блокировка после повторных срабатываний |

**`rateLimit`** (по умолчанию выключен)

| Поле | Тип | По умолчанию | Действие |
|---|---|---|---|
| `enabled` | `boolean` | `false` | Включает ограничитель; хранилище создаётся и удаляется при переключении |
| `default` | `{ max, windowMs }` | `{ max: 100, windowMs: 60000 }` | Глобальный лимит (`max >= 1`, `windowMs >= 1000`) |
| `paths` | `Record<pattern, { max, windowMs }>` | `{}` | Лимиты по путям; `*` в ключе преобразуется в регулярное выражение |
| `roles` | `Record<role, { max, windowMs }>` | `{}` | Лимиты, задаваемые по `req.user.role` |
| `keyGenerator` | `(req) => string` | `req.ip` | Функция ключа клиента |
| `whitelist` | `{ enabled, ips[], users[], apiKeys[] }` | — | Списки исключений: IP, пользователи, ключи API |

**`monitoring`**

| Поле | Тип | По умолчанию | Действие |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Флаг модуля мониторинга, отображаемый в `getStatus()` |
| `export` | `string[]` | `['json']` | Предпочтительные форматы экспорта |
| `interval` | `number` | — | Интервал сбора (мс) |
| `alerts` | `{ enabled, rules[] }` | — | Конфигурация правил оповещений |

**`logging`**

| Поле | Тип | По умолчанию | Действие |
|---|---|---|---|
| `level` | `debug \| info \| warn \| error \| fatal` | `'info'` | Минимальный уровень (проверяется) |
| `format` | `'json' \| 'text'` | `'json'` | Формат строки журнала |
| `transports` | `[{ type: 'console' \| 'file' \| 'remote', … }]` | console | `console` работает; типы `file` и `remote` объявлены, но пока ничего не пишут |
| `include` | `{ requests, threats, errors, performance, metrics }` | — | Категории событий для журналирования |
| `exclude` | `{ headers[], body[] }` | — | Поля, которые не попадают в журналы |

### Значения по умолчанию

```ts
{
  env: "development",
  headers: { enabled: true, hsts: { maxAge: 31536000, includeSubDomains: true, preload: true } },
  csp: { enabled: true, dynamic: true },
  ai: { enabled: true, anomalyDetection: true, threatPrediction: true },
  monitoring: { enabled: true, export: ["json"] },
  rateLimit: { enabled: false, default: { max: 100, windowMs: 60000 } },
  logging: { level: "info", format: "json" },
}
```

### Проверка

Конструктор проверяет объединённую конфигурацию и выбрасывает исключение при недопустимых значениях: `headers.hsts.maxAge >= 0`; `rateLimit.default.max >= 1`; `rateLimit.default.windowMs >= 1000`; `logging.level` ∈ `debug | info | warn | error | fatal`; `env` ∈ `development | production | test`.

### Переменные окружения

Префикс — **`SHIELD_`** (плюс несколько общих имён вроде `NODE_ENV`, `HSTS_*`, `RATE_LIMIT_*`, `LOG_*`). Загрузки конфигурации из JSON-файла также **нет**: `new FABShield()` никогда не читает файлы, поэтому конфигурация поступает только из значений по умолчанию, переменных окружения и аргумента конструктора.

| Переменная | Значения | По умолчанию | Действие |
|---|---|---|---|
| `NODE_ENV` | `development` \| `production` \| `test` | — | `config.env` |
| `SHIELD_ENABLED` | `'true'` → вкл | active | `enabled` |
| `SHIELD_HEADERS` | `'true'` → вкл | `true` | `headers.enabled` |
| `SHIELD_CSP` | `'true'` → вкл | `true` | `csp.enabled` |
| `SHIELD_AI` | `'true'` → вкл | `true` | `ai.enabled` |
| `SHIELD_MONITORING` | `'true'` → вкл | `true` | `monitoring.enabled` |
| `SHIELD_NAME` | строка | — | `name` |
| `HSTS_MAX_AGE` | целое число секунд | `31536000` | `headers.hsts.maxAge`; управляет двумя переменными ниже |
| `HSTS_INCLUDE_SUBDOMAINS` | `!== 'false'` | `true` | `headers.hsts.includeSubDomains` |
| `HSTS_PRELOAD` | `=== 'true'` | `false`, если `HSTS_MAX_AGE` задан без неё | `headers.hsts.preload` — если задать только `HSTS_MAX_AGE`, preload будет **выключен**, пока дополнительно не задано `HSTS_PRELOAD=true` |
| `RATE_LIMIT_MAX` | целое `>= 1` | — | Задаёт `rateLimit.default.max` **и включает ограничение частоты запросов** |
| `RATE_LIMIT_WINDOW` | целое мс | `60000` | `rateLimit.default.windowMs` |
| `RATE_LIMIT_ENABLED` | `!== 'false'` | `true` | Не действует, пока не задан `RATE_LIMIT_MAX` |
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error` \| `fatal` | `info` | `logging.level`; управляет `LOG_FORMAT` |
| `LOG_FORMAT` | `json` \| `text` | `json` | Применяется только при заданном `LOG_LEVEL` |

```env
NODE_ENV=production
HSTS_MAX_AGE=63072000
HSTS_PRELOAD=true
RATE_LIMIT_MAX=120
LOG_LEVEL=warn
```

### Рекомендуемая настройка для продакшена

```ts
import { FABShield } from "@fab-orbita/shield";

const shield = new FABShield({
  env: "production",

  headers: {
    enabled: true,
    hsts: { enabled: true, maxAge: 31536000, includeSubDomains: true, preload: true },
    xFrame: { action: "SAMEORIGIN" },
    referrerPolicy: { enabled: true, policy: "strict-origin-when-cross-origin" },
  },

  csp: {
    enabled: true,
    nonceEnabled: true,
    nonceLength: 32,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:"],
      "connect-src": ["'self'"],
      "frame-ancestors": ["'none'"],
    },
    trustedCDNs: ["https://cdn.jsdelivr.net"],
  },

  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true,
    thresholds: { anomalyThreshold: 0.7, threatThreshold: 0.8, trustThreshold: 0.3 },
    blocking: { enabled: true, duration: 900000, maxAttempts: 5 },
  },

  rateLimit: {
    enabled: true,
    default: { max: 120, windowMs: 60000 },
    paths: {
      "/api/login": { max: 5, windowMs: 900000 },
      "/api/*": { max: 300, windowMs: 60000 },
    },
    keyGenerator: (req) => req.ip,
  },

  monitoring: { enabled: true, export: ["json"] },
  logging: { level: "info", format: "json" },
});
```

Перед выкаткой прогоните конфигурацию на трафике стенда: строгая CSP и агрессивные лимиты — два параметра, которые с наибольшей вероятностью скажутся на легитимных клиентах.

---

## Примеры для фреймворков

### Express

Работает с Express 4 и 5 (необязательная peer-зависимость).

```ts
import express from "express";
import { FABShield } from "@fab-orbita/shield";

const app = express();
const shield = new FABShield({ env: "production" });

app.use(express.json());
app.use(shield.middleware());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: shield.getVersion() });
});

app.listen(3000);
```

### Fastify

`protect()` оборачивает мидлварь в стиле Express в промис для хуков Fastify.

```ts
import Fastify from "fastify";
import { FABShield } from "@fab-orbita/shield";

const app = Fastify();
const shield = new FABShield();

app.addHook("onRequest", async (request, reply) => {
  await shield.protect(request, reply);
});

app.get("/", async () => {
  return { message: "Protected by FAB Shield" };
});

app.listen({ port: 3000 });
```

### Koa

`koa(ctx, next)` адаптирует конвейер под контекст Koa и передаёт ошибки в `next`.

```ts
import Koa from "koa";
import { FABShield } from "@fab-orbita/shield";

const app = new Koa();
const shield = new FABShield();

app.use(async (ctx, next) => {
  await shield.koa(ctx, next);
});

app.use(async (ctx) => {
  ctx.body = { message: "Protected by FAB Shield" };
});

app.listen(3000);
```

---

## Заголовки безопасности

Модуль заголовков записывает в ответ следующие заголовки (показаны значения по умолчанию):

| Заголовок | Формируемое значение |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` (или `SAMEORIGIN` / `ALLOW-FROM`) |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-DNS-Prefetch-Control` | `off` |
| `X-Download-Options` | `noopen` |
| `X-Permitted-Cross-Domain-Policies` | `none` |
| `Cross-Origin-Opener-Policy` | `same-origin` (по умолчанию) |
| `Cross-Origin-Embedder-Policy` | только если задан `crossOrigin.embedder` |
| `Cross-Origin-Resource-Policy` | только если задан `crossOrigin.resource` |
| `Origin-Agent-Cluster` | `?1` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` |
| `X-Request-ID`, `X-Shield-Version`, `X-Shield-Status` | корреляционные заголовки, добавляемые `middleware()` |

`X-Powered-By` и `Server` удаляются из каждого ответа. `Content-Security-Policy` отдельно выдаёт модуль CSP (см. ниже).

```ts
const shield = new FABShield({
  headers: {
    enabled: true,
    hsts: { enabled: true, maxAge: 63072000, includeSubDomains: true, preload: true },
    xFrame: { action: "SAMEORIGIN" },
    referrerPolicy: { enabled: true, policy: "no-referrer" },
    crossOrigin: { opener: "same-origin", resource: "same-origin" },
    custom: { "X-Robots-Tag": "noindex" },
    disabled: ["X-Download-Options"],
  },
});
```

Заголовки `custom` применяются дословно поверх встроенного набора; имена из `disabled` удаляются в последнюю очередь и потому имеют приоритет над всеми перечисленными выше. Задайте `headers: { enabled: false }`, чтобы полностью пропустить модуль.

---

## Политика безопасности контента

Без конфигурации CSP выдаётся с надёжной политикой по умолчанию:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests
```

Пользовательские директивы заменяют значения по умолчанию — ключи должны использовать канонические имена CSP:

```ts
const shield = new FABShield({
  csp: {
    enabled: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'", "https://api.example.com"],
      "frame-ancestors": ["'none'"],
    },
    trustedCDNs: ["https://cdn.jsdelivr.net"],
    trustedOrigins: ["https://app.example.com"],
    reporting: { enabled: true, uri: "/csp-report", reportTo: "/csp-report-to" },
  },
});
```

- элементы `trustedCDNs` добавляются к `script-src` и `style-src` без дублирования уже существующих значений;
- пустые массивы директив пропускаются при сборке строки заголовка;
- хелпер nonce генерирует случайные строки base62 для сценариев со встроенными скриптами:

```ts
const nonce = shield.getCSPModule().generateNonce(32);
// include the nonce in directives yourself, e.g. script-src 'self' 'nonce-...'
```

Чтобы выключить модуль: `csp: { enabled: false }`.

---

## Ограничение частоты запросов

Ограничение частоты запросов **по умолчанию выключено**. Включите его явно либо задайте `RATE_LIMIT_MAX`.

```ts
const shield = new FABShield({
  rateLimit: {
    enabled: true,
    default: { max: 100, windowMs: 60000 },
    paths: {
      "/api/login": { max: 5, windowMs: 900000 },
      "/api/signup": { max: 3, windowMs: 3600000 },
      "/api/*": { max: 300, windowMs: 60000 },
    },
    roles: {
      admin: { max: 1000, windowMs: 60000 },
      user: { max: 300, windowMs: 60000 },
    },
    keyGenerator: (req) => req.apiKey || req.ip,
  },
});
```

Поведение:

- клиенты идентифицируются функцией `keyGenerator(req)` (по умолчанию: `req.ip`) в хранилище в памяти на каждый экземпляр;
- сначала сопоставляются шаблоны путей (`*` преобразуется в регулярное выражение), затем роли (`req.user.role`), затем общий лимит;
- когда клиент превышает лимит, мидлварь отвечает `429` с телом:

```json
{
  "error": "Too many requests",
  "requestId": "req-1727932800000-a1b2c3d",
  "retryAfter": 42,
  "limit": 100,
  "remaining": 0,
  "reset": "2026-10-03T12:00:00.000Z"
}
```

Превышение лимита также порождает событие `rateLimit:exceeded` (переиздаётся как `alert`); `whitelist.ips` / `whitelist.users` / `whitelist.apiKeys` — объявленные списки исключений для доверенных клиентов. Типичные цели: вход в систему, регистрация, сброс пароля, публичные маршруты API, вебхуки и админ-эндпоинты — брутфорс, подбор учётных данных, спам по API и всплески трафика.

---

## Обнаружение атак

Модуль AI анализирует каждый запрос (URL, строку запроса, тело, заголовки, User-Agent, IP) по большому набору шаблонов-регулярных выражений:

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

Угрозы фиксируются в метриках; любая угроза уровня `critical` или `high` прерывает запрос с `403` (JSON-тело с типом, серьёзностью и достоверностью) и порождает `threat:detected`, а затем `alert` с IP клиента и путём.

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

Полностью отключить анализ можно параметром `ai: { enabled: false }`.

---

## Система плагинов

Плагин — обычный объект. Поле `name` обязательно; `middleware` выполняется внутри конвейера shield в стиле Express как `(req, res, next)`.

```ts
const auditPlugin = {
  name: "audit-logger",
  version: "1.0.0",

  middleware(req, res, next) {
    console.log(`[AUDIT] ${req.method} ${req.url}`);
    next();
  },
};

const shield = new FABShield({
  plugins: [auditPlugin],
});
```

Плагины, переданные в `config.plugins`, регистрируются при создании экземпляра; остальными можно управлять во время работы:

```ts
shield.registerPlugin(auditPlugin);
shield.unregisterPlugin("audit-logger");
```

### Хуки

| Хук | Сигнатура | Назначение |
|---|---|---|
| `onInit` / `onStart` / `onStop` / `onDestroy` | `(context) => void` | Жизненный цикл |
| `onRequest` | `(req, context) => PluginResult \| void` | Проверить или заблокировать: вернуть `{ block: true, status: 403, message: "…" }` |
| `middleware` | `(req, res, next) => void` | Шаг конвейера в стиле Express |
| `onResponse` | `(res, context) => void` | Постобработка |
| `onError` | `(error, context) => void` | Обработка сбоев |
| `api` | `Record<string, (context, ...args) => any>` | Именованные функции, вызываемые другими плагинами |

### Контекст плагина

`PluginContext` даёт каждому плагину доступ к `getConfig(name?)`, `setConfig`, `getShield()`, `getMetrics()`, `getServer()`, `log(level, message)`, хранилищу на каждый запрос (`storage`: `get`/`set`/`delete`/`clear`/`getAll`), подписке на события через `on(event, handler)` / `emit` и небольшим утилитам (`generateId`, `getTimestamp`, `isIP`, `isURL`, `isEmail`). Типичные плагины: журналирование аудита, гео-блокировка, защита по ключам API, мосты для уведомлений, интеграция с WAF, укрепление админ-панели.

---

## Метрики и мониторинг

### Сбор

`getMetrics()` возвращает актуальные счётчики: `totalRequests`, `threatsBlocked`, `avgResponseTime`, `p95ResponseTime`, `p99ResponseTime`, `errors`, `threats` (последние 10), `threatStats`, `byPath`, `byMethod`, `byStatus`, `uptime`, `timestamp`.

### Экспорт

`exportMetrics(format)` поддерживает ровно три формата: `'json'`, `'prometheus'`, `'csv'` — вызывайте, например, так: `shield.exportMetrics("prometheus")`. `generateReport()` формирует сводный объект (период, аптайм, итоги, список плагинов), пригодный для дашбордов или плановых задач.

### События

Подписывайтесь через `shield.on(event, handler)` — shield расширяет `EventEmitter`. События: `request:processed` (`{ req, res, duration, requestId, threatsDetected }`), `threat:detected` (`{ threats, requestId, req }`), `rateLimit:exceeded` (`{ req, requestId, limit, retryAfter }`), нормализованное `alert`, `error`, `config:updated`, `plugin:registered`, `plugin:unregistered`, `started`, `stopped`, `reset`.

`monitoring.export` и `monitoring.alerts` несут предпочтительные форматы экспорта и правила оповещений в конфигурации; `getStatus()` сообщает, какие модули включены.

---

## Архитектура

```text
Client request
      │
      ▼
┌──────────────────────── FAB Shield middleware ───────────────────────┐
│ 1. Correlation headers   X-Request-ID / X-Shield-Version / Status    │
│ 2. Rate limiter          429 + rateLimit:exceeded                    │
│ 3. Security headers      HeadersModule                               │
│ 4. Content-Security-Policy  CSPModule                                │
│ 5. Attack analysis       AIModule  → 403 + threat:detected           │
│ 6. Plugin pipeline       PluginManager (onRequest + middleware)      │
│ 7. Metrics               MetricsCollector + request:processed        │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ next()
                                ▼
                        Your Node.js application
```

Структура исходников: `src/core/` (`FABShield`, `ConfigManager`, `ContextManager`), `src/modules/` (`headers`, `csp`, `ai`, `rate-limit`, `plugins`, `metrics`), `src/middleware/` (внутренние обёртки в стиле Express), `src/types/` и `src/utils/`.

- **ConfigManager** объединяет значения по умолчанию → переменные окружения → аргумент конструктора, проверяет результат и защищает от prototype pollution;
- **ContextManager** отслеживает контекст каждого запроса и предоставляет `getContextStats()`;
- всё выполняется внутри процесса: без сокетов, без внешних сервисов, только хранилища в памяти.

---

## TypeScript

Пакет поставляет файлы объявлений и экспортирует ровно один класс (`FABShield`) плюс типы `ShieldConfig`, `HeaderConfig`, `CSPConfig`, `AIConfig`, `MonitoringConfig`, `RateLimitConfig`, `LoggingConfig`, `Plugin`, `PluginContext`, `Threat`, `ThreatSeverity` и `ThreatType`:

```ts
import { FABShield } from "@fab-orbita/shield";
import type { ShieldConfig, Plugin, Threat } from "@fab-orbita/shield";

const config: Partial<ShieldConfig> = {
  env: "production",
  headers: { enabled: true, xFrame: { action: "SAMEORIGIN" } },
};

const shield = new FABShield(config);
```

### Справочник класса

| Член | Сигнатура | Описание |
|---|---|---|
| constructor | `new FABShield(config?: Partial<ShieldConfig>)` | Создаёт и проверяет экземпляр |
| `middleware()` | `() => (req, res, next) => void` | Мидлварь в стиле Express |
| `protect(req, res)` | `Promise<void>` | Ожидаемый вызов защиты (хуки Fastify) |
| `koa(ctx, next)` | `Promise<void>` | Защита для Koa |
| `getInstance()` | `static FABShield \| null` | Первый созданный экземпляр (помощник-синглтон) |
| `getMetrics()` | `() => object` | Снимок актуальных метрик |
| `getConfig()` | `() => ShieldConfig` | Действующая конфигурация |
| `updateConfig(partial)` | `(Partial<ShieldConfig>) => void` | Обновление конфигурации во время работы (хранилище rate-limit сохраняется) |
| `getVersion()` | `() => string` | Версия пакета (`1.4.0`) |
| `isActive()` / `start()` / `stop()` | — | Переключают конвейер без пересоздания |
| `registerPlugin(p)` / `unregisterPlugin(name)` | — | Управление плагинами во время работы |
| `exportMetrics(format)` | `'json' \| 'prometheus' \| 'csv'` | Экспорт снимка метрик в текст |
| `generateReport(options?)` | `Promise<object>` | Сводка за период для дашбордов |
| `getStatus()` | `() => object` | Статус, версия, аптайм, включённые модули, плагины |
| `reset()` / `destroy()` | — | Очистка метрик / полный демонтаж (освобождает синглтон) |
| аксессоры | `getContextManager`, `getPluginManager`, `getAIModule`, `getRateLimiter`, `getHeadersModule`, `getCSPModule`, `getContextStats` | Внутренние менеджеры для продвинутых сценариев |

---

## Тестирование и покрытие

| Показатель | Значение |
|---|---|
| Тесты | **1405 пройдено** |
| Наборы тестов | **35 пройдено** |
| Утверждения | **99.55%** |
| Ветки | **96.71%** |
| Функции | **99.75%** |
| Строки | **99.7%** |
| Пороги Jest (гейты в CI) | **98 / 94 / 99 / 98** |
| `src/core/ConfigManager.ts` | **100%** (утверждения, ветки, функции, строки) |
| `src/middleware/headers.middleware.ts` | **100%** (утверждения, ветки, функции, строки) |

CI выполняется на самохостинговом GitLab проекта (`.gitlab-ci.yml`): четыре стадии на `image: node:22`:

```text
lint → typecheck → test → build
```

Задача `test` запускает `npm run test:ci` (с включённым покрытием), поэтому перечисленные выше пороги обрывают конвейер при любой регрессии. Поскольку инстанс GitLab закрытый, в README нет бейджа CI — его изображение было бы недоступно внешним читателям.

Локальные команды:

```bash
npm test  &&  npm run lint  &&  npm run type-check  &&  npm run build
```

(`test:coverage` добавляет `--coverage`; те же четыре гейта выполняются в CI.)

---

## Безопасность

| Проверка | Результат |
|---|---|
| Рантайм-зависимости | **0** |
| Сетевые вызовы из `src/` | **нет** — без HTTP-клиентов, реестров и телеметрии |
| `eval()` / `new Function()` | не используются |
| Скрипты установки (`preinstall` / `postinstall`) | отсутствуют |
| Проверка ввода конфигурации | разбор только JSON с ограничениями размера; защита от path traversal и prototype pollution |
| Сторонний рантайм-код | отсутствует — опубликованный пакет содержит только собственный скомпилированный код |

FAB Shield выполняет весь анализ внутри процесса. Он не отправляет данные наружу, не загружает списки угроз и не требует никаких внешних сервисов.

Сообщайте об уязвимостях приватно на **derector@devorbit.ru** — процесс раскрытия описан в [`SECURITY.md`](./SECURITY.md). Пожалуйста, не открывайте публичные issues для воспроизводимых ошибок.

---

## Что FAB Shield не заменяет

FAB Shield — прочная база, а не полноценная программа безопасности. Он не заменяет внешний WAF или защиту на уровне CDN, безопасную архитектуру и практики кодирования, сканирование зависимостей и контейнеров, пентесты, укрепление инфраструктуры, управление секретами, CSRF-токены для эндпоинтов, изменяющих состояние, проверку входных данных и параметризованные запросы, проверки авторизации в бизнес-логике, а также процессы DevSecOps (журналирование, мониторинг, реагирование на инциденты).

Рекомендуемое сочетание: HTTPS везде, безопасные cookie, CSRF-токены, строгая проверка входных данных, параметризованные запросы, хранение секретов в переменных окружения или в хранилище секретов, сканирование зависимостей в CI и регулярные обновления.

---

## Дорожная карта

### `1.4.0` — выпущена 2026-10-03

- CI на самохостинговом GitLab: `lint → typecheck → test → build` на `node:22`;
- документация переработана так, чтобы каждый пример соответствовал реальному публичному API;
- устранена недетерминированность тестов — 1405 тестов / 35 наборов, покрытие ≈ 99.5%;
- пороги Jest повышены до 98 / 94 / 99 / 98, чтобы CI блокировал регрессии покрытия; ноль рантайм-зависимостей сохраняется.

### Далее (`2.0.0`, в разработке — без фиксированной даты)

- переработанный модуль AI / аналитики;
- встроенный WAF с настраиваемыми правилами;
- маркетплейс плагинов;
- облачные и корпоративные редакции.

Следите за [`CHANGELOG.md`](./CHANGELOG.md) и [страницей релизов](https://lab.devorbit.ru/root/fab-shield/-/releases), чтобы узнавать о вышедших версиях.

---

## Статус проекта

| Показатель | Значение |
|---|---:|
| Текущая версия | `1.4.0` |
| Выпущена | `2026-10-03` |
| Тесты | `1405` пройдено |
| Наборы тестов | `35` пройдено |
| Покрытие кода (утверждения / ветки / функции / строки) | `99.55% / 96.71% / 99.75% / 99.7%` |
| Пороги Jest | `98 / 94 / 99 / 98` |
| Рантайм-зависимости | `0` |
| Node.js | `>= 18` |
| Лицензия | MIT |

Проект стабилен и активно поддерживается. Версия `1.4.0` нацелена на надёжность тестов, принудительный контроль со стороны CI и точность документации.

---

## История изменений

Полная история релизов ведётся в [`CHANGELOG.md`](./CHANGELOG.md).

---

## Участие

Вклад приветствуется — отчёты об ошибках, исправления документации, примеры, плагины и код.

- Руководство по участию: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Кодекс поведения: [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- Issues и merge request'ы: <https://lab.devorbit.ru/root/fab-shield/-/issues>

```bash
git clone https://lab.devorbit.ru/root/fab-shield.git
cd fab-shield
npm ci
npm run lint && npm run type-check && npm test && npm run build
git checkout -b feature/my-feature
```

Все четыре гейта CI должны пройти, прежде чем merge request будет принят. При сообщении об ошибках прилагайте минимальный пример воспроизведения и ожидаемое/фактическое поведение.

---

## Сообщество

| Канал | Ссылка |
|---|---|
| Репозиторий и issues | [lab.devorbit.ru/root/fab-shield](https://lab.devorbit.ru/root/fab-shield) |
| Пакет npm | [@fab-orbita/shield](https://www.npmjs.com/package/@fab-orbita/shield) |
| Сайт продукта | [fab.devorbit.ru](https://fab.devorbit.ru) |
| Telegram | [@fab_shield](https://t.me/fab_shield) |
| Контакт по безопасности | derector@devorbit.ru |

---

## FAQ

### Заменяет ли FAB Shield Helmet?

Может. FAB Shield покрывает те же HTTP-заголовки безопасности и добавляет управление CSP, ограничение частоты запросов, обнаружение атак, метрики и плагины. Если вы оставляете Helmet, убедитесь, что оба инструмента не задают конфликтующие значения для одних и тех же заголовков.

### Включено ли ограничение частоты запросов из коробки?

Нет. `rateLimit.enabled` по умолчанию равен `false`. Включите его в конфигурации или задайте `RATE_LIMIT_MAX`.

### Выполняет ли FAB Shield внешние сетевые вызовы?

Нет. У пакета ноль рантайм-зависимостей, и он не выполняет HTTP-запросов — весь анализ, ограничение и метрики работают внутри процесса.

### Как отключить анализ запросов или использовать только заголовки?

```ts
const shield = new FABShield({
  headers: { enabled: true },      // keep only security headers
  csp: { enabled: false },
  ai: { enabled: false },          // no request analysis
  rateLimit: { enabled: false },
  monitoring: { enabled: false },
});
```

### Какие фреймворки поддерживаются?

Express `^4.18.2 || ^5.0.0`, Fastify `^4` и Koa `^2` — все как необязательные peer-зависимости. Другие серверы в стиле Connect работают через `shield.middleware()`.

### Не замедлит ли это моё приложение?

Накладные расходы спроектированы так, чтобы быть небольшими: проверки в памяти, отсутствие I/O, никаких зависимостей, загружаемых во время запроса. Реальная стоимость зависит от включённых модулей, числа плагинов и объёма трафика — измеряйте по `getMetrics().avgResponseTime` и значениям p95/p99.

---

## DEVORBIT LLC

**DEVORBIT LLC** создаёт инструменты для разработчиков, инфраструктурное ПО и продукты безопасности для команд, работающих с Node.js и TypeScript.

**Автор:** Фабрициус Владимир Николаевич (Vladimir Fabritsius) — основатель DEVORBIT LLC.

**Контакты:** derector@devorbit.ru · репозиторий https://lab.devorbit.ru/root/fab-shield · компания https://devorbit.ru · сайт продукта https://fab.devorbit.ru

---

## Лицензия

[MIT](./LICENSE)

Copyright (c) 2026 ООО «Деворбит» (DEVORBIT LLC)

