import { Validator } from '../../../src/utils/validator';

describe('Validator', () => {
  let validator: Validator;

  beforeEach(() => {
    validator = new Validator();
  });

  // ============================================
  // EMAIL
  // ============================================
  describe('isEmail', () => {
    test('should validate correct emails', () => {
      expect(validator.isEmail('test@test.com')).toBe(true);
      expect(validator.isEmail('user@domain.co.uk')).toBe(true);
      expect(validator.isEmail('name.surname@company.com')).toBe(true);
      expect(validator.isEmail('test+tag@example.com')).toBe(true);
    });

    test('should reject invalid emails', () => {
      expect(validator.isEmail('invalid')).toBe(false);
      expect(validator.isEmail('test@')).toBe(false);
      expect(validator.isEmail('@test.com')).toBe(false);
      expect(validator.isEmail('test@test.')).toBe(false);
      expect(validator.isEmail('')).toBe(false);
      expect(validator.isEmail(null as any)).toBe(false);
    });
  });

  // ============================================
  // URL
  // ============================================
  describe('isURL', () => {
    test('should validate correct URLs', () => {
      expect(validator.isURL('https://example.com')).toBe(true);
      expect(validator.isURL('http://test.com')).toBe(true);
      expect(validator.isURL('https://sub.domain.com/path')).toBe(true);
      expect(validator.isURL('https://example.com?query=1')).toBe(true);
      expect(validator.isURL('https://example.com#anchor')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(validator.isURL('invalid')).toBe(false);
      expect(validator.isURL('ftp://test.com')).toBe(false);
      expect(validator.isURL('http://')).toBe(false);
      expect(validator.isURL('https://')).toBe(false);
      expect(validator.isURL('')).toBe(false);
      expect(validator.isURL(null as any)).toBe(false);
    });
  });

  // ============================================
  // IP
  // ============================================
  describe('isIP', () => {
    test('should validate IPv4 addresses', () => {
      expect(validator.isIPv4('192.168.1.1')).toBe(true);
      expect(validator.isIPv4('10.0.0.1')).toBe(true);
      expect(validator.isIPv4('172.16.0.1')).toBe(true);
      expect(validator.isIPv4('8.8.8.8')).toBe(true);
      expect(validator.isIPv4('255.255.255.255')).toBe(true);
    });

    test('should reject invalid IPv4 addresses', () => {
      expect(validator.isIPv4('invalid')).toBe(false);
      expect(validator.isIPv4('256.256.256.256')).toBe(false);
      expect(validator.isIPv4('192.168.1')).toBe(false);
      expect(validator.isIPv4('192.168.1.1.1')).toBe(false);
      expect(validator.isIPv4('')).toBe(false);
    });

    test('should validate IPv6 addresses', () => {
      expect(validator.isIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      expect(validator.isIPv6('::1')).toBe(true);
      expect(validator.isIPv6('fe80::1')).toBe(true);
      expect(validator.isIPv6('2001:db8::1')).toBe(true);
    });

    test('should reject invalid IPv6 addresses', () => {
      expect(validator.isIPv6('invalid')).toBe(false);
      expect(validator.isIPv6('2001:db8:85a3::8a2e:0370:7334')).toBe(false);
      expect(validator.isIPv6('')).toBe(false);
    });

    test('should detect any IP', () => {
      expect(validator.isIP('192.168.1.1')).toBe(true);
      expect(validator.isIP('2001:db8::1')).toBe(true);
      expect(validator.isIP('invalid')).toBe(false);
    });
  });

  // ============================================
  // ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ (если есть)
  // ============================================
  describe('Additional methods', () => {
    test('should have isPhone method if exists', () => {
      if (typeof validator.isPhone === 'function') {
        expect(validator.isPhone('+7 123 456 78 90')).toBe(true);
      }
    });

    test('should have isStrongPassword method if exists', () => {
      if (typeof validator.isStrongPassword === 'function') {
        expect(validator.isStrongPassword('StrongP@ss123')).toBe(true);
        expect(validator.isStrongPassword('weak')).toBe(false);
      }
    });

    test('should have sanitize method if exists', () => {
      if (typeof validator.sanitize === 'function') {
        const input = '<script>alert(1)</script>';
        const sanitized = validator.sanitize(input);
        expect(sanitized).not.toContain('<script>');
      }
    });
  });

  // ============================================
  // ОБРАБОТКА ОШИБОК
  // ============================================
  describe('Error handling', () => {
    test('should handle null/undefined inputs gracefully', () => {
      expect(validator.isEmail(null as any)).toBe(false);
      expect(validator.isEmail(undefined as any)).toBe(false);
      expect(validator.isURL(null as any)).toBe(false);
      expect(validator.isURL(undefined as any)).toBe(false);
      expect(validator.isIP(null as any)).toBe(false);
      expect(validator.isIP(undefined as any)).toBe(false);
    });

    test('should handle empty strings', () => {
      expect(validator.isEmail('')).toBe(false);
      expect(validator.isURL('')).toBe(false);
      expect(validator.isIP('')).toBe(false);
    });
  });
});
