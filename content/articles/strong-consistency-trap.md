---
title: "Why Strong Consistency is a Trap for Distributed State"
slug: "strong-consistency-trap"
shortSlug: "consistency"
author: "Sankalp — Engineering Lead"
date: "May 30, 2026"
subject: "Distributed Systems"
heroImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop"
excerpt: "Forcing synchronous locks on asynchronous workflows builds brittle systems; true scale requires designing for deterministic conflict resolution."
technicalInsight: "Distributed locks fail due to clock skew and GC pauses. Resilient systems utilize CRDTs and Lamport timestamps to achieve convergence without global coordination."
synonyms:
  - "Distributed Systems"
  - "CRDT"
  - "Strong Consistency"
  - "Eventual Consistency"
  - "Redlock"
  - "Lamport Timestamps"
---

Every time a system requires multiple actors to update the same dataset, the engineering instinct is to lock the state. An incident report highlights a race condition, and within hours, the team proposes a centralized Redis mutex, a PostgreSQL advisory lock, or a message queue to serialize access. They presume that preventing concurrent writes is the only way to prevent data corruption. This approach functions under ideal laboratory conditions, but it degrades violently the moment network latency fluctuates. 

I have reviewed dozens of post-mortems where systems tore themselves apart under load, and the root cause is almost always the same: the instinct to lock distributed state is a hangover from single-threaded programming. Engineers attempt to enforce a strict order of operations across a network because it makes the system easier to reason about, not because it makes the system more resilient. But distributed systems do not guarantee time, order, or delivery. When teams try to force them to, they do not eliminate errors; they simply move the failure point down to the network layer, where they have absolutely no control over the outcome.

**Locks rely on time, and networks lie about time**

When teams implement distributed locking mechanisms, they usually assume the lock itself is a source of absolute truth. Kyle Kingsbury’s extensive [Jepsen analyses](https://jepsen.io/analyses) have repeatedly dismantled this assumption. In his evaluation of the [Redis Redlock algorithm](https://jepsen.io/analyses/redis-ratelimit), Kingsbury demonstrated exactly how this architecture fails in production.

If Node A acquires a lock to write to a database, the lock is granted with a time-to-live (TTL) expiration to prevent the system from deadlocking if Node A crashes. But if Node A experiences a sudden garbage collection pause—a common occurrence in languages like Java or Go—the node freezes. While it is frozen, the network clock keeps ticking. The lock expires. Node B requests the lock, receives it, and begins its write. Then, Node A wakes up. Unaware that its time has expired, Node A proceeds with its write. Two nodes now hold the "exclusive" lock simultaneously, and the database state is silently corrupted. The architecture failed because the lock relied on synchronized wall clocks, which do not exist in distributed environments. 

**The physics of the speed-of-light tax**

Beyond reliability, enforcing strong consistency imposes a brutal performance ceiling. If your architecture demands a single source of truth, every mutation must be routed through a consensus algorithm like Raft or Paxos. 

In his research on [local-first software](https://www.inkandswitch.com/local-first/), Martin Kleppmann identifies this as a hard physical limit rather than a software defect. If a user in Tokyo clicks a button and the system requires a synchronous round-trip to a primary database in Virginia to validate a lock before updating the UI, the application is bound by the speed of light. You are hardcoding a latency floor of roughly 150 milliseconds into every interaction. Kleppmann notes that engineers routinely accept this degraded user experience because they lack the vocabulary for resolving data conflicts after the fact. Attempting to strictly serialize events globally is an architectural decision to artificially constrain throughput.

**Replacing coordination with deterministic math**

The alternative to preventing conflict is mathematically guaranteeing how conflicts resolve. Consider how systems at the scale of YouTube handle view counts. If they locked a database row every time a user watched a video, the infrastructure would melt. 

Instead, they abandon coordination entirely. Using a Grow-Only Counter (G-Counter)—a basic Conflict-free Replicated Data Type (CRDT)—disparate edge nodes simply increment their local cache independently. When those nodes eventually communicate with the central datastore, they do not check for locks. They simply merge by taking the maximum value from each replica. The state converges deterministically. They do not fight the network; they use data structures designed to ignore it. 

**Character IDs prevent index corruption**

When engineers first attempt to build collaborative systems, they usually track array indexes. User A and User B are editing the word "CAT". User A wants to delete the "A" at index 1. At the exact same millisecond, User B inserts an "H" at index 0 to spell "HCAT". If the system relies on standard index operations, User B's insertion shifts the array. User A's command to "delete index 1" arrives at the server and deletes the "C" instead of the "A", corrupting the document.

Libraries built on [Kleppmann’s Automerge research](https://automerge.org/) solve this without locking by abandoning array indexes entirely. Instead, they assign a unique, immutable Lamport timestamp ID to every single character. User A’s operation is no longer "delete the character at index 1." It becomes "delete the character with ID 9482." User B’s operation becomes "insert 'H' with ID 9483 immediately before the character with ID 9481." Because the operations reference unique identifiers rather than relative positions, they can be applied in any order, across any network delay, and the final state will always converge flawlessly. The application code is stripped of heavy retry mechanisms and collision-handling logic because the complexity has been pushed down into the data structure itself.

**Coordination is an expensive illusion**

Engineers plateau when they refuse to abandon the illusion of global control. They continue wrapping distributed systems in thicker layers of centralized coordination—larger Kafka clusters, stricter database isolation levels, more aggressive timeouts—hoping to finally achieve perfect synchronization.

But perfect global state is a liability. The most robust distributed systems are not the ones that attempt to perfectly coordinate state across the globe; they are the ones designed to tolerate the inevitable drift between nodes. Reaching for a distributed lock should be a painful, final compromise, reserved strictly for financial ledgers or inventory hard-allocations. For almost everything else, true operational scale requires letting go of the lock, accepting the reality of network partitions, and trusting the math to resolve the state.