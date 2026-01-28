"""
Use Case: отправка плана на 7 дней в Telegram.
"""
from application.exceptions import NotFoundError
from domain.analytics.repositories import ILeadRepository
from domain.analytics.value_objects.timeline_event import TimelineEvent
from application.interfaces.telegram_service import ITelegramService
from application.interfaces.event_bus import IEventBus
from datetime import datetime
import pytz

from application.telegram.dto import SendTelegramPlanDto


class SendTelegramPlanUseCase:
    """Use Case для отправки плана на 7 дней в Telegram."""
    
    def __init__(
        self,
        telegram_adapter: ITelegramService,
        lead_repository: ILeadRepository,
        event_bus: IEventBus
    ):
        self._telegram_adapter = telegram_adapter
        self._lead_repository = lead_repository
        self._event_bus = event_bus
    
    async def execute(self, dto: SendTelegramPlanDto) -> dict:
        """
        Отправляет план на 7 дней в Telegram.
        
        Returns:
            dict с результатом отправки.
        
        Raises:
            NotFoundError: Если план не найден
        """
        # 1. Получение плана
        # Примечание: План должен храниться в конфигурации или БД
        # Временная реализация - генерируем простой план
        plan_content = self._generate_plan_content(dto.topic_code)
        
        # 2. Отправка плана
        await self._telegram_adapter.send_plan(
            user_id=int(dto.telegram_user_id),
            plan_content=plan_content,
            deep_link_id=dto.deep_link_id
        )
        
        # 3. Обновление Lead
        if dto.deep_link_id:
            lead = await self._lead_repository.find_by_deep_link_id(dto.deep_link_id)
            if lead:
                timeline_event = TimelineEvent(
                    event_type='tg_plan_sent',
                    occurred_at=datetime.now(pytz.UTC),
                    metadata={
                        'source': 'telegram',
                        'properties': {
                            'topic_code': dto.topic_code,
                            'telegram_user_id': dto.telegram_user_id
                        },
                        'deep_link_id': dto.deep_link_id
                    }
                )
                lead.add_timeline_event(timeline_event)
                await self._lead_repository.save(lead)
        
        # 4. Возврат результата
        return {
            'success': True,
            'telegram_user_id': dto.telegram_user_id,
            'topic_code': dto.topic_code
        }
    
    def _generate_plan_content(self, topic_code: str) -> str:
        """Генерирует содержание плана на 7 дней.
        
        Примечание: В реальной реализации план должен браться из конфигурации или БД.
        """
        # Упрощенная версия - в реальной реализации будет сложная логика
        return f"""📅 План на 7 дней по теме: {topic_code}

День 1: Введение в тему
День 2: Практические упражнения
День 3: Техники саморегуляции
День 4: Работа с эмоциями
День 5: Развитие навыков
День 6: Интеграция практик
День 7: Подведение итогов

Удачи в прохождении! 💪"""
