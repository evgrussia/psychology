"""
Сервис для отправки email уведомлений.
"""
from typing import Dict, Any
from application.interfaces.email_service import IEmailService
from infrastructure.external.email.email_client import EmailClient
from infrastructure.exceptions import InfrastructureError


class EmailService(IEmailService):
    """Сервис для отправки email уведомлений."""
    
    def __init__(self, client: EmailClient):
        self._client = client
    
    async def send_appointment_confirmation(
        self,
        to_email: str,
        appointment_details: Dict[str, Any]
    ) -> None:
        """Отправить подтверждение записи."""
        subject = "Подтверждение записи на консультацию"
        
        body_text = f"""
Здравствуйте!

Ваша запись на консультацию подтверждена.

Дата и время: {appointment_details.get('start_at', 'N/A')}
Формат: {appointment_details.get('format', 'N/A')}
        
С уважением,
Команда "Эмоциональный баланс"
        """
        
        body_html = f"""
        <html>
        <body>
        <p>Здравствуйте!</p>
        <p>Ваша запись на консультацию подтверждена.</p>
        <ul>
        <li>Дата и время: {appointment_details.get('start_at', 'N/A')}</li>
        <li>Формат: {appointment_details.get('format', 'N/A')}</li>
        </ul>
        <p>С уважением,<br>Команда "Эмоциональный баланс"</p>
        </body>
        </html>
        """
        
        try:
            await self._client.send_email(
                to_email=to_email,
                subject=subject,
                body_text=body_text,
                body_html=body_html
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to send appointment confirmation: {e}") from e
    
    async def send_appointment_reminder(
        self,
        to_email: str,
        appointment_details: Dict[str, Any]
    ) -> None:
        """Отправить напоминание о предстоящей записи."""
        subject = "Напоминание о предстоящей консультации"
        
        body_text = f"""
Здравствуйте!

Напоминаем, что у вас запланирована консультация:

Дата и время: {appointment_details.get('start_at', 'N/A')}
Формат: {appointment_details.get('format', 'N/A')}
        
С уважением,
Команда "Эмоциональный баланс"
        """
        
        try:
            await self._client.send_email(
                to_email=to_email,
                subject=subject,
                body_text=body_text
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to send appointment reminder: {e}") from e
    
    async def send_cancellation_notification(
        self,
        to_email: str,
        appointment_details: Dict[str, Any]
    ) -> None:
        """Отправить уведомление об отмене записи."""
        subject = "Отмена записи на консультацию"
        
        body_text = f"""
Здравствуйте!

Ваша запись на консультацию была отменена.

Дата и время: {appointment_details.get('start_at', 'N/A')}
        
Если у вас возникли вопросы, пожалуйста, свяжитесь с нами.
        
С уважением,
Команда "Эмоциональный баланс"
        """
        
        try:
            await self._client.send_email(
                to_email=to_email,
                subject=subject,
                body_text=body_text
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to send cancellation notification: {e}") from e
    
    async def send_reschedule_notification(
        self,
        to_email: str,
        appointment_details: Dict[str, Any]
    ) -> None:
        """Отправить уведомление о переносе записи."""
        subject = "Перенос записи на консультацию"
        
        body_text = f"""
Здравствуйте!

Ваша запись на консультацию была перенесена.

Новая дата и время: {appointment_details.get('new_start_at', 'N/A')}
        
Если у вас возникли вопросы, пожалуйста, свяжитесь с нами.
        
С уважением,
Команда "Эмоциональный баланс"
        """
        
        body_html = f"""
        <html>
        <body>
        <p>Здравствуйте!</p>
        <p>Ваша запись на консультацию была перенесена.</p>
        <ul>
        <li>Новая дата и время: {appointment_details.get('new_start_at', 'N/A')}</li>
        </ul>
        <p>Если у вас возникли вопросы, пожалуйста, свяжитесь с нами.</p>
        <p>С уважением,<br>Команда "Эмоциональный баланс"</p>
        </body>
        </html>
        """
        
        try:
            await self._client.send_email(
                to_email=to_email,
                subject=subject,
                body_text=body_text,
                body_html=body_html
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to send reschedule notification: {e}") from e
    
    async def send_admin_notification(
        self,
        to_email: str,
        subject: str,
        message: str
    ) -> None:
        """Отправить уведомление администратору."""
        body_text = f"""
{message}

---
Это автоматическое уведомление от системы "Эмоциональный баланс".
        """
        
        try:
            await self._client.send_email(
                to_email=to_email,
                subject=subject,
                body_text=body_text
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to send admin notification: {e}") from e
