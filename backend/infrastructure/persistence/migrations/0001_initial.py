# Generated migration for initial models

from django.db import migrations, models
import uuid
import django.contrib.auth.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='RoleModel',
            fields=[
                ('code', models.CharField(max_length=50, primary_key=True, serialize=False)),
                ('scope', models.CharField(choices=[('admin', 'Admin'), ('product', 'Product')], max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'roles',
            },
        ),
        migrations.CreateModel(
            name='UserModel',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField(blank=True, max_length=254, null=True, unique=True)),
                ('phone', models.CharField(blank=True, max_length=20, null=True, unique=True)),
                ('telegram_user_id', models.CharField(blank=True, max_length=255, null=True, unique=True)),
                ('telegram_username', models.CharField(blank=True, max_length=255, null=True)),
                ('display_name', models.CharField(blank=True, max_length=255, null=True)),
                ('password_hash', models.CharField(blank=True, max_length=255, null=True)),
                ('status', models.CharField(choices=[('active', 'Active'), ('blocked', 'Blocked'), ('deleted', 'Deleted')], default='active', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'db_table': 'users',
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='UserRoleModel',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('granted_at', models.DateTimeField(auto_now_add=True)),
                ('role', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_roles', to='persistence.rolemodel')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_roles', to='persistence.usermodel')),
            ],
            options={
                'db_table': 'user_roles',
                'unique_together': {('user', 'role')},
            },
        ),
        migrations.CreateModel(
            name='ConsentModel',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('consent_type', models.CharField(choices=[('personal_data', 'Personal Data'), ('communications', 'Communications'), ('telegram', 'Telegram'), ('review_publication', 'Review Publication')], max_length=50)),
                ('granted', models.BooleanField(default=False)),
                ('version', models.CharField(max_length=50)),
                ('source', models.CharField(choices=[('web', 'Web'), ('telegram', 'Telegram'), ('admin', 'Admin')], max_length=20)),
                ('granted_at', models.DateTimeField(blank=True, null=True)),
                ('revoked_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='consents', to='persistence.usermodel')),
            ],
            options={
                'db_table': 'consents',
                'unique_together': {('user', 'consent_type')},
            },
        ),
        migrations.CreateModel(
            name='AuditLogModel',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('actor_user_id', models.UUIDField(blank=True, db_index=True, null=True)),
                ('actor_role', models.CharField(choices=[('owner', 'Owner'), ('assistant', 'Assistant'), ('editor', 'Editor')], max_length=20)),
                ('action', models.CharField(max_length=100)),
                ('entity_type', models.CharField(max_length=50)),
                ('entity_id', models.UUIDField(blank=True, null=True)),
                ('old_value', models.JSONField(blank=True, null=True)),
                ('new_value', models.JSONField(blank=True, null=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'audit_log',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='usermodel',
            index=models.Index(fields=['email'], name='users_email_idx'),
        ),
        migrations.AddIndex(
            model_name='usermodel',
            index=models.Index(fields=['phone'], name='users_phone_idx'),
        ),
        migrations.AddIndex(
            model_name='usermodel',
            index=models.Index(fields=['telegram_user_id'], name='users_telegram_user_id_idx'),
        ),
        migrations.AddIndex(
            model_name='usermodel',
            index=models.Index(fields=['status'], name='users_status_idx'),
        ),
        migrations.AddIndex(
            model_name='userrolemodel',
            index=models.Index(fields=['user'], name='user_roles_user_idx'),
        ),
        migrations.AddIndex(
            model_name='userrolemodel',
            index=models.Index(fields=['role'], name='user_roles_role_idx'),
        ),
        migrations.AddIndex(
            model_name='consentmodel',
            index=models.Index(fields=['user', 'consent_type'], name='consents_user_consent_type_idx'),
        ),
        migrations.AddIndex(
            model_name='consentmodel',
            index=models.Index(fields=['granted'], name='consents_granted_idx'),
        ),
        migrations.AddIndex(
            model_name='auditlogmodel',
            index=models.Index(fields=['actor_user_id', 'created_at'], name='audit_log_actor_user_id_created_at_idx'),
        ),
        migrations.AddIndex(
            model_name='auditlogmodel',
            index=models.Index(fields=['action'], name='audit_log_action_idx'),
        ),
        migrations.AddIndex(
            model_name='auditlogmodel',
            index=models.Index(fields=['entity_type', 'entity_id'], name='audit_log_entity_type_entity_id_idx'),
        ),
        migrations.AddIndex(
            model_name='auditlogmodel',
            index=models.Index(fields=['created_at'], name='audit_log_created_at_idx'),
        ),
    ]
