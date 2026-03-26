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
BASE_TARGET_DIR = "Papers"

class IndianExamDownloader:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def download_file(self, url, save_path):
        if os.path.exists(save_path):
            return True

        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        try:
            time.sleep(DELAY)
            # Try HEAD first to avoid large downloads if it 404s
            head = self.session.head(url, timeout=TIMEOUT, allow_redirects=True)
            if head.status_code != 200:
                return False
                
            response = self.session.get(url, timeout=TIMEOUT, stream=True)
            response.raise_for_status()
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk: f.write(chunk)
            print(f"    [+] Saved: {os.path.basename(save_path)}")
            return True
        except Exception as e:
            # print(f"    [!] Failed {url}: {e}")
            return False

    def scrape_jee_advanced_gaps(self):
        print("\n=== Scraping JEE Advanced Gaps (2007-2018) ===")
        for year in range(2007, 2019):
            for paper in [1, 2]:
                save_path = os.path.join(BASE_TARGET_DIR, "JEE_ADVANCE", f"JEE_ADV_Paper_{paper}_{year}_QP.pdf")
                if os.path.exists(save_path): continue
                
                # Try Pattern 1: _English
                url = f"https://jeeadv.ac.in/past_qps/{year}_{paper}_English.pdf"
                if self.download_file(url, save_path):
                    continue
                
                # Try Pattern 2: No _English
                url = f"https://jeeadv.ac.in/past_qps/{year}_{paper}.pdf"
                if self.download_file(url, save_path):
                    continue
                
                # Try Pattern 3: Fallback for 2007-2012 (Resonance-style pattern if known, 
                # but user provided resonance.ac.in/answer-key-solutions/JEE-Advanced/{YEAR}/)
                # For now, let's try a few common IIT patterns if official fails
                print(f"    [?] Official source failed for JEE Adv {year} P{paper}")

    def scrape_nbhm_msc_pkalika(self):
        print("\n=== Scraping NBHM MSc Gaps (pkalika.in) ===")
        url = "https://pkalika.in/2019/08/23/nbhm-question-papers/"
        try:
            response = self.session.get(url, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if href.lower().endswith('.pdf'):
                    filename = os.path.basename(urllib.parse.unquote(href)).lower()
                    if "msc" in filename or "nbhm" in filename:
                        # Extract Year
                        year_match = re.search(r'(20\d{2}|19\d{2})', href) or re.search(r'(\d{2})', filename)
                        if year_match:
                            y = year_match.group(1)
                            year = y if len(y) == 4 else (f"20{y}" if int(y) < 50 else f"19{y}")
                            
                            # Filter for MSc Gaps 2008-2018
                            if 2008 <= int(year) <= 2018:
                                dtype = "AK" if any(x in filename for x in ["key", "ans", "sol"]) else "QP"
                                clean_name = f"NBHM_MSC_{year}_{dtype}_{filename}"
                                save_path = os.path.join(BASE_TARGET_DIR, "NBHM", clean_name)
                                self.download_file(href, save_path)
        except Exception as e:
            print(f"    [!] pkalika NBHM scraping failed: {e}")

    def scrape_nbhm_recent_annamalai(self):
        print("\n=== Scraping Recent NBHM MSc/PhD (Annamalai) ===")
        url = "https://annamalaimaths.wordpress.com/downloads-2/"
        try:
            response = self.session.get(url, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            # Look for specific text links like "MSC 2023 Ans key"
            for link in soup.find_all('a', href=True):
                text = link.get_text().upper()
                href = link['href']
                if not href.lower().endswith('.pdf'): continue
                
                filename = os.path.basename(urllib.parse.unquote(href))
                
                # PhD 2023, 2024
                if "NBHM 2023" in text or "NBHM 2024" in text:
                    year = "2023" if "2023" in text else "2024"
                    dtype = "AK" if "ANS KEY" in text else "QP"
                    save_path = os.path.join(BASE_TARGET_DIR, "NBHM", f"NBHM_PHD_{year}_{dtype}_{filename}")
                    self.download_file(href, save_path)
                
                # MSc 2023, 2024
                if "MSC 2023" in text or "MSC 2024" in text:
                    year = "2023" if "2023" in text else "2024"
                    dtype = "AK" if "ANS KEY" in text else "QP"
                    save_path = os.path.join(BASE_TARGET_DIR, "NBHM", f"NBHM_MSC_{year}_{dtype}_{filename}")
                    self.download_file(href, save_path)
        except Exception as e:
            print(f"    [!] Annamalai recent NBHM scraping failed: {e}")

if __name__ == "__main__":
    d = IndianExamDownloader()
    d.scrape_jee_advanced_gaps()
    d.scrape_nbhm_msc_pkalika()
    d.scrape_nbhm_recent_annamalai()
