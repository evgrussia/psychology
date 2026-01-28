"""
Use Case: обработка webhook от Telegram Bot API.
"""
from application.exceptions import ValidationError
from domain.analytics.repositories import ILeadRepository
from domain.analytics.value_objects.timeline_event import TimelineEvent
from domain.analytics.value_objects.lead_source import LeadSource
from domain.analytics.value_objects.lead_status import LeadStatus
from domain.analytics.value_objects.lead_identity import LeadIdentity
from domain.analytics.aggregates.lead import Lead
from application.interfaces.telegram_service import ITelegramService
from application.interfaces.event_bus import IEventBus
from datetime import datetime
import pytz

from application.telegram.dto import TelegramWebhookDto


class HandleTelegramWebhookUseCase:
    """Use Case для обработки webhook от Telegram Bot API."""
    
    def __init__(
        self,
        telegram_adapter: ITelegramService,
        lead_repository: ILeadRepository,
        event_bus: IEventBus
    ):
        self._telegram_adapter = telegram_adapter
        self._lead_repository = lead_repository
        self._event_bus = event_bus
    
    async def execute(self, dto: TelegramWebhookDto) -> dict:
        """
        Обрабатывает webhook от Telegram Bot API.
        
        Returns:
            dict с результатом обработки.
        
        Raises:
            ValidationError: Если данные webhook невалидны
        """
        update = dto.update
        
        # 1. Парсинг команды
        if 'message' in update:
            message = update['message']
            chat_id = message.get('chat', {}).get('id')
            text = message.get('text', '')
            from_user = message.get('from', {})
            telegram_user_id = str(from_user.get('id'))
            username = from_user.get('username')
            
            # Обработка команды /start
            if text.startswith('/start'):
                # Извлечение deep_link_id из параметров команды
                deep_link_id = None
                if ' ' in text:
                    deep_link_id = text.split(' ', 1)[1]
                
                # Создание/обновление Lead
                if deep_link_id:
                    lead = await self._lead_repository.find_by_deep_link_id(deep_link_id)
                    
                    if not lead:
                        # Создаем новый Lead
                        identity = LeadIdentity(
                            user_id=None,
                            anonymous_id=None,
                            email=None,
                            phone=None,
                            telegram_id=telegram_user_id
                        )
                        lead = Lead.create(
                            identity=identity,
                            source=LeadSource('telegram')
                        )
                    
                    # Добавляем событие в timeline
                    timeline_event = TimelineEvent(
                        event_type='tg_subscribe_confirmed',
                        occurred_at=datetime.now(pytz.UTC),
                        metadata={
                            'source': 'telegram',
                            'properties': {
                                'telegram_user_id': telegram_user_id,
                                'username': username
                            },
                            'deep_link_id': deep_link_id
                        }
                    )
                    lead.add_timeline_event(timeline_event)
                    await self._lead_repository.save(lead)
                
                # Отправка приветственного сообщения
                await self._telegram_adapter.send_welcome_message(
                    user_id=int(telegram_user_id),
                    deep_link_id=deep_link_id
                )
                
                return {'success': True, 'action': 'welcome_sent'}
            
            elif text.startswith('/stop'):
                # Обработка команды /stop - отписка от уведомлений
                # Ищем Lead по telegram_id
                identity = LeadIdentity(
                    user_id=None,
                    anonymous_id=None,
                    email=None,
                    phone=None,
                    telegram_id=telegram_user_id
                )
                
                # Пытаемся найти существующий Lead
                # В реальной реализации нужен метод find_by_telegram_id в репозитории
                # Временная реализация - ищем через все лиды
                leads = await self._lead_repository.find_by_status(LeadStatus.NEW)
                lead = None
                for l in leads:
                    if l.identity.telegram_id == telegram_user_id:
                        lead = l
                        break
                
                if not lead:
                    # Если Lead не найден, создаем новый для отслеживания отписки
                    lead = Lead.create(
                        identity=identity,
                        source=LeadSource('telegram')
                    )
                
                # Добавляем событие отписки
                timeline_event = TimelineEvent(
                    event_type='tg_series_stopped',
                    occurred_at=datetime.now(pytz.UTC),
                    metadata={
                        'source': 'telegram',
                        'properties': {
                            'telegram_user_id': telegram_user_id,
                            'stop_method': 'command'
                        }
                    }
                )
                lead.add_timeline_event(timeline_event)
                await self._lead_repository.save(lead)
                
                # Отправляем подтверждение отписки
                await self._telegram_adapter.send_message(
                    user_id=int(telegram_user_id),
                    text="Вы отписались от уведомлений. Если захотите вернуться, просто напишите /start"
                )
                
                return {'success': True, 'action': 'unsubscribed'}
        
        elif 'callback_query' in update:
            # Обработка callback query
            callback_query = update['callback_query']
            data = callback_query.get('data', '')
            from_user = callback_query.get('from', {})
            telegram_user_id = str(from_user.get('id'))
            chat_id = callback_query.get('message', {}).get('chat', {}).get('id')
            message_id = callback_query.get('message', {}).get('message_id')
            
            # Парсинг callback data (формат: action:value или action:value:param)
            parts = data.split(':')
            if len(parts) < 2:
                return {'success': False, 'error': 'Invalid callback data format'}
            
            action = parts[0]
            value = parts[1]
            param = parts[2] if len(parts) > 2 else None
            
            # Обработка различных callback actions
            if action == 'select_topic':
                # Выбор темы (anxiety, burnout, relationships, etc.)
                identity = LeadIdentity(
                    user_id=None,
                    anonymous_id=None,
                    email=None,
                    phone=None,
                    telegram_id=telegram_user_id
                )
                
                # Ищем или создаем Lead
                leads = await self._lead_repository.find_by_status(LeadStatus.NEW)
                lead = None
                for l in leads:
                    if l.identity.telegram_id == telegram_user_id:
                        lead = l
                        break
                
                if not lead:
                    lead = Lead.create(
                        identity=identity,
                        source=LeadSource('telegram'),
                        topic_code=value
                    )
                else:
                    # Обновляем topic_code (если нужно добавить метод update_topic_code)
                    # Временная реализация - добавляем в timeline
                    pass
                
                timeline_event = TimelineEvent(
                    event_type='tg_interaction',
                    occurred_at=datetime.now(pytz.UTC),
                    metadata={
                        'source': 'telegram',
                        'properties': {
                            'action': 'select_topic',
                            'topic': value
                        }
                    }
                )
                lead.add_timeline_event(timeline_event)
                await self._lead_repository.save(lead)
                
                # Отправляем ответ
                await self._telegram_adapter.answer_callback_query(
                    callback_query_id=callback_query.get('id'),
                    text=f"Выбрана тема: {value}"
                )
                
                return {'success': True, 'action': 'topic_selected', 'topic': value}
            
            elif action == 'select_frequency':
                # Выбор частоты уведомлений (weekly_1_2, weekly_3_4, on_demand)
                identity = LeadIdentity(
                    user_id=None,
                    anonymous_id=None,
                    email=None,
                    phone=None,
                    telegram_id=telegram_user_id
                )
                
                leads = await self._lead_repository.find_by_status(LeadStatus.NEW)
                lead = None
                for l in leads:
                    if l.identity.telegram_id == telegram_user_id:
                        lead = l
                        break
                
                if not lead:
                    lead = Lead.create(
                        identity=identity,
                        source=LeadSource('telegram')
                    )
                
                timeline_event = TimelineEvent(
                    event_type='tg_onboarding_completed',
                    occurred_at=datetime.now(pytz.UTC),
                    metadata={
                        'source': 'telegram',
                        'properties': {
                            'frequency': value
                        }
                    }
                )
                lead.add_timeline_event(timeline_event)
                await self._lead_repository.save(lead)
                
                await self._telegram_adapter.answer_callback_query(
                    callback_query_id=callback_query.get('id'),
                    text=f"Частота уведомлений: {value}"
                )
                
                return {'success': True, 'action': 'frequency_selected', 'frequency': value}
            
            elif action == 'confirm':
                # Подтверждение действия
                await self._telegram_adapter.answer_callback_query(
                    callback_query_id=callback_query.get('id'),
                    text="Подтверждено"
                )
                return {'success': True, 'action': 'confirmed'}
            
            else:
                # Неизвестное действие
                await self._telegram_adapter.answer_callback_query(
                    callback_query_id=callback_query.get('id'),
                    text="Неизвестное действие"
                )
                return {'success': False, 'error': f'Unknown action: {action}'}
        
        return {'success': True, 'action': 'processed'}
