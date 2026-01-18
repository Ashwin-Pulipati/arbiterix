import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model

def debug_setup():
    print(f"Base Dir: {settings.BASE_DIR}")
    print(f"Database: {settings.DATABASES['default']['NAME']}")
    
    User = get_user_model()
    print(f"User Model: {User}")
    
    superusers = User.objects.filter(is_superuser=True)
    print(f"Superusers found: {superusers.count()}")
    for u in superusers:
        print(f" - {u.username} (email: {u.email})")

if __name__ == "__main__":
    debug_setup()
