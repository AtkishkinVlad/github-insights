import { useQuery } from '@tanstack/react-query';

import { GithubApiService } from '../core/index';

export const QUERY_KEYS = {
  PROJECT_HEALTH_METRICS: 'project_health_metrics',
} as const;

interface RepositoryRequest {
  owner: string;
  repo: string;
}

export const useProjectHealthMetrics = ({ owner, repo }: RepositoryRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PROJECT_HEALTH_METRICS, owner, repo],
    queryFn: () => GithubApiService.getProjectHealthMetrics(owner, repo),
    enabled: !!(owner && repo),
    refetchInterval: 5 * 60 * 1000, // Обновлять каждые 5 минут
    staleTime: 2 * 60 * 1000, // Считать свежими 2 минуты
  });
};
