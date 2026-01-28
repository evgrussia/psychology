"""
Mapper для преобразования Booking Domain Entities ↔ DB Records.
"""
from typing import Dict, Any, Optional
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.entities.payment import Payment, PaymentId
from domain.booking.entities.intake_form import IntakeForm, IntakeFormId
from domain.booking.value_objects import (
    TimeSlot,
    AppointmentStatus,
    AppointmentFormat,
    BookingMetadata,
    Money,
    Currency,
    PaymentStatus,
)
from domain.booking.value_objects.timezone import Timezone
from domain.identity.aggregates.user import UserId
from infrastructure.persistence.django_models.booking import (
    AppointmentModel,
    PaymentModel,
    IntakeFormModel,
    ServiceModel,
)
from application.interfaces.encryption import IEncryptionService


class AppointmentMapper:
    """Mapper для преобразования Appointment Domain Entity ↔ DB Record."""
    
    @staticmethod
    def to_domain(record: AppointmentModel) -> Appointment:
        """Преобразовать DB Record → Domain Entity."""
        from domain.booking.aggregates.service import ServiceId
        
        # Восстановление Value Objects
        timezone = Timezone(record.timezone)
        time_slot = TimeSlot(
            start_at=record.start_at_utc,
            end_at=record.end_at_utc,
            timezone=timezone
        )
        
        status = AppointmentStatus(record.status)
        format_vo = AppointmentFormat(record.format)
        
        metadata = BookingMetadata(
            deep_link_id=record.metadata.get('deep_link_id'),
            utm_source=record.metadata.get('utm_source'),
            utm_medium=record.metadata.get('utm_medium'),
            utm_campaign=record.metadata.get('utm_campaign'),
            additional_data=record.metadata.get('additional_data', {})
        )
        
        # Восстановление Payment (если есть)
        payment = None
        try:
            payment_record = PaymentModel.objects.get(appointment_id=record.id)
            payment = AppointmentMapper._payment_to_domain(payment_record)
        except PaymentModel.DoesNotExist:
            pass
        
        # Восстановление IntakeForm (если есть)
        intake_form = None
        try:
            form_record = IntakeFormModel.objects.get(appointment_id=record.id)
            intake_form = AppointmentMapper._intake_form_to_domain(form_record)
        except IntakeFormModel.DoesNotExist:
            pass
        
        # Восстановление агрегата через конструктор
        appointment = Appointment(
            id=AppointmentId(record.id),
            service_id=ServiceId(record.service_id),
            client_id=UserId(record.client_user_id) if record.client_user_id else None,
            slot=time_slot,
            status=status,
            format=format_vo,
            metadata=metadata,
            payment=payment,
            intake_form=intake_form
        )
        
        return appointment
    
    @staticmethod
    def to_persistence(appointment: Appointment) -> Dict[str, Any]:
        """Преобразовать Domain Entity → DB Record (словарь для Django ORM)."""
        # Получаем metadata через приватное поле (так как публичного свойства нет)
        metadata_vo = appointment._metadata if hasattr(appointment, '_metadata') else BookingMetadata()
        
        return {
            'id': appointment.id.value,
            'service_id': appointment.service_id.value,
            'client_user_id': appointment.client_id.value if appointment.client_id else None,
            'start_at_utc': appointment.slot.start_at,
            'end_at_utc': appointment.slot.end_at,
            'timezone': appointment.slot.timezone.value,
            'status': appointment.status.value,
            'format': appointment.format.value,
            'metadata': {
                'deep_link_id': metadata_vo.deep_link_id,
                'utm_source': metadata_vo.utm_source,
                'utm_medium': metadata_vo.utm_medium,
                'utm_campaign': metadata_vo.utm_campaign,
                'additional_data': metadata_vo.additional_data,
            },
            'external_calendar_event_id': getattr(appointment, '_external_calendar_event_id', None),
            'meeting_url': getattr(appointment, '_meeting_url', None),
            'location_text': getattr(appointment, '_location_text', None),
        }
    
    @staticmethod
    def _payment_to_domain(record: PaymentModel) -> Payment:
        """Преобразовать Payment DB Record → Domain Entity."""
        money = Money(
            amount=record.amount,
            currency=Currency(record.currency)
        )
        
        status = PaymentStatus(record.status)
        
        return Payment(
            id=PaymentId(record.id),
            amount=money,
            status=status,
            provider_id=record.provider_id,
            provider_payment_id=record.provider_payment_id,
            created_at=record.created_at,
            confirmed_at=record.confirmed_at
        )
    
    @staticmethod
    def _intake_form_to_domain(record: IntakeFormModel) -> IntakeForm:
        """Преобразовать IntakeForm DB Record → Domain Entity (расшифровка P2 данных)."""
        from infrastructure.encryption.fernet_encryption import FernetEncryptionService
        encryption_service = FernetEncryptionService()
        
        # Расшифровка payload
        decrypted_payload = encryption_service.decrypt(record.payload_encrypted)
        import json
        answers = json.loads(decrypted_payload)
        
        return IntakeForm(
            id=IntakeFormId(record.id),
            answers=answers,
            submitted_at=record.submitted_at
        )


class ServiceMapper:
    """Mapper для преобразования Service Domain Entity ↔ DB Record."""
    
    @staticmethod
    def to_domain(record: ServiceModel) -> Service:
        """Преобразовать DB Record → Domain Entity."""
        money = Money(
            amount=record.price_amount,
            currency=Currency(record.price_currency)
        )
        
        supported_formats = [
            AppointmentFormat(fmt) for fmt in record.supported_formats
        ]
        
        return Service(
            id=ServiceId(record.id),
            slug=record.slug,
            name=record.name,
            description=record.description,
            price=money,
            duration_minutes=record.duration_minutes,
            supported_formats=supported_formats,
            cancel_free_hours=record.cancel_free_hours,
            cancel_partial_hours=record.cancel_partial_hours,
            reschedule_min_hours=record.reschedule_min_hours
        )
    
    @staticmethod
    def to_persistence(service: Service) -> Dict[str, Any]:
        """Преобразовать Domain Entity → DB Record."""
        return {
            'id': service.id.value,
            'slug': service.slug,
            'name': service.name,
            'description': service.description,
            'supported_formats': [fmt.value for fmt in service.supported_formats],
            'duration_minutes': service.duration_minutes,
            'price_amount': service.price.amount,
            'price_currency': service.price.currency.code,
            'deposit_amount': service.deposit_amount.amount if service.deposit_amount else None,
            'cancel_free_hours': service.cancel_free_hours,
            'cancel_partial_hours': service.cancel_partial_hours,
            'reschedule_min_hours': service.reschedule_min_hours,
        }
