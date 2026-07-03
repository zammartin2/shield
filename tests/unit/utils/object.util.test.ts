import {
  deepMerge,
  getByPath,
  setByPath,
  deleteByPath,
  hasByPath,
  deepClone,
  isEmpty,
  pick,
  omit,
  objectToQueryString,
  queryStringToObject,
  cleanObject,
  sortKeys
} from '../../../src/utils/object.util';

describe('Object Utils', () => {
  // ============================================
  // DEEP MERGE
  // ============================================

  describe('deepMerge', () => {
    it('should merge two objects', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      const result = deepMerge(obj1, obj2);
      
      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4
      });
    });

    it('should merge multiple objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const obj3 = { c: 3 };
      const result = deepMerge(obj1, obj2, obj3);
      
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should override primitive values', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 10, b: { c: 20 } };
      const result = deepMerge(obj1, obj2);
      
      expect(result).toEqual({ a: 10, b: { c: 20 } });
    });

    it('should handle null/undefined objects', () => {
      const obj1 = { a: 1 };
      const result = deepMerge(obj1, null, undefined, { b: 2 });
      
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should handle empty objects', () => {
      const result = deepMerge({}, {});
      expect(result).toEqual({});
    });

    it('should not mutate original objects', () => {
      const obj1 = { a: { b: 1 } };
      const obj2 = { a: { c: 2 } };
      const result = deepMerge(obj1, obj2);
      
      expect(obj1).toEqual({ a: { b: 1 } });
      expect(obj2).toEqual({ a: { c: 2 } });
      expect(result).toEqual({ a: { b: 1, c: 2 } });
    });

    it('should handle arrays (not deep merging)', () => {
      const obj1 = { arr: [1, 2] };
      const obj2 = { arr: [3, 4] };
      const result = deepMerge(obj1, obj2);
      
      expect(result.arr).toEqual([3, 4]);
    });
  });

  // ============================================
  // GET BY PATH
  // ============================================

  describe('getByPath', () => {
    const obj = {
      a: {
        b: {
          c: 42,
          d: 'hello'
        },
        e: [1, 2, 3]
      },
      f: null,
      g: undefined
    };

    it('should get value by path', () => {
      expect(getByPath(obj, 'a.b.c')).toBe(42);
      expect(getByPath(obj, 'a.b.d')).toBe('hello');
      expect(getByPath(obj, 'a.e')).toEqual([1, 2, 3]);
    });

    it('should return undefined for non-existent path', () => {
      expect(getByPath(obj, 'a.b.x')).toBeUndefined();
      expect(getByPath(obj, 'x.y.z')).toBeUndefined();
    });

    it('should return undefined for null/undefined values', () => {
      expect(getByPath(obj, 'f')).toBeNull();
      expect(getByPath(obj, 'g')).toBeUndefined();
    });

    it('should return undefined for empty path', () => {
      expect(getByPath(obj, '')).toBeUndefined();
    });

    it('should return undefined for null/undefined object', () => {
      expect(getByPath(null, 'a.b')).toBeUndefined();
      expect(getByPath(undefined, 'a.b')).toBeUndefined();
    });

    it('should handle numeric keys', () => {
      const objWithNumeric = { '0': 'zero', '1': 'one' };
      expect(getByPath(objWithNumeric, '0')).toBe('zero');
    });
  });

  // ============================================
  // SET BY PATH
  // ============================================

  describe('setByPath', () => {
    it('should set value by path', () => {
      const obj = {};
      setByPath(obj, 'a.b.c', 42);
      expect(obj).toEqual({ a: { b: { c: 42 } } });
    });

    it('should update existing value by path', () => {
      const obj = { a: { b: { c: 42 } } };
      setByPath(obj, 'a.b.c', 100);
      expect(obj.a.b.c).toBe(100);
    });

    it('should handle empty path', () => {
      const obj = {};
      setByPath(obj, '', 'value');
      expect(obj).toEqual({});
    });

    it('should handle null/undefined object', () => {
      expect(() => {
        setByPath(null, 'a.b', 'value');
      }).not.toThrow();
    });

    it('should create intermediate objects', () => {
      const obj = {};
      setByPath(obj, 'a.b.c.d', 'deep');
      expect(obj).toEqual({ a: { b: { c: { d: 'deep' } } } });
    });

    it('should handle numeric keys', () => {
      const obj = {};
      setByPath(obj, '0.1.2', 'value');
      expect(obj).toEqual({ '0': { '1': { '2': 'value' } } });
    });
  });

  // ============================================
  // DELETE BY PATH
  // ============================================

  describe('deleteByPath', () => {
    it('should delete value by path', () => {
      const obj = { a: { b: { c: 42 } } };
      deleteByPath(obj, 'a.b.c');
      expect(obj).toEqual({ a: { b: {} } });
    });

    it('should not fail if path not exists', () => {
      const obj = { a: { b: { c: 42 } } };
      deleteByPath(obj, 'a.b.x');
      expect(obj).toEqual({ a: { b: { c: 42 } } });
    });

    it('should handle empty path', () => {
      const obj = { a: 1 };
      deleteByPath(obj, '');
      expect(obj).toEqual({ a: 1 });
    });

    it('should handle null/undefined object', () => {
      expect(() => {
        deleteByPath(null, 'a.b');
      }).not.toThrow();
    });

    it('should handle intermediate path not existing', () => {
      const obj = { a: 1 };
      deleteByPath(obj, 'b.c.d');
      expect(obj).toEqual({ a: 1 });
    });

    it('should handle numeric keys', () => {
      const obj = { '0': { '1': { '2': 'value' } } };
      deleteByPath(obj, '0.1.2');
      expect(obj).toEqual({ '0': { '1': {} } });
    });
  });

  // ============================================
  // HAS BY PATH
  // ============================================

  describe('hasByPath', () => {
    const obj = {
      a: {
        b: {
          c: 42
        }
      }
    };

    it('should return true for existing path', () => {
      expect(hasByPath(obj, 'a.b.c')).toBe(true);
    });

    it('should return false for non-existent path', () => {
      expect(hasByPath(obj, 'a.b.x')).toBe(false);
      expect(hasByPath(obj, 'x.y.z')).toBe(false);
    });

    it('should return false for null/undefined object', () => {
      expect(hasByPath(null, 'a.b')).toBe(false);
    });
  });

  // ============================================
  // DEEP CLONE
  // ============================================

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(true)).toBe(true);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, { a: 3 }];
      const clone = deepClone(arr);
      expect(clone).toEqual(arr);
      expect(clone).not.toBe(arr);
    });

    it('should clone nested objects', () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4]
        }
      };
      const clone = deepClone(obj);
      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
      expect(clone.b).not.toBe(obj.b);
    });

    it('should handle null', () => {
      expect(deepClone(null)).toBeNull();
    });

    it('should handle circular references by throwing', () => {
      const obj: any = { a: 1 };
      obj.self = obj;
      expect(() => deepClone(obj)).toThrow();
    });
  });

  // ============================================
  // IS EMPTY
  // ============================================

  describe('isEmpty', () => {
    it('should return true for null/undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
    });

    it('should return false for non-empty string', () => {
      expect(isEmpty('hello')).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('should return false for non-empty array', () => {
      expect(isEmpty([1, 2])).toBe(false);
    });

    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty object', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(42)).toBe(false);
    });

    it('should return false for boolean', () => {
      expect(isEmpty(true)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  // ============================================
  // PICK
  // ============================================

  describe('pick', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };

    it('should pick specified keys', () => {
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('should ignore non-existent keys', () => {
      expect(pick(obj, ['a', 'x', 'z'])).toEqual({ a: 1 });
    });

    it('should return empty object for empty keys', () => {
      expect(pick(obj, [])).toEqual({});
    });

    it('should not mutate original object', () => {
      const original = { ...obj };
      pick(obj, ['a']);
      expect(obj).toEqual(original);
    });
  });

  // ============================================
  // OMIT
  // ============================================

  describe('omit', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };

    it('should omit specified keys', () => {
      expect(omit(obj, ['b', 'd'])).toEqual({ a: 1, c: 3 });
    });

    it('should ignore non-existent keys', () => {
      expect(omit(obj, ['x', 'z'])).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    it('should return same object for empty keys', () => {
      expect(omit(obj, [])).toEqual(obj);
    });

    it('should not mutate original object', () => {
      const original = { ...obj };
      omit(obj, ['a']);
      expect(obj).toEqual(original);
    });
  });

  // ============================================
  // OBJECT TO QUERY STRING
  // ============================================

  describe('objectToQueryString', () => {
    it('should convert object to query string', () => {
      const obj = { a: 1, b: 'test', c: true };
      const result = objectToQueryString(obj);
      expect(result).toContain('a=1');
      expect(result).toContain('b=test');
      expect(result).toContain('c=true');
    });

    it('should skip undefined and null values', () => {
      const obj = { a: 1, b: undefined, c: null, d: 'test' };
      const result = objectToQueryString(obj);
      expect(result).toBe('a=1&d=test');
    });

    it('should return empty string for empty object', () => {
      expect(objectToQueryString({})).toBe('');
    });

    it('should handle nested objects by converting to string', () => {
      const obj = { a: { b: 1 } };
      const result = objectToQueryString(obj);
      expect(result).toContain('a=%5Bobject+Object%5D');
    });
  });

  // ============================================
  // QUERY STRING TO OBJECT
  // ============================================

  describe('queryStringToObject', () => {
    it('should convert query string to object', () => {
      const query = 'a=1&b=test&c=true';
      const result = queryStringToObject(query);
      expect(result).toEqual({ a: '1', b: 'test', c: 'true' });
    });

    it('should handle empty query string', () => {
      expect(queryStringToObject('')).toEqual({});
    });

    it('should handle query string with special characters', () => {
      const query = 'name=John%20Doe&city=New%20York';
      const result = queryStringToObject(query);
      expect(result).toEqual({ name: 'John Doe', city: 'New York' });
    });

    it('should handle multiple values for same key (last wins)', () => {
      const query = 'a=1&a=2&a=3';
      const result = queryStringToObject(query);
      expect(result).toEqual({ a: '3' });
    });
  });

  // ============================================
  // CLEAN OBJECT
  // ============================================

  describe('cleanObject', () => {
    it('should remove undefined and null values', () => {
      const obj = { a: 1, b: undefined, c: null, d: 'test' };
      const result = cleanObject(obj);
      expect(result).toEqual({ a: 1, d: 'test' });
    });

    it('should keep falsy values except undefined/null', () => {
      const obj = { a: 0, b: false, c: '', d: 'test' };
      const result = cleanObject(obj);
      expect(result).toEqual({ a: 0, b: false, c: '', d: 'test' });
    });

    it('should return empty object for all null/undefined', () => {
      const obj = { a: undefined, b: null };
      const result = cleanObject(obj);
      expect(result).toEqual({});
    });

    it('should not mutate original object', () => {
      const original = { a: 1, b: undefined };
      cleanObject(original);
      expect(original).toEqual({ a: 1, b: undefined });
    });
  });

  // ============================================
  // SORT KEYS
  // ============================================

  describe('sortKeys', () => {
    it('should sort object keys alphabetically', () => {
      const obj = { c: 3, a: 1, b: 2 };
      const result = sortKeys(obj);
      expect(Object.keys(result)).toEqual(['a', 'b', 'c']);
    });

    it('should preserve values', () => {
      const obj = { c: 3, a: 1, b: 2 };
      const result = sortKeys(obj);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should handle empty object', () => {
      expect(sortKeys({})).toEqual({});
    });

    it('should not mutate original object', () => {
      const original = { c: 3, a: 1, b: 2 };
      sortKeys(original);
      expect(Object.keys(original)).toEqual(['c', 'a', 'b']);
    });
  });

  // ============================================
  // ИНТЕГРАЦИОННЫЕ ТЕСТЫ
  // ============================================

  describe('integration', () => {
    it('should handle full object workflow', () => {
      const obj = { user: { name: 'John', age: 30, address: { city: 'NY', zip: '10001' } } };
      
      // Get by path
      expect(getByPath(obj, 'user.name')).toBe('John');
      
      // Set by path
      setByPath(obj, 'user.age', 31);
      expect(getByPath(obj, 'user.age')).toBe(31);
      
      // Has by path
      expect(hasByPath(obj, 'user.address.city')).toBe(true);
      
      // Delete by path
      deleteByPath(obj, 'user.address.zip');
      expect(hasByPath(obj, 'user.address.zip')).toBe(false);
      
      // Deep clone
      const clone = deepClone(obj);
      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
      
      // Pick and omit
      const picked = pick(obj, ['user']);
      expect(picked).toHaveProperty('user');
      
      const omitted = omit(obj, ['user']);
      expect(omitted).toEqual({});
      
      // Clean object
      const withNull = { ...obj, temp: null, extra: undefined };
      const cleaned = cleanObject(withNull);
      expect(cleaned).not.toHaveProperty('temp');
      expect(cleaned).not.toHaveProperty('extra');
      
      // Sort keys
      const unsorted = { z: 1, a: 2, m: 3 };
      const sorted = sortKeys(unsorted);
      expect(Object.keys(sorted)).toEqual(['a', 'm', 'z']);
      
      // Query string
      const query = objectToQueryString({ name: 'John', age: 30 });
      const parsed = queryStringToObject(query);
      expect(parsed.name).toBe('John');
      expect(parsed.age).toBe('30');
    });
  });
});
