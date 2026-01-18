
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chatthread',
            name='uuid',
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
    ]
