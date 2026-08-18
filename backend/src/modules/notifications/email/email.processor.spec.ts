import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { EmailProcessor, EmailJobType, EmailJobData } from './email.processor';
import { EmailService } from './email.service';

describe('EmailProcessor', () => {
  let processor: EmailProcessor;
  let emailService: {
    sendEmail: jest.Mock;
  };

  beforeEach(async () => {
    emailService = {
      sendEmail: jest.fn().mockResolvedValue({ messageId: 'msg-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('processes verification email job successfully', async () => {
    const job = {
      id: 'email-1',
      data: {
        type: EmailJobType.VERIFICATION,
        to: 'user@example.com',
        data: {
          verificationUrl: 'https://app.sqdis.io/verify-email/token-123',
          userName: 'Alice',
        },
      },
    } as Job<EmailJobData>;

    const result = await processor.process(job);

    expect(result).toBe(true);
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Verify Your Email Address - SQDIS',
        html: expect.stringContaining('https://app.sqdis.io/verify-email/token-123'),
      }),
    );
  });

  it('processes invitation email job successfully', async () => {
    const job = {
      id: 'email-2',
      data: {
        type: EmailJobType.INVITATION,
        to: 'colleague@example.com',
        data: {
          invitationUrl: 'https://app.sqdis.io/invitations/token-456',
          organizationName: 'ACME Corp',
          inviterName: 'Bob',
          role: 'DEVELOPER',
        },
      },
    } as Job<EmailJobData>;

    const result = await processor.process(job);

    expect(result).toBe(true);
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'colleague@example.com',
        subject: "You're invited to join ACME Corp on SQDIS",
      }),
    );
  });

  it('processes alert email job successfully', async () => {
    const job = {
      id: 'email-3',
      data: {
        type: EmailJobType.ALERT,
        to: 'devlead@example.com',
        data: {
          alertTitle: 'Coverage dropped below 70%',
          severity: 'HIGH',
          message: 'Code coverage fell to 65% in auth-service',
          alertUrl: 'https://app.sqdis.io/alerts/alert-1',
          repositoryName: 'auth-service',
        },
      },
    } as Job<EmailJobData>;

    const result = await processor.process(job);

    expect(result).toBe(true);
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'devlead@example.com',
        subject: 'HIGH Alert - Coverage dropped below 70%',
      }),
    );
  });

  it('re-throws error on email sending failure to trigger BullMQ retry', async () => {
    const job = {
      id: 'email-4',
      data: {
        type: EmailJobType.VERIFICATION,
        to: 'user@example.com',
        data: {
          verificationUrl: 'https://app.sqdis.io/verify',
        },
      },
    } as Job<EmailJobData>;

    emailService.sendEmail.mockRejectedValue(new Error('SMTP Connection Refused'));

    await expect(processor.process(job)).rejects.toThrow('SMTP Connection Refused');
  });
});
