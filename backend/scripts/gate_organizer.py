import os
import re
import shutil

# --- Configuration ---
SOURCE_DIR = "GATE_Papers"
TARGET_DIR = "Organized_GATE_Papers"
# Map common subject codes for better naming (optional but clearer)
SUBJECT_MAP = {
    "AE": "Aerospace", "AG": "Agricultural", "AR": "Architecture", "BM": "Biomedical",
    "BT": "Biotechnology", "CE": "Civil", "CH": "Chemical", "CS": "Computer_Science",
    "CY": "Chemistry", "DA": "Data_Science_AI", "EC": "Electronics", "EE": "Electrical",
    "ES": "Env_Science", "EY": "Ecology", "GE": "Geomatics", "GG": "Geology",
    "IN": "Instrumentation", "MA": "Mathematics", "ME": "Mechanical", "MN": "Mining",
    "MT": "Metallurgical", "NM": "Naval_Arch", "PE": "Petroleum", "PH": "Physics",
    "PI": "Production", "ST": "Statistics", "TF": "Textile", "XE": "Eng_Sciences",
    "XH": "Humanities", "XL": "Life_Sciences"
}

# Regex for common patterns
# 1. <Subj><YearSuffix>S<Session>.pdf  (e.g., AE24S5, CS124S5)
PATTERN_MODERN_QP = re.compile(r'^([A-Z]{2,3})(\d)?(\d{2})S(\d)\.pdf$', re.IGNORECASE)
# 2. <Subj>FinalAnswerKey.pdf or <Subj><SessSuffix>FinalAnswerKey.pdf
PATTERN_MODERN_AK = re.compile(r'^([A-Z]{2,3})(\d)?FinalAnswerKey\.pdf$', re.IGNORECASE)
# 3. <Subj>_<Year>.pdf (e.g., cs_2021.pdf)
PATTERN_OLD_QP = re.compile(r'^([a-z]{2,3})_(\d{4})\.pdf$', re.IGNORECASE)

# Keywords to exclude
EXCLUDE_KEYWORDS = [
    "Brochure", "Poster", "Advt", "Report", "Advertisement", "History", 
    "Information", "Statistical", "Syllabus", "Schedule", "Admission", "Eligibility"
]

def parse_filename(filename, current_year):
    """
    Returns (year, subject, batch, type) or None if it should be excluded.
    type: 'QP' (Question Paper) or 'AK' (Answer Key)
    """
    filename_clean = os.path.basename(filename)
    
    # Check exclusion list
    if any(kw.lower() in filename_clean.lower() for kw in EXCLUDE_KEYWORDS):
        return None

    # Try Modern QP Pattern: AE24S5.pdf, CS124S5.pdf
    match = PATTERN_MODERN_QP.match(filename_clean)
    if match:
        subj_code = match.group(1).upper()
        session = match.group(2) if match.group(2) else "" # batch/session number
        year_suffix = match.group(3) # 24
        year = f"20{year_suffix}"
        batch = f"Session_{match.group(4)}"
        if session:
            batch = f"Batch_{session}_{batch}"
        return year, subj_code, batch, "QP"

    # Try Modern AK Pattern: AEFinalAnswerKey.pdf, CS1FinalAnswerKey.pdf
    match = PATTERN_MODERN_AK.match(filename_clean)
    if match:
        subj_code = match.group(1).upper()
        session = match.group(2) if match.group(2) else ""
        year = current_year # Usually current from context if year not in name
        batch = f"Batch_{session}" if session else ""
        return year, subj_code, batch, "AK"

    # Try Old QP Pattern: cs_2021.pdf
    match = PATTERN_OLD_QP.match(filename_clean)
    if match:
        subj_code = match.group(1).upper()
        year = match.group(2)
        return year, subj_code, "", "QP"

    # Fallback heuristic for filenames containing "AnswerKey" and Year
    if "AnswerKey" in filename_clean:
        year_match = re.search(r'(20\d{2})', filename_clean)
        year = year_match.group(1) if year_match else current_year
        subj_match = re.search(r'([A-Z]{2,3})', filename_clean.upper())
        subj_code = subj_match.group(1) if subj_match else "UNKNOWN"
        return year, subj_code, "", "AK"

    return None

def organize():
    if not os.path.exists(TARGET_DIR):
        os.makedirs(TARGET_DIR)

    files_processed = 0
    files_organized = 0

    # Walk through the existing folders
    for root, dirs, files in os.walk(SOURCE_DIR):
        # Infer year from folder name if available
        folder_year = os.path.basename(root)
        current_year = folder_year if folder_year.isdigit() else "2024" # Default to 2024 for Unknown if from latest scrape

        for f in files:
            if not f.lower().endswith(".pdf"):
                continue
            
            files_processed += 1
            res = parse_filename(f, current_year)
            
            if res:
                year, subj_code, batch, f_type = res
                
                # Get descriptive subject name
                subj_name = SUBJECT_MAP.get(subj_code, subj_code)
                
                # Construct new filename
                # Example: GATE_2024_Computer_Science_Batch_1_QP.pdf
                new_name_parts = ["GATE", year, subj_name]
                if batch:
                    new_name_parts.append(batch)
                new_name_parts.append(f_type)
                
                new_filename = "_".join(new_name_parts) + ".pdf"
                
                # Destination folder by year
                dest_year_dir = os.path.join(TARGET_DIR, year)
                if not os.path.exists(dest_year_dir):
                    os.makedirs(dest_year_dir)
                
                src_path = os.path.join(root, f)
                dest_path = os.path.join(dest_year_dir, new_filename)
                
                # Use copy to avoid destroying original until we're sure
                shutil.copy2(src_path, dest_path)
                files_organized += 1
                print(f"[Organized] {f} -> {dest_path}")

    print("\n" + "="*30)
    print("ORGANIZATION SUMMARY")
    print(f"Total PDFs Scanned:   {files_processed}")
    print(f"Files Organized:      {files_organized}")
    print(f"Files Discarded:      {files_processed - files_organized}")
    print(f"Target Directory:     {TARGET_DIR}")
    print("="*30)

if __name__ == "__main__":
    organize()
