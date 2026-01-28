"""
Email Integration.
"""
from infrastructure.external.email.email_client import EmailClient, EmailConfig
from infrastructure.external.email.email_service import EmailService

__all__ = [
    'EmailClient',
    'EmailConfig',
    'EmailService',
]
