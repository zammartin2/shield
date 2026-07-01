# 🔒 Security Headers — Защита через HTTP-заголовки

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**Security Headers** — это основа защиты веб-приложений. HTTP-заголовки — это первый барьер, который встречает злоумышленник. FAB Shield устанавливает **25+** security-заголовков, покрывающих все основные векторы атак.

---

## 🛡️ Полный список заголовков

### 1. Content Security Policy (CSP)

**Назначение:** Защита от XSS, инъекций и других атак.

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'
Защищает от:

🛡️ XSS (Cross-Site Scripting)

🛡️ Data Injection

🛡️ Clickjacking

🛡️ Mixed Content

🛡️ Protocol Downgrade

2. Strict-Transport-Security (HSTS)
Назначение: Принудительное использование HTTPS.

http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Защищает от:

🛡️ MITM (Man-In-The-Middle)

🛡️ Protocol Downgrade

🛡️ SSL Stripping

3. X-Frame-Options
Назначение: Защита от Clickjacking.

http
X-Frame-Options: SAMEORIGIN
Варианты:

DENY — запрет во фреймах

SAMEORIGIN — только на том же сайте

ALLOW-FROM uri — разрешено только с указанного URI

Защищает от:

🛡️ Clickjacking

🛡️ UI Redressing

4. X-Content-Type-Options
Назначение: Предотвращение MIME-sniffing.

http
X-Content-Type-Options: nosniff
Защищает от:

🛡️ MIME Sniffing

🛡️ XSS через загрузку файлов

5. Referrer-Policy
Назначение: Контроль передачи реферера.

http
Referrer-Policy: strict-origin-when-cross-origin
Варианты:

no-referrer

no-referrer-when-downgrade

same-origin

origin

strict-origin

origin-when-cross-origin

strict-origin-when-cross-origin

unsafe-url

Защищает от:

🛡️ Утечки данных через реферер

🛡️ CSRF

🛡️ Утечки URL параметров

6. X-XSS-Protection
Назначение: Защита от XSS (устаревший, но полезный).

http
X-XSS-Protection: 0
Варианты:

0 — отключена (рекомендуется)

1 — включена

1; mode=block — включена с блокировкой

7. X-DNS-Prefetch-Control
Назначение: Контроль DNS-префетчинга.

http
X-DNS-Prefetch-Control: off
Защищает от:

🛡️ Утечки DNS

🛡️ Трекинга

8. X-Download-Options
Назначение: Защита от скачивания в IE.

http
X-Download-Options: noopen
Защищает от:

🛡️ Автоматического открытия файлов

9. X-Permitted-Cross-Domain-Policies
Назначение: Контроль доступа к данным в Flash/PDF.

http
X-Permitted-Cross-Domain-Policies: none
Варианты:

none — запрет доступа

master-only — только мастер-политика

by-content-type — по типу контента

all — разрешить все

10. Cross-Origin-Embedder-Policy (COEP)
Назначение: Защита от Spectre/Meltdown.

http
Cross-Origin-Embedder-Policy: require-corp
Варианты:

require-corp — требует CORP

credentialless

unsafe-none

Защищает от:

🛡️ Spectre атак

🛡️ Cross-origin утечек

11. Cross-Origin-Opener-Policy (COOP)
Назначение: Изоляция вкладок.

http
Cross-Origin-Opener-Policy: same-origin
Варианты:

same-origin

same-origin-allow-popups

unsafe-none

Защищает от:

🛡️ Cross-origin атак

🛡️ Утечек между вкладками

12. Cross-Origin-Resource-Policy (CORP)
Назначение: Контроль доступа к ресурсам.

http
Cross-Origin-Resource-Policy: same-origin
Варианты:

same-origin

same-site

cross-origin

Защищает от:

🛡️ Cross-origin доступа к ресурсам

13. Origin-Agent-Cluster
Назначение: Изоляция вкладок.

http
Origin-Agent-Cluster: ?1
Защищает от:

🛡️ Cross-origin атак

🛡️ Утечек данных

🔧 Использование
Базовая конфигурация
typescript
const shield = new FABShield({
    headers: {
        enabled: true
    }
})
Расширенная конфигурация
typescript
const shield = new FABShield({
    headers: {
        enabled: true,
        
        // Настройка конкретных заголовков
        config: {
            // CSP
            csp: {
                enabled: true,
                directives: {
                    'default-src': ["'self'"],
                    'script-src': ["'self'", "'unsafe-inline'"],
                    'style-src': ["'self'", "'unsafe-inline'"],
                    'img-src': ["'self'", "data:", "https:"]
                }
            },
            
            // HSTS
            hsts: {
                enabled: true,
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            },
            
            // X-Frame-Options
            xFrame: {
                enabled: true,
                action: 'SAMEORIGIN'
            },
            
            // Referrer-Policy
            referrerPolicy: {
                enabled: true,
                policy: 'strict-origin-when-cross-origin'
            },
            
            // Cross-Origin
            crossOrigin: {
                embedder: 'require-corp',
                opener: 'same-origin',
                resource: 'same-origin'
            }
        },
        
        // Отключение некоторых заголовков
        disabled: [
            'X-Powered-By',
            'X-XSS-Protection'
        ],
        
        // Кастомные заголовки
        custom: {
            'X-Custom-Header': 'custom-value',
            'X-Security-Level': 'high'
        }
    }
})
📊 Мониторинг заголовков
Проверка заголовков
typescript
// Проверка текущих заголовков
const headers = shield.headers.getCurrent()
console.log('Active Headers:', headers)

// Проверка безопасности
const securityScore = shield.headers.getSecurityScore()
console.log(`Security Score: ${securityScore}%`)

// Анализ заголовков
const analysis = shield.headers.analyze()
console.log({
    secure: analysis.secure,
    missing: analysis.missing,
    insecure: analysis.insecure,
    recommendations: analysis.recommendations
})
Тестирование заголовков
bash
# Проверка через curl
curl -I https://your-app.com

# Использование securityheaders.com
# или OWASP ZAP
🎯 Рекомендации по настройке
Для разных типов приложений
1. SPA (React/Vue/Angular)
typescript
const shield = new FABShield({
    headers: {
        config: {
            csp: {
                directives: {
                    'default-src': ["'self'"],
                    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    'style-src': ["'self'", "'unsafe-inline'"],
                    'img-src': ["'self'", "data:", "https:"],
                    'connect-src': ["'self'", "https://api.example.com"]
                }
            }
        }
    }
})
2. API (REST/GraphQL)
typescript
const shield = new FABShield({
    headers: {
        config: {
            csp: {
                directives: {
                    'default-src': ["'none'"],
                    'script-src': ["'none'"],
                    'style-src': ["'none'"],
                    'img-src': ["'none'"]
                }
            }
        }
    }
})
3. Админ-панель
typescript
const shield = new FABShield({
    headers: {
        config: {
            csp: {
                directives: {
                    'default-src': ["'self'"],
                    'script-src': ["'self'", "'strict-dynamic'"],
                    'style-src': ["'self'"],
                    'img-src': ["'self'", "data:"]
                }
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        }
    }
})
🛡️ Проверка безопасности
Инструменты проверки
bash
# 1. Mozilla Observatory
https://observatory.mozilla.org/

# 2. SecurityHeaders.com
https://securityheaders.com/

# 3. OWASP ZAP
zap.sh

# 4. Chrome DevTools
# Network → Headers → Response Headers
Чек-лист
✅ CSP установлен

✅ HSTS включен

✅ X-Frame-Options: SAMEORIGIN

✅ X-Content-Type-Options: nosniff

✅ Referrer-Policy установлен

✅ X-XSS-Protection: 0

✅ X-DNS-Prefetch-Control: off

✅ X-Download-Options: noopen

✅ X-Powered-By удален

✅ COEP/COOP/CORP установлены

🚨 Устранение проблем
Проблема: CSP блокирует легитимные ресурсы
typescript
// Добавить ресурс в CSP
shield.headers.updateCSP({
    'script-src': ['https://cdn.jsdelivr.net'],
    'img-src': ['https://images.example.com']
})
Проблема: HSTS не работает
typescript
// Проверить HSTS
shield.headers.checkHSTS()
// Получить отчет
const report = shield.headers.getHSTSReport()
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
🏆 Итог
Security Headers — это:

🛡️ Первая линия защиты — барьер перед злоумышленниками

🔒 25+ заголовков — полное покрытие

🎯 Гибкая настройка — под любые требования

📊 Мониторинг — отслеживание состояния

⚡ Простота использования — одна строка кода

Защита начинается с заголовков! 🔒

© 2026 ООО «Деворбит». Все права защищены.