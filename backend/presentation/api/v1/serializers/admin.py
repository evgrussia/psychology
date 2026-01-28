"""
Serializers для Admin endpoints.
"""
from rest_framework import serializers
from uuid import UUID


class AdminAppointmentListSerializer(serializers.Serializer):
    """Serializer для списка бронирований (админка)."""
    id = serializers.UUIDField()
    service = serializers.DictField()
    client = serializers.DictField()
    slot = serializers.DictField()
    status = serializers.CharField()
    created_at = serializers.DateTimeField()


class LeadListSerializer(serializers.Serializer):
    """Serializer для списка лидов."""
    id = serializers.UUIDField()
    identity = serializers.DictField()
    source = serializers.DictField()
    status = serializers.CharField()
    created_at = serializers.DateTimeField()


class AdminContentSerializer(serializers.Serializer):
    """Serializer для контента (админка)."""
    id = serializers.UUIDField()
    slug = serializers.SlugField()
    title = serializers.CharField()
    status = serializers.ChoiceField(choices=['draft', 'published', 'archived'])
    created_at = serializers.DateTimeField()


class AdminModerationSerializer(serializers.Serializer):
    """Serializer для модерации (админка)."""
    id = serializers.UUIDField()
    content_type = serializers.CharField()
    content = serializers.CharField()
    status = serializers.ChoiceField(choices=['pending', 'approved', 'rejected'])
    created_at = serializers.DateTimeField()
