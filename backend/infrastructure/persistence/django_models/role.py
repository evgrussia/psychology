"""
Django ORM модель для Role.
"""
from django.db import models
import uuid


class RoleModel(models.Model):
    """
    Django ORM модель для Role (из Domain Layer).
    """
    code = models.CharField(primary_key=True, max_length=50)
    scope = models.CharField(
        max_length=20,
        choices=[
            ('admin', 'Admin'),
            ('product', 'Product'),
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roles'


class UserRoleModel(models.Model):
    """
    Many-to-Many связь User <-> Role.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('UserModel', on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey('RoleModel', on_delete=models.CASCADE, related_name='user_roles')
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_roles'
        unique_together = [['user', 'role']]
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['role']),
        ]
