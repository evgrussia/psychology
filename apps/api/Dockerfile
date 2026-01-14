# Многоступенчатая сборка для оптимизации размера образа

# Этап 1: Установка зависимостей
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Копируем файлы конфигурации для установки зависимостей
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Устанавливаем pnpm и зависимости
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

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

# Генерируем Prisma клиент (запускаем из корня с указанием workspace)
WORKDIR /app
RUN pnpm --filter @psychology/api exec prisma generate

# Этап 3: Сборка приложения
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Копируем зависимости и Prisma клиент
COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma

# Копируем исходники
COPY apps/api ./apps/api
COPY package.json pnpm-workspace.yaml ./

RUN npm install -g pnpm @nestjs/cli

# Сборка проекта
WORKDIR /app/apps/api
RUN pnpm build

# Этап 4: Production образ
FROM node:18-alpine AS runner
RUN apk add --no-cache libc6-compat openssl curl

WORKDIR /app

ENV NODE_ENV=production

# Создаем непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Копируем необходимые файлы
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=prisma --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Создаем директории для медиа файлов
RUN mkdir -p /app/media && chown nestjs:nodejs /app/media

USER nestjs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Запуск приложения
CMD ["node", "dist/main"]
