"""
Use Case: получение статьи по slug.
"""
from application.exceptions import NotFoundError, ForbiddenError
from domain.content.repositories import IContentItemRepository
from domain.content.value_objects.content_type import ContentType
from domain.content.value_objects.content_status import ContentStatus

from application.content.dto import GetArticleDto, ArticleResponseDto


class GetArticleUseCase:
    """Use Case для получения статьи."""
    
    def __init__(self, content_repository: IContentItemRepository):
        self._content_repository = content_repository
    
    async def execute(self, dto: GetArticleDto) -> ArticleResponseDto:
        """
        Получает статью по slug.
        
        Returns:
            ArticleResponseDto с данными статьи.
        
        Raises:
            NotFoundError: Если статья не найдена
            ForbiddenError: Если статья не опубликована и пользователь не админ
        """
        # 1. Получение статьи
        article = await self._content_repository.find_by_slug(
            dto.slug,
            ContentType('article')
        )
        if not article:
            raise NotFoundError("Article not found")
        
        # Проверка статуса
        if article.status.value != 'published' and not dto.include_draft:
            raise ForbiddenError("Article is not published")
        
        # 2. Получение связанных ресурсов
        related = await self._content_repository.find_related_resources(
            content_item=article,
            limit=5
        )
        
        # 3. Возврат DTO
        return ArticleResponseDto(
            id=str(article.id.value),
            slug=article.slug,
            title=article.title,
            content=article.content_body,
            excerpt=article.excerpt,
            published_at=article.published_at.isoformat() if article.published_at else '',
            category=article.category,
            tags=[tag if isinstance(tag, str) else str(tag) for tag in article.tags],
            related_resources=[self._to_resource_dto(r) for r in related],
            cta_blocks=getattr(article, 'cta_blocks', None)
        )
    
    def _to_resource_dto(self, resource) -> dict:
        """Преобразует ресурс в DTO."""
        return {
            'id': str(resource.id.value),
            'slug': resource.slug,
            'title': resource.title,
            'type': resource.content_type.value
        }
