"""
Serializers для Moderation endpoints.
"""
from rest_framework import serializers
from uuid import UUID


class SubmitQuestionSerializer(serializers.Serializer):
    """Serializer для отправки вопроса."""
    content = serializers.CharField(required=True, min_length=10, max_length=5000)


class QuestionSerializer(serializers.Serializer):
    """Serializer для вопроса."""
    id = serializers.CharField()
    content = serializers.CharField()
    status = serializers.ChoiceField(
        choices=['pending', 'flagged', 'approved', 'rejected', 'answered']
    )
    created_at = serializers.CharField()  # ISO8601 строка
