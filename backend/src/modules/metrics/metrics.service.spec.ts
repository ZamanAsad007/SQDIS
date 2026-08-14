import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize Prometheus counters and gauges', () => {
    expect(service.httpRequestsTotal).toBeDefined();
    expect(service.dbQueriesTotal).toBeDefined();
    expect(service.redisOperationsTotal).toBeDefined();
    expect(service.bullmqJobsTotal).toBeDefined();
    expect(service.mlPredictionsTotal).toBeDefined();
    expect(service.webhooksReceivedTotal).toBeDefined();
  });

  it('should return metrics in Prometheus text format', async () => {
    service.httpRequestsTotal.inc({ method: 'GET', path: '/api/v1/projects', status_code: '200' });
    const metricsOutput = await service.getMetrics();

    expect(typeof metricsOutput).toBe('string');
    expect(metricsOutput).toContain('sqdis_http_requests_total');
    expect(metricsOutput).toContain('status_code="200"');
  });

  it('should return Prometheus content type string', () => {
    const contentType = service.getContentType();
    expect(contentType).toBeDefined();
    expect(typeof contentType).toBe('string');
  });
});
