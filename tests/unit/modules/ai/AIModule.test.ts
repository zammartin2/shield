import { AIModule } from '../../../../src/modules/ai/AIModule';
import { ConfigManager } from '../../../../src/core/ConfigManager';
import { AIEngine } from '../../../../src/modules/ai/AIEngine';

// Мокаем AIEngine
jest.mock('../../../../src/modules/ai/AIEngine');

describe('AIModule', () => {
  let aiModule: AIModule;
  let mockConfig: ConfigManager;
  let mockEngine: jest.Mocked<AIEngine>;

  beforeEach(() => {
    mockConfig = {
      getModule: jest.fn()
    } as any;

    mockEngine = {
      analyze: jest.fn(),
      train: jest.fn()
    } as any;

    (AIEngine as jest.Mock).mockImplementation(() => mockEngine);

    aiModule = new AIModule(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // КОНСТРУКТОР
  // ============================================

  describe('constructor', () => {
    it('should create instance successfully', () => {
      expect(aiModule).toBeInstanceOf(AIModule);
    });

    it('should store config reference', () => {
      expect((aiModule as any).config).toBe(mockConfig);
    });

    it('should create AIEngine instance', () => {
      expect(AIEngine).toHaveBeenCalledWith(mockConfig);
      expect((aiModule as any).engine).toBe(mockEngine);
    });
  });

  // ============================================
  // ANALYZE
  // ============================================

  describe('analyze', () => {
    const mockReq = { method: 'GET', path: '/test' };
    const mockContext = { id: 'test-context' };

    it('should return safe result when AI disabled', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: false });

      const result = await aiModule.analyze(mockReq, mockContext);

      expect(result).toEqual({
        threats: [],
        isThreat: false,
        threatScore: 0,
        confidence: 1,
        analysis: {
          userBehavior: { riskScore: 0 },
          contentAnalysis: { hasSQL: false, hasXSS: false },
          patternAnalysis: { score: 0 }
        },
        recommendations: []
      });
      expect(mockEngine.analyze).not.toHaveBeenCalled();
    });

    it('should return safe result when AI config is null', async () => {
      mockConfig.getModule.mockReturnValue(null);

      const result = await aiModule.analyze(mockReq, mockContext);

      expect(result).toEqual({
        threats: [],
        isThreat: false,
        threatScore: 0,
        confidence: 1,
        analysis: {
          userBehavior: { riskScore: 0 },
          contentAnalysis: { hasSQL: false, hasXSS: false },
          patternAnalysis: { score: 0 }
        },
        recommendations: []
      });
      expect(mockEngine.analyze).not.toHaveBeenCalled();
    });

    it('should return safe result when AI config is undefined', async () => {
      mockConfig.getModule.mockReturnValue(undefined);

      const result = await aiModule.analyze(mockReq, mockContext);

      expect(result).toEqual({
        threats: [],
        isThreat: false,
        threatScore: 0,
        confidence: 1,
        analysis: {
          userBehavior: { riskScore: 0 },
          contentAnalysis: { hasSQL: false, hasXSS: false },
          patternAnalysis: { score: 0 }
        },
        recommendations: []
      });
      expect(mockEngine.analyze).not.toHaveBeenCalled();
    });

    it('should call engine.analyze when AI enabled', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      const expectedResult = { threats: [], isThreat: false };
      mockEngine.analyze.mockResolvedValue(expectedResult);

      const result = await aiModule.analyze(mockReq, mockContext);

      expect(mockEngine.analyze).toHaveBeenCalledWith(mockReq, mockContext);
      expect(result).toBe(expectedResult);
    });

    it('should handle engine.analyze error', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      const error = new Error('Analysis error');
      mockEngine.analyze.mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await aiModule.analyze(mockReq, mockContext);

      expect(consoleErrorSpy).toHaveBeenCalledWith('AI Analysis error:', error);
      expect(result).toEqual({
        threats: [],
        isThreat: false,
        threatScore: 0,
        confidence: 0,
        error: 'Analysis error'
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle engine.analyze error with non-Error object', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      const error = 'String error';
      mockEngine.analyze.mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await aiModule.analyze(mockReq, mockContext);

      expect(result).toEqual({
        threats: [],
        isThreat: false,
        threatScore: 0,
        confidence: 0,
        error: 'Unknown error'
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle engine.analyze error with null', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      mockEngine.analyze.mockRejectedValue(null);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await aiModule.analyze(mockReq, mockContext);

      expect(result).toEqual({
        threats: [],
        isThreat: false,
        threatScore: 0,
        confidence: 0,
        error: 'Unknown error'
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle context as optional parameter', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      const expectedResult = { threats: [], isThreat: false };
      mockEngine.analyze.mockResolvedValue(expectedResult);

      const result = await aiModule.analyze(mockReq);

      expect(mockEngine.analyze).toHaveBeenCalledWith(mockReq, undefined);
      expect(result).toBe(expectedResult);
    });
  });

  // ============================================
  // TRAIN
  // ============================================

  describe('train', () => {
    const mockData = { data: 'training data' };

    it('should not call engine.train when AI disabled', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: false });

      await aiModule.train(mockData);

      expect(mockEngine.train).not.toHaveBeenCalled();
    });

    it('should not call engine.train when AI config is null', async () => {
      mockConfig.getModule.mockReturnValue(null);

      await aiModule.train(mockData);

      expect(mockEngine.train).not.toHaveBeenCalled();
    });

    it('should not call engine.train when AI config is undefined', async () => {
      mockConfig.getModule.mockReturnValue(undefined);

      await aiModule.train(mockData);

      expect(mockEngine.train).not.toHaveBeenCalled();
    });

    it('should call engine.train when AI enabled', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      mockEngine.train.mockResolvedValue(undefined);

      await aiModule.train(mockData);

      expect(mockEngine.train).toHaveBeenCalledWith(mockData);
    });

    it('should handle engine.train error', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      const error = new Error('Training error');
      mockEngine.train.mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(aiModule.train(mockData)).rejects.toThrow('Training error');

      consoleErrorSpy.mockRestore();
    });

    it('should call engine.train without data', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      mockEngine.train.mockResolvedValue(undefined);

      await aiModule.train();

      expect(mockEngine.train).toHaveBeenCalledWith(undefined);
    });
  });

  // ============================================
  // GET METRICS
  // ============================================

  describe('getMetrics', () => {
    it('should return metrics', () => {
      const metrics = aiModule.getMetrics();

      expect(metrics).toEqual({
        status: 'active',
        models: ['xss', 'sql_injection', 'anomaly'],
        accuracy: 0.95,
        analyses: 0
      });
    });

    it('should return same metrics on multiple calls', () => {
      const metrics1 = aiModule.getMetrics();
      const metrics2 = aiModule.getMetrics();

      expect(metrics1).toEqual(metrics2);
    });
  });

  // ============================================
  // ИНТЕГРАЦИОННЫЕ ТЕСТЫ
  // ============================================

  describe('integration', () => {
    it('should handle full workflow with AI enabled', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      
      const mockResult = {
        threats: [{ type: 'XSS', severity: 'high' }],
        isThreat: true,
        threatScore: 0.8,
        confidence: 0.85,
        analysis: {
          userBehavior: { riskScore: 0.5 },
          contentAnalysis: { hasXSS: true, hasSQL: false },
          patternAnalysis: { score: 0.7 }
        },
        recommendations: ['Use output encoding']
      };
      
      mockEngine.analyze.mockResolvedValue(mockResult);
      mockEngine.train.mockResolvedValue(undefined);

      const req = { method: 'POST', path: '/api/test', body: { data: 'test' } };
      
      // Analyze
      const result = await aiModule.analyze(req);
      expect(result).toBe(mockResult);
      expect(mockEngine.analyze).toHaveBeenCalledWith(req, undefined);
      
      // Train
      await aiModule.train({ data: 'test' });
      expect(mockEngine.train).toHaveBeenCalledWith({ data: 'test' });
      
      // Get metrics
      const metrics = aiModule.getMetrics();
      expect(metrics).toBeDefined();
    });

    it('should handle full workflow with AI disabled', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: false });

      const req = { method: 'GET', path: '/test' };
      
      // Analyze - should return safe result
      const result = await aiModule.analyze(req);
      expect(result.confidence).toBe(1);
      expect(result.threats).toEqual([]);
      
      // Train - should not call engine
      await aiModule.train({ data: 'test' });
      expect(mockEngine.train).not.toHaveBeenCalled();
    });

    it('should handle error in analyze gracefully', async () => {
      mockConfig.getModule.mockReturnValue({ enabled: true });
      const error = new Error('Engine error');
      mockEngine.analyze.mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await aiModule.analyze({ method: 'GET' });

      expect(result.error).toBe('Engine error');
      expect(result.confidence).toBe(0);
      expect(result.threats).toEqual([]);

      consoleErrorSpy.mockRestore();
    });
  });
});
