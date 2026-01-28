"""
Django ORM модели для Telegram Domain.
"""
from django.db import models
from uuid import uuid4


class DeepLinkModel(models.Model):
    """Django ORM модель для DeepLink Aggregate Root."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    token = models.CharField(max_length=255, unique=True, db_index=True)
    
    # DeepLinkFlow Value Object → CharField
    flow = models.CharField(
        max_length=50,
        choices=[
            ('quiz', 'Quiz'),
            ('booking', 'Booking'),
            ('content', 'Content'),
            ('diary', 'Diary'),
        ]
    )
    
    # TelegramUser Value Object → JSONField (P0 данные)
    telegram_user_data = models.JSONField(default=dict, blank=True)  # user_id, username (без PII)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    expires_at = models.DateTimeField(db_index=True)
    
    class Meta:
        db_table = 'deep_links'
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['expires_at']),
        ]
