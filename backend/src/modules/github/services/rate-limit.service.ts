/*eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { CacheService } from '../../cache/cache.service';

/**
 * Rate limit result returned by checkRateLimit
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Rate limit configuration for an organization
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  enabled: boolean;
}

/**
 * Service for rate limiting webhook requests using Redis sliding window
 */
@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Get default requests per minute from environment variable
   */
  private getDefaultRequestsPerMinute(): number {
    return parseInt(process.env.WEBHOOK_RATE_LIMIT_DEFAULT || '100', 10);
  }

  /**
   * Check if request is within rate limit using sliding window algorithm
   *
   * @param repositoryId - Repository ID to check rate limit for
   * @returns Rate limit result with allowed status, remaining requests, and reset time
   */
  async checkRateLimit(repositoryId: string): Promise<RateLimitResult> {
    // Get repository to find organization
    const repository = await this.prisma.repository.findUnique({
      where: { id: repositoryId },
      select: { organizationId: true },
    });

    if (!repository) {
      this.logger.warn(`Repository ${repositoryId} not found for rate limiting`);
      // Allow request if repository not found (fail open)
      return {
        allowed: true,
        remaining: this.getDefaultRequestsPerMinute(),
        resetAt: this.getNextMinuteReset(),
      };
    }

    // Get rate limit configuration
    const config = await this.getRateLimitConfig(repository.organizationId);

    // If rate limiting is disabled, allow all requests
    if (!config.enabled) {
      return {
        allowed: true,
        remaining: config.requestsPerMinute,
        resetAt: this.getNextMinuteReset(),
      };
    }

    // Check Redis for current count using sliding window
    const key = this.buildRateLimitKey(repositoryId);
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute ago

    if (!this.cache.isAvailable()) {
      this.logger.warn('Redis unavailable, allowing request (fail open)');
      return {
        allowed: true,
        remaining: config.requestsPerMinute,
        resetAt: this.getNextMinuteReset(),
      };
    }

    // Get count of requests in the sliding window
    const count = await this.getRequestCount(key, windowStart, now);

    const allowed = count < config.requestsPerMinute;
    const remaining = Math.max(0, config.requestsPerMinute - count);

    if (!allowed) {
      this.logger.warn(
        `Rate limit exceeded for repository ${repositoryId}: ${count}/${config.requestsPerMinute} requests`,
      );
    }

    return {
      allowed,
      remaining,
      resetAt: this.getNextMinuteReset(),
    };
  }

  /**
   * Increment request count for repository using sorted set
   *
   * @param repositoryId - Repository ID to increment count for
   */
  async incrementCount(repositoryId: string): Promise<void> {
    if (!this.cache.isAvailable()) {
      this.logger.warn('Redis unavailable, skipping rate limit increment');
      return;
    }

    const key = this.buildRateLimitKey(repositoryId);
    const now = Date.now();
    const requestId = `${now}-${Math.random()}`;

    try {
      // Add request to sorted set with timestamp as score
      await this.addRequest(key, requestId, now);

      // Remove old requests outside the window (older than 1 minute)
      const windowStart = now - 60000;
      await this.removeOldRequests(key, windowStart);

      // Set expiration on the key to clean up after 2 minutes
      await this.setExpiration(key, 120);

      this.logger.debug(`Incremented rate limit count for repository ${repositoryId}`);
    } catch (error) {
      this.logger.error(`Failed to increment rate limit count: ${error}`);
    }
  }

  /**
   * Get rate limit configuration for organization
   *
   * @param organizationId - Organization ID
   * @returns Rate limit configuration
   */
  async getRateLimitConfig(organizationId: string): Promise<RateLimitConfig> {
    const config = await this.prisma.webhookRateLimit.findUnique({
      where: { organizationId },
    });

    if (!config) {
      // Return default configuration
      return {
        requestsPerMinute: this.getDefaultRequestsPerMinute(),
        enabled: true,
      };
    }

    return {
      requestsPerMinute: config.requestsPerMinute,
      enabled: config.enabled,
    };
  }

  /**
   * Update rate limit configuration for organization
   *
   * @param organizationId - Organization ID
   * @param config - New rate limit configuration
   */
  async updateRateLimitConfig(organizationId: string, config: RateLimitConfig): Promise<void> {
    await this.prisma.webhookRateLimit.upsert({
      where: { organizationId },
      create: {
        organizationId,
        requestsPerMinute: config.requestsPerMinute,
        enabled: config.enabled,
      },
      update: {
        requestsPerMinute: config.requestsPerMinute,
        enabled: config.enabled,
      },
    });

    this.logger.log(
      `Updated rate limit config for organization ${organizationId}: ${config.requestsPerMinute} req/min, enabled: ${config.enabled}`,
    );
  }

  /**
   * Build Redis key for rate limiting
   * @param repositoryId - Repository ID
   * @returns Redis key
   */
  private buildRateLimitKey(repositoryId: string): string {
    return `rate_limit:webhook:${repositoryId}`;
  }

  /**
   * Get the next minute reset time
   * @returns Date object for the start of the next minute
   */
  private getNextMinuteReset(): Date {
    const now = new Date();
    const nextMinute = new Date(now);
    nextMinute.setSeconds(0, 0);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    return nextMinute;
  }

  /**
   * Get request count in the sliding window using Redis sorted set
   * @param key - Redis key
   * @param windowStart - Start of the window (timestamp)
   * @param windowEnd - End of the window (timestamp)
   * @returns Number of requests in the window
   */
  private async getRequestCount(
    key: string,
    windowStart: number,
    windowEnd: number,
  ): Promise<number> {
    try {
      // Use Redis ZCOUNT to count requests in the time window
      const redis = (this.cache as any).redis;
      if (!redis) {
        return 0;
      }

      const count = await redis.zcount(key, windowStart, windowEnd);
      return count;
    } catch (error) {
      this.logger.error(`Failed to get request count: ${error}`);
      return 0;
    }
  }

  /**
   * Add a request to the sorted set
   * @param key - Redis key
   * @param requestId - Unique request identifier
   * @param timestamp - Request timestamp
   */
  private async addRequest(key: string, requestId: string, timestamp: number): Promise<void> {
    const redis = (this.cache as any).redis;
    if (!redis) {
      return;
    }

    await redis.zadd(key, timestamp, requestId);
  }

  /**
   * Remove old requests outside the sliding window
   * @param key - Redis key
   * @param windowStart - Start of the window (timestamp)
   */
  private async removeOldRequests(key: string, windowStart: number): Promise<void> {
    const redis = (this.cache as any).redis;
    if (!redis) {
      return;
    }

    await redis.zremrangebyscore(key, '-inf', windowStart);
  }

  /**
   * Set expiration on the Redis key
   * @param key - Redis key
   * @param seconds - Expiration time in seconds
   */
  private async setExpiration(key: string, seconds: number): Promise<void> {
    const redis = (this.cache as any).redis;
    if (!redis) {
      return;
    }

    await redis.expire(key, seconds);
  }
}
