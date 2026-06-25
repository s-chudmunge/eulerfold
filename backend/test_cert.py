import io
import requests
from PIL import Image
import traceback

avatar_url = "https://lh3.googleusercontent.com/a/ACg8ocLrY4Yj3tYk5Ym2LkVwR9x_6v-p6Q_FwS-FkGvV8C_m6_M=s96-c" # Sample google avatar
try:
    print(f"Fetching {avatar_url}")
    resp = requests.get(avatar_url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        pil_img = Image.open(io.BytesIO(resp.content)).convert("RGBA")
        background = Image.new("RGBA", pil_img.size, (255, 255, 255))
        alpha_composite = Image.alpha_composite(background, pil_img)
        rgb_img = alpha_composite.convert("RGB")
        
        img_data = io.BytesIO()
        rgb_img.save(img_data, format="JPEG")
        img_data.seek(0)
        print("Success")
except Exception as e:
    print("Error:")
    traceback.print_exc()
