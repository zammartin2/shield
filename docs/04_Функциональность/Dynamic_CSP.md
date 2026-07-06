# 🛡️ Dynamic CSP — Динамическая защита от XSS-атак

> Подробное руководство по **Dynamic CSP** в **FAB Shield**  
> Для гибкой защиты Node.js-приложений от XSS и небезопасных источников ресурсов.

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Dynamic CSP** — это модуль FAB Shield для гибкой настройки **Content Security Policy**.

Он помогает защитить приложение от:

- XSS-атак;
- подмены скриптов;
- небезопасных inline-скриптов;
- подключения неизвестных CDN;
- clickjacking через `frame-ancestors`;
- утечек через неразрешенные `connect-src`;
- небезопасных внешних ресурсов.

В отличие от статической CSP-политики, **Dynamic CSP** может учитывать контекст конкретного запроса: пользователя, роль, сессию, маршрут, риск, доверенные CDN и другие параметры.

---

## 🎯 Что такое Dynamic CSP

## Статический CSP

Статический CSP обычно одинаковый для всех запросов.

```typescript
const staticCSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"]
}
```

### Проблемы статического CSP

- ❌ всегда одинаковый;
- ❌ не учитывает роль пользователя;
- ❌ не учитывает маршрут;
- ❌ не учитывает риск запроса;
- ❌ часто становится либо слишком строгим, либо слишком слабым;
- ❌ сложно безопасно работать с inline-скриптами без nonce;
- ❌ сложно поддерживать большие приложения с разными страницами.

---

## Динамический CSP

Dynamic CSP адаптируется под каждый запрос.

```typescript
const dynamicCSP = {
  'default-src': ["'self'"],

  'script-src': [
    "'self'",

    // Разный nonce для каждого запроса
    (req, res) => `'nonce-${res.locals.nonce}'`,

    // Только доверенные CDN
    (req) => req.cspTrustedCDNs || [],

    // Контекстная логика
    (req) => req.user?.role === 'admin'
      ? "'unsafe-inline'"
      : null
  ],

  'style-src': [
    "'self'",
    (req, res) => `'nonce-${res.locals.nonce}'`
  ]
}
```

### Преимущества Dynamic CSP

- ✅ адаптируется под пользователя;
- ✅ учитывает контекст запроса;
- ✅ поддерживает nonce для каждого запроса;
- ✅ может учитывать роли и права;
- ✅ позволяет включать разные политики для разных маршрутов;
- ✅ помогает постепенно ужесточать CSP;
- ✅ поддерживает мониторинг нарушений.

> В production `unsafe-inline` лучше избегать. Используйте nonce, hash или Trusted Types там, где это возможно.

---

## 🧠 Как работает Dynamic CSP

## Архитектура

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DYNAMIC CSP ENGINE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                            INPUT LAYER                              │    │
│  │                                                                     │    │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │    │
│  │   │  Request   │  │    User    │  │  Session   │  │  Context   │   │    │
│  │   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │    │
│  │                                                                     │    │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │    │
│  │   │   Route    │  │    Risk    │  │ Trusted    │  │ Reporting  │   │    │
│  │   │            │  │   Score    │  │  Sources   │  │            │   │    │
│  │   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         CONTEXT ANALYZER                            │    │
│  │                                                                     │    │
│  │  • Анализ запроса                                                   │    │
│  │  • Определение пользователя                                         │    │
│  │  • Проверка ролей и прав                                            │    │
│  │  • Оценка риска                                                     │    │
│  │  • Выбор CSP-профиля                                                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         POLICY GENERATOR                            │    │
│  │                                                                     │    │
│  │  • Генерация nonce                                                  │    │
│  │  • Выбор директив                                                   │    │
│  │  • Применение правил                                                │    │
│  │  • Подстановка trusted sources                                      │    │
│  │  • Удаление пустых значений                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           OUTPUT LAYER                              │    │
│  │                                                                     │    │
│  │  • Установка CSP-заголовка                                          │    │
│  │  • Установка Report-Only заголовка                                  │    │
│  │  • Сохранение nonce в context                                       │    │
│  │  • Логирование                                                      │    │
│  │  • Сбор метрик                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Поток работы

```text
1. Клиент отправляет запрос
   ↓
2. FAB Shield создает request context
   ↓
3. Dynamic CSP анализирует маршрут, пользователя и сессию
   ↓
4. Генерируется уникальный nonce
   ↓
5. Выбираются CSP-директивы
   ↓
6. Динамические функции директив выполняются
   ↓
7. Пустые значения удаляются
   ↓
8. CSP превращается в HTTP-заголовок
   ↓
9. Заголовок добавляется к ответу
   ↓
10. Нарушения CSP отправляются в report endpoint
```

---

## 🔧 Использование

## Базовая конфигурация

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  csp: {
    enabled: true,
    dynamic: true
  }
})

app.use(shield.middleware())
```

---

## Расширенная конфигурация

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  csp: {
    enabled: true,
    dynamic: true,

    // Режим отчетности: не блокирует, только собирает отчеты
    reportOnly: false,

    directives: {
      'default-src': ["'self'"],

      'script-src': [
        "'self'",

        // Динамический nonce
        (req, res) => `'nonce-${res.locals.nonce}'`,

        // Проверенные CDN
        (req) => req.cspTrustedCDNs || [],

        // Контекстная логика для роли
        (req) => req.user?.role === 'admin'
          ? "'unsafe-inline'"
          : null
      ],

      'style-src': [
        "'self'",
        (req, res) => `'nonce-${res.locals.nonce}'`
      ],

      'img-src': [
        "'self'",
        'data:',
        (req) => req.trustedImageDomains || []
      ],

      'font-src': [
        "'self'",
        'https:',
        'data:'
      ],

      'connect-src': [
        "'self'",
        (req) => req.trustedAPIDomains || []
      ],

      'frame-ancestors': [
        (req) => req.user?.role === 'admin'
          ? "'self'"
          : "'none'"
      ]
    },

    reporting: {
      enabled: true,
      uri: '/api/csp-report',
      reportTo: 'csp-endpoint'
    }
  }
})
```

---

## 🎨 Примеры динамических правил

## 1. Строгий CSP для админ-панели

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  csp: {
    enabled: true,
    dynamic: true,

    directives: {
      'default-src': ["'self'"],

      'script-src': [
        "'self'",

        (req) => {
          if (req.path.startsWith('/admin')) {
            return "'strict-dynamic'"
          }

          return null
        }
      ],

      'frame-ancestors': [
        (req) => {
          if (req.path.startsWith('/admin')) {
            return "'none'"
          }

          return "'self'"
        }
      ]
    }
  }
})
```

---

## 2. Trusted CDN только для dashboard

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  csp: {
    enabled: true,
    dynamic: true,

    directives: {
      'script-src': [
        "'self'",

        (req) => {
          if (req.path.startsWith('/dashboard')) {
            return [
              'https://cdn.jsdelivr.net',
              'https://cdnjs.cloudflare.com'
            ]
          }

          return []
        }
      ]
    }
  }
})
```

---

## 3. Динамический nonce

```typescript
import express from 'express'
import { FABShield } from '@fab-orbita/shield'

const app = express()

const shield = new FABShield({
  csp: {
    enabled: true,
    dynamic: true,

    nonce: {
      enabled: true,
      length: 32,
      algorithm: 'sha256',
      cacheEnabled: false
    }
  }
})

app.use(shield.middleware())

app.get('/', (req, res) => {
  const nonce = res.locals.nonce

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <script nonce="${nonce}">
          console.log('Protected by CSP!')
        </script>
      </head>
      <body>
        <h1>FAB Shield Dynamic CSP</h1>
      </body>
    </html>
  `)
})
```

> Nonce должен быть уникальным для каждого ответа. Не переиспользуйте nonce между независимыми запросами.

---

## 4. Разные политики для API и страниц

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  csp: {
    enabled: true,
    dynamic: true,

    directives: {
      'default-src': [
        (req) => req.path.startsWith('/api')
          ? "'none'"
          : "'self'"
      ],

      'script-src': [
        (req) => req.path.startsWith('/api')
          ? "'none'"
          : "'self'"
      ],

      'connect-src': [
        "'self'",
        (req) => req.path.startsWith('/admin')
          ? 'https://admin-api.example.com'
          : 'https://api.example.com'
      ]
    }
  }
})
```

---

## 📊 Мониторинг CSP

## Метрики CSP

```typescript
const metrics = shield.csp.getMetrics()

console.log({
  // Статистика
  totalPolicies: metrics.totalPolicies,
  violations: metrics.violations,
  reports: metrics.reports,

  // Nonce
  noncesGenerated: metrics.noncesGenerated,
  noncesUsed: metrics.noncesUsed,
  nonceReuse: metrics.nonceReuse,

  // Директивы
  activeDirectives: metrics.activeDirectives,
  mostUsedDirectives: metrics.mostUsedDirectives,
  blockedResources: metrics.blockedResources
})
```

---

## Основные метрики

| Метрика | Назначение |
|:---|:---|
| `totalPolicies` | Количество сгенерированных политик |
| `violations` | Количество нарушений CSP |
| `reports` | Количество полученных отчетов |
| `noncesGenerated` | Сколько nonce было создано |
| `noncesUsed` | Сколько nonce использовано в ответах |
| `nonceReuse` | Повторное использование nonce |
| `activeDirectives` | Активные директивы |
| `blockedResources` | Заблокированные ресурсы |

---

## Отчеты о нарушениях

```typescript
import express from 'express'

const app = express()

app.use(express.json({
  type: [
    'application/json',
    'application/csp-report',
    'application/reports+json'
  ]
}))

app.post('/api/csp-report', (req, res) => {
  const report = req.body

  console.log('CSP Violation:', {
    documentURI: report['document-uri'],
    violatedDirective: report['violated-directive'],
    blockedURI: report['blocked-uri'],
    effectiveDirective: report['effective-directive']
  })

  shield.csp.saveReport(report)

  if (report['violated-directive'] === 'script-src') {
    sendAlert('CSP Script Violation', report)
  }

  res.status(204).end()
})
```

---

## 🛡️ Продвинутые техники

## 1. Trusted Types

Trusted Types помогают защититься от DOM XSS.

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  csp: {
    enabled: true,
    dynamic: true,

    directives: {
      'require-trusted-types-for': ["'script'"],
      'trusted-types': ["'default'", 'app-policy']
    }
  }
})
```

---

## 2. Report-Only режим

Report-Only полезен при внедрении CSP в существующий проект.

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  csp: {
    enabled: true,
    dynamic: true,
    reportOnly: true,

    reporting: {
      enabled: true,
      uri: '/api/csp-report'
    }
  }
})
```

В этом режиме браузер не блокирует ресурс, но отправляет отчет о нарушении.

---

## 3. Интеграция с SRI

**SRI** — Subresource Integrity. Он помогает проверять целостность внешних ресурсов.

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  csp: {
    enabled: true,
    dynamic: true,

    directives: {
      'script-src': [
        "'self'",

        (req) => {
          return req.trustedScripts?.map((script) => {
            return `'sha256-${script.integrity}'`
          }) || []
        }
      ]
    }
  }
})
```

---

## 4. CSP для WebSocket

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  csp: {
    enabled: true,
    dynamic: true,

    directives: {
      'connect-src': [
        "'self'",
        'https://api.example.com',
        'wss://ws.example.com'
      ]
    }
  }
})
```

---

## 🚨 Устранение проблем

## Проблема: CSP блокирует легитимный скрипт

### Проверить отчеты

```typescript
const reports = shield.csp.getReports()

const blockedScript = reports.find((report) => {
  return report['violated-directive'] === 'script-src'
})

console.log(blockedScript)
```

---

### Добавить hash-исключение

```typescript
shield.csp.addException({
  directive: 'script-src',
  value: `'sha256-${calculateHash(blockedScript)}'`,
  reason: 'Legitimate script'
})
```

---

## Проблема: nonce не генерируется

### Проверить настройки

```typescript
const config = shield.csp.getConfig()

console.log({
  nonceEnabled: config.nonce?.enabled,
  nonceLength: config.nonce?.length
})
```

---

### Принудительная генерация

```typescript
const nonce = shield.csp.generateNonce()

res.locals.nonce = nonce
```

---

## Проблема: CSP слишком строгий

Начните с `reportOnly: true`, соберите отчеты и постепенно ужесточайте политику.

```typescript
const shield = new FABShield({
  csp: {
    enabled: true,
    dynamic: true,
    reportOnly: true,

    reporting: {
      enabled: true,
      uri: '/api/csp-report'
    }
  }
})
```

---

## ✅ Рекомендации по production

- Начинайте внедрение с `reportOnly: true`.
- Убирайте `unsafe-inline` там, где возможно.
- Используйте nonce для inline-скриптов.
- Используйте hash для стабильных inline-фрагментов.
- Используйте `frame-ancestors 'none'` для админ-панелей.
- Разрешайте только нужные CDN.
- Не используйте wildcard `*` без необходимости.
- Храните отчеты CSP и анализируйте их.
- Настройте алерты для нарушений `script-src`.
- Проверяйте CSP после каждого крупного изменения фронтенда.
- Используйте Trusted Types для защиты от DOM XSS.

---

## ⚠️ Важные ограничения

Dynamic CSP не является полной заменой безопасной разработки.

Он не заменяет:

- output encoding;
- input validation;
- sanitization;
- secure coding;
- dependency audit;
- Web Application Firewall;
- DDoS-защиту;
- pentest;
- аудит frontend-кода.

Dynamic CSP должен использоваться как один из уровней защиты вместе с другими security-практиками.

---

## 📞 Контакты

| | |
|:---|:---|
| **Автор** | Фабрициус Владимир Николаевич |
| **Компания** | ООО «Деворбит» (DEVORBIT LLC) |
| **Email** | [derector@devorbit.ru](mailto:derector@devorbit.ru) |
| **Реестр** | [fab.devorbit.ru](https://fab.devorbit.ru) |
| **Сайт** | [devorbit.ru](https://devorbit.ru) |
| **GitHub** | [zammartin2/shield](https://github.com/zammartin2/shield) |
| **npm** | [@fab-orbita/shield](https://www.npmjs.com/package/@fab-orbita/shield) |
| **Fab Registry** | [@fab-orbita/shield](https://fab.devorbit.ru/packages/@fab-orbita/shield) |
| **Telegram** | [@fab_shield](https://t.me/fab_shield) |

---

## 🏆 Итог

**Dynamic CSP** — это:

- ✅ адаптивная CSP-политика под каждый запрос;
- ✅ безопасный nonce для inline-скриптов;
- ✅ гибкие правила по ролям, маршрутам и контексту;
- ✅ мониторинг нарушений;
- ✅ Report-Only режим для безопасного внедрения;
- ✅ дополнительный уровень защиты от XSS.

Dynamic CSP помогает поднять защиту от XSS на новый уровень, но максимальный эффект достигается только вместе с безопасной разработкой, валидацией, CSP-аудитом и регулярным тестированием.

---

<p align="center">

**FAB Shield — динамическая защита для Node.js-приложений.**

Made with ❤️ by **Vladimir Fabrisius**

[GitHub](https://github.com/zammartin2/shield) •
[npm](https://www.npmjs.com/package/@fab-orbita/shield) •
[Fab Registry](https://fab.devorbit.ru/packages/@fab-orbita/shield) •
[Telegram](https://t.me/fab_shield)

</p>

---

© 2026 ООО «Деворбит». Все права защищены.
