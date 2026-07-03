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
    
    if (!headersConfig || headersConfig.enabled === false) {
      return
    }

    // HSTS
    if (headersConfig.hsts) {
      let hsts = `max-age=${headersConfig.hsts.maxAge || 31536000}`
      if (headersConfig.hsts.includeSubDomains) hsts += '; includeSubDomains'
      if (headersConfig.hsts.preload) hsts += '; preload'
      res.setHeader('Strict-Transport-Security', hsts)
    } else {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }

    // X-Frame-Options
    if (headersConfig.xFrame) {
      const action = headersConfig.xFrame.action || 'DENY'
      res.setHeader('X-Frame-Options', action)
    } else {
      res.setHeader('X-Frame-Options', 'DENY')
    }

    // X-Content-Type-Options
    if (headersConfig.xContentTypeOptions !== false) {
      res.setHeader('X-Content-Type-Options', 'nosniff')
    }

    // X-XSS-Protection
    if (headersConfig.xXssProtection !== false) {
      res.setHeader('X-XSS-Protection', '1; mode=block')
    }

    // Referrer-Policy
    if (headersConfig.referrerPolicy?.enabled !== false) {
      const policy = headersConfig.referrerPolicy?.policy || 'strict-origin-when-cross-origin'
      res.setHeader('Referrer-Policy', policy)
    } else {
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    }

    // X-DNS-Prefetch-Control
    if (headersConfig.xDnsPrefetchControl !== false) {
      res.setHeader('X-DNS-Prefetch-Control', 'off')
    }

    // X-Download-Options
    if (headersConfig.xDownloadOptions !== false) {
      res.setHeader('X-Download-Options', 'noopen')
    }

    // X-Permitted-Cross-Domain-Policies
    if (headersConfig.xPermittedCrossDomainPolicies !== false) {
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
    }

    // Удаляем X-Powered-By
    res.removeHeader('X-Powered-By')
    res.removeHeader('Server')

    // Cross-Origin заголовки
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

    // Origin-Agent-Cluster
    res.setHeader('Origin-Agent-Cluster', '?1')

    // Permissions-Policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    // ✅ CSP устанавливается ТОЛЬКО в CSPModule
    // НЕ дублируем здесь CSP заголовок

    // Кастомные заголовки
    if (headersConfig.custom) {
      Object.entries(headersConfig.custom).forEach(([key, value]) => {
        res.setHeader(key, String(value))
      })
    }

    // Удаляем отключенные заголовки
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
    // CSP не включаем в список, так как он управляется CSPModule

    if (headersConfig.custom) {
      Object.entries(headersConfig.custom).forEach(([key, value]) => {
        result[key] = String(value)
      })
    }

    return result
  }
}
