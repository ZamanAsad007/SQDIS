import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { COMMIT_COMMENT_QUEUE_NAME, CommitCommentJobData } from '../queues/commit-processor.queue';
import { DatabaseErrorHandler } from '../utils/database-error-handler';

/**
 * Result of processing a commit comment
 */
export interface ProcessedCommitCommentResult {
  commentId: string;
  commitSha: string;
  associatedWithCommit: boolean;
}

/**
 * BullMQ Worker for processing commit comment jobs from GitHub webhooks
 *
 * This worker handles:
 * - Commit comment creation
 * - Association with existing commit records
 * - Handling comments when commit doesn't exist yet
 *
 */
@Processor(COMMIT_COMMENT_QUEUE_NAME)
export class CommitCommentWorker extends WorkerHost {
  private readonly logger = new Logger(CommitCommentWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Process a commit comment job from the queue
   *
   * This method:
   * 1. Creates a commit comment record
   * 2. Attempts to find the associated commit by SHA
   * 3. Associates the comment with the commit if found
   * 4. Handles idempotency via unique constraint
   *
   */
  async process(job: Job<CommitCommentJobData>): Promise<ProcessedCommitCommentResult> {
    this.logger.log(
      `Processing commit comment job ${job.id}: Comment ${job.data.comment.commentId}`,
    );

    try {
      const { comment, repositoryId } = job.data;

      // Find the commit by SHA if it exists
      const existingCommit = await this.prisma.commit.findFirst({
        where: {
          repositoryId,
          sha: comment.commitSha,
        },
      });

      // Create or update the commit comment
      const commitComment = await this.prisma.commitComment.upsert({
        where: {
          repositoryId_githubCommentId: {
            repositoryId,
            githubCommentId: comment.commentId,
          },
        },
        create: {
          repositoryId,
          commitId: existingCommit?.id || null,
          githubCommentId: comment.commentId,
          commitSha: comment.commitSha,
          body: comment.body,
          filePath: comment.filePath,
          lineNumber: comment.lineNumber,
          authorLogin: comment.authorLogin,
          authorId: comment.authorId,
          createdAt: comment.createdAt,
        },
        update: {
          commitId: existingCommit?.id || null,
          body: comment.body,
          filePath: comment.filePath,
          lineNumber: comment.lineNumber,
        },
      });

      const associatedWithCommit = existingCommit !== null;

      if (associatedWithCommit) {
        this.logger.log(
          `Successfully processed commit comment ${comment.commentId} and associated with commit ${existingCommit.id}`,
        );
      } else {
        this.logger.log(
          `Successfully processed commit comment ${comment.commentId} (commit not found yet)`,
        );
      }

      return {
        commentId: commitComment.id,
        commitSha: comment.commitSha,
        associatedWithCommit,
      };
    } catch (error) {
      // Extract data for error handling
      const { comment } = job.data;

      // Handle database errors with retry logic
      const handled = DatabaseErrorHandler.handleDatabaseError(error, this.logger, {
        jobId: job.id,
        entityType: 'CommitComment',
        entityId: comment.commentId,
        action: 'created',
      });

      // If handled as idempotent success, return a result
      if (handled) {
        return {
          commentId: '',
          commitSha: comment.commitSha,
          associatedWithCommit: false,
        };
      }

      // Otherwise, error was re-thrown by handler (or we need to throw it here)
      throw error;
    }
  }
}
