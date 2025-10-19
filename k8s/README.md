# Развертывание в Kubernetes

Данная директория содержит манифесты Kubernetes для развертывания GitHub Insights Pro.

## 📚 Полезные ссылки для Frontend разработчиков

Если вы никогда не работали с Kubernetes и Docker, вот ресурсы для изучения:

### 🐳 Docker (начните отсюда!)

- **[Docker для начинающих](https://docs.docker.com/get-started/)** - официальная документация
- **[Docker Tutorial для Frontend разработчиков](https://www.youtube.com/watch?v=3c-iBn73dDE)** - видео на русском
- **[Контейнеризация React приложений](https://habr.com/ru/articles/427067/)** - статья на Хабре

### ☸️ Kubernetes (после изучения Docker)

- **[Kubernetes для начинающих](https://kubernetes.io/docs/tutorials/kubernetes-basics/)** - официальные туториалы
- **[Kubernetes за 30 минут](https://www.youtube.com/watch?v=TKf8nUJPEuI)** - видео на русском
- **[Полное руководство по kubectl](https://kubernetes.io/docs/reference/kubectl/)** - справочник команд

### 🎥 Видео курсы

- **[Kubernetes для Frontend разработчиков](https://www.youtube.com/playlist?list=PLqnpSHz8G6-QZ8bJO6nIhLdLL8KbqJNRh)** - серия уроков
- **[Docker + Kubernetes для веб-разработчиков](https://www.youtube.com/watch?v=s6H_KD9e7jE)**

## Предварительные требования

- Kubernetes кластер (v1.19+)
- Настроенный kubectl для доступа к кластеру
- Доступ к Docker registry (для загрузки собранных образов)

> **💡 Совет:** Если у вас нет кластера, можете использовать [minikube](https://minikube.sigs.k8s.io/docs/start/) для локальной разработки или [kind](https://kind.sigs.k8s.io/) для тестирования.

## Пошаговое развертывание

### 1. Сборка и загрузка Docker образа

```bash
# Сборка Docker образа
docker build -t your-registry/github-insights-pro:latest .

# Загрузка в ваш container registry
docker push your-registry/github-insights-pro:latest
```

> **💡 Совет для новичков:** Если не знаете, что такое registry - это хранилище Docker образов. Популярные варианты: Docker Hub, Google Container Registry, AWS ECR, GitHub Container Registry.

### 2. Обновление ссылки на образ

Обновите ссылку на образ в `deployment.yaml`:

```yaml
spec:
  template:
    spec:
      containers:
      - name: github-insights-pro
        image: your-registry/github-insights-pro:latest  # Обновите это
```

### 3. Настройка секретов

Обновите GitHub токен в `secret.yaml`:

```bash
# Кодирование GitHub токена в base64
echo -n "your-github-token" | base64

# Обновите файл secret.yaml с закодированным значением
```

> **⚠️ Важно:** Никогда не храните секреты в открытом виде! Kubernetes использует base64 кодирование для хранения секретов.

### 4. Развертывание в Kubernetes

```bash
# Создание namespace и ресурсов
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Опционально: Развертывание ingress и HPA
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

### 5. Проверка развертывания

```bash
# Проверка подов (pods)
kubectl get pods -n github-insights-pro

# Проверка сервисов
kubectl get svc -n github-insights-pro

# Проверка ingress (если развернут)
kubectl get ingress -n github-insights-pro
```

> **🔍 Полезные команды для отладки:**
>
> - `kubectl describe pod <pod-name>` - детальная информация о поде
> - `kubectl logs <pod-name>` - логи приложения
> - `kubectl port-forward svc/github-insights-pro 3000:3000` - доступ к приложению локально

## Конфигурация

### Переменные окружения

- `NODE_ENV`: Установите в "production"
- `NEXT_PUBLIC_GITHUB_TOKEN`: GitHub API токен для доступа к репозиториям

### Лимиты ресурсов

Развертывание включает запросы и лимиты ресурсов:

- **Память**: 128Mi запрос, 512Mi лимит
- **CPU**: 100m запрос, 500m лимит

> **💡 Объяснение для новичков:**
>
> - **Request** - гарантированные ресурсы для пода
> - **Limit** - максимальные ресурсы, которые может использовать под
> - **100m** = 100 миллиCPU (0.1 CPU ядра)

### Проверки здоровья

- **Liveness Probe**: HTTP GET на порту 3000, начальная задержка 30с, период 10с
- **Readiness Probe**: HTTP GET на порту 3000, начальная задержка 5с, период 5с

### Автомасштабирование

HPA настроен на масштабирование от 2 до 10 реплик на основе использования CPU и памяти (порог 80%).

## Кастомизация

### Ingress

Обновите ingress.yaml с вашим доменом и настройками certificate manager.

### Лимиты ресурсов

Настройте запросы и лимиты ресурсов в deployment.yaml в соответствии с вашими требованиями.

### Масштабирование

Изменяйте конфигурацию HPA или количество реплик в deployment по необходимости.

## 🚀 Быстрый старт

Если вы только начинаете работать с Kubernetes:

1. **Установите minikube** для локального кластера
2. **Изучите базовые команды kubectl** (get, describe, logs)
3. **Попробуйте запустить простое приложение** перед этим проектом
4. **Используйте kubectl port-forward** для доступа к сервисам локально

## ❓ Частые проблемы

- **Под не запускается** → проверьте `kubectl describe pod <pod-name>`
- **Не могу получить доступ к приложению** → используйте `kubectl port-forward`
- **Ошибки с образами** → убедитесь, что образ загружен в registry
