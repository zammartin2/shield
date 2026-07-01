import express from 'express'
import { FABShield } from '../../src'

const app = express()
const port = 3000

const shield = new FABShield({
  headers: { enabled: true },
  csp: { enabled: true },
  ai: { enabled: true }
})

app.use(shield.middleware())

app.get('/', (req, res) => {
  res.json({ message: 'Hello from FAB Shield with Express!' })
})

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`)
})
