# 🛡️ FAB Shield

<p align="center">

## Современный security-фреймворк для Node.js

**AI-защита • Security Headers • CSP • Rate Limiting • Plugins • Monitoring**

Защита для **Express**, **Fastify**, **Koa**, **NestJS** и современных Node.js-приложений.

</p>

<p align="center">

[![npm version](https://img.shields.io/npm/v/@fab-orbita/shield.svg)](https://www.npmjs.com/package/@fab-orbita/shield)
[![Downloads](https://img.shields.io/npm/dm/@fab-orbita/shield.svg)](https://www.npmjs.com/package/@fab-orbita/shield)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![GitHub stars](https://img.shields.io/github/stars/zammartin2/shield.svg?style=social)](https://github.com/zammartin2/shield)
[![Fab Registry](https://img.shields.io/badge/Fab-Registry-blue)](https://fab.devorbit.ru/packages/@fab-orbita/shield)

</p>

<p align="center">

[GitHub](https://github.com/zammartin2/shield) •
[npm](https://www.npmjs.com/package/@fab-orbita/shield) •
[Fab Registry](https://fab.devorbit.ru/packages/@fab-orbita/shield) •
[Telegram](https://t.me/fab_shield)

</p>

---

## 📌 О проекте

**FAB Shield** — это современный security-фреймворк для Node.js, который помогает быстро добавить в приложение комплексную защиту: security-заголовки, CSP, rate limiting, AI-анализ угроз, мониторинг, метрики и расширяемую систему плагинов.

Цель проекта — дать разработчикам простой инструмент, который можно подключить за несколько минут и сразу усилить безопасность приложения без сложной настройки десятков отдельных пакетов.

FAB Shield подходит для:

- REST API;
- GraphQL API;
- SaaS-платформ;
- корпоративных сервисов;
- личных проектов;
- микросервисов;
- административных панелей;
- публичных веб-приложений;
- backend-сервисов на Node.js.

---

## 🧠 Главная идея

Безопасность не должна быть сложной.

Обычно разработчику приходится отдельно подключать:

- security headers;
- CSP;
- rate limiter;
- защиту от XSS;
- защиту от SQL Injection;
- логирование подозрительных запросов;
- мониторинг;
- плагины;
- кастомные middleware;
- отчеты и алерты.

**FAB Shield** объединяет всё это в одном удобном инструменте.

```ts
import express from "express";
import { FABShield } from "@fab-orbita/shield";

const app = express();
const shield = new FABShield();

app.use(shield.middleware());

app.listen(3000);
```

После подключения middleware приложение получает дополнительный уровень защиты.

---

## ✨ Возможности

### 🔒 Security Headers

FAB Shield может автоматически добавлять современные HTTP security-заголовки, которые помогают защитить приложение от распространенных веб-угроз.

Поддерживаемые направления защиты:

- защита от XSS;
- защита от clickjacking;
- защита MIME sniffing;
- управление referrer policy;
- управление permissions policy;
- защита через Content Security Policy;
- усиление HTTPS;
- контроль кэширования;
- безопасная работа с iframe;
- защита от небезопасных источников.

---

### 🤖 AI-Powered Protection

FAB Shield может анализировать входящие запросы и выявлять подозрительные паттерны.

AI-защита может использоваться для обнаружения:

- XSS payload;
- SQL Injection;
- аномальных запросов;
- подозрительных User-Agent;
- странных параметров URL;
- частых атакующих паттернов;
- попыток обхода фильтров;
- автоматизированных сканеров.

---

### 🛡️ XSS Protection

Фреймворк помогает обнаруживать и блокировать опасные конструкции, которые могут использоваться для XSS-атак.

Примеры подозрительных паттернов:

```html
<script>alert("xss")</script>
<img src=x onerror=alert(1)>
javascript:alert(1)
```

---

### 💉 SQL Injection Detection

FAB Shield может анализировать query-параметры, body и path на наличие SQL Injection паттернов.

Примеры подозрительных строк:

```sql
' OR '1'='1
UNION SELECT
DROP TABLE users
admin'--
```

---

### 🚦 Rate Limiting

Встроенный rate limiter помогает ограничивать количество запросов от одного клиента.

Это полезно для защиты от:

- brute force;
- API spam;
- credential stuffing;
- DDoS-подобных всплесков;
- чрезмерной нагрузки на сервер.

Пример:

```ts
const shield = new FABShield({
  rateLimit: {
    enabled: true,
    windowMs: 60_000,
    max: 100
  }
});
```

---

### 🧩 Plugin System

FAB Shield поддерживает систему плагинов, чтобы можно было расширять поведение фреймворка под свои задачи.

Плагины можно использовать для:

- логирования;
- аудита;
- отправки уведомлений;
- интеграции с WAF;
- геоблокировки;
- кастомной авторизации;
- проверки IP;
- интеграции с Telegram, Slack, Email;
- внутренней корпоративной безопасности.

---

### 📊 Metrics & Monitoring

FAB Shield может собирать метрики безопасности:

- количество запросов;
- количество заблокированных запросов;
- количество подозрительных запросов;
- источники атак;
- типы угроз;
- частота rate limit событий;
- события CSP;
- события AI-защиты.

---

### ⚡ Производительность

FAB Shield проектируется как легкий middleware с минимальным overhead.

Цель проекта:

- быстрая обработка запроса;
- минимальное влияние на latency;
- понятная конфигурация;
- безопасные значения по умолчанию;
- возможность тонкой настройки.

---

## 📦 Установка

### Через npm

```bash
npm install @fab-orbita/shield
```

### Через yarn

```bash
yarn add @fab-orbita/shield
```

### Через pnpm

```bash
pnpm add @fab-orbita/shield
```

### Через Fab Registry

```bash
npm install @fab-orbita/shield --registry=https://fab.devorbit.ru
```

---

## 🚀 Быстрый старт

### Express

```ts
import express from "express";
import { FABShield } from "@fab-orbita/shield";

const app = express();

const shield = new FABShield();

app.use(shield.middleware());

app.get("/", (req, res) => {
  res.json({
    message: "FAB Shield защищает приложение"
  });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
```

---

## ⚙️ Базовая конфигурация

```ts
import { FABShield } from "@fab-orbita/shield";

const shield = new FABShield({
  headers: true,
  rateLimit: true,
  ai: {
    enabled: true
  }
});
```

---

## 🧠 Расширенная конфигурация

```ts
const shield = new FABShield({
  headers: {
    enabled: true,
    contentSecurityPolicy: true,
    frameOptions: true,
    noSniff: true,
    referrerPolicy: true,
    permissionsPolicy: true
  },

  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true
  },

  rateLimit: {
    enabled: true,
    windowMs: 60_000,
    max: 100
  },

  metrics: {
    enabled: true
  },

  plugins: []
});
```

---

## 🧱 Пример с Express

```ts
import express from "express";
import { FABShield } from "@fab-orbita/shield";

const app = express();

app.use(express.json());

const shield = new FABShield({
  headers: true,
  ai: {
    enabled: true,
    anomalyDetection: true
  },
  rateLimit: {
    enabled: true,
    windowMs: 60_000,
    max: 100
  }
});

app.use(shield.middleware());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    protected: true
  });
});

app.post("/api/users", (req, res) => {
  res.json({
    created: true
  });
});

app.listen(3000);
```

---

## ⚡ Пример с Fastify

```ts
import Fastify from "fastify";
import { FABShield } from "@fab-orbita/shield";

const fastify = Fastify();

const shield = new FABShield();

fastify.addHook("onRequest", async (request, reply) => {
  await shield.protect(request, reply);
});

fastify.get("/", async () => {
  return {
    message: "Protected by FAB Shield"
  };
});

fastify.listen({
  port: 3000
});
```

---

## 🌊 Пример с Koa

```ts
import Koa from "koa";
import { FABShield } from "@fab-orbita/shield";

const app = new Koa();
const shield = new FABShield();

app.use(async (ctx, next) => {
  await shield.koa(ctx, next);
});

app.use(async (ctx) => {
  ctx.body = {
    message: "Protected by FAB Shield"
  };
});

app.listen(3000);
```

---

## 🏛️ Пример с NestJS

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { FABShield } from "@fab-orbita/shield";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const shield = new FABShield({
    headers: true,
    ai: {
      enabled: true
    }
  });

  app.use(shield.middleware());

  await app.listen(3000);
}

bootstrap();
```

---

## 🔐 Security Headers

FAB Shield может управлять большим набором security-заголовков.

| Заголовок | Назначение |
|---|---|
| `Content-Security-Policy` | Контролирует источники скриптов, стилей, изображений и других ресурсов |
| `X-Frame-Options` | Защищает от clickjacking |
| `X-Content-Type-Options` | Запрещает MIME sniffing |
| `Referrer-Policy` | Контролирует передачу referrer |
| `Permissions-Policy` | Ограничивает доступ к возможностям браузера |
| `Strict-Transport-Security` | Принудительно использует HTTPS |
| `Cross-Origin-Opener-Policy` | Усиливает изоляцию окон |
| `Cross-Origin-Resource-Policy` | Ограничивает доступ к ресурсам между origin |
| `Cross-Origin-Embedder-Policy` | Усиливает изоляцию для embedded content |
| `Cache-Control` | Управляет кэшированием |
| `Pragma` | Совместимость для контроля кэша |
| `Expires` | Контроль времени жизни кэша |

---

## 🛡️ Content Security Policy

CSP — один из самых сильных механизмов защиты от XSS.

Пример настройки:

```ts
const shield = new FABShield({
  csp: {
    enabled: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"]
    }
  }
});
```

---

## 🔑 CSP Nonce

Nonce помогает безопасно разрешать inline-скрипты без полного отключения CSP.

```ts
const shield = new FABShield({
  csp: {
    enabled: true,
    nonce: true
  }
});
```

---

## 🚧 Rate Limiter

Пример строгого ограничения:

```ts
const shield = new FABShield({
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests"
  }
});
```

---

## 🤖 AI Protection

AI Protection — это дополнительный уровень анализа запроса.

Он может оценивать:

- URL;
- query-параметры;
- тело запроса;
- заголовки;
- IP;
- User-Agent;
- частоту запросов;
- подозрительные последовательности символов;
- известные attack payloads.

Пример:

```ts
const shield = new FABShield({
  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true,
    sensitivity: "medium"
  }
});
```

---

## 🧪 Режимы чувствительности

| Режим | Описание |
|---|---|
| `low` | Мягкая проверка, меньше false positive |
| `medium` | Баланс безопасности и удобства |
| `high` | Строгая проверка для критичных систем |
| `paranoid` | Максимальная защита для высокорисковых API |

---

## 🔌 Плагины

Плагин — это объект, который добавляет дополнительную логику обработки запроса.

```ts
const auditPlugin = {
  name: "audit-logger",
  version: "1.0.0",

  middleware(req, res, next) {
    console.log(`[AUDIT] ${req.method} ${req.url}`);
    next();
  }
};

const shield = new FABShield({
  plugins: [auditPlugin]
});
```

---

## 🧰 Идеи официальных плагинов

| Плагин | Назначение |
|---|---|
| WAF Integration | Интеграция с Cloudflare, AWS WAF и другими WAF |
| Geo Blocking | Блокировка запросов по странам |
| Slack Notifications | Уведомления о подозрительной активности |
| Telegram Alerts | Уведомления в Telegram |
| Email Reports | Ежедневные отчеты на email |
| Audit Logger | Детальный аудит событий |
| IP Reputation | Проверка репутации IP-адресов |
| Bot Protection | Защита от ботов |
| API Key Guard | Проверка API-ключей |
| Admin Shield | Усиленная защита админ-панелей |

---

## 📊 Метрики

FAB Shield может собирать события безопасности.

Пример структуры события:

```ts
{
  type: "threat_detected",
  severity: "high",
  ip: "127.0.0.1",
  path: "/api/login",
  method: "POST",
  reason: "SQL Injection pattern detected",
  timestamp: "2026-01-01T12:00:00.000Z"
}
```

---

## 📈 Что можно отслеживать

- общее количество запросов;
- количество заблокированных запросов;
- количество подозрительных запросов;
- частые IP;
- частые endpoints;
- типы угроз;
- rate limit события;
- события CSP;
- ошибки конфигурации;
- статистику по плагинам.

---

## 🧱 Архитектура

```text
┌──────────────────────┐
│      Client          │
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
           ├── AI Threat Detection
           ├── Rate Limiter
           ├── Plugin Pipeline
           ├── Metrics Collector
           └── Response Hardening
           │
           ▼
┌──────────────────────┐
│   Node.js App        │
└──────────────────────┘
```

---

## 🔄 Жизненный цикл запроса

```text
1. Клиент отправляет запрос
2. FAB Shield принимает запрос
3. Проверяются заголовки
4. Анализируются URL, query и body
5. Запускается AI-детектор угроз
6. Проверяется rate limit
7. Выполняются плагины
8. Добавляются security-заголовки
9. Запрос передается в приложение
10. Ответ усиливается защитными заголовками
```

---

## 📊 Сравнение

| Возможность | Helmet | FAB Shield | Платный WAF |
|---|:---:|:---:|:---:|
| Security Headers | ✅ | ✅ | ✅ |
| CSP | ✅ | ✅ | ✅ |
| Dynamic CSP | ❌ | ✅ | ✅ |
| AI Detection | ❌ | ✅ | ✅ |
| Rate Limiting | ❌ | ✅ | ✅ |
| Plugin System | ❌ | ✅ | Частично |
| Метрики | ❌ | ✅ | ✅ |
| Open Source | ✅ | ✅ | ❌ |
| Простое подключение | ✅ | ✅ | ❌ |
| Цена | Бесплатно | Бесплатно | Дорого |

---

## 🧪 Примеры угроз

### XSS

```http
GET /search?q=<script>alert(1)</script>
```

### SQL Injection

```http
POST /login
username=admin' OR '1'='1
```

### Path Traversal

```http
GET /files?path=../../etc/passwd
```

### Bot Scan

```http
GET /.env
GET /wp-admin
GET /phpmyadmin
```

---

## ✅ Рекомендованная конфигурация для production

```ts
const shield = new FABShield({
  headers: {
    enabled: true
  },

  csp: {
    enabled: true,
    nonce: true
  },

  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true,
    sensitivity: "medium"
  },

  rateLimit: {
    enabled: true,
    windowMs: 60_000,
    max: 120
  },

  metrics: {
    enabled: true
  }
});
```

---

## 🧑‍💻 TypeScript

FAB Shield ориентирован на TypeScript и современные Node.js-проекты.

```ts
import type { FABShieldOptions } from "@fab-orbita/shield";

const config: FABShieldOptions = {
  headers: true,
  ai: {
    enabled: true
  }
};
```

---

## 🧰 Переменные окружения

Пример возможной конфигурации через `.env`:

```env
FAB_SHIELD_ENABLED=true
FAB_SHIELD_AI=true
FAB_SHIELD_RATE_LIMIT=true
FAB_SHIELD_RATE_LIMIT_MAX=100
FAB_SHIELD_METRICS=true
```

---

## 📁 Рекомендуемая структура проекта

```text
project/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── security/
│   │   ├── shield.ts
│   │   └── plugins.ts
│   └── routes/
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Пример отдельного файла конфигурации

```ts
// src/security/shield.ts

import { FABShield } from "@fab-orbita/shield";

export const shield = new FABShield({
  headers: true,
  ai: {
    enabled: true,
    anomalyDetection: true
  },
  rateLimit: {
    enabled: true,
    windowMs: 60_000,
    max: 100
  }
});
```

```ts
// src/app.ts

import express from "express";
import { shield } from "./security/shield";

const app = express();

app.use(express.json());
app.use(shield.middleware());

export default app;
```

---

## 🧭 Когда использовать FAB Shield

FAB Shield хорошо подходит, если вам нужно:

- быстро усилить безопасность API;
- добавить security headers;
- подключить CSP;
- ограничить частоту запросов;
- защитить login/register endpoints;
- добавить аудит;
- отслеживать подозрительную активность;
- использовать единый security middleware;
- расширять систему через плагины;
- уменьшить количество отдельных security-зависимостей.

---

## 🚫 Когда FAB Shield не заменяет другие решения

FAB Shield усиливает безопасность приложения, но не заменяет:

- полноценный внешний WAF;
- аудит кода;
- безопасную архитектуру;
- проверку зависимостей;
- pentest;
- защиту инфраструктуры;
- правильную работу с секретами;
- валидацию бизнес-логики;
- защиту базы данных;
- DevSecOps-процессы.

---

## 🔐 Рекомендации по безопасности

Для лучшего результата используйте FAB Shield вместе с:

- HTTPS;
- безопасными cookie;
- CSRF-защитой там, где она нужна;
- валидацией входных данных;
- ORM или parameterized queries;
- secure session storage;
- секретами через environment variables;
- dependency scanning;
- логированием;
- мониторингом;
- регулярными обновлениями зависимостей.

---

## 🗺️ Roadmap

Планируемые направления развития:

- расширенная AI-модель анализа угроз;
- защита GraphQL;
- защита WebSocket;
- dashboard для мониторинга;
- интеграция с Cloudflare;
- интеграция с AWS WAF;
- интеграция с Kubernetes;
- Telegram alerts;
- Slack alerts;
- Email reports;
- audit center;
- threat intelligence;
- bot protection;
- IP reputation;
- enterprise presets;
- CLI-инструменты;
- расширенная документация;
- больше примеров использования.

---

## 🤝 Участие в разработке

Мы рады любому вкладу в проект.

Вы можете помочь:

- поставить звезду на GitHub;
- сообщить об ошибке;
- предложить новую функцию;
- улучшить документацию;
- написать плагин;
- добавить пример использования;
- улучшить TypeScript-типы;
- протестировать пакет;
- рассказать о проекте другим разработчикам.

---

## 🧪 Как внести вклад

```bash
git clone https://github.com/zammartin2/shield.git
cd shield
npm install
npm run build
npm test
```

Создайте новую ветку:

```bash
git checkout -b feature/my-feature
```

После изменений:

```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

Затем откройте Pull Request на GitHub.

---

## 🐛 Сообщить об ошибке

Если вы нашли ошибку, создайте issue в репозитории:

[https://github.com/zammartin2/shield](https://github.com/zammartin2/shield)

Желательно указать:

- версию Node.js;
- версию FAB Shield;
- фреймворк;
- пример конфигурации;
- ожидаемое поведение;
- фактическое поведение;
- минимальный пример воспроизведения.

---

## 💬 Сообщество

| Платформа | Ссылка | Для чего |
|---|---|---|
| GitHub | [zammartin2/shield](https://github.com/zammartin2/shield) | Код, issues, pull requests |
| npm | [@fab-orbita/shield](https://www.npmjs.com/package/@fab-orbita/shield) | Пакет в npm |
| Fab Registry | [@fab-orbita/shield](https://fab.devorbit.ru/packages/@fab-orbita/shield) | Пакет в Fab Registry |
| Telegram | [@fab_shield](https://t.me/fab_shield) | Общение, вопросы, помощь |

---

## ❓ FAQ

### FAB Shield заменяет Helmet?

FAB Shield может использоваться как более широкий security-фреймворк. Helmet в основном фокусируется на HTTP security headers, а FAB Shield дополнительно добавляет AI-защиту, rate limiting, плагины, метрики и мониторинг.

---

### Можно ли использовать FAB Shield вместе с Helmet?

Да, но обычно это не требуется, если FAB Shield уже управляет security headers. Если вы используете оба инструмента, важно не дублировать одинаковые заголовки.

---

### Подходит ли FAB Shield для production?

Да, фреймворк создается с учетом production-сценариев. Перед внедрением в критичную систему рекомендуется протестировать конфигурацию на staging-окружении.

---

### Будет ли FAB Shield замедлять приложение?

Цель проекта — минимальный overhead. Конкретное влияние зависит от включенных модулей, количества плагинов и сложности AI-анализа.

---

### Можно ли отключить AI-защиту?

Да.

```ts
const shield = new FABShield({
  ai: {
    enabled: false
  }
});
```

---

### Можно ли использовать только security headers?

Да.

```ts
const shield = new FABShield({
  headers: true,
  ai: {
    enabled: false
  },
  rateLimit: {
    enabled: false
  }
});
```

---

### Можно ли написать свой плагин?

Да. Система плагинов — одна из ключевых возможностей FAB Shield.

---

### Поддерживается ли TypeScript?

Да, проект ориентирован на TypeScript и современные Node.js-приложения.

---

## 🏢 DEVORBIT LLC

**DEVORBIT LLC** — компания, развивающая современные инструменты для разработчиков, инфраструктурные решения и enterprise software.

Направления:

- Node.js;
- TypeScript;
- security tools;
- developer platforms;
- registry infrastructure;
- enterprise automation;
- open-source инструменты.

---

## 👨‍💻 Автор

### Vladimir Fabrisius

**Vladimir Fabrisius** — автор FAB Shield и основатель DEVORBIT LLC.

Разрабатывает инструменты для Node.js, TypeScript, security, инфраструктуры и enterprise-систем.

Фокус:

- безопасность приложений;
- производительность;
- developer experience;
- open source;
- надежная инфраструктура;
- современные backend-решения.

---

## 📄 Лицензия

MIT License

Copyright © 2026 Vladimir Fabrisius

---

## ⭐ Поддержать проект

Если FAB Shield оказался полезен, вы можете поддержать проект:

- поставить звезду на GitHub;
- поделиться проектом с другими разработчиками;
- написать отзыв;
- предложить улучшение;
- отправить Pull Request;
- создать плагин;
- улучшить документацию.

Каждая звезда и каждый вклад помогают развивать проект.

---

<p align="center">

**FAB Shield — защита Node.js-приложений нового поколения.**

Made with ❤️ by **Vladimir Fabrisius**

[GitHub](https://github.com/zammartin2/shield) •
[npm](https://www.npmjs.com/package/@fab-orbita/shield) •
[Fab Registry](https://fab.devorbit.ru/packages/@fab-orbita/shield) •
[Telegram](https://t.me/fab_shield)

</p>
