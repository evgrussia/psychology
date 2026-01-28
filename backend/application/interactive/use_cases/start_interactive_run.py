"""
Use Case: начало прохождения интерактива (квиз/навигатор/термометр).
"""
from application.exceptions import NotFoundError, ValidationError
from domain.interactive.repositories import IInteractiveDefinitionRepository, IInteractiveRunRepository
from domain.interactive.aggregates.interactive_run import InteractiveRun
from domain.identity.aggregates.user import UserId
from application.interfaces.event_bus import IEventBus
from domain.analytics.repositories import ILeadRepository

from application.interactive.dto import StartInteractiveRunDto, InteractiveRunResponseDto


class StartInteractiveRunUseCase:
    """Use Case для начала прохождения интерактива."""
    
    def __init__(
        self,
        interactive_definition_repository: IInteractiveDefinitionRepository,
        interactive_run_repository: IInteractiveRunRepository,
        lead_repository: ILeadRepository,
        event_bus: IEventBus
    ):
        self._definition_repository = interactive_definition_repository
        self._run_repository = interactive_run_repository
        self._lead_repository = lead_repository
        self._event_bus = event_bus
    
    async def execute(self, dto: StartInteractiveRunDto) -> InteractiveRunResponseDto:
        """
        Начинает прохождение интерактива.
        
        Returns:
            InteractiveRunResponseDto с данными запущенного интерактива.
        
        Raises:
            NotFoundError: Если интерактив не найден
            ValidationError: Если интерактив не опубликован
        """
        # 1. Получение определения интерактива
        definition = await self._definition_repository.find_by_slug(dto.interactive_slug)
        if not definition:
            raise NotFoundError("Interactive not found")
        
        # В репозитории уже фильтруем по status='published'
        # Но на всякий случай проверим
        if definition.get('status') != 'published':
            raise ValidationError("Interactive is not published")
        
        # 2. Создание Run
        from domain.interactive.value_objects.run_metadata import RunMetadata
        
        user_id_vo = None
        if dto.user_id:
            user_id_vo = UserId(dto.user_id)
        
        metadata = RunMetadata(
            interactive_slug=dto.interactive_slug,
            additional_data={
                'anonymous_id': dto.anonymous_id,
                **(dto.metadata or {})
            }
        )
        
        run = InteractiveRun.start(
            metadata=metadata,
            user_id=user_id_vo
        )
        
        # 3. Сохранение
        await self._run_repository.save(run)
        
        # 4. Публикация событий
        events = run.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        run.clear_domain_events()
        
        # 5. Создание/обновление Lead
        if dto.metadata and dto.metadata.get('deepLinkId'):
            deep_link_id = dto.metadata.get('deepLinkId')
            lead = await self._lead_repository.find_by_deep_link_id(deep_link_id)
            
            if lead:
                from domain.analytics.value_objects.timeline_event import TimelineEvent
                from datetime import datetime
                import pytz
                
                timeline_event = TimelineEvent(
                    event_type='interactive_started',
                    occurred_at=datetime.now(pytz.UTC),
                    metadata={
                        'source': 'web',
                        'properties': {
                            'interactive_slug': dto.interactive_slug,
                            'run_id': str(run.id.value)
                        },
                        'deep_link_id': deep_link_id
                    }
                )
                lead.add_timeline_event(timeline_event)
                await self._lead_repository.save(lead)
        
        # 6. Возврат DTO
        return InteractiveRunResponseDto(
            run_id=str(run.id.value),
            interactive={
                'id': str(definition.get('id')),
                'slug': definition.get('slug'),
                'title': definition.get('title'),
                'type': definition.get('interactive_type')
            },
            questions=definition.get('questions'),
            steps=definition.get('steps'),
            started_at=run.started_at.isoformat()
        )
