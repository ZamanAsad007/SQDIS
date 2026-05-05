/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebhookLogService } from './webhook-log.service';
import { IdempotencyService } from './idempotency.service';

/**
 * Service for scheduled cleanup of webhook-related data
 */
@Injectable()
export class WebhookCleanupService {
  private readonly logger = new Logger(WebhookCleanupService.name);

  constructor(
    private readonly webhookLogService: WebhookLogService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  /**
   * Scheduled job for webhook log cleanup
   * Runs daily at midnight to delete logs older than retention period
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupWebhookLogs(): Promise<void> {
    this.logger.log('Starting scheduled webhook log cleanup...');

    try {
      const deletedCount = await this.webhookLogService.cleanupOldLogs();
      this.logger.log(`Webhook log cleanup completed: ${deletedCount} logs deleted`);
    } catch (error) {
      this.logger.error(`Error during webhook log cleanup: ${error.message}`, error.stack);
    }
  }

  /**
   * Scheduled job for idempotency record cleanup
   * Runs daily at midnight to delete records older than retention period
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupIdempotencyRecords(): Promise<void> {
    this.logger.log('Starting scheduled idempotency record cleanup...');

    try {
      const deletedCount = await this.idempotencyService.cleanupOldRecords();
      this.logger.log(`Idempotency record cleanup completed: ${deletedCount} records deleted`);
    } catch (error) {
      this.logger.error(`Error during idempotency record cleanup: ${error.message}`, error.stack);
    }
  }
}
