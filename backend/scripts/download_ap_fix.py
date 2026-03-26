import os
import time
import requests
from bs4 import BeautifulSoup
import urllib.parse

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}
DELAY = 1.5
RETRY_COUNT = 3
TIMEOUT = 30
LOG_FILE = "failed_downloads.txt"
BASE_DIR = "Papers/AP"

class APFixDownloader:
    def __init__(self):
        self.stats = {"downloaded": 0, "skipped": 0, "failed": 0}
        os.makedirs(BASE_DIR, exist_ok=True)

    def log_failure(self, url, error):
        with open(LOG_FILE, "a") as f:
            f.write(f"[AP_FIX] {url} - {error}\n")

    def download_file(self, url, save_path):
        if os.path.exists(save_path):
            self.stats["skipped"] += 1
            return True

        for attempt in range(RETRY_COUNT):
            try:
                time.sleep(DELAY)
                response = requests.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)
                if response.status_code == 404:
                    return False
                response.raise_for_status()
                with open(save_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk: f.write(chunk)
                self.stats["downloaded"] += 1
                print(f"    [+] Saved to {save_path}")
                return True
            except Exception as e:
                if attempt == RETRY_COUNT - 1:
                    print(f"    [!] Failed {url}: {e}")
                    self.log_failure(url, str(e))
                    self.stats["failed"] += 1
        return False

    def scrape_collegeboard_direct(self):
        print("\n--- Option A: Scraping College Board Subject Pages Directly ---")
        subjects = [
            "calculus-ab", "calculus-bc", "physics-1", "physics-2", 
            "physics-c-mechanics", "physics-c-electricity-and-magnetism", 
            "chemistry", "biology", "statistics"
        ]
        
        for sub in subjects:
            url = f"https://apcentral.collegeboard.org/courses/ap-{sub}/exam/past-exam-questions"
            print(f"  Scraping: {url}")
            try:
                time.sleep(DELAY)
                response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                links = soup.find_all('a', href=True)
                for link in links:
                    href = link['href']
                    if '/media/pdf/' in href and '.pdf' in href.lower():
                        full_url = urllib.parse.urljoin("https://apcentral.collegeboard.org", href)
                        filename = os.path.basename(urllib.parse.unquote(href))
                        # Rename to standard: AP_physics-1_2024_frq.pdf
                        # Pattern: ap24-frq-calculus-ab.pdf
                        import re
                        match = re.search(r'ap(\d{2})-(frq|sg)-(.*?)\.pdf', filename)
                        if match:
                            yy, type_suffix, sub_name = match.groups()
                            year = f"20{yy}"
                            save_path = os.path.join(BASE_DIR, f"AP_{sub_name}_{year}_{type_suffix}.pdf")
                            self.download_file(full_url, save_path)
                        else:
                            save_path = os.path.join(BASE_DIR, filename)
                            self.download_file(full_url, save_path)
            except Exception as e:
                print(f"    [!] Failed to scrape {sub}: {e}")

    def recover_via_wayback(self):
        print("\n--- Option B: Wayback Machine Recovery for Older Years (2012-2022) ---")
        subjects = [
            "calculus-ab", "calculus-bc", "physics-1", "physics-2", 
            "physics-c-mechanics", "physics-c-em", "chemistry", "biology", "statistics"
        ]
        # Some subjects have different slugs in the PDF filenames
        sub_map = {
            "physics-c-electricity-and-magnetism": "physics-c-em"
        }
        
        for year_val in range(12, 23):
            yy = str(year_val).zfill(2)
            year = f"20{yy}"
            for sub in subjects:
                sub_slug = sub_map.get(sub, sub)
                for type_suffix in ["frq", "sg"]:
                    save_path = os.path.join(BASE_DIR, f"AP_{sub_slug}_{year}_{type_suffix}.pdf")
                    if os.path.exists(save_path):
                        self.stats["skipped"] += 1
                        continue
                        
                    # Wayback URL pattern provided
                    wayback_url = f"https://web.archive.org/web/2020/https://apcentral.collegeboard.org/media/pdf/ap{yy}-{type_suffix}-{sub_slug}.pdf"
                    self.download_file(wayback_url, save_path)

    def print_summary(self):
        print("\n" + "="*50)
        print(f"{'AP FIX SUMMARY':^50}")
        print("="*50)
        print(f"{'Downloaded':<15} | {'Skipped':<10} | {'Failed':<10}")
        print("-" * 50)
        print(f"{self.stats['downloaded']:<15} | {self.stats['skipped']:<10} | {self.stats['failed']:<10}")
        print("="*50)

if __name__ == "__main__":
    d = APFixDownloader()
    d.scrape_collegeboard_direct()
    d.recover_via_wayback()
    d.print_summary()
