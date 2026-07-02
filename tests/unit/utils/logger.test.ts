import { Logger } from '../../../src/utils/logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new Logger({ level: 'debug' });
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should create logger', () => {
    expect(logger).toBeDefined();
  });

  test('should log info', () => {
    logger.info('Test info message');
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  test('should log error', () => {
    logger.error('Test error message');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test('should log warn', () => {
    logger.warn('Test warning message');
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  test('should log debug', () => {
    logger.debug('Test debug message');
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  test('should handle log level', () => {
    const quietLogger = new Logger({ level: 'error' });
    quietLogger.debug('Should not be logged');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  test('should include timestamp', () => {
    logger.info('Test');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(new Date().getFullYear().toString())
    );
  });
});
