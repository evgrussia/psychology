"""
Custom permissions для API.
"""
from rest_framework import permissions
from domain.identity.value_objects.role import Role


class IsOwner(permissions.BasePermission):
    """
    Разрешение только для Owner роли.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Проверка роли через доменный объект User или UserModel
        if hasattr(request.user, 'has_role'):
            return request.user.has_role(Role.OWNER)
        
        # Fallback: проверка через Django groups/permissions
        return request.user.groups.filter(name='Owner').exists()


class IsOwnerOrAssistant(permissions.BasePermission):
    """
    Разрешение для Owner или Assistant.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if hasattr(request.user, 'has_role'):
            return (
                request.user.has_role(Role.OWNER) or
                request.user.has_role(Role.ASSISTANT)
            )
        
        return request.user.groups.filter(name__in=['Owner', 'Assistant']).exists()


class IsOwnerOrEditor(permissions.BasePermission):
    """
    Разрешение для Owner или Editor (контент).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if hasattr(request.user, 'has_role'):
            return (
                request.user.has_role(Role.OWNER) or
                request.user.has_role(Role.EDITOR)
            )
        
        return request.user.groups.filter(name__in=['Owner', 'Editor']).exists()


class IsClientOrOwner(permissions.BasePermission):
    """
    Разрешение для Client (собственные данные) или Owner.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if hasattr(request.user, 'has_role'):
            return (
                request.user.has_role(Role.CLIENT) or
                request.user.has_role(Role.OWNER)
            )
        
        return request.user.groups.filter(name__in=['Client', 'Owner']).exists()
    
    def has_object_permission(self, request, view, obj):
        # Client может видеть только свои данные
        if hasattr(request.user, 'has_role') and request.user.has_role(Role.CLIENT):
            if hasattr(obj, 'user_id'):
                return obj.user_id == request.user.id
            if hasattr(obj, 'user'):
                return obj.user.id == request.user.id
        
        # Owner видит всё
        if hasattr(request.user, 'has_role') and request.user.has_role(Role.OWNER):
            return True
        
        return False


class IsPublicOrAuthenticated(permissions.BasePermission):
    """
    Публичный доступ или для аутентифицированных пользователей.
    """
    def has_permission(self, request, view):
        # GET запросы публичны
        if request.method in permissions.SAFE_METHODS:
            return True
        # POST/PUT/DELETE требуют аутентификации
        return request.user and request.user.is_authenticated


class HasConsent(permissions.BasePermission):
    """
    Проверка наличия согласия на обработку ПДн.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        from domain.identity.value_objects.consent_type import ConsentType
        
        # Проверка через доменный объект User или UserModel
        if hasattr(request.user, 'has_active_consent'):
            return request.user.has_active_consent(ConsentType.PERSONAL_DATA.value)
        
        # Fallback: проверка через поле в модели
        if hasattr(request.user, 'pd_consent'):
            return request.user.pd_consent
        
        return False
