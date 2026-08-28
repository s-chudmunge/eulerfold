import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

# Check table definition
cur.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'curated_videos';
""")
print("curated_videos columns:", cur.fetchall())

# Create RPC
rpc_sql = """
CREATE OR REPLACE FUNCTION match_curated_videos(
    query_embedding vector(768),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    video_id text,
    topic text,
    clean_title text,
    channel text,
    duration_mins int,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cv.video_id,
        cv.topic,
        cv.clean_title,
        cv.channel,
        cv.duration_mins,
        1 - (cv.topic_embedding <=> query_embedding) AS similarity
    FROM curated_videos cv
    WHERE 1 - (cv.topic_embedding <=> query_embedding) > match_threshold
    ORDER BY cv.topic_embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
"""
cur.execute(rpc_sql)
conn.commit()
print("RPC match_curated_videos created successfully!")
