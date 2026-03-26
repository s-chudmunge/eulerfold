import os
import time
import requests
import urllib.parse

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}
DELAY = 1.5
RETRY_COUNT = 3
TIMEOUT = 30
BASE_DIR = "Papers"

# Pages to query:
pages = [
    ("AMC_10_Problems_and_Solutions", "AMC"),
    ("AMC_12_Problems_and_Solutions", "AMC"),
    ("AIME_Problems_and_Solutions", "AIME"),
    ("USAMO_Problems_and_Solutions", "USAMO"),
    ("AMC_8_Problems_and_Solutions", "AMC"),
]

def get_aops_pdf_links(page_title):
    url = "https://artofproblemsolving.com/wiki/api.php"
    params = {
        "action": "parse",
        "page": page_title,
        "prop": "externallinks",
        "format": "json"
    }
    try:
        time.sleep(DELAY)
        r = requests.get(url, params=params, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
        links = data.get("parse", {}).get("externallinks", [])
        return [l for l in links if ".pdf" in l.lower()]
    except Exception as e:
        print(f"  [!] API error for {page_title}: {e}")
        return []

def download_file(url, folder):
    filename = os.path.basename(urllib.parse.unquote(url.split('?')[0]))
    # Add prefix to ensure uniqueness if needed, but keeping it simple for now
    save_path = os.path.join(BASE_DIR, folder, filename)
    
    if os.path.exists(save_path):
        return True

    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    for attempt in range(RETRY_COUNT):
        try:
            time.sleep(DELAY)
            print(f"    [>] Fetching: {url}")
            r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)
            if r.status_code == 404:
                return False
            r.raise_for_status()
            with open(save_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"    [+] Saved: {filename}")
            return True
        except Exception as e:
            if attempt == RETRY_COUNT - 1:
                print(f"    [!] Failed {url}: {e}")
    return False

if __name__ == "__main__":
    print("\n--- Downloading USA Math Papers via AoPS API ---")
    for page_title, folder in pages:
        print(f"\nProcessing {page_title}...")
        links = get_aops_pdf_links(page_title)
        print(f"  Found {len(links)} PDF links.")
        
        success_count = 0
        for link in links:
            if download_file(link, folder):
                success_count += 1
        
        print(f"  Finished {page_title}: {success_count} files captured.")
