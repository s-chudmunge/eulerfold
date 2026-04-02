import json
import time
import os
import sys
import unittest.mock as mock
from pathlib import Path
from fastapi.testclient import TestClient
from dotenv import load_dotenv

# Ensure we can import from app
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.main import app
from app.core.auth import get_current_user
from app.core.supabase_client import get_supabase_client
from app.schemas import User

def generate_html_report(flash_data, pro_data):
    """Generates a side-by-side comparison report."""
    
    def get_tier_html(data, label):
        title = data.get("title", "Untitled")
        plan = data.get("roadmap_plan", {})
        modules = plan.get("modules", [])
        
        html = f"<div class='tier-column'><h2>{label} (Depth: {data.get('depth_score', 'N/A')})</h2>"
        for mod in modules:
            html += f"<div class='module'><h3>{mod.get('title')}</h3>"
            html += f"<p class='pow'><strong>POW:</strong> {mod.get('proof_of_work_instructions', {}).get('what_to_build')}</p><ul>"
            for topic in mod.get("topics", []):
                yt = topic.get("youtube_video_id")
                status = f"✅ <a href='https://youtube.com/watch?v={yt}'>Video</a>" if yt else "❌ No Video"
                html += f"<li>{topic.get('title')} {status}</li>"
            html += "</ul></div>"
        html += "</div>"
        return html

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>EulerFold Production Verification</title>
        <style>
            body {{ font-family: sans-serif; background: #f0f7f6; padding: 20px; }}
            .container {{ display: flex; gap: 20px; }}
            .tier-column {{ flex: 1; background: white; padding: 20px; border-radius: 8px; border-top: 5px solid #0f766e; }}
            .module {{ border-bottom: 1px solid #eee; margin-bottom: 15px; padding-bottom: 10px; }}
            .pow {{ font-size: 12px; color: #b45309; background: #fffbeb; padding: 5px; border-radius: 4px; }}
            h2 {{ color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 10px; }}
            a {{ color: #ef4444; text-decoration: none; font-weight: bold; }}
        </style>
    </head>
    <body>
        <h1>EulerFold Production Sync: {time.strftime('%Y-%m-%d %H:%M:%S')}</h1>
        <div class="container">
            {get_tier_html(flash_data, "FREE TIER (Gemini 2.5 Flash)")}
            {get_tier_html(pro_data, "PRO TIER (Gemini 2.5 Pro)")}
        </div>
    </body>
    </html>
    """
    with open("verification_report.html", "w") as f:
        f.write(html)
    print("\n✅ Verification Report Generated: verification_report.html")

class MockSupabase:
    def __init__(self, is_pro=False): self.is_pro = is_pro
    def table(self, name): self._name = name; return self
    def select(self, *args, **kwargs): return self
    def eq(self, *args, **kwargs): return self
    def update(self, *args, **kwargs): return self
    def insert(self, *args, **kwargs): return self
    def execute(self):
        if self._name == "profiles": return mock.Mock(data=[{"roadmap_credits": 10, "is_pro": self.is_pro}])
        return mock.Mock(data=[{"id": 1, "slug": "test"}])

def run_sync_verification():
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
    client = TestClient(app)
    results = {}

    print("🔬 Running EulerFold Production Flow Verification...")

    for tier in [("FREE", False), ("PRO", True)]:
        label, is_pro = tier
        print(f"📡 Testing {label} Tier Flow...")
        
        mock_user = User(email=f"{label.lower()}@test.com", supabase_uid="uid", display_name=f"{label} User", is_pro=is_pro)
        app.dependency_overrides[get_current_user] = lambda: mock_user
        
        with mock.patch("app.routers.roadmaps.get_supabase_client", return_value=MockSupabase(is_pro=is_pro)):
            response = client.post("/roadmaps/generate", json={
                "subject": "System Design", "goal": "Architect a global app", "time_value": 1, "time_unit": "weeks"
            })
            if response.status_code == 200:
                results[label] = response.json()
                print(f"   - {label} Generation: SUCCESS")
            else:
                print(f"   - {label} Generation: FAILED ({response.status_code})")

    if "FREE" in results and "PRO" in results:
        generate_html_report(results["FREE"], results["PRO"])

if __name__ == "__main__":
    run_sync_verification()
