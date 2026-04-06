import os
import json
import asyncio
import httpx
from supabase import create_client
from dotenv import load_dotenv

# Load Supabase credentials
load_dotenv("frontend/.env")

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in frontend/.env")
    exit(1)

supabase = create_client(url, key)

def extract_urls(plan):
    urls = []
    if not plan:
        return urls
    
    # plan can be a dict or a JSON string
    if isinstance(plan, str):
        try:
            plan = json.loads(plan)
        except json.JSONDecodeError:
            return urls
    
    if not isinstance(plan, dict):
        return urls

    # Links are usually in modules -> resources -> url
    modules = plan.get('modules', [])
    if not isinstance(modules, list):
        return urls

    for module in modules:
        # Check module-level resources
        resources = module.get('resources', [])
        if isinstance(resources, list):
            for res in resources:
                if isinstance(res, dict) and res.get('url'):
                    urls.append(res['url'])
        
        # Check topic-level resources (if any)
        topics = module.get('topics', [])
        if isinstance(topics, list):
            for topic in topics:
                t_resources = topic.get('resources', [])
                if isinstance(t_resources, list):
                    for res in t_resources:
                        if isinstance(res, dict) and res.get('url'):
                            urls.append(res['url'])
                
                # Check for YouTube IDs which are also links in spirit
                yt_id = topic.get('youtube_video_id')
                if yt_id:
                    urls.append(f"https://www.youtube.com/watch?v={yt_id}")

    return list(set(urls))

async def check_link(client, url):
    """Checks if a URL is reachable."""
    try:
        # Use a realistic User-Agent to avoid blocking
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
        }
        
        # Try HEAD first for efficiency
        try:
            response = await client.head(url, headers=headers, timeout=10.0, follow_redirects=True)
            if response.status_code < 400:
                return url, "OK"
        except:
            pass # Fall back to GET if HEAD fails (some servers block HEAD)

        response = await client.get(url, headers=headers, timeout=15.0, follow_redirects=True)
        if response.status_code >= 400:
            return url, f"HTTP {response.status_code}"
        return url, "OK"
    except httpx.TimeoutException:
        return url, "Timeout"
    except httpx.ConnectError:
        return url, "Connection Error"
    except Exception as e:
        return url, f"Error: {str(e)}"

async def main():
    print("--- EulerFold Roadmap Link Checker ---")
    print("Fetching public roadmaps from database...")
    
    res = supabase.table("roadmaps") \
        .select("id, title, roadmap_plan") \
        .eq("is_public", True) \
        .order("created_at", desc=True) \
        .limit(100) \
        .execute()
    
    if not res.data:
        print("No public roadmaps found.")
        return

    print(f"Found {len(res.data)} public roadmaps. Analyzing links...\n")
    
    all_broken_report = []
    
    async with httpx.AsyncClient() as client:
        for r in res.data:
            urls = extract_urls(r.get('roadmap_plan'))
            if not urls:
                print(f"Roadmap: {r['title']} (ID: {r['id']}) - No links found.")
                continue
                
            print(f"Roadmap: {r['title']} (ID: {r['id']}) - Checking {len(urls)} links...")
            
            # Use a semaphore to limit concurrency if checking many links at once
            semaphore = asyncio.Semaphore(5) # max 5 parallel checks per roadmap
            
            async def bounded_check(url):
                async with semaphore:
                    return await check_link(client, url)

            tasks = [bounded_check(url) for url in urls]
            results = await asyncio.gather(*tasks)
            
            broken_links = []
            for url, status in results:
                if status != "OK":
                    broken_links.append((url, status))
            
            if broken_links:
                print(f"  \033[91mFound {len(broken_links)} broken links:\033[0m")
                for url, status in broken_links:
                    print(f"    - [{status}] {url}")
                all_broken_report.append({
                    "id": r['id'],
                    "title": r['title'],
                    "broken": broken_links
                })
            else:
                print("  \033[92mAll links are healthy.\033[0m")
            print("-" * 50)

    # Final Summary
    print("\n" + "=" * 50)
    print("FINAL SUMMARY OF BROKEN LINKS")
    print("=" * 50)
    
    if not all_broken_report:
        print("\033[92mCongratulations! No broken links found across all analyzed public roadmaps.\033[0m")
    else:
        print(f"\033[91mAction required: {len(all_broken_report)} roadmaps have broken links.\033[0m")
        for r in all_broken_report:
            print(f"\n{r['title']} (ID: {r['id']}):")
            for url, status in r['broken']:
                print(f"  - [{status}] {url}")

if __name__ == "__main__":
    asyncio.run(main())
