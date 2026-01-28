from django.apps import AppConfig


class PersistenceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'infrastructure.persistence'
    label = 'persistence'
    
    def ready(self):
        # Импортируем все модели для регистрации в Django
        from . import django_models  # noqa
