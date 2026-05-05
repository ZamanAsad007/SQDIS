import { Injectable, Logger } from '@nestjs/common';
import { EventHandler, EventHandlerResult } from '../interfaces/event-handler.interface';
import { ReleaseEventPayload, ParsedReleaseData } from '../dto/webhook-payload.dto';
import { CommitProcessorQueue } from '../queues/commit-processor.queue';

/**
 * ReleaseHandler processes GitHub release webhook events.
 *
 * This handler is responsible for:
 * - Validating release event payloads
 * - Parsing release data from GitHub webhook format to internal format
 * - Queueing release processing jobs for asynchronous handling
 *
 * Supported actions:
 * - published: Release published to the public
 * - created: Release created (may be draft)
 * - deleted: Release deleted
 * - edited: Release metadata edited
 *
 */
@Injectable()
export class ReleaseHandler implements EventHandler {
  private readonly logger = new Logger(ReleaseHandler.name);

  constructor(private readonly commitProcessorQueue: CommitProcessorQueue) {}

  /**
   * Get the event type this handler processes.
   *
   * @returns 'release'
   */
  getEventType(): string {
    return 'release';
  }

  /**
   * Validate the release event payload structure.
   *
   * Checks for required fields:
   * - action: The release action type
   * - release: The release object with required fields
   * - repository: The repository object
   *
   * @param payload - The raw webhook payload from GitHub
   * @returns true if the payload structure is valid, false otherwise
   */
  validatePayload(payload: unknown): boolean {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const event = payload as Partial<ReleaseEventPayload>;

    // Check required top-level fields
    if (!event.action || !event.release || !event.repository) {
      return false;
    }

    const release = event.release;

    // Check required release fields
    if (
      typeof release.id !== 'number' ||
      !release.tag_name ||
      typeof release.draft !== 'boolean' ||
      typeof release.prerelease !== 'boolean' ||
      !release.created_at ||
      !release.author
    ) {
      return false;
    }

    return true;
  }

  /**
   * Parse the release event payload into internal format.
   *
   * Extracts all required release data from the GitHub webhook payload:
   * - Release ID, tag name, release name, body
   * - Draft and prerelease flags
   * - Author information
   * - Timestamps
   *
   * @param payload - The raw webhook payload from GitHub
   * @returns Parsed release data in internal format
   * @throws Error if payload cannot be parsed
   */
  parsePayload(payload: unknown): ParsedReleaseData {
    const event = payload as ReleaseEventPayload;
    const release = event.release;

    return {
      releaseId: release.id,
      tagName: release.tag_name,
      releaseName: release.name,
      body: release.body,
      isDraft: release.draft,
      isPrerelease: release.prerelease,
      authorLogin: release.author.login,
      authorId: release.author.id,
      createdAt: new Date(release.created_at),
      publishedAt: release.published_at ? new Date(release.published_at) : null,
      repositoryId: event.repository.id,
      repositoryFullName: event.repository.full_name,
    };
  }

  /**
   * Handle the release event by queueing a processing job.
   *
   * This method:
   * 1. Validates the payload structure
   * 2. Parses the payload into internal format
   * 3. Queues a job to the release processing queue
   * 4. Returns immediately without waiting for job processing
   *
   * Supported actions:
   * - published: Creates or updates a release record as published
   * - created: Creates a new release record (may be draft)
   * - deleted: Marks the release as deleted
   * - edited: Updates the release metadata
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
      throw new Error('Invalid release event payload structure');
    }

    const event = payload as ReleaseEventPayload;
    const action = event.action;

    // Only process actions we care about
    const supportedActions = ['published', 'created', 'deleted', 'edited'];

    if (!supportedActions.includes(action)) {
      this.logger.debug(`Skipping unsupported release action: ${action}`);
      return {
        success: true,
        jobsQueued: 0,
        message: `Release action '${action}' not processed`,
      };
    }

    const parsedData = this.parsePayload(payload);

    // Queue the release processing job
    await this.commitProcessorQueue.addReleaseJob(parsedData, repositoryId, organizationId, action);

    this.logger.log(
      `Queued release event (action: ${action}, tag: ${parsedData.tagName}) for repository ${repositoryId}`,
    );

    return {
      success: true,
      jobsQueued: 1,
      message: `Release ${action} event queued for processing`,
    };
  }
}
