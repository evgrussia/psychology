#!/bin/bash

# ============================================
# Скрипт мониторинга Psychology Platform
# Monitoring Script
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# ПРОВЕРКА КОНТЕЙНЕРОВ
# ============================================

check_containers() {
    print_header "Статус Docker контейнеров"
    
    local containers=(
        "psychology-prod-db"
        "psychology-prod-redis"
        "psychology-prod-api"
        "psychology-prod-web"
        "psychology-prod-admin"
        "psychology-prod-nginx"
    )
    
    for container in "${containers[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            local status=$(docker inspect --format='{{.State.Status}}' "$container")
            local uptime=$(docker inspect --format='{{.State.StartedAt}}' "$container")
            if [ "$status" = "running" ]; then
                print_success "$container: running (started: $uptime)"
            else
                print_error "$container: $status"
            fi
        else
            print_error "$container: не найден или остановлен"
        fi
    done
    echo ""
}

# ============================================
# ПРОВЕРКА ЗДОРОВЬЯ СЕРВИСОВ
# ============================================

check_health() {
    print_header "Проверка здоровья сервисов"
    
    # API Health
    if curl -sf http://localhost/api/health > /dev/null 2>&1; then
        print_success "API Health: OK"
    else
        print_error "API Health: FAILED"
    fi
    
    # API Version
    local version=$(curl -sf http://localhost/api/version 2>/dev/null || echo "N/A")
    print_info "API Version: $version"
    
    # Web
    if curl -sf -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        print_success "Web Frontend: OK"
    else
        print_error "Web Frontend: FAILED"
    fi
    
    # Admin
    if curl -sf -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
        print_success "Admin Panel: OK"
    else
        print_error "Admin Panel: FAILED"
    fi
    
    # Nginx
    if curl -sf http://localhost/health > /dev/null 2>&1; then
        print_success "Nginx: OK"
    else
        print_error "Nginx: FAILED"
    fi
    
    echo ""
}

# ============================================
# ПРОВЕРКА РЕСУРСОВ
# ============================================

check_resources() {
    print_header "Использование ресурсов"
    
    # Память
    local mem_total=$(free -h | awk '/^Mem:/ {print $2}')
    local mem_used=$(free -h | awk '/^Mem:/ {print $3}')
    local mem_free=$(free -h | awk '/^Mem:/ {print $4}')
    local mem_percent=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2 * 100}')
    
    echo -e "Память:"
    echo -e "  Total: $mem_total | Used: $mem_used | Free: $mem_free"
    
    if [ "$mem_percent" -gt 90 ]; then
        print_error "Использование памяти: ${mem_percent}% (критично!)"
    elif [ "$mem_percent" -gt 75 ]; then
        print_warning "Использование памяти: ${mem_percent}% (высокое)"
    else
        print_success "Использование памяти: ${mem_percent}%"
    fi
    
    # Диск
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    local disk_total=$(df -h / | awk 'NR==2 {print $2}')
    local disk_used=$(df -h / | awk 'NR==2 {print $3}')
    local disk_free=$(df -h / | awk 'NR==2 {print $4}')
    
    echo -e "Диск (/):"
    echo -e "  Total: $disk_total | Used: $disk_used | Free: $disk_free"
    
    if [ "$disk_usage" -gt 90 ]; then
        print_error "Использование диска: ${disk_usage}% (критично!)"
    elif [ "$disk_usage" -gt 80 ]; then
        print_warning "Использование диска: ${disk_usage}% (высокое)"
    else
        print_success "Использование диска: ${disk_usage}%"
    fi
    
    # Docker volumes
    echo -e "\nDocker volumes:"
    docker system df -v | grep -A 10 "Local Volumes" | tail -n +2
    
    echo ""
}

# ============================================
# ПРОВЕРКА ЛОГОВ НА ОШИБКИ
# ============================================

check_logs() {
    print_header "Проверка логов на ошибки (последние 100 строк)"
    
    local error_count=0
    
    # API logs
    local api_errors=$(docker logs --tail 100 psychology-prod-api 2>&1 | grep -i "error" | wc -l)
    if [ "$api_errors" -gt 0 ]; then
        print_warning "API: найдено $api_errors ошибок"
        error_count=$((error_count + api_errors))
    else
        print_success "API: ошибок не найдено"
    fi
    
    # Web logs
    local web_errors=$(docker logs --tail 100 psychology-prod-web 2>&1 | grep -i "error" | wc -l)
    if [ "$web_errors" -gt 0 ]; then
        print_warning "Web: найдено $web_errors ошибок"
        error_count=$((error_count + web_errors))
    else
        print_success "Web: ошибок не найдено"
    fi
    
    # Nginx logs
    local nginx_errors=$(docker logs --tail 100 psychology-prod-nginx 2>&1 | grep -i "error" | wc -l)
    if [ "$nginx_errors" -gt 0 ]; then
        print_warning "Nginx: найдено $nginx_errors ошибок"
        error_count=$((error_count + nginx_errors))
    else
        print_success "Nginx: ошибок не найдено"
    fi
    
    if [ "$error_count" -gt 10 ]; then
        print_error "Всего найдено $error_count ошибок! Требуется внимание."
    elif [ "$error_count" -gt 0 ]; then
        print_warning "Всего найдено $error_count ошибок."
    fi
    
    echo ""
}

# ============================================
# ПРОВЕРКА ПОДКЛЮЧЕНИЯ К БД
# ============================================

check_database() {
    print_header "Проверка базы данных"
    
    # Проверка подключения
    if docker exec psychology-prod-db pg_isready -U psychology_user > /dev/null 2>&1; then
        print_success "PostgreSQL: доступна"
        
        # Размер БД
        local db_size=$(docker exec psychology-prod-db psql -U psychology_user -d psychology_prod -t -c "SELECT pg_size_pretty(pg_database_size('psychology_prod'));" 2>/dev/null | xargs)
        print_info "Размер базы данных: $db_size"
        
        # Количество подключений
        local connections=$(docker exec psychology-prod-db psql -U psychology_user -d psychology_prod -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs)
        print_info "Активных подключений: $connections"
    else
        print_error "PostgreSQL: недоступна"
    fi
    
    # Проверка Redis
    if docker exec psychology-prod-redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis: доступен"
        
        # Используемая память Redis
        local redis_mem=$(docker exec psychology-prod-redis redis-cli info memory | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
        print_info "Redis память: $redis_mem"
    else
        print_error "Redis: недоступен"
    fi
    
    echo ""
}

# ============================================
# ПРОВЕРКА SSL СЕРТИФИКАТОВ
# ============================================

check_ssl() {
    print_header "Проверка SSL сертификатов"
    
    if command -v certbot &> /dev/null; then
        certbot certificates 2>/dev/null | grep -A 5 "balance-space.ru" || print_warning "Сертификаты не найдены"
    else
        print_warning "Certbot не установлен"
    fi
    
    echo ""
}

# ============================================
# СТАТИСТИКА КОНТЕЙНЕРОВ
# ============================================

show_stats() {
    print_header "Статистика Docker контейнеров"
    
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    echo ""
}

# ============================================
# ПРОВЕРКА ОБНОВЛЕНИЙ
# ============================================

check_updates() {
    print_header "Проверка обновлений системы"
    
    local updates=$(apt list --upgradable 2>/dev/null | grep -c "upgradable" || echo "0")
    if [ "$updates" -gt 0 ]; then
        print_warning "Доступно $updates обновлений пакетов"
    else
        print_success "Система обновлена"
    fi
    
    echo ""
}

# ============================================
# ГЛАВНАЯ ФУНКЦИЯ
# ============================================

main() {
    clear
    print_header "Psychology Platform - Мониторинг"
    echo ""
    
    check_containers
    check_health
    check_database
    check_resources
    check_logs
    check_ssl
    
    if [ "${1:-}" = "--stats" ]; then
        show_stats
    fi
    
    if [ "${1:-}" = "--updates" ]; then
        check_updates
    fi
    
    print_header "Мониторинг завершен"
    echo ""
    print_info "Используйте флаги:"
    print_info "  --stats    для отображения статистики контейнеров"
    print_info "  --updates  для проверки обновлений системы"
    print_info "  --watch    для непрерывного мониторинга"
}

# ============================================
# ОБРАБОТКА АРГУМЕНТОВ
# ============================================

if [ "${1:-}" = "--watch" ]; then
    while true; do
        main
        sleep 30
    done
else
    main "$@"
fi
