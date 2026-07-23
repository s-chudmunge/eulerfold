"""
Fix the final 5 courses (1451-1455):
1. Replace all placeholder subtopics ('Concept 1/2/3') with real content
2. Add missing modules so each course has 4 modules
"""
import json
import uuid
import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

from app.core.supabase_client import get_supabase_client

def uid():
    return str(uuid.uuid4())


# ── Real subtopics + new modules for each course ──

FIXES = {
    1451: {
        "subtopics": {
            "Analog vs Digital Audio": [
                "Continuous vs discrete signal representation",
                "ADC and DAC conversion process",
                "Sample-and-hold circuits"
            ],
            "The Nyquist-Shannon Theorem": [
                "Nyquist frequency and the folding limit",
                "Aliasing artifacts in undersampled signals",
                "Anti-aliasing filter design"
            ],
            "Bit Depth & Quantization Error": [
                "Signal-to-quantization-noise ratio (SQNR)",
                "Dithering techniques to mask quantization",
                "Dynamic range vs bit depth tradeoffs"
            ],
            "Time Domain vs Frequency Domain": [
                "Interpreting amplitude-vs-time plots",
                "Spectral representation of periodic signals",
                "The Fourier series as a bridge between domains"
            ],
            "Windowing Functions": [
                "Spectral leakage and why windowing matters",
                "Hamming vs Hanning vs Blackman tradeoffs",
                "Overlap-add and overlap-save methods"
            ],
            "Implementing FFT in Code": [
                "Cooley-Tukey radix-2 butterfly algorithm",
                "Zero-padding for frequency resolution",
                "Real-valued FFT optimizations (rfft)"
            ],
            "FIR vs IIR Filters": [
                "Linear phase property of FIR filters",
                "Feedback loops and stability in IIR filters",
                "Computational cost comparison"
            ],
            "The Biquad Filter Equation": [
                "Transfer function H(z) and the z-plane",
                "Direct Form I vs Direct Form II implementation",
                "Pole-zero placement for filter shaping"
            ],
            "Designing a Low-Pass Filter": [
                "Cutoff frequency and roll-off slope",
                "Butterworth vs Chebyshev response curves",
                "Cascading biquad sections for steeper filters"
            ]
        },
        "new_modules": [
            {
                "id": uid(),
                "title": "Spectral Analysis & Real-Time Audio Processing",
                "outcome": "Build a real-time spectrogram and apply effects to live audio streams.",
                "timeline": "Week 4",
                "workspace_type": "code",
                "optimal_search_query": "Real-Time Audio Processing Spectrogram Python",
                "proof_of_work_instructions": {
                    "what_to_build": "A Python application using PyAudio that captures microphone input and renders a live scrolling spectrogram using matplotlib or pygame.",
                    "what_counts_as_evidence": "The source code and a screenshot or recording of the live spectrogram.",
                    "eval_criteria": [
                        "Real-time capture and FFT computation without dropped frames",
                        "Spectrogram correctly maps frequency bins to visual output"
                    ]
                },
                "resources": [],
                "topics": [
                    {
                        "id": uid(),
                        "title": "Short-Time Fourier Transform (STFT)",
                        "youtube_search_query": "Short Time Fourier Transform STFT Audio Spectrogram",
                        "subtopics": [
                            {"id": uid(), "title": "Hop size and frame overlap"},
                            {"id": uid(), "title": "Time-frequency resolution tradeoff"},
                            {"id": uid(), "title": "Generating spectrograms from STFT output"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Real-Time Audio I/O with PyAudio",
                        "youtube_search_query": "PyAudio Real-Time Audio Processing Python Tutorial",
                        "subtopics": [
                            {"id": uid(), "title": "Callback-based vs blocking I/O modes"},
                            {"id": uid(), "title": "Buffer sizing and latency tradeoffs"},
                            {"id": uid(), "title": "Handling underruns and overflows"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Building Audio Effects (Reverb, Delay, Chorus)",
                        "youtube_search_query": "Audio Effects Reverb Delay DSP Python Implementation",
                        "subtopics": [
                            {"id": uid(), "title": "Circular buffer delay lines"},
                            {"id": uid(), "title": "Feedback delay networks for reverb"},
                            {"id": uid(), "title": "LFO modulation for chorus and flanger"}
                        ]
                    }
                ]
            }
        ]
    },
    1452: {
        "subtopics": {
            "Socket Programming Refresher": [
                "TCP three-way handshake mechanics",
                "Blocking vs non-blocking socket modes",
                "SO_REUSEADDR and socket options"
            ],
            "Concurrency in Network Programming": [
                "Thread-per-connection vs event loop models",
                "epoll/kqueue for I/O multiplexing",
                "Handling partial reads and writes"
            ],
            "The Reverse Proxy Architecture": [
                "L4 vs L7 proxy differences",
                "Connection pooling to backends",
                "X-Forwarded-For and header propagation"
            ],
            "Round-Robin and Weighted Round-Robin": [
                "Simple round-robin counter logic",
                "Weight assignment and selection probability",
                "Smooth weighted round-robin algorithm"
            ],
            "Least Connections & Response Time": [
                "Tracking active connection counts per backend",
                "Response-time weighted selection",
                "Handling slow backends gracefully"
            ],
            "Managing Backend Server State": [
                "Backend health status data structures",
                "Thread-safe state updates",
                "Draining connections during removal"
            ],
            "The Problem with Modulo Hashing": [
                "Key redistribution on node addition/removal",
                "Cache invalidation storms",
                "Why simple hashing breaks at scale"
            ],
            "Building a Consistent Hash Ring": [
                "Virtual nodes for even distribution",
                "Binary search on the hash ring",
                "Ring rebalancing when nodes join or leave"
            ],
            "Implementing Sticky Sessions": [
                "Cookie-based session affinity",
                "Source IP hashing for stateless stickiness",
                "Failover behavior when a sticky backend dies"
            ]
        },
        "new_modules": [
            {
                "id": uid(),
                "title": "Health Checks, Failover & Observability",
                "outcome": "Add active and passive health checking to automatically remove unhealthy backends and monitor load balancer metrics.",
                "timeline": "Week 4",
                "workspace_type": "code",
                "optimal_search_query": "Load Balancer Health Check Failover Monitoring",
                "proof_of_work_instructions": {
                    "what_to_build": "Extend the load balancer with periodic TCP/HTTP health checks that automatically mark backends as up/down, plus a /stats endpoint exposing per-backend request counts and latency percentiles.",
                    "what_counts_as_evidence": "The health check and stats code, plus a test demonstrating automatic backend removal when a server stops responding.",
                    "eval_criteria": [
                        "Health checks correctly detect and recover from backend failures",
                        "Stats endpoint reports accurate per-backend metrics"
                    ]
                },
                "resources": [],
                "topics": [
                    {
                        "id": uid(),
                        "title": "Active vs Passive Health Checking",
                        "youtube_search_query": "Load Balancer Active Passive Health Check Implementation",
                        "subtopics": [
                            {"id": uid(), "title": "Periodic probe intervals and thresholds"},
                            {"id": uid(), "title": "Detecting failures from real traffic errors"},
                            {"id": uid(), "title": "Exponential backoff for recovery checks"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Graceful Failover & Connection Draining",
                        "youtube_search_query": "Load Balancer Graceful Failover Connection Draining",
                        "subtopics": [
                            {"id": uid(), "title": "Draining in-flight requests before removal"},
                            {"id": uid(), "title": "Circuit breaker pattern for backends"},
                            {"id": uid(), "title": "Retry logic and idempotency concerns"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Metrics, Logging & Dashboards",
                        "youtube_search_query": "Load Balancer Metrics Monitoring Observability",
                        "subtopics": [
                            {"id": uid(), "title": "Tracking requests per second and error rates"},
                            {"id": uid(), "title": "Latency histogram collection (p50, p99)"},
                            {"id": uid(), "title": "Structured logging for debugging traffic flow"}
                        ]
                    }
                ]
            }
        ]
    },
    1453: {
        "subtopics": {
            "How Terraform Stores State": [
                "The tfstate JSON structure",
                "Resource addressing and indexing",
                "Sensitive values and state encryption"
            ],
            "Directed Acyclic Graphs (DAGs) in IaC": [
                "Implicit vs explicit dependencies",
                "Parallelism limits and graph traversal",
                "Visualizing the plan graph with terraform graph"
            ],
            "State Locking and Remote Backends": [
                "DynamoDB locking for S3 backends",
                "Pulumi's built-in state management",
                "State migration between backends"
            ],
            "HCL: Maps, Loops, and Dynamic Blocks": [
                "for_each vs count tradeoffs",
                "Dynamic blocks for nested configuration",
                "Local values and data transformations"
            ],
            "Pulumi: Programming Language Control Flow": [
                "Loops and conditionals in real code",
                "Async/await for resource ordering",
                "Unit testing infrastructure with standard frameworks"
            ],
            "Comparing Abstraction Capabilities": [
                "Terraform modules vs Pulumi component resources",
                "Sharing infrastructure libraries via registries",
                "Refactoring and code reuse patterns"
            ]
        },
        "new_modules": [
            {
                "id": uid(),
                "title": "Testing, CI/CD & Policy as Code",
                "outcome": "Write infrastructure tests and enforce compliance policies in an automated pipeline.",
                "timeline": "Week 3",
                "workspace_type": "code",
                "optimal_search_query": "Infrastructure Testing Policy as Code OPA Terraform Pulumi",
                "proof_of_work_instructions": {
                    "what_to_build": "A GitHub Actions CI pipeline that runs terraform plan with OPA policy checks that block deployments creating public S3 buckets or overly permissive security groups.",
                    "what_counts_as_evidence": "The CI workflow YAML, the OPA/Rego policy files, and a test showing a blocked deployment.",
                    "eval_criteria": [
                        "Policy correctly detects and blocks non-compliant resources",
                        "CI pipeline integrates plan, policy check, and conditional apply"
                    ]
                },
                "resources": [],
                "topics": [
                    {
                        "id": uid(),
                        "title": "Unit Testing Infrastructure Code",
                        "youtube_search_query": "Terraform Testing Framework Pulumi Unit Tests IaC",
                        "subtopics": [
                            {"id": uid(), "title": "terraform test framework and .tftest.hcl files"},
                            {"id": uid(), "title": "Pulumi's built-in unit and integration testing"},
                            {"id": uid(), "title": "Mocking cloud provider APIs in tests"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Policy as Code with OPA and Sentinel",
                        "youtube_search_query": "Open Policy Agent OPA Terraform Sentinel Policy as Code",
                        "subtopics": [
                            {"id": uid(), "title": "Writing Rego policies for plan JSON"},
                            {"id": uid(), "title": "HashiCorp Sentinel vs OPA tradeoffs"},
                            {"id": uid(), "title": "Enforcing tagging and naming conventions"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "CI/CD Pipelines for Infrastructure",
                        "youtube_search_query": "Terraform CI CD Pipeline GitHub Actions GitLab",
                        "subtopics": [
                            {"id": uid(), "title": "Plan on PR, apply on merge workflows"},
                            {"id": uid(), "title": "Drift detection and scheduled reconciliation"},
                            {"id": uid(), "title": "Managing multiple environments with workspaces"}
                        ]
                    }
                ]
            },
            {
                "id": uid(),
                "title": "Multi-Cloud, Imports & Migration Strategies",
                "outcome": "Manage existing infrastructure by importing resources and plan a migration between IaC tools.",
                "timeline": "Week 4",
                "workspace_type": "code",
                "optimal_search_query": "Terraform Import Pulumi Import Multi-Cloud IaC Migration",
                "proof_of_work_instructions": {
                    "what_to_build": "A script that imports an existing manually-created AWS resource into Terraform state and generates the corresponding HCL configuration, then converts it to equivalent Pulumi TypeScript.",
                    "what_counts_as_evidence": "The import commands, generated HCL, equivalent Pulumi code, and a diff showing functional parity.",
                    "eval_criteria": [
                        "Resource successfully imported without state corruption",
                        "Pulumi code produces an identical plan to the Terraform original"
                    ]
                },
                "resources": [],
                "topics": [
                    {
                        "id": uid(),
                        "title": "Importing Existing Infrastructure",
                        "youtube_search_query": "Terraform Import Existing Resources State Management",
                        "subtopics": [
                            {"id": uid(), "title": "terraform import vs import blocks (v1.5+)"},
                            {"id": uid(), "title": "Pulumi import and code generation"},
                            {"id": uid(), "title": "Handling resource drift after import"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Multi-Cloud Patterns & Provider Management",
                        "youtube_search_query": "Terraform Multi-Cloud AWS GCP Azure Provider Configuration",
                        "subtopics": [
                            {"id": uid(), "title": "Provider aliasing for multi-region setups"},
                            {"id": uid(), "title": "Pulumi's native multi-cloud SDK support"},
                            {"id": uid(), "title": "Abstracting cloud-specific resources"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Migrating Between IaC Tools",
                        "youtube_search_query": "Migrate Terraform to Pulumi CDK Migration Strategy",
                        "subtopics": [
                            {"id": uid(), "title": "pulumi convert for HCL-to-code translation"},
                            {"id": uid(), "title": "Incremental migration strategies"},
                            {"id": uid(), "title": "Risk assessment and rollback planning"}
                        ]
                    }
                ]
            }
        ]
    },
    1454: {
        "subtopics": {
            "Anatomy of an Object in Memory": [
                "Object header fields: type tag, size, GC bits",
                "Pointer tagging and NaN boxing techniques",
                "Alignment requirements and padding"
            ],
            "Bump Allocation vs Free Lists": [
                "Bump pointer allocation and arena boundaries",
                "Free list insertion and coalescing",
                "Fragmentation tradeoffs between strategies"
            ],
            "Tracking Root References": [
                "Stack roots vs global roots",
                "Conservative vs precise root scanning",
                "Register spilling for root safety"
            ],
            "The Mark Phase: Tracing the Graph": [
                "Depth-first vs breadth-first traversal",
                "Tri-color marking abstraction",
                "Worklist management and stack overflow handling"
            ],
            "Handling Cyclic References": [
                "Why reference counting fails on cycles",
                "Tracing collectors naturally handle cycles",
                "Weak references and backward edges"
            ],
            "The Sweep Phase: Reclaiming Memory": [
                "Linear sweep through the heap",
                "Resetting mark bits for the next cycle",
                "Building a free list from swept blocks"
            ]
        },
        "new_modules": [
            {
                "id": uid(),
                "title": "Generational & Copying Garbage Collection",
                "outcome": "Implement a generational collector that exploits the weak generational hypothesis for faster collection.",
                "timeline": "Week 3",
                "workspace_type": "code",
                "optimal_search_query": "Generational Garbage Collection Copying Collector Implementation",
                "proof_of_work_instructions": {
                    "what_to_build": "A two-generation collector in C that uses a semi-space copying algorithm for the young generation and falls back to mark-sweep for the old generation.",
                    "what_counts_as_evidence": "The collector source code and a benchmark showing that minor collections are faster than full-heap collections.",
                    "eval_criteria": [
                        "Correct Cheney semi-space copying with pointer forwarding",
                        "Promotion logic correctly ages objects into the old generation"
                    ]
                },
                "resources": [],
                "topics": [
                    {
                        "id": uid(),
                        "title": "The Weak Generational Hypothesis",
                        "youtube_search_query": "Generational Garbage Collection Weak Generational Hypothesis",
                        "subtopics": [
                            {"id": uid(), "title": "Most objects die young: empirical evidence"},
                            {"id": uid(), "title": "Nursery/young generation sizing"},
                            {"id": uid(), "title": "Minor vs major collection frequency"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Semi-Space Copying Collector",
                        "youtube_search_query": "Copying Garbage Collector Semi-Space Cheney Algorithm",
                        "subtopics": [
                            {"id": uid(), "title": "Cheney's breadth-first copying algorithm"},
                            {"id": uid(), "title": "Forwarding pointers and pointer fixup"},
                            {"id": uid(), "title": "Memory compaction as a side effect"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Write Barriers & Remembered Sets",
                        "youtube_search_query": "Write Barrier Remembered Set Generational GC",
                        "subtopics": [
                            {"id": uid(), "title": "Why old-to-young pointers need tracking"},
                            {"id": uid(), "title": "Card marking vs remembered sets"},
                            {"id": uid(), "title": "Write barrier insertion by the compiler"}
                        ]
                    }
                ]
            },
            {
                "id": uid(),
                "title": "Concurrent Collection & GC in Production",
                "outcome": "Understand how production GCs (Go, JVM, V8) minimize pause times and how to tune them.",
                "timeline": "Week 4",
                "workspace_type": "research",
                "optimal_search_query": "Concurrent Garbage Collection Go GC JVM G1 ZGC",
                "proof_of_work_instructions": {
                    "what_to_build": "A written analysis comparing Go's concurrent tri-color collector, JVM's G1GC, and V8's Orinoco — covering their pause time strategies, throughput tradeoffs, and tuning knobs.",
                    "what_counts_as_evidence": "A structured document with architecture diagrams and benchmark data citations.",
                    "eval_criteria": [
                        "Accurate description of each collector's concurrent marking strategy",
                        "Correct identification of tradeoffs (throughput vs latency vs memory)"
                    ]
                },
                "resources": [],
                "topics": [
                    {
                        "id": uid(),
                        "title": "Concurrent & Incremental Collection",
                        "youtube_search_query": "Concurrent Garbage Collection Tri-Color Marking Incremental",
                        "subtopics": [
                            {"id": uid(), "title": "Stop-the-world vs concurrent phases"},
                            {"id": uid(), "title": "Tri-color invariant and the lost object problem"},
                            {"id": uid(), "title": "Snapshot-at-the-beginning vs incremental update"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Production GCs: Go, JVM G1/ZGC, V8 Orinoco",
                        "youtube_search_query": "Go Garbage Collector JVM G1GC ZGC V8 Orinoco Comparison",
                        "subtopics": [
                            {"id": uid(), "title": "Go's pacer and GOGC tuning"},
                            {"id": uid(), "title": "G1GC region-based collection and mixed GCs"},
                            {"id": uid(), "title": "ZGC's colored pointers and load barriers"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "GC Tuning & Profiling in Practice",
                        "youtube_search_query": "Garbage Collection Tuning Profiling JVM Go Production",
                        "subtopics": [
                            {"id": uid(), "title": "Reading GC logs and identifying long pauses"},
                            {"id": uid(), "title": "Heap sizing and allocation rate analysis"},
                            {"id": uid(), "title": "Object pooling and allocation avoidance patterns"}
                        ]
                    }
                ]
            }
        ]
    },
    1455: {
        "subtopics": {
            "The ROS2 Architecture": [
                "DDS middleware and the publish-subscribe model",
                "ROS2 executors and callback groups",
                "Lifecycle nodes and managed transitions"
            ],
            "Writing Publishers and Subscribers": [
                "Creating rclpy/rclcpp nodes from scratch",
                "QoS profiles: reliable vs best-effort",
                "Topic remapping and namespaces"
            ],
            "Custom Message Types": [
                "Defining .msg and .srv interface files",
                "Building custom interfaces with colcon",
                "Nested message types and arrays"
            ],
            "State Estimation Basics": [
                "Pose representation (position + orientation)",
                "Dead reckoning from wheel encoders",
                "Drift accumulation and correction strategies"
            ],
            "The Kalman Filter Explained": [
                "Prediction step: state transition model",
                "Update step: measurement incorporation",
                "Kalman gain and uncertainty reduction"
            ],
            "Fusing Data Streams in ROS2": [
                "The robot_localization package (EKF node)",
                "Configuring IMU + GPS + odometry fusion",
                "TF2 transform tree for coordinate frames"
            ],
            "Graph Search: A* and Dijkstra": [
                "Priority queues and heuristic functions",
                "Admissibility and optimality guarantees",
                "Grid-based vs graph-based search spaces"
            ],
            "Local vs Global Planners": [
                "Global costmap and static obstacle layers",
                "Local planner: DWA and trajectory rollout",
                "Recovery behaviors when stuck"
            ],
            "Reactive Obstacle Avoidance": [
                "Vector Field Histogram (VFH) approach",
                "Potential field methods and local minima",
                "LiDAR scan processing for obstacle detection"
            ]
        },
        "new_modules": [
            {
                "id": uid(),
                "title": "Simulation, SLAM & Autonomous Flight",
                "outcome": "Simulate a drone in Gazebo, implement basic SLAM, and execute an autonomous waypoint mission.",
                "timeline": "Week 4",
                "workspace_type": "code",
                "optimal_search_query": "ROS2 Gazebo Drone Simulation SLAM Autonomous Mission",
                "proof_of_work_instructions": {
                    "what_to_build": "A Gazebo simulation of a quadrotor executing an autonomous waypoint mission through a cluttered environment, using a 2D LiDAR SLAM algorithm to build a map in real time.",
                    "what_counts_as_evidence": "The ROS2 launch files, the SLAM configuration, and a screen recording of the simulated drone completing the mission.",
                    "eval_criteria": [
                        "Drone successfully navigates between at least 3 waypoints autonomously",
                        "SLAM map accurately reflects the simulated environment obstacles"
                    ]
                },
                "resources": [],
                "topics": [
                    {
                        "id": uid(),
                        "title": "Gazebo Simulation for Drones",
                        "youtube_search_query": "ROS2 Gazebo Drone Quadrotor Simulation Tutorial",
                        "subtopics": [
                            {"id": uid(), "title": "Setting up a Gazebo world with obstacles"},
                            {"id": uid(), "title": "Spawning a drone model with sensor plugins"},
                            {"id": uid(), "title": "Bridging Gazebo topics to ROS2"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Introduction to SLAM",
                        "youtube_search_query": "SLAM Simultaneous Localization Mapping ROS2 LiDAR",
                        "subtopics": [
                            {"id": uid(), "title": "The SLAM problem: chicken-and-egg of map and pose"},
                            {"id": uid(), "title": "Occupancy grid mapping from LiDAR scans"},
                            {"id": uid(), "title": "Using slam_toolbox in ROS2"}
                        ]
                    },
                    {
                        "id": uid(),
                        "title": "Autonomous Waypoint Missions",
                        "youtube_search_query": "ROS2 Autonomous Drone Waypoint Navigation Mission",
                        "subtopics": [
                            {"id": uid(), "title": "Defining waypoint sequences and mission logic"},
                            {"id": uid(), "title": "PX4/MAVROS integration for flight control"},
                            {"id": uid(), "title": "Geofencing and safety constraints"}
                        ]
                    }
                ]
            }
        ]
    }
}


def main():
    sb = get_supabase_client()
    
    for course_id, fix_data in FIXES.items():
        print(f"\n{'='*60}")
        print(f"Fixing course {course_id}...")
        print(f"{'='*60}")
        
        res = sb.table("roadmaps").select("roadmap_plan, title").eq("id", course_id).execute()
        plan = res.data[0]["roadmap_plan"]
        title = res.data[0]["title"]
        if isinstance(plan, str):
            plan = json.loads(plan)
        
        # 1. Fix placeholder subtopics
        subtopic_map = fix_data.get("subtopics", {})
        fixed_count = 0
        for m in plan.get("modules", []):
            for t in m.get("topics", []):
                topic_title = t.get("title", "")
                if topic_title in subtopic_map:
                    real_subs = subtopic_map[topic_title]
                    t["subtopics"] = [
                        {"id": uid(), "title": s} for s in real_subs
                    ]
                    fixed_count += len(real_subs)
        
        print(f"  Fixed {fixed_count} placeholder subtopics")
        
        # 2. Add new modules
        new_modules = fix_data.get("new_modules", [])
        for nm in new_modules:
            plan["modules"].append(nm)
            print(f"  Added module: {nm['title']}")
        
        # 3. Save back
        sb.table("roadmaps").update({"roadmap_plan": plan}).eq("id", course_id).execute()
        print(f"  Saved {title} (now {len(plan['modules'])} modules)")


if __name__ == "__main__":
    main()
