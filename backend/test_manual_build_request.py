import requests
import json
import uuid

BACKEND_URL = "http://localhost:8080"

def test_manual_build_request():
    print(f"Testing manual build on {BACKEND_URL}...")
    
    manual_plan = {
        "title": "Manual Test Roadmap (Local Server)",
        "description": "A manually built roadmap for testing on local server",
        "modules": [
            {
                "id": "module_1",
                "title": "Module 1",
                "outcome": "Learn the basics",
                "topics": [
                    {
                        "id": "topic_1_1",
                        "uuid": str(uuid.uuid4()),
                        "title": "First Manual Topic",
                        "youtube_video_id": "dQw4w9WgXcQ",
                        "duration": 10
                    }
                ],
                "resources": [
                    {"id": str(uuid.uuid4()), "title": "Docs", "url": "https://example.com"}
                ]
            }
        ]
    }

    payload = {
        "title": "Manual Test Roadmap (Local Server)",
        "description": "A manually built roadmap for testing on local server",
        "subject": "Manual Test Roadmap",
        "goal": "A manually built roadmap for testing on local server",
        "time_value": 1,
        "time_unit": "weeks",
        "roadmap_plan": manual_plan,
        "model": "manual-build",
        "email": "jukeask@gmail.com"
    }

    # Since I don't have a token, this will likely fail with 401.
    # But I'll try it to confirm.
    try:
        response = requests.post(f"{BACKEND_URL}/roadmaps/save", json=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ Success!")
            print(json.dumps(response.json(), indent=2))
        elif response.status_code == 401:
            print("❌ Unauthorized (401). Need a valid JWT token.")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_manual_build_request()
