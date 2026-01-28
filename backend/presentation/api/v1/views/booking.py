"""
Views для Booking endpoints.
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter
from asgiref.sync import async_to_sync

from application.booking.dto import (
    BookAppointmentDto,
    GetAvailableSlotsDto,
)
from application.exceptions import NotFoundError, ValidationError, ForbiddenError
from presentation.api.v1.serializers.booking import (
    ServiceSerializer,
    ServiceListSerializer,
    SlotSerializer,
    SlotListSerializer,
    CreateAppointmentSerializer,
    AppointmentSerializer,
)
from presentation.api.v1.permissions import IsPublicOrAuthenticated, HasConsent
from presentation.api.v1.dependencies import (
    get_service_repository,
    get_appointment_repository,
    get_availability_slot_repository,
    get_book_appointment_use_case,
    get_get_available_slots_use_case,
)
from domain.booking.aggregates.service import ServiceId
from domain.booking.aggregates.appointment import AppointmentId


class ServiceViewSet(viewsets.ViewSet):
    """
    Управление услугами (booking).
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Список доступных услуг",
        responses={200: ServiceListSerializer(many=True)},
    )
    def list(self, request):
        repository = get_service_repository()
        services = async_to_sync(repository.find_all)()
        
        services_data = []
        for service in services:
            services_data.append({
                'id': str(service.id.value),
                'slug': service.slug,
                'title': service.name,
                'description': service.description,
                'duration_minutes': service.duration_minutes,
                'price_amount': float(service.price.amount),
                'deposit_amount': None,
                'format': service.supported_formats[0].value if service.supported_formats else 'online',
                'cancel_free_hours': service.cancel_free_hours,
                'cancel_partial_hours': service.cancel_partial_hours,
                'reschedule_min_hours': service.reschedule_min_hours,
            })
        
        serializer = ServiceListSerializer(services_data, many=True)
        return Response({'data': serializer.data})
    
    @extend_schema(
        summary="Получить услугу по ID",
        responses={200: ServiceSerializer},
    )
    def retrieve(self, request, pk=None):
        repository = get_service_repository()
        service_id = ServiceId(pk)
        service = async_to_sync(repository.find_by_id)(service_id)
        
        if not service:
            raise NotFoundError("Service not found")
        
        service_data = {
            'id': str(service.id.value),
            'slug': service.slug,
            'title': service.name,
            'description': service.description,
            'duration_minutes': service.duration_minutes,
            'price_amount': float(service.price.amount),
            'deposit_amount': None,
            'format': service.supported_formats[0].value if service.supported_formats else 'online',
            'cancel_free_hours': service.cancel_free_hours,
            'cancel_partial_hours': service.cancel_partial_hours,
            'reschedule_min_hours': service.reschedule_min_hours,
        }
        
        serializer = ServiceSerializer(service_data)
        return Response({'data': serializer.data})


class ServiceSlotsView(APIView):
    """
    Получить доступные слоты для услуги.
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Получить доступные слоты",
        parameters=[
            OpenApiParameter('date_from', type=str, location=OpenApiParameter.QUERY),
            OpenApiParameter('date_to', type=str, location=OpenApiParameter.QUERY),
            OpenApiParameter('timezone', type=str, location=OpenApiParameter.QUERY),
        ],
        responses={200: SlotListSerializer(many=True)},
    )
    def get(self, request, service_id):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        timezone = request.query_params.get('timezone', 'Europe/Moscow')
        
        if not date_from or not date_to:
            raise ValidationError("date_from and date_to are required")
        
        dto = GetAvailableSlotsDto(
            service_id=service_id,
            date_from=date_from,
            date_to=date_to,
            timezone=timezone,
        )
        
        use_case = get_get_available_slots_use_case()
        slots = async_to_sync(use_case.execute)(dto)
        
        slots_data = [
            {
                'id': slot.id,
                'start_at': slot.start_at,
                'end_at': slot.end_at,
                'status': slot.status,
                'local_start_at': slot.local_start_at,
                'local_end_at': slot.local_end_at,
            }
            for slot in slots
        ]
        serializer = SlotListSerializer(slots_data, many=True)
        return Response({'data': serializer.data})


class AppointmentViewSet(viewsets.ViewSet):
    """
    Управление бронированиями.
    """
    permission_classes = [IsAuthenticated, HasConsent]
    
    @extend_schema(
        summary="Создать бронирование",
        request=CreateAppointmentSerializer,
        responses={201: AppointmentSerializer},
    )
    def create(self, request):
        serializer = CreateAppointmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        metadata = {}
        for key in ['entry_point', 'topic_code', 'deep_link_id', 'utm_params']:
            if serializer.validated_data.get(key):
                metadata[key] = serializer.validated_data[key]
        
        dto = BookAppointmentDto(
            service_id=str(serializer.validated_data['service_id']),
            timezone=serializer.validated_data.get('timezone', 'Europe/Moscow'),
            format=serializer.validated_data['format'],
            slot_id=str(serializer.validated_data['slot_id']) if serializer.validated_data.get('slot_id') else None,
            start_at=serializer.validated_data['start_at'].isoformat() if serializer.validated_data.get('start_at') else None,
            end_at=serializer.validated_data['end_at'].isoformat() if serializer.validated_data.get('end_at') else None,
            user_id=str(request.user.id) if request.user.is_authenticated else None,
            anonymous_id=request.session.get('anonymous_id'),
            intake_form=serializer.validated_data.get('intake_form'),
            consents=serializer.validated_data.get('consents'),
            metadata=metadata,
        )
        
        use_case = get_book_appointment_use_case()
        result = async_to_sync(use_case.execute)(dto)
        
        appointment_data = {
            'id': result.id,
            'service': result.service,
            'slot': result.slot,
            'status': result.status,
            'format': result.format,
            'created_at': result.created_at,
            'payment': result.payment,
        }
        response_serializer = AppointmentSerializer(appointment_data)
        return Response(
            {'data': response_serializer.data},
            status=status.HTTP_201_CREATED
        )
    
    @extend_schema(
        summary="Получить бронирование по ID",
        responses={200: AppointmentSerializer},
    )
    def retrieve(self, request, pk=None):
        appointment_id = AppointmentId(pk)
        repository = get_appointment_repository()
        appointment = async_to_sync(repository.find_by_id)(appointment_id)
        
        if not appointment:
            raise NotFoundError("Appointment not found")
        
        user_id_value = request.user.id if request.user.is_authenticated else None
        if user_id_value and str(appointment.client_id.value) != str(user_id_value):
            raise ForbiddenError("Access denied")
        
        service_repo = get_service_repository()
        service = async_to_sync(service_repo.find_by_id)(appointment.service_id)
        
        appointment_data = {
            'id': str(appointment.id.value),
            'service': {
                'id': str(appointment.service_id.value),
                'slug': service.slug if service else '',
                'title': service.name if service else '',
                'durationMinutes': service.duration_minutes if service else 0,
            },
            'slot': {
                'id': str(appointment.slot.id.value) if hasattr(appointment.slot, 'id') and appointment.slot.id else None,
                'startAt': appointment.slot.start_at.isoformat(),
                'endAt': appointment.slot.end_at.isoformat(),
                'timezone': str(appointment.slot.timezone.value),
            },
            'status': appointment.status.value,
            'format': appointment.format.value if hasattr(appointment, 'format') else 'online',
            'payment': {
                'id': str(appointment.payment.id.value),
                'status': appointment.payment.status.value,
                'amount': float(appointment.payment.amount.amount),
            } if appointment.payment else None,
            'created_at': appointment.created_at.isoformat() if hasattr(appointment, 'created_at') else None,
        }
        
        serializer = AppointmentSerializer(appointment_data)
        return Response({'data': serializer.data})


class SlotViewSet(viewsets.ViewSet):
    """
    Управление слотами (для админки).
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Список слотов",
        responses={200: SlotListSerializer(many=True)},
    )
    def list(self, request):
        from django.utils import timezone as django_timezone
        
        service_id_param = request.query_params.get('service_id')
        date_from_param = request.query_params.get('date_from')
        date_to_param = request.query_params.get('date_to')
        status_param = request.query_params.get('status', 'available')
        
        repository = get_availability_slot_repository()
        
        service_id = ServiceId(service_id_param) if service_id_param else None
        date_from = None
        if date_from_param:
            date_from = django_timezone.datetime.fromisoformat(date_from_param.replace('Z', '+00:00'))
        date_to = None
        if date_to_param:
            date_to = django_timezone.datetime.fromisoformat(date_to_param.replace('Z', '+00:00'))
        
        slots = async_to_sync(repository.find_all_slots)(
            service_id=service_id,
            date_from=date_from,
            date_to=date_to,
            status=status_param,
            limit=100
        )
        
        slots_data = []
        for slot in slots:
            slots_data.append({
                'id': str(slot.id.value),
                'service_id': str(slot.service_id.value) if slot.service_id else None,
                'start_at': slot.start_at.isoformat(),
                'end_at': slot.end_at.isoformat(),
                'status': slot.status,
                'source': slot.source,
            })
        
        serializer = SlotListSerializer(slots_data, many=True)
        return Response({'data': serializer.data})
