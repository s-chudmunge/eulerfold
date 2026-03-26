import os
import re

BASE_DIR = "Papers"

def standardize_filenames():
    for exam_folder in os.listdir(BASE_DIR):
        folder_path = os.path.join(BASE_DIR, exam_folder)
        if not os.path.isdir(folder_path):
            continue
            
        print(f"Standardizing {exam_folder}...")
        
        for filename in os.listdir(folder_path):
            if not filename.lower().endswith('.pdf'):
                continue
                
            old_path = os.path.join(folder_path, filename)
            
            # 1. Extract Year
            year_match = re.search(r'\b(19\d{2}|20\d{2})\b', filename)
            year = year_match.group(1) if year_match else None
            
            # 2. Determine Type (QP or AK)
            is_ak = any(kw in filename.lower() for kw in ["key", "sol", "ans"])
            dtype = "AK" if is_ak else "QP"
            
            # 3. Clean up the base name
            # Remove existing exam name, year, and common separators
            clean_name = filename.replace('.pdf', '')
            # Remove exam name variations
            clean_name = re.sub(re.escape(exam_folder), '', clean_name, flags=re.I)
            clean_name = re.sub(exam_folder.replace('_', ' '), '', clean_name, flags=re.I)
            # Remove year
            if year:
                clean_name = clean_name.replace(year, '')
            # Remove common prefixes/suffixes we'll re-add
            clean_name = re.sub(r'\b(QP|AK|Question Paper|Answer Key|Solutions?|Unknown)\b', '', clean_name, flags=re.I)
            # Remove multiple underscores/spaces/hyphens
            clean_name = re.sub(r'[_\-\s]+', '_', clean_name).strip('_')
            
            # 4. Construct new filename
            # Standard: {EXAM}_{YEAR}_{CLEAN_SUBJECT}_{DTYPE}.pdf
            if year:
                new_filename = f"{exam_folder}_{year}"
                if clean_name:
                    new_filename += f"_{clean_name}"
                new_filename += f"_{dtype}.pdf"
            else:
                # If no year, keep it mostly as is but prefixed
                new_filename = f"{exam_folder}_Unknown_{clean_name}_{dtype}.pdf"
            
            # Final cleanup of double underscores
            new_filename = re.sub(r'_{2,}', '_', new_filename)
            
            new_path = os.path.join(folder_path, new_filename)
            
            if old_path != new_path:
                print(f"  [RENAME] {filename} -> {new_filename}")
                # Handle collisions
                if os.path.exists(new_path):
                    base, ext = os.path.splitext(new_path)
                    counter = 1
                    while os.path.exists(f"{base}_{counter}{ext}"):
                        counter += 1
                    new_path = f"{base}_{counter}{ext}"
                
                os.rename(old_path, new_path)

if __name__ == "__main__":
    standardize_filenames()
