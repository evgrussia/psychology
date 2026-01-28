"""
Django ORM модели для Client Cabinet Domain.
"""
from django.db import models
from uuid import uuid4


class DiaryEntryModel(models.Model):
    """Django ORM модель для DiaryEntry Aggregate Root (P2 данные, шифрованные)."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    
    # DiaryType Value Object → CharField
    diary_type = models.CharField(
        max_length=50,
        choices=[
            ('mood', 'Mood'),
            ('thoughts', 'Thoughts'),
            ('gratitude', 'Gratitude'),
            ('reflection', 'Reflection'),
            ('emotions', 'Emotions'),
            ('abc', 'ABC'),
        ]
    )
    
    # P2 данные: храним шифрованными
    content_encrypted = models.TextField()  # Fernet-encrypted content
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)  # soft delete
    
    class Meta:
        db_table = 'diary_entries'
        indexes = [
            models.Index(fields=['user_id', 'created_at']),
            models.Index(fields=['diary_type']),
        ]


class FavoriteModel(models.Model):
    """Django ORM модель для Favorite (избранное / аптечка)."""

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    resource_type = models.CharField(
        max_length=50,
        choices=[
            ('article', 'Article'),
            ('resource', 'Resource'),
            ('ritual', 'Ritual'),
        ]
    )
    resource_id = models.CharField(max_length=255, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'favorites'
        constraints = [
            models.UniqueConstraint(
                fields=['user_id', 'resource_type', 'resource_id'],
                name='unique_user_resource_favorite',
            )
        ]
        indexes = [
            models.Index(fields=['user_id', 'created_at']),
        ]
        ordering = ['-created_at']


class DataExportRequestModel(models.Model):
    """Django ORM модель для DataExportRequest."""

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending',
        db_index=True
    )
    
    export_format = models.CharField(
        max_length=20,
        choices=[('json', 'JSON'), ('csv', 'CSV'), ('pdf', 'PDF')],
        default='json'
    )
    
    file_url = models.URLField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'data_export_requests'
        indexes = [
            models.Index(fields=['user_id', 'status']),
        ]
