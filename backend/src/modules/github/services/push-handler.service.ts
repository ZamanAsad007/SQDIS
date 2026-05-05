import { Injectable, Logger } from '@nestjs/common';
import { EventHandler, EventHandlerResult } from '../interfaces/event-handler.interface';
import { PushEventPayload, ParsedCommitData } from '../dto/webhook-payload.dto';
import { CommitProcessorQueue } from '../queues/commit-processor.queue';

/**
 * PushHandler processes GitHub push webhook events.
 *
 * This handler is responsible for:
 * - Validating push event payloads
 * - Parsing commit data from GitHub webhook format to internal format
 * - Queueing commit processing jobs for asynchronous handling
 * - Handling force pushes and branch/tag differentiation
 *
 */
@Injectable()
export class PushHandler implements EventHandler {
  private readonly logger = new Logger(PushHandler.name);

  constructor(private readonly commitProcessorQueue: CommitProcessorQueue) {}

  /**
   * Get the event type this handler processes.
   *
   * @returns 'push'
   */
  getEventType(): string {
    return 'push';
  }

  /**
   * Validate the push event payload structure.
   *
   * Checks for required fields:
   * - ref: The git ref that was pushed
   * - commits: Array of commit objects
   * - repository: The repository object
   *
   * @param payload - The raw webhook payload from GitHub
   * @returns true if the payload structure is valid, false otherwise
   */
  validatePayload(payload: unknown): boolean {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const event = payload as Partial<PushEventPayload>;

    // Check required top-level fields
    if (!event.ref || !event.repository) {
      return false;
    }

    // Commits array is required but can be empty
    if (!Array.isArray(event.commits)) {
      return false;
    }

    return true;
  }

  /**
   * Parse the push event payload into internal format.
   *
   * Extracts commit data from the GitHub webhook payload:
   * - SHA, message, timestamp
   * - Author and committer information
   * - Files added, removed, modified
   * - Force push flag
   *
   * @param payload - The raw webhook payload from GitHub
   * @returns Array of parsed commit data in internal format
   */
  parsePayload(payload: unknown): ParsedCommitData[] {
    const event = payload as PushEventPayload;

    return event.commits
      .filter((commit) => commit.distinct) // Only process distinct commits
      .map((commit) => ({
        sha: commit.id,
        message: commit.message,
        timestamp: new Date(commit.timestamp),
        authorName: commit.author.name,
        authorEmail: commit.author.email,
        committerName: commit.committer.name,
        committerEmail: commit.committer.email,
        filesAdded: commit.added,
        filesRemoved: commit.removed,
        filesModified: commit.modified,
        repositoryId: event.repository.id,
        repositoryFullName: event.repository.full_name,
        forced: event.forced,
      }));
  }

  /**
   * Parse ref field to extract branch or tag name.
   *
   * @param ref - The ref field from push event (e.g., "refs/heads/main" or "refs/tags/v1.0.0")
   * @returns Object containing branch or tag name and ref type
   */
  private parseRef(ref: string): { branch?: string; tag?: string; refType: 'branch' | 'tag' } {
    const BRANCH_PREFIX = 'refs/heads/';
    const TAG_PREFIX = 'refs/tags/';

    if (ref.startsWith(BRANCH_PREFIX)) {
      return {
        branch: ref.substring(BRANCH_PREFIX.length),
        refType: 'branch',
      };
    } else if (ref.startsWith(TAG_PREFIX)) {
      return {
        tag: ref.substring(TAG_PREFIX.length),
        refType: 'tag',
      };
    }

    // Fallback: treat as branch if no recognized prefix
    return {
      branch: ref,
      refType: 'branch',
    };
  }

  /**
   * Handle the push event by queueing commit processing jobs.
   *
   * This method:
   * 1. Validates the payload structure
   * 2. Checks for branch/tag deletion (skips processing)
   * 3. Parses commits from the payload
   * 4. Queues jobs to the commit processing queue
   * 5. Returns immediately without waiting for job processing
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
      throw new Error('Invalid push event payload structure');
    }

    const event = payload as PushEventPayload;
    const refInfo = this.parseRef(event.ref);

    // Skip if this is a branch/tag deletion
    if (event.deleted) {
      return {
        success: true,
        jobsQueued: 0,
        message: 'Branch/tag deletion event - no commits to process',
      };
    }

    const commits = this.parsePayload(payload);

    // Skip if no commits to process
    if (commits.length === 0) {
      return {
        success: true,
        jobsQueued: 0,
        message: 'No commits to process',
      };
    }

    this.logger.log(
      `Parsed ${commits.length} commits from push event for ${event.repository.full_name}${event.forced ? ' (force push)' : ''} on ${refInfo.refType} ${refInfo.branch || refInfo.tag}`,
    );

    // Enqueue commits for processing via BullMQ
    await this.commitProcessorQueue.addCommitJobs(commits, repositoryId, organizationId);

    return {
      success: true,
      jobsQueued: commits.length,
      message: `Queued ${commits.length} commits for processing${event.forced ? ' (force push)' : ''} on ${refInfo.refType} ${refInfo.branch || refInfo.tag}`,
    };
  }
}
