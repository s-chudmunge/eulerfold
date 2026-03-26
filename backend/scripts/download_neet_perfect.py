import os
import requests
import re

BASE_TARGET_DIR = "Papers/NEET"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

LINKS = {
    2025: "https://cdn.targetpublications.org/admin/downloads/NEET%20(UG)%20%20-%202025%20-%20Question%20Paper%20English_6799f0be90fa1.pdf",
    2024: "https://cdn.targetpublications.org/admin/downloads/NEET%20(UG)%20%20-%202024%20-%20Physics%20and%20Chemistry%20\u0026%20Biology_Final._666821a47dcd7.pdf",
    2023: "https://cdn.targetpublications.org/admin/downloads/NEET%20(UG)%20-%202023%20-%20English_64589990960fd.pdf",
    2022: "https://cdn.targetpublications.org/admin/downloads/NEET%20(UG)%20-%202022%20-%20English_62df86da006da.pdf",
    2021: "https://content.targetpublications.org/downloads/neet-ug/neet-2021-question-paper",
    2020: "https://cdn.targetpublications.org/admin/downloads/NEET%20(UG)%20-%202020%20-%20English_5f5f3dc6af0ba.pdf",
    2019: "https://cdn.targetpublications.org/admin/downloads/NEET%20(UG)%20-%202019%20-%20English_5cc966069cc0a.pdf",
    2018: "https://cdn.targetpublications.org/admin/downloads/NEET%20(UG)%20-%202018%20-%20English_5ad066fb9ca04.pdf",
    2017: "https://cdn.targetpublications.org/admin/downloads/NEET%20(UG)%20-%202017%20-%20English_5914090ea009a.pdf",
    2016: "https://cdn.targetpublications.org/admin/downloads/NEET%20(UG)%20-%202016%20-%20Phase%20I%20-%20English_57270fc6009ae.pdf",
    2015: "https://cdn.targetpublications.org/admin/downloads/AIPMT%20-%202015%20-%20English_55470fa6009a1.pdf",
    2014: "https://cdn.targetpublications.org/admin/downloads/AIPMT%20-%202014%20-%20English_536b0fa600a1a.pdf",
}

def download_neet():
    os.makedirs(BASE_TARGET_DIR, exist_ok=True)
    session = requests.Session()
    session.headers.update(HEADERS)
    
    for year, url in LINKS.items():
        filename = f"NEET_{year}_QP.pdf"
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
    download_neet()
