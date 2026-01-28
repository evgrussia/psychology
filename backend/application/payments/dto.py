"""
DTOs для Payments Domain Use Cases.
"""
from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class CreatePaymentIntentDto:
    """DTO для создания намерения оплаты."""
    appointment_id: str
    amount: float  # RUB
    deposit_amount: Optional[float] = None  # RUB, если депозит


@dataclass
class PaymentIntentResponseDto:
    """DTO для ответа на создание намерения оплаты."""
    payment_id: str
    payment_url: str  # URL для редиректа на оплату
    amount: float
    status: str  # 'intent' | 'pending'


@dataclass
class PaymentWebhookDto:
    """DTO для webhook от ЮKassa."""
    provider_payment_id: str
    event: str  # 'payment.succeeded' | 'payment.canceled' | 'payment.waiting_for_capture'
    amount: Dict[str, Any]  # value, currency
    metadata: Optional[Dict[str, Any]] = None
