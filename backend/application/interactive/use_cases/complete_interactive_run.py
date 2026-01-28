"""
Use Case: завершение прохождения интерактива с результатом.
"""
from application.exceptions import NotFoundError, ValidationError
from domain.interactive.repositories import IInteractiveRunRepository, IInteractiveDefinitionRepository
from domain.interactive.aggregates.interactive_run import InteractiveRun, InteractiveRunId
from domain.interactive.value_objects.interactive_result import InteractiveResult
from domain.interactive.value_objects.result_level import ResultLevel
from domain.shared.exceptions import DomainError
from domain.analytics.repositories import ILeadRepository
from domain.analytics.value_objects.timeline_event import TimelineEvent
from application.interfaces.event_bus import IEventBus
from datetime import datetime
import pytz

from application.interactive.dto import CompleteInteractiveRunDto, InteractiveResultResponseDto


class CompleteInteractiveRunUseCase:
    """Use Case для завершения прохождения интерактива."""
    
    def __init__(
        self,
        interactive_run_repository: IInteractiveRunRepository,
        interactive_definition_repository: IInteractiveDefinitionRepository,
        lead_repository: ILeadRepository,
        event_bus: IEventBus
    ):
        self._run_repository = interactive_run_repository
        self._definition_repository = interactive_definition_repository
        self._lead_repository = lead_repository
        self._event_bus = event_bus
    
    async def execute(self, dto: CompleteInteractiveRunDto) -> InteractiveResultResponseDto:
        """
        Завершает прохождение интерактива с результатом.
        
        Returns:
            InteractiveResultResponseDto с результатом прохождения.
        
        Raises:
            NotFoundError: Если run не найден
            ValidationError: Если run уже завершен или не может быть завершен
        """
        # 1. Получение Run
        run_id = InteractiveRunId(dto.run_id)
        run = await self._run_repository.find_by_id(run_id)
        if not run:
            raise NotFoundError("Interactive run not found")
        
        if not run.status.value == 'started':
            raise ValidationError("Can only complete started run")
        
        # 2. Получение определения интерактива для расчета результата
        definition = await self._definition_repository.find_by_slug(run.metadata.interactive_slug)
        if not definition:
            raise NotFoundError("Interactive definition not found")
        
        # 3. Расчёт результата
        result = self._calculate_result(dto, definition)
        
        # 4. Завершение Run
        run.complete(result)
        
        # 5. Сохранение
        await self._run_repository.save(run)
        
        # 6. Публикация событий
        events = run.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        run.clear_domain_events()
        
        # 7. Обновление Lead
        deep_link_id = run.metadata.deep_link_id if hasattr(run.metadata, 'deep_link_id') else None
        if deep_link_id:
            lead = await self._lead_repository.find_by_deep_link_id(deep_link_id)
            if lead:
                timeline_event = TimelineEvent(
                    event_type='interactive_completed',
                    occurred_at=datetime.now(pytz.UTC),
                    metadata={
                        'source': 'web',
                        'properties': {
                            'interactive_slug': run.metadata.interactive_slug,
                            'result_level': result.level.value,
                            'run_id': str(run.id.value)
                        },
                        'deep_link_id': deep_link_id
                    }
                )
                lead.add_timeline_event(timeline_event)
                await self._lead_repository.save(lead)
        
        # 8. Возврат DTO
        # Примечание: рекомендации должны генерироваться на основе результата
        # Здесь упрощенная версия - в реальной реализации будет сложная логика
        recommendations = {
            'now': [],
            'week': []
        }
        if result.level.value == 'high':
            recommendations['now'] = ['Обратитесь за поддержкой', 'Практикуйте дыхательные упражнения']
            recommendations['week'] = ['Запишитесь на консультацию', 'Изучите техники саморегуляции']
        
        return InteractiveResultResponseDto(
            run_id=dto.run_id,
            result={
                'level': result.level.value,
                'profile': result.profile,
                'recommendations': recommendations,
                'when_to_seek_help': 'Немедленно обратитесь за помощью' if result.level.value == 'high' else None
            },
            crisis_triggered=result.crisis_detected,
            deep_link_id=deep_link_id or ''
        )
    
    def _calculate_result(
        self,
        dto: CompleteInteractiveRunDto,
        definition
    ) -> InteractiveResult:
        """Вычисляет результат интерактива на основе ответов."""
        # Упрощенная логика расчета результата
        # В реальной реализации здесь будет сложная логика в зависимости от типа интерактива
        
        level = ResultLevel('low')  # По умолчанию
        
        if dto.thermometer_values:
            # Для термометра: вычисляем среднее значение
            values = [
                dto.thermometer_values.get('energy', 5),
                dto.thermometer_values.get('tension', 5),
                dto.thermometer_values.get('support', 5)
            ]
            avg = sum(values) / len(values)
            if avg >= 7:
                level = ResultLevel('high')
            elif avg >= 4:
                level = ResultLevel('medium')
            else:
                level = ResultLevel('low')
        elif dto.answers:
            # Для квиза: суммируем баллы
            total_score = sum(answer.get('value', 0) for answer in dto.answers if isinstance(answer.get('value'), (int, float)))
            # Определяем уровень по порогам (примерные значения)
            if total_score >= 20:
                level = ResultLevel('high')
            elif total_score >= 10:
                level = ResultLevel('medium')
            else:
                level = ResultLevel('low')
        
        crisis_detected = dto.crisis_triggered or False
        
        # Создаем InteractiveResult
        # InteractiveResult принимает только level, profile и crisis_detected
        profile = None
        if dto.navigator_path:
            # Для навигатора определяем профиль на основе пути
            profile = {'path': dto.navigator_path}
        
        return InteractiveResult(
            level=level,
            profile=profile,
            crisis_detected=crisis_detected
        )
