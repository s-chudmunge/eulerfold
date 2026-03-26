import requests
from bs4 import BeautifulSoup
import urllib.parse

EXAMS = {
    "GATE": "https://gate2025.iitb.ac.in/",
    "IAO": "http://www.issp.ac.ru/iao/",
    "IChO": "https://www.ichosc.org/",
    "IMO": "https://www.imo-official.org/",
    "IPhO": "https://www.ipho-new.org/",
    "MAT": "https://www.ox.ac.uk/",
    "PAT": "https://www.ox.ac.uk/",
    "Putnam": "https://www.maa.org/math-competitions/putnam-competition"
}

def get_logo(name, url):
    print(f"Searching for {name} logo at {url}...")
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Strategy 1: Look for <img> tags with 'logo' in class or id
        logos = soup.find_all('img')
        for img in logos:
            src = img.get('src', '')
            alt = img.get('alt', '').lower()
            if 'logo' in src.lower() or 'logo' in alt:
                return urllib.parse.urljoin(url, src)
        
        # Strategy 2: Look for OpenGraph image
        og_image = soup.find('meta', property='og:image')
        if og_image:
            return og_image.get('content')
            
        return None
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

results = {}
for name, url in EXAMS.items():
    logo = get_logo(name, url)
    if logo:
        # Verify the logo link works
        try:
            res = requests.head(logo, timeout=5)
            if res.status_code == 200:
                results[name] = logo
            else:
                # Try GET if HEAD is forbidden
                res = requests.get(logo, stream=True, timeout=5)
                if res.status_code == 200:
                    results[name] = logo
        except:
            pass

print("\n--- FOUND LOGOS ---")
for name, logo in results.items():
    print(f'"{name}": "{logo}",')
