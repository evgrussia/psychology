"""
Django ORM реализация IInteractiveDefinitionRepository.
"""
from typing import Optional, List
from asgiref.sync import sync_to_async
from domain.interactive.repositories import IInteractiveDefinitionRepository
from infrastructure.persistence.django_models.interactive import InteractiveDefinitionModel
from infrastructure.exceptions import InfrastructureError


class PostgresInteractiveDefinitionRepository(IInteractiveDefinitionRepository):
    """Реализация IInteractiveDefinitionRepository для PostgreSQL через Django ORM."""
    
    async def find_by_slug(self, slug: str) -> Optional[dict]:
        """Найти определение интерактива по slug."""
        try:
            record = await InteractiveDefinitionModel.objects.aget(
                slug=slug,
                status='published'
            )
            return {
                'id': str(record.id),
                'slug': record.slug,
                'interactive_type': record.interactive_type,
                'title': record.title,
                'topic_code': record.topic_code,
                'status': record.status,
                'published_at': record.published_at.isoformat() if record.published_at else None,
            }
        except InteractiveDefinitionModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find interactive definition: {e}") from e
    
    async def find_all_published(self, interactive_type: Optional[str] = None) -> List[dict]:
        """Найти все опубликованные определения интерактивов."""
        try:
            queryset = InteractiveDefinitionModel.objects.filter(status='published')
            if interactive_type:
                queryset = queryset.filter(interactive_type=interactive_type)
            
            definitions = []
            async for record in queryset:
                definitions.append({
                    'id': str(record.id),
                    'slug': record.slug,
                    'interactive_type': record.interactive_type,
                    'title': record.title,
                    'topic_code': record.topic_code,
                    'status': record.status,
                    'published_at': record.published_at.isoformat() if record.published_at else None,
                })
            
            return definitions
        except Exception as e:
            raise InfrastructureError(f"Failed to find interactive definitions: {e}") from e
