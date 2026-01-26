"""
Django ORM реализация IAuditLogRepository.
"""
from typing import List, Optional
from uuid import UUID
from domain.audit.entities import AuditLogEntry
from domain.audit.repositories import IAuditLogRepository
from infrastructure.persistence.django_models.audit_log import AuditLogModel


class DjangoAuditLogRepository(IAuditLogRepository):
    """Django ORM реализация репозитория аудит-лога."""
    
    def save(self, entry: AuditLogEntry) -> AuditLogEntry:
        """Сохранить запись аудит-лога."""
        model = AuditLogModel.objects.create(
            id=entry.id,
            actor_user_id=entry.actor_user_id,
            actor_role=entry.actor_role,
            action=entry.action,
            entity_type=entry.entity_type,
            entity_id=entry.entity_id,
            old_value=entry.old_value,
            new_value=entry.new_value,
            ip_address=entry.ip_address,
            user_agent=entry.user_agent,
            created_at=entry.created_at,
        )
        return self._to_domain(model)
    
    
    def get_by_actor(self, actor_user_id: UUID, limit: int = 100) -> List[AuditLogEntry]:
        """Получить записи по актору."""
        models = AuditLogModel.objects.filter(actor_user_id=actor_user_id).order_by('-created_at')[:limit]
        return [self._to_domain(m) for m in models]
    
    def get_by_entity(self, entity_type: str, entity_id: UUID) -> List[AuditLogEntry]:
        """Получить записи по сущности."""
        models = AuditLogModel.objects.filter(entity_type=entity_type, entity_id=entity_id)
        return [self._to_domain(m) for m in models]
    
    def _to_domain(self, model: AuditLogModel) -> AuditLogEntry:
        """Маппинг Django модели в доменную сущность."""
        return AuditLogEntry(
            id=model.id,
            actor_user_id=model.actor_user_id,
            actor_role=model.actor_role,
            action=model.action,
            entity_type=model.entity_type,
            entity_id=model.entity_id,
            old_value=model.old_value,
            new_value=model.new_value,
            ip_address=str(model.ip_address) if model.ip_address else None,
            user_agent=model.user_agent,
            created_at=model.created_at,
            updated_at=model.created_at,  # AuditLog не имеет updated_at в модели
        )
