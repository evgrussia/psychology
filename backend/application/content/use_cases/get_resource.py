"""
Use Case: получение ресурса (упражнение/аудио/чек-лист).
"""
from application.exceptions import NotFoundError
from domain.content.repositories import IContentItemRepository
from domain.content.value_objects.content_type import ContentType

from application.content.dto import GetResourceDto, ResourceResponseDto


class GetResourceUseCase:
    """Use Case для получения ресурса."""
    
    def __init__(self, content_repository: IContentItemRepository):
        self._content_repository = content_repository
    
    async def execute(self, dto: GetResourceDto) -> ResourceResponseDto:
        """
        Получает ресурс по slug.
        
        Returns:
            ResourceResponseDto с данными ресурса.
        
        Raises:
            NotFoundError: Если ресурс не найден
        """
        # Определяем тип ресурса по slug или пытаемся найти по всем типам
        # В реальной реализации тип должен передаваться в DTO или определяться по префиксу
        resource_types = [
            ContentType('exercise'),
            ContentType('audio'),
            ContentType('tool')
        ]
        
        resource = None
        for resource_type in resource_types:
            resource = await self._content_repository.find_by_slug(dto.slug, resource_type)
            if resource:
                break
        
        if not resource:
            raise NotFoundError("Resource not found")
        
        # Проверяем, что ресурс опубликован
        if resource.status.value != 'published':
            raise NotFoundError("Resource is not published")
        
        # Возврат DTO
        return ResourceResponseDto(
            id=str(resource.id.value),
            slug=resource.slug,
            title=resource.title,
            type=resource.content_type.value,
            content=getattr(resource, 'content_body', ''),
            duration_minutes=getattr(resource, 'duration_minutes', None),
            audio_url=getattr(resource, 'audio_url', None),
            pdf_url=getattr(resource, 'pdf_url', None),
            related_articles=[
                {
                    'id': str(rel.id.value),
                    'slug': rel.slug,
                    'title': rel.title
                }
                for rel in await self._content_repository.find_related_resources(
                    content_item=resource,
                    limit=5
                )
            ]
        )
