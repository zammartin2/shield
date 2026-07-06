import express from 'express';
import request from 'supertest';
import { FABShield } from '../../src/index';

describe('E2E Security Test Suite', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const shield = new FABShield({
      env: 'test',
      headers: { enabled: true },
      csp: { enabled: true },
      ai: { enabled: true, blocking: { enabled: true } },
      monitoring: { enabled: false },
      rateLimit: { enabled: false }
    });

    app.use(shield.middleware());

    // Базовые маршруты
    app.get('/', (req, res) => {
      res.json({ message: 'FAB Shield works!', protected: true });
    });

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    app.get('/api/data', (req, res) => {
      res.json({ data: 'protected', timestamp: new Date().toISOString() });
    });

    app.post('/api/auth', (req, res) => {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }
      // Разрешаем несколько вариантов логина
      if ((username === 'admin' && password === 'admin123') || 
          (username === 'admin@company.com' && password === 'Complex!@#Password123')) {
        return res.json({ 
          token: 'fake-jwt-token', 
          user: { id: 1, username: username, role: 'admin' } 
        });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    });

    app.get('/api/search', (req, res) => {
      const q = req.query.q || '';
      res.json({ query: q, results: [`Result for: ${q}`] });
    });

    app.post('/api/upload', (req, res) => {
      const { filename, size } = req.body;
      res.json({ 
        message: 'File uploaded', 
        filename: filename || 'unknown',
        size: size || 0 
      });
    });

    app.get('/admin/dashboard', (req, res) => {
      res.json({ 
        data: 'Admin dashboard',
        stats: { users: 100, requests: 1000, threats: 5 }
      });
    });

    // 404 обработчик
    app.use((req, res) => {
      res.status(404).json({ error: 'Not found', path: req.path });
    });

    // Обработчик ошибок
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(500).json({ error: err.message || 'Internal server error' });
    });
  });

  // ============================================
  // ГРУППА 1: БАЗОВЫЕ МАРШРУТЫ
  // ============================================

  describe('Basic Routes', () => {
    test('GET / should return welcome message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('FAB Shield');
      expect(response.body.protected).toBe(true);
    });

    test('GET /health should return ok status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });

    test('GET /api/data should return protected data', async () => {
      const response = await request(app).get('/api/data');
      expect(response.status).toBe(200);
      expect(response.body.data).toBe('protected');
    });
  });

  // ============================================
  // ГРУППА 2: SECURITY HEADERS
  // ============================================

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app).get('/');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    test('should not include X-Powered-By', async () => {
      const response = await request(app).get('/');
      expect(response.headers).not.toHaveProperty('x-powered-by');
    });

    test('should include CSP header', async () => {
      const response = await request(app).get('/');
      expect(response.headers).toHaveProperty('content-security-policy');
      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("default-src 'self'");
    });
  });

  // ============================================
  // ГРУППА 3: AI THREAT DETECTION
  // ============================================

  describe('AI Threat Detection', () => {
    test('should block XSS attack in query params', async () => {
      const response = await request(app).get('/api/search?q=<script>alert(1)</script>');
      expect([403, 400]).toContain(response.status);
    });

    test('should block SQL Injection in query params', async () => {
      const response = await request(app).get("/api/search?q=' OR '1'='1' --");
      expect([403, 400]).toContain(response.status);
    });

    test('should block XSS in request body', async () => {
      const response = await request(app)
        .post('/api/auth')
        .send({ username: '<script>alert(1)</script>', password: 'test123' });
      expect([403, 400]).toContain(response.status);
    });

    test('should block SQL Injection in request body', async () => {
      const response = await request(app)
        .post('/api/auth')
        .send({ username: "admin' OR '1'='1' --", password: 'anything' });
      expect([403, 400]).toContain(response.status);
    });

    test('should block Path Traversal attack', async () => {
      const response = await request(app).get('/api/search?q=../../../etc/passwd');
      expect([403, 400]).toContain(response.status);
    });

    test('should allow normal GET request', async () => {
      const response = await request(app).get('/api/search?q=hello');
      expect(response.status).toBe(200);
      expect(response.body.query).toBe('hello');
      expect(response.body.results).toHaveLength(1);
    });

    test('should allow valid POST request', async () => {
      const response = await request(app)
        .post('/api/auth')
        .send({ username: 'admin', password: 'admin123' });
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe('admin');
    });
  });

  // ============================================
  // ГРУППА 4: ВАЛИДАЦИЯ
  // ============================================

  describe('Validation', () => {
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth')
        .send({ username: 'admin' });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password required');
    });

    test('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Not found');
      expect(response.body.path).toBe('/nonexistent');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth')
        .set('Content-Type', 'application/json')
        .send('{malformed:json}');
      expect([400, 500]).toContain(response.status);
    });

    test('should handle invalid auth credentials', async () => {
      const response = await request(app)
        .post('/api/auth')
        .send({ username: 'admin', password: 'wrong' });
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  // ============================================
  // ГРУППА 5: КОМБИНИРОВАННЫЕ СЦЕНАРИИ
  // ============================================

  describe('Combined Security Scenarios', () => {
    test('should block complex attack with multiple vectors', async () => {
      const response = await request(app)
        .post('/api/auth')
        .send({
          username: "admin' OR '1'='1' -- <script>alert(1)</script>",
          password: "'; DROP TABLE users; -- <img src=x onerror=alert(1)>"
        });
      expect([403, 400]).toContain(response.status);
    });

    test('should allow legitimate complex request with email as username', async () => {
      const response = await request(app)
        .post('/api/auth')
        .send({
          username: 'admin@company.com',
          password: 'Complex!@#Password123'
        });
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe('admin@company.com');
    });

    test('should handle multiple requests with different patterns', async () => {
      const requests = [
        request(app).get('/api/search?q=hello'),
        request(app).get("/api/search?q=' OR '1'='1' --"),
        request(app).get('/api/search?q=<script>alert(1)</script>'),
        request(app).get('/api/search?q=world')
      ];

      const responses = await Promise.all(requests);
      
      // Первый и последний должны быть успешными
      expect(responses[0].status).toBe(200);
      expect(responses[3].status).toBe(200);
      
      // Второй и третий должны быть заблокированы
      expect([403, 400]).toContain(responses[1].status);
      expect([403, 400]).toContain(responses[2].status);
    });
  });

  // ============================================
  // ГРУППА 6: ПРОИЗВОДИТЕЛЬНОСТЬ
  // ============================================

  describe('Performance Tests', () => {
    test('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 20 }, () =>
        request(app).get('/api/search?q=test')
      );
      
      const responses = await Promise.all(requests);
      const successful = responses.filter(r => r.status === 200);
      
      // Большинство запросов должны быть успешными
      expect(successful.length).toBeGreaterThan(15);
    });

    test('should maintain response time', async () => {
      const responseTimes: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await request(app).get('/health');
        const duration = Date.now() - startTime;
        responseTimes.push(duration);
      }
      
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      expect(avgTime).toBeLessThan(200); // Должно быть быстро
    });
  });
});
