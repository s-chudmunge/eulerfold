import os
import requests
from PIL import Image
from io import BytesIO
from bs4 import BeautifulSoup
import urllib.parse

# Configuration
LOGOS_DIR = 'frontend/public/assets/logos'
os.makedirs(LOGOS_DIR, exist_ok=True)

WIKIMEDIA_LOGOS = {
    "GATE": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/GATE_logo.svg/320px-GATE_logo.svg.png",
    "IMO": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/IMO_logo.svg/300px-IMO_logo.svg.png",
    "IPhO": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IPhO_logo.svg/320px-IPhO_logo.svg.png",
    "IChO": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/IChO_logo.svg/320px-IChO_logo.svg.png",
    "IAO": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/IAO_logo.png/320px-IAO_logo.png",
    "MAT": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/320px-Oxford-University-Circlet.svg.png",
    "PAT": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/320px-Oxford-University-Circlet.svg.png",
    "Putnam": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/MAA_logo.svg/320px-MAA_logo.svg.png",
}

OFFICIAL_SITES = {
    "GATE": "https://gate2025.iitb.ac.in/",
    "IAO": "http://www.issp.ac.ru/iao/",
    "IChO": "https://www.ichosc.org/",
    "IMO": "https://www.imo-official.org/",
    "IPhO": "https://www.ipho-new.org/",
    "MAT": "https://www.ox.ac.uk/",
    "PAT": "https://www.ox.ac.uk/",
    "Putnam": "https://www.maa.org/math-competitions/putnam-competition"
}

def process_image(content, exam_name):
    try:
        img = Image.open(BytesIO(content)).convert('RGBA')
        # Use a high-quality resampling filter (LANCZOS)
        img.thumbnail((200, 200), Image.LANCZOS)
        
        # Create a new white background image if needed, or just save with transparency
        # Given the UI is white/black, RGBA is fine.
        target_path = os.path.join(LOGOS_DIR, f"{exam_name}.png")
        img.save(target_path, "PNG")
        return True
    except Exception as e:
        print(f"  Error processing image for {exam_name}: {e}")
        return False

def fetch_fallback_logo(exam_name, site_url):
    print(f"  Attempting fallback for {exam_name} from {site_url}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(site_url, headers=headers, timeout=15)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        img_tags = soup.find_all('img')
        
        # Sort by relevance (contains logo/brand/header)
        best_logo_url = None
        for img in img_tags:
            src = img.get('src', '')
            alt = img.get('alt', '').lower()
            if any(keyword in src.lower() or keyword in alt for keyword in ['logo', 'brand', 'header']):
                best_logo_url = urllib.parse.urljoin(site_url, src)
                break
        
        if not best_logo_url and img_tags:
            # Just take the first image if no logo keyword found
            best_logo_url = urllib.parse.urljoin(site_url, img_tags[0].get('src'))

        if best_logo_url:
            print(f"  Found fallback URL: {best_logo_url}")
            res = requests.get(best_logo_url, headers=headers, timeout=10)
            if res.status_code == 200:
                return res.content
    except Exception as e:
        print(f"  Fallback failed for {exam_name}: {e}")
    return None

stats = {"found": [], "fallback": [], "failed": []}

for exam, wiki_url in WIKIMEDIA_LOGOS.items():
    print(f"Processing {exam}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    success = False
    
    # Try Wikimedia first
    try:
        response = requests.get(wiki_url, headers=headers, timeout=10)
        if response.status_code == 200:
            if process_image(response.content, exam):
                print(f"  Successfully downloaded from Wikimedia.")
                stats["found"].append(exam)
                success = True
        else:
            print(f"  Wikimedia returned {response.status_code}")
    except Exception as e:
        print(f"  Wikimedia failed: {e}")

    # Fallback if Wikimedia failed
    if not success:
        site_url = OFFICIAL_SITES.get(exam)
        if site_url:
            content = fetch_fallback_logo(exam, site_url)
            if content and process_image(content, exam):
                print(f"  Successfully downloaded from official site.")
                stats["fallback"].append(exam)
                success = True
    
    if not success:
        print(f"  CRITICAL: Could not find logo for {exam}")
        stats["failed"].append(exam)

print("\n--- Summary ---")
print(f"Found via Wikimedia: {', '.join(stats['found']) or 'None'}")
print(f"Found via Fallback:  {', '.join(stats['fallback']) or 'None'}")
print(f"Failed:              {', '.join(stats['failed']) or 'None'}")
