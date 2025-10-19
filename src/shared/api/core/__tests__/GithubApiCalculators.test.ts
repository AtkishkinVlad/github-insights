import { describe, it, expect, vi } from 'vitest';

import type { PullRequest, Issue, HealthMetric } from '../types';

import { GithubApiCalculators } from '../GithubApiCalculators';
import {
  createMockPR,
  createMockIssue,
  createMockContributor,
} from './GithubApi.mock';

describe('GithubApiCalculators', () => {
  describe('calculatePRMergeTime', () => {
    it('should return 0 for empty array', () => {
      const result = GithubApiCalculators.calculatePRMergeTime([]);
      expect(result).toBe(0);
    });

    it('should calculate average merge time correctly', () => {
      const prs: PullRequest[] = [
        createMockPR({
          created_at: '2024-01-01T00:00:00Z',
          merged_at: '2024-01-01T12:00:00Z', // 12 hours
        }),
        createMockPR({
          created_at: '2024-01-02T00:00:00Z',
          merged_at: '2024-01-02T06:00:00Z', // 6 hours
        }),
      ];

      const result = GithubApiCalculators.calculatePRMergeTime(prs);
      expect(result).toBe(9); // (12 + 6) / 2 = 9 hours
    });

    it('should ignore PRs without merge_at', () => {
      const prs: PullRequest[] = [
        createMockPR({
          created_at: '2024-01-01T00:00:00Z',
          merged_at: '2024-01-01T12:00:00Z', // 12 hours
        }),
        createMockPR({
          created_at: '2024-01-02T00:00:00Z',
          merged_at: null, // Not merged
        }),
      ];

      const result = GithubApiCalculators.calculatePRMergeTime(prs);
      expect(result).toBe(12); // Only count the merged one
    });
  });

  describe('calculateIssueResolutionRate', () => {
    it('should return 0 for no issues', () => {
      const result = GithubApiCalculators.calculateIssueResolutionRate([], []);
      expect(result).toBe(0);
    });

    it('should calculate resolution rate correctly', () => {
      const closedIssues = [
        createMockIssue({ state: 'closed' }),
        createMockIssue({ state: 'closed' }),
        createMockIssue({ state: 'closed' }),
      ];
      const openIssues = [
        createMockIssue({ state: 'open' }),
        createMockIssue({ state: 'open' }),
      ];

      // 3 closed out of 5 total = 60%
      const result = GithubApiCalculators.calculateIssueResolutionRate(closedIssues, openIssues);
      expect(result).toBe(60);
    });

    it('should handle only closed issues', () => {
      const closedIssues = [
        createMockIssue({ state: 'closed' }),
        createMockIssue({ state: 'closed' }),
      ];
      const openIssues: Issue[] = [];

      // 2 closed out of 2 total = 100%
      const result = GithubApiCalculators.calculateIssueResolutionRate(closedIssues, openIssues);
      expect(result).toBe(100);
    });
  });

  describe('calculateBusFactor', () => {
    it('should calculate bus factor correctly', () => {
      const contributors = [
        createMockContributor({ contributions: 50 }), // Top contributor
        createMockContributor({ contributions: 30 }), // Second contributor
        createMockContributor({ contributions: 20 }), // Third contributor
        createMockContributor({ contributions: 10 }), // Fourth contributor
      ];
      // Total: 110, 80% = 88, so we need first 3 contributors (50 + 30 + 20 = 100 >= 88)

      const result = GithubApiCalculators.calculateBusFactor(contributors);
      expect(result.score).toBe(3);
      expect(result.criticalContributors).toBe(3);
      expect(result.riskLevel).toBe('medium'); // 3 contributors, so medium risk
    });

    it('should classify risk levels correctly', () => {
      // Test high risk (< 3 contributors)
      const highRiskContributors = [
        createMockContributor({ contributions: 100 }),
        createMockContributor({ contributions: 20 }),
      ];
      const highRiskResult = GithubApiCalculators.calculateBusFactor(highRiskContributors);
      expect(highRiskResult.riskLevel).toBe('high');

      // Test medium risk (3-4 contributors)
      const mediumRiskContributors = Array.from({ length: 4 }, () =>
        createMockContributor({ contributions: 25 }),
      );
      const mediumRiskResult = GithubApiCalculators.calculateBusFactor(mediumRiskContributors);
      expect(mediumRiskResult.riskLevel).toBe('medium');

      // Test low risk (5+ contributors)
      const lowRiskContributors = Array.from({ length: 6 }, () =>
        createMockContributor({ contributions: 20 }),
      );
      const lowRiskResult = GithubApiCalculators.calculateBusFactor(lowRiskContributors);
      expect(lowRiskResult.riskLevel).toBe('low');
    });
  });

  describe('calculateTimeToFirstResponse', () => {
    it('should return mock value', () => {
      const issues: Issue[] = [createMockIssue()];
      const result = GithubApiCalculators.calculateTimeToFirstResponse('owner', 'repo', issues);
      expect(result).toBe(4.2);
    });
  });

  describe('calculateOverallHealthScore', () => {
    it('should calculate health score correctly', () => {
      const metrics = [
        {
          name: 'Time to First Response',
          value: 12, // 12 hours, threshold 24, good score
          threshold: 24,
          trend: 'stable' as const,
          status: 'healthy' as const,
        },
        {
          name: 'PR Merge Time',
          value: 24, // 24 hours, threshold 48, good score
          threshold: 48,
          trend: 'stable' as const,
          status: 'healthy' as const,
        },
        {
          name: 'Issue Resolution Rate',
          value: 80, // 80%, good score
          threshold: 70,
          trend: 'stable' as const,
          status: 'healthy' as const,
        },
        {
          name: 'Bus Factor',
          value: 5, // 5 contributors, threshold 3, good score
          threshold: 3,
          trend: 'up' as const,
          status: 'healthy' as const,
        },
      ];

      const result = GithubApiCalculators.calculateOverallHealthScore(metrics);

      // Expected calculation:
      // Time to First Response: max(0, 100 - (12/24) * 100) = 50
      // PR Merge Time: max(0, 100 - (24/48) * 100) = 50
      // Issue Resolution Rate: 80
      // Bus Factor: min(100, (5/3) * 100) = 100
      // Final: (50 * 0.25) + (50 * 0.25) + (80 * 0.25) + (100 * 0.25) = 12.5 + 12.5 + 20 + 25 = 70
      expect(result).toBe(70);
    });
  });

  describe('generateHealthAlerts', () => {
    it('should generate alerts for warning metrics', () => {
      const metrics = [
        {
          name: 'Test Metric',
          value: 100,
          threshold: 50,
          trend: 'up' as const,
          status: 'warning' as const,
        },
      ];

      const busFactor = {
        score: 5,
        criticalContributors: 5,
        riskLevel: 'low' as const,
      };

      const alerts = GithubApiCalculators.generateHealthAlerts(metrics, busFactor);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('warning');
      expect(alerts[0].message).toContain('Test Metric is above recommended threshold');
    });

    it('should generate alerts for critical bus factor', () => {
      const metrics: HealthMetric[] = [];
      const busFactor = {
        score: 1,
        criticalContributors: 1,
        riskLevel: 'high' as const,
      };

      const alerts = GithubApiCalculators.generateHealthAlerts(metrics, busFactor);

      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('critical');
      expect(alerts[0].message).toContain('Bus factor is critically low');
    });
  });

  describe('calculateAverageResponseTime', () => {
    it('should return 0 for empty array', () => {
      const result = GithubApiCalculators.calculateAverageResponseTime([]);
      expect(result).toBe(0);
    });

    it('should calculate average response time', () => {
      const prs: PullRequest[] = [
        createMockPR({ created_at: '2024-01-01T00:00:00Z' }),
        createMockPR({ created_at: '2024-01-02T00:00:00Z' }),
      ];

      const result = GithubApiCalculators.calculateAverageResponseTime(prs);
      expect(result).toBe(4); // Mock implementation returns 4 hours for each PR
    });
  });

  describe('calculateReviewCoverage', () => {
    it('should return 0 for empty merged PRs', async () => {
      const mockGetReviews = vi.fn();
      const result = await GithubApiCalculators.calculateReviewCoverage(
        mockGetReviews,
        'owner',
        'repo',
        [],
      );

      expect(result).toBe(0);
    });

    it('should calculate review coverage correctly', async () => {
      const mergedPRs = [
        createMockPR({ number: 1 }),
        createMockPR({ number: 2 }),
        createMockPR({ number: 3 }),
      ];

      const mockGetReviews = vi.fn()
        .mockResolvedValueOnce([{ id: 1 }]) // PR 1 has reviews
        .mockResolvedValueOnce([]) // PR 2 has no reviews
        .mockResolvedValueOnce([{ id: 2 }]); // PR 3 has reviews

      const result = await GithubApiCalculators.calculateReviewCoverage(
        mockGetReviews,
        'owner',
        'repo',
        mergedPRs,
      );

      expect(result).toBe(67); // 2 out of 3 PRs have reviews = 67%
    });
  });
});
