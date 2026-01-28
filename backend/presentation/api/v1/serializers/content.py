"""
Serializers для Content endpoints.
"""
from rest_framework import serializers
from uuid import UUID


class ArticleSerializer(serializers.Serializer):
    """Serializer для статьи."""
    id = serializers.UUIDField()
    slug = serializers.SlugField()
    title = serializers.CharField()
    excerpt = serializers.CharField(allow_blank=True, required=False)
    content = serializers.CharField()
    category = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField())
    published_at = serializers.DateTimeField(allow_null=True, required=False)
    created_at = serializers.DateTimeField()


class ArticleListSerializer(serializers.Serializer):
    """Serializer для списка статей."""
    id = serializers.UUIDField()
    slug = serializers.SlugField()
    title = serializers.CharField()
    excerpt = serializers.CharField(allow_blank=True, required=False)
    category = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField())
    published_at = serializers.DateTimeField(allow_null=True, required=False)
    created_at = serializers.DateTimeField()


class ResourceSerializer(serializers.Serializer):
    """Serializer для ресурса."""
    id = serializers.CharField()
    slug = serializers.SlugField()
    title = serializers.CharField()
    type = serializers.CharField()
    content = serializers.CharField(required=False, allow_blank=True)
    duration_minutes = serializers.IntegerField(required=False, allow_null=True)
    audio_url = serializers.URLField(required=False, allow_null=True)
    pdf_url = serializers.URLField(required=False, allow_null=True)
    related_articles = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_null=True
    )


class ResourceListSerializer(ResourceSerializer):
    """Serializer для списка ресурсов."""
    pass
