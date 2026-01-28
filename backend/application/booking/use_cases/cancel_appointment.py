"""
Use Case: отмена записи с расчётом возврата средств.
"""
from application.exceptions import NotFoundError, ForbiddenError, ValidationError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service
from domain.booking.repositories import IAppointmentRepository, IServiceRepository
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from application.interfaces.event_bus import IEventBus
from application.interfaces.email_service import IEmailService
from application.interfaces.payment_adapter import IPaymentAdapter

from application.booking.dto import CancelAppointmentDto, CancelAppointmentResponseDto


class CancelAppointmentUseCase:
    """Use Case для отмены записи."""
    
    def __init__(
        self,
        appointment_repository: IAppointmentRepository,
        service_repository: IServiceRepository,
        user_repository: IUserRepository,
        payment_adapter: IPaymentAdapter,
        event_bus: IEventBus,
        email_service: IEmailService
    ):
        self._appointment_repository = appointment_repository
        self._service_repository = service_repository
        self._user_repository = user_repository
        self._payment_adapter = payment_adapter
        self._event_bus = event_bus
        self._email_service = email_service
    
    async def execute(self, dto: CancelAppointmentDto) -> CancelAppointmentResponseDto:
        """
        Отменяет запись с расчётом возврата средств.
        
        Returns:
            CancelAppointmentResponseDto с результатом отмены.
        
        Raises:
            NotFoundError: Если запись не найдена
            ForbiddenError: Если пользователь не имеет прав
            ValidationError: Если запись нельзя отменить
        """
        # 1. Проверка прав
        appointment_id = AppointmentId(dto.appointment_id)
        appointment = await self._appointment_repository.find_by_id(appointment_id)
        if not appointment:
            raise NotFoundError("Appointment not found")
        
        user_id = UserId(dto.user_id)
        user = await self._user_repository.find_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        
        # Проверка, что пользователь - владелец или админ
        is_owner = appointment.client_id == user_id
        is_admin = any(role.code == 'admin' for role in user.roles)
        
        if not (is_owner or is_admin):
            raise ForbiddenError("You don't have permission to cancel this appointment")
        
        # 2. Проверка возможности отмены
        if not appointment.can_be_canceled():
            raise ValidationError("Appointment cannot be canceled")
        
        # 3. Расчёт возврата
        service = await self._service_repository.find_by_id(appointment.service_id)
        if not service:
            raise NotFoundError("Service not found")
        
        refund_amount = appointment.cancel(dto.reason, service)
        
        # 4. Инициация возврата (если применимо)
        if refund_amount and refund_amount.amount > 0:
            if appointment.payment and appointment.payment.provider_payment_id:
                try:
                    await self._payment_adapter.create_refund(
                        payment_id=appointment.payment.provider_payment_id,
                        amount=refund_amount,
                        reason=f"Appointment cancellation: {dto.reason}"
                    )
                except Exception as e:
                    # Логируем ошибку, но не прерываем процесс отмены
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to create refund for appointment {appointment.id.value}: {e}")
                    pass
        
        # 5. Сохранение
        await self._appointment_repository.save(appointment)
        
        # 6. Публикация событий
        events = appointment.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        appointment.clear_domain_events()
        
        # 7. Уведомления
        if user.email:
            await self._email_service.send_cancellation_notification(
                to_email=user.email.value,
                appointment_details={
                    'appointment_id': str(appointment.id.value),
                    'refund_amount': refund_amount.amount if refund_amount else None,
                    'reason': dto.reason,
                    'start_at': appointment.slot.start_at.isoformat() if appointment.slot else None
                }
            )
        
        # 8. Возврат DTO
        refund_status = 'none'
        refund_amount_value = None
        
        if refund_amount:
            if refund_amount.equals(appointment.payment.amount):
                refund_status = 'full'
            else:
                refund_status = 'partial'
            refund_amount_value = refund_amount.amount
        
        return CancelAppointmentResponseDto(
            appointment_id=dto.appointment_id,
            status='canceled',
            refund_amount=refund_amount_value,
            refund_status=refund_status
        )
