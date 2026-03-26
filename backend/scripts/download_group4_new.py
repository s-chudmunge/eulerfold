import os
import time
import requests
from bs4 import BeautifulSoup
import urllib.parse
import re

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}
DELAY = 1.5
RETRY_COUNT = 3
TIMEOUT = 30
LOG_FILE = "failed_downloads.txt"
BASE_DIR = "Papers/AP"

class Group4Downloader:
    def __init__(self):
        self.stats = {"AP": {"downloaded": 0, "skipped": 0, "failed": 0}}
        os.makedirs(BASE_DIR, exist_ok=True)

    def log_failure(self, url, error):
        with open(LOG_FILE, "a") as f:
            f.write(f"[AP] {url} - {error}\n")

    def download_file(self, url, save_path):
        if os.path.exists(save_path):
            self.stats["AP"]["skipped"] += 1
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
                self.stats["AP"]["downloaded"] += 1
                print(f"    [+] Saved to {save_path}")
                return True
            except Exception as e:
                if attempt == RETRY_COUNT - 1:
                    print(f"    [!] Failed {url}: {e}")
                    self.log_failure(url, str(e))
                    self.stats["AP"]["failed"] += 1
        return False

    def run_recent(self):
        print("\n--- Downloading Recent AP Papers (2023-2025) ---")
        subjects = [
            "calculus-ab", "calculus-bc", "physics-1", "physics-2", 
            "physics-c-mechanics", "physics-c-em", "chemistry", "biology", "statistics"
        ]
        years = ["23", "24", "25"]
        for year in years:
            full_year = f"20{year}"
            for sub in subjects:
                for suffix in ["frq", "sg"]:
                    url = f"https://apcentral.collegeboard.org/media/pdf/ap{year}-{suffix}-{sub}.pdf"
                    save_path = os.path.join(BASE_DIR, f"AP_{sub}_{full_year}_{suffix}.pdf")
                    self.download_file(url, save_path)

    def scrape_aggregator(self):
        print("\n--- Scraping Older AP Papers (2012-2022) ---")
        agg_url = "https://www.clacenter.com/ap-past-exams.html"
        try:
            time.sleep(DELAY)
            response = requests.get(agg_url, headers=HEADERS, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if href.lower().endswith('.pdf'):
                    # Match pattern like ap12-frq-calculus-ab.pdf or ap2012-frq...
                    filename = os.path.basename(urllib.parse.unquote(href))
                    match = re.search(r'ap(\d{2,4})-(frq|sg)-(.*?)\.pdf', filename, re.I)
                    if match:
                        year_val = match.group(1)
                        suffix = match.group(2).lower()
                        subject = match.group(3).lower()
                        full_year = f"20{year_val}" if len(year_val) == 2 else year_val
                        
                        # Only years 2012-2022
                        if 2012 <= int(full_year) <= 2022:
                            save_path = os.path.join(BASE_DIR, f"AP_{subject}_{full_year}_{suffix}.pdf")
                            self.download_file(href, save_path)
        except Exception as e:
            print(f"    [!] Aggregator scraping failed: {e}")

    def print_summary(self):
        print("\n" + "="*50)
        print(f"{'GROUP 4 SUMMARY':^50}")
        print("="*50)
        d = self.stats["AP"]
        print(f"{'Exam':<15} | {'Downloaded':<12} | {'Skipped':<10} | {'Failed':<10}")
        print("-" * 50)
        print(f"{'AP':<15} | {d['downloaded']:<12} | {d['skipped']:<10} | {d['failed']:<10}")
        print("="*50)

if __name__ == "__main__":
    d = Group4Downloader()
    d.run_recent()
    d.scrape_aggregator()
    d.print_summary()
