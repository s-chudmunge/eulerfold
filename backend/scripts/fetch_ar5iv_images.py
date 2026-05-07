import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import sys

def fetch_figures(paper_id):
    """
    Fetches figures and their captions from arXiv HTML (preferred) or ar5iv for a given arXiv ID.
    """
    # Try official arXiv HTML first (new standard)
    arxiv_url = f"https://arxiv.org/html/{paper_id}"
    ar5iv_url = f"https://ar5iv.labs.arxiv.org/html/{paper_id}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    print(f"Trying {arxiv_url}...")
    try:
        response = requests.get(arxiv_url, headers=headers, timeout=15)
        # If it redirects to the abstract or 404, it's not available in HTML
        if response.status_code == 200 and "/html/" in response.url:
            figures = extract_from_soup(response.text, response.url)
            if figures:
                return figures
        print("Official arXiv HTML not available or no figures found, trying ar5iv...")
    except Exception as e:
        print(f"Error fetching from arXiv: {e}")

    print(f"Trying {ar5iv_url}...")
    try:
        response = requests.get(ar5iv_url, headers=headers, timeout=15)
        # Check if it redirected to arxiv abstract
        if response.status_code == 200 and "/abs/" not in response.url:
            return extract_from_soup(response.text, response.url)
    except Exception as e:
        print(f"Error fetching from ar5iv: {e}")
        
    return []

def extract_from_soup(html_text, base_url):
    soup = BeautifulSoup(html_text, 'html.parser')
    figures = []
    
    # Common patterns for figures in LaTeXML/arXiv HTML
    for fig in soup.find_all(['figure', 'div'], class_=['ltx_figure', 'ltx_table', 'figure']):
        img = fig.find('img')
        # Captions can be in figcaption or span/div with ltx_caption class
        caption = fig.find(['figcaption', 'span', 'div'], class_=['ltx_caption', 'caption'])
        
        img_src = img.get('src') if img else None
        cap_text = caption.get_text().strip() if caption else "No caption"
        
        if img_src:
            # Handle relative paths
            absolute_url = urljoin(base_url, img_src)
            figures.append({'src': absolute_url, 'caption': cap_text})
            
    # Fallback: if no figures found by class, just look for all images in the document
    if not figures:
        for img in soup.find_all('img'):
            img_src = img.get('src')
            if img_src and not img_src.startswith('data:'):
                absolute_url = urljoin(base_url, img_src)
                figures.append({'src': absolute_url, 'caption': "Image from paper"})
                
    return figures

if __name__ == "__main__":
    if len(sys.argv) > 1:
        paper_ids = sys.argv[1:]
        for pid in paper_ids:
            print(f"\n--- Paper ID: {pid} ---")
            figs = fetch_figures(pid)
            if not figs:
                print("No figures found or error occurred.")
            for fig in figs:
                print(f"Source: {fig['src']}")
                print(f"Caption: {fig['caption']}\n")
    else:
        # Default papers if no args provided
        papers = {
            "mamba": "2312.00752",
            "attention-is-all-you-need": "1706.03762"
        }
        for name, pid in papers.items():
            print(f"\n--- {name} ({pid}) ---")
            figs = fetch_figures(pid)
            for fig in figs:
                print(f"Source: {fig['src']}")
                print(f"Caption: {fig['caption']}\n")
