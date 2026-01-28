"""
Use Case: создание намерения оплаты (Payment Intent) для записи.
"""
from application.exceptions import NotFoundError, ValidationError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.repositories import IAppointmentRepository, IServiceRepository
from domain.booking.entities.payment import Payment
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.payments.repositories import IPaymentRepository
from application.interfaces.payment_adapter import IPaymentAdapter
from application.interfaces.event_bus import IEventBus

from application.payments.dto import CreatePaymentIntentDto, PaymentIntentResponseDto


class CreatePaymentIntentUseCase:
    """Use Case для создания намерения оплаты."""
    
    def __init__(
        self,
        appointment_repository: IAppointmentRepository,
        service_repository: IServiceRepository,
        payment_repository: IPaymentRepository,
        payment_adapter: IPaymentAdapter,
        event_bus: IEventBus
    ):
        self._appointment_repository = appointment_repository
        self._service_repository = service_repository
        self._payment_repository = payment_repository
        self._payment_adapter = payment_adapter
        self._event_bus = event_bus
    
    async def execute(self, dto: CreatePaymentIntentDto) -> PaymentIntentResponseDto:
        """
        Создает намерение оплаты для записи.
        
        Returns:
            PaymentIntentResponseDto с данными платежа.
        
        Raises:
            NotFoundError: Если запись или услуга не найдены
            ValidationError: Если данные невалидны
        """
        # 1. Получение агрегатов
        appointment_id = AppointmentId(dto.appointment_id)
        appointment = await self._appointment_repository.find_by_id(appointment_id)
        if not appointment:
            raise NotFoundError("Appointment not found")
        
        service = await self._service_repository.find_by_id(appointment.service_id)
        if not service:
            raise NotFoundError("Service not found")
        
        # 2. Валидация суммы
        amount = Money(dto.amount, Currency.RUB)
        if dto.deposit_amount:
            deposit_amount = Money(dto.deposit_amount, Currency.RUB)
            if deposit_amount.amount > amount.amount:
                raise ValidationError("Deposit amount cannot be greater than total amount")
        else:
            deposit_amount = None
        
        # 3. Создание Payment Intent через провайдера
        return_url = self._get_return_url()
        payment_data = await self._payment_adapter.create_payment_intent(
            amount=amount,
            description=f"Консультация: {service.name}",
            return_url=return_url,
            metadata={
                'appointment_id': str(appointment.id.value)
            }
        )
        
        # 4. Создание Payment агрегата
        payment = Payment.create(
            amount=amount,
            provider_id='yookassa',
            provider_payment_id=payment_data.get('id')
        )
        
        # 5. Сохранение Payment
        await self._payment_repository.save(payment)
        
        # 6. Обновление Appointment с привязкой к платежу
        appointment.assign_payment(payment)
        
        # 7. Сохранение Appointment
        await self._appointment_repository.save(appointment)
        
        # 8. Публикация событий
        # Payment создается с PaymentIntentCreatedEvent автоматически
        payment_events = payment.get_domain_events()
        for event in payment_events:
            await self._event_bus.publish(event)
        payment.clear_domain_events()
        
        # 9. Возврат DTO
        return PaymentIntentResponseDto(
            payment_id=str(payment.id.value),
            payment_url=payment_data.get('confirmation_url'),
            amount=dto.amount,
            status='intent'
        )
    
    def _get_return_url(self) -> str:
        """Получает return_url из конфигурации."""
        import os
        from django.conf import settings
        
        # Пытаемся получить из настроек Django
        return_url = getattr(settings, 'PAYMENT_RETURN_URL', None)
        if return_url:
            return return_url
        
        # Fallback на переменную окружения
        return_url = os.getenv('PAYMENT_RETURN_URL', 'https://example.com/payment/return')
        return return_url
