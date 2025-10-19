import { useQuery } from '@tanstack/react-query';

import { GithubApiService } from '../core/index';

export const QUERY_KEYS = {
  REPOSITORY: 'repository',
  REPOSITORY_CONTRIBUTORS: 'repository_contributors',
  REPOSITORY_PULL_REQUESTS: 'repository_pull_requests',
  REPOSITORY_ISSUES: 'repository_issues',
  REPOSITORY_LANGUAGES: 'repository_languages',
  REPOSITORY_COMMITS: 'repository_commits',
  REPOSITORY_ACTIVITY: 'repository_activity',
  REPOSITORY_STATS: 'repository_stats',
  // Client-only queries for interactive features
  REPOSITORY_SEARCH: 'repository_search',
  REPOSITORY_ANALYTICS: 'repository_analytics',
} as const;

interface RepositoryRequest {
  owner: string;
  repo: string;
}

interface RepositoryRequestWithState extends RepositoryRequest {
  state?: 'open' | 'closed' | 'all';
  perPage?: number;
}

interface RepositoryRequestWithTime extends RepositoryRequest {
  since?: string;
  until?: string;
  perPage?: number;
}

export const useRepository = ({ owner, repo }: RepositoryRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REPOSITORY, owner, repo],
    queryFn: () => GithubApiService.getRepository(owner, repo),
    enabled: !!(owner && repo),
  });
};

export const useRepositoryContributors = (
  { owner, repo }: RepositoryRequest,
  options?: { perPage?: number; page?: number },
) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.REPOSITORY_CONTRIBUTORS,
      owner,
      repo,
      options?.perPage,
      options?.page,
    ],
    queryFn: () =>
      GithubApiService.getRepositoryContributors(
        owner,
        repo,
        options?.perPage,
        options?.page,
      ),
    enabled: !!(owner && repo),
  });
};

export const useRepositoryPullRequests = ({
  owner,
  repo,
  state = 'all',
  perPage = 100,
}: RepositoryRequestWithState) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.REPOSITORY_PULL_REQUESTS,
      owner,
      repo,
      state,
      perPage,
    ],
    queryFn: () =>
      GithubApiService.getRepositoryPullRequests(owner, repo, state, perPage),
    enabled: !!(owner && repo),
  });
};

export const useRepositoryIssues = ({
  owner,
  repo,
  state = 'all',
  perPage = 100,
}: RepositoryRequestWithState) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REPOSITORY_ISSUES, owner, repo, state, perPage],
    queryFn: () =>
      GithubApiService.getRepositoryIssues(owner, repo, state, perPage),
    enabled: !!(owner && repo),
  });
};

export const useRepositoryLanguages = ({ owner, repo }: RepositoryRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REPOSITORY_LANGUAGES, owner, repo],
    queryFn: () => GithubApiService.getRepositoryLanguages(owner, repo),
    enabled: !!(owner && repo),
  });
};

export const useRepositoryCommits = ({
  owner,
  repo,
  since,
  until,
  perPage = 100,
}: RepositoryRequestWithTime) => {
  return useQuery({
    queryKey: [
      QUERY_KEYS.REPOSITORY_COMMITS,
      owner,
      repo,
      since,
      until,
      perPage,
    ],
    queryFn: () =>
      GithubApiService.getRepositoryCommits(owner, repo, since, until, perPage),
    enabled: !!(owner && repo),
  });
};

export const useRepositoryActivity = ({ owner, repo }: RepositoryRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REPOSITORY_ACTIVITY, owner, repo],
    queryFn: () => GithubApiService.getRepositoryActivity(owner, repo),
    enabled: !!(owner && repo),
  });
};

export const useRepositoryStats = ({ owner, repo }: RepositoryRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REPOSITORY_STATS, owner, repo],
    queryFn: () => GithubApiService.getRepositoryStats(owner, repo),
    enabled: !!(owner && repo),
  });
};

// Client-only hooks for interactive features
// These should NOT be used for SSR as they are for dynamic/interactive data

interface RepositorySearchRequest {
  query: string;
  perPage?: number;
}

/**
 * Hook for repository search autocomplete
 * Used on homepage for search suggestions
 */
export const useRepositorySearch = ({ query, perPage = 10 }: RepositorySearchRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REPOSITORY_SEARCH, query, perPage],
    queryFn: () => GithubApiService.searchRepositories(query, perPage),
    enabled: !!(query && query.length > 2),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Limit retries for search
  });
};

/**
 * Hook for detailed repository analytics
 * Used for interactive charts and detailed metrics
 */
export const useRepositoryAnalytics = ({ owner, repo, timeRange }: RepositoryRequest & { timeRange?: string }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.REPOSITORY_ANALYTICS, owner, repo, timeRange],
    queryFn: async () => {
      const [activity, pullRequests, issues, commits] = await Promise.all([
        GithubApiService.getRepositoryActivity(owner, repo),
        GithubApiService.getRepositoryPullRequests(owner, repo),
        GithubApiService.getRepositoryIssues(owner, repo),
        GithubApiService.getRepositoryCommits(owner, repo),
      ]);

      return {
        activity,
        pullRequests,
        issues,
        commits,
        timeRange,
      };
    },
    enabled: !!(owner && repo),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
