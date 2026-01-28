# Migration: MFA (TOTP) fields for UserModel — FIX-P0-01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('persistence', '0006_contentitem_excerpt_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='usermodel',
            name='mfa_secret_encrypted',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='usermodel',
            name='mfa_enabled',
            field=models.BooleanField(default=False),
        ),
    ]
