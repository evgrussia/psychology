"""
Views для Content endpoints.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from presentation.api.v1.serializers.content import (
    ArticleSerializer,
    ArticleListSerializer,
    ResourceSerializer,
    ResourceListSerializer,
)
from presentation.api.v1.permissions import IsPublicOrAuthenticated
from rest_framework.permissions import IsAuthenticated


class ArticleViewSet(viewsets.ViewSet):
    """
    Управление статьями (публичный доступ).
    """
    permission_classes = [IsPublicOrAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags']
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'created_at']
    ordering = ['-published_at']
    
    @extend_schema(
        summary="Список статей",
        responses={200: ArticleListSerializer(many=True)},
    )
    def list(self, request):
        from asgiref.sync import async_to_sync
        from presentation.api.v1.dependencies import get_list_articles_use_case
        from application.content.dto import ListArticlesDto
        
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 20))
        
        dto = ListArticlesDto(
            page=page,
            per_page=per_page,
        )
        
        use_case = get_list_articles_use_case()
        result = async_to_sync(use_case.execute)(dto)
        
        serializer = ArticleListSerializer(result.data, many=True)
        return Response({
            'data': serializer.data,
            'pagination': result.pagination,
        })
    
    @extend_schema(
        summary="Получить статью по slug",
        responses={200: ArticleSerializer},
    )
    def retrieve(self, request, pk=None):
        from asgiref.sync import async_to_sync
        from presentation.api.v1.dependencies import get_get_article_use_case
        from application.content.dto import GetArticleDto
        
        dto = GetArticleDto(
            slug=pk,
            include_draft=False,  # Публичные пользователи не видят черновики
        )
        
        use_case = get_get_article_use_case()
        result = async_to_sync(use_case.execute)(dto)
        serializer = ArticleSerializer(result)
        return Response({'data': serializer.data})


class ResourceViewSet(viewsets.ViewSet):
    """
    Управление ресурсами (публичный доступ).
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Список ресурсов",
        responses={200: ResourceListSerializer(many=True)},
    )
    def list(self, request):
        from asgiref.sync import async_to_sync
        from presentation.api.v1.dependencies import get_content_item_repository
        from domain.content.value_objects.content_type import ContentType
        
        repository = get_content_item_repository()
        
        # Получаем ресурсы разных типов
        resource_types = [
            ContentType('exercise'),
            ContentType('audio'),
            ContentType('tool'),
        ]
        
        all_resources = []
        for resource_type in resource_types:
            resources = async_to_sync(repository.find_published)(
                content_type=resource_type,
                page=1,
                per_page=50,
            )
            all_resources.extend(resources)
        
        resources_data = []
        for resource in all_resources:
            resources_data.append({
                'id': str(resource.id.value),
                'slug': resource.slug,
                'title': resource.title,
                'description': getattr(resource, 'title', ''),
                'type': resource.content_type.value,
                'url': f"/resources/{resource.slug}",
                'file_url': None,
            })
        
        serializer = ResourceListSerializer(resources_data, many=True)
        return Response({'data': serializer.data})
    
    @extend_schema(
        summary="Получить ресурс по slug",
        responses={200: ResourceSerializer},
    )
    def retrieve(self, request, pk=None):
        from asgiref.sync import async_to_sync
        from presentation.api.v1.dependencies import get_get_resource_use_case
        from application.content.dto import GetResourceDto
        
        dto = GetResourceDto(slug=pk)
        use_case = get_get_resource_use_case()
        
        result = async_to_sync(use_case.execute)(dto)
        serializer = ResourceSerializer(result)
        return Response({'data': serializer.data})


class TopicsViewSet(viewsets.ViewSet):
    """
    ViewSet для получения списка тем (topics).
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Список тем",
        description="Возвращает список доступных тем для контента",
        responses={200: {'description': 'List of topics'}},
    )
    def list(self, request):
        """
        Возвращает список тем.
        
        Темы определены статически на основе бизнес-требований.
        В будущем можно сделать динамический список из БД.
        """
        topics = [
            {
                'id': 'anxiety',
                'slug': 'anxiety',
                'title': 'Тревога',
                'description': 'Помощь в преодолении тревожных состояний и панических атак',
            },
            {
                'id': 'burnout',
                'slug': 'burnout',
                'title': 'Выгорание',
                'description': 'Восстановление сил и поиск баланса при профессиональном выгорании',
            },
            {
                'id': 'relationships',
                'slug': 'relationships',
                'title': 'Отношения',
                'description': 'Разрешение конфликтов и построение гармоничных отношений',
            },
            {
                'id': 'self-esteem',
                'slug': 'self-esteem',
                'title': 'Самооценка',
                'description': 'Работа над уверенностью в себе и принятием себя',
            },
        ]
        
        return Response({'data': topics})
