import json
import logging
import uuid
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.core.supabase_client import get_supabase_client
from app.utils.gemini_client import generate_text, clean_json_string
from app.core.config import settings

logger = logging.getLogger(__name__)

async def generate_assessment_questions(skill_name: str, completed_topics: List[str]) -> List[Dict[str, Any]]:
    """
    Generates 15-20 assessment problems for a specific skill based on completed topics.
    Mix of MCQ, code output prediction, and short written explanation.
    """
    prompt = f"""
You are a technical examiner for the subject: {skill_name}.
The student has completed the following topics: {", ".join(completed_topics)}.

Your task is to generate a comprehensive 15-problem assessment. 
The problems must be a mix of:
1. Multiple Choice (MCQ): Conceptual questions.
2. Code Output Prediction: Small snippets where the user predicts the result.
3. Short Written Explanation: Questions requiring 1-2 sentences of technical reasoning.

### Return Format (Valid JSON ONLY):
{{
  "problems": [
    {{
      "id": "uuid-string",
      "type": "mcq" | "code_prediction" | "written",
      "question": "The question text",
      "code_snippet": "Optional code block for prediction",
      "options": ["A", "B", "C", "D"], -- Only for mcq
      "correct_answer": "The correct option or expected output", -- For mcq and code_prediction
      "difficulty": "Easy" | "Medium" | "Hard"
    }}
  ]
}}

Ensure technical accuracy and variety across the completed topics.
Begin the JSON output immediately.
"""

    try:
        gen_raw = await generate_text(prompt, model=settings.GEMINI_MODEL, response_mime_type="application/json")
        data = json.loads(clean_json_string(gen_raw))
        problems = data.get("problems", [])
        
        # Ensure every problem has a UUID
        for p in problems:
            if not p.get("id"):
                p["id"] = str(uuid.uuid4())
                
        return problems
    except Exception as e:
        logger.error(f"Failed to generate assessment questions: {e}")
        raise e

async def evaluate_assessment(session_id: str):
    """
    Grades an assessment session. MCQs are auto-graded, written answers are graded by AI.
    """
    sb = get_supabase_client()
    
    # 1. Fetch Session
    res = sb.table("assessment_sessions").select("*, canonical_skills(name)").eq("id", session_id).single().execute()
    if not res.data:
        return
    
    session = res.data
    questions = session["questions"]
    skill_name = session.get("canonical_skills", {}).get("name", "Unknown Skill")
    
    correct_count = 0
    total_problems = len(questions)
    
    written_questions = [q for q in questions if q["type"] == "written"]
    mcq_code_questions = [q for q in questions if q["type"] != "written"]
    
    # 2. Grade Auto-gradable (MCQ and Code Prediction)
    for q in mcq_code_questions:
        u_ans = str(q.get("user_answer", "")).strip().lower()
        c_ans = str(q.get("correct_answer", "")).strip().lower()
        if u_ans == c_ans:
            correct_count += 1
            q["is_correct"] = True
        else:
            q["is_correct"] = False

    # 3. AI Grade Written Answers
    if written_questions:
        eval_prompt = f"""
You are an expert technical grader for {skill_name}. 
Grade these short written answers on a scale of 0 to 1.0.
Criteria: Technical accuracy, use of correct terminology, and conciseness.

### Questions and Answers:
"""
        for i, q in enumerate(written_questions):
            eval_prompt += f"{i+1}. Q: {q['question']}\n   A: {q.get('user_answer', 'NO ANSWER PROVIDED')}\n\n"

        eval_prompt += """
### Return Format (Valid JSON ONLY):
{{
  "evaluations": [
    {{ "index": 0, "score": 0.8, "feedback": "Good but missed X." }}
  ]
}}
"""
        try:
            gen_raw = await generate_text(eval_prompt, model=settings.GEMINI_MODEL, response_mime_type="application/json")
            eval_data = json.loads(clean_json_string(gen_raw))
            evals = eval_data.get("evaluations", [])
            
            for ev in evals:
                idx = ev["index"]
                if 0 <= idx < len(written_questions):
                    score = ev["score"]
                    written_questions[idx]["score"] = score
                    written_questions[idx]["feedback"] = ev["feedback"]
                    # For total score calculation, written questions are weighted as 1 problem
                    correct_count += score
        except Exception as e:
            logger.error(f"AI Written Evaluation failed: {e}")
            # Fallback: give 0.5 for attempted, 0 for empty
            for q in written_questions:
                q["score"] = 0.5 if q.get("user_answer") else 0.0

    # 4. Calculate Final Score
    final_score = round((correct_count / total_problems) * 100, 1)
    
    # 5. Handle Flagging (Integrity)
    status = "completed"
    if session.get("tab_switch_count", 0) > 5:
        status = "flagged"

    # 6. Update Session
    sb.table("assessment_sessions").update({
        "status": status,
        "score": final_score,
        "finished_at": datetime.now(timezone.utc).isoformat(),
        "questions": questions
    }).eq("id", session_id).execute()
    
    # 7. Update User Skill
    sb.table("user_skills").update({
        "last_assessment_score": final_score,
        "last_assessment_at": datetime.now(timezone.utc).isoformat()
    }).eq("user_id", session["user_id"]).eq("canonical_skill_id", session["skill_id"]).execute()
    
    return final_score
