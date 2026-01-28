"""
Booking Repository Interfaces.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.value_objects.time_slot import TimeSlot
from domain.identity.aggregates.user import UserId
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from domain.booking.entities.availability_slot import AvailabilitySlot, AvailabilitySlotId
    from domain.booking.aggregates.waitlist_request import WaitlistRequest, WaitlistRequestId


class IAppointmentRepository(ABC):
    """Интерфейс репозитория встреч."""
    
    @abstractmethod
    async def find_by_id(self, id: AppointmentId) -> Optional[Appointment]:
        """Находит встречу по ID."""
        pass
    
    @abstractmethod
    async def find_by_client_id(self, client_id: UserId) -> List[Appointment]:
        """Находит все встречи клиента."""
        pass
    
    @abstractmethod
    async def find_conflicting_appointments(
        self,
        slot: TimeSlot
    ) -> List[Appointment]:
        """Находит встречи, конфликтующие со слотом."""
        pass
    
    @abstractmethod
    async def find_upcoming_appointments(
        self,
        from_date: datetime,
        to_date: datetime
    ) -> List[Appointment]:
        """Находит предстоящие встречи в диапазоне."""
        pass
    
    @abstractmethod
    async def save(self, appointment: Appointment) -> None:
        """Сохраняет встречу."""
        pass
    
    @abstractmethod
    async def save_with_conflict_check(
        self,
        appointment: Appointment
    ) -> None:
        """Сохраняет встречу с проверкой конфликтов (atomic)."""
        pass


class IServiceRepository(ABC):
    """Интерфейс репозитория услуг."""
    
    @abstractmethod
    async def find_by_id(self, id: ServiceId) -> Optional[Service]:
        """Находит услугу по ID."""
        pass
    
    @abstractmethod
    async def find_by_slug(self, slug: str) -> Optional[Service]:
        """Находит услугу по slug."""
        pass
    
    @abstractmethod
    async def find_all(self) -> List[Service]:
        """Находит все услуги."""
        pass


class IAvailabilitySlotRepository(ABC):
    """Интерфейс репозитория слотов доступности."""
    
    @abstractmethod
    async def find_by_id(self, slot_id: "AvailabilitySlotId") -> Optional["AvailabilitySlot"]:
        """Находит слот по ID."""
        pass
    
    @abstractmethod
    async def find_available_slots(
        self,
        service_id: ServiceId,
        date_from: datetime,
        date_to: datetime
    ) -> List["AvailabilitySlot"]:
        """Находит доступные слоты для услуги в диапазоне дат."""
        pass
    
    @abstractmethod
    async def find_all_slots(
        self,
        service_id: Optional[ServiceId] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        status: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List["AvailabilitySlot"]:
        """Находит все слоты с фильтрацией (для админки)."""
        pass
    
    @abstractmethod
    async def save(self, slot: "AvailabilitySlot") -> None:
        """Сохраняет слот доступности."""
        pass


class IWaitlistRequestRepository(ABC):
    """Интерфейс репозитория запросов в лист ожидания."""
    
    @abstractmethod
    async def find_by_id(self, id: "WaitlistRequestId") -> Optional["WaitlistRequest"]:
        """Находит запрос по ID."""
        pass
    
    @abstractmethod
    async def save(self, waitlist_request: "WaitlistRequest") -> None:
        """Сохраняет запрос в лист ожидания."""
        pass
