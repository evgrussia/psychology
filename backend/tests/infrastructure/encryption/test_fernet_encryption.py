"""
Unit тесты для FernetEncryptionService.
"""
import pytest
from cryptography.fernet import Fernet
from infrastructure.encryption.fernet_encryption import FernetEncryptionService


class TestFernetEncryptionService:
    """Unit тесты для FernetEncryptionService."""
    
    @pytest.fixture
    def encryption_service(self):
        key = Fernet.generate_key()
        return FernetEncryptionService(key=key)
    
    def test_encrypt_and_decrypt(self, encryption_service):
        """Тест шифрования и расшифровки."""
        plaintext = "Test data to encrypt"
        
        encrypted = encryption_service.encrypt(plaintext)
        decrypted = encryption_service.decrypt(encrypted)
        
        assert decrypted == plaintext
        assert encrypted != plaintext
    
    def test_encrypt_different_data_produces_different_ciphertext(self, encryption_service):
        """Тест, что разные данные дают разный ciphertext."""
        data1 = "Data 1"
        data2 = "Data 2"
        
        encrypted1 = encryption_service.encrypt(data1)
        encrypted2 = encryption_service.encrypt(data2)
        
        assert encrypted1 != encrypted2
    
    def test_decrypt_invalid_ciphertext_raises_error(self, encryption_service):
        """Тест, что расшифровка невалидного ciphertext вызывает ошибку."""
        invalid_ciphertext = "invalid_ciphertext"
        
        with pytest.raises(Exception):
            encryption_service.decrypt(invalid_ciphertext)
