# 🔄 CI/CD для FAB Shield

---

**Дата:** 2026-10-03  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**CI/CD (Continuous Integration / Continuous Deployment)** — это практика автоматизации сборки, тестирования и развертывания кода.

### ⚙️ Фактический CI

Для **FAB Shield** используется два workflow в GitHub Actions:
обязательный пайплайн проверок (`.github/workflows/ci.yml`) и публикацию в npm по тегу
(`.github/workflows/publish.yml`, триггер `v*`). Без зелёного прогона ci.yml изменения не принимаются.

| Стадия | Команда | Назначение |
|---|---|---|
| `lint` | `npm ci && npm run lint` | ESLint, 0 ошибок |
| `typecheck` | `npm ci && npm run type-check` | `tsc --noEmit` |
| `test` | `npm ci && npm run test:ci` | Jest + покрытие (пороги 98/94/99/98) |
| `build` | `npm ci && npm run build` | CJS + ESM + `.d.ts` в `dist/` |

Задачи выполняются на `ubuntu-latest` с матрицей Node.js 20.x / 22.x.
Конфиг `.gitlab-ci.yml` сохранён в корне и дублирует те же четыре стадии;
разделы **Jenkins** и **`deploy.yml`** ниже приведены справочно и **не используются**.

В этом документе описаны:

- 🔄 Автоматическая проверка кода
- 🧪 Запуск тестов
- 🛡️ Сканирование безопасности
- 📦 Сборка артефактов
- 🐳 Сборка Docker-образов
- 📊 Health-check и мониторинг

---

## 🏗️ Архитектура CI/CD

### CI/CD Pipeline

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CI/CD Pipeline                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           1. CODE PUSH                              │   │
│  │  • Git push                                                         │   │
│  │  • Pull Request                                                     │   │
│  │  • Manual trigger                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    2. CI Continuous Integration                      │   │
│  │  • Install dependencies                                             │   │
│  │  • Lint                                                             │   │
│  │  • Type checking                                                    │   │
│  │  • Unit tests                                                       │   │
│  │  • Build                                                            │   │
│  │  • Security scan                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    3. CD Continuous Deployment                       │   │
│  │  • Build Docker image                                               │   │
│  │  • Push to registry                                                 │   │
│  │  • Deploy to environment                                            │   │
│  │  • Smoke tests                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           4. MONITORING                             │   │
│  │  • Health checks                                                    │   │
│  │  • Metrics                                                          │   │
│  │  • Alerts                                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📄 GitHub Actions

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x, 22.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:ci
      - run: npm run build
```

---

### `.github/workflows/deploy.yml` (справочно, в репозитории отсутствует)

```yaml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: Environment to deploy
        required: true
        default: staging
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest

    environment: ${{ github.event.inputs.environment }}

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to ${{ github.event.inputs.environment }}
        uses: easingthemes/ssh-deploy@main
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SERVER_SSH_KEY }}
          ARGS: -rlgoDzvc -i
          SOURCE: dist/
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: ${{ secrets.DEPLOY_PATH }}

      - name: Restart application
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.REMOTE_HOST }}
          username: ${{ secrets.REMOTE_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd ${{ secrets.DEPLOY_PATH }}
            pm2 restart fab-shield

      - name: Smoke tests
        run: npm run test:smoke
        env:
          DEPLOY_URL: ${{ secrets.DEPLOY_URL }}
```

---

## 📄 GitLab CI (справочно)

### `.gitlab-ci.yml`

Конфиг из корня репозитория (дублирует те же стадии):

```yaml
stages:
  - lint
  - typecheck
  - test
  - build

# Каждый job обязан задавать image: дефолтный образ раннера по умолчанию —
# registry.gitlab.com/hadzhioglu/padavan-ng, в нём нет рабочего node/npm.
.npm:
  image: node:22
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules

lint:
  extends: .npm
  stage: lint
  script:
    - npm ci
    - npm run lint

typecheck:
  extends: .npm
  stage: typecheck
  script:
    - npm ci
    - npm run type-check

test:
  extends: .npm
  stage: test
  script:
    - npm ci
    # --coverage включает coverageThreshold из jest.config.js — это и есть гейт
    - npm run test:ci

build:
  extends: .npm
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
```

---

## 📄 Jenkins Pipeline (справочно, не используется)

### `Jenkinsfile`

```groovy
pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        REGISTRY = 'docker.io/fab-registry'
        IMAGE = "${REGISTRY}/shield"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Type Check') {
            steps {
                sh 'npm run type-check'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test:ci'
            }
            post {
                always {
                    junit 'coverage/junit.xml'
                    publishHTML([
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }

        stage('Security Scan') {
            steps {
                sh 'npm run security-scan'
            }
        }

        stage('Build') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker build -t ${IMAGE}:${GIT_COMMIT} .'
                sh 'docker tag ${IMAGE}:${GIT_COMMIT} ${IMAGE}:latest'
            }
        }

        stage('Push') {
            when {
                branch 'main'
            }
            steps {
                withDockerRegistry([credentialsId: 'docker-hub']) {
                    sh 'docker push ${IMAGE}:${GIT_COMMIT}'
                    sh 'docker push ${IMAGE}:latest'
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh '''
                    ssh ${SSH_USER}@${SSH_HOST} "
                        cd /var/www/fab-shield &&
                        docker pull ${IMAGE}:${GIT_COMMIT} &&
                        docker-compose down &&
                        docker-compose up -d
                    "
                '''
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message "Deploy to production?"
                ok "Yes"
            }
            steps {
                sh '''
                    ssh ${SSH_USER}@${SSH_HOST} "
                        cd /var/www/fab-shield &&
                        docker pull ${IMAGE}:${GIT_COMMIT} &&
                        docker-compose down &&
                        docker-compose up -d
                    "
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }

        success {
            emailext(
                subject: "✅ Build Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "The build was successful.",
                to: 'devops@company.com'
            )
        }

        failure {
            emailext(
                subject: "❌ Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "The build failed. Check the logs.",
                to: 'devops@company.com'
            )
        }
    }
}
```

---

## 🚀 Автоматизация релизов

### `scripts/release.sh`

```bash
#!/bin/bash
# Релиз FAB Shield.
# ВАЖНО: пуш идёт в origin (GitHub).
set -euo pipefail

VERSION=${1:-}
if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version>"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "📦 Releasing version $VERSION"

# package.json + package-lock.json (root version)
npm version "$VERSION" --no-git-tag-version

# fab.json npm version не трогает
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" fab.json

# SHIELD_VERSION иначе разойдётся с package.json и уронит тесты getVersion()
sed -i "s/const SHIELD_VERSION = '[^']*'/const SHIELD_VERSION = '$VERSION'/" src/core/FABShield.ts

npm run lint
npm run type-check
npm run test:coverage
npm run build

git add package.json package-lock.json fab.json src/core/FABShield.ts CHANGELOG.md
git commit -m "Release $VERSION"
git tag -a "v$VERSION" -m "Release $VERSION"
git push origin main
git push origin "v$VERSION"
echo "✅ Release $VERSION complete!"
```

---

## 📊 Мониторинг деплоя

### Пример: health-check.js (заготовка для вашего пайплайна)

> ⚠️ Файл-заготовка: в репозитории FAB Shield скрипта нет (в `scripts/` — `build.sh`, `release.sh`, `test.sh`). Адаптируйте под свой деплой.

```javascript
// health-check.js — пример скрипта проверки деплоя

const axios = require('axios')
const { exec } = require('child_process')

async function healthCheck() {
    const url = process.env.DEPLOY_URL || 'https://fab.devorbit.ru'
    const timeout = parseInt(process.env.HEALTH_TIMEOUT || '30000')
    const startTime = Date.now()

    try {
        const response = await axios.get(`${url}/health`, {
            timeout: timeout
        })

        if (response.status === 200 && response.data.status === 'ok') {
            const duration = Date.now() - startTime
            console.log(`✅ Health check passed (${duration}ms)`)
            return true
        }

        console.error('❌ Health check failed:', response.data)
        return false
    } catch (error) {
        console.error('❌ Health check error:', error.message)
        return false
    }
}

async function runHealthCheck() {
    console.log('🔍 Running health check...')

    const isHealthy = await healthCheck()

    if (!isHealthy) {
        console.error('❌ Health check failed, rolling back...')

        // команда отката вашего пайплайна (в репозитории FAB Shield rollback-скрипта нет)
        exec('npm run rollback', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Rollback failed:', error)
                process.exit(1)
            }

            console.log('🔄 Rollback successful')
        })

        process.exit(1)
    }

    console.log('✅ Health check passed')
    process.exit(0)
}

runHealthCheck()
```

---

## 📞 Контакты

| Поле | Значение |
|:---|:---|
| **Автор** | Фабрициус Владимир Николаевич |
| **Компания** | ООО «Деворбит» (DEVORBIT LLC) |
| **Email** | Director@devorbit.ru |
| **Реестр** | fab.devorbit.ru |

---

## 🏆 Итог

CI/CD для **FAB Shield** — это:

- 🔄 **Автоматизация** — сборка, тесты, деплой
- ✅ **Качество** — проверка кода на всех этапах
- 🛡️ **Безопасность** — сканирование уязвимостей
- 🚀 **Быстрота** — быстрые релизы
- 📊 **Мониторинг** — отслеживание состояния

**Автоматизируйте развертывание FAB Shield! 🔄**

---

© 2026 ООО «Деворбит» (DEVORBIT LLC)
