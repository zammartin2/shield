// ============================================
// CRYPTO — Криптографические утилиты
// ============================================

import crypto from 'crypto'

export class CryptoUtils {
  /**
   * Генерация nonce
   */
  generateNonce(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64')
  }

  /**
   * Генерация UUID
   */
  generateId(): string {
    return crypto.randomUUID()
  }

  /**
   * Хеширование
   */
  hash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex')
  }

  /**
   * HMAC
   */
  hmac(data: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex')
  }

  /**
   * Шифрование
   */
  encrypt(data: string, key: string, algorithm: string = 'aes-256-cbc'): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  }

  /**
   * Дешифрование
   */
  decrypt(data: string, key: string, algorithm: string = 'aes-256-cbc'): string {
    const parts = data.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  /**
   * Сравнение строк с защитой от timing attacks
   */
  safeCompare(a: string, b: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(a),
      Buffer.from(b)
    )
  }

  /**
   * Генерация случайного токена
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Генерация безопасного пароля
   */
  generatePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-='
    let password = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length)
      password += charset[randomIndex]
    }
    return password
  }
}