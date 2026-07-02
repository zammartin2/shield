# 🛡️ FAB Shield

<p align="center">

## Modern Security Framework for Node.js

**AI Protection • Security Headers • CSP • Rate Limiting • Plugins • Monitoring**

Protection for **Express**, **Fastify**, **Koa**, **NestJS**, and modern Node.js applications.

</p>

<p align="center">

[![npm version](https://img.shields.io/npm/v/@fab-orbita/shield.svg)](https://www.npmjs.com/package/@fab-orbita/shield)
[![npm downloads](https://img.shields.io/npm/dm/@fab-orbita/shield.svg)](https://www.npmjs.com/package/@fab-orbita/shield)
[![build](https://img.shields.io/github/actions/workflow/status/zammartin2/shield/ci.yml?branch=main)](https://github.com/zammartin2/shield/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)](https://www.typescriptlang.org/)

</p>

<p align="center">

[GitHub](https://github.com/zammartin2/shield) •
[npm](https://www.npmjs.com/package/@fab-orbita/shield) •
[Fab Registry](https://fab.devorbit.ru/packages/@fab-orbita/shield) •
[Telegram](https://t.me/fab_shield) •
[Русская версия](docs/README.md)

</p>

---

## 📌 About the Project

**FAB Shield** is a modern security framework for Node.js that helps developers quickly add comprehensive protection to their applications: security headers, CSP, rate limiting, AI-powered threat analysis, monitoring, metrics, and an extensible plugin system.

The goal of the project is simple: give developers a powerful security layer that can be connected in minutes without manually combining dozens of separate packages.

FAB Shield is suitable for:

- REST APIs;
- GraphQL APIs;
- SaaS platforms;
- enterprise services;
- personal projects;
- microservices;
- admin panels;
- public web applications;
- backend services built with Node.js.

---

## 🧠 Core Idea

Security should not be complicated.

Usually, a developer has to connect and configure separate tools for:

- security headers;
- CSP;
- rate limiting;
- XSS protection;
- SQL Injection protection;
- suspicious request logging;
- monitoring;
- plugins;
- custom middleware;
- reports and alerts.

**FAB Shield** brings these features together in one clean security framework.

```ts
import express from "express";
import { FABShield } from "@fab-orbita/shield";

const app = express();
const shield = new FABShield();

app.use(shield.middleware());

app.listen(3000);
```

After connecting the middleware, your application receives an additional security layer.

---

## ✨ Features

### 🔒 Security Headers

FAB Shield can automatically add modern HTTP security headers that help protect applications against common web threats.

Security directions include:

- XSS protection;
- clickjacking protection;
- MIME sniffing protection;
- referrer policy control;
- permissions policy control;
- Content Security Policy;
- HTTPS hardening;
- cache control;
- secure iframe behavior;
- protection against unsafe sources.

---

### 🤖 AI-Powered Protection

FAB Shield can analyze incoming requests and detect suspicious patterns.

AI protection can be used to detect:

- XSS payloads;
- SQL Injection attempts;
- anomalous requests;
- suspicious User-Agent headers;
- unusual URL parameters;
- common attack patterns;
- filter bypass attempts;
- automated scanners.

---

### 🛡️ XSS Protection

The framework helps detect and block dangerous patterns that can be used in XSS attacks.

Examples of suspicious patterns:

```html
<script>alert("xss")</script>
<img src=x onerror=alert(1)>
javascript:alert(1)
```

---

### 💉 SQL Injection Detection

FAB Shield can analyze query parameters, request body, and path values for SQL Injection patterns.

Examples of suspicious strings:

```sql
' OR '1'='1
UNION SELECT
DROP TABLE users
admin'--
```

---

### 🚦 Rate Limiting

The built-in rate limiter helps restrict the number of requests from a single client.

This is useful for protection against:

- brute force;
- API spam;
- credential stuffing;
- DDoS-like traffic bursts;
- excessive server load.

Example:

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

FAB Shield supports plugins, allowing developers to extend the framework for custom security scenarios.

Plugins can be used for:

- logging;
- auditing;
- notifications;
- WAF integrations;
- geo blocking;
- custom authorization;
- IP checks;
- Telegram, Slack, and Email integrations;
- internal enterprise security workflows.

---

### 📊 Metrics & Monitoring

FAB Shield can collect security metrics:

- total requests;
- blocked requests;
- suspicious requests;
- attack sources;
- threat types;
- rate limit events;
- CSP events;
- AI protection events.

---

### ⚡ Performance

FAB Shield is designed as a lightweight middleware with minimal overhead.

Project goals:

- fast request processing;
- minimal latency impact;
- clear configuration;
- secure defaults;
- advanced customization when needed.

---

## 📦 Installation

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

---

## 🚀 Quick Start

### Express

```ts
import express from "express";
import { FABShield } from "@fab-orbita/shield";

const app = express();

const shield = new FABShield();

app.use(shield.middleware());

app.get("/", (req, res) => {
  res.json({
    message: "FAB Shield protects this application"
  });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
```

---

## ⚙️ Basic Configuration

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

## 🧠 Advanced Configuration

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

## 🧱 Express Example

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

## ⚡ Fastify Example

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

## 🌊 Koa Example

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

## 🏛️ NestJS Example

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

FAB Shield can manage a wide set of security headers.

| Header | Purpose |
|---|---|
| `Content-Security-Policy` | Controls allowed sources for scripts, styles, images, and other resources |
| `X-Frame-Options` | Protects against clickjacking |
| `X-Content-Type-Options` | Prevents MIME sniffing |
| `Referrer-Policy` | Controls referrer information |
| `Permissions-Policy` | Restricts access to browser features |
| `Strict-Transport-Security` | Forces HTTPS usage |
| `Cross-Origin-Opener-Policy` | Improves window isolation |
| `Cross-Origin-Resource-Policy` | Restricts cross-origin resource access |
| `Cross-Origin-Embedder-Policy` | Improves isolation for embedded content |
| `Cache-Control` | Controls caching behavior |
| `Pragma` | Legacy cache control compatibility |
| `Expires` | Controls cache expiration |

---

## 🛡️ Content Security Policy

CSP is one of the strongest browser-level protections against XSS.

Example configuration:

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

Nonce support allows safe usage of inline scripts without fully disabling CSP.

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

Strict rate limiting example:

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

AI Protection is an additional request analysis layer.

It can evaluate:

- URL;
- query parameters;
- request body;
- headers;
- IP;
- User-Agent;
- request frequency;
- suspicious character sequences;
- known attack payloads.

Example:

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

## 🧪 Sensitivity Modes

| Mode | Description |
|---|---|
| `low` | Soft checks with fewer false positives |
| `medium` | Balanced security and usability |
| `high` | Strict checks for critical systems |
| `paranoid` | Maximum protection for high-risk APIs |

---

## 🔌 Plugins

A plugin is an object that adds additional logic to the request pipeline.

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

## 🧰 Official Plugin Ideas

| Plugin | Purpose |
|---|---|
| WAF Integration | Integration with Cloudflare, AWS WAF, and other WAF providers |
| Geo Blocking | Block requests by country |
| Slack Notifications | Notifications about suspicious activity |
| Telegram Alerts | Telegram security alerts |
| Email Reports | Daily email reports |
| Audit Logger | Detailed security audit logs |
| IP Reputation | IP reputation checks |
| Bot Protection | Protection against bots |
| API Key Guard | API key validation |
| Admin Shield | Enhanced protection for admin panels |

---

## 📊 Metrics

FAB Shield can collect security events.

Example event structure:

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

## 📈 What Can Be Tracked

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

---

## 🧱 Architecture

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

## 🔄 Request Lifecycle

```text
1. Client sends a request
2. FAB Shield receives the request
3. Headers are checked
4. URL, query, and body are analyzed
5. AI threat detection is executed
6. Rate limit is checked
7. Plugins are executed
8. Security headers are added
9. Request is passed to the application
10. Response is hardened with protective headers
```

---

## 📊 Comparison

| Feature | Helmet | FAB Shield | Paid WAF |
|---|:---:|:---:|:---:|
| Security Headers | ✅ | ✅ | ✅ |
| CSP | ✅ | ✅ | ✅ |
| Dynamic CSP | ❌ | ✅ | ✅ |
| AI Detection | ❌ | ✅ | ✅ |
| Rate Limiting | ❌ | ✅ | ✅ |
| Plugin System | ❌ | ✅ | Partial |
| Metrics | ❌ | ✅ | ✅ |
| Open Source | ✅ | ✅ | ❌ |
| Simple Integration | ✅ | ✅ | ❌ |
| Price | Free | Free | Expensive |

---

## 🧪 Threat Examples

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

## ✅ Recommended Production Configuration

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

FAB Shield is designed for TypeScript and modern Node.js projects.

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

## 🧰 Environment Variables

Example `.env` configuration:

```env
FAB_SHIELD_ENABLED=true
FAB_SHIELD_AI=true
FAB_SHIELD_RATE_LIMIT=true
FAB_SHIELD_RATE_LIMIT_MAX=100
FAB_SHIELD_METRICS=true
```

---

## 📁 Recommended Project Structure

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

## 🔧 Separate Configuration File Example

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

## 🧭 When to Use FAB Shield

FAB Shield is useful when you need to:

- quickly improve API security;
- add security headers;
- enable CSP;
- limit request frequency;
- protect login/register endpoints;
- add auditing;
- track suspicious activity;
- use a single security middleware;
- extend security through plugins;
- reduce the number of separate security dependencies.

---

## 🚫 What FAB Shield Does Not Replace

FAB Shield improves application security, but it does not replace:

- a full external WAF;
- code audit;
- secure architecture;
- dependency scanning;
- penetration testing;
- infrastructure protection;
- proper secret management;
- business logic validation;
- database protection;
- DevSecOps processes.

---

## 🔐 Security Recommendations

For better protection, use FAB Shield together with:

- HTTPS;
- secure cookies;
- CSRF protection where needed;
- input validation;
- ORM or parameterized queries;
- secure session storage;
- secrets stored in environment variables;
- dependency scanning;
- logging;
- monitoring;
- regular dependency updates.

---

## 🗺️ Roadmap

Planned development areas:

- advanced AI threat model;
- GraphQL protection;
- WebSocket protection;
- monitoring dashboard;
- Cloudflare integration;
- AWS WAF integration;
- Kubernetes integration;
- Telegram alerts;
- Slack alerts;
- Email reports;
- audit center;
- threat intelligence;
- bot protection;
- IP reputation;
- enterprise presets;
- CLI tools;
- extended documentation;
- more usage examples.

---

## 🤝 Contributing

Contributions are welcome.

You can help by:

- starring the project on GitHub;
- reporting bugs;
- suggesting new features;
- improving documentation;
- writing plugins;
- adding examples;
- improving TypeScript types;
- testing the package;
- sharing the project with other developers.

---

## 🧪 How to Contribute

```bash
git clone https://github.com/zammartin2/shield.git
cd shield
npm install
npm run build
npm test
```

Create a new branch:

```bash
git checkout -b feature/my-feature
```

After making changes:

```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

Then open a Pull Request on GitHub.

---

## 🐛 Report a Bug

If you find a bug, create an issue in the repository:

[https://github.com/zammartin2/shield](https://github.com/zammartin2/shield)

Please include:

- Node.js version;
- FAB Shield version;
- framework;
- configuration example;
- expected behavior;
- actual behavior;
- minimal reproduction example.

---

## 💬 Community

| Platform | Link | Purpose |
|---|---|---|
| GitHub | [zammartin2/shield](https://github.com/zammartin2/shield) | Code, issues, pull requests |
| npm | [@fab-orbita/shield](https://www.npmjs.com/package/@fab-orbita/shield) | npm package |
| Fab Registry | [@fab-orbita/shield](https://fab.devorbit.ru/packages/@fab-orbita/shield) | Package in Fab Registry |
| Telegram | [@fab_shield](https://t.me/fab_shield) | Discussions, questions, support |

---

## ❓ FAQ

### Does FAB Shield replace Helmet?

FAB Shield can be used as a broader security framework. Helmet mostly focuses on HTTP security headers, while FAB Shield additionally provides AI protection, rate limiting, plugins, metrics, and monitoring.

---

### Can FAB Shield be used together with Helmet?

Yes, but it is usually not necessary if FAB Shield already manages your security headers. If both tools are used together, make sure the same headers are not duplicated or configured inconsistently.

---

### Is FAB Shield suitable for production?

Yes, the framework is designed with production scenarios in mind. Before using it in critical systems, test the configuration in a staging environment.

---

### Will FAB Shield slow down my application?

The goal of the project is minimal overhead. The actual impact depends on enabled modules, number of plugins, and complexity of AI analysis.

---

### Can AI protection be disabled?

Yes.

```ts
const shield = new FABShield({
  ai: {
    enabled: false
  }
});
```

---

### Can I use only security headers?

Yes.

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

### Can I write my own plugin?

Yes. The plugin system is one of the key features of FAB Shield.

---

### Is TypeScript supported?

Yes, the project is designed for TypeScript and modern Node.js applications.

---

## 🏢 DEVORBIT LLC

**DEVORBIT LLC** develops modern developer tools, infrastructure solutions, and enterprise software.

Focus areas:

- Node.js;
- TypeScript;
- security tools;
- developer platforms;
- registry infrastructure;
- enterprise automation;
- open-source tooling.

---

## 👨‍💻 Author

### Vladimir Fabrisius

**Vladimir Fabrisius** is the author of FAB Shield and founder of DEVORBIT LLC.

He builds tools for Node.js, TypeScript, security, infrastructure, and enterprise systems.

Focus:

- application security;
- performance;
- developer experience;
- open source;
- reliable infrastructure;
- modern backend solutions.

---

## 📄 License

MIT License

Copyright © 2026 Vladimir Fabrisius

---

## ⭐ Support the Project

If FAB Shield is useful for your project, you can support it by:

- starring the repository on GitHub;
- sharing the project with other developers;
- writing feedback;
- suggesting improvements;
- sending Pull Requests;
- creating plugins;
- improving documentation.

Every star and every contribution helps the project grow.

---

<p align="center">

**FAB Shield — next-generation protection for Node.js applications.**

Made with ❤️ by **Vladimir Fabrisius**

[GitHub](https://github.com/zammartin2/shield) •
[npm](https://www.npmjs.com/package/@fab-orbita/shield) •
[Fab Registry](https://fab.devorbit.ru/packages/@fab-orbita/shield) •
[Telegram](https://t.me/fab_shield) •
[Русская версия](docs/README.md)

</p>
