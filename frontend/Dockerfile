# Frontend: Vite build + nginx для раздачи SPA.
# Build: docker build -t psychology-frontend -f frontend/Dockerfile .
# Контекст: корень репо (docker compose: context: ., dockerfile: frontend/Dockerfile).

# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx-default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
