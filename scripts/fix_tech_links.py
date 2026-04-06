import os
import json
from supabase import create_client
from dotenv import load_dotenv

# Load credentials
load_dotenv("backend/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    load_dotenv("frontend/.env")
    url = url or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    if not url or not key:
        print("Error: Supabase credentials not found.")
        exit(1)

supabase = create_client(url, key)

REPLACEMENTS = {
    # Career & Placement
    "https://www.youtube.com/@CareerRide": "https://www.youtube.com/@CareerRideOfficial",
    "https://www.freecodecamp.org/news/how-to-write-a-great-developer-resume/": "https://www.freecodecamp.org/news/how-to-write-a-developer-resume/",
    "https://www.freecodecamp.org/news/how-to-write-a-developer-resume-guide/": "https://www.freecodecamp.org/news/how-to-write-a-developer-resume/",
    
    # Marketing & Content
    "https://neilpatel.com/blog/marketing-for-beginners/": "https://neilpatel.com/what-is-digital-marketing/",
    "https://blog.hubspot.com/marketing/marketing-metrics-to-track": "https://blog.hubspot.com/marketing/marketing-metrics",
    "https://creatoracademy.youtube.com/page/course/get-started": "https://www.youtube.com/creators",
    "https://backlinko.com/youtube-seo": "https://backlinko.com/how-to-rank-youtube-videos",
    
    # Unity & Game Dev
    "https://learn.unity.com/tutorial/audio-in-unity": "https://learn.unity.com/mission/creative-core-audio",
    "https://learn.unity.com/tutorial/ui-basics": "https://learn.unity.com/project/creative-core-ui",
    "https://learn.unity.com/tutorial/physics-overview": "https://learn.unity.com/pathway/unity-essentials",
    "https://learn.unity.com/tutorial/physics-fundamentals": "https://learn.unity.com/pathway/unity-essentials",
    "https://docs.unity3d.com/Manual/GettingStarted.html": "https://docs.unity3d.com/Manual/unity-get-started.html",
    "https://docs.unity3d.com/Manual/unity-get-started.html": "https://docs.unity3d.com/Manual/GettingStarted.html",
    "https://docs.unity3d.com/Manual/ManagingScenes.html": "https://docs.unity3d.com/Manual/CreatingScenes.html",
    "https://docs.unity3d.com/Manual/Scenes.html": "https://docs.unity3d.com/Manual/CreatingScenes.html",
    
    # SQL & Database
    "https://www.postgresql.org/docs/current/tutorial-intro.html": "https://www.postgresql.org/docs/current/tutorial.html",
    "https://www.guru99.com/database-design-tutorial.html": "https://www.guru99.com/database-design.html",
    "https://www.postgresqltutorial.com/postgresql-advanced-features/": "https://www.postgresqltutorial.com/postgresql-administration/",
    
    # Linux & DevOps
    "https://linuxize.com/post/grep-command-in-linux/": "https://www.digitalocean.com/community/tutorials/using-grep-in-linux",
    "https://www.hostinger.com/tutorials/linux-grep-command": "https://www.digitalocean.com/community/tutorials/using-grep-in-linux",
    "https://www.digitalocean.com/community/tutorials/how-to-use-bash-automation-with-cron-to-schedule-tasks": "https://www.digitalocean.com/community/tutorials/how-to-use-cron-to-automate-tasks-on-ubuntu-2",
    "https://www.digitalocean.com/community/tutorials/how-to-use-cron-to-automate-tasks-ubuntu-20-04": "https://www.digitalocean.com/community/tutorials/how-to-use-cron-to-automate-tasks-on-ubuntu-2",
    
    # AI & Prompt Engineering
    "https://platform.openai.com/docs/guides/prompt-engineering/strategy-guide": "https://platform.openai.com/docs/guides/prompt-engineering",
    "https://developers.google.com/machine-learning/resources/chain-of-thought-prompting": "https://ai.google.dev/gemini-api/docs/prompting-strategies",
    "https://towardsdatascience.com/few-shot-learning-explained-b12f27c1227b": "https://www.analyticsvidhya.com/blog/2021/05/an-introduction-to-few-shot-learning/",
    "https://developers.google.com/machine-learning/resources/prompt-engineering": "https://cloud.google.com/vertex-ai/generative-ai/docs/learn/introduction-to-prompting",
    "https://cloud.google.com/vertex-ai/generative-ai/docs/learn/introduction-to-prompt-design": "https://cloud.google.com/vertex-ai/generative-ai/docs/learn/introduction-to-prompting",
    
    # Web & Graphics
    "https://developers.google.com/speed/docs/insights/optimize-images#optimize-3d-models": "https://gltf-transform.donmccurdy.com/",
    "https://web.dev/articles/optimize-vitals-3d": "https://gltf-transform.donmccurdy.com/",
    
    # Cybersecurity
    "https://www.sans.org/blog/what-is-osint/": "https://www.sans.org/blog/what-is-open-source-intelligence/",
    "https://www.sans.org/blog/penetration-testing-report-writing/": "https://www.sans.org/white-papers/33343/",
    "https://www.sans.org/blog/how-to-write-a-penetration-testing-report/": "https://www.sans.org/white-papers/33343/",
    
    # Coding & Backend
    "https://fastapi.tiangolo.com/advanced/response-streaming/": "https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse",
    "https://fastapi.tiangolo.com/how-to/streaming-data/": "https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse",
    "https://www.freecodecamp.org/news/breadth-first-search-bfs-algorithm-for-beginners/": "https://www.freecodecamp.org/news/breadth-first-search-graph-traversal-guide/",
    "https://www.freecodecamp.org/news/depth-first-search-dfs-algorithm-for-beginners/": "https://www.freecodecamp.org/news/graph-algorithms-in-python-bfs-dfs-and-beyond/",
    "https://www.freecodecamp.org/news/depth-first-search-algorithm-example-python-and-javascript/": "https://www.freecodecamp.org/news/graph-algorithms-in-python-bfs-dfs-and-beyond/",
    "https://www.freecodecamp.org/news/breadth-first-search-algorithm-example-python-and-javascript/": "https://www.freecodecamp.org/news/breadth-first-search-graph-traversal-guide/",
    
    # Open Source
    "https://opensource.com/resources/what-open-source-license": "https://opensource.guide/legal/",
    "https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source": "https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github"
}

def fix_plan(plan):
    plan_str = json.dumps(plan)
    modified = False
    for old, new in REPLACEMENTS.items():
        if old in plan_str:
            print(f"  Replacing: {old} -> {new}")
            plan_str = plan_str.replace(old, new)
            modified = True
    return json.loads(plan_str) if modified else None

def run():
    res = supabase.table("roadmaps").select("id, title, roadmap_plan").eq("is_public", True).execute()
    if not res.data:
        print("No public roadmaps found.")
        return
    
    print(f"Analyzing {len(res.data)} public roadmaps for broken links...")
    
    for roadmap in res.data:
        rid = roadmap['id']
        old_plan = roadmap['roadmap_plan']
        new_plan = fix_plan(old_plan)
        
        if new_plan is not None:
            print(f"Updating roadmap {rid}: {roadmap['title']}")
            update_res = supabase.table("roadmaps").update({"roadmap_plan": new_plan}).eq("id", rid).execute()
            if update_res.data:
                print(f"  Successfully updated roadmap {rid}.")
            else:
                print(f"  Failed to update roadmap {rid}.")

if __name__ == "__main__":
    run()
