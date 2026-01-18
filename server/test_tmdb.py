import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent / "src"))

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from integrations.tmdb_client import tmdb_client

def test_tmdb():
    print("Testing TMDB search...")
    results = tmdb_client.search_movie("Lord of the Rings", limit=3)
    print(f"Found {len(results)} movies.")
    for m in results:
        print(f"- {m.get('title')} ({m.get('release_date')})")

if __name__ == "__main__":
    test_tmdb()
