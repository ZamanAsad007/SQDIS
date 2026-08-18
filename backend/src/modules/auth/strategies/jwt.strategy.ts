import { Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../types/jwt-payload.types';
import { getRequiredJwtSecret } from '../utils/jwt-secret.util';
import { PrismaService } from '../../../prisma';

/**
 * JWT Strategy for Passport authentication
 * Validates JWT tokens and extracts user information
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
    @Optional() private readonly prisma?: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getRequiredJwtSecret(configService),
    });
  }

  /**
   * Validate JWT payload and return user
   * Called automatically by Passport after token verification
   */
  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    let organizationId = payload.organizationId;
    let role = payload.role;

    if ((!organizationId || !role) && this.prisma?.organizationMember) {
      try {
        const membership = await this.prisma.organizationMember.findFirst({
          where: { userId: user.id },
          orderBy: { joinedAt: 'asc' },
        });

        if (membership) {
          organizationId = organizationId || membership.organizationId;
          role = role || membership.role;
        }
      } catch {
        // Fallback gracefully if database lookup fails
      }
    }

    // Return user object that will be attached to request
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId,
      role: role || 'DEVELOPER',
    };
  }
}
