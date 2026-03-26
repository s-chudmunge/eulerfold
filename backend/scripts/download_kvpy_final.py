import os
import time
import requests

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}
RETRY_COUNT = 3
TIMEOUT = 30
BASE_DIR = "Papers/KVPY"

# Using the .ernet.in mirror for all links
kvpy_papers = [
    # 2021
    ("http://www.kvpy.iisc.ernet.in/main/resources/2021/STREAM_SA.pdf", "KVPY_SA_2021.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/2021/STREAM_SX-SB.pdf", "KVPY_SBSX_2021.pdf"),
    # 2020
    ("http://www.kvpy.iisc.ernet.in/main/resources/2020/STREAM_SA.pdf", "KVPY_SA_2020.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/2020/STREAM_SX-SB.pdf", "KVPY_SBSX_2020.pdf"),
    # 2019
    ("http://www.kvpy.iisc.ernet.in/main/resources/2019/STREAM%20SA%203rd%20Nov%202019.pdf", "KVPY_SA_2019.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/2019/STREAM%20SBSX%203rd%20Nov%202019.pdf", "KVPY_SBSX_2019.pdf"),
    # 2018
    ("http://www.kvpy.iisc.ernet.in/main/resources/2018/65843038_SA.pdf", "KVPY_SA_2018.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/2018/65843050_SX.pdf", "KVPY_SBSX_2018.pdf"),
    # 2017
    ("http://www.kvpy.iisc.ernet.in/main/resources/2017/SA_05-NOV-17.pdf", "KVPY_SA_2017.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/2017/SB_05-NOV-17.pdf", "KVPY_SBSX_2017.pdf"),
    # 2016
    ("http://www.kvpy.iisc.ernet.in/main/resources/2016_qp_sa.pdf", "KVPY_SA_2016.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/2016_qp_sb_sx.pdf", "KVPY_SBSX_2016.pdf"),
    # 2015
    ("http://www.kvpy.iisc.ernet.in/main/resources/2015_qp_sa.pdf", "KVPY_SA_2015.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/2015_qp_sb_sx.pdf", "KVPY_SBSX_2015.pdf"),
    # 2014
    ("http://www.kvpy.iisc.ernet.in/main/resources/2014_qp_sa.pdf", "KVPY_SA_2014.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/2014_qp_sb_sx.pdf", "KVPY_SBSX_2014.pdf"),
    # 2013
    ("http://www.kvpy.iisc.ernet.in/main/resources/2013_qp_sa.pdf", "KVPY_SA_2013.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/2013_qp_sb_sx.pdf", "KVPY_SBSX_2013.pdf"),
    # 2012
    ("http://www.kvpy.iisc.ernet.in/main/resources/2012-qa-sa.pdf", "KVPY_SA_2012.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/2012-qa-sbsx.pdf", "KVPY_SBSX_2012.pdf"),
    # 2011
    ("http://www.kvpy.iisc.ernet.in/main/resources/SA_English_QP_2011.pdf", "KVPY_SA_2011.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/SB_SX_English_QP_2011.pdf", "KVPY_SBSX_2011.pdf"),
    # 2010
    ("http://www.kvpy.iisc.ernet.in/main/resources/kvpy2010-SA-PartA.pdf", "KVPY_SA_2010_PartA.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/kvpy2010-SA-PartB.pdf", "KVPY_SA_2010_PartB.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/kvpy2010-SB-SX.pdf", "KVPY_SBSX_2010.pdf"),
    # 2009
    ("http://www.kvpy.iisc.ernet.in/main/resources/SA_2009.pdf", "KVPY_SA_2009.pdf"),
    ("http://www.kvpy.iisc.ernet.in/main/resources/SB_2009.pdf", "KVPY_SB_2009.pdf"),
]

def download_file(url, filename):
    save_path = os.path.join(BASE_DIR, filename)
    if os.path.exists(save_path):
        return True

    for attempt in range(RETRY_COUNT):
        try:
            print(f"  [>] Fetching: {url}")
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)
            if response.status_code == 404:
                return False
            response.raise_for_status()
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk: f.write(chunk)
            print(f"    [+] Saved: {filename}")
            return True
        except Exception as e:
            if attempt == RETRY_COUNT - 1:
                print(f"    [!] Failed {url}: {e}")
            else:
                time.sleep(2)
    return False

if __name__ == "__main__":
    os.makedirs(BASE_DIR, exist_ok=True)
    print("\n--- Downloading KVPY Papers (IISc Ernet Mirror) ---")
    downloaded = 0
    for url, filename in kvpy_papers:
        if download_file(url, filename):
            downloaded += 1
    print(f"\nDone. Captured {downloaded} KVPY papers.")
