import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnboardingService } from './onboarding.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressTrackingService } from './services/progress-tracking.service';
import { createMockPrismaService, MockPrismaService } from '../../../test/mocks/prisma.mock';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService() as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          provide: ProgressTrackingService,
          useValue: { calculateProgress: jest.fn().mockResolvedValue({ overallProgress: 50 }) },
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if user is not in organization', async () => {
      prisma.organizationMember.findFirst.mockResolvedValue(null);

      await expect(
        service.create('org-123', { userId: 'usr-456' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user already has active onboarding', async () => {
      prisma.organizationMember.findFirst.mockResolvedValue({ id: 'mem-1' });
      prisma.onboarding.findUnique.mockResolvedValue({
        id: 'onb-1',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(),
        checklistItems: [],
        milestones: [],
        user: { teamMemberships: [] },
      } as any);

      await expect(
        service.create('org-123', { userId: 'usr-456' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should create onboarding process successfully when user is valid', async () => {
      prisma.organizationMember.findFirst.mockResolvedValue({ id: 'mem-1' });
      
      const createdOnboarding = {
        id: 'onb-new-123',
        userId: 'usr-456',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        checklistItems: [],
        milestones: [],
        user: { id: 'usr-456', name: 'Test User', email: 'test@sqdis.dev', teamMemberships: [] },
      };
      
      // First call (check existing) returns null, second call (findById) returns created object
      prisma.onboarding.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createdOnboarding as any);

      prisma.onboarding.create.mockResolvedValue(createdOnboarding as any);
      prisma.commit.count.mockResolvedValue(5);
      prisma.dQSScore.findFirst.mockResolvedValue(null);

      const result = await service.create('org-123', { userId: 'usr-456' } as any);

      expect(prisma.onboarding.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe('onb-new-123');
    });
  });
});
