"""
Curated Question Bank Service
Pure Semantic Vector Retrieval using pgvector (curated_questions table)
and Cohere Embed v3 (1024 dimensions).
No ad-hoc token matching or manual filters.
"""

import os
import json
import random
import logging
import httpx
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict
from pathlib import Path
from app.core.config import settings
from app.core.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

COHERE_URL = "https://api.cohere.com/v1/embed"

_DATASET_CACHE: Dict[str, Dict[str, Any]] = {}

def _get_dataset_cache() -> Dict[str, Dict[str, Any]]:
    global _DATASET_CACHE
    if _DATASET_CACHE:
        return _DATASET_CACHE
    try:
        # Search parent folders for datasets/eulerfold_questions_bank.jsonl
        backend_dir = Path(__file__).resolve().parent.parent.parent
        possible_paths = [
            backend_dir.parent / "datasets" / "eulerfold_questions_bank.jsonl",
            backend_dir / "datasets" / "eulerfold_questions_bank.jsonl",
            Path("datasets/eulerfold_questions_bank.jsonl")
        ]
        dataset_path = None
        for p in possible_paths:
            if p.exists():
                dataset_path = p
                break

        if dataset_path:
            with open(dataset_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line:
                        d = json.loads(line)
                        qid = d.get("id")
                        if qid:
                            gt_ans = d.get("ground_truth_answer")
                            if not gt_ans and d.get("public_tests") and len(d["public_tests"]) > 0:
                                gt_ans = d["public_tests"][0].get("output", "")

                            py_sol = d.get("solutions", {}).get("python") if isinstance(d.get("solutions"), dict) else ""
                            sol = d.get("solution") or (f"```python\n{py_sol}\n```" if py_sol else "") or d.get("explanation", "")

                            _DATASET_CACHE[qid] = {
                                "format": d.get("format") or ("open_ended" if not d.get("options") else "mcq"),
                                "ground_truth_answer": gt_ans,
                                "solution": sol,
                            }
            logger.info(f"Loaded {len(_DATASET_CACHE)} questions into question_bank_service cache.")
    except Exception as e:
        logger.warning(f"Could not load questions dataset cache: {e}")
    return _DATASET_CACHE

def _get_momentum_distribution(num_questions: int = 18) -> List[Tuple[str, str, int]]:
    """
    Defines the momentum progression curve (reverse distribution):
    1. Warm-up (easy) - 6 questions
    2. Core Mechanics (medium) - 5 questions
    3. Edge Cases (medium-hard) - 4 questions
    4. Capstone Mastery (hard) - 3 questions
    Total = 18 questions
    """
    return [
        ("Warm-up", "easy", 6),
        ("Core Mechanics", "medium", 5),
        ("Edge Cases", "medium-hard", 4),
        ("Capstone Mastery", "hard", 3),
    ]

def _compute_query_embedding(query_text: str, max_retries: int = 3) -> Optional[List[float]]:
    """
    Computes a 1024-dimensional semantic embedding for the query using Cohere Embed v3.
    Uses input_type='search_query' for asymmetric semantic search against document vectors.
    """
    if not settings.COHERE_API_KEY:
        logger.warning("COHERE_API_KEY is not configured for semantic question matching.")
        return None

    headers = {
        "Authorization": f"Bearer {settings.COHERE_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "texts": [query_text],
        "model": "embed-english-v3.0",
        "input_type": "search_query"
    }

    import time
    for attempt in range(max_retries):
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(COHERE_URL, headers=headers, json=payload)
                if res.status_code == 200:
                    embs = res.json().get("embeddings", [])
                    if embs:
                        return embs[0]
                elif res.status_code == 429:
                    time.sleep(1.5 * (attempt + 1))
                else:
                    logger.warning(f"Cohere embedding returned status {res.status_code}")
                    break
        except Exception as e:
            logger.error(f"Error computing query embedding (attempt {attempt+1}): {e}")
            time.sleep(1.0)

    return None

def find_momentum_practice_questions(
    subject: Optional[str] = None,  # Not used for matching
    module_title: Optional[str] = None,
    topics: Optional[List[str]] = None,
    learning_objectives: Optional[str] = None,
    subtopic_name: Optional[str] = None,
    num_questions: int = 18,
    min_similarity_threshold: float = 0.28
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Pure Semantic Vector Retrieval:
    1. Embeds module title, subtopics, and learning objectives into a 1024-dim query vector.
    2. Runs cosine similarity search against Supabase pgvector (match_curated_questions).
    3. Orders the matched questions along the 4-stage Momentum Progression Curve.
    4. Returns empty if semantic similarity is below threshold to trigger dynamic AI synthesis.
    """

    # 1. Build semantic search context centered strictly on module subtopics and learning objectives
    query_parts = []
    if module_title:
        query_parts.append(f"Module: {module_title}")
    if topics and len(topics) > 0:
        query_parts.append(f"Module Subtopics: {', '.join(topics)}")
    if learning_objectives:
        query_parts.append(f"Learning Objectives: {learning_objectives}")
    if subtopic_name and subtopic_name not in (topics or []):
        query_parts.append(f"Topic: {subtopic_name}")

    search_query = "\n".join(query_parts)

    # 2. Compute query embedding
    query_vector = _compute_query_embedding(search_query)
    if not query_vector:
        return [], {"matched_count": 0, "source": "no_query_embedding"}

    # 3. Query pgvector via Supabase RPC
    try:
        sb = get_supabase_client()
        rpc_res = sb.rpc("match_curated_questions", {
            "query_embedding": query_vector,
            "match_threshold": min_similarity_threshold,
            "match_count": max(40, num_questions * 3)
        }).execute()

        matches = rpc_res.data or []

        if len(matches) < num_questions:
            logger.info(
                f"pgvector returned {len(matches)} matches (below target {num_questions}) for '{module_title or 'module'}'. "
                "Delegating to dynamic curriculum generation."
            )
            return [], {"matched_count": len(matches), "source": "insufficient_similarity_matches"}

        cache = _get_dataset_cache()

        # 4. Partition top semantic matches by difficulty
        by_diff = defaultdict(list)
        for q in matches:
            diff = (q.get("difficulty") or "medium").lower()
            if diff in ["easy"]:
                by_diff["easy"].append(q)
            elif diff in ["medium"]:
                by_diff["medium"].append(q)
            elif diff in ["medium-hard"]:
                by_diff["medium-hard"].append(q)
            elif diff in ["hard", "olympiad"]:
                by_diff["hard"].append(q)
            else:
                by_diff["medium"].append(q)

        # 5. Assemble along cognitive momentum progression
        momentum_slots = _get_momentum_distribution(num_questions)
        selected_questions: List[Dict[str, Any]] = []
        used_ids = set()

        tier_fallback_order = {
            "easy": ["easy", "medium", "medium-hard", "hard"],
            "medium": ["medium", "easy", "medium-hard", "hard"],
            "medium-hard": ["medium-hard", "medium", "hard", "easy"],
            "hard": ["hard", "medium-hard", "medium", "easy"],
        }

        for stage_name, target_diff, slot_count in momentum_slots:
            stage_picked = []
            preferred_tiers = tier_fallback_order[target_diff]

            for tier in preferred_tiers:
                pool = [item for item in by_diff[tier] if item["id"] not in used_ids]
                # Preserve top semantic rank while adding slight local shuffle
                top_pool = pool[:max(6, slot_count * 2)]
                random.shuffle(top_pool)

                while top_pool and len(stage_picked) < slot_count:
                    item = top_pool.pop()
                    if item["id"] not in used_ids:
                        used_ids.add(item["id"])
                        stage_picked.append((item, stage_name))

                if len(stage_picked) >= slot_count:
                    break

            for q_item, s_name in stage_picked:
                raw_meta = cache.get(q_item["id"], {})
                format_val = q_item.get("format") or raw_meta.get("format") or ("open_ended" if not q_item.get("options") else "mcq")
                gt_ans = q_item.get("ground_truth_answer") or raw_meta.get("ground_truth_answer")
                sol_val = q_item.get("solution") or raw_meta.get("solution") or q_item.get("explanation", "")

                formatted_q = {
                    "id": q_item["id"],
                    "question": q_item["question"],
                    "options": q_item.get("options") or [],
                    "correct_answer_index": q_item.get("correct_answer_index", -1),
                    "explanation": q_item.get("explanation", "") or sol_val,
                    "difficulty": q_item.get("difficulty", target_diff),
                    "momentum_stage": s_name,
                    "concepts_tested": q_item.get("concepts_tested") or [],
                    "misconception_map": q_item.get("misconception_map") or {},
                    "subtopic": q_item.get("subtopic", ""),
                    "format": format_val,
                    "ground_truth_answer": gt_ans,
                    "solution": sol_val,
                    "source": "curated_questions_pgvector"
                }
                selected_questions.append(formatted_q)

        def _format_q(item: dict, stage: str, diff: str) -> dict:
            raw_meta = cache.get(item["id"], {})
            format_val = item.get("format") or raw_meta.get("format") or ("open_ended" if not item.get("options") else "mcq")
            gt_ans = item.get("ground_truth_answer") or raw_meta.get("ground_truth_answer")
            sol_val = item.get("solution") or raw_meta.get("solution") or item.get("explanation", "")

            return {
                "id": item["id"],
                "question": item["question"],
                "options": item.get("options") or [],
                "correct_answer_index": item.get("correct_answer_index", -1),
                "explanation": item.get("explanation", "") or sol_val,
                "difficulty": item.get("difficulty", diff),
                "momentum_stage": stage,
                "concepts_tested": item.get("concepts_tested") or [],
                "misconception_map": item.get("misconception_map") or {},
                "subtopic": item.get("subtopic", ""),
                "format": format_val,
                "ground_truth_answer": gt_ans,
                "solution": sol_val,
                "source": "curated_questions_pgvector"
            }

        pool_by_stage = {
            "Warm-up": [_format_q(item, "Warm-up", "easy") for item in by_diff["easy"]],
            "Core Mechanics": [_format_q(item, "Core Mechanics", "medium") for item in by_diff["medium"]],
            "Edge Cases": [_format_q(item, "Edge Cases", "medium-hard") for item in by_diff["medium-hard"]],
            "Capstone Mastery": [_format_q(item, "Capstone Mastery", "hard") for item in by_diff["hard"]],
        }

        if len(selected_questions) >= num_questions:
            top_match = matches[0]
            top_sim = top_match.get("similarity", 0)
            logger.info(
                f"Supabase pgvector matched {len(selected_questions)} questions for '{module_title or 'module'}' "
                f"(top subtopic: {top_match.get('subtopic')}, sim: {top_sim:.2f})"
            )
            return selected_questions[:num_questions], {
                "matched_count": len(matches),
                "selected_count": len(selected_questions),
                "source": "curated_questions_pgvector",
                "top_similarity": top_sim,
                "top_subtopic": top_match.get("subtopic"),
                "pool": pool_by_stage
            }

        return [], {"matched_count": len(matches), "source": "insufficient_slots"}

    except Exception as e:
        logger.error(f"Error executing match_curated_questions RPC: {e}")
        return [], {"matched_count": 0, "source": f"error: {str(e)}"}
