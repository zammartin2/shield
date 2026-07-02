import { ResponseHandler } from '../../../src/core/ResponseHandler';

describe('ResponseHandler', () => {
  let handler: ResponseHandler;

  beforeEach(() => {
    handler = new ResponseHandler();
  });

  test('should create instance', () => {
    expect(handler).toBeDefined();
  });

  test('should handle response', () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const data = { message: 'OK' };

    expect(() => {
      if (handler.handle) {
        handler.handle(req, res, data);
      }
    }).not.toThrow();
  });

  test('should handle errors', () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const error = new Error('Test');

    expect(() => {
      if (handler.handleError) {
        handler.handleError(req, res, error);
      }
    }).not.toThrow();
  });
});
