from abc import ABC, abstractmethod
from typing import Dict, Any

class IEmailService(ABC):
    """Интерфейс сервиса для отправки email уведомлений."""
    
    @abstractmethod
    async def send_appointment_confirmation(
        self,
        to_email: str,
        appointment_details: Dict[str, Any]
    ) -> None:
        """Отправить подтверждение записи."""
        pass
    
    @abstractmethod
    async def send_appointment_reminder(
        self,
        to_email: str,
        appointment_details: Dict[str, Any]
    ) -> None:
        """Отправить напоминание о предстоящей записи."""
        pass
    
    @abstractmethod
    async def send_cancellation_notification(
        self,
        to_email: str,
        appointment_details: Dict[str, Any]
    ) -> None:
        """Отправить уведомление об отмене записи."""
        pass
    
    @abstractmethod
    async def send_reschedule_notification(
        self,
        to_email: str,
        appointment_details: Dict[str, Any]
    ) -> None:
        """Отправить уведомление о переносе записи."""
        pass
    
    @abstractmethod
    async def send_admin_notification(
        self,
        to_email: str,
        subject: str,
        message: str
    ) -> None:
        """Отправить уведомление администратору."""
        pass
