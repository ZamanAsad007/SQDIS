import { Injectable, Logger } from '@nestjs/common';
import { EventHandler, EventHandlerResult } from '../interfaces/event-handler.interface';
import { PullRequestReviewEventPayload, ParsedReviewData } from '../dto/webhook-payload.dto';
import { CommitProcessorQueue } from '../queues/commit-processor.queue';

/**
 * PullRequestReviewHandler processes GitHub pull_request_review webhook events.
 *
 * This handler is responsible for:
 * - Validating pull_request_review event payloads
 * - Parsing review data from GitHub webhook format to internal format
 * - Queueing review processing jobs for asynchronous handling
 *
 * Supported actions:
 * - submitted: Review submitted with approval, changes requested, or comment
 * - edited: Review edited
 * - dismissed: Review dismissed
 *
 */
@Injectable()
export class PullRequestReviewHandler implements EventHandler {
  private readonly logger = new Logger(PullRequestReviewHandler.name);

  constructor(private readonly commitProcessorQueue: CommitProcessorQueue) {}

  /**
   * Get the event type this handler processes.
   *
   * @returns 'pull_request_review'
   */
  getEventType(): string {
    return 'pull_request_review';
  }

  /**
   * Validate the pull_request_review event payload structure.
   *
   * Checks for required fields:
   * - action: The review action type
   * - review: The review object with required fields
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

    const event = payload as Partial<PullRequestReviewEventPayload>;

    // Check required top-level fields
    if (!event.action || !event.review || !event.pull_request || !event.repository) {
      return false;
    }

    const review = event.review;

    // Check required review fields
    if (
      typeof review.id !== 'number' ||
      !review.user ||
      !review.state ||
      !review.commit_id ||
      !review.submitted_at
    ) {
      return false;
    }

    return true;
  }

  /**
   * Parse the pull_request_review event payload into internal format.
   *
   * Extracts all required review data from the GitHub webhook payload:
   * - Review ID, state (approved, changes_requested, commented)
   * - Reviewer information
   * - Review body (may be empty)
   * - Associated commit and pull request
   * - Timestamps
   *
   * @param payload - The raw webhook payload from GitHub
   * @returns Parsed review data in internal format
   * @throws Error if payload cannot be parsed
   */
  parsePayload(payload: unknown): ParsedReviewData {
    const event = payload as PullRequestReviewEventPayload;
    const review = event.review;

    return {
      reviewId: review.id,
      reviewerLogin: review.user.login,
      reviewerId: review.user.id,
      reviewerEmail: review.user.email,
      state: review.state,
      body: review.body,
      submittedAt: new Date(review.submitted_at),
      commitId: review.commit_id,
      pullRequestNumber: event.pull_request.number,
      pullRequestTitle: event.pull_request.title,
      pullRequestCreatedAt: new Date(event.pull_request.created_at),
      repositoryId: event.repository.id,
      repositoryFullName: event.repository.full_name,
    };
  }

  /**
   * Handle the pull_request_review event by queueing a processing job.
   *
   * This method:
   * 1. Validates the payload structure
   * 2. Parses the payload into internal format
   * 3. Queues a job to the review processing queue
   * 4. Returns immediately without waiting for job processing
   *
   * Supported actions:
   * - submitted: Creates a new review record with state (approved, changes_requested, commented)
   * - edited: Updates the review record
   * - dismissed: Marks the review as dismissed
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
      throw new Error('Invalid pull_request_review event payload structure');
    }

    const event = payload as PullRequestReviewEventPayload;
    const action = event.action;

    // Only process actions we care about
    const supportedActions = ['submitted', 'edited', 'dismissed'];

    if (!supportedActions.includes(action)) {
      this.logger.debug(`Skipping unsupported pull_request_review action: ${action}`);
      return {
        success: true,
        jobsQueued: 0,
        message: `Pull request review action '${action}' not processed`,
      };
    }

    const parsedData = this.parsePayload(payload);

    // Queue the review processing job
    await this.commitProcessorQueue.addReviewJob(parsedData, repositoryId, organizationId);

    this.logger.log(
      `Queued pull_request_review event (action: ${action}, review ID: ${parsedData.reviewId}) for repository ${repositoryId}`,
    );

    return {
      success: true,
      jobsQueued: 1,
      message: `Pull request review ${action} event queued for processing`,
    };
  }
}
