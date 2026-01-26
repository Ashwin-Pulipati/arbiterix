import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from services.users_service import create_user
from domain.users.schemas import UserCreate
from django.contrib.auth import get_user_model

User = get_user_model()

def init_data():
    print("Flushing database...")
    # We rely on previous manual flush or do it here?
    # Better to run management command separately or call it.
    from django.core.management import call_command
    call_command('flush', '--no-input')
    print("Database flushed.")

    print("Creating users...")
    
    # Create demo user
    try:
        demo = create_user(UserCreate(username="demo", password="password", role="admin"))
        print(f"Created user: demo (ID: {demo.id})")
    except Exception as e:
        print(f"Failed to create demo: {e}")

    # Create ashwin user
    try:
        ashwin = create_user(UserCreate(username="ashwin", password="password", role="admin"))
        print(f"Created user: ashwin (ID: {ashwin.id})")
    except Exception as e:
        print(f"Failed to create ashwin: {e}")

if __name__ == "__main__":
    init_data()
