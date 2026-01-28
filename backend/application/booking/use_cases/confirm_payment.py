"""
Use Case: подтверждение оплаты после webhook от ЮKassa.
"""
from datetime import datetime

from application.exceptions import NotFoundError, ValidationError, ConflictError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.repositories import IAppointmentRepository, IServiceRepository
from domain.booking.entities.payment import Payment
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.booking.value_objects.payment_status import PaymentStatus
from domain.identity.repositories import IUserRepository
from domain.identity.aggregates.user import UserId
from domain.analytics.repositories import ILeadRepository
from domain.analytics.value_objects.timeline_event import TimelineEvent
from application.interfaces.event_bus import IEventBus
from application.interfaces.email_service import IEmailService
from datetime import datetime
import pytz

from application.booking.dto import ConfirmPaymentDto, ConfirmPaymentResponseDto


class ConfirmPaymentUseCase:
    """Use Case для подтверждения оплаты."""
    
    def __init__(
        self,
        appointment_repository: IAppointmentRepository,
        service_repository: IServiceRepository,
        user_repository: IUserRepository,
        lead_repository: ILeadRepository,
        event_bus: IEventBus,
        email_service: IEmailService
    ):
        self._appointment_repository = appointment_repository
        self._service_repository = service_repository
        self._user_repository = user_repository
        self._lead_repository = lead_repository
        self._event_bus = event_bus
        self._email_service = email_service
    
    async def execute(self, dto: ConfirmPaymentDto) -> ConfirmPaymentResponseDto:
        """
        Подтверждает оплату после получения webhook от ЮKassa.
        
        Returns:
            ConfirmPaymentResponseDto с результатом подтверждения.
        
        Raises:
            NotFoundError: Если запись не найдена
            ValidationError: Если данные платежа невалидны
            ConflictError: Если запись уже подтверждена
        """
        # 1. Получение агрегата
        appointment_id = AppointmentId(dto.appointment_id)
        appointment = await self._appointment_repository.find_by_id(appointment_id)
        if not appointment:
            raise NotFoundError("Appointment not found")
        
        service = await self._service_repository.find_by_id(appointment.service_id)
        if not service:
            raise NotFoundError("Service not found")
        
        # 2. Создание Payment
        payment_data = dto.payment_data
        amount = Money(payment_data['amount'], Currency.RUB)
        
        payment = Payment.create(
            amount=amount,
            provider_id='yookassa',
            provider_payment_id=payment_data['providerPaymentId']
        )
        
        if payment_data['status'] == 'succeeded':
            payment.mark_as_succeeded()
        else:
            payment.mark_as_failed(payment_data.get('failureReason', 'Payment failed'))
        
        # 3. Подтверждение записи
        if payment.is_succeeded():
            appointment.confirm_payment(payment, service)
        else:
            # Обновляем статус платежа в appointment
            appointment.assign_payment(payment)
        
        # 4. Сохранение
        await self._appointment_repository.save(appointment)
        
        # 5. Публикация событий
        events = appointment.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        appointment.clear_domain_events()
        
        # 6. Отправка уведомлений
        if payment.is_succeeded():
            # Получаем email пользователя из appointment
            user_email = None
            if appointment.client_id:
                user = await self._user_repository.find_by_id(appointment.client_id)
                if user and user.email:
                    user_email = user.email.value
            
            if user_email:
                await self._email_service.send_appointment_confirmation(
                    to_email=user_email,
                    appointment_details={
                        'appointment_id': str(appointment.id.value),
                        'service_name': service.name,
                        'start_at': appointment.slot.start_at.isoformat(),
                        'end_at': appointment.slot.end_at.isoformat(),
                        'format': appointment.format.value
                    }
                )
        
        # 7. Обновление Lead
        deep_link_id = appointment.metadata.deep_link_id if appointment.metadata else None
        if deep_link_id:
            deep_link_id = appointment.metadata.deep_link_id
            lead = await self._lead_repository.find_by_deep_link_id(deep_link_id)
            
            if lead:
                # Добавляем событие в timeline
                timeline_event = TimelineEvent(
                    event_type='booking_confirmed',
                    occurred_at=datetime.now(pytz.UTC),
                    metadata={
                        'source': 'web',
                        'properties': {'appointment_id': str(appointment.id.value)},
                        'deep_link_id': deep_link_id
                    }
                )
                lead.add_timeline_event(timeline_event)
                
                # Обновляем статус лида на CONVERTED, если платеж успешен
                if payment.is_succeeded():
                    from domain.analytics.value_objects.lead_status import LeadStatus
                    lead.update_status(LeadStatus.CONVERTED)
                
                # Сохраняем Lead
                await self._lead_repository.save(lead)
        
        # 8. Возврат DTO
        return ConfirmPaymentResponseDto(
            appointment_id=dto.appointment_id,
            status='confirmed' if payment.is_succeeded() else 'failed',
            payment={
                'id': str(payment.id.value),
                'status': payment.status.value
            }
        )
