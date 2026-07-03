# 🛡️ FAB Shield

<p align="center">
  <strong>Modern security framework for Node.js applications</strong><br />
  Security headers, CSP, rate limiting, attack detection, monitoring, metrics, and an extensible plugin system.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@fab-orbita/shield">
    <img src="https://img.shields.io/npm/v/@fab-orbita/shield.svg?style=for-the-badge&color=cb3837&logo=npm" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@fab-orbita/shield">
    <img src="https://img.shields.io/npm/dm/@fab-orbita/shield.svg?style=for-the-badge&color=cb3837&logo=npm" alt="npm downloads" />
  </a>
  <a href="https://github.com/zammartin2/shield/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/zammartin2/shield/ci.yml?branch=main&style=for-the-badge&logo=github" alt="build status" />
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0-brightgreen?style=for-the-badge&logo=node.js" alt="Node.js >= 18" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-ready-blue?style=for-the-badge&logo=typescript" alt="TypeScript ready" />
  </a>
  <a href="#testing">
    <img src="https://img.shields.io/badge/tests-1119%20passed-brightgreen?style=for-the-badge&logo=jest" alt="tests" />
  </a>
  <a href="#project-status">
    <img src="https://img.shields.io/badge/coverage-89.97%25-brightgreen?style=for-the-badge" alt="coverage" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License: MIT" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/zammartin2/shield">GitHub</a> ·
  <a href="https://www.npmjs.com/package/@fab-orbita/shield">npm</a> ·
  <a href="https://fab.devorbit.ru/packages/@fab-orbita/shield">Fab Registry</a> ·
  <a href="https://t.me/fab_shield">Telegram</a> ·
  <a href="docs/README.md">Русская версия</a>
</p>

---

## Table of Contents

- [About](#about)
- [Why FAB Shield](#why-fab-shield)
- [Supported Package Managers](#supported-package-managers)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Framework Examples](#framework-examples)
- [Security Headers](#security-headers)
- [Content Security Policy](#content-security-policy)
- [Rate Limiting](#rate-limiting)
- [Attack Detection](#attack-detection)
- [Plugin System](#plugin-system)
- [Metrics and Monitoring](#metrics-and-monitoring)
- [Architecture](#architecture)
- [TypeScript](#typescript)
- [Recommended Production Setup](#recommended-production-setup)
- [Project Status](#project-status)
- [Testing](#testing)
- [What FAB Shield Does Not Replace](#what-fab-shield-does-not-replace)
- [Roadmap](#roadmap)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [Community](#community)
- [FAQ](#faq)
- [DEVORBIT LLC](#devorbit-llc)
- [Author](#author)
- [License](#license)
- [Support the Project](#support-the-project)

---

## About

**FAB Shield** is a security middleware framework for modern Node.js applications.

It helps developers add a unified protection layer without manually combining many separate packages for security headers, CSP, rate limiting, request analysis, logging, metrics, and plugin-based extensions.

FAB Shield can be used with:

- REST APIs;
- GraphQL APIs;
- SaaS platforms;
- enterprise services;
- microservices;
- admin panels;
- public web applications;
- backend services built with Node.js.

---

## Why FAB Shield

Security should be simple to connect, easy to configure, and flexible enough for production projects.

Usually, a developer has to configure separate tools for:

- security headers;
- Content Security Policy;
- rate limiting;
- XSS detection;
- SQL Injection detection;
- suspicious request logging;
- monitoring;
- custom middleware;
- reports and alerts.

**FAB Shield** brings these features together in one clean middleware framework.

```ts
import express from "express";
import { FABShield } from "@fab-orbita/shield";

const app = express();
const shield = new FABShield();

app.use(shield.middleware());

app.listen(3000, () => {
  console.log("FAB Shield is protecting the server");
});
```

After connecting the middleware, the application receives an additional configurable security layer.

---

## Supported Package Managers

| Package Manager | Command |
|---|---|
| [![npm](https://img.shields.io/badge/npm-cb3837?style=flat-square&logo=npm)](https://www.npmjs.com/package/@fab-orbita/shield) | `npm install @fab-orbita/shield` |
| [![Yarn](https://img.shields.io/badge/yarn-2C8EBB?style=flat-square&logo=yarn)](https://yarnpkg.com/package/@fab-orbita/shield) | `yarn add @fab-orbita/shield` |
| [![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm)](https://pnpm.io/) | `pnpm add @fab-orbita/shield` |
| [![Fab Registry](https://img.shields.io/badge/Fab%20Registry-6C5CE7?style=flat-square&logo=dev.to)](https://fab.devorbit.ru/packages/@fab-orbita/shield) | `npm install @fab-orbita/shield --registry=https://fab.devorbit.ru` |

---

## Installation

### npm

```bash
npm install @fab-orbita/shield
```

### Yarn

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

### Requirements

| Component | Requirement |
|---|---|
| Node.js | `18+` |
| TypeScript | Supported |
| Module format | ESM / CommonJS |
| Package managers | npm, Yarn, pnpm, Fab Registry |

---

## Quick Start

### Express

```ts
import express from "express";
import { FABShield } from "@fab-orbita/shield";

const app = express();
const shield = new FABShield();

app.use(shield.middleware());

app.get("/", (req, res) => {
  res.json({
    message: "FAB Shield protects this application",
  });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
```

---

## Configuration

### Basic Configuration

```ts
import { FABShield } from "@fab-orbita/shield";

const shield = new FABShield({
  headers: true,
  rateLimit: true,
  ai: {
    enabled: true,
  },
});
```

### Advanced Configuration

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
    sensitivity: "medium",
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

### Environment Variables

```env
FAB_SHIELD_ENABLED=true
FAB_SHIELD_AI=true
FAB_SHIELD_RATE_LIMIT=true
FAB_SHIELD_RATE_LIMIT_MAX=100
FAB_SHIELD_METRICS=true
```

---

## Framework Examples

### Express

```ts
import express from "express";
import { FABShield } from "@fab-orbita/shield";

const app = express();

app.use(express.json());

const shield = new FABShield({
  headers: true,
  ai: {
    enabled: true,
    anomalyDetection: true,
  },
  rateLimit: {
    enabled: true,
    windowMs: 60_000,
    max: 100,
  },
});

app.use(shield.middleware());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    protected: true,
  });
});

app.post("/api/users", (req, res) => {
  res.json({
    created: true,
  });
});

app.listen(3000);
```

### Fastify

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
    message: "Protected by FAB Shield",
  };
});

fastify.listen({
  port: 3000,
});
```

### Koa

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
    message: "Protected by FAB Shield",
  };
});

app.listen(3000);
```

### NestJS

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { FABShield } from "@fab-orbita/shield";

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

## Security Headers

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

FAB Shield helps reduce risks related to:

- XSS;
- clickjacking;
- MIME sniffing;
- unsafe referrer leakage;
- excessive browser feature access;
- unsafe embedded content;
- insecure source loading.

---

## Content Security Policy

Content Security Policy is one of the strongest browser-level protections against XSS.

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
      frameAncestors: ["'none'"],
    },
  },
});
```

### CSP Nonce

Nonce support allows safe usage of inline scripts without fully disabling CSP.

```ts
const shield = new FABShield({
  csp: {
    enabled: true,
    nonce: true,
  },
});
```

---

## Rate Limiting

The built-in rate limiter helps restrict the number of requests from a single client.

```ts
const shield = new FABShield({
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests",
  },
});
```

Common use cases:

- login endpoints;
- registration endpoints;
- password reset endpoints;
- public API routes;
- webhook endpoints;
- admin routes.

Rate limiting helps protect against:

- brute force;
- API spam;
- credential stuffing;
- excessive server load;
- simple DDoS-like traffic bursts.

---

## Attack Detection

FAB Shield can analyze incoming requests and detect suspicious patterns.

### Detection Coverage

| Attack Type | Coverage |
|---|---:|
| XSS | 50+ patterns |
| SQL Injection | 40+ patterns |
| NoSQL Injection | 30+ patterns |
| LDAP Injection | 20+ patterns |
| Path Traversal | Supported |
| Command Injection | Supported |

### Examples

#### XSS

```http
GET /search?q=<script>alert(1)</script>
```

#### SQL Injection

```http
POST /login
username=admin' OR '1'='1
```

#### Path Traversal

```http
GET /files?path=../../etc/passwd
```

#### Bot Scan

```http
GET /.env
GET /wp-admin
GET /phpmyadmin
```

### AI Protection

AI Protection is an additional request analysis layer.

It can evaluate:

- URL;
- query parameters;
- request body;
- headers;
- IP address;
- User-Agent;
- request frequency;
- suspicious character sequences;
- known attack payloads.

```ts
const shield = new FABShield({
  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true,
    sensitivity: "medium",
  },
});
```

### Sensitivity Modes

| Mode | Description |
|---|---|
| `low` | Soft checks with fewer false positives |
| `medium` | Balanced security and usability |
| `high` | Strict checks for critical systems |
| `paranoid` | Maximum protection for high-risk APIs |

---

## Plugin System

A plugin is an object that adds additional logic to the request pipeline.

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

### Plugin Use Cases

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

## Metrics and Monitoring

FAB Shield can collect security events and export metrics for monitoring and analysis.

### Example Event

```ts
{
  type: "threat_detected",
  severity: "high",
  ip: "127.0.0.1",
  path: "/api/login",
  method: "POST",
  reason: "SQL Injection pattern detected",
  timestamp: "2026-01-01T12:00:00.000Z",
}
```

### What Can Be Tracked

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

### Export Formats

| Format | Purpose |
|---|---|
| Prometheus | Monitoring and dashboards |
| JSON | API integrations and logs |
| CSV | Reports and analysis |
| HTML | Human-readable reports |
| PDF | Formal security reports |

---

## Architecture

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

### Request Lifecycle

```text
1. Client sends a request
2. FAB Shield receives the request
3. Headers are checked
4. URL, query, and body are analyzed
5. Threat detection is executed
6. Rate limit is checked
7. Plugins are executed
8. Security headers are added
9. Request is passed to the application
10. Response is hardened with protective headers
```

### Comparison

| Feature | Helmet | FAB Shield | Paid WAF |
|---|:---:|:---:|:---:|
| Security Headers | ✅ | ✅ | ✅ |
| CSP | ✅ | ✅ | ✅ |
| Dynamic CSP | ❌ | ✅ | ✅ |
| Attack Detection | ❌ | ✅ | ✅ |
| Rate Limiting | ❌ | ✅ | ✅ |
| Plugin System | ❌ | ✅ | Partial |
| Metrics | ❌ | ✅ | ✅ |
| Open Source | ✅ | ✅ | ❌ |
| Simple Integration | ✅ | ✅ | ❌ |
| Price | Free | Free | Expensive |

---

## TypeScript

FAB Shield is designed for TypeScript and modern Node.js projects.

```ts
import type { FABShieldOptions } from "@fab-orbita/shield";

const config: FABShieldOptions = {
  headers: true,
  ai: {
    enabled: true,
  },
};
```

### Recommended Project Structure

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

### Separate Configuration File Example

```ts
// src/security/shield.ts

import { FABShield } from "@fab-orbita/shield";

export const shield = new FABShield({
  headers: true,
  ai: {
    enabled: true,
    anomalyDetection: true,
  },
  rateLimit: {
    enabled: true,
    windowMs: 60_000,
    max: 100,
  },
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

## Recommended Production Setup

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
    sensitivity: "medium",
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

Before using FAB Shield in production, test the configuration in a staging environment and check that it does not block legitimate users or third-party integrations.

---

## Project Status

| Metric | Value |
|---|---:|
| Current version | `1.3.0` |
| Test suites | `31 / 31` passed |
| Tests | `1119 / 1119` passed |
| Test success rate | `100%` |
| Code coverage | `89.97%` |
| Target coverage for `1.3.0` | `90%` |
| Known CVE | `0` |
| Node.js | `18+` |

The project is in active development. Version `1.3.0` focuses on testing, documentation, and coverage stabilization.

---

## Testing

Current testing status for version `1.3.0`:

| Indicator | Value |
|---|---:|
| Total test suites | `31` |
| Passed test suites | `31` |
| Total tests | `1119` |
| Passed tests | `1119` |
| Code coverage | `89.97%` |

### Key Module Coverage

| Module | Coverage |
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

## What FAB Shield Does Not Replace

FAB Shield improves application security, but it does not replace:

- a full external WAF;
- secure architecture;
- secure coding practices;
- dependency scanning;
- penetration testing;
- infrastructure protection;
- proper secret management;
- business logic validation;
- database protection;
- DevSecOps processes.

### Security Recommendations

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

## Roadmap

### `1.3.0` — Current Version ✅

- README and CHANGELOG updated;
- test and coverage data updated;
- `89.97%` code coverage reached;
- `1119` tests pass successfully.

### `1.4.0` — Planned for 2026-07-20 🎯

Goal: reach `95%` code coverage.

Planned work:

- improve `FABShield.ts` coverage to `85%+`;
- improve `ContextManager.ts` coverage to `95%+`;
- improve `ConfigManager.ts` coverage to `95%+`;
- improve `ip.util.ts` coverage to `90%+`;
- improve `validator.ts` coverage to `95%+`;
- add integration tests;
- add performance tests;
- add load tests.

### `2.0.0` — Planned for 2026-12-01 🚀

Large update:

- redesigned AI / analytics module;
- built-in WAF;
- cloud version;
- plugin marketplace;
- advanced dashboard;
- enterprise presets.

---

## Changelog

The full release history is maintained in [`CHANGELOG.md`](./CHANGELOG.md).

### Main Versions

| Version | Date | Changes |
|---|---:|---|
| `1.3.0` | `2026-07-03` | `89.97%` coverage, `1119` tests |
| `1.2.0` | `2026-07-03` | Comprehensive testing and coverage improvements |
| `1.1.0` | `2026-07-02` | Basic testing |
| `1.0.0` | `2026-07-01` | First stable release |

---

## Contributing

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

### How to Contribute

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

### Report a Bug

If you find a bug, create an issue in the repository:

<https://github.com/zammartin2/shield>

Please include:

- Node.js version;
- FAB Shield version;
- framework;
- configuration example;
- expected behavior;
- actual behavior;
- minimal reproduction example.

---

## Community

| Platform | Link | Purpose |
|---|---|---|
| GitHub | [`zammartin2/shield`](https://github.com/zammartin2/shield) | Code, issues, pull requests |
| npm | [`@fab-orbita/shield`](https://www.npmjs.com/package/@fab-orbita/shield) | npm package |
| Fab Registry | [`@fab-orbita/shield`](https://fab.devorbit.ru/packages/@fab-orbita/shield) | Package in Fab Registry |
| Telegram | [`@fab_shield`](https://t.me/fab_shield) | Discussions, questions, support |

---

## FAQ

### Does FAB Shield replace Helmet?

FAB Shield can be used as a broader security framework. Helmet mostly focuses on HTTP security headers, while FAB Shield additionally provides request analysis, rate limiting, plugins, metrics, and monitoring.

### Can FAB Shield be used together with Helmet?

Yes, but it is usually not necessary if FAB Shield already manages your security headers. If both tools are used together, make sure the same headers are not duplicated or configured inconsistently.

### Is FAB Shield suitable for production?

Yes, the framework is designed with production scenarios in mind. Before using it in critical systems, test the configuration in a staging environment.

### Will FAB Shield slow down my application?

The goal of the project is minimal overhead. The actual impact depends on enabled modules, number of plugins, and complexity of request analysis.

### Can request analysis be disabled?

Yes.

```ts
const shield = new FABShield({
  ai: {
    enabled: false,
  },
});
```

### Can I use only security headers?

Yes.

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

### Can I write my own plugin?

Yes. The plugin system is one of the key features of FAB Shield.

### Is TypeScript supported?

Yes, the project is designed for TypeScript and modern Node.js applications.

---

## DEVORBIT LLC

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

## Author

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

## License

MIT License

Copyright © 2026 Vladimir Fabrisius

---

## Support the Project

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
  <strong>FAB Shield — next-generation protection for Node.js applications.</strong><br />
  Made with ❤️ by Vladimir Fabrisius
</p>

<p align="center">
  <a href="https://github.com/zammartin2/shield">GitHub</a> ·
  <a href="https://www.npmjs.com/package/@fab-orbita/shield">npm</a> ·
  <a href="https://fab.devorbit.ru/packages/@fab-orbita/shield">Fab Registry</a> ·
  <a href="https://t.me/fab_shield">Telegram</a> ·
  <a href="docs/README.md">Русская версия</a>
</p>
