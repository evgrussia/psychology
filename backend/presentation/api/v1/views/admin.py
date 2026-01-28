"""
Views для Admin endpoints.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from presentation.api.v1.serializers.admin import (
    AdminAppointmentListSerializer,
    LeadListSerializer,
    AdminContentSerializer,
    AdminModerationSerializer,
)
from presentation.api.v1.permissions import IsOwnerOrAssistant, IsOwnerOrEditor
from presentation.api.v1.pagination import LargeResultsSetPagination
from presentation.api.v1.throttling import AdminThrottle


class AdminAppointmentViewSet(viewsets.ViewSet):
    """
    Админка: управление бронированиями.
    """
    permission_classes = [IsOwnerOrAssistant]
    throttle_classes = [AdminThrottle]
    pagination_class = LargeResultsSetPagination
    
    @extend_schema(
        summary="Список всех бронирований",
        responses={200: AdminAppointmentListSerializer(many=True)},
    )
    def list(self, request):
        from asgiref.sync import async_to_sync
        from presentation.api.v1.dependencies import get_appointment_repository
        from django.utils import timezone
        from datetime import timedelta
        
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 50))
        status_filter = request.query_params.get('status')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        repository = get_appointment_repository()
        
        # Получаем все appointments (упрощенная версия)
        # В реальной реализации нужен метод find_all с фильтрами
        if date_from and date_to:
            from dateutil import parser as date_parser
            date_from_dt = date_parser.parse(date_from)
            date_to_dt = date_parser.parse(date_to)
            appointments = async_to_sync(repository.find_upcoming_appointments)(
                from_date=date_from_dt,
                to_date=date_to_dt
            )
        else:
            # Получаем appointments на ближайшие 30 дней
            now = timezone.now()
            future_date = now + timedelta(days=30)
            appointments = async_to_sync(repository.find_upcoming_appointments)(
                from_date=now,
                to_date=future_date
            )
        
        # Фильтрация по статусу
        if status_filter:
            appointments = [apt for apt in appointments if apt.status.value == status_filter]
        
        # Пагинация
        total_count = len(appointments)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_appointments = appointments[start_idx:end_idx]
        
        # Маппинг в DTO
        appointments_data = []
        for apt in paginated_appointments:
            appointments_data.append({
                'id': str(apt.id.value),
                'service': {'id': str(apt.service_id.value)},
                'client': {'id': str(apt.client_id.value)},
                'slot': {
                    'start_at': apt.slot.start_at.isoformat(),
                    'end_at': apt.slot.end_at.isoformat(),
                },
                'status': apt.status.value,
                'created_at': apt.created_at.isoformat() if hasattr(apt, 'created_at') and apt.created_at else timezone.now().isoformat(),
            })
        
        total_pages = (total_count + per_page - 1) // per_page if total_count > 0 else 0
        
        serializer = AdminAppointmentListSerializer(appointments_data, many=True)
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_previous': page > 1,
            }
        })


class LeadViewSet(viewsets.ViewSet):
    """
    Админка: управление лидами.
    """
    permission_classes = [IsOwnerOrAssistant]
    throttle_classes = [AdminThrottle]
    
    @extend_schema(
        summary="Список лидов",
        responses={200: LeadListSerializer(many=True)},
    )
    def list(self, request):
        from asgiref.sync import async_to_sync
        from application.admin.dto import GetLeadsListDto
        from presentation.api.v1.dependencies import get_leads_list_use_case
        
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 50))
        status_filter = request.query_params.get('status')
        source_filter = request.query_params.get('source')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        dto = GetLeadsListDto(
            page=page,
            per_page=per_page,
            status=status_filter,
            source=source_filter,
            date_from=date_from,
            date_to=date_to,
        )
        
        use_case = get_leads_list_use_case()
        
        result = async_to_sync(use_case.execute)(dto)
        serializer = LeadListSerializer(result.data, many=True)
        return Response({
            'data': serializer.data,
            'pagination': result.pagination,
        })


class AdminContentViewSet(viewsets.ViewSet):
    """
    Админка: управление контентом.
    """
    permission_classes = [IsOwnerOrEditor]
    throttle_classes = [AdminThrottle]
    
    @extend_schema(
        summary="Список контента",
        responses={200: AdminContentSerializer(many=True)},
    )
    def list(self, request):
        from asgiref.sync import async_to_sync
        from domain.content.value_objects.content_type import ContentType
        from presentation.api.v1.dependencies import get_content_item_repository
        
        repository = get_content_item_repository()
        
        # Получаем все типы контента
        content_types = [
            ContentType('article'),
            ContentType('exercise'),
            ContentType('audio'),
            ContentType('tool'),
        ]
        
        all_content = []
        for content_type in content_types:
            # Получаем все (включая черновики) для админки
            # В реальной реализации нужен метод find_all
            content_items = async_to_sync(repository.find_published)(
                content_type=content_type,
                page=1,
                per_page=100,
            )
            all_content.extend(content_items)
        
        content_data = []
        for item in all_content:
            content_data.append({
                'id': str(item.id.value),
                'slug': item.slug,
                'title': item.title,
                'status': item.status.value,
                'created_at': item.created_at.isoformat() if hasattr(item, 'created_at') else None,
            })
        
        serializer = AdminContentSerializer(content_data, many=True)
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': 1,
                'per_page': 100,
                'total': len(content_data),
                'total_pages': 1,
                'has_next': False,
                'has_previous': False,
            }
        })


class AdminModerationViewSet(viewsets.ViewSet):
    """
    Админка: управление модерацией.
    """
    permission_classes = [IsOwnerOrEditor]
    throttle_classes = [AdminThrottle]
    
    @extend_schema(
        summary="Список элементов модерации",
        responses={200: AdminModerationSerializer(many=True)},
    )
    def list(self, request):
        from asgiref.sync import async_to_sync
        from domain.ugc_moderation.value_objects.moderation_status import ModerationStatus
        from presentation.api.v1.dependencies import get_moderation_item_repository
        
        status_filter = request.query_params.get('status', 'pending')
        
        repository = get_moderation_item_repository()
        
        status_val = ModerationStatus(status_filter)
        items = async_to_sync(repository.find_by_status)(status_val)
        
        items_data = []
        for item in items:
            items_data.append({
                'id': str(item.id.value),
                'content_type': item.content_type.value,
                'content': '',  # Контент зашифрован, расшифровка в use case
                'status': item.status.value,
                'created_at': item.created_at.isoformat() if hasattr(item, 'created_at') else None,
            })
        
        serializer = AdminModerationSerializer(items_data, many=True)
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': 1,
                'per_page': 100,
                'total': len(items_data),
                'total_pages': 1,
                'has_next': False,
                'has_previous': False,
            }
        })
