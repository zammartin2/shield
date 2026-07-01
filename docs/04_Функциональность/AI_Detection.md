# 🤖 AI Detection — Интеллектуальное обнаружение угроз

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**AI Detection** — это сердце интеллектуальной защиты FAB Shield. Модуль использует искусственный интеллект для обнаружения аномалий, прогнозирования угроз и адаптации защиты в реальном времени.

---

## 🧠 Как это работает

### Архитектура AI Detection
┌─────────────────────────────────────────────────────────────────────────────┐
│ AI DETECTION ENGINE │
├─────────────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ INPUT LAYER │ │
│ │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │ │
│ │ │ Headers │ │ Body │ │ IP │ │ User-Agent│ │ │
│ │ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ FEATURE EXTRACTION │ │
│ │ • Нормализация │ │
│ │ • Векторизация │ │
│ │ • Преобразование │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ AI MODELS │ │
│ │ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │ │
│ │ │ Anomaly │ │ Threat │ │ User │ │ Content │ │ │
│ │ │ Detector │ │ Predictor │ │ Behavior │ │ Analyzer │ │ │
│ │ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ DECISION LAYER │ │
│ │ • Оценка угрозы (0-1) │ │
│ │ • Классификация │ │
│ │ • Рекомендации │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ ACTION LAYER │ │
│ │ • Блокировка │ │
│ │ • Предупреждение │ │
│ │ • Логирование │ │
│ │ • Адаптация │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────────────────────────┘

text

---

## 🎯 Модели AI

### 1. Anomaly Detector (Обнаружение аномалий)

**Назначение:** Находит отклонения от нормального поведения.

**Анализирует:**
- Паттерны запросов
- Временные интервалы
- Последовательности действий
- Объем данных

**Примеры аномалий:**
```typescript
// Нормальный запрос
{
    method: 'GET',
    path: '/api/users',
    interval: 2000ms,
    dataSize: 1024
}

// Аномальный запрос
{
    method: 'GET',
    path: '/api/users',
    interval: 10ms,    // Слишком быстро
    dataSize: 1000000  // Слишком много
}
2. Threat Predictor (Прогнозирование угроз)
Назначение: Предсказывает вероятные угрозы до их появления.

Использует:

Исторические данные

Текущие тренды

Поведенческие паттерны

Внешние источники

Прогнозы:

typescript
interface ThreatPrediction {
    probability: number;    // 0-1
    type: ThreatType;
    timeline: string;       // 'immediate' | 'soon' | 'later'
    confidence: number;     // 0-1
    recommendations: string[];
}
3. User Behavior Analyzer (Анализ поведения)
Назначение: Строит профиль пользователя и выявляет отклонения.

Отслеживает:

Типичные запросы

Обычное время активности

Предпочитаемые пути

Скорость взаимодействия

Профиль пользователя:

typescript
interface UserProfile {
    id: string;
    patterns: {
        typicalRequests: string[];
        activeHours: { from: number; to: number };
        averageSpeed: number;  // ms между запросами
        preferredPaths: string[];
    };
    riskScore: number;        // 0-100
    lastUpdated: Date;
}
4. Content Analyzer (Анализ контента)
Назначение: Анализирует содержимое запросов на наличие угроз.

Проверяет:

SQL инъекции

XSS атаки

Вредоносные скрипты

Нестандартные символы

Подозрительные паттерны

🔧 Использование
Базовая конфигурация
typescript
const shield = new FABShield({
    ai: {
        enabled: true,
        anomalyDetection: true,
        threatPrediction: true,
        userBehaviorAnalysis: true,
        contentAnalysis: true
    }
})
Расширенная конфигурация
typescript
const shield = new FABShield({
    ai: {
        enabled: true,
        modules: {
            anomaly: {
                enabled: true,
                sensitivity: 0.7,      // 0-1, выше = чувствительнее
                learningRate: 0.1,      // скорость обучения
                historySize: 1000       // размер истории
            },
            threat: {
                enabled: true,
                predictionWindow: 3600, // секунд
                confidenceThreshold: 0.8
            },
            behavior: {
                enabled: true,
                maxHistory: 100,        // записей на пользователя
                decayTime: 86400,       // секунд до забывания
                baselinePeriod: 7       // дней для построения профиля
            },
            content: {
                enabled: true,
                checkSQL: true,
                checkXSS: true,
                checkMalware: true,
                maxSize: 100000         // байт для анализа
            }
        }
    }
})
📊 Результаты AI анализа
Структура результата
typescript
interface AIAnalysisResult {
    // Основные оценки
    isThreat: boolean;
    threatScore: number;          // 0-1
    confidence: number;           // 0-1
    
    // Детали
    anomalies: Anomaly[];
    predictions: ThreatPrediction[];
    analysis: {
        userBehavior: UserBehaviorAnalysis;
        contentAnalysis: ContentAnalysis;
        patternAnalysis: PatternAnalysis;
    };
    
    // Рекомендации
    recommendations: Recommendation[];
    suggestedAction: 'block' | 'warn' | 'log' | 'allow';
    
    // Метаданные
    analysisTime: number;         // ms
    modelUsed: string[];
    timestamp: Date;
}
Пример результата
json
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
🧠 Обучение AI
Как AI учится
text
1. Сбор данных
   ↓
2. Маркировка (нормальные/аномальные)
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
Включение обучения
typescript
const shield = new FABShield({
    ai: {
        learning: {
            enabled: true,
            mode: 'continuous',        // 'continuous' | 'batch'
            interval: 3600,            // секунд
            sampleSize: 1000,
            feedbackEnabled: true
        }
    }
})
Ручное обучение
typescript
// Добавление примера в обучающую выборку
shield.ai.addTrainingExample({
    data: requestData,
    label: 'normal',          // 'normal' | 'anomaly' | 'threat'
    metadata: {
        source: 'manual',
        confidence: 1.0
    }
})

// Запуск обучения
await shield.ai.train()

// Сохранение модели
await shield.ai.saveModel('production')
📊 Мониторинг AI
Метрики AI
typescript
const metrics = shield.ai.getMetrics()

console.log({
    // Производительность
    avgAnalysisTime: metrics.avgAnalysisTime,      // ms
    requestsAnalyzed: metrics.requestsAnalyzed,
    peakLoad: metrics.peakLoad,                    // requests/sec
    
    // Точность
    accuracy: metrics.accuracy,                    // 0-1
    falsePositives: metrics.falsePositives,
    falseNegatives: metrics.falseNegatives,
    
    // Обнаружения
    threatsFound: metrics.threatsFound,
    anomaliesDetected: metrics.anomaliesDetected,
    
    // Модели
    modelsLoaded: metrics.modelsLoaded,
    lastTraining: metrics.lastTraining
})
🚨 Устранение проблем
Ложные срабатывания
typescript
// Уменьшить чувствительность
const shield = new FABShield({
    ai: {
        modules: {
            anomaly: {
                sensitivity: 0.5  // Было 0.7
            }
        }
    }
})

// Добавить исключение для конкретного пути
shield.ai.addException({
    path: '/api/health',
    reason: 'Health check endpoint',
    type: 'allow'
})
Пропущенные угрозы
typescript
// Увеличить чувствительность
const shield = new FABShield({
    ai: {
        modules: {
            anomaly: {
                sensitivity: 0.9
            }
        }
    }
})

// Добавить кастомное правило
shield.ai.addRule({
    pattern: 'SELECT.*FROM',
    action: 'block',
    severity: 'high'
})
📞 Контакты
Автор	Фабрициус Владимир Николаевич
Компания	ООО «Деворбит» (DEVORBIT LLC)
Email	derector@devorbit.ru
Реестр	fab.devorbit.ru
© 2026 ООО «Деворбит». Все права защищены.