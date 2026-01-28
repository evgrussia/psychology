"""
Identity & Access Repository Interfaces.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber


class IUserRepository(ABC):
    """Интерфейс репозитория пользователей.
    
    Важно: Это интерфейс в Domain Layer.
    Реализация будет в Infrastructure Layer.
    """
    
    @abstractmethod
    async def find_by_id(self, user_id: UserId) -> Optional[User]:
        """Находит пользователя по ID."""
        pass
    
    @abstractmethod
    async def find_by_email(self, email: Email) -> Optional[User]:
        """Находит пользователя по email."""
        pass
    
    @abstractmethod
    async def find_by_phone(self, phone: PhoneNumber) -> Optional[User]:
        """Находит пользователя по телефону."""
        pass
    
    @abstractmethod
    async def find_by_telegram_user_id(
        self,
        telegram_user_id: str
    ) -> Optional[User]:
        """Находит пользователя по Telegram user ID."""
        pass
    
    @abstractmethod
    async def save(self, user: User) -> None:
        """Сохраняет пользователя."""
        pass
    
    @abstractmethod
    async def delete(self, user_id: UserId) -> None:
        """Удаляет пользователя (soft delete)."""
        pass


class IConsentRepository(ABC):
    """Интерфейс репозитория согласий.
    
    Важно: Это интерфейс в Domain Layer.
    Реализация будет в Infrastructure Layer.
    """
    
    @abstractmethod
    def get_user_consent(self, user_id, consent_type: str):
        """Получить статус согласия пользователя."""
        pass
    
    @abstractmethod
    def grant_consent(self, user_id, consent_type: str, version: str, source: str) -> None:
        """Предоставить согласие."""
        pass
    
    @abstractmethod
    def revoke_consent(self, user_id, consent_type: str) -> None:
        """Отозвать согласие."""
        pass
