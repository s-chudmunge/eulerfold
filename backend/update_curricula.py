import os
import json
import uuid
import psycopg2
from dotenv import load_dotenv

# Load env variables from backend
load_dotenv("/home/sankalp/Documents/projects/eulerfold/backend/.env")

# Database connection
db_url = os.environ.get("DATABASE_URL")
conn = psycopg2.connect(db_url)
cursor = conn.cursor()

def create_uuid():
    return str(uuid.uuid4())

# 1. Rust Programming Basics (1465)
rust_plan = {
    "prerequisites": ["Basic understanding of programming concepts (variables, loops, functions)", "Familiarity with command-line interfaces"],
    "what_you_will_learn": [
        "Rust's unique ownership, borrowing, and lifetime systems",
        "Memory safety without a garbage collector",
        "Concurrency and thread safety in Rust",
        "Error handling patterns in Rust",
        "Building and testing robust applications"
    ],
    "modules": [
        {
            "title": "Module 1: Introduction and Tooling",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Installing and Configuring Rust (rustup, cargo)",
                    "youtube_search_query": "Rust programming installation and cargo tutorial",
                    "optimal_search_query": "How to install rustup and use cargo for Rust projects"
                },
                {
                    "id": create_uuid(),
                    "title": "Rust Syntax Fundamentals: Variables, Mutability, and Data Types",
                    "youtube_search_query": "Rust variables mutability data types",
                    "optimal_search_query": "Rust language fundamentals variables and mutability"
                },
                {
                    "id": create_uuid(),
                    "title": "Control Flow: if, let, loops, and match",
                    "youtube_search_query": "Rust control flow if let loop match",
                    "optimal_search_query": "Rust control flow mechanisms pattern matching"
                }
            ]
        },
        {
            "title": "Module 2: Ownership and Borrowing",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "The Ownership Rules and Memory Safety",
                    "youtube_search_query": "Rust ownership rules explained",
                    "optimal_search_query": "Understanding Rust ownership and memory management"
                },
                {
                    "id": create_uuid(),
                    "title": "References, Borrowing, and Slice Types",
                    "youtube_search_query": "Rust borrowing references slices",
                    "optimal_search_query": "Rust references and borrowing rules explained"
                },
                {
                    "id": create_uuid(),
                    "title": "Introduction to Lifetimes",
                    "youtube_search_query": "Rust lifetimes tutorial basics",
                    "optimal_search_query": "Rust lifetimes syntax and memory safety guarantees"
                }
            ]
        },
        {
            "title": "Module 3: Structs, Enums, and Pattern Matching",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Defining and Instantiating Structs",
                    "youtube_search_query": "Rust structs implementation and methods",
                    "optimal_search_query": "Rust struct definitions and method syntax"
                },
                {
                    "id": create_uuid(),
                    "title": "Enums and the Option/Result Types",
                    "youtube_search_query": "Rust enums Option Result type",
                    "optimal_search_query": "Rust enums and handling Option and Result"
                },
                {
                    "id": create_uuid(),
                    "title": "Advanced Pattern Matching with match and if let",
                    "youtube_search_query": "Rust advanced pattern matching",
                    "optimal_search_query": "Rust pattern matching exhaustive checks"
                }
            ]
        },
        {
            "title": "Module 4: Error Handling and Collections",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Unrecoverable Errors with panic!",
                    "youtube_search_query": "Rust panic and unrecoverable errors",
                    "optimal_search_query": "Rust panic! macro and unwinding"
                },
                {
                    "id": create_uuid(),
                    "title": "Recoverable Errors with Result and the ? Operator",
                    "youtube_search_query": "Rust Result type and question mark operator",
                    "optimal_search_query": "Rust error propagation with the ? operator"
                },
                {
                    "id": create_uuid(),
                    "title": "Common Collections: Vectors, Strings, and Hash Maps",
                    "youtube_search_query": "Rust collections vector string hashmap",
                    "optimal_search_query": "Rust standard library collections usage"
                }
            ]
        },
        {
            "title": "Module 5: Generics, Traits, and Lifetimes",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Generic Data Types and Functions",
                    "youtube_search_query": "Rust generic types and functions",
                    "optimal_search_query": "Rust generics syntax and monomorphization"
                },
                {
                    "id": create_uuid(),
                    "title": "Traits: Defining Shared Behavior",
                    "youtube_search_query": "Rust traits and shared behavior",
                    "optimal_search_query": "Rust traits implementation and trait bounds"
                },
                {
                    "id": create_uuid(),
                    "title": "Validating References with Lifetimes",
                    "youtube_search_query": "Rust advanced lifetimes validation",
                    "optimal_search_query": "Rust lifetime annotations and elision rules"
                }
            ]
        },
        {
            "title": "Module 6: Advanced Topics and Concurrency",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Smart Pointers (Box, Rc, RefCell)",
                    "youtube_search_query": "Rust smart pointers Box Rc RefCell",
                    "optimal_search_query": "Rust Box Rc RefCell smart pointers explained"
                },
                {
                    "id": create_uuid(),
                    "title": "Fearless Concurrency: Threads and Message Passing",
                    "youtube_search_query": "Rust concurrency threads channels",
                    "optimal_search_query": "Rust multithreading and mpsc channels"
                },
                {
                    "id": create_uuid(),
                    "title": "Shared-State Concurrency (Mutex, Arc)",
                    "youtube_search_query": "Rust shared state Mutex Arc",
                    "optimal_search_query": "Rust Mutex and Arc thread safe shared state"
                }
            ]
        }
    ]
}

# 2. Linear Algebra for Graphics (1464)
linalg_plan = {
    "prerequisites": ["High school algebra and geometry", "Basic programming skills"],
    "what_you_will_learn": [
        "Vectors and matrices operations essential for 3D graphics",
        "Coordinate systems, transformations, and basis vectors",
        "Quaternions for 3D rotations",
        "Projection matrices and camera math",
        "Solving linear equations for physics and lighting calculations"
    ],
    "modules": [
        {
            "title": "Module 1: Vectors and Vector Spaces",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Introduction to Vectors (Magnitude, Direction, Addition)",
                    "youtube_search_query": "Linear algebra vectors magnitude direction addition",
                    "optimal_search_query": "Vectors in linear algebra addition and scalar multiplication"
                },
                {
                    "id": create_uuid(),
                    "title": "The Dot Product and Projections",
                    "youtube_search_query": "Linear algebra dot product geometric interpretation",
                    "optimal_search_query": "Dot product properties and vector projection math"
                },
                {
                    "id": create_uuid(),
                    "title": "The Cross Product in 3D Space",
                    "youtube_search_query": "Linear algebra cross product 3d geometry",
                    "optimal_search_query": "Cross product computation and geometric meaning"
                }
            ]
        },
        {
            "title": "Module 2: Matrices and Linear Transformations",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Matrix Basics and Multiplication",
                    "youtube_search_query": "Linear algebra matrix multiplication basics",
                    "optimal_search_query": "Matrix multiplication rules and properties"
                },
                {
                    "id": create_uuid(),
                    "title": "Linear Transformations and Matrices",
                    "youtube_search_query": "Linear algebra linear transformations visually",
                    "optimal_search_query": "Matrix representation of linear transformations"
                },
                {
                    "id": create_uuid(),
                    "title": "Determinants and Inverse Matrices",
                    "youtube_search_query": "Linear algebra determinant and matrix inverse",
                    "optimal_search_query": "Computing matrix determinants and inverses"
                }
            ]
        },
        {
            "title": "Module 3: Coordinate Systems and Affine Transformations",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Translation, Scaling, and Rotation Matrices",
                    "youtube_search_query": "Computer graphics translation scaling rotation matrices",
                    "optimal_search_query": "Affine transformations matrix representation"
                },
                {
                    "id": create_uuid(),
                    "title": "Homogeneous Coordinates",
                    "youtube_search_query": "Homogeneous coordinates computer graphics",
                    "optimal_search_query": "Why we use homogeneous coordinates in 3D graphics"
                },
                {
                    "id": create_uuid(),
                    "title": "Change of Basis and Local vs. Global Space",
                    "youtube_search_query": "Linear algebra change of basis coordinate spaces",
                    "optimal_search_query": "Change of basis matrix coordinate transformations"
                }
            ]
        },
        {
            "title": "Module 4: 3D Rotations and Quaternions",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Euler Angles and Gimbal Lock",
                    "youtube_search_query": "Euler angles and gimbal lock explained",
                    "optimal_search_query": "3D rotations Euler angles vs Gimbal lock"
                },
                {
                    "id": create_uuid(),
                    "title": "Introduction to Complex Numbers and Quaternions",
                    "youtube_search_query": "Quaternions for 3D rotation math",
                    "optimal_search_query": "Understanding quaternions mathematics"
                },
                {
                    "id": create_uuid(),
                    "title": "Interpolating Rotations (SLERP)",
                    "youtube_search_query": "Quaternion interpolation slerp computer graphics",
                    "optimal_search_query": "Spherical linear interpolation SLERP quaternions"
                }
            ]
        },
        {
            "title": "Module 5: Cameras and Projections",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "The View Matrix (LookAt)",
                    "youtube_search_query": "LookAt view matrix derivation graphics",
                    "optimal_search_query": "Deriving the camera view matrix LookAt"
                },
                {
                    "id": create_uuid(),
                    "title": "Orthographic and Perspective Projection Matrices",
                    "youtube_search_query": "Perspective projection matrix derivation",
                    "optimal_search_query": "Orthographic vs perspective projection mathematics"
                },
                {
                    "id": create_uuid(),
                    "title": "Frustum Culling and Depth (Z-Buffer) Math",
                    "youtube_search_query": "Frustum culling and Z buffer math graphics",
                    "optimal_search_query": "View frustum culling and non-linear depth mapping"
                }
            ]
        }
    ]
}

# 3. Operating Systems 101 (1463)
os_plan = {
    "prerequisites": ["C/C++ programming basic knowledge", "Computer architecture fundamentals"],
    "what_you_will_learn": [
        "Core functions of an operating system",
        "Process management, scheduling, and threading",
        "Memory management, paging, and virtual memory",
        "File systems and storage management",
        "Concurrency and synchronization mechanisms",
        "I/O systems and security basics"
    ],
    "modules": [
        {
            "title": "Module 1: OS Fundamentals and Architecture",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "What is an OS? User Space vs Kernel Space",
                    "youtube_search_query": "Operating system user space kernel space",
                    "optimal_search_query": "OS architecture user mode vs kernel mode"
                },
                {
                    "id": create_uuid(),
                    "title": "System Calls and Interrupts",
                    "youtube_search_query": "OS system calls and interrupts explained",
                    "optimal_search_query": "How system calls and hardware interrupts work"
                },
                {
                    "id": create_uuid(),
                    "title": "OS Structures: Monolithic vs Microkernels",
                    "youtube_search_query": "Monolithic kernel vs microkernel architecture",
                    "optimal_search_query": "Operating system kernel architectures comparison"
                }
            ]
        },
        {
            "title": "Module 2: Process and Thread Management",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Process States and the Process Control Block (PCB)",
                    "youtube_search_query": "OS process states PCB explained",
                    "optimal_search_query": "Process lifecycle and process control block"
                },
                {
                    "id": create_uuid(),
                    "title": "Threads: User-Level vs Kernel-Level",
                    "youtube_search_query": "OS threads user level vs kernel level",
                    "optimal_search_query": "Multithreading models and thread management"
                },
                {
                    "id": create_uuid(),
                    "title": "CPU Scheduling Algorithms (FCFS, SJF, Round Robin, Multilevel)",
                    "youtube_search_query": "OS CPU scheduling algorithms FCFS round robin",
                    "optimal_search_query": "Operating system process scheduling algorithms"
                }
            ]
        },
        {
            "title": "Module 3: Concurrency and Synchronization",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "The Critical Section Problem and Race Conditions",
                    "youtube_search_query": "OS critical section problem race conditions",
                    "optimal_search_query": "Concurrency race conditions and critical sections"
                },
                {
                    "id": create_uuid(),
                    "title": "Mutexes, Semaphores, and Monitors",
                    "youtube_search_query": "OS semaphores vs mutexes monitors",
                    "optimal_search_query": "Synchronization primitives mutex semaphore monitor"
                },
                {
                    "id": create_uuid(),
                    "title": "Deadlocks: Conditions, Prevention, and Avoidance (Banker's Algorithm)",
                    "youtube_search_query": "OS deadlocks prevention bankers algorithm",
                    "optimal_search_query": "Deadlock characterization and Bankers algorithm"
                }
            ]
        },
        {
            "title": "Module 4: Memory Management",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Main Memory Basics: Contiguous Allocation and Fragmentation",
                    "youtube_search_query": "OS memory allocation fragmentation",
                    "optimal_search_query": "Contiguous memory allocation and fragmentation"
                },
                {
                    "id": create_uuid(),
                    "title": "Paging and Page Tables (TLB)",
                    "youtube_search_query": "OS paging page tables TLB",
                    "optimal_search_query": "Memory paging architecture and translation lookaside buffer"
                },
                {
                    "id": create_uuid(),
                    "title": "Virtual Memory and Page Replacement Algorithms (LRU, FIFO)",
                    "youtube_search_query": "OS virtual memory page replacement LRU",
                    "optimal_search_query": "Virtual memory demand paging and replacement algorithms"
                }
            ]
        },
        {
            "title": "Module 5: Storage, File Systems, and I/O",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "File System Interface and Implementation (Inodes, FAT)",
                    "youtube_search_query": "OS file systems implementation inodes FAT",
                    "optimal_search_query": "File system architecture directory structure inodes"
                },
                {
                    "id": create_uuid(),
                    "title": "Disk Scheduling and Storage Management",
                    "youtube_search_query": "OS disk scheduling algorithms SCAN LOOK",
                    "optimal_search_query": "Mass storage structure and disk scheduling"
                },
                {
                    "id": create_uuid(),
                    "title": "I/O Subsystems and DMA",
                    "youtube_search_query": "OS I/O subsystems DMA polling",
                    "optimal_search_query": "Operating system I/O hardware and direct memory access"
                }
            ]
        }
    ]
}

# 4. Linux Command Line Basics (1462)
linux_plan = {
    "prerequisites": ["Basic computer literacy", "Access to a Unix-like environment (Linux/macOS/WSL)"],
    "what_you_will_learn": [
        "Navigating the Linux file system",
        "Managing files, directories, and permissions",
        "Piping and redirectional commands",
        "Process management and system monitoring",
        "Basic bash scripting and text processing"
    ],
    "modules": [
        {
            "title": "Module 1: Introduction and Navigation",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Understanding the Shell and the Terminal",
                    "youtube_search_query": "Linux terminal vs shell explained",
                    "optimal_search_query": "What is a shell terminal bash linux"
                },
                {
                    "id": create_uuid(),
                    "title": "Navigating the Filesystem: pwd, cd, ls, and tree",
                    "youtube_search_query": "Linux filesystem navigation cd ls pwd",
                    "optimal_search_query": "Navigating Linux filesystem commands tutorial"
                },
                {
                    "id": create_uuid(),
                    "title": "Getting Help: man, --help, and info",
                    "youtube_search_query": "Linux man pages and help commands",
                    "optimal_search_query": "How to use Linux man pages and documentation"
                }
            ]
        },
        {
            "title": "Module 2: File and Directory Management",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Creating and Removing Files/Directories: touch, mkdir, rm, rmdir",
                    "youtube_search_query": "Linux file management touch mkdir rm",
                    "optimal_search_query": "Creating and deleting files directories Linux CLI"
                },
                {
                    "id": create_uuid(),
                    "title": "Copying and Moving: cp and mv",
                    "youtube_search_query": "Linux copy and move files cp mv",
                    "optimal_search_query": "Linux cp and mv commands file management"
                },
                {
                    "id": create_uuid(),
                    "title": "Viewing File Contents: cat, less, tail, head",
                    "youtube_search_query": "Linux view file contents cat less tail",
                    "optimal_search_query": "Reading files in Linux terminal cat head tail less"
                }
            ]
        },
        {
            "title": "Module 3: Permissions and Ownership",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Understanding Linux File Permissions (Read, Write, Execute)",
                    "youtube_search_query": "Linux file permissions explained",
                    "optimal_search_query": "Understanding Linux read write execute permissions"
                },
                {
                    "id": create_uuid(),
                    "title": "Changing Permissions with chmod",
                    "youtube_search_query": "Linux chmod command tutorial",
                    "optimal_search_query": "How to use chmod numeric and symbolic mode Linux"
                },
                {
                    "id": create_uuid(),
                    "title": "Changing Ownership with chown and sudo Basics",
                    "youtube_search_query": "Linux chown command and sudo basics",
                    "optimal_search_query": "Linux chown root privileges and sudo usage"
                }
            ]
        },
        {
            "title": "Module 4: I/O Redirection and Pipelines",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Standard Input, Output, and Error Streams",
                    "youtube_search_query": "Linux stdin stdout stderr explained",
                    "optimal_search_query": "Linux standard streams descriptors explained"
                },
                {
                    "id": create_uuid(),
                    "title": "Redirection Operators: >, >>, and <",
                    "youtube_search_query": "Linux output redirection tutorial",
                    "optimal_search_query": "Linux I/O redirection operators explained"
                },
                {
                    "id": create_uuid(),
                    "title": "Piping Commands Together with |",
                    "youtube_search_query": "Linux pipes command chaining tutorial",
                    "optimal_search_query": "Linux piping commands pipeline explained"
                }
            ]
        },
        {
            "title": "Module 5: Searching and Text Processing",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Finding Files with find and locate",
                    "youtube_search_query": "Linux find command tutorial",
                    "optimal_search_query": "Searching files in Linux using find and locate"
                },
                {
                    "id": create_uuid(),
                    "title": "Searching Text with grep",
                    "youtube_search_query": "Linux grep command examples tutorial",
                    "optimal_search_query": "Linux grep regex and text search tutorial"
                },
                {
                    "id": create_uuid(),
                    "title": "Basic Text Processing: awk, sed, sort, and uniq",
                    "youtube_search_query": "Linux awk sed sort text processing",
                    "optimal_search_query": "Linux command line text processing awk sed basics"
                }
            ]
        },
        {
            "title": "Module 6: Process Management and System Info",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Viewing Processes: ps, top, and htop",
                    "youtube_search_query": "Linux process management ps top htop",
                    "optimal_search_query": "Monitoring Linux processes with top and ps"
                },
                {
                    "id": create_uuid(),
                    "title": "Managing Processes: kill, fg, bg, and jobs",
                    "youtube_search_query": "Linux background jobs kill fg bg",
                    "optimal_search_query": "Linux job control foreground background and kill signals"
                },
                {
                    "id": create_uuid(),
                    "title": "System Information and Networking basics (df, du, ping, curl)",
                    "youtube_search_query": "Linux system info commands df du ping",
                    "optimal_search_query": "Linux disk usage network basics ping curl"
                }
            ]
        }
    ]
}

# 5. Distributed Systems 101 (1461)
dist_plan = {
    "prerequisites": ["Intermediate programming experience", "Basic networking and operating system concepts"],
    "what_you_will_learn": [
        "Fundamental concepts and challenges of distributed systems",
        "Communication protocols (RPC, gRPC, Message Queues)",
        "Replication, consistency models, and the CAP theorem",
        "Leader election and consensus algorithms (Paxos, Raft)",
        "Distributed data stores, partitioning, and transactions"
    ],
    "modules": [
        {
            "title": "Module 1: Foundations of Distributed Systems",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "What is a Distributed System? Goals and Fallacies",
                    "youtube_search_query": "Distributed systems basics goals fallacies",
                    "optimal_search_query": "Introduction to distributed computing fallacies of distributed computing"
                },
                {
                    "id": create_uuid(),
                    "title": "System Models: Synchronous vs Asynchronous",
                    "youtube_search_query": "Distributed systems synchronous asynchronous models",
                    "optimal_search_query": "Timing assumptions synchronous vs asynchronous distributed systems"
                },
                {
                    "id": create_uuid(),
                    "title": "Failure Models (Crash, Byzantine)",
                    "youtube_search_query": "Distributed systems failure models byzantine",
                    "optimal_search_query": "Fault tolerance failure models in distributed systems"
                }
            ]
        },
        {
            "title": "Module 2: Communication Models",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Remote Procedure Calls (RPC) and gRPC",
                    "youtube_search_query": "RPC gRPC distributed systems explained",
                    "optimal_search_query": "Remote Procedure Call architecture and gRPC tutorial"
                },
                {
                    "id": create_uuid(),
                    "title": "Message Queues and Publish-Subscribe Systems (Kafka, RabbitMQ)",
                    "youtube_search_query": "Message queues publish subscribe kafka",
                    "optimal_search_query": "Asynchronous messaging pub sub architecture distributed systems"
                },
                {
                    "id": create_uuid(),
                    "title": "Handling Failures in Communication: Retries and Idempotency",
                    "youtube_search_query": "Distributed systems retries idempotency",
                    "optimal_search_query": "Idempotent API design and exponential backoff retries"
                }
            ]
        },
        {
            "title": "Module 3: Time and State",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Physical Time and Clock Synchronization (NTP)",
                    "youtube_search_query": "Distributed systems clock synchronization NTP",
                    "optimal_search_query": "Physical clocks and NTP in distributed systems"
                },
                {
                    "id": create_uuid(),
                    "title": "Logical Time: Lamport Clocks and Vector Clocks",
                    "youtube_search_query": "Logical clocks lamport vector clocks distributed systems",
                    "optimal_search_query": "Lamport timestamps and vector clocks causality"
                },
                {
                    "id": create_uuid(),
                    "title": "Global State and Distributed Snapshots (Chandy-Lamport)",
                    "youtube_search_query": "Chandy Lamport distributed snapshot algorithm",
                    "optimal_search_query": "Distributed snapshot algorithm Chandy Lamport global state"
                }
            ]
        },
        {
            "title": "Module 4: Replication and Consistency",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "The CAP Theorem and PACELC",
                    "youtube_search_query": "CAP theorem PACELC distributed systems",
                    "optimal_search_query": "CAP theorem tradeoffs and PACELC extension"
                },
                {
                    "id": create_uuid(),
                    "title": "Strong vs Eventual Consistency Models",
                    "youtube_search_query": "Strong vs eventual consistency distributed systems",
                    "optimal_search_query": "Consistency models linearizability vs eventual consistency"
                },
                {
                    "id": create_uuid(),
                    "title": "Quorum-Based Replication and Dynamo-Style Systems",
                    "youtube_search_query": "Quorum consensus dynamo distributed systems",
                    "optimal_search_query": "Quorum based replication read write quorums"
                }
            ]
        },
        {
            "title": "Module 5: Consensus and Coordination",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "The Consensus Problem and FLP Impossibility",
                    "youtube_search_query": "Consensus problem FLP impossibility distributed systems",
                    "optimal_search_query": "FLP impossibility result distributed consensus"
                },
                {
                    "id": create_uuid(),
                    "title": "Paxos Algorithm Fundamentals",
                    "youtube_search_query": "Paxos algorithm explained simply",
                    "optimal_search_query": "Understanding Paxos consensus algorithm distributed systems"
                },
                {
                    "id": create_uuid(),
                    "title": "Raft Consensus Algorithm",
                    "youtube_search_query": "Raft consensus algorithm explained visually",
                    "optimal_search_query": "Raft distributed consensus algorithm leader election"
                }
            ]
        },
        {
            "title": "Module 6: Distributed Data and Large-Scale Systems",
            "topics": [
                {
                    "id": create_uuid(),
                    "title": "Data Partitioning and Sharding (Consistent Hashing)",
                    "youtube_search_query": "Consistent hashing data partitioning",
                    "optimal_search_query": "Database sharding and consistent hashing algorithm"
                },
                {
                    "id": create_uuid(),
                    "title": "Distributed Transactions (Two-Phase Commit, Saga Pattern)",
                    "youtube_search_query": "Distributed transactions 2PC Saga pattern",
                    "optimal_search_query": "Two phase commit vs Saga pattern microservices"
                },
                {
                    "id": create_uuid(),
                    "title": "MapReduce and Batch Processing",
                    "youtube_search_query": "MapReduce distributed computing explained",
                    "optimal_search_query": "MapReduce programming model distributed systems"
                }
            ]
        }
    ]
}

data = {
    1465: rust_plan,
    1464: linalg_plan,
    1463: os_plan,
    1462: linux_plan,
    1461: dist_plan
}

import subprocess

for r_id, plan in data.items():
    print(f"Updating roadmap_plan for ID: {r_id}")
    plan_json = json.dumps(plan)
    cursor.execute("UPDATE roadmaps SET roadmap_plan = %s WHERE id = %s", (plan_json, r_id))

conn.commit()
cursor.close()
conn.close()
print("Successfully updated roadmaps.")

# Run enrichment scripts
for r_id in data.keys():
    print(f"Running smart_video_enrich.py for {r_id}...")
    subprocess.run(["/home/sankalp/Documents/projects/eulerfold/backend/venv/bin/python", "/home/sankalp/Documents/projects/eulerfold/backend/smart_video_enrich.py", str(r_id)])
    
    print(f"Running smart_resource_enrich.py for {r_id}...")
    subprocess.run(["/home/sankalp/Documents/projects/eulerfold/backend/venv/bin/python", "/home/sankalp/Documents/projects/eulerfold/backend/smart_resource_enrich.py", str(r_id)])
