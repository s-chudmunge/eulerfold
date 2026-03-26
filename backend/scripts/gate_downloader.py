import os
import time
import requests

# --- Configuration ---
# Updated codes based on user input, including multi-session variants for 2025
CODES_2025 = [
    "AE", "AG", "AR", "BM", "BT", "CE", "CE1", "CE2", "CH", "CS", "CS1", "CS2", 
    "CY", "DA", "EC", "EE", "ES", "EY", "GE", "GG", "IN", "MA", "ME", "MN", 
    "MT", "NM", "PE", "PH", "PI", "ST", "TF", "XE", "XH", "XL"
]

# Standard codes for older years
CODES_OLD = [
    "ae", "ag", "ar", "bm", "bt", "ce", "ch", "cs", "cy", "ec", 
    "ee", "es", "ey", "ge", "gg", "in", "ma", "me", "mn", "mt", 
    "nm", "pe", "ph", "pi", "st", "tf", "xe", "xh", "xl"
]

BASE_DIR = "GATE_Papers"
FAILED_LOG = "failed_downloads.txt"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

stats = {"downloaded": 0, "skipped": 0, "failed": 0}

def log_failure(url, reason):
    with open(FAILED_LOG, "a") as f:
        f.write(f"{url} | {reason}\n")
    stats["failed"] += 1

def download_file(url, year, code):
    year_dir = os.path.join(BASE_DIR, str(year))
    if not os.path.exists(year_dir):
        os.makedirs(year_dir)

    filename = f"{code.upper()}_{year}.pdf"
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
            log_failure(url, f"HTTP {response.status_code}")
    except Exception as e:
        log_failure(url, str(e))
    return False

def run_downloader():
    # 1. GATE 2025 - IIT Roorkee (New Confirmed Path)
    # Pattern: https://gate2025.iitr.ac.in/doc/2025/2025_QP/{CODE}.pdf
    print("\n--- Processing GATE 2025 ---")
    for code in CODES_2025:
        url = f"https://gate2025.iitr.ac.in/doc/2025/2025_QP/{code}.pdf"
        download_file(url, 2025, code)

    # 2. Bonus Older Years - IIT Roorkee Archive
    # Pattern: https://gate2025.iitr.ac.in/doc/download/{year}/{code}_{year}.pdf
    for year in [2023, 2020]:
        print(f"\n--- Processing GATE {year} (Archive) ---")
        for code in CODES_OLD:
            url = f"https://gate2025.iitr.ac.in/doc/download/{year}/{code}_{year}.pdf"
            download_file(url, year, code)

    print("\n" + "="*30)
    print("DOWNLOAD SUMMARY")
    print(f"Total Downloaded: {stats['downloaded']}")
    print(f"Total Skipped:    {stats['skipped']}")
    print(f"Total Failed:     {stats['failed']}")
    print("="*30)

if __name__ == "__main__":
    # Disable warnings for insecure requests (verify=False)
    requests.packages.urllib3.disable_warnings()
    run_downloader()
