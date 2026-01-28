"""
Content Repository Interfaces.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.content.aggregates.content_item import ContentItem, ContentItemId
from domain.content.value_objects.content_type import ContentType


class IContentItemRepository(ABC):
    """Интерфейс репозитория контента."""
    
    @abstractmethod
    async def find_by_id(self, id: ContentItemId) -> Optional[ContentItem]:
        """Находит контент по ID."""
        pass
    
    @abstractmethod
    async def find_by_slug(self, slug: str, content_type: ContentType) -> Optional[ContentItem]:
        """Находит контент по slug и типу."""
        pass
    
    @abstractmethod
    async def save(self, content: ContentItem) -> None:
        """Сохраняет контент."""
        pass
    
    @abstractmethod
    async def find_published(
        self,
        content_type: ContentType,
        page: int = 1,
        per_page: int = 20
    ) -> List[ContentItem]:
        """Находит опубликованный контент с пагинацией."""
        pass
    
    @abstractmethod
    async def count_published(self, content_type: ContentType) -> int:
        """Подсчитывает количество опубликованного контента."""
        pass
    
    @abstractmethod
    async def find_related_resources(
        self,
        content_item: ContentItem,
        limit: int = 5
    ) -> List[ContentItem]:
        """Находит связанные ресурсы для контента."""
        pass


class IBoundaryScriptRepository(ABC):
    """Интерфейс репозитория скриптов границ."""
    
    @abstractmethod
    async def find_scripts(
        self,
        scenario: str,
        style: str,
        goal: str,
        status: str = 'published'
    ) -> List[dict]:
        """Находит скрипты по параметрам."""
        pass
