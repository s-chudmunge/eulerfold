import httpx

response = httpx.get("http://localhost:8080/roadmaps/by-slug/number-theory-fundamentals-from-divisibility-to-algorithms")
data = response.json()

if response.status_code == 200:
    plan = data.get("roadmap_plan", {})
    modules = plan.get("modules", [])
    found_resources = False
    for m in modules:
        for t in m.get("topics", []):
            if "resources" in t and len(t["resources"]) > 0:
                found_resources = True
                print(f"Topic '{t.get('title')}' has resources:")
                for r in t["resources"]:
                    print(f" - {r.get('title')} ({r.get('url')})")
            if "youtube_video_id" in t:
                print(f"Topic '{t.get('title')}' has YT: {t['youtube_video_id']}")
    
    if not found_resources:
        print("No resources found in the roadmap!")
else:
    print(f"Status: {response.status_code}")
    print(data)
