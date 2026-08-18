import { PrismaClient, Role, CommitClassification, ReviewState, TurnaroundClass, CommentClass, SprintGoalStatus, SprintMetricType, DebtMarker, AlertType, AlertSeverity, AlertStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for SQDIS Viva / Demo Presentation...');

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Software Corporation',
      slug: 'acme-corp',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
    },
  });
  console.log(`✅ Organization seeded: ${org.name} (${org.id})`);

  // 2. Users & Passwords
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sqdis.local' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@sqdis.local',
      passwordHash: adminPasswordHash,
      name: 'Admin User',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
  });

  const lead = await prisma.user.upsert({
    where: { email: 'lead@sqdis.local' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'lead@sqdis.local',
      passwordHash: defaultPasswordHash,
      name: 'Sarah Teamlead',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
  });

  const dev1 = await prisma.user.upsert({
    where: { email: 'dev1@sqdis.local' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'dev1@sqdis.local',
      passwordHash: defaultPasswordHash,
      name: 'Alex Developer',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
  });

  const dev2 = await prisma.user.upsert({
    where: { email: 'dev2@sqdis.local' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'dev2@sqdis.local',
      passwordHash: defaultPasswordHash,
      name: 'Jordan Smith',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
  });
  console.log('✅ Users seeded: admin@sqdis.local, lead@sqdis.local, dev1@sqdis.local, dev2@sqdis.local');

  // 3. Organization Memberships
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: admin.id } },
    update: { role: Role.OWNER },
    create: { organizationId: org.id, userId: admin.id, role: Role.OWNER },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: lead.id } },
    update: { role: Role.TEAM_LEAD },
    create: { organizationId: org.id, userId: lead.id, role: Role.TEAM_LEAD },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: dev1.id } },
    update: { role: Role.DEVELOPER },
    create: { organizationId: org.id, userId: dev1.id, role: Role.DEVELOPER },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: dev2.id } },
    update: { role: Role.DEVELOPER },
    create: { organizationId: org.id, userId: dev2.id, role: Role.DEVELOPER },
  });
  console.log('✅ Organization memberships seeded');

  // 4. Email Aliases
  await prisma.emailAlias.upsert({
    where: { email: 'alex.dev@users.noreply.github.com' },
    update: {},
    create: {
      userId: dev1.id,
      email: 'alex.dev@users.noreply.github.com',
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  await prisma.emailAlias.upsert({
    where: { email: 'jordan.smith@corp.acme' },
    update: {},
    create: {
      userId: dev2.id,
      email: 'jordan.smith@corp.acme',
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  // Unmapped commit emails
  await prisma.unmappedEmail.upsert({
    where: { organizationId_email: { organizationId: org.id, email: 'external.contractor@partner.io' } },
    update: {},
    create: {
      organizationId: org.id,
      email: 'external.contractor@partner.io',
      authorName: 'External Contractor',
      commitCount: 14,
      firstSeenAt: new Date(Date.now() - 30 * 86400000),
      lastSeenAt: new Date(Date.now() - 2 * 86400000),
    },
  });
  console.log('✅ Email aliases & unmapped emails seeded');

  // 5. Teams
  const platformTeam = await prisma.team.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'Core Platform Team' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Core Platform Team',
      description: 'Backend distributed systems, data processing, and API infrastructure',
      leadId: lead.id,
    },
  });

  const frontendTeam = await prisma.team.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'Frontend Engineering' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Frontend Engineering',
      description: 'Web applications, user experience, and design systems',
      leadId: lead.id,
    },
  });

  // Team Memberships
  await prisma.teamMembership.deleteMany({
    where: { teamId: { in: [platformTeam.id, frontendTeam.id] } },
  });

  await prisma.teamMembership.createMany({
    data: [
      { teamId: platformTeam.id, userId: lead.id },
      { teamId: platformTeam.id, userId: dev1.id },
      { teamId: platformTeam.id, userId: dev2.id },
      { teamId: frontendTeam.id, userId: lead.id },
      { teamId: frontendTeam.id, userId: dev2.id },
    ],
  });
  console.log('✅ Teams and memberships seeded');

  // 6. Repositories
  const backendRepo = await prisma.repository.upsert({
    where: { organizationId_githubId: { organizationId: org.id, githubId: 10101 } },
    update: {},
    create: {
      organizationId: org.id,
      githubId: 10101,
      name: 'backend-api',
      fullName: 'acme-corp/backend-api',
      isEnabled: true,
      lastSyncAt: new Date(),
    },
  });

  const frontendRepo = await prisma.repository.upsert({
    where: { organizationId_githubId: { organizationId: org.id, githubId: 10102 } },
    update: {},
    create: {
      organizationId: org.id,
      githubId: 10102,
      name: 'frontend-web',
      fullName: 'acme-corp/frontend-web',
      isEnabled: true,
      lastSyncAt: new Date(),
    },
  });
  console.log('✅ Repositories seeded');

  // 7. Sprints
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);
  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
  const oneWeekFuture = new Date(Date.now() + 7 * 86400000);

  const completedSprint = await prisma.sprint.create({
    data: {
      organizationId: org.id,
      teamId: platformTeam.id,
      name: 'Sprint 24 - Data Architecture',
      startDate: twoWeeksAgo,
      endDate: oneWeekAgo,
      isActive: false,
      reports: {
        create: {
          totalCommits: 32,
          bugfixCommits: 8,
          featureCommits: 18,
          refactorCommits: 4,
          testCommits: 2,
          docsCommits: 0,
          bugsIntroduced: 2,
          bugsFixed: 7,
          avgDQS: 84.6,
          coveragePct: 78.5,
        },
      },
    },
  });

  const activeSprint = await prisma.sprint.create({
    data: {
      organizationId: org.id,
      teamId: platformTeam.id,
      name: 'Sprint 25 - Production Hardening',
      startDate: oneWeekAgo,
      endDate: oneWeekFuture,
      isActive: true,
      goals: {
        createMany: {
          data: [
            {
              title: 'Maintain developer quality score above 85',
              metricType: SprintMetricType.DQS,
              targetValue: 85,
              currentValue: 87.2,
              status: SprintGoalStatus.IN_PROGRESS,
            },
            {
              title: 'Ship 15 feature commits',
              metricType: SprintMetricType.FEATURE_COMMITS,
              targetValue: 15,
              currentValue: 11,
              status: SprintGoalStatus.IN_PROGRESS,
            },
          ],
        },
      },
    },
  });
  console.log(`✅ Sprints seeded: ${completedSprint.name}, ${activeSprint.name}`);

  // 8. Commits & File Changes
  const commit1 = await prisma.commit.upsert({
    where: { repositoryId_sha: { repositoryId: backendRepo.id, sha: 'a1b2c3d4e5f67890123456789abcdef012345678' } },
    update: {},
    create: {
      repositoryId: backendRepo.id,
      developerId: dev1.id,
      sha: 'a1b2c3d4e5f67890123456789abcdef012345678',
      message: 'feat(auth): add JWT token refresh and profile update endpoints',
      authorEmail: dev1.email,
      authorName: dev1.name,
      classification: CommitClassification.FEATURE,
      linesAdded: 245,
      linesDeleted: 32,
      filesChanged: 6,
      churnRatio: 0.12,
      anomalyFlag: false,
      anomalyScore: 0.08,
      committedAt: new Date(Date.now() - 5 * 86400000),
      fileChanges: {
        create: [
          { filePath: 'src/modules/auth/auth.service.ts', additions: 140, deletions: 20, churnRatio: 0.14 },
          { filePath: 'src/modules/auth/auth.controller.ts', additions: 105, deletions: 12, churnRatio: 0.11 },
        ],
      },
    },
  });

  const commit2 = await prisma.commit.upsert({
    where: { repositoryId_sha: { repositoryId: backendRepo.id, sha: 'f1e2d3c4b5a67890123456789abcdef012345679' } },
    update: {},
    create: {
      repositoryId: backendRepo.id,
      developerId: dev2.id,
      sha: 'f1e2d3c4b5a67890123456789abcdef012345679',
      message: 'fix(sprints): correct burndown remaining points calculation for weekends',
      authorEmail: dev2.email,
      authorName: dev2.name,
      classification: CommitClassification.BUGFIX,
      linesAdded: 45,
      linesDeleted: 12,
      filesChanged: 2,
      churnRatio: 0.26,
      anomalyFlag: false,
      anomalyScore: 0.14,
      committedAt: new Date(Date.now() - 3 * 86400000),
      fileChanges: {
        create: [
          { filePath: 'src/modules/sprints/sprints.service.ts', additions: 45, deletions: 12, churnRatio: 0.26 },
        ],
      },
    },
  });

  const commit3 = await prisma.commit.upsert({
    where: { repositoryId_sha: { repositoryId: frontendRepo.id, sha: 'b8c7d6e5f4a32109876543210fedcba987654321' } },
    update: {},
    create: {
      repositoryId: frontendRepo.id,
      developerId: dev2.id,
      sha: 'b8c7d6e5f4a32109876543210fedcba987654321',
      message: 'feat(charts): implement interactive Recharts sprint burndown chart',
      authorEmail: dev2.email,
      authorName: dev2.name,
      classification: CommitClassification.FEATURE,
      linesAdded: 180,
      linesDeleted: 40,
      filesChanged: 4,
      churnRatio: 0.22,
      anomalyFlag: false,
      anomalyScore: 0.05,
      committedAt: new Date(Date.now() - 1 * 86400000),
      fileChanges: {
        create: [
          { filePath: 'src/components/charts/BurndownChart.tsx', additions: 120, deletions: 0, churnRatio: 0.0 },
          { filePath: 'src/pages/sprints/SprintDetailPage.tsx', additions: 60, deletions: 40, churnRatio: 0.4 },
        ],
      },
    },
  });
  console.log('✅ Commits and file changes seeded');

  // 9. DQS Scores
  await prisma.dQSScore.createMany({
    data: [
      {
        developerId: dev1.id,
        score: 88.5,
        modelVersion: 'v1.2.0',
        featureValues: {
          sastQuality: 92.0,
          complexityScore: 86.0,
          maintainability: 89.0,
          reviewTurnaround: 87.0,
        },
        shapValues: { sastQuality: +4.2, complexityScore: -1.5, maintainability: +2.8 },
        calculatedAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        developerId: dev2.id,
        score: 84.2,
        modelVersion: 'v1.2.0',
        featureValues: {
          sastQuality: 86.0,
          complexityScore: 82.0,
          maintainability: 85.0,
          reviewTurnaround: 83.5,
        },
        shapValues: { sastQuality: +1.2, complexityScore: -2.1, maintainability: +1.1 },
        calculatedAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        developerId: lead.id,
        score: 91.0,
        modelVersion: 'v1.2.0',
        featureValues: {
          sastQuality: 94.0,
          complexityScore: 90.0,
          maintainability: 91.0,
          reviewTurnaround: 90.0,
        },
        shapValues: { sastQuality: +5.0, complexityScore: +2.0, maintainability: +3.0 },
        calculatedAt: new Date(Date.now() - 2 * 86400000),
      },
    ],
  });
  console.log('✅ Developer Quality Scores (DQS) seeded');

  // 10. Code Reviews
  await prisma.review.upsert({
    where: { repositoryId_githubReviewId: { repositoryId: backendRepo.id, githubReviewId: 501 } },
    update: {},
    create: {
      repositoryId: backendRepo.id,
      reviewerId: lead.id,
      githubReviewId: 501,
      githubPrId: 101,
      prNumber: 101,
      prTitle: 'feat(auth): add JWT token refresh and profile update endpoints',
      prUrl: 'https://github.com/acme-corp/backend-api/pull/101',
      state: ReviewState.APPROVED,
      body: 'LGTM! Great test coverage and clean implementation of bcrypt credential checks.',
      turnaroundMinutes: 45,
      turnaroundClass: TurnaroundClass.FAST,
      submittedAt: new Date(Date.now() - 4 * 86400000),
      comments: {
        create: [
          {
            authorId: lead.id,
            githubCommentId: 901,
            body: 'Consider adding a rate limit on the change-password endpoint as well.',
            filePath: 'src/modules/auth/auth.controller.ts',
            lineNumber: 48,
            commentClass: CommentClass.CONSTRUCTIVE,
            isResolved: true,
            resolvedAt: new Date(Date.now() - 4 * 86400000),
          },
        ],
      },
    },
  });
  console.log('✅ Code reviews & review comments seeded');

  // 11. Technical Debt Items
  await prisma.debtItem.createMany({
    data: [
      {
        repositoryId: backendRepo.id,
        filePath: 'src/modules/database/legacy-query.ts',
        markerType: DebtMarker.TODO,
        content: 'TODO: Replace legacy raw SQL query with Prisma ORM parameterized client',
        lineNumber: 142,
        isResolved: false,
        authorId: dev1.id,
        createdAt: new Date(Date.now() - 10 * 86400000),
      },
      {
        repositoryId: backendRepo.id,
        filePath: 'src/modules/github/webhook.service.ts',
        markerType: DebtMarker.FIXME,
        content: 'FIXME: Add exponential backoff retry loop for failed external webhook notifications',
        lineNumber: 88,
        isResolved: false,
        authorId: dev2.id,
        createdAt: new Date(Date.now() - 8 * 86400000),
      },
      {
        repositoryId: frontendRepo.id,
        filePath: 'src/components/common/LegacyTable.tsx',
        markerType: DebtMarker.HACK,
        content: 'HACK: Temporary pagination workaround before virtualized list implementation',
        lineNumber: 54,
        isResolved: true,
        resolvedAt: new Date(Date.now() - 1 * 86400000),
        authorId: dev2.id,
        resolverId: dev1.id,
        createdAt: new Date(Date.now() - 15 * 86400000),
      },
    ],
  });
  console.log('✅ Technical debt items seeded');

  // 12. Alerts
  await prisma.alert.createMany({
    data: [
      {
        organizationId: org.id,
        commitId: commit1.id,
        type: AlertType.ANOMALY,
        severity: AlertSeverity.MEDIUM,
        message: 'High code churn ratio detected across auth controller module',
        anomalyScore: 0.68,
        status: AlertStatus.RESOLVED,
        acknowledgedBy: lead.id,
        acknowledgedAt: new Date(Date.now() - 4 * 86400000),
        resolvedBy: lead.id,
        resolvedAt: new Date(Date.now() - 3 * 86400000),
        resolutionNotes: 'Reviewed with alex, churn was due to new DTO validations and unit tests.',
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        organizationId: org.id,
        type: AlertType.THRESHOLD,
        severity: AlertSeverity.LOW,
        message: 'Repository backend-api cyclomatic complexity increased by 4.2%',
        status: AlertStatus.OPEN,
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ],
  });
  console.log('✅ Alerts seeded');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials for Viva / Demo:');
  console.log('  👑 Admin:     admin@sqdis.local  /  Admin123!');
  console.log('  👩‍💼 Team Lead: lead@sqdis.local   /  Password123!');
  console.log('  👨‍💻 Dev 1:     dev1@sqdis.local   /  Password123!');
  console.log('  👨‍💻 Dev 2:     dev2@sqdis.local   /  Password123!');
  console.log('----------------------------------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
