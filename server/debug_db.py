import os
import sys
from pathlib import Path

# Add src to path just like manage.py
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
from django.conf import settings

django.setup()

print(f"DATABASES: {settings.DATABASES}")
print(f"BASE_DIR: {settings.BASE_DIR}")
print(f"Database Name: {settings.DATABASES['default']['NAME']}")
