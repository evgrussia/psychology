"""
Use Case: отметка незавершённого прохождения интерактива.
"""
from application.exceptions import NotFoundError, ValidationError
from domain.interactive.repositories import IInteractiveRunRepository
from domain.interactive.aggregates.interactive_run import InteractiveRun, InteractiveRunId
from application.interfaces.event_bus import IEventBus


class AbandonInteractiveRunUseCase:
    """Use Case для отметки незавершённого прохождения интерактива."""
    
    def __init__(
        self,
        interactive_run_repository: IInteractiveRunRepository,
        event_bus: IEventBus
    ):
        self._run_repository = interactive_run_repository
        self._event_bus = event_bus
    
    async def execute(self, run_id: str) -> dict:
        """
        Отмечает прохождение интерактива как заброшенное.
        
        Args:
            run_id: ID прохождения интерактива
        
        Returns:
            dict с результатом операции
        
        Raises:
            NotFoundError: Если run не найден
            ValidationError: Если run уже завершен
        """
        # 1. Получение Run
        run_id_vo = InteractiveRunId(run_id)
        run = await self._run_repository.find_by_id(run_id_vo)
        if not run:
            raise NotFoundError("Interactive run not found")
        
        # 2. Отметка как abandoned
        try:
            run.abandon()
        except ValueError as e:
            raise ValidationError(str(e))
        
        # 3. Сохранение
        await self._run_repository.save(run)
        
        # 4. Публикация событий
        events = run.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        run.clear_domain_events()
        
        # 5. Возврат результата
        return {
            'run_id': run_id,
            'status': 'abandoned'
        }
