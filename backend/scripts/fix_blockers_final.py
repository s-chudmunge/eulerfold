import os
import shutil
import json
import re
from pathlib import Path
import fitz  # PyMuPDF
import time

# Configuration
BASE_DIR = "Papers"
MISC_DIR = os.path.join(BASE_DIR, "_misc")
INVENTORY_FILE = os.path.join(BASE_DIR, "master_inventory.json")
UNKNOWN_YEARS_FILE = "unknown_years.txt"

IMPROVED_PATTERNS = [
    r'(19|20)\d{2}',           # 4-digit year anywhere
    r'ap(\d{2})-',             # AP format: ap23 → 2023
    r'ioi(\d{4})',             # IOI format
    r'gr(\d{4})',              # GRE format
    r'step.*?(2\d{3})',        # STEP with year
    r'(\d{4}).*step',          # year before STEP
]

def get_year_improved(filename, filepath):
    # Try improved patterns on full filepath
    for pattern in IMPROVED_PATTERNS:
        match = re.search(pattern, filepath.lower())
        if match:
            year_val = match.group(1)
            if len(year_val) == 2:
                # Special case for apXX
                if 'ap' in pattern:
                    return f"20{year_val}"
                else:
                    # Ambiguous 2-digit, maybe don't assume unless certain
                    continue
            return year_val
    
    # Check parent folder name for year
    parent = os.path.basename(os.path.dirname(filepath))
    match = re.search(r'(19|20)\d{2}', parent)
    if match:
        return match.group(1)
        
    return "UNKNOWN"

def standardize_name(filename, exam, year):
    # EXAM_SUBJECT_YEAR_SESSION_TYPE.pdf
    clean_name = filename.split('?')[0].upper().replace(".PDF", "")
    parts = clean_name.split("_")
    
    # Try to maintain structure if already partly standard
    doc_type = "QP"
    if any(x in clean_name for x in ["SG", "SOL", "SOLUTION", "MARK_SCHEME"]):
        doc_type = "SOL"
        
    # Re-extract subject from filename if it was standard
    # e.g. AP_CALCULUS_AB_2023_QP.pdf
    exam_upper = exam.upper().replace("_NET", "")
    subject = "GENERAL"
    
    if exam == "AP":
        match = re.search(r'AP_(.*?)_(\d{4}|UNKNOWN)', clean_name)
        if match:
            subject = match.group(1)
        elif "frq-" in clean_name.lower():
            # ap23-frq-calculus-ab.pdf
            match = re.search(r'-(frq|sg)-(.*?)$', clean_name.lower())
            if match:
                subject = match.group(2).upper().replace("-", "_")
                doc_type = "SG" if match.group(1) == "sg" else "QP"

    elif exam == "STEP":
        match = re.search(r'STEP\s*(\d)', clean_name, re.I)
        if match: subject = match.group(1)
        if any(x in clean_name.lower() for x in ["mock", "worked", "solution", "mark scheme"]):
            doc_type = "SOL"

    elif exam == "IOI":
        match = re.search(r'PROBLEM(\d)', clean_name.lower())
        if match: subject = f"P{match.group(1)}"
        if "solution" in clean_name.lower(): doc_type = "SOL"

    # Build parts
    final_parts = [exam_upper]
    if subject and subject != "GENERAL": final_parts.append(subject)
    final_parts.append(year)
    final_parts.append(doc_type)
    
    return "_".join(final_parts) + ".pdf"

def fix_all():
    print("--- Fixing UNKNOWN years and restoring files ---")
    
    # 1. Fix UNKNOWN years from unknown_years.txt
    resolved_count = 0
    if os.path.exists(UNKNOWN_YEARS_FILE):
        with open(UNKNOWN_YEARS_FILE, 'r') as f:
            lines = f.readlines()
        
        # We need to find where these files are now
        for line in lines:
            filename = line.strip()
            if not filename: continue
            
            # Find the file in Papers/
            found_path = None
            for root, _, files in os.walk(BASE_DIR):
                if filename in files:
                    found_path = os.path.join(root, filename)
                    break
            
            if found_path:
                year = get_year_improved(filename, found_path)
                if year != "UNKNOWN":
                    rel_root = os.path.relpath(os.path.dirname(found_path), BASE_DIR)
                    exam = rel_root.split(os.sep)[0]
                    new_name = standardize_name(filename, exam, year)
                    new_path = os.path.join(os.path.dirname(found_path), new_name)
                    
                    if found_path != new_path:
                        print(f"  [RESOLVED] {found_path} → {new_name}")
                        shutil.move(found_path, new_path)
                        resolved_count += 1

    print(f"Total UNKNOWN files resolved: {resolved_count}")

    # 2. Check TIFR 2026 files
    print("\n--- Checking TIFR 2026 files ---")
    tifr_2026_path = "Papers/TIFR/TIFR_SCIENCE_EDUCATION_2026_QP.pdf"
    if os.path.exists(tifr_2026_path):
        try:
            doc = fitz.open(tifr_2026_path)
            text = ""
            for i in range(min(3, doc.page_count)):
                text += doc[i].get_text()
            
            # Search for years in text
            years = re.findall(r'(20\d{2})', text)
            if years:
                # Find most frequent year or first
                actual_year = max(set(years), key=years.count)
                if actual_year != "2026":
                    new_name = f"TIFR_SCIENCE_EDUCATION_{actual_year}_QP.pdf"
                    new_path = os.path.join("Papers/TIFR", new_name)
                    print(f"  [TIFR FIX] Renaming {tifr_2026_path} → {new_name} (found {actual_year} in text)")
                    shutil.move(tifr_2026_path, new_path)
            doc.close()
        except Exception as e:
            print(f"  [!] Error checking TIFR file: {e}")

    # 3. Recover AP files from _misc/
    print("\n--- Recovering AP files from _misc/ ---")
    recovered_ap = 0
    if os.path.exists(MISC_DIR):
        for file in os.listdir(MISC_DIR):
            if file.endswith(".pdf"):
                path = os.path.join(MISC_DIR, file)
                size_kb = os.path.getsize(path) / 1024
                
                is_ap = "ap1" in file.lower() or "ap2" in file.lower() or "ap-" in file.lower() or "ap20" in file.lower()
                
                if is_ap or size_kb > 100:
                    # Validate PDF
                    try:
                        doc = fitz.open(path)
                        valid = doc.page_count > 0
                        doc.close()
                        if valid:
                            # Try to identify exam
                            exam = "UNKNOWN"
                            if is_ap: exam = "AP"
                            elif "step" in file.lower(): exam = "STEP"
                            elif "ibo" in file.lower(): exam = "IBO"
                            elif "ioi" in file.lower(): exam = "IOI"
                            
                            year = get_year_improved(file, path)
                            new_name = standardize_name(file, exam, year)
                            
                            target_dir = os.path.join(BASE_DIR, exam)
                            os.makedirs(target_dir, exist_ok=True)
                            
                            print(f"  [RECOVER] {file} ({int(size_kb)}KB) → {exam}/{new_name}")
                            shutil.move(path, os.path.join(target_dir, new_name))
                            recovered_ap += 1
                    except:
                        pass
    print(f"Total files recovered from _misc: {recovered_ap}")

    # 4. Check STEP 2020-2024
    # (Handled by general recovery above, but let's double check)
    print("\n--- Final Inventory Update ---")
    generate_inventory()

def generate_inventory():
    inventory_data = {
        "generated_at": time.strftime("%Y-%m-%d"),
        "total_files": 0,
        "total_removed_to_misc": 0,
        "exams": {},
        "all_files": []
    }
    
    all_exams_stats = {}
    
    for root, dirs, files in os.walk(BASE_DIR):
        if "_misc" in root:
            inventory_data["total_removed_to_misc"] = len(files)
            continue
            
        for file in files:
            if file == "master_inventory.json" or file == ".gitkeep":
                continue
                
            path = os.path.join(root, file)
            size_kb = os.path.getsize(path) / 1024
            rel_root = os.path.relpath(root, BASE_DIR)
            exam = rel_root.split(os.sep)[0]
            
            # Standard parsing for inventory
            # Format: EXAM_SUBJECT_YEAR_SESSION_TYPE.pdf
            # Or: EXAM_SUBJECT_YEAR_TYPE.pdf
            match = re.search(r'^(.*?)_(.*?)_(\d{4}|UNKNOWN)(?:_(.*?))?_(QP|SG|SOL)\.pdf$', file)
            if match:
                ex, sub, year, sess, dtype = match.groups()
            else:
                ex, sub, year, sess, dtype = exam, "UNKNOWN", "UNKNOWN", None, "QP"

            inventory_data["all_files"].append({
                "filename": file,
                "exam": ex,
                "subject": sub,
                "year": int(year) if year.isdigit() else year,
                "session": sess,
                "type": dtype,
                "path": path,
                "size_kb": int(size_kb)
            })
            
            if ex not in all_exams_stats:
                all_exams_stats[ex] = {"count": 0, "years": [], "QP": 0, "SG": 0, "SOL": 0, "UNKNOWN_YEAR": 0}
            
            all_exams_stats[ex]["count"] += 1
            if str(year).isdigit():
                all_exams_stats[ex]["years"].append(int(year))
            else:
                all_exams_stats[ex]["UNKNOWN_YEAR"] += 1
            
            if dtype in all_exams_stats[ex]:
                all_exams_stats[ex][dtype] += 1
            else:
                # Handle SG as SOL for the summary table simplified view
                all_exams_stats[ex][dtype] = all_exams_stats[ex].get(dtype, 0) + 1

    inventory_data["total_files"] = len(inventory_data["all_files"])
    
    for ex, s in all_exams_stats.items():
        yr = f"{min(s['years'])}-{max(s['years'])}" if s['years'] else "N/A"
        inventory_data["exams"][ex] = {
            "count": s["count"],
            "year_range": yr,
            "QP": s["QP"],
            "SG": s["SG"],
            "SOL": s["SOL"],
            "UNKNOWN_YEAR": s["UNKNOWN_YEAR"]
        }

    with open(INVENTORY_FILE, "w") as f:
        json.dump(inventory_data, f, indent=2)
        
    print_final_table(all_exams_stats, inventory_data["total_removed_to_misc"])

def print_final_table(stats, misc_count):
    print("\n" + "┌" + "─"*13 + "┬" + "─"*7 + "┬" + "─"*12 + "┬" + "─"*5 + "┬" + "─"*5 + "┬" + "─"*9 + "┐")
    print("│ Exam        │ Total │ Year Range │ QP  │ SOL │ UNKNOWN │")
    print("├" + "─"*13 + "┼" + "─"*7 + "┼" + "─"*12 + "┼" + "─"*5 + "┼" + "─"*5 + "┼" + "─"*9 + "┤")
    
    total_q = 0
    total_s = 0
    total_u = 0
    grand_total = 0
    
    for ex in sorted(stats.keys()):
        s = stats[ex]
        yr = f"{min(s['years'])}-{max(s['years'])}" if s['years'] else "N/A"
        sol_count = s["SOL"] + s["SG"]
        print(f"│ {ex:<11} │ {s['count']:^5} │ {yr:^10} │ {s['QP']:^3} │ {sol_count:^3} │ {s['UNKNOWN_YEAR']:^7} │")
        total_q += s["QP"]
        total_s += sol_count
        total_u += s["UNKNOWN_YEAR"]
        grand_total += s["count"]

    print("├" + "─"*13 + "┼" + "─"*7 + "┼" + "─"*12 + "┼" + "─"*5 + "┼" + "─"*5 + "┼" + "─"*9 + "┤")
    print(f"│ TOTAL       │ {grand_total:^5} │            │ {total_q:^3} │ {total_s:^3} │ {total_u:^7} │")
    print("└" + "─"*13 + "┴" + "─"*7 + "┴" + "─"*12 + "┴" + "─"*5 + "┴" + "─"*5 + "┴" + "─"*9 + "┘")
    print(f"Files currently in _misc/: {misc_count}")

if __name__ == "__main__":
    fix_all()
