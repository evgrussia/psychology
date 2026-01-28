"""
Use Case: обработка webhook от ЮKassa о статусе платежа.
"""
import json
from application.exceptions import NotFoundError, UnauthorizedError
from domain.booking.repositories import IAppointmentRepository
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.payments.repositories import IPaymentRepository, IWebhookEventRepository
from domain.payments.aggregates.payment import Payment
from domain.payments.domain_events import PaymentSucceededEvent, PaymentFailedEvent
from application.interfaces.payment_adapter import IPaymentAdapter
from application.interfaces.event_bus import IEventBus
# Убираем прямой импорт модели
# from infrastructure.persistence.django_models.booking import WebhookEventModel
from application.booking.use_cases.confirm_payment import ConfirmPaymentUseCase

from application.payments.dto import PaymentWebhookDto


class HandlePaymentWebhookUseCase:
    """Use Case для обработки webhook от ЮKassa."""
    
    def __init__(
        self,
        payment_repository: IPaymentRepository,
        appointment_repository: IAppointmentRepository,
        payment_adapter: IPaymentAdapter,
        event_bus: IEventBus,
        confirm_payment_use_case: ConfirmPaymentUseCase,
        webhook_repository: IWebhookEventRepository
    ):
        self._payment_repository = payment_repository
        self._appointment_repository = appointment_repository
        self._payment_adapter = payment_adapter
        self._event_bus = event_bus
        self._confirm_payment_use_case = confirm_payment_use_case
        self._webhook_repository = webhook_repository
    
    async def execute(self, dto: PaymentWebhookDto, signature: str, request_body: bytes) -> dict:
        """
        Обрабатывает webhook от ЮKassa.
        
        Args:
            dto: Данные webhook
            signature: Подпись webhook для валидации
            request_body: Тело запроса в байтах (для проверки подписи)
        
        Returns:
            dict с результатом обработки
        
        Raises:
            UnauthorizedError: Если подпись невалидна
            NotFoundError: Если платеж не найден
        """
        # 1. Валидация подписи
        if not self._payment_adapter.verify_webhook_signature(request_body, signature):
            raise UnauthorizedError("Invalid webhook signature")
        
        # 2. Идемпотентность: проверяем, не обработан ли уже этот webhook
        is_processed = await self._webhook_repository.is_processed(
            dto.provider_payment_id,
            dto.event
        )
        if is_processed:
            return {'success': True, 'message': 'Webhook already processed'}
        
        # 3. Поиск платежа
        payment = await self._payment_repository.find_by_provider_payment_id(dto.provider_payment_id)
        if not payment:
            raise NotFoundError(f"Payment not found: {dto.provider_payment_id}")
        
        # 4. Обновление статуса платежа на основе event
        if dto.event == 'payment.succeeded':
            if payment.status.value not in ('succeeded', 'pending'):
                # Если платеж еще в intent, сначала помечаем как pending
                if payment.status.value == 'intent':
                    payment.mark_as_pending(dto.provider_payment_id)
            if payment.status.value == 'pending':
                payment.mark_as_succeeded()
        elif dto.event == 'payment.canceled':
            if payment.status.value == 'pending':
                payment.mark_as_failed('Payment canceled by user')
        elif dto.event == 'payment.waiting_for_capture':
            if payment.status.value == 'intent':
                payment.mark_as_pending(dto.provider_payment_id)
        
        # 5. Сохранение Payment
        await self._payment_repository.save(payment)
        
        # 6. Подтверждение записи (если применимо)
        if dto.event == 'payment.succeeded' and dto.metadata:
            appointment_id = dto.metadata.get('appointmentId') or dto.metadata.get('appointment_id')
            if appointment_id:
                from application.booking.dto import ConfirmPaymentDto
                confirm_dto = ConfirmPaymentDto(
                    appointment_id=appointment_id,
                    payment_data={
                        'providerPaymentId': dto.provider_payment_id,
                        'amount': dto.amount.get('value') if isinstance(dto.amount, dict) else dto.amount,
                        'status': 'succeeded'
                    }
                )
                await self._confirm_payment_use_case.execute(confirm_dto)
        
        # 7. Публикация событий
        if dto.event == 'payment.succeeded':
            event = PaymentSucceededEvent(
                payment_id=payment.id,
                amount=payment.amount
            )
            await self._event_bus.publish(event)
        elif dto.event in ('payment.canceled', 'payment.failed'):
            event = PaymentFailedEvent(
                payment_id=payment.id,
                reason=dto.metadata.get('failure_reason', 'Payment failed') if dto.metadata else 'Payment failed'
            )
            await self._event_bus.publish(event)
        
        # 8. Отмечаем webhook как обработанный
        await self._webhook_repository.mark_as_processed(
            dto.provider_payment_id,
            dto.event
        )
        
        return {'success': True, 'payment_id': str(payment.id.value)}
    
    # Методы _is_webhook_processed и _mark_webhook_processed удалены
