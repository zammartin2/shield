import { ContextManager } from '../../../src/core/ContextManager';
import { CryptoUtils } from '../../../src/utils/crypto';

describe('ContextManager', () => {
  let contextManager: ContextManager;
  let mockReq: any;

  beforeEach(() => {
    contextManager = new ContextManager();
    mockReq = {
      ip: '127.0.0.1',
      method: 'GET',
      path: '/test',
      headers: { 'user-agent': 'test' },
      user: { id: 1 },
      session: { token: 'test' },
      connection: { remoteAddress: '192.168.1.1' }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance successfully', () => {
      expect(contextManager).toBeInstanceOf(ContextManager);
    });

    it('should initialize with empty contexts', () => {
      const stats = contextManager.getStats();
      expect(stats.total).toBe(0);
    });

    it('should create crypto instance', () => {
      const crypto = (contextManager as any).crypto;
      expect(crypto).toBeDefined();
      expect(crypto).toBeInstanceOf(CryptoUtils);
    });

    it('should set maxContexts to 10000 by default', () => {
      expect((contextManager as any).maxContexts).toBe(10000);
    });
  });

  describe('create', () => {
    it('should create context from request', () => {
      const context = contextManager.create(mockReq);
      expect(context).toBeDefined();
      expect(context.id).toMatch(/^ctx-/);
      expect(context.ip).toBe('127.0.0.1');
      expect(context.method).toBe('GET');
      expect(context.path).toBe('/test');
      expect(context.headers).toEqual({ 'user-agent': 'test' });
      expect(context.user).toEqual({ id: 1 });
      expect(context.session).toEqual({ token: 'test' });
      expect(context.startTime).toBeDefined();
      expect(context.timestamp).toBeInstanceOf(Date);
    });

    it('should handle missing ip in request', () => {
      const reqWithoutIp = { method: 'GET', path: '/' };
      const context = contextManager.create(reqWithoutIp);
      expect(context.ip).toBe('unknown');
    });

    it('should handle missing method in request', () => {
      const reqWithoutMethod = { ip: '127.0.0.1' };
      const context = contextManager.create(reqWithoutMethod);
      expect(context.method).toBe('GET');
    });

    it('should handle missing path in request', () => {
      const reqWithoutPath = { ip: '127.0.0.1', method: 'POST' };
      const context = contextManager.create(reqWithoutPath);
      expect(context.path).toBe('/');
    });

    it('should handle missing headers in request', () => {
      const reqWithoutHeaders = { ip: '127.0.0.1' };
      const context = contextManager.create(reqWithoutHeaders);
      expect(context.headers).toEqual({});
    });

    it('should handle null user in request', () => {
      const reqWithNullUser = { ...mockReq, user: null };
      const context = contextManager.create(reqWithNullUser);
      expect(context.user).toBeNull();
    });

    it('should handle null session in request', () => {
      const reqWithNullSession = { ...mockReq, session: null };
      const context = contextManager.create(reqWithNullSession);
      expect(context.session).toBeNull();
    });

    it('should handle parentId in request', () => {
      const reqWithParent = { ...mockReq, parentId: 'parent-123' };
      const context = contextManager.create(reqWithParent);
      expect(context.parentId).toBe('parent-123');
    });

    it('should store context in map', () => {
      const context = contextManager.create(mockReq);
      const retrieved = contextManager.get(context.id);
      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(context.id);
    });
  });

  describe('createContext', () => {
    it('should create context with id', () => {
      const context = contextManager.createContext('test-id');
      expect(context).toBeDefined();
      expect(context.id).toBe('test-id');
      expect(context.data).toEqual({});
      expect(context.createdAt).toBeInstanceOf(Date);
      expect(context.updatedAt).toBeInstanceOf(Date);
    });

    it('should create context with data', () => {
      const data = { user: 'test', role: 'admin' };
      const context = contextManager.createContext('test-id', data);
      expect(context.data).toEqual(data);
    });

    it('should throw error if context already exists', () => {
      contextManager.createContext('existing-id');
      expect(() => {
        contextManager.createContext('existing-id');
      }).toThrow('Context with id existing-id already exists');
    });

    it('should store context in map', () => {
      const context = contextManager.createContext('test-id');
      const retrieved = contextManager.getContext('test-id');
      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe('test-id');
    });
  });

  describe('getContext', () => {
    it('should get existing context', () => {
      contextManager.createContext('test-id', { data: 'test' });
      const context = contextManager.getContext('test-id');
      expect(context).toBeDefined();
      expect(context.data).toEqual({ data: 'test' });
    });

    it('should return undefined for non-existent context', () => {
      const context = contextManager.getContext('non-existent');
      expect(context).toBeUndefined();
    });
  });

  describe('updateContext', () => {
    it('should update existing context', () => {
      contextManager.createContext('test-id', { name: 'old' });
      const updated = contextManager.updateContext('test-id', { name: 'new', age: 25 });
      expect(updated).toBeDefined();
      expect(updated.data.name).toBe('new');
      expect(updated.data.age).toBe(25);
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('should return undefined for non-existent context', () => {
      const result = contextManager.updateContext('non-existent', { data: 'test' });
      expect(result).toBeUndefined();
    });

    it('should merge existing data with new data', () => {
      contextManager.createContext('test-id', { existing: 'value' });
      const updated = contextManager.updateContext('test-id', { new: 'data' });
      expect(updated.data.existing).toBe('value');
      expect(updated.data.new).toBe('data');
    });
  });

  describe('deleteContext', () => {
    it('should delete existing context', () => {
      contextManager.createContext('test-id');
      const result = contextManager.deleteContext('test-id');
      expect(result).toBe(true);
      expect(contextManager.getContext('test-id')).toBeUndefined();
    });

    it('should return undefined for non-existent context', () => {
      const result = contextManager.deleteContext('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllContexts', () => {
    it('should return all contexts', () => {
      contextManager.createContext('id1', { data: 1 });
      contextManager.createContext('id2', { data: 2 });
      contextManager.createContext('id3', { data: 3 });
      const contexts = contextManager.getAllContexts();
      expect(contexts).toHaveLength(3);
      expect(contexts.map(c => c.id)).toEqual(['id1', 'id2', 'id3']);
    });

    it('should return empty array when no contexts', () => {
      const contexts = contextManager.getAllContexts();
      expect(contexts).toEqual([]);
    });
  });

  describe('setContextData', () => {
    it('should set data for existing context', () => {
      contextManager.createContext('test-id');
      contextManager.setContextData('test-id', 'key', 'value');
      const context = contextManager.getContext('test-id');
      expect(context.data.key).toBe('value');
    });

    it('should not fail for non-existent context', () => {
      expect(() => {
        contextManager.setContextData('non-existent', 'key', 'value');
      }).not.toThrow();
    });

    it('should update updatedAt timestamp', (done) => {
      contextManager.createContext('test-id');
      const originalUpdatedAt = contextManager.getContext('test-id').updatedAt;
      setTimeout(() => {
        contextManager.setContextData('test-id', 'key', 'value');
        const updated = contextManager.getContext('test-id');
        expect(updated.updatedAt).not.toEqual(originalUpdatedAt);
        done();
      }, 10);
    });
  });

  describe('getContextData', () => {
    it('should get data from existing context', () => {
      contextManager.createContext('test-id', { key: 'value' });
      const result = contextManager.getContextData('test-id', 'key');
      expect(result).toBe('value');
    });

    it('should return undefined for non-existent context', () => {
      const result = contextManager.getContextData('non-existent', 'key');
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-existent key', () => {
      contextManager.createContext('test-id');
      const result = contextManager.getContextData('test-id', 'non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should get existing context', () => {
      contextManager.createContext('test-id');
      const context = contextManager.get('test-id');
      expect(context).toBeDefined();
      expect(context.id).toBe('test-id');
    });

    it('should return undefined for non-existent context', () => {
      const context = contextManager.get('non-existent');
      expect(context).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update existing context', () => {
      contextManager.create(mockReq);
      const contexts = contextManager.getAll();
      const id = contexts[0].id;
      contextManager.update(id, { custom: 'data' });
      const updated = contextManager.get(id);
      expect(updated.custom).toBe('data');
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('should not fail for non-existent context', () => {
      expect(() => {
        contextManager.update('non-existent', { data: 'test' });
      }).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('should delete context', () => {
      contextManager.createContext('test-id');
      contextManager.destroy('test-id');
      expect(contextManager.get('test-id')).toBeUndefined();
    });

    it('should not fail for non-existent context', () => {
      expect(() => {
        contextManager.destroy('non-existent');
      }).not.toThrow();
    });
  });

  describe('getAll', () => {
    it('should return all contexts', () => {
      contextManager.create(mockReq);
      contextManager.create(mockReq);
      contextManager.create(mockReq);
      const contexts = contextManager.getAll();
      expect(contexts).toHaveLength(3);
    });

    it('should return empty array when no contexts', () => {
      const contexts = contextManager.getAll();
      expect(contexts).toEqual([]);
    });
  });

  describe('getActive', () => {
    it('should return active contexts', () => {
      contextManager.create(mockReq);
      const contexts = contextManager.getActive();
      expect(contexts).toHaveLength(1);
      expect(contexts[0].startTime).toBeDefined();
    });

    it('should filter old contexts', () => {
      const context = contextManager.create(mockReq);
      const oldContext = contextManager.get(context.id);
      oldContext.startTime = Date.now() - 400000;
      contextManager.update(context.id, { startTime: oldContext.startTime });
      const active = contextManager.getActive();
      expect(active).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('should cleanup old contexts when max exceeded', () => {
      for (let i = 0; i < 50; i++) {
        const req = { ip: '127.0.0.1' };
        contextManager.create(req);
      }
      expect(contextManager.getActive()).toHaveLength(50);

      for (let i = 0; i < 10; i++) {
        const context = contextManager.create(mockReq);
        const oldContext = contextManager.get(context.id);
        oldContext.startTime = Date.now() - 400000;
        contextManager.update(context.id, { startTime: oldContext.startTime });
      }

      contextManager.create(mockReq);
      const active = contextManager.getActive();
      expect(active.length).toBeLessThan(60);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = contextManager.create(mockReq).id;
      const id2 = contextManager.create(mockReq).id;
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^ctx-/);
      expect(id2).toMatch(/^ctx-/);
    });
  });

  describe('clear', () => {
    it('should clear all contexts', () => {
      contextManager.create(mockReq);
      contextManager.create(mockReq);
      contextManager.create(mockReq);
      expect(contextManager.getAll()).toHaveLength(3);
      contextManager.clear();
      expect(contextManager.getAll()).toHaveLength(0);
      expect(contextManager.getStats().total).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return statistics', () => {
      contextManager.create(mockReq);
      contextManager.create(mockReq);
      const stats = contextManager.getStats();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('max');
      expect(stats.total).toBe(2);
      expect(stats.max).toBe(10000);
    });

    it('should show correct active count', () => {
      contextManager.create(mockReq);
      contextManager.create(mockReq);
      const stats = contextManager.getStats();
      expect(stats.active).toBe(2);
    });
  });

  describe('integration', () => {
    it('should handle full lifecycle of context', () => {
      const context = contextManager.createContext('lifecycle-test', { step: 1 });
      expect(context.data.step).toBe(1);
      const updated = contextManager.updateContext('lifecycle-test', { step: 2 });
      expect(updated.data.step).toBe(2);
      const data = contextManager.getContextData('lifecycle-test', 'step');
      expect(data).toBe(2);
      contextManager.setContextData('lifecycle-test', 'newKey', 'value');
      const newData = contextManager.getContextData('lifecycle-test', 'newKey');
      expect(newData).toBe('value');
      const all = contextManager.getAllContexts();
      expect(all).toHaveLength(1);
      const deleted = contextManager.deleteContext('lifecycle-test');
      expect(deleted).toBe(true);
      expect(contextManager.getContext('lifecycle-test')).toBeUndefined();
    });

    it('should handle multiple contexts simultaneously', () => {
      const ids = ['ctx1', 'ctx2', 'ctx3'];
      ids.forEach(id => {
        contextManager.createContext(id, { timestamp: Date.now() });
      });
      const all = contextManager.getAllContexts();
      expect(all).toHaveLength(3);
      contextManager.deleteContext('ctx2');
      expect(contextManager.getAllContexts()).toHaveLength(2);
      expect(contextManager.getContext('ctx2')).toBeUndefined();
      expect(contextManager.getContext('ctx1')).toBeDefined();
      expect(contextManager.getContext('ctx3')).toBeDefined();
    });

    it('should handle different request types', () => {
      const requests = [
        { method: 'GET', path: '/api/users' },
        { method: 'POST', path: '/api/users', body: { name: 'test' } },
        { method: 'PUT', path: '/api/users/1' },
        { method: 'DELETE', path: '/api/users/1' }
      ];
      requests.forEach(req => {
        const context = contextManager.create(req);
        expect(context.method).toBe(req.method);
        expect(context.path).toBe(req.path);
      });
      expect(contextManager.getAll()).toHaveLength(4);
    });
  });

  describe('edge cases', () => {
    it('should handle very large data in context', () => {
      const largeData = { array: new Array(1000).fill('test'), nested: { deep: { data: 'test' } } };
      expect(() => {
        contextManager.createContext('large-context', largeData);
      }).not.toThrow();
      const context = contextManager.getContext('large-context');
      expect(context.data.array).toHaveLength(1000);
    });

    it('should handle special characters in ids', () => {
      const specialId = 'test-id-with-special-chars_123';
      contextManager.createContext(specialId);
      expect(contextManager.getContext(specialId)).toBeDefined();
    });

    it('should handle empty data updates', () => {
      contextManager.createContext('test-id', { existing: 'value' });
      const updated = contextManager.updateContext('test-id', {});
      expect(updated.data.existing).toBe('value');
    });
  });
});
