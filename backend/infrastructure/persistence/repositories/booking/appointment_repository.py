"""
Django ORM реализация IAppointmentRepository.
"""
from typing import List, Optional
from django.db import transaction
from django.utils import timezone
from asgiref.sync import sync_to_async

from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.value_objects import TimeSlot
from domain.identity.aggregates.user import UserId
from domain.booking.repositories import IAppointmentRepository
from infrastructure.persistence.django_models.booking import AppointmentModel, PaymentModel, IntakeFormModel
from infrastructure.persistence.mappers.booking_mapper import AppointmentMapper
from application.interfaces.event_bus import IEventBus
from infrastructure.exceptions import InfrastructureError
import json


class PostgresAppointmentRepository(IAppointmentRepository):
    """Реализация IAppointmentRepository для PostgreSQL через Django ORM."""
    
    def __init__(self, event_bus: IEventBus):
        self._event_bus = event_bus
    
    async def find_by_id(self, id: AppointmentId) -> Optional[Appointment]:
        """Найти Appointment по ID."""
        try:
            record = await AppointmentModel.objects.aget(id=id.value)
            # Используем sync_to_async для синхронного доступа к связанным объектам
            return await sync_to_async(AppointmentMapper.to_domain)(record)
        except AppointmentModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find appointment: {e}") from e
    
    async def find_by_client_id(self, client_id: UserId) -> List[Appointment]:
        """Найти все Appointment для клиента."""
        try:
            records = AppointmentModel.objects.filter(
                client_user_id=client_id.value
            ).order_by('-start_at_utc')
            
            appointments = []
            async for record in records:
                appointment = await sync_to_async(AppointmentMapper.to_domain)(record)
                appointments.append(appointment)
            
            return appointments
        except Exception as e:
            raise InfrastructureError(f"Failed to find appointments by client: {e}") from e
    
    async def find_conflicting_appointments(self, slot: TimeSlot) -> List[Appointment]:
        """Найти конфликтующие Appointment для слота."""
        try:
            records = AppointmentModel.objects.filter(
                start_at_utc__lt=slot.end_at,
                end_at_utc__gt=slot.start_at,
                status__in=['pending_payment', 'confirmed']
            )
            
            appointments = []
            async for record in records:
                appointment = await sync_to_async(AppointmentMapper.to_domain)(record)
                appointments.append(appointment)
            
            return appointments
        except Exception as e:
            raise InfrastructureError(f"Failed to find conflicting appointments: {e}") from e
    
    async def find_upcoming_appointments(
        self, 
        from_date: timezone.datetime, 
        to_date: timezone.datetime
    ) -> List[Appointment]:
        """Найти предстоящие Appointment в диапазоне дат."""
        try:
            records = AppointmentModel.objects.filter(
                start_at_utc__gte=from_date,
                start_at_utc__lte=to_date,
                status__in=['confirmed', 'pending_payment']
            ).order_by('start_at_utc')
            
            appointments = []
            async for record in records:
                appointment = await sync_to_async(AppointmentMapper.to_domain)(record)
                appointments.append(appointment)
            
            return appointments
        except Exception as e:
            raise InfrastructureError(f"Failed to find upcoming appointments: {e}") from e
    
    async def save(self, appointment: Appointment) -> None:
        """Сохранить Appointment (создать или обновить)."""
        try:
            # Используем sync_to_async для транзакции
            await sync_to_async(self._save_sync)(appointment)
            
            # Публикация Domain Events после успешного сохранения
            domain_events = appointment.get_domain_events()
            if domain_events:
                await self._event_bus.publish_all(domain_events)
                appointment.clear_domain_events()
        except Exception as e:
            raise InfrastructureError(f"Failed to save appointment: {e}") from e
    
    @transaction.atomic
    def _save_sync(self, appointment: Appointment) -> None:
        """Синхронная версия save для использования в транзакции."""
        # Маппинг Domain Entity → DB Record
        record_data = AppointmentMapper.to_persistence(appointment)
        
        # Сохранение через Django ORM
        record, created = AppointmentModel.objects.update_or_create(
            id=record_data['id'],
            defaults=record_data
        )
        
        # Сохранение вложенных entities (Payment, IntakeForm)
        self._save_payment_sync(appointment, record)
        self._save_intake_form_sync(appointment, record)
        
        # События будут опубликованы после транзакции
        # (сохраняем их для последующей публикации)
    
    async def save_with_conflict_check(self, appointment: Appointment) -> None:
        """Сохранить Appointment с проверкой конфликтов (optimistic locking)."""
        try:
            # Проверка конфликтов
            conflicts = await self.find_conflicting_appointments(appointment.slot)
            
            if conflicts:
                # Исключаем текущий appointment из проверки (если обновление)
                existing_ids = {c.id.value for c in conflicts}
                if appointment.id.value not in existing_ids:
                    from domain.shared.exceptions import DomainError
                    raise DomainError("Slot is already booked")
            
            # Сохранение
            await self.save(appointment)
            
        except DomainError:
            raise
        except Exception as e:
            raise InfrastructureError(f"Failed to save appointment with conflict check: {e}") from e
    
    def _save_payment_sync(self, appointment: Appointment, record: AppointmentModel) -> None:
        """Сохранить Payment entity (синхронная версия)."""
        # Получаем payment через приватное поле или свойство
        payment = appointment.payment if hasattr(appointment, 'payment') else getattr(appointment, '_payment', None)
        if not payment:
            return
        
        payment_data = {
            'appointment_id': record.id,
            'amount': float(payment.amount.amount),
            'currency': payment.amount.currency.code,
            'provider_id': payment.provider_id,
            'provider_payment_id': payment.provider_payment_id,
            'status': payment.status.value,
            'confirmed_at': payment.confirmed_at,
        }
        
        PaymentModel.objects.update_or_create(
            appointment_id=record.id,
            defaults=payment_data
        )
    
    def _save_intake_form_sync(self, appointment: Appointment, record: AppointmentModel) -> None:
        """Сохранить IntakeForm entity (P2 данные, шифрованные, синхронная версия)."""
        # Получаем intake_form через приватное поле или свойство
        intake_form = getattr(appointment, '_intake_form', None)
        if not intake_form:
            return
        
        from application.interfaces.encryption import IEncryptionService
        from infrastructure.encryption.fernet_encryption import FernetEncryptionService
        encryption_service = FernetEncryptionService()
        
        # Шифрование payload
        answers_json = json.dumps(intake_form.answers)
        encrypted_payload = encryption_service.encrypt(answers_json)
        
        form_data = {
            'appointment_id': record.id,
            'payload_encrypted': encrypted_payload,
            'status': 'submitted' if intake_form.submitted_at else 'draft',
            'submitted_at': intake_form.submitted_at,
        }
        
        IntakeFormModel.objects.update_or_create(
            appointment_id=record.id,
            defaults=form_data
        )
