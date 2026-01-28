"""
RBAC permissions для API.
"""
from rest_framework.permissions import BasePermission
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from presentation.api.v1.dependencies import get_sync_user_repository


class RBACPermission(BasePermission):
    """
    Проверка прав доступа по ролям.
    """
    required_roles = []
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Если роли не требуются, разрешаем доступ
        if not self.required_roles:
            return True
        
        # Получить ID пользователя
        user_id = None
        if hasattr(request.user, 'id'):
            user_id = request.user.id
        elif hasattr(request.user, 'pk'):
            user_id = request.user.pk
        
        if not user_id:
            return False
        
        # Получить роли пользователя через репозиторий
        user_repository = get_sync_user_repository()
        user_roles = user_repository.get_user_roles(user_id)
        
        # Проверить, есть ли у пользователя хотя бы одна из требуемых ролей
        return any(role in user_roles for role in self.required_roles)


class OwnerPermission(RBACPermission):
    """Разрешение только для owner."""
    required_roles = ['owner']


class AssistantPermission(RBACPermission):
    """Разрешение для owner и assistant."""
    required_roles = ['owner', 'assistant']


class EditorPermission(RBACPermission):
    """Разрешение для owner и editor."""
    required_roles = ['owner', 'editor']
