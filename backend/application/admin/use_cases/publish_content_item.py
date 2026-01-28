"""
Use Case: публикация контента с проверкой чеклиста.
"""
from application.exceptions import NotFoundError, ValidationError
from domain.content.repositories import IContentItemRepository
from domain.content.aggregates.content_item import ContentItemId

from application.admin.dto import PublishContentItemDto


class PublishContentItemUseCase:
    """Use Case для публикации контента."""
    
    def __init__(self, content_repository: IContentItemRepository):
        self._content_repository = content_repository
    
    async def execute(self, dto: PublishContentItemDto) -> dict:
        """
        Публикует контент с проверкой чеклиста.
        
        Returns:
            dict с результатом публикации.
        
        Raises:
            NotFoundError: Если контент не найден
            ValidationError: Если чеклист не пройден
        """
        # 1. Получение контента
        content_id = ContentItemId(dto.content_id)
        content = await self._content_repository.find_by_id(content_id)
        if not content:
            raise NotFoundError("Content item not found")
        
        # 2. Проверка чеклиста
        checklist = dto.checklist
        if not all([
            checklist.get('hasDisclaimers', False),
            checklist.get('toneChecked', False),
            checklist.get('hasCta', False),
            checklist.get('hasInternalLinks', False)
        ]):
            raise ValidationError("All checklist items must be completed before publishing")
        
        # 3. Публикация
        try:
            content.publish()
        except ValueError as e:
            raise ValidationError(str(e))
        
        # 4. Сохранение
        await self._content_repository.save(content)
        
        # 5. Публикация событий (автоматически через publish())
        # События публикуются через репозиторий при сохранении
        
        # 6. Возврат результата
        return {
            'content_id': dto.content_id,
            'status': 'published',
            'published_at': content.published_at.isoformat() if content.published_at else None
        }
