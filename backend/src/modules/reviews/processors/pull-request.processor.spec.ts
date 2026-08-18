jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { PullRequestProcessor, PullRequestJobData } from './pull-request.processor';
import { ReviewsService } from '../reviews.service';

describe('PullRequestProcessor', () => {
  let processor: PullRequestProcessor;
  let reviewsService: {
    processPullRequestFromQueue: jest.Mock;
  };

  beforeEach(async () => {
    reviewsService = {
      processPullRequestFromQueue: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PullRequestProcessor,
        { provide: ReviewsService, useValue: reviewsService },
      ],
    }).compile();

    processor = module.get<PullRequestProcessor>(PullRequestProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates pull request job processing to ReviewsService', async () => {
    const job = {
      id: 'pr-job-1',
      data: {
        type: 'process_pull_request',
        pullRequest: {
          prId: 101,
          prNumber: 42,
          title: 'feat: new api',
          authorId: 555,
          authorLogin: 'dev_user',
          state: 'open',
          merged: false,
          additions: 100,
          deletions: 10,
          changedFiles: 2,
        },
        repositoryId: 'repo-1',
        organizationId: 'org-1',
        action: 'opened',
      },
    } as Job<PullRequestJobData>;

    reviewsService.processPullRequestFromQueue.mockResolvedValue({
      prId: 101,
      prNumber: 42,
      authorId: 'user-dev',
    });

    const result = await processor.process(job);

    expect(reviewsService.processPullRequestFromQueue).toHaveBeenCalledWith(
      job.data.pullRequest,
      'repo-1',
      'org-1',
      'opened',
    );
    expect(result).toEqual({
      prId: 101,
      prNumber: 42,
      authorId: 'user-dev',
    });
  });

  it('re-throws error if review processing fails', async () => {
    const job = {
      id: 'pr-job-2',
      data: {
        type: 'process_pull_request',
        pullRequest: { prNumber: 99 } as any,
        repositoryId: 'repo-1',
        organizationId: 'org-1',
      },
    } as Job<PullRequestJobData>;

    reviewsService.processPullRequestFromQueue.mockRejectedValue(new Error('Database lock'));

    await expect(processor.process(job)).rejects.toThrow('Database lock');
  });
});
