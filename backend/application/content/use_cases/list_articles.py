"""
Use Case: получение списка статей с пагинацией и фильтрами.
"""
from application.exceptions import ValidationError
from domain.content.repositories import IContentItemRepository
from domain.content.value_objects.content_type import ContentType
from domain.content.value_objects.content_status import ContentStatus

from application.content.dto import ListArticlesDto, ArticlesListResponseDto


class ListArticlesUseCase:
    """Use Case для получения списка статей."""
    
    def __init__(self, content_repository: IContentItemRepository):
        self._content_repository = content_repository
    
    async def execute(self, dto: ListArticlesDto) -> ArticlesListResponseDto:
        """
        Получает список статей с пагинацией и фильтрами.
        
        Returns:
            ArticlesListResponseDto со списком статей и пагинацией.
        
        Raises:
            ValidationError: Если параметры пагинации невалидны
        """
        # 1. Валидация параметров
        if dto.page < 1:
            raise ValidationError("Page must be >= 1")
        if dto.per_page < 1 or dto.per_page > 100:
            raise ValidationError("Per page must be between 1 and 100")
        
        # 2. Получение статей
        articles = await self._content_repository.find_published(
            content_type=ContentType('article'),
            page=dto.page,
            per_page=dto.per_page
        )
        total_count = await self._content_repository.count_published(
            content_type=ContentType('article')
        )
        
        # 4. Маппинг в DTO
        articles_data = []
        for article in articles:
            articles_data.append({
                'id': str(article.id.value),
                'slug': article.slug,
                'title': article.title,
                'excerpt': article.excerpt,
                'published_at': article.published_at.isoformat() if article.published_at else None,
                'category': article.category.value if hasattr(article.category, 'value') else str(article.category),
                'tags': [tag.value if hasattr(tag, 'value') else str(tag) for tag in article.tags] if hasattr(article, 'tags') else []
            })
        
        # 5. Расчет пагинации
        total_pages = (total_count + dto.per_page - 1) // dto.per_page if total_count > 0 else 0
        
        return ArticlesListResponseDto(
            data=articles_data,
            pagination={
                'page': dto.page,
                'per_page': dto.per_page,
                'total': total_count,
                'total_pages': total_pages,
                'has_next': dto.page < total_pages,
                'has_prev': dto.page > 1
            }
        )
