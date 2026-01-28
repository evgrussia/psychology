"""
Django ORM модели для UGC Moderation Domain.
"""
from django.db import models
from uuid import uuid4


class ModerationItemModel(models.Model):
    """Django ORM модель для ModerationItem Aggregate Root."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    
    # UGCContentType Value Object → CharField
    content_type = models.CharField(
        max_length=50,
        choices=[
            ('question', 'Question'),
            ('review', 'Review'),
            ('comment', 'Comment'),
        ]
    )
    
    # P2 данные: храним шифрованными
    content_encrypted = models.TextField()  # Fernet-encrypted content
    
    author_id = models.UUIDField(null=True, blank=True, db_index=True)
    
    # ModerationStatus Value Object → CharField
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('flagged', 'Flagged'),
        ],
        default='pending',
        db_index=True
    )
    
    # TriggerFlag Value Objects → JSONField (для совместимости с SQLite в тестах)
    trigger_flags = models.JSONField(default=list, blank=True)
    
    # ModerationAction entities → JSONField
    actions = models.JSONField(default=list, blank=True)  # список действий модерации
    
    # Answer entity → JSONField (если есть)
    answer_data = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'moderation_items'
        indexes = [
            models.Index(fields=['content_type', 'status']),
            models.Index(fields=['author_id', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
