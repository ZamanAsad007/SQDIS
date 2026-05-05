import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { RELEASE_QUEUE_NAME, ReleaseJobData } from '../queues/commit-processor.queue';
import { ParsedReleaseData } from '../dto/webhook-payload.dto';
import { DatabaseErrorHandler } from '../utils/database-error-handler';

/**
 * Result of processing a release
 */
export interface ProcessedReleaseResult {
  releaseId: string;
  tagName: string;
  action: string;
}

/**
 * BullMQ Worker for processing release jobs from GitHub webhooks
 *
 * This worker handles:
 * - Release creation for 'published', 'created' actions
 * - Release updates for 'edited' action
 * - Release deletion for 'deleted' action
 * - Draft and prerelease flag handling
 *
 */
@Processor(RELEASE_QUEUE_NAME)
export class ReleaseWorker extends WorkerHost {
  private readonly logger = new Logger(ReleaseWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Process a release job from the queue
   *
   * Handles different release actions:
   * - published: Creates or updates a release record as published
   * - created: Creates a new release record (may be draft)
   * - deleted: Marks the release as deleted
   * - edited: Updates the release metadata
   *
   */
  async process(job: Job<ReleaseJobData>): Promise<ProcessedReleaseResult> {
    this.logger.log(`Processing release job ${job.id}: Release ${job.data.release.tagName}`);

    try {
      const { release, repositoryId, organizationId, action } = job.data;

      let result: ProcessedReleaseResult;

      switch (action) {
        case 'published':
          result = await this.handlePublished(release, repositoryId);
          break;
        case 'created':
          result = await this.handleCreated(release, repositoryId);
          break;
        case 'deleted':
          result = await this.handleDeleted(release, repositoryId);
          break;
        case 'edited':
          result = await this.handleEdited(release, repositoryId);
          break;
        default:
          this.logger.warn(`Unknown action for Release ${release.tagName}: ${action}`);
          result = {
            releaseId: '',
            tagName: release.tagName,
            action,
          };
      }

      this.logger.log(`Successfully processed Release ${release.tagName} (action: ${action})`);
      return result;
    } catch (error) {
      // Extract data for error handling
      const { release, action } = job.data;

      // Handle database errors with retry logic
      const handled = DatabaseErrorHandler.handleDatabaseError(error, this.logger, {
        jobId: job.id,
        entityType: 'Release',
        entityId: release.tagName,
        action,
      });

      // If handled as idempotent success, return a result
      if (handled) {
        return {
          releaseId: '',
          tagName: release.tagName,
          action,
        };
      }

      // Otherwise, error was re-thrown by handler
      throw error;
    }
  }

  /**
   * Handle release publication for 'published' action
   */
  private async handlePublished(
    release: ParsedReleaseData,
    repositoryId: string,
  ): Promise<ProcessedReleaseResult> {
    this.logger.log(`Publishing Release ${release.tagName}`);

    const publishedRelease = await this.prisma.gitHubRelease.upsert({
      where: {
        repositoryId_githubReleaseId: {
          repositoryId,
          githubReleaseId: release.releaseId,
        },
      },
      create: {
        repositoryId,
        githubReleaseId: release.releaseId,
        tagName: release.tagName,
        releaseName: release.releaseName,
        body: release.body,
        isDraft: release.isDraft,
        isPrerelease: release.isPrerelease,
        authorLogin: release.authorLogin,
        authorId: release.authorId,
        createdAt: release.createdAt,
        publishedAt: release.publishedAt,
        deletedAt: null,
      },
      update: {
        releaseName: release.releaseName,
        body: release.body,
        isDraft: release.isDraft,
        isPrerelease: release.isPrerelease,
        publishedAt: release.publishedAt,
        deletedAt: null,
      },
    });

    return {
      releaseId: publishedRelease.id,
      tagName: publishedRelease.tagName,
      action: 'published',
    };
  }

  /**
   * Handle release creation for 'created' action
   */
  private async handleCreated(
    release: ParsedReleaseData,
    repositoryId: string,
  ): Promise<ProcessedReleaseResult> {
    this.logger.log(`Creating Release ${release.tagName}`);

    const createdRelease = await this.prisma.gitHubRelease.upsert({
      where: {
        repositoryId_githubReleaseId: {
          repositoryId,
          githubReleaseId: release.releaseId,
        },
      },
      create: {
        repositoryId,
        githubReleaseId: release.releaseId,
        tagName: release.tagName,
        releaseName: release.releaseName,
        body: release.body,
        isDraft: release.isDraft,
        isPrerelease: release.isPrerelease,
        authorLogin: release.authorLogin,
        authorId: release.authorId,
        createdAt: release.createdAt,
        publishedAt: release.publishedAt,
        deletedAt: null,
      },
      update: {
        releaseName: release.releaseName,
        body: release.body,
        isDraft: release.isDraft,
        isPrerelease: release.isPrerelease,
        publishedAt: release.publishedAt,
        deletedAt: null,
      },
    });

    return {
      releaseId: createdRelease.id,
      tagName: createdRelease.tagName,
      action: 'created',
    };
  }

  /**
   * Handle release deletion for 'deleted' action
   */
  private async handleDeleted(
    release: ParsedReleaseData,
    repositoryId: string,
  ): Promise<ProcessedReleaseResult> {
    this.logger.log(`Deleting Release ${release.tagName}`);

    const deletedRelease = await this.prisma.gitHubRelease.update({
      where: {
        repositoryId_githubReleaseId: {
          repositoryId,
          githubReleaseId: release.releaseId,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      releaseId: deletedRelease.id,
      tagName: deletedRelease.tagName,
      action: 'deleted',
    };
  }

  /**
   * Handle release editing for 'edited' action
   */
  private async handleEdited(
    release: ParsedReleaseData,
    repositoryId: string,
  ): Promise<ProcessedReleaseResult> {
    this.logger.log(`Editing Release ${release.tagName}`);

    const editedRelease = await this.prisma.gitHubRelease.upsert({
      where: {
        repositoryId_githubReleaseId: {
          repositoryId,
          githubReleaseId: release.releaseId,
        },
      },
      create: {
        repositoryId,
        githubReleaseId: release.releaseId,
        tagName: release.tagName,
        releaseName: release.releaseName,
        body: release.body,
        isDraft: release.isDraft,
        isPrerelease: release.isPrerelease,
        authorLogin: release.authorLogin,
        authorId: release.authorId,
        createdAt: release.createdAt,
        publishedAt: release.publishedAt,
        deletedAt: null,
      },
      update: {
        tagName: release.tagName,
        releaseName: release.releaseName,
        body: release.body,
        isDraft: release.isDraft,
        isPrerelease: release.isPrerelease,
        publishedAt: release.publishedAt,
      },
    });

    return {
      releaseId: editedRelease.id,
      tagName: editedRelease.tagName,
      action: 'edited',
    };
  }
}
