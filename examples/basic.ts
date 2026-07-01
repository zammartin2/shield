import { FABShield } from '../src'

const shield = new FABShield({
  env: 'development',
  headers: { enabled: true },
  csp: { enabled: true },
  ai: { enabled: true }
})

console.log('✅ FAB Shield создан!')
console.log(`📦 Версия: ${shield.getVersion()}`)
console.log(`🛡️ Активен: ${shield.isActive()}`)
console.log(`📊 Статус:`, shield.getStatus())
console.log(`📈 Метрики:`, shield.getMetrics())
console.log('\n✅ Тест пройден!')
