import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { GithubApiService } from '../core';

export interface SSRRepositoryData {
  repository: Awaited<ReturnType<typeof GithubApiService.getRepository>>;
  languages: Awaited<ReturnType<typeof GithubApiService.getRepositoryLanguages>>;
  contributors: Awaited<ReturnType<typeof GithubApiService.getRepositoryContributors>>;
  stats: Awaited<ReturnType<typeof GithubApiService.getRepositoryStats>>;
}

export interface SSRDeveloperData {
  user: Awaited<ReturnType<typeof GithubApiService.getUser>>;
  repositories: Awaited<ReturnType<typeof GithubApiService.getUserRepositories>>;
  starredRepos: Awaited<ReturnType<typeof GithubApiService.getUserStarredRepos>>;
}

export async function getRepositorySSRData(
  owner: string,
  repo: string,
): Promise<SSRRepositoryData> {
  try {
    const [repository, languages, contributors, stats] = await Promise.all([
      GithubApiService.getRepository(owner, repo),
      GithubApiService.getRepositoryLanguages(owner, repo),
      GithubApiService.getRepositoryContributors(owner, repo, 10),
      GithubApiService.getRepositoryStats(owner, repo),
    ]);

    return {
      repository,
      languages,
      contributors,
      stats,
    };
  } catch (error) {
    console.error('Error fetching repository SSR data:', error);
    throw new Error(`Failed to fetch repository data for ${owner}/${repo}`);
  }
}

/**
 * Get developer data for SSR
 */
export async function getDeveloperSSRData(
  username: string,
): Promise<SSRDeveloperData> {
  try {
    const [user, repositories, starredRepos] = await Promise.all([
      GithubApiService.getUser(username),
      GithubApiService.getUserRepositories(username, 'owner', 10),
      GithubApiService.getUserStarredRepos(username, 10),
    ]);

    return {
      user,
      repositories,
      starredRepos,
    };
  } catch (error) {
    console.error('Error fetching developer SSR data:', error);
    throw new Error(`Failed to fetch developer data for ${username}`);
  }
}

export async function getRepositoryPageProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<{ ssrData: SSRRepositoryData; owner: string; repo: string }>> {
  const { owner, repo } = context.params as { owner: string; repo: string };

  if (!owner || !repo) {
    return {
      notFound: true,
    };
  }

  try {
    const ssrData = await getRepositorySSRData(owner, repo);

    return {
      props: {
        ssrData,
        owner,
        repo,
      },
    };
  } catch (error) {
    console.error('Repository SSR data fetch failed:', error);
    return {
      notFound: true,
    };
  }
}

export async function getDeveloperPageProps(
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<{ ssrData: SSRDeveloperData; username: string }>> {
  const { username } = context.params as { username: string };

  if (!username) {
    return {
      notFound: true,
    };
  }

  try {
    const ssrData = await getDeveloperSSRData(username);

    return {
      props: {
        ssrData,
        username,
      },
    };
  } catch (error) {
    console.error('Developer SSR data fetch failed:', error);
    return {
      notFound: true,
    };
  }
}
