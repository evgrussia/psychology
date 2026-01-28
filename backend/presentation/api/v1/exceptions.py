"""
Custom exception handlers для API.
"""
from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response
from domain.shared.exceptions import DomainError
from application.exceptions import ApplicationError
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Кастомный обработчик исключений для единообразного формата ошибок.
    """
    # Обработка исключений Application Layer
    if isinstance(exc, ApplicationError):
        # Логируем как warning, так как это ожидаемые ошибки бизнеса
        logger.warning(f"Application error: {exc.__class__.__name__}: {exc.message}")
        
        status_code = getattr(exc, 'http_status', status.HTTP_400_BAD_REQUEST)
        
        return Response(
            {
                'error': {
                    'code': getattr(exc, 'code', 'APPLICATION_ERROR'),
                    'message': str(exc),
                    'details': getattr(exc, 'details', []) or [],
                }
            },
            status=status_code
        )
    
    # Обработка доменных исключений
    if isinstance(exc, DomainError):
        logger.warning(f"Domain error: {exc}")
        # Маппим доменные ошибки на Application коды
        error_code = 'DOMAIN_ERROR'
        http_status = status.HTTP_400_BAD_REQUEST
        
        if 'Conflict' in exc.__class__.__name__:
            error_code = 'CONFLICT'
            http_status = status.HTTP_409_CONFLICT
        elif 'NotFound' in exc.__class__.__name__:
            error_code = 'NOT_FOUND'
            http_status = status.HTTP_404_NOT_FOUND
        elif 'BusinessRule' in exc.__class__.__name__:
            error_code = 'BUSINESS_RULE_VIOLATION'
            http_status = status.HTTP_422_UNPROCESSABLE_ENTITY

        return Response(
            {
                'error': {
                    'code': error_code,
                    'message': str(exc),
                    'details': [],
                }
            },
            status=http_status
        )

    # Стандартная обработка DRF
    response = exception_handler(exc, context)
    
    if response is not None:
        # Форматируем ошибку DRF
        custom_response_data = {
            'error': {
                'code': _get_error_code(exc),
                'message': _get_error_message(exc, response),
                'details': _get_error_details(exc),
            }
        }
        response.data = custom_response_data
        return response
    
    # Необработанное исключение
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return Response(
        {
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An internal error occurred',
                'details': [],
            }
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def _get_error_message(exc, response):
    """
    Получить сообщение об ошибке.
    """
    if hasattr(exc, 'detail'):
        if isinstance(exc.detail, dict):
            # Если это словарь (например, ошибки валидации), возвращаем общее сообщение
            return "Validation failed"
        return str(exc.detail)
    return str(exc)


def _get_error_code(exc):
    """
    Получить код ошибки из исключения.
    """
    error_code_map = {
        'validation_error': 'VALIDATION_ERROR',
        'not_authenticated': 'UNAUTHORIZED',
        'permission_denied': 'FORBIDDEN',
        'not_found': 'NOT_FOUND',
        'throttled': 'RATE_LIMIT_EXCEEDED',
    }
    
    if hasattr(exc, 'default_code'):
        return error_code_map.get(exc.default_code, 'ERROR')
    
    return 'ERROR'


def _get_error_details(exc):
    """
    Получить детали ошибки (для валидации).
    """
    if hasattr(exc, 'detail') and isinstance(exc.detail, dict):
        details = []
        for field, messages in exc.detail.items():
            if isinstance(messages, list):
                for message in messages:
                    details.append({
                        'field': field,
                        'message': str(message),
                    })
            else:
                details.append({
                    'field': field,
                    'message': str(messages),
                })
        return details
    
    return []
