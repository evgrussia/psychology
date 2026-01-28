"""
Telegram Repository Interfaces.
"""
from abc import ABC, abstractmethod
from typing import Optional
from domain.telegram.aggregates.deep_link import DeepLink, DeepLinkId


class IDeepLinkRepository(ABC):
    """Интерфейс репозитория deep links."""
    
    @abstractmethod
    async def find_by_id(self, id: DeepLinkId) -> Optional[DeepLink]:
        """Находит deep link по ID."""
        pass
    
    @abstractmethod
    async def find_by_token(self, token: str) -> Optional[DeepLink]:
        """Находит deep link по токену."""
        pass
    
    @abstractmethod
    async def save(self, link: DeepLink) -> None:
        """Сохраняет deep link."""
        pass
