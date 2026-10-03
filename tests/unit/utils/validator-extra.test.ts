import { Validator } from '../../../src/utils/validator';

describe('Validator - Extra Coverage', () => {
  let validatorInstance: Validator;

  beforeEach(() => {
    validatorInstance = new Validator();
  });

  // ============================================
  // isIPv6 — edge forms
  // ============================================

  describe('isIPv6 - edge forms', () => {
    it('should accept ::-prefixed form with multiple groups', () => {
      expect(validatorInstance.isIPv6('::1:2')).toBe(true);
      expect(validatorInstance.isIPv6('::abcd')).toBe(true);
      expect(validatorInstance.isIPv6('::dead:beef')).toBe(true);
    });

    it('should accept trailing-:: form with a single group', () => {
      expect(validatorInstance.isIPv6('fe80::')).toBe(true);
      expect(validatorInstance.isIPv6('2001::')).toBe(true);
    });

    it('should reject IPv4-mapped ::ffff: form', () => {
      expect(validatorInstance.isIPv6('::ffff:192.0.2.1')).toBe(false);
    });

    it('should reject IPv4-mapped ::ffff: form with out-of-range octets', () => {
      expect(validatorInstance.isIPv6('::ffff:999.0.2.1')).toBe(false);
    });
  });

  // ============================================
  // validateSchema — rule failures
  // ============================================

  describe('validateSchema - rule failures', () => {
    it('should report missing required field', () => {
      const result = validatorInstance.validateSchema({}, { name: { required: true } });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['name is required']);
    });

    it('should skip optional field that is absent', () => {
      const result = validatorInstance.validateSchema({}, { nickname: { type: 'string' } });
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should report type mismatch', () => {
      const result = validatorInstance.validateSchema({ age: 'old' }, { age: { type: 'number' } });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['age must be of type number']);
    });

    it('should report pattern mismatch', () => {
      const result = validatorInstance.validateSchema(
        { code: 'abc' },
        { code: { pattern: /^[0-9]+$/ } }
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['code does not match pattern /^[0-9]+$/']);
    });

    it('should accept value that matches pattern', () => {
      const result = validatorInstance.validateSchema(
        { code: '123' },
        { code: { pattern: /^[0-9]+$/ } }
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should report maxLength exceeded', () => {
      const result = validatorInstance.validateSchema(
        { name: 'abcdefg' },
        { name: { maxLength: 5 } }
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['name must be at most 5 characters']);
    });

    it('should accept value within maxLength', () => {
      const result = validatorInstance.validateSchema(
        { name: 'abc' },
        { name: { maxLength: 5 } }
      );
      expect(result.valid).toBe(true);
    });

    it('should report max exceeded', () => {
      const result = validatorInstance.validateSchema({ age: 150 }, { age: { max: 99 } });
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['age must be at most 99']);
    });

    it('should report SQL injection payload when noSQL rule is set', () => {
      const result = validatorInstance.validateSchema(
        { input: '1;--' },
        { input: { noSQL: true } }
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['input contains potential SQL injection']);
    });

    it('should accept safe payload when noSQL rule is set', () => {
      const result = validatorInstance.validateSchema(
        { input: 'safe value' },
        { input: { noSQL: true } }
      );
      expect(result.valid).toBe(true);
    });
  });

  // ============================================
  // checkType — via validateSchema
  // ============================================

  describe('validateSchema - checkType coverage', () => {
    it('should validate boolean type', () => {
      expect(validatorInstance.validateSchema({ flag: true }, { flag: { type: 'boolean' } }).valid).toBe(true);
      expect(validatorInstance.validateSchema({ flag: 'yes' }, { flag: { type: 'boolean' } })).toEqual({
        valid: false,
        errors: ['flag must be of type boolean']
      });
    });

    it('should validate object type', () => {
      expect(validatorInstance.validateSchema({ meta: { a: 1 } }, { meta: { type: 'object' } }).valid).toBe(true);
      expect(validatorInstance.validateSchema({ meta: [] }, { meta: { type: 'object' } })).toEqual({
        valid: false,
        errors: ['meta must be of type object']
      });
    });

    it('should validate array type', () => {
      expect(validatorInstance.validateSchema({ tags: [] }, { tags: { type: 'array' } }).valid).toBe(true);
      expect(validatorInstance.validateSchema({ tags: {} }, { tags: { type: 'array' } }).valid).toBe(false);
    });

    it('should reject non-null value for null type', () => {
      expect(validatorInstance.validateSchema({ f: 5 }, { f: { type: 'null' } })).toEqual({
        valid: false,
        errors: ['f must be of type null']
      });
    });

    it('should reject defined value for undefined type', () => {
      expect(validatorInstance.validateSchema({ f: 5 }, { f: { type: 'undefined' } })).toEqual({
        valid: false,
        errors: ['f must be of type undefined']
      });
    });

    it('should accept any value for any type', () => {
      expect(validatorInstance.validateSchema({ f: 'whatever' }, { f: { type: 'any' } }).valid).toBe(true);
      expect(validatorInstance.validateSchema({ f: 42 }, { f: { type: 'any' } }).valid).toBe(true);
    });

    it('should reject unknown type name', () => {
      expect(validatorInstance.validateSchema({ f: 'x' }, { f: { type: 'wat' } })).toEqual({
        valid: false,
        errors: ['f must be of type wat']
      });
    });
  });

  // ============================================
  // isSafe — detectors past XSS/SQL
  // ============================================

  describe('isSafe - attack detectors', () => {
    it('should detect NoSQL injection', () => {
      expect(validatorInstance.isSafe('$gt: 1')).toBe(false);
    });

    it('should detect path traversal', () => {
      expect(validatorInstance.isSafe('../etc/passwd')).toBe(false);
    });

    it('should detect command injection', () => {
      expect(validatorInstance.isSafe('; rm -rf /')).toBe(false);
    });

    it('should detect SSRF', () => {
      expect(validatorInstance.isSafe('http://localhost')).toBe(false);
    });

    it('should detect XXE', () => {
      expect(validatorInstance.isSafe('<!DOCTYPE foo [<!ENTITY x SYSTEM "x">]>')).toBe(false);
    });

    it('should detect LDAP injection', () => {
      expect(validatorInstance.isSafe('(uid=*)')).toBe(false);
    });

    it('should detect RCE', () => {
      expect(validatorInstance.isSafe('system(1)')).toBe(false);
    });
  });

  // ============================================
  // validateParam — remaining branches
  // ============================================

  describe('validateParam - required and security branches', () => {
    it('should report required error for null value', () => {
      const result = validatorInstance.validateParam(null, { required: true });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Value is required');
    });

    it('should accept null value when not required', () => {
      expect(validatorInstance.validateParam(null, {})).toEqual({ valid: true });
    });

    it('should accept undefined value when not required', () => {
      expect(validatorInstance.validateParam(undefined, {})).toEqual({ valid: true });
    });

    it('should report command injection when noCommand rule is set', () => {
      const result = validatorInstance.validateParam('; rm -rf /', { noCommand: true });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Potential command injection detected');
    });

    it('should accept safe value when noCommand rule is set', () => {
      const result = validatorInstance.validateParam('hello', { noCommand: true });
      expect(result.valid).toBe(true);
    });
  });
});
