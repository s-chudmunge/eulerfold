import os
import logging
import asyncio
import time
import random
import base64
import json
import httpx
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.utils.ai_client import generate_text, clean_json_string, robust_json_loads

logger = logging.getLogger(__name__)

# In-memory cache: cache_key -> (timestamp, rows)
_BENCHMARK_CACHE: Dict[str, tuple[float, List[Dict[str, Any]]]] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour

PROGRESSIVE_TIERS = [
    {"tier": 1, "name": "Foundational", "description": "Prerequisite primitives & core terminology"},
    {"tier": 2, "name": "Application", "description": "Standard mechanics and implementation patterns"},
    {"tier": 3, "name": "Intermediate", "description": "Architectural trade-offs and structural choices"},
    {"tier": 4, "name": "Advanced", "description": "Edge-cases, failure modes, concurrency, and performance bottlenecks"},
    {"tier": 5, "name": "Expert", "description": "Complex systems synthesis, subtle invariants, and theoretical limits"}
]

def _load_dataset_registry() -> Dict[str, Any]:
    env_config = getattr(settings, "BENCHMARK_DATASET_REGISTRY", None) or os.getenv("BENCHMARK_DATASET_REGISTRY")
    if env_config:
        try:
            return json.loads(env_config)
        except Exception as e:
            logger.warning(f"[Diagnostic] Could not parse BENCHMARK_DATASET_REGISTRY from environment: {e}")
    logger.warning("[Diagnostic] BENCHMARK_DATASET_REGISTRY is not set in environment.")
    return {}

def _get_api_base_url() -> str:
    env_base = getattr(settings, "BENCHMARK_API_BASE", None) or os.getenv("BENCHMARK_API_BASE")
    if env_base:
        return env_base.rstrip("/")
    return ""

DATASET_REGISTRY = _load_dataset_registry()

# ── Public Category Taxonomy (Clean Domain Identifiers) ─────────────────────────
CATEGORY_DESCRIPTIONS = {
    # Humanities & Social Sciences
    "philosophy": "Philosophy, ethics, epistemology, and reasoning",
    "logical_fallacies": "Formal and informal logical fallacies",
    "formal_logic": "Deductive logic and proof structures",
    "sociology": "Social structures, sociology, and community dynamics",
    "high_school_psychology": "Introductory cognitive and behavioral psychology",
    "professional_psychology": "Advanced clinical and diagnostic psychology",
    "public_relations": "Media communication and public relations",
    "security_studies": "International security, deterrence, and defense policy",
    "global_facts": "Global geography, institutions, and geopolitics",

    # Computer Science & Technology
    "college_computer_science": "Systems programming, computer architecture, and theory",
    "high_school_computer_science": "Foundational programming and algorithmic syntax",
    "computer_security": "Cybersecurity, cryptography, and network vulnerabilities",
    "machine_learning": "Machine learning, AI foundations, and neural architectures",
    "code_comprehension": "Software engineering and code execution comprehension",
    "cs_algorithms": "Data structures and algorithm design",

    # Mathematics & Quantitative Analysis
    "college_mathematics": "Linear algebra, multivariate calculus, and real analysis",
    "high_school_mathematics": "Algebra, geometry, and trigonometry",
    "elementary_mathematics": "Arithmetic and elementary quantitative problems",
    "abstract_algebra": "Modern algebra, group theory, and vector spaces",
    "high_school_statistics": "Probability, distributions, and statistical inference",
    "econometrics": "Statistical modeling, regression, and empirical economics",

    # Physical Sciences & Engineering
    "mechanical_engineering": "Mechanics, kinematics, thermodynamics, heat transfer, and physical engineering systems",
    "electrical_engineering": "Circuits, signals, and semiconductor electronics",
    "college_physics": "Classical mechanics, electromagnetism, and thermodynamics",
    "high_school_physics": "Newtonian mechanics and kinematic foundations",
    "conceptual_physics": "Conceptual physical intuition and wave mechanics",
    "college_chemistry": "Inorganic, organic, and physical chemistry",
    "high_school_chemistry": "Atomic structures, stoichiometry, and chemical bonding",
    "astronomy": "Astrophysics, stellar mechanics, and cosmology",
    "science_inquiry": "Scientific method, empirical reasoning, and hypothesis evaluation",

    # Biological & Clinical Sciences
    "medical_genetics": "Genetics, genomics, and heredity",
    "college_biology": "Cellular biology, molecular genetics, and evolutionary systems",
    "high_school_biology": "Organismal biology and ecology",
    "virology": "Viral structure, immunology, and epidemiology",
    "anatomy": "Human anatomy and histological structures",
    "college_medicine": "Principles of human pathology and diagnostics",
    "clinical_knowledge": "Clinical medicine, triage, and patient care",
    "professional_medicine": "Board-level clinical decision making",
    "nutrition": "Metabolic pathways and nutritional biochemistry",
    "human_aging": "Gerontology and cellular senescence",
    "clinical_medicine": "Clinical therapeutics, pathology, and pharmacology",

    # Business, Economics & Law
    "high_school_macroeconomics": "Macroeconomic policy, inflation, and fiscal mechanisms",
    "high_school_microeconomics": "Microeconomic supply, demand, and market equilibria",
    "professional_accounting": "Financial statements, audit standards, and corporate accounting",
    "management": "Organizational leadership and operations management",
    "marketing": "Market research, customer acquisition, and branding",
    "business_ethics": "Corporate governance and regulatory ethics",
    "professional_law": "Constitutional law, torts, and contracts",
    "international_law": "Treaties, sovereignty, and international jurisprudence",
    "jurisprudence": "Legal philosophy and statutory interpretation",

    # Advanced Multidisciplinary
    "advanced_reasoning": "Advanced multidisciplinary graduate-level reasoning across STEM and humanities"
}

def _resolve_category_target(category_key: str) -> tuple[str, str, str, str, Optional[int]]:
    """
    Resolves a public category identifier to its internal dataset source, config, schema, split, and total rows.
    """
    cat = (category_key or "").strip().lower()
    
    # 1. Custom category overrides
    if cat == "mechanical_engineering":
        # Maps to classical mechanics, dynamics & thermodynamics benchmark
        return "cais/mmlu", "college_physics", "standard_mcq", "test", None
    elif cat == "advanced_reasoning":
        for ds_name, ds_info in DATASET_REGISTRY.items():
            if ds_info.get("schema") == "multi_option_mcq":
                cfg = ds_info.get("configs", ["default"])[0]
                return ds_name, cfg, "multi_option_mcq", ds_info.get("split", "test"), ds_info.get("total_rows", 12000)
    elif cat in ("science_inquiry", "science_challenge"):
        for ds_name, ds_info in DATASET_REGISTRY.items():
            if ds_info.get("schema") == "labeled_mcq":
                cfgs = ds_info.get("configs", [])
                cfg = cfgs[0] if cfgs else "default"
                return ds_name, cfg, "labeled_mcq", ds_info.get("split", "test"), None
    elif cat == "science_easy":
        for ds_name, ds_info in DATASET_REGISTRY.items():
            if ds_info.get("schema") == "labeled_mcq":
                cfgs = ds_info.get("configs", [])
                cfg = cfgs[1] if len(cfgs) > 1 else (cfgs[0] if cfgs else "default")
                return ds_name, cfg, "labeled_mcq", ds_info.get("split", "test"), None
    elif cat == "clinical_medicine":
        for ds_name, ds_info in DATASET_REGISTRY.items():
            if ds_info.get("schema") == "keyed_options_mcq":
                cfg = ds_info.get("configs", ["default"])[0]
                return ds_name, cfg, "keyed_options_mcq", ds_info.get("split", "train"), None
    elif cat in ("code_comprehension", "code_line_description"):
        for ds_name, ds_info in DATASET_REGISTRY.items():
            if ds_info.get("schema") == "target_scored_mcq":
                cfgs = ds_info.get("configs", [])
                cfg = cfgs[0] if cfgs else "default"
                return ds_name, cfg, "target_scored_mcq", ds_info.get("split", "train"), None
    elif cat == "cs_algorithms":
        for ds_name, ds_info in DATASET_REGISTRY.items():
            if ds_info.get("schema") == "target_scored_mcq":
                cfgs = ds_info.get("configs", [])
                cfg = cfgs[1] if len(cfgs) > 1 else (cfgs[0] if cfgs else "default")
                return ds_name, cfg, "target_scored_mcq", ds_info.get("split", "train"), None

    # 2. General standard MCQ search
    for ds_name, ds_info in DATASET_REGISTRY.items():
        configs = ds_info.get("configs", [])
        if cat in configs:
            return ds_name, cat, ds_info.get("schema", "standard_mcq"), ds_info.get("split", "test"), ds_info.get("total_rows")

    # 3. Default fallback
    for ds_name, ds_info in DATASET_REGISTRY.items():
        if "college_computer_science" in ds_info.get("configs", []):
            return ds_name, "college_computer_science", ds_info.get("schema", "standard_mcq"), ds_info.get("split", "test"), None

    first_ds = next(iter(DATASET_REGISTRY.keys())) if DATASET_REGISTRY else ""
    return first_ds, "default", "standard_mcq", "test", None


# ── Row normalizers ────────────────────────────────────────────────────────────

def _normalize_standard_mcq(row: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Standard 4-choice MCQ: {question, choices[4], answer(int 0-3)}"""
    q = (row.get("question") or "").strip()
    choices = row.get("choices", [])
    answer = row.get("answer")
    if not q or not isinstance(choices, list) or len(choices) != 4 or answer is None:
        return None
    return {"question": q, "choices": [str(c).strip() for c in choices], "answer_idx": int(answer)}


def _normalize_multi_option_mcq(row: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Multi-option MCQ (9-10 choices) reduced to 4 balanced options."""
    q = (row.get("question") or "").strip()
    options = row.get("options", [])
    answer_idx = row.get("answer_index")
    if not q or not isinstance(options, list) or len(options) < 4 or answer_idx is None:
        return None
    correct = options[int(answer_idx)]
    wrong = [o for i, o in enumerate(options) if i != int(answer_idx)]
    random.shuffle(wrong)
    selected = wrong[:3] + [correct]
    random.shuffle(selected)
    new_answer_idx = selected.index(correct)
    return {"question": q, "choices": [str(c).strip() for c in selected], "answer_idx": new_answer_idx}


def _normalize_labeled_mcq(row: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Labeled choices: {question, choices:{text[4], label[4]}, answerKey(letter A-D)}"""
    q = (row.get("question") or "").strip()
    choices_field = row.get("choices", {})
    texts = choices_field.get("text", [])
    labels = choices_field.get("label", [])
    answer_key = (row.get("answerKey") or "").strip()
    if not q or len(texts) != 4 or answer_key not in labels:
        return None
    answer_idx = labels.index(answer_key)
    return {"question": q, "choices": [str(c).strip() for c in texts], "answer_idx": answer_idx}


def _normalize_keyed_options_mcq(row: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Letter-keyed options: {question, opa, opb, opc, opd, cop(int 0-3)}"""
    q = (row.get("question") or "").strip()
    options = [
        str(row.get("opa") or "").strip(),
        str(row.get("opb") or "").strip(),
        str(row.get("opc") or "").strip(),
        str(row.get("opd") or "").strip(),
    ]
    cop = row.get("cop")
    if not q or not all(options) or cop is None:
        return None
    return {"question": q, "choices": options, "answer_idx": int(cop)}


def _normalize_target_scored_mcq(row: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Target scored options: {inputs, multiple_choice_targets, multiple_choice_scores}"""
    q = (row.get("inputs") or "").strip()
    choices = row.get("multiple_choice_targets", [])
    scores = row.get("multiple_choice_scores", [])
    if not q or not isinstance(choices, list) or len(choices) < 2 or not isinstance(scores, list):
        return None
    if 1 not in scores:
        return None
    
    correct_idx = scores.index(1)
    correct_choice = str(choices[correct_idx]).strip()
    wrong_choices = [str(c).strip() for i, c in enumerate(choices) if i != correct_idx and str(c).strip()]
    
    if len(wrong_choices) < 1:
        return None
        
    random.shuffle(wrong_choices)
    selected_options = wrong_choices[:3] + [correct_choice]
    random.shuffle(selected_options)
    new_answer_idx = selected_options.index(correct_choice)
    
    return {"question": q, "choices": selected_options, "answer_idx": new_answer_idx}


SCHEMA_NORMALIZERS = {
    "standard_mcq": _normalize_standard_mcq,
    "multi_option_mcq": _normalize_multi_option_mcq,
    "labeled_mcq": _normalize_labeled_mcq,
    "keyed_options_mcq": _normalize_keyed_options_mcq,
    "target_scored_mcq": _normalize_target_scored_mcq,
}


def normalize_row(row: Dict[str, Any], schema: str) -> Optional[Dict[str, Any]]:
    fn = SCHEMA_NORMALIZERS.get(schema)
    return fn(row) if fn else None


# ── Serverless Fetcher ────────────────────────────────────────────────────────

async def fetch_benchmark_rows(dataset: str, config: str, split: str, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
    """Fetch raw benchmark rows with in-memory caching and optional authentication."""
    cache_key = f"{dataset}:{config}:{offset}"
    now = time.time()
    if cache_key in _BENCHMARK_CACHE:
        ts, rows = _BENCHMARK_CACHE[cache_key]
        if now - ts < CACHE_TTL_SECONDS:
            return rows

    headers = {"User-Agent": "EulerFold-AI/1.0"}
    token = settings.HF_API_TOKEN or os.getenv("HF_API_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    base_api = _get_api_base_url()
    if not base_api:
        logger.warning("[Diagnostic] Benchmark API endpoint not configured.")
        return []

    url = f"{base_api}?dataset={dataset}&config={config}&split={split}&limit={limit}&offset={offset}"
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                rows = [r.get("row") for r in data.get("rows", []) if r.get("row")]
                if rows:
                    _BENCHMARK_CACHE[cache_key] = (now, rows)
                    logger.info(f"[Diagnostic] Fetched and cached {len(rows)} benchmark rows (offset={offset})")
                return rows
            else:
                logger.warning(f"[Diagnostic] Benchmark endpoint returned HTTP {response.status_code}")
    except Exception as e:
        logger.warning(f"[Diagnostic] Failed to fetch benchmark rows: {e}")
    return []


# ── AI Classifier ──────────────────────────────────────────────────────────────

async def classify_assessment_strategy_via_ai(
    target_role: str,
    known_skills: str,
    model_to_use: Optional[str] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """Uses AI to match the role and prior experience to an assessment category."""
    role_normalized = (target_role or "").strip().lower()
    if role_normalized in CATEGORY_DESCRIPTIONS:
        logger.info(f"[Diagnostic] Exact role match to category '{role_normalized}' without AI call.")
        return {
            "domain": role_normalized,
            "category": role_normalized,
            "search_keywords": [role_normalized],
        }

    logger.info(f"[Diagnostic] 1. Classifying assessment category via AI | target_role='{target_role}' | known_skills='{known_skills}'")

    category_lines = "\n".join([f"- {k}: {v}" for k, v in CATEGORY_DESCRIPTIONS.items()])

    prompt = f"""You are an expert psychometric assessment classifier.
Analyze the target role and learner skills, then match them to the SINGLE BEST category key from the allowed list:

Allowed Categories:
{category_lines}

Target Role: "{target_role}"
Learner's Known Skills: "{known_skills}"

CRITICAL:
- "category" MUST be one of the exact allowed keys from the list above.
- You must choose the category that fits "{target_role}". Do NOT default to computer science unless the role is genuinely about computer science.

Return JSON ONLY in this format:
{{
  "domain": "<high-level domain name>",
  "category": "<the exact matching key from Allowed Categories>",
  "search_keywords": ["keyword1", "keyword2"]
}}"""

    try:
        model = model_to_use or settings.DEFAULT_ROADMAP_MODEL
        response_text, usage = await generate_text(prompt, model=model, response_mime_type="application/json", return_usage=True)
        if user_id:
            try:
                from app.core.supabase_client import get_supabase_client
                from app.utils.ai_client import log_backend_ai_usage
                sb = get_supabase_client()
                log_backend_ai_usage(sb, user_id, f"Diagnostic Assessment Classification: {target_role}", usage, source="backend")
            except Exception as log_err:
                logger.warning(f"Failed to log classification AI usage: {log_err}")
        res = robust_json_loads(response_text)

        category = res.get("category", "")
        if category not in CATEGORY_DESCRIPTIONS:
            # Try fuzzy match against category keys
            matched = next((k for k in CATEGORY_DESCRIPTIONS if k in role_normalized or role_normalized in k), "college_computer_science")
            logger.warning(f"[Diagnostic] AI returned invalid category '{category}', resolved to '{matched}'")
            category = matched

        logger.info(f"[Diagnostic] 2. AI selected category: '{category}' | domain: '{res.get('domain')}'")
        return {
            "domain": res.get("domain", category),
            "category": category,
            "search_keywords": res.get("search_keywords", []),
        }
    except Exception as e:
        logger.error(f"[Diagnostic] AI assessment classification failed: {e}")
        matched = next((k for k in CATEGORY_DESCRIPTIONS if k in role_normalized or role_normalized in k), "college_computer_science")
        return {
            "domain": matched,
            "category": matched,
            "search_keywords": [],
        }


# ── Conciseness filter ─────────────────────────────────────────────────────────

def is_concise_candidate(normalized: Dict[str, Any], max_len: int = 240, schema: str = "standard_mcq") -> bool:
    """Returns True if the normalized question is clean and readable."""
    q = normalized.get("question", "")
    choices = normalized.get("choices", [])
    if not (15 <= len(q) <= max_len):
        return False
    if "°" in q or "Consider the following" in q:
        return False
    
    # For standard text benchmarks, reject multiple paragraphs or markdown code fences unless code-specific
    if schema != "target_scored_mcq":
        if "\n\n" in q or "```" in q:
            return False
            
    if not (isinstance(choices, list) and len(choices) == 4):
        return False
    if any(len(str(c).strip()) > 150 or len(str(c).strip()) == 0 for c in choices):
        return False
    return True


# ── Main quiz generator ────────────────────────────────────────────────────────

async def generate_progressive_diagnostic_quiz(
    target_role: str,
    known_skills: str,
    question_count: int = 10,
    pre_resolved_category: Optional[str] = None,
    pre_resolved_dataset: Optional[str] = None,
    pre_resolved_config: Optional[str] = None,
    pre_resolved_domain: Optional[str] = None,
    pre_resolved_keywords: Optional[List[str]] = None,
    model: Optional[str] = None,
    user_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generates a progressive diagnostic quiz sourced from curated academic assessment benchmarks.
    """
    role_normalized = (target_role or "").strip().lower()

    # Step 1: Resolve category
    category = None
    search_keywords = pre_resolved_keywords or []
    domain = pre_resolved_domain or "Technical Assessment"

    # Direct match takes precedence over frontend hallucinations
    if role_normalized in CATEGORY_DESCRIPTIONS:
        category = role_normalized
        logger.info(f"[Diagnostic] 1. Exact role match to category: '{category}'")
    elif any(term in role_normalized for term in ["mechanical engineer", "mechanical engineering", "aerospace engineer", "civil engineer", "robotics engineer"]):
        category = "mechanical_engineering"
        domain = "Mechanical Engineering"
        logger.info(f"[Diagnostic] 1. Role identified as physical engineering: '{category}'")
    elif (
        pre_resolved_category
        and pre_resolved_category in CATEGORY_DESCRIPTIONS
        # Reject obvious mismatches (e.g. college_computer_science passed for humanities/science roles)
        and not (
            any(w in role_normalized for w in ["philosophy", "ethics", "history", "biology", "medicine", "chemistry", "physics", "law", "accounting", "mechanical"])
            and pre_resolved_category in ("college_computer_science", "high_school_computer_science", "science_inquiry")
        )
    ):
        category = pre_resolved_category
        logger.info(f"[Diagnostic] 1. Using pre-resolved assessment category: '{category}'")
    else:
        strategy = await classify_assessment_strategy_via_ai(target_role, known_skills, model_to_use=model, user_id=user_id)
        category = strategy["category"]
        search_keywords = strategy.get("search_keywords", [])
        domain = strategy.get("domain", "Technical Skills")

    dataset, config, schema, split, total_rows = _resolve_category_target(category)

    # Step 2: Fetch rows
    logger.info(f"[Diagnostic] 3. Fetching assessment items for category='{category}'...")
    if category == "mechanical_engineering":
        # Pool comprehensive engineering: college physics (mechanics/thermodynamics), physics fundamentals, and electrical fundamentals
        phys_rows, hs_phys_rows, ee_rows = await asyncio.gather(
            fetch_benchmark_rows("cais/mmlu", "college_physics", "test", limit=100),
            fetch_benchmark_rows("cais/mmlu", "high_school_physics", "test", limit=100),
            fetch_benchmark_rows("cais/mmlu", "electrical_engineering", "test", limit=100),
        )
        raw_rows = phys_rows + hs_phys_rows + ee_rows
        if not search_keywords:
            search_keywords = ["mechanics", "force", "acceleration", "thermodynamic", "heat", "torque", "kinetic", "stress", "strain", "pressure", "work", "momentum", "friction"]
    elif schema == "multi_option_mcq" and total_rows:
        offsets = random.sample(range(0, total_rows - 100, 100), min(3, (total_rows - 100) // 100))
        tasks = [fetch_benchmark_rows(dataset, config, split, limit=100, offset=o) for o in offsets]
        results = await asyncio.gather(*tasks)
        for r in results:
            raw_rows.extend(r)
    else:
        raw_rows = await fetch_benchmark_rows(dataset, config, split, limit=100)

    # Step 3: Fallback if empty
    if not raw_rows:
        logger.warning(f"[Diagnostic] Empty rows for category '{category}'. Falling back to default baseline.")
        dataset, config, schema, split, _ = _resolve_category_target("college_computer_science")
        raw_rows = await fetch_benchmark_rows(dataset, config, split, limit=100)

    # Step 4: Normalize rows
    keywords_lower = [k.lower() for k in search_keywords if len(k) > 2]
    candidates = []
    seen_questions = set()

    max_p1 = 500 if schema == "target_scored_mcq" else 240
    for raw in raw_rows:
        normalized = normalize_row(raw, schema)
        if not normalized:
            continue
        q_text = normalized["question"]
        if q_text in seen_questions:
            continue
        if not is_concise_candidate(normalized, max_len=max_p1, schema=schema):
            continue
        seen_questions.add(q_text)
        q_lower = q_text.lower()
        is_relevant = any(k in q_lower for k in keywords_lower) if keywords_lower else True
        candidates.append({**normalized, "is_keyword_match": is_relevant})

    # Pass 2: if short, relax length further
    if len(candidates) < question_count:
        max_p2 = 800 if schema == "target_scored_mcq" else 360
        for raw in raw_rows:
            normalized = normalize_row(raw, schema)
            if not normalized:
                continue
            if normalized["question"] in seen_questions:
                continue
            if not is_concise_candidate(normalized, max_len=max_p2, schema=schema):
                continue
            seen_questions.add(normalized["question"])
            q_lower = normalized["question"].lower()
            candidates.append({**normalized, "is_keyword_match": any(k in q_lower for k in keywords_lower) if keywords_lower else True})

    logger.info(f"[Diagnostic] 4. Prepared {len(candidates)} candidate questions (keyword matches: {sum(1 for c in candidates if c['is_keyword_match'])})")

    # Prioritize keyword matches, then shuffle within each group for variety
    keyword_matches = [c for c in candidates if c["is_keyword_match"]]
    non_matches = [c for c in candidates if not c["is_keyword_match"]]
    random.shuffle(keyword_matches)
    random.shuffle(non_matches)
    ordered = (keyword_matches + non_matches)[:question_count]

    # Step 5: Build quiz questions with tier ladder
    quiz_questions = []
    for idx, c in enumerate(ordered):
        t_idx = min((idx * len(PROGRESSIVE_TIERS)) // max(len(ordered), 1), len(PROGRESSIVE_TIERS) - 1)
        tier_info = PROGRESSIVE_TIERS[t_idx]
        quiz_questions.append({
            "id": f"q{idx + 1}",
            "difficulty_tier": tier_info["name"],
            "tier_number": tier_info["tier"],
            "question": c["question"],
            "options": c["choices"],
            "correct_answer_index": c["answer_idx"],
            "explanation": "Standardized benchmark question.",
            "source": "benchmark"
        })

    logger.info(f"[Diagnostic] 5. Ready — serving {len(quiz_questions)} benchmark assessment questions for '{category}'")
    return quiz_questions
