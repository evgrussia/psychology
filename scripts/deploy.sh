#!/bin/bash

# ============================================
# Скрипт деплоя для Psychology Platform
# Dev Server Deploy Script
# ============================================

set -e  # Прерывать выполнение при ошибках

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# КОНФИГУРАЦИЯ
# ============================================

PROJECT_NAME="psychology"
DEPLOY_USER="deploy"
DEPLOY_PATH="/var/www/psychology"
BACKUP_PATH="/var/backups/psychology"
GIT_REPO="https://github.com/yourusername/psychology.git"
GIT_BRANCH="main"

# ============================================
# ФУНКЦИИ
# ============================================

# Проверка зависимостей
check_dependencies() {
    print_info "Проверка зависимостей..."
    
    # Проверяем обычные команды
    local deps=("docker" "git" "openssl")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            print_error "Не найдена зависимость: $dep"
            exit 1
        fi
    done
    
    # Проверяем Docker Compose отдельно
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose не установлен или не работает"
        print_info "Установите: apt install -y docker-compose-plugin"
        exit 1
    fi
    
    print_success "Все зависимости установлены"
}

# Создание резервной копии базы данных
backup_database() {
    print_info "Создание резервной копии базы данных..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_PATH}/db_backup_${timestamp}.sql"
    
    mkdir -p "$BACKUP_PATH"
    
    # Проверяем, запущен ли контейнер БД
    if docker ps | grep -q "${PROJECT_NAME}-prod-db"; then
        docker exec "${PROJECT_NAME}-prod-db" pg_dump -U "$DB_USER" "$DB_NAME" > "$backup_file"
        gzip "$backup_file"
        print_success "Резервная копия создана: ${backup_file}.gz"
        
        # Удаляем старые бэкапы (старше 7 дней)
        find "$BACKUP_PATH" -name "db_backup_*.sql.gz" -mtime +7 -delete
    else
        print_warning "Контейнер БД не запущен, пропускаем резервное копирование"
    fi
}

# Обновление кода из Git
update_code() {
    print_info "Обновление кода из репозитория..."
    
    if [ -d "$DEPLOY_PATH/.git" ]; then
        cd "$DEPLOY_PATH"
        git fetch origin
        git checkout "$GIT_BRANCH"
        git pull origin "$GIT_BRANCH"
    else
        print_error "Git репозиторий не найден в $DEPLOY_PATH"
        print_info "Клонирование репозитория..."
        mkdir -p "$DEPLOY_PATH"
        git clone -b "$GIT_BRANCH" "$GIT_REPO" "$DEPLOY_PATH"
    fi
    
    print_success "Код обновлен"
}

# Проверка .env файла
check_env_file() {
    print_info "Проверка файла окружения..."
    
    if [ ! -f "$DEPLOY_PATH/.env.prod" ]; then
        print_error "Файл .env.prod не найден!"
        print_info "Создайте файл .env.prod на основе env.prod.example"
        exit 1
    fi
    
    # Загружаем переменные окружения
    set -a
    source "$DEPLOY_PATH/.env.prod"
    set +a
    
    # Проверяем обязательные переменные
    local required_vars=("DB_USER" "DB_PASSWORD" "DB_NAME" "REDIS_PASSWORD" "JWT_SECRET" "SESSION_SECRET")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Не установлена переменная окружения: $var"
            exit 1
        fi
    done
    
    print_success "Файл окружения корректен"
}

# Остановка старых контейнеров
stop_containers() {
    print_info "Остановка старых контейнеров..."
    
    cd "$DEPLOY_PATH"
    docker compose -f docker-compose.prod.yml down || true
    
    print_success "Контейнеры остановлены"
}

# Сборка Docker образов
build_images() {
    print_info "Сборка Docker образов..."
    
    cd "$DEPLOY_PATH"
    docker compose -f docker-compose.prod.yml build --no-cache
    
    print_success "Образы собраны"
}

# Применение миграций базы данных
run_migrations() {
    print_info "Применение миграций базы данных..."
    
    cd "$DEPLOY_PATH"
    
    # Запускаем только БД и Redis для миграций
    docker compose -f docker-compose.prod.yml up -d db redis
    
    # Ждем готовности БД
    print_info "Ожидание готовности базы данных..."
    sleep 10
    
    # Применяем миграции через временный контейнер
    docker compose -f docker-compose.prod.yml run --rm api sh -c "cd /app && npx prisma migrate deploy"
    
    print_success "Миграции применены"
}

# Запуск контейнеров
start_containers() {
    print_info "Запуск контейнеров..."
    
    cd "$DEPLOY_PATH"
    docker compose -f docker-compose.prod.yml up -d
    
    print_success "Контейнеры запущены"
}

# Проверка здоровья сервисов
health_check() {
    print_info "Проверка здоровья сервисов..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost/api/health &> /dev/null; then
            print_success "API работает корректно"
            return 0
        fi
        
        attempt=$((attempt + 1))
        print_info "Попытка $attempt/$max_attempts..."
        sleep 5
    done
    
    print_error "API не отвечает после $max_attempts попыток"
    return 1
}

# Очистка старых образов
cleanup() {
    print_info "Очистка старых Docker образов..."
    
    docker image prune -f
    docker volume prune -f
    
    print_success "Очистка завершена"
}

# Показ логов
show_logs() {
    print_info "Последние логи сервисов:"
    cd "$DEPLOY_PATH"
    docker compose -f docker-compose.prod.yml logs --tail=50
}

# ============================================
# ОСНОВНОЙ ПРОЦЕСС ДЕПЛОЯ
# ============================================

main() {
    print_info "============================================"
    print_info "Начало деплоя Psychology Platform"
    print_info "============================================"
    
    # Переходим в директорию деплоя
    cd "$DEPLOY_PATH" || exit 1
    
    # Выполняем шаги деплоя
    check_dependencies
    check_env_file
    backup_database
    update_code
    stop_containers
    build_images
    run_migrations
    start_containers
    
    # Ждем немного перед проверкой здоровья
    print_info "Ожидание запуска сервисов..."
    sleep 15
    
    if health_check; then
        cleanup
        print_success "============================================"
        print_success "Деплой успешно завершен!"
        print_success "============================================"
        print_info "Доступные URL:"
        print_info "  - Основной сайт: https://balance-space.ru"
        print_info "  - Admin панель: https://admin.balance-space.ru"
        print_info "  - API: https://api.balance-space.ru"
        print_info "  - API Docs: https://balance-space.ru/api/docs"
    else
        print_error "============================================"
        print_error "Деплой завершился с ошибками!"
        print_error "============================================"
        show_logs
        exit 1
    fi
}

# ============================================
# ОБРАБОТКА АРГУМЕНТОВ КОМАНДНОЙ СТРОКИ
# ============================================

case "${1:-deploy}" in
    deploy)
        main
        ;;
    backup)
        check_env_file
        backup_database
        ;;
    logs)
        cd "$DEPLOY_PATH"
        docker compose -f docker-compose.prod.yml logs -f
        ;;
    restart)
        cd "$DEPLOY_PATH"
        docker compose -f docker-compose.prod.yml restart
        print_success "Контейнеры перезапущены"
        ;;
    stop)
        stop_containers
        ;;
    status)
        cd "$DEPLOY_PATH"
        docker compose -f docker-compose.prod.yml ps
        ;;
    *)
        echo "Использование: $0 {deploy|backup|logs|restart|stop|status}"
        echo ""
        echo "Команды:"
        echo "  deploy  - Полный деплой приложения (по умолчанию)"
        echo "  backup  - Создание резервной копии БД"
        echo "  logs    - Просмотр логов контейнеров"
        echo "  restart - Перезапуск контейнеров"
        echo "  stop    - Остановка всех контейнеров"
        echo "  status  - Статус контейнеров"
        exit 1
        ;;
esac
