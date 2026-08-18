import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { WebSocketGateway } from './websocket.gateway';
import { ChannelManager } from './channel-manager.service';

describe('WebSocketGateway', () => {
  let gateway: WebSocketGateway;
  let jwtService: { verify: jest.Mock };
  let channelManager: {
    subscribe: jest.Mock;
    unsubscribe: jest.Mock;
    unsubscribeAll: jest.Mock;
    getChannelSubscribers: jest.Mock;
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    jwtService = {
      verify: jest.fn(),
    };
    channelManager = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      unsubscribeAll: jest.fn(),
      getChannelSubscribers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketGateway,
        { provide: JwtService, useValue: jwtService },
        { provide: ChannelManager, useValue: channelManager },
      ],
    }).compile();

    gateway = module.get<WebSocketGateway>(WebSocketGateway);
  });

  afterEach(() => {
    jest.clearAllTimocks?.();
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('authenticates client when valid JWT token is provided in auth payload', async () => {
      const mockClient = {
        id: 'socket-1',
        handshake: {
          auth: { token: 'valid-jwt-token' },
          headers: {},
        },
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as Socket;

      jwtService.verify.mockReturnValue({
        sub: 'user-1',
        email: 'alice@example.com',
        name: 'Alice',
        organizationId: 'org-1',
        role: 'DEVELOPER',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      await gateway.handleConnection(mockClient);

      expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
      expect(mockClient.emit).not.toHaveBeenCalledWith('error', expect.anything());
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('rejects and disconnects client when no token is provided', async () => {
      const mockClient = {
        id: 'socket-2',
        handshake: {
          auth: {},
          headers: {},
        },
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as Socket;

      await gateway.handleConnection(mockClient);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      expect(mockClient.disconnect).toHaveBeenCalled();
    });

    it('rejects connection when JWT token is invalid or expired', async () => {
      const mockClient = {
        id: 'socket-3',
        handshake: {
          auth: { token: 'bad-token' },
          headers: {},
        },
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as Socket;

      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await gateway.handleConnection(mockClient);

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Invalid or expired token',
        code: 'AUTH_FAILED',
      });
      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('cleans up client subscriptions upon disconnect', async () => {
      const mockClient = {
        id: 'socket-1',
      } as unknown as Socket;

      // Add to connected clients map
      (gateway as any).connectedClients.set('socket-1', {
        id: 'socket-1',
        userId: 'user-1',
        email: 'alice@example.com',
        organizationId: 'org-1',
        subscribedChannels: new Set(),
      });

      gateway.handleDisconnect(mockClient);

      expect(channelManager.unsubscribeAll).toHaveBeenCalledWith('socket-1');
      expect((gateway as any).connectedClients.has('socket-1')).toBe(false);
    });
  });

  describe('handleSubscribeDashboard', () => {
    it('subscribes authenticated client to organization dashboard room', () => {
      const mockClient = {
        id: 'socket-1',
        emit: jest.fn(),
        join: jest.fn(),
      } as unknown as Socket;

      (gateway as any).connectedClients.set('socket-1', {
        id: 'socket-1',
        userId: 'user-1',
        organizationId: 'org-1',
        subscribedChannels: new Set(),
      });

      channelManager.subscribe.mockReturnValue('dashboard:org-1');

      gateway.handleSubscribeDashboard(mockClient, { orgId: 'org-1' });

      expect(channelManager.subscribe).toHaveBeenCalledWith(
        'socket-1',
        'user-1',
        'dashboard',
        'org-1',
      );
      expect(mockClient.join).toHaveBeenCalledWith('dashboard:org-1');
      expect(mockClient.emit).toHaveBeenCalledWith('subscribed', { channel: 'dashboard:org-1' });
    });

    it('rejects subscription if client attempts to access unauthorized organization', () => {
      const mockClient = {
        id: 'socket-2',
        emit: jest.fn(),
        join: jest.fn(),
      } as unknown as Socket;

      (gateway as any).connectedClients.set('socket-2', {
        id: 'socket-2',
        userId: 'user-1',
        organizationId: 'org-1',
        subscribedChannels: new Set(),
      });

      gateway.handleSubscribeDashboard(mockClient, { orgId: 'other-org' });

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Access denied to this organization',
        code: 'ACCESS_DENIED',
      });
      expect(mockClient.join).not.toHaveBeenCalled();
    });
  });
});
