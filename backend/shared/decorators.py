"""
Декораторы для cross-cutting concerns.
"""
from functools import wraps
from typing import Optional, Callable, Any
from uuid import UUID
from application.audit.use_cases.log_audit_event import LogAuditEventUseCase
from infrastructure.persistence.repositories.audit_log_repository import DjangoAuditLogRepository


def audit_log(action: str, entity_type: str):
    """
    Декоратор для автоматического логирования действий в аудит-лог.
    
    Args:
        action: Действие (например, 'admin_price_changed')
        entity_type: Тип сущности (например, 'service', 'content', 'user')
    
    Usage:
        @audit_log(action='admin_price_changed', entity_type='service')
        def update_price(request, service_id, new_price):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Получаем request из args или kwargs
            request = kwargs.get('request')
            if not request and args:
                # Пытаемся найти request в args (обычно первый аргумент в DRF views)
                for arg in args:
                    if hasattr(arg, 'user') and hasattr(arg, 'META'):
                        request = arg
                        break
            
            # Получаем entity_id из kwargs или args
            entity_id = kwargs.get('entity_id') or kwargs.get('id')
            if not entity_id:
                # Пытаемся найти в args (например, pk в URL)
                for arg in args:
                    if isinstance(arg, UUID) or (isinstance(arg, str) and len(str(arg)) == 36):
                        try:
                            entity_id = UUID(str(arg))
                            break
                        except (ValueError, AttributeError):
                            pass
            
            # Получаем old_value и new_value из kwargs (если переданы)
            old_value = kwargs.get('old_value')
            new_value = kwargs.get('new_value')
            
            # Выполняем функцию
            result = func(*args, **kwargs)
            
            # Логируем действие
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                try:
                    # Получаем ID пользователя
                    user_id = None
                    if hasattr(request.user, 'id'):
                        user_id = request.user.id
                    elif hasattr(request.user, 'pk'):
                        user_id = request.user.pk
                    
                    # Определяем роль пользователя
                    actor_role = 'client'  # По умолчанию
                    if user_id:
                        from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
                        user_repo = DjangoUserRepository()
                        user_roles = user_repo.get_user_roles(user_id)
                        if user_roles:
                            # Берем первую роль (или можно определить приоритет)
                            actor_role = user_roles[0]
                    
                    # Получаем IP адрес и User-Agent
                    ip_address = None
                    if hasattr(request, 'META'):
                        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                        if x_forwarded_for:
                            ip_address = x_forwarded_for.split(',')[0].strip()
                        else:
                            ip_address = request.META.get('REMOTE_ADDR')
                    
                    user_agent = None
                    if hasattr(request, 'META'):
                        user_agent = request.META.get('HTTP_USER_AGENT')
                    
                    # Создаем Use Case для логирования
                    audit_repository = DjangoAuditLogRepository()
                    log_use_case = LogAuditEventUseCase(audit_repository)
                    
                    # Логируем событие
                    log_use_case.execute(
                        actor_user_id=user_id,
                        actor_role=actor_role,
                        action=action,
                        entity_type=entity_type,
                        entity_id=entity_id,
                        old_value=old_value,
                        new_value=new_value,
                        ip_address=ip_address,
                        user_agent=user_agent,
                    )
                except Exception as e:
                    # Не прерываем выполнение функции при ошибке логирования
                    # В production можно добавить логирование ошибки
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to log audit event: {e}", exc_info=True)
            
            return result
        return wrapper
    return decorator
