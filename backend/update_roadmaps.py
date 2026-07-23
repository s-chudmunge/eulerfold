import os
import sys
import uuid
import json
import subprocess

sys.path.append(os.path.abspath("/home/sankalp/Documents/projects/eulerfold/backend"))
from dotenv import load_dotenv
load_dotenv("/home/sankalp/Documents/projects/eulerfold/backend/.env")

from app.core.supabase_client import get_supabase_client

data = {
    1490: {
        "prerequisites": ["Basic High School Algebra", "Pre-Calculus", "Basic Physics", "Familiarity with Complex Numbers", "Matrix Operations", "Calculus I & II"],
        "what_you_will_learn": [
            "Understand vector spaces and linear transformations",
            "Compute eigenvalues and eigenvectors",
            "Master Inner Product Spaces and Orthogonality",
            "Grasp the foundational postulates of quantum mechanics",
            "Model quantum states and measure observables",
            "Solve the Schrödinger Equation in 1D and 3D",
            "Understand Angular Momentum and Spin",
            "Apply Perturbation Theory"
        ],
        "modules": [
            {
                "title": "Linear Algebra Fundamentals",
                "topics": [
                    {
                        "title": "Linear Algebra: Vector Spaces and Basis",
                        "youtube_search_query": "Linear Algebra Vector Spaces and Basis",
                        "optimal_search_query": "Vector spaces, linear independence, and basis vectors explained"
                    },
                    {
                        "title": "Linear Algebra: Matrices and Linear Transformations",
                        "youtube_search_query": "Linear Algebra Matrices and Linear Transformations",
                        "optimal_search_query": "Understanding matrices as linear transformations"
                    }
                ]
            },
            {
                "title": "Advanced Linear Algebra",
                "topics": [
                    {
                        "title": "Linear Algebra: Eigenvalues and Eigenvectors",
                        "youtube_search_query": "Linear Algebra Eigenvalues and Eigenvectors",
                        "optimal_search_query": "Calculating eigenvalues and eigenvectors"
                    },
                    {
                        "title": "Linear Algebra: Diagonalization and Spectral Theorem",
                        "youtube_search_query": "Linear Algebra Diagonalization and Spectral Theorem",
                        "optimal_search_query": "Matrix diagonalization and the Spectral Theorem"
                    }
                ]
            },
            {
                "title": "Inner Product Spaces",
                "topics": [
                    {
                        "title": "Linear Algebra: Inner Products and Orthogonality",
                        "youtube_search_query": "Linear Algebra Inner Products and Orthogonality",
                        "optimal_search_query": "Inner products and orthogonality in linear algebra"
                    },
                    {
                        "title": "Linear Algebra: Gram-Schmidt Process",
                        "youtube_search_query": "Linear Algebra Gram-Schmidt Process",
                        "optimal_search_query": "Gram-Schmidt orthogonalization process"
                    }
                ]
            },
            {
                "title": "Quantum Mechanics Postulates",
                "topics": [
                    {
                        "title": "Quantum Mechanics: State Vectors and Hilbert Space",
                        "youtube_search_query": "Quantum Mechanics State Vectors and Hilbert Space",
                        "optimal_search_query": "Quantum states, kets, and Hilbert space introduction"
                    },
                    {
                        "title": "Quantum Mechanics: Observables and Hermitian Operators",
                        "youtube_search_query": "Quantum Mechanics Observables and Hermitian Operators",
                        "optimal_search_query": "Hermitian operators and observables in quantum mechanics"
                    }
                ]
            },
            {
                "title": "Quantum Dynamics",
                "topics": [
                    {
                        "title": "Quantum Mechanics: The Time-Dependent Schrödinger Equation",
                        "youtube_search_query": "Quantum Mechanics Time-Dependent Schrödinger Equation",
                        "optimal_search_query": "Deriving and understanding the time-dependent Schrödinger equation"
                    },
                    {
                        "title": "Quantum Mechanics: Measurement and Probability (Born Rule)",
                        "youtube_search_query": "Quantum Mechanics Measurement and Probability Born Rule",
                        "optimal_search_query": "Born rule and measurement problem in quantum mechanics"
                    }
                ]
            },
            {
                "title": "1D Potentials",
                "topics": [
                    {
                        "title": "Quantum Mechanics: Particle in a Box",
                        "youtube_search_query": "Quantum Mechanics Particle in a Box",
                        "optimal_search_query": "Solving the infinite square well potential (Particle in a Box)"
                    },
                    {
                        "title": "Quantum Mechanics: Quantum Harmonic Oscillator",
                        "youtube_search_query": "Quantum Mechanics Quantum Harmonic Oscillator",
                        "optimal_search_query": "Quantum harmonic oscillator ladder operators and algebraic method"
                    }
                ]
            },
            {
                "title": "Angular Momentum & Spin",
                "topics": [
                    {
                        "title": "Quantum Mechanics: Orbital Angular Momentum",
                        "youtube_search_query": "Quantum Mechanics Orbital Angular Momentum",
                        "optimal_search_query": "Quantum orbital angular momentum and spherical harmonics"
                    },
                    {
                        "title": "Quantum Mechanics: Spin and Pauli Matrices",
                        "youtube_search_query": "Quantum Mechanics Spin and Pauli Matrices",
                        "optimal_search_query": "Quantum spin 1/2 systems and Pauli matrices"
                    }
                ]
            },
            {
                "title": "Approximation Methods",
                "topics": [
                    {
                        "title": "Quantum Mechanics: Time-Independent Perturbation Theory",
                        "youtube_search_query": "Quantum Mechanics Time-Independent Perturbation Theory",
                        "optimal_search_query": "Time-independent perturbation theory non-degenerate"
                    },
                    {
                        "title": "Quantum Mechanics: The Variational Principle",
                        "youtube_search_query": "Quantum Mechanics Variational Principle",
                        "optimal_search_query": "Variational method in quantum mechanics"
                    }
                ]
            }
        ]
    },
    1489: {
        "prerequisites": ["Basic Programming Logic", "Familiarity with Variables and Functions", "Data Structures Basics"],
        "what_you_will_learn": [
            "Write pure functions and avoid side effects",
            "Leverage higher-order functions",
            "Utilize map, filter, and reduce for data transformation",
            "Understand Currying, Partial Application, and Closures",
            "Implement Recursion and Tail Call Optimization",
            "Master Functors, Applicatives, and Monads",
            "Handle Errors Functionally (Either, Maybe, Option)",
            "Apply Functional Architecture (Ports & Adapters)"
        ],
        "modules": [
            {
                "title": "FP Core Concepts",
                "topics": [
                    {
                        "title": "Functional Programming: Pure Functions and Immutability",
                        "youtube_search_query": "Functional Programming Pure Functions and Immutability",
                        "optimal_search_query": "Pure functions and immutability explained"
                    },
                    {
                        "title": "Functional Programming: First-Class and Higher-Order Functions",
                        "youtube_search_query": "Functional Programming First-Class and Higher-Order Functions",
                        "optimal_search_query": "First-class functions and higher order functions in functional programming"
                    }
                ]
            },
            {
                "title": "Advanced Functions",
                "topics": [
                    {
                        "title": "Functional Programming: Closures and Lexical Scope",
                        "youtube_search_query": "Functional Programming Closures and Lexical Scope",
                        "optimal_search_query": "Understanding closures and lexical scope in functional programming"
                    },
                    {
                        "title": "Functional Programming: Currying and Partial Application",
                        "youtube_search_query": "Functional Programming Currying and Partial Application",
                        "optimal_search_query": "Currying vs partial application functional programming"
                    }
                ]
            },
            {
                "title": "Function Composition",
                "topics": [
                    {
                        "title": "Functional Programming: Function Composition Concepts",
                        "youtube_search_query": "Functional Programming Function Composition",
                        "optimal_search_query": "Function composition and pipelining in functional programming"
                    },
                    {
                        "title": "Functional Programming: Point-Free Style",
                        "youtube_search_query": "Functional Programming Point-Free Style",
                        "optimal_search_query": "Point-free style tacit programming functional"
                    }
                ]
            },
            {
                "title": "Data Control and Iteration",
                "topics": [
                    {
                        "title": "Functional Programming: Recursion and Tail Call Optimization",
                        "youtube_search_query": "Functional Programming Recursion and Tail Call Optimization",
                        "optimal_search_query": "Recursion vs iteration and tail call optimization"
                    },
                    {
                        "title": "Functional Programming: Map, Filter, and Reduce Patterns",
                        "youtube_search_query": "Functional Programming Map Filter Reduce",
                        "optimal_search_query": "Data transformation using map, filter, and reduce"
                    }
                ]
            },
            {
                "title": "Algebraic Data Types",
                "topics": [
                    {
                        "title": "Functional Programming: Sum and Product Types",
                        "youtube_search_query": "Functional Programming Sum and Product Types",
                        "optimal_search_query": "Algebraic Data Types (ADT) sum and product types"
                    },
                    {
                        "title": "Functional Programming: Pattern Matching",
                        "youtube_search_query": "Functional Programming Pattern Matching",
                        "optimal_search_query": "Pattern matching in functional programming languages"
                    }
                ]
            },
            {
                "title": "Type Classes and Abstractions",
                "topics": [
                    {
                        "title": "Functional Programming: Type Classes",
                        "youtube_search_query": "Functional Programming Type Classes",
                        "optimal_search_query": "Understanding type classes and polymorphism in FP"
                    },
                    {
                        "title": "Functional Programming: Functors and Applicatives",
                        "youtube_search_query": "Functional Programming Functors and Applicatives",
                        "optimal_search_query": "What are functors and applicatives in functional programming"
                    }
                ]
            },
            {
                "title": "Monads and Effects",
                "topics": [
                    {
                        "title": "Functional Programming: Introduction to Monads",
                        "youtube_search_query": "Functional Programming Introduction to Monads",
                        "optimal_search_query": "Understanding monads for side effects in functional programming"
                    },
                    {
                        "title": "Functional Programming: The IO Monad",
                        "youtube_search_query": "Functional Programming The IO Monad",
                        "optimal_search_query": "How the IO Monad encapsulates side effects"
                    }
                ]
            },
            {
                "title": "Functional Error Handling",
                "topics": [
                    {
                        "title": "Functional Programming: Option / Maybe Types",
                        "youtube_search_query": "Functional Programming Option Maybe Type",
                        "optimal_search_query": "Handling nulls with Option and Maybe types in FP"
                    },
                    {
                        "title": "Functional Programming: Either / Result Types",
                        "youtube_search_query": "Functional Programming Either Result Type",
                        "optimal_search_query": "Functional error handling using Either and Result monads"
                    }
                ]
            }
        ]
    },
    1488: {
        "prerequisites": ["Basic SQL Knowledge", "Understanding of Relational Databases", "Database Normalization Concepts"],
        "what_you_will_learn": [
            "Differentiate between OLTP and OLAP systems",
            "Design star and snowflake schemas",
            "Implement ETL strategies and slowly changing dimensions",
            "Compare cloud data warehouses and data lakes",
            "Master Advanced Dimensional Modeling Techniques",
            "Understand Data Governance and Security",
            "Optimize Data Warehouse Performance",
            "Explore Modern Data Architectures (Data Mesh, Lakehouse)"
        ],
        "modules": [
            {
                "title": "Data Warehouse Architecture",
                "topics": [
                    {
                        "title": "Data Warehousing: OLTP vs OLAP Systems",
                        "youtube_search_query": "Data Warehousing OLTP vs OLAP",
                        "optimal_search_query": "Differences between OLTP and OLAP systems"
                    },
                    {
                        "title": "Data Warehousing: Enterprise Data Warehouse (EDW) vs Data Mart",
                        "youtube_search_query": "Data Warehousing EDW vs Data Mart",
                        "optimal_search_query": "Enterprise Data Warehouse vs Data Mart architecture"
                    }
                ]
            },
            {
                "title": "Dimensional Modeling Fundamentals",
                "topics": [
                    {
                        "title": "Data Warehousing: Fact Tables and Measures",
                        "youtube_search_query": "Data Warehousing Fact Tables and Measures",
                        "optimal_search_query": "Understanding fact tables, measures, and granularity in data warehousing"
                    },
                    {
                        "title": "Data Warehousing: Star and Snowflake Schemas",
                        "youtube_search_query": "Data Warehousing Star vs Snowflake Schema",
                        "optimal_search_query": "Star schema vs snowflake schema in dimensional modeling"
                    }
                ]
            },
            {
                "title": "Advanced Dimensional Modeling",
                "topics": [
                    {
                        "title": "Data Warehousing: Slowly Changing Dimensions (SCD)",
                        "youtube_search_query": "Data Warehousing Slowly Changing Dimensions SCD",
                        "optimal_search_query": "Slowly changing dimensions SCD Type 1 Type 2 Type 3"
                    },
                    {
                        "title": "Data Warehousing: Bridge Tables and Multi-Valued Dimensions",
                        "youtube_search_query": "Data Warehousing Bridge Tables Multi-Valued Dimensions",
                        "optimal_search_query": "Handling many-to-many relationships in data warehousing with bridge tables"
                    }
                ]
            },
            {
                "title": "ETL Processes",
                "topics": [
                    {
                        "title": "Data Warehousing: Extract, Transform, Load (ETL) Fundamentals",
                        "youtube_search_query": "Data Warehousing ETL Fundamentals",
                        "optimal_search_query": "ETL process extract transform load explained"
                    },
                    {
                        "title": "Data Warehousing: ELT vs ETL and Modern Transformations",
                        "youtube_search_query": "Data Warehousing ELT vs ETL",
                        "optimal_search_query": "ETL vs ELT architectures and modern cloud data pipelines"
                    }
                ]
            },
            {
                "title": "Data Loading Strategies",
                "topics": [
                    {
                        "title": "Data Warehousing: Incremental vs Full Load Strategies",
                        "youtube_search_query": "Data Warehousing Incremental vs Full Load",
                        "optimal_search_query": "Incremental loading vs full loading in ETL pipelines"
                    },
                    {
                        "title": "Data Warehousing: Change Data Capture (CDC)",
                        "youtube_search_query": "Data Warehousing Change Data Capture CDC",
                        "optimal_search_query": "Change Data Capture (CDC) for real-time data warehousing"
                    }
                ]
            },
            {
                "title": "Modern Data Platforms",
                "topics": [
                    {
                        "title": "Data Warehousing: Cloud Data Warehouses (Snowflake, BigQuery, Redshift)",
                        "youtube_search_query": "Cloud Data Warehouses Snowflake BigQuery Redshift",
                        "optimal_search_query": "Architecture of cloud data warehouses like Snowflake, BigQuery, and Redshift"
                    },
                    {
                        "title": "Data Warehousing: Data Lakes vs Data Warehouses",
                        "youtube_search_query": "Data Lakes vs Data Warehouses",
                        "optimal_search_query": "Data lake vs data warehouse differences and use cases"
                    }
                ]
            },
            {
                "title": "Performance and Optimization",
                "topics": [
                    {
                        "title": "Data Warehousing: Partitioning and Clustering",
                        "youtube_search_query": "Data Warehousing Partitioning and Clustering",
                        "optimal_search_query": "Table partitioning and clustering for data warehouse performance"
                    },
                    {
                        "title": "Data Warehousing: Materialized Views and Caching",
                        "youtube_search_query": "Data Warehousing Materialized Views",
                        "optimal_search_query": "Using materialized views and caching for query optimization in data warehouses"
                    }
                ]
            },
            {
                "title": "Next-Gen Architectures",
                "topics": [
                    {
                        "title": "Data Warehousing: The Data Lakehouse Architecture",
                        "youtube_search_query": "Data Lakehouse Architecture",
                        "optimal_search_query": "What is a Data Lakehouse architecture (Databricks, Apache Iceberg)"
                    },
                    {
                        "title": "Data Warehousing: Data Mesh and Decentralization",
                        "youtube_search_query": "Data Mesh Architecture",
                        "optimal_search_query": "Data Mesh architecture concepts and decentralized data ownership"
                    }
                ]
            }
        ]
    },
    1487: {
        "prerequisites": ["Basic Operating Systems Knowledge", "Understanding of Computer Architecture", "Basic Data Structures"],
        "what_you_will_learn": [
            "Distinguish between block, file, and object storage",
            "Understand inodes and file allocation methods",
            "Implement journaling and crash consistency",
            "Compare local, network, and distributed file systems",
            "Master Volume Management and RAID",
            "Explore Storage Virtualization",
            "Understand Log-Structured File Systems",
            "Evaluate Cloud Native Storage Solutions"
        ],
        "modules": [
            {
                "title": "Storage Hardware and Concepts",
                "topics": [
                    {
                        "title": "Storage Fundamentals: HDD vs SSD Internals",
                        "youtube_search_query": "HDD vs SSD Internals Architecture",
                        "optimal_search_query": "Hard disk drive vs solid state drive internal architecture"
                    },
                    {
                        "title": "Storage Fundamentals: Non-Volatile Memory Express (NVMe)",
                        "youtube_search_query": "NVMe Architecture Storage",
                        "optimal_search_query": "NVMe storage protocol and architecture explained"
                    }
                ]
            },
            {
                "title": "Storage Paradigms",
                "topics": [
                    {
                        "title": "Storage Fundamentals: Block, File, and Object Storage",
                        "youtube_search_query": "Block File and Object Storage",
                        "optimal_search_query": "Differences between block storage, file storage, and object storage"
                    },
                    {
                        "title": "Storage Fundamentals: Logical Volume Management (LVM)",
                        "youtube_search_query": "Logical Volume Management LVM",
                        "optimal_search_query": "How Logical Volume Management (LVM) works in Linux"
                    }
                ]
            },
            {
                "title": "File System Architecture",
                "topics": [
                    {
                        "title": "File Systems: Inodes and Directory Structures",
                        "youtube_search_query": "File Systems Inodes and Directory Structures",
                        "optimal_search_query": "How inodes and directories work in Linux file systems"
                    },
                    {
                        "title": "File Systems: Allocation Methods",
                        "youtube_search_query": "File Systems Allocation Methods Contiguous Linked Indexed",
                        "optimal_search_query": "File allocation methods contiguous linked and indexed"
                    }
                ]
            },
            {
                "title": "Reliability and Performance",
                "topics": [
                    {
                        "title": "File Systems: Journaling and Crash Consistency",
                        "youtube_search_query": "File Systems Journaling Crash Consistency",
                        "optimal_search_query": "File system journaling and crash consistency explained"
                    },
                    {
                        "title": "File Systems: Log-Structured File Systems",
                        "youtube_search_query": "Log Structured File Systems",
                        "optimal_search_query": "How log-structured file systems (LFS) work"
                    }
                ]
            },
            {
                "title": "Redundancy and RAID",
                "topics": [
                    {
                        "title": "File Systems: RAID Levels and Data Redundancy",
                        "youtube_search_query": "RAID Levels and Data Redundancy",
                        "optimal_search_query": "Understanding RAID levels 0 1 5 6 10 for data redundancy"
                    },
                    {
                        "title": "File Systems: Erasure Coding vs RAID",
                        "youtube_search_query": "Erasure Coding vs RAID",
                        "optimal_search_query": "Erasure coding vs RAID in distributed storage systems"
                    }
                ]
            },
            {
                "title": "Network and Distributed Storage",
                "topics": [
                    {
                        "title": "File Systems: Network Attached Storage (NAS) vs SAN",
                        "youtube_search_query": "NAS vs SAN Storage",
                        "optimal_search_query": "Network Attached Storage (NAS) vs Storage Area Network (SAN)"
                    },
                    {
                        "title": "File Systems: Distributed File Systems Architecture (HDFS/Ceph)",
                        "youtube_search_query": "Distributed File Systems Ceph HDFS",
                        "optimal_search_query": "Distributed file system architectures like HDFS and Ceph"
                    }
                ]
            },
            {
                "title": "Modern File Systems",
                "topics": [
                    {
                        "title": "File Systems: ZFS and Btrfs Features",
                        "youtube_search_query": "ZFS vs Btrfs File Systems",
                        "optimal_search_query": "Features of modern file systems like ZFS and Btrfs"
                    },
                    {
                        "title": "File Systems: Deduplication and Compression",
                        "youtube_search_query": "Storage Deduplication and Compression",
                        "optimal_search_query": "Data deduplication and compression in modern storage"
                    }
                ]
            },
            {
                "title": "Cloud Storage Systems",
                "topics": [
                    {
                        "title": "File Systems: S3 and Cloud Object Storage",
                        "youtube_search_query": "Amazon S3 Object Storage Architecture",
                        "optimal_search_query": "Amazon S3 and cloud object storage architecture"
                    },
                    {
                        "title": "File Systems: Cloud Block Storage (EBS)",
                        "youtube_search_query": "Cloud Block Storage Amazon EBS",
                        "optimal_search_query": "How cloud block storage like Amazon EBS works"
                    }
                ]
            }
        ]
    },
    1486: {
        "prerequisites": ["Basic Programming in C/C++/Java", "Operating Systems Concepts", "Memory Architecture Basics"],
        "what_you_will_learn": [
            "Differentiate between processes and threads",
            "Identify and prevent race conditions",
            "Use synchronization primitives like mutexes and condition variables",
            "Apply thread pools and asynchronous programming patterns",
            "Implement Lock-Free Data Structures",
            "Master Concurrent Programming Models (Actors, CSP)",
            "Analyze and resolve Deadlocks and Livelocks",
            "Optimize Multi-threaded Performance (False Sharing, Cache Coherence)"
        ],
        "modules": [
            {
                "title": "Concurrency Basics",
                "topics": [
                    {
                        "title": "Concurrency: Processes vs Threads",
                        "youtube_search_query": "Concurrency Processes vs Threads",
                        "optimal_search_query": "Difference between processes and threads in operating systems"
                    },
                    {
                        "title": "Concurrency: Context Switching and Thread Lifecycles",
                        "youtube_search_query": "Context Switching and Thread Lifecycles",
                        "optimal_search_query": "Thread context switching and process lifecycle"
                    }
                ]
            },
            {
                "title": "The Concurrency Problem",
                "topics": [
                    {
                        "title": "Concurrency: Race Conditions and Critical Sections",
                        "youtube_search_query": "Concurrency Race Conditions Critical Sections",
                        "optimal_search_query": "Understanding race conditions and critical sections"
                    },
                    {
                        "title": "Concurrency: Data Races and the Memory Model",
                        "youtube_search_query": "Concurrency Data Races Memory Model",
                        "optimal_search_query": "Data races and programming language memory models"
                    }
                ]
            },
            {
                "title": "Synchronization Primitives",
                "topics": [
                    {
                        "title": "Concurrency: Mutexes and Locks",
                        "youtube_search_query": "Concurrency Mutexes and Locks",
                        "optimal_search_query": "How to use mutexes and locks for thread synchronization"
                    },
                    {
                        "title": "Concurrency: Semaphores",
                        "youtube_search_query": "Concurrency Semaphores",
                        "optimal_search_query": "Understanding counting and binary semaphores"
                    }
                ]
            },
            {
                "title": "Advanced Synchronization",
                "topics": [
                    {
                        "title": "Concurrency: Condition Variables and Monitors",
                        "youtube_search_query": "Concurrency Condition Variables Monitors",
                        "optimal_search_query": "Condition variables and monitors in concurrent programming"
                    },
                    {
                        "title": "Concurrency: Read-Write Locks",
                        "youtube_search_query": "Concurrency Read-Write Locks",
                        "optimal_search_query": "Implementation and use cases for Read-Write Locks"
                    }
                ]
            },
            {
                "title": "Liveness Issues",
                "topics": [
                    {
                        "title": "Concurrency: Deadlocks, Livelocks, and Starvation",
                        "youtube_search_query": "Concurrency Deadlock Livelock Starvation",
                        "optimal_search_query": "Differences between deadlocks, livelocks, and starvation"
                    },
                    {
                        "title": "Concurrency: Deadlock Prevention and Detection",
                        "youtube_search_query": "Concurrency Deadlock Prevention Detection",
                        "optimal_search_query": "Deadlock prevention, avoidance, and detection strategies (Banker's Algorithm)"
                    }
                ]
            },
            {
                "title": "Lock-Free and Hardware Concurrency",
                "topics": [
                    {
                        "title": "Concurrency: Atomic Operations and Compare-And-Swap (CAS)",
                        "youtube_search_query": "Concurrency Atomic Operations Compare-And-Swap CAS",
                        "optimal_search_query": "Atomic operations and Compare-And-Swap (CAS) instructions"
                    },
                    {
                        "title": "Concurrency: Cache Coherence and False Sharing",
                        "youtube_search_query": "Concurrency Cache Coherence False Sharing",
                        "optimal_search_query": "Cache coherence protocols and false sharing in multithreading"
                    }
                ]
            },
            {
                "title": "Thread Management",
                "topics": [
                    {
                        "title": "Concurrency: Thread Pools and Executor Services",
                        "youtube_search_query": "Thread Pools and Executor Services",
                        "optimal_search_query": "How thread pools and executor services work"
                    },
                    {
                        "title": "Concurrency: Asynchronous Programming and Futures",
                        "youtube_search_query": "Asynchronous Programming Futures Promises",
                        "optimal_search_query": "Asynchronous programming with futures and promises"
                    }
                ]
            },
            {
                "title": "Concurrent Programming Models",
                "topics": [
                    {
                        "title": "Concurrency: The Actor Model",
                        "youtube_search_query": "Actor Model Concurrency",
                        "optimal_search_query": "The Actor Model for concurrent computation (Akka/Erlang)"
                    },
                    {
                        "title": "Concurrency: Communicating Sequential Processes (CSP)",
                        "youtube_search_query": "CSP Concurrency Golang Channels",
                        "optimal_search_query": "Communicating Sequential Processes (CSP) and Go channels"
                    }
                ]
            }
        ]
    }
}

def update_all():
    sb = get_supabase_client()
    backend_dir = "/home/sankalp/Documents/projects/eulerfold/backend"
    
    for roadmap_id, plan in data.items():
        # Inject UUIDs for subtopics
        for module in plan["modules"]:
            for topic in module["topics"]:
                topic["subtopic_id"] = str(uuid.uuid4())
        
        print(f"Updating roadmap_plan for ID: {roadmap_id}")
        res = sb.table("roadmaps").update({"roadmap_plan": plan}).eq("id", roadmap_id).execute()
        if not res.data:
            print(f"Failed to update roadmap {roadmap_id} or roadmap does not exist.")
            continue
            
        print(f"Running video enrich for {roadmap_id}")
        subprocess.run([sys.executable, os.path.join(backend_dir, "smart_video_enrich.py"), str(roadmap_id)], check=True)
        
        print(f"Running resource enrich for {roadmap_id}")
        subprocess.run([sys.executable, os.path.join(backend_dir, "smart_resource_enrich.py"), str(roadmap_id)], check=True)

if __name__ == "__main__":
    update_all()
