import os
import time
import requests

# --- Configuration ---
# Subject codes grouped by year ranges as specified
CODES_2007_2009 = [
    "ae", "ag", "ar", "ce", "ch", "cs", "cy", "ec", "ee", "gg", 
    "in", "ma", "me", "mn", "mt", "ph", "pi", "tf", "xe", "xl"
]

CODES_2010_2013 = [
    "ae", "ag", "ar", "bt", "ce", "ch", "cs", "cy", "ec", "ee", 
    "gg", "in", "ma", "me", "mn", "mt", "ph", "pi", "tf", "xe", "xl"
]

CODES_2014_2015 = [
    "ae", "ag", "ar", "bt", "ce", "ch", "cs", "cy", "ec", "ee", 
    "ey", "gg", "in", "ma", "me", "mn", "mt", "ph", "pi", "tf", "xe", "xl"
]

CODES_2016_2018 = [
    "ae", "ag", "ar", "bt", "ce", "ch", "cs", "cy", "ec", "ee", 
    "ey", "gg", "in", "ma", "me", "mn", "mt", "pe", "ph", "pi", "tf", "xe", "xl"
]

BASE_DIR = "GATE_Papers"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

stats = {"downloaded": 0, "skipped": 0, "failed": 0}

def download_file(url, year, code):
    year_dir = os.path.join(BASE_DIR, str(year))
    if not os.path.exists(year_dir):
        os.makedirs(year_dir)

    filename = f"{code}_{year}.pdf"
    file_path = os.path.join(year_dir, filename)

    if os.path.exists(file_path):
        stats["skipped"] += 1
        return False

    try:
        time.sleep(1) # 1-second delay
        response = requests.get(url, headers=HEADERS, timeout=20, verify=False)
        
        if response.status_code == 404:
            return False # Silently skip 404s
            
        if response.status_code == 200:
            with open(file_path, 'wb') as f:
                f.write(response.content)
            print(f"[+] Downloaded: {file_path}")
            stats["downloaded"] += 1
            return True
        else:
            stats["failed"] += 1
    except Exception:
        stats["failed"] += 1
    return False

def run_downloader():
    print("--- Starting GATE 2007-2018 Archive Download ---")
    
    for year in range(2007, 2019):
        if 2007 <= year <= 2009:
            codes = CODES_2007_2009
        elif 2010 <= year <= 2013:
            codes = CODES_2010_2013
        elif 2014 <= year <= 2015:
            codes = CODES_2014_2015
        else:
            codes = CODES_2016_2018
            
        print(f"\n--- Processing Year: {year} ---")
        for code in codes:
            # URL Pattern: https://gate.iitk.ac.in/GATE2023/doc/papers/{year}/{code}_{year}.pdf
            url = f"https://gate.iitk.ac.in/GATE2023/doc/papers/{year}/{code}_{year}.pdf"
            download_file(url, year, code)

    print("\n" + "="*30)
    print("DOWNLOAD SUMMARY")
    print(f"Total Downloaded: {stats['downloaded']}")
    print(f"Total Skipped:    {stats['skipped']}")
    print(f"Total Failed:     {stats['failed']}")
    print("="*30)

if __name__ == "__main__":
    requests.packages.urllib3.disable_warnings()
    run_downloader()
