import { Octokit } from 'octokit';

import { GithubApiCalculators } from './GithubApiCalculators';
import { GithubApiHelpers } from './GithubApiHelpers';
import {
  Repository,
  Contributor,
  PullRequest,
  Issue,
  Commit,
  Language,
  User,
  RepositorySimple,
  Review,
  SearchResult,
  TeamMember,
  ProjectHealthMetrics,
  HealthMetric,
} from './types';

export class GithubApiService {
  private static readonly octokit = new Octokit({
    auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
  });

  private static getOctokit(): Octokit {
    return GithubApiService.octokit;
  }

  static async getRepository(owner: string, repo: string): Promise<Repository> {
    const response = await GithubApiService.getOctokit().rest.repos.get({ owner, repo });
    return response.data;
  }

  static async getRepositoryContributors(
    owner: string,
    repo: string,
    perPage = 100,
    page = 1,
  ): Promise<Contributor[]> {
    const response = await GithubApiService.getOctokit().rest.repos.listContributors({
      owner,
      repo,
      per_page: perPage,
      page,
    });
    return response.data;
  }

  static async getRepositoryPullRequests(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'all',
    perPage = 100,
  ): Promise<PullRequest[]> {
    const response = await GithubApiService.getOctokit().rest.pulls.list({
      owner,
      repo,
      state,
      per_page: perPage,
      sort: 'created',
      direction: 'desc',
    });
    return response.data;
  }

  static async getRepositoryIssues(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'all',
    perPage = 100,
  ): Promise<Issue[]> {
    const response = await GithubApiService.getOctokit().rest.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: perPage,
      sort: 'created',
      direction: 'desc',
    });
    return response.data;
  }

  static async getRepositoryLanguages(owner: string, repo: string): Promise<Language> {
    const response = await GithubApiService.getOctokit().rest.repos.listLanguages({
      owner,
      repo,
    });
    return response.data;
  }

  static async getRepositoryCommits(
    owner: string,
    repo: string,
    since?: string,
    until?: string,
    perPage = 100,
  ): Promise<Commit[]> {
    const response = await GithubApiService.getOctokit().rest.repos.listCommits({
      owner,
      repo,
      since,
      until,
      per_page: perPage,
    });
    return response.data;
  }

  static async getRepositoryActivity(owner: string, repo: string) {
    const response = await GithubApiService.getOctokit().rest.repos.getCommitActivityStats({
      owner,
      repo,
    });
    return Array.isArray(response.data) ? response.data : [];
  }

  static async getRepositoryStats(owner: string, repo: string) {
    const response = await GithubApiService.getOctokit().rest.repos.getCommunityProfileMetrics({
      owner,
      repo,
    });
    return response.data;
  }

  static async getUser(user: string): Promise<User> {
    const response = await GithubApiService.getOctokit().rest.users.getByUsername({
      username: user,
    });
    return response.data;
  }

  static async getUserRepositories(
    user: string,
    type: 'all' | 'owner' | 'member' = 'owner',
    perPage = 100,
  ): Promise<RepositorySimple[]> {
    const response = await GithubApiService.getOctokit().rest.repos.listForUser({
      username: user,
      type,
      per_page: perPage,
      sort: 'updated',
    });
    return response.data;
  }

  static async getUserEvents(user: string, perPage = 100) {
    const response = await GithubApiService.getOctokit().rest.activity.listPublicEventsForUser({
      username: user,
      per_page: perPage,
    });
    return response.data;
  }

  static async getUserStarredRepos(user: string, perPage = 100) {
    const response = await GithubApiService.getOctokit().rest.activity.listReposStarredByUser({
      username: user,
      per_page: perPage,
      sort: 'updated',
    });
    return response.data;
  }

  static async searchRepositories(query: string, perPage = 10): Promise<SearchResult['items']> {
    const response = await GithubApiService.getOctokit().rest.search.repos({
      q: query,
      per_page: perPage,
      sort: 'stars',
      order: 'desc',
    });
    return response.data.items;
  }

  static async getPullRequestReviews(
    owner: string,
    repo: string,
    pullNumber: number,
  ): Promise<Review[]> {
    const response = await GithubApiService.getOctokit().rest.pulls.listReviews({
      owner,
      repo,
      pull_number: pullNumber,
    });
    return response.data;
  }

  static async getTeamContributors(
    owner: string,
    repo: string,
  ): Promise<TeamMember[]> {
    const contributors = await GithubApiService.getRepositoryContributors(owner, repo, 100);
    const limitedContributors = GithubApiHelpers.limitContributors(contributors, 20);
    const detailedContributors: TeamMember[] = [];

    for (const contributor of limitedContributors) {
      try {
        const user = contributor.login
          ? await GithubApiService.getUser(contributor.login)
          : undefined;
        detailedContributors.push(
          GithubApiHelpers.transformContributorToTeamMember(contributor, user),
        );
      } catch {
        console.warn(
          `Failed to get details for contributor ${contributor.login}`,
        );
        detailedContributors.push(
          GithubApiHelpers.transformContributorToTeamMember(contributor),
        );
      }
    }

    return detailedContributors;
  }

  static async getTeamMetrics(
    owner: string,
    repo: string,
    since?: string,
    until?: string,
  ) {
    const [pullRequests, issues, commits] = await Promise.all([
      GithubApiService.getRepositoryPullRequests(owner, repo),
      GithubApiService.getRepositoryIssues(owner, repo),
      GithubApiService.getRepositoryCommits(owner, repo, since, until),
    ]);

    const prCounts = GithubApiHelpers.getPullRequestCounts(pullRequests);

    return {
      totalCommits: commits.length,
      totalPullRequests: prCounts.total,
      totalIssues: issues.length,
      openPullRequests: prCounts.open,
      closedPullRequests: prCounts.closed,
      mergedPullRequests: prCounts.merged,
      averageResponseTime: GithubApiCalculators.calculateAverageResponseTime(pullRequests),
      codeReviewCoverage: await GithubApiCalculators.calculateReviewCoverage(
        GithubApiService.getPullRequestReviews.bind(GithubApiService),
        owner,
        repo,
        prCounts.mergedPRs,
      ),
    };
  }

  static async getProjectHealthMetrics(
    owner: string,
    repo: string,
  ): Promise<ProjectHealthMetrics> {
    const [issues, pullRequests, contributors] = await Promise.all([
      GithubApiService.getRepositoryIssues(owner, repo),
      GithubApiService.getRepositoryPullRequests(owner, repo),
      GithubApiService.getRepositoryContributors(owner, repo),
    ]);

    const issueCounts = GithubApiHelpers.getIssueCounts(issues);
    const mergedPRs = GithubApiHelpers.getMergedPullRequests(pullRequests);

    const timeToFirstResponse = GithubApiCalculators.calculateTimeToFirstResponse(
      owner,
      repo,
      issues,
    );
    const prMergeTime = GithubApiCalculators.calculatePRMergeTime(mergedPRs);
    const issueResolutionRate = GithubApiCalculators.calculateIssueResolutionRate(
      issueCounts.closedIssues,
      issueCounts.openIssuesNoPR,
    );
    const busFactor = GithubApiCalculators.calculateBusFactor(contributors);

    const metrics: HealthMetric[] = [
      {
        name: 'Time to First Response',
        value: timeToFirstResponse,
        threshold: 24,
        trend: 'stable',
        status: timeToFirstResponse <= 24 ? 'healthy' : 'warning',
      },
      {
        name: 'PR Merge Time',
        value: prMergeTime,
        threshold: 48,
        trend: 'stable',
        status: prMergeTime <= 48 ? 'healthy' : 'warning',
      },
      {
        name: 'Issue Resolution Rate',
        value: issueResolutionRate,
        threshold: 70,
        trend: 'stable',
        status: issueResolutionRate >= 70 ? 'healthy' : 'warning',
      },
      {
        name: 'Bus Factor',
        value: busFactor.score,
        threshold: 3,
        trend: 'up',
        status: busFactor.score >= 3 ? 'healthy' : 'warning',
      },
    ];

    const overallScore = GithubApiCalculators.calculateOverallHealthScore(metrics);

    return {
      overallScore,
      metrics,
      busFactor,
      alerts: GithubApiCalculators.generateHealthAlerts(metrics, busFactor),
    };
  }
}