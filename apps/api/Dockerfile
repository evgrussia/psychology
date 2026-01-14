# Многоступенчатая сборка для оптимизации размера образа

# Этап 1: Установка зависимостей (включая dev для сборки)
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Копируем файлы конфигурации для установки зависимостей
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Устанавливаем pnpm и ВСЕ зависимости (включая dev для prisma CLI)
# Используем --shamefully-hoist для плоской структуры node_modules (лучше для TypeScript)
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Этап 2: Генерация Prisma клиента
FROM node:18-alpine AS prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Копируем зависимости и конфигурацию
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/package.json ./apps/api/

RUN npm install -g pnpm

# Генерируем Prisma клиент из корня с фильтром workspace
WORKDIR /app
RUN pnpm --filter @psychology/api exec npx prisma generate

# Проверяем, где был сгенерирован Prisma клиент и копируем его в стандартное место
RUN if [ -d "/app/node_modules/.prisma" ]; then \
        echo "Prisma client found in node_modules/.prisma"; \
    elif [ -d "/app/apps/api/node_modules/.prisma" ]; then \
        mkdir -p /app/node_modules/.prisma && \
        cp -r /app/apps/api/node_modules/.prisma/* /app/node_modules/.prisma/; \
    else \
        echo "Prisma client not found, creating empty directory"; \
        mkdir -p /app/node_modules/.prisma; \
    fi

# Этап 3: Сборка приложения
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Копируем node_modules из deps stage (там есть все зависимости, включая dev)
COPY --from=deps /app/node_modules ./node_modules

# Копируем Prisma клиент из prisma stage (там он уже сгенерирован)
RUN mkdir -p ./node_modules/.prisma
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma

# Копируем исходники
COPY apps/api ./apps/api
COPY package.json pnpm-workspace.yaml ./

RUN npm install -g pnpm @nestjs/cli

# Копируем node_modules в apps/api для правильного разрешения зависимостей TypeScript
# Это необходимо, так как TypeScript ищет модули относительно tsconfig.json
WORKDIR /app
RUN cp -r node_modules apps/api/node_modules

# Генерируем Prisma клиент еще раз в builder stage для правильной работы TypeScript
# Используем prisma из корневого node_modules
WORKDIR /app/apps/api
RUN NODE_PATH=/app/node_modules /app/node_modules/.bin/prisma generate || /app/node_modules/prisma/build/index.js generate

# Запускаем билд из директории проекта
WORKDIR /app/apps/api
RUN nest build

# Этап 4: Production зависимости
FROM node:18-alpine AS prod-deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Копируем файлы конфигурации
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Устанавливаем только production зависимости
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# Этап 5: Production образ
FROM node:18-alpine AS runner
RUN apk add --no-cache libc6-compat openssl curl

WORKDIR /app

ENV NODE_ENV=production

# Устанавливаем pnpm и prisma CLI для выполнения миграций
RUN npm install -g pnpm prisma

# Создаем непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Копируем необходимые файлы
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules

# Prisma generate в pnpm workspace пишет рантайм-клиент в virtual-store:
#   /app/node_modules/.pnpm/@prisma+client@.../node_modules/.prisma/client
# В prod-deps этот артефакт отсутствует, поэтому докладываем его из builder stage.
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.pnpm/@prisma+client@5.7.0_prisma@5.7.0 /app/node_modules/.pnpm/@prisma+client@5.7.0_prisma@5.7.0

# Копируем Prisma клиент из prisma stage (директория всегда существует после генерации)
RUN mkdir -p ./node_modules/.prisma
COPY --from=prisma --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Создаем директории для медиа файлов
RUN mkdir -p /app/media && chown nestjs:nodejs /app/media

USER nestjs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Запуск приложения
# EntryPoint запускаем из /app/apps/api, чтобы Node находил зависимости через /app/apps/api/node_modules (pnpm workspace).
CMD ["node", "apps/api/dist/src/main"]
