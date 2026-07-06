# ⚡ Rate Limiting — Умное ограничение запросов

---

**Версия:** 1.1.0  
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
typescript
const shield = new FABShield({
    rateLimit: {
        enabled: true,
        
        // Глобальные настройки
        default: {
            windowMs: 60000,
            max: 100,
            message: 'Too many requests'
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
        
        // Хранилище
        store: {
            type: 'redis',     // 'memory' | 'redis' | 'database'
            options: {
                host: 'localhost',
                port: 6379,
                password: process.env.REDIS_PASSWORD
            }
        },
        
        // Обработка превышения
        onLimitReached: (req, res, next, { key, limit, windowMs }) => {
            // Логирование
            console.warn(`Rate limit exceeded: ${key}`)
            
            // Уведомление
            sendAlert({
                type: 'rate_limit',
                key,
                limit,
                windowMs,
                ip: req.ip,
                path: req.path
            })
        }
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

```typescript
Назначение: Лимит, который меняется в зависимости от нагрузки.

typescript
const shield = new FABShield({
    rateLimit: {
        adaptive: {
            enabled: true,
            baseLimit: 100,
            maxLimit: 200,
            minLimit: 50,
            
            // Условия изменения
            conditions: [
                {
                    metric: 'cpu_usage',
                    threshold: 70,
                    action: 'decrease_by_50'
                },
                {
                    metric: 'response_time',
                    threshold: 500,
                    action: 'decrease_by_30'
                },
                {
                    metric: 'error_rate',
                    threshold: 5,
                    action: 'increase_by_20'
                }
            ]
        }
    }
})
```

### 6. Распределенный Rate Limiting

```typescript
Назначение: Ограничение запросов в распределенной системе.

typescript
const shield = new FABShield({
    rateLimit: {
        distributed: {
            enabled: true,
            store: 'redis',
            keyPrefix: 'ratelimit:',
            
            // Синхронизация между инстансами
            sync: {
                enabled: true,
                interval: 1000,  // ms
                channel: 'rate-limit-sync'
            }
        }
    }
})
```

## 📊 Мониторинг Rate Limiting
### Метрики

```typescript
typescript
const metrics = shield.rateLimit.getMetrics()

console.log({
    // Статистика
    totalRequests: metrics.totalRequests,
    allowedRequests: metrics.allowedRequests,
    blockedRequests: metrics.blockedRequests,
    
    // По IP
    topBlockedIPs: metrics.topBlockedIPs,
    
    // По пользователям
    topBlockedUsers: metrics.topBlockedUsers,
    
    // По путям
    blockedByPath: metrics.blockedByPath,
    
    // Время
    windowStats: metrics.windowStats
})
```

### Дашборд

```typescript
typescript
// Создаем дашборд для Rate Limiting
const dashboard = shield.rateLimit.createDashboard({
    charts: [
        {
            title: 'Запросы в минуту',
            type: 'area',
            data: metrics.requestsByMinute
        },
        {
            title: 'Топ заблокированных IP',
            type: 'bar',
            data: metrics.topBlockedIPs
        },
        {
            title: 'Текущие лимиты',
            type: 'gauge',
            data: {
                current: metrics.currentRequests,
                limit: metrics.limit
            }
        }
    ]
})
```

## 🚨 Обработка превышения
### Кастомные действия

```typescript
typescript
const shield = new FABShield({
    rateLimit: {
        onLimitReached: async (req, res, info) => {
            // 1. Логирование
            await logRateLimitEvent(info)
            
            // 2. Уведомление
            await sendAlert({
                type: 'rate_limit',
                ip: req.ip,
                path: req.path,
                limit: info.limit,
                window: info.windowMs
            })
            
            // 3. Автоблокировка
            if (info.exceededBy > 3) {
                await blockIP(req.ip, {
                    duration: 3600,
                    reason: 'Rate limit exceeded'
                })
            }
            
            // 4. Ответ
            res.status(429).json({
                error: 'Too many requests',
                retryAfter: Math.ceil(info.windowMs / 1000),
                limit: info.limit,
                remaining: 0,
                reset: new Date(Date.now() + info.windowMs).toISOString()
            })
        }
    }
})
```

### Заголовки ответа

```text
typescript
// Автоматические заголовки (RFC 6585)
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 2026-07-01T12:00:00Z
Retry-After: 3600
```

## 🔧 Интеграция с AI
### Умный Rate Limiting

```typescript
typescript
const shield = new FABShield({
    rateLimit: {
        smart: {
            enabled: true,
            // AI анализирует поведение и корректирует лимиты
            adjustByBehavior: true,
            
            // Автоматическая настройка
            autoAdjust: {
                enabled: true,
                learningPeriod: 604800, // 7 дней
                minLimit: 10,
                maxLimit: 1000,
                adjustmentFactor: 0.1  // 10% за раз
            }
        }
    }
})
```

## 📋 Примеры конфигураций
### 1. Для высоконагруженного API

```typescript
typescript
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
typescript
const shield = new FABShield({
    rateLimit: {
        paths: {
            '/api/auth/login': {
                windowMs: 60000,
                max: 5,
                message: 'Too many login attempts'
            },
            '/api/auth/register': {
                windowMs: 3600000,
                max: 3,
                message: 'Too many registrations'
            },
            '/api/auth/reset-password': {
                windowMs: 3600000,
                max: 2,
                message: 'Too many reset requests'
            }
        }
    }
})
```

### 3. Для загрузки файлов

```typescript
typescript
const shield = new FABShield({
    rateLimit: {
        paths: {
            '/api/upload': {
                windowMs: 3600000,
                max: 10,
                message: 'Upload limit exceeded'
            }
        }
    }
})
```

## 🚨 Устранение проблем
### Проблема: Слишком много ложных срабатываний

```typescript
typescript
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
typescript
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

## 📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Rate Limiting — это:

🛡️ Защита от DDoS — ограничение запросов

🔒 Защита от брутфорса — блокировка подбора

⚡ Стабильность — предотвращение перегрузки

🎯 Гибкость — настройка под любые нужды

🤖 Умный — адаптация под нагрузку

Защитите свое приложение от перегрузок! ⚡

© 2026 ООО «Деворбит». Все права защищены.