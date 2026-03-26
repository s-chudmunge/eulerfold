import os
import time
import requests

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}
DELAY = 1.5
RETRY_COUNT = 3
TIMEOUT = 30
LOG_FILE = "failed_downloads.txt"
BASE_DIR = "Papers"

class Group4Downloader:
    def __init__(self):
        self.stats = {
            "AP": {"downloaded": 0, "skipped": 0, "failed": 0},
        }
        if not os.path.exists(LOG_FILE):
            with open(LOG_FILE, "w") as f:
                f.write("Failed Downloads Log - Group 4\n" + "="*30 + "\n")

    def log_failure(self, exam, url, error):
        with open(LOG_FILE, "a") as f:
            f.write(f"[{exam}] {url} - {error}\n")

    def download_file(self, url, save_path, exam_name):
        if os.path.exists(save_path):
            self.stats["AP"]["skipped"] += 1
            return True

        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        print(f"    [>] Attempting: {url}")

        for attempt in range(RETRY_COUNT):
            try:
                time.sleep(DELAY)
                response = requests.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)
                
                if response.status_code == 404:
                    return False
                
                response.raise_for_status()
                with open(save_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk: f.write(chunk)
                
                self.stats["AP"]["downloaded"] += 1
                print(f"    [+] Saved to {save_path}")
                return True

            except Exception as e:
                if attempt == RETRY_COUNT - 1:
                    print(f"    [!] Failed to download {url}: {e}")
                    self.log_failure(exam_name, url, str(e))
                    self.stats["AP"]["failed"] += 1
        return False

    def run_ap(self):
        print("\n--- Downloading AP Free Response Papers ---")
        subjects = [
            "physics-1", "physics-2", "physics-c-mechanics", "physics-c-em",
            "chemistry", "biology", "calculus-ab", "calculus-bc", "statistics"
        ]
        
        for year in range(12, 26):
            yy = str(year).zfill(2)
            yyyy = f"20{yy}"
            for sub in subjects:
                # Primary pattern (2-digit year)
                url = f"https://apcentral.collegeboard.org/media/pdf/ap{yy}-frq-{sub}.pdf"
                save_path = os.path.join(BASE_DIR, "AP", f"AP_{sub}_{yyyy}_frq.pdf")
                
                success = self.download_file(url, save_path, "AP")
                
                # Fallback pattern (4-digit year) if 404
                if not success:
                    url_fallback = f"https://apcentral.collegeboard.org/media/pdf/ap{yyyy}-frq-{sub}.pdf"
                    self.download_file(url_fallback, save_path, "AP")

    def print_summary(self):
        print("\n" + "="*50)
        print(f"{'GROUP 4 SUMMARY':^50}")
        print("="*50)
        print(f"{'Exam':<15} | {'Downloaded':<12} | {'Skipped':<10} | {'Failed':<10}")
        print("-" * 50)
        for exam, data in self.stats.items():
            print(f"{exam:<15} | {data['downloaded']:<12} | {data['skipped']:<10} | {data['failed']:<10}")
        print("="*50)

if __name__ == "__main__":
    d = Group4Downloader()
    d.run_ap()
    d.print_summary()
