import json
from dotenv import load_dotenv
load_dotenv('.env')
from app.core.supabase_client import get_supabase_client

sb = get_supabase_client()

EXPANSIONS = {
    1374: [ # LLM Inference Internals
        {
            "title": "PagedAttention & Memory Management",
            "outcome": "Implement vLLM-style PagedAttention to eliminate memory fragmentation in the KV cache.",
            "timeline": "Week 5",
            "workspace_type": "python",
            "topics": [
                {"title": "The Memory Bottleneck", "subtopics": ["KV Cache Fragmentation", "Pre-allocation issues", "OS Paging concepts applied to GPUs"]},
                {"title": "PagedAttention Mechanism", "subtopics": ["Block tables and logical vs physical blocks", "Modifying the Attention Kernel", "Memory mapping on the GPU"]},
                {"title": "Proof of Work: Block Manager", "subtopics": ["Implement a block allocator", "Write physical block lookups", "Simulate fragmented memory allocation"]}
            ]
        },
        {
            "title": "Continuous Batching & Serving",
            "outcome": "Build a continuous batching scheduler to maximize GPU utilization across concurrent requests.",
            "timeline": "Week 6",
            "workspace_type": "python",
            "topics": [
                {"title": "Static vs Continuous Batching", "subtopics": ["Padding overhead in static batching", "Iteration-level scheduling", "Request queuing and preemption"]},
                {"title": "The Scheduler Engine", "subtopics": ["Handling new requests dynamically", "Eviction and recomputation", "Max-tokens limits per step"]},
                {"title": "Proof of Work: Batching Engine", "subtopics": ["Write a continuous scheduler", "Integrate with the generation loop", "Load test concurrent requests"]}
            ]
        }
    ],
    1389: [ # Zero-Knowledge Proofs
        {
            "title": "Polynomial Commitments (KZG)",
            "outcome": "Understand KZG commitments and how they enable succinct verification of polynomial equations.",
            "timeline": "Week 5",
            "workspace_type": "python",
            "topics": [
                {"title": "Polynomial Math Refresher", "subtopics": ["Finite Fields", "Polynomial Interpolation (Lagrange)", "Schwartz-Zippel Lemma"]},
                {"title": "KZG Commitment Scheme", "subtopics": ["Trusted Setup (Powers of Tau)", "Committing to a polynomial", "Opening proofs at a point"]},
                {"title": "Proof of Work: KZG in Python", "subtopics": ["Implement elliptic curve pairing basics", "Generate a trusted setup", "Verify a polynomial opening"]}
            ]
        },
        {
            "title": "Writing Circuits in Circom",
            "outcome": "Write, compile, and generate zero-knowledge proofs using the Circom language and snarkjs.",
            "timeline": "Week 6",
            "workspace_type": "javascript",
            "topics": [
                {"title": "Circom Fundamentals", "subtopics": ["Signals and Constraints", "Compiling to R1CS", "Witness Generation"]},
                {"title": "Building Complex Circuits", "subtopics": ["Hash functions in circuits (Poseidon)", "Merkle Tree inclusion proofs", "Handling conditionals without branching"]},
                {"title": "Proof of Work: ZK Identity App", "subtopics": ["Write a Merkle proof circuit", "Generate a groth16 proof via snarkjs", "Verify the proof in a smart contract"]}
            ]
        }
    ],
    1394: [ # V8 Engine Internals
        {
            "title": "Ignition Interpreter & Bytecode",
            "outcome": "Analyze V8's Ignition interpreter, how it generates bytecode, and register allocation.",
            "timeline": "Week 5",
            "workspace_type": "cpp",
            "topics": [
                {"title": "From AST to Bytecode", "subtopics": ["The V8 Bytecode format", "Register-based virtual machines", "Bytecode generation phases"]},
                {"title": "Ignition Execution", "subtopics": ["Inline Caching (IC) at the interpreter level", "Feedback vectors", "Dispatch tables"]},
                {"title": "Proof of Work: Bytecode Analysis", "subtopics": ["Use --print-bytecode to inspect V8", "Map JS code to opcodes", "Trace execution state changes"]}
            ]
        },
        {
            "title": "Turbofan & Sea of Nodes",
            "outcome": "Dive into Turbofan, V8's optimizing compiler, and the Sea of Nodes graph representation.",
            "timeline": "Week 6",
            "workspace_type": "cpp",
            "topics": [
                {"title": "The Sea of Nodes", "subtopics": ["Control flow and Data flow graphs", "Combining graphs", "Node types and scheduling"]},
                {"title": "Optimization Passes", "subtopics": ["Type speculation using Feedback Vectors", "Deoptimization handling", "Typer and Escape Analysis passes"]},
                {"title": "Proof of Work: Compiler Tracing", "subtopics": ["Use Turbolizer to visualize graphs", "Force deoptimizations in JS", "Analyze machine code output"]}
            ]
        }
    ],
    1406: [ # GPU Programming with CUDA
        {
            "title": "Shared Memory and Synchronization",
            "outcome": "Optimize CUDA kernels by utilizing shared memory and managing thread synchronization.",
            "timeline": "Week 5",
            "workspace_type": "c",
            "topics": [
                {"title": "The CUDA Memory Hierarchy", "subtopics": ["Global, Local, and Shared Memory", "Registers and Constant Memory", "Bank Conflicts"]},
                {"title": "Cooperative Thread Arrays", "subtopics": ["__syncthreads() mechanics", "Tiled algorithms (e.g., Matrix Multiplication)", "Shared memory allocation (static vs dynamic)"]},
                {"title": "Proof of Work: Tiled Matrix Multiply", "subtopics": ["Implement naive matrix multiply", "Implement tiled matrix multiply", "Profile and compare bandwidth"]}]
        },
        {
            "title": "Streams, Warps, and Occupancy",
            "outcome": "Maximize GPU utilization using concurrent streams and understanding warp execution.",
            "timeline": "Week 6",
            "workspace_type": "c",
            "topics": [
                {"title": "Warp Execution", "subtopics": ["Warp divergence", "Warp-level primitives (shuffles)", "Occupancy calculators"]},
                {"title": "CUDA Streams", "subtopics": ["Concurrent kernel execution", "Asynchronous memory transfers", "Pinned (Page-locked) memory"]},
                {"title": "Proof of Work: Concurrent Pipeline", "subtopics": ["Overlap data transfer with compute", "Use warp shuffle for reduction", "Measure kernel occupancy"]}]
        }
    ],
    1410: [ # Event-Driven Architecture with Kafka
        {
            "title": "Consumer Groups and Rebalancing",
            "outcome": "Manage scalable consumption by mastering Kafka's Consumer Groups and rebalance protocols.",
            "timeline": "Week 5",
            "workspace_type": "python",
            "topics": [
                {"title": "Consumer Group Mechanics", "subtopics": ["Group Coordinators", "Partition assignment strategies", "Heartbeats and Session timeouts"]},
                {"title": "Handling Rebalances", "subtopics": ["Stop-the-world vs Incremental Cooperative Rebalancing", "State management during rebalance", "Avoiding rebalance storms"]},
                {"title": "Proof of Work: Robust Consumer", "subtopics": ["Implement a custom partition assigner", "Handle rebalance callbacks", "Maintain local state safely"]}]
        },
        {
            "title": "Exactly-Once Semantics (EOS)",
            "outcome": "Guarantee data correctness in distributed streams using Kafka Transactions and Idempotent producers.",
            "timeline": "Week 6",
            "workspace_type": "python",
            "topics": [
                {"title": "Idempotent Producers", "subtopics": ["Producer IDs (PID) and Sequence Numbers", "Handling retries without duplicates", "Max in-flight requests constraints"]},
                {"title": "Kafka Transactions", "subtopics": ["The Transaction Coordinator", "Two-Phase Commit (2PC) in Kafka", "Read-Committed isolation level"]},
                {"title": "Proof of Work: EOS Pipeline", "subtopics": ["Configure an idempotent producer", "Write a transactional consume-transform-produce loop", "Test against broker failures"]}]
        }
    ],
    1415: [ # Memory Corruption
        {
            "title": "Return-Oriented Programming (ROP)",
            "outcome": "Bypass non-executable (NX) memory protections by chaining together existing code snippets.",
            "timeline": "Week 5",
            "workspace_type": "c",
            "topics": [
                {"title": "Bypassing NX (Data Execution Prevention)", "subtopics": ["Why shellcode fails on modern systems", "ret2libc basics", "Finding gadgets with ropper/roperg"]},
                {"title": "Building ROP Chains", "subtopics": ["Controlling registers via pop/ret", "Calling functions with arguments in 64-bit", "Pivoting the stack"]},
                {"title": "Proof of Work: ROP Exploit", "subtopics": ["Extract gadgets from a binary", "Construct a chain to call system('/bin/sh')", "Execute the exploit on a hardened binary"]}]
        },
        {
            "title": "Defeating ASLR and Modern Mitigations",
            "outcome": "Learn techniques to bypass Address Space Layout Randomization and Stack Canaries.",
            "timeline": "Week 6",
            "workspace_type": "c",
            "topics": [
                {"title": "Information Leaks", "subtopics": ["Leaking addresses via format strings", "Leaking via uninitialized memory", "Calculating base addresses"]},
                {"title": "Bypassing Canaries", "subtopics": ["Brute-forcing canaries (forking servers)", "Leaking the canary value", "Overwriting the master canary"]},
                {"title": "Proof of Work: Full Chain Exploit", "subtopics": ["Find an info leak to bypass ASLR", "Leak the stack canary", "Combine with ROP for remote code execution"]}]
        }
    ],
    1429: [ # Systems Design
        {
            "title": "Caching Strategies and CDNs",
            "outcome": "Optimize read-heavy workloads using distributed caching and Content Delivery Networks.",
            "timeline": "Week 5",
            "workspace_type": "system_design",
            "topics": [
                {"title": "Caching Patterns", "subtopics": ["Cache Aside, Read-Through, Write-Through, Write-Back", "Eviction policies (LRU, LFU)", "Cache Stampede prevention"]},
                {"title": "Distributed Caching", "subtopics": ["Redis vs Memcached", "Consistent Hashing for cache nodes", "Handling hot keys"]},
                {"title": "Proof of Work: Cache Architecture", "subtopics": ["Design a distributed cache tier", "Implement a consistent hashing ring", "Simulate handling a cache stampede"]}]
        },
        {
            "title": "Database Sharding and Replication",
            "outcome": "Scale stateful storage horizontally using replication topologies and sharding techniques.",
            "timeline": "Week 6",
            "workspace_type": "system_design",
            "topics": [
                {"title": "Replication", "subtopics": ["Single-leader vs Multi-leader vs Leaderless", "Synchronous vs Asynchronous replication", "Handling replication lag"]},
                {"title": "Sharding (Partitioning)", "subtopics": ["Key-value vs Hash-based vs Range-based sharding", "Rebalancing partitions", "Cross-shard transactions"]},
                {"title": "Proof of Work: Database Scale", "subtopics": ["Design a multi-region replication strategy", "Map data models to shard keys", "Resolve split-brain scenarios"]}]
        }
    ],
    1439: [ # Search Engine
        {
            "title": "Web Crawling and Graph Processing",
            "outcome": "Build a scalable, polite web crawler and analyze the link graph (PageRank).",
            "timeline": "Week 5",
            "workspace_type": "python",
            "topics": [
                {"title": "Scalable Crawling", "subtopics": ["Frontier queues and URL normalization", "Robots.txt and Politeness policies", "Distributed crawling architectures"]},
                {"title": "Link Analysis", "subtopics": ["The PageRank algorithm", "Damping factors and sink nodes", "HITS algorithm basics"]},
                {"title": "Proof of Work: The Crawler", "subtopics": ["Implement an async polite crawler", "Extract and clean text from HTML", "Calculate PageRank on a small graph"]}]
        },
        {
            "title": "Ranking and Query Processing",
            "outcome": "Implement relevance ranking models like BM25 and optimize query execution.",
            "timeline": "Week 6",
            "workspace_type": "python",
            "topics": [
                {"title": "Relevance Ranking", "subtopics": ["Term Frequency-Inverse Document Frequency (TF-IDF)", "The BM25 Probabilistic Model", "Proximity scoring"]},
                {"title": "Query Optimization", "subtopics": ["Boolean retrieval vs Ranked retrieval", "Document-at-a-time (DAAT) processing", "Early termination algorithms (WAND)"]},
                {"title": "Proof of Work: Ranking Engine", "subtopics": ["Implement the BM25 scoring formula", "Write a DAAT query processor", "Combine PageRank with BM25"]}]
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
        
        # Ensure timelines are sequential (e.g. Week 1, Week 2...)
        for idx, m in enumerate(plan['modules']):
            m['timeline'] = f"Week {idx + 1}"
        
        sb.table('roadmaps').update({'roadmap_plan': plan}).eq('id', course_id).execute()
        updated += 1
        print(f"Added modules to Course {course_id} - {course['title']}")
        
    print(f"Total courses updated: {updated}")

if __name__ == "__main__":
    main()
