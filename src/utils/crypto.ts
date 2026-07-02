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
   * ✅ ИСПРАВЛЕНО: обрабатываем случаи разной длины
   */
  safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }
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

  /**
   * Хеширование с солью (для паролей)
   */
  hashWithSalt(data: string, salt?: string): { hash: string; salt: string } {
    const generatedSalt = salt || crypto.randomBytes(16).toString('hex')
    const hash = crypto
      .createHash('sha256')
      .update(generatedSalt + data)
      .digest('hex')
    return { hash, salt: generatedSalt }
  }

  /**
   * Проверка пароля с солью
   */
  verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashWithSalt(password, salt)
    return computedHash === hash
  }

  /**
   * Сравнение хеша с паролем
   */
  compare(password: string, hash: string): boolean {
    const computedHash = this.hash(password)
    return computedHash === hash
  }

  /**
   * Генерация соли
   */
  generateSalt(length: number = 16): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Генерация случайного числа в диапазоне
   */
  randomInt(min: number, max: number): number {
    return crypto.randomInt(min, max + 1)
  }

  /**
   * Генерация случайной строки из набора символов
   */
  randomString(length: number = 16, charset?: string): string {
    const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const chars = charset || defaultCharset
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[crypto.randomInt(0, chars.length)]
    }
    return result
  }
}

// ============================================
// ✅ АЛИАСЫ ДЛЯ СОВМЕСТИМОСТИ С ТЕСТАМИ
// ============================================

/**
 * Алиас Crypto для совместимости с тестами
 * Тесты ожидают: new Crypto()
 */
export const Crypto = CryptoUtils

/**
 * Экземпляр по умолчанию (синглтон)
 */
export const cryptoUtil = new CryptoUtils()

/**
 * ✅ ИСПРАВЛЕНО: Привязка методов к контексту
 * Экспорт всех методов как отдельных функций для удобства
 */
export const generateNonce = cryptoUtil.generateNonce.bind(cryptoUtil)
export const generateId = cryptoUtil.generateId.bind(cryptoUtil)
export const hash = cryptoUtil.hash.bind(cryptoUtil)
export const hmac = cryptoUtil.hmac.bind(cryptoUtil)
export const encrypt = cryptoUtil.encrypt.bind(cryptoUtil)
export const decrypt = cryptoUtil.decrypt.bind(cryptoUtil)
export const safeCompare = cryptoUtil.safeCompare.bind(cryptoUtil)
export const generateToken = cryptoUtil.generateToken.bind(cryptoUtil)
export const generatePassword = cryptoUtil.generatePassword.bind(cryptoUtil)
export const hashWithSalt = cryptoUtil.hashWithSalt.bind(cryptoUtil)
export const verifyPassword = cryptoUtil.verifyPassword.bind(cryptoUtil)
export const compare = cryptoUtil.compare.bind(cryptoUtil)
export const generateSalt = cryptoUtil.generateSalt.bind(cryptoUtil)
export const randomInt = cryptoUtil.randomInt.bind(cryptoUtil)
export const randomString = cryptoUtil.randomString.bind(cryptoUtil)

// ============================================
// ✅ ЕДИНСТВЕННЫЙ ЭКСПОРТ ПО УМОЛЧАНИЮ
// ============================================

/**
 * Экспорт класса как default (для совместимости)
 */
export default CryptoUtils