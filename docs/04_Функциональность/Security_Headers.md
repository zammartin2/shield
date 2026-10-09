# 🛡️ Security Headers — Безопасные HTTP-заголовки

---

**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Security Headers** — это набор HTTP-заголовков, которые FAB Shield добавляет к каждому ответу, чтобы закрыть классические векторы: кликовый جacking, MIME-сниффинг, утечки referer, встраивание в чужие фреймы и раскрытие версий ПО.

Модуль реализован в `HeadersModule` (`src/modules/headers/HeadersModule.ts`) и управляется секцией `headers` конфигурации (`HeaderConfig`). Включён по умолчанию; `Content-Security-Policy` выдаёт **отдельный** модуль CSP и этим модулем не дублируется.

---

## 📦 Устанавливаемые заголовки

Заголовки записываются в каждый ответ (значения — по умолчанию):

| Заголовок | Формируемое значение |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` (настраивается: `SAMEORIGIN` / `ALLOW-FROM`) |
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

`X-Powered-By` и `Server` удаляются из каждого ответа. `Content-Security-Policy` отдельно выдаёт модуль CSP (см. [`Dynamic_CSP.md`](./Dynamic_CSP.md)).

---

## 🔧 Конфигурация

Секция `headers` (`HeaderConfig`):

| Путь | Тип | Назначение |
|---|---|---|
| `enabled` | `boolean` | `false` — полностью пропустить модуль заголовков |
| `disabled` | `string[]` | Имена заголовков, которые нужно **удалить** из ответа (приоритет выше всех значений) |
| `custom` | `Record<string, string>` | Пользовательские заголовки, добавляются дословно |
| `hsts.maxAge` | `number` | `max-age` в секундах (по умолчанию `31536000`) |
| `hsts.includeSubDomains` | `boolean` | Добавить `; includeSubDomains` |
| `hsts.preload` | `boolean` | Добавить `; preload` |
| `xFrame.action` | `'DENY' \| 'SAMEORIGIN' \| 'ALLOW-FROM'` | Значение `X-Frame-Options` (по умолчанию `DENY`) |
| `referrerPolicy.policy` | `string` | Значение `Referrer-Policy` (по умолчанию `strict-origin-when-cross-origin`) |
| `crossOrigin.embedder` | `string` | `Cross-Origin-Embedder-Policy` (задаётся только если указан) |
| `crossOrigin.opener` | `string` | `Cross-Origin-Opener-Policy` (по умолчанию `same-origin`) |
| `crossOrigin.resource` | `string` | `Cross-Origin-Resource-Policy` (задаётся только если указан) |
| `xContentTypeOptions` | `boolean` | `false` — не ставить `X-Content-Type-Options` |
| `xXssProtection` | `boolean` | `false` — не ставить `X-XSS-Protection` |
| `xDnsPrefetchControl` | `boolean` | `false` — не ставить `X-DNS-Prefetch-Control` |
| `xDownloadOptions` | `boolean` | `false` — не ставить `X-Download-Options` |
| `xPermittedCrossDomainPolicies` | `boolean` | `false` — не ставить `X-Permitted-Cross-Domain-Policies` |

> Заголовки `X-Powered-By` и `Server` удаляются всегда — отдельного флага для них нет. Для удаления HSTS, `X-Frame-Options` или `Referrer-Policy` используйте список `disabled`.

---

## 💻 Примеры

### Значения по умолчанию

```ts
import { FABShield } from '@fab-orbita/shield'

// headers включены по умолчанию — конфигурация не нужна
const shield = new FABShield()
```

### Кастомизация

```ts
const shield = new FABShield({
  headers: {
    enabled: true,
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    xFrame: { action: 'SAMEORIGIN' },
    referrerPolicy: { policy: 'no-referrer' },
    crossOrigin: { opener: 'same-origin', resource: 'same-origin' },
    custom: { 'X-Robots-Tag': 'noindex' },
    disabled: ['X-Download-Options'],
  },
})
```

Заголовки `custom` применяются дословно поверх встроенного набора; имена из `disabled` удаляются в последнюю очередь и потому имеют приоритет над всеми перечисленными выше.

### Полное отключение модуля

```ts
const shield = new FABShield({
  headers: { enabled: false },
})
```

---

## 🌍 Переменные окружения

| Переменная | Формат | По умолчанию | Соответствует |
|---|---|---|---|
| `SHIELD_HEADERS` | `'true'` → вкл | `true` | `headers.enabled` |
| `HSTS_MAX_AGE` | целое число секунд | `31536000` | `headers.hsts.maxAge` |
| `HSTS_INCLUDE_SUBDOMAINS` | `!== 'false'` | `true` | `headers.hsts.includeSubDomains` |
| `HSTS_PRELOAD` | `=== 'true'` | `false`, если `HSTS_MAX_AGE` задан без неё | `headers.hsts.preload` — если задать только `HSTS_MAX_AGE`, preload будет **выключен**, пока дополнительно не задано `HSTS_PRELOAD=true` |

```env
HSTS_MAX_AGE=63072000
HSTS_PRELOAD=true
```

---

## 🔗 Связанные разделы

- **Content Security Policy** — [`Dynamic_CSP.md`](./Dynamic_CSP.md) (отдельный модуль, заголовок `Content-Security-Policy`)
- Полный справочник конфигурации — [README](../../README.ru.md#заголовки-безопасности)

---

## 📞 Контакты

| Поле | Значение |
|---|---|
| Репозиторий | [github.com/zammartin2/shield](https://github.com/zammartin2/shield) |
| Пакет | [@fab-orbita/shield](https://www.npmjs.com/package/@fab-orbita/shield) |
| Email | Director@devorbit.ru |
| Живое демо | [shield.devorbit.ru](https://shield.devorbit.ru/) |

---

© 2026 ООО «Деворбит». Все права защищены.
