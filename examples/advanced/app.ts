/**
 * Advanced Express Example with FAB Shield
 */

import express, { Request, Response, NextFunction } from 'express';
import { FABShield, Plugin } from '../../src';

// ============================================
// 1. ПЛАГИНЫ
// ============================================

const auditPlugin: Plugin = {
  name: 'audit-logger',
  version: '1.3.0',
  description: 'Logs all incoming requests',
  
  middleware(req: Request, res: Response, next: NextFunction) {
    const timestamp = new Date().toISOString();
    console.log(`[AUDIT] ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
  }
};

const geoBlockingPlugin: Plugin = {
  name: 'geo-blocking',
  version: '1.3.0',
  description: 'Blocks requests from blocked IPs',
  
  async onRequest(req: Request, context: any) {
    const blockedIPs = ['192.168.1.100', '10.0.0.50'];
    const clientIP = req.ip || 'unknown';
    
    if (blockedIPs.includes(clientIP)) {
      return {
        block: true,
        status: 403,
        message: 'Access denied from this location',
        reason: 'IP is blocked'
      };
    }
    
    return { block: false };
  }
};

// ============================================
// 2. НАСТРОЙКА FAB SHIELD
// ============================================

console.log('Hello from shield!');

const shield = new FABShield({
  env: 'development',
  
  headers: {
    enabled: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    xFrame: {
      action: 'DENY'
    },
    referrerPolicy: {
      enabled: true,
      policy: 'strict-origin-when-cross-origin'
    },
    crossOrigin: {
      opener: 'same-origin',
      embedder: 'require-corp',
      resource: 'cross-origin'
    },
    custom: {
      'X-Custom-Header': 'FAB-Shield-Protected',
      'X-API-Version': '1.0.0'
    }
  },
  
  csp: {
    enabled: true,
    dynamic: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'https:', 'data:'],
      'connect-src': ["'self'", 'https://api.example.com'],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'upgrade-insecure-requests': []
    },
    trustedCDNs: [
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com'
    ]
  },
  
  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true,
    userBehaviorAnalysis: true,
    contentAnalysis: true,
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
    },
    blocking: {
      enabled: true,
      duration: 300,
      maxAttempts: 5
    }
  },
  
  rateLimit: {
    enabled: true,
    default: {
      max: 100,
      windowMs: 60000
    },
    paths: {
      '/api/auth/login': { max: 10, windowMs: 60000 },
      '/api/auth/register': { max: 5, windowMs: 60000 },
      '/api/admin/*': { max: 20, windowMs: 60000 }
    },
    roles: {
      admin: { max: 500, windowMs: 60000 },
      user: { max: 100, windowMs: 60000 },
      guest: { max: 20, windowMs: 60000 }
    },
    whitelist: {
      enabled: true,
      ips: ['192.168.1.1', '10.0.0.1'],
      users: ['admin', 'system']
    }
  },
  
  monitoring: {
    enabled: true,
    export: ['json', 'prometheus'],
    interval: 60,
    alerts: {
      enabled: true,
      rules: [
        {
          metric: 'threatsBlocked',
          threshold: 10,
          window: 60,
          severity: 'high'
        },
        {
          metric: 'errorRate',
          threshold: 0.05,
          window: 60,
          severity: 'medium'
        }
      ]
    }
  },
  
  logging: {
    level: 'debug',
    format: 'json',
    transports: [
      { type: 'console', enabled: true },
      { type: 'file', enabled: true, path: './logs/shield.log' }
    ],
    include: {
      requests: true,
      threats: true,
      errors: true,
      performance: true,
      metrics: true
    }
  },
  
  plugins: [auditPlugin, geoBlockingPlugin]
});

// ============================================
// 3. НАСТРОЙКА EXPRESS
// ============================================

const app = express();
const PORT = process.env.PORT || 3025;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(shield.middleware());

// ============================================
// 4. ЭНДПОИНТЫ
// ============================================

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'FAB Shield Advanced Example',
    version: '1.3.0',
    protected: true,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      status: '/status',
      protected: '/api/protected',
      login: '/api/auth/login',
      admin: '/api/admin/dashboard',
      testXss: '/api/test/xss'
    }
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    shield: {
      active: shield.isActive(),
      version: shield.getVersion()
    }
  });
});

app.get('/metrics', (req: Request, res: Response) => {
  const format = req.query.format as string || 'json';
  const metrics = shield.exportMetrics(format as any);
  res.setHeader('Content-Type', 
    format === 'prometheus' ? 'text/plain' : 'application/json'
  );
  res.send(metrics);
});

app.get('/status', (req: Request, res: Response) => {
  const status = shield.getStatus();
  res.json(status);
});

app.get('/api/protected', (req: Request, res: Response) => {
  res.json({
    message: 'This is a protected endpoint',
    data: {
      user: 'example',
      access: 'granted',
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      error: 'Username and password are required'
    });
  }
  
  res.json({
    success: true,
    message: 'Login successful',
    user: {
      username,
      role: 'user',
      token: 'mock-jwt-token'
    }
  });
});

app.get('/api/admin/dashboard', (req: Request, res: Response) => {
  res.json({
    message: 'Admin Dashboard',
    data: {
      users: 1234,
      requests: 5678,
      threats: 42,
      uptime: process.uptime()
    }
  });
});

app.post('/api/test/xss', (req: Request, res: Response) => {
  const { input } = req.body;
  
  res.json({
    message: 'Input received',
    input: input,
    sanitized: input?.replace(/<[^>]*>/g, ''),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/metrics/export', (req: Request, res: Response) => {
  const format = req.query.format as string || 'json';
  const metrics = shield.exportMetrics(format as any);
  
  res.setHeader('Content-Type', 
    format === 'csv' ? 'text/csv' : 'application/json'
  );
  res.send(metrics);
});

// ============================================
// 5. ОБРАБОТКА ОШИБОК
// ============================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 6. ЗАПУСК
// ============================================

app.listen(PORT, () => {
  console.log('==================================================');
  console.log('🛡️  FAB SHIELD ADVANCED EXAMPLE');
  console.log('==================================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📦 Version: ${shield.getVersion()}`);
  console.log(`🛡️ Status: ${shield.isActive() ? '✅ Active' : '❌ Inactive'}`);
  console.log('==================================================');
  console.log('📋 Available endpoints:');
  console.log(`  GET  /                        - Home`);
  console.log(`  GET  /health                  - Health check`);
  console.log(`  GET  /metrics                 - Metrics (JSON)`);
  console.log(`  GET  /metrics?format=prometheus - Metrics (Prometheus)`);
  console.log(`  GET  /status                  - Shield status`);
  console.log(`  GET  /api/protected           - Protected endpoint`);
  console.log(`  POST /api/auth/login          - Login (rate limited)`);
  console.log(`  GET  /api/admin/dashboard     - Admin (rate limited)`);
  console.log(`  POST /api/test/xss            - Test AI protection`);
  console.log(`  GET  /api/metrics/export      - Export metrics`);
  console.log('==================================================');
  console.log('✨ Plugins loaded:');
  console.log(`  - ${auditPlugin.name} v${auditPlugin.version}`);
  console.log(`  - ${geoBlockingPlugin.name} v${geoBlockingPlugin.version}`);
  console.log('==================================================');
  console.log('🔒 Protected by FAB Shield v1.3.0');
  console.log('==================================================');
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  shield.destroy();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  shield.destroy();
  process.exit(0);
});

export default app;
