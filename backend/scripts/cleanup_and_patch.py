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
BASE_DIR = "Papers"

def fetch_page(url):
    time.sleep(DELAY)
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        return response.text
    except:
        return None

def download_file(url, save_path):
    if os.path.exists(save_path):
        return True
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    try:
        time.sleep(DELAY)
        response = requests.get(url, headers=HEADERS, timeout=30, stream=True)
        if response.status_code == 404: return False
        response.raise_for_status()
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk: f.write(chunk)
        return True
    except:
        return False

def patch_ugc_net():
    print("\n--- Patching UGC-NET High-Demand Subjects ---")
    hub_url = "https://www.ugcnetonline.in/previous_question_papers.php"
    html = fetch_page(hub_url)
    if not html: return
    
    soup = BeautifulSoup(html, 'html.parser')
    sub_pages = []
    for link in soup.find_all('a', href=True):
        if "question_papers_" in link['href']:
            sub_pages.append(urllib.parse.urljoin(hub_url, link['href']))
    
    # Target high-demand subjects from prompt
    target_map = {
        "economics": "Economics",
        "mathematics": "Mathematics",
        "physics": "Physics",
        "chemistry": "Chemistry",
        "life science": "LifeSciences"
    }

    for page_url in sub_pages:
        print(f"  Scraping: {page_url.split('/')[-1]}")
        p_html = fetch_page(page_url)
        if not p_html: continue
        p_soup = BeautifulSoup(p_html, 'html.parser')
        
        yr_match = re.search(r'20\d{2}', page_url)
        yr = yr_match.group(0) if yr_match else "Unknown"
        sess = "June" if any(x in page_url.lower() for x in ["june", "july", "jun", "jul"]) else "Dec"
        
        for row in p_soup.find_all('tr'):
            text = row.get_text().lower()
            
            found_subject = None
            for kw, sub_name in target_map.items():
                if kw in text:
                    found_subject = sub_name
                    break
            
            if found_subject:
                for link in row.find_all('a', href=True):
                    href = link['href']
                    if not (href.lower().endswith('.pdf') or "showPdf.php" in href): continue
                    
                    if "paper ii" in text or "paper-ii" in text or "paper ii" in href.lower():
                        filename = f"{found_subject}_Paper2_{yr}_{sess}.pdf"
                        save_path = os.path.join(BASE_DIR, "UGC_NET", filename)
                        full_url = urllib.parse.urljoin(page_url, href)
                        if download_file(full_url, save_path):
                            print(f"    [+] Downloaded: {filename}")

def standardize_filenames():
    print("\n--- Standardizing Filenames ---")
    print(f"{'BEFORE':<60} | {'AFTER'}")
    print("-" * 120)
    
    for root, dirs, files in os.walk(BASE_DIR):
        if "misc" in root: continue
        
        exam_folder = os.path.basename(root)
        if exam_folder == "Papers": continue
        
        for f in files:
            if not f.endswith(".pdf"): continue
            
            # Clean up double exam names if already renamed incorrectly
            clean_f = f
            if clean_f.startswith(f"{exam_folder}_{exam_folder}_"):
                clean_f = clean_f.replace(f"{exam_folder}_{exam_folder}_", f"{exam_folder}_", 1)
            elif clean_f.startswith(f"{exam_folder}_"):
                pass # Already prefixed, but we want to re-parse to be safe or keep it
            
            # Re-parse from original or near-original
            # We want: {EXAM}_{SUBJECT}_{YEAR}_{SESSION}.pdf
            
            # Extract Year
            year_match = re.search(r'20\d{2}', f)
            year = year_match.group(0) if year_match else "Unknown"
            
            # Extract Session
            session = ""
            if "June" in f or "june" in f.lower(): session = "June"
            elif "Dec" in f or "dec" in f.lower(): session = "Dec"
            
            # Extract Subject
            # Remove year, session, and exam prefix to find subject
            sub_part = f.replace(".pdf", "")
            sub_part = sub_part.replace(year, "").replace(session, "")
            sub_part = sub_part.replace(exam_folder, "").replace("__", "_")
            sub_part = sub_part.strip("_")
            
            # Handle specific folder logic
            subject = sub_part
            if exam_folder == "JAM":
                # Original was BT_2012.pdf -> JAM_BT_2012.pdf
                pass 
            elif exam_folder == "TIFR":
                # Original was Biology_2015.pdf -> TIFR_Biology_2015.pdf
                pass
            elif exam_folder == "JEST":
                # Original was JEST_Physics_2012.pdf -> JEST_Physics_2012.pdf
                if "Physics" not in subject: subject = "Physics"
            elif exam_folder == "CSIR_NET":
                # Original was Physical_Sciences_2016_Dec.pdf -> CSIR_NET_Physical_Sciences_2016_Dec.pdf
                pass
            elif exam_folder == "UGC_NET":
                # Paper1_2010_Dec.pdf -> UGC_NET_Paper1_2010_Dec.pdf
                pass

            # Final Cleanup of Subject
            subject = subject.replace("_Unsolved", "").replace("  ", " ").strip("_")
            if not subject: subject = "Unknown"

            # Reconstruct
            new_name = f"{exam_folder}_{subject}_{year}"
            if session: new_name += f"_{session}"
            new_name += ".pdf"
            
            if f != new_name:
                old_path = os.path.join(root, f)
                new_path = os.path.join(root, new_name)
                # Avoid collision
                if os.path.exists(new_path) and old_path != new_path:
                    # If it already exists, it might be a set or duplicate
                    continue 
                os.rename(old_path, new_path)
                print(f"{f:<60} | {new_name}")

if __name__ == "__main__":
    patch_ugc_net()
    standardize_filenames()
