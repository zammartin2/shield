// ============================================
// CSP MODULE — Content Security Policy
// ============================================

import { ConfigManager } from '../../core/ConfigManager'

export class CSPModule {
  private config: ConfigManager

  constructor(config: ConfigManager) {
    this.config = config
  }

  async apply(_req: any, res: any): Promise<void> {
    const cspConfig = this.config.getModule('csp')
    
    if (!cspConfig?.enabled) return

    // Копируем директивы из конфига или используем дефолтные
    const directives = cspConfig.directives ? { ...cspConfig.directives } : {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'https:', 'data:'],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'upgrade-insecure-requests': []
    }

    // Добавляем trusted CDNs только если они есть и не пустые
    if (cspConfig.trustedCDNs && Array.isArray(cspConfig.trustedCDNs) && cspConfig.trustedCDNs.length > 0) {
      const cdns = cspConfig.trustedCDNs
      
      // Проверяем что директивы существуют и являются массивами
      if (directives['script-src'] && Array.isArray(directives['script-src'])) {
        // Добавляем только уникальные значения
        const existing = new Set(directives['script-src'])
        for (const cdn of cdns) {
          if (!existing.has(cdn)) {
            directives['script-src'].push(cdn)
          }
        }
      }
      
      if (directives['style-src'] && Array.isArray(directives['style-src'])) {
        const existing = new Set(directives['style-src'])
        for (const cdn of cdns) {
          if (!existing.has(cdn)) {
            directives['style-src'].push(cdn)
          }
        }
      }
    }

    // Формируем CSP строку
    const csp = Object.entries(directives)
      .filter(([_, value]) => Array.isArray(value) && value.length > 0)
      .map(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          return `${key} ${value.join(' ')}`
        }
        return key
      })
      .join('; ')

    if (csp) {
      res.setHeader('Content-Security-Policy', csp)
    }
  }

  generateNonce(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let nonce = ''
    for (let i = 0; i < length; i++) {
      nonce += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return nonce
  }
}
