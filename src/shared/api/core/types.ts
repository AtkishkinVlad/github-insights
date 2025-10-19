import { Octokit } from 'octokit';

export type Repository = Awaited<ReturnType<Octokit['rest']['repos']['get']>>['data'];
export type Contributor = Awaited<
  ReturnType<Octokit['rest']['repos']['listContributors']>
>['data'][0];
export type PullRequest = Awaited<
  ReturnType<Octokit['rest']['pulls']['list']>
>['data'][0];
export type Issue = Awaited<
  ReturnType<Octokit['rest']['issues']['listForRepo']>
>['data'][0];
export type Commit = Awaited<
  ReturnType<Octokit['rest']['repos']['listCommits']>
>['data'][0];
export type Language = Awaited<
  ReturnType<Octokit['rest']['repos']['listLanguages']>
>['data'];
export type User = Awaited<
  ReturnType<Octokit['rest']['users']['getByUsername']>
>['data'];
export type RepositorySimple = Awaited<
  ReturnType<Octokit['rest']['repos']['listForUser']>
>['data'][0];
export type Review = Awaited<
  ReturnType<Octokit['rest']['pulls']['listReviews']>
>['data'][0];
export type SearchResult = Awaited<
  ReturnType<Octokit['rest']['search']['repos']>
>['data'];

export interface RepositoryAnalytics {
  repository: Repository;
  contributors: Contributor[];
  pullRequests: {
    open: PullRequest[];
    closed: PullRequest[];
    merged: PullRequest[];
  };
  issues: {
    open: Issue[];
    closed: Issue[];
  };
  languages: Language;
  activity: unknown[];
  healthScore: number;
}

export interface TeamMember extends Contributor {
  user?: User;
  commits: number;
  additions: number;
  deletions: number;
  pullRequests: number;
  issues: number;
  codeReviews: number;
  linesOfCode: number;
  activityScore: number;
  collaborationScore: number;
}

export interface TeamAnalytics {
  members: TeamMember[];
  teamMetrics: {
    totalCommits: number;
    totalPullRequests: number;
    totalIssues: number;
    averageResponseTime: number;
    codeReviewCoverage: number;
  };
}

export interface DeveloperProfile {
  user: User;
  repositories: RepositorySimple[];
  contributionGraph: unknown[];
  activityStats: {
    commits: number;
    pullRequests: number;
    issues: number;
    codeReviews: number;
  };
  skillRadar: Record<string, number>;
}

export interface HealthMetric {
  name: string;
  value: number;
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
}

export interface BusFactor {
  score: number;
  criticalContributors: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface HealthAlert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface ProjectHealthMetrics {
  overallScore: number;
  metrics: HealthMetric[];
  busFactor: BusFactor;
  alerts: HealthAlert[];
}
