import os
import re

BASE_DIR = "Papers"

# Map of messy strings to clean versions
SUB_MAP = {
    "Paper_1": "P1", "Paper1": "P1", "_1_": "P1",
    "Paper_2": "P2", "Paper2": "P2", "_2_": "P2",
    "Slot_1": "Slot1", "Slot1": "Slot1",
    "Slot_2": "Slot2", "Slot2": "Slot2",
    "Slot_3": "Slot3", "Slot3": "Slot3",
    "English-Version": "English",
    "hindi-version": "Hindi",
    "hindi": "Hindi",
    "final_solutions": "AK",
    "solutions": "AK",
    "sol-": "AK_",
    "Anskey": "AK",
    "answerkey": "AK",
    "ans-key": "AK",
}

def clean_standardize():
    for exam in ["INMO", "IOQM", "PRMO", "RMO", "NBHM", "JEE_ADVANCE"]:
        folder = os.path.join(BASE_DIR, exam)
        if not os.path.exists(folder): continue
        
        print(f"Standardizing {exam}...")
        for filename in os.listdir(folder):
            if not filename.lower().endswith('.pdf'): continue
            
            old_path = os.path.join(folder, filename)
            
            # Extract Year
            year_match = re.search(r'(19\d{2}|20\d{2})', filename)
            year = year_match.group(1) if year_match else "Unknown"
            
            # Determine Type
            is_ak = any(kw in filename.lower() for kw in ["key", "sol", "ans", "guidelines"])
            dtype = "AK" if is_ak else "QP"
            
            # Sub-category or Meta
            meta = ""
            if exam == "JEE_ADVANCE":
                if "AAT" in filename: meta = "AAT"
                elif "P1" in filename or "Paper_1" in filename or "_1" in filename: meta = "P1"
                elif "P2" in filename or "Paper_2" in filename or "_2" in filename: meta = "P2"
            
            elif exam == "NBHM":
                if "MSC" in filename or "msc" in filename: meta = "MSC"
                elif "PHD" in filename or "ra" in filename: meta = "PHD"
            
            elif exam in ["INMO", "RMO", "IOQM", "PRMO"]:
                if "P1" in filename or "Paper-1" in filename or "Paper_1" in filename: meta = "P1"
                elif "P2" in filename or "Paper-2" in filename or "Paper_2" in filename: meta = "P2"
                
                # Language
                if "hindi" in filename.lower(): 
                    meta = (meta + "_Hindi").strip("_")
                elif "english" in filename.lower():
                    meta = (meta + "_English").strip("_")

            # Cleanup filename to avoid double dtype if it was already renamed
            clean_filename = re.sub(r'_(QP|AK)\.pdf$', '.pdf', filename, flags=re.I)

            # Final Name: {EXAM}_{YEAR}_{META}_{DTYPE}.pdf
            parts = [exam, year]
            if meta: parts.append(meta)
            parts.append(dtype)
            
            new_name = "_".join(parts) + ".pdf"
            new_name = re.sub(r'_{2,}', '_', new_name)
            
            new_path = os.path.join(folder, new_name)
            
            if old_path != new_path:
                # print(f"  {filename} -> {new_name}")
                if os.path.exists(new_path):
                    base, ext = os.path.splitext(new_path)
                    i = 1
                    while os.path.exists(f"{base}_{i}{ext}"): i += 1
                    new_path = f"{base}_{i}{ext}"
                os.rename(old_path, new_path)

if __name__ == "__main__":
    clean_standardize()
