"""
Mapper для преобразования UGC Moderation Domain Entities ↔ DB Records.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from domain.ugc_moderation.aggregates.moderation_item import ModerationItem, ModerationItemId
from domain.ugc_moderation.value_objects.moderation_status import ModerationStatus
from domain.ugc_moderation.value_objects.ugc_content_type import UGCContentType
from domain.ugc_moderation.value_objects.trigger_flag import TriggerFlag
from domain.ugc_moderation.entities.moderation_action import ModerationAction, ModerationActionId
from domain.ugc_moderation.entities.answer import Answer, AnswerId
from domain.identity.aggregates.user import UserId
from infrastructure.persistence.django_models.moderation import ModerationItemModel
from application.interfaces.encryption import IEncryptionService


class ModerationMapper:
    """Mapper для преобразования ModerationItem Domain Entity ↔ DB Record."""
    
    @staticmethod
    def to_domain(record: ModerationItemModel) -> ModerationItem:
        """Преобразовать DB Record → Domain Entity."""
        from infrastructure.encryption.fernet_encryption import FernetEncryptionService
        encryption_service = FernetEncryptionService()
        
        # Расшифровка P2 данных (контент уже зашифрован в БД)
        # В доменной модели content хранится как зашифрованная строка
        content_encrypted = record.content_encrypted
        
        # Восстановление Value Objects
        content_type = UGCContentType(record.content_type)
        status = ModerationStatus(record.status)
        
        # Восстановление TriggerFlag list
        trigger_flags = [
            TriggerFlag(flag) for flag in (record.trigger_flags or [])
        ]
        
        # Восстановление ModerationAction list
        actions = []
        for action_data in (record.actions or []):
            from domain.ugc_moderation.value_objects.moderation_decision import ModerationDecision
            created_at = action_data.get('created_at')
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            elif created_at is None:
                created_at = datetime.now(timezone.utc)
            
            action = ModerationAction(
                id=ModerationActionId(action_data['id']),
                moderator_id=UserId(action_data['moderator_id']),
                decision=ModerationDecision(action_data['decision']),
                created_at=created_at
            )
            actions.append(action)
        
        # Восстановление Answer (если есть)
        answer = None
        if record.answer_data:
            answer_data = record.answer_data
            created_at = answer_data.get('created_at')
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            elif created_at is None:
                created_at = datetime.now(timezone.utc)
            
            answer = Answer(
                id=AnswerId(answer_data['id']),
                author_id=UserId(answer_data['author_id']),
                content=answer_data['content'],  # Уже зашифрованное содержимое
                created_at=created_at
            )
        
        # Восстановление агрегата через конструктор
        return ModerationItem(
            id=ModerationItemId(record.id),
            content_type=content_type,
            content=content_encrypted,  # Зашифрованное содержимое
            author_id=UserId(record.author_id) if record.author_id else None,
            status=status,
            trigger_flags=trigger_flags,
            actions=actions,
            answer=answer,
            created_at=record.created_at
        )
    
    @staticmethod
    def to_persistence(item: ModerationItem) -> Dict[str, Any]:
        """Преобразовать Domain Entity → DB Record."""
        # Получаем приватные поля
        content_encrypted = getattr(item, '_content', None)
        trigger_flags = item.trigger_flags  # Используем свойство
        actions = item.actions  # Используем свойство
        answer = getattr(item, '_answer', None)
        author_id = getattr(item, '_author_id', None)
        
        # Сериализация ModerationAction list
        actions_data = []
        for action in actions:
            created_at = getattr(action, '_created_at', None)
            actions_data.append({
                'id': str(action.id.value),
                'moderator_id': str(action.moderator_id.value),
                'decision': action.decision.value,
                'created_at': created_at.isoformat() if created_at and hasattr(created_at, 'isoformat') else None
            })
        
        # Сериализация Answer (если есть)
        answer_data = None
        if answer:
            created_at = getattr(answer, '_created_at', None)
            answer_data = {
                'id': str(answer.id.value),
                'author_id': str(answer.author_id.value),
                'content': getattr(answer, '_content', None),  # Уже зашифрованное содержимое
                'created_at': created_at.isoformat() if created_at and hasattr(created_at, 'isoformat') else None
            }
        
        return {
            'id': item.id.value,
            'content_type': item.content_type.value,
            'content_encrypted': content_encrypted,
            'author_id': author_id.value if author_id else None,
            'status': item.status.value,
            'trigger_flags': [flag.value for flag in trigger_flags],
            'actions': actions_data,
            'answer_data': answer_data,
        }
