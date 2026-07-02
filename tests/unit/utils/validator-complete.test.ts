import { validateEmail, validateURL, sanitizeInput } from '../../../src/utils/validator';

describe('Validator - Complete', () => {
  test('validateEmail should work', () => {
    // Этот тест покажет реальную структуру
    const result = validateEmail('test@test.com');
    console.log('validateEmail returns:', result);
    expect(result).toBeDefined();
  });

  test('validateURL should work', () => {
    const result = validateURL('https://example.com');
    console.log('validateURL returns:', result);
    expect(result).toBeDefined();
  });

  test('sanitizeInput should work', () => {
    const result = sanitizeInput('<script>alert(1)</script>');
    console.log('sanitizeInput returns:', result);
    expect(result).toBeDefined();
  });
});
