from abc import ABC, abstractmethod
from typing import Optional

class ITelegramService(ABC):
    """Интерфейс адаптера для интеграции с Telegram Bot API."""
    
    @abstractmethod
    async def send_welcome_message(
        self,
        user_id: int,
        deep_link_id: Optional[str] = None
    ) -> None:
        """Отправить приветственное сообщение пользователю."""
        pass
    
    @abstractmethod
    async def send_plan(
        self,
        user_id: int,
        plan_content: str,
        deep_link_id: Optional[str] = None
    ) -> None:
        """Отправить план пользователю."""
        pass
    
    @abstractmethod
    async def send_notification(
        self,
        user_id: int,
        message: str
    ) -> None:
        """Отправить уведомление пользователю."""
        pass
    
    @abstractmethod
    async def send_message(
        self,
        user_id: int,
        text: str
    ) -> None:
        """Отправить сообщение пользователю (алиас для send_notification)."""
        pass
    
    @abstractmethod
    async def answer_callback_query(
        self,
        callback_query_id: str,
        text: str,
        show_alert: bool = False
    ) -> None:
        """Ответить на callback query."""
        pass
