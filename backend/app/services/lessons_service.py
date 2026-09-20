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
- CODE BLOCK DISCIPLINE: Code blocks must serve a very important and valuable purpose. ONLY include a code block when it makes the most sense to use (e.g. when syntax, memory layout, or exact execution flow cannot be explained clearly in words alone). Do NOT include code blocks each and every time unnecessarily or just to have boilerplate.
- When code is genuinely necessary: keep it hyper-focused (strictly 3–7 lines of the exact critical mechanism) with standard inline comments. NEVER use markdown formatting like **bold** inside code comments.
- Call out the one gotcha that trips people up the first time — be specific, not generic ("data leakage from fitting the scaler on the full dataset before splitting" is specific; "make sure to handle edge cases" is not).
- Discuss real trade-offs: what does this approach cost, and when would you reach for something else?
- Present core mechanics and pitfalls as bullet points with bold highlights for effortless scanning."""
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
You are an expert technical educator writing an explanatory, learner-focused AI Overview on "{topic_title}" for a course on "{subject}".
Topics to cover: {subtopics_text}
Learner context: "{goal}"

---

PEDAGOGICAL DIRECTIVES (LEARNER-FIRST & EXPLANATORY):
- Focus entirely on the learner: build a clear mental model of how the system works in practice and why it matters for their specific goal in "{subject}".
- Be genuinely explanatory: explain the *intuition* and *mechanics* (what actually happens under the hood, how the system executes it, and why decisions are made).
- Cut all meta-fluff: NEVER write filler like "{topic_title} is a fundamental concept...", "In this section we will explore...", or "Understanding this is essential...". Jump straight into the concrete reality.
- Plain, direct English: analytical, explanatory, and clear. Maximum information density with zero fluff.
- Code Block Value & Purpose: Code blocks must serve a very important and valuable purpose. ONLY include a code block when it makes the most sense to use. Do NOT use code blocks each and every time unnecessarily. If the topic is conceptual, architectural, or better explained through a direct mechanical trace or formula, do not include boilerplate code.
- Brevity & Length: Strictly UNDER 450 words total (target 250–400 words).
- Scannability: Structure the explanation using short, readable paragraphs, bullet points, and bold highlights for all key terms.

ABSOLUTE PROHIBITIONS:
- NEVER use motivational speaker hooks or dramatic openers (STRICTLY FORBIDDEN: "Picture this", "This isn't philosophy—", "Imagine you are...", "In the fast-paced world of...", "Have you ever wondered...?").
- NEVER use organic/biological metaphors for software or math ("the nervous system of", "the heartbeat of", "the DNA of", "superpower", "magic").
- NEVER invent fake personal anecdotes or war stories ("I've seen this waste hours in production", "In my years of engineering...").
- NEVER use cheap rhetorical questions as transitions ("Why does this matter?", "What's the catch?").
- STRICTLY BAN the words: "high", "highly", "delve", "tapestry", "game-changer", "vital", "crucial", "leverage", "supercharge".
- Inside code blocks, NEVER use markdown formatting like asterisks (**bold**) inside comments or code.

STRUCTURE OF THE OVERVIEW:
## Intuition & Mental Model
1–2 concise, direct paragraphs giving the learner the practical mental model. Explain the problem this mechanism solves and how the machine or system processes it.

## Core Mechanics
- 3–4 bullet points with **bold terms** explaining the exact cause-and-effect mechanisms and internal rules.

## Practical Example
A concrete demonstration. Include a focused code block (strictly 3–7 lines with standard inline comments) ONLY when it serves an important and valuable purpose where seeing exact syntax makes the most sense. If a code block is not strictly necessary or would be generic boilerplate, provide a clear mechanical step-by-step trace or formula ($$...$$) instead. Do not force code blocks unnecessarily.

## Common Pitfalls & What to Remember
- 2–3 specific gotchas or trade-offs that trip learners up in practice and how to avoid them.

{archetype_instructions}

LANGUAGE:
If the learner goal ("{goal}") is written in French, write in French. If Spanish, in Spanish. Otherwise, write in English.

CRITICAL OUTPUT DIRECTIVE:
- Start IMMEDIATELY with the first section heading (`## Intuition & Mental Model`).
- STRICT LENGTH LIMIT: Keep the entire output UNDER 450 words total.
- Format concepts with bullet points and bold highlights for effortless scanning.
- NEVER output any thinking process, reasoning tokens, scratchpad reflections, or outline notes.
- Output ONLY the finished markdown text. No greetings, title banners, or conversational wrappers.
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
        model_to_use = model or getattr(settings, "OPENROUTER_MODEL", None) or getattr(settings, "DEFAULT_FEEDBACK_MODEL", None) or "meta-llama/llama-3.3-70b-instruct"
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

async def generate_topic_lesson_stream(
    sb,
    uid: str | None,
    roadmap_id: int,
    module_number: int,
    topic_index: int,
    subject: str,
    topic_title: str,
    subtopics: list[str],
    goal: str = "",
    model: str = None,
    meta: dict | None = None
):
    """Streams lesson content tokens. If `meta` dict is provided, writes the resolved
    model name into meta['model_name'] before yielding so the caller can log it."""
    from app.utils.ai_client import generate_text_stream
    prompt = build_lesson_prompt(
        subject=subject,
        topic_title=topic_title,
        subtopics=subtopics,
        goal=goal
    )
    model_to_use = model or getattr(settings, "OPENROUTER_MODEL", None) or getattr(settings, "DEFAULT_FEEDBACK_MODEL", None) or "meta-llama/llama-3.3-70b-instruct"
    if meta is not None:
        meta["model_name"] = model_to_use
        meta["prompt_len"] = len(prompt)
    async for token in generate_text_stream(prompt, model=model_to_use):
        yield token

