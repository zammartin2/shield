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
    jest.useRealTimers();
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

    it('should handle connection.remoteAddress when ip is missing', () => {
      const reqWithConnection = { 
        connection: { remoteAddress: '10.0.0.1' },
        method: 'GET',
        path: '/'
      };
      const context = contextManager.create(reqWithConnection);
      expect(context.ip).toBe('10.0.0.1');
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

    it('should call cleanup when maxContexts exceeded', () => {
      const originalMax = (contextManager as any).maxContexts;
      (contextManager as any).maxContexts = 5;
      
      const cleanupSpy = jest.spyOn(contextManager as any, 'cleanup');
      
      for (let i = 0; i < 6; i++) {
        contextManager.create({ ip: '127.0.0.1' });
      }
      
      expect(cleanupSpy).toHaveBeenCalled();
      cleanupSpy.mockRestore();
      (contextManager as any).maxContexts = originalMax;
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

    it('should create context with null data as empty object', () => {
      const context = contextManager.createContext('test-id', null);
      expect(context.data).toEqual({});
    });

    it('should create context with undefined data as empty object', () => {
      const context = contextManager.createContext('test-id', undefined);
      expect(context.data).toEqual({});
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

    it('should handle empty data updates', () => {
      contextManager.createContext('test-id', { existing: 'value' });
      const updated = contextManager.updateContext('test-id', {});
      expect(updated.data.existing).toBe('value');
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

    it('should update updatedAt timestamp', () => {
      jest.useFakeTimers();
      contextManager.createContext('test-id');
      const originalUpdatedAt = contextManager.getContext('test-id').updatedAt;
      
      jest.advanceTimersByTime(1000);
      contextManager.setContextData('test-id', 'key', 'value');
      const updated = contextManager.getContext('test-id');
      
      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      jest.useRealTimers();
    });

    it('should handle setting multiple data values', () => {
      contextManager.createContext('test-id');
      contextManager.setContextData('test-id', 'key1', 'value1');
      contextManager.setContextData('test-id', 'key2', 'value2');
      const context = contextManager.getContext('test-id');
      expect(context.data.key1).toBe('value1');
      expect(context.data.key2).toBe('value2');
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

    it('should return undefined for context with empty data', () => {
      contextManager.createContext('test-id', {});
      const result = contextManager.getContextData('test-id', 'key');
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

    it('should preserve existing fields when updating', () => {
      const context = contextManager.create(mockReq);
      const id = context.id;
      contextManager.update(id, { custom: 'data' });
      const updated = contextManager.get(id);
      expect(updated.method).toBe('GET');
      expect(updated.path).toBe('/test');
      expect(updated.custom).toBe('data');
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
      jest.useFakeTimers();
      const context = contextManager.create(mockReq);
      const id = context.id;
      
      jest.advanceTimersByTime(400000);
      contextManager.update(id, { startTime: Date.now() - 400000 });
      
      const active = contextManager.getActive();
      expect(active).toHaveLength(0);
      jest.useRealTimers();
    });

    it('should only return contexts from last 5 minutes', () => {
      jest.useFakeTimers();
      
      const firstContext = contextManager.create(mockReq);
      jest.advanceTimersByTime(180000);
      const secondContext = contextManager.create(mockReq);
      jest.advanceTimersByTime(180000);
      const thirdContext = contextManager.create(mockReq);
      
      contextManager.update(thirdContext.id, { startTime: Date.now() - 400000 });
      
      const active = contextManager.getActive();
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe(secondContext.id);
      
      jest.useRealTimers();
    });
  });

  describe('cleanup', () => {
    it('should cleanup old contexts when max exceeded', () => {
      jest.useFakeTimers();
      const originalMax = (contextManager as any).maxContexts;
      // Устанавливаем больший лимит, чтобы cleanup не сработал раньше времени
      (contextManager as any).maxContexts = 30;
      
      // Создаем 15 активных контекстов
      for (let i = 0; i < 15; i++) {
        contextManager.create({ ip: '127.0.0.1' });
      }
      
      // Создаем 10 старых контекстов (старше 1 часа)
      const oldContextIds: string[] = [];
      for (let i = 0; i < 10; i++) {
        const context = contextManager.create(mockReq);
        oldContextIds.push(context.id);
        // Устанавливаем startTime на 2 часа назад
        contextManager.update(context.id, { startTime: Date.now() - 7200000 });
      }
      
      // Проверяем, что все контексты созданы (25 штук)
      expect(contextManager.getAll()).toHaveLength(25);
      
      // Теперь устанавливаем маленький лимит и создаем еще один контекст
      (contextManager as any).maxContexts = 20;
      contextManager.create(mockReq);
      
      // Проверяем, что старые контексты были удалены
      const allContexts = contextManager.getAll();
      for (const id of oldContextIds) {
        expect(allContexts.some(c => c.id === id)).toBe(false);
      }
      
      // Проверяем, что активные контексты остались (15 активных + 1 новый = 16)
      expect(allContexts.length).toBe(16);
      
      (contextManager as any).maxContexts = originalMax;
      jest.useRealTimers();
    });

    it('should cleanup contexts older than 1 hour', () => {
      jest.useFakeTimers();
      const originalMax = (contextManager as any).maxContexts;
      (contextManager as any).maxContexts = 10;
      
      // Создаем старый контекст
      const context = contextManager.create(mockReq);
      const id = context.id;
      
      // Устанавливаем startTime на 2 часа назад
      contextManager.update(id, { startTime: Date.now() - 7200000 });
      
      // Создаем еще 10 контекстов для триггера cleanup
      for (let i = 0; i < 10; i++) {
        contextManager.create({ ip: '127.0.0.1' });
      }
      
      // Проверяем, что старый контекст был удален
      const contexts = contextManager.getAll();
      expect(contexts.some(c => c.id === id)).toBe(false);
      
      (contextManager as any).maxContexts = originalMax;
      jest.useRealTimers();
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

    it('should generate IDs with crypto', () => {
      const cryptoSpy = jest.spyOn(CryptoUtils.prototype, 'generateId');
      contextManager.create(mockReq);
      expect(cryptoSpy).toHaveBeenCalled();
      cryptoSpy.mockRestore();
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

    it('should handle clear on empty manager', () => {
      expect(() => contextManager.clear()).not.toThrow();
      expect(contextManager.getAll()).toHaveLength(0);
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

    it('should show correct active count after cleanup', () => {
      jest.useFakeTimers();
      
      // Создаем первый контекст (активный)
      contextManager.create(mockReq);
      
      // Создаем второй контекст
      const oldContext = contextManager.create(mockReq);
      const id = oldContext.id;
      
      // Устанавливаем startTime на 6 минут назад
      contextManager.update(id, { startTime: Date.now() - 400000 });
      
      const stats = contextManager.getStats();
      expect(stats.active).toBe(1);
      
      jest.useRealTimers();
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

    it('should handle concurrent operations', async () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve(contextManager.createContext(`id-${i}`, { index: i }))
        );
      }
      await Promise.all(promises);
      expect(contextManager.getAll()).toHaveLength(100);
      
      const all = contextManager.getAllContexts();
      for (let i = 0; i < 100; i++) {
        expect(all.some(c => c.id === `id-${i}`)).toBe(true);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle very large data in context', () => {
      const largeData = { 
        array: new Array(1000).fill('test'), 
        nested: { deep: { data: 'test' } } 
      };
      expect(() => {
        contextManager.createContext('large-context', largeData);
      }).not.toThrow();
      const context = contextManager.getContext('large-context');
      expect(context.data.array).toHaveLength(1000);
    });

    it('should handle special characters in ids', () => {
      const specialIds = [
        'test-id-with-special-chars_123',
        'id-with-$pecial-char$',
        'id-with-emoji-🚀',
        'id-with-spaces 123',
        'id/with/slashes'
      ];
      
      specialIds.forEach(id => {
        contextManager.createContext(id);
        expect(contextManager.getContext(id)).toBeDefined();
      });
      
      expect(contextManager.getAll()).toHaveLength(specialIds.length);
    });

    it('should handle very long ID strings', () => {
      const longId = 'a'.repeat(1000);
      contextManager.createContext(longId);
      expect(contextManager.getContext(longId)).toBeDefined();
    });

    it('should handle update with undefined values', () => {
      contextManager.createContext('test-id', { key: 'value' });
      contextManager.updateContext('test-id', { key: undefined });
      const context = contextManager.getContext('test-id');
      expect(context.data.key).toBeUndefined();
    });

    it('should handle update with null values', () => {
      contextManager.createContext('test-id', { key: 'value' });
      contextManager.updateContext('test-id', { key: null });
      const context = contextManager.getContext('test-id');
      expect(context.data.key).toBeNull();
    });

    it('should handle circular references in data', () => {
      const circularData: any = { name: 'test' };
      circularData.self = circularData;
      
      expect(() => {
        contextManager.createContext('circular-test', circularData);
      }).not.toThrow();
    });

    it('should maintain order of contexts', () => {
      const ids = ['first', 'second', 'third'];
      ids.forEach(id => contextManager.createContext(id));
      
      const contexts = contextManager.getAllContexts();
      expect(contexts.map(c => c.id)).toEqual(ids);
    });
  });

  describe('performance', () => {
    it('should handle 10000 contexts efficiently', () => {
      const startTime = Date.now();
      for (let i = 0; i < 10000; i++) {
        contextManager.createContext(`id-${i}`, { index: i });
      }
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000);
      expect(contextManager.getAll()).toHaveLength(10000);
    });

    it('should handle get operations efficiently with many contexts', () => {
      for (let i = 0; i < 5000; i++) {
        contextManager.createContext(`id-${i}`);
      }
      
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        contextManager.get(`id-${i % 5000}`);
      }
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle update operations efficiently with many contexts', () => {
      for (let i = 0; i < 5000; i++) {
        contextManager.createContext(`id-${i}`);
      }
      
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        contextManager.updateContext(`id-${i % 5000}`, { updated: true });
      }
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(200);
    });
  });
});