import { MetricsModule } from '../../../src/modules/metrics/MetricsModule';
import { ConfigManager } from '../../../src/core/ConfigManager';

describe('MetricsModule', () => {
  let metricsModule: MetricsModule;
  let config: ConfigManager;

  beforeEach(() => {
    config = new ConfigManager({
      metrics: { enabled: true }
    });
    metricsModule = new MetricsModule(config);
  });

  test('should create instance', () => {
    expect(metricsModule).toBeDefined();
  });

  test('should collect metrics', () => {
    const metrics = metricsModule.collect();
    expect(metrics).toBeDefined();
  });

  test('should export metrics', () => {
    const exported = metricsModule.export('json');
    expect(exported).toBeDefined();
  });

  test('should reset metrics', () => {
    metricsModule.reset();
    const metrics = metricsModule.collect();
    expect(metrics).toBeDefined();
  });
});
