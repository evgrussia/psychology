# Многоступенчатая сборка для Next.js

# Этап 1: Установка зависимостей
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Копируем файлы конфигурации для установки зависимостей
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
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
COPY apps/web/package.json ./apps/web/
COPY design-system/package.json ./design-system/

# Копируем исходники
COPY apps/web ./apps/web
COPY design-system ./design-system
COPY assets ./assets

RUN npm install -g pnpm

  # Устанавливаем зависимости в workspace (для правильной работы symlinks)
  RUN pnpm install --frozen-lockfile --offline
  
  # Сначала собираем дизайн-систему, так как от нее зависят приложения
  RUN pnpm --filter @psychology/design-system build
  
  # Сборка Next.js приложения
  WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Подготавливаем статические ассеты
RUN mkdir -p public/assets && cp -r /app/assets/* public/assets/

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
COPY --from=builder /app/apps/web/next.config.js ./
COPY --from=builder /app/apps/web/package.json ./

# Копируем собранное приложение
# В standalone режиме структура: .next/standalone/ содержит server.js в корне
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:3000/ || exit 1

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Запуск приложения
# В зависимости от Next.js/monorepo-конфигурации, standalone может положить server.js:
# - /app/server.js (классический вариант)
# - /app/apps/web/server.js (часто в монорепах)
CMD ["sh", "-c", "if [ -f /app/server.js ]; then exec node /app/server.js; elif [ -f /app/apps/web/server.js ]; then exec node /app/apps/web/server.js; else echo \"[ERROR] server.js not found in /app or /app/apps/web\" >&2; exit 1; fi"]
