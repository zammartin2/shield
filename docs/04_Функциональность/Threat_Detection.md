# 🚨 Threat Detection — Обнаружение угроз

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Threat Detection** — это система обнаружения и классификации угроз в реальном времени. Она использует комбинацию правил, сигнатур и AI для выявления атак до того, как они причинят вред.

---

## 🎯 Что такое Threat Detection

### Ключевые возможности

| Возможность | Описание |
|:---|:---|
| **Обнаружение в реальном времени** | Анализ каждого запроса |
| **Классификация угроз** | Определение типа и критичности |
| **Автоматическая реакция** | Блокировка, уведомления, логирование |
| **Обучение** | Адаптация к новым угрозам |
| **Отчетность** | Детальные отчеты об инцидентах |

---

## 🧠 Типы обнаруживаемых угроз

### 1. XSS (Cross-Site Scripting)

**Описание:** Внедрение вредоносного JavaScript-кода.

**Пример:**
```html
<script>alert('XSS')</script>
Обнаружение:

✅ Анализ параметров запроса

✅ Проверка заголовков

✅ AI-анализ контента

Действие: Блокировка + Уведомление

2. SQL Injection
Описание: Внедрение SQL-кода в запросы.

Пример:

sql
' OR '1'='1' --
Обнаружение:

✅ Паттерн-анализ

✅ Семантический анализ

✅ AI-детекция

Действие: Блокировка + Уведомление

3. CSRF (Cross-Site Request Forgery)
Описание: Выполнение действий от имени пользователя.

Пример:

html
<img src="https://bank.com/transfer?amount=100&to=hacker">
Обнаружение:

✅ Проверка CSRF-токенов

✅ Анализ Referer

✅ Проверка SameSite

Действие: Блокировка + Логирование

4. DDoS (Distributed Denial of Service)
Описание: Перегрузка сервера запросами.

Обнаружение:

✅ Rate Limiting

✅ Поведенческий анализ

✅ AI-детекция

Действие: Rate Limit + Блокировка IP

5. Brute Force
Описание: Подбор паролей.

Обнаружение:

✅ Rate Limiting

✅ Анализ попыток

✅ AI-детекция

Действие: Блокировка + CAPTCHA

6. Path Traversal
Описание: Доступ к файлам вне разрешенной директории.

Пример:

text
../../../../etc/passwd
Обнаружение:

✅ Паттерн-анализ

✅ Валидация пути

Действие: Блокировка + Уведомление

7. Command Injection
Описание: Выполнение команд на сервере.

Пример:

text
; rm -rf /
Обнаружение:

✅ Паттерн-анализ

✅ Семантический анализ

Действие: Блокировка + Уведомление

🔧 Использование
Базовая конфигурация
typescript
const shield = new FABShield({
    threatDetection: {
        enabled: true
    }
})
Расширенная конфигурация
typescript
const shield = new FABShield({
    threatDetection: {
        enabled: true,
        
        // Включенные детекторы
        detectors: {
            xss: true,
            sqlInjection: true,
            csrf: true,
            ddos: true,
            bruteForce: true,
            pathTraversal: true,
            commandInjection: true,
            fileInclusion: true,
            rce: true,  // Remote Code Execution
            ssrf: true,  // Server-Side Request Forgery
            xxe: true,   // XML External Entity
            ldap: true,  // LDAP Injection
            noSQL: true, // NoSQL Injection
            custom: true // Кастомные правила
        },
        
        // Пороги чувствительности
        thresholds: {
            low: 0.3,      // Низкая уверенность
            medium: 0.6,   // Средняя уверенность
            high: 0.8,     // Высокая уверенность
            critical: 0.95 // Критическая уверенность
        },
        
        // Действия по уровням
        actions: {
            low: 'log',
            medium: 'log',
            high: 'block',
            critical: 'block_immediate'
        },
        
        // Кастомные правила
        rules: [
            {
                name: 'custom-sql-injection',
                pattern: /SELECT.*FROM.*WHERE.*=.*;.*/i,
                severity: 'high',
                action: 'block'
            },
            {
                name: 'custom-xss',
                pattern: /<script>.*<\/script>/i,
                severity: 'medium',
                action: 'block'
            }
        ],
        
        // Исключения
        exceptions: [
            {
                path: '/api/health',
                reason: 'Health check endpoint'
            },
            {
                ip: '10.0.0.1',
                reason: 'Internal monitoring'
            }
        ]
    }
})
📊 Результаты обнаружения
Структура результата
typescript
interface ThreatDetectionResult {
    // Основная информация
    id: string;
    timestamp: Date;
    type: ThreatType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;  // 0-1
    
    // Детали запроса
    request: {
        method: string;
        path: string;
        ip: string;
        userAgent: string;
        headers: Record<string, string>;
        body: any;
        query: any;
    };
    
    // Доказательства
    evidence: {
        pattern: string;
        matched: string;
        location: string;
        context: string;
    };
    
    // Действие
    action: 'allow' | 'block' | 'challenge' | 'log' | 'warn';
    actionTaken: boolean;
    
    // Рекомендации
    recommendations: string[];
}
🚨 Реагирование на угрозы
Автоматическая блокировка
typescript
const shield = new FABShield({
    threatDetection: {
        autoBlock: {
            enabled: true,
            
            // Временная блокировка
            temporary: {
                enabled: true,
                duration: 3600,  // 1 час
                threshold: 3      // после 3-х атак
            },
            
            // Постоянная блокировка
            permanent: {
                enabled: false,
                threshold: 10    // после 10-ти атак
            },
            
            // IP-блокировка
            ipBlock: {
                enabled: true,
                duration: 86400, // 24 часа
                threshold: 5
            },
            
            // User-Agent блокировка
            userAgentBlock: {
                enabled: true,
                threshold: 3
            }
        }
    }
})
Кастомная обработка
typescript
// Обработчик угроз
shield.threatDetection.on('threat:detected', async (threat) => {
    // 1. Логирование
    await logThreat(threat)
    
    // 2. Уведомление
    await sendAlert({
        type: 'threat',
        severity: threat.severity,
        details: threat
    })
    
    // 3. Дополнительные действия
    if (threat.severity === 'critical') {
        // Заблокировать IP
        await blockIP(threat.request.ip)
        
        // Оповестить администратора
        await notifyAdmin(threat)
        
        // Сохранить в базу угроз
        await saveToThreatDatabase(threat)
    }
})
📊 Мониторинг угроз
Метрики
typescript
const metrics = shield.threatDetection.getMetrics()

console.log({
    // Статистика
    totalDetected: metrics.totalDetected,
    blocked: metrics.blocked,
    falsePositives: metrics.falsePositives,
    falseNegatives: metrics.falseNegatives,
    
    // По типам
    byType: metrics.byType,
    bySeverity: metrics.bySeverity,
    
    // Тренды
    trends: {
        last24h: metrics.last24h,
        last7d: metrics.last7d,
        last30d: metrics.last30d
    },
    
    // Источники
    topAttackers: metrics.topAttackers,
    topPaths: metrics.topPaths
})
Дашборд угроз
typescript
// Создание дашборда
const dashboard = shield.threatDetection.createDashboard({
    charts: [
        {
            title: 'Угрозы по дням',
            type: 'line',
            data: metrics.trends
        },
        {
            title: 'Типы угроз',
            type: 'pie',
            data: metrics.byType
        },
        {
            title: 'Топ атакующих',
            type: 'bar',
            data: metrics.topAttackers
        },
        {
            title: 'Уровни угроз',
            type: 'gauge',
            data: {
                critical: metrics.bySeverity.critical,
                high: metrics.bySeverity.high,
                medium: metrics.bySeverity.medium,
                low: metrics.bySeverity.low
            }
        }
    ],
    refreshInterval: 5000  // обновление каждые 5 секунд
})
🛡️ Кастомные правила
Создание правил
typescript
// Правило для обнаружения SQL инъекций
shield.threatDetection.addRule({
    name: 'sql-injection-detector',
    description: 'Обнаружение SQL инъекций',
    
    // Паттерн для поиска
    pattern: /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION).*(FROM|INTO|TABLE|DATABASE).*/i,
    
    // Где искать
    locations: ['body', 'query', 'params'],
    
    // Дополнительные проверки
    conditions: [
        {
            field: 'content-type',
            operator: 'contains',
            value: 'application/json'
        }
    ],
    
    // Действие
    action: 'block',
    severity: 'high',
    
    // Исключения
    exceptions: [
        {
            path: '/api/search',
            reason: 'Поисковый запрос может содержать SQL-подобные паттерны'
        }
    ]
})
AI-правила
typescript
// AI-правило для обнаружения аномалий
shield.threatDetection.addAIModel({
    name: 'anomaly-detector',
    type: 'unsupervised',
    
    // Обучение на данных
    training: {
        data: historicalRequests,
        epochs: 100,
        batchSize: 32
    },
    
    // Порог обнаружения
    threshold: 0.85,
    
    // Действие
    action: 'warn',
    severity: 'medium'
})
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Threat Detection — это:

🚨 Обнаружение в реальном времени — мгновенная реакция

🎯 Классификация угроз — понимание типа атаки

🛡️ Автоматическая защита — блокировка без задержки

📊 Полный мониторинг — видимость всех угроз

🤖 AI-интеграция — обнаружение новых угроз

Обнаруживайте угрозы до того, как они нанесут вред! 🚨

© 2026 ООО «Деворбит». Все права защищены.