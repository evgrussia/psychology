# Backend - Эмоциональный баланс

Django-проект с архитектурой Clean Architecture + DDD.

## Структура проекта

```
backend/
├── config/              # Django settings
├── domain/              # Domain Layer (чистый Python)
├── application/         # Application Layer (Use Cases)
├── infrastructure/      # Infrastructure Layer (Django ORM, внешние сервисы)
├── presentation/        # Presentation Layer (API)
└── shared/              # Общие утилиты
```

## Установка

1. Создать виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

2. Установить зависимости:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

3. Создать файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Настроить переменные окружения в `.env`

5. Применить миграции:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Создать суперпользователя:
```bash
python manage.py createsuperuser
```

7. Запустить сервер разработки:
```bash
python manage.py runserver
```

## Тестирование

```bash
pytest
```

## Линтинг

```bash
black .
flake8 .
mypy .
```

## Окружения

- **Development**: `config.settings.development` (по умолчанию)
- **Staging**: `config.settings.staging`
- **Production**: `config.settings.production`
- **Testing**: `config.settings.testing`

Переключение окружения:
```bash
DJANGO_SETTINGS_MODULE=config.settings.staging python manage.py runserver
```
