"""
Rate limiting (throttling) для API.
"""
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.conf import settings


class PublicEndpointThrottle(AnonRateThrottle):
    """
    Rate limiting для публичных endpoints.
    """
    rate = '100/minute'

    def allow_request(self, request, view):
        if settings.TESTING:
            return True
        return super().allow_request(request, view)


class AuthEndpointThrottle(AnonRateThrottle):
    """
    Rate limiting для auth endpoints (защита от брутфорса).
    """
    rate = '10/minute'

    def allow_request(self, request, view):
        if getattr(settings, 'TESTING', False):
            return True
        return super().allow_request(request, view)


class AuthenticatedThrottle(UserRateThrottle):
    """
    Rate limiting для аутентифицированных пользователей.
    """
    rate = '1000/minute'

    def allow_request(self, request, view):
        if getattr(settings, 'TESTING', False):
            return True
        return super().allow_request(request, view)


class AdminThrottle(UserRateThrottle):
    """
    Rate limiting для админки.
    """
    rate = '5000/minute'
    
    def __init__(self):
        super().__init__()
        self.history = []
    
    def allow_request(self, request, view):
        if getattr(settings, 'TESTING', False):
            return True
            
        # Только для админов
        if not request.user or not request.user.is_authenticated:
            return False
        
        from domain.identity.value_objects.role import Role
        
        if hasattr(request.user, 'has_role'):
            if not (request.user.has_role(Role.OWNER) or 
                    request.user.has_role(Role.ASSISTANT) or 
                    request.user.has_role(Role.EDITOR)):
                return False
        else:
            # Fallback: проверка через groups
            if not request.user.groups.filter(name__in=['Owner', 'Assistant', 'Editor']).exists():
                return False
        
        return super().allow_request(request, view)
