import os
import sys
import glob
import re
import json
import asyncio
import cohere
from supabase import create_client
from dotenv import load_dotenv

# Load env variables from backend/.env or local
load_dotenv("backend/.env")
if not os.environ.get("COHERE_API_KEY"):
    load_dotenv(".env")

COHERE_API_KEY = os.environ.get("COHERE_API_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not COHERE_API_KEY or not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing required environment variables (COHERE_API_KEY, SUPABASE_URL, SUPABASE_KEY).")
    sys.exit(1)

cohere_client = cohere.AsyncClient(COHERE_API_KEY)
sb = create_client(SUPABASE_URL, SUPABASE_KEY)

async def generate_embeddings_batch(texts: list[str]):
    response = await cohere_client.embed(
        texts=texts,
        model="embed-english-light-v3.0",
        input_type="search_document",
        embedding_types=["float"]
    )
    return response.embeddings.float

async def process_articles():
    print("\n--- Processing Articles ---")
    files = sorted(glob.glob("content/articles/*.md"))
    print(f"Found {len(files)} article markdown files.")
    
    items = []
    texts = []
    
    for fpath in files:
        slug = os.path.splitext(os.path.basename(fpath))[0]
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            
        title_match = re.search(r'^title:\s*"?([^"\n]+)"?', content, re.MULTILINE)
        subject_match = re.search(r'^subject:\s*"?([^"\n]+)"?', content, re.MULTILINE)
        excerpt_match = re.search(r'^excerpt:\s*"?([^"\n]+)"?', content, re.MULTILINE)
        
        title = title_match.group(1).strip() if title_match else slug
        subject = subject_match.group(1).strip() if subject_match else "AI & Technology"
        excerpt = excerpt_match.group(1).strip() if excerpt_match else ""
        
        text_to_embed = f"{title}\n{subject}\n{excerpt}".strip()
        items.append({
            "id": f"article-{slug}",
            "content_type": "article",
            "title": title,
            "description": excerpt,
            "slug": slug,
            "subject": subject
        })
        texts.append(text_to_embed)

    # Delete existing article embeddings
    print("Clearing old article embeddings...")
    sb.table("content_embeddings").delete().eq("content_type", "article").execute()

    # Embed and insert in batches of 40
    batch_size = 40
    for i in range(0, len(items), batch_size):
        b_items = items[i:i+batch_size]
        b_texts = texts[i:i+batch_size]
        print(f"Embedding articles {i+1} to {min(i+batch_size, len(items))}...")
        embeds = await generate_embeddings_batch(b_texts)
        
        rows_to_insert = []
        for item, embed in zip(b_items, embeds):
            vector_str = f"[{','.join(map(str, embed))}]"
            rows_to_insert.append({
                **item,
                "embedding": vector_str
            })
        
        sb.table("content_embeddings").insert(rows_to_insert).execute()
        print(f"Inserted {len(rows_to_insert)} articles.")
        await asyncio.sleep(0.5)

async def process_research_decoded():
    print("\n--- Processing Research Decoded ---")
    files = sorted(glob.glob("content/research-decoded/*.md"))
    print(f"Found {len(files)} research-decoded markdown files.")
    
    # Read navigation to get clean subject categories if available
    slug_to_category = {}
    if os.path.exists("frontend/src/app/research-decoded/generatedData.ts"):
        try:
            with open("frontend/src/app/research-decoded/generatedData.ts", "r", encoding="utf-8") as f:
                raw_ts = f.read()
            nav_match = re.search(r'export const navigation = (\[[\s\S]*?\]);\n\nexport const papers', raw_ts)
            if nav_match:
                nav = json.loads(nav_match.group(1))
                for cat in nav:
                    for sec in cat.get("sections", []):
                        slug_to_category[sec["slug"]] = cat["title"]
        except Exception as e:
            print(f"Notice: Could not parse navigation categories: {e}")

    items = []
    texts = []
    
    for fpath in files:
        slug = os.path.splitext(os.path.basename(fpath))[0]
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            
        title_match = re.search(r'^title:\s*"?([^"\n]+)"?', content, re.MULTILINE)
        authors_match = re.search(r'^authors:\s*"?([^"\n]+)"?', content, re.MULTILINE)
        citation_match = re.search(r'^citation:\s*"?([^"\n]+)"?', content, re.MULTILINE)
        
        title = title_match.group(1).strip() if title_match else slug
        authors = authors_match.group(1).strip() if authors_match else ""
        subject = slug_to_category.get(slug, "Research Decoded")
        
        # Extract first paragraph of body as description
        body = re.sub(r'^---[\s\S]*?---\s*', '', content)
        paragraphs = [p.strip() for p in body.split('\n\n') if p.strip() and not p.strip().startswith('#')]
        intro = paragraphs[0] if paragraphs else ""
        description = intro[:300] if intro else authors
        
        text_to_embed = f"{title}\n{subject}\n{authors}\n{description}".strip()
        items.append({
            "id": f"research_decoded-{slug}",
            "content_type": "research_decoded",
            "title": title,
            "description": description,
            "slug": slug,
            "subject": subject
        })
        texts.append(text_to_embed)

    # Delete existing research_decoded embeddings
    print("Clearing old research-decoded embeddings...")
    sb.table("content_embeddings").delete().eq("content_type", "research_decoded").execute()
    sb.table("content_embeddings").delete().eq("content_type", "research").execute()

    batch_size = 40
    for i in range(0, len(items), batch_size):
        b_items = items[i:i+batch_size]
        b_texts = texts[i:i+batch_size]
        print(f"Embedding research papers {i+1} to {min(i+batch_size, len(items))}...")
        embeds = await generate_embeddings_batch(b_texts)
        
        rows_to_insert = []
        for item, embed in zip(b_items, embeds):
            vector_str = f"[{','.join(map(str, embed))}]"
            rows_to_insert.append({
                **item,
                "embedding": vector_str
            })
        
        sb.table("content_embeddings").insert(rows_to_insert).execute()
        print(f"Inserted {len(rows_to_insert)} research papers.")
        await asyncio.sleep(0.5)

async def process_roadmaps():
    print("\n--- Processing Roadmaps ---")
    res = sb.table("roadmaps").select("id, slug, title, subject, description, goal, is_public").execute()
    all_roadmaps = res.data or []
    print(f"Fetched {len(all_roadmaps)} roadmaps from database.")
    
    seen_slugs = set()
    unique_roadmaps = []
    for r in all_roadmaps:
        slug = r.get("slug")
        if not slug or slug in seen_slugs:
            continue
        seen_slugs.add(slug)
        unique_roadmaps.append(r)
        
    print(f"Processing {len(unique_roadmaps)} unique roadmaps.")
    
    items = []
    texts = []
    for r in unique_roadmaps:
        slug = r["slug"]
        title = r.get("title") or slug
        subject = r.get("subject") or "General"
        description = r.get("description") or r.get("goal") or ""
        
        text_to_embed = f"{title}\n{subject}\n{description}".strip()
        items.append({
            "id": f"roadmap-{slug}",
            "content_type": "roadmap",
            "title": title,
            "description": description[:400],
            "slug": slug,
            "subject": subject
        })
        texts.append(text_to_embed)

    print("Clearing old roadmap embeddings...")
    sb.table("content_embeddings").delete().eq("content_type", "roadmap").execute()

    batch_size = 40
    for i in range(0, len(items), batch_size):
        b_items = items[i:i+batch_size]
        b_texts = texts[i:i+batch_size]
        print(f"Embedding roadmaps {i+1} to {min(i+batch_size, len(items))}...")
        embeds = await generate_embeddings_batch(b_texts)
        
        rows_to_insert = []
        for item, embed in zip(b_items, embeds):
            vector_str = f"[{','.join(map(str, embed))}]"
            rows_to_insert.append({
                **item,
                "embedding": vector_str
            })
        
        sb.table("content_embeddings").insert(rows_to_insert).execute()
        print(f"Inserted {len(rows_to_insert)} roadmaps.")
        await asyncio.sleep(0.5)

async def main():
    print("Starting full embedding recalculation...")
    await process_articles()
    await process_research_decoded()
    await process_roadmaps()
    
    # Final count verification
    res = sb.table("content_embeddings").select("id, content_type").execute()
    counts = {}
    for row in res.data:
        c_type = row["content_type"]
        counts[c_type] = counts.get(c_type, 0) + 1
    print("\n=== Recalculation Complete ===")
    print("Content embeddings breakdown:", counts)
    print("Total embeddings in DB:", len(res.data))

if __name__ == "__main__":
    asyncio.run(main())
