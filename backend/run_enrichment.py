import subprocess
import sys

def main():
    ids = [1476, 1477, 1478, 1479, 1480]
    for course_id in ids:
        print(f"Enriching course {course_id}...")
        subprocess.run(["./venv/bin/python", "smart_video_enrich.py", str(course_id)], check=True)
        subprocess.run(["./venv/bin/python", "smart_resource_enrich.py", str(course_id)], check=True)
        print(f"Finished enriching course {course_id}")

if __name__ == "__main__":
    main()
