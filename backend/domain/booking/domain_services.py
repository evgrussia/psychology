"""
Booking Domain Services.
"""
from abc import ABC, abstractmethod
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.repositories import IAppointmentRepository
from domain.shared.exceptions import ConflictError


class IGoogleCalendarService(ABC):
    """Интерфейс для интеграции с Google Calendar."""
    
    @abstractmethod
    async def is_time_slot_free(self, slot: TimeSlot) -> bool:
        """Проверяет, свободен ли слот в календаре."""
        pass


class SlotAvailabilityService:
    """Domain Service для проверки доступности слотов.
    
    Координирует проверку доступности между:
    - Google Calendar (внешний источник)
    - БД (существующие встречи)
    """
    
    def __init__(
        self,
        appointment_repository: IAppointmentRepository,
        google_calendar_service: IGoogleCalendarService
    ):
        self._appointment_repository = appointment_repository
        self._google_calendar_service = google_calendar_service
    
    async def is_slot_available(
        self,
        slot: TimeSlot,
        service_id: "ServiceId"
    ) -> bool:
        """Проверяет доступность слота.
        
        Args:
            slot: Временной слот
            service_id: ID услуги
        
        Returns:
            True если слот доступен, иначе False
        """
        # 1. Проверка в Google Calendar
        is_calendar_free = await self._google_calendar_service.is_time_slot_free(slot)
        if not is_calendar_free:
            return False
        
        # 2. Проверка конфликтов в БД
        conflicting = await self._appointment_repository.find_conflicting_appointments(slot)
        
        return len(conflicting) == 0
    
    async def reserve_slot(
        self,
        slot: TimeSlot,
        appointment: Appointment
    ) -> bool:
        """Резервирует слот с проверкой конфликтов.
        
        Args:
            slot: Временной слот
            appointment: Встреча для резервирования
        
        Returns:
            True если резервирование успешно, иначе False
        """
        try:
            await self._appointment_repository.save_with_conflict_check(appointment)
            return True
        except ConflictError:
            return False
