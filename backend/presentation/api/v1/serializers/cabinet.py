"""
Serializers для Client Cabinet endpoints.
"""
from rest_framework import serializers
from uuid import UUID


class ExportDiariesSerializer(serializers.Serializer):
    """Serializer для экспорта дневников."""
    date_from = serializers.DateTimeField(required=False, allow_null=True)
    date_to = serializers.DateTimeField(required=False, allow_null=True)
    format = serializers.ChoiceField(
        choices=['pdf'],
        required=False,
        default='pdf'
    )


class ExportStatusSerializer(serializers.Serializer):
    """Serializer для статуса экспорта."""
    export_id = serializers.UUIDField()
    status = serializers.ChoiceField(choices=['pending', 'processing', 'completed', 'failed'])
    file_url = serializers.URLField(allow_null=True, required=False)


# --- Favorites (аптечка) ---

class AddFavoriteSerializer(serializers.Serializer):
    """Запрос добавления в избранное."""
    resource_type = serializers.ChoiceField(choices=['article', 'resource', 'ritual'])
    resource_id = serializers.CharField(max_length=255, trim_whitespace=True)


class FavoriteItemSerializer(serializers.Serializer):
    """Один элемент избранного в ответе."""
    id = serializers.UUIDField()
    resource_type = serializers.CharField()
    resource_id = serializers.CharField()
    created_at = serializers.CharField()  # ISO 8601 строка
