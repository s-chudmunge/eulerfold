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
BASE_DIR = "Papers"

def download_file(url, folder, filename):
    save_path = os.path.join(BASE_DIR, folder, filename)
    if os.path.exists(save_path):
        return True

    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    for attempt in range(RETRY_COUNT):
        try:
            time.sleep(DELAY)
            print(f"    [>] Fetching: {url}")
            r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)
            if r.status_code == 404:
                return False
            r.raise_for_status()
            with open(save_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"    [+] Saved: {filename}")
            return True
        except Exception as e:
            if attempt == RETRY_COUNT - 1:
                print(f"    [!] Failed {url}: {e}")
    return False

def run_isro():
    print("\n--- Downloading ISRO Papers ---")
    # Pattern: https://www.isro.gov.in/media_isro/pdf/Careers/PreviousYearQuestionPaper/{YEAR}_SC_Scientist_Engineer_{stream}.pdf
    streams = ["Computer", "Electronics", "Mechanical", "Civil"]
    for year in range(2014, 2024):
        for stream in streams:
            url = f"https://www.isro.gov.in/media_isro/pdf/Careers/PreviousYearQuestionPaper/{year}_SC_Scientist_Engineer_{stream}.pdf"
            filename = f"ISRO_{stream}_{year}.pdf"
            download_file(url, "ISRO", filename)

def run_barc():
    print("\n--- Scraping BARC Papers ---")
    url = "https://barcrecruit.gov.in/"
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        links = soup.find_all('a', href=True)
        for link in links:
            href = link['href']
            if '.pdf' in href.lower():
                full_url = urllib.parse.urljoin(url, href)
                filename = os.path.basename(urllib.parse.unquote(href))
                download_file(full_url, "BARC", filename)
    except Exception as e:
        print(f"  [!] Failed BARC official scrape: {e}")
    
    # Wayback attempt
    print("  Attempting BARC Wayback Mirror...")
    wayback_url = "https://web.archive.org/web/2023/https://www.barcrecruit.gov.in/"
    try:
        r = requests.get(wayback_url, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        links = soup.find_all('a', href=True)
        for link in links:
            href = link['href']
            # Filter for barc papers specifically if possible
            if '.pdf' in href.lower() and ('Question' in href or 'Paper' in href):
                if href.startswith('/web/'):
                    full_url = urllib.parse.urljoin("https://web.archive.org", href)
                else:
                    full_url = href
                filename = os.path.basename(urllib.parse.unquote(href.split('/')[-1]))
                download_file(full_url, "BARC", filename)
    except Exception as e:
        print(f"  [!] Failed BARC Wayback scrape: {e}")

if __name__ == "__main__":
    run_isro()
    run_barc()
