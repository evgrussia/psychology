"""
Views для Interactive endpoints.
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from asgiref.sync import async_to_sync

from application.interactive.dto import StartInteractiveRunDto, CompleteInteractiveRunDto
from application.client_cabinet.dto import CreateDiaryEntryDto
from presentation.api.v1.serializers.interactive import (
    QuizSerializer,
    QuizListSerializer,
    SubmitQuizSerializer,
    QuizRunSerializer,
    QuizResultSerializer,
    DiaryEntrySerializer,
    DiaryListSerializer,
    CreateDiaryEntrySerializer,
)
from presentation.api.v1.permissions import IsPublicOrAuthenticated, HasConsent
from presentation.api.v1.dependencies import (
    get_interactive_definition_repository,
    get_interactive_run_repository,
    get_diary_entry_repository,
    get_start_interactive_run_use_case,
    get_complete_interactive_run_use_case,
    get_create_diary_entry_use_case,
)
from domain.identity.aggregates.user import UserId


class QuizViewSet(viewsets.ViewSet):
    """
    Управление квизами.
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Список доступных квизов",
        responses={200: QuizListSerializer(many=True)},
    )
    def list(self, request):
        repository = get_interactive_definition_repository()
        definitions = async_to_sync(repository.find_all_published)(
            interactive_type='quiz'
        )
        
        quizzes_data = []
        for definition in definitions:
            quizzes_data.append({
                'id': definition['id'],
                'slug': definition['slug'],
                'title': definition['title'],
                'description': '',
                'category': definition.get('topic_code', ''),
            })
        
        serializer = QuizListSerializer(quizzes_data, many=True)
        return Response({'data': serializer.data})


class StartQuizView(APIView):
    """
    Начать прохождение квиза.
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Начать прохождение квиза",
        request=None,
        responses={201: QuizRunSerializer},
    )
    def post(self, request, slug):
        user_id = str(request.user.id) if request.user.is_authenticated else None
        anonymous_id = request.session.get('anonymous_id')
        
        dto = StartInteractiveRunDto(
            interactive_slug=slug,
            user_id=user_id,
            anonymous_id=anonymous_id,
            entry_point=request.query_params.get('entry_point', 'web'),
            topic_code=request.query_params.get('topic_code'),
            deep_link_id=request.query_params.get('dl'),
        )
        
        use_case = get_start_interactive_run_use_case()
        result = async_to_sync(use_case.execute)(dto)
        serializer = QuizRunSerializer(result)
        return Response(
            {'data': serializer.data},
            status=status.HTTP_201_CREATED
        )


class SubmitQuizView(APIView):
    """
    Отправить ответы квиза.
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Отправить ответы квиза",
        request=SubmitQuizSerializer,
        responses={200: QuizResultSerializer},
    )
    def post(self, request, slug):
        serializer = SubmitQuizSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dto = CompleteInteractiveRunDto(
            run_id=str(serializer.validated_data['run_id']),
            answers=serializer.validated_data['answers'],
        )
        
        use_case = get_complete_interactive_run_use_case()
        result = async_to_sync(use_case.execute)(dto)
        response_serializer = QuizResultSerializer(result)
        return Response({'data': response_serializer.data})


class InteractiveRunViewSet(viewsets.ViewSet):
    """
    Управление запусками интерактивов.
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Список запусков",
        responses={200: QuizRunSerializer(many=True)},
    )
    def list(self, request):
        user_id = UserId(request.user.id)
        repository = get_interactive_run_repository()
        runs = async_to_sync(repository.find_by_user_id)(user_id)
        
        runs_data = []
        for run in runs:
            runs_data.append({
                'run_id': str(run.id.value),
                'quiz_slug': '',
                'started_at': run.started_at.isoformat() if hasattr(run, 'started_at') else None,
            })
        
        serializer = QuizRunSerializer(runs_data, many=True)
        return Response({'data': serializer.data})


class DiaryViewSet(viewsets.ViewSet):
    """
    Управление дневниками.
    """
    permission_classes = [IsAuthenticated, HasConsent]
    
    @extend_schema(
        summary="Список записей дневника",
        responses={200: DiaryListSerializer(many=True)},
    )
    def list(self, request):
        user_id = UserId(request.user.id)
        repository = get_diary_entry_repository()
        entries = async_to_sync(repository.find_by_user_id)(user_id)
        
        entries_data = []
        for entry in entries:
            entries_data.append({
                'id': str(entry.id.value),
                'type': entry.diary_type.value,
                'content': {},
                'created_at': entry.created_at.isoformat() if hasattr(entry, 'created_at') else None,
            })
        
        serializer = DiaryListSerializer(entries_data, many=True)
        return Response({'data': serializer.data})
    
    @extend_schema(
        summary="Создать запись дневника",
        request=CreateDiaryEntrySerializer,
        responses={201: DiaryEntrySerializer},
    )
    def create(self, request):
        serializer = CreateDiaryEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dto = CreateDiaryEntryDto(
            user_id=str(request.user.id),
            type=serializer.validated_data['type'],
            content=serializer.validated_data.get('content', {}),
        )
        
        use_case = get_create_diary_entry_use_case()
        result = async_to_sync(use_case.execute)(dto)
        response_serializer = DiaryEntrySerializer(result)
        return Response(
            {'data': response_serializer.data},
            status=status.HTTP_201_CREATED
        )
