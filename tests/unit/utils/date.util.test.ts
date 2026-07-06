import {
  formatDate,
  getTimestamp,
  getDuration,
  formatDuration,
  parseDate,
  isValidDate,
  startOfDay,
  endOfDay,
  daysBetween,
  addDays,
  addMonths,
  addYears
} from '../../../src/utils/date.util';

describe('Date Utils', () => {
  // ============================================
  // FORMAT DATE
  // ============================================

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T12:30:45.123Z');

    it('should format date as ISO by default', () => {
      expect(formatDate(testDate)).toBe('2024-01-15T12:30:45.123Z');
    });

    it('should format date as ISO', () => {
      expect(formatDate(testDate, 'ISO')).toBe('2024-01-15T12:30:45.123Z');
    });

    it('should format date as UTC', () => {
      expect(formatDate(testDate, 'UTC')).toBe('Mon, 15 Jan 2024 12:30:45 GMT');
    });

    it('should format date as DATE', () => {
      expect(formatDate(testDate, 'DATE')).toBe('Mon Jan 15 2024');
    });

    it('should format date as TIME (check format, not exact value)', () => {
      const result = formatDate(testDate, 'TIME');
      expect(result).toContain('30:45');
      expect(result).toContain('GMT');
    });

    it('should format date as LOCALE', () => {
      const result = formatDate(testDate, 'LOCALE');
      expect(result).toContain('2024');
      expect(result).toContain('30:45');
    });

    it('should format date as LOCALE_DATE', () => {
      const result = formatDate(testDate, 'LOCALE_DATE');
      expect(result).toMatch(/\d{1,2}[\/\.]\d{1,2}[\/\.]\d{4}/);
    });

    it('should format date as LOCALE_TIME', () => {
      const result = formatDate(testDate, 'LOCALE_TIME');
      expect(result).toContain('30:45');
    });

    it('should use ISO format for unknown format', () => {
      expect(formatDate(testDate, 'UNKNOWN')).toBe('2024-01-15T12:30:45.123Z');
    });

    it('should handle string date', () => {
      expect(formatDate('2024-01-15T12:30:45.123Z')).toBe('2024-01-15T12:30:45.123Z');
    });

    it('should handle number date (timestamp)', () => {
      const timestamp = testDate.getTime();
      expect(formatDate(timestamp)).toBe('2024-01-15T12:30:45.123Z');
    });

    it('should throw error for invalid date', () => {
      expect(() => formatDate('invalid')).toThrow('Invalid date');
      expect(() => formatDate(NaN)).toThrow('Invalid date');
    });
  });

  // ============================================
  // GET TIMESTAMP
  // ============================================

  describe('getTimestamp', () => {
    it('should return current timestamp as ISO string', () => {
      const now = Date.now();
      const result = getTimestamp();
      const parsed = new Date(result);
      expect(parsed.getTime()).toBeGreaterThanOrEqual(now - 100);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  // ============================================
  // GET DURATION
  // ============================================

  describe('getDuration', () => {
    it('should return elapsed time in milliseconds', () => {
      const start = Date.now() - 1000;
      const duration = getDuration(start);
      expect(duration).toBeGreaterThanOrEqual(1000);
      expect(duration).toBeLessThan(1100);
    });

    it('should return 0 for current time', () => {
      const start = Date.now();
      const duration = getDuration(start);
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================
  // FORMAT DURATION
  // ============================================

  describe('formatDuration', () => {
    it('should format duration in seconds', () => {
      expect(formatDuration(5000)).toBe('5s');
      expect(formatDuration(1234)).toBe('1s');
    });

    it('should format duration in minutes and seconds', () => {
      expect(formatDuration(65000)).toBe('1m 5s');
      expect(formatDuration(123000)).toBe('2m 3s');
    });

    it('should format duration in hours and minutes', () => {
      expect(formatDuration(3665000)).toBe('1h 1m');
      expect(formatDuration(7200000)).toBe('2h 0m');
    });

    it('should format duration in days and hours', () => {
      expect(formatDuration(90000000)).toBe('1d 1h');
      expect(formatDuration(172800000)).toBe('2d 0h');
    });

    it('should handle 0 duration', () => {
      expect(formatDuration(0)).toBe('0s');
    });

    it('should handle negative duration', () => {
      expect(formatDuration(-1000)).toBe('-1s');
    });
  });

  // ============================================
  // PARSE DATE
  // ============================================

  describe('parseDate', () => {
    const testDate = new Date('2024-01-15T12:30:45.123Z');

    it('should return Date object for Date input', () => {
      const result = parseDate(testDate);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDate.getTime());
    });

    it('should parse string date', () => {
      const result = parseDate('2024-01-15T12:30:45.123Z');
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDate.getTime());
    });

    it('should parse number timestamp', () => {
      const timestamp = testDate.getTime();
      const result = parseDate(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(timestamp);
    });
  });

  // ============================================
  // IS VALID DATE
  // ============================================

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('2024-01-15T12:30:45.123Z')).toBe(true);
      expect(isValidDate(Date.now())).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('')).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate(NaN)).toBe(false);
    });
  });

  // ============================================
  // START OF DAY
  // ============================================

  describe('startOfDay', () => {
    it('should return start of day', () => {
      const date = new Date('2024-01-15T12:30:45.123Z');
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });

    it('should not modify original date', () => {
      const date = new Date('2024-01-15T12:30:45.123Z');
      const originalTime = date.getTime();
      startOfDay(date);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  // ============================================
  // END OF DAY
  // ============================================

  describe('endOfDay', () => {
    it('should return end of day', () => {
      const date = new Date('2024-01-15T12:30:45.123Z');
      const result = endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });

    it('should not modify original date', () => {
      const date = new Date('2024-01-15T12:30:45.123Z');
      const originalTime = date.getTime();
      endOfDay(date);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  // ============================================
  // DAYS BETWEEN
  // ============================================

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-15');
      expect(daysBetween(date1, date2)).toBe(14);
    });

    it('should return 0 for same date', () => {
      const date = new Date('2024-01-15');
      expect(daysBetween(date, date)).toBe(0);
    });

    it('should return absolute value', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-01');
      expect(daysBetween(date1, date2)).toBe(14);
    });

    it('should handle dates with time components', () => {
      const date1 = new Date('2024-01-01T23:59:59');
      const date2 = new Date('2024-01-15T00:00:01');
      expect(daysBetween(date1, date2)).toBe(14);
    });
  });

  // ============================================
  // ADD DAYS
  // ============================================

  describe('addDays', () => {
    it('should add days to date', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
      expect(result.getMonth()).toBe(0);
      expect(result.getFullYear()).toBe(2024);
    });

    it('should handle negative days', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    it('should handle month overflow', () => {
      const date = new Date('2024-01-30');
      const result = addDays(date, 5);
      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(4);
    });

    it('should not modify original date', () => {
      const date = new Date('2024-01-15');
      const originalTime = date.getTime();
      addDays(date, 5);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  // ============================================
  // ADD MONTHS
  // ============================================

  describe('addMonths', () => {
    it('should add months to date', () => {
      const date = new Date('2024-01-15');
      const result = addMonths(date, 2);
      expect(result.getMonth()).toBe(2);
      expect(result.getFullYear()).toBe(2024);
    });

    it('should handle negative months', () => {
      const date = new Date('2024-03-15');
      const result = addMonths(date, -2);
      expect(result.getMonth()).toBe(0);
    });

    it('should handle year overflow', () => {
      const date = new Date('2024-11-15');
      const result = addMonths(date, 3);
      expect(result.getMonth()).toBe(1);
      expect(result.getFullYear()).toBe(2025);
    });

    it('should handle month end edge cases', () => {
      const date = new Date('2024-01-31');
      const result = addMonths(date, 1);
      // Проверяем только что результат - валидная дата
      expect(result).toBeInstanceOf(Date);
      expect(isValidDate(result)).toBe(true);
    });

    it('should not modify original date', () => {
      const date = new Date('2024-01-15');
      const originalTime = date.getTime();
      addMonths(date, 2);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  // ============================================
  // ADD YEARS
  // ============================================

  describe('addYears', () => {
    it('should add years to date', () => {
      const date = new Date('2024-01-15');
      const result = addYears(date, 2);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });

    it('should handle negative years', () => {
      const date = new Date('2024-01-15');
      const result = addYears(date, -2);
      expect(result.getFullYear()).toBe(2022);
    });

    it('should handle leap year edge cases', () => {
      const date = new Date('2024-02-29');
      const result = addYears(date, 1);
      // Проверяем только что результат - валидная дата
      expect(result).toBeInstanceOf(Date);
      expect(isValidDate(result)).toBe(true);
    });

    it('should not modify original date', () => {
      const date = new Date('2024-01-15');
      const originalTime = date.getTime();
      addYears(date, 2);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  // ============================================
  // ИНТЕГРАЦИОННЫЕ ТЕСТЫ
  // ============================================

  describe('integration', () => {
    it('should handle full date workflow', () => {
      const date = new Date('2024-01-15T12:30:45.123Z');
      
      const formatted = formatDate(date, 'DATE');
      expect(formatted).toBe('Mon Jan 15 2024');
      
      const newDate = addDays(date, 5);
      expect(formatDate(newDate, 'DATE')).toBe('Sat Jan 20 2024');
      
      const diff = daysBetween(date, newDate);
      expect(diff).toBe(5);
      
      const start = startOfDay(newDate);
      expect(start.getHours()).toBe(0);
      
      const end = endOfDay(newDate);
      expect(end.getHours()).toBe(23);
      
      expect(isValidDate(date)).toBe(true);
      expect(isValidDate('invalid')).toBe(false);
    });

    it('should handle duration formatting', () => {
      const start = Date.now();
      const duration = getDuration(start);
      const formatted = formatDuration(duration);
      expect(formatted).toMatch(/^\d+[smhd]\s?\d*[smhd]?$/);
    });

    it('should parse and format dates', () => {
      const dateStr = '2024-01-15T12:30:45.123Z';
      const parsed = parseDate(dateStr);
      expect(parsed).toBeInstanceOf(Date);
      expect(formatDate(parsed)).toBe(dateStr);
    });
  });
});
