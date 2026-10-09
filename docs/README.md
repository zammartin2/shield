# 🛡️ FAB Shield

Security-фреймворк для Node.js-приложений.

**[Документация](https://github.com/zammartin2/shield/tree/main/docs) | [Примеры](https://github.com/zammartin2/shield/tree/main/examples) | [Живое демо](https://shield.devorbit.ru/) | [Сообщество](https://t.me/fab_shield)**

FAB Shield объединяет security-заголовки, обнаружение угроз, rate limiting, динамический CSP, систему плагинов и мониторинг. Фреймворк поддерживает Express, Fastify и Koa.

[![npm version](https://img.shields.io/npm/v/@fab-orbita/shield.svg)](https://www.npmjs.com/package/@fab-orbita/shield)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/tests-1405%20passed-brightgreen?logo=jest)](https://github.com/zammartin2/shield)
[![Coverage](https://img.shields.io/badge/coverage-99.55%25-brightgreen)](https://github.com/zammartin2/shield)
[![Security](https://img.shields.io/badge/security-audited-brightgreen?logo=security)](../SECURITY.md)
[![Downloads](https://img.shields.io/npm/dm/@fab-orbita/shield.svg)](https://www.npmjs.com/package/@fab-orbita/shield)

---

## 📋 Содержание

- [🚀 Быстрый старт](#-быстрый-старт)
- [✨ Возможности](#-возможности)
- [📊 Сравнение с аналогами](#-сравнение-с-аналогами)
- [📖 Документация](#-документация)
- [📊 Статус проекта](#-статус-проекта)
- [🔒 Безопасность](#-безопасность)
- [🔌 Плагины](#-плагины)
- [🤝 Сообщество](#-сообщество)
- [📄 Лицензия](#-лицензия)
- [☕ Поддержать проект](#-поддержать-проект)
- [📞 Контакты](#-контакты)

---

## 🚀 Быстрый старт

### Установка

```bash
npm install @fab-orbita/shield
```

### Базовое использование

```typescript
import express from 'express'
import { FABShield } from '@fab-orbita/shield'

const app = express()
const shield = new FABShield()

app.use(shield.middleware())

app.get('/', (req, res) => {
  res.json({ message: 'Hello from FAB Shield!' })
})

app.listen(3000)
```

### AI-защита

AI-функции включаются через конфигурацию `FABShield`:

```typescript
const shield = new FABShield({
  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true
  }
})
```

---

## ✨ Возможности

| Возможность | Описание |
|---|---|
| 25+ Security-заголовков | CSP, HSTS, X-Frame-Options и другие заголовки |
| AI-защита | Обнаружение XSS, SQL-инъекций и аномалий |
| Система плагинов | Расширение функциональности без изменения ядра |
| Метрики и мониторинг | Сбор метрик и экспорт в Prometheus, JSON и CSV |
| Rate Limiting | Ограничение частоты запросов для защиты от DDoS и брутфорса |
| Динамический CSP | Формирование CSP с поддержкой nonce |
| Отчеты | Генерация отчетов о безопасности |
| Поддержка фреймворков | Express, Fastify и Koa |
| Документация | 64 файла документации на русском языке |

---

## 📊 Сравнение с аналогами

В таблице приведены возможности решений в рамках заявленных функций FAB Shield.

| Функция | Helmet | FAB Shield | Платный WAF |
|---|---:|---:|---:|
| Security-заголовки | 15 | 25+ | 20+ |
| AI-защита | ❌ | ✅ | ❌ |
| Динамический CSP | ❌ | ✅ | ❌ |
| Система плагинов | ❌ | ✅ | ❌ |
| Метрики | ❌ | ✅ | ✅ |
| Rate Limiting | ❌ | ✅ | ✅ |
| Безопасность проверена | ❌ | ✅ | ✅ |
| 0 известных CVE | ❌ | ✅ | ❌ |
| Цена | Бесплатно | Бесплатно | $500+/мес |
| Open Source | ✅ | ✅ | ❌ |

---

## 📖 Документация

Документация FAB Shield разбита по тематическим разделам.

### Введение

- Что такое FAB Shield
- Преимущества
- Сравнение с аналогами
- Кому нужен FAB Shield

### Установка и настройка

- Установка
- Быстрый старт
- Настройка
- Примеры использования

### Архитектура

- Общая архитектура
- Модули
- Потоки данных
- Планируемые функции

### Функциональность

- Security Headers
- Dynamic CSP
- AI Detection
- Rate Limiting
- Threat Detection
- IP Reputation
- Metrics
- Reporting
- Plugin System

### Справочник API

- Справочник API
- Middleware API
- Metrics API
- Plugins API
- TypeScript Types

### Примеры

- Базовый пример
- Express
- Fastify
- Koa
- Docker
- Продвинутый пример

### Разработка

- Сборка проекта
- Тестирование
- CI/CD
- Релизный процесс
- Вклад в проект

### Безопасность

- Модель угроз
- Рекомендации
- FAQ по безопасности
- Баг-баунти программа
- Аудит безопасности

### Сообщество

- Сообщество
- Партнеры
- Мероприятия
- Благодарности

### Дорожная карта

- Roadmap 2026
- Roadmap 2027
- Идеи для развития

### Технические детали

- Внутреннее устройство
- Зависимости
- Производительность
- Совместимость

---

## 📊 Статус проекта

| Метрика | Значение |
|---|---:|
| Актуальная версия | `1.4.1` |
| Тесты | `1405 / 1405` пройдено |
| Test Suites | `35 / 35` пройдено |
| Code coverage | `99.55%` |
| Известные CVE | `0` |
| Node.js | `18+` |

По результатам указанного в проекте аудита безопасности уязвимости не обнаружены.

---

## 🔒 Безопасность

| Проверка | Результат |
|---|---:|
| `npm audit` | `0` уязвимостей |
| `eval()` / `new Function()` | Не обнаружено |
| Внешние сетевые вызовы | Отсутствуют (0 runtime-зависимостей) |
| Postinstall-скрипты | Отсутствуют |

### Ложные срабатывания статических анализаторов

В версии `1.3.6` были устранены причины ложных срабатываний статических анализаторов, включая Socket.dev.

Зафиксированные случаи:

- сообщения о CVE относились только к dev-пакетам;
- `eval()` в коде не используется;
- обнаруженные сетевые вызовы являются легитимными и опциональными.

Указанные предупреждения были проверены и классифицированы как ложные срабатывания.

---

## 🔌 Плагины

FAB Shield поддерживает плагины, которые позволяют добавлять функциональность без изменения ядра.

Начиная с версии `1.3.6`, плагины прошли проверку безопасности. По результатам проверки обнаружено `0` уязвимостей.

### Официальные плагины

| Плагин | Описание |
|---|---|
| WAF Integration | Интеграция с Cloudflare и AWS WAF |
| Geo Blocking | Блокировка по геолокации |
| Slack Notifications | Уведомления в Slack |
| Email Reports | Отчеты по email |
| Audit Logger | Детальное логирование |

### Создание своего плагина

```typescript
const myPlugin = {
  name: 'my-security',
  version: '1.0.0',
  middleware: (req, res, next) => {
    // Ваша логика
    next()
  }
}

const shield = new FABShield({
  plugins: [myPlugin]
})
```

---

## 🤝 Сообщество

Вопросы, сообщения об ошибках и предложения по развитию проекта можно отправлять через GitHub, Telegram или email.

| Платформа | Ссылка | Назначение |
|---|---|---|
| GitHub | [zammartin2/shield](https://github.com/zammartin2/shield) | Код, Issues, Pull Requests |
| Telegram | [@fab_shield](https://t.me/fab_shield) | Обсуждения и помощь |
| Email | [Director@devorbit.ru](mailto:Director@devorbit.ru) | Официальные контакты |

### Участие в разработке

Проект принимает сообщения об ошибках, изменения документации и код. Также FAB Shield можно поддержать распространением информации о проекте.

---

## 📄 Лицензия

FAB Shield распространяется под лицензией MIT.

```text
MIT License

Copyright (c) 2026 ООО «Деворбит» (DEVORBIT LLC)
```

Полный текст лицензии находится в файле [`LICENSE`](../LICENSE).

---

## ☕ Поддержать проект

Поддержать разработку FAB Shield можно через Boosty:

[![Support on Boosty](https://img.shields.io/badge/Support-Boosty-orange)](https://boosty.to/devorbit.ru)

Также проект можно поддержать звездой в репозитории.

---

## 📞 Контакты

| Поле | Значение |
|---|---|
| Автор | Фабрициус Владимир Николаевич |
| LinkedIn | [vladimir-fabrisius](https://ru.linkedin.com/in/vladimir-fabrisius-3019b041a) |
| Компания | ООО «Деворбит» (DEVORBIT LLC) |
| Email | [Director@devorbit.ru](mailto:Director@devorbit.ru) |
| Реестр | [fab.devorbit.ru](https://fab.devorbit.ru) |
| Живое демо | [shield.devorbit.ru](https://shield.devorbit.ru/) |
| Сайт | [devorbit.ru](https://devorbit.ru) |
| Boosty | [boosty.to/devorbit.ru](https://boosty.to/devorbit.ru) |

---

[![Version](https://img.shields.io/badge/version-1.4.1-blue)](https://github.com/zammartin2/shield/releases)

FAB Shield `v1.4.1` включает 25+ security-заголовков, AI-обнаружение XSS, SQL-инъекций и аномалий, систему плагинов, метрики, мониторинг и поддержку Express, Fastify и Koa.

Проект распространяется под MIT, содержит 1405 тестов с заявленным покрытием кода `99.55%` и сопровождается документацией на русском языке.