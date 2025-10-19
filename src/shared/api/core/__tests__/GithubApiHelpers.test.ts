import { describe, it, expect } from 'vitest';

import type { PullRequest, Issue, Contributor } from '../types';

import { GithubApiHelpers } from '../GithubApiHelpers';
import {
  createMockUser,
  createMockPR,
  createMockIssue,
  createMockContributor,
} from './GithubApi.mock';

describe('GithubApiHelpers', () => {
  describe('filterPullRequestsByState', () => {
    it('should filter open pull requests', () => {
      const prs: PullRequest[] = [
        createMockPR({ state: 'open' }),
        createMockPR({ state: 'closed' }),
        createMockPR({ state: 'open' }),
      ];

      const result = GithubApiHelpers.filterPullRequestsByState(prs, 'open');
      expect(result).toHaveLength(2);
      expect(result.every((pr) => pr.state === 'open')).toBe(true);
    });

    it('should filter closed pull requests', () => {
      const prs: PullRequest[] = [
        createMockPR({ state: 'open' }),
        createMockPR({ state: 'closed' }),
        createMockPR({ state: 'closed' }),
      ];

      const result = GithubApiHelpers.filterPullRequestsByState(prs, 'closed');
      expect(result).toHaveLength(2);
      expect(result.every((pr) => pr.state === 'closed')).toBe(true);
    });

    it('should filter merged pull requests', () => {
      const prs: PullRequest[] = [
        createMockPR({ state: 'closed', merged_at: null }),
        createMockPR({ state: 'closed', merged_at: '2024-01-01T12:00:00Z' }),
        createMockPR({ state: 'open', merged_at: null }),
      ];

      const result = GithubApiHelpers.filterPullRequestsByState(prs, 'merged');
      expect(result).toHaveLength(1);
      expect(result[0].merged_at).not.toBeNull();
    });
  });

  describe('filterIssuesByState', () => {
    it('should filter open issues', () => {
      const issues: Issue[] = [
        createMockIssue({ state: 'open' }),
        createMockIssue({ state: 'closed' }),
        createMockIssue({ state: 'open' }),
      ];

      const result = GithubApiHelpers.filterIssuesByState(issues, 'open');
      expect(result).toHaveLength(2);
      expect(result.every((issue) => issue.state === 'open')).toBe(true);
    });

    it('should filter closed issues', () => {
      const issues: Issue[] = [
        createMockIssue({ state: 'open' }),
        createMockIssue({ state: 'closed' }),
        createMockIssue({ state: 'closed' }),
      ];

      const result = GithubApiHelpers.filterIssuesByState(issues, 'closed');
      expect(result).toHaveLength(2);
      expect(result.every((issue) => issue.state === 'closed')).toBe(true);
    });

    it('should filter open issues without pull requests', () => {
      const issues: Issue[] = [
        createMockIssue({ state: 'open', pull_request: undefined }),
        createMockIssue({ state: 'open', pull_request: { url: 'test', html_url: 'test', diff_url: 'test', patch_url: 'test' } }),
        createMockIssue({ state: 'closed' }),
      ];

      const result = GithubApiHelpers.filterIssuesByState(issues, 'open_no_pr');
      expect(result).toHaveLength(1);
      expect(result[0].state).toBe('open');
      expect(result[0].pull_request).toBeUndefined();
    });
  });

  describe('getMergedPullRequests', () => {
    it('should return only merged pull requests', () => {
      const prs: PullRequest[] = [
        createMockPR({ state: 'closed', merged_at: null }),
        createMockPR({ state: 'closed', merged_at: '2024-01-01T12:00:00Z' }),
        createMockPR({ state: 'open' }),
      ];

      const result = GithubApiHelpers.getMergedPullRequests(prs);
      expect(result).toHaveLength(1);
      expect(result[0].merged_at).not.toBeNull();
    });
  });

  describe('limitContributors', () => {
    it('should limit contributors to specified number', () => {
      const contributors: Contributor[] = [
        createMockContributor({ login: 'user1' }),
        createMockContributor({ login: 'user2' }),
        createMockContributor({ login: 'user3' }),
        createMockContributor({ login: 'user4' }),
      ];

      const result = GithubApiHelpers.limitContributors(contributors, 2);
      expect(result).toHaveLength(2);
      expect(result[0].login).toBe('user1');
      expect(result[1].login).toBe('user2');
    });

    it('should handle limit larger than array length', () => {
      const contributors: Contributor[] = [
        createMockContributor({ login: 'user1' }),
      ];

      const result = GithubApiHelpers.limitContributors(contributors, 10);
      expect(result).toHaveLength(1);
    });
  });

  describe('transformContributorToTeamMember', () => {
    it('should transform contributor with user data', () => {
      const contributor = createMockContributor({ contributions: 25 });
      const user = createMockUser();

      const result = GithubApiHelpers.transformContributorToTeamMember(contributor, user);

      expect(result.commits).toBe(25);
      expect(result.user).toEqual(user);
      expect(result.additions).toBe(0);
      expect(result.deletions).toBe(0);
      expect(result.activityScore).toBe(0);
    });

    it('should transform contributor without user data', () => {
      const contributor = createMockContributor({ contributions: 15 });

      const result = GithubApiHelpers.transformContributorToTeamMember(contributor);

      expect(result.commits).toBe(15);
      expect(result.user).toBeUndefined();
      expect(result.additions).toBe(0);
    });
  });

  describe('getPullRequestCounts', () => {
    it('should return correct counts for different PR states', () => {
      const prs: PullRequest[] = [
        createMockPR({ state: 'open' }),
        createMockPR({ state: 'open' }),
        createMockPR({ state: 'closed', merged_at: null }),
        createMockPR({ state: 'closed', merged_at: '2024-01-01T12:00:00Z' }),
      ];

      const result = GithubApiHelpers.getPullRequestCounts(prs);

      expect(result.total).toBe(4);
      expect(result.open).toBe(2);
      expect(result.closed).toBe(2);
      expect(result.merged).toBe(1);
      expect(result.openPRs).toHaveLength(2);
      expect(result.closedPRs).toHaveLength(2);
      expect(result.mergedPRs).toHaveLength(1);
    });
  });

  describe('getIssueCounts', () => {
    it('should return correct counts for different issue states', () => {
      const issues: Issue[] = [
        createMockIssue({ state: 'open', pull_request: undefined }),
        createMockIssue({ state: 'open', pull_request: { url: 'test', html_url: 'test', diff_url: 'test', patch_url: 'test' } }),
        createMockIssue({ state: 'closed' }),
        createMockIssue({ state: 'closed' }),
      ];

      const result = GithubApiHelpers.getIssueCounts(issues);

      expect(result.total).toBe(4);
      expect(result.open).toBe(2);
      expect(result.closed).toBe(2);
      expect(result.openNoPR).toBe(1);
      expect(result.openIssues).toHaveLength(2);
      expect(result.closedIssues).toHaveLength(2);
      expect(result.openIssuesNoPR).toHaveLength(1);
    });
  });
});
