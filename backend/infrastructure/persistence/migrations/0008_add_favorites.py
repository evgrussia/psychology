# Migration: Favorites (аптечка) — FIX-P0-02

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('persistence', '0007_add_user_mfa_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='FavoriteModel',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('user_id', models.UUIDField(db_index=True)),
                ('resource_type', models.CharField(
                    choices=[
                        ('article', 'Article'),
                        ('resource', 'Resource'),
                        ('ritual', 'Ritual'),
                    ],
                    max_length=50,
                )),
                ('resource_id', models.CharField(db_index=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
            ],
            options={
                'db_table': 'favorites',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='favoritemodel',
            constraint=models.UniqueConstraint(
                fields=('user_id', 'resource_type', 'resource_id'),
                name='unique_user_resource_favorite',
            ),
        ),
        migrations.AddIndex(
            model_name='favoritemodel',
            index=models.Index(fields=['user_id', 'created_at'], name='favorites_user_id_created_idx'),
        ),
    ]
