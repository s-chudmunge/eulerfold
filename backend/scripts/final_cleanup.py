import os
import re
import json
import fitz
import time
import shutil

BASE_DIR = "Papers"
INVENTORY_FILE = os.path.join(BASE_DIR, "master_inventory.json")

def get_year_from_text(text):
    # Look for 4-digit years between 1987 and 2026
    matches = re.findall(r'\b(19[8-9]\d|20[0-2]\d)\b', text)
    if matches:
        # Return most frequent or first
        return max(set(matches), key=matches.count)
    return None

def resolve_step_unknowns():
    print("--- Task 1: Resolving STEP UNKNOWN years ---")
    step_dir = os.path.join(BASE_DIR, "STEP")
    if not os.path.exists(step_dir):
        return
    
    files = [f for f in os.listdir(step_dir) if "UNKNOWN" in f and f.endswith(".pdf")]
    resolved = 0
    
    for filename in files:
        filepath = os.path.join(step_dir, filename)
        year = None
        
        # 1. Check filename for year
        match = re.search(r'(19[8-9]\d|20[0-2]\d)', filename)
        if match:
            year = match.group(1)
            
        # 2. Check text if filename didn't work
        if not year:
            try:
                doc = fitz.open(filepath)
                text = doc[0].get_text()
                year = get_year_from_text(text)
                doc.close()
            except:
                pass
        
        if year:
            new_name = filename.replace("UNKNOWN", year)
            new_path = os.path.join(step_dir, new_name)
            if not os.path.exists(new_path):
                os.rename(filepath, new_path)
                print(f"  [RESOLVED] {filename} -> {new_name}")
                resolved += 1
            else:
                # Keep original to avoid overwrite
                pass
                
    print(f"Result: {resolved} resolved, {len(files) - resolved} still unknown.")

def fix_tifr_2026():
    print("\n--- Task 2: Fixing TIFR 2026 labels ---")
    tifr_dir = os.path.join(BASE_DIR, "TIFR")
    if not os.path.exists(tifr_dir):
        return
    
    files = [f for f in os.listdir(tifr_dir) if "2026" in f and f.endswith(".pdf")]
    
    for filename in files:
        filepath = os.path.join(tifr_dir, filename)
        actual_year = None
        
        try:
            doc = fitz.open(filepath)
            text = doc[0].get_text()
            actual_year = get_year_from_text(text)
            doc.close()
        except:
            pass
            
        if actual_year and actual_year != "2026":
            new_name = filename.replace("2026", actual_year)
        else:
            new_name = filename.replace("2026", "UNKNOWN")
            
        new_path = os.path.join(tifr_dir, new_name)
        print(f"  [TIFR FIX] {filename} -> {new_name}")
        os.rename(filepath, new_path)

def generate_inventory():
    print("\n--- Regenerating Master Inventory ---")
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
            
            # Extract basic info from standardized name
            # Format: EXAM_SUBJECT_YEAR_TYPE.pdf or EXAM_SUBJECT_YEAR_SESSION_TYPE.pdf
            parts = f.replace(".pdf", "").split("_")
            year = "UNKNOWN"
            dtype = "QP"
            for p in parts:
                if p.isdigit() and len(p) == 4:
                    year = p
                if p in ["QP", "SG", "SOL"]:
                    dtype = p
            
            inventory["all_files"].append({
                "filename": f, "exam": exam, "path": path, "size_kb": size_kb, "year": year, "type": dtype
            })
            
            if exam not in stats:
                stats[exam] = {"count": 0, "years": [], "QP": 0, "SOL": 0, "UNKNOWN_YEAR": 0}
            
            stats[exam]["count"] += 1
            if year.isdigit():
                stats[exam]["years"].append(int(year))
            else:
                stats[exam]["UNKNOWN_YEAR"] += 1
                
            if dtype in ["SOL", "SG"]:
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
    print("├" + "─"*13 + "┼" + "─"*7 + "┼" + "─"*12 + "┼" + "─"*5 + "┼" + "─"*5 + "┼" + "─"*9 + "┤")
    print(f"│ TOTAL       │ {inventory['total_files']:^5} │            │     │     │         │")
    print("└" + "─"*13 + "┴" + "─"*7 + "┴" + "─"*12 + "┴" + "─"*5 + "┴" + "─"*5 + "┴" + "─"*9 + "┘")

if __name__ == "__main__":
    resolve_step_unknowns()
    fix_tifr_2026()
    generate_inventory()
