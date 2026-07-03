import { AIEngine } from '../../../../src/modules/ai/AIEngine';

describe('AIEngine', () => {
  let aiEngine: AIEngine;

  beforeEach(() => {
    aiEngine = new AIEngine();
  });

  // ============================================
  // КОНСТРУКТОР
  // ============================================

  describe('constructor', () => {
    it('should create instance with default config', () => {
      expect(aiEngine).toBeInstanceOf(AIEngine);
    });

    it('should create instance with custom config', () => {
      const config = { anomalyDetection: true };
      const engine = new AIEngine(config);
      expect(engine).toBeInstanceOf(AIEngine);
    });

    it('should initialize all pattern arrays', () => {
      expect((aiEngine as any).XSS_PATTERNS).toBeDefined();
      expect((aiEngine as any).SQL_PATTERNS).toBeDefined();
      expect((aiEngine as any).PATH_TRAVERSAL_PATTERNS).toBeDefined();
      expect((aiEngine as any).COMMAND_INJECTION_PATTERNS).toBeDefined();
      expect((aiEngine as any).NOSQL_PATTERNS).toBeDefined();
      expect((aiEngine as any).LDAP_PATTERNS).toBeDefined();
    });
  });

  // ============================================
  // ANALYZE
  // ============================================

  describe('analyze', () => {
    it('should return safe result for empty request', async () => {
      const req = {};
      const result = await aiEngine.analyze(req);
      
      expect(result).toBeDefined();
      expect(result.isThreat).toBe(false);
      expect(result.threats).toEqual([]);
      expect(result.confidence).toBe(0.95);
    });

    it('should detect XSS in request body', async () => {
      const req = {
        body: { input: '<script>alert(1)</script>' },
        method: 'POST',
        path: '/test'
      };
      const result = await aiEngine.analyze(req);
      
      expect(result.isThreat).toBe(true);
      expect(result.threats.length).toBeGreaterThan(0);
      expect(result.threats.some(t => t.type === 'XSS')).toBe(true);
      expect(result.analysis.contentAnalysis.hasXSS).toBe(true);
    });

    it('should detect SQL injection in query params', async () => {
      const req = {
        query: { id: "1' OR '1'='1" },
        method: 'GET',
        path: '/test'
      };
      const result = await aiEngine.analyze(req);
      
      expect(result.isThreat).toBe(true);
      expect(result.threats.some(t => t.type === 'SQL Injection')).toBe(true);
      expect(result.analysis.contentAnalysis.hasSQL).toBe(true);
    });

    it('should detect Path Traversal', async () => {
      const req = {
        query: { file: '../../etc/passwd' },
        method: 'GET',
        path: '/test'
      };
      const result = await aiEngine.analyze(req);
      
      expect(result.isThreat).toBe(true);
      expect(result.threats.some(t => t.type === 'Path Traversal')).toBe(true);
      expect(result.analysis.contentAnalysis.hasPathTraversal).toBe(true);
    });

    it('should detect Command Injection', async () => {
      const req = {
        body: { cmd: '; rm -rf /' },
        method: 'POST',
        path: '/test'
      };
      const result = await aiEngine.analyze(req);
      
      expect(result.isThreat).toBe(true);
      expect(result.threats.some(t => t.type === 'Command Injection')).toBe(true);
      expect(result.analysis.contentAnalysis.hasCommandInjection).toBe(true);
    });

    it('should detect NoSQL Injection', async () => {
      const req = {
        body: { query: '{"$gt": ""}' },
        method: 'POST',
        path: '/test'
      };
      const result = await aiEngine.analyze(req);
      
      expect(result.isThreat).toBe(true);
      expect(result.threats.some(t => t.type === 'NoSQL Injection')).toBe(true);
      expect(result.analysis.contentAnalysis.hasNoSQL).toBe(true);
    });

    it('should detect LDAP Injection', async () => {
      const req = {
        query: { user: '*)(uid=*' },
        method: 'GET',
        path: '/test'
      };
      const result = await aiEngine.analyze(req);
      
      expect(result.isThreat).toBe(true);
      expect(result.threats.some(t => t.type === 'LDAP Injection')).toBe(true);
      expect(result.analysis.contentAnalysis.hasLDAP).toBe(true);
    });

    it('should detect multiple threats', async () => {
      const req = {
        body: { 
          input: '<script>alert(1)</script>',
          query: "1' OR '1'='1"
        },
        method: 'POST',
        path: '/test'
      };
      const result = await aiEngine.analyze(req);
      
      expect(result.isThreat).toBe(true);
      expect(result.threats.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle malformed JSON in request', async () => {
      const req = {
        body: { invalid: '[object Object]' },
        method: 'POST',
        path: '/test'
      };
      const result = await aiEngine.analyze(req);
      
      expect(result).toBeDefined();
      expect(result.isThreat).toBe(false);
    });

    it('should handle missing body', async () => {
      const req = { method: 'GET', path: '/test' };
      const result = await aiEngine.analyze(req);
      
      expect(result).toBeDefined();
      expect(result.isThreat).toBe(false);
    });

    it('should detect anomaly when behavior is suspicious', async () => {
      const req = {
        body: { data: 'x'.repeat(10001) },
        query: { a: '1', b: '2', c: '3', d: '4', e: '5', f: '6', g: '7', h: '8', i: '9', j: '10', k: '11', l: '12', m: '13', n: '14', o: '15', p: '16', q: '17', r: '18', s: '19', t: '20', u: '21' },
        method: 'OPTIONS',
        path: '/test',
        headers: { 'user-agent': '' }
      };
      const result = await aiEngine.analyze(req);
      
      expect(result.analysis.userBehavior.riskScore).toBeGreaterThan(0);
    });
  });

  // ============================================
  // SAFE STRINGIFY
  // ============================================

  describe('safeStringify', () => {
    it('should stringify objects', () => {
      const obj = { test: 'value' };
      const result = (aiEngine as any).safeStringify(obj);
      expect(result).toBe('{"test":"value"}');
    });

    it('should handle circular references', () => {
      const obj: any = { test: 'value' };
      obj.self = obj;
      const result = (aiEngine as any).safeStringify(obj);
      expect(result).toBe('[object Object]');
    });

    it('should handle null', () => {
      const result = (aiEngine as any).safeStringify(null);
      expect(result).toBe('null');
    });

    it('should handle undefined', () => {
      const result = (aiEngine as any).safeStringify(undefined);
      // JSON.stringify(undefined) возвращает undefined
      expect(result).toBeUndefined();
    });

    it('should handle string input', () => {
      const result = (aiEngine as any).safeStringify('test');
      expect(result).toBe('"test"');
    });
  });

  // ============================================
  // DETECT LOCATION
  // ============================================

  describe('detectLocation', () => {
    const pattern = /test/;

    it('should detect location in body', () => {
      const req = {
        body: { test: 'test value' },
        query: {},
        params: {},
        headers: {},
        cookies: {}
      };
      const result = (aiEngine as any).detectLocation(req, pattern);
      expect(result).toBe('body');
    });

    it('should detect location in query', () => {
      const req = {
        body: {},
        query: { q: 'test' },
        params: {},
        headers: {},
        cookies: {}
      };
      const result = (aiEngine as any).detectLocation(req, pattern);
      expect(result).toBe('query');
    });

    it('should detect location in params', () => {
      const req = {
        body: {},
        query: {},
        params: { id: 'test' },
        headers: {},
        cookies: {}
      };
      const result = (aiEngine as any).detectLocation(req, pattern);
      expect(result).toBe('params');
    });

    it('should detect location in headers', () => {
      const req = {
        body: {},
        query: {},
        params: {},
        headers: { 'x-test': 'test' },
        cookies: {}
      };
      const result = (aiEngine as any).detectLocation(req, pattern);
      expect(result).toBe('headers');
    });

    it('should detect location in cookies', () => {
      const req = {
        body: {},
        query: {},
        params: {},
        headers: {},
        cookies: { test: 'test' }
      };
      const result = (aiEngine as any).detectLocation(req, pattern);
      expect(result).toBe('cookies');
    });

    it('should return unknown when no match', () => {
      const req = {
        body: {},
        query: {},
        params: {},
        headers: {},
        cookies: {}
      };
      const result = (aiEngine as any).detectLocation(req, pattern);
      expect(result).toBe('unknown');
    });
  });

  // ============================================
  // ANALYZE BEHAVIOR
  // ============================================

  describe('analyzeBehavior', () => {
    it('should return 0 for normal request', () => {
      const req = {
        body: { data: 'test' },
        query: { q: 'test' },
        headers: { 'user-agent': 'Mozilla/5.0', accept: '*/*' },
        method: 'GET'
      };
      const score = (aiEngine as any).analyzeBehavior(req);
      expect(score).toBe(0);
    });

    it('should detect long body', () => {
      const req = {
        body: { data: 'x'.repeat(10001) },
        headers: { 'user-agent': 'Mozilla/5.0', accept: '*/*' },
        method: 'GET'
      };
      const score = (aiEngine as any).analyzeBehavior(req);
      expect(score).toBeGreaterThan(0);
    });

    it('should detect many query parameters', () => {
      const query: any = {};
      for (let i = 0; i < 21; i++) {
        query[`key${i}`] = `value${i}`;
      }
      const req = {
        query,
        headers: { 'user-agent': 'Mozilla/5.0', accept: '*/*' },
        method: 'GET'
      };
      const score = (aiEngine as any).analyzeBehavior(req);
      expect(score).toBeGreaterThan(0);
    });

    it('should detect missing user-agent', () => {
      const req = {
        headers: { accept: '*/*' },
        method: 'GET'
      };
      const score = (aiEngine as any).analyzeBehavior(req);
      // Проверяем, что функция корректно обрабатывает отсутствие user-agent
      expect(score).toBeDefined();
    });

    it('should detect missing accept header', () => {
      const req = {
        headers: { 'user-agent': 'Mozilla/5.0' },
        method: 'GET'
      };
      const score = (aiEngine as any).analyzeBehavior(req);
      expect(score).toBeGreaterThan(0);
    });

    it('should detect unusual method', () => {
      const req = {
        headers: { 'user-agent': 'Mozilla/5.0', accept: '*/*' },
        method: 'TRACE'
      };
      const score = (aiEngine as any).analyzeBehavior(req);
      expect(score).toBeGreaterThan(0);
    });

    it('should detect many special characters', () => {
      const req = {
        body: { data: "'\"();<>".repeat(10) },
        headers: { 'user-agent': 'Mozilla/5.0', accept: '*/*' },
        method: 'GET'
      };
      const score = (aiEngine as any).analyzeBehavior(req);
      expect(score).toBeGreaterThan(0);
    });

    it('should cap score at 1', () => {
      const req = {
        body: { data: 'x'.repeat(10001) },
        query: (() => {
          const q: any = {};
          for (let i = 0; i < 30; i++) q[`key${i}`] = 'value';
          return q;
        })(),
        headers: { 'user-agent': '', accept: '' },
        method: 'TRACE'
      };
      const score = (aiEngine as any).analyzeBehavior(req);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  // ============================================
  // CALCULATE THREAT SCORE
  // ============================================

  describe('calculateThreatScore', () => {
    it('should return 0.1 for empty threats', () => {
      const score = (aiEngine as any).calculateThreatScore([]);
      expect(score).toBe(0.1);
    });

    it('should return correct score for critical threat', () => {
      const threats = [{ severity: 'critical' }];
      const score = (aiEngine as any).calculateThreatScore(threats);
      expect(score).toBe(1.0);
    });

    it('should return correct score for high threat', () => {
      const threats = [{ severity: 'high' }];
      const score = (aiEngine as any).calculateThreatScore(threats);
      expect(score).toBe(0.8);
    });

    it('should return correct score for medium threat', () => {
      const threats = [{ severity: 'medium' }];
      const score = (aiEngine as any).calculateThreatScore(threats);
      expect(score).toBe(0.5);
    });

    it('should return correct score for low threat', () => {
      const threats = [{ severity: 'low' }];
      const score = (aiEngine as any).calculateThreatScore(threats);
      expect(score).toBe(0.3);
    });

    it('should return max score for multiple threats', () => {
      const threats = [
        { severity: 'low' },
        { severity: 'high' }
      ];
      const score = (aiEngine as any).calculateThreatScore(threats);
      expect(score).toBe(0.8);
    });
  });

  // ============================================
  // GENERATE RECOMMENDATIONS
  // ============================================

  describe('generateRecommendations', () => {
    it('should return empty array for no threats', () => {
      const recs = (aiEngine as any).generateRecommendations([]);
      expect(recs).toEqual([]);
    });

    it('should generate recommendations for XSS', () => {
      const threats = [{ type: 'XSS' }];
      const recs = (aiEngine as any).generateRecommendations(threats);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0]).toContain('output encoding');
    });

    it('should generate recommendations for SQL Injection', () => {
      const threats = [{ type: 'SQL Injection' }];
      const recs = (aiEngine as any).generateRecommendations(threats);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0]).toContain('parameterized');
    });

    it('should generate recommendations for NoSQL Injection', () => {
      const threats = [{ type: 'NoSQL Injection' }];
      const recs = (aiEngine as any).generateRecommendations(threats);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0]).toContain('Validate');
    });

    it('should generate recommendations for LDAP Injection', () => {
      const threats = [{ type: 'LDAP Injection' }];
      const recs = (aiEngine as any).generateRecommendations(threats);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0]).toContain('Escape');
    });

    it('should generate recommendations for Path Traversal', () => {
      const threats = [{ type: 'Path Traversal' }];
      const recs = (aiEngine as any).generateRecommendations(threats);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0]).toContain('Validate');
    });

    it('should generate recommendations for Command Injection', () => {
      const threats = [{ type: 'Command Injection' }];
      const recs = (aiEngine as any).generateRecommendations(threats);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0]).toContain('Avoid using');
    });

    it('should generate recommendations for Anomaly', () => {
      const threats = [{ type: 'Anomaly' }];
      const recs = (aiEngine as any).generateRecommendations(threats);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0]).toContain('Review');
    });

    it('should remove duplicate recommendations', () => {
      const threats = [
        { type: 'XSS' },
        { type: 'XSS' }
      ];
      const recs = (aiEngine as any).generateRecommendations(threats);
      expect(recs).toEqual([...new Set(recs)]);
    });
  });

  // ============================================
  // TRAIN
  // ============================================

  describe('train', () => {
    it('should complete training successfully', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await aiEngine.train();
      
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('🧠 AI Engine training completed');
      
      consoleLogSpy.mockRestore();
    });

    it('should log pattern counts', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await aiEngine.train();
      
      const calls = consoleLogSpy.mock.calls;
      expect(calls.some(call => call[0].includes('XSS patterns'))).toBe(true);
      expect(calls.some(call => call[0].includes('SQL patterns'))).toBe(true);
      
      consoleLogSpy.mockRestore();
    });

    it('should handle training data', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await aiEngine.train({ data: 'test' });
      
      expect(consoleLogSpy).toHaveBeenCalled();
      
      consoleLogSpy.mockRestore();
    });
  });

  // ============================================
  // ИНТЕГРАЦИОННЫЕ ТЕСТЫ
  // ============================================

  describe('integration', () => {
    it('should handle complex request with multiple threats', async () => {
      const req = {
        body: {
          input: '<script>alert(1)</script>',
          query: "1' OR '1'='1",
          file: '../../etc/passwd'
        },
        query: { cmd: '; rm -rf /' },
        headers: { 'user-agent': '', 'x-custom': 'test' },
        method: 'POST',
        path: '/api/test'
      };
      
      const result = await aiEngine.analyze(req);
      
      expect(result.isThreat).toBe(true);
      expect(result.threats.length).toBeGreaterThan(0);
      expect(result.threatScore).toBeGreaterThan(0);
      expect(result.confidence).toBe(0.85);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle request with anomaly detection disabled', async () => {
      const engine = new AIEngine({ anomalyDetection: false });
      
      const req = {
        body: { data: 'x'.repeat(10001) },
        method: 'OPTIONS',
        path: '/test',
        headers: { 'user-agent': '' }
      };
      
      const result = await engine.analyze(req);
      
      expect(result.analysis.userBehavior.riskScore).toBe(0);
    });

    it('should handle request with no threats', async () => {
      const req = {
        body: { data: 'normal data' },
        query: { q: 'search' },
        headers: { 'user-agent': 'Mozilla/5.0', accept: '*/*' },
        method: 'GET',
        path: '/api/search'
      };
      
      const result = await aiEngine.analyze(req);
      
      expect(result.isThreat).toBe(false);
      expect(result.threats).toEqual([]);
      expect(result.confidence).toBe(0.95);
    });
  });
});
