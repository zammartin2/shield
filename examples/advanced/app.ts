import express from 'express'
import { FABShield } from '../../src'

const app = express()
const port = 3000

const shield = new FABShield({
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
    dynamic: true,
    trustedCDNs: ['https://cdn.jsdelivr.net']
  },
  ai: {
    enabled: true,
    anomalyDetection: true,
    threatPrediction: true
  },
  monitoring: {
    enabled: true,
    export: ['json']
  }
})

app.use(shield.middleware())

app.get('/', (req, res) => {
  res.json({ message: 'Hello from FAB Shield Advanced!' })
})

app.get('/metrics', (req, res) => {
  res.json(shield.getMetrics())
})

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`)
})
