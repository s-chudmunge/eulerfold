import os
import json
import sys
import subprocess
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

# 1. Load environment variables from backend/.env
# Assuming script is run from project root or backend/scripts/
# We search for .env in likely locations
env_paths = ["backend/.env", ".env", "../.env"]
env_loaded = False
for path in env_paths:
    if os.path.exists(path):
        load_dotenv(path)
        env_loaded = True
        print(f"Loaded environment from {path}")
        break

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in environment or .env file.")
    sys.exit(1)

genai.configure(api_key=api_key)

def extract_images_from_pdf(pdf_path, page_limit=4):
    """
    Converts PDF pages to images using pdftoppm.
    """
    images = []
    prefix = "/tmp/gate_ocr_tmp"
    try:
        print(f"Converting PDF to images...")
        subprocess.run(["pdftoppm", "-png", "-f", "1", "-l", str(page_limit), pdf_path, prefix], check=True)
        
        # Collect generated images
        for i in range(1, page_limit + 1):
            img_path = f"{prefix}-{i}.png"
            if os.path.exists(img_path):
                images.append(Image.open(img_path))
        return images
    except Exception as e:
        print(f"Conversion error: {e}")
        return []

def extract_questions_with_ai(pdf_path, limit=5):
    # Use the same model reported in your backend logs
    model = genai.GenerativeModel('gemini-1.5-pro')
    images = extract_images_from_pdf(pdf_path)
    
    if not images:
        return None

    prompt = f"""
    You are an expert exam digitizer. Analyze these images of a GATE exam paper.
    Extract the first {limit} questions exactly as they appear.
    
    CRITICAL INSTRUCTIONS:
    1. LaTeX: Every single equation, symbol (arrows, logs, subscripts), and variable MUST be wrapped in LaTeX ($ ... $).
       - Example: "ln(x)" -> "$\\ln(x)$"
       - Example: "x^2" -> "$x^2$"
       - Example: "walk -> jog" -> "walk $\\rightarrow$ jog"
    2. STRUCTURE: Return ONLY a valid JSON object.
    3. JSON Format:
    {{
      "source_file": "filename",
      "exam_type": "GATE",
      "questions": [
        {{
          "id": 1,
          "question_text": "Text with $LaTeX$",
          "options": {{
            "A": "Option A text",
            "B": "Option B text",
            "C": "Option C text",
            "D": "Option D text"
          }}
        }}
      ]
    }}
    
    Return raw JSON only. No markdown formatting.
    """

    print(f"Sending images to Gemini for high-fidelity extraction...")
    try:
        response = model.generate_content([prompt, *images])
        raw_text = response.text.strip()
        # Cleanup markdown if AI ignores instructions
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "", 1).replace("```", "", 1).strip()
        elif raw_text.startswith("```"):
            raw_text = raw_text.replace("```", "", 1).replace("```", "", 1).strip()
            
        return json.loads(raw_text)
    except Exception as e:
        print(f"AI Extraction failed: {e}")
        if 'raw_text' in locals():
            print(f"Raw Response: {raw_text[:200]}...")
        return None

def save_to_json(data, source_name):
    output_dir = "content/extracted_questions"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    output_path = os.path.join(output_dir, f"{source_name}_structured.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\nSUCCESS!")
    print(f"Stored {len(data['questions'])} structured questions in: {output_path}")

if __name__ == "__main__":
    target_pdf = sys.argv[1] if len(sys.argv) > 1 else "content/previous_year_papers_pdf/GATE/GATE_2024_ST_Session_6_QP.pdf"
    
    if not os.path.exists(target_pdf):
        print(f"File not found: {target_pdf}")
        sys.exit(1)

    result = extract_questions_with_ai(target_pdf)
    if result:
        save_to_json(result, os.path.basename(target_pdf).replace(".pdf", ""))
