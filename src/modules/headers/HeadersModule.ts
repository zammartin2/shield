// ============================================
// HEADERS MODULE — Security-заголовки
// ============================================

import { ConfigManager } from '../../core/ConfigManager'

export class HeadersModule {
  private config: ConfigManager

  constructor(config: ConfigManager) {
    this.config = config
  }

  async apply(_req: any, res: any): Promise<void> {
    const headersConfig = this.config.getModule('headers')
    if (!headersConfig?.enabled) return

    if (headersConfig.hsts) {
      let hsts = `max-age=${headersConfig.hsts.maxAge || 31536000}`
      if (headersConfig.hsts.includeSubDomains) hsts += '; includeSubDomains'
      if (headersConfig.hsts.preload) hsts += '; preload'
      res.setHeader('Strict-Transport-Security', hsts)
    }

    if (headersConfig.xFrame) {
      const action = headersConfig.xFrame.action || 'DENY'
      res.setHeader('X-Frame-Options', action)
    } else {
      res.setHeader('X-Frame-Options', 'DENY')
    }

    if (headersConfig.xContentTypeOptions !== false) {
      res.setHeader('X-Content-Type-Options', 'nosniff')
    }

    if (headersConfig.xXssProtection !== false) {
      res.setHeader('X-XSS-Protection', '1; mode=block')
    }

    if (headersConfig.referrerPolicy?.enabled !== false) {
      const policy = headersConfig.referrerPolicy?.policy || 'strict-origin-when-cross-origin'
      res.setHeader('Referrer-Policy', policy)
    }

    if (headersConfig.xDnsPrefetchControl !== false) {
      res.setHeader('X-DNS-Prefetch-Control', 'off')
    }

    if (headersConfig.xDownloadOptions !== false) {
      res.setHeader('X-Download-Options', 'noopen')
    }

    if (headersConfig.xPermittedCrossDomainPolicies !== false) {
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
    }

    if (headersConfig.xPoweredBy === false || headersConfig.xPoweredBy !== true) {
      res.removeHeader('X-Powered-By')
    }

    if (headersConfig.crossOrigin) {
      if (headersConfig.crossOrigin.embedder) {
        res.setHeader('Cross-Origin-Embedder-Policy', headersConfig.crossOrigin.embedder)
      }
      if (headersConfig.crossOrigin.opener) {
        res.setHeader('Cross-Origin-Opener-Policy', headersConfig.crossOrigin.opener)
      }
      if (headersConfig.crossOrigin.resource) {
        res.setHeader('Cross-Origin-Resource-Policy', headersConfig.crossOrigin.resource)
      }
    }

    res.setHeader('Origin-Agent-Cluster', '?1')

    if (headersConfig.custom) {
      Object.entries(headersConfig.custom).forEach(([key, value]) => {
        res.setHeader(key, String(value))
      })
    }

    if (headersConfig.disabled && Array.isArray(headersConfig.disabled)) {
      headersConfig.disabled.forEach((name: string) => {
        res.removeHeader(name)
      })
    }
  }

  getActiveHeaders(): Record<string, string> {
    const result: Record<string, string> = {}
    const headersConfig = this.config.getModule('headers')
    if (!headersConfig?.enabled) return result

    if (headersConfig.hsts) {
      let hsts = `max-age=${headersConfig.hsts.maxAge || 31536000}`
      if (headersConfig.hsts.includeSubDomains) hsts += '; includeSubDomains'
      if (headersConfig.hsts.preload) hsts += '; preload'
      result['Strict-Transport-Security'] = hsts
    }

    result['X-Frame-Options'] = headersConfig.xFrame?.action || 'DENY'
    result['X-Content-Type-Options'] = 'nosniff'
    result['X-XSS-Protection'] = '1; mode=block'
    
    const policy = headersConfig.referrerPolicy?.policy || 'strict-origin-when-cross-origin'
    result['Referrer-Policy'] = policy
    
    result['X-DNS-Prefetch-Control'] = 'off'
    result['X-Download-Options'] = 'noopen'
    result['X-Permitted-Cross-Domain-Policies'] = 'none'
    result['Origin-Agent-Cluster'] = '?1'

    if (headersConfig.custom) {
      Object.entries(headersConfig.custom).forEach(([key, value]) => {
        result[key] = String(value)
      })
    }

    return result
  }
}
