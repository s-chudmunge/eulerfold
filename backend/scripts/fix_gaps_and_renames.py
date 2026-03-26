import os
import re
import shutil

# Rename mapping for Priority 2
RENAME_MAP = {
    "Papers/INMO/INMO_Unknown_inmosol-15.pdf": "Papers/INMO/INMO_2015_AK_inmosol-15.pdf",
    "Papers/INMO/INMO_Unknown_inmo-20-QP-4_0.pdf": "Papers/INMO/INMO_2020_QP_inmo-20-QP-4_0.pdf",
    "Papers/INMO/INMO_Unknown_sol-inmo-20.pdf": "Papers/INMO/INMO_2020_AK_sol-inmo-20.pdf",
    "Papers/INMO/Unknown_INMO21FINAL.pdf": "Papers/INMO/INMO_2021_QP_INMO21FINAL.pdf",
    "Papers/INMO/Unknown_INMO23_qp.pdf": "Papers/INMO/INMO_2023_QP_INMO23_qp.pdf",
    "Papers/IOQM/Unknown_IOQM_22_finalversion_for_publish.pdf": "Papers/IOQM/IOQM_2022_QP_IOQM_22_finalversion_for_publish.pdf",
    "Papers/PRMO/Unknown_PRMO18_Question_Paper.pdf": "Papers/PRMO/PRMO_2018_QP_PRMO18_Question_Paper.pdf",
}

# RMO renames (using regex for the many crmo-* files)
RMO_PREFIX_MAP = {
    r"crmo-14": "RMO_2014",
    r"sol-crmo-14": "RMO_2014_AK",
    r"sol_crmo_14": "RMO_2014_AK",
    r"crmo-15": "RMO_2015",
    r"sol-crmo15": "RMO_2015_AK",
    r"crmo-16": "RMO_2016",
    r"QPcrmo-16": "RMO_2016_QP",
    r"solutions-crmo-18": "RMO_2018_AK",
}

def rename_priority_2():
    print("=== Priority 2: Renaming Unknown Files ===")
    
    # Direct renames
    for old, new in RENAME_MAP.items():
        if os.path.exists(old):
            print(f"  [RENAME] {old} -> {new}")
            os.rename(old, new)
        else:
            print(f"  [-] Skipped (missing): {old}")

    # RMO regex renames
    rmo_dir = "Papers/RMO"
    if os.path.exists(rmo_dir):
        for filename in os.listdir(rmo_dir):
            if "Unknown" in filename or "QPcrmo" in filename or "crmo" in filename:
                old_path = os.path.join(rmo_dir, filename)
                new_filename = filename
                
                for pattern, replacement in RMO_PREFIX_MAP.items():
                    if re.search(pattern, filename, re.I):
                        # Construct a cleaner name
                        year_match = re.search(pattern + r"[-_]*(\d*)", filename, re.I)
                        year_suffix = ""
                        if year_match and year_match.group(1):
                            # Already has year in replacement prefix usually
                            pass
                        
                        new_filename = f"{replacement}_{filename}"
                        # Clean up double prefixes if any
                        if new_filename.count("RMO") > 1:
                            new_filename = new_filename.replace("RMO_", "", 1)
                        break
                
                if new_filename != filename:
                    new_path = os.path.join(rmo_dir, new_filename)
                    print(f"  [RMO RENAME] {filename} -> {new_filename}")
                    os.rename(old_path, new_path)

if __name__ == "__main__":
    rename_priority_2()
