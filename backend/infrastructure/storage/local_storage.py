"""
Локальное хранилище для медиа-файлов.
"""
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import os


class LocalMediaStorage(FileSystemStorage):
    """
    Локальное хранилище для медиа-файлов.
    """
    def __init__(self, location=None, base_url=None):
        if location is None:
            location = settings.MEDIA_ROOT
        if base_url is None:
            base_url = settings.MEDIA_URL
        super().__init__(location, base_url)
    
    def get_available_name(self, name, max_length=None):
        """
        Генерирует уникальное имя файла, если файл уже существует.
        """
        if self.exists(name):
            name_base, name_ext = os.path.splitext(name)
            counter = 1
            while self.exists(f"{name_base}_{counter}{name_ext}"):
                counter += 1
            name = f"{name_base}_{counter}{name_ext}"
        return name
