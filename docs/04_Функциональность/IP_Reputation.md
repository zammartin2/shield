# 🛡️ IP Reputation — Управление репутацией IP-адресов

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**IP Reputation** — это система оценки доверия к IP-адресам. Она помогает блокировать подозрительные IP-адреса до того, как они успеют нанести вред.

---

## 🎯 Что такое IP Reputation

### Основные понятия

**Репутация IP** — это оценка, основанная на:
🔍 История запросов
🛡️ Обнаруженные угрозы
📊 Общее поведение
🔗 Внешние источники

text

**Уровни репутации:**

| Уровень | Цвет | Описание | Действие |
|:---|:---|:---|:---|
| **Trusted** | 🟢 | Проверенный, безопасный | Пропускать |
| **Neutral** | 🟡 | Неизвестный | Мониторить |
| **Suspicious** | 🟠 | Подозрительный | Проверять |
| **Malicious** | 🔴 | Злонамеренный | Блокировать |

---

## 🧠 Как это работает

### Архитектура
┌─────────────────────────────────────────────────────────────────────────────┐
│ IP REPUTATION ENGINE │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ INPUT LAYER │ │
│ │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │ │
│ │ │ Client │ │ Request │ │ History │ │ External │ │ │
│ │ │ IP │ │ Pattern │ │ Data │ │ Sources │ │ │
│ │ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ANALYSIS LAYER │ │
│ │ • История запросов │ │
│ │ • Обнаруженные угрозы │ │
│ │ • Внешние базы │ │
│ │ • Поведенческий анализ │ │
│ │ • Геолокация │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ SCORING LAYER │ │
│ │ • Расчет репутации (0-100) │ │
│ │ • Определение уровня │ │
│ │ • Принятие решения │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ACTION LAYER │ │
│ │ • Блокировка │ │
│ │ • CAPTCHA │ │
│ │ • Rate Limiting │ │
│ │ • Мониторинг │ │
│ │ • Уведомление │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────────────────────┘

text

---

## 🔧 Использование

### Базовая конфигурация

```typescript
const shield = new FABShield({
    ipReputation: {
        enabled: true
    }
})
Расширенная конфигурация
typescript
const shield = new FABShield({
    ipReputation: {
        enabled: true,
        
        // Пороги репутации
        thresholds: {
            trusted: 80,      // 80-100: доверенный
            neutral: 40,      // 40-79: нейтральный
            suspicious: 20,   // 20-39: подозрительный
            malicious: 0      // 0-19: злонамеренный
        },
        
        // Действия по уровням
        actions: {
            trusted: 'allow',
            neutral: 'monitor',
            suspicious: 'challenge',  // CAPTCHA или 2FA
            malicious: 'block'
        },
        
        // Источники данных
        sources: {
            internal: true,           // Локальная история
            external: {
                abuseIPDB: true,
                virustotal: true,
                ipQualityScore: true,
                custom: {
                    url: 'https://api.example.com/ip',
                    apiKey: process.env.IP_API_KEY
                }
            }
        },
        
        // Кэширование
        cache: {
            enabled: true,
            ttl: 3600,                // секунд
            maxSize: 10000
        },
        
        // Автоблокировка
        autoBlock: {
            enabled: true,
            duration: 3600,           // секунд
            threshold: 3              // количество нарушений
        }
    }
})
📊 Оценка репутации
Как рассчитывается репутация
typescript
interface ReputationScore {
    score: number;           // 0-100
    level: 'trusted' | 'neutral' | 'suspicious' | 'malicious';
    factors: {
        history: number;     // 0-30
        threats: number;     // 0-30
        external: number;    // 0-30
        behavior: number;    // 0-10
    };
    details: {
        totalRequests: number;
        threatCount: number;
        lastSeen: Date;
        firstSeen: Date;
        countries: string[];
    };
    recommendations: string[];
}
Пример оценки
typescript
const reputation = await shield.ipReputation.getReputation('192.168.1.100')

console.log(reputation)
// {
//     score: 25,
//     level: 'suspicious',
//     factors: {
//         history: 10,
//         threats: 5,
//         external: 5,
//         behavior: 5
//     },
//     details: {
//         totalRequests: 150,
//         threatCount: 8,
//         lastSeen: 2026-07-01T12:00:00Z,
//         firstSeen: 2026-06-20T08:00:00Z,
//         countries: ['RU', 'DE']
//     },
//     recommendations: [
//         'Заблокировать IP на 24 часа',
//         'Включить CAPTCHA для всех запросов',
//         'Отправить уведомление администратору'
//     ]
// }
🛡️ Внешние источники
AbuseIPDB
typescript
const shield = new FABShield({
    ipReputation: {
        sources: {
            external: {
                abuseIPDB: {
                    enabled: true,
                    apiKey: process.env.ABUSEIPDB_API_KEY,
                    maxAge: 90,        // дней
                    confidenceThreshold: 50
                }
            }
        }
    }
})
VirusTotal
typescript
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
IP Quality Score
typescript
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
📊 Мониторинг IP
Просмотр репутации
typescript
// Получить репутацию IP
const reputation = await shield.ipReputation.getReputation('192.168.1.100')

// Получить список заблокированных IP
const blocked = shield.ipReputation.getBlockedIPs()
console.log(`Заблокировано IP: ${blocked.length}`)

// Получить статистику
const stats = shield.ipReputation.getStats()
console.log({
    totalIPs: stats.totalIPs,
    trusted: stats.trusted,
    neutral: stats.neutral,
    suspicious: stats.suspicious,
    malicious: stats.malicious,
    blocked: stats.blocked
})
Добавление IP в списки
typescript
// Добавить в черный список
shield.ipReputation.addToBlacklist('192.168.1.100', {
    reason: 'Multiple SQL injection attempts',
    duration: 86400,  // 24 часа
    severity: 'high'
})

// Добавить в белый список
shield.ipReputation.addToWhitelist('10.0.0.1', {
    reason: 'Internal monitoring system'
})

// Удалить из списка
shield.ipReputation.removeFromList('192.168.1.100')
🚨 Автоматические действия
Настройка авто-действий
typescript
const shield = new FABShield({
    ipReputation: {
        autoActions: [
            // Блокировка при обнаружении атак
            {
                condition: (ip) => ip.threatCount > 5,
                action: 'block',
                duration: 3600,
                severity: 'high'
            },
            // CAPTCHA для подозрительных IP
            {
                condition: (ip) => ip.level === 'suspicious',
                action: 'challenge',
                type: 'captcha'
            },
            // Усиленный мониторинг для новых IP
            {
                condition: (ip) => ip.firstSeen < Date.now() - 3600,
                action: 'monitor',
                duration: 86400
            }
        ]
    }
})
Кастомные действия
typescript
// Создаем кастомное действие
shield.ipReputation.registerAction({
    name: 'notifyAdmin',
    execute: async (ip, info) => {
        await sendTelegramNotification({
            text: `⚠️ Подозрительный IP: ${ip}\nПричина: ${info.reason}`
        })
    }
})

// Используем в правиле
shield.ipReputation.addRule({
    condition: (ip) => ip.level === 'malicious',
    action: 'notifyAdmin'
})
🌍 Гео-блокировка
Настройка гео-блокировки
typescript
const shield = new FABShield({
    ipReputation: {
        geoBlocking: {
            enabled: true,
            blockedCountries: ['RU', 'BY', 'CN', 'KP'],
            allowedCountries: ['US', 'GB', 'DE', 'FR'],
            mode: 'block',  // 'block' | 'allow' | 'challenge'
            exceptions: {
                // Исключения для admin
                admin: ['RU'],  // Администраторам из RU разрешено
                // Исключения для проверенных пользователей
                trusted: ['*']  // Доверенным пользователям все разрешено
            }
        }
    }
})
📊 Визуализация
Dashboard метрики
typescript
// Получаем данные для дашборда
const dashboard = shield.ipReputation.getDashboardData()

console.log({
    // Карта угроз
    threatMap: dashboard.threatMap,
    
    // Топ-10 атакующих IP
    topAttackers: dashboard.topAttackers,
    
    // Статистика по странам
    countryStats: dashboard.countryStats,
    
    // Тренды
    trends: {
        last24h: dashboard.trends.last24h,
        last7d: dashboard.trends.last7d,
        last30d: dashboard.trends.last30d
    }
})
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
IP Reputation — это:

✅ Интеллектуальная защита — блокировка до атаки

✅ Многоуровневая оценка — внутренние и внешние источники

✅ Автоматические действия — без участия администратора

✅ Гибкая настройка — под любые требования

Защита на уровне IP-адресов! 🛡️

© 2026 ООО «Деворбит». Все права защищены.