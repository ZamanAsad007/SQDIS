import { createMockPrismaService } from '../mocks/prisma.mock';
import { mockUserFixture, createMockJwtPayload, createMockAuthHeaders } from './auth-test-helper';
import { createTestingModuleBuilder } from './test-module.builder';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Test Infrastructure Mocks & Utilities (Commit 1)', () => {
  describe('Prisma Mock Factory', () => {
    it('should initialize all model CRUD methods as jest mocks', () => {
      const mockPrisma = createMockPrismaService();
      expect(mockPrisma.user.findUnique).toBeDefined();
      expect(mockPrisma.organization.create).toBeDefined();
      expect(mockPrisma.project.findMany).toBeDefined();
      expect(mockPrisma.$transaction).toBeDefined();
    });

    it('should simulate transaction callback execution', async () => {
      const mockPrisma = createMockPrismaService();
      const mockResult = { id: 'test-123' };
      
      const result = await mockPrisma.$transaction(async (tx: any) => {
        return mockResult;
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe('Auth Test Helpers', () => {
    it('should generate valid mock user fixtures and auth headers', () => {
      expect(mockUserFixture.id).toBeDefined();
      const payload = createMockJwtPayload({ role: 'OWNER' });
      expect(payload.role).toBe('OWNER');

      const headers = createMockAuthHeaders('my-secret-token');
      expect(headers.Authorization).toBe('Bearer my-secret-token');
    });
  });

  describe('Test Module Builder', () => {
    it('should compile NestJS module with mocked providers', async () => {
      const moduleRef = await createTestingModuleBuilder({
        providers: [],
      }).compile();

      const prisma = moduleRef.get<PrismaService>(PrismaService);
      expect(prisma).toBeDefined();
      expect(prisma.user.findMany).toBeDefined();
    });
  });
});
