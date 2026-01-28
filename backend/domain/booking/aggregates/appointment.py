"""
Appointment Aggregate Root.
"""
from datetime import datetime
from typing import Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.shared.exceptions import DomainError
from domain.identity.aggregates.user import UserId
from domain.booking.entities.payment import Payment
from domain.booking.entities.intake_form import IntakeForm
from domain.booking.entities.outcome_record import OutcomeRecord, AppointmentOutcome
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.appointment_status import AppointmentStatus
from domain.booking.value_objects.appointment_format import AppointmentFormat
from domain.booking.value_objects.booking_metadata import BookingMetadata
from domain.booking.value_objects.money import Money
from domain.booking.aggregates.service import Service
from domain.booking.domain_events import (
    AppointmentCreatedEvent,
    AppointmentConfirmedEvent,
    AppointmentCanceledEvent,
    AppointmentRescheduledEvent,
    AppointmentNoShowEvent
)


class AppointmentId(EntityId):
    """ID встречи."""
    pass


class Appointment(AggregateRoot):
    """Aggregate Root для встречи.
    
    Бизнес-правила:
    - Нельзя создать встречу в прошлом
    - Услуга должна поддерживать выбранный формат
    - Оплата должна быть подтверждена перед подтверждением встречи
    - Отмена возможна только для confirmed/pending_payment статусов
    - Перенос возможен только для confirmed статуса и за N часов до начала
    - Результат можно записать только для confirmed/completed встреч и после времени начала
    """
    
    def __init__(
        self,
        id: AppointmentId,
        service_id: "ServiceId",
        client_id: UserId,
        slot: TimeSlot,
        status: AppointmentStatus,
        format: AppointmentFormat,
        metadata: BookingMetadata,
        payment: Optional[Payment] = None,
        intake_form: Optional[IntakeForm] = None,
        outcome_record: Optional[OutcomeRecord] = None
    ):
        super().__init__()
        self._id = id
        self._service_id = service_id
        self._client_id = client_id
        self._slot = slot
        self._status = status
        self._format = format
        self._metadata = metadata
        self._payment = payment
        self._intake_form = intake_form
        self._outcome_record = outcome_record
    
    @classmethod
    def create(
        cls,
        service: Service,
        client_id: UserId,
        slot: TimeSlot,
        format: AppointmentFormat,
        metadata: BookingMetadata
    ) -> "Appointment":
        """Factory method для создания встречи.
        
        Args:
            service: Услуга
            client_id: ID клиента
            slot: Временной слот
            format: Формат встречи
            metadata: Метаданные бронирования
        
        Returns:
            Новый экземпляр Appointment со статусом PENDING_PAYMENT
        
        Raises:
            DomainError: Если слот в прошлом или услуга не поддерживает формат
        """
        # Бизнес-правила
        if slot.is_in_past():
            raise DomainError("Cannot book appointment in the past")
        
        if not service.is_available_for(format):
            raise DomainError(
                f"Service does not support {format.value} format"
            )
        
        appointment = cls(
            id=AppointmentId.generate(),
            service_id=service.id,
            client_id=client_id,
            slot=slot,
            status=AppointmentStatus.PENDING_PAYMENT,
            format=format,
            metadata=metadata
        )
        
        appointment.add_domain_event(
            AppointmentCreatedEvent(
                appointment_id=appointment._id,
                service_id=appointment._service_id,
                slot=slot,
                deep_link_id=metadata.deep_link_id
            )
        )
        
        return appointment
    
    def confirm_payment(
        self,
        payment: Payment,
        service: Service
    ) -> None:
        """Подтверждает оплату и меняет статус на CONFIRMED.
        
        Args:
            payment: Платеж
            service: Услуга (для проверки суммы)
        
        Raises:
            DomainError: Если статус не PENDING_PAYMENT или платеж не успешен
        """
        if not self._status.is_pending_payment():
            raise DomainError("Appointment is not waiting for payment")
        
        if not payment.is_succeeded():
            raise DomainError("Payment must be succeeded")
        
        if not payment.amount.equals(service.price):
            raise DomainError("Payment amount does not match service price")
        
        self._payment = payment
        self._status = AppointmentStatus.CONFIRMED
        
        self.add_domain_event(
            AppointmentConfirmedEvent(
                appointment_id=self._id,
                client_id=self._client_id,
                slot=self._slot,
                service_slug=service.slug,
                paid_amount=payment.amount
            )
        )
    
    def assign_payment(self, payment: Payment) -> None:
        """Присваивает платеж к встрече без подтверждения.
        
        Используется при создании Payment Intent, когда платеж еще не подтвержден.
        
        Args:
            payment: Платеж для присваивания
        """
        self._payment = payment
    
    def cancel(
        self,
        reason: str,
        service: Service
    ) -> Optional[Money]:
        """Отменяет встречу и возвращает сумму возврата.
        
        Args:
            reason: Причина отмены
            service: Услуга (для расчета возврата)
        
        Returns:
            Сумма возврата или None если возврат не предусмотрен
        
        Raises:
            DomainError: Если встреча не может быть отменена
        """
        if not self._can_be_canceled():
            raise DomainError("Appointment cannot be canceled")
        
        refund_amount = self._calculate_refund(service)
        self._status = AppointmentStatus.CANCELED
        
        self.add_domain_event(
            AppointmentCanceledEvent(
                appointment_id=self._id,
                reason=reason,
                refund_amount=refund_amount
            )
        )
        
        return refund_amount
    
    def reschedule(
        self,
        new_slot: TimeSlot,
        service: Service
    ) -> None:
        """Переносит встречу на новый слот.
        
        Args:
            new_slot: Новый временной слот
            service: Услуга (для проверки правил переноса)
        
        Raises:
            DomainError: Если встреча не может быть перенесена
        """
        if not self._can_be_rescheduled(service):
            raise DomainError("Appointment cannot be rescheduled")
        
        if new_slot.is_in_past():
            raise DomainError("Cannot reschedule to past time")
        
        old_slot = self._slot
        self._slot = new_slot
        self._status = AppointmentStatus.RESCHEDULED
        
        self.add_domain_event(
            AppointmentRescheduledEvent(
                appointment_id=self._id,
                old_slot=old_slot,
                new_slot=new_slot
            )
        )
    
    def record_outcome(
        self,
        outcome: AppointmentOutcome
    ) -> None:
        """Записывает результат встречи.
        
        Args:
            outcome: Результат встречи
        
        Raises:
            DomainError: Если результат нельзя записать
        """
        if not (self._status.is_confirmed() or self._status.is_completed()):
            raise DomainError(
                "Cannot record outcome for non-confirmed appointment"
            )
        
        if self._slot.is_in_future():
            raise DomainError("Cannot record outcome for future appointment")
        
        self._outcome_record = OutcomeRecord.create(outcome)
        self._status = AppointmentStatus.COMPLETED
        
        if outcome.is_no_show():
            self.add_domain_event(
                AppointmentNoShowEvent(
                    appointment_id=self._id,
                    client_id=self._client_id
                )
            )
    
    def attach_intake_form(self, form: IntakeForm) -> None:
        """Прикрепляет анкету к встрече.
        
        Args:
            form: Анкета
        
        Raises:
            DomainError: Если анкету нельзя прикрепить
        """
        if not (self._status.is_pending_payment() or 
                self._status.is_confirmed()):
            raise DomainError(
                "Cannot attach form to invalid appointment"
            )
        
        self._intake_form = form
    
    def can_be_canceled(self) -> bool:
        """Проверяет, можно ли отменить встречу (публичный метод).
        
        Returns:
            True если встречу можно отменить, False иначе
        """
        return self._can_be_canceled()
    
    # Приватные методы для бизнес-правил
    def _can_be_canceled(self) -> bool:
        """Проверяет, можно ли отменить встречу."""
        return (self._status.is_confirmed() or 
                self._status.is_pending_payment())
    
    def _can_be_rescheduled(self, service: Service) -> bool:
        """Проверяет, можно ли перенести встречу."""
        if not self._status.is_confirmed():
            return False
        
        hours_until = self._slot.hours_until_start()
        return hours_until >= service.reschedule_min_hours
    
    def _calculate_refund(self, service: Service) -> Optional[Money]:
        """Рассчитывает сумму возврата.
        
        Правила:
        - Полный возврат если отмена за N часов до начала
        - Частичный возврат (50%) если отмена за M часов
        - Без возврата если отмена менее чем за M часов
        """
        if not self._payment:
            return None
        
        hours_until = self._slot.hours_until_start()
        
        if hours_until >= service.cancel_free_hours:
            # Полный возврат
            return self._payment.amount
        elif hours_until >= service.cancel_partial_hours:
            # Частичный возврат (50%)
            return self._payment.amount.multiply(0.5)
        else:
            # Без возврата
            return None
    
    # Getters
    @property
    def id(self) -> AppointmentId:
        return self._id
    
    @property
    def service_id(self) -> "ServiceId":
        return self._service_id
    
    @property
    def client_id(self) -> UserId:
        return self._client_id
    
    @property
    def slot(self) -> TimeSlot:
        return self._slot
    
    @property
    def status(self) -> AppointmentStatus:
        return self._status
    
    @property
    def format(self) -> AppointmentFormat:
        return self._format
    
    @property
    def payment(self) -> Optional[Payment]:
        return self._payment
    
    @property
    def intake_form(self) -> Optional[IntakeForm]:
        return self._intake_form
    
    @property
    def outcome_record(self) -> Optional[OutcomeRecord]:
        return self._outcome_record

    @property
    def metadata(self) -> BookingMetadata:
        return self._metadata
