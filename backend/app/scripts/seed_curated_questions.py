"""
Seed Curated Questions Script
Precomputes Cohere Embed v3 (1024-dim) embeddings for all 10,017 questions
and stores them into Supabase Postgres pgvector (curated_questions table).
"""

import os
import sys
import json
import time
import httpx
import logging
from typing import List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend root is in python path
backend_root = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_root))
load_dotenv(backend_root / ".env")

from app.core.config import settings
from app.core.supabase_client import get_admin_supabase_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATASET_PATH = backend_root.parent / "datasets" / "eulerfold_questions_bank.jsonl"
CHECKPOINT_PATH = backend_root.parent / "datasets" / "seed_progress.json"

BATCH_SIZE = 96
COHERE_URL = "https://api.cohere.com/v1/embed"

def format_embedding_text(q: Dict[str, Any]) -> str:
    domain = q.get("domain", "")
    subject = q.get("subject", "")
    subtopic = q.get("subtopic", "")
    concepts = ", ".join(q.get("concepts_tested", []))
    question = q.get("question", "")
    
    parts = []
    if domain or subject or subtopic:
        parts.append(f"{domain} > {subject} > {subtopic}")
    if concepts:
        parts.append(f"Tested Concepts: {concepts}")
    parts.append(f"Question: {question}")
    return "\n".join(parts)

def get_cohere_embeddings(texts: List[str], api_key: str, max_retries: int = 15) -> List[List[float]]:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "texts": texts,
        "model": "embed-english-v3.0",
        "input_type": "search_document"
    }
    
    for attempt in range(max_retries):
        try:
            with httpx.Client(timeout=30.0) as client:
                res = client.post(COHERE_URL, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("embeddings", [])
                elif res.status_code == 429:
                    wait_time = 12 + attempt * 2
                    logger.warning(f"Rate limited (429). Backing off {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"Cohere error {res.status_code}: {res.text[:200]}")
                    time.sleep(2)
        except Exception as e:
            logger.error(f"HTTP attempt {attempt+1} failed: {e}")
            time.sleep(2)
            
    raise RuntimeError("Failed to obtain embeddings from Cohere after multiple retries.")

def load_checkpoint() -> set:
    if CHECKPOINT_PATH.exists():
        try:
            with open(CHECKPOINT_PATH, "r") as f:
                data = json.load(f)
                return set(data.get("completed_ids", []))
        except Exception as e:
            logger.warning(f"Could not read checkpoint: {e}")
    return set()

def save_checkpoint(completed_ids: set):
    try:
        with open(CHECKPOINT_PATH, "w") as f:
            json.dump({"completed_ids": list(completed_ids), "total": len(completed_ids)}, f)
    except Exception as e:
        logger.error(f"Could not save checkpoint: {e}")

def main():
    if not settings.COHERE_API_KEY:
        logger.error("COHERE_API_KEY is not configured in .env")
        sys.exit(1)

    admin_sb = get_admin_supabase_client()

    logger.info(f"Loading question bank from {DATASET_PATH}...")
    if not DATASET_PATH.exists():
        logger.error(f"File not found: {DATASET_PATH}")
        sys.exit(1)

    all_questions = []
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                all_questions.append(json.loads(line))

    total_questions = len(all_questions)
    logger.info(f"Loaded {total_questions} questions.")

    completed_ids = load_checkpoint()
    logger.info(f"Already seeded {len(completed_ids)} questions according to checkpoint.")

    pending_questions = [q for q in all_questions if q.get("id") not in completed_ids]
    logger.info(f"Pending questions to process: {len(pending_questions)}")

    if not pending_questions:
        logger.info("All questions already seeded!")
        return

    # Process in batches
    num_batches = (len(pending_questions) + BATCH_SIZE - 1) // BATCH_SIZE
    start_time = time.time()

    for b_idx in range(num_batches):
        batch = pending_questions[b_idx * BATCH_SIZE : (b_idx + 1) * BATCH_SIZE]
        texts = [format_embedding_text(q) for q in batch]

        t0 = time.time()
        embeddings = get_cohere_embeddings(texts, settings.COHERE_API_KEY)
        t_embed = time.time() - t0

        # Build Supabase rows
        rows = []
        for q, emb in zip(batch, embeddings):
            row = {
                "id": q["id"],
                "domain": q.get("domain", "general"),
                "subtopic": q.get("subtopic"),
                "subject": q.get("subject"),
                "difficulty": q.get("difficulty", "medium"),
                "momentum_stage": q.get("momentum_stage") or "Core Mechanics",
                "question": q.get("question", ""),
                "options": q.get("options", []),
                "correct_answer_index": q.get("correct_index", 0),
                "explanation": q.get("explanation", ""),
                "concepts_tested": q.get("concepts_tested", []),
                "misconception_map": json.loads(q.get("misconception_map")) if isinstance(q.get("misconception_map"), str) else (q.get("misconception_map") or {}),
                "source": q.get("dataset_source", "eulerfold-benchmark"),
                "question_embedding": emb
            }
            rows.append(row)

        t1 = time.time()
        admin_sb.table("curated_questions").upsert(rows).execute()
        t_db = time.time() - t1

        for q in batch:
            completed_ids.add(q["id"])

        save_checkpoint(completed_ids)

        elapsed = time.time() - start_time
        processed = len(completed_ids)
        rate = (b_idx + 1) * BATCH_SIZE / elapsed if elapsed > 0 else 0
        remaining_sec = (total_questions - processed) / rate if rate > 0 else 0

        logger.info(
            f"Batch {b_idx + 1}/{num_batches} done "
            f"({len(batch)} items in {t_embed:.2f}s embed + {t_db:.2f}s db) | "
            f"Total: {processed}/{total_questions} ({processed*100/total_questions:.1f}%) | "
            f"ETA: {remaining_sec/60:.1f}m"
        )

        # Smooth pacing to stay well within Cohere rate limit window
        time.sleep(3.5)

    logger.info("Seeding completed successfully!")

if __name__ == "__main__":
    main()
