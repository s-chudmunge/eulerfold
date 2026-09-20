import logging
from typing import List, Optional

from app.core.config import settings
from app.utils.ai_client import generate_text, log_backend_ai_usage

logger = logging.getLogger(__name__)

def build_lesson_prompt(
    subject: str,
    topic_title: str,
    subtopics: list[str],
    goal: str = ""
) -> str:
    subtopics_text = ", ".join(subtopics) if subtopics else topic_title

    # 1. Detect Domain Archetype based on subject & topic
    combined_ctx = f"{subject} {topic_title} {' '.join(subtopics)} {goal}".lower()

    is_code = any(k in combined_ctx for k in [
        "code", "programming", "python", "javascript", "react", "c++", "rust", "java", "sql",
        "backend", "frontend", "algorithm", "data structure", "api", "git", "docker", "linux",
        "machine learning", "scikit", "sklearn", "model", "training", "neural", "deep learning",
        "regression", "classification", "tensorflow", "pytorch", "pandas", "numpy", "ai engineering",
    ])
    is_stem = any(k in combined_ctx for k in [
        "physics", "math", "calculus", "linear algebra", "neural operator", "fourier", "pde",
        "quantum", "probability", "statistics", "differential", "matrix", "tensor", "geometry"
    ])
    is_lang = any(k in combined_ctx for k in [
        "arabic", "spanish", "french", "german", "mandarin", "chinese", "japanese", "korean", "italian", "russian",
        "hindi", "bengali", "portuguese", "vietnamese", "turkish", "persian", "farsi", "urdu", "dutch", "tagalog",
        "filipino", "swahili", "polish", "greek", "swedish", "indonesian", "tamil", "telugu", "punjabi", "marathi",
        "grammar", "vocabulary", "pronunciation", "alphabet", "speaking", "language", "letters", "hiragana", "kanji", "hangul"
    ])

    if is_lang:
        archetype_instructions = """\
DOMAIN: Language Learning.
- CRITICAL: NEVER use mathematical equations, KaTeX/LaTeX, acoustic engineering formulas, or pseudo-scientific modeling. This is a human language topic, not a mathematics topic.
- Open with what the learner will actually be able to do after this section — a real phrase they can say, a script character they can read.
- Describe pronunciation and articulation in purely physical, human terms ("produced at the back of the throat, like clearing it softly") — no formulas.
- Give 2–4 concrete vocabulary words or phrases with transliteration and exact translation, woven into the prose.
- Identify the key pattern or rule that makes this concept stick — the thing a native speaker knows instinctively but rarely says out loud.
- Write like a patient, experienced language tutor who genuinely loves this language."""
    elif is_code:
        archetype_instructions = """\
DOMAIN: Programming, Machine Learning & Software Engineering.
- CRITICAL: Do NOT open with mathematical notation or equations. Open with the engineering problem this concept exists to solve — why does this thing need to exist at all?
- Use code sparingly but concretely: one focused snippet (4–8 lines) that a working engineer would recognise. Annotate the key lines with inline comments.
- Call out the one gotcha that trips people up the first time — be specific, not generic ("data leakage from fitting the scaler on the full dataset before splitting" is specific; "make sure to handle edge cases" is not).
- Discuss real trade-offs: what does this approach cost, and when would you reach for something else?
- Avoid bullet lists wherever prose flows naturally. Explanation should read, not scan."""
    elif is_stem:
        archetype_instructions = """\
DOMAIN: Mathematics & Applied Science.
- Build physical or geometric intuition in plain English first. The equation appears after the reader already understands what it is describing.
- Format equations in KaTeX/LaTeX ($...$ inline, $$...$$ display). After each equation, state in one plain sentence what it is literally saying.
- Explain what each variable represents in the real world before using it in a formula.
- Answer the "why does this work" question, not just the "how to apply it" question."""
    else:
        archetype_instructions = """\
DOMAIN: Conceptual & Systems Thinking.
- Open with a concrete, specific scenario — not a generic analogy. Make it real enough that the reader can picture it.
- Trace the cause-and-effect chain that drives the mechanism. What triggers what, and why?
- Address the most common misconception about this concept directly, by name."""

    prompt = f"""\
You are an expert textbook author writing a concise, lucid section for an authoritative university textbook on "{subject}".
Topic: "{topic_title}"
Topics to cover: {subtopics_text}
Target audience context: "{goal}"

---

STYLE MANDATE: CLASSIC TEXTBOOK PROSE (IN THE SPIRIT OF D.J. GRIFFITHS / K&R)

Write this section as if it were an excerpt from a celebrated textbook (like David J. Griffiths' "Introduction to Electrodynamics" or Kernighan & Ritchie's "The C Programming Language"). 

The tone must be:
- Calm, direct, intellectually rigorous, and lucid.
- Conversational yet academic: use "we" and "you" naturally as an instructor working through the ideas with a serious student at a blackboard ("Notice that...", "At first glance, one might expect...", "The reason for this becomes clear when we examine...").
- Focused entirely on mechanical reality and technical precision.

ABSOLUTE PROHIBITIONS (NO AI SLOP OR INFLUENCER CADENCE):
- NEVER use motivational speaker hooks or dramatic openers (STRICTLY FORBIDDEN: "Picture this", "This isn't philosophy—", "Imagine you are...", "In the fast-paced world of...", "Have you ever wondered...?").
- NEVER use organic/biological metaphors for software or math ("the nervous system of", "the heartbeat of", "the DNA of", "superpower", "magic").
- NEVER invent fake personal anecdotes or war stories ("I've seen this waste hours in production", "In my years of engineering...").
- NEVER use cheap rhetorical questions as transitions ("Why does this matter?", "What's the catch?").
- STRICTLY BAN the words: "high", "highly", "delve", "tapestry", "game-changer", "vital", "crucial", "leverage", "supercharge".
- Do NOT end with a bulleted "Key Takeaways" or "Summary" list. Close with a clean, measured explanatory paragraph.

STRUCTURE AND TYPOGRAPHY (CRITICAL FOR READABILITY):
Organize the excerpt like a polished, modern textbook chapter:
- Section Headings: Use Markdown `## ` for primary sections and `### ` for deeper subtopics or edge cases. Headings MUST be descriptive and topical in Title Case (e.g., `## Namespaces and Object References`, `## The Operator Dispatch Protocol`, `### The Mutable Default Trap`) — NEVER use generic labels like "The Setup" or "Section 1".
- Pacing & Paragraphs: Keep paragraphs focused (3–5 sentences each). Never present an unbroken wall of text. Give ideas room to breathe.
- Textbook Callout Box: Include at least one blockquote (`> **Core Principle:** ...` or `> **Rule:** ...`) that crystallizes the foundational mechanic in one or two sentences, just like a highlighted axiom box in a university textbook.
- Visual Scannability: Use **bold** for technical terms upon first introduction. Use backticks (`code`) for identifiers, methods, types, and keywords throughout the prose.
- Code Presentation: Use a clean, fenced code block (e.g. ```python ... ```) with concise inline comments explaining the critical line. Follow the code block immediately with a short explanation of what the interpreter or engine actually did.

{archetype_instructions}

LANGUAGE:
If the learner goal ("{goal}") is written in French, write in French. If Spanish, in Spanish. Otherwise, write in English.

CRITICAL OUTPUT DIRECTIVE:
- Start IMMEDIATELY with the first section heading (`## ...`).
- NEVER output any thinking process, reasoning tokens, scratchpad reflections, or outline notes (STRICTLY FORBIDDEN: "Here's a thinking process:", "Analyze the Request", "Deconstruct the Style Mandate", or any meta-commentary).
- Output ONLY the finished textbook markdown text. No greetings, title banners, or conversational wrappers.
"""
    return prompt.strip()
    
async def generate_topic_lesson(
    sb,
    uid: str | None,
    roadmap_id: int,
    module_number: int,
    topic_index: int,
    subject: str,
    topic_title: str,
    subtopics: list[str],
    goal: str = "",
    model: str = None
) -> str:
    prompt = build_lesson_prompt(
        subject=subject,
        topic_title=topic_title,
        subtopics=subtopics,
        goal=goal
    )
    try:
        model_to_use = model or settings.DEFAULT_FEEDBACK_MODEL or "openrouter/free"
        raw_text, usage = await generate_text(prompt, model=model_to_use, return_usage=True)
        
        if uid and usage:
            try:
                log_backend_ai_usage(
                    sb,
                    uid,
                    f"Micro-Lesson: {topic_title} (Cost: 0 Credits)",
                    usage,
                    source="backend"
                )
            except Exception as log_err:
                logger.warning(f"Could not log micro-lesson AI usage: {log_err}")
            
        return raw_text.strip()
    except Exception as e:
        logger.error(f"Failed to generate micro-lesson: {e}")
        raise e
