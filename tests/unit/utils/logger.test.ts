import { Logger, defaultLogger } from '../../../src/utils/logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================
  // КОНСТРУКТОР
  // ============================================

  describe('constructor', () => {
    it('should create instance with default options', () => {
      expect(logger).toBeInstanceOf(Logger);
      expect(logger.getLevel()).toBe('info');
      expect((logger as any).format).toBe('json');
      expect((logger as any).transports).toEqual([{ type: 'console', enabled: true }]);
    });

    it('should create instance with custom options', () => {
      const customLogger = new Logger({
        level: 'debug',
        format: 'text',
        transports: [
          { type: 'console', enabled: true },
          { type: 'file', enabled: true }
        ]
      });
      
      expect(customLogger.getLevel()).toBe('debug');
      expect((customLogger as any).format).toBe('text');
      expect((customLogger as any).transports).toHaveLength(2);
    });

    it('should handle empty transports', () => {
      const customLogger = new Logger({ transports: [] });
      expect((customLogger as any).transports).toEqual([]);
    });
  });

  // ============================================
  // DEBUG
  // ============================================

  describe('debug', () => {
    it('should log debug message when level is debug', () => {
      const debugLogger = new Logger({ level: 'debug' });
      debugLogger.debug('Debug message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔍')
      );
    });

    it('should not log debug when level is info', () => {
      logger.debug('Debug message');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should log debug with data', () => {
      const debugLogger = new Logger({ level: 'debug' });
      debugLogger.debug('Debug message', { test: 'data' });
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  // ============================================
  // INFO
  // ============================================

  describe('info', () => {
    it('should log info message', () => {
      logger.info('Info message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('ℹ️')
      );
    });

    it('should log info with data', () => {
      logger.info('Info message', { test: 'data' });
      
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should not log info when level is warn', () => {
      const warnLogger = new Logger({ level: 'warn' });
      warnLogger.info('Info message');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // WARN
  // ============================================

  describe('warn', () => {
    it('should log warn message', () => {
      logger.warn('Warn message');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('⚠️')
      );
    });

    it('should log warn with data', () => {
      logger.warn('Warn message', { test: 'data' });
      
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should not log warn when level is error', () => {
      const errorLogger = new Logger({ level: 'error' });
      errorLogger.warn('Warn message');
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // ERROR
  // ============================================

  describe('error', () => {
    it('should log error message', () => {
      logger.error('Error message');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌')
      );
    });

    it('should log error with data', () => {
      logger.error('Error message', { test: 'data' });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  // ============================================
  // FATAL
  // ============================================

  describe('fatal', () => {
    it('should log fatal message', () => {
      logger.fatal('Fatal message');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌')
      );
    });

    it('should log fatal with data', () => {
      logger.fatal('Fatal message', { test: 'data' });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  // ============================================
  // LOG (PRIVATE)
  // ============================================

  describe('log (private)', () => {
    it('should skip logging when level is lower than current', () => {
      const infoLogger = new Logger({ level: 'info' });
      const debugSpy = jest.spyOn(infoLogger as any, 'sendToConsole');
      
      (infoLogger as any).log('debug', 'Debug message');
      
      expect(debugSpy).not.toHaveBeenCalled();
    });

    it('should log when level is equal or higher', () => {
      const infoLogger = new Logger({ level: 'info' });
      const sendSpy = jest.spyOn(infoLogger as any, 'sendToConsole');
      
      (infoLogger as any).log('info', 'Info message');
      
      expect(sendSpy).toHaveBeenCalled();
    });

    it('should format log entry', () => {
      const infoLogger = new Logger({ level: 'info' });
      const formatSpy = jest.spyOn(infoLogger as any, 'formatLog');
      
      (infoLogger as any).log('info', 'Test message', { test: 'data' });
      
      expect(formatSpy).toHaveBeenCalledWith('info', 'Test message', { test: 'data' });
    });

    it('should handle multiple transports', () => {
      const customLogger = new Logger({
        level: 'info',
        transports: [
          { type: 'console', enabled: true },
          { type: 'file', enabled: true },
          { type: 'remote', enabled: true }
        ]
      });
      
      const consoleSpy = jest.spyOn(customLogger as any, 'sendToConsole');
      const fileSpy = jest.spyOn(customLogger as any, 'sendToFile');
      const remoteSpy = jest.spyOn(customLogger as any, 'sendToRemote');
      
      customLogger.info('Test message');
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(fileSpy).toHaveBeenCalled();
      expect(remoteSpy).toHaveBeenCalled();
    });

    it('should skip disabled transports', () => {
      const customLogger = new Logger({
        level: 'info',
        transports: [
          { type: 'console', enabled: true },
          { type: 'file', enabled: false },
          { type: 'remote', enabled: false }
        ]
      });
      
      const consoleSpy = jest.spyOn(customLogger as any, 'sendToConsole');
      const fileSpy = jest.spyOn(customLogger as any, 'sendToFile');
      const remoteSpy = jest.spyOn(customLogger as any, 'sendToRemote');
      
      customLogger.info('Test message');
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(fileSpy).not.toHaveBeenCalled();
      expect(remoteSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // FORMAT LOG
  // ============================================

  describe('formatLog', () => {
    it('should format log as JSON', () => {
      const entry = (logger as any).formatLog('info', 'Test message', { test: 'data' });
      
      expect(entry).toEqual({
        timestamp: expect.any(String),
        level: 'info',
        message: 'Test message',
        data: { test: 'data' }
      });
    });

    it('should format log as text', () => {
      const textLogger = new Logger({ format: 'text' });
      const entry = (textLogger as any).formatLog('info', 'Test message', { test: 'data' });
      
      expect(typeof entry).toBe('string');
      expect(entry).toContain('INFO');
      expect(entry).toContain('Test message');
      expect(entry).toContain('{"test":"data"}');
    });

    it('should handle log without data', () => {
      const entry = (logger as any).formatLog('info', 'Test message');
      
      expect(entry).toEqual({
        timestamp: expect.any(String),
        level: 'info',
        message: 'Test message'
      });
    });

    it('should include timestamp', () => {
      const entry = (logger as any).formatLog('info', 'Test message');
      
      expect(entry.timestamp).toBeDefined();
      expect(new Date(entry.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  // ============================================
  // SEND TO CONSOLE
  // ============================================

  describe('sendToConsole', () => {
    it('should send debug to console.log', () => {
      const entry = 'Test entry';
      (logger as any).sendToConsole('debug', entry);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('🔍'));
    });

    it('should send info to console.log', () => {
      const entry = 'Test entry';
      (logger as any).sendToConsole('info', entry);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ℹ️'));
    });

    it('should send warn to console.warn', () => {
      const entry = 'Test entry';
      (logger as any).sendToConsole('warn', entry);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️'));
    });

    it('should send error to console.error', () => {
      const entry = 'Test entry';
      (logger as any).sendToConsole('error', entry);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('❌'));
    });

    it('should send fatal to console.error', () => {
      const entry = 'Test entry';
      (logger as any).sendToConsole('fatal', entry);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('❌'));
    });

    it('should format JSON when format is json', () => {
      const jsonLogger = new Logger({ format: 'json' });
      const entry = { test: 'data' };
      
      (jsonLogger as any).sendToConsole('info', entry);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ℹ️'));
    });
  });

  // ============================================
  // SEND TO FILE
  // ============================================

  describe('sendToFile', () => {
    it('should send to file transport', () => {
      (logger as any).sendToFile('info', { test: 'data' });
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[FILE]', { test: 'data' });
    });
  });

  // ============================================
  // SEND TO REMOTE
  // ============================================

  describe('sendToRemote', () => {
    it('should send to remote transport', () => {
      (logger as any).sendToRemote('info', { test: 'data' });
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[REMOTE]', { test: 'data' });
    });
  });

  // ============================================
  // CHILD
  // ============================================

  describe('child', () => {
    it('should create child logger with metadata', () => {
      const child = logger.child({ userId: '123', requestId: 'abc' });
      
      expect(child).toBeInstanceOf(Logger);
      expect(child.getLevel()).toBe('info');
    });

    it('should include metadata in log entries', () => {
      const child = logger.child({ userId: '123' });
      const sendSpy = jest.spyOn(child as any, 'sendToConsole');
      
      child.info('Test message', { extra: 'data' });
      
      expect(sendSpy).toHaveBeenCalled();
      const callArg = sendSpy.mock.calls[0][1];
      expect(callArg.data).toEqual({ userId: '123', extra: 'data' });
    });

    it('should inherit level from parent', () => {
      const parent = new Logger({ level: 'debug' });
      const child = parent.child({});
      
      expect(child.getLevel()).toBe('debug');
    });

    it('should inherit format from parent', () => {
      const parent = new Logger({ format: 'text' });
      const child = parent.child({});
      
      expect((child as any).format).toBe('text');
    });

    it('should inherit transports from parent', () => {
      const transports = [{ type: 'console', enabled: true }];
      const parent = new Logger({ transports });
      const child = parent.child({});
      
      expect((child as any).transports).toEqual(transports);
    });
  });

  // ============================================
  // SET LEVEL
  // ============================================

  describe('setLevel', () => {
    it('should set level', () => {
      // Создаем новый логгер с уровнем debug
      const testLogger = new Logger({ level: 'debug' });
      expect(testLogger.getLevel()).toBe('debug');
      
      // Меняем уровень
      testLogger.setLevel('warn');
      expect(testLogger.getLevel()).toBe('warn');
      
      testLogger.setLevel('error');
      expect(testLogger.getLevel()).toBe('error');
    });

    it('should throw error for invalid level', () => {
      expect(() => {
        logger.setLevel('invalid');
      }).toThrow('Invalid log level: invalid');
    });
  });

  // ============================================
  // GET LEVEL
  // ============================================

  describe('getLevel', () => {
    it('should return current level', () => {
      const testLogger = new Logger({ level: 'debug' });
      expect(testLogger.getLevel()).toBe('debug');
      
      testLogger.setLevel('warn');
      expect(testLogger.getLevel()).toBe('warn');
      
      testLogger.setLevel('error');
      expect(testLogger.getLevel()).toBe('error');
    });
  });

  // ============================================
  // DEFAULT LOGGER
  // ============================================

  describe('defaultLogger', () => {
    it('should be instance of Logger', () => {
      expect(defaultLogger).toBeInstanceOf(Logger);
    });

    it('should have default level info', () => {
      expect(defaultLogger.getLevel()).toBe('info');
    });

    it('should be usable for logging', () => {
      defaultLogger.info('Default logger test');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  // ============================================
  // ИНТЕГРАЦИОННЫЕ ТЕСТЫ
  // ============================================

  describe('integration', () => {
    it('should handle full logging workflow', () => {
      const testLogger = new Logger({ level: 'debug', format: 'json' });
      
      const consoleSpy = jest.spyOn(testLogger as any, 'sendToConsole');
      
      testLogger.debug('Debug message');
      testLogger.info('Info message');
      testLogger.warn('Warn message');
      testLogger.error('Error message');
      testLogger.fatal('Fatal message');
      
      expect(consoleSpy).toHaveBeenCalledTimes(5);
    });

    it('should filter logs by level', () => {
      const warnLogger = new Logger({ level: 'warn' });
      
      const consoleSpy = jest.spyOn(warnLogger as any, 'sendToConsole');
      
      warnLogger.debug('Debug');
      warnLogger.info('Info');
      warnLogger.warn('Warn');
      warnLogger.error('Error');
      
      // Только warn и error должны быть вызваны
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle child logger with metadata', () => {
      const parent = new Logger({ level: 'info' });
      const child = parent.child({ requestId: 'req-123' });
      
      const sendSpy = jest.spyOn(child as any, 'sendToConsole');
      
      child.info('Processing request');
      
      expect(sendSpy).toHaveBeenCalled();
      const entry = sendSpy.mock.calls[0][1];
      expect(entry.data.requestId).toBe('req-123');
    });

    it('should handle different formats', () => {
      const jsonLogger = new Logger({ format: 'json' });
      const textLogger = new Logger({ format: 'text' });
      
      const jsonSpy = jest.spyOn(jsonLogger as any, 'sendToConsole');
      const textSpy = jest.spyOn(textLogger as any, 'sendToConsole');
      
      jsonLogger.info('Test');
      textLogger.info('Test');
      
      expect(jsonSpy).toHaveBeenCalled();
      expect(textSpy).toHaveBeenCalled();
    });
  });
});
