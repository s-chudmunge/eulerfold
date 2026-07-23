import json
from dotenv import load_dotenv
load_dotenv('.env')
from app.core.supabase_client import get_supabase_client

sb = get_supabase_client()

def main():
    res = sb.table('roadmaps').select('id, roadmap_plan').in_('id', [1422, 1377, 1409, 1371, 1440]).execute()
    
    for c in res.data:
        plan = c.get('roadmap_plan', {})
        if isinstance(plan, str):
            plan = json.loads(plan)
            
        mods = plan.get('modules', [])
        
        if c['id'] == 1422: # OS Kernel
            mods[4]['title'] = "Preemptive Multitasking & Context Switching"
            mods[4]['outcome'] = "Implement thread contexts, timer interrupts for scheduling, and context switching."
            mods[4]['topics'] = [
                {"title": "Thread Contexts", "subtopics": [{"title": "Saving CPU State", "video_id": ""}, {"title": "The Task Struct", "video_id": ""}]},
                {"title": "The Scheduler", "subtopics": [{"title": "Timer Interrupts", "video_id": ""}, {"title": "Round Robin Scheduling", "video_id": ""}]}
            ]
            
            mods[5]['title'] = "User Space & System Calls"
            mods[5]['outcome'] = "Transition to Ring 3 and implement basic system calls."
            mods[5]['topics'] = [
                {"title": "Ring 3 Transitions", "subtopics": [{"title": "GDT and TSS", "video_id": ""}, {"title": "Dropping Privileges", "video_id": ""}]},
                {"title": "System Calls", "subtopics": [{"title": "Software Interrupts (int 0x80)", "video_id": ""}, {"title": "Syscall Routing", "video_id": ""}]}
            ]
            
        elif c['id'] == 1377: # TCP/IP
            # Remove the redundant TCP State Machine (index 6)
            if len(mods) > 6 and "State Machine" in mods[6]['title']:
                mods.pop(6)
            # 7 becomes 6 (Congestion control)
            
        elif c['id'] == 1409: # PL
            mods[4]['title'] = "Bytecode Compilation & Virtual Machines"
            mods[4]['outcome'] = "Compile the AST into a stack-based bytecode instruction set and execute it."
            mods[4]['topics'] = [
                {"title": "Bytecode Architecture", "subtopics": [{"title": "Stack vs Register VMs", "video_id": ""}, {"title": "Opcode Design", "video_id": ""}]},
                {"title": "The Compiler", "subtopics": [{"title": "AST to Bytecode", "video_id": ""}, {"title": "Constant Pool", "video_id": ""}]}
            ]
            
        elif c['id'] == 1440: # K8s Networking
            # Update CNI to focus on basics
            mods[1]['title'] = "Basic CNI Plugins (Flannel & Calico)"
            
            mods[3]['title'] = "Ingress Controllers & Gateway API"
            mods[3]['outcome'] = "Manage external L7 traffic routing using Ingress and the modern Gateway API."
            mods[3]['topics'] = [
                {"title": "Ingress Controllers", "subtopics": [{"title": "NGINX Ingress", "video_id": ""}, {"title": "Path-based Routing", "video_id": ""}]},
                {"title": "Gateway API", "subtopics": [{"title": "GatewayClass and HTTPRoute", "video_id": ""}, {"title": "Traffic Splitting", "video_id": ""}]}
            ]
            
            mods[4]['title'] = "eBPF and Cilium Deep Dive"
            mods[5]['title'] = "Service Mesh: Istio & Envoy"
            
        # Re-number timelines properly
        for idx, m in enumerate(mods):
            m['timeline'] = f"Week {idx + 1}"
            
        plan['modules'] = mods
        sb.table('roadmaps').update({'roadmap_plan': plan}).eq('id', c['id']).execute()
        print(f"Fixed Course {c['id']}")

if __name__ == "__main__":
    main()
