# 🔄 CI/CD для FAB Shield

---

**Версия:** 1.0.0  
**Дата:** 2026-07-01  
**Автор:** Фабрициус Владимир Николаевич  
**Компания:** ООО «Деворбит» (DEVORBIT LLC)

---

## 📋 Введение

**CI/CD (Continuous Integration / Continuous Deployment)** — это практика автоматизации сборки, тестирования и развертывания кода.

В этом документе описаны настройки CI/CD для **FAB Shield**:

- 🔄 Автоматическая проверка кода
- 🧪 Запуск тестов
- 🛡️ Сканирование безопасности
- 📦 Сборка артефактов
- 🐳 Сборка Docker-образов
- 🚀 Деплой в окружения
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
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/cobertura-coverage.xml
          fail_ci_if_error: true

  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

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

      - name: Build Docker image
        run: |
          docker build -t fab-shield:${{ github.sha }} .
          docker tag fab-shield:${{ github.sha }} fab-shield:latest

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Push Docker image
        run: |
          docker push fab-shield:${{ github.sha }}
          docker push fab-shield:latest

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/

  security-scan:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: fab-shield:${{ github.sha }}
          format: sarif
          output: trivy-results.sarif

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: trivy-results.sarif
```

---

### `.github/workflows/deploy.yml`

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

## 📄 GitLab CI

### `.gitlab-ci.yml`

```yaml
# .gitlab-ci.yml

stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: '18'
  REGISTRY: registry.gitlab.com/fab-registry/shield

cache:
  paths:
    - node_modules/

# ============================================
# TEST
# ============================================

test:
  stage: test
  image: node:$NODE_VERSION-alpine
  before_script:
    - npm ci
  script:
    - npm run lint
    - npm run type-check
    - npm run test:ci
  coverage: /All files[^|]*\|[^|]*\s+([\d\.]+)/
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

security-scan:
  stage: test
  image: node:$NODE_VERSION-alpine
  before_script:
    - npm ci
  script:
    - npm run security-scan
  allow_failure: true

# ============================================
# BUILD
# ============================================

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $REGISTRY:$CI_COMMIT_SHA .
    - docker tag $REGISTRY:$CI_COMMIT_SHA $REGISTRY:latest
    - docker push $REGISTRY:$CI_COMMIT_SHA
    - docker push $REGISTRY:latest
  only:
    - main

# ============================================
# DEPLOY
# ============================================

deploy-staging:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - |
      ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "
        cd /var/www/fab-shield &&
        docker pull $REGISTRY:$CI_COMMIT_SHA &&
        docker-compose down &&
        docker-compose up -d
      "
  environment:
    name: staging
    url: https://staging.fab.devorbit.ru
  only:
    - develop

deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - |
      ssh -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST "
        cd /var/www/fab-shield &&
        docker pull $REGISTRY:$CI_COMMIT_SHA &&
        docker-compose down &&
        docker-compose up -d
      "
  environment:
    name: production
    url: https://fab.devorbit.ru
  only:
    - main
  when: manual
```

---

## 📄 Jenkins Pipeline

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

# Release script
set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/release.sh <version>"
    echo "Example: ./scripts/release.sh 1.0.0"
    exit 1
fi

echo "📦 Releasing version $VERSION"

# Update version in package.json
npm version $VERSION --no-git-tag-version

# Update CHANGELOG.md
node scripts/update-changelog.js

# Build
npm run build

# Run tests
npm test

# Commit
git add package.json CHANGELOG.md
git commit -m "Release $VERSION"

# Tag
git tag -a "v$VERSION" -m "Release $VERSION"

# Push
git push origin main
git push origin "v$VERSION"

echo "✅ Release $VERSION complete!"
```

---

## 📊 Мониторинг деплоя

### `scripts/health-check.js`

```javascript
// scripts/health-check.js

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
| **Email** | legal@devorbit.ru |
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

© 2026 ООО «Деворбит». Все права защищены.
