"""
Shared Kernel - базовые классы для всех доменов.
"""
from domain.shared.entity_id import EntityId
from domain.shared.domain_event import DomainEvent
from domain.shared.value_object import ValueObject
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.exceptions import (
    DomainError,
    ConflictError,
    BusinessRuleViolationError,
    InvalidStateError
)

__all__ = [
    'EntityId',
    'DomainEvent',
    'ValueObject',
    'AggregateRoot',
    'DomainError',
    'ConflictError',
    'BusinessRuleViolationError',
    'InvalidStateError',
]
