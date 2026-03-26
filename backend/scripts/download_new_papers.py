import os
import time
import requests
from bs4 import BeautifulSoup
import urllib.parse
import re
import sys

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}
DELAY = 1.5
RETRY_COUNT = 3
TIMEOUT = 20 
LOG_FILE = "failed_downloads.txt"
BASE_DIR = "Papers"

class GlobalPaperDownloader:
    def __init__(self):
        self.stats = {}
        self.group_mapping = {
            "GROUP 1": ["AMC", "AIME", "USAMO"],
            "GROUP 2": ["STEP", "ENGAA", "NSAA"],
            "GROUP 3": ["GRE_Physics", "GRE_General"],
            "GROUP 4": ["AP"],
            "GROUP 5": ["IOI", "IBO", "AMC_AU"],
            "GROUP 6": ["BARC", "ISRO", "KVPY"],
        }
        for exams in self.group_mapping.values():
            for exam in exams:
                self.stats[exam] = {"downloaded": 0, "skipped": 0, "failed": 0, "404s": 0}

        if not os.path.exists(LOG_FILE):
            with open(LOG_FILE, "w") as f:
                f.write("Failed Downloads Log\n" + "="*20 + "\n")
        
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.last_request_time = 0

    def rate_limit(self):
        elapsed = time.time() - self.last_request_time
        if elapsed < DELAY:
            time.sleep(DELAY - elapsed)
        self.last_request_time = time.time()

    def log_failure(self, exam, url, error):
        with open(LOG_FILE, "a") as f:
            f.write(f"[{exam}] {url} - {error}\n")

    def download_file(self, url, save_path, exam_name):
        if os.path.exists(save_path):
            self.stats[exam_name]["skipped"] += 1
            return True

        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        print(f"    [>] Fetching: {url} ...", end="", flush=True)

        for attempt in range(RETRY_COUNT):
            try:
                self.rate_limit()
                response = self.session.get(url, timeout=(5, TIMEOUT), stream=True)
                
                if response.status_code == 404:
                    print(f"\r    [?] 404: {os.path.basename(url)}")
                    self.stats[exam_name]["404s"] += 1
                    return False
                
                response.raise_for_status()
                with open(save_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk: f.write(chunk)
                
                self.stats[exam_name]["downloaded"] += 1
                print(f"\r    [+] Saved: {os.path.basename(save_path)}")
                return True

            except requests.exceptions.RequestException as e:
                print(f" (Retry {attempt+1})", end="", flush=True)
                if attempt == RETRY_COUNT - 1:
                    print(f"\r    [!] Failed {url}: {str(e)[:50]}")
                    self.log_failure(exam_name, url, str(e))
                    self.stats[exam_name]["failed"] += 1
        return False

    def fetch_page(self, url):
        print(f"  [*] Scraping index: {url}")
        self.rate_limit()
        try:
            response = self.session.get(url, timeout=TIMEOUT)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"    [!] Failed to fetch page {url}: {e}")
            return None

    def scrape_links_and_download(self, index_url, exam_name, pattern, save_prefix=""):
        html = self.fetch_page(index_url)
        if not html: return
        
        soup = BeautifulSoup(html, 'html.parser')
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link['href']
            if href.lower().endswith('.pdf') and re.search(pattern, href, re.I):
                full_url = urllib.parse.urljoin(index_url, href)
                filename = os.path.basename(urllib.parse.unquote(full_url))
                if save_prefix: filename = f"{save_prefix}_{filename}"
                save_path = os.path.join(BASE_DIR, exam_name, filename)
                self.download_file(full_url, save_path, exam_name)

    def run_group1(self):
        print("\n=== [GROUP 1] USA Math Olympiad Ladder ===")
        # AMC
        for year in range(2000, 2025):
            for t in ["10A", "10B", "12A", "12B"]:
                url = f"https://maa.org/wp-content/uploads/2024/08/{year}_AMC{t}-Problems.pdf"
                self.download_file(url, os.path.join(BASE_DIR, "AMC", f"AMC_{t}_{year}.pdf"), "AMC")
        
        print("  Checking AoPS for AMC/AIME/USAMO links...")
        self.scrape_links_and_download("https://artofproblemsolving.com/wiki/index.php/AMC_Problems_and_Solutions", "AMC", r'AMC')
        self.scrape_links_and_download("https://artofproblemsolving.com/wiki/index.php/AIME_Problems_and_Solutions", "AIME", r'AIME')
        
        for year in range(2002, 2025):
            self.download_file(f"https://maa.org/wp-content/uploads/2024/08/{year}-USAMO.pdf", 
                              os.path.join(BASE_DIR, "USAMO", f"USAMO_{year}.pdf"), "USAMO")

    def run_group2(self):
        print("\n=== [GROUP 2] UK Admissions Papers ===")
        # STEP
        html = self.fetch_page("https://www.physicsandmathstutor.com/admissions/step/")
        if html:
            for link in BeautifulSoup(html, 'html.parser').find_all('a', href=True):
                if link['href'].endswith('.pdf') and 'STEP' in link['href']:
                    match = re.search(r'(\d{4}).*STEP\s*(\d)', urllib.parse.unquote(link['href']), re.I)
                    if match:
                        y, n = match.groups()
                        self.download_file(link['href'], os.path.join(BASE_DIR, "STEP", f"STEP_{n}_{y}.pdf"), "STEP")
        
        for ex in ["engaa", "nsaa"]:
            self.scrape_links_and_download(f"https://www.physicsandmathstutor.com/admissions/{ex}/", ex.upper(), rf'{ex}', save_prefix=ex.upper())

    def run_group3(self):
        print("\n=== [GROUP 3] GRE Subject Tests ===")
        # Physics
        p_urls = [
            "https://www.ets.org/pdfs/gre/practice-book-physics.pdf",
            "https://www.ets.org/content/dam/ets-india/pdfs/gre/practice-book-physics.pdf",
            "https://media.physics.hmc.edu/media/docs/gr0877.pdf",
            "https://media.physics.hmc.edu/media/docs/gre1777.pdf"
        ]
        for url in p_urls:
            self.download_file(url, os.path.join(BASE_DIR, "GRE", f"GRE_Physics_{os.path.basename(url)}"), "GRE_Physics")
        
        for c in ["8677", "9277", "9677", "0177", "0877", "1777"]:
            self.download_file(f"https://media.physics.hmc.edu/media/docs/gr{c}.pdf", os.path.join(BASE_DIR, "GRE", f"GRE_Physics_{c}.pdf"), "GRE_Physics")

        self.scrape_links_and_download("https://www.ets.org/gre/subject/about/content/", "GRE_General", r'practice-book', save_prefix="GRE")

    def run_group4(self):
        print("\n=== [GROUP 4] AP Free Response ===")
        subjects = ["physics-1", "physics-2", "physics-c-mechanics", "physics-c-em", "chemistry", "biology", "calculus-ab", "calculus-bc", "statistics"]
        for year in range(12, 26):
            yy = str(year).zfill(2)
            for sub in subjects:
                url = f"https://apcentral.collegeboard.org/media/pdf/ap{yy}-frq-{sub}.pdf"
                self.download_file(url, os.path.join(BASE_DIR, "AP", f"{sub}_20{yy}_frq.pdf"), "AP")

    def run_group5(self):
        print("\n=== [GROUP 5] International Olympiads ===")
        for y in range(1994, 2025):
            for n in range(1, 7):
                self.download_file(f"https://ioinformatics.org/files/ioi{y}problem{n}.pdf", os.path.join(BASE_DIR, "IOI", f"IOI_{y}_problem{n}.pdf"), "IOI")
            self.download_file(f"https://ioinformatics.org/files/ioi{y}solutions.pdf", os.path.join(BASE_DIR, "IOI", f"IOI_{y}_solutions.pdf"), "IOI")
        
        self.scrape_links_and_download("https://www.ibo-info.org/en/info/papers.html", "IBO", r'\.pdf', save_prefix="IBO")
        self.scrape_links_and_download("https://www.amt.edu.au/mathematical-olympiads/amc", "AMC_AU", r'\.pdf', save_prefix="AMC_AU")

    def run_group6(self):
        print("\n=== [GROUP 6] Indian Missing Exams ===")
        self.scrape_links_and_download("https://www.isro.gov.in/PreviousYearQuestionPaper.html", "ISRO", r'\.pdf', save_prefix="ISRO")
        self.scrape_links_and_download("https://kvpy.iisc.ac.in/main/previous_year_question_papers.htm", "KVPY", r'\.pdf', save_prefix="KVPY")
        self.scrape_links_and_download("https://www.careerendeavour.com/barc-previous-year-papers/", "BARC", r'\.pdf', save_prefix="BARC")
        # Direct check for BARC recruit site as per prompt
        self.scrape_links_and_download("https://www.barcrecruit.gov.in/", "BARC", r'QuestionPaper|PreviousYear', save_prefix="BARC_Official")

    def print_summary(self):
        print("\n" + "="*80)
        print(f"{'GROUP-WISE EXECUTION SUMMARY':^80}")
        print("="*80)
        for group, exams in self.group_mapping.items():
            print(f"\n{group}:")
            print(f"{'Exam':<15} | {'Saved':<10} | {'Skipped':<10} | {'404s':<10} | {'Failed':<10}")
            print("-" * 65)
            for exam in exams:
                d = self.stats.get(exam, {"downloaded":0, "skipped":0, "404s":0, "failed":0})
                print(f"{exam:<15} | {d['downloaded']:<10} | {d['skipped']:<10} | {d['404s']:<10} | {d['failed']:<10}")
        print("="*80)

if __name__ == "__main__":
    d = GlobalPaperDownloader()
    try:
        d.run_group1(); d.run_group2(); d.run_group3(); d.run_group4(); d.run_group5(); d.run_group6()
    except KeyboardInterrupt:
        print("\n\n[!] Interrupted.")
    finally:
        d.print_summary()
