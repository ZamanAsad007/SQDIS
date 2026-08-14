import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<Partial<AuthService>>;

  const mockUser = {
    id: 'usr-123',
    email: 'test@sqdis.dev',
    name: 'Test User',
  };

  beforeEach(async () => {
    authService = {
      validateUserById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-jwt-secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate payload and return user session object', async () => {
      (authService.validateUserById as jest.Mock).mockResolvedValue(mockUser);

      const payload = {
        sub: 'usr-123',
        email: 'test@sqdis.dev',
        role: 'ADMIN',
        organizationId: 'org-456',
      };

      const result = await strategy.validate(payload as any);

      expect(authService.validateUserById).toHaveBeenCalledWith('usr-123');
      expect(result).toEqual({
        id: 'usr-123',
        email: 'test@sqdis.dev',
        name: 'Test User',
        organizationId: 'org-456',
        role: 'ADMIN',
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      (authService.validateUserById as jest.Mock).mockResolvedValue(null);

      const payload = { sub: 'usr-nonexistent' };

      await expect(strategy.validate(payload as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
