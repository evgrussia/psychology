"""
Views для Moderation endpoints.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from presentation.api.v1.serializers.moderation import (
    SubmitQuestionSerializer,
    QuestionSerializer,
)
from presentation.api.v1.permissions import IsPublicOrAuthenticated


class QuestionViewSet(viewsets.ViewSet):
    """
    Управление вопросами (UGC).
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Отправить анонимный вопрос",
        request=SubmitQuestionSerializer,
        responses={201: QuestionSerializer},
    )
    def create(self, request):
        serializer = SubmitQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Предмодерация (кризисные слова, PII)
        content = serializer.validated_data['content']
        
        # Simple PII removal (masking email and phone)
        import re
        content = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[email hidden]', content)
        content = re.sub(r'\+?\d{10,12}', '[phone hidden]', content)
        
        from shared.crisis_detection import detect_crisis_indicators
        if detect_crisis_indicators(content):
            return Response(
                {
                    'error': {
                        'code': 'CRISIS_DETECTED',
                        'message': 'Crisis indicators detected. Please contact emergency services.',
                        'details': [{
                            'field': 'content',
                            'message': 'Emergency contact information provided',
                        }],
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from asgiref.sync import async_to_sync
        from application.ugc_moderation.dto import SubmitQuestionDto
        from presentation.api.v1.dependencies import get_submit_question_use_case
        
        dto = SubmitQuestionDto(
            content=content,
            user_id=str(request.user.id) if request.user.is_authenticated else None,
        )
        
        use_case = get_submit_question_use_case()
        
        result = async_to_sync(use_case.execute)(dto)
        response_serializer = QuestionSerializer(result)
        return Response(
            {'data': response_serializer.data},
            status=status.HTTP_201_CREATED
        )
    
