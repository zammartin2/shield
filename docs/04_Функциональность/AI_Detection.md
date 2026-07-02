# 🤖 AI Detection — Интеллектуальное обнаружение угроз

> Подробное описание модуля **AI Detection** в **FAB Shield**  
> Для анализа аномалий, подозрительных запросов и адаптивной защиты Node.js-приложений.

---

**Версия:** 1.0.0  
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

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ai: {
    enabled: true,

    modules: {
      anomaly: {
        enabled: true,
        sensitivity: 0.7,
        learningRate: 0.1,
        historySize: 1000
      },

      threat: {
        enabled: true,
        predictionWindow: 3600,
        confidenceThreshold: 0.8
      },

      behavior: {
        enabled: true,
        maxHistory: 100,
        decayTime: 86400,
        baselinePeriod: 7
      },

      content: {
        enabled: true,
        checkSQL: true,
        checkXSS: true,
        checkMalware: true,
        maxSize: 100000
      }
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

    actions: {
      defaultAction: 'log'
    }
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
  // Основные оценки
  isThreat: boolean
  threatScore: number
  confidence: number

  // Детали
  anomalies: Anomaly[]
  predictions: ThreatPrediction[]

  analysis: {
    userBehavior: UserBehaviorAnalysis
    contentAnalysis: ContentAnalysis
    patternAnalysis: PatternAnalysis
  }

  // Рекомендации
  recommendations: Recommendation[]
  suggestedAction: 'block' | 'challenge' | 'warn' | 'log' | 'allow'

  // Метаданные
  analysisTime: number
  modelUsed: string[]
  timestamp: Date
}
```

---

## Пример результата

```json
{
  "isThreat": true,
  "threatScore": 0.92,
  "confidence": 0.95,
  "anomalies": [
    {
      "type": "UNUSUAL_PATTERN",
      "description": "Необычная последовательность запросов",
      "severity": "high"
    }
  ],
  "predictions": [
    {
      "type": "SQL_INJECTION",
      "probability": 0.85,
      "timeline": "immediate"
    }
  ],
  "recommendations": [
    "Заблокировать IP на 24 часа",
    "Усилить валидацию параметров",
    "Отправить уведомление администратору"
  ],
  "suggestedAction": "block"
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

```typescript
// Добавление примера в обучающую выборку
shield.ai.addTrainingExample({
  data: requestData,
  label: 'normal',
  metadata: {
    source: 'manual',
    confidence: 1.0
  }
})

// Запуск обучения
await shield.ai.train()

// Сохранение модели
await shield.ai.saveModel('production')
```

---

## 🧪 Валидация модели

Перед включением блокировки модель нужно проверять на тестовых данных.

```typescript
const validation = await shield.ai.validate({
  dataset: './security-dataset.json',
  metrics: ['precision', 'recall', 'f1']
})

console.log(validation)
```

---

## 📊 Мониторинг AI

## Метрики AI

```typescript
const metrics = shield.ai.getMetrics()

console.log({
  // Производительность
  avgAnalysisTime: metrics.avgAnalysisTime,
  requestsAnalyzed: metrics.requestsAnalyzed,
  peakLoad: metrics.peakLoad,

  // Качество анализа
  accuracy: metrics.accuracy,
  falsePositives: metrics.falsePositives,
  falseNegatives: metrics.falseNegatives,

  // Обнаружения
  threatsFound: metrics.threatsFound,
  anomaliesDetected: metrics.anomaliesDetected,

  // Модели
  modelsLoaded: metrics.modelsLoaded,
  lastTraining: metrics.lastTraining
})
```

---

## Основные метрики

| Метрика | Назначение |
|:---|:---|
| `avgAnalysisTime` | Среднее время анализа |
| `requestsAnalyzed` | Количество проанализированных запросов |
| `peakLoad` | Пиковая нагрузка |
| `accuracy` | Оценка качества на размеченных данных |
| `falsePositives` | Ложные срабатывания |
| `falseNegatives` | Пропущенные угрозы |
| `threatsFound` | Найденные угрозы |
| `anomaliesDetected` | Найденные аномалии |
| `modelsLoaded` | Загруженные модели |
| `lastTraining` | Время последнего обучения |

---

## 🚨 Устранение проблем

## Ложные срабатывания

### Уменьшить чувствительность

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ai: {
    modules: {
      anomaly: {
        sensitivity: 0.5
      }
    }
  }
})
```

---

### Добавить исключение для конкретного пути

```typescript
shield.ai.addException({
  path: '/api/health',
  reason: 'Health check endpoint',
  type: 'allow'
})
```

---

## Пропущенные угрозы

### Увеличить чувствительность

```typescript
import { FABShield } from '@fab-orbita/shield'

const shield = new FABShield({
  ai: {
    modules: {
      anomaly: {
        sensitivity: 0.9
      }
    }
  }
})
```

---

### Добавить кастомное правило

```typescript
shield.ai.addRule({
  pattern: 'SELECT.*FROM',
  action: 'block',
  severity: 'high'
})
```

---

## Слишком высокая задержка

### Что проверить

- включены ли все AI-модули сразу;
- анализируется ли слишком большой body;
- используются ли тяжелые плагины;
- включено ли кэширование;
- настроен ли `maxSize` для content analysis.

### Пример оптимизации

```typescript
const shield = new FABShield({
  ai: {
    modules: {
      content: {
        enabled: true,
        maxSize: 50000
      },

      behavior: {
        enabled: true,
        maxHistory: 50
      }
    }
  },

  performance: {
    cache: {
      enabled: true,
      ttl: 300
    }
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
| **Email** | [derector@devorbit.ru](mailto:derector@devorbit.ru) |
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

© 2026 ООО «Деворбит». Все права защищены.
