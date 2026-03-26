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

RESTORE_KEYWORDS = [
    'ap', 'amc', 'aime', 'usamo', 'step', 'ioi', 'ibo',
    'gre', 'engaa', 'nsaa', 'kvpy', 'isro', 'barc',
    '200', '201', '202',
    'frq', 'sg', 'qp', 'sol', 'calculus', 'physics',
    'chemistry', 'biology', 'statistics'
]

def get_year_from_text(text):
    match = re.search(r'(19|20)\d{2}', text)
    if match:
        return match.group(1)
    return None

def standardize_name(filename, exam, year, existing_type=None):
    clean_name = filename.split('?')[0].upper().replace(".PDF", "")
    
    doc_type = "QP"
    if existing_type:
        doc_type = existing_type
    elif any(x in clean_name for x in ["SG", "SOL", "SOLUTION", "MARK_SCHEME", "MOCK", "WORKED", "HINTS"]):
        doc_type = "SOL"
        if "SG" in clean_name: doc_type = "SG"

    exam_upper = exam.upper().replace("_NET", "")
    subject = "GENERAL"
    
    if exam == "AP":
        match = re.search(r'ap(\d{2})-(frq|sg)-(.*?)$', clean_name.lower())
        if match:
            type_code, sub_slug = match.groups()
            doc_type = "SG" if type_code == "sg" else "QP"
            subject = sub_slug.upper().replace("-", "_")
        else:
            # Try to extract subject from other fragments
            for s in ["CALCULUS_AB", "CALCULUS_BC", "PHYSICS_1", "PHYSICS_2", "CHEMISTRY", "BIOLOGY", "STATISTICS"]:
                if s in clean_name:
                    subject = s
                    break

    elif exam == "STEP":
        match = re.search(r'STEP\s*(\d)', clean_name, re.I)
        if match: subject = match.group(1)
        elif "PAPER" in clean_name and ("1" in clean_name or "2" in clean_name or "3" in clean_name):
             m = re.search(r'PAPER\s*(\d)', clean_name)
             if m: subject = m.group(1)

    elif exam == "IOI":
        match = re.search(r'PROBLEM(\d)', clean_name.lower())
        if match: subject = f"P{match.group(1)}"

    final_parts = [exam_upper]
    if subject and subject != "GENERAL": final_parts.append(subject)
    final_parts.append(str(year))
    final_parts.append(doc_type)
    
    return "_".join(final_parts) + ".pdf"

def restore_logic():
    print("--- Starting Restoration Process ---")
    restored_count = 0
    
    if not os.path.exists(MISC_DIR):
        print("No _misc directory found.")
        return

    for file in os.listdir(MISC_DIR):
        if not file.endswith(".pdf"): continue
        
        path = os.path.join(MISC_DIR, file)
        size_kb = os.path.getsize(path) / 1024
        
        if size_kb < 10: continue
        
        try:
            doc = fitz.open(path)
            if doc.page_count == 0:
                doc.close()
                continue
            
            text_first = ""
            try:
                text_first = doc[0].get_text()[:1000]
            except: pass
            
            should_restore = False
            target_exam = "UNKNOWN"
            
            # Keyword check
            if any(kw in file.lower() for kw in RESTORE_KEYWORDS):
                should_restore = True
            
            # AP Specific
            is_ap_name = "ap1" in file.lower() or "ap2" in file.lower() or "ap-" in file.lower() or "ap20" in file.lower()
            if is_ap_name:
                if doc.page_count >= 2 or any(x in text_first for x in ["Free-Response Questions", "AP Exam"]):
                    should_restore = True
                    target_exam = "AP"

            if should_restore:
                # Determine exam if not set
                if target_exam == "UNKNOWN":
                    for ex in ["AP", "STEP", "IOI", "IBO", "GRE", "AMC", "AIME", "USAMO", "KVPY", "ISRO", "BARC"]:
                        if ex.lower() in file.lower():
                            target_exam = ex
                            break
                
                # Extract year
                year = "UNKNOWN"
                # 1. Filename regex
                m = re.search(r'(19|20)\d{2}', file)
                if m: year = m.group(1)
                else:
                    m = re.search(r'ap(\d{2})-', file.lower())
                    if m: year = f"20{m.group(1)}"
                
                # 2. Text regex
                if year == "UNKNOWN":
                    txt_year = get_year_from_text(text_first)
                    if txt_year: year = txt_year
                
                new_name = standardize_name(file, target_exam, year)
                dest_dir = os.path.join(BASE_DIR, target_exam)
                os.makedirs(dest_dir, exist_ok=True)
                
                dest_path = os.path.join(dest_dir, new_name)
                # Ensure unique
                if os.path.exists(dest_path):
                    dest_path = dest_path.replace(".pdf", f"_{int(time.time())}.pdf")
                
                print(f"  [RESTORE] {file} → {target_exam}/{os.path.basename(dest_path)}")
                doc.close()
                shutil.move(path, dest_path)
                restored_count += 1
            else:
                doc.close()
        except:
            pass

    print(f"Total files restored: {restored_count}")

def fix_step_unknowns():
    print("\n--- Fixing STEP UNKNOWN years ---")
    resolved = 0
    step_dir = os.path.join(BASE_DIR, "STEP")
    if not os.path.exists(step_dir): return
    
    for file in os.listdir(step_dir):
        if "UNKNOWN" in file and file.endswith(".pdf"):
            path = os.path.join(step_dir, file)
            try:
                doc = fitz.open(path)
                text = doc[0].get_text()[:1000]
                doc.close()
                
                year = get_year_from_text(text)
                if not year:
                    # Check filename again for common GDrive formats
                    m = re.search(r'(\d{4})', file)
                    if m: year = m.group(1)
                
                if year:
                    # Rename
                    new_name = file.replace("UNKNOWN", year)
                    new_path = os.path.join(step_dir, new_name)
                    print(f"  [STEP RESOLVE] {file} → {new_name}")
                    shutil.move(path, new_path)
                    resolved += 1
            except:
                pass
    print(f"STEP UNKNOWN files resolved: {resolved}")

def generate_final_inventory():
    inventory_data = {
        "generated_at": time.strftime("%Y-%m-%d"),
        "total_files": 0,
        "exams": {},
        "all_files": []
    }
    all_exams_stats = {}
    
    for root, dirs, files in os.walk(BASE_DIR):
        if "_misc" in root: continue
        for file in files:
            if not file.endswith(".pdf") or file == "master_inventory.json": continue
            path = os.path.join(root, file)
            rel_root = os.path.relpath(root, BASE_DIR)
            exam = rel_root.split(os.sep)[0]
            
            match = re.search(r'^(.*?)_(.*?)_(\d{4}|UNKNOWN)(?:_(.*?))?_(QP|SG|SOL)\.pdf$', file)
            dtype = "QP"
            year = "UNKNOWN"
            if match:
                year = match.group(3)
                dtype = match.group(5)
            
            size_kb = os.path.getsize(path) / 1024
            inventory_data["all_files"].append({
                "filename": file, "exam": exam, "path": path, "size_kb": int(size_kb)
            })
            
            if exam not in all_exams_stats:
                all_exams_stats[exam] = {"count": 0, "years": [], "QP": 0, "SOL": 0, "UNKNOWN_YEAR": 0}
            
            all_exams_stats[exam]["count"] += 1
            if year.isdigit(): all_exams_stats[exam]["years"].append(int(year))
            else: all_exams_stats[exam]["UNKNOWN_YEAR"] += 1
            
            if dtype in ["SOL", "SG"]: all_exams_stats[exam]["SOL"] += 1
            else: all_exams_stats[exam]["QP"] += 1

    inventory_data["total_files"] = len(inventory_data["all_files"])
    with open(INVENTORY_FILE, "w") as f:
        json.dump(inventory_data, f, indent=2)
    
    # Print Table
    print("\n" + "┌" + "─"*13 + "┬" + "─"*7 + "┬" + "─"*12 + "┬" + "─"*5 + "┬" + "─"*5 + "┬" + "─"*9 + "┐")
    print("│ Exam        │ Total │ Year Range │ QP  │ SOL │ UNKNOWN │")
    print("├" + "─"*13 + "┼" + "─"*7 + "┼" + "─"*12 + "┼" + "─"*5 + "┼" + "─"*5 + "┼" + "─"*9 + "┤")
    for ex in sorted(all_exams_stats.keys()):
        s = all_exams_stats[ex]
        yr = f"{min(s['years'])}-{max(s['years'])}" if s['years'] else "N/A"
        print(f"│ {ex:<11} │ {s['count']:^5} │ {yr:^10} │ {s['QP']:^3} │ {s['SOL']:^3} │ {s['UNKNOWN_YEAR']:^7} │")
    print("└" + "─"*13 + "┴" + "─"*7 + "┴" + "─"*12 + "┴" + "─"*5 + "┴" + "─"*5 + "┴" + "─"*9 + "┘")

if __name__ == "__main__":
    restore_logic()
    fix_step_unknowns()
    generate_final_inventory()
