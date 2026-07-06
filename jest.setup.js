// jest.setup.js
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Убираем все моки для express, чтобы использовать реальный модуль
// jest.unmock('express');

// Мок для redis
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(60),
    on: jest.fn(),
    isOpen: true,
    isReady: true
  })
}));

// Мок для winston
jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis()
  }),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    prettyPrint: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

// Мок для dotenv
jest.mock('dotenv', () => ({
  config: jest.fn().mockReturnValue({ parsed: { NODE_ENV: 'test' } })
}));

// Мок для uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-1234')
}));

// НЕ мокаем express - используем реальный
// jest.mock('express');

jest.setTimeout(10000);
