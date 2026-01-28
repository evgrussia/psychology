"""
Mock адаптер для Google Calendar (для тестов).
"""
from typing import Optional
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.domain_services import IGoogleCalendarService


class MockGoogleCalendarAdapter(IGoogleCalendarService):
    """Mock адаптер для Google Calendar - всегда возвращает True для тестов."""
    
    async def is_time_slot_free(self, slot: TimeSlot) -> bool:
        """Всегда возвращает True в тестах."""
        return True
    
    async def create_appointment_event(
        self,
        appointment_id: str,
        slot: TimeSlot,
        summary: str,
        description: Optional[str] = None,
        attendee_email: Optional[str] = None
    ) -> str:
        """Возвращает mock event_id."""
        return f"mock_event_{appointment_id}"
    
    async def delete_appointment_event(self, event_id: str) -> None:
        """Ничего не делает в тестах."""
        pass
