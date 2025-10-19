import type {
  PullRequest,
  Issue,
  Contributor,
  TeamMember,
  User,
} from './types';

export class GithubApiHelpers {
  /**
   * Filter pull requests by state
   */
  static filterPullRequestsByState(
    pullRequests: PullRequest[],
    state: 'open' | 'closed' | 'merged',
  ): PullRequest[] {
    switch (state) {
      case 'open':
        return pullRequests.filter((pr) => pr.state === 'open');
      case 'closed':
        return pullRequests.filter((pr) => pr.state === 'closed');
      case 'merged':
        return pullRequests.filter((pr) => pr.merged_at !== null);
      default:
        return pullRequests;
    }
  }

  /**
   * Filter issues by state and exclude pull requests
   */
  static filterIssuesByState(
    issues: Issue[],
    state: 'open' | 'closed' | 'open_no_pr',
  ): Issue[] {
    switch (state) {
      case 'open':
        return issues.filter((issue) => issue.state === 'open');
      case 'closed':
        return issues.filter((issue) => issue.state === 'closed');
      case 'open_no_pr':
        return issues.filter(
          (issue) => issue.state === 'open' && !issue.pull_request,
        );
      default:
        return issues;
    }
  }

  /**
   * Get merged pull requests (closed PRs with merged_at)
   */
  static getMergedPullRequests(pullRequests: PullRequest[]): PullRequest[] {
    return pullRequests.filter(
      (pr) => pr.state === 'closed' && pr.merged_at !== null,
    );
  }

  /**
   * Limit contributors array to specified number
   */
  static limitContributors(
    contributors: Contributor[],
    limit: number,
  ): Contributor[] {
    return contributors.slice(0, limit);
  }

  /**
   * Transform contributor to TeamMember with default values
   */
  static transformContributorToTeamMember(
    contributor: Contributor,
    user?: User,
  ): TeamMember {
    return {
      ...contributor,
      user,
      commits: contributor.contributions || 0,
      additions: 0,
      deletions: 0,
      pullRequests: 0,
      issues: 0,
      codeReviews: 0,
      linesOfCode: 0,
      activityScore: 0,
      collaborationScore: 0,
    };
  }

  /**
   * Get pull request counts by state
   */
  static getPullRequestCounts(pullRequests: PullRequest[]) {
    const open = GithubApiHelpers.filterPullRequestsByState(pullRequests, 'open');
    const closed = GithubApiHelpers.filterPullRequestsByState(pullRequests, 'closed');
    const merged = GithubApiHelpers.getMergedPullRequests(pullRequests);

    return {
      total: pullRequests.length,
      open: open.length,
      closed: closed.length,
      merged: merged.length,
      openPRs: open,
      closedPRs: closed,
      mergedPRs: merged,
    };
  }

  /**
   * Get issue counts by state
   */
  static getIssueCounts(issues: Issue[]) {
    const open = GithubApiHelpers.filterIssuesByState(issues, 'open');
    const closed = GithubApiHelpers.filterIssuesByState(issues, 'closed');
    const openNoPR = GithubApiHelpers.filterIssuesByState(issues, 'open_no_pr');

    return {
      total: issues.length,
      open: open.length,
      closed: closed.length,
      openNoPR: openNoPR.length,
      openIssues: open,
      closedIssues: closed,
      openIssuesNoPR: openNoPR,
    };
  }
}
