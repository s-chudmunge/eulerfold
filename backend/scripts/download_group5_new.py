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

class Group5Downloader:
    def __init__(self):
        self.stats = {
            "IOI": {"downloaded": 0, "skipped": 0, "failed": 0},
            "IBO": {"downloaded": 0, "skipped": 0, "failed": 0},
        }
        os.makedirs("Papers/IOI", exist_ok=True)
        os.makedirs("Papers/IBO", exist_ok=True)

    def log_failure(self, exam, url, error):
        with open(LOG_FILE, "a") as f:
            f.write(f"[{exam}] {url} - {error}\n")

    def download_file(self, url, save_path, exam_name):
        if os.path.exists(save_path):
            self.stats[exam_name]["skipped"] += 1
            if exam_name == "IBO":
                print(f"    [.] Already exists: {os.path.basename(save_path)}")
            return True

        for attempt in range(RETRY_COUNT):
            try:
                # Use much faster delay for IBO
                current_delay = 0.1 if exam_name == "IBO" else DELAY
                time.sleep(current_delay)
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

    def run_ioi(self):
        print("\n--- Downloading IOI Papers (1994-2024) ---")
        for year in range(1994, 2025):
            # Problems 1-6
            for n in range(1, 7):
                url = f"https://ioinformatics.org/files/ioi{year}problem{n}.pdf"
                save_path = f"Papers/IOI/IOI_{year}_problem{n}.pdf"
                self.download_file(url, save_path, "IOI")
            
            # Solutions
            sol_url = f"https://ioinformatics.org/files/ioi{year}solutions.pdf"
            sol_path = f"Papers/IOI/IOI_{year}_solutions.pdf"
            self.download_file(sol_url, sol_path, "IOI")

    def scrape_ibo(self):
        print("\n--- Scraping IBO Papers ---")
        url = "https://www.ibo-info.org/en/info/papers.html"
        try:
            time.sleep(DELAY)
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if '.pdf' in href.lower():
                    full_url = urllib.parse.urljoin("https://www.ibo-info.org/", href)
                    filename = os.path.basename(urllib.parse.unquote(href))
                    save_path = f"Papers/IBO/{filename}"
                    print(f"  Scraping IBO: {filename}")
                    self.download_file(full_url, save_path, "IBO")
        except Exception as e:
            print(f"    [!] IBO scraping failed: {e}")

    def print_summary(self):
        print("\n" + "="*50)
        print(f"{'GROUP 5 SUMMARY':^50}")
        print("="*50)
        print(f"{'Exam':<15} | {'Downloaded':<12} | {'Skipped':<10} | {'Failed':<10}")
        print("-" * 50)
        for exam, d in self.stats.items():
            print(f"{exam:<15} | {d['downloaded']:<12} | {d['skipped']:<10} | {d['failed']:<10}")
        print("="*50)

if __name__ == "__main__":
    d = Group5Downloader()
    d.run_ioi()
    d.scrape_ibo()
    d.print_summary()
