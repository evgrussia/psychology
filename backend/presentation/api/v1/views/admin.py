"""
Views для Admin endpoints.
Аудит-логирование всех админских действий (NFR-SEC-6).
"""
from uuid import UUID
from typing import Optional
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from drf_spectacular.utils import extend_schema

from presentation.api.v1.serializers.admin import (
    AdminAppointmentListSerializer,
    LeadListSerializer,
    AdminContentSerializer,
    AdminModerationSerializer,
)
from presentation.api.v1.permissions import IsOwnerOrAssistant, IsOwnerOrEditor, IsOwnerOrAssistantOrEditor
from presentation.api.v1.pagination import LargeResultsSetPagination
from presentation.api.v1.throttling import AdminThrottle


def _log_admin_action(
    request: Request,
    action: str,
    entity_type: str,
    entity_id: Optional[UUID] = None,
    old_value: Optional[dict] = None,
    new_value: Optional[dict] = None,
) -> None:
    """Записать действие админа в аудит-лог."""
    if not getattr(request, 'user', None) or not request.user.is_authenticated:
        return
    try:
        from presentation.api.v1.dependencies import (
            get_log_audit_event_use_case,
            get_sync_user_repository,
        )
        user_id = getattr(request.user, 'id', None) or getattr(request.user, 'pk', None)
        actor_role = 'client'
        if user_id:
            user_repo = get_sync_user_repository()
            roles = user_repo.get_user_roles(user_id)
            if roles:
                actor_role = roles[0]
        ip_address = None
        if request.META:
            xff = request.META.get('HTTP_X_FORWARDED_FOR')
            ip_address = (xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR'))
        user_agent = request.META.get('HTTP_USER_AGENT') if request.META else None
        log_use_case = get_log_audit_event_use_case()
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
    except Exception:
        import logging
        logging.getLogger(__name__).exception("Failed to log admin audit event")


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
        _log_admin_action(request, 'admin_list_appointments', 'appointment')
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

    @action(detail=True, methods=['post'], url_path='record_outcome')
    @extend_schema(
        summary="Записать исход встречи",
        request=dict,
        responses={200: dict, 400: None, 403: None, 404: None},
    )
    def record_outcome(self, request, pk=None):
        """POST admin/appointments/<id>/record_outcome/ body: { outcome: attended|no_show|canceled }."""
        from asgiref.sync import async_to_sync
        from application.booking.dto import RecordAppointmentOutcomeDto
        from application.exceptions import NotFoundError, ValidationError, ForbiddenError
        from presentation.api.v1.dependencies import get_record_appointment_outcome_admin_use_case

        outcome = (request.data or {}).get('outcome')
        if not outcome or outcome not in ('attended', 'no_show', 'canceled'):
            return Response(
                {'error': {'code': 'VALIDATION_ERROR', 'message': 'outcome must be attended, no_show or canceled'}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user_id = getattr(request.user, 'id', None) or getattr(request.user, 'pk', None)
        if not user_id:
            return Response({'error': {'code': 'UNAUTHORIZED', 'message': 'User not found'}}, status=status.HTTP_401_UNAUTHORIZED)
        dto = RecordAppointmentOutcomeDto(appointment_id=str(pk), outcome=outcome)
        use_case = get_record_appointment_outcome_admin_use_case()
        try:
            result = async_to_sync(use_case.execute)(dto, str(user_id))
            _log_admin_action(request, 'admin_record_appointment_outcome', 'appointment', entity_id=UUID(pk))
            return Response(result, status=status.HTTP_200_OK)
        except NotFoundError as e:
            return Response({'error': {'code': 'NOT_FOUND', 'message': str(e)}}, status=status.HTTP_404_NOT_FOUND)
        except ForbiddenError as e:
            return Response({'error': {'code': 'FORBIDDEN', 'message': str(e)}}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as e:
            return Response({'error': {'code': 'VALIDATION_ERROR', 'message': str(e)}}, status=status.HTTP_400_BAD_REQUEST)


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
        _log_admin_action(request, 'admin_list_leads', 'lead')
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
        _log_admin_action(request, 'admin_list_content', 'content')
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

    @action(detail=True, methods=['post'], url_path='publish')
    @extend_schema(
        summary="Опубликовать контент",
        request=dict,
        responses={200: dict, 400: None, 404: None},
    )
    def publish(self, request, pk=None):
        """POST admin/content/<id>/publish/ body: { checklist: { hasDisclaimers, toneChecked, hasCta, hasInternalLinks } }."""
        from asgiref.sync import async_to_sync
        from application.admin.dto import PublishContentItemDto
        from application.exceptions import NotFoundError, ValidationError
        from presentation.api.v1.dependencies import get_publish_content_item_use_case

        checklist = (request.data or {}).get('checklist') or {}
        dto = PublishContentItemDto(content_id=str(pk), checklist=checklist)
        use_case = get_publish_content_item_use_case()
        try:
            result = async_to_sync(use_case.execute)(dto)
            _log_admin_action(request, 'admin_publish_content', 'content', entity_id=UUID(pk))
            return Response(result, status=status.HTTP_200_OK)
        except NotFoundError as e:
            return Response({'error': {'code': 'NOT_FOUND', 'message': str(e)}}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({'error': {'code': 'VALIDATION_ERROR', 'message': str(e)}}, status=status.HTTP_400_BAD_REQUEST)


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
        _log_admin_action(request, 'admin_list_moderation', 'moderation_item')
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

    @action(detail=True, methods=['post'], url_path='moderate')
    @extend_schema(
        summary="Модерировать UGC",
        request=dict,
        responses={200: dict, 400: None, 404: None},
    )
    def moderate(self, request, pk=None):
        """POST admin/moderation/<id>/moderate/ body: { status: approved|rejected, comment?: string }."""
        from asgiref.sync import async_to_sync
        from application.admin.dto import ModerateUGCItemDto
        from application.exceptions import NotFoundError, ValidationError
        from presentation.api.v1.dependencies import get_moderate_ugc_item_use_case

        status_val = (request.data or {}).get('status')
        if not status_val or status_val not in ('approved', 'rejected'):
            return Response(
                {'error': {'code': 'VALIDATION_ERROR', 'message': 'status must be approved or rejected'}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        decision = 'approve' if status_val == 'approved' else 'reject'
        user_id = getattr(request.user, 'id', None) or getattr(request.user, 'pk', None)
        if not user_id:
            return Response({'error': {'code': 'UNAUTHORIZED', 'message': 'User not found'}}, status=status.HTTP_401_UNAUTHORIZED)
        comment = (request.data or {}).get('comment')
        dto = ModerateUGCItemDto(item_id=str(pk), decision=decision, moderator_id=str(user_id), reason=comment)
        use_case = get_moderate_ugc_item_use_case()
        try:
            result = async_to_sync(use_case.execute)(dto)
            _log_admin_action(request, 'admin_moderate_ugc', 'moderation_item', entity_id=UUID(pk))
            return Response(result, status=status.HTTP_200_OK)
        except NotFoundError as e:
            return Response({'error': {'code': 'NOT_FOUND', 'message': str(e)}}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({'error': {'code': 'VALIDATION_ERROR', 'message': str(e)}}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='answer')
    @extend_schema(
        summary="Ответить на UGC вопрос",
        request=dict,
        responses={200: dict, 400: None, 404: None},
    )
    def answer(self, request, pk=None):
        """POST admin/moderation/<id>/answer/ body: { text: string }."""
        from asgiref.sync import async_to_sync
        from application.admin.dto import AnswerUGCQuestionDto
        from application.exceptions import NotFoundError, ValidationError
        from presentation.api.v1.dependencies import get_answer_ugc_question_use_case

        text = (request.data or {}).get('text')
        if not text or not str(text).strip():
            return Response(
                {'error': {'code': 'VALIDATION_ERROR', 'message': 'text is required'}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user_id = getattr(request.user, 'id', None) or getattr(request.user, 'pk', None)
        if not user_id:
            return Response({'error': {'code': 'UNAUTHORIZED', 'message': 'User not found'}}, status=status.HTTP_401_UNAUTHORIZED)
        dto = AnswerUGCQuestionDto(item_id=str(pk), answer_text=str(text).strip(), owner_id=str(user_id))
        use_case = get_answer_ugc_question_use_case()
        try:
            result = async_to_sync(use_case.execute)(dto)
            _log_admin_action(request, 'admin_answer_ugc', 'moderation_item', entity_id=UUID(pk))
            return Response(result, status=status.HTTP_200_OK)
        except NotFoundError as e:
            return Response({'error': {'code': 'NOT_FOUND', 'message': str(e)}}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({'error': {'code': 'VALIDATION_ERROR', 'message': str(e)}}, status=status.HTTP_400_BAD_REQUEST)


class AdminMeViewSet(viewsets.ViewSet):
    """
    GET admin/me/ — текущий пользователь и роли для входа в админку.
    Только для owner / assistant / editor.
    """
    permission_classes = [IsOwnerOrAssistantOrEditor]
    throttle_classes = [AdminThrottle]

    def list(self, request):
        from presentation.api.v1.dependencies import get_sync_user_repository

        user_id = getattr(request.user, 'id', None) or getattr(request.user, 'pk', None)
        if not user_id:
            return Response({'error': {'code': 'UNAUTHORIZED', 'message': 'User not found'}}, status=status.HTTP_401_UNAUTHORIZED)
        repo = get_sync_user_repository()
        roles = repo.get_user_roles(user_id) or []
        email = getattr(request.user, 'email', None) or ''
        if hasattr(request.user, 'email') and callable(getattr(request.user, 'email', None)):
            email = str(request.user.email) if request.user.email else ''
        return Response({
            'user': {'id': str(user_id), 'email': email},
            'roles': list(roles),
        })
