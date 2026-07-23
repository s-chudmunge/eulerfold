import json
from dotenv import load_dotenv
load_dotenv('.env')
from app.core.supabase_client import get_supabase_client

sb = get_supabase_client()

EXPANSIONS = {
    1423: [ # Reverse Engineering iOS Binaries
        {
            "title": "Dynamic Instrumentation with Frida",
            "outcome": "Inject scripts into running iOS applications to hook functions and bypass jailbreak detection.",
            "timeline": "Week 5",
            "workspace_type": "security",
            "topics": [
                {"title": "Frida Fundamentals", "subtopics": ["Setting up Frida server on a jailbroken device", "Connecting to the REPL", "Basic JS API structure"]},
                {"title": "Hooking Objective-C/Swift", "subtopics": ["Tracing method calls in real-time", "Modifying return values (e.g. isJailbroken())", "Calling application functions dynamically"]},
                {"title": "Proof of Work: Bypass SSL Pinning", "subtopics": ["Identify the network stack", "Write a Frida script to bypass pinning", "Capture HTTPS traffic via Burp Suite"]}
            ]
        },
        {
            "title": "Kernel Concepts and Fuzzing",
            "outcome": "Understand iOS kernel fundamentals (XNU) and how security researchers find memory corruption bugs.",
            "timeline": "Week 6",
            "workspace_type": "security",
            "topics": [
                {"title": "The XNU Kernel", "subtopics": ["Mach microkernel concepts", "IOKit drivers and IPC", "Kernel Address Space Layout Randomization (KASLR)"]},
                {"title": "iOS Security Mitigations", "subtopics": ["Pointer Authentication Codes (PAC)", "CoreTrust and Code Signing", "The iOS Sandbox"]},
                {"title": "Proof of Work: Vulnerability Research", "subtopics": ["Analyze a public iOS kernel exploit (e.g. checkm8 or sock_puppet)", "Trace the memory corruption", "Understand the exploit primitive"]}
            ]
        }
    ],
    1434: [ # Formal Verification
        {
            "title": "Advanced TLA+ Patterns",
            "outcome": "Model complex concurrent systems like two-phase commit or Paxos using TLA+.",
            "timeline": "Week 5",
            "workspace_type": "math",
            "topics": [
                {"title": "Refinement", "subtopics": ["High-level vs Low-level specifications", "Proving a concrete spec implements an abstract one", "Stuttering steps"]},
                {"title": "Liveness Properties", "subtopics": ["Safety vs Liveness", "Weak Fairness (WF) vs Strong Fairness (SF)", "Proving a system eventually makes progress"]},
                {"title": "Proof of Work: Two-Phase Commit", "subtopics": ["Write an abstract spec for distributed transactions", "Write a concrete 2PC implementation", "Check refinement via TLC"]}
            ]
        },
        {
            "title": "Structural Modeling with Alloy",
            "outcome": "Learn the Alloy analyzer to verify relational logic and data structure constraints.",
            "timeline": "Week 6",
            "workspace_type": "math",
            "topics": [
                {"title": "Relational Logic", "subtopics": ["Sets, relations, and atoms", "First-order logic in Alloy", "Signatures and facts"]},
                {"title": "The Alloy Analyzer", "subtopics": ["Translating logic to SAT", "Finding counterexamples (instances)", "Assertions and checks"]},
                {"title": "Proof of Work: RBAC System", "subtopics": ["Model Role-Based Access Control in Alloy", "Write constraints for hierarchy", "Find a privilege escalation vulnerability"]}
            ]
        }
    ],
    1438: [ # Compiler Optimization
        {
            "title": "Static Single Assignment (SSA)",
            "outcome": "Transform an intermediate representation (IR) into SSA form to enable advanced optimizations.",
            "timeline": "Week 5",
            "workspace_type": "cpp",
            "topics": [
                {"title": "SSA Fundamentals", "subtopics": ["Why compilers use SSA", "Phi (Φ) functions", "Control Flow Graphs (CFG)"]},
                {"title": "Dominator Trees", "subtopics": ["Dominance and immediate dominators", "The Dominance Frontier", "Efficient SSA construction algorithms"]},
                {"title": "Proof of Work: Build SSA", "subtopics": ["Construct a CFG from basic blocks", "Calculate the Dominance Frontier", "Insert Phi nodes appropriately"]}
            ]
        },
        {
            "title": "Register Allocation via Graph Coloring",
            "outcome": "Map an infinite number of virtual registers to a finite set of physical CPU registers.",
            "timeline": "Week 6",
            "workspace_type": "cpp",
            "topics": [
                {"title": "Liveness Analysis", "subtopics": ["Data-flow equations", "Live-in and Live-out sets", "Backward analysis over the CFG"]},
                {"title": "Interference Graphs", "subtopics": ["Building the interference graph from liveness", "Graph coloring heuristics (Chaitin's Algorithm)", "Spilling to memory"]},
                {"title": "Proof of Work: Register Allocator", "subtopics": ["Run liveness analysis on SSA IR", "Build the interference graph", "Assign physical registers and handle spilling"]}
            ]
        }
    ],
    1454: [ # Garbage Collector
        {
            "title": "Generational Garbage Collection",
            "outcome": "Implement the Weak Generational Hypothesis by separating objects by age to speed up GC pauses.",
            "timeline": "Week 5",
            "workspace_type": "c",
            "topics": [
                {"title": "The Generational Hypothesis", "subtopics": ["Why most objects die young", "Nursery (Young Gen) vs Old Gen", "Minor vs Major collections"]},
                {"title": "Write Barriers", "subtopics": ["Tracking Old-to-Young pointers", "Card tables and remembered sets", "Overhead of write barriers"]},
                {"title": "Proof of Work: Scavenger", "subtopics": ["Split the heap into generations", "Implement a Cheney-style copying collector for the nursery", "Promote survivors to Old Gen"]}
            ]
        },
        {
            "title": "Concurrent and Parallel GC",
            "outcome": "Reduce Stop-The-World (STW) pauses by executing garbage collection concurrently with the application thread.",
            "timeline": "Week 6",
            "workspace_type": "c",
            "topics": [
                {"title": "Parallel Collection", "subtopics": ["Multi-threading the marking phase", "Work-stealing queues", "Synchronization overhead"]},
                {"title": "Concurrent Marking", "subtopics": ["Tri-color abstraction (White, Grey, Black)", "Read and Write barriers for concurrency", "Handling mutator interference"]},
                {"title": "Proof of Work: Tri-Color GC", "subtopics": ["Implement tri-color marking", "Run the marker on a background thread", "Synchronize the sweep phase safely"]}
            ]
        }
    ],
    1455: [ # Drone Navigation
        {
            "title": "Sensor Fusion & State Estimation",
            "outcome": "Combine IMU, GPS, and Vision data using a Kalman Filter to accurately track the drone's position.",
            "timeline": "Week 5",
            "workspace_type": "cpp",
            "topics": [
                {"title": "The Mathematics of Sensors", "subtopics": ["IMU noise and drift", "GPS precision limits", "Probability distributions and covariance"]},
                {"title": "Kalman Filtering", "subtopics": ["The Predict step (Kinematics)", "The Update step (Measurement)", "Extended Kalman Filter (EKF) for non-linear systems"]},
                {"title": "Proof of Work: Implement EKF", "subtopics": ["Write an EKF predict loop", "Fuse IMU data with simulated GPS", "Output a smoothed trajectory"]}
            ]
        },
        {
            "title": "Simultaneous Localization and Mapping (SLAM)",
            "outcome": "Enable a drone to map an unknown environment and navigate using LiDAR or visual odometry.",
            "timeline": "Week 6",
            "workspace_type": "cpp",
            "topics": [
                {"title": "Visual Odometry", "subtopics": ["Feature detection (ORB, SIFT)", "Optical flow", "Estimating camera motion"]},
                {"title": "LiDAR and Occupancy Grids", "subtopics": ["Point clouds and ray casting", "Building a 2D/3D map", "Path planning algorithms (A*, RRT)"]},
                {"title": "Proof of Work: Autonomous Flight", "subtopics": ["Simulate a drone in Gazebo", "Use a SLAM package (e.g. Cartographer)", "Command the drone to navigate a maze"]}
            ]
        }
    ]
}

def main():
    updated = 0
    for course_id, new_modules in EXPANSIONS.items():
        res = sb.table('roadmaps').select('title, roadmap_plan').eq('id', course_id).execute()
        if not res.data:
            continue
            
        course = res.data[0]
        plan = course.get('roadmap_plan', {})
        if isinstance(plan, str):
            plan = json.loads(plan)
            
        for m in new_modules:
            for t in m["topics"]:
                subtopics_formatted = []
                for st in t["subtopics"]:
                    if isinstance(st, str):
                        subtopics_formatted.append({
                            "title": st,
                            "video_id": "",
                            "video_title": "",
                            "video_channel": "",
                            "resources": []
                        })
                    else:
                        subtopics_formatted.append(st)
                t["subtopics"] = subtopics_formatted
                
        # Append new modules
        plan.setdefault("modules", []).extend(new_modules)
        
        # Ensure timelines are sequential
        for idx, m in enumerate(plan['modules']):
            m['timeline'] = f"Week {idx + 1}"
        
        sb.table('roadmaps').update({'roadmap_plan': plan}).eq('id', course_id).execute()
        updated += 1
        print(f"Added modules to Course {course_id} - {course['title']}")
        
    print(f"Total courses updated: {updated}")

if __name__ == "__main__":
    main()
