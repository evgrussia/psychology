"""
Request/Response Logging Middleware для API.
"""
import json
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api')


class APILoggingMiddleware(MiddlewareMixin):
    """
    Логирование запросов и ответов (без чувствительных данных).
    """
    # Поля, которые не должны логироваться
    SENSITIVE_FIELDS = {'password', 'password_hash', 'token', 'refresh_token', 'authorization'}
    
    def process_request(self, request):
        # Логируем только метаданные
        log_data = {
            'method': request.method,
            'path': request.path,
            'query_params': dict(request.GET),
            'user_id': request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None,
            'request_id': getattr(request, 'request_id', None),
        }
        
        # НЕ логируем body (может содержать PII)
        logger.info(f"API Request: {json.dumps(log_data)}")
    
    def process_response(self, request, response):
        log_data = {
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'request_id': getattr(request, 'request_id', None),
        }
        
        logger.info(f"API Response: {json.dumps(log_data)}")
        return response
    
    def _sanitize_data(self, data):
        """
        Удалить чувствительные данные из словаря.
        """
        if not isinstance(data, dict):
            return data
        
        sanitized = {}
        for key, value in data.items():
            if key.lower() in self.SENSITIVE_FIELDS:
                sanitized[key] = '***REDACTED***'
            elif isinstance(value, dict):
                sanitized[key] = self._sanitize_data(value)
            elif isinstance(value, list):
                sanitized[key] = [self._sanitize_data(item) if isinstance(item, dict) else item for item in value]
            else:
                sanitized[key] = value
        
        return sanitized
