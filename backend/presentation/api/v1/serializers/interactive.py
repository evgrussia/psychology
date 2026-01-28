"""
Serializers для Interactive endpoints.
"""
from rest_framework import serializers
from uuid import UUID


class QuizSerializer(serializers.Serializer):
    """Serializer для квиза."""
    id = serializers.UUIDField()
    slug = serializers.SlugField()
    title = serializers.CharField()
    description = serializers.CharField(allow_blank=True, required=False)
    category = serializers.CharField()


class QuizListSerializer(QuizSerializer):
    """Serializer для списка квизов."""
    pass


class SubmitQuizSerializer(serializers.Serializer):
    """Serializer для отправки ответов квиза."""
    run_id = serializers.UUIDField(required=True)
    answers = serializers.ListField(
        child=serializers.DictField(),
        required=True,
    )


class QuizRunSerializer(serializers.Serializer):
    """Serializer для запуска квиза."""
    run_id = serializers.UUIDField()
    quiz_slug = serializers.SlugField()
    started_at = serializers.DateTimeField()


class QuizResultSerializer(serializers.Serializer):
    """Serializer для результата квиза."""
    run_id = serializers.UUIDField()
    result = serializers.DictField()  # {level, profile, recommendations}
    deep_link_id = serializers.CharField(allow_null=True, required=False)


class DiaryEntrySerializer(serializers.Serializer):
    """Serializer для записи дневника."""
    id = serializers.UUIDField()
    type = serializers.CharField()
    content = serializers.CharField(allow_blank=True, required=False)
    created_at = serializers.DateTimeField()


class DiaryListSerializer(DiaryEntrySerializer):
    """Serializer для списка записей дневника."""
    pass


class CreateDiaryEntrySerializer(serializers.Serializer):
    """Serializer для создания записи дневника."""
    type = serializers.CharField(required=True)
    content = serializers.CharField(required=False, allow_blank=True)
