# 🛡️ IP Reputation — Управление репутацией IP-адресов

> Подробное руководство по модулю **IP Reputation** в **FAB Shield**  
> Для оценки доверия к IP-адресам, блокировки подозрительных источников и усиления защиты Node.js-приложений.

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**IP Reputation** — это система оценки доверия к IP-адресам.

Она помогает:

- выявлять подозрительные IP;
- блокировать источники атак;
- усиливать rate limiting;
- включать challenge для рискованных клиентов;
- использовать внутреннюю историю запросов;
- подключать внешние reputation-источники;
- строить отчеты и dashboard по IP-активности.

IP Reputation не заменяет WAF, DDoS-защиту и мониторинг инфраструктуры, но является важным application-level слоем защиты.

---

## 🎯 Что такое IP Reputation

**Репутация IP** — это оценка доверия к IP-адресу на основе разных факторов:

```text
IP Reputation Score
   ↓
История запросов
   +
Обнаруженные угрозы
   +
Поведенческий анализ
   +
Внешние источники
   +
География и контекст
```

---

## 🧭 Уровни репутации

| Уровень | Цвет | Score | Описание | Возможное действие |
|:---|:---:|:---:|:---|:---|
| **Trusted** | 🟢 | `80–100` | Проверенный источник | `allow` |
| **Neutral** | 🟡 | `40–79` | Неизвестный или обычный источник | `monitor` |
| **Suspicious** | 🟠 | `20–39` | Подозрительное поведение | `challenge` / `rate-limit` |
| **Malicious** | 🔴 | `0–19` | Высокий риск атаки | `block` |

> Пороговые значения должны настраиваться под конкретный проект и проверяться на staging.

---

## 🧠 Как это работает

## Архитектура

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         IP REPUTATION ENGINE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                            INPUT LAYER                              │    │
│  │                                                                     │    │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │    │
│  │   │  Client    │  │  Request   │  │  History   │  │ External   │   │    │
│  │   │    IP      │  │  Pattern   │  │   Data     │  │ Sources    │   │    │
│  │   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │    │
│  │                                                                     │    │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │    │
│  │   │    Geo     │  │   Route    │  │   User     │  │   Session  │   │    │
│  │   │  Context   │  │  Context   │  │  Context   │  │  Context   │   │    │
│  │   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           ANALYSIS LAYER                            │    │
│  │                                                                     │    │
│  │  • История запросов                                                 │    │
│  │  • Обнаруженные угрозы                                              │    │
│  │  • Внешние базы                                                     │    │
│  │  • Поведенческий анализ                                             │    │
│  │  • Геолокация                                                       │    │
│  │  • Частота запросов                                                 │    │
│  │  • Срабатывания правил                                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                            SCORING LAYER                            │    │
│  │                                                                     │    │
│  │  • Расчет репутации: 0–100                                          │    │
│  │  • Определение уровня                                               │    │
│  │  • Confidence score                                                 │    │
│  │  • Рекомендованное действие                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                            ACTION LAYER                             │    │
│  │                                                                     │    │
│  │  • Allow                                                            │    │
│  │  • Monitor                                                          │    │
│  │  • Challenge                                                        │    │
│  │  • Rate Limit                                                       │    │
│  │  • Block                                                            │    │
│  │  • Alert                                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Поток обработки

```text
1. Приходит запрос
   ↓
2. FAB Shield извлекает IP-адрес
   ↓
3. Проверяется whitelist / blacklist
   ↓
4. Загружается локальная история IP
   ↓
5. Выполняется анализ поведения
   ↓
6. При необходимости проверяются внешние источники
   ↓
7. Рассчитывается reputation score
   ↓
8. Определяется уровень репутации
   ↓
9. Применяется действие: allow / monitor / challenge / block
   ↓
10. Метрики и логи обновляются
```

---

## 🔧 Использование

## Базовая конфигурация

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ipReputation: {
    enabled: true
  }
})
```

---

## Расширенная конфигурация

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ipReputation: {
    enabled: true,

    thresholds: {
      trusted: 80,
      neutral: 40,
      suspicious: 20,
      malicious: 0
    },

    actions: {
      trusted: 'allow',
      neutral: 'monitor',
      suspicious: 'challenge',
      malicious: 'block'
    },

    sources: {
      internal: true,

      external: {
        abuseIPDB: true,
        virustotal: true,
        ipQualityScore: true,

        custom: {
          url: 'https://api.example.com/ip',
          apiKey: process.env.IP_REPUTATION_API_KEY
        }
      }
    },

    cache: {
      enabled: true,
      ttl: 3600,
      maxSize: 10000
    },

    autoBlock: {
      enabled: true,
      duration: 3600,
      threshold: 3
    }
  }
})
```

> Не храните API-ключи в коде. Используйте environment variables.

---

## 📊 Оценка репутации

## Как рассчитывается reputation score

```typescript
interface ReputationScore {
  score: number
  level: 'trusted' | 'neutral' | 'suspicious' | 'malicious'

  factors: {
    history: number
    threats: number
    external: number
    behavior: number
  }

  details: {
    totalRequests: number
    threatCount: number
    lastSeen: Date
    firstSeen: Date
    countries: string[]
  }

  recommendations: string[]
}
```

---

## Факторы оценки

| Фактор | Вес | Что учитывает |
|:---|:---:|:---|
| `history` | `0–30` | История запросов и стабильность поведения |
| `threats` | `0–30` | Количество и тяжесть найденных угроз |
| `external` | `0–30` | Данные внешних reputation-сервисов |
| `behavior` | `0–10` | Частота, маршруты, ошибки, аномалии |

---

## Пример оценки

```typescript
const reputation = await shield.ipReputation.getReputation('192.168.1.100')

console.log(reputation)
```

Пример результата:

```json
{
  "score": 25,
  "level": "suspicious",
  "factors": {
    "history": 10,
    "threats": 5,
    "external": 5,
    "behavior": 5
  },
  "details": {
    "totalRequests": 150,
    "threatCount": 8,
    "lastSeen": "2026-07-01T12:00:00.000Z",
    "firstSeen": "2026-06-20T08:00:00.000Z",
    "countries": ["RU", "DE"]
  },
  "recommendations": [
    "Заблокировать IP на 24 часа",
    "Включить challenge для всех запросов",
    "Отправить уведомление администратору"
  ]
}
```

---

## 🛡️ Внешние источники

IP Reputation может использовать внешние источники, если проекту это нужно.

> При подключении внешних API учитывайте privacy, лимиты запросов, стоимость, задержку и требования к обработке персональных данных.

---

## AbuseIPDB

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ipReputation: {
    sources: {
      external: {
        abuseIPDB: {
          enabled: true,
          apiKey: process.env.ABUSEIPDB_API_KEY,
          maxAge: 90,
          confidenceThreshold: 50
        }
      }
    }
  }
})
```

---

## VirusTotal

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ipReputation: {
    sources: {
      external: {
        virustotal: {
          enabled: true,
          apiKey: process.env.VIRUSTOTAL_API_KEY,
          minDetections: 3
        }
      }
    }
  }
})
```

---

## IP Quality Score

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ipReputation: {
    sources: {
      external: {
        ipQualityScore: {
          enabled: true,
          apiKey: process.env.IPQS_API_KEY,
          checkFraud: true,
          checkProxy: true,
          checkVPN: true
        }
      }
    }
  }
})
```

---

## Custom source

```typescript
const shield = new FABShield({
  ipReputation: {
    sources: {
      external: {
        custom: {
          enabled: true,
          url: 'https://security.example.com/ip-reputation',
          apiKey: process.env.CUSTOM_IP_REPUTATION_KEY,
          timeout: 1500
        }
      }
    }
  }
})
```

---

## 📊 Мониторинг IP

## Просмотр репутации

```typescript
const reputation = await shield.ipReputation.getReputation('192.168.1.100')

console.log(reputation)
```

---

## Список заблокированных IP

```typescript
const blocked = shield.ipReputation.getBlockedIPs()

console.log(`Заблокировано IP: ${blocked.length}`)
```

---

## Статистика

```typescript
const stats = shield.ipReputation.getStats()

console.log({
  totalIPs: stats.totalIPs,
  trusted: stats.trusted,
  neutral: stats.neutral,
  suspicious: stats.suspicious,
  malicious: stats.malicious,
  blocked: stats.blocked
})
```

---

## Основные метрики

| Метрика | Назначение |
|:---|:---|
| `totalIPs` | Количество известных IP |
| `trusted` | Количество trusted IP |
| `neutral` | Количество neutral IP |
| `suspicious` | Количество suspicious IP |
| `malicious` | Количество malicious IP |
| `blocked` | Количество заблокированных IP |
| `autoBlocked` | Количество автоблокировок |
| `externalChecks` | Количество проверок внешних источников |
| `cacheHits` | Попадания в кэш |
| `cacheMisses` | Промахи кэша |

---

## 📋 Управление списками

## Добавление в blacklist

```typescript
shield.ipReputation.addToBlacklist('192.168.1.100', {
  reason: 'Multiple SQL injection attempts',
  duration: 86400,
  severity: 'high'
})
```

---

## Добавление в whitelist

```typescript
shield.ipReputation.addToWhitelist('10.0.0.1', {
  reason: 'Internal monitoring system'
})
```

---

## Удаление из списка

```typescript
shield.ipReputation.removeFromList('192.168.1.100')
```

---

## Проверка статуса

```typescript
const status = shield.ipReputation.getListStatus('192.168.1.100')

console.log(status)
```

---

## 🚨 Автоматические действия

## Настройка auto actions

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ipReputation: {
    autoActions: [
      {
        condition: (ip) => ip.threatCount > 5,
        action: 'block',
        duration: 3600,
        severity: 'high'
      },

      {
        condition: (ip) => ip.level === 'suspicious',
        action: 'challenge',
        type: 'captcha'
      },

      {
        condition: (ip) => ip.firstSeen > Date.now() - 3600,
        action: 'monitor',
        duration: 86400
      }
    ]
  }
})
```

---

## Кастомные действия

```typescript
shield.ipReputation.registerAction({
  name: 'notifyAdmin',

  execute: async (ip, info) => {
    await sendTelegramNotification({
      text: `⚠️ Подозрительный IP: ${ip}\nПричина: ${info.reason}`
    })
  }
})

shield.ipReputation.addRule({
  condition: (ip) => ip.level === 'malicious',
  action: 'notifyAdmin'
})
```

---

## 🌍 Гео-блокировка

## Настройка geo blocking

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ipReputation: {
    geoBlocking: {
      enabled: true,

      blockedCountries: ['XX', 'YY'],
      allowedCountries: ['US', 'GB', 'DE', 'FR'],

      mode: 'block',

      exceptions: {
        admin: ['*'],
        trusted: ['*']
      }
    }
  }
})
```

---

## Режимы geo blocking

| Режим | Описание |
|:---|:---|
| `block` | Блокировать страны из `blockedCountries` |
| `allow` | Разрешать только страны из `allowedCountries` |
| `challenge` | Запрашивать дополнительную проверку |
| `monitor` | Только логировать и собирать статистику |

> Геолокация IP не всегда точна. Не используйте geo blocking как единственный механизм безопасности.

---

## 📊 Визуализация

## Dashboard-данные

```typescript
const dashboard = shield.ipReputation.getDashboardData()

console.log({
  threatMap: dashboard.threatMap,
  topAttackers: dashboard.topAttackers,
  countryStats: dashboard.countryStats,

  trends: {
    last24h: dashboard.trends.last24h,
    last7d: dashboard.trends.last7d,
    last30d: dashboard.trends.last30d
  }
})
```

---

## Пример dashboard-секций

| Секция | Что показывает |
|:---|:---|
| Threat Map | География подозрительной активности |
| Top Attackers | Самые активные IP |
| Country Stats | Статистика по странам |
| Trends | Динамика за 24 часа, 7 дней, 30 дней |
| Blocked IPs | Активные блокировки |
| Reputation Levels | Распределение по уровням репутации |

---

## 🧪 Отладка

## Проверка конкретного IP

```typescript
const debug = await shield.ipReputation.debug('192.168.1.100')

console.log(debug)
```

---

## Очистка кэша

```typescript
shield.ipReputation.clearCache()
```

---

## Сброс репутации

```typescript
shield.ipReputation.resetReputation('192.168.1.100')
```

---

## ✅ Рекомендации по production

- Начинайте с режима `monitor`.
- Не блокируйте новые IP без дополнительного контекста.
- Используйте whitelist для внутренних сервисов.
- Используйте blacklist для подтвержденных атакующих IP.
- Кэшируйте внешние проверки, чтобы снизить задержку.
- Не храните API-ключи в коде.
- Учитывайте privacy и требования законодательства.
- Настройте алерты для массовых блокировок.
- Проверяйте false positives.
- Используйте shared storage для нескольких инстансов.
- Не полагайтесь только на IP: NAT, VPN и proxy могут искажать картину.

---

## ⚠️ Важные ограничения

IP Reputation не является гарантией полной защиты.

Ограничения:

- IP может принадлежать NAT, proxy или корпоративной сети.
- Один IP может использоваться многими пользователями.
- Атакующий может часто менять IP.
- GeoIP может ошибаться.
- Внешние источники могут давать false positives.
- Блокировка IP может случайно затронуть легитимных пользователей.
- Некоторые данные могут подпадать под требования privacy/compliance.

IP Reputation должен использоваться как один из уровней защиты вместе с CSP, headers, rate limiting, AI Detection, WAF и мониторингом.

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

**IP Reputation** — это:

- ✅ интеллектуальная оценка доверия к IP;
- ✅ многоуровневая scoring-модель;
- ✅ внутренние и внешние источники данных;
- ✅ автоматические действия;
- ✅ blacklist и whitelist;
- ✅ geo blocking;
- ✅ dashboard-метрики;
- ✅ гибкая настройка под проект.

IP Reputation помогает блокировать подозрительные источники раньше, но максимальный эффект достигается только в комплексной security-архитектуре.

---

<p align="center">

**FAB Shield — управление репутацией IP для Node.js-приложений.**

Made with ❤️ by **Vladimir Fabrisius**

[GitHub](https://github.com/zammartin2/shield) •
[npm](https://www.npmjs.com/package/@fab-orbita/shield) •
[Fab Registry](https://fab.devorbit.ru/packages/@fab-orbita/shield) •
[Telegram](https://t.me/fab_shield)

</p>

---

© 2026 ООО «Деворбит». Все права защищены.
