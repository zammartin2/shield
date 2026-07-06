import { Validator } from '../../../src/utils/validator';

describe('Validator - Fixed', () => {
  let validator: Validator;

  beforeEach(() => {
    validator = new Validator();
  });

  test('should validate email', () => {
    expect(validator.isEmail('test@test.com')).toBe(true);
    expect(validator.isEmail('invalid')).toBe(false);
  });

  test('should validate URL', () => {
    expect(validator.isURL('https://example.com')).toBe(true);
    expect(validator.isURL('invalid')).toBe(false);
  });

  test('should validate IPv4', () => {
    expect(validator.isIPv4('192.168.1.1')).toBe(true);
    expect(validator.isIPv4('invalid')).toBe(false);
  });

  test('should validate IPv6', () => {
    expect(validator.isIPv6('::1')).toBe(true);
  });
});
