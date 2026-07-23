import json
from dotenv import load_dotenv
load_dotenv('.env')
from app.core.supabase_client import get_supabase_client

sb = get_supabase_client()

# Hardcoded expansions for top 5 courses
EXPANSIONS = {
    1422: [ # OS Kernel
        {
            "title": "CPU Exceptions and Hardware Interrupts",
            "outcome": "Handle hardware interrupts, set up the IDT (Interrupt Descriptor Table), and manage keyboard input.",
            "timeline": "Week 5",
            "workspace_type": "rust",
            "topics": [
                {
                    "title": "The Interrupt Descriptor Table",
                    "subtopics": [
                        "CPU Exceptions (Page Faults, Double Faults)",
                        "Setting up the IDT in Rust",
                        "Hardware Interrupts (PIC vs APIC)"
                    ]
                },
                {
                    "title": "Handling Timer and Keyboard",
                    "subtopics": [
                        "Programmable Interval Timer (PIT)",
                        "PS/2 Keyboard Controller",
                        "Scancode Translation"
                    ]
                },
                {
                    "title": "Proof of Work: Interrupt Driver",
                    "subtopics": [
                        "Implement IDT",
                        "Write a basic keyboard driver",
                        "Handle CPU panics gracefully"
                    ]
                }
            ]
        },
        {
            "title": "Memory Paging and Heap Allocation",
            "outcome": "Implement virtual memory using paging and build a kernel heap allocator.",
            "timeline": "Week 6",
            "workspace_type": "rust",
            "topics": [
                {
                    "title": "x86_64 Paging Architecture",
                    "subtopics": [
                        "Page Tables and Page Directories",
                        "Translating Virtual to Physical Addresses",
                        "TLB (Translation Lookaside Buffer)"
                    ]
                },
                {
                    "title": "Kernel Heap Allocation",
                    "subtopics": [
                        "Bump Allocators",
                        "Linked List Allocators",
                        "Implementing the GlobalAlloc Trait"
                    ]
                },
                {
                    "title": "Proof of Work: Paging System",
                    "subtopics": [
                        "Map new virtual pages",
                        "Implement a basic heap allocator",
                        "Test Box and Vec in kernel space"
                    ]
                }
            ]
        }
    ],
    1377: [ # TCP/IP
        {
            "title": "The TCP State Machine",
            "outcome": "Implement the core TCP state machine including the 3-way handshake and connection teardown.",
            "timeline": "Week 5",
            "workspace_type": "c",
            "topics": [
                {
                    "title": "Connection Establishment",
                    "subtopics": [
                        "SYN, SYN-ACK, ACK Handshake",
                        "Initial Sequence Numbers (ISN)",
                        "Handling SYN Floods"
                    ]
                },
                {
                    "title": "Connection Teardown",
                    "subtopics": [
                        "FIN and ACK",
                        "TIME_WAIT and CLOSE_WAIT states",
                        "Half-open connections"
                    ]
                },
                {
                    "title": "Proof of Work: Handshake Protocol",
                    "subtopics": [
                        "Implement SYN/ACK exchange",
                        "Track connection state",
                        "Handle FIN packets gracefully"
                    ]
                }
            ]
        },
        {
            "title": "Congestion Control and Windowing",
            "outcome": "Manage data flow reliability using sliding windows, retransmissions, and congestion avoidance.",
            "timeline": "Week 6",
            "workspace_type": "c",
            "topics": [
                {
                    "title": "Reliable Delivery",
                    "subtopics": [
                        "Sequence and Acknowledgment Numbers",
                        "Retransmission Timeout (RTO)",
                        "Fast Retransmit"
                    ]
                },
                {
                    "title": "Sliding Windows & Congestion",
                    "subtopics": [
                        "Receiver Window (rwnd)",
                        "Congestion Window (cwnd)",
                        "Slow Start and Congestion Avoidance"
                    ]
                },
                {
                    "title": "Proof of Work: Flow Control",
                    "subtopics": [
                        "Implement Sliding Window",
                        "Write Retransmission Logic",
                        "Calculate RTT and RTO"
                    ]
                }
            ]
        }
    ],
    1409: [ # Programming Language
        {
            "title": "Environments and Closures",
            "outcome": "Implement lexical scoping, nested environments, and first-class functions (closures).",
            "timeline": "Week 5",
            "workspace_type": "python",
            "topics": [
                {
                    "title": "Lexical Scoping",
                    "subtopics": [
                        "Environment Data Structures",
                        "Variable Resolution",
                        "Shadowing"
                    ]
                },
                {
                    "title": "First-Class Functions",
                    "subtopics": [
                        "Function Definitions as Values",
                        "Call Expressions",
                        "Capturing Environments (Closures)"
                    ]
                },
                {
                    "title": "Proof of Work: Closure Support",
                    "subtopics": [
                        "Implement Environment Chaining",
                        "Add Function Calls",
                        "Test Lexical Closures"
                    ]
                }
            ]
        },
        {
            "title": "Garbage Collection Basics",
            "outcome": "Write a simple mark-and-sweep garbage collector for the language runtime.",
            "timeline": "Week 6",
            "workspace_type": "python",
            "topics": [
                {
                    "title": "Memory Management Theory",
                    "subtopics": [
                        "The Heap vs Stack",
                        "Reference Counting Pros/Cons",
                        "Tracing Garbage Collection"
                    ]
                },
                {
                    "title": "Mark and Sweep",
                    "subtopics": [
                        "Root Object Identification",
                        "The Marking Phase (Graph Traversal)",
                        "The Sweeping Phase (Reclamation)"
                    ]
                },
                {
                    "title": "Proof of Work: Mark-and-Sweep",
                    "subtopics": [
                        "Track allocated objects",
                        "Implement GC traverse",
                        "Free unreachable memory"
                    ]
                }
            ]
        }
    ],
    1371: [ # Raft
        {
            "title": "Cluster Membership Changes",
            "outcome": "Safely add and remove nodes from a running Raft cluster without downtime or split-brain.",
            "timeline": "Week 5",
            "workspace_type": "go",
            "topics": [
                {
                    "title": "The Configuration Problem",
                    "subtopics": [
                        "Why naïve membership changes fail",
                        "Joint Consensus Approach",
                        "Single-Server Changes"
                    ]
                },
                {
                    "title": "Implementing Membership Logs",
                    "subtopics": [
                        "Configuration entries in the log",
                        "Catching up new nodes",
                        "Stepping down removed leaders"
                    ]
                },
                {
                    "title": "Proof of Work: Dynamic Cluster",
                    "subtopics": [
                        "Add AddServer RPC",
                        "Add RemoveServer RPC",
                        "Test cluster expansion under load"
                    ]
                }
            ]
        },
        {
            "title": "Log Compaction and Snapshotting",
            "outcome": "Prevent the Raft log from growing infinitely by implementing state machine snapshotting.",
            "timeline": "Week 6",
            "workspace_type": "go",
            "topics": [
                {
                    "title": "Snapshotting Strategies",
                    "subtopics": [
                        "Memory-based vs Disk-based logs",
                        "When to trigger a snapshot",
                        "Truncating the Raft log"
                    ]
                },
                {
                    "title": "InstallSnapshot RPC",
                    "subtopics": [
                        "Sending snapshots to lagging followers",
                        "Chunking large snapshots",
                        "Applying snapshots to the state machine"
                    ]
                },
                {
                    "title": "Proof of Work: Log Compaction",
                    "subtopics": [
                        "Implement InstallSnapshot",
                        "Trigger log truncation",
                        "Recover a node from a snapshot"
                    ]
                }
            ]
        }
    ],
    1440: [ # K8s Networking
        {
            "title": "eBPF and Cilium",
            "outcome": "Understand how eBPF replaces iptables for high-performance Kubernetes networking and security.",
            "timeline": "Week 5",
            "workspace_type": "linux",
            "topics": [
                {
                    "title": "eBPF Fundamentals",
                    "subtopics": [
                        "What is eBPF?",
                        "XDP (eXpress Data Path)",
                        "Bypassing the standard Linux network stack"
                    ]
                },
                {
                    "title": "Cilium Architecture",
                    "subtopics": [
                        "Cilium as a CNI",
                        "Identity-based security",
                        "Hubble for Observability"
                    ]
                },
                {
                    "title": "Proof of Work: Deploy Cilium",
                    "subtopics": [
                        "Replace default CNI with Cilium",
                        "Write an eBPF network policy",
                        "Trace drops with Hubble"
                    ]
                }
            ]
        },
        {
            "title": "Service Mesh Internals (Envoy & Istio)",
            "outcome": "Deploy and debug a Service Mesh, understanding sidecar injection and mTLS.",
            "timeline": "Week 6",
            "workspace_type": "linux",
            "topics": [
                {
                    "title": "The Sidecar Pattern & Envoy",
                    "subtopics": [
                        "Envoy Proxy Architecture",
                        "Traffic interception via iptables",
                        "xDS APIs"
                    ]
                },
                {
                    "title": "Istio Control Plane",
                    "subtopics": [
                        "Istiod architecture",
                        "Mutual TLS (mTLS) implementation",
                        "Traffic routing and shifting"
                    ]
                },
                {
                    "title": "Proof of Work: Mesh Routing",
                    "subtopics": [
                        "Deploy Istio",
                        "Configure canary routing",
                        "Enforce strict mTLS"
                    ]
                }
            ]
        }
    ]
}

def main():
    for course_id, new_modules in EXPANSIONS.items():
        res = sb.table('roadmaps').select('title, roadmap_plan').eq('id', course_id).execute()
        if not res.data:
            continue
            
        course = res.data[0]
        plan = course.get('roadmap_plan', {})
        if isinstance(plan, str):
            plan = json.loads(plan)
            
        # Ensure all existing and new subtopics have standard fields ready for enrichment
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
        
        # Update DB
        sb.table('roadmaps').update({'roadmap_plan': plan}).eq('id', course_id).execute()
        print(f"Added {len(new_modules)} modules to Course {course_id} - {course['title']}")

if __name__ == "__main__":
    main()
