import os
import requests
from bs4 import BeautifulSoup
import urllib.parse
import sys

def download_gate_papers(url="https://gate2024.iisc.ac.in/old-question-papers/", output_dir="gate_papers"):
    """
    Finds and saves previous year GATE papers from a given URL.
    By default, it targets the IISc Bangalore GATE 2024 archive.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created directory: {output_dir}")

    # Use a realistic User-Agent to avoid being blocked by some institutional servers
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    print(f"Fetching {url}...")
    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching the page: {e}")
        return

    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all <a> tags with href ending in .pdf
    links = soup.find_all('a', href=True)
    pdf_links = []
    for l in links:
        href = l['href']
        if href.lower().endswith('.pdf'):
            pdf_links.append(href)
    
    if not pdf_links:
        print("No PDF links found on this page.")
        # Try a different common archive if the default yields nothing
        if url == "https://gate2024.iisc.ac.in/old-question-papers/":
            print("Trying alternative archive (IIT Kanpur)...")
            download_gate_papers("https://gate.iitk.ac.in/gate_pyp.php", output_dir)
            return
        return

    print(f"Found {len(pdf_links)} PDF links.")
    
    downloaded_count = 0
    for link in pdf_links:
        # Resolve relative URLs to absolute ones
        full_url = urllib.parse.urljoin(url, link)
        filename = os.path.basename(full_url)
        
        # Clean up filename if it has query params
        filename = filename.split('?')[0]
        
        # Skip if not likely a paper (optional heuristic)
        # if not any(kw in filename.upper() for kw in ["GATE", "PAPER", "QP", "20"]):
        #     continue

        file_path = os.path.join(output_dir, filename)
        
        if os.path.exists(file_path):
            print(f"[-] Skipping {filename} (already exists)")
            continue
            
        print(f"[+] Downloading {filename}...")
        try:
            r = requests.get(full_url, headers=headers, stream=True, timeout=30)
            r.raise_for_status()
            with open(file_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            print(f"    Saved to {file_path}")
            downloaded_count += 1
        except Exception as e:
            print(f"    [!] Failed to download {filename}: {e}")

    print(f"\nDone! Downloaded {downloaded_count} new papers to '{output_dir}'.")

if __name__ == "__main__":
    # Allow user to pass a custom URL or use the default
    target_url = sys.argv[1] if len(sys.argv) > 1 else "https://gate2024.iisc.ac.in/old-question-papers/"
    download_gate_papers(target_url)
