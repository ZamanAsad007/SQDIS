import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/mocks/prisma.mock';

describe('ReleasesService', () => {
  let service: ReleasesService;
  let prisma: MockPrismaService;

  const mockRelease = {
    id: 'rel-123',
    version: 'v1.0.0',
    targetDate: new Date('2026-12-01'),
    description: 'Q4 Major Release',
    organizationId: 'org-123',
    isActive: true,
    sprintAssociations: [],
  };

  beforeEach(async () => {
    prisma = createMockPrismaService() as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleasesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ReleasesService>(ReleasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if release version already exists', async () => {
      prisma.release.findFirst.mockResolvedValue(mockRelease as any);

      await expect(
        service.create({ version: 'v1.0.0', targetDate: '2026-12-01' }, 'org-123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create release successfully when version is unique', async () => {
      prisma.release.findFirst.mockResolvedValue(null);
      prisma.release.create.mockResolvedValue(mockRelease as any);

      const result = await service.create(
        { version: 'v1.0.0', targetDate: '2026-12-01', description: 'Q4 Major Release' },
        'org-123',
      );

      expect(prisma.release.create).toHaveBeenCalled();
      expect(result.version).toBe('v1.0.0');
    });
  });

  describe('findAll', () => {
    it('should return list of active releases for organization', async () => {
      prisma.release.findMany.mockResolvedValue([mockRelease] as any);

      const result = await service.findAll('org-123');

      expect(prisma.release.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org-123', isActive: true },
        }),
      );
      expect(result).toHaveLength(1);
    });
  });
});
