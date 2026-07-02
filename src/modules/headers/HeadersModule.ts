// ============================================
// HEADERS MODULE - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================

import { ConfigManager } from '../../core/ConfigManager'

export class HeadersModule {
  private config: ConfigManager

  constructor(config: ConfigManager) {
    this.config = config
  }

  async apply(_req: any, res: any): Promise<void> {
    const headersConfig = this.config.getModule('headers')
    
    // ✅ Если заголовки отключены - ничего не делаем
    if (!headersConfig || headersConfig.enabled === false) {
      return
    }

    // ✅ Устанавливаем HSTS
    if (headersConfig.hsts) {
      let hsts = `max-age=${headersConfig.hsts.maxAge || 31536000}`
      if (headersConfig.hsts.includeSubDomains) hsts += '; includeSubDomains'
      if (headersConfig.hsts.preload) hsts += '; preload'
      res.setHeader('Strict-Transport-Security', hsts)
    } else {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }

    // ✅ Устанавливаем X-Frame-Options
    if (headersConfig.xFrame) {
      const action = headersConfig.xFrame.action || 'DENY'
      res.setHeader('X-Frame-Options', action)
    } else {
      res.setHeader('X-Frame-Options', 'DENY')
    }

    // ✅ Устанавливаем X-Content-Type-Options
    if (headersConfig.xContentTypeOptions !== false) {
      res.setHeader('X-Content-Type-Options', 'nosniff')
    }

    // ✅ Устанавливаем X-XSS-Protection
    if (headersConfig.xXssProtection !== false) {
      res.setHeader('X-XSS-Protection', '1; mode=block')
    }

    // ✅ Устанавливаем Referrer-Policy
    if (headersConfig.referrerPolicy?.enabled !== false) {
      const policy = headersConfig.referrerPolicy?.policy || 'strict-origin-when-cross-origin'
      res.setHeader('Referrer-Policy', policy)
    } else {
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    }

    // ✅ Устанавливаем X-DNS-Prefetch-Control
    if (headersConfig.xDnsPrefetchControl !== false) {
      res.setHeader('X-DNS-Prefetch-Control', 'off')
    }

    // ✅ Устанавливаем X-Download-Options
    if (headersConfig.xDownloadOptions !== false) {
      res.setHeader('X-Download-Options', 'noopen')
    }

    // ✅ Устанавливаем X-Permitted-Cross-Domain-Policies
    if (headersConfig.xPermittedCrossDomainPolicies !== false) {
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
    }

    // ✅ Удаляем X-Powered-By
    if (headersConfig.xPoweredBy === false || headersConfig.xPoweredBy !== true) {
      res.removeHeader('X-Powered-By')
    } else {
      res.removeHeader('X-Powered-By')
    }

    // ✅ Удаляем Server
    res.removeHeader('Server')

    // ✅ Устанавливаем Cross-Origin заголовки
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
    } else {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
    }

    // ✅ Устанавливаем Origin-Agent-Cluster
    res.setHeader('Origin-Agent-Cluster', '?1')

    // ✅ Устанавливаем Permissions-Policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    // ✅ Устанавливаем Content-Security-Policy
    const cspConfig = this.config.getModule('csp')
    if (cspConfig?.enabled !== false) {
      const directives = cspConfig?.directives || {
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

      if (cspConfig?.trustedCDNs && Array.isArray(cspConfig.trustedCDNs)) {
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
    } else {
      res.setHeader('Content-Security-Policy', "default-src 'self'")
    }

    // ✅ Устанавливаем кастомные заголовки
    if (headersConfig.custom) {
      Object.entries(headersConfig.custom).forEach(([key, value]) => {
        res.setHeader(key, String(value))
      })
    }

    // ✅ Удаляем отключенные заголовки
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

    result['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
    result['X-Frame-Options'] = 'DENY'
    result['X-Content-Type-Options'] = 'nosniff'
    result['X-XSS-Protection'] = '1; mode=block'
    result['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    result['X-DNS-Prefetch-Control'] = 'off'
    result['X-Download-Options'] = 'noopen'
    result['X-Permitted-Cross-Domain-Policies'] = 'none'
    result['Origin-Agent-Cluster'] = '?1'
    result['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    result['Cross-Origin-Opener-Policy'] = 'same-origin'
    result['Content-Security-Policy'] = "default-src 'self'"

    if (headersConfig.custom) {
      Object.entries(headersConfig.custom).forEach(([key, value]) => {
        result[key] = String(value)
      })
    }

    return result
  }
}