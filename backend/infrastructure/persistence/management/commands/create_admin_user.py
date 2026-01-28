"""
Создание пользователя с ролью для админ-панели (owner / assistant / editor).

Использование:
  python manage.py create_admin_user admin@example.com 'SecurePass123!'
  python manage.py create_admin_user admin@example.com 'SecurePass123!' --role assistant
  python manage.py create_admin_user admin@example.com 'SecurePass123!' --grant-consent

Роли: owner (полный доступ), assistant (встречи/лиды), editor (контент/модерация).
Пароль должен соответствовать правилам: мин. 12 символов, заглавная/строчная/цифра/спецсимвол.
"""
from asgiref.sync import async_to_sync
from django.core.management.base import BaseCommand

from domain.identity.value_objects.email import Email
from domain.identity.aggregates.user import User
from domain.identity.value_objects.role import Role
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.persistence.django_models.role import UserRoleModel
from infrastructure.events.in_memory_event_bus import InMemoryEventBus
from infrastructure.identity.password_service import PasswordService


ADMIN_ROLES = {
    'owner': Role.OWNER,
    'assistant': Role.ASSISTANT,
    'editor': Role.EDITOR,
}


class Command(BaseCommand):
    help = 'Создать пользователя с ролью owner/assistant/editor для входа в админ-панель'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email пользователя')
        parser.add_argument('password', type=str, help='Пароль (мин. 12 символов, сложность по правилам)')
        parser.add_argument(
            '--role',
            type=str,
            default='owner',
            choices=list(ADMIN_ROLES),
            help='Роль: owner (по умолчанию), assistant, editor',
        )
        parser.add_argument(
            '--grant-consent',
            action='store_true',
            help='Выдать согласие на обработку ПДн (personal_data)',
        )

    def handle(self, *args, **options):
        email = options['email'].strip().lower()
        password = options['password']
        role_code = options['role']
        grant_consent = options['grant_consent']

        if not email:
            self.stderr.write(self.style.ERROR('Email не может быть пустым.'))
            return

        repo = DjangoUserRepository(event_bus=InMemoryEventBus())
        existing = async_to_sync(repo.find_by_email)(Email(email))
        user_id_for_consent = None
        if existing:
            # Обновить роль существующего пользователя
            self.stdout.write(f'Пользователь {email} уже существует. Обновляю роль на {role_code}...')
            UserRoleModel.objects.filter(user_id=existing.id.value).delete()
            UserRoleModel.objects.get_or_create(
                user_id=existing.id.value,
                role_id=role_code,
            )
            pw_service = PasswordService()
            pw_service.hash_password(password)  # validate
            repo.set_password_hash(existing.id.value, pw_service.hash_password(password))
            self.stdout.write(self.style.SUCCESS(f'Роль обновлена, пароль установлен. ID: {existing.id.value}'))
            user_id_for_consent = existing.id.value
        else:
            user = User.create(email=Email(email))
            async_to_sync(repo.save)(user)
            user.assign_role(ADMIN_ROLES[role_code])
            async_to_sync(repo.save)(user)
            pw_service = PasswordService()
            try:
                hashed = pw_service.hash_password(password)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Пароль не прошёл валидацию: {e}'))
                return
            repo.set_password_hash(user.id.value, hashed)
            self.stdout.write(self.style.SUCCESS(f'Пользователь создан: {email}, роль: {role_code}, ID: {user.id.value}'))
            user_id_for_consent = user.id.value

        if grant_consent and user_id_for_consent:
            from infrastructure.persistence.repositories.consent_repository import DjangoConsentRepository
            consent_repo = DjangoConsentRepository()
            consent_repo.grant_consent(
                user_id=user_id_for_consent,
                consent_type='personal_data',
                version='2026-01-26',
                source='admin',
            )
            self.stdout.write(self.style.SUCCESS('Согласие personal_data выдано.'))

        self.stdout.write('')
        self.stdout.write('Вход в админку: войдите на сайте под этим email и паролем, затем откройте раздел «Админка».')
