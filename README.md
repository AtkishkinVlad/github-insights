# GitHub Insights

Комплексная аналитическая платформа для глубокого анализа GitHub репозиториев, предоставляющая инсайты для разработчиков и менеджеров проектов.

## 🎯 Цель проекта

Разработка аналитической платформы, которая помогает:

- **Tech Leads** оценивать состояние проектов и активность команд
- **Project Managers** сравнивать вклад участников команды
- **Open-source maintainers** отслеживать здоровье и устойчивость проектов
- **IT рекрутерам** анализировать профили разработчиков

## 🚀 Ключевые возможности

### 📊 Анализ репозитория

- Activity heatmap (коммиты по времени)
- Pull Request и Issue статистика
- Code frequency charts и языковое распределение
- Метрики health score и bus factor

### 👥 Анализ команды

- Сравнение вклада разработчиков
- Code review activity и patterns
- Skill radar charts для технических навыков
- Collaborative analysis и trends

### 🏥 Мониторинг здоровья проекта

- Time to first response и PR merge time
- Issue resolution rate и age distribution
- Bus factor calculation и risk indicators
- Sustainability metrics и automated alerts

## 🛠 Технологический стек

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Library**: Mantine UI 8.3+
- **Charts**: Mantine Charts для визуализации данных
- **Icons**: Tabler Icons
- **Styling**: Tailwind CSS + Mantine компоненты
- **Routing**: Next.js Pages Router

## 🎨 Дизайн-система

### Цветовая схема

- Поддержка светлой и темной темы (WCAG 2.1 AA)
- Основные цвета: синий (#228be6), зеленый (#40c057)
- Статусные цвета: зеленый (здоровье), желтый (предупреждение), красный (критично)

### Typography

- Основной шрифт: Inter font family
- Модульная система заголовков и текста

### Components

- Модульная дизайн-система на основе Mantine UI
- Responsive дизайн для всех устройств (320px - 1200px+)

## Запуск проекта

### Установка зависимостей

```bash
pnpm install
```

### Запуск development сервера

```bash
pnpm dev
```

### Сборка для production

```bash
pnpm build
pnpm start
```

## 📱 Основные страницы и сценарии

### 1. Главная страница (`/`)

- Поиск репозитория для анализа
- Быстрые примеры популярных репозиториев
- Навигация по разделам

### 2. Repository Dashboard (`/repository/[owner]/[repo]`)

- Обзор основных метрик (stars, forks, watchers, health score)
- Графики активности и языкового распределения
- Таблица топ контрибьюторов
- Анализ PR и Issues

### 3. Developer Profile (`/developer/[username]`)

- Профиль разработчика с основной информацией
- Contribution heatmap
- Skill radar chart
- Список репозиториев и активности

### 4. Team Analytics (`/team-analytics`)

- Сравнение производительности команды
- Фильтрация по репозиториям и временным периодам
- Radar charts для навыков команды
- Детальная таблица метрик

### 5. Project Health (`/project-health`)

- Мониторинг здоровья проекта в реальном времени
- Trends и исторические данные
