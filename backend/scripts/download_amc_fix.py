import os
import time
import requests
from requests_html import HTMLSession
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
BASE_DIR = "Papers"

class AMCFixDownloader:
    def __init__(self):
        self.stats = {
            "AMC": {"downloaded": 0, "skipped": 0, "failed": 0},
            "AIME": {"downloaded": 0, "skipped": 0, "failed": 0},
            "USAMO": {"downloaded": 0, "skipped": 0, "failed": 0},
        }
        self.session = HTMLSession()
        self.session.headers.update(HEADERS)

    def log_failure(self, exam, url, error):
        with open(LOG_FILE, "a") as f:
            f.write(f"[{exam}_FIX] {url} - {error}\n")

    def download_file(self, url, save_path, exam_name):
        if os.path.exists(save_path):
            self.stats[exam_name]["skipped"] += 1
            return True

        os.makedirs(os.path.dirname(save_path), exist_ok=True)

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
                self.stats[exam_name]["downloaded"] += 1
                print(f"    [+] Saved to {save_path}")
                return True
            except Exception as e:
                if attempt == RETRY_COUNT - 1:
                    self.log_failure(exam_name, url, str(e))
                    self.stats[exam_name]["failed"] += 1
        return False

    def scrape_year_page(self, year, type_tag, exam_name):
        url = f"https://artofproblemsolving.com/wiki/index.php/{year}_{type_tag}_Problems"
        print(f"  Scraping: {url}")
        try:
            r = self.session.get(url)
            # Try simple extraction first
            pdf_links = [l for l in r.html.absolute_links if '.pdf' in l.lower()]
            
            if not pdf_links:
                # If no direct PDFs, maybe we need to render
                try:
                    r.html.render(sleep=2, timeout=20)
                    pdf_links = [l for l in r.html.absolute_links if '.pdf' in l.lower()]
                except Exception as render_err:
                    print(f"    [!] Render failed for {url}: {render_err}")

            for link in pdf_links:
                filename = os.path.basename(urllib.parse.unquote(link))
                save_path = os.path.join(BASE_DIR, exam_name, f"{year}_{type_tag}_{filename}")
                self.download_file(link, save_path, exam_name)
        except Exception as e:
            print(f"    [!] Failed to fetch {url}: {e}")

    def run(self):
        print("\n--- Fixing AMC/AIME/USAMO via AoPS Year Pages ---")
        for year in range(2000, 2025):
            # AMC 10/12
            for t in ["AMC_10A", "AMC_10B", "AMC_12A", "AMC_12B"]:
                self.scrape_year_page(year, t, "AMC")
            # AIME
            for t in ["AIME_I", "AIME_II"]:
                self.scrape_year_page(year, t, "AIME")
            # USAMO
            self.scrape_year_page(year, "USAMO", "USAMO")

    def print_summary(self):
        print("\n" + "="*50)
        print(f"{'AMC FIX SUMMARY':^50}")
        print("="*50)
        for exam, data in self.stats.items():
            print(f"{exam:<15} | {data['downloaded']:<12} | {data['skipped']:<10} | {data['failed']:<10}")
        print("="*50)

if __name__ == "__main__":
    d = AMCFixDownloader()
    d.run()
    d.print_summary()
