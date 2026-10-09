# FAB Shield

Zero-dependency TypeScript security middleware for Node.js — security headers, CSP, rate limiting, attack detection, metrics, and plugins in a single package.

<p align="center">
  <a href="https://www.npmjs.com/package/@fab-orbita/shield"><img src="https://img.shields.io/npm/v/@fab-orbita/shield.svg?style=for-the-badge&logo=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@fab-orbita/shield"><img src="https://img.shields.io/npm/dt/@fab-orbita/shield.svg?style=for-the-badge&logo=npm" alt="npm downloads" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License: MIT" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D18.0-brightgreen?style=for-the-badge&logo=node.js" alt="Node.js >= 18" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-ready-blue?style=for-the-badge&logo=typescript" alt="TypeScript ready" /></a>
  <a href="#testing-and-coverage"><img src="https://img.shields.io/badge/tests-1405%20passed-brightgreen?style=for-the-badge&logo=jest" alt="1405 tests passed" /></a>
  <a href="#project-status"><img src="https://img.shields.io/badge/coverage-99.55%25-brightgreen?style=for-the-badge" alt="99.55% coverage" /></a>
</p>

<p align="center">
  <a href="https://github.com/zammartin2/shield">Repository</a> ·
  <a href="https://www.npmjs.com/package/@fab-orbita/shield">npm</a> ·
  <a href="https://github.com/zammartin2/shield/tree/main/docs">Docs</a> ·
  <a href="https://shield.devorbit.ru/"><strong>Live demo</strong></a> ·
  <strong>English</strong> | <a href="./README.ru.md">Русский</a>
</p>

> 🛡️ **Try it live at [shield.devorbit.ru](https://shield.devorbit.ru/)** — an interactive demo with the full documentation, a sandbox of classic attacks (SQLi, XSS, command injection, path traversal, …) fired through the real middleware, a live attack feed, before/after Shield toggle, latency analytics, and multi-tenant dashboards. No install needed.

---

## Table of Contents

- [About](#about)
- [Why FAB Shield](#why-fab-shield)
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
- [Testing and Coverage](#testing-and-coverage)
- [Security](#security)
- [What FAB Shield Does Not Replace](#what-fab-shield-does-not-replace)
- [Roadmap](#roadmap)
- [Project Status](#project-status)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [Community](#community)
- [FAQ](#faq)
- [DEVORBIT LLC](#devorbit-llc)
- [License](#license)

---

## About

**FAB Shield** (`@fab-orbita/shield`) is a security middleware framework for Node.js applications written in TypeScript. It provides one configurable protection layer instead of a stack of separate packages: security headers, Content Security Policy, rate limiting, pattern-based attack detection, metrics with JSON/Prometheus/CSV export, and an extensible plugin pipeline.

Key properties:

| Property | Value |
|---|---|
| Runtime dependencies | **0** |
| Node.js | `>= 18` |
| Language / formats | TypeScript, types shipped, ESM + CommonJS |
| Frameworks | Express 4/5, Fastify 4, Koa 2 (optional peer dependencies) |
| License | MIT |

FAB Shield fits REST and GraphQL APIs, SaaS backends, admin panels, microservices, and any Node.js service that needs a consistent HTTP security baseline.

---

## Why FAB Shield

Most projects assemble security from many unrelated packages: one for headers, one for CSP, one for rate limiting, one for request analysis, plus custom glue for metrics and alerting. Every integration is another place for drift and misconfiguration.

FAB Shield combines these concerns in a single middleware with one configuration object — see [Quick Start](#quick-start) for the three-line setup.

Design principles:

- **Zero runtime dependencies** — nothing to audit beyond the package itself; no network I/O.
- **Secure by default, tunable by config** — headers and CSP are on out of the box; rate limiting is opt-in.
- **Works where you work** — Express-style middleware plus dedicated guards for Fastify and Koa.
- **Observable** — structured metrics, events, and reports instead of silent blocking.
- **Extensible** — plugins hook into the request pipeline without forking the core.

---

## Installation

| Package manager | Command |
|---|---|
| npm | `npm install @fab-orbita/shield` |
| Yarn | `yarn add @fab-orbita/shield` |
| pnpm | `pnpm add @fab-orbita/shield` |
| Fab Registry | `npm install @fab-orbita/shield --registry=https://fab.devorbit.ru` |

### Requirements

Node.js `>= 18.0.0`. TypeScript is optional (types are bundled). Frameworks are **optional peer dependencies** — install only the one you use: `express` `^4.18.2 || ^5.0.0`, `fastify` `^4.0.0`, or `koa` `^2.0.0`. FAB Shield itself requires none of them.

---

## Quick Start

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

Every response now carries correlation headers set by the middleware (`X-Request-ID`, `X-Shield-Version: 1.4.2`, `X-Shield-Status: active`) plus the security headers described in [Security Headers](#security-headers). Blocked requests return structured JSON:

- `429` — rate limit exceeded (`retryAfter`, `limit`, `reset`);
- `403` — critical/high-severity threat detected (`threats[]` with type, severity, confidence);
- `500` — unexpected middleware error (`requestId` for log correlation).

---

## Configuration

Everything is configured through a single `Partial<ShieldConfig>` passed to the constructor:

```ts
const shield = new FABShield({ /* ShieldConfig */ });
```

### Config object reference

Top-level keys of `ShieldConfig`:

| Key | Type | Default | Description |
|---|---|---|---|
| `env` | `'development' \| 'production' \| 'test'` | `'development'` | Environment name (validated) |
| `enabled` | `boolean` | — | Master enable flag (see `SHIELD_ENABLED`) |
| `name` | `string` | — | Instance name |
| `version` | `string` | — | Instance version label |
| `headers` | `HeaderConfig` | enabled | Security headers module |
| `csp` | `CSPConfig` | enabled, dynamic | Content Security Policy module |
| `ai` | `AIConfig` | enabled | Attack / anomaly analysis module |
| `rateLimit` | `RateLimitConfig` | **disabled**, `100 / 60000` | Rate limiter |
| `monitoring` | `MonitoringConfig` | enabled, `export: ['json']` | Metrics collection settings |
| `threatDetection` / `ipReputation` / `rules` | `ThreatDetectionConfig` / `IPReputationConfig` / `any[]` | — | Detector thresholds and auto-block rules, reputation sources and geo-blocking, custom rule storage |
| `plugins` | `Plugin[]` | `[]` | Plugins registered at construction |
| `logging` | `LoggingConfig` | `info` / `json` | Logging level, format, transports |
| `cache` / `performance` / `integrations` / `webhooks` | `CacheConfig` / `PerformanceConfig` / `IntegrationConfig` / `WebhookConfig[]` | — | Cache store, performance tuning, external integrations, outbound webhooks |

Values passed to the constructor override environment variables; environment variables override the built-in defaults.

### Sub-object reference

**`headers`**

| Field | Type | Default | Effect |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Master switch for the headers module |
| `disabled` | `string[]` | `[]` | Header names removed after they are applied |
| `custom` | `Record<string, string>` | `{}` | Arbitrary headers added to every response |
| `hsts` | `{ enabled, maxAge, includeSubDomains, preload }` | `31536000` / `true` / `true` | `Strict-Transport-Security` value |
| `xFrame` | `{ enabled, action, allowedOrigins[] }` | `action: 'DENY'` | `X-Frame-Options`: `DENY`, `SAMEORIGIN`, `ALLOW-FROM` |
| `referrerPolicy` | `{ enabled, policy }` | `strict-origin-when-cross-origin` | `Referrer-Policy` |
| `crossOrigin` | `{ embedder, opener, resource }` | `opener: 'same-origin'` | `Cross-Origin-Embedder/Opener/Resource-Policy` |
| `xContentTypeOptions` | `boolean` | `true` | `X-Content-Type-Options: nosniff` |
| `xXssProtection` | `boolean` | `true` | `X-XSS-Protection: 1; mode=block` |
| `xDnsPrefetchControl` | `boolean` | `true` | `X-DNS-Prefetch-Control: off` |
| `xDownloadOptions` | `boolean` | `true` | `X-Download-Options: noopen` |
| `xPermittedCrossDomainPolicies` | `boolean` | `true` | `X-Permitted-Cross-Domain-Policies: none` |
| `xPoweredBy` | `boolean` | — | Framework banner handling flag |

**`csp`**

| Field | Type | Default | Effect |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Emit `Content-Security-Policy` |
| `dynamic` | `boolean` | `true` | Dynamic policy mode flag |
| `reportOnly` | `boolean` | — | Report-Only mode flag |
| `strict` | `boolean` | — | Strict preset flag |
| `directives` | `Record<string, string[]>` | built-in defaults | Policy directives, keyed by canonical CSP names (`'default-src'`, `'script-src'`, …) |
| `trustedCDNs` | `string[]` | `[]` | Hosts appended to `script-src` and `style-src` |
| `trustedOrigins` | `string[]` | `[]` | Trusted origin list |
| `nonceEnabled` | `boolean` | — | Nonce mode flag (`nonceLength` for its length) |
| `nonceLength` | `number` | `32` | Length used by the nonce helper |
| `reporting` | `{ enabled, uri, reportTo }` | — | Reporting endpoint settings |
| `exceptions` | `any[]` | `[]` | Path-level exceptions |

**`ai`**

| Field | Type | Default | Effect |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Run request analysis in the pipeline |
| `anomalyDetection` | `boolean` | `true` | Anomaly scoring |
| `threatPrediction` | `boolean` | `true` | Predictive threat scoring |
| `userBehaviorAnalysis` | `boolean` | — | Behavioral analysis flag |
| `contentAnalysis` | `boolean` | — | Body content analysis flag |
| `modules` | `{ xssProtection, sqlInjectionProtection, userAgentAnalysis, ipReputation, behavioralAnalysis, contentAnalysis }` | — | Six per-detector toggles |
| `thresholds` | `{ anomalyThreshold, threatThreshold, trustThreshold }` | — | Score cut-offs for anomaly, threat, and trust decisions |
| `learning` | `{ enabled, mode: 'continuous' \| 'batch', interval, sampleSize, feedbackEnabled }` | — | Learning loop settings |
| `blocking` | `{ enabled, duration, maxAttempts }` | — | Temporary blocking after repeated detections |

**`rateLimit`** (disabled by default)

| Field | Type | Default | Effect |
|---|---|---|---|
| `enabled` | `boolean` | `false` | Turns the limiter on; the store is created/destroyed on toggle |
| `default` | `{ max, windowMs }` | `{ max: 100, windowMs: 60000 }` | Global limit (`max >= 1`, `windowMs >= 1000`) |
| `paths` | `Record<pattern, { max, windowMs }>` | `{}` | Per-path limits; `*` in the key is expanded to a regular expression |
| `roles` | `Record<role, { max, windowMs }>` | `{}` | Limits keyed by `req.user.role` |
| `keyGenerator` | `(req) => string` | `req.ip` | Client key function |
| `whitelist` | `{ enabled, ips[], users[], apiKeys[] }` | — | Exemption lists: IPs, users, API keys |

**`monitoring`**

| Field | Type | Default | Effect |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Monitoring module flag surfaced by `getStatus()` |
| `export` | `string[]` | `['json']` | Preferred export formats |
| `interval` | `number` | — | Collection interval (ms) |
| `alerts` | `{ enabled, rules[] }` | — | Alert rule configuration |

**`logging`**

| Field | Type | Default | Effect |
|---|---|---|---|
| `level` | `debug \| info \| warn \| error \| fatal` | `'info'` | Minimum level (validated) |
| `format` | `'json' \| 'text'` | `'json'` | Log line format |
| `transports` | `[{ type: 'console' \| 'file' \| 'remote', … }]` | console | `console` works; `file` and `remote` transport types are declared but currently log nothing |
| `include` | `{ requests, threats, errors, performance, metrics }` | — | Event categories to log |
| `exclude` | `{ headers[], body[] }` | — | Fields to withhold from logs |

### Defaults

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

### Validation

The constructor validates the merged configuration and throws on invalid values: `headers.hsts.maxAge >= 0`; `rateLimit.default.max >= 1`; `rateLimit.default.windowMs >= 1000`; `logging.level` ∈ `debug | info | warn | error | fatal`; `env` ∈ `development | production | test`.

### Environment variables

The prefix is **`SHIELD_`** (plus a few generic names such as `NODE_ENV`, `HSTS_*`, `RATE_LIMIT_*`, `LOG_*`). There is also **no** JSON config file loading: `new FABShield()` never reads a file, so configuration comes only from defaults, environment variables, and the constructor argument.

| Variable | Values | Default | Effect |
|---|---|---|---|
| `NODE_ENV` | `development` \| `production` \| `test` | — | `config.env` |
| `SHIELD_ENABLED` | `'true'` → on | active | `enabled` |
| `SHIELD_HEADERS` | `'true'` → on | `true` | `headers.enabled` |
| `SHIELD_CSP` | `'true'` → on | `true` | `csp.enabled` |
| `SHIELD_AI` | `'true'` → on | `true` | `ai.enabled` |
| `SHIELD_MONITORING` | `'true'` → on | `true` | `monitoring.enabled` |
| `SHIELD_NAME` | string | — | `name` |
| `HSTS_MAX_AGE` | integer seconds | `31536000` | `headers.hsts.maxAge`; gates the two variables below |
| `HSTS_INCLUDE_SUBDOMAINS` | `!== 'false'` | `true` | `headers.hsts.includeSubDomains` |
| `HSTS_PRELOAD` | `=== 'true'` | `false` if `HSTS_MAX_AGE` is set without it | `headers.hsts.preload` — setting `HSTS_MAX_AGE` alone turns preload **off** unless `HSTS_PRELOAD=true` is also set |
| `RATE_LIMIT_MAX` | integer `>= 1` | — | Sets `rateLimit.default.max` **and enables rate limiting** |
| `RATE_LIMIT_WINDOW` | integer ms | `60000` | `rateLimit.default.windowMs` |
| `RATE_LIMIT_ENABLED` | `!== 'false'` | `true` | No effect unless `RATE_LIMIT_MAX` is set |
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error` \| `fatal` | `info` | `logging.level`; gates `LOG_FORMAT` |
| `LOG_FORMAT` | `json` \| `text` | `json` | Applied only when `LOG_LEVEL` is set |

```env
NODE_ENV=production
HSTS_MAX_AGE=63072000
HSTS_PRELOAD=true
RATE_LIMIT_MAX=120
LOG_LEVEL=warn
```

### Recommended production setup

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

Before rollout, replay the configuration against staging traffic: strict CSP and aggressive limits are the two settings most likely to affect legitimate clients.

---

## Framework Examples

### Express

Works with Express 4 and 5 (optional peer dependency).

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

`protect()` wraps the Express-style middleware in a promise for Fastify hooks.

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

`koa(ctx, next)` adapts the pipeline to Koa's context and forwards errors to `next`.

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

## Security Headers

The headers module writes these response headers (defaults shown):

| Header | Value produced |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` (or `SAMEORIGIN` / `ALLOW-FROM`) |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-DNS-Prefetch-Control` | `off` |
| `X-Download-Options` | `noopen` |
| `X-Permitted-Cross-Domain-Policies` | `none` |
| `Cross-Origin-Opener-Policy` | `same-origin` (default) |
| `Cross-Origin-Embedder-Policy` | only when `crossOrigin.embedder` is set |
| `Cross-Origin-Resource-Policy` | only when `crossOrigin.resource` is set |
| `Origin-Agent-Cluster` | `?1` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` |
| `X-Request-ID`, `X-Shield-Version`, `X-Shield-Status` | correlation headers added by `middleware()` |

`X-Powered-By` and `Server` are removed from every response. `Content-Security-Policy` is emitted separately by the CSP module (see below).

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

`custom` headers are applied verbatim after the built-in set; names listed in `disabled` are removed last, so they override everything above. Set `headers: { enabled: false }` to skip the module entirely.

---

## Content Security Policy

With no configuration, CSP is emitted with a solid default policy:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests
```

Custom directives replace the defaults — keys must use canonical CSP names:

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

- `trustedCDNs` entries are appended to `script-src` and `style-src` without duplicating existing values;
- empty directive arrays are skipped when the header string is built;
- the nonce helper mints random base62 strings for inline-script workflows:

```ts
const nonce = shield.getCSPModule().generateNonce(32);
// include the nonce in directives yourself, e.g. script-src 'self' 'nonce-...'
```

To turn the module off: `csp: { enabled: false }`.

---

## Rate Limiting

Rate limiting is **off by default**. Enable it explicitly or set `RATE_LIMIT_MAX`.

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

Behavior:

- clients are keyed by `keyGenerator(req)` (default: `req.ip`) in an in-memory per-instance store;
- path patterns are matched first (`*` is expanded to a regular expression), then roles (`req.user.role`), then the default limit;
- when a client exceeds the limit the middleware responds `429` with:

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

Exceeding the limit also fires `rateLimit:exceeded` (re-emitted as `alert`); `whitelist.ips` / `whitelist.users` / `whitelist.apiKeys` are the declared exemption lists for trusted clients. Typical targets: login, registration, password reset, public API routes, webhooks, and admin endpoints — brute force, credential stuffing, API spam, and traffic bursts.

---

## Attack Detection

The AI module analyzes each request (URL, query, body, headers, User-Agent, IP) against a large regular-expression pattern set:

| Attack family | Patterns |
|---|---:|
| XSS | 60+ |
| SQL Injection | 50+ |
| NoSQL Injection | 50+ |
| Command Injection | 50+ |
| Path Traversal | 30+ |
| LDAP Injection | 20+ |

Example requests that are flagged:

```http
GET /search?q=<script>alert(1)</script>
POST /login  (body: username=admin' OR '1'='1)
GET /files?path=../../etc/passwd
GET /.env
```

Threat types produced by the engine: `XSS`, `SQL_INJECTION`, `NOSQL_INJECTION`, `CSRF`, `DDOS`, `BRUTE_FORCE`, `PATH_TRAVERSAL`, `COMMAND_INJECTION`, `FILE_INCLUSION`, `RCE`, `SSRF`, `XXE`, `LDAP_INJECTION`, `CUSTOM` — each with severity `low | medium | high | critical`.

Threats are recorded in metrics; any `critical` or `high` threat aborts the request with `403` (JSON body listing type, severity, confidence) and emits `threat:detected` followed by `alert` with the client IP and path.

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

Disable analysis entirely with `ai: { enabled: false }`.

---

## Plugin System

A plugin is a plain object. `name` is required; `middleware` runs inside the shield pipeline as Express-style `(req, res, next)`.

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

Plugins passed in `config.plugins` are registered at construction; the rest can be managed at runtime:

```ts
shield.registerPlugin(auditPlugin);
shield.unregisterPlugin("audit-logger");
```

### Hooks

| Hook | Signature | Purpose |
|---|---|---|
| `onInit` / `onStart` / `onStop` / `onDestroy` | `(context) => void` | Lifecycle |
| `onRequest` | `(req, context) => PluginResult \| void` | Inspect or block: return `{ block: true, status: 403, message: "…" }` |
| `middleware` | `(req, res, next) => void` | Express-style step in the pipeline |
| `onResponse` | `(res, context) => void` | Post-processing |
| `onError` | `(error, context) => void` | Failure handling |
| `api` | `Record<string, (context, ...args) => any>` | Named functions callable by other plugins |

### Plugin context

`PluginContext` gives each plugin access to `getConfig(name?)`, `setConfig`, `getShield()`, `getMetrics()`, `getServer()`, `log(level, message)`, a per-request `storage` (`get`/`set`/`delete`/`clear`/`getAll`), event subscription via `on(event, handler)` / `emit`, and small utilities (`generateId`, `getTimestamp`, `isIP`, `isURL`, `isEmail`). Typical plugins: audit logging, geo-blocking, API-key guards, notification bridges, WAF glue, admin-panel hardening.

---

## Metrics and Monitoring

### Collection

`getMetrics()` returns live counters: `totalRequests`, `threatsBlocked`, `avgResponseTime`, `p95ResponseTime`, `p99ResponseTime`, `errors`, `threats` (last 10), `threatStats`, `byPath`, `byMethod`, `byStatus`, `uptime`, `timestamp`.

### Export

`exportMetrics(format)` supports exactly three formats: `'json'`, `'prometheus'`, `'csv'` — call it, for example, as `shield.exportMetrics("prometheus")`. `generateReport()` produces a summary object (period, uptime, totals, plugin list) suitable for dashboards or scheduled jobs.

### Events

Subscribe with `shield.on(event, handler)` — the shield extends `EventEmitter`. Events: `request:processed` (`{ req, res, duration, requestId, threatsDetected }`), `threat:detected` (`{ threats, requestId, req }`), `rateLimit:exceeded` (`{ req, requestId, limit, retryAfter }`), normalized `alert`, `error`, `config:updated`, `plugin:registered`, `plugin:unregistered`, `started`, `stopped`, `reset`.

`monitoring.export` and `monitoring.alerts` carry the preferred export formats and alert rules in the configuration; `getStatus()` reports which modules are enabled.

---

## Architecture

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

Source layout: `src/core/` (`FABShield`, `ConfigManager`, `ContextManager`), `src/modules/` (`headers`, `csp`, `ai`, `rate-limit`, `plugins`, `metrics`), `src/middleware/` (internal Express-style wrappers), `src/types/`, and `src/utils/`.

- **ConfigManager** merges defaults → environment → constructor argument, validates the result, and guards against prototype pollution;
- **ContextManager** tracks per-request context and exposes `getContextStats()`;
- everything runs in-process: no sockets, no external services, in-memory stores only.

---

## TypeScript

The package ships declaration files and exports exactly one class (`FABShield`) plus the types `ShieldConfig`, `HeaderConfig`, `CSPConfig`, `AIConfig`, `MonitoringConfig`, `RateLimitConfig`, `LoggingConfig`, `Plugin`, `PluginContext`, `Threat`, `ThreatSeverity`, and `ThreatType`:

```ts
import { FABShield } from "@fab-orbita/shield";
import type { ShieldConfig, Plugin, Threat } from "@fab-orbita/shield";

const config: Partial<ShieldConfig> = {
  env: "production",
  headers: { enabled: true, xFrame: { action: "SAMEORIGIN" } },
};

const shield = new FABShield(config);
```

### Class reference

| Member | Signature | Description |
|---|---|---|
| constructor | `new FABShield(config?: Partial<ShieldConfig>)` | Builds and validates the instance |
| `middleware()` | `() => (req, res, next) => void` | Express-style middleware |
| `protect(req, res)` | `Promise<void>` | Awaitable guard (Fastify hooks) |
| `koa(ctx, next)` | `Promise<void>` | Koa guard |
| `getInstance()` | `static FABShield \| null` | First-created instance (singleton helper) |
| `getMetrics()` | `() => object` | Live metrics snapshot |
| `getConfig()` | `() => ShieldConfig` | Effective configuration |
| `updateConfig(partial)` | `(Partial<ShieldConfig>) => void` | Runtime config update (rate-limit store preserved) |
| `getVersion()` | `() => string` | Package version (`1.4.2`) |
| `isActive()` / `start()` / `stop()` | — | Toggle the pipeline without rebuilding |
| `registerPlugin(p)` / `unregisterPlugin(name)` | — | Manage plugins at runtime |
| `exportMetrics(format)` | `'json' \| 'prometheus' \| 'csv'` | Export a metrics snapshot as text |
| `generateReport(options?)` | `Promise<object>` | Period summary for dashboards |
| `getStatus()` | `() => object` | Status, version, uptime, enabled modules, plugins |
| `reset()` / `destroy()` | — | Clear metrics / full teardown (releases the singleton) |
| accessors | `getContextManager`, `getPluginManager`, `getAIModule`, `getRateLimiter`, `getHeadersModule`, `getCSPModule`, `getContextStats` | Internal managers for advanced use |

---

## Testing and Coverage

| Indicator | Value |
|---|---|
| Tests | **1405 passed** |
| Test suites | **35 passed** |
| Statements | **99.55%** |
| Branches | **96.71%** |
| Functions | **99.75%** |
| Lines | **99.7%** |
| Jest thresholds (gates in CI) | **98 / 94 / 99 / 98** |
| `src/core/ConfigManager.ts` | **100%** (statements, branches, functions, lines) |
| `src/middleware/headers.middleware.ts` | **100%** (statements, branches, functions, lines) |

CI runs on GitHub Actions (`.github/workflows/ci.yml`) with four stages on Node.js 20.x / 22.x:

```text
lint → typecheck → test → build
```

The `test` job runs `npm run test:ci` (coverage enabled), so the thresholds above fail the pipeline on any regression. The workflow runs on every push and pull request.

Local commands:

```bash
npm test  &&  npm run lint  &&  npm run type-check  &&  npm run build
```

(`test:coverage` adds `--coverage`; the same four gates run in CI.)

---

## Security

| Check | Result |
|---|---|
| Runtime dependencies | **0** |
| Network calls from `src/` | **none** — no HTTP clients, registries, or telemetry |
| `eval()` / `new Function()` | not used |
| Install scripts (`preinstall` / `postinstall`) | none |
| Config input validation | JSON-only parsing with size limits; path-traversal and prototype-pollution guards |
| Third-party runtime code | none — the published package contains only first-party compiled output |

FAB Shield performs all analysis in-process. It does not phone home, does not fetch threat lists, and requires no external services of any kind.

Report vulnerabilities privately to **Director@devorbit.ru** — see [`SECURITY.md`](./SECURITY.md) for the disclosure process. Please do not open public issues for exploitable bugs.

---

## What FAB Shield Does Not Replace

FAB Shield is a strong baseline, not a complete security program. It does not replace a full external WAF or CDN-level protection, secure architecture and coding practices, dependency and container scanning, penetration testing, infrastructure hardening, secret management, CSRF tokens for state-changing endpoints, input validation and parameterized queries, business-logic authorization checks, or DevSecOps processes (logging, monitoring, incident response).

Recommended pairing: HTTPS everywhere, secure cookies, CSRF tokens, strict input validation, parameterized queries, secret storage in environment variables or a vault, dependency scanning in CI, and regular updates.

---

## Roadmap

### `1.4.2` — released 2026-10-09

- full documentation audit: 15 files with broken code fences repaired;
- chapters that described a fabricated API rewritten against the real source
  (`Threat_Detection`, `Metrics_API`, `Security_Headers`, `Rate_Limiting`);
- phantom API examples replaced with the real plugin / event surface, missing
  capabilities marked explicitly as «not in the API».

### `1.4.1` — released 2026-10-04

- documentation and links migrated to GitHub (`https://github.com/zammartin2/shield`);
- contact address corrected to `Director@devorbit.ru`;
- internal-infrastructure references removed from docs and release tooling.

### `1.4.0` — released 2026-10-03

- CI: `lint → typecheck → test → build` on `node:22`;
- documentation rebuilt so every example matches the real public API;
- flakiness removed from the suite — 1405 tests / 35 suites, coverage ≈ 99.5%;
- Jest thresholds raised to 98 / 94 / 99 / 98 so CI blocks coverage regressions; zero runtime dependencies maintained.

### Next (`2.0.0`, planned for 2026-12-01)

- redesigned AI / analytics module;
- built-in WAF;
- cloud version;
- plugin marketplace;
- advanced dashboard;
- enterprise presets.

Follow [`CHANGELOG.md`](./CHANGELOG.md) and the [release page](https://github.com/zammartin2/shield/releases) for shipped versions.

---

## Project Status

| Metric | Value |
|---|---:|
| Current version | `1.4.2` |
| Released | `2026-10-09` |
| Tests | `1405` passed |
| Test suites | `35` passed |
| Coverage (statements / branches / functions / lines) | `99.55% / 96.71% / 99.75% / 99.7%` |
| Jest thresholds | `98 / 94 / 99 / 98` |
| Runtime dependencies | `0` |
| Node.js | `>= 18` |
| License | MIT |

The project is stable and under active maintenance. Version `1.4.2` completes the documentation audit: every documented example now matches the real public API.

---

## Changelog

The full release history is maintained in [`CHANGELOG.md`](./CHANGELOG.md).

---

## Contributing

Contributions are welcome — bug reports, documentation fixes, examples, plugins, and code.

- Contribution guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Code of conduct: [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- Issues and pull requests: <https://github.com/zammartin2/shield/issues>

```bash
git clone https://github.com/zammartin2/shield.git
cd fab-shield
npm ci
npm run lint && npm run type-check && npm test && npm run build
git checkout -b feature/my-feature
```

All four CI gates must pass before a pull request is accepted. Include a minimal reproduction and expected/actual behavior when reporting bugs.

---

## Community

| Channel | Link |
|---|---|
| Repository & issues | [github.com/zammartin2/shield](https://github.com/zammartin2/shield) |
| npm package | [@fab-orbita/shield](https://www.npmjs.com/package/@fab-orbita/shield) |
| Product site | [fab.devorbit.ru](https://fab.devorbit.ru) |
| Live demo | [shield.devorbit.ru](https://shield.devorbit.ru/) |
| Telegram | [@fab_shield](https://t.me/fab_shield) |
| Security contact | Director@devorbit.ru |

---

## FAQ

### Does FAB Shield replace Helmet?

It can. FAB Shield covers the same HTTP security headers and adds CSP management, rate limiting, attack detection, metrics, and plugins. If you keep Helmet, make sure both tools do not set conflicting values for the same headers.

### Is rate limiting enabled out of the box?

No. `rateLimit.enabled` defaults to `false`. Turn it on in the configuration or set `RATE_LIMIT_MAX`.

### Does FAB Shield make external network calls?

No. The package has zero runtime dependencies and performs no HTTP requests — all analysis, limiting, and metrics are in-process.

### How do I disable request analysis or use only headers?

```ts
const shield = new FABShield({
  headers: { enabled: true },      // keep only security headers
  csp: { enabled: false },
  ai: { enabled: false },          // no request analysis
  rateLimit: { enabled: false },
  monitoring: { enabled: false },
});
```

### Which frameworks are supported?

Express `^4.18.2 || ^5.0.0`, Fastify `^4`, and Koa `^2` — all optional peer dependencies. Other Connect-style servers work through `shield.middleware()`.

### Will it slow down my application?

Overhead is designed to be small: in-memory checks, no I/O, no dependencies loaded at request time. Actual cost depends on enabled modules, plugin count, and request volume — measure with `getMetrics().avgResponseTime` and the p95/p99 figures.

---

## DEVORBIT LLC

**DEVORBIT LLC** builds developer tools, infrastructure software, and security products for Node.js and TypeScript teams.

**Author:** Фабрициус Владимир Николаевич (Vladimir Fabritsius) — founder of DEVORBIT LLC.

**Contacts:** Director@devorbit.ru · repository https://github.com/zammartin2/shield · company https://devorbit.ru · product site https://fab.devorbit.ru · live demo https://shield.devorbit.ru

---

## License

[MIT](./LICENSE)

Copyright (c) 2026 ООО «Деворбит» (DEVORBIT LLC)

