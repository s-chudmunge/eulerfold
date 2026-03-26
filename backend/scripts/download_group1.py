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

class Group1Downloader:
    def __init__(self):
        self.stats = {
            "AMC": {"downloaded": 0, "skipped": 0, "failed": 0},
            "AIME": {"downloaded": 0, "skipped": 0, "failed": 0},
            "USAMO": {"downloaded": 0, "skipped": 0, "failed": 0},
        }
        if not os.path.exists(LOG_FILE):
            with open(LOG_FILE, "w") as f:
                f.write("Failed Downloads Log - Group 1\n" + "="*30 + "\n")

    def log_failure(self, exam, url, error):
        with open(LOG_FILE, "a") as f:
            f.write(f"[{exam}] {url} - {error}\n")

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
                    print(f"    [!] Failed to download {url}: {e}")
                    self.log_failure(exam_name, url, str(e))
                    self.stats[exam_name]["failed"] += 1
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

    def run_maa_recent(self):
        print("\n--- Downloading Recent AMC Papers from MAA (2022-2024) ---")
        for year in range(2022, 2025):
            for amc_type in ["10A", "10B", "12A", "12B"]:
                url = f"https://maa.org/wp-content/uploads/2024/08/{year}_AMC{amc_type}-Problems.pdf"
                save_path = os.path.join(BASE_DIR, "AMC", f"AMC_{amc_type}_{year}.pdf")
                self.download_file(url, save_path, "AMC")

    def scrape_aops(self, wiki_url, exam_name):
        print(f"\n--- Scraping {exam_name} from AoPS: {wiki_url} ---")
        html = self.fetch_page(wiki_url)
        if not html: return

        soup = BeautifulSoup(html, 'html.parser')
        # Look for links that contain '.pdf'
        links = soup.find_all('a', href=True)
        for link in links:
            href = link['href']
            if href.lower().endswith('.pdf'):
                full_url = urllib.parse.urljoin(wiki_url, href)
                # Try to extract year and type from URL or text
                filename = os.path.basename(urllib.parse.unquote(href))
                
                # Default save path logic
                save_path = os.path.join(BASE_DIR, exam_name, filename)
                
                # Refined name mapping if possible
                year_match = re.search(r'(20\d{2}|19\d{2})', filename)
                if year_match:
                    year = year_match.group(1)
                    if exam_name == "AMC":
                        type_match = re.search(r'AMC\s*(10A|10B|12A|12B|10|12)', filename, re.I)
                        amc_type = type_match.group(1).upper() if type_match else "Unknown"
                        save_path = os.path.join(BASE_DIR, "AMC", f"AMC_{amc_type}_{year}.pdf")
                    elif exam_name == "AIME":
                        aime_type_match = re.search(r'AIME\s*([IV]+)', filename, re.I)
                        aime_type = aime_type_match.group(1).upper() if aime_type_match else ""
                        save_path = os.path.join(BASE_DIR, "AIME", f"AIME_{aime_type}_{year}.pdf")
                    elif exam_name == "USAMO":
                        save_path = os.path.join(BASE_DIR, "USAMO", f"USAMO_{year}.pdf")

                print(f"  Attempting {filename}")
                self.download_file(full_url, save_path, exam_name)

    def print_summary(self):
        print("\n" + "="*50)
        print(f"{'GROUP 1 SUMMARY':^50}")
        print("="*50)
        print(f"{'Exam':<15} | {'Downloaded':<12} | {'Skipped':<10} | {'Failed':<10}")
        print("-" * 50)
        for exam, data in self.stats.items():
            print(f"{exam:<15} | {data['downloaded']:<12} | {data['skipped']:<10} | {data['failed']:<10}")
        print("="*50)

if __name__ == "__main__":
    d = Group1Downloader()
    d.run_maa_recent()
    d.scrape_aops("https://artofproblemsolving.com/wiki/index.php/AMC_10_Problems_and_Solutions", "AMC")
    d.scrape_aops("https://artofproblemsolving.com/wiki/index.php/AMC_12_Problems_and_Solutions", "AMC")
    d.scrape_aops("https://artofproblemsolving.com/wiki/index.php/AIME_Problems_and_Solutions", "AIME")
    d.scrape_aops("https://artofproblemsolving.com/wiki/index.php/USAMO_Problems_and_Solutions", "USAMO")
    d.print_summary()
