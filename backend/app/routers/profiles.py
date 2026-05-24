import logging
import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from io import BytesIO
from datetime import datetime, timedelta
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader

from app.core.supabase_client import get_supabase_client, get_admin_supabase_client
from app.core.auth import get_current_user
from app.schemas import PublicProfile, UserSkill, PracticeStats, User, DiscussionRead, MCQSessionRead

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/profile/me", response_model=PublicProfile)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Fetch the profile of the currently authenticated user.
    """
    sb = get_supabase_client()
    
    # 1. Fetch Profile by email (current_user has email)
    p_res = sb.table("profiles").select("*").eq("email", current_user.email).maybe_single().execute()
    if not p_res or not p_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Use the existing logic by calling get_public_profile with the username
    return await get_public_profile(p_res.data["username"])

@router.delete("/profile/me")
async def delete_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Permanently purge the user's intelligence (account, roadmaps, skills, etc.).
    """
    uid = current_user.supabase_uid
    email = current_user.email
    if not uid:
        raise HTTPException(status_code=400, detail="User UID not found")

    sb = get_supabase_client()
    admin_sb = get_admin_supabase_client()

    try:
        # 1. Find all roadmaps for the user
        r_res = sb.table("roadmaps").select("id").eq("email", email).execute()
        roadmap_ids = [r["id"] for r in r_res.data] if r_res.data else []

        # 2. Cleanup skills for each roadmap (updates technical identity before deletion)
        from app.services.skills_service import cleanup_skills_after_roadmap_deletion
        for rid in roadmap_ids:
            try:
                await cleanup_skills_after_roadmap_deletion(rid, uid)
            except Exception as e:
                logger.error(f"Error cleaning skills for roadmap {rid}: {e}")

        # 3. Explicitly delete coin transactions by email (in case not linked to roadmaps)
        sb.table("eulercoin_transactions").delete().eq("user_email", email).execute()

        # 4. Delete the user from auth.users (Cascades to profiles, roadmaps, submissions, module_progress, user_skills)
        # Note: Requires the migration 20260313130000_cascade_deletes.sql to be applied for full cascade.
        admin_sb.auth.admin.delete_user(uid)
        
        logger.info(f"Successfully purged account for user {email} (UID: {uid})")
        return {"status": "ok", "message": "Account and all associated data purged successfully."}

    except Exception as e:
        logger.error(f"Failed to purge account for {email}: {e}")
        raise HTTPException(status_code=500, detail=f"Account purge failed: {str(e)}")

@router.patch("/profile/avatar")
async def update_avatar(avatar_url: str = Query(...), current_user: User = Depends(get_current_user)):
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    
    result = sb.table("profiles").update({"avatar_url": avatar_url}).eq("supabase_uid", uid).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update avatar")
    
    return {"status": "success", "avatar_url": avatar_url}

@router.get("/profile/{username}", response_model=PublicProfile)
async def get_public_profile(username: str):
    sb = get_supabase_client()
    
    # 1. Fetch Profile
    p_res = sb.table("profiles").select("*").eq("username", username).maybe_single().execute()
    if not p_res:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile = p_res.data
    uid = profile["supabase_uid"]
    
    # 2. Fetch User Skills joined with Canonical Skills
    us_res = sb.table("user_skills").select("*, canonical_skills(name, category, benchmark_hours)").eq("user_id", uid).order("confidence_score", desc=True).execute()
    
    from app.utils.scoring import calculate_confidence_score_formula
    
    skills = []
    for us in us_res.data:
        cs = us.get("canonical_skills", {})
        
        # Real-time recalculation based on clamped signals to ensure UI consistency (Sum of displayed marks)
        real_time_score = calculate_confidence_score_formula(
            us["pow_score"],
            us["practice_score"],
            us["topic_completion"],
            us["depth_score"],
            us["time_invested"],
            cs.get("benchmark_hours", 10.0)
        )
        
        skills.append(UserSkill(
            id=us["id"],
            canonical_skill_id=us["canonical_skill_id"],
            name=cs.get("name"),
            category=cs.get("category"),
            confidence_score=real_time_score, # Fixed value
            tier=us["tier"],
            pow_score=us["pow_score"],
            practice_score=us["practice_score"],
            topic_completion=us["topic_completion"],
            depth_score=us["depth_score"],
            time_invested=us["time_invested"],
            last_updated=us["last_updated"]
        ))
    
    # 3. Fetch Contributing Roadmaps & Total Roadmap Count
    contributing_ids = set()
    for us in us_res.data:
        for rid in us.get("contributing_roadmap_ids", []):
            contributing_ids.add(rid)
            
    # Count ALL roadmaps owned by the user
    user_email = profile.get("email")
    total_r_res = sb.table("roadmaps").select("id", count="exact").eq("email", user_email).execute()
    total_roadmaps_count = total_r_res.count if total_r_res.count is not None else 0

    roadmaps_data = []
    if contributing_ids:
        r_res = sb.table("roadmaps").select("id, title, created_at, updated_at, depth_score, roadmap_plan").in_("id", list(contributing_ids)).execute()
        roadmaps_data = r_res.data

    # 4. Fetch Proof of Work (Verified only) - Include Solid and Developing
    subs_data = []
    review_precision = 0.0
    user_email = profile.get("email")
    if user_email:
        # Fetch ALL submissions for this user to calculate precision
        all_s_res = sb.table("submissions").select("evaluation_level").eq("user_email", user_email).execute()
        if all_s_res.data:
            total_subs = len(all_s_res.data)
            solid_subs = len([s for s in all_s_res.data if s.get("evaluation_level") == "Solid"])
            review_precision = (solid_subs / total_subs) * 100 if total_subs > 0 else 0.0

        # Fetch verified submissions for the profile (include both skill-linked and standalone builds)
        s_res = sb.table("submissions") \
            .select("*, roadmaps(title)") \
            .eq("user_email", user_email) \
            .in_("evaluation_level", ["Solid", "Developing"]) \
            .order("submitted_at", desc=True) \
            .execute()
        subs_data = s_res.data

    # 4b. Calculate Knowledge Velocity (Last 30 days)
    mastered_30d = 0
    explored_30d = 0
    now = datetime.now()
    for s in skills:
        # Check if last_updated is within 30 days
        # last_updated is datetime
        if (now - s.last_updated.replace(tzinfo=None)).days <= 30:
            if s.confidence_score >= 80:
                mastered_30d += 1
            else:
                explored_30d += 1
    
    learning_momentum = {"mastered": mastered_30d, "explored": explored_30d}

    # 5. Fetch Practice Stats
    prac_res = sb.table("practice_progress") \
        .select("resource_id, practice_sessions(resources)") \
        .eq("user_id", uid) \
        .eq("completed", True) \
        .execute()
    
    p_stats = PracticeStats()
    if prac_res.data:
        for row in prac_res.data:
            session = row.get("practice_sessions", {})
            resources = session.get("resources", []) if session else []
            resource = next((r for r in resources if r["id"] == row["resource_id"]), None)
            if resource:
                diff = (resource.get("difficulty") or "Medium").lower()
                if "easy" in diff: p_stats.easy += 1
                elif "hard" in diff: p_stats.hard += 1
                else: p_stats.medium += 1
                p_stats.total += 1

    # 5a. Fetch MCQ Stats
    mcq_stats_res = sb.table("mcq_sessions") \
        .select("questions, score") \
        .eq("user_id", uid) \
        .eq("status", "completed") \
        .execute()
    
    if mcq_stats_res.data:
        for session in mcq_stats_res.data:
            questions = session.get("questions", [])
            q_count = len(questions)
            score = session.get("score", 0.0)
            p_stats.mcq_total += q_count
            p_stats.mcq_correct += round(score * q_count)
            p_stats.total += q_count

    # 5b. Fetch MCQ Sessions
    mcq_history = []
    mcq_res = sb.table("mcq_sessions") \
        .select("*") \
        .eq("user_id", uid) \
        .eq("status", "completed") \
        .order("created_at", desc=True) \
        .limit(20) \
        .execute()
    
    if mcq_res.data:
        mcq_history = [MCQSessionRead(**item) for item in mcq_res.data]

    # 6. Fetch Community Contributions (Discussions)
    disc_res = sb.table("discussion_threads").select("*").eq("author_id", profile["id"]).order("created_at", desc=True).limit(50).execute()
    discussions = []
    for item in (disc_res.data or []):
        content = item.get("content")
        if item.get("is_deleted"):
            content = None
        
        discussions.append(DiscussionRead(
            id=item["id"],
            context_type=item["context_type"],
            context_id=item["context_id"],
            author_id=item["author_id"],
            author_name=profile.get("display_name") or profile.get("username"),
            author_avatar=profile.get("avatar_url"),
            parent_id=item["parent_id"],
            content=content,
            is_pinned=item["is_pinned"],
            is_deleted=item["is_deleted"],
            created_at=item["created_at"],
            updated_at=item["updated_at"]
        ))

    total_hours = sum(s.time_invested for s in skills)
    
    return PublicProfile(
        username=profile["username"],
        display_name=profile.get("display_name"),
        github_username=profile.get("github_username"),
        email=profile.get("email"),
        avatar_url=profile.get("avatar_url"),
        supabase_uid=profile.get("supabase_uid"),
        is_pro=profile.get("is_pro", False),
        eulercoins=profile.get("eulercoins", 0),
        roadmap_credits=profile.get("roadmap_credits", 0),
        review_precision=review_precision,
        learning_momentum=learning_momentum,
        total_skills=len(skills),
        total_roadmaps=total_roadmaps_count,
        total_hours=round(total_hours, 1),
        last_active=profile.get("last_active_date"),
        skills=skills,
        roadmaps=roadmaps_data,
        submissions=subs_data,
        practice_stats=p_stats,
        mcq_history=mcq_history,
        discussions=discussions
    )

@router.get("/profile/{username}/activity")
async def get_activity(username: str):
    sb = get_supabase_client()
    p_res = sb.table("profiles").select("supabase_uid").eq("username", username).maybe_single().execute()
    if not p_res:
        raise HTTPException(status_code=404, detail="Not found")
    
    uid = p_res.data["supabase_uid"]
    email_res = sb.table("profiles").select("email").eq("supabase_uid", uid).maybe_single().execute()
    if not email_res:
        raise HTTPException(status_code=404, detail="Email not found")
    email = email_res.data["email"]
    
    # Fetch activity for the last 12 months - selecting ONLY the timestamp column to save memory
    twelve_months_ago = (datetime.now() - timedelta(days=365)).isoformat()
    
    tp_res = sb.table("module_progress").select("completed_at").eq("user_email", email).eq("completed", True).gte("completed_at", twelve_months_ago).execute()
    sub_res = sb.table("submissions").select("submitted_at").eq("user_email", email).gte("submitted_at", twelve_months_ago).execute()
    prac_res = sb.table("practice_progress").select("updated_at").eq("user_id", uid).eq("completed", True).gte("updated_at", twelve_months_ago).execute()
    sess_res = sb.table("learning_sessions").select("created_at").eq("user_id", uid).gte("created_at", twelve_months_ago).execute()
    mcq_res = sb.table("mcq_sessions").select("created_at").eq("user_id", uid).eq("status", "completed").gte("created_at", twelve_months_ago).execute()

    activity = {}
    def add_to_activity(dt_str):
        if not dt_str: return
        date_str = dt_str.split("T")[0]
        activity[date_str] = activity.get(date_str, 0) + 1

    for r in tp_res.data: add_to_activity(r["completed_at"])
    for r in sub_res.data: add_to_activity(r["submitted_at"])
    for r in prac_res.data: add_to_activity(r["updated_at"])
    for r in sess_res.data: add_to_activity(r["created_at"])
    for r in mcq_res.data: add_to_activity(r["created_at"])
    return activity
@router.get("/profile/{username}/export")
async def export_profile_pdf(username: str):
    sb = get_supabase_client()
    
    p_res = sb.table("profiles").select("*").eq("username", username).maybe_single().execute()
    if not p_res:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = p_res.data
    uid = profile["supabase_uid"]
    user_email = profile.get("email")
    
    # 1. Fetch all skills for calculation
    us_res = sb.table("user_skills").select("*, canonical_skills(name, category, benchmark_hours)").eq("user_id", uid).order("confidence_score", desc=True).execute()
    
    skills = []
    total_hours = 0
    contributing_ids = set()
    for us in us_res.data:
        cs = us.get("canonical_skills", {})
        total_hours += us.get("time_invested", 0)
        skills.append({
            "name": cs.get("name", "Unknown"),
            "category": cs.get("category", ""),
            "confidence": us.get("confidence_score", 0),
            "tier": us.get("tier", "exposure"),
            "time": us.get("time_invested", 0)
        })
        for rid in us.get("contributing_roadmap_ids", []):
            contributing_ids.add(rid)

    # 2. Fetch Practice Stats
    prac_res = sb.table("practice_progress") \
        .select("resource_id, practice_sessions(resources)") \
        .eq("user_id", uid) \
        .eq("completed", True) \
        .execute()
    
    p_stats = PracticeStats()
    if prac_res.data:
        for row in prac_res.data:
            session = row.get("practice_sessions", {})
            resources = session.get("resources", []) if session else []
            resource = next((r for r in resources if r["id"] == row["resource_id"]), None)
            if resource:
                diff = (resource.get("difficulty") or "Medium").lower()
                if "easy" in diff: p_stats.easy += 1
                elif "hard" in diff: p_stats.hard += 1
                else: p_stats.medium += 1
                p_stats.total += 1

    # Fetch MCQ Stats for PDF
    mcq_stats_res = sb.table("mcq_sessions") \
        .select("questions, score") \
        .eq("user_id", uid) \
        .eq("status", "completed") \
        .execute()
    
    if mcq_stats_res.data:
        for session in mcq_stats_res.data:
            questions = session.get("questions", [])
            q_count = len(questions)
            score = session.get("score", 0.0)
            p_stats.mcq_total += q_count
            p_stats.mcq_correct += round(score * q_count)
            # Add MCQ total questions to overall practice total for the "Practice Reps" stat
            p_stats.total += q_count

    # 3. Fetch Proof of Work (Verified only)
    submissions = []
    if user_email:
        s_res = sb.table("submissions").select("*, roadmaps(title)").eq("user_email", user_email).in_("evaluation_level", ["Solid", "Developing"]).order("submitted_at", desc=True).limit(5).execute()
        submissions = s_res.data
    
    # 4. Fetch Roadmap Count
    total_r_res = sb.table("roadmaps").select("id", count="exact").eq("email", user_email).execute()
    total_roadmaps_count = total_r_res.count if total_r_res.count is not None else 0

    pdf_buffer = BytesIO()
    # Overall container: 32px 40px horizontal breathing room
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter,
                           rightMargin=0.55*inch, leftMargin=0.55*inch,
                           topMargin=0.45*inch, bottomMargin=0.45*inch)
    
    # Styles & Colors
    styles = getSampleStyleSheet()
    mint_green = colors.HexColor('#00B894')
    teal_color = colors.HexColor('#0f766e')
    teal_light = colors.HexColor('#2dd4bf')
    bg_light = colors.HexColor('#f8f9fa')
    slate_900 = colors.HexColor('#0f172a')
    slate_700 = colors.HexColor('#334155')
    slate_600 = colors.HexColor('#475569')
    slate_500 = colors.HexColor('#64748b')
    slate_100 = colors.HexColor('#f1f5f9')
    
    name_style = ParagraphStyle('Name', parent=styles['Heading1'], fontSize=28, textColor=slate_900, spaceAfter=2, fontName='Helvetica-Bold')
    handle_style = ParagraphStyle('Handle', parent=styles['Normal'], fontSize=13, textColor=slate_500, spaceAfter=4, fontName='Helvetica-Bold')
    badge_style = ParagraphStyle('Badge', parent=styles['Normal'], fontSize=10, textColor=teal_color, fontName='Helvetica-Bold', textTransform='uppercase', letterSpacing=1.2)
    
    # Section Header with Accent Bar
    section_title = ParagraphStyle('Section', parent=styles['Heading2'], fontSize=11, textColor=slate_900, 
                                 spaceBefore=20, spaceAfter=15, fontName='Helvetica-Bold', 
                                 textTransform='uppercase', letterSpacing=1.5, leftIndent=8)
    
    stat_val_style = ParagraphStyle('StatVal', parent=styles['Normal'], fontSize=18, textColor=mint_green, alignment=1, fontName='Helvetica-Bold')
    stat_label_style = ParagraphStyle('StatLab', parent=styles['Normal'], fontSize=8, textColor=slate_500, alignment=1, fontName='Helvetica-Bold', textTransform='uppercase')
    
    skill_name_style = ParagraphStyle('SkillName', parent=styles['Normal'], fontSize=11, textColor=slate_900, fontName='Helvetica-Bold')
    skill_meta_style = ParagraphStyle('SkillMeta', parent=styles['Normal'], fontSize=9, textColor=slate_500)
    skill_val_style = ParagraphStyle('SkillVal', parent=styles['Normal'], fontSize=10, textColor=slate_700, alignment=2, fontName='Helvetica-Bold')
    
    evidence_style = ParagraphStyle('Evidence', parent=styles['Normal'], fontSize=11, textColor=slate_900, leading=14, fontName='Helvetica-Bold')
    evidence_meta_style = ParagraphStyle('EvidenceMeta', parent=styles['Normal'], fontSize=9, textColor=slate_500, leading=12)
    evidence_desc_style = ParagraphStyle('EvidenceDesc', parent=styles['Normal'], fontSize=9.5, textColor=slate_600, leading=13)
    
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=slate_500, alignment=1, leading=11)

    # Building the Card Content
    card_story = []
    
    # --- HEADER ---
    import os
    current_file_path = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_file_path, "..", "..", ".."))
    logo_path = os.path.join(project_root, "frontend", "public", "apple-touch-icon.png")
    
    try:
        logo = Image(logo_path, width=0.55*inch, height=0.55*inch)
    except:
        logo = Spacer(1, 0.1*inch)

    # Simplified header to avoid overlap
    header_table_data = [
        [logo, Paragraph(f"<b>{profile.get('display_name') or username}</b> <font color='#64748b' size='11'>@{username}</font>", name_style)],
        ['', Paragraph("Your Earned Record", badge_style)]
    ]
    header_table = Table(header_table_data, colWidths=[0.75*inch, 6.2*inch], rowHeights=[0.4*inch, 0.2*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('SPAN', (0, 0), (0, 1)), # Logo spans two rows
    ]))
    card_story.append(header_table)
    card_story.append(Spacer(1, 8))
    card_story.append(HRFlowable(width="100%", thickness=1, color=slate_100, spaceAfter=12))

    # --- STATS ROW ---
    stats_data = [
        [Paragraph(f"{len(skills)}", stat_val_style), Paragraph(f"{total_roadmaps_count}", stat_val_style), Paragraph(f"{int(total_hours)}h", stat_val_style), Paragraph(f"{p_stats.total}", stat_val_style), Paragraph(f"{len(submissions)}", stat_val_style)],
        [Paragraph("Proven Skills", stat_label_style), Paragraph("Roadmaps", stat_label_style), Paragraph("Learning Time", stat_label_style), Paragraph("Practice Reps", stat_label_style), Paragraph("Proof of Work", stat_label_style)]
    ]
    stats_table = Table(stats_data, colWidths=[1.38*inch]*5)
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('LINEABOVE', (0,0), (-1,0), 0.5, slate_100),
        ('LINEBELOW', (0,1), (-1,1), 0.5, slate_100),
        ('TOPPADDING', (0, 0), (-1, -1), 12), # Reduced from 16
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    card_story.append(stats_table)
    card_story.append(Spacer(1, 16))

    # Helper for Accent Header
    def accent_header(text, width):
        t = Table([[Paragraph(text, section_title)]], colWidths=[width])
        t.setStyle(TableStyle([
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('BORDERLEFT', (0,0), (0,0), 3, mint_green),
        ]))
        return t

    # --- CONTENT COLUMNS ---
    left_col = []
    right_col = []

    # Left: Skills
    left_col.append(accent_header("Proven Technical Stack", 2.8*inch))
    left_col.append(Spacer(1, 6))
    if skills:
        for s in skills[:8]:
            conf = s['confidence']
            bar_max_width = 2.2 * inch
            filled_width = max(6, (conf / 100.0) * bar_max_width)
            
            bar_color = teal_color if conf >= 80 else (teal_light if conf >= 50 else slate_500)
            
            # Skill Header
            left_col.append(Table([
                [Paragraph(s['name'], skill_name_style), Paragraph(f"{conf:.1f}%", skill_val_style)]
            ], colWidths=[1.8*inch, 0.7*inch], style=[('LEFTPADDING', (0,0), (-1,-1), 0), ('RIGHTPADDING', (0,0), (-1,-1), 0)]))
            
            # Progress Bar (Height: 8px)
            bar = Table([['']], colWidths=[filled_width], rowHeights=[8])
            bar.setStyle(TableStyle([('BACKGROUND', (0, 0), (0, 0), bar_color), ('ROUNDEDCORNERS', [4, 4, 4, 4])]))
            
            bg_bar = Table([[bar]], colWidths=[bar_max_width], rowHeights=[8])
            bg_bar.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, 0), slate_100),
                ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
                ('ROUNDEDCORNERS', [4, 4, 4, 4])
            ]))
            
            left_col.append(Table([
                [bg_bar, Paragraph(s['tier'].upper(), skill_meta_style)]
            ], colWidths=[2.3*inch, 0.4*inch], style=[('LEFTPADDING', (0,0), (-1,-1), 0), ('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('BOTTOMPADDING', (0,0), (-1,-1), 6)]))
    
    # Left: Practice
    left_col.append(Spacer(1, 12))
    left_col.append(accent_header("Practice Intensity", 2.8*inch))
    left_col.append(Spacer(1, 6))
    prac_box_data = [
        [Paragraph(f"{p_stats.easy}", stat_val_style), Paragraph(f"{p_stats.medium}", stat_val_style), Paragraph(f"{p_stats.hard}", stat_val_style)],
        [Paragraph("Conceptual", stat_label_style), Paragraph("Applied", stat_label_style), Paragraph("Complex", stat_label_style)]
    ]
    prac_box = Table(prac_box_data, colWidths=[0.9*inch]*3)
    prac_box.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('ROUNDEDCORNERS', [4,4,4,4]),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    left_col.append(prac_box)

    # Right: Evidence
    right_col.append(accent_header("Work You've Done", 3.7*inch))
    right_col.append(Spacer(1, 6))
    if submissions:
        for sub in submissions:
            roadmap_title = sub.get("roadmaps", {}).get("title", "Technical Roadmap")
            date_str = datetime.fromisoformat(sub['submitted_at'].replace('Z', '+00:00')).strftime('%b %Y')
            
            entry_content = [
                Paragraph(f"{roadmap_title} <font color='#64748b' size='8'>• {date_str}</font>", evidence_style),
                Paragraph(f"Module {sub['module_number']} • {sub['evaluation_level']}", evidence_meta_style),
                Paragraph(sub['description'][:140] + ("..." if len(sub['description']) > 140 else ""), evidence_desc_style)
            ]
            
            # Simple UI instead of big cards
            entry_row = Table([[entry_content]], colWidths=[3.7*inch])
            entry_row.setStyle(TableStyle([
                ('LEFTPADDING', (0,0), (-1,-1), 10),
                ('TOPPADDING', (0,0), (-1,-1), 2),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('BORDERLEFT', (0,0), (0,0), 2, mint_green),
            ]))
            right_col.append(entry_row)
            right_col.append(Spacer(1, 6))
    else:
        right_col.append(Paragraph("Verification in progress...", evidence_meta_style))

    # Assemble Columns
    main_table = Table([[left_col, Spacer(10, 1), right_col]], colWidths=[2.9*inch, 0.2*inch, 3.8*inch])
    main_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    card_story.append(main_table)

    # --- FOOTER ---
    card_story.append(Spacer(1, 24)) 
    card_story.append(HRFlowable(width="100%", thickness=1, color=slate_100, spaceAfter=16))
    
    profile_url = f"https://www.eulerfold.com/u/{username}"
    qr = qrcode.QRCode(version=1, box_size=10, border=0)
    qr.add_data(profile_url)
    qr.make(fit=True)
    img_qr = qr.make_image(fill_color="#0f766e", back_color="white")
    
    qr_buffer = BytesIO()
    img_qr.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)
    qr_img = Image(qr_buffer, width=0.8*inch, height=0.8*inch)
    
    footer_text = f"""
    <b>AUTHENTICITY GUARANTEED BY EULERFOLD LABS</b><br/>
    This document is a real-time extraction of proven technical skills and project evidence.<br/>
    Scan QR to view live artifacts, verification links, and the original evidence chain.<br/>
    SYSTEM ID: {uid[:8].upper()} • ISSUED: {datetime.now().strftime('%Y-%m-%d')}
    """
    
    footer_table = Table([[qr_img, Paragraph(footer_text, footer_style)]], colWidths=[1.0*inch, 5.9*inch])
    footer_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
    card_story.append(footer_table)

    # Final Wrap: Side Borders for the Main Card
    final_card = Table([[card_story]], colWidths=[7.1*inch])
    final_card.setStyle(TableStyle([
        ('BORDERLEFT', (0,0), (0,0), 4, mint_green),
        ('BORDERRIGHT', (0,0), (0,0), 4, mint_green),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))

    doc.build([final_card])
    pdf_buffer.seek(0)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={username}-credential.pdf"}
    )
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={username}-credential.pdf"}
    )

