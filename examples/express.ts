import express from 'express'
import { FABShield } from '../src'

const app = express()
const port = 3001

const shield = new FABShield({
  headers: { enabled: true },
  csp: { enabled: true },
  ai: { enabled: true }
})

app.use(express.json())
app.use(shield.middleware())

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from FAB Shield with Express!',
    version: shield.getVersion()
  })
})

app.get('/metrics', (req, res) => {
  res.json(shield.getMetrics())
})

app.listen(port, () => {
  console.log(`🚀 Express server with FAB Shield running on port ${port}`)
})
