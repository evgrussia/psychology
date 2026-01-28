"""
AppointmentStatus Value Object.
"""
from domain.shared.value_object import ValueObject


class AppointmentStatus(ValueObject):
    """Value Object для статуса встречи."""
    
    def __init__(self, value: str):
        valid_statuses = [
            'pending_payment',
            'confirmed',
            'canceled',
            'rescheduled',
            'completed',
            'no_show'
        ]
        if value not in valid_statuses:
            raise ValueError(f"Invalid appointment status: {value}")
        self._value = value
    
    def is_pending_payment(self) -> bool:
        return self._value == 'pending_payment'
    
    def is_confirmed(self) -> bool:
        return self._value == 'confirmed'
    
    def is_completed(self) -> bool:
        return self._value == 'completed'
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные статусы
    PENDING_PAYMENT = None
    CONFIRMED = None
    CANCELED = None
    RESCHEDULED = None
    COMPLETED = None
    NO_SHOW = None


AppointmentStatus.PENDING_PAYMENT = AppointmentStatus('pending_payment')
AppointmentStatus.CONFIRMED = AppointmentStatus('confirmed')
AppointmentStatus.CANCELED = AppointmentStatus('canceled')
AppointmentStatus.RESCHEDULED = AppointmentStatus('rescheduled')
AppointmentStatus.COMPLETED = AppointmentStatus('completed')
AppointmentStatus.NO_SHOW = AppointmentStatus('no_show')
