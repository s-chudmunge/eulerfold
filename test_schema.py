from pydantic import ValidationError
import sys
import os

sys.path.append(os.path.abspath('backend'))
from app.schemas import ExternalRoadmapCreate

payload = {
    "subject": "Test Roadmap",
    "goal": "Test Goal",
    "time_value": 4,
    "time_unit": "weeks",
    "roadmap_plan": {"title": "Test Roadmap"},
    "model": "openai/gpt-4o",
    "is_job_decoded": True
}

try:
    ExternalRoadmapCreate(**payload)
    print("Success!")
except ValidationError as e:
    print(e)
