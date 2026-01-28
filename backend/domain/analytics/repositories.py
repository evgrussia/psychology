"""
Analytics Repository Interfaces.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.analytics.aggregates.lead import Lead, LeadId
from domain.analytics.value_objects.lead_status import LeadStatus


class ILeadRepository(ABC):
    """Интерфейс репозитория лидов."""
    
    @abstractmethod
    async def find_by_id(self, id: LeadId) -> Optional[Lead]:
        """Находит лид по ID."""
        pass
    
    @abstractmethod
    async def find_by_deep_link_id(self, deep_link_id: str) -> Optional[Lead]:
        """Находит лид по deep_link_id из timeline events."""
        pass
    
    @abstractmethod
    async def find_by_status(self, status: LeadStatus) -> List[Lead]:
        """Находит лиды по статусу."""
        pass
    
    @abstractmethod
    async def save(self, lead: Lead) -> None:
        """Сохраняет лид."""
        pass
