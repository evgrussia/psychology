"""
Booking repositories.
"""
from .appointment_repository import PostgresAppointmentRepository
from .availability_slot_repository import PostgresAvailabilitySlotRepository

__all__ = [
    'PostgresAppointmentRepository',
    'PostgresAvailabilitySlotRepository',
]
