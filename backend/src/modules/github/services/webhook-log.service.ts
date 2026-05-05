import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { WebhookStatus } from '@prisma/client';

/**
 * Webhook log entry
 */
export interface WebhookLog {
  id: string;
  deliveryId: string;
  eventType: string;
  repositoryId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  responseTimeMs: number | null;
  errorMessage: string | null;
  payloadSize: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service for managing webhook delivery logs
 */
@Injectable()
export class WebhookLogService {
  private readonly logger = new Logger(WebhookLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a webhook log entry when webhook is received
   *
   * @param deliveryId - X-GitHub-Delivery header value
   * @param eventType - X-GitHub-Event header value
   * @param repositoryId - Internal repository ID
   * @param payload - Raw webhook payload
   * @returns Created webhook log
   */
  async createLog(
    deliveryId: string,
    eventType: string,
    repositoryId: string,
    payload: string,
  ): Promise<WebhookLog> {
    const payloadSize = Buffer.byteLength(payload, 'utf8');

    const log = await this.prisma.webhookLog.create({
      data: {
        deliveryId,
        eventType,
        repositoryId,
        payloadSize,
        payload, // Store the payload for retry functionality
        status: WebhookStatus.PENDING,
      },
    });

    this.logger.log(
      `Created webhook log: deliveryId=${deliveryId}, eventType=${eventType}, size=${payloadSize}`,
    );

    return {
      id: log.id,
      deliveryId: log.deliveryId,
      eventType: log.eventType,
      repositoryId: log.repositoryId,
      status: log.status,
      responseTimeMs: log.responseTimeMs,
      errorMessage: log.errorMessage,
      payloadSize: log.payloadSize,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }

  /**
   * Update webhook log with processing result
   *
   * @param deliveryId - X-GitHub-Delivery header value
   * @param status - Processing status (success or failed)
   * @param responseTimeMs - Processing duration in milliseconds
   * @param errorMessage - Error message if processing failed
   */
  async updateLog(
    deliveryId: string,
    status: 'success' | 'failed',
    responseTimeMs: number,
    errorMessage?: string,
  ): Promise<void> {
    const webhookStatus = status === 'success' ? WebhookStatus.SUCCESS : WebhookStatus.FAILED;

    await this.prisma.webhookLog.update({
      where: { deliveryId },
      data: {
        status: webhookStatus,
        responseTimeMs,
        errorMessage: errorMessage || null,
      },
    });

    this.logger.log(
      `Updated webhook log: deliveryId=${deliveryId}, status=${status}, responseTime=${responseTimeMs}ms`,
    );
  }

  /**
   * Query webhook logs by repository and date range
   *
   * @param repositoryId - Internal repository ID
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @param status - Optional status filter
   * @returns Array of webhook logs
   */
  async queryLogs(
    repositoryId: string,
    startDate: Date,
    endDate: Date,
    status?: 'success' | 'failed',
  ): Promise<WebhookLog[]> {
    const webhookStatus = status
      ? status === 'success'
        ? WebhookStatus.SUCCESS
        : WebhookStatus.FAILED
      : undefined;

    const logs = await this.prisma.webhookLog.findMany({
      where: {
        repositoryId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(webhookStatus && { status: webhookStatus }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return logs.map((log) => ({
      id: log.id,
      deliveryId: log.deliveryId,
      eventType: log.eventType,
      repositoryId: log.repositoryId,
      status: log.status,
      responseTimeMs: log.responseTimeMs,
      errorMessage: log.errorMessage,
      payloadSize: log.payloadSize,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    }));
  }

  /**
   * Clean up old webhook logs (older than retention period)
   *
   * @returns Number of deleted logs
   */
  async cleanupOldLogs(): Promise<number> {
    const retentionDays = parseInt(process.env.WEBHOOK_LOG_RETENTION_DAYS || '30', 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.webhookLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} webhook logs older than ${retentionDays} days`);

    return result.count;
  }

  /**
   * Get webhook log by delivery ID with payload
   * Used for manual retry functionality
   *
   * @param deliveryId - X-GitHub-Delivery header value
   * @returns Webhook log with payload, or null if not found
   */
  async getLogByDeliveryId(
    deliveryId: string,
  ): Promise<(WebhookLog & { payload: string | null }) | null> {
    const log = await this.prisma.webhookLog.findUnique({
      where: { deliveryId },
      include: {
        repository: true,
      },
    });

    if (!log) {
      return null;
    }

    return {
      id: log.id,
      deliveryId: log.deliveryId,
      eventType: log.eventType,
      repositoryId: log.repositoryId,
      status: log.status,
      responseTimeMs: log.responseTimeMs,
      errorMessage: log.errorMessage,
      payloadSize: log.payloadSize,
      payload: log.payload,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }
}
