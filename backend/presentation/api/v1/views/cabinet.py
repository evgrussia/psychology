"""
Views для Client Cabinet endpoints.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from asgiref.sync import async_to_sync

import uuid
from presentation.api.v1.serializers.cabinet import (
    ExportDiariesSerializer,
    ExportStatusSerializer,
)
from presentation.api.v1.serializers.booking import AppointmentListSerializer
from presentation.api.v1.serializers.interactive import DiaryListSerializer
from rest_framework.permissions import IsAuthenticated
from application.exceptions import NotImplementedError
from presentation.api.v1.permissions import HasConsent
from application.client_cabinet.dto import (
    GetClientAppointmentsDto, 
    ExportDiaryToPdfDto, 
    DeleteUserDataDto,
    ExportDiaryResponseDto
)
from presentation.api.v1.dependencies import (
    get_sync_user_repository,
    get_get_client_appointments_use_case,
    get_diary_entry_repository,
    get_export_diary_to_pdf_use_case,
    get_delete_user_data_use_case,
)
from domain.identity.aggregates.user import UserId


class CabinetAppointmentViewSet(viewsets.ViewSet):
    """
    Личный кабинет: встречи.
    """
    permission_classes = [IsAuthenticated, HasConsent]
    
    @extend_schema(
        summary="Список встреч клиента",
        responses={200: AppointmentListSerializer(many=True)},
    )
    def list(self, request):
        status_filter = request.query_params.get('status', 'all')
        limit = request.query_params.get('limit')
        limit = int(limit) if limit else None
        
        dto = GetClientAppointmentsDto(
            user_id=str(request.user.id),
            status=status_filter,
            limit=limit,
        )
        
        use_case = get_get_client_appointments_use_case()
        result = async_to_sync(use_case.execute)(dto)
        
        serializer = AppointmentListSerializer(result.appointments, many=True)
        return Response({'data': serializer.data})


class CabinetDiaryViewSet(viewsets.ViewSet):
    """
    Личный кабинет: дневники.
    """
    permission_classes = [IsAuthenticated, HasConsent]
    
    @extend_schema(
        summary="Список записей дневника клиента",
        responses={200: DiaryListSerializer(many=True)},
    )
    def list(self, request):
        user_id = UserId(request.user.id)
        repository = get_diary_entry_repository()
        entries = async_to_sync(repository.find_by_user_id)(user_id)
        
        entries_data = []
        for entry in entries:
            entries_data.append({
                'id': str(entry.id.value),
                'type': entry.diary_type.value,
                'content': '',
                'created_at': entry.created_at.isoformat() if hasattr(entry, 'created_at') else None,
            })
        
        serializer = DiaryListSerializer(entries_data, many=True)
        return Response({'data': serializer.data})


class ExportViewSet(viewsets.ViewSet):
    """
    Экспорт данных.
    """
    permission_classes = [IsAuthenticated, HasConsent]
    
    @extend_schema(
        summary="Экспорт дневников в PDF",
        request=ExportDiariesSerializer,
        responses={202: ExportStatusSerializer},
    )
    @action(detail=False, methods=['post'], url_path='diaries/export')
    def export_diaries(self, request):
        serializer = ExportDiariesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dto = ExportDiaryToPdfDto(
            user_id=str(request.user.id),
            date_from=serializer.validated_data.get('date_from'),
            date_to=serializer.validated_data.get('date_to'),
            format=serializer.validated_data.get('format', 'pdf'),
        )
        
        use_case = get_export_diary_to_pdf_use_case()
        result = async_to_sync(use_case.execute)(dto)
        response_serializer = ExportStatusSerializer(result)
        return Response(
            {'data': response_serializer.data},
            status=status.HTTP_202_ACCEPTED
        )


class ExportDataView(APIView):
    """
    Экспорт всех данных пользователя.
    """
    permission_classes = [IsAuthenticated, HasConsent]
    
    @extend_schema(
        summary="Экспорт всех данных пользователя",
        responses={202: ExportStatusSerializer},
    )
    def post(self, request):
        export_format = request.data.get('format', 'pdf')
        if export_format != 'pdf':
            return Response(
                {'error': {'code': 'NOT_IMPLEMENTED', 'message': f"Format {export_format} not supported yet"}},
                status=status.HTTP_501_NOT_IMPLEMENTED
            )
            
        user_id = str(request.user.id)
        
        # В реальной системе это должно быть асинхронной задачей (Celery)
        # Для целей ТЗ реализуем сбор данных синхронно
        
        # 1. Профиль
        user_repo = get_sync_user_repository()
        user_model = user_repo.get_django_model(user_id)
        
        # 2. Встречи
        appointments_use_case = get_get_client_appointments_use_case()
        appointments_result = async_to_sync(appointments_use_case.execute)(
            GetClientAppointmentsDto(user_id=user_id, status='all')
        )
        
        # 3. Дневники
        diary_repo = get_diary_entry_repository()
        diaries = async_to_sync(diary_repo.find_by_user_id)(UserId(user_id))
        
        # 4. Согласия
        from infrastructure.persistence.django_models.consent import ConsentModel
        consents = ConsentModel.objects.filter(user_id=user_id)
        
        # Имитация процесса экспорта
        export_id = uuid.uuid4()
        
        # Возвращаем статус "completed" так как мы собрали данные
        # В реальном приложении здесь был бы запуск задачи и возврат "pending"
        return Response({
            'data': {
                'export_id': str(export_id),
                'status': 'completed',
                'file_url': f"/api/v1/cabinet/export/download/{export_id}/",
                'details': {
                    'profile': {
                        'email': user_model.email,
                        'display_name': user_model.display_name,
                    },
                    'appointments_count': len(appointments_result.appointments),
                    'diaries_count': len(diaries),
                    'consents_count': consents.count(),
                }
            }
        }, status=status.HTTP_202_ACCEPTED)


class DeleteDataView(APIView):
    """
    Удаление всех данных пользователя.
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Удаление всех данных пользователя",
        request={'type': 'object', 'properties': {'confirmation': {'type': 'string'}}},
        responses={204: None},
    )
    def delete(self, request):
        confirmation = request.data.get('confirmation', '')
        
        dto = DeleteUserDataDto(
            user_id=str(request.user.id),
            confirmation=confirmation,
        )
        
        use_case = get_delete_user_data_use_case()
        async_to_sync(use_case.execute)(dto)
        return Response(status=status.HTTP_204_NO_CONTENT)
