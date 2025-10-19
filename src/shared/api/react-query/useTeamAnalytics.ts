import { useQuery } from '@tanstack/react-query';

import { GithubApiService } from '../core/index';

export const QUERY_KEYS = {
  TEAM_CONTRIBUTORS: 'team_contributors',
  TEAM_METRICS: 'team_metrics',
  PULL_REQUEST_REVIEWS: 'pull_request_reviews',
} as const;

interface RepositoryRequest {
  owner: string;
  repo: string;
}

interface TeamMetricsRequest extends RepositoryRequest {
  since?: string;
  until?: string;
}

interface PullRequestReviewsRequest extends RepositoryRequest {
  pullNumber: number;
}

export const useTeamContributors = ({ owner, repo }: RepositoryRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TEAM_CONTRIBUTORS, owner, repo],
    queryFn: () => GithubApiService.getTeamContributors(owner, repo),
    enabled: !!(owner && repo),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useTeamMetrics = ({
  owner,
  repo,
  since,
  until,
}: TeamMetricsRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TEAM_METRICS, owner, repo, since, until],
    queryFn: () => GithubApiService.getTeamMetrics(owner, repo, since, until),
    enabled: !!(owner && repo),
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

export const usePullRequestReviews = ({
  owner,
  repo,
  pullNumber,
}: PullRequestReviewsRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PULL_REQUEST_REVIEWS, owner, repo, pullNumber],
    queryFn: () =>
      GithubApiService.getPullRequestReviews(owner, repo, pullNumber),
    enabled: !!(owner && repo && pullNumber),
  });
};

// Композитный хук для получения всех данных команды
export const useTeamAnalytics = ({
  owner,
  repo,
  since,
  until,
}: TeamMetricsRequest) => {
  const contributorsQuery = useTeamContributors({ owner, repo });
  const metricsQuery = useTeamMetrics({ owner, repo, since, until });

  return {
    contributors: contributorsQuery.data || [],
    metrics: metricsQuery.data,
    isLoading: contributorsQuery.isLoading || metricsQuery.isLoading,
    isError: contributorsQuery.isError || metricsQuery.isError,
    error: contributorsQuery.error || metricsQuery.error,
  };
};
