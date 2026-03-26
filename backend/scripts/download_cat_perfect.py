import os
import requests
import zipfile
import io
import re

BASE_TARGET_DIR = "Papers/CAT"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def download_cat():
    os.makedirs(BASE_TARGET_DIR, exist_ok=True)
    url = "https://online.2iim.com/CAT-question-paper-pdf/CAT PYQ 2017-24.zip"
    
    try:
        r = requests.get(url, headers=HEADERS, timeout=30)
        r.raise_for_status()
        
        with zipfile.ZipFile(io.BytesIO(r.content)) as z:
            for member in z.namelist():
                if member.lower().endswith('.pdf'):
                    # The zip member might be in a folder like 'CAT PYQ 2017-24/CAT 2024 Slot 1.pdf'
                    filename = os.path.basename(member)
                    
                    year_match = re.search(r'20\d{2}', filename)
                    slot_match = re.search(r'Slot[- ]*(\d)', filename, re.I)
                    
                    year = year_match.group(0) if year_match else "Unknown"
                    slot = f"Slot{slot_match.group(1)}" if slot_match else "Slot1"
                    
                    target_name = f"CAT_{year}_{slot}_QP.pdf"
                    
                    with z.open(member) as source, open(os.path.join(BASE_TARGET_DIR, target_name), 'wb') as target:
                        target.write(source.read())
                    print(f"  [+] {target_name}")
    except Exception as e:
        print(f"  [!] Failed: {e}")

if __name__ == "__main__":
    download_cat()
