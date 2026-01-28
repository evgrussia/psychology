"""
Booking Aggregates.
"""
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.aggregates.waitlist_request import WaitlistRequest, WaitlistRequestId

__all__ = [
    'Appointment',
    'AppointmentId',
    'Service',
    'ServiceId',
    'WaitlistRequest',
    'WaitlistRequestId',
]
