from typing import List
from domain.content.repositories import IBoundaryScriptRepository
from infrastructure.persistence.django_models.content import BoundaryScriptModel
from asgiref.sync import sync_to_async


class DjangoBoundaryScriptRepository(IBoundaryScriptRepository):
    """Реализация IBoundaryScriptRepository через Django ORM."""
    
    async def find_scripts(
        self,
        scenario: str,
        style: str,
        goal: str,
        status: str = 'published'
    ) -> List[dict]:
        """Находит скрипты по параметрам."""
        queryset = BoundaryScriptModel.objects.filter(
            scenario=scenario,
            style=style,
            goal=goal,
            status=status
        ).order_by('display_order')
        
        scripts = []
        async for script_model in queryset:
            scripts.append({
                'id': str(script_model.id),
                'text': script_model.script_text,
                'scenario': script_model.scenario,
                'style': script_model.style,
                'goal': script_model.goal
            })
        
        return scripts
