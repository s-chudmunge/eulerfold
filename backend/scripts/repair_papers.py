import os
import re

BASE_DIR = "Papers"

def repair_and_standardize():
    for exam_folder in os.listdir(BASE_DIR):
        folder_path = os.path.join(BASE_DIR, exam_folder)
        if not os.path.isdir(folder_path):
            continue
            
        print(f"Repairing {exam_folder}...")
        
        for filename in os.listdir(folder_path):
            if not filename.lower().endswith('.pdf'):
                continue
                
            old_path = os.path.join(folder_path, filename)
            
            # 1. Extract Year (Loose match)
            year_match = re.search(r'(19\d{2}|20\d{2})', filename)
            year = year_match.group(1) if year_match else "Unknown"
            
            # 2. Determine Type (QP or AK)
            is_ak = any(kw in filename.lower() for kw in ["key", "sol", "ans"])
            dtype = "AK" if is_ak else "QP"
            
            # 3. Clean up the base name
            # Remove existing junk
            clean_name = filename.replace('.pdf', '')
            # Remove "Unknown", "QP", "AK" added by previous script
            clean_name = re.sub(r'\b(Unknown|QP|AK)\b', '', clean_name, flags=re.I)
            # Remove exam folder name
            clean_name = re.sub(re.escape(exam_folder), '', clean_name, flags=re.I)
            # Remove variations of "JEE_ADVANCE" vs "JEE_ADV"
            if exam_folder == "JEE_ADVANCE":
                clean_name = re.sub(r'JEE_ADV', '', clean_name, flags=re.I)
            
            # Remove year
            if year != "Unknown":
                clean_name = clean_name.replace(year, '')
            
            # Remove separators and common words
            clean_name = re.sub(r'[_\-\s]+', '_', clean_name)
            clean_name = re.sub(r'^(Paper|Slot|General|Studies|Prelims|Mains|CSE|AAT)+', '', clean_name, flags=re.I)
            
            # Re-extract specific metadata if possible
            # (e.g. Paper 1, Slot 2, GS1)
            meta = ""
            if "Paper_1" in filename or "Paper1" in filename or "_1_" in filename: meta = "P1"
            elif "Paper_2" in filename or "Paper2" in filename or "_2_" in filename: meta = "P2"
            
            if "Slot_1" in filename or "Slot1" in filename: meta = "Slot1"
            elif "Slot_2" in filename or "Slot2" in filename: meta = "Slot2"
            elif "Slot_3" in filename or "Slot3" in filename: meta = "Slot3"
            
            if "GS1" in filename: meta = "GS1"
            elif "GS2" in filename or "CSAT" in filename: meta = "GS2"
            elif "GS3" in filename: meta = "GS3"
            elif "GS4" in filename: meta = "GS4"
            elif "ESSAY" in filename: meta = "Essay"
            
            if "AAT" in filename: meta = "AAT"
            
            # NBHM specific meta
            if exam_folder == "NBHM":
                if "MSC" in filename or "msc" in filename: meta = "MSC"
                elif "PHD" in filename or "ra" in filename: meta = "PHD"

            # Final Construct
            # {EXAM}_{YEAR}_{META}_{DTYPE}.pdf
            parts = [exam_folder, year]
            if meta: parts.append(meta)
            parts.append(dtype)
            
            new_filename = "_".join(parts) + ".pdf"
            # Cleanup double underscores
            new_filename = re.sub(r'_{2,}', '_', new_filename)
            
            new_path = os.path.join(folder_path, new_filename)
            
            if old_path != new_path:
                print(f"  [REPAIR] {filename} -> {new_filename}")
                # Handle collisions
                if os.path.exists(new_path):
                    base, ext = os.path.splitext(new_path)
                    counter = 1
                    while os.path.exists(f"{base}_{counter}{ext}"):
                        counter += 1
                    new_path = f"{base}_{counter}{ext}"
                
                os.rename(old_path, new_path)

if __name__ == "__main__":
    repair_and_standardize()
