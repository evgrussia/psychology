"""
Mapper для преобразования User Domain Entity ↔ DB Record.
"""
from typing import Dict, Any, List
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber
from domain.identity.value_objects.role import Role
from domain.identity.entities.consent import Consent, ConsentId
from domain.identity.value_objects.consent_type import ConsentType
from infrastructure.persistence.django_models.user import UserModel
from infrastructure.persistence.django_models.consent import ConsentModel
from infrastructure.persistence.django_models.role import UserRoleModel


class UserMapper:
    """Mapper для преобразования User Domain Entity ↔ DB Record."""
    
    @staticmethod
    def to_domain(model: UserModel, roles: List[UserRoleModel], consents: List[ConsentModel]) -> User:
        """Преобразовать DB Record → Domain Entity."""
        domain_roles = [Role(role_model.role.code, role_model.role.scope) for role_model in roles]
        
        domain_consents = []
        for consent_model in consents:
            consent = Consent(
                id=ConsentId(consent_model.id),
                consent_type=ConsentType(consent_model.consent_type),
                version=consent_model.version,
                source=consent_model.source,
                granted_at=consent_model.granted_at,
                revoked_at=consent_model.revoked_at
            )
            domain_consents.append(consent)
        
        return User(
            id=UserId(model.id),
            email=Email(model.email) if model.email else None,
            phone=PhoneNumber(model.phone) if model.phone else None,
            telegram_user_id=model.telegram_user_id,
            display_name=model.display_name,
            status=UserStatus(model.status),
            roles=domain_roles,
            consents=domain_consents,
            created_at=model.created_at,
            mfa_enabled=getattr(model, 'mfa_enabled', False)
        )
    
    @staticmethod
    def to_persistence(user: User) -> Dict[str, Any]:
        """Преобразовать Domain Entity → DB Record (словарь для Django ORM)."""
        return {
            'id': user.id.value,
            'email': user.email.value if user.email else None,
            'phone': user.phone.value if user.phone else None,
            'telegram_user_id': user.telegram_user_id,
            'display_name': user.display_name,
            'status': user.status.value,
            'mfa_enabled': getattr(user, 'mfa_enabled', False),
        }
