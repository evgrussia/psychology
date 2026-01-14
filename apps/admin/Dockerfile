# Многоступенчатая сборка для Next.js Admin панели

# Этап 1: Установка зависимостей
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Копируем файлы конфигурации для установки зависимостей
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY design-system/package.json ./design-system/

# Устанавливаем pnpm и зависимости
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Этап 2: Сборка приложения
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Копируем зависимости (в pnpm все в корне)
COPY --from=deps /app/node_modules ./node_modules

# Копируем конфигурационные файлы
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json ./apps/admin/
COPY design-system/package.json ./design-system/

# Копируем исходники
COPY apps/admin ./apps/admin
COPY design-system ./design-system

RUN npm install -g pnpm

# Устанавливаем зависимости в workspace (для правильной работы symlinks)
RUN pnpm install --frozen-lockfile --offline

# Сборка Next.js приложения
WORKDIR /app/apps/admin
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Создаем пустую директорию public, если её нет (Next.js требует её для билда)
RUN mkdir -p public

RUN pnpm build

# Этап 3: Production образ
FROM node:18-alpine AS runner
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Создаем непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы
COPY --from=builder /app/apps/admin/package.json ./

# Копируем собранное приложение
# В standalone режиме структура: .next/standalone/ содержит server.js в корне
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static

# Копируем public директорию (теперь она всегда существует, даже если пустая)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public

USER nextjs

EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:3001/ || exit 1

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Запуск приложения
# В standalone режиме server.js находится в корне скопированной директории
CMD ["node", "server.js"]
