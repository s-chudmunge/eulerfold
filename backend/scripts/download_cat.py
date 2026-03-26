import os
import time
import requests
from bs4 import BeautifulSoup
import urllib.parse
import re
import zipfile
import io

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
DELAY = 2.0
TIMEOUT = 30
BASE_TARGET_DIR = "Papers/CAT"

class CATDownloader:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def download_and_extract_zip(self, url):
        print(f"  Downloading ZIP: {url}")
        os.makedirs(BASE_TARGET_DIR, exist_ok=True)
        try:
            response = self.session.get(url, timeout=TIMEOUT)
            response.raise_for_status()
            
            with zipfile.ZipFile(io.BytesIO(response.content)) as z:
                # We want to extract and potentially rename to our format
                # CAT_{YEAR}_SLOT{N}_QP.pdf
                for member in z.namelist():
                    if member.lower().endswith('.pdf'):
                        filename = os.path.basename(member)
                        # Extract year and slot from filename if possible
                        year_match = re.search(r'20\d{2}', filename)
                        slot_match = re.search(r'Slot[- ]*(\d)', filename, re.I)
                        
                        year = year_match.group(0) if year_match else "Unknown"
                        slot = slot_match.group(1) if slot_match else "1"
                        
                        target_name = f"CAT_{year}_SLOT{slot}_QP.pdf"
                        
                        # Extract the file data
                        source = z.open(member)
                        with open(os.path.join(BASE_TARGET_DIR, target_name), 'wb') as f:
                            f.write(source.read())
                        print(f"    [+] Extracted & Saved: {target_name}")
            return True
        except Exception as e:
            print(f"    [!] ZIP extraction failed: {e}")
            return False

    def scrape_cat(self):
        print("=== Scraping CAT (2017-2024) from 2IIM (ZIP method) ===")
        url = "https://online.2iim.com/CAT-question-paper-pdf/"
        # We found 'CAT PYQ 2017-24.zip' in the links
        zip_url = urllib.parse.urljoin(url, "CAT PYQ 2017-24.zip")
        self.download_and_extract_zip(zip_url)

if __name__ == "__main__":
    d = CATDownloader()
    d.scrape_cat()
