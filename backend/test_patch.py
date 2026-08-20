import httpx
import time

original_send = httpx.Client.send

def patched_send(self, request, *args, **kwargs):
    retries = 3
    for attempt in range(retries):
        try:
            print(f"Attempt {attempt}")
            if attempt == 0:
                raise httpx.ReadError("Fake [Errno 11] Resource temporarily unavailable")
            return original_send(self, request, *args, **kwargs)
        except httpx.ReadError as e:
            if attempt == retries - 1:
                raise
            if "Errno 11" in str(e) or "Resource temporarily unavailable" in str(e):
                print("Intercepted ReadError, retrying...")
                time.sleep(0.1)
            else:
                raise

httpx.Client.send = patched_send

with httpx.Client() as client:
    res = client.get("https://httpbin.org/get")
    print(res.status_code)
