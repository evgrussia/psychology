# Generated for Phase 0 content filling (excerpt, category)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('persistence', '0005_add_availability_slots'),
    ]

    operations = [
        migrations.AddField(
            model_name='contentitemmodel',
            name='excerpt',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AddField(
            model_name='contentitemmodel',
            name='category',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
    ]
