import sys, os, asyncio, json
sys.path.append(os.path.join(os.getcwd(), "backend"))
os.chdir("backend")
from app.core.supabase_client import get_admin_supabase_client
sb = get_admin_supabase_client()
rid = 1358
email = "jukeask@gmail.com"
uid = "b083da08-835f-458a-9b53-1ee01e3036ba"

roadmap_res = sb.table("roadmaps").select("roadmap_plan, status").eq("id", rid).execute()
plan = roadmap_res.data[0]["roadmap_plan"]
if isinstance(plan, str): plan = json.loads(plan)
modules = plan.get("modules", [])

prog_res = sb.table("module_progress").select("*").eq("roadmap_id", rid).eq("user_email", email).execute()
mp_map = {}
for p in prog_res.data:
    mn = p.get("module_number")
    if mn not in mp_map: mp_map[mn] = []
    mp_map[mn].append(p)

sub_res = sb.table("submissions").select("*").eq("roadmap_id", rid).eq("user_email", email).execute()
sub_map = { s.get("module_number"): s for s in sub_res.data }

bottleneck = None
for m_idx, m in enumerate(modules):
    m_num = m_idx + 1
    m_topics = m.get("topics", [])
    m_topic_count = len(m_topics)
    completed_topics_in_module = 0
    mod_progs = mp_map.get(m_num, [])
    for tp in mod_progs:
        if tp.get("completed"):
            completed_topics_in_module += 1
            
    sub = sub_map.get(m_num)
    eval_level = sub.get("evaluation_level") if sub else None
    print(f"Module {m_num}: completed topics {completed_topics_in_module}/{m_topic_count}, eval_level: {eval_level}")
