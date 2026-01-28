"""
Адаптер для интеграции с Telegram Bot API.
"""
from typing import Optional
from application.interfaces.telegram_service import ITelegramService
from infrastructure.external.telegram.telegram_bot_client import TelegramBotClient
from infrastructure.exceptions import InfrastructureError


class TelegramAdapter(ITelegramService):
    """Адаптер для интеграции с Telegram Bot API."""
    
    def __init__(self, client: TelegramBotClient):
        self._client = client
    
    async def send_welcome_message(
        self,
        user_id: int,
        deep_link_id: Optional[str] = None
    ) -> None:
        """Отправить приветственное сообщение пользователю."""
        text = "Добро пожаловать! 👋\n\nЯ помогу вам..."
        
        if deep_link_id:
            text += f"\n\nВаша ссылка: {deep_link_id}"
        
        try:
            await self._client.send_message(chat_id=user_id, text=text)
        except Exception as e:
            raise InfrastructureError(f"Failed to send Telegram message: {e}") from e
    
    async def send_plan(
        self,
        user_id: int,
        plan_content: str,
        deep_link_id: Optional[str] = None
    ) -> None:
        """Отправить план пользователю."""
        try:
            await self._client.send_message(
                chat_id=user_id,
                text=plan_content,
                parse_mode="Markdown"
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to send plan: {e}") from e
    
    async def send_notification(
        self,
        user_id: int,
        message: str
    ) -> None:
        """Отправить уведомление пользователю."""
        try:
            await self._client.send_message(
                chat_id=user_id,
                text=message
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to send notification: {e}") from e
    
    async def send_message(
        self,
        user_id: int,
        text: str
    ) -> None:
        """Отправить сообщение пользователю (алиас для send_notification)."""
        await self.send_notification(user_id, text)
    
    async def answer_callback_query(
        self,
        callback_query_id: str,
        text: str,
        show_alert: bool = False
    ) -> None:
        """Ответить на callback query."""
        try:
            await self._client.answer_callback_query(
                callback_query_id=callback_query_id,
                text=text,
                show_alert=show_alert
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to answer callback query: {e}") from e
