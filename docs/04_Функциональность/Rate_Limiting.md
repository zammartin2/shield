# ⚡ Rate Limiting — Умное ограничение запросов

---

**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Rate Limiting** — это механизм ограничения количества запросов к вашему приложению. Это одна из ключевых защит от DDoS-атак, брутфорса и чрезмерной нагрузки.

---

## 🎯 Что дает Rate Limiting

### Ключевые преимущества

| Преимущество | Описание |
|:---|:---|
| **Защита от DDoS** | Ограничивает количество запросов от одного источника |
| **Предотвращение брутфорса** | Блокирует подбор паролей |
| **Стабильность** | Предотвращает перегрузку сервера |
| **Справедливость** | Равное распределение ресурсов |
| **Экономия** | Снижает нагрузку на инфраструктуру |

---

## 🧠 Как это работает

### Архитектура Rate Limiting

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ RATE LIMITING ENGINE │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ INPUT LAYER │ │
│ │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │ │
│ │ │ Client │ │ User │ │ API Key │ │ Path │ │ │
│ │ │ IP │ │ ID │ │ │ │ │ │ │
│ │ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ COUNTER LAYER │ │
│ │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │ │
│ │ │ In-Memory │ │ Redis │ │ Database │ │ Custom │ │ │
│ │ │ Cache │ │ │ │ │ │ Store │ │ │
│ │ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ DECISION LAYER │ │
│ │ • Проверка лимитов │ │
│ │ • Сравнение с порогами │ │
│ │ • Принятие решения │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ACTION LAYER │ │
│ │ • ALLOW - Пропустить │ │
│ │ • BLOCK - Заблокировать │ │
│ │ • CHALLENGE - Проверка (CAPTCHA) │ │
│ │ • THROTTLE - Замедлить │ │
│ │ • DELAY - Добавить задержку │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────────────────────┘

```

---

## 🔧 Использование

### Базовая конфигурация

```typescript
const shield = new FABShield({
    rateLimit: {
        enabled: true,
        windowMs: 60000,    // 1 минута
        max: 100            // 100 запросов в минуту
    }
})
```

### Расширенная конфигурация

```typescript
const shield = new FABShield({
    rateLimit: {
        enabled: true,
        
        // Глобальные настройки
        default: {
            windowMs: 60000,
            max: 100,
        },
        
        // Настройки по ролям
        roles: {
            admin: {
                windowMs: 60000,
                max: 1000
            },
            user: {
                windowMs: 60000,
                max: 100
            },
            guest: {
                windowMs: 60000,
                max: 50
            }
        },
        
        // Настройки по путям
        paths: {
            '/api/auth/*': {
                windowMs: 60000,
                max: 10           // 10 попыток входа в минуту
            },
            '/api/upload/*': {
                windowMs: 3600000,
                max: 10           // 10 загрузок в час
            },
            '/api/public/*': {
                windowMs: 60000,
                max: 200
            }
        },
        
        // Ключ для подсчета
        keyGenerator: (req) => {
            // Приоритет: user ID > API key > IP
            return req.user?.id || req.headers['x-api-key'] || req.ip
        },
        
        // Примечание: store (redis) и колбэк onLimitReached в RateLimitConfig нет —
        // счётчики в памяти процесса, при превышении middleware отвечает 429
        // и публикует событие rateLimit:exceeded
    }
})
```

## 🎯 Типы Rate Limiting
### 1. Глобальный лимит

```typescript
Назначение: Общий лимит для всех запросов.

typescript
const shield = new FABShield({
    rateLimit: {
        global: {
            windowMs: 60000,
            max: 1000
        }
    }
})
```

### 2. Лимит по IP

```typescript
Назначение: Лимит для каждого IP-адреса.

typescript
const shield = new FABShield({
    rateLimit: {
        ip: {
            enabled: true,
            windowMs: 60000,
            max: 100,
            // Исключения для доверенных IP
            whitelist: ['10.0.0.1', '10.0.0.2', '192.168.1.100']
        }
    }
})
```

### 3. Лимит по пользователю

```typescript
Назначение: Лимит для каждого пользователя.

typescript
const shield = new FABShield({
    rateLimit: {
        user: {
            enabled: true,
            windowMs: 60000,
            max: 100,
            // Разные лимиты для разных ролей
            roles: {
                admin: 1000,
                moderator: 500,
                user: 100,
                guest: 50
            }
        }
    }
})
```

### 4. Лимит по пути

```typescript
Назначение: Разные лимиты для разных путей.

typescript
const shield = new FABShield({
    rateLimit: {
        paths: {
            '/api/auth/login': {
                windowMs: 60000,
                max: 5             // 5 попыток входа в минуту
            },
            '/api/auth/register': {
                windowMs: 3600000,
                max: 3             // 3 регистрации в час
            },
            '/api/packages/*': {
                windowMs: 60000,
                max: 100
            },
            '/api/uploads/*': {
                windowMs: 3600000,
                max: 10            // 10 загрузок в час
            }
        }
    }
})
```

### 5. Адаптивный лимит

> ⚠️ Встроенного режима `adaptive` в `rateLimit` пока нет. Адаптивность строится из реальных API: наблюдайте метрики через `getMetrics()` и меняйте лимиты через `updateConfig()` (конфигурация deep-merge'ится).

```typescript
const shield = new FABShield({
  rateLimit: {
    enabled: true,
    default: { max: 100, windowMs: 60000 }
  }
})

// Раз в 30 секунд подстраиваем лимит под нагрузкой
setInterval(() => {
  const { p95ResponseTime } = shield.getMetrics()

  if (p95ResponseTime > 500) {
    shield.updateConfig({ rateLimit: { default: { max: 50, windowMs: 60000 } } })
  } else {
    shield.updateConfig({ rateLimit: { default: { max: 100, windowMs: 60000 } } })
  }
}, 30000)
```

---

### 6. Распределённый Rate Limiting

> ⚠️ Общего счётчика для нескольких инстансов (например, через Redis) в `rateLimit` пока нет: лимиты считаются in-memory **в каждом процессе отдельно**.

При горизонтальном масштабировании:

- задавайте `max` с запасом с учётом числа реплик (≈ суммарный лимит / количество инстансов);
- либо вынесите ограничение частоты на уровень инфраструктуры (nginx `limit_req`, API-шлюз), где общий счётчик уже есть.

---

## 📊 Мониторинг Rate Limiting

### Статистика лимитера

```typescript
const stats = shield.getRateLimiter()?.getStats()

console.log({
  totalKeys: stats?.totalKeys,      // активных ключей в памяти
  defaultLimit: stats?.defaultLimit,
  defaultWindow: stats?.defaultWindow
})
```

### Событие превышения

```typescript
shield.on('rateLimit:exceeded', ({ limit, remaining, retryAfter }) => {
  console.warn(`429: лимит ${limit} исчерпан, remaining=${remaining}, retry=${retryAfter}s`)
})
```

### Счётчик 429

Ответы 429 не попадают в `getMetrics().byStatus` — лимитер отвечает раньше
записи метрик. Считайте превышения по событию:

```typescript
let overflows = 0
shield.on('rateLimit:exceeded', () => {
  overflows++
})
```

### Сброс счётчиков

```typescript
const limiter = shield.getRateLimiter()
limiter?.resetAll()          // все ключи
limiter?.reset('1.2.3.4')    // конкретный ключ
```

### Дашборд

FAB Shield не рендерит дашборды сам — соберите виджеты из `getStats()`,
событий `rateLimit:exceeded` и `getMetrics().byStatus` на своей стороне
(например, Grafana поверх prometheus-экспорта, см. [`Metrics.md`](./Metrics.md)).

---

## 🚨 Обработка превышения

В `RateLimitConfig` нет колбэка `onLimitReached` и настраиваемого тела ответа —
при превышении middleware сам возвращает `429`:

```json
{
    "error": "Too many requests",
    "requestId": "…",
    "retryAfter": 3600,
    "limit": 100,
    "remaining": 0,
    "reset": "2026-07-01T12:00:00.000Z"
}
```

Реакция на превышение — через событие `rateLimit:exceeded` (см. «Событие
превышения» выше): логирование, алерты, собственный счётчик блокировок —
всё на стороне приложения. Сами же лимиты настраиваются `default`,
`roles`/`paths` и `keyGenerator`.

### Ответ при превышении

Активная цепочка FAB Shield не ставит заголовки `X-RateLimit-*` и `Retry-After` —
лимит и время повтора доступны в теле `429` (см. «Обработка превышения»)
и в событии `rateLimit:exceeded`.

## 🔧 Интеграция с AI

Секции `rateLimit.smart` (автоподстройка лимитов поведением) в конфиге нет.
Реальные рычаги «адаптивности»:

- наблюдать нагрузку — `shield.getMetrics()` (`p95ResponseTime`, `threatsBlocked`);
- подстраивать лимиты в рантайме — `shield.updateConfig({ rateLimit: … })`
  (пример в разделе «Адаптивный лимит»);
- учитывать роль/путь — `roles` и `paths`.

## 📋 Примеры конфигураций
### 1. Для высоконагруженного API

```typescript
const shield = new FABShield({
    rateLimit: {
        default: {
            windowMs: 60000,
            max: 1000
        },
        paths: {
            '/api/search': {
                windowMs: 60000,
                max: 100
            }
        }
    }
})
```

### 2. Для авторизации

```typescript
const shield = new FABShield({
    rateLimit: {
        paths: {
            '/api/auth/login': {
                windowMs: 60000,
                max: 5,
            },
            '/api/auth/register': {
                windowMs: 3600000,
                max: 3,
            },
            '/api/auth/reset-password': {
                windowMs: 3600000,
                max: 2,
            }
        }
    }
})
```

### 3. Для загрузки файлов

```typescript
const shield = new FABShield({
    rateLimit: {
        paths: {
            '/api/upload': {
                windowMs: 3600000,
                max: 10,
            }
        }
    }
})
```

## 🚨 Устранение проблем
### Проблема: Слишком много ложных срабатываний

```typescript
// Увеличить лимиты
const shield = new FABShield({
    rateLimit: {
        default: {
            windowMs: 60000,
            max: 500  // Было 100
        }
    }
})
```

### Проблема: Блокировка легитимных пользователей

```typescript
// Добавить в белый список
const shield = new FABShield({
    rateLimit: {
        whitelist: {
            enabled: true,
            ips: ['10.0.0.1', '10.0.0.2'],
            users: ['admin', 'system'],
            apiKeys: ['sk-xxx', 'pk-xxx']
        }
    }
})
```
> ⚠️ Поля `whitelist.*` типизированы, но лимитер их в текущей версии не читает.
> Рабочие обходы: не подключайте `shield.middleware()` к доверенным маршрутам
> или поднимайте лимит через `updateConfig()`.

## 📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	Director@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Rate Limiting — это:

🛡️ Защита от DDoS — ограничение запросов

🔒 Защита от брутфорса — блокировка подбора

⚡ Стабильность — предотвращение перегрузки

🎯 Гибкость — настройка под любые нужды

📊 Прозрачно — событие rateLimit:exceeded и getStats() для мониторинга

Защитите свое приложение от перегрузок! ⚡

© 2026 ООО «Деворбит». Все права защищены.