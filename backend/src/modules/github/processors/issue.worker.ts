import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { ISSUE_QUEUE_NAME, IssueJobData } from '../queues/commit-processor.queue';
import { ParsedIssueData } from '../dto/webhook-payload.dto';
import { IssueState } from '@prisma/client';
import { DatabaseErrorHandler } from '../utils/database-error-handler';

/**
 * Result of processing an issue
 */
export interface ProcessedIssueResult {
  issueId: string;
  issueNumber: number;
  action: string;
  authorId: string | null;
}

/**
 * BullMQ Worker for processing issue jobs from GitHub webhooks
 *
 * This worker handles:
 * - Issue creation for 'opened' action
 * - Issue updates for 'closed', 'reopened' actions
 * - Label updates for 'labeled', 'unlabeled' actions
 * - Assignee updates for 'assigned', 'unassigned' actions
 * - Mapping GitHub users to internal users via githubId
 *
 */
@Processor(ISSUE_QUEUE_NAME)
export class IssueWorker extends WorkerHost {
  private readonly logger = new Logger(IssueWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Process an issue job from the queue
   *
   * Handles different issue actions:
   * - opened: Creates a new issue record
   * - closed: Updates the issue status to closed
   * - reopened: Updates the issue status to open
   * - labeled: Adds a label to the issue
   * - unlabeled: Removes a label from the issue
   * - assigned: Adds an assignee to the issue
   * - unassigned: Removes an assignee from the issue
   *
   */
  async process(job: Job<IssueJobData>): Promise<ProcessedIssueResult> {
    this.logger.log(`Processing issue job ${job.id}: Issue #${job.data.issue.issueNumber}`);

    try {
      const { issue, repositoryId, organizationId, action } = job.data;

      // Find issue author by GitHub ID
      const author = await this.prisma.user.findFirst({
        where: { githubId: String(issue.authorId) },
      });

      let result: ProcessedIssueResult;

      switch (action) {
        case 'opened':
          result = await this.handleOpened(issue, repositoryId, author?.id || null);
          break;
        case 'closed':
          result = await this.handleClosed(issue, repositoryId, author?.id || null);
          break;
        case 'reopened':
          result = await this.handleReopened(issue, repositoryId, author?.id || null);
          break;
        case 'labeled':
          result = await this.handleLabeled(issue, repositoryId, author?.id || null);
          break;
        case 'unlabeled':
          result = await this.handleUnlabeled(issue, repositoryId, author?.id || null);
          break;
        case 'assigned':
          result = await this.handleAssigned(issue, repositoryId, author?.id || null);
          break;
        case 'unassigned':
          result = await this.handleUnassigned(issue, repositoryId, author?.id || null);
          break;
        default:
          this.logger.warn(`Unknown action for Issue #${issue.issueNumber}: ${action}`);
          result = {
            issueId: '',
            issueNumber: issue.issueNumber,
            action,
            authorId: author?.id || null,
          };
      }

      this.logger.log(`Successfully processed Issue #${issue.issueNumber} (action: ${action})`);
      return result;
    } catch (error) {
      // Extract data for error handling
      const { issue, action } = job.data;

      // Handle database errors with retry logic
      const handled = DatabaseErrorHandler.handleDatabaseError(error, this.logger, {
        jobId: job.id,
        entityType: 'Issue',
        entityId: issue.issueNumber,
        action,
      });

      // If handled as idempotent success, return a result
      if (handled) {
        return {
          issueId: '',
          issueNumber: issue.issueNumber,
          action,
          authorId: null,
        };
      }

      // Otherwise, error was re-thrown by handler
      throw error;
    }
  }

  /**
   * Handle issue creation for 'opened' action
   */
  private async handleOpened(
    issue: ParsedIssueData,
    repositoryId: string,
    authorId: string | null,
  ): Promise<ProcessedIssueResult> {
    this.logger.log(`Creating new Issue #${issue.issueNumber}`);

    const state = this.mapIssueState(issue.state);

    const createdIssue = await this.prisma.issue.upsert({
      where: {
        repositoryId_githubIssueId: {
          repositoryId,
          githubIssueId: issue.issueId,
        },
      },
      create: {
        repositoryId,
        githubIssueId: issue.issueId,
        issueNumber: issue.issueNumber,
        title: issue.title,
        body: issue.body,
        state,
        authorLogin: issue.authorLogin,
        authorId: issue.authorId,
        labels: issue.labels,
        assignees: issue.assignees,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
        closedAt: issue.closedAt,
      },
      update: {
        title: issue.title,
        body: issue.body,
        state,
        labels: issue.labels,
        assignees: issue.assignees,
        updatedAt: issue.updatedAt,
        closedAt: issue.closedAt,
      },
    });

    return {
      issueId: createdIssue.id,
      issueNumber: createdIssue.issueNumber,
      action: 'opened',
      authorId,
    };
  }

  /**
   * Handle issue closure for 'closed' action
   */
  private async handleClosed(
    issue: ParsedIssueData,
    repositoryId: string,
    authorId: string | null,
  ): Promise<ProcessedIssueResult> {
    this.logger.log(`Closing Issue #${issue.issueNumber}`);

    const closedIssue = await this.prisma.issue.upsert({
      where: {
        repositoryId_githubIssueId: {
          repositoryId,
          githubIssueId: issue.issueId,
        },
      },
      create: {
        repositoryId,
        githubIssueId: issue.issueId,
        issueNumber: issue.issueNumber,
        title: issue.title,
        body: issue.body,
        state: IssueState.CLOSED,
        authorLogin: issue.authorLogin,
        authorId: issue.authorId,
        labels: issue.labels,
        assignees: issue.assignees,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
        closedAt: issue.closedAt,
      },
      update: {
        state: IssueState.CLOSED,
        updatedAt: issue.updatedAt,
        closedAt: issue.closedAt,
      },
    });

    return {
      issueId: closedIssue.id,
      issueNumber: closedIssue.issueNumber,
      action: 'closed',
      authorId,
    };
  }

  /**
   * Handle issue reopening for 'reopened' action
   */
  private async handleReopened(
    issue: ParsedIssueData,
    repositoryId: string,
    authorId: string | null,
  ): Promise<ProcessedIssueResult> {
    this.logger.log(`Reopening Issue #${issue.issueNumber}`);

    const reopenedIssue = await this.prisma.issue.update({
      where: {
        repositoryId_githubIssueId: {
          repositoryId,
          githubIssueId: issue.issueId,
        },
      },
      data: {
        state: IssueState.OPEN,
        updatedAt: issue.updatedAt,
        closedAt: null,
      },
    });

    return {
      issueId: reopenedIssue.id,
      issueNumber: reopenedIssue.issueNumber,
      action: 'reopened',
      authorId,
    };
  }

  /**
   * Handle label addition for 'labeled' action
   */
  private async handleLabeled(
    issue: ParsedIssueData,
    repositoryId: string,
    authorId: string | null,
  ): Promise<ProcessedIssueResult> {
    this.logger.log(`Adding labels to Issue #${issue.issueNumber}`);

    const labeledIssue = await this.prisma.issue.upsert({
      where: {
        repositoryId_githubIssueId: {
          repositoryId,
          githubIssueId: issue.issueId,
        },
      },
      create: {
        repositoryId,
        githubIssueId: issue.issueId,
        issueNumber: issue.issueNumber,
        title: issue.title,
        body: issue.body,
        state: this.mapIssueState(issue.state),
        authorLogin: issue.authorLogin,
        authorId: issue.authorId,
        labels: issue.labels,
        assignees: issue.assignees,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
        closedAt: issue.closedAt,
      },
      update: {
        labels: issue.labels,
        updatedAt: issue.updatedAt,
      },
    });

    return {
      issueId: labeledIssue.id,
      issueNumber: labeledIssue.issueNumber,
      action: 'labeled',
      authorId,
    };
  }

  /**
   * Handle label removal for 'unlabeled' action
   */
  private async handleUnlabeled(
    issue: ParsedIssueData,
    repositoryId: string,
    authorId: string | null,
  ): Promise<ProcessedIssueResult> {
    this.logger.log(`Removing labels from Issue #${issue.issueNumber}`);

    const unlabeledIssue = await this.prisma.issue.update({
      where: {
        repositoryId_githubIssueId: {
          repositoryId,
          githubIssueId: issue.issueId,
        },
      },
      data: {
        labels: issue.labels,
        updatedAt: issue.updatedAt,
      },
    });

    return {
      issueId: unlabeledIssue.id,
      issueNumber: unlabeledIssue.issueNumber,
      action: 'unlabeled',
      authorId,
    };
  }

  /**
   * Handle assignee addition for 'assigned' action
   */
  private async handleAssigned(
    issue: ParsedIssueData,
    repositoryId: string,
    authorId: string | null,
  ): Promise<ProcessedIssueResult> {
    this.logger.log(`Adding assignees to Issue #${issue.issueNumber}`);

    const assignedIssue = await this.prisma.issue.upsert({
      where: {
        repositoryId_githubIssueId: {
          repositoryId,
          githubIssueId: issue.issueId,
        },
      },
      create: {
        repositoryId,
        githubIssueId: issue.issueId,
        issueNumber: issue.issueNumber,
        title: issue.title,
        body: issue.body,
        state: this.mapIssueState(issue.state),
        authorLogin: issue.authorLogin,
        authorId: issue.authorId,
        labels: issue.labels,
        assignees: issue.assignees,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
        closedAt: issue.closedAt,
      },
      update: {
        assignees: issue.assignees,
        updatedAt: issue.updatedAt,
      },
    });

    return {
      issueId: assignedIssue.id,
      issueNumber: assignedIssue.issueNumber,
      action: 'assigned',
      authorId,
    };
  }

  /**
   * Handle assignee removal for 'unassigned' action
   */
  private async handleUnassigned(
    issue: ParsedIssueData,
    repositoryId: string,
    authorId: string | null,
  ): Promise<ProcessedIssueResult> {
    this.logger.log(`Removing assignees from Issue #${issue.issueNumber}`);

    const unassignedIssue = await this.prisma.issue.update({
      where: {
        repositoryId_githubIssueId: {
          repositoryId,
          githubIssueId: issue.issueId,
        },
      },
      data: {
        assignees: issue.assignees,
        updatedAt: issue.updatedAt,
      },
    });

    return {
      issueId: unassignedIssue.id,
      issueNumber: unassignedIssue.issueNumber,
      action: 'unassigned',
      authorId,
    };
  }

  /**
   * Map ParsedIssueData state to IssueState enum
   */
  private mapIssueState(state: 'open' | 'closed'): IssueState {
    return state === 'open' ? IssueState.OPEN : IssueState.CLOSED;
  }
}
