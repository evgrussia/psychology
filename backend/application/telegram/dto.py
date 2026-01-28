"""
DTOs для Telegram Integration Domain Use Cases.
"""
from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class TelegramWebhookDto:
    """DTO для webhook от Telegram Bot API."""
    update: Dict[str, Any]


@dataclass
class SendTelegramPlanDto:
    """DTO для отправки плана на 7 дней в Telegram."""
    telegram_user_id: str
    topic_code: str
    deep_link_id: Optional[str] = None
