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
BASE_DIR = "Papers/STEP"

class STEPFixDownloader:
    def __init__(self):
        self.stats = {"downloaded": 0, "skipped": 0, "failed": 0}
        os.makedirs(BASE_DIR, exist_ok=True)

    def log_failure(self, url, error):
        with open(LOG_FILE, "a") as f:
            f.write(f"[STEP_FIX] {url} - {error}\n")

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

    def scrape_ocr(self):
        print("\n--- Scraping OCR Official STEP Page ---")
        url = "https://www.ocr.org.uk/qualifications/step-mathematics/preparing-for-step/"
        try:
            time.sleep(DELAY)
            response = requests.get(url, headers=HEADERS, timeout=60)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if '.pdf' in href.lower() or '.zip' in href.lower():
                    full_url = urllib.parse.urljoin(url, href)
                    filename = os.path.basename(urllib.parse.unquote(href))
                    self.download_file(full_url, os.path.join(BASE_DIR, filename))
        except Exception as e:
            print(f"    [!] Failed to scrape OCR: {e}")

    def scrape_mathshelper(self):
        print("\n--- Scraping mathshelper.co.uk Mirror ---")
        url = "https://www.mathshelper.co.uk/step-papers"
        try:
            time.sleep(DELAY)
            response = requests.get(url, headers=HEADERS, timeout=60)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if '.pdf' in href.lower():
                    full_url = urllib.parse.urljoin(url, href)
                    filename = os.path.basename(urllib.parse.unquote(href))
                    self.download_file(full_url, os.path.join(BASE_DIR, filename))
        except Exception as e:
            print(f"    [!] Failed to scrape mathshelper: {e}")

    def print_summary(self):
        print("\n" + "="*50)
        print(f"{'STEP FIX SUMMARY':^50}")
        print("="*50)
        print(f"{'Downloaded':<15} | {'Skipped':<10} | {'Failed':<10}")
        print("-" * 50)
        print(f"{self.stats['downloaded']:<15} | {self.stats['skipped']:<10} | {self.stats['failed']:<10}")
        print("="*50)

if __name__ == "__main__":
    d = STEPFixDownloader()
    d.scrape_ocr()
    d.scrape_mathshelper()
    d.print_summary()
