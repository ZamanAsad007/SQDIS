import { Injectable, Logger } from '@nestjs/common';
import { EventHandler, EventHandlerResult } from '../interfaces/event-handler.interface';
import {
  PullRequestReviewCommentEventPayload,
  ParsedReviewCommentData,
} from '../dto/webhook-payload.dto';
import { CommitProcessorQueue } from '../queues/commit-processor.queue';

/**
 * PullRequestReviewCommentHandler processes GitHub pull_request_review_comment webhook events.
 *
 * This handler is responsible for:
 * - Validating pull_request_review_comment event payloads
 * - Parsing review comment data from GitHub webhook format to internal format
 * - Queueing review comment processing jobs for asynchronous handling
 *
 * Supported actions:
 * - created: New review comment created
 * - edited: Review comment edited
 * - deleted: Review comment deleted
 */
@Injectable()
export class PullRequestReviewCommentHandler implements EventHandler {
  private readonly logger = new Logger(PullRequestReviewCommentHandler.name);

  constructor(private readonly commitProcessorQueue: CommitProcessorQueue) {}

  /**
   * Get the event type this handler processes.
   *
   * @returns 'pull_request_review_comment'
   */
  getEventType(): string {
    return 'pull_request_review_comment';
  }

  /**
   * Validate the pull_request_review_comment event payload structure.
   *
   * Checks for required fields:
   * - action: The comment action type
   * - comment: The comment object with required fields
   * - pull_request: The pull request object
   * - repository: The repository object
   *
   * @param payload - The raw webhook payload from GitHub
   * @returns true if the payload structure is valid, false otherwise
   */
  validatePayload(payload: unknown): boolean {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const event = payload as Partial<PullRequestReviewCommentEventPayload>;

    // Check required top-level fields
    if (!event.action || !event.comment || !event.pull_request || !event.repository) {
      return false;
    }

    const comment = event.comment;

    // Check required comment fields
    if (
      typeof comment.id !== 'number' ||
      !comment.user ||
      !comment.body ||
      !comment.path ||
      !comment.diff_hunk ||
      !comment.created_at ||
      !comment.updated_at
    ) {
      return false;
    }

    return true;
  }

  /**
   * Parse the pull_request_review_comment event payload into internal format.
   *
   * Extracts all required review comment data from the GitHub webhook payload:
   * - Comment ID, body, file path, line number
   * - Author information
   * - Associated review and pull request
   * - Diff hunk context
   * - Timestamps
   *
   * @param payload - The raw webhook payload from GitHub
   * @returns Parsed review comment data in internal format
   * @throws Error if payload cannot be parsed
   */
  parsePayload(payload: unknown): ParsedReviewCommentData {
    const event = payload as PullRequestReviewCommentEventPayload;
    const comment = event.comment;

    return {
      commentId: comment.id,
      reviewId: comment.pull_request_review_id,
      authorLogin: comment.user.login,
      authorId: comment.user.id,
      authorEmail: comment.user.email,
      body: comment.body,
      filePath: comment.path,
      lineNumber: comment.line || comment.original_line,
      diffHunk: comment.diff_hunk,
      parentCommentId: comment.in_reply_to_id,
      createdAt: new Date(comment.created_at),
      updatedAt: new Date(comment.updated_at),
      pullRequestNumber: event.pull_request.number,
      repositoryId: event.repository.id,
      repositoryFullName: event.repository.full_name,
    };
  }

  /**
   * Handle the pull_request_review_comment event by queueing a processing job.
   *
   * This method:
   * 1. Validates the payload structure
   * 2. Parses the payload into internal format
   * 3. Queues a job to the review comment processing queue
   * 4. Returns immediately without waiting for job processing
   *
   * Supported actions:
   * - created: Creates a new review comment record
   * - edited: Updates the review comment record
   * - deleted: Marks the review comment as deleted
   *
   * @param payload - The raw webhook payload from GitHub
   * @param repositoryId - The internal repository ID
   * @param organizationId - The internal organization ID
   * @returns Result indicating success and number of jobs queued
   * @throws Error if payload is invalid or queueing fails
   */
  async handle(
    payload: unknown,
    repositoryId: string,
    organizationId: string,
  ): Promise<EventHandlerResult> {
    if (!this.validatePayload(payload)) {
      throw new Error('Invalid pull_request_review_comment event payload structure');
    }

    const event = payload as PullRequestReviewCommentEventPayload;
    const action = event.action;

    // Only process actions we care about
    const supportedActions = ['created', 'edited', 'deleted'];

    if (!supportedActions.includes(action)) {
      this.logger.debug(`Skipping unsupported pull_request_review_comment action: ${action}`);
      return {
        success: true,
        jobsQueued: 0,
        message: `Pull request review comment action '${action}' not processed`,
      };
    }

    const parsedData = this.parsePayload(payload);

    // Queue the review comment processing job
    await this.commitProcessorQueue.addReviewCommentJob(
      parsedData,
      repositoryId,
      organizationId,
      action,
    );

    this.logger.log(
      `Queued pull_request_review_comment event (action: ${action}, comment ID: ${parsedData.commentId}) for repository ${repositoryId}`,
    );

    return {
      success: true,
      jobsQueued: 1,
      message: `Pull request review comment ${action} event queued for processing`,
    };
  }
}
