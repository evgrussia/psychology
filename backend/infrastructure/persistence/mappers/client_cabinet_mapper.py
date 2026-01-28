"""
Mapper для преобразования Client Cabinet Domain Entities ↔ DB Records.
"""
from typing import Dict, Any
from domain.client_cabinet.aggregates.diary_entry import DiaryEntry, DiaryEntryId
from domain.client_cabinet.value_objects.diary_type import DiaryType
from domain.identity.aggregates.user import UserId
from infrastructure.persistence.django_models.client_cabinet import DiaryEntryModel
from application.interfaces.encryption import IEncryptionService


class DiaryEntryMapper:
    """Mapper для преобразования DiaryEntry Domain Entity ↔ DB Record."""
    
    @staticmethod
    def to_domain(record: DiaryEntryModel) -> DiaryEntry:
        """Преобразовать DB Record → Domain Entity."""
        from infrastructure.encryption.fernet_encryption import FernetEncryptionService
        encryption_service = FernetEncryptionService()
        
        # Расшифровка P2 данных
        decrypted_content = encryption_service.decrypt(record.content_encrypted)
        
        diary_type = DiaryType(record.diary_type)
        
        return DiaryEntry(
            id=DiaryEntryId(record.id),
            user_id=UserId(record.user_id),
            diary_type=diary_type,
            content=decrypted_content,
            created_at=record.created_at
        )
    
    @staticmethod
    def to_persistence(entry: DiaryEntry) -> Dict[str, Any]:
        """Преобразовать Domain Entity → DB Record."""
        from infrastructure.encryption.fernet_encryption import FernetEncryptionService
        encryption_service = FernetEncryptionService()
        
        # Шифрование P2 данных
        encrypted_content = encryption_service.encrypt(entry.content)
        
        return {
            'id': entry.id.value,
            'user_id': entry.user_id.value,
            'diary_type': entry.diary_type.value,
            'content_encrypted': encrypted_content,
        }
