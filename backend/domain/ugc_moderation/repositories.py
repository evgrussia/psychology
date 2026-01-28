"""
UGC Moderation Repository Interfaces.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.ugc_moderation.aggregates.moderation_item import ModerationItem, ModerationItemId
from domain.ugc_moderation.value_objects.moderation_status import ModerationStatus


class IModerationItemRepository(ABC):
    """Интерфейс репозитория элементов модерации."""
    
    @abstractmethod
    async def find_by_id(self, id: ModerationItemId) -> Optional[ModerationItem]:
        """Находит элемент по ID."""
        pass
    
    @abstractmethod
    async def find_by_status(self, status: ModerationStatus) -> List[ModerationItem]:
        """Находит элементы по статусу."""
        pass
    
    @abstractmethod
    async def save(self, item: ModerationItem) -> None:
        """Сохраняет элемент."""
        pass
