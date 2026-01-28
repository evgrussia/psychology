"""
Django ORM модели для Interactive Domain.
"""
from django.db import models
from uuid import uuid4


class InteractiveDefinitionModel(models.Model):
    """Django ORM модель для InteractiveDefinition."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    slug = models.SlugField(unique=True, db_index=True)
    
    interactive_type = models.CharField(
        max_length=50,
        choices=[
            ('quiz', 'Quiz'),
            ('navigator', 'Navigator'),
            ('thermometer', 'Thermometer'),
            ('boundaries', 'Boundaries Script'),
            ('prep', 'Prep'),
            ('ritual', 'Ritual'),
        ]
    )
    
    title = models.CharField(max_length=255)
    topic_code = models.CharField(max_length=50, null=True, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=[('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived')],
        default='draft'
    )
    
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'interactive_definitions'
        indexes = [
            models.Index(fields=['interactive_type', 'status']),
            models.Index(fields=['topic_code']),
        ]


class InteractiveRunModel(models.Model):
    """Django ORM модель для InteractiveRun Aggregate Root."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    interactive_definition_id = models.UUIDField(db_index=True)
    
    # User reference (nullable для анонимных прохождений)
    user_id = models.UUIDField(null=True, blank=True, db_index=True)
    anonymous_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # InteractiveResult Value Object → отдельные поля (агрегаты, без сырых ответов)
    result_level = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('moderate', 'Moderate'), ('high', 'High')],
        null=True,
        blank=True
    )
    result_profile = models.CharField(max_length=255, null=True, blank=True)  # для навигатора
    crisis_triggered = models.BooleanField(default=False)
    
    duration_ms = models.IntegerField(null=True, blank=True)
    
    # RunMetadata Value Object → JSONField
    metadata = models.JSONField(default=dict, blank=True)  # entry_point, topic_code, deep_link_id
    
    # RunStatus Value Object → CharField
    status = models.CharField(
        max_length=20,
        choices=[('started', 'Started'), ('completed', 'Completed'), ('abandoned', 'Abandoned')],
        default='started',
        db_index=True
    )
    
    class Meta:
        db_table = 'interactive_runs'
        indexes = [
            models.Index(fields=['user_id', 'status']),
            models.Index(fields=['anonymous_id', 'status']),
            models.Index(fields=['interactive_definition_id', 'started_at']),
        ]
