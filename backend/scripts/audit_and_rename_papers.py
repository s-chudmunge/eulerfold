import os
import shutil
import json
import re
from pathlib import Path
import fitz  # PyMuPDF

# Configuration
BASE_DIR = "Papers"
MISC_DIR = os.path.join(BASE_DIR, "_misc")
INVENTORY_FILE = os.path.join(BASE_DIR, "master_inventory.json")
UNKNOWN_YEARS_FILE = "unknown_years.txt"

GENERIC_NAMES = {"01.pdf", "02.pdf", "download.pdf", "file.pdf", "index.pdf", "page.pdf"}
MIN_SIZE_KB = 50

class PaperAuditor:
    def __init__(self):
        self.proposals = []
        self.stats = {
            "renames": 0,
            "deletions": 0,
            "misc": 0
        }
        self.inventory_data = {
            "generated_at": time.strftime("%Y-%m-%d"),
            "total_files": 0,
            "total_removed_to_misc": 0,
            "exams": {},
            "all_files": []
        }
        self.unknown_years = []

    def get_year(self, filename, parent_folder):
        # 1. 4-digit year
        match = re.search(r'(20\d{2}|19\d{2})', filename)
        if match:
            return match.group(1)
        
        # 2. 2-digit year prefix (ap23, etc)
        match = re.search(r'ap(\d{2})', filename.lower())
        if match:
            return f"20{match.group(1)}"
        
        # 3. Year in parent folder
        match = re.search(r'(20\d{2}|19\d{2})', parent_folder)
        if match:
            return match.group(1)
        
        return "UNKNOWN"

    def audit(self):
        print("Starting audit of Papers/ directory...\n")
        
        for root, dirs, files in os.walk(BASE_DIR):
            if "_misc" in root:
                continue
                
            for file in files:
                if file == "master_inventory.json" or file == ".gitkeep":
                    continue
                    
                filepath = os.path.join(root, file)
                rel_root = os.path.relpath(root, BASE_DIR)
                exam_category = rel_root.split(os.sep)[0]
                
                size_kb = os.path.getsize(filepath) / 1024
                
                # Step 2: Junk check
                is_junk = False
                reason = ""
                
                if size_kb < MIN_SIZE_KB:
                    is_junk = True
                    reason = f"size {size_kb:.1f}KB < {MIN_SIZE_KB}KB"
                elif file.lower() in GENERIC_NAMES:
                    is_junk = True
                    reason = "generic name"
                else:
                    # PDF validation
                    try:
                        doc = fitz.open(filepath)
                        if doc.page_count == 0:
                            is_junk = True
                            reason = "zero pages"
                        doc.close()
                    except Exception as e:
                        is_junk = True
                        reason = f"invalid PDF: {str(e)}"

                if is_junk:
                    target = os.path.join(MISC_DIR, file)
                    self.proposals.append({
                        "type": "MISC",
                        "src": filepath,
                        "dst": target,
                        "reason": reason
                    })
                    self.stats["misc"] += 1
                    continue

                # Step 3: Renaming logic
                new_filename = self.generate_standard_name(file, exam_category)
                target = os.path.join(root, new_filename)
                
                if filepath != target:
                    self.proposals.append({
                        "type": "RENAME",
                        "src": filepath,
                        "dst": target,
                        "exam": exam_category
                    })
                    self.stats["renames"] += 1
                else:
                    # Even if no rename, we track it for inventory
                    self.proposals.append({
                        "type": "KEEP",
                        "src": filepath,
                        "dst": filepath,
                        "exam": exam_category
                    })

    def generate_standard_name(self, filename, exam):
        # Base format: {EXAM}_{SUBJECT}_{YEAR}_{SESSION}_{TYPE}.pdf
        # Clean filename of URL params
        clean_name = filename.split('?')[0]
        
        year = self.get_year(clean_name, exam)
        if year == "UNKNOWN":
            self.unknown_years.append(filename)
            
        subject = "GENERAL"
        session = ""
        doc_type = "QP"
        
        exam_upper = exam.upper().replace("_NET", "")
        
        if exam == "AP":
            # ap24-frq-calculus-ab.pdf
            match = re.search(r'ap\d{2}-(frq|sg)-(.*?)\.pdf', clean_name.lower())
            if match:
                type_code, sub_slug = match.groups()
                doc_type = "SG" if type_code == "sg" else "QP"
                subject = sub_slug.upper().replace("-", "_")
            else:
                # Handle our own previous naming if it was standard
                # AP_physics-1_2024_frq.pdf
                match = re.search(r'AP_(.*?)_(\d{4})_(frq|sg)', clean_name)
                if match:
                    subject = match.group(1).upper().replace("-", "_")
                    doc_type = "SG" if match.group(3) == "sg" else "QP"

        elif exam == "STEP":
            # STEP 2 2023.pdf, STEP2_2024_Mock.pdf
            match = re.search(r'STEP\s*(\d)', clean_name, re.I)
            if match:
                subject = match.group(1) # Paper number
            if any(x in clean_name.lower() for x in ["mock", "worked", "solution", "report", "mark scheme", "hints"]):
                doc_type = "SOL"
            
        elif exam == "GRE":
            # GRE_Physics_0877.pdf
            match = re.search(r'GRE_(.*?)_(\d{4})', clean_name)
            if match:
                subject = f"{match.group(1).upper()}_{match.group(2)}"
            else:
                match = re.search(r'gr(\d{4})', clean_name.lower())
                if match:
                    subject = f"PHYSICS_GR{match.group(1)}"

        elif exam == "IOI":
            # IOI_2019_problem1.pdf
            match = re.search(r'problem(\d)', clean_name.lower())
            if match:
                subject = f"P{match.group(1)}"
            if "solution" in clean_name.lower():
                doc_type = "SOL"

        elif exam == "IBO":
            # IBO2023 Theory 2.pdf
            if "theory" in clean_name.lower():
                subject = "THEORY"
            elif "practical" in clean_name.lower():
                subject = "PRACTICAL"
            if "solution" in clean_name.lower() or "answer" in clean_name.lower():
                doc_type = "SOL"

        elif exam in ["ENGAA", "NSAA"]:
            subject = "ADMISSIONS"

        elif exam == "KVPY":
            match = re.search(r'(SA|SB|SX)', clean_name, re.I)
            if match:
                subject = match.group(1).upper()

        elif exam == "AMC":
            match = re.search(r'(10A|10B|12A|12B)', clean_name, re.I)
            if match:
                subject = match.group(1).upper()

        elif exam == "AIME":
            match = re.search(r'AIME\s*([IV]+)', clean_name, re.I)
            if match:
                session = match.group(1).upper()
            else:
                match = re.search(r'_([IV]+)_', clean_name)
                if match:
                    session = match.group(1).upper()
        
        else:
            # Generic fallback for folders like JAM, TIFR, CSIR_NET
            # Example: JAM_BT_2013.pdf
            # Remove exam and year and .pdf, what's left is subject
            temp = clean_name.upper().replace(".PDF", "")
            temp = temp.replace(exam_upper, "").strip("_")
            if year != "UNKNOWN":
                temp = temp.replace(year, "").strip("_")
            
            # Remove common types
            for t in ["QP", "SG", "SOL", "SOLUTION", "ANS", "PAPER"]:
                temp = temp.replace(t, "").strip("_")
            
            if temp:
                subject = temp.strip("_")
            else:
                subject = "GENERAL"

        # Build name
        parts = [exam_upper]
        if subject and subject != "GENERAL": parts.append(subject)
        if year: parts.append(str(year))
        if session: parts.append(session)
        parts.append(doc_type)
        
        return "_".join(parts) + ".pdf"

    def display_proposals(self):
        for p in self.proposals:
            if p["type"] == "MISC":
                print(f"[MISC]   {p['src']} → Papers/_misc/{os.path.basename(p['dst'])} ({p['reason']})")
            elif p["type"] == "RENAME":
                print(f"[RENAME] {p['src']} → {p['dst']}")
        
        print(f"\nDry run complete. {self.stats['renames']} renames, {self.stats['deletions']} deletions, {self.stats['misc']} misc moves proposed.")

    def execute(self):
        os.makedirs(MISC_DIR, exist_ok=True)
        
        all_exams_stats = {}
        
        for p in self.proposals:
            if p["type"] == "MISC":
                # Ensure unique misc name
                base = os.path.basename(p['dst'])
                target = os.path.join(MISC_DIR, base)
                if os.path.exists(target):
                    target = os.path.join(MISC_DIR, f"{int(time.time())}_{base}")
                shutil.move(p["src"], target)
                self.inventory_data["total_removed_to_misc"] += 1
            
            elif p["type"] == "RENAME":
                os.makedirs(os.path.dirname(p["dst"]), exist_ok=True)
                shutil.move(p["src"], p["dst"])
            
            # Inventory tracking
            if p["type"] in ["RENAME", "KEEP"]:
                src_path = p["dst"]
                filename = os.path.basename(src_path)
                exam = p.get("exam", "OTHER")
                
                # Parse for inventory
                match = re.search(r'(.*?)_(.*?)_(\d{4}|UNKNOWN)(?:_(.*?))?_(QP|SG|SOL)\.pdf', filename)
                if match:
                    ex, sub, year, sess, dtype = match.groups()
                else:
                    ex, sub, year, sess, dtype = exam, "UNKNOWN", "UNKNOWN", None, "QP"

                size_kb = os.path.getsize(src_path) / 1024
                
                self.inventory_data["all_files"].append({
                    "filename": filename,
                    "exam": ex,
                    "subject": sub,
                    "year": int(year) if year.isdigit() else year,
                    "session": sess,
                    "type": dtype,
                    "path": src_path,
                    "size_kb": int(size_kb)
                })
                
                if ex not in all_exams_stats:
                    all_exams_stats[ex] = {"count": 0, "years": [], "QP": 0, "SG": 0, "SOL": 0, "UNKNOWN_YEAR": 0}
                
                all_exams_stats[ex]["count"] += 1
                if year.isdigit():
                    all_exams_stats[ex]["years"].append(int(year))
                else:
                    all_exams_stats[ex]["UNKNOWN_YEAR"] += 1
                
                if dtype in all_exams_stats[ex]:
                    all_exams_stats[ex][dtype] += 1
                else:
                    all_exams_stats[ex][dtype] = all_exams_stats[ex].get(dtype, 0) + 1

        self.inventory_data["total_files"] = len(self.inventory_data["all_files"])
        
        # Format exam stats for JSON
        for ex, s in all_exams_stats.items():
            yr = f"{min(s['years'])}-{max(s['years'])}" if s['years'] else "N/A"
            self.inventory_data["exams"][ex] = {
                "count": s["count"],
                "year_range": yr,
                "QP": s["QP"],
                "SG": s["SG"],
                "SOL": s["SOL"],
                "UNKNOWN_YEAR": s["UNKNOWN_YEAR"]
            }

        with open(INVENTORY_FILE, "w") as f:
            json.dump(self.inventory_data, f, indent=2)
            
        with open(UNKNOWN_YEARS_FILE, "w") as f:
            f.write("\n".join(self.unknown_years))

        self.print_final_table(all_exams_stats)

    def print_final_table(self, stats):
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
        print(f"Files moved to _misc/: {self.inventory_data['total_removed_to_misc']}")
        print(f"Files with UNKNOWN year: {total_u} (listed in {UNKNOWN_YEARS_FILE})")

import time
import sys

if __name__ == "__main__":
    auditor = PaperAuditor()
    auditor.audit()
    auditor.display_proposals()
    
    if len(auditor.proposals) > 0:
        if "--confirm" in sys.argv:
            auditor.execute()
        else:
            print(f"\nTo execute these changes, run with --confirm")
    else:
        print("No changes needed.")
