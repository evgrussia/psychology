"""
Interactive Repository Interfaces.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.interactive.aggregates.interactive_run import InteractiveRun, InteractiveRunId
from domain.identity.aggregates.user import UserId


class IInteractiveRunRepository(ABC):
    """Интерфейс репозитория прохождений интерактивов."""
    
    @abstractmethod
    async def find_by_id(self, id: InteractiveRunId) -> Optional[InteractiveRun]:
        """Находит прохождение по ID."""
        pass
    
    @abstractmethod
    async def find_by_user_id(self, user_id: UserId) -> List[InteractiveRun]:
        """Находит все прохождения пользователя."""
        pass
    
    @abstractmethod
    async def save(self, run: InteractiveRun) -> None:
        """Сохраняет прохождение."""
        pass


class IInteractiveDefinitionRepository(ABC):
    """Интерфейс репозитория определений интерактивов."""
    
    @abstractmethod
    async def find_by_slug(self, slug: str) -> Optional[dict]:
        """Находит определение интерактива по slug."""
        pass
