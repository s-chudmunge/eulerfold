import os
import time
import requests
from bs4 import BeautifulSoup
import urllib.parse
import re

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
BASE_TARGET_DIR = "Papers/UPSC"

UPSC_HARDCODED = {
    2025: {
        "PRELIMS_GS1": "https://afeias.com/wp-content/uploads/2025/06/CSE-25-GENERAL-STUDIES-PAPER-I.pdf",
        "PRELIMS_CSAT": "https://afeias.com/wp-content/uploads/2025/06/CSE-25-GENERAL-STUDIES-PAPER-II.pdf",
        "MAINS_GS1":   "https://afeias.com/wp-content/uploads/2025/09/Mains-2025-GS-Paper-I.pdf",
        "MAINS_GS2":   "https://afeias.com/wp-content/uploads/2025/09/Mains-2025-GS-Paper-II.pdf",
        "MAINS_GS3":   "https://afeias.com/wp-content/uploads/2025/09/Mains-2025-GS-Paper-III.pdf",
        "MAINS_GS4":   "https://afeias.com/wp-content/uploads/2025/09/Mains-2025-GS-Paper-IV.pdf",
        "MAINS_ESSAY": "https://afeias.com/wp-content/uploads/2025/09/Mains-2025-Essay.pdf",
    },
    2024: {
        "PRELIMS_GS1": "https://afeias.com/wp-content/uploads/2024/06/GS-1-2024.pdf",
        "PRELIMS_CSAT": "https://afeias.com/wp-content/uploads/2024/06/GS-2-2024.pdf",
        "MAINS_GS1":   "https://afeias.com/wp-content/uploads/2024/10/GS-1-UPSC-Mains-Paper.pdf",
        "MAINS_GS2":   "https://afeias.com/wp-content/uploads/2024/10/GS-2-UPSC-Mains-Paper.pdf",
        "MAINS_GS3":   "https://afeias.com/wp-content/uploads/2024/10/GS-3-UPSC-Mains-Paper.pdf",
        "MAINS_GS4":   "https://afeias.com/wp-content/uploads/2024/10/GS-4-UPSC-Mains-Paper.pdf",
        "MAINS_ESSAY": "https://afeias.com/wp-content/uploads/2024/10/ESSAY-UPSC-Mains-Paper.pdf",
    },
    2023: {
        "PRELIMS_GS1": "https://afeias.com/wp-content/uploads/2023/05/Prelims-Gs1-29-05-2023.pdf",
        "PRELIMS_CSAT": "https://afeias.com/wp-content/uploads/2023/05/Prelims-Gs2-CSAt-29-05-2023.pdf",
        "MAINS_GS1":   "https://afeias.com/wp-content/uploads/2023/11/MAINS-2023-General-Studies-Paper-I.pdf",
        "MAINS_GS2":   "https://afeias.com/wp-content/uploads/2023/11/MAINS-2023-General-Studies-Paper-II.pdf",
        "MAINS_GS3":   "https://afeias.com/wp-content/uploads/2023/11/MAINS-2023-General-Studies-Paper-III.pdf",
        "MAINS_GS4":   "https://afeias.com/wp-content/uploads/2023/11/MAINS-2023-General-Studies-Paper-IV.pdf",
        "MAINS_ESSAY": "https://afeias.com/wp-content/uploads/2023/11/MAINS-2023-ESSAY-Paper.pdf",
    },
    2022: {
        "PRELIMS_GS1": "https://afeias.com/wp-content/uploads/2022/06/GENERAL-STUDIES-PAPER-I.pdf",
        "PRELIMS_CSAT": "https://afeias.com/wp-content/uploads/2022/06/GENERAL-STUDIES-PAPER-II.pdf",
        "MAINS_GS1":   "https://afeias.com/wp-content/uploads/2022/11/GENERAL-STUDIES-PAPER-I-2022.pdf",
        "MAINS_GS2":   "https://afeias.com/wp-content/uploads/2022/11/GENERAL-STUDIES-PAPER-II-2022.pdf",
        "MAINS_GS3":   "https://afeias.com/wp-content/uploads/2022/11/GENERAL-STUDIES-PAPER-III-2022.pdf",
        "MAINS_GS4":   "https://afeias.com/wp-content/uploads/2022/11/GENERAL-STUDIES-PAPER-IV-2022.pdf",
        "MAINS_ESSAY": "https://afeias.com/wp-content/uploads/2022/11/ESSAY-2022.pdf",
    },
    2021: {
        "PRELIMS_GS1": "https://afeias.com/wp-content/uploads/2021/11/Prelims-2021-Paper-I.pdf",
        "PRELIMS_CSAT": "https://afeias.com/wp-content/uploads/2021/11/Prelims-2021-Paper-II.pdf",
        "MAINS_GS1":   "https://afeias.com/wp-content/uploads/2022/01/General-Studies-Paper-I-2021.pdf",
        "MAINS_GS2":   "https://afeias.com/wp-content/uploads/2022/01/General-Studies-Paper-II-2021.pdf",
        "MAINS_GS3":   "https://afeias.com/wp-content/uploads/2022/01/General-Studies-Paper-III-2021.pdf",
        "MAINS_GS4":   "https://afeias.com/wp-content/uploads/2022/01/General-Studies-Paper-IV-2021.pdf",
        "MAINS_ESSAY": "https://afeias.com/wp-content/uploads/2022/01/Essay-2021.pdf",
    }
}

def download_upsc():
    os.makedirs(BASE_TARGET_DIR, exist_ok=True)
    session = requests.Session()
    session.headers.update(HEADERS)
    
    for year, papers in UPSC_HARDCODED.items():
        print(f"Downloading UPSC {year}...")
        for key, url in papers.items():
            # Format: UPSC_{YEAR}_{PRELIMS/MAINS}_{SUBJECT}_QP.pdf
            filename = f"UPSC_{year}_{key}_QP.pdf"
            path = os.path.join(BASE_TARGET_DIR, filename)
            
            try:
                r = session.get(url, stream=True, timeout=30)
                r.raise_for_status()
                with open(path, 'wb') as f:
                    for chunk in r.iter_content(8192): f.write(chunk)
                print(f"  [+] {filename}")
            except:
                print(f"  [!] Failed {filename}")

if __name__ == "__main__":
    download_upsc()
