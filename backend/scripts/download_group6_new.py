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
TIMEOUT = 60 # Increased timeout
LOG_FILE = "failed_downloads.txt"

class Group6Downloader:
    def __init__(self):
        self.stats = {
            "KVPY": {"downloaded": 0, "skipped": 0, "failed": 0},
            "BARC": {"downloaded": 0, "skipped": 0, "failed": 0},
            "ISRO": {"downloaded": 0, "skipped": 0, "failed": 0},
        }
        os.makedirs("Papers/KVPY", exist_ok=True)
        os.makedirs("Papers/BARC", exist_ok=True)
        os.makedirs("Papers/ISRO", exist_ok=True)

    def log_failure(self, exam, url, error):
        with open(LOG_FILE, "a") as f:
            f.write(f"[{exam}] {url} - {error}\n")

    def download_file(self, url, save_path, exam_name):
        if os.path.exists(save_path):
            self.stats[exam_name]["skipped"] += 1
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
                self.stats[exam_name]["downloaded"] += 1
                print(f"    [+] Saved to {save_path}")
                return True
            except Exception as e:
                if attempt == RETRY_COUNT - 1:
                    print(f"    [!] Failed {url}: {e}")
                    self.log_failure(exam_name, url, str(e))
                    self.stats[exam_name]["failed"] += 1
        return False

    def scrape_kvpy(self):
        print("\n--- Scraping KVPY Papers ---")
        url = "https://kvpy.iisc.ac.in/main/previous_year_question_papers.htm"
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
                    
                    match = re.search(r'(SA|SB|SX).*?(\d{4})', filename, re.I)
                    if match:
                        stream = match.group(1).upper()
                        year = match.group(2)
                        save_path = f"Papers/KVPY/KVPY_{stream}_{year}.pdf"
                    else:
                        save_path = f"Papers/KVPY/{filename}"
                    
                    self.download_file(full_url, save_path, "KVPY")
        except Exception as e:
            print(f"    [!] KVPY scraping failed: {e}")

    def scrape_barc(self):
        print("\n--- Scraping BARC Papers ---")
        url = "https://careerendeavour.com/barc-previous-year-papers/"
        try:
            time.sleep(DELAY)
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if '.pdf' in href.lower():
                    full_url = urllib.parse.urljoin(url, href)
                    filename = os.path.basename(urllib.parse.unquote(href))
                    self.download_file(full_url, f"Papers/BARC/{filename}", "BARC")
        except Exception as e:
            print(f"    [!] BARC scraping failed: {e}")

    def scrape_isro(self):
        print("\n--- Scraping ISRO Papers ---")
        url = "https://careerendeavour.com/isro-previous-year-papers/"
        try:
            time.sleep(DELAY)
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if '.pdf' in href.lower():
                    full_url = urllib.parse.urljoin(url, href)
                    filename = os.path.basename(urllib.parse.unquote(href))
                    self.download_file(full_url, f"Papers/ISRO/{filename}", "ISRO")
        except Exception as e:
            print(f"    [!] ISRO scraping failed: {e}")

    def print_summary(self):
        print("\n" + "="*50)
        print(f"{'GROUP 6 SUMMARY':^50}")
        print("="*50)
        for exam, d in self.stats.items():
            print(f"{exam:<15} | {d['downloaded']:<12} | {d['skipped']:<10} | {d['failed']:<10}")
        print("="*50)

if __name__ == "__main__":
    d = Group6Downloader()
    d.scrape_kvpy()
    d.scrape_barc()
    d.scrape_isro()
    d.print_summary()
