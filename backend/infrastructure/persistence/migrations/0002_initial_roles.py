# Generated migration for initial roles

from django.db import migrations


def create_initial_roles(apps, schema_editor):
    """Создать начальные роли: owner, assistant, editor, client."""
    RoleModel = apps.get_model('persistence', 'RoleModel')
    
    # Admin scope roles
    RoleModel.objects.get_or_create(code='owner', defaults={'scope': 'admin'})
    RoleModel.objects.get_or_create(code='assistant', defaults={'scope': 'admin'})
    RoleModel.objects.get_or_create(code='editor', defaults={'scope': 'admin'})
    
    # Product scope roles
    RoleModel.objects.get_or_create(code='client', defaults={'scope': 'product'})


def reverse_initial_roles(apps, schema_editor):
    """Удалить начальные роли."""
    RoleModel = apps.get_model('persistence', 'RoleModel')
    RoleModel.objects.filter(code__in=['owner', 'assistant', 'editor', 'client']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('persistence', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_roles, reverse_initial_roles),
    ]
