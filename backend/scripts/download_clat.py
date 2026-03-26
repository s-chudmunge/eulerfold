import os
import time
import requests
from bs4 import BeautifulSoup
import urllib.parse
import re

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
DELAY = 2.0
TIMEOUT = 30
BASE_TARGET_DIR = "Papers/CLAT"

class CLATDownloader:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def download_file(self, url, save_path):
        if os.path.exists(save_path):
            return True

        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        try:
            time.sleep(DELAY)
            response = self.session.get(url, timeout=TIMEOUT, stream=True)
            if response.status_code != 200: return False
            response.raise_for_status()
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk: f.write(chunk)
            print(f"    [+] Saved: {os.path.basename(save_path)}")
            return True
        except Exception as e:
            return False

    def scrape_clat(self):
        print("=== Scraping CLAT (Official Consortium Sources - V3) ===")
        for year in range(2019, 2027):
            # Try both subdomain patterns
            urls = [
                f"https://consortiumofnlus.ac.in/clat-{year}/notifications/",
                f"https://clat{year}.consortiumofnlus.ac.in/clat-{year}/notifications/"
            ]
            
            for url in urls:
                print(f"  Checking {url}...")
                try:
                    response = self.session.get(url, timeout=TIMEOUT)
                    # The official site might be JS-rendered, but let's check for direct links in text
                    # Search for any .pdf link in the raw text
                    pdf_links = re.findall(r'https?://[^\s"\']+?\.pdf', response.text)
                    
                    if not pdf_links:
                        # Try searching for relative links too
                        rel_links = re.findall(r'href="([^"\']+\.pdf)"', response.text)
                        pdf_links = [urllib.parse.urljoin(url, l) for l in rel_links]
                    
                    for pdf_url in pdf_links:
                        filename = os.path.basename(urllib.parse.unquote(pdf_url)).upper()
                        if any(kw in filename for kw in ["QUESTION", "BOOKLET", "QP", "PROVISIONAL-ANSWER-KEY"]):
                            type_str = "UG"
                            if "PG" in filename or "LLM" in filename:
                                type_str = "PG"
                            
                            target_name = f"CLAT_{type_str}_{year}_QP_{filename}"
                            if len(target_name) > 80: target_name = f"CLAT_{type_str}_{year}_{filename[:40]}.pdf"
                            
                            self.download_file(pdf_url, os.path.join(BASE_TARGET_DIR, target_name))
                except:
                    continue

if __name__ == "__main__":
    d = CLATDownloader()
    d.scrape_clat()
