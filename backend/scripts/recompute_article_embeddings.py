import os
import sys
import glob
import re
import json
import asyncio
import cohere
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(".env")

cohere_client = cohere.AsyncClient(os.environ.get("COHERE_API_KEY"))
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
sb = create_client(url, key)

async def generate_embeddings(texts):
    response = await cohere_client.embed(
        texts=texts,
        model="embed-english-light-v3.0",
        input_type="search_document",
        embedding_types=["float"]
    )
    return response.embeddings.float

async def main():
    print("Deleting old article embeddings...")
    sb.table("content_embeddings").delete().eq("content_type", "article").execute()

    md_files = glob.glob("../content/articles/*.md")
    print(f"Found {len(md_files)} articles.")
    
    for md_file in md_files:
        slug = os.path.basename(md_file).replace(".md", "")
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Simple regex parsing for frontmatter
        title_match = re.search(r'^title:\s*"?([^"\n]+)"?', content, re.MULTILINE)
        subject_match = re.search(r'^subject:\s*"?([^"\n]+)"?', content, re.MULTILINE)
        excerpt_match = re.search(r'^excerpt:\s*"?([^"\n]+)"?', content, re.MULTILINE)
        
        title = title_match.group(1) if title_match else slug
        subject = subject_match.group(1) if subject_match else ""
        excerpt = excerpt_match.group(1) if excerpt_match else ""
        
        text_to_embed = f"{title}\n{subject}\n{excerpt}"
        print(f"Embedding {slug}...")
        try:
            embeds = await generate_embeddings([text_to_embed])
            if embeds:
                vector_str = f"[{','.join(map(str, embeds[0]))}]"
                sb.table("content_embeddings").insert({
                    "id": f"article-{slug}",
                    "content_type": "article",
                    "title": title,
                    "description": excerpt,
                    "slug": slug,
                    "subject": subject,
                    "embedding": vector_str
                }).execute()
        except Exception as e:
            print(f"Error on {slug}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
