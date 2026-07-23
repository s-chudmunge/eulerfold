"""
Directly seeds a course into the database, bypassing the backend API.
Acts as the AI model would — crafting the full JSON structure manually.
"""

import asyncio
import json
import uuid
import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

from app.core.supabase_client import get_supabase_client
from app.routers.roadmaps import _generate_unique_slug, _generate_plan_hash


def uid():
    return str(uuid.uuid4())


COURSE = {
    "title": "Real-time Collaboration with CRDTs",
    "description": "Build the data structures behind Google Docs and Figma multiplayer — conflict-free replicated data types that merge edits without a central server.",
    "modules": [
        {
            "id": "module_1",
            "title": "Why Consensus Isn't Enough",
            "outcome": "Understand when strong consistency is overkill and why CRDTs exist.",
            "timeline": "Week 1",
            "workspace_type": "research",
            "optimal_search_query": "CRDTs vs consensus algorithms distributed systems",
            "proof_of_work_instructions": {
                "what_to_build": "Write a technical comparison document (with diagrams) contrasting Raft-style consensus with CRDT-based eventual consistency, covering latency, availability, and conflict handling tradeoffs.",
                "what_counts_as_evidence": "A written document with at least two concrete scenarios where CRDTs outperform consensus and vice versa.",
                "eval_criteria": [
                    "Correctly distinguishes strong consistency from eventual consistency",
                    "Identifies at least two real-world systems using each approach"
                ]
            },
            "topics": [
                {
                    "id": "topic_1_1",
                    "uuid": uid(),
                    "title": "Strong vs Eventual Consistency",
                    "youtube_search_query": "strong consistency vs eventual consistency distributed systems",
                    "subtopics": [
                        {"id": uid(), "title": "Linearizability and sequential consistency"},
                        {"id": uid(), "title": "Eventual consistency guarantees and convergence"},
                        {"id": uid(), "title": "Real-world tradeoffs (banking vs social media)"}
                    ]
                },
                {
                    "id": "topic_1_2",
                    "uuid": uid(),
                    "title": "The CAP Theorem and Partition Tolerance",
                    "youtube_search_query": "CAP theorem partition tolerance explained",
                    "subtopics": [
                        {"id": uid(), "title": "Why network partitions are unavoidable"},
                        {"id": uid(), "title": "CP vs AP system design choices"},
                        {"id": uid(), "title": "PACELC extension of CAP"}
                    ]
                },
                {
                    "id": "topic_1_3",
                    "uuid": uid(),
                    "title": "Operational Transformation vs CRDTs",
                    "youtube_search_query": "operational transformation vs CRDT collaborative editing",
                    "subtopics": [
                        {"id": uid(), "title": "How Google Docs uses OT"},
                        {"id": uid(), "title": "OT's central server dependency"},
                        {"id": uid(), "title": "Why CRDTs eliminate the need for a coordinator"}
                    ]
                },
                {
                    "id": "topic_1_4",
                    "uuid": uid(),
                    "title": "Convergence and the Semilattice Property",
                    "youtube_search_query": "CRDT semilattice mathematical foundation",
                    "subtopics": [
                        {"id": uid(), "title": "Join-semilattices and partial orders"},
                        {"id": uid(), "title": "Monotonic state growth"},
                        {"id": uid(), "title": "Why commutativity and idempotency guarantee convergence"}
                    ]
                }
            ]
        },
        {
            "id": "module_2",
            "title": "State-Based CRDTs (CvRDTs)",
            "outcome": "Implement G-Counter, PN-Counter, and G-Set from scratch and prove they converge.",
            "timeline": "Week 2",
            "workspace_type": "code",
            "optimal_search_query": "state based CRDT implementation G-Counter PN-Counter",
            "proof_of_work_instructions": {
                "what_to_build": "Implement a G-Counter and a PN-Counter in Python or TypeScript. Write a test harness that simulates 3 replicas applying concurrent increments/decrements and merging state, asserting convergence after sync.",
                "what_counts_as_evidence": "Working code with tests proving that all 3 replicas converge to the same final count after arbitrary merge orderings.",
                "eval_criteria": [
                    "Merge function is commutative, associative, and idempotent",
                    "Test harness covers at least 3 concurrent update scenarios"
                ]
            },
            "topics": [
                {
                    "id": "topic_2_1",
                    "uuid": uid(),
                    "title": "G-Counter (Grow-Only Counter)",
                    "youtube_search_query": "CRDT G-Counter grow only counter implementation",
                    "subtopics": [
                        {"id": uid(), "title": "Per-replica counter vectors"},
                        {"id": uid(), "title": "The merge function: element-wise max"},
                        {"id": uid(), "title": "Computing the global count via sum"}
                    ]
                },
                {
                    "id": "topic_2_2",
                    "uuid": uid(),
                    "title": "PN-Counter (Positive-Negative Counter)",
                    "youtube_search_query": "CRDT PN-Counter positive negative counter",
                    "subtopics": [
                        {"id": uid(), "title": "Two G-Counters: one for increments, one for decrements"},
                        {"id": uid(), "title": "Why a single counter with subtraction breaks convergence"},
                        {"id": uid(), "title": "Querying the net value"}
                    ]
                },
                {
                    "id": "topic_2_3",
                    "uuid": uid(),
                    "title": "G-Set and 2P-Set",
                    "youtube_search_query": "CRDT G-Set 2P-Set set data structure",
                    "subtopics": [
                        {"id": uid(), "title": "G-Set: union as merge (add-only)"},
                        {"id": uid(), "title": "2P-Set: separate add and remove sets"},
                        {"id": uid(), "title": "The tombstone problem: why removed elements can't be re-added"}
                    ]
                },
                {
                    "id": "topic_2_4",
                    "uuid": uid(),
                    "title": "LWW-Register (Last-Writer-Wins)",
                    "youtube_search_query": "last writer wins register CRDT timestamp",
                    "subtopics": [
                        {"id": uid(), "title": "Timestamps and tie-breaking strategies"},
                        {"id": uid(), "title": "LWW-Element-Set for mutable collections"},
                        {"id": uid(), "title": "When LWW is acceptable and when it silently drops data"}
                    ]
                }
            ]
        },
        {
            "id": "module_3",
            "title": "Operation-Based CRDTs (CmRDTs)",
            "outcome": "Build an operation-based counter and understand causal delivery requirements.",
            "timeline": "Week 3",
            "workspace_type": "code",
            "optimal_search_query": "operation based CRDT CmRDT causal broadcast",
            "proof_of_work_instructions": {
                "what_to_build": "Implement an operation-based OR-Set (Observed-Remove Set) that supports add and remove without tombstone buildup. Include a simulated causal broadcast layer using vector clocks.",
                "what_counts_as_evidence": "Working code demonstrating add/remove operations across 3 replicas with out-of-order message delivery, converging to the correct final set.",
                "eval_criteria": [
                    "OR-Set correctly handles concurrent add and remove of the same element",
                    "Vector clock implementation correctly tracks causal ordering"
                ]
            },
            "topics": [
                {
                    "id": "topic_3_1",
                    "uuid": uid(),
                    "title": "State-Based vs Operation-Based: Tradeoffs",
                    "youtube_search_query": "CvRDT vs CmRDT state based operation based CRDT comparison",
                    "subtopics": [
                        {"id": uid(), "title": "Bandwidth: shipping full state vs deltas"},
                        {"id": uid(), "title": "Delivery guarantees: at-least-once vs exactly-once vs causal"},
                        {"id": uid(), "title": "When to choose each approach"}
                    ]
                },
                {
                    "id": "topic_3_2",
                    "uuid": uid(),
                    "title": "Vector Clocks and Causal Delivery",
                    "youtube_search_query": "vector clocks causal ordering distributed systems",
                    "subtopics": [
                        {"id": uid(), "title": "Lamport timestamps vs vector clocks"},
                        {"id": uid(), "title": "Detecting concurrent operations"},
                        {"id": uid(), "title": "Guaranteeing causal broadcast for CmRDTs"}
                    ]
                },
                {
                    "id": "topic_3_3",
                    "uuid": uid(),
                    "title": "OR-Set (Observed-Remove Set)",
                    "youtube_search_query": "CRDT OR-Set observed remove set implementation",
                    "subtopics": [
                        {"id": uid(), "title": "Unique tags per add operation"},
                        {"id": uid(), "title": "Remove only observed tags, not the element"},
                        {"id": uid(), "title": "Why OR-Set solves the 2P-Set tombstone problem"}
                    ]
                },
                {
                    "id": "topic_3_4",
                    "uuid": uid(),
                    "title": "Delta-State CRDTs",
                    "youtube_search_query": "delta state CRDT efficient synchronization",
                    "subtopics": [
                        {"id": uid(), "title": "Shipping deltas instead of full state"},
                        {"id": uid(), "title": "Delta-groups and anti-entropy protocols"},
                        {"id": uid(), "title": "Practical bandwidth savings in large clusters"}
                    ]
                }
            ]
        },
        {
            "id": "module_4",
            "title": "Building a Collaborative Text Editor",
            "outcome": "Implement a working collaborative text editor using a sequence CRDT.",
            "timeline": "Week 4",
            "workspace_type": "code",
            "optimal_search_query": "CRDT collaborative text editor implementation sequence CRDT",
            "proof_of_work_instructions": {
                "what_to_build": "Build a minimal collaborative plain-text editor using a sequence CRDT (RGA or LSEQ). Two browser tabs (or simulated peers) should be able to type concurrently, sync via WebSocket, and converge to the same document.",
                "what_counts_as_evidence": "A working demo where two peers type simultaneously, go offline briefly, reconnect, and the document converges correctly without data loss.",
                "eval_criteria": [
                    "Concurrent inserts at the same position produce a deterministic, consistent ordering on both peers",
                    "The system handles offline edits and re-synchronization without duplicating or losing characters"
                ]
            },
            "topics": [
                {
                    "id": "topic_4_1",
                    "uuid": uid(),
                    "title": "Sequence CRDTs: RGA and LSEQ",
                    "youtube_search_query": "sequence CRDT RGA LSEQ text editing",
                    "subtopics": [
                        {"id": uid(), "title": "RGA (Replicated Growable Array) structure"},
                        {"id": uid(), "title": "LSEQ: variable-bit allocation for insert positions"},
                        {"id": uid(), "title": "Interleaving problem and how RGA solves it"}
                    ]
                },
                {
                    "id": "topic_4_2",
                    "uuid": uid(),
                    "title": "Yjs: A Production CRDT Library",
                    "youtube_search_query": "Yjs CRDT library collaborative editing tutorial",
                    "subtopics": [
                        {"id": uid(), "title": "Yjs document model and shared types"},
                        {"id": uid(), "title": "Providers: y-websocket, y-webrtc, y-indexeddb"},
                        {"id": uid(), "title": "Awareness protocol for cursor positions"}
                    ]
                },
                {
                    "id": "topic_4_3",
                    "uuid": uid(),
                    "title": "Automerge and the Document Model",
                    "youtube_search_query": "Automerge CRDT document model local first software",
                    "subtopics": [
                        {"id": uid(), "title": "Automerge's JSON-like document structure"},
                        {"id": uid(), "title": "Change history and time travel"},
                        {"id": uid(), "title": "Local-first software philosophy"}
                    ]
                },
                {
                    "id": "topic_4_4",
                    "uuid": uid(),
                    "title": "Networking: Syncing Peers via WebSocket and WebRTC",
                    "youtube_search_query": "peer to peer sync WebSocket WebRTC CRDT",
                    "subtopics": [
                        {"id": uid(), "title": "Client-server sync via WebSocket relay"},
                        {"id": uid(), "title": "Peer-to-peer sync via WebRTC data channels"},
                        {"id": uid(), "title": "Offline-first: persisting state in IndexedDB"}
                    ]
                }
            ]
        }
    ]
}


# Hand-picked resources per module
RESOURCES = {
    0: [
        {"title": "A comprehensive study of CRDTs (Shapiro et al., 2011)", "url": "https://hal.inria.fr/inria-00555588/document", "type": "article"},
        {"title": "Designing Data-Intensive Applications - Chapter 5 (Kleppmann)", "url": "https://dataintensive.net/", "type": "article"},
    ],
    1: [
        {"title": "CRDT.tech — A collection of CRDT resources", "url": "https://crdt.tech/", "type": "article"},
        {"title": "An Interactive CRDT Playground", "url": "https://github.com/pfrazee/crdt_notes", "type": "article"},
    ],
    2: [
        {"title": "Vector Clocks Explained (Martin Kleppmann's blog)", "url": "https://martin.kleppmann.com/2022/10/12/verifiable-distributed-systems.html", "type": "article"},
        {"title": "Delta State CRDTs (Almeida et al., 2018)", "url": "https://arxiv.org/abs/1603.01529", "type": "article"},
    ],
    3: [
        {"title": "Yjs Documentation", "url": "https://docs.yjs.dev/", "type": "article"},
        {"title": "Automerge — A JSON-like CRDT", "url": "https://automerge.org/", "type": "article"},
        {"title": "Local-First Software (Ink & Switch)", "url": "https://www.inkandswitch.com/local-first/", "type": "article"},
    ],
}


async def main():
    sb = get_supabase_client()
    email = "eulerfold@gmail.com"

    # Attach resources
    for i, module in enumerate(COURSE["modules"]):
        if i in RESOURCES:
            module["resources"] = RESOURCES[i]

    slug = await _generate_unique_slug(COURSE["title"], email, sb)

    db_data = {
        "title": COURSE["title"],
        "description": COURSE["description"],
        "roadmap_plan": COURSE,
        "subject": "Distributed Systems",
        "goal": "Build conflict-free replicated data types for real-time collaboration",
        "time_value": 4,
        "time_unit": "weeks",
        "model": "hand-authored",
        "email": email,
        "slug": slug,
        "status": "active",
        "version": 1,
        "snapshot_hash": _generate_plan_hash(COURSE),
        "is_public": True,
        "show_author": True,
    }

    print(f"Inserting '{COURSE['title']}' into database...")
    response = sb.table("roadmaps").insert(db_data).execute()
    if response.data:
        rid = response.data[0]["id"]
        print(f"Success! Roadmap ID: {rid}")
        print(f"Now run: python smart_video_enrich.py {rid}")
    else:
        print("Failed to insert.")


if __name__ == "__main__":
    asyncio.run(main())
