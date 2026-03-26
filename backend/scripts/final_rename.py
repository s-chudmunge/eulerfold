import os
import re

BASE_DIR = "Papers"

def manual_fix():
    print("\n--- Final Standardized Renaming ---")
    print(f"{'BEFORE':<60} | {'AFTER'}")
    print("-" * 120)
    
    for root, dirs, files in os.walk(BASE_DIR):
        if "misc" in root: continue
        exam_folder = os.path.basename(root)
        if exam_folder == "Papers": continue
        
        for f in files:
            if not f.endswith(".pdf"): continue
            
            # 1. Extract clean base info (remove prefixes we might have added)
            # Example: JAM_BT_2012.pdf or JAM_JAM_BT.pdf
            clean_name = f.replace(f"{exam_folder}_", "").replace(f"{exam_folder}_", "") # Remove up to two
            
            # 2. Re-extract Year
            year_match = re.search(r'20\d{2}', f)
            year = year_match.group(0) if year_match else ""
            
            # 3. Re-extract Session
            session = ""
            if "June" in f or "june" in f.lower(): session = "June"
            elif "Dec" in f or "dec" in f.lower(): session = "Dec"
            
            # 4. Extract Subject
            # Take everything that isn't year, session, or exam folder name
            sub = f.replace(".pdf", "")
            # Remove all known bits
            for bits in [exam_folder, year, session, "JAM", "TIFR", "JEST", "CSIR", "NET", "UGC", "Physics", "Sciences", "Paper1", "Paper2", "Paper"]:
                # Be careful not to strip internal letters, only whole words or underscored words
                sub = re.sub(rf'\b{bits}\b', '', sub, flags=re.IGNORECASE)
            
            # Specialist Logic per folder to get subject accurately
            if exam_folder == "JAM":
                # Original: BT_2012.pdf -> Subject is BT
                # Current might be JAM_JAM_BT.pdf or JAM_BT_Unknown.pdf
                m = re.search(r'(BT|CY|GG|MA|MS|PH|EN)', f)
                subject = m.group(0) if m else "Unknown"
            elif exam_folder == "TIFR":
                m = re.search(r'(Biology|Chemistry|Mathematics|Physics_IPhD|Physics_PhD|Computer_Science|Computer_Systems)', f, re.I)
                subject = m.group(0) if m else "Unknown"
            elif exam_folder == "JEST":
                subject = "Physics"
            elif exam_folder == "CSIR_NET":
                m = re.search(r'(Physical_Sciences|Chemical_Sciences|Life_Sciences|Mathematical_Sciences|Earth_Sciences)', f, re.I)
                subject = m.group(0) if m else "Unknown"
            elif exam_folder == "UGC_NET":
                if "Paper1" in f: subject = "Paper1"
                elif "CS" in f: subject = "CS"
                elif "Economics" in f: subject = "Economics_Paper2"
                elif "Mathematics" in f: subject = "Mathematics_Paper2"
                elif "Physics" in f: subject = "Physics_Paper2"
                elif "Chemistry" in f: subject = "Chemistry_Paper2"
                elif "Life" in f: subject = "LifeSciences_Paper2"
                else: subject = "Unknown"
            else:
                subject = "Unknown"

            # Reconstruct: {EXAM}_{SUBJECT}_{YEAR}_{SESSION}.pdf
            new_parts = [exam_folder, subject]
            if year: new_parts.append(year)
            if session: new_parts.append(session)
            
            new_name = "_".join(new_parts) + ".pdf"
            
            if f != new_name:
                old_path = os.path.join(root, f)
                new_path = os.path.join(root, new_name)
                if not os.path.exists(new_path):
                    os.rename(old_path, new_path)
                    print(f"{f:<60} | {new_name}")

if __name__ == "__main__":
    manual_fix()
