import {
  ThreatSeverity,
  ThreatType,
  ThreatAction,
  Threat,
  ThreatRequest,
  ThreatEvidence,
  ThreatDetectionResult,
  ThreatDetector,
  ThreatDetectionData,
  ThreatDetectorConfig,
  ThreatDetectorMetrics,
  ThreatRule,
  ThreatCondition,
  ThreatException,
  ThreatAnalysis,
  SecurityIncident,
  ThreatReport,
  ThreatModel,
  Vulnerability,
  Countermeasure,
  RiskAssessment,
  THREAT_SEVERITIES,
  THREAT_TYPES_LIST,
  THREAT_ACTIONS,
  THREAT_STATUSES,
  ThreatDetection,
  ThreatPrediction,
  ThreatPredictor,
  ThreatKnowledgeBase,
  ThreatDefinition,
  ThreatPattern
} from '../../../src/types/threat.types'

describe('Threat Types', () => {
  describe('THREAT_SEVERITIES constants', () => {
    it('should have all expected severities', () => {
      expect(THREAT_SEVERITIES).toEqual({
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        CRITICAL: 'critical'
      })
    })

    it('should have correct values', () => {
      expect(THREAT_SEVERITIES.LOW).toBe('low')
      expect(THREAT_SEVERITIES.MEDIUM).toBe('medium')
      expect(THREAT_SEVERITIES.HIGH).toBe('high')
      expect(THREAT_SEVERITIES.CRITICAL).toBe('critical')
    })
  })

  describe('THREAT_TYPES_LIST constant', () => {
    it('should contain all threat types', () => {
      const expectedTypes = [
        'XSS',
        'SQL_INJECTION',
        'NOSQL_INJECTION',
        'CSRF',
        'DDOS',
        'BRUTE_FORCE',
        'PATH_TRAVERSAL',
        'COMMAND_INJECTION',
        'FILE_INCLUSION',
        'RCE',
        'SSRF',
        'XXE',
        'LDAP_INJECTION',
        'CUSTOM'
      ]
      expect(THREAT_TYPES_LIST).toEqual(expectedTypes)
    })

    it('should have correct length', () => {
      expect(THREAT_TYPES_LIST.length).toBe(14)
    })
  })

  describe('THREAT_ACTIONS constants', () => {
    it('should have all expected actions', () => {
      expect(THREAT_ACTIONS).toEqual({
        ALLOW: 'allow',
        BLOCK: 'block',
        CHALLENGE: 'challenge',
        LOG: 'log',
        WARN: 'warn',
        RATE_LIMIT: 'rate-limit'
      })
    })

    it('should have correct values', () => {
      expect(THREAT_ACTIONS.ALLOW).toBe('allow')
      expect(THREAT_ACTIONS.BLOCK).toBe('block')
      expect(THREAT_ACTIONS.CHALLENGE).toBe('challenge')
      expect(THREAT_ACTIONS.LOG).toBe('log')
      expect(THREAT_ACTIONS.WARN).toBe('warn')
      expect(THREAT_ACTIONS.RATE_LIMIT).toBe('rate-limit')
    })
  })

  describe('THREAT_STATUSES constants', () => {
    it('should have all expected statuses', () => {
      expect(THREAT_STATUSES).toEqual({
        DETECTED: 'detected',
        ANALYZED: 'analyzed',
        BLOCKED: 'blocked',
        RESOLVED: 'resolved',
        FALSE_POSITIVE: 'false_positive'
      })
    })

    it('should have correct values', () => {
      expect(THREAT_STATUSES.DETECTED).toBe('detected')
      expect(THREAT_STATUSES.ANALYZED).toBe('analyzed')
      expect(THREAT_STATUSES.BLOCKED).toBe('blocked')
      expect(THREAT_STATUSES.RESOLVED).toBe('resolved')
      expect(THREAT_STATUSES.FALSE_POSITIVE).toBe('false_positive')
    })
  })

  describe('Threat interface', () => {
    it('should have all required properties', () => {
      const threat: Threat = {
        id: 'threat-123',
        timestamp: new Date(),
        type: 'XSS',
        severity: 'high',
        confidence: 0.95,
        request: {
          method: 'GET',
          path: '/test',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          headers: { 'User-Agent': 'test' },
          timestamp: new Date()
        },
        evidence: {
          pattern: '<script>',
          matched: '<script>alert(1)</script>',
          location: 'query',
          context: 'search=',
          confidence: 0.95
        },
        action: 'block',
        actionTaken: true,
        recommendations: ['Sanitize input', 'Use CSP'],
        source: {
          ip: '127.0.0.1',
          userAgent: 'test',
          country: 'US',
          asn: 'AS12345'
        },
        metadata: { test: true },
        tags: ['xss', 'injection'],
        status: 'blocked',
        processedAt: new Date(),
        resolvedAt: new Date(),
        resolvedBy: 'admin',
        resolution: 'Blocked and reported'
      }

      expect(threat).toBeDefined()
      expect(threat.id).toBe('threat-123')
      expect(threat.type).toBe('XSS')
      expect(threat.severity).toBe('high')
      expect(threat.confidence).toBe(0.95)
    })

    it('should allow optional properties', () => {
      const threat: Threat = {
        id: 'threat-456',
        timestamp: new Date(),
        type: 'SQL_INJECTION',
        severity: 'critical',
        confidence: 0.98,
        request: {
          method: 'POST',
          path: '/api/login',
          ip: '192.168.1.1',
          userAgent: 'test',
          headers: {},
          timestamp: new Date()
        },
        evidence: {
          pattern: "'; DROP TABLE users; --",
          matched: "'",
          location: 'body',
          context: 'username=',
          confidence: 0.98
        },
        action: 'block',
        actionTaken: true,
        recommendations: [],
        status: 'detected'
      }

      expect(threat.source).toBeUndefined()
      expect(threat.metadata).toBeUndefined()
      expect(threat.tags).toBeUndefined()
      expect(threat.processedAt).toBeUndefined()
    })
  })

  describe('ThreatRequest interface', () => {
    it('should have all required properties', () => {
      const request: ThreatRequest = {
        method: 'POST',
        path: '/api/data',
        ip: '10.0.0.1',
        userAgent: 'Mozilla/5.0',
        headers: { 'Content-Type': 'application/json' },
        body: { key: 'value' },
        query: { page: '1' },
        params: { id: '123' },
        cookies: { session: 'abc123' },
        referer: 'https://example.com',
        protocol: 'https',
        host: 'api.example.com',
        port: 443,
        timestamp: new Date()
      }

      expect(request).toBeDefined()
      expect(request.method).toBe('POST')
      expect(request.body).toEqual({ key: 'value' })
      expect(request.port).toBe(443)
    })

    it('should allow optional properties', () => {
      const request: ThreatRequest = {
        method: 'GET',
        path: '/test',
        ip: '127.0.0.1',
        userAgent: 'test',
        headers: {},
        timestamp: new Date()
      }

      expect(request.body).toBeUndefined()
      expect(request.query).toBeUndefined()
      expect(request.params).toBeUndefined()
      expect(request.cookies).toBeUndefined()
      expect(request.referer).toBeUndefined()
      expect(request.protocol).toBeUndefined()
      expect(request.host).toBeUndefined()
      expect(request.port).toBeUndefined()
    })
  })

  describe('ThreatEvidence interface', () => {
    it('should have all required properties', () => {
      const evidence: ThreatEvidence = {
        pattern: '<script>',
        matched: '<script>alert(1)</script>',
        location: 'query',
        context: 'search=',
        confidence: 0.95,
        raw: 'raw data',
        decoded: 'decoded data',
        encoded: '%3Cscript%3E',
        payload: 'alert(1)',
        vector: 'DOM-based XSS'
      }

      expect(evidence).toBeDefined()
      expect(evidence.pattern).toBe('<script>')
      expect(evidence.confidence).toBe(0.95)
    })

    it('should allow optional properties', () => {
      const evidence: ThreatEvidence = {
        pattern: "';",
        matched: "'",
        location: 'body',
        context: 'username=',
        confidence: 0.9
      }

      expect(evidence.raw).toBeUndefined()
      expect(evidence.decoded).toBeUndefined()
      expect(evidence.encoded).toBeUndefined()
      expect(evidence.payload).toBeUndefined()
      expect(evidence.vector).toBeUndefined()
    })
  })

  describe('ThreatDetectionResult interface', () => {
    it('should have all required properties', () => {
      const result: ThreatDetectionResult = {
        threats: [],
        score: 0.85,
        confidence: 0.9,
        recommendations: ['Use WAF', 'Update rules'],
        suggestedAction: 'block',
        analysisTime: 150,
        modelUsed: ['model-v1', 'model-v2'],
        timestamp: new Date()
      }

      expect(result).toBeDefined()
      expect(result.score).toBe(0.85)
      expect(result.suggestedAction).toBe('block')
      expect(result.modelUsed).toContain('model-v1')
    })
  })

  describe('ThreatDetector interface', () => {
    it('should have all required properties', () => {
      const detector: ThreatDetector = {
        name: 'XSS-Detector',
        version: '1.0.0',
        enabled: true,
        priority: 1,
        detect: jest.fn().mockResolvedValue({} as ThreatDetectionResult),
        analyze: jest.fn().mockResolvedValue({} as Threat),
        validate: jest.fn().mockResolvedValue(true),
        config: {
          enabled: true,
          threshold: 0.8,
          sensitivity: 0.9,
          patterns: ['<script>', 'onerror='],
          exceptions: ['/api/public'],
          customRules: [],
          aiEnabled: true,
          learningMode: false
        },
        metrics: {
          totalDetections: 100,
          truePositives: 85,
          falsePositives: 5,
          trueNegatives: 8,
          falseNegatives: 2,
          accuracy: 0.93,
          precision: 0.94,
          recall: 0.92,
          f1Score: 0.93,
          averageResponseTime: 50,
          lastDetection: new Date()
        }
      }

      expect(detector).toBeDefined()
      expect(detector.name).toBe('XSS-Detector')
      expect(detector.enabled).toBe(true)
      expect(detector.config.aiEnabled).toBe(true)
    })
  })

  describe('ThreatRule interface', () => {
    it('should have all required properties', () => {
      const rule: ThreatRule = {
        id: 'rule-123',
        name: 'XSS Detection',
        description: 'Detects XSS attacks',
        enabled: true,
        priority: 1,
        severity: 'high',
        action: 'block',
        conditions: [
          {
            field: 'query',
            operator: 'contains',
            value: '<script>',
            caseSensitive: false
          }
        ],
        actions: ['block', 'log'],
        exceptions: [
          {
            field: 'path',
            operator: 'startsWith',
            value: '/api/public',
            reason: 'Public API'
          }
        ],
        author: 'security-team',
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(rule).toBeDefined()
      expect(rule.id).toBe('rule-123')
      expect(rule.severity).toBe('high')
      expect(rule.conditions.length).toBe(1)
    })

    it('should allow optional properties', () => {
      const rule: ThreatRule = {
        id: 'rule-456',
        name: 'SQL Injection',
        enabled: true,
        priority: 2,
        severity: 'critical',
        action: 'block',
        conditions: [],
        actions: ['block'],
        exceptions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(rule.description).toBeUndefined()
      expect(rule.author).toBeUndefined()
      expect(rule.version).toBeUndefined()
    })
  })

  describe('ThreatCondition interface', () => {
    it('should have all required properties', () => {
      const condition: ThreatCondition = {
        field: 'query',
        operator: 'contains',
        value: '<script>',
        caseSensitive: false
      }

      expect(condition).toBeDefined()
      expect(condition.field).toBe('query')
      expect(condition.operator).toBe('contains')
    })

    it('should allow optional caseSensitive', () => {
      const condition: ThreatCondition = {
        field: 'body',
        operator: 'regex',
        value: '^SELECT.*FROM'
      }

      expect(condition.caseSensitive).toBeUndefined()
    })
  })

  describe('ThreatException interface', () => {
    it('should have all required properties', () => {
      const exception: ThreatException = {
        field: 'path',
        operator: 'startsWith',
        value: '/api/public',
        reason: 'Public API endpoint'
      }

      expect(exception).toBeDefined()
      expect(exception.field).toBe('path')
      expect(exception.reason).toBe('Public API endpoint')
    })

    it('should allow optional reason', () => {
      const exception: ThreatException = {
        field: 'ip',
        operator: 'equals',
        value: '127.0.0.1'
      }

      expect(exception.reason).toBeUndefined()
    })
  })

  describe('SecurityIncident interface', () => {
    it('should have all required properties', () => {
      const incident: SecurityIncident = {
        id: 'incident-123',
        title: 'XSS Attack Detected',
        description: 'Multiple XSS attempts from IP 192.168.1.1',
        severity: 'high',
        status: 'investigating',
        threats: [],
        timeline: [
          {
            timestamp: new Date(),
            event: 'Attack detected',
            actor: 'system',
            details: { count: 5 }
          }
        ],
        actions: [
          {
            timestamp: new Date(),
            action: 'Blocked IP',
            actor: 'admin',
            result: 'success'
          }
        ],
        data: {
          affectedSystems: ['web-server'],
          affectedUsers: [],
          dataExposed: false,
          dataType: []
        },
        createdBy: 'system',
        assignedTo: 'security-team',
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: new Date(),
        closedAt: new Date()
      }

      expect(incident).toBeDefined()
      expect(incident.id).toBe('incident-123')
      expect(incident.status).toBe('investigating')
    })
  })

  describe('ThreatReport interface', () => {
    it('should have all required properties', () => {
      const report: ThreatReport = {
        id: 'report-123',
        generatedAt: new Date(),
        period: {
          from: new Date(Date.now() - 86400000),
          to: new Date()
        },
        statistics: {
          totalThreats: 100,
          byType: { XSS: 50, SQL_INJECTION: 30, CSRF: 20 } as any,
          bySeverity: { low: 10, medium: 30, high: 40, critical: 20 },
          bySource: { '192.168.1.1': 50, '10.0.0.1': 30 },
          byPath: { '/api': 60, '/test': 40 }
        },
        trends: {
          threats: [{ date: new Date(), count: 10 }],
          blocked: [{ date: new Date(), count: 8 }],
          types: [{ type: 'XSS', count: 50, trend: 0.1 }] as any
        },
        topThreats: [],
        recommendations: ['Update WAF rules', 'Increase monitoring'],
        predictions: [
          {
            type: 'XSS',
            probability: 0.8,
            timeframe: 'immediate',
            action: 'Review CSP policy'
          }
        ] as any
      }

      expect(report).toBeDefined()
      expect(report.id).toBe('report-123')
      expect(report.statistics.totalThreats).toBe(100)
    })
  })

  describe('Vulnerability interface', () => {
    it('should have all required properties', () => {
      const vulnerability: Vulnerability = {
        id: 'vuln-123',
        name: 'XSS Vulnerability',
        description: 'Cross-site scripting in search',
        severity: 'high',
        cve: 'CVE-2024-1234',
        cwe: 'CWE-79',
        cvss: {
          score: 7.5,
          vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
          severity: 'high'
        },
        impact: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'none'
        },
        exploitability: {
          complexity: 'low',
          vector: 'network',
          authentication: 'none'
        },
        status: 'confirmed',
        solutions: ['Sanitize input', 'Use CSP'],
        patches: ['Patch 1.0.1'],
        workarounds: ['Disable search'],
        createdAt: new Date(),
        updatedAt: new Date(),
        discoveredAt: new Date(),
        patchedAt: new Date()
      }

      expect(vulnerability).toBeDefined()
      expect(vulnerability.id).toBe('vuln-123')
      expect(vulnerability.cve).toBe('CVE-2024-1234')
    })
  })

  describe('Countermeasure interface', () => {
    it('should have all required properties', () => {
      const countermeasure: Countermeasure = {
        id: 'cm-123',
        name: 'WAF Implementation',
        description: 'Web Application Firewall',
        type: 'preventive',
        effectiveness: 0.95,
        implementation: {
          cost: 'medium',
          complexity: 'high',
          time: '2 weeks'
        },
        mitigates: ['threat-123', 'threat-456'],
        status: 'implemented',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(countermeasure).toBeDefined()
      expect(countermeasure.id).toBe('cm-123')
      expect(countermeasure.effectiveness).toBe(0.95)
    })
  })

  describe('RiskAssessment interface', () => {
    it('should have all required properties', () => {
      const assessment: RiskAssessment = {
        overallRisk: 'high',
        scores: {
          inherent: 75,
          residual: 30,
          target: 20
        },
        factors: {
          likelihood: 'likely',
          impact: 'major',
          vulnerability: 80,
          threat: 90
        },
        risks: [
          {
            threatId: 'threat-123',
            vulnerabilityId: 'vuln-123',
            likelihood: 0.8,
            impact: 0.7,
            riskLevel: 'high',
            mitigation: 'Implement WAF'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(assessment).toBeDefined()
      expect(assessment.overallRisk).toBe('high')
      expect(assessment.risks.length).toBe(1)
    })
  })

  describe('ThreatPrediction interface', () => {
    it('should have all required properties', () => {
      const prediction: ThreatPrediction = {
        id: 'pred-123',
        type: 'XSS',
        probability: 0.8,
        confidence: 0.9,
        timeframe: 'immediate',
        severity: 'high',
        indicators: ['Multiple script tags', 'Encoded payloads'],
        recommendations: ['Enable CSP', 'Add input validation'],
        suggestedAction: 'block',
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 3600000)
      }

      expect(prediction).toBeDefined()
      expect(prediction.id).toBe('pred-123')
      expect(prediction.probability).toBe(0.8)
    })
  })

  describe('ThreatDefinition interface', () => {
    it('should have all required properties', () => {
      const definition: ThreatDefinition = {
        id: 'def-123',
        type: 'XSS',
        name: 'Cross-Site Scripting',
        description: 'Script injection attacks',
        severity: 'high',
        patterns: ['<script>', 'onerror=', 'javascript:'],
        conditions: [
          {
            field: 'query',
            operator: 'contains',
            value: '<script>'
          }
        ],
        remediation: 'Encode output, validate input',
        references: ['OWASP XSS Prevention']
      }

      expect(definition).toBeDefined()
      expect(definition.id).toBe('def-123')
      expect(definition.patterns).toContain('<script>')
    })
  })

  describe('ThreatPattern interface', () => {
    it('should have all required properties', () => {
      const pattern: ThreatPattern = {
        id: 'pattern-123',
        name: 'XSS Script Tag',
        pattern: '<script.*?>.*?</script>',
        flags: 'gi',
        confidence: 0.95,
        type: 'XSS',
        examples: ['<script>alert(1)</script>', '<script src="evil.js"></script>']
      }

      expect(pattern).toBeDefined()
      expect(pattern.id).toBe('pattern-123')
      expect(pattern.confidence).toBe(0.95)
    })

    it('should allow optional flags', () => {
      const pattern: ThreatPattern = {
        id: 'pattern-456',
        name: 'SQL Injection',
        pattern: "'.*?('|--|;|/\\*|\\*/|%27)",
        confidence: 0.9,
        type: 'SQL_INJECTION',
        examples: ["' OR 1=1--", "' UNION SELECT *"]
      }

      expect(pattern.flags).toBeUndefined()
    })
  })

  describe('ThreatAnalysis interface', () => {
    it('should have all required properties', () => {
      const analysis: ThreatAnalysis = {
        analysis: {
          pattern: 'XSS pattern detected',
          confidence: 0.95,
          matched: true,
          score: 85
        },
        risk: {
          level: 'high',
          score: 80,
          factors: ['Untrusted input', 'No validation']
        },
        recommendations: {
          immediate: ['Block request', 'Alert admin'],
          longTerm: ['Implement CSP', 'Add WAF'],
          prevention: ['Input validation', 'Output encoding']
        },
        impact: {
          scope: 'Application',
          severity: 80,
          probability: 70,
          damage: 'Data theft possible'
        },
        timestamp: new Date()
      }

      expect(analysis).toBeDefined()
      expect(analysis.analysis.confidence).toBe(0.95)
      expect(analysis.risk.level).toBe('high')
    })
  })

  describe('ThreatDetectorMetrics interface', () => {
    it('should have all required properties', () => {
      const metrics: ThreatDetectorMetrics = {
        totalDetections: 1000,
        truePositives: 850,
        falsePositives: 50,
        trueNegatives: 80,
        falseNegatives: 20,
        accuracy: 0.93,
        precision: 0.94,
        recall: 0.92,
        f1Score: 0.93,
        averageResponseTime: 45,
        lastDetection: new Date()
      }

      expect(metrics).toBeDefined()
      expect(metrics.totalDetections).toBe(1000)
      expect(metrics.accuracy).toBe(0.93)
    })
  })

  describe('ThreatDetectorConfig interface', () => {
    it('should have all required properties', () => {
      const config: ThreatDetectorConfig = {
        enabled: true,
        threshold: 0.8,
        sensitivity: 0.9,
        patterns: ['<script>', 'onerror='],
        exceptions: ['/api/public', '/health'],
        customRules: [],
        aiEnabled: true,
        learningMode: false
      }

      expect(config).toBeDefined()
      expect(config.enabled).toBe(true)
      expect(config.threshold).toBe(0.8)
    })
  })

  describe('ThreatDetectionData interface', () => {
    it('should have all required properties', () => {
      const data: ThreatDetectionData = {
        req: { method: 'GET' },
        res: { statusCode: 200 },
        context: { user: 'test' },
        request: {
          method: 'GET',
          path: '/test',
          ip: '127.0.0.1',
          userAgent: 'test',
          headers: {},
          timestamp: new Date()
        },
        body: { key: 'value' },
        query: { search: 'test' },
        params: { id: '123' },
        headers: { 'User-Agent': 'test' },
        ip: '127.0.0.1',
        userAgent: 'test'
      }

      expect(data).toBeDefined()
      expect(data.ip).toBe('127.0.0.1')
      expect(data.body).toEqual({ key: 'value' })
    })
  })
})