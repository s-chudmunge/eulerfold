import os
import re
import json
import subprocess
import sys

def extract_text_from_pdf(pdf_path, pages="1-4"):
    """Extracts text from specific pages of a PDF using pdftotext."""
    try:
        # Use -layout to preserve spatial positioning of options
        result = subprocess.run(
            ["pdftotext", "-f", "1", "-l", "4", "-layout", pdf_path, "-"],
            capture_output=True, text=True, check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error extracting text: {e}")
        return ""

def parse_questions(text, limit=5):
    """Parses text to extract question number, body, and options."""
    questions = []
    
    # Pattern to find Q.1, Q.2 etc and stop before the next Q. or end of text
    # This matches "Q. <num>" and captures everything until the next "Q. <num+1>"
    for i in range(1, limit + 1):
        start_pattern = f"Q\\.{i}\\s"
        end_pattern = f"Q\\.{i+1}\\s"
        
        start_match = re.search(start_pattern, text)
        if not start_match:
            continue
            
        end_match = re.search(end_pattern, text)
        if end_match:
            q_block = text[start_match.start():end_match.start()]
        else:
            # Fallback for the last question in the chunk
            q_block = text[start_match.start():start_match.start() + 2000]

        # Clean the block
        q_block = q_block.strip()
        
        # Extract Options (A), (B), (C), (D)
        # We look for (A) followed by text, then (B), etc.
        options = {}
        for opt in ['A', 'B', 'C', 'D']:
            opt_pattern = rf"\({opt}\)\s*(.*?)(?=\({chr(ord(opt)+1)}\)|$)" if opt != 'D' else rf"\(D\)\s*(.*)"
            opt_match = re.search(opt_pattern, q_block, re.DOTALL)
            if opt_match:
                options[opt] = opt_match.group(1).strip().split('\n')[0] # Get first line of option

        # Extract Question Body (text between Q.X and first option (A))
        body_match = re.search(rf"Q\.{i}\s*(.*?)(?=\(A\)|$)", q_block, re.DOTALL)
        body = body_match.group(1).strip() if body_match else "Could not parse body"
        
        # Further clean body (remove extra newlines and page footers)
        body = re.sub(r'Page \d+ of \d+.*', '', body)
        body = re.sub(r'Organizing Institute:.*', '', body)
        body = " ".join(body.split())

        questions.append({
            "id": i,
            "body": body,
            "options": options,
            "metadata": {
                "source_index": i
            }
        })
        
    return questions

def save_questions(questions, source_name, output_dir="content/extracted_questions"):
    """Saves extracted questions to a JSON file."""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    file_name = f"{source_name}_questions.json"
    path = os.path.join(output_dir, file_name)
    
    data = {
        "source": source_name,
        "count": len(questions),
        "questions": questions
    }
    
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Successfully stored {len(questions)} questions in {path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Default test case
        pdf_path = "content/previous_year_papers_pdf/GATE/GATE_2024_ST_Session_6_QP.pdf"
    else:
        pdf_path = sys.argv[1]

    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        sys.exit(1)

    print(f"Extracting questions from {pdf_path}...")
    raw_text = extract_text_from_pdf(pdf_path)
    if raw_text:
        extracted = parse_questions(raw_text, limit=5)
        source_id = os.path.basename(pdf_path).replace(".pdf", "")
        save_questions(extracted, source_id)
