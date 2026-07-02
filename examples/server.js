import express from 'express';
import { FABShield } from '../src';
const app = express();
const port = process.env.PORT || 2007;
const shield = new FABShield({
    env: process.env.NODE_ENV || 'development',
    headers: {
        enabled: true,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    },
    csp: {
        enabled: true,
        dynamic: true
    },
    ai: {
        enabled: true,
        anomalyDetection: true,
        threatPrediction: true
    },
    monitoring: {
        enabled: true,
        export: ['json']
    },
    rateLimit: {
        enabled: true,
        default: {
            max: 100,
            windowMs: 60000
        }
    }
});
app.use(express.json());
app.use(shield.middleware());
app.get('/', (_req, res) => {
    res.json({
        message: 'Hello from FAB Shield!',
        version: shield.getVersion(),
        protected: true,
        endpoints: {
            health: '/health',
            metrics: '/metrics',
            status: '/status'
        }
    });
});
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'fab-shield',
        version: shield.getVersion(),
        active: shield.isActive(),
        timestamp: new Date().toISOString()
    });
});
app.get('/metrics', (_req, res) => {
    const metrics = shield.getMetrics();
    res.json(metrics);
});
app.get('/status', (_req, res) => {
    res.json(shield.getStatus());
});
app.post('/api/test', (req, res) => {
    res.json({
        message: 'Test endpoint',
        data: req.body,
        protected: true,
        timestamp: new Date().toISOString()
    });
});
app.use((err, _req, res, _next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        error: err.message || 'Internal server error',
        timestamp: new Date().toISOString()
    });
});
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🛡️  FAB SHIELD SERVER');
    console.log('='.repeat(50));
    console.log(`📍 URL: http://localhost:${port}`);
    console.log(`📦 Version: ${shield.getVersion()}`);
    console.log(`🛡️ Status: ${shield.isActive() ? '✅ Active' : '❌ Inactive'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\n📋 Available endpoints:');
    console.log(`  GET  /        - Home`);
    console.log(`  GET  /health  - Health check`);
    console.log(`  GET  /metrics - Metrics`);
    console.log(`  GET  /status  - Status`);
    console.log(`  POST /api/test - Test endpoint`);
    console.log('\n' + '='.repeat(50));
    console.log('✅ Ready to accept requests!\n');
});
//# sourceMappingURL=server.js.map