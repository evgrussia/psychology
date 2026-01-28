"""
Views для Payments endpoints.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated


class PaymentViewSet(viewsets.ViewSet):
    """
    Управление платежами.
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Список платежей пользователя",
        responses={200: {'type': 'object'}},
    )
    def list(self, request):
        from asgiref.sync import async_to_sync
        from infrastructure.persistence.repositories.booking.appointment_repository import (
            PostgresAppointmentRepository,
        )
        from domain.identity.aggregates.user import UserId
        from presentation.api.v1.dependencies import get_event_bus
        
        # Получаем платежи пользователя через appointments
        user_id = UserId(request.user.id)
        appointment_repo = PostgresAppointmentRepository(event_bus=get_event_bus())
        
        appointments = async_to_sync(appointment_repo.find_by_client_id)(user_id)
        
        # Извлекаем платежи из appointments
        payments_data = []
        for appointment in appointments:
            if appointment.payment:
                payment = appointment.payment
                payments_data.append({
                    'id': str(payment.id.value),
                    'amount': float(payment.amount.amount),
                    'currency': payment.amount.currency.value,
                    'status': payment.status.value,
                    'provider': payment.provider.value,
                    'created_at': payment.created_at.isoformat() if payment.created_at else None,
                    'confirmed_at': payment.confirmed_at.isoformat() if payment.confirmed_at else None,
                    'appointment_id': str(appointment.id.value),
                })
        
        return Response({
            'data': payments_data,
        })
