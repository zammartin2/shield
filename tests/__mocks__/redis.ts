export const createClient = jest.fn().mockReturnValue({
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
  isReady: true,
  duplicate: jest.fn().mockReturnThis()
});

export default { createClient };
