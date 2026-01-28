"""
DTOs для Booking Domain Use Cases.
"""
from dataclasses import dataclass
from typing import Optional, Dict, Any
from uuid import UUID


@dataclass
class BookAppointmentDto:
    """DTO для создания записи на консультацию."""
    service_id: str  # UUID услуги
    timezone: str  # IANA timezone (например, "Europe/Moscow")
    format: str  # 'online' | 'offline'
    slot_id: Optional[str] = None  # UUID слота (опционально)
    start_at: Optional[str] = None  # ISO8601, если slotId не указан
    end_at: Optional[str] = None  # ISO8601, если slotId не указан
    user_id: Optional[str] = None  # UUID пользователя (null для гостя)
    anonymous_id: Optional[str] = None  # Анонимный ID (если userId = null)
    intake_form: Optional[Dict[str, Any]] = None  # Опциональная анкета
    consents: Optional[Dict[str, bool]] = None  # Согласия
    metadata: Optional[Dict[str, Any]] = None  # Метаданные для аналитики


@dataclass
class AppointmentResponseDto:
    """DTO для ответа с информацией о записи."""
    id: str
    service: Dict[str, Any]
    slot: Dict[str, Any]
    status: str
    format: str
    created_at: str  # ISO8601
    payment: Optional[Dict[str, Any]] = None


@dataclass
class ConfirmPaymentDto:
    """DTO для подтверждения оплаты."""
    appointment_id: str  # UUID записи
    payment_data: Dict[str, Any]  # Данные от webhook ЮKassa


@dataclass
class ConfirmPaymentResponseDto:
    """DTO для ответа на подтверждение оплаты."""
    appointment_id: str
    status: str
    payment: Dict[str, Any]


@dataclass
class CancelAppointmentDto:
    """DTO для отмены записи."""
    appointment_id: str
    user_id: str  # Для проверки прав
    reason: str  # 'client_request' | 'provider_request' | 'other'
    reason_details: Optional[str] = None


@dataclass
class CancelAppointmentResponseDto:
    """DTO для ответа на отмену записи."""
    appointment_id: str
    status: str
    refund_status: str  # 'full' | 'partial' | 'none'
    refund_amount: Optional[float] = None  # RUB, null если возврат не предусмотрен


@dataclass
class RescheduleAppointmentDto:
    """DTO для переноса записи."""
    appointment_id: str
    user_id: str
    new_slot_id: Optional[str] = None
    new_start_at: Optional[str] = None
    new_end_at: Optional[str] = None
    timezone: Optional[str] = None


@dataclass
class RecordAppointmentOutcomeDto:
    """DTO для отметки исхода встречи."""
    appointment_id: str
    outcome: str  # 'attended' | 'no_show' | 'canceled_by_client' | 'canceled_by_provider' | 'rescheduled'
    notes: Optional[str] = None


@dataclass
class GetAvailableSlotsDto:
    """DTO для получения доступных слотов."""
    service_id: str
    date_from: str  # ISO8601
    date_to: str  # ISO8601
    timezone: str  # IANA timezone


@dataclass
class AvailableSlotDto:
    """DTO для доступного слота."""
    id: str
    start_at: str  # ISO8601 в UTC
    end_at: str  # ISO8601 в UTC
    status: str  # 'available' | 'reserved' | 'blocked'
    local_start_at: str  # ISO8601 в таймзоне пользователя
    local_end_at: str  # ISO8601 в таймзоне пользователя


@dataclass
class SubmitWaitlistRequestDto:
    """DTO для создания запроса в лист ожидания."""
    service_id: str
    contact_info: Dict[str, str]  # preferredMethod, value
    preferred_time_window: Optional[str] = None
    user_id: Optional[str] = None
    consents: Optional[Dict[str, bool]] = None
