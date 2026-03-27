import logging
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request, Depends, Query
from app.core.config import settings
from app.core.supabase_client import get_supabase_client
from app.schemas import CoinBalance, Transaction, LeaderboardEntry, LeaderboardResponse, User
from app.core.auth import get_current_user
from app.routers.optional_auth import get_optional_current_user
from app.utils.scoring import calculate_composite_score

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/coins", tags=["coins"])

@router.get("/balance", response_model=CoinBalance)
async def get_coin_balance(current_user: User = Depends(get_current_user)):
    """Get current user's EulerCoin balance and recent transactions."""
    email = current_user.email.lower()
    sb = get_supabase_client()
    
    try:
        prof_res = sb.table("profiles").select("eulercoins").ilike("email", email).execute()
        balance = prof_res.data[0].get("eulercoins", 0) if prof_res.data else 0
        
        tx_res = sb.table("eulercoin_transactions") \
            .select("amount, reason, created_at") \
            .ilike("user_email", email) \
            .order("created_at", desc=True) \
            .limit(10) \
            .execute()
        
        transactions = [Transaction(**tx) for tx in tx_res.data]
        return CoinBalance(balance=balance, transactions=transactions)
    except Exception as e:
        logger.error(f"Failed to fetch coin balance for {email}: {e}")
        # Return 0 balance on schema cache errors or missing table/columns
        return CoinBalance(balance=0, transactions=[])

@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    category: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Get redesigned leaderboard with composite scoring.
    Now fully powered by an enhanced Supabase Materialized View for maximum performance.
    """
    sb = get_supabase_client()
    
    # 1. Fetch top users from Materialized View
    query = sb.table("leaderboard_rankings") \
        .select("*") \
        .order("rank") \
        .limit(100)
    
    if category and category != "All":
        query = query.eq("top_skill_category", category)
        
    mv_res = query.execute()
    
    if not mv_res.data:
        return LeaderboardResponse(top_users=[], user_rank=None)

    def format_name(email, display_name):
        if display_name:
            parts = display_name.strip().split(' ')
            if len(parts) > 1 and parts[1]:
                return f"{parts[0]} {parts[1][0]}."
            return parts[0]
        return email.split("@")[0].capitalize() if email else "Anonymous"

    entries = []
    for u in mv_res.data:
        entries.append(LeaderboardEntry(
            author=format_name(u.get("email"), u.get("display_name")),
            username=u["username"],
            composite_score=float(u["composite_score"]), 
            top_skill=u.get("top_skill_name"),
            top_skill_score=u.get("top_skill_score") or 0.0,
            roadmaps_completed=u.get("roadmaps_count") or 0,
            rank=u["rank"],
            is_me=(u["id"] == current_user.supabase_uid) if current_user else False,
            eulercoins=u.get("eulercoins") or 0,
            current_streak=u.get("streak") or 0,
            roadmaps_shared=0
        ))

    # 3. Handle user_rank
    user_rank_entry = None
    if current_user:
        # Check if already in top_users
        for e in entries:
            if e.is_me:
                user_rank_entry = e
                break
        
        if not user_rank_entry:
            # Fetch complete data from Materialized View for the specific user
            me_res = sb.table("leaderboard_rankings") \
                .select("*") \
                .eq("id", current_user.supabase_uid) \
                .maybe_single() \
                .execute()
            
            if me_res.data:
                u = me_res.data
                user_rank_entry = LeaderboardEntry(
                    author=format_name(u.get("email"), u.get("display_name")),
                    username=u["username"],
                    composite_score=float(u["composite_score"]),
                    rank=u["rank"],
                    is_me=True,
                    eulercoins=u.get("eulercoins") or 0,
                    current_streak=u.get("streak") or 0,
                    top_skill=u.get("top_skill_name"),
                    top_skill_score=u.get("top_skill_score") or 0.0,
                    roadmaps_completed=u.get("roadmaps_count") or 0,
                    roadmaps_shared=0
                )

    return LeaderboardResponse(top_users=entries, user_rank=user_rank_entry)
