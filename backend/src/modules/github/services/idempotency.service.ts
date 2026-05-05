import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { WebhookProcessingResult } from './webhook.service';

/**
 * Service for ensuring webhook events are processed exactly once
 */
@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a delivery has already been processed
   *
   * @param deliveryId - X-GitHub-Delivery header value
   * @returns True if delivery has been processed, false otherwise
   */
  async isProcessed(deliveryId: string): Promise<boolean> {
    const record = await this.prisma.webhookIdempotency.findUnique({
      where: { deliveryId },
    });

    const isProcessed = record !== null;

    if (isProcessed) {
      this.logger.log(`Delivery ${deliveryId} has already been processed`);
    }

    return isProcessed;
  }

  /**
   * Mark a delivery as processed with result
   *
   * @param deliveryId - X-GitHub-Delivery header value
   * @param result - Processing result to cache
   */
  async markProcessed(deliveryId: string, result: WebhookProcessingResult): Promise<void> {
    const retentionDays = parseInt(process.env.WEBHOOK_IDEMPOTENCY_RETENTION_DAYS || '7', 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    await this.prisma.webhookIdempotency.create({
      data: {
        deliveryId,
        result: result as any, // Prisma Json type
        expiresAt,
      },
    });

    this.logger.log(
      `Marked delivery ${deliveryId} as processed with result: ${result.success ? 'success' : 'failed'}`,
    );
  }

  /**
   * Get cached result for a processed delivery
   *
   * @param deliveryId - X-GitHub-Delivery header value
   * @returns Cached processing result or null if not found
   */
  async getCachedResult(deliveryId: string): Promise<WebhookProcessingResult | null> {
    const record = await this.prisma.webhookIdempotency.findUnique({
      where: { deliveryId },
    });

    if (!record) {
      return null;
    }

    this.logger.log(`Retrieved cached result for delivery ${deliveryId}`);

    return record.result as unknown as WebhookProcessingResult;
  }

  /**
   * Clean up old idempotency records (older than retention period)
   *
   * @returns Number of deleted records
   */
  async cleanupOldRecords(): Promise<number> {
    const now = new Date();

    const result = await this.prisma.webhookIdempotency.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    const retentionDays = parseInt(process.env.WEBHOOK_IDEMPOTENCY_RETENTION_DAYS || '7', 10);
    this.logger.log(
      `Cleaned up ${result.count} idempotency records older than ${retentionDays} days`,
    );

    return result.count;
  }
}
