/*eslint-disable*/
import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtPayload } from '../../auth/types/jwt-payload.types';

/**
 * WebSocket Authentication Guard
 * Validates JWT tokens for WebSocket connections
 */
@Injectable()
export class WebSocketAuthGuard implements CanActivate {
  private readonly logger = new Logger(WebSocketAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    return this.validateClient(client);
  }

  /**
   * Validate client connection and extract user context
   */
  validateClient(client: Socket): boolean {
    try {
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Authentication token required');
      }

      const payload = this.jwtService.verify<JwtPayload>(token);

      // Attach user context to socket
      (client as any).userId = payload.sub;
      (client as any).email = payload.email;
      (client as any).name = payload.name;
      (client as any).organizationId = payload.organizationId;
      (client as any).role = payload.role;
      (client as any).subscribedChannels = new Set<string>();

      return true;
    } catch (error) {
      this.logger.warn(`WebSocket authentication failed: ${error.message}`);
      throw new WsException('Invalid or expired token');
    }
  }

  /**
   * Extract JWT token from socket handshake
   * Supports both query parameter and auth header
   */
  private extractToken(client: Socket): string | null {
    // Try to get token from handshake auth
    const authToken = client.handshake.auth?.token;
    if (authToken) {
      return authToken;
    }

    // Try to get token from query parameter
    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    // Try to get token from Authorization header
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}
