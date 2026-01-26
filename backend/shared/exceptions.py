"""
Общие исключения приложения.
"""
from domain.shared.exceptions import DomainException


class BookingSlotUnavailableError(DomainException):
    """Слот для бронирования недоступен."""
    user_message = "К сожалению, это время уже занято. Давайте подберём другой слот."


class PaymentFailedError(DomainException):
    """Оплата не прошла."""
    user_message = "Оплата не прошла. Это бывает — попробуйте ещё раз или выберите другой способ."
