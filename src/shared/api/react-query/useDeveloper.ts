import { useQuery } from '@tanstack/react-query';

import { GithubApiService } from '../core/index';

export const QUERY_KEYS = {
  USER: 'user',
  USER_REPOSITORIES: 'user_repositories',
  USER_EVENTS: 'user_events',
  USER_STARRED_REPOS: 'user_starred_repos',
} as const;

interface UserRequest {
  username: string;
}

interface UserRepositoriesRequest extends UserRequest {
  type?: 'all' | 'owner' | 'member';
  perPage?: number;
}

interface UserEventsRequest extends UserRequest {
  perPage?: number;
}

export const useUser = ({ username }: UserRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, username],
    queryFn: () => GithubApiService.getUser(username),
    enabled: !!username,
  });
};

export const useUserRepositories = ({
  username,
  type = 'owner',
  perPage = 100,
}: UserRepositoriesRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_REPOSITORIES, username, type, perPage],
    queryFn: () =>
      GithubApiService.getUserRepositories(username, type, perPage),
    enabled: !!username,
  });
};

export const useUserEvents = ({
  username,
  perPage = 100,
}: UserEventsRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_EVENTS, username, perPage],
    queryFn: () => GithubApiService.getUserEvents(username, perPage),
    enabled: !!username,
  });
};

export const useUserStarredRepos = ({
  username,
  perPage = 100,
}: UserEventsRequest) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_STARRED_REPOS, username, perPage],
    queryFn: () => GithubApiService.getUserStarredRepos(username, perPage),
    enabled: !!username,
  });
};

// Композитный хук для получения полного профиля разработчика
export const useDeveloperProfile = ({ username }: UserRequest) => {
  const userQuery = useUser({ username });
  const repositoriesQuery = useUserRepositories({ username });
  const eventsQuery = useUserEvents({ username });

  return {
    user: userQuery.data,
    repositories: repositoriesQuery.data,
    events: eventsQuery.data,
    isLoading:
      userQuery.isLoading ||
      repositoriesQuery.isLoading ||
      eventsQuery.isLoading,
    isError:
      userQuery.isError || repositoriesQuery.isError || eventsQuery.isError,
    error: userQuery.error || repositoriesQuery.error || eventsQuery.error,
  };
};
