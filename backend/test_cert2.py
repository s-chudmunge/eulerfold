import io
import requests
from PIL import Image

url = "https://api.dicebear.com/9.x/initials/png?seed=srushtijsurya18_79ed"
resp = requests.get(url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
print(resp.status_code)
if resp.status_code == 200:
    pil_img = Image.open(io.BytesIO(resp.content))
    print(pil_img.format)
