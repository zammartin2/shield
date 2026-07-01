// ============================================
// VALIDATOR — Расширенная валидация
// ============================================

export class Validator {
  // ============================================
  // БАЗОВЫЕ ПРОВЕРКИ
  // ============================================

  /**
   * Проверка email
   */
  isEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  /**
   * Проверка URL
   */
  isURL(url: string): boolean {
    try { 
      new URL(url); 
      return true 
    } catch { 
      return false 
    }
  }

  /**
   * Проверка IP (IPv4)
   */
  isIPv4(ip: string): boolean {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)
  }

  /**
   * Проверка IP (IPv6)
   */
  isIPv6(ip: string): boolean {
    return /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(ip)
  }

  /**
   * Проверка IP (любой)
   */
  isIP(ip: string): boolean {
    return this.isIPv4(ip) || this.isIPv6(ip)
  }

  /**
   * Проверка UUID
   */
  isUUID(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)
  }

  /**
   * Проверка порта
   */
  isPort(port: number): boolean {
    return Number.isInteger(port) && port > 0 && port < 65536
  }

  /**
   * Проверка хеша SHA-256
   */
  isSHA256(hash: string): boolean {
    return /^[0-9a-f]{64}$/i.test(hash)
  }

  /**
   * Проверка Base64
   */
  isBase64(str: string): boolean {
    return /^[A-Za-z0-9+/=]+$/.test(str)
  }

  /**
   * Проверка HEX
   */
  isHex(str: string): boolean {
    return /^[0-9a-f]+$/i.test(str)
  }

  /**
   * Проверка JWT
   */
  isJWT(token: string): boolean {
    return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token)
  }

  /**
   * Проверка даты
   */
  isDate(date: any): boolean {
    if (date instanceof Date) return !isNaN(date.getTime())
    if (typeof date === 'string' || typeof date === 'number') {
      const d = new Date(date)
      return !isNaN(d.getTime())
    }
    return false
  }

  /**
   * Проверка boolean
   */
  isBoolean(value: any): boolean {
    return typeof value === 'boolean' || value === 'true' || value === 'false'
  }

  /**
   * Проверка числа
   */
  isNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value)
  }

  /**
   * Проверка целого числа
   */
  isInteger(value: any): boolean {
    return Number.isInteger(value)
  }

  /**
   * Проверка положительного числа
   */
  isPositive(value: number): boolean {
    return this.isNumber(value) && value > 0
  }

  /**
   * Проверка отрицательного числа
   */
  isNegative(value: number): boolean {
    return this.isNumber(value) && value < 0
  }

  // ============================================
  // ПРОВЕРКИ БЕЗОПАСНОСТИ
  // ============================================

  /**
   * Проверка на XSS
   */
  hasXSS(input: string): boolean {
    const patterns = [
      /<script.*>.*<\/script>/i,
      /javascript:/i,
      /onerror\s*=/i,
      /onload\s*=/i,
      /onclick\s*=/i,
      /onmouseover\s*=/i,
      /onmouseout\s*=/i,
      /onfocus\s*=/i,
      /onblur\s*=/i,
      /onchange\s*=/i,
      /onsubmit\s*=/i,
      /eval\s*\(/i,
      /document\.cookie/i,
      /alert\s*\(/i,
      /prompt\s*\(/i,
      /confirm\s*\(/i,
      /window\.location/i,
      /\.innerHTML\s*=/i,
      /\.outerHTML\s*=/i,
      /document\.write/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i
    ]
    return patterns.some(pattern => pattern.test(input))
  }

  /**
   * Проверка на SQL инъекцию
   */
  hasSQLInjection(input: string): boolean {
    const patterns = [
      /SELECT.*FROM/i,
      /INSERT.*INTO/i,
      /UPDATE.*SET/i,
      /DELETE.*FROM/i,
      /DROP.*TABLE/i,
      /UNION.*SELECT/i,
      /;.*--/,
      /'.*OR.*'.*='.*'/,
      /'.*AND.*'.*='.*'/,
      /EXEC\s+.*/i,
      /EXECUTE\s+.*/i,
      /CREATE\s+TABLE/i,
      /ALTER\s+TABLE/i,
      /TRUNCATE\s+TABLE/i,
      /MERGE\s+INTO/i,
      /REPLACE\s+INTO/i,
      /LOAD\s+DATA/i
    ]
    return patterns.some(pattern => pattern.test(input))
  }

  /**
   * Проверка на NoSQL инъекцию
   */
  hasNoSQLInjection(input: string): boolean {
    const patterns = [
      /\$gt\s*:/,
      /\$lt\s*:/,
      /\$ne\s*:/,
      /\$or\s*:/,
      /\$and\s*:/,
      /\$where\s*:/,
      /\$regex\s*:/,
      /\$exists\s*:/,
      /\$type\s*:/,
      /\$size\s*:/,
      /\$all\s*:/,
      /\$in\s*:/,
      /\$nin\s*:/,
      /\$elemMatch\s*:/
    ]
    return patterns.some(pattern => pattern.test(input))
  }

  /**
   * Проверка на path traversal
   */
  hasPathTraversal(input: string): boolean {
    return /\.\.\/|\.\.\\|\.\.\//.test(input)
  }

  /**
   * Проверка на command injection
   */
  hasCommandInjection(input: string): boolean {
    const patterns = [
      /;.*rm\s+-rf/,
      /;.*wget/,
      /;.*curl/,
      /\|\s*.*sh/,
      /`.*`/,
      /\$\(.*\)/,
      /&\s*.*/,
      /\|\|.*/,
      /;\s*echo/,
      /;\s*cat/,
      /;\s*ls/,
      /;\s*pwd/,
      /;\s*whoami/,
      /;\s*id/,
      /;\s*uname/
    ]
    return patterns.some(pattern => pattern.test(input))
  }

  /**
   * Проверка на SSRF
   */
  hasSSRF(input: string): boolean {
    const patterns = [
      /http:\/\/169.254.169.254/,
      /http:\/\/localhost/,
      /http:\/\/127\.0\.0\.1/,
      /http:\/\/0\.0\.0\.0/,
      /file:\/\//,
      /gopher:\/\//,
      /dict:\/\//,
      /ftp:\/\//
    ]
    return patterns.some(pattern => pattern.test(input))
  }

  /**
   * Проверка на XXE
   */
  hasXXE(input: string): boolean {
    const patterns = [
      /<!DOCTYPE.*\[/,
      /<!ENTITY.*SYSTEM/,
      /<!ENTITY.*PUBLIC/,
      /%[a-zA-Z]+;/,
      /&#x[0-9a-f]+;/,
      /&#[0-9]+;/
    ]
    return patterns.some(pattern => pattern.test(input))
  }

  /**
   * Проверка на LDAP инъекцию
   */
  hasLDAPInjection(input: string): boolean {
    const patterns = [
      /\*\(.*\)/,
      /\|\(.*\)/,
      /&\(.*\)/,
      /!\(.*\)/,
      /\(.*=.*\)/,
      /\(.*>=.*\)/,
      /\(.*<=.*\)/,
      /\(.*~=.*\)/
    ]
    return patterns.some(pattern => pattern.test(input))
  }

  /**
   * Проверка на RCE (Remote Code Execution)
   */
  hasRCE(input: string): boolean {
    const patterns = [
      /system\s*\(/i,
      /exec\s*\(/i,
      /shell_exec\s*\(/i,
      /popen\s*\(/i,
      /passthru\s*\(/i,
      /proc_open\s*\(/i,
      /pcntl_exec\s*\(/i,
      /eval\s*\(/i,
      /assert\s*\(/i,
      /create_function\s*\(/i
    ]
    return patterns.some(pattern => pattern.test(input))
  }

  // ============================================
  // САНИТИЗАЦИЯ
  // ============================================

  /**
   * Санитизация строки
   */
  sanitize(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Санитизация URL
   */
  sanitizeURL(url: string): string {
    try {
      const parsed = new URL(url)
      // Удаляем потенциально опасные протоколы
      if (['javascript:', 'data:', 'vbscript:'].includes(parsed.protocol)) {
        return ''
      }
      return parsed.toString()
    } catch {
      return ''
    }
  }

  /**
   * Санитизация пути
   */
  sanitizePath(path: string): string {
    return path
      .replace(/\.\./g, '')
      .replace(/\/\//g, '/')
      .replace(/\\/g, '/')
  }

  /**
   * Экранирование для HTML
   */
  escapeHTML(input: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    }
    return input.replace(/[&<>"'`=/]/g, char => map[char] || char)
  }

  /**
   * Экранирование для HTML атрибутов
   */
  escapeHTMLAttribute(input: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
      ' ': '&#32;'
    }
    return input.replace(/[&<>"'`=/ ]/g, char => map[char] || char)
  }

  /**
   * Экранирование для JavaScript
   */
  escapeJS(input: string): string {
    const map: Record<string, string> = {
      '\\': '\\\\',
      "'": "\\'",
      '"': '\\"',
      '\n': '\\n',
      '\r': '\\r',
      '\t': '\\t',
      '\b': '\\b',
      '\f': '\\f'
    }
    return input.replace(/[\\'"\n\r\t\b\f]/g, char => map[char] || char)
  }

  /**
   * Экранирование для SQL
   */
  escapeSQL(input: string): string {
    return input.replace(/'/g, "''")
  }

  /**
   * Экранирование для JSON
   */
  escapeJSON(input: string): string {
    return JSON.stringify(input).slice(1, -1)
  }

  // ============================================
  // ВАЛИДАЦИЯ ОБЪЕКТОВ
  // ============================================

  /**
   * Валидация объекта по схеме
   */
  validateSchema(obj: any, schema: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key]
      
      // Проверка обязательности
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${key} is required`)
        continue
      }
      
      if (value === undefined || value === null) continue
      
      // Проверка типа
      if (rules.type) {
        const typeCheck = this.checkType(value, rules.type)
        if (!typeCheck) {
          errors.push(`${key} must be of type ${rules.type}`)
        }
      }
      
      // Проверка регулярного выражения
      if (rules.pattern && !rules.pattern.test(String(value))) {
        errors.push(`${key} does not match pattern ${rules.pattern}`)
      }
      
      // Проверка минимальной длины
      if (rules.minLength !== undefined && String(value).length < rules.minLength) {
        errors.push(`${key} must be at least ${rules.minLength} characters`)
      }
      
      // Проверка максимальной длины
      if (rules.maxLength !== undefined && String(value).length > rules.maxLength) {
        errors.push(`${key} must be at most ${rules.maxLength} characters`)
      }
      
      // Проверка минимального значения
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${key} must be at least ${rules.min}`)
      }
      
      // Проверка максимального значения
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${key} must be at most ${rules.max}`)
      }
      
      // Проверка на in
      if (rules.in && !rules.in.includes(value)) {
        errors.push(`${key} must be one of: ${rules.in.join(', ')}`)
      }
      
      // Проверка на not in
      if (rules.notIn && rules.notIn.includes(value)) {
        errors.push(`${key} must not be one of: ${rules.notIn.join(', ')}`)
      }
      
      // Проверка email
      if (rules.email && !this.isEmail(value)) {
        errors.push(`${key} must be a valid email`)
      }
      
      // Проверка URL
      if (rules.url && !this.isURL(value)) {
        errors.push(`${key} must be a valid URL`)
      }
      
      // Проверка IP
      if (rules.ip && !this.isIP(value)) {
        errors.push(`${key} must be a valid IP address`)
      }
      
      // Проверка UUID
      if (rules.uuid && !this.isUUID(value)) {
        errors.push(`${key} must be a valid UUID`)
      }
      
      // Проверка безопасности
      if (rules.noXSS && this.hasXSS(value)) {
        errors.push(`${key} contains potential XSS attack`)
      }
      
      if (rules.noSQL && this.hasSQLInjection(value)) {
        errors.push(`${key} contains potential SQL injection`)
      }
    }
    
    return { valid: errors.length === 0, errors }
  }

  /**
   * Проверка типа
   */
  private checkType(value: any, type: string): boolean {
    switch (type) {
      case 'string': return typeof value === 'string'
      case 'number': return this.isNumber(value)
      case 'boolean': return this.isBoolean(value)
      case 'object': return typeof value === 'object' && value !== null && !Array.isArray(value)
      case 'array': return Array.isArray(value)
      case 'null': return value === null
      case 'undefined': return value === undefined
      case 'any': return true
      default: return false
    }
  }

  // ============================================
  // КОМПОЗИТНЫЕ ПРОВЕРКИ
  // ============================================

  /**
   * Проверка на безопасность ввода
   */
  isSafe(input: string, options?: { 
    checkXSS?: boolean
    checkSQL?: boolean
    checkNoSQL?: boolean
    checkPathTraversal?: boolean
    checkCommand?: boolean
    checkSSRF?: boolean
    checkXXE?: boolean
    checkLDAP?: boolean
    checkRCE?: boolean
  }): boolean {
    const opts = { ...options }
    
    // По умолчанию проверяем всё
    const checkXSS = opts.checkXSS !== false
    const checkSQL = opts.checkSQL !== false
    const checkNoSQL = opts.checkNoSQL !== false
    const checkPathTraversal = opts.checkPathTraversal !== false
    const checkCommand = opts.checkCommand !== false
    const checkSSRF = opts.checkSSRF !== false
    const checkXXE = opts.checkXXE !== false
    const checkLDAP = opts.checkLDAP !== false
    const checkRCE = opts.checkRCE !== false

    if (checkXSS && this.hasXSS(input)) return false
    if (checkSQL && this.hasSQLInjection(input)) return false
    if (checkNoSQL && this.hasNoSQLInjection(input)) return false
    if (checkPathTraversal && this.hasPathTraversal(input)) return false
    if (checkCommand && this.hasCommandInjection(input)) return false
    if (checkSSRF && this.hasSSRF(input)) return false
    if (checkXXE && this.hasXXE(input)) return false
    if (checkLDAP && this.hasLDAPInjection(input)) return false
    if (checkRCE && this.hasRCE(input)) return false

    return true
  }

  /**
   * Комплексная проверка параметра
   */
  validateParam(value: any, rules: {
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
    required?: boolean
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    in?: any[]
    notIn?: any[]
    email?: boolean
    url?: boolean
    ip?: boolean
    uuid?: boolean
    noXSS?: boolean
    noSQL?: boolean
    noPathTraversal?: boolean
    noCommand?: boolean
  }): { valid: boolean; error?: string } {
    // Проверка обязательности
    if (rules.required && (value === undefined || value === null)) {
      return { valid: false, error: 'Value is required' }
    }

    if (value === undefined || value === null) {
      return { valid: true }
    }

    // Проверка типа
    if (rules.type) {
      const typeCheck = this.checkType(value, rules.type)
      if (!typeCheck) {
        return { valid: false, error: `Expected type ${rules.type}, got ${typeof value}` }
      }
    }

    // Проверка числа
    if (rules.type === 'number' || typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        return { valid: false, error: `Value must be at least ${rules.min}` }
      }
      if (rules.max !== undefined && value > rules.max) {
        return { valid: false, error: `Value must be at most ${rules.max}` }
      }
    }

    // Проверка строки
    if (rules.type === 'string' || typeof value === 'string') {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        return { valid: false, error: `String length must be at least ${rules.minLength}` }
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        return { valid: false, error: `String length must be at most ${rules.maxLength}` }
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return { valid: false, error: 'String does not match required pattern' }
      }
    }

    // Специализированные проверки
    if (rules.email && !this.isEmail(value)) {
      return { valid: false, error: 'Invalid email format' }
    }

    if (rules.url && !this.isURL(value)) {
      return { valid: false, error: 'Invalid URL format' }
    }

    if (rules.ip && !this.isIP(value)) {
      return { valid: false, error: 'Invalid IP address' }
    }

    if (rules.uuid && !this.isUUID(value)) {
      return { valid: false, error: 'Invalid UUID format' }
    }

    // Проверки безопасности
    if (rules.noXSS && this.hasXSS(value)) {
      return { valid: false, error: 'Potential XSS attack detected' }
    }

    if (rules.noSQL && this.hasSQLInjection(value)) {
      return { valid: false, error: 'Potential SQL injection detected' }
    }

    if (rules.noPathTraversal && this.hasPathTraversal(value)) {
      return { valid: false, error: 'Potential path traversal detected' }
    }

    if (rules.noCommand && this.hasCommandInjection(value)) {
      return { valid: false, error: 'Potential command injection detected' }
    }

    // Проверка на in/not in
    if (rules.in && !rules.in.includes(value)) {
      return { valid: false, error: `Value must be one of: ${rules.in.join(', ')}` }
    }

    if (rules.notIn && rules.notIn.includes(value)) {
      return { valid: false, error: `Value must not be one of: ${rules.notIn.join(', ')}` }
    }

    return { valid: true }
  }
}

/**
 * Экземпляр валидатора (синглтон)
 */
export const validator = new Validator()