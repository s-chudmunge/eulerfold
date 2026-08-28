import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    response = sb.table('curated_videos').select('topic, clean_title, channel, duration_mins').limit(5).execute()
    print(f"Total rows fetched: {len(response.data)}")
    for row in response.data:
        print(f"Topic: {row['topic']} | Video: {row['clean_title']} | Mins: {row['duration_mins']}")
except Exception as e:
    print(f"Error querying table: {e}")
