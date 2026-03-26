import json
import os

DRIVE_JSON = 'drive_files.json'
LOCAL_TXT = 'local_files.txt'
MAPPING_OUT = 'content/archive_drive_mapping.json'

def sync():
    if not os.path.exists(DRIVE_JSON):
        print(f"Error: {DRIVE_JSON} not found.")
        return
    if not os.path.exists(LOCAL_TXT):
        print(f"Error: {LOCAL_TXT} not found.")
        return

    with open(DRIVE_JSON, 'r') as f:
        drive_data = json.load(f)

    with open(LOCAL_TXT, 'r') as f:
        local_files = [line.strip() for line in f if line.strip().endswith('.pdf')]

    # Build drive lookup (filename -> ID)
    # Note: If multiple files have the same name, we'll take the first one found.
    drive_lookup = {}
    for entry in drive_data:
        if not entry.get('IsDir'):
            name = entry.get('Name')
            file_id = entry.get('ID')
            if name and file_id:
                drive_lookup[name] = file_id

    mapping = {}
    matched = 0
    missing = []
    
    local_filenames = set()
    for local_path in local_files:
        name = os.path.basename(local_path)
        local_filenames.add(name)
        if name in drive_lookup:
            mapping[name] = drive_lookup[name]
            matched += 1
        else:
            missing.append(name)

    extra = [name for name in drive_lookup if name not in local_filenames]

    # Write the mapping file
    with open(MAPPING_OUT, 'w') as f:
        json.dump(mapping, f, indent=2)

    # Output Report
    print("--- Google Drive Sync Report ---")
    print(f"Total Local Files:  {len(local_filenames)}")
    print(f"Total Drive Files:  {len(drive_lookup)}")
    print(f"Matched:            {matched}")
    print(f"Missing (not on Drive): {len(missing)}")
    print(f"Extra (on Drive but not local): {len(extra)}")
    
    if missing:
        print("\nMissing Files (Upload these to Drive):")
        for m in missing[:10]: # Limit to 10
            print(f"  - {m}")
        if len(missing) > 10:
            print(f"  ... and {len(missing) - 10} more.")

    if extra:
        print("\nExtra Files on Drive:")
        for e in extra[:10]: # Limit to 10
            print(f"  - {e}")
        if len(extra) > 10:
            print(f"  ... and {len(extra) - 10} more.")

    print(f"\nFinal mapping saved to: {MAPPING_OUT}")

if __name__ == "__main__":
    sync()
