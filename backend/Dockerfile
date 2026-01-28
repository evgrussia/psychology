# Multi-stage: frontend (Vite) + backend (Django).
# Build context MUST be repo root (docker-compose: context: ., dockerfile: backend/Dockerfile).

# Stage 1: build frontend
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: backend
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt backend/requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt

COPY backend/ ./
COPY --from=frontend /app/dist /app/staticfiles/frontend

RUN mkdir -p /app/staticfiles /app/media \
    && chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--access-logfile", "-", "--error-logfile", "-", "config.wsgi:application"]
