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
