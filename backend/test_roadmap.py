import asyncio
from app.utils.ai_client import generate_text, robust_json_loads
from app.config import settings

async def main():
    prompt = """
You are a technical mentor.
The user wants to become a "Machine Learning Engineer".
They are already proficient in: "Python, basic statistics"
However, they struggle with or failed diagnostics on: "Approximate algorithms, Mean-field approximations"

Generate a 4 weeks learning roadmap that COMPLETELY SKIPS the known skills.
Strictly focus the entire roadmap on bridging the gap in their weak areas.

**RULES:**
1. **Engaging Title:** The "title" must be catchy, SEO-friendly, and natural (e.g., "Understanding Backpropagation", "Fundamentals of React Hooks"). Do NOT use dry, robotic formats like "Intensive 4-Week X Mastery Roadmap". Do NOT include the time duration in the title. Do NOT use buzzwords like "Mastery", "High-Performance", "Bootcamp", or "Journey".
2. **SEO-Friendly Description:** The "description" must be a single, punchy, search-engine-friendly sentence similar to the title.
2. **Technical Rigor:** Focus on depth and verifiable technical skills.
3. **Specific Topics:** Each module must have 3-5 specific topics using industry-standard terms.
4. **Practical Outcomes:** The `proof_of_work_instructions` must describe a realistic technical task that demonstrates competency.
5. **Conciseness:** Roadmap description must be max 2 sentences. Each module 'outcome' must be max 1 sentence.
6. **Output JSON ONLY** matching this schema:
   {
     "title": "string",
     "description": "string",
     "modules": [
       {
         "title": "string",
         "outcome": "string",
         "timeline": "string",
         "workspace_type": "code|research|design",
         "proof_of_work_instructions": {
            "what_to_build": "string",
            "what_counts_as_evidence": "string",
            "eval_criteria": ["string", "string"]
         },
         "optimal_search_query": "string",
         "topics": [
           {
              "title": "string",
              "youtube_search_query": "A precise search query to find a university lecture or in-depth technical video on this specific topic (e.g., 'MIT linear algebra eigenvalues lecture')",
              "subtopics": [ { "title": "string" } ]
            }
         ]
       }
     ]
   }
"""
    print("Generating text...")
    generated_text, usage = await generate_text(prompt, model=settings.DEFAULT_ROADMAP_MODEL, response_mime_type="application/json", return_usage=True)
    print("Generation complete. Parsing JSON...")
    roadmap_plan = robust_json_loads(generated_text)
    print("JSON parsed successfully!")
    print("Title:", roadmap_plan.get("title"))

if __name__ == "__main__":
    asyncio.run(main())
