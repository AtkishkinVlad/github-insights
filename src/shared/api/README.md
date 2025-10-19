# GitHub API Service

Cервис для работы с GitHub API, использующий `octokit.rest`.

## Структура

### Repository Methods

- `getRepository()` - основная информация о репозитории
- `getRepositoryContributors()` - контрибьюторы с пагинацией
- `getRepositoryPullRequests()` - PR с фильтрацией по состоянию
- `getRepositoryIssues()` - Issues с фильтрацией
- `getRepositoryLanguages()` - языки программирования
- `getRepositoryCommits()` - коммиты с временными фильтрами
- `getRepositoryActivity()` - статистика активности
- `getRepositoryStats()` - метрики сообщества

### Developer Methods

- `getUser()` - профиль пользователя
- `getUserRepositories()` - репозитории пользователя
- `getUserEvents()` - события пользователя
- `getUserStarredRepos()` - помеченные репозитории

### Team Analytics Methods

- `getTeamContributors()` - детализированная информация о контрибьюторах
- `getPullRequestReviews()` - ревью PR
- `getTeamMetrics()` - агрегированные метрики команды

### Project Health Methods

- `getProjectHealthMetrics()` - комплексные метрики здоровья проекта
  - Time to First Response
  - PR Merge Time
  - Issue Resolution Rate
  - Bus Factor
  - Автоматические алерты

### 3. React Query обвязки

Каждый API метод имеет соответствующую обвязку для React Query с правильными ключами кеширования и настройками.

#### Пример использования

```typescript
import {
  useRepository,
  useTeamAnalytics,
  useProjectHealthMetrics,
} from "@/shared/api";

// В компоненте
const { data: repository, isLoading } = useRepository({
  owner: "facebook",
  repo: "react",
});
const { data: teamData } = useTeamAnalytics({
  owner: "facebook",
  repo: "react",
});
const { data: healthMetrics } = useProjectHealthMetrics({
  owner: "facebook",
  repo: "react",
});
```

## Конфигурация

Сервис использует переменную окружения `NEXT_PUBLIC_GITHUB_TOKEN` для аутентификации.

```env
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
```

## Ограничения

- GitHub API имеет rate limits (5000 запросов/час для аутентифицированных пользователей)
- Некоторые методы ограничены по количеству записей для производительности
- Комплексные аналитические запросы могут занимать время
