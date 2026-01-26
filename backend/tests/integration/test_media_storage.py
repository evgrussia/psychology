"""
Integration тесты для медиа-хранилища.
"""
import pytest
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
import os
import tempfile

from infrastructure.storage.local_storage import LocalMediaStorage


@pytest.mark.django_db
class TestMediaStorage(TestCase):
    """Integration тесты для LocalMediaStorage."""
    
    def setUp(self):
        self.storage = LocalMediaStorage()
        # Использовать временную директорию для тестов
        self.test_dir = tempfile.mkdtemp()
        self.storage.location = self.test_dir
    
    def tearDown(self):
        # Очистить временную директорию
        import shutil
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
    
    def test_save_file(self):
        """Тест сохранения файла."""
        # Arrange
        file_content = b"test file content"
        file_name = "test_file.txt"
        
        # Act
        saved_path = self.storage.save(file_name, SimpleUploadedFile(file_name, file_content))
        
        # Assert
        assert saved_path == file_name
        full_path = os.path.join(self.test_dir, file_name)
        assert os.path.exists(full_path)
        
        with open(full_path, 'rb') as f:
            assert f.read() == file_content
    
    def test_get_unique_filename_on_conflict(self):
        """Тест генерации уникального имени при конфликте."""
        # Arrange
        file_content = b"test file content"
        file_name = "test_file.txt"
        
        # Сохранить первый файл
        self.storage.save(file_name, SimpleUploadedFile(file_name, file_content))
        
        # Act - попытка сохранить файл с тем же именем
        saved_path = self.storage.save(file_name, SimpleUploadedFile(file_name, file_content))
        
        # Assert - должно быть сгенерировано новое имя
        assert saved_path != file_name
        assert saved_path.startswith("test_file_")
        assert saved_path.endswith(".txt")
        
        # Проверить, что оба файла существуют
        full_path1 = os.path.join(self.test_dir, file_name)
        full_path2 = os.path.join(self.test_dir, saved_path)
        assert os.path.exists(full_path1)
        assert os.path.exists(full_path2)
    
    def test_file_exists(self):
        """Тест проверки существования файла."""
        # Arrange
        file_content = b"test file content"
        file_name = "test_file.txt"
        
        # Act & Assert - файл не существует
        assert not self.storage.exists(file_name)
        
        # Сохранить файл
        self.storage.save(file_name, SimpleUploadedFile(file_name, file_content))
        
        # Act & Assert - файл существует
        assert self.storage.exists(file_name)
    
    def test_delete_file(self):
        """Тест удаления файла."""
        # Arrange
        file_content = b"test file content"
        file_name = "test_file.txt"
        saved_path = self.storage.save(file_name, SimpleUploadedFile(file_name, file_content))
        full_path = os.path.join(self.test_dir, saved_path)
        
        assert os.path.exists(full_path)
        
        # Act
        self.storage.delete(saved_path)
        
        # Assert
        assert not os.path.exists(full_path)
        assert not self.storage.exists(saved_path)
