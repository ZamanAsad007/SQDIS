import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { WebhookStatus } from '@prisma/client';
import { CommitProcessorQueue } from '../queues/commit-processor.queue';

/**
 * Webhook health metrics for a repository
 */
export interface WebhookHealthMetrics {
  repositoryId: string;
  repositoryName: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  averageResponseTimeMs: number;
  eventTypeCounts: Record<string, number>;
  period: string;
}

/**
 * Queue statistics across all queues
 */
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

/**
 * Service for monitoring webhook health and performance
 */
@Injectable()
export class WebhookMonitoringService {
  private readonly logger = new Logger(WebhookMonitoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly commitProcessorQueue: CommitProcessorQueue,
  ) {}

  /**
   * Get webhook health metrics for a repository over a time period
   *
   * @param repositoryId - Internal repository ID
   * @param period - Time period (24h, 7d, 30d)
   * @returns Webhook health metrics
   */
  async getHealthMetrics(
    repositoryId: string,
    period: '24h' | '7d' | '30d',
  ): Promise<WebhookHealthMetrics> {
    const { startDate, endDate } = this.getDateRange(period);

    // Get repository name
    const repository = await this.prisma.repository.findUnique({
      where: { id: repositoryId },
      select: { fullName: true },
    });

    if (!repository) {
      throw new Error(`Repository ${repositoryId} not found`);
    }

    // Query webhook logs for the period
    const logs = await this.prisma.webhookLog.findMany({
      where: {
        repositoryId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate metrics
    const totalDeliveries = logs.length;
    const successfulDeliveries = logs.filter((log) => log.status === WebhookStatus.SUCCESS).length;
    const failedDeliveries = logs.filter((log) => log.status === WebhookStatus.FAILED).length;
    const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

    // Calculate average response time (only for completed logs)
    const completedLogs = logs.filter((log) => log.responseTimeMs !== null);
    const averageResponseTimeMs =
      completedLogs.length > 0
        ? completedLogs.reduce((sum, log) => sum + (log.responseTimeMs || 0), 0) /
          completedLogs.length
        : 0;

    // Count events by type
    const eventTypeCounts: Record<string, number> = {};
    for (const log of logs) {
      eventTypeCounts[log.eventType] = (eventTypeCounts[log.eventType] || 0) + 1;
    }

    this.logger.debug(
      `Health metrics for ${repository.fullName} (${period}): ${totalDeliveries} deliveries, ${successRate.toFixed(1)}% success rate`,
    );

    return {
      repositoryId,
      repositoryName: repository.fullName,
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      successRate,
      averageResponseTimeMs,
      eventTypeCounts,
      period,
    };
  }

  /**
   * Get webhook health metrics for all repositories in an organization
   *
   * @param organizationId - Organization ID
   * @param period - Time period (24h, 7d, 30d)
   * @returns Array of webhook health metrics for each repository
   */
  async getOrganizationMetrics(
    organizationId: string,
    period: '24h' | '7d' | '30d',
  ): Promise<WebhookHealthMetrics[]> {
    // Get all repositories for the organization
    const repositories = await this.prisma.repository.findMany({
      where: { organizationId },
      select: { id: true },
    });

    // Get metrics for each repository
    const metricsPromises = repositories.map((repo) => this.getHealthMetrics(repo.id, period));

    const metrics = await Promise.all(metricsPromises);

    this.logger.log(
      `Retrieved organization metrics for ${repositories.length} repositories (${period})`,
    );

    return metrics;
  }

  /**
   * Get queue statistics across all webhook processing queues
   *
   * @returns Queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    const queueStats = await this.commitProcessorQueue.getQueueStats();

    // Aggregate stats across all queues
    const stats: QueueStats = {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    };

    // Sum up stats from all queue types
    for (const queueType of Object.values(queueStats)) {
      stats.waiting += queueType.waiting || 0;
      stats.active += queueType.active || 0;
      stats.completed += queueType.completed || 0;
      stats.failed += queueType.failed || 0;
      stats.delayed += queueType.delayed || 0;
    }

    this.logger.debug(
      `Queue stats: ${stats.waiting} waiting, ${stats.active} active, ${stats.failed} failed`,
    );

    return stats;
  }

  /**
   * Check if failure rate exceeds threshold and create alert
   *
   * @param repositoryId - Internal repository ID
   */
  async checkFailureRate(repositoryId: string): Promise<void> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Get logs from the last hour
    const logs = await this.prisma.webhookLog.findMany({
      where: {
        repositoryId,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (logs.length === 0) {
      return; // No deliveries in the last hour
    }

    const failedCount = logs.filter((log) => log.status === WebhookStatus.FAILED).length;
    const failureRate = (failedCount / logs.length) * 100;

    if (failureRate > 10) {
      const repository = await this.prisma.repository.findUnique({
        where: { id: repositoryId },
        select: { fullName: true },
      });

      this.logger.warn(
        `ALERT: Webhook failure rate for ${repository?.fullName || repositoryId} exceeds 10% (${failureRate.toFixed(1)}% over last hour)`,
      );

      // In a production system, this would create an alert in an alerting system
      // For now, we just log the alert
    }
  }

  /**
   * Get date range for a time period
   *
   * @param period - Time period (24h, 7d, 30d)
   * @returns Start and end dates
   */
  private getDateRange(period: '24h' | '7d' | '30d'): {
    startDate: Date;
    endDate: Date;
  } {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    return { startDate, endDate };
  }
}
