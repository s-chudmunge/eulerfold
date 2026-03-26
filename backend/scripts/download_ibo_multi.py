import os
import concurrent.futures
import requests
from bs4 import BeautifulSoup
import urllib.parse

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}
TIMEOUT = 120
BASE_DIR = "Papers/IBO"

def download_ibo(url, filename):
    save_path = os.path.join(BASE_DIR, filename)
    if os.path.exists(save_path):
        # Only skip if file is reasonably large (not a failed chunk)
        if os.path.getsize(save_path) > 1000:
            return True

    try:
        print(f"  [>] Starting: {filename}")
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)
        if r.status_code == 200:
            with open(save_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            print(f"    [+] Finished: {filename}")
            return True
        else:
            print(f"    [?] Status {r.status_code} for {filename}")
    except Exception as e:
        print(f"    [!] Error downloading {filename}: {e}")
    return False

def get_ibo_urls():
    index_url = "https://www.ibo-info.org/en/info/papers.html"
    base_url = "https://www.ibo-info.org/"
    try:
        r = requests.get(index_url, headers=HEADERS, timeout=30)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        links = soup.find_all('a', href=True)
        ibo_tasks = []
        for link in links:
            href = link['href']
            if '.pdf' in href.lower():
                full_url = urllib.parse.urljoin(base_url, href)
                filename = os.path.basename(urllib.parse.unquote(href))
                ibo_tasks.append((full_url, filename))
        return ibo_tasks
    except Exception as e:
        print(f"  [!] Failed to get IBO index: {e}")
        return []

if __name__ == "__main__":
    os.makedirs(BASE_DIR, exist_ok=True)
    print("\n--- Multithreaded IBO Downloader ---")
    ibo_tasks = get_ibo_urls()
    print(f"  Found {len(ibo_tasks)} possible IBO papers.")
    
    # User suggested max_workers=3
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        # Wrap tasks in lambda to pass args
        executor.map(lambda args: download_ibo(*args), ibo_tasks)
    
    print("\nIBO Download process complete.")
