# 🛡️ FAB Shield

> Security-фреймворк для Node.js-приложений: HTTP-заголовки, Content Security Policy, rate limiting, обнаружение атак, мониторинг, метрики и расширяемая система плагинов.

<p align="center">
  <a href="https://www.npmjs.com/package/@fab-orbita/shield">
    <img src="https://img.shields.io/npm/v/@fab-orbita/shield.svg?style=for-the-badge&logo=npm&color=cb3837" alt="npm version" />
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0-brightgreen?style=for-the-badge&logo=node.js" alt="Node.js 18+" />
  </a>
  <a href="#-статус-проекта">
    <img src="https://img.shields.io/badge/coverage-89.97%25-brightgreen?style=for-the-badge" alt="coverage" />
  </a>
  <a href="#-тестирование">
    <img src="https://img.shields.io/badge/tests-1119%20passed-brightgreen?style=for-the-badge&logo=jest" alt="tests" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/zammartin2/shield">GitHub</a> •
  <a href="https://www.npmjs.com/package/@fab-orbita/shield">npm</a> •
  <a href="https://fab.devorbit.ru/packages/@fab-orbita/shield">Fab Registry</a> •
  <a href="https://t.me/fab_shield">Telegram</a> •
  <a href="../README.md">English README</a>
</p>

---

## 📌 О проекте

**FAB Shield** — это middleware-фреймворк безопасности для Node.js, который помогает быстро добавить защитный слой в backend-приложение без ручной сборки множества отдельных middleware и утилит.

Фреймворк объединяет в одном пакете:

- HTTP security headers;
- Content Security Policy;
- rate limiting;
- обнаружение распространённых атак;
- сбор метрик;
- отчёты и мониторинг;
- расширение через плагины.

FAB Shield можно использовать для REST API, GraphQL API, SaaS-платформ, админ-панелей, микросервисов и публичных веб-приложений на Node.js.

---

## 📚 Содержание

- [📌 О проекте](#-о-проекте)
- [🧠 Идея](#-идея)
- [✨ Возможности](#-возможности)
- [📦 Установка](#-установка)
- [🚀 Быстрый старт](#-быстрый-старт)
- [⚙️ Конфигурация](#️-конфигурация)
- [🧩 Поддерживаемые фреймворки](#-поддерживаемые-фреймворки)
- [🛡️ Security Headers](#️-security-headers)
- [🔐 Content Security Policy](#-content-security-policy)
- [⚡ Rate Limiting](#-rate-limiting)
- [🚨 Обнаружение атак](#-обнаружение-атак)
- [🔌 Плагины](#-плагины)
- [📊 Метрики и мониторинг](#-метрики-и-мониторинг)
- [🏗️ Архитектура](#️-архитектура)
- [📈 Статус проекта](#-статус-проекта)
- [🧪 Тестирование](#-тестирование)
- [✅ Рекомендуемая production-настройка](#-рекомендуемая-production-настройка)
- [🚫 Что FAB Shield не заменяет](#-что-fab-shield-не-заменяет)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Как помочь проекту](#-как-помочь-проекту)
- [❓ FAQ](#-faq)
- [📄 Лицензия](#-лицензия)
- [📞 Контакты](#-контакты)

---

## 🧠 Идея

Безопасность приложения не должна превращаться в хаотичный набор разрозненных middleware.

Обычно разработчику приходится отдельно подключать и настраивать:

- security headers;
- CSP;
- rate limiting;
- проверку подозрительных запросов;
- логирование событий безопасности;
- метрики;
- алерты;
- кастомные правила;
- интеграции с внешними сервисами.

**FAB Shield** собирает эти направления в единую, понятную и расширяемую систему.

```ts
import express from 'express';
import { FABShield } from '@fab-orbita/shield';

const app = express();
const shield = new FABShield();

app.use(shield.middleware());

app.listen(3000, () => {
  console.log('FAB Shield is protecting the server');
});
```

После подключения middleware приложение получает дополнительный настраиваемый защитный слой.

---

## ✨ Возможности

### 🛡️ Security Headers

FAB Shield может автоматически устанавливать современные HTTP-заголовки безопасности, которые помогают снизить браузерные и сетевые риски.

Поддерживаемые направления защиты:

- снижение риска XSS;
- защита от clickjacking;
- запрет MIME-sniffing;
- управление referrer policy;
- управление permissions policy;
- настройка Content Security Policy;
- усиление HTTPS;
- контроль кэширования;
- ограничение опасных источников контента.

### 🚨 Обнаружение атак

Модуль анализа запросов помогает находить подозрительные payload-ы и типовые признаки атак.

Поддерживаются проверки для:

- XSS;
- SQL Injection;
- NoSQL Injection;
- LDAP Injection;
- Path Traversal;
- Command Injection;
- подозрительных User-Agent;
- необычных URL-параметров;
- автоматических сканеров;
- распространённых attack payloads.

### ⚡ Rate Limiting

Встроенный rate limiter помогает ограничивать количество запросов от клиента и защищать чувствительные endpoint-ы.

Полезно для защиты от:

- brute force;
- credential stuffing;
- API spam;
- резких всплесков нагрузки;
- простых DDoS-подобных сценариев.

### 🔌 Система плагинов

FAB Shield поддерживает расширение через плагины. Это позволяет добавлять собственную бизнес-логику безопасности без изменения ядра.

Плагины можно использовать для:

- audit logging;
- уведомлений;
- интеграции с WAF;
- geo blocking;
- проверки IP;
- Telegram, Slack и Email-уведомлений;
- внутренних enterprise-процессов безопасности.

### 📊 Метрики и отчёты

FAB Shield может собирать и экспортировать события безопасности.

Отслеживаемые направления:

- общее количество запросов;
- заблокированные запросы;
- подозрительные запросы;
- источники атак;
- типы угроз;
- события rate limit;
- события CSP;
- события плагинов;
- отчёты и алерты.

---

## 📦 Установка

### npm

```bash
npm install @fab-orbita/shield
```

### yarn

```bash
yarn add @fab-orbita/shield
```

### pnpm

```bash
pnpm add @fab-orbita/shield
```

### Fab Registry

```bash
npm install @fab-orbita/shield --registry=https://fab.devorbit.ru
```

### Требования

| Компонент | Требование |
|---|---|
| Node.js | `18+` |
| TypeScript | поддерживается |
| Формат модулей | ESM / CommonJS |
| Пакетные менеджеры | npm, yarn, pnpm, Fab Registry |

---

## 🚀 Быстрый старт

### Express

```ts
import express from 'express';
import { FABShield } from '@fab-orbita/shield';

const app = express();
const shield = new FABShield();

app.use(express.json());
app.use(shield.middleware());

app.get('/', (req, res) => {
  res.json({
    message: 'FAB Shield protects this application',
  });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
```

---

## ⚙️ Конфигурация

### Базовая конфигурация

```ts
import { FABShield } from '@fab-orbita/shield';

const shield = new FABShield({
  headers: true,
  rateLimit: true,
  ai: {
    enabled: true,
  },
});
```

### Расширенная конфигурация

```ts
const shield = new FABShield({
  headers: {
    enabled: true,
    contentSecurityPolicy: true,
    frameOptions: true,
    noSniff: true,
    referrerPolicy: true,
    permissionsPolicy: true,
  },

  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true,
    sensitivity: 'medium',
  },

  rateLimit: {
    enabled: true,
    windowMs: 60_000,
    max: 100,
  },

  metrics: {
    enabled: true,
  },

  plugins: [],
});
```

### Переменные окружения

```env
FAB_SHIELD_ENABLED=true
FAB_SHIELD_AI=true
FAB_SHIELD_RATE_LIMIT=true
FAB_SHIELD_RATE_LIMIT_MAX=100
FAB_SHIELD_METRICS=true
```

---

## 🧩 Поддерживаемые фреймворки

FAB Shield рассчитан на работу с популярными Node.js-фреймворками.

| Фреймворк | Статус |
|---|---|
| Express | поддерживается |
| Fastify | поддерживается |
| Koa | поддерживается |
| NestJS | поддерживается |

### Fastify

```ts
import Fastify from 'fastify';
import { FABShield } from '@fab-orbita/shield';

const fastify = Fastify();
const shield = new FABShield();

fastify.addHook('onRequest', async (request, reply) => {
  await shield.protect(request, reply);
});

fastify.get('/', async () => {
  return {
    message: 'Protected by FAB Shield',
  };
});

fastify.listen({
  port: 3000,
});
```

### Koa

```ts
import Koa from 'koa';
import { FABShield } from '@fab-orbita/shield';

const app = new Koa();
const shield = new FABShield();

app.use(async (ctx, next) => {
  await shield.koa(ctx, next);
});

app.use(async (ctx) => {
  ctx.body = {
    message: 'Protected by FAB Shield',
  };
});

app.listen(3000);
```

### NestJS

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FABShield } from '@fab-orbita/shield';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const shield = new FABShield({
    headers: true,
    ai: {
      enabled: true,
    },
  });

  app.use(shield.middleware());

  await app.listen(3000);
}

bootstrap();
```

---

## 🛡️ Security Headers

FAB Shield может управлять набором security-заголовков.

| Header | Назначение |
|---|---|
| `Content-Security-Policy` | Управляет разрешёнными источниками скриптов, стилей, изображений и других ресурсов |
| `X-Frame-Options` | Защищает от clickjacking |
| `X-Content-Type-Options` | Запрещает MIME-sniffing |
| `Referrer-Policy` | Управляет передачей referrer-информации |
| `Permissions-Policy` | Ограничивает доступ к возможностям браузера |
| `Strict-Transport-Security` | Принудительно включает HTTPS |
| `Cross-Origin-Opener-Policy` | Улучшает изоляцию окон |
| `Cross-Origin-Resource-Policy` | Ограничивает cross-origin-доступ к ресурсам |
| `Cross-Origin-Embedder-Policy` | Улучшает изоляцию встроенного контента |
| `Cache-Control` | Управляет кэшированием |
| `Pragma` | Совместимость с legacy cache-control |
| `Expires` | Управляет сроком жизни кэша |

---

## 🔐 Content Security Policy

CSP — один из ключевых механизмов браузерной защиты от XSS и загрузки нежелательного контента.

Пример настройки:

```ts
const shield = new FABShield({
  csp: {
    enabled: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
});
```

### CSP Nonce

Nonce позволяет безопаснее использовать inline-скрипты без полного отключения CSP.

```ts
const shield = new FABShield({
  csp: {
    enabled: true,
    nonce: true,
  },
});
```

---

## ⚡ Rate Limiting

Пример строгого rate limiting:

```ts
const shield = new FABShield({
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests',
  },
});
```

Где особенно полезно применять rate limiting:

- login endpoint;
- registration endpoint;
- password reset;
- публичные API routes;
- webhook endpoints;
- admin routes.

---

## 🚨 Обнаружение атак

### Покрытие проверок

| Тип атаки | Покрытие |
|---|---:|
| XSS | 50+ паттернов |
| SQL Injection | 40+ паттернов |
| NoSQL Injection | 30+ паттернов |
| LDAP Injection | 20+ паттернов |
| Path Traversal | поддерживается |
| Command Injection | поддерживается |

### Примеры подозрительных запросов

```http
GET /search?q=<script>alert(1)</script>
```

```http
POST /login
username=admin' OR '1'='1
```

```http
GET /files?path=../../etc/passwd
```

```http
GET /.env
GET /wp-admin
GET /phpmyadmin
```

### AI / аналитический слой

AI Protection — это дополнительный слой анализа входящих запросов.

Он может учитывать:

- URL;
- query parameters;
- request body;
- headers;
- IP address;
- User-Agent;
- частоту запросов;
- подозрительные последовательности символов;
- известные attack payloads.

```ts
const shield = new FABShield({
  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true,
    sensitivity: 'medium',
  },
});
```

### Режимы чувствительности

| Режим | Описание |
|---|---|
| `low` | Мягкие проверки, меньше ложных срабатываний |
| `medium` | Баланс безопасности и удобства |
| `high` | Более строгие проверки для критичных систем |
| `paranoid` | Максимальная защита для высокорисковых API |

---

## 🔌 Плагины

Плагин — это объект, который добавляет дополнительную логику в pipeline обработки запроса.

```ts
const auditPlugin = {
  name: 'audit-logger',
  version: '1.0.0',

  middleware(req, res, next) {
    console.log(`[AUDIT] ${req.method} ${req.url}`);
    next();
  },
};

const shield = new FABShield({
  plugins: [auditPlugin],
});
```

### Идеи официальных плагинов

| Плагин | Назначение |
|---|---|
| WAF Integration | Интеграция с Cloudflare, AWS WAF и другими WAF-провайдерами |
| Geo Blocking | Блокировка запросов по стране |
| Slack Notifications | Уведомления о подозрительной активности |
| Telegram Alerts | Security-алерты в Telegram |
| Email Reports | Ежедневные email-отчёты |
| Audit Logger | Подробные audit logs |
| IP Reputation | Проверка репутации IP |
| Bot Protection | Защита от ботов |
| API Key Guard | Проверка API-ключей |
| Admin Shield | Усиленная защита админ-панелей |

---

## 📊 Метрики и мониторинг

FAB Shield может собирать security events.

Пример события:

```ts
{
  type: 'threat_detected',
  severity: 'high',
  ip: '127.0.0.1',
  path: '/api/login',
  method: 'POST',
  reason: 'SQL Injection pattern detected',
  timestamp: '2026-01-01T12:00:00.000Z',
}
```

### Что можно отслеживать

- total requests;
- blocked requests;
- suspicious requests;
- frequent IP addresses;
- frequent endpoints;
- threat types;
- rate limit events;
- CSP events;
- configuration errors;
- plugin statistics.

### Форматы экспорта

| Формат | Назначение |
|---|---|
| Prometheus | Мониторинг и dashboards |
| JSON | Интеграции и logs |
| CSV | Отчёты и аналитика |
| HTML | Читаемые отчёты |
| PDF | Формальные security reports |

---

## 🏗️ Архитектура

```text
┌──────────────────────┐
│        Client        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Incoming Request   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   FAB Shield Core    │
└──────────┬───────────┘
           │
           ├── Security Headers
           ├── CSP Engine
           ├── Request Analysis
           ├── Rate Limiter
           ├── Plugin Pipeline
           ├── Metrics Collector
           └── Response Hardening
           │
           ▼
┌──────────────────────┐
│     Node.js App      │
└──────────────────────┘
```

### Жизненный цикл запроса

```text
1. Клиент отправляет запрос
2. FAB Shield принимает запрос
3. Проверяются базовые параметры
4. Анализируются URL, query и body
5. Выполняется threat detection
6. Проверяются rate limit правила
7. Выполняются плагины
8. Добавляются security headers
9. Запрос передаётся в приложение
10. Ответ усиливается защитными заголовками
```

---

## 📈 Статус проекта

| Метрика | Значение |
|---|---:|
| Актуальная версия | `1.3.0` |
| Test suites | `31 / 31` пройдено |
| Tests | `1119 / 1119` пройдено |
| Успешность тестов | `100%` |
| Code coverage | `89.97%` |
| Целевое покрытие для 1.3.0 | `90%` |
| Известные CVE | `0` |
| Node.js | `18+` |

Проект находится в активной разработке. Версия **1.3.0** сфокусирована на стабилизации тестов, документации и покрытия кода.

---

## 🧪 Тестирование

Текущий статус тестирования для версии **1.3.0**:

| Показатель | Значение |
|---|---:|
| Всего test suites | `31` |
| Пройдено test suites | `31` |
| Всего тестов | `1119` |
| Пройдено тестов | `1119` |
| Code coverage | `89.97%` |

### Покрытие ключевых модулей

| Модуль | Покрытие |
|---|---:|
| `ResponseHandler.ts` | `100%` |
| `logging.middleware.ts` | `100%` |
| `RequestHandler.ts` | `100%` |
| `PluginsModule.ts` | `100%` |
| `crypto.ts` | `100%` |
| `date.util.ts` | `100%` |
| `logger.ts` | `100%` |
| `MetricsModule.ts` | `100%` |
| `MetricsCollector.ts` | `100%` |
| `error.middleware.ts` | `86%` |
| `FABShield.ts` | `68%` |

---

## ✅ Рекомендуемая production-настройка

```ts
const shield = new FABShield({
  headers: {
    enabled: true,
  },

  csp: {
    enabled: true,
    nonce: true,
  },

  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true,
    sensitivity: 'medium',
  },

  rateLimit: {
    enabled: true,
    windowMs: 60_000,
    max: 120,
  },

  metrics: {
    enabled: true,
  },
});
```

Перед использованием в production рекомендуется проверить конфигурацию на staging-окружении и убедиться, что она не блокирует легитимных пользователей, webhooks и сторонние интеграции.

---

## 🚫 Что FAB Shield не заменяет

FAB Shield усиливает безопасность приложения, но не заменяет:

- внешний WAF;
- безопасную архитектуру;
- secure coding practices;
- dependency scanning;
- penetration testing;
- защиту инфраструктуры;
- корректное хранение секретов;
- валидацию бизнес-логики;
- защиту базы данных;
- полноценные DevSecOps-процессы.

Для лучшей защиты используйте FAB Shield вместе с HTTPS, secure cookies, input validation, ORM или parameterized queries, secret management, dependency scanning, логированием и мониторингом.

---

## 🗺️ Roadmap

### 1.3.0 — текущая версия ✅

- README и CHANGELOG обновлены;
- данные по тестам и покрытию актуализированы;
- достигнуто `89.97%` code coverage;
- `1119` тестов проходят успешно.

### 1.4.0 — планируется на 2026-07-20 🎯

**Цель:** достичь `95%` code coverage.

План работ:

- улучшить покрытие `FABShield.ts` до `85%+`;
- улучшить покрытие `ContextManager.ts` до `95%+`;
- улучшить покрытие `ConfigManager.ts` до `95%+`;
- улучшить покрытие `ip.util.ts` до `90%+`;
- улучшить покрытие `validator.ts` до `95%+`;
- добавить integration tests;
- добавить performance tests;
- добавить load tests.

### 2.0.0 — планируется на 2026-12-01 🚀

Крупное обновление:

- переработанный AI / analytics module;
- встроенный WAF;
- cloud version;
- plugin marketplace;
- advanced dashboard;
- enterprise presets.

---

## 📝 Changelog

Полная история изменений ведётся в файле [`CHANGELOG.md`](CHANGELOG.md).

### Основные версии

| Версия | Дата | Изменения |
|---|---:|---|
| `1.3.0` | `2026-07-03` | `89.97%` покрытия, `1119` тестов |
| `1.2.0` | `2026-07-03` | Комплексное тестирование и улучшение покрытия |
| `1.1.0` | `2026-07-02` | Базовое тестирование |
| `1.0.0` | `2026-07-01` | Первый стабильный релиз |

---

## 🤝 Как помочь проекту

Вы можете помочь развитию FAB Shield:

- поставить звезду проекту на GitHub;
- сообщить о баге;
- предложить новую функцию;
- улучшить документацию;
- написать плагин;
- добавить пример использования;
- улучшить TypeScript-типы;
- протестировать пакет в реальном проекте;
- рассказать о проекте другим разработчикам.

### Как внести вклад

```bash
git clone https://github.com/zammartin2/shield.git
cd shield
npm install
npm run build
npm test
```

Создайте отдельную ветку:

```bash
git checkout -b feature/my-feature
```

После внесения изменений:

```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

Затем откройте Pull Request на GitHub.

---

## ❓ FAQ

### FAB Shield заменяет Helmet?

FAB Shield можно рассматривать как более широкий security framework. Helmet в основном фокусируется на HTTP security headers, а FAB Shield дополнительно включает request analysis, rate limiting, plugins, metrics и monitoring.

### Можно использовать FAB Shield вместе с Helmet?

Да, но обычно в этом нет необходимости, если FAB Shield уже управляет security headers. Если оба инструмента используются вместе, важно не дублировать одни и те же заголовки с разными настройками.

### Подходит ли FAB Shield для production?

Да, FAB Shield проектируется с учётом production-сценариев. Перед использованием в критичных системах рекомендуется протестировать конфигурацию на staging-окружении.

### Будет ли FAB Shield замедлять приложение?

Цель проекта — минимальный overhead. Реальное влияние зависит от включённых модулей, количества плагинов и сложности анализа запросов.

### Можно отключить анализ запросов?

Да.

```ts
const shield = new FABShield({
  ai: {
    enabled: false,
  },
});
```

### Можно использовать только security headers?

Да.

```ts
const shield = new FABShield({
  headers: true,
  ai: {
    enabled: false,
  },
  rateLimit: {
    enabled: false,
  },
});
```

### Можно написать свой плагин?

Да. Система плагинов — одна из ключевых возможностей FAB Shield.

### TypeScript поддерживается?

Да, проект рассчитан на TypeScript и современные Node.js-приложения.

---

## 🏢 DEVORBIT LLC

**DEVORBIT LLC** разрабатывает инструменты для разработчиков, инфраструктурные решения и enterprise software.

Ключевые направления:

- Node.js;
- TypeScript;
- security tools;
- developer platforms;
- registry infrastructure;
- enterprise automation;
- open-source tooling.

---

## 📄 Лицензия

MIT License

Copyright © 2026 Vladimir Fabrisius

---

## 📞 Контакты

| Поле | Значение |
|---|---|
| Автор | Vladimir Fabrisius / Фабрициус Владимир Николаевич |
| Компания | ООО «Деворбит» / DEVORBIT LLC |
| GitHub | [zammartin2/shield](https://github.com/zammartin2/shield) |
| npm | [@fab-orbita/shield](https://www.npmjs.com/package/@fab-orbita/shield) |
| Fab Registry | [fab.devorbit.ru](https://fab.devorbit.ru/packages/@fab-orbita/shield) |
| Telegram | [@fab_shield](https://t.me/fab_shield) |
| Сайт | [devorbit.ru](https://devorbit.ru/) |
| Email | `derector@devorbit.ru` |

---

## ⭐ Поддержать проект

Если FAB Shield оказался полезен, вы можете поддержать проект:

- поставить звезду на GitHub;
- поделиться проектом с другими разработчиками;
- оставить обратную связь;
- предложить улучшения;
- отправить Pull Request;
- написать плагин;
- улучшить документацию.

Каждая звезда и каждый вклад помогают проекту развиваться.

---

<p align="center">
  <strong>FAB Shield — next-generation protection for Node.js applications.</strong>
</p>

<p align="center">
  Made with ❤️ by Vladimir Fabrisius
</p>

<p align="center">
  <a href="https://github.com/zammartin2/shield">GitHub</a> •
  <a href="https://www.npmjs.com/package/@fab-orbita/shield">npm</a> •
  <a href="https://fab.devorbit.ru/packages/@fab-orbita/shield">Fab Registry</a> •
  <a href="https://t.me/fab_shield">Telegram</a>
</p>
