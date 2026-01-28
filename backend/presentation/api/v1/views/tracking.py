"""
Views для Tracking endpoints.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
import logging

logger = logging.getLogger(__name__)


@extend_schema(
    summary="Отправить tracking event",
    description="Принимает события аналитики от фронтенда",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'schema_version': {'type': 'string'},
                'event_name': {'type': 'string'},
                'event_version': {'type': 'integer'},
                'event_id': {'type': 'string'},
                'occurred_at': {'type': 'string', 'format': 'date-time'},
                'source': {'type': 'string'},
                'environment': {'type': 'string'},
                'session_id': {'type': 'string'},
                'anonymous_id': {'type': 'string'},
                'user_id': {'type': 'string', 'nullable': True},
                'lead_id': {'type': 'string', 'nullable': True},
                'page': {'type': 'object', 'nullable': True},
                'acquisition': {'type': 'object', 'nullable': True},
                'properties': {'type': 'object'},
            },
        },
    },
    responses={200: {'description': 'Event received'}},
)
@api_view(['POST'])
@permission_classes([AllowAny])
def tracking_events(request):
    """
    Принимает tracking события от фронтенда.
    
    В будущем здесь будет обработка через analytics use cases,
    но пока просто логируем и возвращаем успех.
    """
    try:
        event_data = request.data
        
        # Валидация обязательных полей
        required_fields = ['event_name', 'event_id', 'occurred_at', 'source', 'session_id', 'anonymous_id']
        for field in required_fields:
            if field not in event_data:
                return Response(
                    {'error': f'Missing required field: {field}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Логируем событие (в production здесь будет обработка через analytics use cases)
        logger.info(f'[Tracking Event] {event_data.get("event_name")} from {event_data.get("source")}')
        
        # TODO: Интеграция с analytics use cases для обработки событий
        # - Создание/обновление Lead
        # - Добавление TimelineEvent
        # - Отправка в внешнюю аналитику (если настроена)
        
        return Response({'status': 'received'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f'[Tracking Event] Error processing event: {e}', exc_info=True)
        return Response(
            {'error': 'Failed to process event'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
