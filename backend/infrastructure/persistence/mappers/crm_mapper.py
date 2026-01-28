"""
Mapper для преобразования CRM/Analytics Domain Entities ↔ DB Records.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from domain.analytics.aggregates.lead import Lead, LeadId
from domain.analytics.value_objects.lead_status import LeadStatus
from domain.analytics.value_objects.lead_source import LeadSource
from domain.analytics.value_objects.lead_identity import LeadIdentity
from domain.analytics.value_objects.timeline_event import TimelineEvent
from domain.analytics.value_objects.utm_params import UTMParams
from domain.identity.aggregates.user import UserId
from infrastructure.persistence.django_models.crm import LeadModel


class CRMMapper:
    """Mapper для преобразования Lead Domain Entity ↔ DB Record."""
    
    @staticmethod
    def to_domain(record: LeadModel) -> Lead:
        """Преобразовать DB Record → Domain Entity."""
        # Восстановление LeadIdentity Value Object
        identity_data = record.identity_data or {}
        identity = LeadIdentity(
            user_id=UserId(identity_data['user_id']) if identity_data.get('user_id') else None,
            anonymous_id=identity_data.get('anonymous_id'),
            email=identity_data.get('email'),
            phone=identity_data.get('phone'),
            telegram_id=identity_data.get('telegram_id')
        )
        
        # Восстановление Value Objects
        source = LeadSource(record.source)
        status = LeadStatus(record.status)
        
        # Восстановление UTMParams (если есть)
        utm_params = None
        if record.utm_params:
            utm_data = record.utm_params
            utm_params = UTMParams(
                source=utm_data.get('source'),
                medium=utm_data.get('medium'),
                campaign=utm_data.get('campaign'),
                term=utm_data.get('term'),
                content=utm_data.get('content')
            )
        
        # Восстановление TimelineEvent list
        timeline = []
        for event_data in (record.timeline_events or []):
            occurred_at = event_data.get('occurred_at')
            if isinstance(occurred_at, str):
                occurred_at = datetime.fromisoformat(occurred_at.replace('Z', '+00:00'))
            elif occurred_at is None:
                occurred_at = datetime.now(timezone.utc)
            
            timeline.append(TimelineEvent(
                event_type=event_data['event_type'],
                occurred_at=occurred_at,
                metadata=event_data.get('metadata', {})
            ))
        
        # Восстановление агрегата через конструктор
        return Lead(
            id=LeadId(record.id),
            identity=identity,
            source=source,
            status=status,
            utm_params=utm_params,
            timeline=timeline,
            created_at=record.created_at
        )
    
    @staticmethod
    def to_persistence(lead: Lead) -> Dict[str, Any]:
        """Преобразовать Domain Entity → DB Record."""
        # Используем свойства для доступа к полям
        identity = lead.identity
        utm_params = lead.utm_params
        timeline = lead.timeline
        created_at = getattr(lead, '_created_at', None)
        
        # Сериализация LeadIdentity
        identity_data = {
            'user_id': str(identity.user_id.value) if identity.user_id else None,
            'anonymous_id': getattr(identity, '_anonymous_id', None),
            'email': getattr(identity, '_email', None),
            'phone': getattr(identity, '_phone', None),
            'telegram_id': getattr(identity, '_telegram_id', None),
        }
        
        # Сериализация UTMParams (если есть)
        utm_params_data = None
        if utm_params:
            utm_params_data = {
                'source': utm_params.source,
                'medium': utm_params.medium,
                'campaign': utm_params.campaign,
                'term': getattr(utm_params, '_term', None),
                'content': getattr(utm_params, '_content', None),
            }
        
        # Сериализация TimelineEvent list
        timeline_events = []
        for event in timeline:
            timeline_events.append({
                'event_type': event.event_type,
                'occurred_at': event.occurred_at.isoformat() if hasattr(event.occurred_at, 'isoformat') else str(event.occurred_at),
                'metadata': getattr(event, '_metadata', {})
            })
        
        return {
            'id': lead.id.value,
            'identity_data': identity_data,
            'source': lead.source.value,
            'status': lead.status.value,
            'utm_params': utm_params_data,
            'timeline_events': timeline_events,
        }
