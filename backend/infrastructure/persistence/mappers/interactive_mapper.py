"""
Mapper для преобразования Interactive Domain Entities ↔ DB Records.
"""
from typing import Dict, Any, Optional
from domain.interactive.aggregates.interactive_run import InteractiveRun, InteractiveRunId
from domain.interactive.value_objects import RunStatus, RunMetadata, InteractiveResult
from domain.interactive.value_objects.result_level import ResultLevel
from domain.identity.aggregates.user import UserId
from infrastructure.persistence.django_models.interactive import InteractiveRunModel
from infrastructure.exceptions import InfrastructureError


class InteractiveRunMapper:
    """Mapper для преобразования InteractiveRun Domain Entity ↔ DB Record."""
    
    @staticmethod
    def to_domain(record: InteractiveRunModel) -> InteractiveRun:
        """Преобразовать DB Record → Domain Entity."""
        from domain.interactive.aggregates.interactive_run import InteractiveRunId
        
        # Восстановление Value Objects
        metadata = RunMetadata(
            interactive_slug=record.metadata.get('interactive_slug', ''),
            additional_data=record.metadata.get('additional_data', {})
        )
        
        status = RunStatus(record.status)
        
        # Восстановление InteractiveResult (если есть)
        result = None
        if record.result_level:
            result_level = ResultLevel(record.result_level)
            result = InteractiveResult(
                level=result_level,
                profile={'profile': record.result_profile} if record.result_profile else None,
                crisis_detected=record.crisis_triggered
            )
        
        # Восстановление агрегата через конструктор
        return InteractiveRun(
            id=InteractiveRunId(record.id),
            user_id=UserId(record.user_id) if record.user_id else None,
            metadata=metadata,
            status=status,
            result=result,
            started_at=record.started_at,
            completed_at=record.completed_at
        )
    
    @staticmethod
    def to_persistence(run: InteractiveRun) -> Dict[str, Any]:
        """Преобразовать Domain Entity → DB Record."""
        # Получаем metadata через приватное поле
        metadata_vo = getattr(run, '_metadata', None)
        if metadata_vo is None:
            metadata_vo = RunMetadata(interactive_slug='')
        
        # Получаем result через приватное поле
        result_vo = getattr(run, '_result', None)
        
        # Получаем started_at и completed_at через приватные поля
        started_at = getattr(run, '_started_at', None)
        completed_at = getattr(run, '_completed_at', None)
        
        # Для interactive_definition_id нужно найти определение по slug или использовать временный UUID
        # В production нужно загружать InteractiveDefinition по slug и использовать его ID
        from uuid import uuid4
        # Временно используем случайный UUID, в production нужно загружать определение
        interactive_definition_id = uuid4()  # TODO: загружать по metadata_vo.interactive_slug
        
        return {
            'id': run.id.value,
            'interactive_definition_id': interactive_definition_id,
            'user_id': run.user_id.value if run.user_id else None,
            'anonymous_id': None,  # TODO: добавить поддержку anonymous_id
            'started_at': started_at,
            'completed_at': completed_at,
            'result_level': result_vo.level.value if result_vo and result_vo.level else None,
            'result_profile': result_vo.profile.get('profile') if result_vo and result_vo.profile else None,
            'crisis_triggered': result_vo.crisis_detected if result_vo else False,
            'duration_ms': None,  # TODO: вычислить из started_at и completed_at
            'metadata': {
                'interactive_slug': metadata_vo.interactive_slug,
                'additional_data': metadata_vo.additional_data,
            },
            'status': run.status.value,
        }
