import { Injectable, Logger } from '@nestjs/common';
import { ChannelSubscription, ChannelType } from './types/websocket.types';

/**
 * Channel Manager Service
 * Manages WebSocket channel subscriptions
 */
@Injectable()
export class ChannelManager {
  private readonly logger = new Logger(ChannelManager.name);

  // Map of channel name to set of socket IDs
  private readonly channels: Map<string, Set<string>> = new Map();

  // Map of socket ID to set of channel names
  private readonly socketChannels: Map<string, Set<string>> = new Map();

  // Map of channel name to subscription details
  private readonly subscriptions: Map<string, Map<string, ChannelSubscription>> = new Map();

  /**
   * Generate channel name from type and ID
   */
  getChannelName(type: ChannelType, id: string): string {
    return `${type}:${id}`;
  }

  /**
   * Subscribe a socket to a channel
   */
  subscribe(socketId: string, userId: string, channelType: ChannelType, channelId: string): string {
    const channelName = this.getChannelName(channelType, channelId);

    // Add socket to channel
    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, new Set());
      this.subscriptions.set(channelName, new Map());
    }
    this.channels.get(channelName)!.add(socketId);

    // Add channel to socket's subscriptions
    if (!this.socketChannels.has(socketId)) {
      this.socketChannels.set(socketId, new Set());
    }
    this.socketChannels.get(socketId)!.add(channelName);

    // Store subscription details
    const subscription: ChannelSubscription = {
      type: channelType,
      id: channelId,
      socketId,
      userId,
      subscribedAt: new Date(),
    };
    this.subscriptions.get(channelName)!.set(socketId, subscription);

    this.logger.debug(`Socket ${socketId} subscribed to channel ${channelName}`);

    return channelName;
  }

  /**
   * Unsubscribe a socket from a channel
   */
  unsubscribe(socketId: string, channelName: string): boolean {
    // Remove socket from channel
    const channelSockets = this.channels.get(channelName);
    if (channelSockets) {
      channelSockets.delete(socketId);

      // Clean up empty channels
      if (channelSockets.size === 0) {
        this.channels.delete(channelName);
        this.subscriptions.delete(channelName);
      } else {
        // Remove subscription details
        this.subscriptions.get(channelName)?.delete(socketId);
      }
    }

    // Remove channel from socket's subscriptions
    const socketSubs = this.socketChannels.get(socketId);
    if (socketSubs) {
      socketSubs.delete(channelName);
    }

    this.logger.debug(`Socket ${socketId} unsubscribed from channel ${channelName}`);

    return true;
  }

  /**
   * Unsubscribe a socket from all channels
   * Called on disconnect
   */
  unsubscribeAll(socketId: string): string[] {
    const channels = this.socketChannels.get(socketId);
    const unsubscribedChannels: string[] = [];

    if (channels) {
      for (const channelName of channels) {
        this.unsubscribe(socketId, channelName);
        unsubscribedChannels.push(channelName);
      }
      this.socketChannels.delete(socketId);
    }

    this.logger.debug(`Socket ${socketId} unsubscribed from all channels`);

    return unsubscribedChannels;
  }

  /**
   * Get all socket IDs subscribed to a channel
   */
  getChannelSubscribers(channelName: string): string[] {
    const sockets = this.channels.get(channelName);
    return sockets ? Array.from(sockets) : [];
  }

  /**
   * Get all channels a socket is subscribed to
   */
  getSocketChannels(socketId: string): string[] {
    const channels = this.socketChannels.get(socketId);
    return channels ? Array.from(channels) : [];
  }

  /**
   * Check if a socket is subscribed to a channel
   */
  isSubscribed(socketId: string, channelName: string): boolean {
    const channels = this.socketChannels.get(socketId);
    return channels ? channels.has(channelName) : false;
  }

  /**
   * Get subscription details for a channel
   */
  getSubscriptionDetails(channelName: string): ChannelSubscription[] {
    const subs = this.subscriptions.get(channelName);
    return subs ? Array.from(subs.values()) : [];
  }

  /**
   * Get total number of active channels
   */
  getActiveChannelCount(): number {
    return this.channels.size;
  }

  /**
   * Get total number of active subscriptions
   */
  getTotalSubscriptionCount(): number {
    let count = 0;
    for (const sockets of this.channels.values()) {
      count += sockets.size;
    }
    return count;
  }

  /**
   * Get all sockets subscribed to organization dashboard
   */
  getDashboardSubscribers(orgId: string): string[] {
    return this.getChannelSubscribers(this.getChannelName('dashboard', orgId));
  }

  /**
   * Get all sockets subscribed to a team
   */
  getTeamSubscribers(teamId: string): string[] {
    return this.getChannelSubscribers(this.getChannelName('team', teamId));
  }

  /**
   * Get all sockets subscribed to a developer
   */
  getDeveloperSubscribers(developerId: string): string[] {
    return this.getChannelSubscribers(this.getChannelName('developer', developerId));
  }
}
