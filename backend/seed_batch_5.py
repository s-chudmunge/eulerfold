import asyncio
import uuid
import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

from app.core.supabase_client import get_supabase_client
from app.routers.roadmaps import _generate_unique_slug, _generate_plan_hash

def uid():
    return str(uuid.uuid4())

async def main():
    sb = get_supabase_client()
    
    courses = [
        {
            "title": "Digital Signal Processing for Audio Engineers",
            "description": "FFT, filtering, and spectral analysis — the math behind every audio plugin and music tool.",
            "subject": "Audio Engineering",
            "modules": [
                {
                    "title": "Signals, Waves & Sampling Theory",
                    "outcome": "Understand analog-to-digital conversion, aliasing, and the Nyquist theorem in code.",
                    "timeline": "Week 1",
                    "workspace_type": "code",
                    "optimal_search_query": "Digital Audio Sampling Theory Nyquist Theorem Aliasing",
                    "proof_of_work_instructions": {
                        "what_to_build": "A Python script that generates basic waveforms (sine, square, saw) and demonstrates aliasing by undersampling a high-frequency sine wave.",
                        "what_counts_as_evidence": "Source code generating the audio arrays and the resulting .wav files.",
                        "eval_criteria": ["Correct implementation of sample rate logic", "Demonstrable aliasing effect in output"]
                    },
                    "topics": [
                        {"title": "Analog vs Digital Audio", "youtube_search_query": "Analog vs Digital Audio Sampling Theory"},
                        {"title": "The Nyquist-Shannon Theorem", "youtube_search_query": "Nyquist Shannon Sampling Theorem Aliasing DSP"},
                        {"title": "Bit Depth & Quantization Error", "youtube_search_query": "Audio Bit Depth Quantization Noise Dither DSP"}
                    ],
                    "resources": [
                        {"title": "Intro to Digital Audio", "url": "https://example.com/audio1"},
                        {"title": "Nyquist Theorem Explained", "url": "https://example.com/audio2"}
                    ]
                },
                {
                    "title": "The Fast Fourier Transform (FFT)",
                    "outcome": "Implement the FFT to analyze the frequency spectrum of audio signals.",
                    "timeline": "Week 2",
                    "workspace_type": "code",
                    "optimal_search_query": "Fast Fourier Transform Audio Spectrum Analysis",
                    "proof_of_work_instructions": {
                        "what_to_build": "A script that reads a .wav file, applies an FFT windowing function, and plots its frequency spectrum using Matplotlib.",
                        "what_counts_as_evidence": "The Python script and the plotted spectrum graph.",
                        "eval_criteria": ["Correct application of windowing (e.g. Hamming)", "Accurate magnitude spectrum plot"]
                    },
                    "topics": [
                        {"title": "Time Domain vs Frequency Domain", "youtube_search_query": "Time Domain vs Frequency Domain Audio FFT"},
                        {"title": "Windowing Functions", "youtube_search_query": "DSP Windowing Functions Hamming Hanning Audio"},
                        {"title": "Implementing FFT in Code", "youtube_search_query": "Implementing FFT Audio Analysis Python DSP"}
                    ],
                    "resources": [
                        {"title": "Understanding the FFT", "url": "https://example.com/fft1"},
                        {"title": "Windowing in DSP", "url": "https://example.com/fft2"}
                    ]
                },
                {
                    "title": "Digital Filtering (FIR & IIR)",
                    "outcome": "Design and apply low-pass and high-pass filters to audio signals.",
                    "timeline": "Week 3",
                    "workspace_type": "code",
                    "optimal_search_query": "Digital Audio Filtering FIR IIR Design",
                    "proof_of_work_instructions": {
                        "what_to_build": "A custom low-pass IIR biquad filter applied to a white noise audio sample to generate a 'muffled' sound.",
                        "what_counts_as_evidence": "The filter coefficient calculation code and the before/after audio samples.",
                        "eval_criteria": ["Correct calculation of biquad coefficients", "Filter successfully attenuates high frequencies"]
                    },
                    "topics": [
                        {"title": "FIR vs IIR Filters", "youtube_search_query": "FIR vs IIR Digital Filters DSP Audio"},
                        {"title": "The Biquad Filter Equation", "youtube_search_query": "Biquad Filter Equation Audio DSP Implementation"},
                        {"title": "Designing a Low-Pass Filter", "youtube_search_query": "Designing Low Pass Filter DSP Audio Code"}
                    ],
                    "resources": [
                        {"title": "Audio EQ Cookbook", "url": "https://example.com/filter1"},
                        {"title": "IIR Filter Design", "url": "https://example.com/filter2"}
                    ]
                }
            ]
        },
        {
            "title": "Building a Load Balancer from Scratch",
            "description": "Round-robin, least-connections, and consistent hashing — understanding the layer that sits in front of everything.",
            "subject": "Infrastructure Engineering",
            "modules": [
                {
                    "title": "TCP Sockets & Reverse Proxy Basics",
                    "outcome": "Build a basic TCP proxy that accepts connections and forwards them to a backend server.",
                    "timeline": "Week 1",
                    "workspace_type": "code",
                    "optimal_search_query": "TCP Sockets Reverse Proxy Implementation C++ Go",
                    "proof_of_work_instructions": {
                        "what_to_build": "A multithreaded (or async) TCP proxy that listens on port 8080 and forwards traffic to a single backend on port 8081.",
                        "what_counts_as_evidence": "The source code of the TCP proxy and a test script verifying traffic flow.",
                        "eval_criteria": ["Handles multiple concurrent connections", "Successfully forwards and returns TCP payload"]
                    },
                    "topics": [
                        {"title": "Socket Programming Refresher", "youtube_search_query": "TCP Socket Programming Reverse Proxy Basics"},
                        {"title": "Concurrency in Network Programming", "youtube_search_query": "Async Network Programming Concurrency Epoll TCP"},
                        {"title": "The Reverse Proxy Architecture", "youtube_search_query": "Reverse Proxy Architecture How it works TCP"}
                    ],
                    "resources": [
                        {"title": "Beej's Guide to Network Programming", "url": "https://example.com/tcp1"},
                        {"title": "Building a Reverse Proxy", "url": "https://example.com/tcp2"}
                    ]
                },
                {
                    "title": "Load Balancing Algorithms",
                    "outcome": "Implement multiple routing algorithms to distribute traffic across a pool of backend servers.",
                    "timeline": "Week 2",
                    "workspace_type": "code",
                    "optimal_search_query": "Load Balancing Algorithms Round Robin Least Connections",
                    "proof_of_work_instructions": {
                        "what_to_build": "Extend the proxy to route HTTP traffic across three backend servers using Round-Robin and Least-Connections algorithms.",
                        "what_counts_as_evidence": "The proxy code with a routing interface and test logs showing traffic distribution.",
                        "eval_criteria": ["Implementation of at least two routing algorithms", "Correct state management for least-connections"]
                    },
                    "topics": [
                        {"title": "Round-Robin and Weighted Round-Robin", "youtube_search_query": "Round Robin Load Balancing Algorithm Implementation"},
                        {"title": "Least Connections & Response Time", "youtube_search_query": "Least Connections Load Balancing Algorithm Backend"},
                        {"title": "Managing Backend Server State", "youtube_search_query": "Load Balancer State Management Active Connections"}
                    ],
                    "resources": [
                        {"title": "Load Balancing Algorithms Explained", "url": "https://example.com/lb1"},
                        {"title": "HAProxy Routing Strategies", "url": "https://example.com/lb2"}
                    ]
                },
                {
                    "title": "Consistent Hashing & Sticky Sessions",
                    "outcome": "Implement consistent hashing to route users to the same server while allowing backend pools to scale.",
                    "timeline": "Week 3",
                    "workspace_type": "code",
                    "optimal_search_query": "Consistent Hashing Ring Sticky Sessions Load Balancer",
                    "proof_of_work_instructions": {
                        "what_to_build": "A consistent hashing ring implementation that maps client IP addresses to backend servers and handles server addition/removal smoothly.",
                        "what_counts_as_evidence": "The hashing ring code and a test demonstrating minimal key reassignment when a node is removed.",
                        "eval_criteria": ["Correct hash ring distribution logic", "Handles dynamic backend pool changes"]
                    },
                    "topics": [
                        {"title": "The Problem with Modulo Hashing", "youtube_search_query": "Modulo Hashing vs Consistent Hashing Load Balancing"},
                        {"title": "Building a Consistent Hash Ring", "youtube_search_query": "Implementing Consistent Hashing Ring Algorithm"},
                        {"title": "Implementing Sticky Sessions", "youtube_search_query": "Sticky Sessions Load Balancer Implementation"}
                    ],
                    "resources": [
                        {"title": "A Guide to Consistent Hashing", "url": "https://example.com/hash1"},
                        {"title": "System Design: Consistent Hashing", "url": "https://example.com/hash2"}
                    ]
                }
            ]
        },
        {
            "title": "Infrastructure as Code: Pulumi vs Terraform Deep Dive",
            "description": "Comparing HCL's declarative model with Pulumi's imperative approach on real-world infra.",
            "subject": "DevOps",
            "modules": [
                {
                    "title": "State Management & The DAG",
                    "outcome": "Understand how IaC tools build dependency graphs and manage infrastructure state.",
                    "timeline": "Week 1",
                    "workspace_type": "code",
                    "optimal_search_query": "Terraform Pulumi State Management DAG Dependency Graph",
                    "proof_of_work_instructions": {
                        "what_to_build": "A mock IaC state parser in Python that reads a Terraform state file and prints the resource dependency graph.",
                        "what_counts_as_evidence": "The parsing script and the resulting output DAG.",
                        "eval_criteria": ["Correct parsing of state file JSON", "Accurate resolution of resource dependencies"]
                    },
                    "topics": [
                        {"title": "How Terraform Stores State", "youtube_search_query": "Terraform State Management Under the Hood"},
                        {"title": "Directed Acyclic Graphs (DAGs) in IaC", "youtube_search_query": "Terraform Pulumi Resource Dependency Graph DAG"},
                        {"title": "State Locking and Remote Backends", "youtube_search_query": "Terraform State Locking Remote Backends IaC"}
                    ],
                    "resources": [
                        {"title": "Terraform State Deep Dive", "url": "https://example.com/iac1"},
                        {"title": "Pulumi Architecture", "url": "https://example.com/iac2"}
                    ]
                },
                {
                    "title": "Declarative HCL vs Imperative Code",
                    "outcome": "Compare complex infrastructure logic implemented in Terraform HCL and Pulumi TypeScript.",
                    "timeline": "Week 2",
                    "workspace_type": "code",
                    "optimal_search_query": "Terraform HCL vs Pulumi TypeScript Loops Conditionals IaC",
                    "proof_of_work_instructions": {
                        "what_to_build": "Two identical infrastructure definitions (e.g., an S3 bucket with dynamic replication rules based on environment) — one written in Terraform HCL, one in Pulumi TypeScript.",
                        "what_counts_as_evidence": "The source code for both the Terraform and Pulumi projects.",
                        "eval_criteria": ["Correct use of HCL dynamic blocks/for_each", "Correct use of TypeScript arrays/maps in Pulumi"]
                    },
                    "topics": [
                        {"title": "HCL: Maps, Loops, and Dynamic Blocks", "youtube_search_query": "Terraform HCL for_each dynamic blocks tutorial"},
                        {"title": "Pulumi: Programming Language Control Flow", "youtube_search_query": "Pulumi TypeScript loops conditionals IaC"},
                        {"title": "Comparing Abstraction Capabilities", "youtube_search_query": "Terraform Modules vs Pulumi Component Resources"}
                    ],
                    "resources": [
                        {"title": "Advanced Terraform Syntax", "url": "https://example.com/iac3"},
                        {"title": "Pulumi Programming Model", "url": "https://example.com/iac4"}
                    ]
                }
            ]
        },
        {
            "title": "Writing a Garbage Collector",
            "description": "Implementing mark-sweep and generational GC teaches memory management better than any lecture.",
            "subject": "Systems Programming",
            "modules": [
                {
                    "title": "Memory Allocation & The Object Header",
                    "outcome": "Build a basic bump allocator and define the object memory layout for a toy language runtime.",
                    "timeline": "Week 1",
                    "workspace_type": "code",
                    "optimal_search_query": "Garbage Collector Memory Allocation Object Header C C++",
                    "proof_of_work_instructions": {
                        "what_to_build": "A C/C++ bump allocator that tracks object types, sizes, and a 'marked' bit in the object header.",
                        "what_counts_as_evidence": "The allocator source code and tests allocating multiple mock objects.",
                        "eval_criteria": ["Correct object header structure", "Allocator successfully tracks memory offset"]
                    },
                    "topics": [
                        {"title": "Anatomy of an Object in Memory", "youtube_search_query": "Object Header Memory Layout Garbage Collection"},
                        {"title": "Bump Allocation vs Free Lists", "youtube_search_query": "Bump Allocator Free List Memory Management"},
                        {"title": "Tracking Root References", "youtube_search_query": "Garbage Collector Root References Stack Tracing"}
                    ],
                    "resources": [
                        {"title": "Writing a Simple Garbage Collector in C", "url": "https://example.com/gc1"},
                        {"title": "Memory Allocation Strategies", "url": "https://example.com/gc2"}
                    ]
                },
                {
                    "title": "Implementing Mark and Sweep",
                    "outcome": "Write the core algorithms to trace live objects and reclaim unreachable memory.",
                    "timeline": "Week 2",
                    "workspace_type": "code",
                    "optimal_search_query": "Mark and Sweep Garbage Collector Implementation C",
                    "proof_of_work_instructions": {
                        "what_to_build": "A complete Mark and Sweep implementation that correctly traverses a graph of objects and frees disconnected nodes.",
                        "what_counts_as_evidence": "The GC code and a test case demonstrating successful reclamation of an orphaned cyclic graph.",
                        "eval_criteria": ["Mark phase correctly traverses references without infinite looping on cycles", "Sweep phase correctly identifies and frees unmarked objects"]
                    },
                    "topics": [
                        {"title": "The Mark Phase: Tracing the Graph", "youtube_search_query": "Mark and Sweep Garbage Collector Mark Phase Tracing"},
                        {"title": "Handling Cyclic References", "youtube_search_query": "Garbage Collection Cyclic References Graph Traversal"},
                        {"title": "The Sweep Phase: Reclaiming Memory", "youtube_search_query": "Sweep Phase Garbage Collector Memory Reclaim"}
                    ],
                    "resources": [
                        {"title": "The Mark-Sweep Algorithm", "url": "https://example.com/gc3"},
                        {"title": "Baby's First Garbage Collector", "url": "https://example.com/gc4"}
                    ]
                }
            ]
        },
        {
            "title": "Autonomous Drone Navigation with ROS2",
            "description": "Programming real robots with the Robot Operating System — from sensor fusion to path planning.",
            "subject": "Robotics",
            "modules": [
                {
                    "title": "ROS2 Nodes, Topics, and Messaging",
                    "outcome": "Set up a ROS2 workspace and create nodes that publish and subscribe to telemetry data.",
                    "timeline": "Week 1",
                    "workspace_type": "code",
                    "optimal_search_query": "ROS2 Nodes Topics Pub Sub Tutorial C++ Python",
                    "proof_of_work_instructions": {
                        "what_to_build": "A ROS2 Python node that simulates GPS coordinates and publishes them, and a subscriber node that calculates distance from an origin.",
                        "what_counts_as_evidence": "The ROS2 workspace source code and execution logs showing message passing.",
                        "eval_criteria": ["Correct use of rclpy Node architecture", "Successfully establishes Pub/Sub communication"]
                    },
                    "topics": [
                        {"title": "The ROS2 Architecture", "youtube_search_query": "ROS2 Architecture DDS Middleware Nodes"},
                        {"title": "Writing Publishers and Subscribers", "youtube_search_query": "ROS2 Publisher Subscriber Tutorial Python C++"},
                        {"title": "Custom Message Types", "youtube_search_query": "ROS2 Custom Interfaces Message Types"}
                    ],
                    "resources": [
                        {"title": "ROS2 Documentation", "url": "https://example.com/ros1"},
                        {"title": "Understanding ROS2 Nodes", "url": "https://example.com/ros2"}
                    ]
                },
                {
                    "title": "Sensor Fusion & Odometry",
                    "outcome": "Combine IMU and visual odometry data to estimate the drone's position in 3D space.",
                    "timeline": "Week 2",
                    "workspace_type": "code",
                    "optimal_search_query": "ROS2 Sensor Fusion Kalman Filter Odometry Drone",
                    "proof_of_work_instructions": {
                        "what_to_build": "A Python node implementing a simple 1D Kalman filter to smooth noisy sensor data (simulated altitude).",
                        "what_counts_as_evidence": "The filter source code and a plot comparing the noisy input vs the smoothed output.",
                        "eval_criteria": ["Implementation of the predict and update steps", "Demonstrable reduction in variance"]
                    },
                    "topics": [
                        {"title": "State Estimation Basics", "youtube_search_query": "Robot State Estimation Odometry IMU"},
                        {"title": "The Kalman Filter Explained", "youtube_search_query": "Kalman Filter Intuition Robotics Sensor Fusion"},
                        {"title": "Fusing Data Streams in ROS2", "youtube_search_query": "ROS2 robot_localization sensor fusion tutorial"}
                    ],
                    "resources": [
                        {"title": "Kalman and Bayesian Filters in Python", "url": "https://example.com/ros3"},
                        {"title": "ROS2 robot_localization Package", "url": "https://example.com/ros4"}
                    ]
                },
                {
                    "title": "Path Planning & Obstacle Avoidance",
                    "outcome": "Implement algorithms to safely navigate a drone from point A to point B.",
                    "timeline": "Week 3",
                    "workspace_type": "code",
                    "optimal_search_query": "Drone Path Planning ROS2 Navigation A* Obstacle Avoidance",
                    "proof_of_work_instructions": {
                        "what_to_build": "A 2D A* (A-Star) path planning algorithm implementation that computes a route through a grid map with obstacles.",
                        "what_counts_as_evidence": "The algorithm source code and a visual output (e.g. terminal grid) showing the computed path.",
                        "eval_criteria": ["Correct heuristic calculation (e.g., Manhattan distance)", "Successfully routes around obstacles"]
                    },
                    "topics": [
                        {"title": "Graph Search: A* and Dijkstra", "youtube_search_query": "A Star Pathfinding Algorithm Robotics ROS2"},
                        {"title": "Local vs Global Planners", "youtube_search_query": "ROS2 Nav2 Global vs Local Planners"},
                        {"title": "Reactive Obstacle Avoidance", "youtube_search_query": "Robot Obstacle Avoidance VFH Lidar ROS2"}
                    ],
                    "resources": [
                        {"title": "Nav2 Documentation", "url": "https://example.com/ros5"},
                        {"title": "Introduction to Path Planning", "url": "https://example.com/ros6"}
                    ]
                }
            ]
        }
    ]

    for c in courses:
        for m in c['modules']:
            m['id'] = uid()
            for t in m['topics']:
                t['id'] = uid()
                t['subtopics'] = [
                    {'id': uid(), 'title': 'Concept 1'},
                    {'id': uid(), 'title': 'Concept 2'},
                    {'id': uid(), 'title': 'Concept 3'}
                ]

        roadmap_plan = {
            "title": c["title"],
            "description": c["description"],
            "modules": c["modules"]
        }

        data = {
            "email": "eulerfold@gmail.com",
            "title": c["title"],
            "description": c["description"],
            "slug": await _generate_unique_slug(c["title"], "eulerfold@gmail.com", sb),
            "snapshot_hash": _generate_plan_hash(roadmap_plan),
            "is_public": True,
            "show_author": True,
            "roadmap_plan": roadmap_plan,
            "subject": c["subject"],
            "status": "active",
            "version": 1
        }
        
        res = sb.table("roadmaps").insert(data).execute()
        new_id = res.data[0]["id"]
        print(f"Inserted: {c['title']} (ID: {new_id})")

if __name__ == "__main__":
    asyncio.run(main())
