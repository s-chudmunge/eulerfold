import os
import shutil
import json
import re
import requests
import time
import subprocess

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}
DELAY = 1.5
TIMEOUT = 30
BASE_DIR = "Papers"
AP_FRESH = os.path.join(BASE_DIR, "AP_fresh")
STEP_FRESH = os.path.join(BASE_DIR, "STEP_fresh")
INVENTORY_FILE = os.path.join(BASE_DIR, "master_inventory.json")

def download_file(url, save_path):
    if os.path.exists(save_path):
        return True

    for attempt in range(3):
        try:
            time.sleep(DELAY)
            r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)
            if r.status_code == 404:
                return False
            r.raise_for_status()
            with open(save_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"    [+] Saved: {os.path.basename(save_path)}")
            return True
        except Exception as e:
            if attempt == 2:
                print(f"    [!] Failed {url}: {e}")
    return False

def step1_ap():
    print("\n--- STEP 1: Re-downloading AP 2012–2025 ---")
    os.makedirs(AP_FRESH, exist_ok=True)
    subjects = {
        "calculus-ab": "CALCULUS_AB",
        "calculus-bc": "CALCULUS_BC",
        "physics-1": "PHYSICS_1",
        "physics-2": "PHYSICS_2",
        "physics-c-mechanics": "PHYSICS_C_MECH",
        "physics-c-em": "PHYSICS_C_EM",
        "chemistry": "CHEM",
        "biology": "BIO",
        "statistics": "STATS"
    }
    
    for yy in range(12, 26):
        year_str = f"20{yy:02d}"
        for slug, code in subjects.items():
            # QP and SG
            for suffix, label in [("frq", "QP"), ("sg", "SG")]:
                filename = f"AP_{code}_{year_str}_{label}.pdf"
                save_path = os.path.join(AP_FRESH, filename)
                
                if os.path.exists(save_path): continue
                
                url = f"https://apcentral.collegeboard.org/media/pdf/ap{yy:02d}-{suffix}-{slug}.pdf"
                print(f"  Attempting: {filename}")
                if not download_file(url, save_path):
                    # Try Wayback
                    wayback = f"https://web.archive.org/web/2022/{url}"
                    print(f"    [404] Trying Wayback: {filename}")
                    download_file(wayback, save_path)

def step2_step():
    print("\n--- STEP 2: Re-downloading STEP ---")
    os.makedirs(STEP_FRESH, exist_ok=True)
    
    step_direct = [
        ("https://step.maths.org/sites/default/files/2025-06/STEP2_2024_Mock.pdf", "STEP_2_2024_SOL.pdf"),
        ("https://step.maths.org/sites/default/files/2025-06/STEP3_2024_Mock.pdf", "STEP_3_2024_SOL.pdf"),
        ("https://step.maths.org/sites/default/files/2025-02/2023STEP2Mock.pdf", "STEP_2_2023_SOL.pdf"),
        ("https://step.maths.org/sites/default/files/2025-02/2023STEP3Mock.pdf", "STEP_3_2023_SOL.pdf"),
        ("https://step.maths.org/sites/default/files/2023-06/2022STEP2Mock_0.pdf", "STEP_2_2022_SOL.pdf"),
        ("https://step.maths.org/sites/default/files/2023-06/2022STEP3Mock.pdf", "STEP_3_2022_SOL.pdf"),
        ("https://step.maths.org/sites/default/files/2023-06/STEP_2_2021_Mock_0.pdf", "STEP_2_2021_SOL.pdf"),
        ("https://step.maths.org/sites/default/files/2023-06/STEP_3_2021_Mock.pdf", "STEP_3_2021_SOL.pdf"),
        ("https://step.maths.org/sites/default/files/2023-06/STEP_2_2020_Mock.pdf", "STEP_2_2020_SOL.pdf"),
        ("https://step.maths.org/sites/default/files/2023-06/STEP_3_2020_Mock.pdf", "STEP_3_2020_SOL.pdf"),
        ("https://step.maths.org/sites/default/files/2023-06/STEP2_2019_Mock.pdf", "STEP_2_2019_SOL.pdf"),
        ("https://step.maths.org/sites/default/files/2023-06/STEP3_2019_Mock_0.pdf", "STEP_3_2019_SOL.pdf"),
    ]
    
    print("  Downloading direct STEP papers...")
    for url, filename in step_direct:
        download_file(url, os.path.join(STEP_FRESH, filename))
        
    print("  Running gdown for STEP archive...")
    cmd = [
        "gdown", "--folder", 
        "https://drive.google.com/drive/folders/1KeO280n5uSccXv9ir2QU6BzHlRzTTBFF",
        "-O", STEP_FRESH, "--remaining-ok"
    ]
    subprocess.run(cmd)
    
    print("  Renaming STEP archive files...")
    for f in os.listdir(STEP_FRESH):
        if f.startswith("STEP_") and "_" in f: continue # Already standard
        
        path = os.path.join(STEP_FRESH, f)
        if not os.path.isfile(path): continue
        
        year_m = re.search(r'(19|20)\d{2}', f)
        paper_m = re.search(r'(II|III|2|3)', f)
        paper_num = "3" if paper_m and paper_m.group() in ["III","3"] else "2"
        type_ = "SOL" if any(x in f.lower() for x in ["mark","solution","ans","hints","report"]) else "QP"
        
        if year_m:
            year = year_m.group()
            new_name = f"STEP_{paper_num}_{year}_{type_}.pdf"
            new_path = os.path.join(STEP_FRESH, new_name)
            
            if not os.path.exists(new_path):
                os.rename(path, new_path)
            else:
                new_name = f"STEP_{paper_num}_{year}_{type_}_v2.pdf"
                os.rename(path, os.path.join(STEP_FRESH, new_name))

def step3_merge():
    print("\n--- STEP 3: Merging Fresh Folders ---")
    for fresh, main in [("AP_fresh", "AP"), ("STEP_fresh", "STEP")]:
        fresh_dir = os.path.join(BASE_DIR, fresh)
        main_dir = os.path.join(BASE_DIR, main)
        os.makedirs(main_dir, exist_ok=True)
        
        if not os.path.exists(fresh_dir): continue
        
        for root, _, files in os.walk(fresh_dir):
            for f in files:
                if not f.endswith(".pdf"): continue
                src = os.path.join(root, f)
                dst = os.path.join(main_dir, f)
                
                if os.path.exists(dst):
                    # print(f"  [SKIP] {f} exists in {main}")
                    pass
                else:
                    shutil.copy2(src, dst)
                    print(f"  [MERGED] {main}/{f}")

def step4_inventory():
    print("\n--- STEP 4: Regenerating Inventory ---")
    inventory = {
        "generated_at": time.strftime("%Y-%m-%d"),
        "total_files": 0,
        "exams": {},
        "all_files": []
    }
    stats = {}
    
    for root, dirs, files in os.walk(BASE_DIR):
        if "_misc" in root or "_fresh" in root: continue
        for f in files:
            if not f.endswith(".pdf") or f == "master_inventory.json": continue
            path = os.path.join(root, f)
            rel_root = os.path.relpath(root, BASE_DIR)
            exam = rel_root.split(os.sep)[0]
            
            size_kb = int(os.path.getsize(path) / 1024)
            inventory["all_files"].append({
                "filename": f, "exam": exam, "path": path, "size_kb": size_kb
            })
            
            if exam not in stats:
                stats[exam] = {"count": 0, "years": [], "QP": 0, "SOL": 0, "UNKNOWN_YEAR": 0}
            
            stats[exam]["count"] += 1
            year_match = re.search(r'_(\d{4})_', f)
            if year_match:
                stats[exam]["years"].append(int(year_match.group(1)))
            else:
                stats[exam]["UNKNOWN_YEAR"] += 1
                
            if "_SOL.pdf" in f or "_SG.pdf" in f:
                stats[exam]["SOL"] += 1
            else:
                stats[exam]["QP"] += 1

    inventory["total_files"] = len(inventory["all_files"])
    with open(INVENTORY_FILE, "w") as jf:
        json.dump(inventory, jf, indent=2)
        
    print("\n" + "┌" + "─"*13 + "┬" + "─"*7 + "┬" + "─"*12 + "┬" + "─"*5 + "┬" + "─"*5 + "┬" + "─"*9 + "┐")
    print("│ Exam        │ Total │ Year Range │ QP  │ SOL │ UNKNOWN │")
    print("├" + "─"*13 + "┼" + "─"*7 + "┼" + "─"*12 + "┼" + "─"*5 + "┼" + "─"*5 + "┼" + "─"*9 + "┤")
    for ex in sorted(stats.keys()):
        s = stats[ex]
        yr = f"{min(s['years'])}-{max(s['years'])}" if s['years'] else "N/A"
        print(f"│ {ex:<11} │ {s['count']:^5} │ {yr:^10} │ {s['QP']:^3} │ {s['SOL']:^3} │ {s['UNKNOWN_YEAR']:^7} │")
    print("└" + "─"*13 + "┴" + "─"*7 + "┴" + "─"*12 + "┴" + "─"*5 + "┴" + "─"*5 + "┴" + "─"*9 + "┘")
    print(f"Total AP Files: {stats.get('AP', {}).get('count', 0)}")
    print(f"Total STEP Files: {stats.get('STEP', {}).get('count', 0)}")
    print(f"Overall Total: {inventory['total_files']}")

if __name__ == "__main__":
    step1_ap()
    step2_step()
    step3_merge()
    step4_inventory()
