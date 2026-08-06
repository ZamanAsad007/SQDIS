import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';

export interface TestModuleOptions {
  providers?: any[];
  controllers?: any[];
  imports?: any[];
  mockPrisma?: boolean;
  mockConfig?: Record<string, any>;
}

/**
 * Standardized test module builder for NestJS unit and integration testing.
 */
export const createTestingModuleBuilder = (options: TestModuleOptions): TestingModuleBuilder => {
  const providers = [...(options.providers || [])];

  if (options.mockPrisma !== false) {
    providers.push({
      provide: PrismaService,
      useValue: createMockPrismaService(),
    });
  }

  providers.push({
    provide: ConfigService,
    useValue: {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (options.mockConfig && key in options.mockConfig) {
          return options.mockConfig[key];
        }
        if (key === 'JWT_SECRET') return 'test-jwt-secret-key-12345';
        if (key === 'PORT') return 3000;
        return defaultValue;
      }),
    },
  });

  providers.push({
    provide: JwtService,
    useValue: {
      sign: jest.fn().mockReturnValue('mock-signed-jwt-token'),
      verify: jest.fn().mockReturnValue({ sub: 'usr-test-uuid-1234' }),
      decode: jest.fn().mockReturnValue({ sub: 'usr-test-uuid-1234' }),
    },
  });

  return Test.createTestingModule({
    imports: options.imports || [],
    controllers: options.controllers || [],
    providers,
  });
};
