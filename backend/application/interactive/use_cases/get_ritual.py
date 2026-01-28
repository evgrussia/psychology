"""
Use Case: получение мини-ритуала для прохождения.
"""
from application.exceptions import NotFoundError
from domain.content.repositories import IContentItemRepository
from domain.content.value_objects.content_type import ContentType

from application.interactive.dto import GetRitualDto, RitualResponseDto


class GetRitualUseCase:
    """Use Case для получения мини-ритуала."""
    
    def __init__(self, content_repository: IContentItemRepository):
        self._content_repository = content_repository
    
    async def execute(self, dto: GetRitualDto) -> RitualResponseDto:
        """
        Получает мини-ритуал по ID или slug.
        
        Returns:
            RitualResponseDto с данными ритуала.
        
        Raises:
            NotFoundError: Если ритуал не найден
        """
        # 1. Получение ритуала
        # Примечание: Ритуалы могут храниться как ContentItem с типом 'ritual'
        # или в отдельной таблице. Используем ContentItem для упрощения
        try:
            # Пытаемся найти как ContentItem
            ritual = await self._content_repository.find_by_slug(
                dto.ritual_id,
                ContentType('tool')  # Используем 'tool' для ритуалов
            )
            
            if not ritual:
                # Пытаемся найти по ID
                from domain.content.aggregates.content_item import ContentItemId
                ritual_id = ContentItemId(dto.ritual_id)
                ritual = await self._content_repository.find_by_id(ritual_id)
            
            if not ritual:
                raise NotFoundError("Ritual not found")
            
            # Проверяем, что ритуал опубликован
            if ritual.status.value != 'published':
                raise NotFoundError("Ritual is not published")
            
        except NotFoundError:
            raise
        except Exception as e:
            raise NotFoundError("Ritual not found")
        
        # 2. Возврат DTO
        # Примечание: Структура ритуала должна быть в content_body
        content_body = getattr(ritual, 'content_body', '{}')
        
        # Парсим content_body (предполагаем JSON)
        import json
        try:
            ritual_data = json.loads(content_body) if isinstance(content_body, str) else content_body
        except:
            ritual_data = {}
        
        return RitualResponseDto(
            id=str(ritual.id.value),
            title=ritual.title,
            description=ritual_data.get('description', ''),
            duration_minutes=ritual_data.get('duration_minutes', 10),
            instructions=ritual_data.get('instructions', []),
            audio_url=ritual_data.get('audio_url')
        )
