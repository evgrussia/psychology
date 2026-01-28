"""
Client Cabinet Repository Interfaces.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.client_cabinet.aggregates.diary_entry import DiaryEntry, DiaryEntryId
from domain.client_cabinet.aggregates.favorite import Favorite, FavoriteId
from domain.identity.aggregates.user import UserId
from domain.client_cabinet.value_objects.export_type import ExportType


class IDiaryEntryRepository(ABC):
    """Интерфейс репозитория записей дневника."""
    
    @abstractmethod
    async def find_by_id(self, id: DiaryEntryId) -> Optional[DiaryEntry]:
        """Находит запись по ID."""
        pass
    
    @abstractmethod
    async def find_by_user_id(self, user_id: UserId) -> List[DiaryEntry]:
        """Находит все записи пользователя."""
        pass
    
    @abstractmethod
    async def save(self, entry: DiaryEntry) -> None:
        """Сохраняет запись."""
        pass
    
    @abstractmethod
    async def delete(self, entry_id: DiaryEntryId) -> None:
        """Удаляет запись."""
        pass


class IFavoriteRepository(ABC):
    """Интерфейс репозитория избранного (аптечка)."""

    @abstractmethod
    async def find_by_id(self, id: FavoriteId) -> Optional[Favorite]:
        """Находит запись избранного по ID."""
        pass

    @abstractmethod
    async def find_by_user_and_resource(
        self,
        user_id: UserId,
        resource_type: str,
        resource_id: str,
    ) -> Optional[Favorite]:
        """Находит запись по пользователю и ресурсу (для проверки дубликата)."""
        pass

    @abstractmethod
    async def list_by_user(self, user_id: UserId) -> List[Favorite]:
        """Список избранного пользователя, по убыванию created_at."""
        pass

    @abstractmethod
    async def add(self, favorite: Favorite) -> None:
        """Добавляет запись избранного (или идемпотентно при дубликате)."""
        pass

    @abstractmethod
    async def remove(self, favorite_id: FavoriteId, user_id: UserId) -> bool:
        """Удаляет запись избранного. Возвращает True если удалено."""
        pass


class IDataExportRepository(ABC):
    """Интерфейс репозитория экспорта данных."""

    @abstractmethod
    async def create_export_request(
        self,
        user_id: UserId,
        export_type: ExportType
    ) -> str:
        """Создает запрос на экспорт данных (возвращает task_id)."""
        pass
