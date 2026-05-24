from typing import List, Dict, Any, Optional

def calculate_confidence_score_formula(
    pow_score: float, 
    practice_score: float, 
    topic_completion: float, 
    depth_score: float, 
    time_invested: float, 
    benchmark_hours: float
) -> float:
    """
    Calculates 0-100 confidence score for a skill.
    Weights (aligned with UI):
    - 40% Homework
    - 30% Practice Score
    - 15% Topic Completion
    - 15% Concept Depth
    """
    # Clamp inputs to 1.0 to ensure math integrity
    p_score = min(max(pow_score, 0.0), 1.0)
    pr_score = min(max(practice_score, 0.0), 1.0)
    tc_score = min(max(topic_completion, 0.0), 1.0)
    d_score = min(max(depth_score, 0.0), 1.0)

    pow_val = p_score * 40
    prac_val = pr_score * 30
    comp_val = tc_score * 15
    depth_val = d_score * 15
    
    score = round(pow_val + prac_val + comp_val + depth_val, 1)
    return min(score, 100.0)

def get_letter_grade(score: float) -> str:
    """
    Maps 0-100 score to detailed letter grades.
    Scale:
    A+: 97-100, A: 93-96, A-: 90-92
    B+: 87-89, B: 83-86, B-: 80-82
    C+: 77-79, C: 73-76, C-: 70-72
    D+: 67-69, D: 63-66, D-: 60-62
    F: Below 60
    """
    if score >= 97: return "A+"
    if score >= 93: return "A"
    if score >= 90: return "A-"
    if score >= 87: return "B+"
    if score >= 83: return "B"
    if score >= 80: return "B-"
    if score >= 77: return "C+"
    if score >= 73: return "C"
    if score >= 70: return "C-"
    if score >= 67: return "D+"
    if score >= 63: return "D"
    if score >= 60: return "D-"
    return "F"

def calculate_composite_score(
    avg_confidence: float, 
    roadmaps_count: int, 
    practice_score: float, 
    streak: int,
    avg_assessment: float = 0.0
) -> float:
    """
    Calculates 0-100 score for leaderboard ranking.
    """
    roadmaps_pts = min(roadmaps_count * 20, 100)
    streak_pts = min(streak * 2, 100)
    
    score = (avg_confidence * 0.3) + (avg_assessment * 0.2) + (roadmaps_pts * 0.25) + (practice_score * 0.15) + (streak_pts * 0.1)
    return round(score, 1)
