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
RETRY_COUNT = 3
TIMEOUT = 30
LOG_FILE = "failed_downloads.txt"
BASE_DIR = "Papers"

class PaperDownloader:
    def __init__(self):
        self.stats = {
            "JAM": {"downloaded": 0, "skipped": 0, "failed": 0},
            "TIFR": {"downloaded": 0, "skipped": 0, "failed": 0},
            "JEST": {"downloaded": 0, "skipped": 0, "failed": 0},
            "CSIR_NET": {"downloaded": 0, "skipped": 0, "failed": 0},
            "UGC_NET": {"downloaded": 0, "skipped": 0, "failed": 0},
        }
        if not os.path.exists(LOG_FILE):
            with open(LOG_FILE, "w") as f:
                f.write("Failed Downloads Log\n" + "="*20 + "\n")

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
                    self.log_failure(exam_name, url, str(e))
                    self.stats[exam_name]["failed"] += 1
        return False

    def fetch_page(self, url, delay=DELAY):
        time.sleep(delay)
        try:
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"    [!] Failed to fetch page {url}: {e}")
            return None

    def parse_name_info(self, combined_text):
        combined = combined_text.lower().replace("-", " ").replace("_", " ")
        
        # Year
        year_match = re.search(r'20\d{2}', combined)
        if not year_match: return None, None
        year = year_match.group(0)
        
        # Session
        session = "June" if any(x in combined for x in ["june", "jun", "july", "jul"]) else "Dec"
        
        return year, session

    def get_subject(self, combined_text):
        combined = combined_text.lower()
        if any(x in combined for x in ["physical", "physics"]): return "Physical_Sciences"
        if any(x in combined for x in ["chemical", "chemistry"]): return "Chemical_Sciences"
        if any(x in combined for x in ["life", "biology"]): return "Life_Sciences"
        if any(x in combined for x in ["mathematical", "math"]): return "Mathematical_Sciences"
        if any(x in combined for x in ["earth"]): return "Earth_Sciences"
        if any(x in combined for x in ["computer", "code 87", "code-87"]): return "CS"
        if any(x in combined for x in ["paper i", "paper-i", "general paper"]): return "Paper1"
        return "Other"

    def run_csir_net(self):
        """CSIR-NET (2015–2024) — Career Endeavour (Deep Crawl)"""
        print("\n--- Downloading CSIR-NET Papers (Career Endeavour) ---")
        sub_pages = [
            "https://careerendeavour.com/csir-net-physical-science-question-paper/",
            "https://careerendeavour.com/csir-net-chemical-sciences-questions-paper/",
            "https://careerendeavour.com/csir-net-life-sciences-questions-paper/",
            "https://careerendeavour.com/csir-net-mathematical-science-question-papers/",
            "https://careerendeavour.com/csir-net-question-paper/"
        ]
        
        for page_url in sub_pages:
            print(f"Scraping page: {page_url}")
            p_html = self.fetch_page(page_url)
            if not p_html: continue
            
            p_soup = BeautifulSoup(p_html, 'html.parser')
            # Extract subject hint from page URL
            page_subject_hint = self.get_subject(page_url)
            if page_subject_hint == "Paper1": page_subject_hint = "Other" # Hub page hint
            
            for link in p_soup.find_all('a', href=True):
                href = link['href']
                if not href.lower().endswith('.pdf'): continue
                
                # Get text from row
                parent_row = link.find_parent('tr')
                row_text = parent_row.get_text().strip() if parent_row else link.get_text().strip()
                
                combined = row_text + " " + href.lower()
                sub = self.get_subject(combined)
                if sub == "Other": sub = page_subject_hint
                
                yr, sess = self.parse_name_info(combined)
                
                if sub != "Other" and yr and "Sciences" in sub:
                    filename = f"{sub}_{yr}_{sess}.pdf"
                    save_path = os.path.join(BASE_DIR, "CSIR_NET", filename)
                    print(f"  Attempting {sub} {yr} {sess}")
                    self.download_file(urllib.parse.urljoin(page_url, href), save_path, "CSIR_NET")

    def run_ugc_net(self):
        """UGC-NET Computer Science (2015–2023) — Deep Crawl"""
        print("\n--- Downloading UGC-NET Papers ---")
        
        # Source 1: Career Endeavour UGC-NET CS
        ce_pages = [
            "https://careerendeavour.com/ugc-net-computer-science-questions-paper/",
            "https://careerendeavour.com/csir-net-question-paper/" # Hub also has some
        ]
        for page_url in ce_pages:
            print(f"Scraping Career Endeavour: {page_url}")
            html = self.fetch_page(page_url)
            if html:
                soup = BeautifulSoup(html, 'html.parser')
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    if href.lower().endswith('.pdf'):
                        parent_row = link.find_parent('tr')
                        combined = (parent_row.get_text() if parent_row else link.get_text()) + " " + href.lower()
                        sub = self.get_subject(combined)
                        yr, sess = self.parse_name_info(combined)
                        if yr and (sub == "CS" or "Computer Science" in combined):
                            save_path = os.path.join(BASE_DIR, "UGC_NET", f"CS_{yr}_{sess}.pdf")
                            print(f"  Attempting CS {yr} {sess}")
                            self.download_file(urllib.parse.urljoin(page_url, href), save_path, "UGC_NET")

        # Source 2: ugcnetonline.in (Paper 1 and CS)
        hub_url = "https://www.ugcnetonline.in/previous_question_papers.php"
        print(f"Scraping UGC-NET aggregator: {hub_url}")
        html = self.fetch_page(hub_url)
        if html:
            soup = BeautifulSoup(html, 'html.parser')
            sub_pages = []
            for link in soup.find_all('a', href=True):
                if "question_papers_" in link['href']:
                    sub_pages.append(urllib.parse.urljoin(hub_url, link['href']))
            
            for page_url in sub_pages:
                print(f"  Scraping sub-page: {page_url.split('/')[-1]}")
                p_html = self.fetch_page(page_url)
                if not p_html: continue
                p_soup = BeautifulSoup(p_html, 'html.parser')
                
                page_yr_match = re.search(r'20\d{2}', page_url)
                page_yr = page_yr_match.group(0) if page_yr_match else None
                page_sess = "June" if any(x in page_url.lower() for x in ["june", "july", "jun", "jul"]) else "Dec"
                
                current_subject = None
                for row in p_soup.find_all('tr'):
                    row_text = row.get_text().lower()
                    if "computer science" in row_text: current_subject = "CS"
                    elif any(x in row_text for x in ["paper i", "paper-i", "general paper"]): current_subject = "Paper1"
                    elif any(kw in row_text for kw in ["economics", "political", "history", "sociology"]): current_subject = "Other"
                    
                    if current_subject in ["CS", "Paper1"]:
                        for link in row.find_all('a', href=True):
                            href = link['href']
                            if not (href.lower().endswith('.pdf') or "showPdf.php" in href): continue
                            
                            yr, sess = self.parse_name_info(row_text + " " + href.lower())
                            if not yr: yr = page_yr
                            if not yr: continue
                            
                            if not any(x in (row_text + " " + href.lower()) for x in ["june", "jun", "dec"]):
                                sess = page_sess
                            else:
                                sess = "June" if any(x in (row_text + " " + href.lower()) for x in ["june", "jun", "july", "jul"]) else "Dec"

                            prefix = current_subject
                            if prefix == "Paper1":
                                set_match = re.search(r'set\s+([a-z])', row_text + " " + href.lower())
                                if set_match: prefix = f"Paper1_Set{set_match.group(1).upper()}"
                            
                            filename = f"{prefix}_{yr}_{sess}.pdf"
                            save_path = os.path.join(BASE_DIR, "UGC_NET", filename)
                            print(f"    Attempting {prefix} {yr} {sess}")
                            self.download_file(urllib.parse.urljoin(page_url, href), save_path, "UGC_NET")

    def print_summary(self):
        print("\n" + "="*60)
        print(f"{'FINAL DOWNLOAD SUMMARY':^60}")
        print("="*60)
        print(f"{'Exam':<15} | {'Downloaded':<12} | {'Skipped':<10} | {'Failed':<10}")
        print("-" * 60)
        for exam, data in self.stats.items():
            print(f"{exam:<15} | {data['downloaded']:<12} | {data['skipped']:<10} | {data['failed']:<10}")
        print("="*60)

if __name__ == "__main__":
    d = PaperDownloader()
    d.run_csir_net()
    d.run_ugc_net()
    d.print_summary()
