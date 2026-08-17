import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { EnhancedAuditLogService } from './enhanced-audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let enhancedAuditLogService: {
    logPermissionCheck: jest.Mock;
    logAction: jest.Mock;
    logRoleChange: jest.Mock;
    queryLogs: jest.Mock;
  };

  beforeEach(async () => {
    enhancedAuditLogService = {
      logPermissionCheck: jest.fn().mockResolvedValue(undefined),
      logAction: jest.fn().mockResolvedValue(undefined),
      logRoleChange: jest.fn().mockResolvedValue(undefined),
      queryLogs: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'audit-1',
            action: 'PROJECT_CREATE',
            userId: 'user-1',
            organizationId: 'org-1',
            timestamp: new Date('2026-01-01T00:00:00.000Z'),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 50,
        totalPages: 1,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: EnhancedAuditLogService, useValue: enhancedAuditLogService },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates logPermissionCheck to EnhancedAuditLogService', async () => {
    const entry = {
      userId: 'user-1',
      permission: 'repo:write',
      granted: true,
      resourceType: 'repository',
      resourceId: 'repo-1',
    };

    await service.logPermissionCheck(entry);

    expect(enhancedAuditLogService.logPermissionCheck).toHaveBeenCalledWith(entry);
  });

  it('delegates logAction to EnhancedAuditLogService', async () => {
    const entry = {
      userId: 'user-1',
      organizationId: 'org-1',
      action: 'UPDATE_SETTINGS',
      resourceType: 'organization',
      resourceId: 'org-1',
      details: { field: 'name', value: 'ACME Corp' },
    };

    await service.logAction(entry);

    expect(enhancedAuditLogService.logAction).toHaveBeenCalledWith(entry);
  });

  it('delegates logRoleChange to EnhancedAuditLogService', async () => {
    const entry = {
      performedBy: 'admin-1',
      targetUserId: 'user-2',
      organizationId: 'org-1',
      previousRole: 'DEVELOPER',
      newRole: 'TEAM_LEAD',
    };

    await service.logRoleChange(entry as any);

    expect(enhancedAuditLogService.logRoleChange).toHaveBeenCalledWith(entry);
  });

  it('queries logs with filters and default pagination', async () => {
    const filters = {
      organizationId: 'org-1',
      action: 'PROJECT_CREATE',
    };

    const result = await service.queryLogs(filters);

    expect(enhancedAuditLogService.queryLogs).toHaveBeenCalledWith(
      filters,
      expect.objectContaining({ page: 1, pageSize: 50, sortBy: 'timestamp', sortOrder: 'desc' }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});
