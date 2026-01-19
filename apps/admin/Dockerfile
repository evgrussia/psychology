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
  
  # Сначала собираем дизайн-систему, так как от нее зависят приложения
  RUN pnpm --filter @psychology/design-system build
  
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
# В admin-standalone сборке (pnpm workspace) `server.js` и `node_modules` лежат в корне standalone.
# Важно копировать standalone внутрь `./apps/admin`, иначе pnpm-symlink'и внутри `node_modules` могут стать битые.
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./apps/admin
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static

# Копируем public директорию (теперь она всегда существует, даже если пустая)
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public

# pnpm store нужен для корректной работы symlink'ов в standalone (например, `node_modules/next` → `.pnpm/...`).
# В web-образе он попадает в standalone автоматически, но для admin — нет, поэтому докладываем вручную.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm ./node_modules/.pnpm

USER nextjs

EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:3001/admin || exit 1

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Запуск приложения
# В зависимости от Next.js/monorepo-конфигурации, standalone может положить server.js:
# - /app/server.js (классический вариант)
# - /app/apps/admin/server.js (часто в монорепах)
CMD ["sh", "-c", "if [ -f /app/server.js ]; then exec node /app/server.js; elif [ -f /app/apps/admin/server.js ]; then exec node /app/apps/admin/server.js; else echo \"[ERROR] server.js not found in /app or /app/apps/admin\" >&2; exit 1; fi"]
