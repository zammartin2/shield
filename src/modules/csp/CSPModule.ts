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

    const directives = cspConfig.directives || {
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

    if (cspConfig.trustedCDNs && Array.isArray(cspConfig.trustedCDNs)) {
      const cdns = cspConfig.trustedCDNs
      if (directives['script-src']) {
        directives['script-src'] = [...directives['script-src'], ...cdns]
      }
      if (directives['style-src']) {
        directives['style-src'] = [...directives['style-src'], ...cdns]
      }
    }

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
