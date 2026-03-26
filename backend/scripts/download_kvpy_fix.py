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
BASE_DIR = "Papers/KVPY"

class KVPYFixDownloader:
    def __init__(self):
        self.stats = {"downloaded": 0, "skipped": 0, "failed": 0}
        os.makedirs(BASE_DIR, exist_ok=True)

    def log_failure(self, url, error):
        with open(LOG_FILE, "a") as f:
            f.write(f"[KVPY_FIX] {url} - {error}\n")

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
                    # print(f"    [!] Failed {url}: {e}")
                    self.log_failure(url, str(e))
                    self.stats["failed"] += 1
        return False

    def scrape_kvpypapers(self):
        print("\n--- Source A: Scraping kvpypapers.com ---")
        url = "https://www.kvpypapers.com/"
        try:
            time.sleep(DELAY)
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if href.lower().endswith('.pdf'):
                    full_url = urllib.parse.urljoin(url, href)
                    filename = os.path.basename(urllib.parse.unquote(href))
                    self.download_file(full_url, os.path.join(BASE_DIR, filename))
        except Exception as e:
            print(f"    [!] Failed to scrape kvpypapers.com: {e}")

    def scrape_careerendeavour(self):
        print("\n--- Source B: Scraping careerendeavour.com/kvpy-previous-year-question-papers/ ---")
        url = "https://careerendeavour.com/kvpy-previous-year-question-papers/"
        try:
            time.sleep(DELAY)
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if href.lower().endswith('.pdf'):
                    full_url = urllib.parse.urljoin(url, href)
                    filename = os.path.basename(urllib.parse.unquote(href))
                    self.download_file(full_url, os.path.join(BASE_DIR, filename))
        except Exception as e:
            print(f"    [!] Failed to scrape careerendeavour.com: {e}")

    def run_direct_pattern(self):
        print("\n--- Source C: Attempting Direct IISc S3 URL Pattern ---")
        # Pattern: https://kvpy.iisc.ac.in/main/pdfs/{YEAR}/KVPY_{YEAR}_{stream}_QP.pdf
        for year in range(2010, 2022):
            for stream in ["SA", "SB", "SX"]:
                url = f"https://kvpy.iisc.ac.in/main/pdfs/{year}/KVPY_{year}_{stream}_QP.pdf"
                save_path = os.path.join(BASE_DIR, f"KVPY_{stream}_{year}.pdf")
                self.download_file(url, save_path)

    def print_summary(self):
        print("\n" + "="*50)
        print(f"{'KVPY FIX SUMMARY':^50}")
        print("="*50)
        print(f"{'Downloaded':<15} | {'Skipped':<10} | {'Failed':<10}")
        print("-" * 50)
        print(f"{self.stats['downloaded']:<15} | {self.stats['skipped']:<10} | {self.stats['failed']:<10}")
        print("="*50)

if __name__ == "__main__":
    d = KVPYFixDownloader()
    d.scrape_kvpypapers()
    d.scrape_careerendeavour()
    d.run_direct_pattern()
    d.print_summary()
