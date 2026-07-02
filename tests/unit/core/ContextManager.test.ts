import { ContextManager } from '../../../src/core/ContextManager';

describe('ContextManager', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  test('should create instance', () => {
    expect(contextManager).toBeDefined();
  });

  test('should create context', () => {
    const context = contextManager.createContext('test-id');
    expect(context).toBeDefined();
    expect(context.id).toBe('test-id');
    expect(context.data).toBeDefined();
    expect(context.timestamp).toBeDefined();
  });

  test('should get context', () => {
    contextManager.createContext('test-id');
    const context = contextManager.getContext('test-id');
    expect(context).toBeDefined();
    expect(context.id).toBe('test-id');
  });

  test('should update context', () => {
    contextManager.createContext('test-id');
    const updated = contextManager.updateContext('test-id', { key: 'value' });
    expect(updated).toBeDefined();
    if (updated) {
      expect(updated.data.key).toBe('value');
    }
  });

  test('should delete context', () => {
    contextManager.createContext('test-id');
    expect(contextManager.getContext('test-id')).toBeDefined();
    contextManager.deleteContext('test-id');
    expect(contextManager.getContext('test-id')).toBeUndefined();
  });

  test('should handle non-existent context', () => {
    expect(contextManager.getContext('non-existent')).toBeUndefined();
    expect(contextManager.updateContext('non-existent', {})).toBeUndefined();
    expect(contextManager.deleteContext('non-existent')).toBeUndefined();
  });

  test('should get all contexts', () => {
    contextManager.createContext('id1');
    contextManager.createContext('id2');
    const all = contextManager.getAllContexts();
    expect(all).toHaveLength(2);
  });

  test('should clear all contexts', () => {
    contextManager.createContext('id1');
    contextManager.createContext('id2');
    contextManager.clear();
    const all = contextManager.getAllContexts();
    expect(all).toHaveLength(0);
  });

  test('should set and get context data', () => {
    const context = contextManager.createContext('test-id');
    contextManager.setContextData('test-id', 'key', 'value');
    const value = contextManager.getContextData('test-id', 'key');
    expect(value).toBe('value');
  });

  test('should handle missing context data', () => {
    const value = contextManager.getContextData('non-existent', 'key');
    expect(value).toBeUndefined();
  });
});
