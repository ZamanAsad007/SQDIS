import { Injectable, Logger } from '@nestjs/common';
import { EventHandler, EventHandlerResult } from '../interfaces/event-handler.interface';
import { PullRequestEventPayload, ParsedPullRequestData } from '../dto/webhook-payload.dto';
import { CommitProcessorQueue } from '../queues/commit-processor.queue';

/**
 * PullRequestHandler processes GitHub pull_request webhook events.
 *
 * This handler is responsible for:
 * - Validating pull_request event payloads
 * - Parsing PR data from GitHub webhook format to internal format
 * - Queueing pull request processing jobs for asynchronous handling
 *
 * Supported actions:
 * - opened: New pull request created
 * - closed: Pull request closed (merged or not)
 * - reopened: Previously closed pull request reopened
 * - synchronize: New commits pushed to the PR branch
 * - review_requested: Reviewer requested for the PR
 *
 */
@Injectable()
export class PullRequestHandler implements EventHandler {
  private readonly logger = new Logger(PullRequestHandler.name);

  constructor(private readonly commitProcessorQueue: CommitProcessorQueue) {}

  /**
   * Get the event type this handler processes.
   *
   * @returns 'pull_request'
   */
  getEventType(): string {
    return 'pull_request';
  }

  /**
   * Validate the pull_request event payload structure.
   *
   * Checks for required fields:
   * - action: The PR action type
   * - pull_request: The PR object with required fields
   * - repository: The repository object
   *
   * @param payload - The raw webhook payload from GitHub
   * @returns true if the payload structure is valid, false otherwise
   */
  validatePayload(payload: unknown): boolean {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const event = payload as Partial<PullRequestEventPayload>;

    // Check required top-level fields
    if (!event.action || !event.pull_request || !event.repository) {
      return false;
    }

    const pr = event.pull_request;

    // Check required PR fields
    if (
      typeof pr.id !== 'number' ||
      typeof pr.number !== 'number' ||
      !pr.title ||
      !pr.state ||
      !pr.user ||
      !pr.head ||
      !pr.base ||
      !pr.created_at ||
      !pr.updated_at
    ) {
      return false;
    }

    // Check required head and base fields
    if (!pr.head.ref || !pr.head.sha || !pr.base.ref || !pr.base.sha) {
      return false;
    }

    return true;
  }

  /**
   * Parse the pull_request event payload into internal format.
   *
   * Extracts all required PR data from the GitHub webhook payload:
   * - PR number, ID, title, body
   * - State (open/closed) and merged status
   * - Author information
   * - Base and head branch information
   * - Timestamps
   *
   * @param payload - The raw webhook payload from GitHub
   * @returns Parsed pull request data in internal format
   * @throws Error if payload cannot be parsed
   */
  parsePayload(payload: unknown): ParsedPullRequestData {
    const event = payload as PullRequestEventPayload;
    const pr = event.pull_request;

    return {
      prNumber: pr.number,
      prId: pr.id,
      title: pr.title,
      body: pr.body,
      state: pr.state,
      merged: pr.merged_at !== null,
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
      authorLogin: pr.user.login,
      authorId: pr.user.id,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      baseCommitSha: pr.base.sha,
      headCommitSha: pr.head.sha,
      createdAt: new Date(pr.created_at),
      updatedAt: new Date(pr.updated_at),
      closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
      repositoryId: event.repository.id,
      repositoryFullName: event.repository.full_name,
    };
  }

  /**
   * Handle the pull_request event by queueing a processing job.
   *
   * This method:
   * 1. Validates the payload structure
   * 2. Parses the payload into internal format
   * 3. Queues a job to the pull request processing queue
   * 4. Returns immediately without waiting for job processing
   *
   * Supported actions:
   * - opened: Creates a new pull request record
   * - closed: Updates the pull request status (checks merged flag)
   * - reopened: Updates the pull request status to open
   * - synchronize: Updates the pull request with new commits
   * - review_requested: Records the review request
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
      throw new Error('Invalid pull_request event payload structure');
    }

    const event = payload as PullRequestEventPayload;
    const action = event.action;

    // Only process actions we care about
    const supportedActions = ['opened', 'closed', 'reopened', 'synchronize', 'review_requested'];

    if (!supportedActions.includes(action)) {
      this.logger.debug(`Skipping unsupported pull_request action: ${action}`);
      return {
        success: true,
        jobsQueued: 0,
        message: `Pull request action '${action}' not processed`,
      };
    }

    const parsedData = this.parsePayload(payload);

    // Queue the pull request processing job
    await this.commitProcessorQueue.addPullRequestJob(
      parsedData,
      repositoryId,
      organizationId,
      action,
    );

    this.logger.log(
      `Queued pull_request event (action: ${action}, PR #${parsedData.prNumber}) for repository ${repositoryId}`,
    );

    return {
      success: true,
      jobsQueued: 1,
      message: `Pull request ${action} event queued for processing`,
    };
  }
}
