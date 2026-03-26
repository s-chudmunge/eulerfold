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
DELAY = 1.0
TIMEOUT = 30
BASE_TARGET_DIR = "Papers/UPSC"

class UPSCDownloader:
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

    def scrape_afeias(self):
        print("=== Scraping UPSC from afeias.com (Rel-path fix) ===")
        index_url = "https://afeias.com/upsc-civil-service-question-papers/"
        try:
            response = self.session.get(index_url, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # The page uses tables. We need to find the year/paper in the row.
            rows = soup.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                if not cols: continue
                
                # Full row text to identify exam/year
                row_text = row.get_text().upper()
                year_match = re.search(r'20\d{2}', row_text)
                if not year_match: continue
                year = year_match.group(0)
                
                for col in cols:
                    col_text = col.get_text().upper()
                    link = col.find('a', href=True)
                    if not link or not link['href'].lower().endswith('.pdf'): continue
                    
                    href = urllib.parse.urljoin(index_url, link['href'])
                    
                    target_name = None
                    # Detailed matching based on column text
                    if "PRELIM" in row_text or "PRELIM" in col_text:
                        type_str = "GS1"
                        if "PAPER-II" in col_text or "PAPER II" in col_text or "CSAT" in col_text or "GS-II" in col_text:
                            type_str = "CSAT"
                        target_name = f"UPSC_CSE_PRELIMS_{type_str}_{year}_QP.pdf"
                    elif "MAINS" in row_text or "MAINS" in col_text:
                        paper = "GS1"
                        if "ESSAY" in col_text: paper = "ESSAY"
                        elif "PAPER-I" in col_text or "PAPER I" in col_text or "GS-I" in col_text: paper = "GS1"
                        elif "PAPER-II" in col_text or "PAPER II" in col_text or "GS-II" in col_text: paper = "GS2"
                        elif "PAPER-III" in col_text or "PAPER III" in col_text or "GS-III" in col_text: paper = "GS3"
                        elif "PAPER-IV" in col_text or "PAPER IV" in col_text or "GS-IV" in col_text: paper = "GS4"
                        target_name = f"UPSC_CSE_MAINS_{paper}_{year}_QP.pdf"
                    
                    if target_name:
                        self.download_file(href, os.path.join(BASE_TARGET_DIR, target_name))
                            
        except Exception as e:
            print(f"    [!] Scrape failed: {e}")

if __name__ == "__main__":
    d = UPSCDownloader()
    d.scrape_afeias()
