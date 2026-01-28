"""
Request ID Middleware для трейсинга запросов.
"""
import uuid
from django.utils.deprecation import MiddlewareMixin


class RequestIDMiddleware(MiddlewareMixin):
    """
    Добавляет уникальный ID к каждому запросу для трейсинга.
    """
    def process_request(self, request):
        request_id = request.headers.get('X-Request-ID')
        if not request_id:
            request_id = str(uuid.uuid4())
        request.request_id = request_id
    
    def process_response(self, request, response):
        response['X-Request-ID'] = getattr(request, 'request_id', None)
        return response
