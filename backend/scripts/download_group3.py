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
BASE_DIR = "Papers"

class Group3Downloader:
    def __init__(self):
        self.stats = {
            "GRE": {"downloaded": 0, "skipped": 0, "failed": 0},
        }
        if not os.path.exists(LOG_FILE):
            with open(LOG_FILE, "w") as f:
                f.write("Failed Downloads Log - Group 3\n" + "="*30 + "\n")

    def log_failure(self, exam, url, error):
        with open(LOG_FILE, "a") as f:
            f.write(f"[{exam}] {url} - {error}\n")

    def download_file(self, url, save_path, exam_name):
        if os.path.exists(save_path):
            self.stats["GRE"]["skipped"] += 1
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
                
                self.stats["GRE"]["downloaded"] += 1
                print(f"    [+] Saved to {save_path}")
                return True

            except Exception as e:
                if attempt == RETRY_COUNT - 1:
                    print(f"    [!] Failed to download {url}: {e}")
                    self.log_failure(exam_name, url, str(e))
                    self.stats["GRE"]["failed"] += 1
        return False

    def fetch_page(self, url):
        time.sleep(DELAY)
        try:
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"    [!] Failed to fetch page {url}: {e}")
            return None

    def run_physics(self):
        print("\n--- Downloading GRE Physics Papers ---")
        codes = ["8677", "9277", "9677", "0177", "0877", "1777"]
        for code in codes:
            url = f"https://media.physics.hmc.edu/media/docs/gr{code}.pdf"
            save_path = os.path.join(BASE_DIR, "GRE", f"GRE_Physics_{code}.pdf")
            self.download_file(url, save_path, "GRE")

    def scrape_ets(self):
        print("\n--- Scraping GRE General Subject Tests from ETS ---")
        url = "https://www.ets.org/gre/subject/about/content/"
        html = self.fetch_page(url)
        if not html: return

        soup = BeautifulSoup(html, 'html.parser')
        links = soup.find_all('a', href=True)
        for link in links:
            href = link['href']
            if href.lower().endswith('.pdf') and 'practice-book' in href.lower():
                full_url = urllib.parse.urljoin(url, href)
                filename = os.path.basename(urllib.parse.unquote(href))
                
                # Identify subject
                subject = "General"
                if "math" in href.lower(): subject = "Math"
                elif "chemistry" in href.lower() or "chem" in href.lower(): subject = "Chemistry"
                elif "biology" in href.lower() or "bio" in href.lower(): subject = "Biology"
                
                save_path = os.path.join(BASE_DIR, "GRE", f"GRE_{subject}_practice.pdf")
                print(f"  Attempting {subject} Practice Book")
                self.download_file(full_url, save_path, "GRE")

    def print_summary(self):
        print("\n" + "="*50)
        print(f"{'GROUP 3 SUMMARY':^50}")
        print("="*50)
        print(f"{'Exam':<15} | {'Downloaded':<12} | {'Skipped':<10} | {'Failed':<10}")
        print("-" * 50)
        for exam, data in self.stats.items():
            print(f"{exam:<15} | {data['downloaded']:<12} | {data['skipped']:<10} | {data['failed']:<10}")
        print("="*50)

if __name__ == "__main__":
    d = Group3Downloader()
    d.run_physics()
    d.scrape_ets()
    d.print_summary()
