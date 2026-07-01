# 🛡️ Dynamic CSP — Динамическая защита от XSS-атак

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Dynamic CSP (Content Security Policy)** — это мощный инструмент FAB Shield, который выводит защиту от XSS-атак на новый уровень. В отличие от статического CSP, динамический CSP адаптируется под каждый конкретный запрос.

---

## 🎯 Что такое Dynamic CSP

### Статический CSP (Helmet и другие)

```typescript
// Одинаковый для всех запросов
{
    "default-src": ["'self'"],
    "script-src": ["'self'"],
    "style-src": ["'self'", "'unsafe-inline'"]
}
Проблемы:

❌ Всегда одинаковый — не адаптируется под ситуацию

❌ Не учитывает контекст запроса

❌ Либо слишком строгий, либо слишком слабый

Динамический CSP (FAB Shield)
typescript
// Адаптируется под каждый запрос
{
    "default-src": ["'self'"],
    "script-src": [
        "'self'",
        (req) => `'nonce-${generateNonce()}'`,  // Разный nonce для каждого запроса
        ...trustedCDNs,                         // Только проверенные CDN
        (req) => req.user.role === 'admin' ? "'unsafe-inline'" : null
    ],
    "style-src": [
        "'self'",
        (req) => req.session?.hasCustomCSS ? "'unsafe-inline'" : null
    ]
}
Преимущества:

✅ Адаптируется под пользователя

✅ Учитывает контекст запроса

✅ Динамические nonce для каждого запроса

✅ Проверка ролей и прав

🧠 Как работает Dynamic CSP
Архитектура
text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DYNAMIC CSP ENGINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     INPUT LAYER                                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │   │
│  │  │  Request   │  │   User     │  │  Session   │  │  Context   │   │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     CONTEXT ANALYZER                                │   │
│  │  • Анализ запроса                                                  │   │
│  │  • Определение пользователя                                        │   │
│  │  • Проверка прав                                                   │   │
│  │  • Оценка риска                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     POLICY GENERATOR                               │   │
│  │  • Генерация nonce                                                 │   │
│  │  • Выбор директив                                                  │   │
│  │  • Применение правил                                               │   │
│  │  • Адаптация к запросу                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     OUTPUT LAYER                                    │   │
│  │  • Установка CSP-заголовка                                          │   │
│  │  • Сохранение nonce                                                │   │
│  │  • Логирование                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
🔧 Использование
Базовая конфигурация
typescript
const shield = new FABShield({
    csp: {
        enabled: true,
        dynamic: true
    }
})

app.use(shield.middleware())
Расширенная конфигурация
typescript
const shield = new FABShield({
    csp: {
        enabled: true,
        dynamic: true,
        
        // Режим отчетности (не блокирует, только логи)
        reportOnly: false,
        
        // Динамические директивы
        directives: {
            'default-src': ["'self'"],
            
            'script-src': [
                "'self'",
                // Динамический nonce
                (req, res) => `'nonce-${res.locals.nonce}'`,
                // Только проверенные CDN
                (req) => req.cspTrustedCDNs || [],
                // Администраторам можно unsafe-inline
                (req) => req.user?.role === 'admin' ? "'unsafe-inline'" : null
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
                (req) => req.user?.role === 'admin' ? "'self'" : "'none'"
            ]
        },
        
        // Отчеты о нарушениях
        reporting: {
            enabled: true,
            uri: '/api/csp-report',
            reportTo: 'csp-endpoint'
        }
    }
})
🎨 Примеры динамических правил
1. Защита админ-панели
typescript
// Строгий CSP для админки
const shield = new FABShield({
    csp: {
        dynamic: true,
        directives: {
            'script-src': [
                "'self'",
                (req) => {
                    if (req.path.startsWith('/admin')) {
                        return "'strict-dynamic'"  // Более строгий для админки
                    }
                    return "'unsafe-inline'"
                }
            ]
        }
    }
})
2. Trusted CDN только для определенных путей
typescript
const shield = new FABShield({
    csp: {
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
3. Динамический nonce
typescript
const shield = new FABShield({
    csp: {
        dynamic: true,
        nonce: {
            enabled: true,
            length: 32,               // Длина nonce
            algorithm: 'sha256',      // Алгоритм хеширования
            cacheEnabled: true,
            cacheTTL: 3600
        }
    }
})

// Nonce доступен в res.locals.nonce
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
        </html>
    `)
})
📊 Мониторинг CSP
Метрики CSP
typescript
const metrics = shield.csp.getMetrics()

console.log({
    // Статистика
    totalPolicies: metrics.totalPolicies,
    violations: metrics.violations,
    reports: metrics.reports,
    
    // Nonce
    noncesGenerated: metrics.noncesGenerated,
    noncesUsed: metrics.noncesUsed,
    nonceReuse: metrics.nonceReuse,  // 🔥 Отслеживаем повторное использование
    
    // Директивы
    activeDirectives: metrics.activeDirectives,
    mostUsedDirectives: metrics.mostUsedDirectives,
    blockedResources: metrics.blockedResources
})
Отчеты о нарушениях
typescript
// Эндпоинт для получения отчетов
app.post('/api/csp-report', (req, res) => {
    const report = req.body
    
    console.log('CSP Violation:', {
        documentURI: report['document-uri'],
        violatedDirective: report['violated-directive'],
        blockedURI: report['blocked-uri'],
        effectiveDirective: report['effective-directive']
    })
    
    // Сохраняем отчет
    shield.csp.saveReport(report)
    
    // Отправляем уведомление при серьезных нарушениях
    if (report['violated-directive'] === 'script-src') {
        sendAlert('CSP Script Violation', report)
    }
    
    res.status(204).end()
})
🛡️ Продвинутые техники
1. Trusted Types
typescript
// Включаем Trusted Types для защиты от DOM XSS
const shield = new FABShield({
    csp: {
        dynamic: true,
        directives: {
            'require-trusted-types-for': ["'script'"],
            'trusted-types': ["'default'", "'allow-duplicates'"]
        }
    }
})
2. Report-Only режим
typescript
// Тестируем политику без блокировки
const shield = new FABShield({
    csp: {
        dynamic: true,
        reportOnly: true,
        reporting: {
            enabled: true,
            uri: '/api/csp-report'
        }
    }
})
3. Интеграция с SRI (Subresource Integrity)
typescript
// Добавляем SRI для внешних ресурсов
const shield = new FABShield({
    csp: {
        dynamic: true,
        directives: {
            'script-src': [
                "'self'",
                (req) => req.trustedScripts.map(s => {
                    return `'sha256-${s.integrity}'`
                })
            ]
        }
    }
})
🚨 Устранение проблем
Проблема: CSP блокирует легитимный скрипт
typescript
// Проверяем отчеты
const reports = shield.csp.getReports()
const blockedScript = reports.find(r => 
    r['violated-directive'] === 'script-src'
)

// Добавляем исключение
shield.csp.addException({
    directive: 'script-src',
    value: `'sha256-${calculateHash(blockedScript)}'`,
    reason: 'Legitimate script'
})
Проблема: Nonce не генерируется
typescript
// Проверяем настройки
const config = shield.csp.getConfig()
console.log({
    nonceEnabled: config.nonceEnabled,
    nonceLength: config.nonceLength
})

// Принудительная генерация
const nonce = shield.csp.generateNonce()
res.locals.nonce = nonce
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Dynamic CSP — это:

✅ Адаптивная защита — подстраивается под каждый запрос

✅ Безопасный nonce — уникальный для каждого запроса

✅ Гибкие правила — зависят от роли и контекста

✅ Полный мониторинг — отчеты и метрики

Защита от XSS на новом уровне! 🛡️

© 2026 ООО «Деворбит». Все права защищены.