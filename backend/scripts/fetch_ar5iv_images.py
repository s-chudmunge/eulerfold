import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import sys

def fetch_figures(paper_id):
    """
    Fetches figures and their captions from ar5iv for a given arXiv ID.
    """
    url = f"https://ar5iv.labs.arxiv.org/html/{paper_id}"
    print(f"Fetching {url}...")
    try:
        # User-Agent to avoid being blocked
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        figures = []
        # Find all figure elements
        for fig in soup.find_all('figure'):
            img = fig.find('img')
            caption = fig.find('figcaption')
            
            img_src = img.get('src') if img else None
            cap_text = caption.get_text().strip() if caption else "No caption"
            
            if img_src:
                # Use urljoin to handle relative paths correctly
                absolute_url = urljoin(url + "/", img_src)
                figures.append({'src': absolute_url, 'caption': cap_text})
        
        return figures
    except Exception as e:
        print(f"Error fetching {paper_id}: {e}")
        return []

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # If paper IDs are provided as arguments
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
            "attention-is-all-you-need": "1706.03762",
            "resnet-deep-residual-learning": "1512.03385",
            "word2vec-distributed-representations": "1310.4546"
        }
        for name, pid in papers.items():
            print(f"\n--- {name} ({pid}) ---")
            figs = fetch_figures(pid)
            for fig in figs:
                print(f"Source: {fig['src']}")
                print(f"Caption: {fig['caption']}\n")

    print("\nUsage hint: python fetch_ar5iv_images.py <arxiv_id1> <arxiv_id2> ...")
