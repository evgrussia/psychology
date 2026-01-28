FROM python:3.11-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Рабочая директория
WORKDIR /app

# Копирование requirements и установка зависимостей
COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt

# Копирование кода проекта
COPY . .

# Создание директорий для статики и медиа
RUN mkdir -p /app/staticfiles /app/media

# Порт для Django
EXPOSE 8000

# По умолчанию — разработка. Для production переопределить:
# CMD ["gunicorn", "--config", "gunicorn_config.py", "config.wsgi:application"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
