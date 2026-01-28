"""
Django ORM модели для Content Domain.
"""
from django.db import models
from uuid import uuid4


class ContentItemModel(models.Model):
    """Django ORM модель для ContentItem Aggregate Root."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    slug = models.SlugField(unique=True, db_index=True)
    
    title = models.CharField(max_length=255)
    content_type = models.CharField(
        max_length=50,
        choices=[
            ('article', 'Article'),
            ('video', 'Video'),
            ('audio', 'Audio'),
            ('exercise', 'Exercise'),
            ('tool', 'Tool'),
        ]
    )
    
    # ContentStatus Value Object → CharField
    status = models.CharField(
        max_length=20,
        choices=[('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived')],
        default='draft',
        db_index=True
    )
    
    # Topics и Tags → JSONField (для совместимости с SQLite в тестах)
    topics = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    # TimeToBenefit Value Object → CharField
    time_to_benefit = models.CharField(
        max_length=20,
        choices=[
            ('immediate', 'Immediate'),
            ('short_term', 'Short Term'),
            ('medium_term', 'Medium Term'),
            ('long_term', 'Long Term'),
        ],
        null=True,
        blank=True
    )
    
    # Краткое описание (для статей), категория (например anxiety, burnout)
    excerpt = models.CharField(max_length=500, blank=True, default='')
    category = models.CharField(max_length=50, blank=True, default='')
    
    # Content body (markdown или JSON)
    content_body = models.TextField()
    
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'content_items'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['content_type', 'status']),
            models.Index(fields=['status', 'published_at']),
        ]


class BoundaryScriptModel(models.Model):
    """Django ORM модель для скриптов границ."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    
    # Параметры скрипта
    scenario = models.CharField(
        max_length=50,
        choices=[
            ('work', 'Work'),
            ('family', 'Family'),
            ('partner', 'Partner'),
            ('friends', 'Friends'),
        ],
        db_index=True
    )
    
    style = models.CharField(
        max_length=20,
        choices=[
            ('soft', 'Soft'),
            ('brief', 'Brief'),
            ('firm', 'Firm'),
        ],
        db_index=True
    )
    
    goal = models.CharField(
        max_length=20,
        choices=[
            ('refuse', 'Refuse'),
            ('ask', 'Ask'),
            ('set_rule', 'Set Rule'),
            ('pause', 'Pause'),
        ],
        db_index=True
    )
    
    # Текст скрипта
    script_text = models.TextField()
    
    # Порядок отображения (если несколько скриптов для одной комбинации)
    display_order = models.IntegerField(default=0)
    
    # Статус
    status = models.CharField(
        max_length=20,
        choices=[('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived')],
        default='published',
        db_index=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'boundary_scripts'
        indexes = [
            models.Index(fields=['scenario', 'style', 'goal', 'status']),
            models.Index(fields=['status', 'display_order']),
        ]
        unique_together = [['scenario', 'style', 'goal', 'display_order']]
