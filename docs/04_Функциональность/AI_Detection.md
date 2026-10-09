# 🤖 AI Detection — Интеллектуальное обнаружение угроз

> Подробное описание модуля **AI Detection** в **FAB Shield**  
> Для анализа аномалий, подозрительных запросов и адаптивной защиты Node.js-приложений.

---

**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**AI Detection** — это модуль интеллектуальной защиты FAB Shield.

Он помогает анализировать входящие запросы, искать подозрительные паттерны, обнаруживать аномалии и предлагать действия:

- `allow` — разрешить;
- `log` — записать событие;
- `warn` — предупредить;
- `challenge` — запросить дополнительную проверку;
- `block` — заблокировать.

AI Detection не заменяет классические security-механизмы, а усиливает их: headers, CSP, rate limiting, правила, логирование и мониторинг.

---

## 🧠 Как это работает

## Архитектура AI Detection

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI DETECTION ENGINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                             INPUT LAYER                             │    │
│  │                                                                     │    │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │    │
│  │   │  Headers   │  │    Body    │  │     IP     │  │ User-Agent │   │    │
│  │   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │    │
│  │                                                                     │    │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │    │
│  │   │   Query    │  │  Cookies   │  │  Session   │  │   Route    │   │    │
│  │   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        FEATURE EXTRACTION                           │    │
│  │                                                                     │    │
│  │  • Нормализация данных                                              │    │
│  │  • Векторизация признаков                                           │    │
│  │  • Очистка и преобразование                                         │    │
│  │  • Выделение suspicious patterns                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                              AI MODELS                              │    │
│  │                                                                     │    │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │    │
│  │   │  Anomaly   │  │   Threat   │  │    User    │  │  Content   │   │    │
│  │   │  Detector  │  │ Predictor  │  │ Behavior   │  │ Analyzer   │   │    │
│  │   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           DECISION LAYER                            │    │
│  │                                                                     │    │
│  │  • Оценка угрозы: 0–1                                               │    │
│  │  • Классификация угрозы                                             │    │
│  │  • Confidence score                                                 │    │
│  │  • Рекомендованное действие                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                            ACTION LAYER                             │    │
│  │                                                                     │    │
│  │  • Allow                                                            │    │
│  │  • Log                                                              │    │
│  │  • Warn                                                             │    │
│  │  • Challenge                                                        │    │
│  │  • Block                                                            │    │
│  │  • Adapt                                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Модели AI

## 1. Anomaly Detector

**Назначение:** поиск отклонений от нормального поведения.

### Что анализирует

- паттерны запросов;
- временные интервалы;
- последовательности действий;
- объем данных;
- частоту запросов;
- необычные маршруты;
- нестандартные payload.

---

### Пример аномалии

```typescript
// Нормальный запрос
const normalRequest = {
  method: 'GET',
  path: '/api/users',
  intervalMs: 2000,
  dataSizeBytes: 1024
}

// Аномальный запрос
const anomalousRequest = {
  method: 'GET',
  path: '/api/users',
  intervalMs: 10,
  dataSizeBytes: 1_000_000
}
```

---

## 2. Threat Predictor

**Назначение:** оценка вероятности угрозы на основе текущих признаков и истории событий.

### Использует

- исторические данные;
- текущие паттерны;
- поведенческие признаки;
- route-level активность;
- внешние источники при наличии интеграций;
- результаты других модулей FAB Shield.

---

### Пример интерфейса

```typescript
type ThreatType =
  | 'xss'
  | 'sql-injection'
  | 'brute-force'
  | 'bot'
  | 'credential-stuffing'
  | 'path-traversal'
  | 'unknown'

interface ThreatPrediction {
  probability: number
  type: ThreatType
  timeline: 'immediate' | 'soon' | 'later'
  confidence: number
  recommendations: string[]
}
```

---

## 3. User Behavior Analyzer

**Назначение:** построение профиля поведения пользователя и поиск отклонений.

### Отслеживает

- типичные запросы;
- обычное время активности;
- предпочитаемые маршруты;
- скорость взаимодействия;
- частоту ошибок;
- повторяющиеся попытки входа;
- подозрительные изменения поведения.

---

### Пример профиля пользователя

```typescript
interface UserProfile {
  id: string

  patterns: {
    typicalRequests: string[]
    activeHours: {
      from: number
      to: number
    }
    averageSpeedMs: number
    preferredPaths: string[]
  }

  riskScore: number
  lastUpdated: Date
}
```

---

## 4. Content Analyzer

**Назначение:** анализ содержимого запросов на наличие опасных или подозрительных данных.

### Проверяет

- SQL Injection;
- XSS;
- вредоносные скрипты;
- нестандартные символы;
- path traversal;
- command injection patterns;
- suspicious JSON payload;
- опасные query параметры;
- большие или необычные body payload.

---

## 🔧 Использование

## Базовая конфигурация

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true,
    userBehaviorAnalysis: true,
    contentAnalysis: true
  }
})
```

---

## Расширенная конфигурация

## Расширенная конфигурация

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ai: {
    enabled: true,

    modules: {
      xssProtection: true,
      sqlInjectionProtection: true,
      userAgentAnalysis: true,
      ipReputation: true,
      behavioralAnalysis: true,
      contentAnalysis: true
    },

    thresholds: {
      anomalyThreshold: 0.7,
      threatThreshold: 0.8,
      trustThreshold: 0.3
    },

    learning: {
      enabled: true,
      mode: 'continuous',
      interval: 3600,
      sampleSize: 1000,
      feedbackEnabled: true
    }
  }
})
```

---

## Конфигурация для мягкого запуска

Для production лучше сначала включить AI в режиме наблюдения, чтобы оценить ложные срабатывания.

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ai: {
    enabled: true,

    blocking: {
      enabled: false
    },

  },

  logging: {
    level: 'info'
  },

  monitoring: {
    enabled: true
  }
})
```

---

## 📊 Результаты AI-анализа

## Структура результата

```typescript
interface AIAnalysisResult {
  // Найденные угрозы
  threats: Array<{
    type: string            // 'XSS' | 'SQL Injection' | 'Path Traversal' | ...
    severity: string        // 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    details: { pattern: string; location: string }
  }>

  // Основные оценки
  isThreat: boolean
  threatScore: number
  confidence: number

  // Детали анализа
  analysis: {
    userBehavior: { riskScore: number }
    contentAnalysis: {
      hasSQL: boolean
      hasXSS: boolean
      hasPathTraversal: boolean
      hasCommandInjection: boolean
      hasNoSQL: boolean
      hasLDAP: boolean
    }
    patternAnalysis: { score: number; matchedPatterns: string[] }
  }

  // Рекомендации
  recommendations: string[]
}
```

---

## Пример результата

```json
{
  "threats": [
    {
      "type": "SQL Injection",
      "severity": "critical",
      "confidence": 0.9,
      "details": {
        "pattern": "/union.+select/i",
        "location": "query"
      }
    }
  ],
  "isThreat": true,
  "threatScore": 0.9,
  "confidence": 0.9,
  "analysis": {
    "userBehavior": { "riskScore": 0.2 },
    "contentAnalysis": {
      "hasSQL": true,
      "hasXSS": false,
      "hasPathTraversal": false,
      "hasCommandInjection": false,
      "hasNoSQL": false,
      "hasLDAP": false
    },
    "patternAnalysis": {
      "score": 0.9,
      "matchedPatterns": ["SQL Injection"]
    }
  },
  "recommendations": [
    "Проверить параметры запроса",
    "Усилить валидацию на стороне приложения"
  ]
}
```

---

## 🎚️ Decision thresholds

Решение можно принимать на основе `threatScore`, `confidence` и настроек проекта.

| Score | Риск | Рекомендуемое действие |
|:---:|:---|:---|
| `0.00–0.39` | Низкий | `allow` или `log` |
| `0.40–0.59` | Умеренный | `log` |
| `0.60–0.79` | Средний / высокий | `warn` или `challenge` |
| `0.80–1.00` | Высокий | `block` или `challenge` |

> Пороговые значения нужно подбирать под конкретный проект и проверять на staging.

---

## 🧠 Обучение AI

## Как AI учится

```text
1. Сбор данных
   ↓
2. Маркировка: normal / anomaly / threat
   ↓
3. Обучение модели
   ↓
4. Валидация
   ↓
5. Применение в реальном времени
   ↓
6. Обратная связь
   ↓
7. Донастройка
```

---

## Включение обучения

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ai: {
    learning: {
      enabled: true,
      mode: 'continuous',
      interval: 3600,
      sampleSize: 1000,
      feedbackEnabled: true
    }
  }
})
```

---

## Ручное обучение

При `ai.learning.enabled` обучение идёт автоматически (`mode: 'continuous'`);
ручной запуск — `train()` из `getAIModule()`:

```typescript
const ai = shield.getAIModule()

// Обучение на накопленных данных (опционально — своя выборка: ai.train(data))
await ai.train()

// Состояние моделей после обучения
console.log(ai.getMetrics())
// { status: 'active', models: ['xss', 'sql_injection', 'anomaly'], accuracy: 0.95, analyses: 0 }
```

---

## 🧪 Валидация модели

Перед включением блокировки модель нужно проверять на тестовых данных —
для этого есть тот же `analyze()`: он доступен напрямую, минуя middleware.

```typescript
const ai = shield.getAIModule()

// Прогон тестового запроса (middleware не участвует)
const result = await ai.analyze(testRequest)

console.log(result.isThreat, result.threatScore, result.confidence)
console.log(ai.getMetrics())
```

---

## 📊 Мониторинг AI

### Основные метрики

```typescript
const aiMetrics = shield.getAIModule().getMetrics()

console.log(aiMetrics)
// {
//   status: 'active',
//   models: ['xss', 'sql_injection', 'anomaly'],
//   accuracy: 0.95,
//   analyses: 0
// }
```

| Метрика | Назначение |
|:---|:---|
| `status` | Статус AI-модуля |
| `models` | Подключённые модели |
| `accuracy` | Заявленная точность моделей |
| `analyses` | Количество выполненных анализов |

**Примечание:** общие метрики запросов и угроз — `shield.getMetrics()`
(14 полей, без секции AI); AI-специфичные — только `getAIModule().getMetrics()`.

---

## 🚨 Устранение проблем

## Ложные срабатывания

### Уменьшить чувствительность

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ai: {
    thresholds: {
      // выше порог → реже срабатывает (пример значений)
      anomalyThreshold: 0.9,
      threatThreshold: 0.85,
      trustThreshold: 0.3
    }
  }
})
```

---

### Отключить лишний AI-модуль

Per-path исключений для AI в текущей версии нет — если ложные срабатывания
идут с одного анализатора, выключите его:

```typescript
const shield = new FABShield({
  ai: {
    modules: {
      userAgentAnalysis: false
    }
  }
})
```

---

## Пропущенные угрозы

### Увеличить чувствительность

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ai: {
    thresholds: {
      // ниже порог → ловим больше (пример значений)
      anomalyThreshold: 0.5,
      threatThreshold: 0.7,
      trustThreshold: 0.4
    }
  }
})
```

---

### Добавить кастомное правило

AI не принимает внешних правил — расширение детекта делается плагином:

```typescript
const sqlGuard = {
  name: 'strict-sql',
  version: '1.0.0',
  onRequest: async (req) => {
    if (/SELECT.+FROM/i.test(req.path)) {
      return { block: true, status: 403, reason: 'Strict SQL pattern' }
    }
  }
}

const shield = new FABShield({ plugins: [sqlGuard] })
```

---

## Слишком высокая задержка

### Что проверить

- включены ли все AI-модули сразу;
- анализируется ли слишком большой body;
- используются ли тяжелые плагины;

### Пример оптимизации

```typescript
const shield = new FABShield({
  ai: {
    // каждый модуль добавляет работу на запрос — оставить нужные
    modules: {
      behavioralAnalysis: false,
      userAgentAnalysis: false
    }
  },

  performance: {
    lazyLoading: true
  }
})
```

---

## ✅ Рекомендации по production

- Начинайте с режима логирования.
- Включайте блокировку постепенно.
- Проверяйте false positives на staging.
- Не отправляйте чувствительные данные во внешние AI-сервисы.
- Используйте локальные модели, если данные критичны.
- Ограничивайте размер анализируемого body.
- Логируйте причины срабатывания, но не храните пароли и токены.
- Настройте метрики и алерты.
- Регулярно пересматривайте исключения.
- Не полагайтесь только на AI — используйте CSP, headers, rate limiting и аудит кода.

---

## ⚠️ Важные ограничения

AI Detection не является гарантией полной защиты.

Он не заменяет:

- secure coding;
- input validation;
- output encoding;
- CSP;
- rate limiting;
- WAF;
- DDoS-защиту;
- pentest;
- аудит кода;
- DevSecOps-процессы;
- мониторинг инфраструктуры.

AI Detection должен использоваться как дополнительный слой защиты внутри комплексной security-архитектуры.

---

## 📞 Контакты

| | |
|:---|:---|
| **Автор** | Фабрициус Владимир Николаевич |
| **Компания** | ООО «Деворбит» (DEVORBIT LLC) |
| **Email** | [Director@devorbit.ru](mailto:Director@devorbit.ru) |
| **Реестр** | [fab.devorbit.ru](https://fab.devorbit.ru) |
| **Сайт** | [devorbit.ru](https://devorbit.ru) |
| **GitHub** | [zammartin2/shield](https://github.com/zammartin2/shield) |
| **npm** | [@fab-orbita/shield](https://www.npmjs.com/package/@fab-orbita/shield) |
| **Fab Registry** | [@fab-orbita/shield](https://fab.devorbit.ru/packages/@fab-orbita/shield) |
| **Telegram** | [@fab_shield](https://t.me/fab_shield) |

---

<p align="center">

**FAB Shield — интеллектуальная защита для Node.js-приложений.**

Made with ❤️ by **Vladimir Fabrisius**

[GitHub](https://github.com/zammartin2/shield) •
[npm](https://www.npmjs.com/package/@fab-orbita/shield) •
[Fab Registry](https://fab.devorbit.ru/packages/@fab-orbita/shield) •
[Telegram](https://t.me/fab_shield)

</p>

---

© 2026 ООО «Деворбит» (DEVORBIT LLC)
