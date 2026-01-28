"""
Identity & Access Context.
"""
from domain.identity.aggregates.user import User, UserId
from domain.identity.entities.consent import Consent, ConsentId
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber
from domain.identity.value_objects.role import Role
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.consent_type import ConsentType

__all__ = [
    'User',
    'UserId',
    'Consent',
    'ConsentId',
    'Email',
    'PhoneNumber',
    'Role',
    'UserStatus',
    'ConsentType',
]
