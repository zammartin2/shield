import { CryptoUtils, cryptoUtil, Crypto, generateNonce, generateId, hash, hmac, encrypt, decrypt, safeCompare, generateToken, generatePassword, hashWithSalt, verifyPassword, randomInt, randomString, compare, generateSalt } from '../../../src/utils/crypto'

describe('Crypto Utils', () => {
  describe('CryptoUtils class', () => {
    it('should create instance', () => {
      const crypto = new CryptoUtils()
      expect(crypto).toBeInstanceOf(CryptoUtils)
    })

    it('should have all methods', () => {
      const crypto = new CryptoUtils()
      expect(crypto.generateNonce).toBeDefined()
      expect(crypto.generateId).toBeDefined()
      expect(crypto.hash).toBeDefined()
      expect(crypto.hmac).toBeDefined()
      expect(crypto.encrypt).toBeDefined()
      expect(crypto.decrypt).toBeDefined()
      expect(crypto.safeCompare).toBeDefined()
      expect(crypto.generateToken).toBeDefined()
      expect(crypto.generatePassword).toBeDefined()
      expect(crypto.hashWithSalt).toBeDefined()
      expect(crypto.verifyPassword).toBeDefined()
      expect(crypto.compare).toBeDefined()
      expect(crypto.generateSalt).toBeDefined()
      expect(crypto.randomInt).toBeDefined()
      expect(crypto.randomString).toBeDefined()
    })
  })

  describe('cryptoUtil singleton', () => {
    it('should be instance of CryptoUtils', () => {
      expect(cryptoUtil).toBeInstanceOf(CryptoUtils)
    })

    it('should have all methods', () => {
      expect(cryptoUtil.generateNonce).toBeDefined()
      expect(cryptoUtil.generateId).toBeDefined()
      expect(cryptoUtil.hash).toBeDefined()
    })
  })

  describe('Crypto alias', () => {
    it('should be same as CryptoUtils', () => {
      expect(Crypto).toBe(CryptoUtils)
    })

    it('should create instance', () => {
      const crypto = new Crypto()
      expect(crypto).toBeInstanceOf(CryptoUtils)
    })
  })

  describe('generateNonce', () => {
    it('should generate nonce with default length', () => {
      const nonce = generateNonce()
      expect(nonce).toBeDefined()
      expect(typeof nonce).toBe('string')
      // Base64 length: 32 bytes = 44 chars with padding
      expect(nonce.length).toBe(44)
    })

    it('should generate nonce with custom length', () => {
      const nonce = generateNonce(16)
      expect(nonce).toBeDefined()
      expect(typeof nonce).toBe('string')
      // Base64 length: 16 bytes = 24 chars with padding
      expect(nonce.length).toBe(24)
    })

    it('should generate different nonces', () => {
      const nonce1 = generateNonce()
      const nonce2 = generateNonce()
      expect(nonce1).not.toBe(nonce2)
    })
  })

  describe('generateId', () => {
    it('should generate UUID', () => {
      const id = generateId()
      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('should generate different IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('hash', () => {
    it('should hash string with default algorithm', () => {
      const result = hash('test')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toHaveLength(64) // sha256 = 64 hex chars
    })

    it('should hash string with custom algorithm', () => {
      const result = hash('test', 'sha512')
      expect(result).toBeDefined()
      expect(result).toHaveLength(128) // sha512 = 128 hex chars
    })

    it('should produce same hash for same input', () => {
      const result1 = hash('test')
      const result2 = hash('test')
      expect(result1).toBe(result2)
    })

    it('should produce different hash for different input', () => {
      const result1 = hash('test1')
      const result2 = hash('test2')
      expect(result1).not.toBe(result2)
    })
  })

  describe('hmac', () => {
    it('should generate HMAC with default algorithm', () => {
      const result = hmac('test', 'secret')
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toHaveLength(64) // sha256 = 64 hex chars
    })

    it('should generate HMAC with custom algorithm', () => {
      const result = hmac('test', 'secret', 'sha512')
      expect(result).toBeDefined()
      expect(result).toHaveLength(128) // sha512 = 128 hex chars
    })

    it('should produce same HMAC for same input', () => {
      const result1 = hmac('test', 'secret')
      const result2 = hmac('test', 'secret')
      expect(result1).toBe(result2)
    })

    it('should produce different HMAC for different secret', () => {
      const result1 = hmac('test', 'secret1')
      const result2 = hmac('test', 'secret2')
      expect(result1).not.toBe(result2)
    })
  })

  describe('encrypt/decrypt', () => {
    const key = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' // 32 bytes hex

    it('should encrypt and decrypt data', () => {
      const originalData = 'Hello, World!'
      const encrypted = encrypt(originalData, key)
      expect(encrypted).toBeDefined()
      expect(typeof encrypted).toBe('string')
      expect(encrypted).not.toBe(originalData)

      const decrypted = decrypt(encrypted, key)
      expect(decrypted).toBe(originalData)
    })

    it('should encrypt and decrypt complex data', () => {
      const originalData = JSON.stringify({ foo: 'bar', num: 123 })
      const encrypted = encrypt(originalData, key)
      const decrypted = decrypt(encrypted, key)
      expect(decrypted).toBe(originalData)
    })

    it('should produce different encrypted values for same data', () => {
      const data = 'test'
      const encrypted1 = encrypt(data, key)
      const encrypted2 = encrypt(data, key)
      expect(encrypted1).not.toBe(encrypted2)
    })

    it('should throw error on invalid key', () => {
      const invalidKey = 'invalid'
      expect(() => encrypt('test', invalidKey)).toThrow()
    })
  })

  describe('safeCompare', () => {
    it('should return true for equal strings', () => {
      expect(safeCompare('test', 'test')).toBe(true)
    })

    it('should return false for different strings', () => {
      expect(safeCompare('test', 'test2')).toBe(false)
    })

    it('should return false for empty vs non-empty', () => {
      expect(safeCompare('', 'test')).toBe(false)
    })

    it('should return true for empty vs empty', () => {
      expect(safeCompare('', '')).toBe(true)
    })
  })

  describe('generateToken', () => {
    it('should generate token with default length', () => {
      const token = generateToken()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token).toHaveLength(64) // 32 bytes = 64 hex chars
    })

    it('should generate token with custom length', () => {
      const token = generateToken(16)
      expect(token).toBeDefined()
      expect(token).toHaveLength(32) // 16 bytes = 32 hex chars
    })

    it('should generate different tokens', () => {
      const token1 = generateToken()
      const token2 = generateToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('generatePassword', () => {
    it('should generate password with default length', () => {
      const password = generatePassword()
      expect(password).toBeDefined()
      expect(typeof password).toBe('string')
      expect(password.length).toBe(16)
    })

    it('should generate password with custom length', () => {
      const password = generatePassword(20)
      expect(password).toBeDefined()
      expect(password.length).toBe(20)
    })

    it('should contain special characters', () => {
      const password = generatePassword(50)
      const specialChars = '!@#$%^&*()_+-='
      let hasSpecial = false
      for (const char of password) {
        if (specialChars.includes(char)) {
          hasSpecial = true
          break
        }
      }
      expect(hasSpecial).toBe(true)
    })

    it('should generate different passwords', () => {
      const pass1 = generatePassword()
      const pass2 = generatePassword()
      expect(pass1).not.toBe(pass2)
    })
  })

  describe('hashWithSalt', () => {
    it('should generate hash with salt', () => {
      const result = hashWithSalt('password')
      expect(result).toBeDefined()
      expect(result.hash).toBeDefined()
      expect(result.salt).toBeDefined()
      expect(result.hash).toHaveLength(64)
      expect(result.salt).toHaveLength(32) // 16 bytes = 32 hex chars
    })

    it('should generate hash with provided salt', () => {
      const salt = '0123456789abcdef0123456789abcdef'
      const result = hashWithSalt('password', salt)
      expect(result.salt).toBe(salt)
    })

    it('should produce same hash with same salt', () => {
      const salt = '0123456789abcdef0123456789abcdef'
      const result1 = hashWithSalt('password', salt)
      const result2 = hashWithSalt('password', salt)
      expect(result1.hash).toBe(result2.hash)
    })

    it('should produce different hash with different salt', () => {
      const salt1 = '0123456789abcdef0123456789abcdef'
      const salt2 = 'fedcba9876543210fedcba9876543210'
      const result1 = hashWithSalt('password', salt1)
      const result2 = hashWithSalt('password', salt2)
      expect(result1.hash).not.toBe(result2.hash)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', () => {
      const { hash, salt } = hashWithSalt('password')
      expect(verifyPassword('password', hash, salt)).toBe(true)
    })

    it('should reject incorrect password', () => {
      const { hash, salt } = hashWithSalt('password')
      expect(verifyPassword('wrong', hash, salt)).toBe(false)
    })

    it('should reject empty password', () => {
      const { hash, salt } = hashWithSalt('password')
      expect(verifyPassword('', hash, salt)).toBe(false)
    })
  })

  describe('compare', () => {
    it('should return true for matching hash', () => {
      const hash1 = hash('password')
      expect(compare('password', hash1)).toBe(true)
    })

    it('should return false for non-matching hash', () => {
      const hash1 = hash('password')
      expect(compare('wrong', hash1)).toBe(false)
    })

    it('should return false for empty password', () => {
      const hash1 = hash('password')
      expect(compare('', hash1)).toBe(false)
    })
  })

  describe('generateSalt', () => {
    it('should generate salt with default length', () => {
      const salt = generateSalt()
      expect(salt).toBeDefined()
      expect(typeof salt).toBe('string')
      expect(salt).toHaveLength(32) // 16 bytes = 32 hex chars
    })

    it('should generate salt with custom length', () => {
      const salt = generateSalt(8)
      expect(salt).toBeDefined()
      expect(salt).toHaveLength(16) // 8 bytes = 16 hex chars
    })

    it('should generate different salts', () => {
      const salt1 = generateSalt()
      const salt2 = generateSalt()
      expect(salt1).not.toBe(salt2)
    })
  })

  describe('randomInt', () => {
    it('should generate number within range', () => {
      const min = 1
      const max = 10
      for (let i = 0; i < 100; i++) {
        const num = randomInt(min, max)
        expect(num).toBeGreaterThanOrEqual(min)
        expect(num).toBeLessThanOrEqual(max)
      }
    })

    it('should handle min = max', () => {
      const num = randomInt(5, 5)
      expect(num).toBe(5)
    })

    it('should generate different numbers', () => {
      const results = new Set()
      for (let i = 0; i < 50; i++) {
        results.add(randomInt(1, 100))
      }
      expect(results.size).toBeGreaterThan(1)
    })
  })

  describe('randomString', () => {
    it('should generate string with default length', () => {
      const str = randomString()
      expect(str).toBeDefined()
      expect(typeof str).toBe('string')
      expect(str).toHaveLength(16)
    })

    it('should generate string with custom length', () => {
      const str = randomString(10)
      expect(str).toHaveLength(10)
    })

    it('should use custom charset', () => {
      const charset = 'ABC'
      const str = randomString(20, charset)
      for (const char of str) {
        expect(charset).toContain(char)
      }
    })

    it('should generate different strings', () => {
      const str1 = randomString()
      const str2 = randomString()
      expect(str1).not.toBe(str2)
    })
  })

  describe('Integration tests', () => {
    it('should work together: hashWithSalt + verifyPassword', () => {
      const password = 'mySecurePassword123!'
      const { hash, salt } = hashWithSalt(password)
      
      // Correct password
      expect(verifyPassword(password, hash, salt)).toBe(true)
      
      // Wrong password
      expect(verifyPassword('wrongPassword', hash, salt)).toBe(false)
    })

    it('should work together: encrypt + decrypt', () => {
      const key = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      const data = 'Sensitive data'
      
      const encrypted = encrypt(data, key)
      const decrypted = decrypt(encrypted, key)
      
      expect(decrypted).toBe(data)
    })

    it('should work together: hash + compare', () => {
      const password = 'testPassword'
      const hashed = hash(password)
      
      expect(compare(password, hashed)).toBe(true)
      expect(compare('wrong', hashed)).toBe(false)
    })

    it('should work together: generateToken + safeCompare', () => {
      const token1 = generateToken()
      const token2 = generateToken()
      
      expect(safeCompare(token1, token1)).toBe(true)
      expect(safeCompare(token1, token2)).toBe(false)
    })
  })
})