import os
import time
import requests
from bs4 import BeautifulSoup
import urllib.parse
import re
import json

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
DELAY = 2.0
TIMEOUT = 30
BASE_TARGET_DIR = "Papers/NEET"

class NEETDownloader:
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
            response.raise_for_status()
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk: f.write(chunk)
            print(f"    [+] Saved: {os.path.basename(save_path)}")
            return True
        except Exception as e:
            return False

    def scrape_neet(self):
        print("=== Scraping NEET UG from Target Publications (JSON Data) ===")
        url = "https://targetpublications.org/blog/neet-previous-years-question-papers-free-pdf-download"
        try:
            response = self.session.get(url, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # intermediate download pages
            links_to_follow = []
            for link in soup.find_all('a', href=True):
                text = link.get_text().upper()
                href = link['href']
                if "DOWNLOAD NEET" in text or "DOWNLOAD AIPMT" in text:
                    links_to_follow.append((text, href))
            
            seen_years = set()
            for text, href in links_to_follow:
                year_match = re.search(r'20\d{2}', text) or re.search(r'20\d{2}', href)
                if not year_match: continue
                year = year_match.group(0)
                if year in seen_years: continue
                
                # Skip non-English
                if any(lang in text for lang in ["HINDI", "MANIPUR", "ODISHA", "PHASE"]):
                    if "PHASE I" not in text and "PHASE 1" not in text:
                        continue
                
                print(f"  Scraping: {href} ({year})")
                if self._scrape_pdf_via_json(href, year):
                    seen_years.add(year)
                    
        except Exception as e:
            print(f"    [!] NEET scraping failed: {e}")

    def _scrape_pdf_via_json(self, url, year):
        try:
            time.sleep(DELAY)
            response = self.session.get(url, timeout=TIMEOUT)
            response.raise_for_status()
            
            # The page contains JSON-like data in <script> tags for Next.js
            # Look for "download_url"
            match = re.search(r'"download_url":"(https?://[^"]+)"', response.text)
            if match:
                pdf_url = match.group(1).replace('\\u0026', '&')
                return self.download_file(pdf_url, os.path.join(BASE_TARGET_DIR, f"NEET_{year}_QP.pdf"))
            
            # Fallback to direct .pdf search in text
            match = re.search(r'https?://[^"\']+?\.pdf', response.text)
            if match:
                return self.download_file(match.group(0), os.path.join(BASE_TARGET_DIR, f"NEET_{year}_QP.pdf"))
                
        except:
            pass
        return False

if __name__ == "__main__":
    d = NEETDownloader()
    d.scrape_neet()
