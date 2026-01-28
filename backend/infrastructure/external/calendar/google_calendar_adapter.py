"""
Адаптер для интеграции с Google Calendar (Anti-Corruption Layer).
"""
from typing import Optional
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.domain_services import IGoogleCalendarService
from infrastructure.external.calendar.google_calendar_client import GoogleCalendarClient
from infrastructure.exceptions import InfrastructureError


class GoogleCalendarAdapter(IGoogleCalendarService):
    """Адаптер для интеграции с Google Calendar (Anti-Corruption Layer)."""
    
    def __init__(self, client: GoogleCalendarClient):
        self._client = client
    
    async def is_time_slot_free(self, slot: TimeSlot) -> bool:
        """Проверить, свободен ли слот в Google Calendar."""
        try:
            return await self._client.is_time_slot_free(
                start=slot.start_at,
                end=slot.end_at,
                timezone=slot.timezone.value  # Используем IANA timezone из TimeSlot
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to check slot availability: {e}") from e
    
    async def create_appointment_event(
        self,
        appointment_id: str,
        slot: TimeSlot,
        summary: str,
        description: Optional[str] = None,
        attendee_email: Optional[str] = None
    ) -> str:
        """Создать событие в календаре для Appointment.
        
        Returns:
            event_id: ID созданного события в Google Calendar
        """
        try:
            event = await self._client.create_event(
                summary=summary,
                start=slot.start_at,
                end=slot.end_at,
                timezone=slot.timezone.value,
                description=description,
                attendees=[attendee_email] if attendee_email else None
            )
            
            return event['id']
        except Exception as e:
            raise InfrastructureError(f"Failed to create calendar event: {e}") from e
    
    async def delete_appointment_event(self, event_id: str) -> None:
        """Удалить событие из календаря."""
        try:
            await self._client.delete_event(event_id)
        except Exception as e:
            raise InfrastructureError(f"Failed to delete calendar event: {e}") from e
