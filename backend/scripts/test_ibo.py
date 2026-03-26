import os
import requests
from bs4 import BeautifulSoup
import urllib.parse

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
url = "https://www.ibo-info.org/en/info/papers.html"

response = requests.get(url, headers=HEADERS)
soup = BeautifulSoup(response.text, 'html.parser')
links = soup.find_all('a', href=True)
print(f"Found {len(links)} links")
for link in links:
    href = link['href']
    if '.pdf' in href.lower():
        full_url = urllib.parse.urljoin(url, href)
        print(f"PDF found: {full_url}")
