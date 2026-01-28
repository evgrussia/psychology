"""
HTTP клиент для работы с Telegram Bot API.
"""
import httpx
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from infrastructure.exceptions import InfrastructureError


@dataclass
class TelegramConfig:
    """Конфигурация Telegram Bot."""
    bot_token: str
    api_url: str = "https://api.telegram.org/bot"


class TelegramBotClient:
    """HTTP клиент для работы с Telegram Bot API."""
    
    def __init__(self, config: TelegramConfig):
        self.config = config
        self._base_url = f"{config.api_url}{config.bot_token}"
        self._client = httpx.AsyncClient(timeout=30.0)
    
    async def send_message(
        self,
        chat_id: int,
        text: str,
        reply_markup: Optional[Dict[str, Any]] = None,
        parse_mode: str = "Markdown"
    ) -> Dict[str, Any]:
        """Отправить сообщение в чат."""
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode
        }
        
        if reply_markup:
            payload["reply_markup"] = reply_markup
        
        try:
            response = await self._client.post(
                f"{self._base_url}/sendMessage",
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise InfrastructureError(f"Failed to send Telegram message: {e}") from e
    
    async def send_photo(
        self,
        chat_id: int,
        photo: str,  # file_id или URL
        caption: Optional[str] = None
    ) -> Dict[str, Any]:
        """Отправить фото в чат."""
        payload = {
            "chat_id": chat_id,
            "photo": photo
        }
        
        if caption:
            payload["caption"] = caption
        
        try:
            response = await self._client.post(
                f"{self._base_url}/sendPhoto",
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise InfrastructureError(f"Failed to send Telegram photo: {e}") from e
    
    async def set_webhook(self, url: str, secret_token: Optional[str] = None) -> bool:
        """Установить webhook для получения обновлений."""
        payload = {"url": url}
        
        if secret_token:
            payload["secret_token"] = secret_token
        
        try:
            response = await self._client.post(
                f"{self._base_url}/setWebhook",
                json=payload
            )
            response.raise_for_status()
            return True
        except Exception as e:
            raise InfrastructureError(f"Failed to set Telegram webhook: {e}") from e
    
    async def get_webhook_info(self) -> Dict[str, Any]:
        """Получить информацию о webhook."""
        try:
            response = await self._client.get(f"{self._base_url}/getWebhookInfo")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise InfrastructureError(f"Failed to get Telegram webhook info: {e}") from e
    
    async def get_me(self) -> Dict[str, Any]:
        """Получить информацию о боте."""
        try:
            response = await self._client.get(f"{self._base_url}/getMe")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise InfrastructureError(f"Failed to get bot info: {e}") from e
    
    async def answer_callback_query(
        self,
        callback_query_id: str,
        text: str,
        show_alert: bool = False
    ) -> Dict[str, Any]:
        """Ответить на callback query."""
        payload = {
            "callback_query_id": callback_query_id,
            "text": text,
            "show_alert": show_alert
        }
        
        try:
            response = await self._client.post(
                f"{self._base_url}/answerCallbackQuery",
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise InfrastructureError(f"Failed to answer callback query: {e}") from e
    
    async def close(self):
        """Закрыть HTTP клиент."""
        await self._client.aclose()


class MockTelegramBotClient:
    """Mock клиент для Telegram Bot API (для разработки)."""
    
    async def send_message(
        self,
        chat_id: int,
        text: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Симуляция отправки сообщения."""
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"MOCK TELEGRAM: Chat={chat_id}, Text={text}")
        return {"ok": True, "result": {"message_id": 123}}
    
    async def answer_callback_query(
        self,
        callback_query_id: str,
        text: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Симуляция ответа на callback query."""
        return {"ok": True}
