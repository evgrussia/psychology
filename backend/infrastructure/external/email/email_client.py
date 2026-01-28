"""
Клиент для отправки email через SMTP.
"""
import smtplib
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from dataclasses import dataclass
from infrastructure.exceptions import InfrastructureError


@dataclass
class EmailConfig:
    """Конфигурация email сервера."""
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    from_email: str
    from_name: str = "Эмоциональный баланс"
    use_tls: bool = True


class EmailClient:
    """Клиент для отправки email через SMTP."""
    
    def __init__(self, config: EmailConfig):
        self.config = config
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None
    ) -> bool:
        """Отправить email."""
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{self.config.from_name} <{self.config.from_email}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Текстовая версия
        part1 = MIMEText(body_text, 'plain', 'utf-8')
        msg.attach(part1)
        
        # HTML версия (если есть)
        if body_html:
            part2 = MIMEText(body_html, 'html', 'utf-8')
            msg.attach(part2)
        
        try:
            async with aiosmtplib.SMTP(
                hostname=self.config.smtp_host,
                port=self.config.smtp_port
            ) as server:
                if self.config.use_tls:
                    await server.starttls()
                
                await server.login(self.config.smtp_user, self.config.smtp_password)
                await server.send_message(msg)
            
            return True
        except Exception as e:
            raise InfrastructureError(f"Failed to send email: {e}") from e
    
    async def send_bulk_email(
        self,
        to_emails: List[str],
        subject: str,
        body_text: str,
        body_html: Optional[str] = None
    ) -> int:
        """Отправить email нескольким получателям.
        
        Returns:
            Количество успешно отправленных писем
        """
        success_count = 0
        for email in to_emails:
            try:
                await self.send_email(email, subject, body_text, body_html)
                success_count += 1
            except Exception as e:
                # Логируем ошибку, но продолжаем отправку остальным
                # TODO: добавить логирование
                pass
        
        return success_count


class ConsoleEmailClient:
    """Клиент для вывода email в консоль (для разработки)."""
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None
    ) -> bool:
        """Вывести email в лог/консоль."""
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"CONSOLE EMAIL: To={to_email}, Subject={subject}")
        return True
