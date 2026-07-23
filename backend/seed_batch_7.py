import uuid
import json
import asyncio
import re
import httpx
from app.core.supabase_client import get_supabase_client
from app.routers.roadmaps import _generate_unique_slug, _generate_plan_hash

def make_uuid():
    return str(uuid.uuid4())

async def verify_url(url):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            resp = await client.head(url, headers=headers, follow_redirects=True)
            if resp.status_code < 400:
                return True
            resp = await client.get(url, headers=headers, follow_redirects=True)
            return resp.status_code < 400
    except Exception:
        return False

def build_roadmap_plan(modules_data):
    plan = {"modules": []}
    for m in modules_data:
        module_id = make_uuid()
        topics = []
        for t in m["topics"]:
            topic_id = make_uuid()
            subtopics = [{"id": make_uuid(), "title": st} for st in t["subtopics"]]
            topics.append({
                "id": topic_id,
                "title": t["title"],
                "description": f"Learn about {t['title'].lower()} in detail.",
                "youtube_search_query": t["youtube_search_query"],
                "subtopics": subtopics
            })
        
        plan["modules"].append({
            "id": module_id,
            "title": m["title"],
            "description": f"Deep dive into {m['title'].lower()}.",
            "topics": topics,
            "proof_of_work_instructions": m["proof_of_work_instructions"],
            "resources": m["resources"]
        })
    return plan

def create_course(title, description, subject, modules_data):
    plan = build_roadmap_plan(modules_data)
    return {
        "title": title,
        "description": description,
        "subject": subject,
        "plan": plan
    }

courses_info = [
    # 1. Kubernetes Networking: CNI & Service Mesh Internals
    {
        "title": "Kubernetes Networking: CNI & Service Mesh Internals",
        "description": "Understanding how pods actually talk to each other demystifies 90% of K8s debugging.",
        "subject": "Platform Engineers & SREs",
        "modules_data": [
            {
                "title": "Linux Network Namespaces & veth Pairs in K8s",
                "topics": [
                    {"title": "Linux Network Namespaces & veth Pair Plumbing", "youtube_search_query": "kubernetes cni veth pair network namespace routing Linux", "subtopics": ["Terminal and non-terminal network namespaces", "veth pair creation and peer linking", "Routing table configuration inside container netns"]},
                    {"title": "IPAM & Subnet Allocation in Kubernetes Clusters", "youtube_search_query": "kubernetes CNI IPAM subnet allocation cluster networking", "subtopics": ["Pod CIDR allocation per node", "Host-local vs DHCP IPAM plugins", "Preventing IP collisions across cluster nodes"]},
                    {"title": "Packet Traversal across Nodes with Overlay & Underlay Networks", "youtube_search_query": "kubernetes pod to pod networking overlay VXLAN Calico Cilium", "subtopics": ["VXLAN encapsulation and outer IP headers", "Direct routing with BGP underlay networks", "MTU size adjustment and fragmentation overhead"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A bash script that manually creates two network namespaces, links them with a veth pair, configures IP addresses and routing rules, and demonstrates ping packet flow.",
                    "what_counts_as_evidence": "Terminal execution output showing namespace creation, ip netns exec commands, veth link assignment, and successful ICMP reply packet captures.",
                    "eval_criteria": ["veth pair is correctly bound to target network namespaces", "IP routing table within namespace resolves remote target IP", "Packet flow is validated via tcpdump or ping"]
                },
                "resources": [
                    {"title": "Kubernetes Cluster Networking Documentation", "url": "https://kubernetes.io/docs/concepts/cluster-administration/networking/"},
                    {"title": "Calico CNI Architectural Overview", "url": "https://docs.tigera.io/calico/latest/about/"}
                ]
            },
            {
                "title": "CNI Plugins (Calico, Cilium, Flannel) Deep Dive",
                "topics": [
                    {"title": "CNI Specification & Lifecycle Hooks", "youtube_search_query": "CNI specification add delete command CNI plugin development", "subtopics": ["CNI_COMMAND env variables (ADD, DEL, CHECK)", "Parsing JSON stdin configuration payload", "Returning standard CNI result JSON structures"]},
                    {"title": "eBPF-based Datapath Routing with Cilium", "youtube_search_query": "Cilium eBPF kernel networking BPF maps kubernetes", "subtopics": ["Bypassing iptables overhead via eBPF sockmap", "eBPF tail calls and packet parsing", "Observability via Hubble eBPF flows"]},
                    {"title": "BGP & IP-in-IP vs VXLAN Overlay Encap/Decap", "youtube_search_query": "Calico BGP BPF VXLAN encapsulation IP in IP performance", "subtopics": ["Bird BGP daemon integration in Calico", "IP-in-IP tunnel interface configuration", "Performance benchmarks: Encapsulated vs Native routing"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A minimal custom CNI plugin script/binary in Bash or Python that handles ADD and DEL commands to assign IP addresses to container network interfaces.",
                    "what_counts_as_evidence": "JSON responses matching the CNI spec schema returned on ADD/DEL calls and verification of network interface creation in container namespace.",
                    "eval_criteria": ["Implements CNI spec JSON output schema correctly", "Parses CNI_ARGS and CNI_COMMAND environment variables", "Allocates IP address and configures default gateway inside container namespace"]
                },
                "resources": [
                    {"title": "CNI Specification GitHub", "url": "https://github.com/containernetworking/cni"},
                    {"title": "Cilium Architecture & eBPF Networking", "url": "https://docs.cilium.io/en/stable/overview/intro/"}
                ]
            },
            {
                "title": "Kube-Proxy, iptables & IPVS Internal Mechanics",
                "topics": [
                    {"title": "Kube-Proxy Modes: iptables vs IPVS vs eBPF", "youtube_search_query": "kube proxy iptables vs ipvs vs ebpf load balancing kubernetes", "subtopics": ["Linear search O(N) bottleneck in iptables", "Hash table O(1) performance in IPVS mode", "eBPF replacement for kube-proxy"]},
                    {"title": "Kubernetes Service Abstraction & ClusterIP NAT Rules", "youtube_search_query": "kubernetes ClusterIP service PREROUTING KUBE-SERVICES iptables", "subtopics": ["PREROUTING and OUTPUT chain intercept rules", "KUBE-SERVICES and KUBE-SVC chain traversal", "DNAT transformation from Service IP to Pod IP"]},
                    {"title": "NodePort & LoadBalancer Traffic Routing & Hairpin NAT", "youtube_search_query": "kubernetes NodePort LoadBalancer traffic flow hairpin NAT", "subtopics": ["KUBE-NODEPORTS chain logic", "SNAT rule for preserving source IP", "Hairpin NAT for pod self-communication"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An iptables rule trace script that inspects a Kubernetes ClusterIP Service VIP lookup through KUBE-SERVICES and KUBE-SVC chains to backend pod endpoints.",
                    "what_counts_as_evidence": "Annotated text trace demonstrating how iptables probability matching randomly distributes traffic across pod endpoints.",
                    "eval_criteria": ["Correctly identifies PREROUTING and OUTPUT chains for Service VIPs", "Explains probability weight calculation in iptables rules", "Traces packet transformation from Service IP to Pod IP"]
                },
                "resources": [
                    {"title": "Kubernetes Services Documentation", "url": "https://kubernetes.io/docs/concepts/services-networking/service/"},
                    {"title": "iptables System Reference", "url": "https://netfilter.org/documentation/"}
                ]
            },
            {
                "title": "Service Mesh Control & Data Planes (Istio & Envoy)",
                "topics": [
                    {"title": "Sidecar Proxy Injection & iptables Redirects", "youtube_search_query": "Istio Envoy sidecar proxy injection iptables REDIRECT traffic capture", "subtopics": ["istio-init container PREROUTING REDIRECT setup", "Loopback interface traffic capture on port 15001", "Bypassing proxy for health checks and egress"]},
                    {"title": "Envoy Proxy Architecture: Listeners, Clusters, and Filters", "youtube_search_query": "Envoy proxy architecture listeners clusters routes filters deep dive", "subtopics": ["Dynamic configuration discovery APIs (xDS)", "Listener and Cluster filter chain processing", "Circuit breaking and connection pooling in Envoy"]},
                    {"title": "mTLS, Traffic Splitting, and Observability in Istio", "youtube_search_query": "Istio mTLS SPIFFE certificate rotation traffic shifting canary Envoy", "subtopics": ["SPIFFE ID identities and mTLS handshake", "Istiod Citadel CA certificate issuance", "VirtualService canary traffic weight distribution"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An Envoy proxy configuration file with custom listener and cluster definitions routing traffic to dual upstream HTTP backend instances with weighted load balancing.",
                    "what_counts_as_evidence": "Envoy admin interface /clusters output showing endpoint status and curl responses confirming traffic split ratio.",
                    "eval_criteria": ["Configures static/dynamic clusters and endpoints in envoy.yaml", "Sets up HTTP connection manager filter chain correctly", "Demonstrates working local traffic routing through Envoy proxy"]
                },
                "resources": [
                    {"title": "Envoy Proxy Official Documentation", "url": "https://www.envoyproxy.io/docs/envoy/latest/"},
                    {"title": "Istio Service Mesh Architecture", "url": "https://istio.io/latest/docs/ops/deployment/architecture/"}
                ]
            }
        ]
    },

    # 2. Linux Performance Tuning: perf & ftrace & bpftrace
    {
        "title": "Linux Performance Tuning: perf & ftrace & bpftrace",
        "description": "The standard toolkit for diagnosing why production Linux systems are slow.",
        "subject": "SREs & Linux Systems Administrators",
        "modules_data": [
            {
                "title": "CPU & Hardware Counter Analysis with perf",
                "topics": [
                    {"title": "Hardware Performance Counters & PMU Events", "youtube_search_query": "Linux perf CPU hardware PMU counters cache misses IPC", "subtopics": ["Performance Monitoring Unit (PMU) architecture", "Instructions Per Cycle (IPC) measurement", "L1 / Last Level Cache (LLC) miss monitoring"]},
                    {"title": "Flame Graphs & Sampling Profiling", "youtube_search_query": "perf record perf report FlameGraph visualization CPU profiling Linux", "subtopics": ["perf record sampling frequency configuration", "Stack trace unwinding: dwarf vs frame pointers", "Generating SVG flame graphs with Brendan Gregg tools"]},
                    {"title": "Annotating Assembly & Cache Line Contention", "youtube_search_query": "perf annotate assembly instructions cache line contention false sharing", "subtopics": ["perf annotate source code matching", "Detecting false sharing on SMP cache lines", "perf c2c (cache-to-cache) memory profiling"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A C or Rust benchmark program exhibiting high CPU cache misses, profiled with perf stat and flamegraph generation tools.",
                    "what_counts_as_evidence": "Perf stat summary output showing IPC (instructions per cycle) and L1/LLC cache miss rates alongside an SVG flame graph.",
                    "eval_criteria": ["Identifies cache miss hotspots using perf annotate or perf report", "Generates valid FlameGraph SVG representation of stack traces", "Accurately interprets hardware counter metrics (IPC, branch mispredictions)"]
                },
                "resources": [
                    {"title": "perf Wiki & Documentation", "url": "https://perf.wiki.kernel.org/index.php/Main_Page"},
                    {"title": "Brendan Gregg's Flame Graphs Guide", "url": "https://www.brendangregg.com/flamegraphs.html"}
                ]
            },
            {
                "title": "Kernel Function Tracing with ftrace & trace-cmd",
                "topics": [
                    {"title": "Ftrace Infrastructure & Function Graph Tracer", "youtube_search_query": "Linux ftrace trace-cmd function graph tracer kernel debugging", "subtopics": ["debugfs tracing directory interface (/sys/kernel/debug/tracing)", "function_graph tracer output format", "Filtering traced functions via set_ftrace_filter"]},
                    {"title": "Tracepoints, Kprobes, and Dynamic Probe Hooks", "youtube_search_query": "Linux kernel tracepoints kprobes kretprobes ftrace event tracing", "subtopics": ["Static tracepoints vs dynamic kprobes", "Kernel probe trampoline mechanics", "Inspecting trace events in /sys/kernel/debug/tracing/events"]},
                    {"title": "Latency Analysis: Irqsoff, Preemptoff, and Wakeup Tracing", "youtube_search_query": "ftrace latency tracing irqsoff preemptoff kernel scheduling delay", "subtopics": ["Measuring interrupt-disabled latency windows", "Preemption latency tracing for real-time kernels", "Scheduling wakeup latency diagnosis"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A shell script utilizing debugfs ftrace interface to trace kernel function execution times for system calls like sys_enter_read and sys_enter_write.",
                    "what_counts_as_evidence": "Trace log extract captured from /sys/kernel/debug/tracing/trace showing function graph execution durations in microseconds.",
                    "eval_criteria": ["Configures ftrace tracer mode (function_graph) via debugfs", "Applies filter file rules to target specific kernel functions", "Calculates kernel execution latency from trace log outputs"]
                },
                "resources": [
                    {"title": "Linux Kernel Documentation - ftrace", "url": "https://docs.kernel.org/trace/ftrace.html"},
                    {"title": "trace-cmd Official Documentation", "url": "https://trace-cmd.org/"}
                ]
            },
            {
                "title": "eBPF-Powered Observability with bpftrace",
                "topics": [
                    {"title": "bpftrace One-Liners & Scripting Language Basics", "youtube_search_query": "bpftrace eBPF one liners tutorial kernel tracing system calls", "subtopics": ["bpftrace syntax: probe, predicate, and action", "Built-in variables: pid, comm, nsecs, args", "Associative maps and aggregation functions"]},
                    {"title": "Aggregating System Call Latency & Disk I/O Histograms", "youtube_search_query": "bpftrace sys_enter_read bio_latency I/O histogram eBPF", "subtopics": ["Tracing block device I/O with block:block_rq_issue", "Generating power-of-two log histograms (@hist)", "Measuring syscall duration with kretprobe hooks"]},
                    {"title": "User-Space Statically Defined Tracepoints (USDT) & Upbrobes", "youtube_search_query": "bpftrace uprobe uretprobe USDT tracing nodejs python application performance", "subtopics": ["Attaching uprobes to shared libraries (.so)", "USDT tracepoints in Python, Node.js, and MySQL", "Overhead considerations of user-space tracing"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A custom bpftrace script that hooks into kernel vfs_read / vfs_write or blk_account_io_done and prints a log-linear histogram of I/O latency.",
                    "what_counts_as_evidence": "Terminal output demonstrating live bpftrace histogram plots for application block I/O read/write calls.",
                    "eval_criteria": ["Uses @hist() or @quantize() aggregations effectively", "Hooks correct kernel tracepoint or kprobe for block device I/O", "Filters events by process ID (PID) or process name"]
                },
                "resources": [
                    {"title": "bpftrace Reference Guide", "url": "https://github.com/bpftrace/bpftrace/blob/master/docs/reference_guide.md"},
                    {"title": "eBPF Official Documentation", "url": "https://ebpf.io/what-is-ebpf/"}
                ]
            },
            {
                "title": "System Bottleneck Diagnostics & Kernel Tuning",
                "topics": [
                    {"title": "Memory Subsystem Tuning: Page Cache, Dirty Ratio, & Swapiness", "youtube_search_query": "Linux memory tuning vm.dirty_ratio vm.swappiness page cache compaction", "subtopics": ["vm.dirty_background_ratio vs vm.dirty_ratio", "Swappiness calculation and anonymous page eviction", "Transitional page compaction delays"]},
                    {"title": "Network Stack Bottlenecks & sysctl Tuning", "youtube_search_query": "Linux TCP network tuning rmem wmem backlog SOMAXCONN TCP TIME_WAIT", "subtopics": ["net.core.somaxconn listen queue size", "TCP receive and send socket memory auto-tuning", "tcp_tw_reuse vs tcp_tw_recycle security"]},
                    {"title": "I/O Scheduler & Cgroup v2 Resource Limits", "youtube_search_query": "Linux blkio cgroups v2 I/O scheduler tuning mq-deadline kyber bfq", "subtopics": ["Selecting I/O schedulers for NVMe vs SATA SSDs", "Configuring cgroup v2 io.max bandwidth throttling", "Monitoring Pressure Stall Information (PSI)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A tuning configuration script and report analyzing system performance before and after modifying sysctl parameters (vm.dirty_background_ratio, net.core.somaxconn, net.ipv4.tcp_tw_reuse).",
                    "what_counts_as_evidence": "Benchmarking report showing throughput/latency changes measured via fio or wrk under tuned sysctl parameters.",
                    "eval_criteria": ["Explains exact mechanism behind each modified sysctl kernel variable", "Measures baseline vs post-tuning metrics using reproducible benchmarks", "Avoids destructive or unsafe memory allocation parameters"]
                },
                "resources": [
                    {"title": "Linux Kernel Administration Guide", "url": "https://docs.kernel.org/admin-guide/index.html"},
                    {"title": "Red Hat Performance Tuning Guide", "url": "https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/monitoring_and_managing_system_status_and_performance/index"}
                ]
            }
        ]
    },

    # 3. Writing Async Runtimes (Tokio & Event Loops)
    {
        "title": "Writing Async Runtimes (Tokio & Event Loops)",
        "description": "How async/await actually works under the hood — from epoll to task scheduling.",
        "subject": "Rust & Systems Developers",
        "modules_data": [
            {
                "title": "OS Non-Blocking I/O Primitives (epoll / kqueue / io_uring)",
                "topics": [
                    {"title": "Synchronous vs Asynchronous I/O Models", "youtube_search_query": "non blocking IO synchronous vs asynchronous epoll kqueue io_uring", "subtopics": ["Blocking I/O thread-per-connection scaling limits", "Non-blocking socket flags (O_NONBLOCK)", "Ready-based vs Completion-based I/O models"]},
                    {"title": "Linux epoll Architecture: epoll_create, epoll_ctl, epoll_wait", "youtube_search_query": "Linux epoll C tutorial epoll_create epoll_wait edge triggered", "subtopics": ["epoll red-black tree and ready list kernel data structures", "Level-triggered vs Edge-triggered (EPOLLET) notifications", "Handling EAGAIN / EWOULDBLOCK on socket read/write"]},
                    {"title": "High Performance Async I/O with Linux io_uring", "youtube_search_query": "Linux io_uring submission completion queue async IO Rust C", "subtopics": ["Submission Queue (SQ) and Completion Queue (CQ) ring buffers", "Zero-copy I/O operations", "Registered file descriptors and buffers"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A low-level C or Rust TCP echo server operating directly on raw epoll (or kqueue) system calls without external libraries.",
                    "what_counts_as_evidence": "Source code repository and output log demonstrating simultaneous TCP client connections handled concurrently in a non-blocking single-threaded loop.",
                    "eval_criteria": ["Sets file descriptors to NONBLOCK mode using fcntl", "Correctly handles EPOLLIN, EPOLLOUT, and EAGAIN/EWOULDBLOCK error codes", "Cleanly unregisters closed client sockets from epoll instance"]
                },
                "resources": [
                    {"title": "epoll(7) Linux Manual Page", "url": "https://man7.org/linux/man-pages/man7/epoll.7.html"},
                    {"title": "io_uring Official Guide", "url": "https://kernel.dk/io_uring.pdf"}
                ]
            },
            {
                "title": "The Rust Future Trait & Manual Waker Implementation",
                "topics": [
                    {"title": "The Future Trait Contract: Poll, Context, and Pinning", "youtube_search_query": "Rust Future trait Poll Context Pin Unpin async await internal", "subtopics": ["Poll::Ready vs Poll::Pending return variants", "Context and Waker reference handling", "Self-referential structs and Pinning (Pin<&mut Self>)"]},
                    {"title": "Implementing Wakers & Task Notification", "youtube_search_query": "Rust custom Waker RawWaker vtable wake_by_ref futures", "subtopics": ["RawWaker and RawWakerVTable function pointers", "Reference counting wakers (ArcWake)", "Re-enqueuing tasks to the executor on wake()"]},
                    {"title": "State Machines Generated by Async/Await", "youtube_search_query": "Rust async await state machine compiler lowering yield points", "subtopics": ["Compiler translation of async fn into state machine enums", "Yield points across await boundary calls", "Stack frame size optimization in async Rust"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A custom hand-rolled Future implementation in Rust that models a timer or channel receiver, complete with manual RawWaker vtable creation.",
                    "what_counts_as_evidence": "Rust code unit tests demonstrating that calling poll() registers a waker and notifies the executor when the async event completes.",
                    "eval_criteria": ["Correctly implements Future trait with Pin<&mut Self> and Poll<Self::Output>", "Uses RawWaker and RawWakerVTable to trigger task polling", "Ensures memory safety and avoids dangling waker pointers"]
                },
                "resources": [
                    {"title": "Rust Async Book", "url": "https://rust-lang.github.io/async-book/"},
                    {"title": "std::future::Future Rust Documentation", "url": "https://doc.rust-lang.org/std/future/trait.Future.html"}
                ]
            },
            {
                "title": "Building an Executor & Cooperative Task Scheduler",
                "topics": [
                    {"title": "Task Queues & Work-Stealing Schedulers", "youtube_search_query": "Rust async executor work stealing scheduler task queue Tokio", "subtopics": ["Global task queue vs per-thread local queues", "Work-stealing queue algorithms (Chase-Lev)", "Thread parking and unparking mechanisms"]},
                    {"title": "Reactor / Executor Pattern Split", "youtube_search_query": "Reactor Executor pattern async runtime Tokio Mio event loop", "subtopics": ["Reactor registering interest with OS epoll", "Executor polling ready tasks", "Waker bridge between Reactor events and Executor queues"]},
                    {"title": "Cooperative Scheduling & Yield Points", "youtube_search_query": "cooperative scheduling async yield budget Tokio starvation prevention", "subtopics": ["Enforcing task execution budgets", "tokio::task::yield_now() mechanics", "Preventing cpu-bound tasks from starving I/O tasks"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A mini single-threaded and multi-threaded Rust executor capable of running spawned futures to completion.",
                    "what_counts_as_evidence": "Runnable Rust test suite spawning 1,000 concurrent async timer tasks and proving all tasks complete successfully.",
                    "eval_criteria": ["Implements task queue and thread pool execution mechanism", "Integrates event reactor with executor wakers", "Prevents CPU starvation by enforcing cooperative yield budget"]
                },
                "resources": [
                    {"title": "Tokio Architecture Overview", "url": "https://tokio.rs/tokio/tutorial"},
                    {"title": "Futures-rs GitHub Repository", "url": "https://github.com/rust-lang/futures-rs"}
                ]
            },
            {
                "title": "Async Synchronization, Channels & Tokio Internals",
                "topics": [
                    {"title": "Async Mutexes, Semaphores & RWLocks vs std Synchronization", "youtube_search_query": "Rust Tokio Mutex vs std Mutex async concurrency deadlock safety", "subtopics": ["Why std::sync::Mutex blocks thread execution", "Tokio async Mutex lock yielding across await boundaries", "Async Semaphore permit acquisition"]},
                    {"title": "MPSC & Broadcast Channel Data Structures", "youtube_search_query": "Rust async mpsc broadcast oneshot channel implementation ring buffer", "subtopics": ["Bounded vs unbounded channel buffers", "Waker lists inside channel sender/receiver state", "Atomic tail and head pointer updates"]},
                    {"title": "Tokio Runtime Architecture: Mio, Drivers, and Timeouts", "youtube_search_query": "Tokio runtime internal architecture Mio driver timer wheel scheduler", "subtopics": ["Mio abstraction layer over epoll/kqueue/IOCP", "Hierarchical Timer Wheel data structure for timeouts", "Customizing Tokio runtime flavor (current_thread vs multi_thread)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An asynchronous lock-free or ring-buffer MPSC (Multi-Producer Single-Consumer) channel implementation that integrates with custom Wakers.",
                    "what_counts_as_evidence": "Concurrency test suite validating message passing between async tasks under high contention without data loss or deadlocks.",
                    "eval_criteria": ["Channel send/recv methods return Futures that yield on full/empty buffers", "Handles waker notification when capacity becomes available", "Zero memory leaks or race conditions confirmed by Miri or ThreadSanitizer"]
                },
                "resources": [
                    {"title": "Tokio Official Documentation", "url": "https://docs.rs/tokio/latest/tokio/"},
                    {"title": "Mio Cross-Platform I/O Library", "url": "https://docs.rs/mio/latest/mio/"}
                ]
            }
        ]
    },

    # 4. Implementing a Key-Value Store (LSM & WAL)
    {
        "title": "Implementing a Key-Value Store (LSM & WAL)",
        "description": "Build a working database engine with write-ahead logging and compaction — like a mini RocksDB.",
        "subject": "Storage Engineers & Backend Developers",
        "modules_data": [
            {
                "title": "Write-Ahead Logging (WAL) & Crash Recovery",
                "topics": [
                    {"title": "Disk I/O Semantics: O_DIRECT, fsync, and Page Cache", "youtube_search_query": "Write Ahead Logging WAL database recovery fsync page cache disk", "subtopics": ["OS page cache buffering behavior", "fsync vs fdatasync durability guarantees", "O_DIRECT bypassing page cache"]},
                    {"title": "Binary Log Format, CRC Checksums, and Framed Records", "youtube_search_query": "WAL binary format framing record header CRC32 checksum database storage", "subtopics": ["Header encoding: Sequence Number, Record Type, Length", "CRC32 checksum calculation for corruption detection", "Append-only file write positioning"]},
                    {"title": "Crash Recovery & Log Replay Strategies", "youtube_search_query": "database crash recovery WAL replay log checkpointing ACID storage engine", "subtopics": ["Replaying WAL records upon cold startup", "Handling partial/corrupted log writes on crash", "Checkpointing and WAL truncation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A crash-safe Write-Ahead Logger module in C++, Rust, or Go that appends binary operations, computes CRC32 checksums, and replays state on startup.",
                    "what_counts_as_evidence": "Test script that writes operations, simulates process crash via SIGKILL, and verifies database state is perfectly restored upon restart.",
                    "eval_criteria": ["Appends entry payload with length header and CRC32 checksum", "Forces disk persistence using fsync/fdatasync at configured intervals", "Detects partial/corrupt trailing log entries during recovery replay"]
                },
                "resources": [
                    {"title": "RocksDB Write Ahead Log Architecture", "url": "https://github.com/facebook/rocksdb/wiki/Write-Ahead-Log"},
                    {"title": "SQLite WAL File Format Documentation", "url": "https://www.sqlite.org/walformat.html"}
                ]
            },
            {
                "title": "In-Memory MemTable (SkipLists & Concurrent Datastructures)",
                "topics": [
                    {"title": "SkipList Data Structure Design & Search Complexity", "youtube_search_query": "SkipList data structure implementation insert search probabilistic indexing", "subtopics": ["Probabilistic height assignment", "O(log N) expected search and insertion time", "Forward pointer array traversal"]},
                    {"title": "Concurrent MemTable Writes with Lock-Free SkipLists", "youtube_search_query": "concurrent SkipList lock free CAS operations database MemTable", "subtopics": ["Compare-And-Swap (CAS) atomic pointer updates", "Hazard pointers / Epoch-based memory reclamation", "Thread-safe concurrent iterators"]},
                    {"title": "Memory Bounding, MemTable Freezing & Immutable Switching", "youtube_search_query": "MemTable flush immutable MemTable RocksDB LSM storage architecture", "subtopics": ["Tracking MemTable memory byte size", "Freezing active MemTable into immutable MemTable", "Triggering background flush to disk"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A thread-safe SkipList implementation serving as an in-memory MemTable supporting Range scans and atomic updates.",
                    "what_counts_as_evidence": "Unit benchmark suite demonstrating concurrent writes and ordered iterator traversal over 100,000 key-value items.",
                    "eval_criteria": ["Maintains sorted key order during dynamic insertions", "Supports range scan iterators with Seek, Next, and Valid methods", "Implements memory threshold triggers to freeze active MemTable"]
                },
                "resources": [
                    {"title": "Pugh's Original SkipList Paper", "url": "https://ftp.cs.umd.edu/pub/skipLists/skiplists.pdf"},
                    {"title": "RocksDB MemTable Wiki", "url": "https://github.com/facebook/rocksdb/wiki/MemTable"}
                ]
            },
            {
                "title": "SSTable Format, Indexing & Bloom Filters",
                "topics": [
                    {"title": "SSTable On-Disk Layout: Data Blocks, Index Blocks, & Footer", "youtube_search_query": "SSTable format layout data block index block footer RocksDB LevelDB", "subtopics": ["Fixed size block formatting", "Index block offset pointing to data block boundaries", "Footer format containing magic number and index handle"]},
                    {"title": "Fast Point Lookups using Bloom Filters", "youtube_search_query": "Bloom Filter implementation false positive rate bit array hashing database lookup", "subtopics": ["Bit array and optimal hash function count (k)", "False positive probability formula", "Bypassing SSTable disk reads when Bloom filter returns false"]},
                    {"title": "Binary Search & Prefix Compression in Index Blocks", "youtube_search_query": "SSTable index block binary search delta key prefix compression", "subtopics": ["Delta key encoding to reduce disk footprint", "Binary search over sorted block restart points", "SSTable reader block cache integration"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An SSTable file generator and reader module that writes sorted MemTable content to disk with a block index and Bloom filter footer.",
                    "what_counts_as_evidence": "Binary file format parser output demonstrating index lookup, Bloom filter check, and single block disk read for point queries.",
                    "eval_criteria": ["Encodes SSTable data into fixed-size compressed data blocks", "Generates Bloom filter byte array stored in SSTable footer", "Performs efficient key lookup with minimal disk I/O seek operations"]
                },
                "resources": [
                    {"title": "LevelDB SSTable Format Documentation", "url": "https://github.com/google/leveldb/blob/main/doc/table_format.md"},
                    {"title": "Bloom Filters Explained Guide", "url": "https://en.wikipedia.org/wiki/Bloom_filter"}
                ]
            },
            {
                "title": "Compaction Strategies (Size-Tiered vs Leveled)",
                "topics": [
                    {"title": "LSM Tree Read Amplification, Write Amplification, & Space Amplification", "youtube_search_query": "LSM tree read amplification write amplification space amplification trade-offs", "subtopics": ["Definition of Read, Write, and Space Amplification metrics", "Trade-offs between B-Trees and LSM Trees", "Mitigating write amplification in SSD storage"]},
                    {"title": "Leveled Compaction Architecture (Level 0 to Level N)", "youtube_search_query": "Leveled compaction RocksDB Level 0 multi level merge sort SSTable", "subtopics": ["Overlapping keys in Level 0 SSTables", "Non-overlapping key ranges in Level 1+", "Selecting candidate SSTables for compaction"]},
                    {"title": "Size-Tiered Compaction & Merging Iterators", "youtube_search_query": "Size tiered compaction vs Leveled compaction k-way merge sort iterators", "subtopics": ["k-way merge sort using min-heap priority queues", "Tombstone deletion handling and key purging", "Compaction rate limiting to prevent I/O saturation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A background Compaction Engine that performs k-way merge-sorting of multiple SSTables, purges overwritten/deleted (tombstone) keys, and outputs combined level SSTables.",
                    "what_counts_as_evidence": "Compaction run log showing 4 Level-0 SSTables merged into 1 clean Level-1 SSTable with garbage keys purged.",
                    "eval_criteria": ["Merges multiple sorted iterators using a priority queue (k-way merge)", "Respects tombstone deletion entries and drops expired records", "Maintains LSM level invariant rules post compaction"]
                },
                "resources": [
                    {"title": "RocksDB Compaction Architectures Overview", "url": "https://github.com/facebook/rocksdb/wiki/Compaction"},
                    {"title": "Database Internals Book Official Site", "url": "https://www.databass.dev/"}
                ]
            }
        ]
    },

    # 5. Advanced CSS: Layout Algorithms & Rendering Pipeline
    {
        "title": "Advanced CSS: Layout Algorithms & Rendering Pipeline",
        "description": "Understanding how the browser actually computes layout explains every CSS bug you've ever had.",
        "subject": "Frontend Engineers frustrated by CSS",
        "modules_data": [
            {
                "title": "The Browser Rendering Pipeline & Composite Layers",
                "topics": [
                    {"title": "Parsing, DOM, CSSOM, and Render Tree Construction", "youtube_search_query": "browser rendering pipeline CSSOM Render Tree Layout Paint Composite", "subtopics": ["HTML tokenization and DOM tree construction", "CSS rule matching and CSSOM creation", "Render Tree attachment and computed style resolution"]},
                    {"title": "Layout Invalidation (Reflow) vs Paint Invalidation (Repaint)", "youtube_search_query": "browser reflow repaint forced synchronous layout performance bottleneck", "subtopics": ["Properties that trigger Layout (width, height, top)", "Properties that trigger Paint only (color, background)", "Forced synchronous reflows caused by offsetHeight/scrollTop reads"]},
                    {"title": "GPU Acceleration & Compositor Layers", "youtube_search_query": "CSS GPU acceleration promote compositor layer transform opacity will-change", "subtopics": ["Compositor layer promotion triggers (transform 3d, opacity)", "GPU texture transfer and VRAM consumption", "Using will-change property responsibly"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A performance test suite using Chrome DevTools Performance profile API / Puppeteer tracing that identifies and fixes layout thrashing caused by forced synchronous reflows.",
                    "what_counts_as_evidence": "Before-and-after DevTools timeline traces showing reduction of recalculate style and layout costs from 60ms to under 2ms per frame.",
                    "eval_criteria": ["Identifies DOM read/write interleaving that causes layout thrashing", "Batch reads and writes using requestAnimationFrame or modern CSS properties", "Promotes animated elements to independent compositor layers without memory bloat"]
                },
                "resources": [
                    {"title": "MDN Web Docs - Rendering Performance", "url": "https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work"},
                    {"title": "Web.dev - Inside look at modern web browser", "url": "https://web.dev/articles/inside-browser-part1"}
                ]
            },
            {
                "title": "Formatting Contexts & Box Model Mechanics",
                "topics": [
                    {"title": "Block Formatting Context (BFC) Triggers & Margin Collapsing", "youtube_search_query": "Block Formatting Context BFC margin collapsing rules clearing floats CSS", "subtopics": ["Margin collapsing rules between adjacent block elements", "Creating a new BFC via overflow: hidden, display: flow-root", "Containing internal floats with BFC"]},
                    {"title": "Inline Formatting Context (IFC), Baseline Alignment & Strut", "youtube_search_query": "Inline Formatting Context IFC baseline alignment line box strut CSS layout", "subtopics": ["Line box height calculation and strut baseline", "vertical-align keywords (baseline, middle, text-top)", "Eliminating mysterious gap under inline images"]},
                    {"title": "Stacking Contexts & z-index Resolution Algorithm", "youtube_search_query": "CSS Stacking Context z-index isolation opacity transform will-change", "subtopics": ["Triggers for new stacking context (position + z-index, opacity < 1, transform)", "Atomic stacking order evaluation (background, negative z-index, block, inline, z-index >= 1)", "Using CSS isolation: isolate to scope z-index children"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An interactive HTML/CSS diagnostic suite reproducing and solving 3 complex layout edge cases: margin collapsing bugs, inline-block baseline misalignments, and z-index isolation failures.",
                    "what_counts_as_evidence": "DOM rendered page screenshot and clean CSS code demonstrating explicit BFC containment and proper stacking context creation.",
                    "eval_criteria": ["Creates clean BFC containment without hacky clearing techniques", "Explains line box baseline computation rules clearly", "Fixes z-index hierarchy issues using CSS isolation: isolate or transform rules"]
                },
                "resources": [
                    {"title": "MDN Web Docs - Block Formatting Context", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Block_formatting_context"},
                    {"title": "MDN Web Docs - Stacking Context", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context"}
                ]
            },
            {
                "title": "Flexbox & Grid Layout Algorithm Deep Dive",
                "topics": [
                    {"title": "Flexbox Item Sizing Algorithm: flex-basis, flex-grow, and flex-shrink", "youtube_search_query": "CSS Flexbox sizing algorithm flex grow shrink basis calculation math", "subtopics": ["Determining main size from flex-basis", "Distributing positive free space via flex-grow ratios", "Distributing negative free space via flex-shrink * flex-basis weighted math"]},
                    {"title": "Grid Track Sizing: minmax(), auto-fill vs auto-fit, and Subgrid", "youtube_search_query": "CSS Grid track sizing algorithm minmax auto-fill auto-fit subgrid layout", "subtopics": ["Intrinsic vs extrinsic track sizing", "auto-fill vs auto-fit empty track collapse behavior", "Subgrid inheriting parent grid track lines"]},
                    {"title": "Alignment Algorithms: Place-items, Place-content, and Safe Alignment", "youtube_search_query": "CSS Box Alignment module place-items place-content safe unsafe keywords", "subtopics": ["justify-content vs align-content along main and cross axes", "place-items shortcut syntax", "safe keyword preventing data loss when content overflows container"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A complex responsive dashboard layout built with CSS Subgrid and CSS Grid without JavaScript breakpoints, supporting fluid container queries.",
                    "what_counts_as_evidence": "Live HTML page rendering correctly across desktop, tablet, and mobile viewports with zero horizontal overflow or broken flex item ratios.",
                    "eval_criteria": ["Utilizes CSS Grid minmax() and auto-fit for fluid grid resizing", "Demonstrates precise alignment using subgrid for aligned multi-column card contents", "Calculates flex-shrink/flex-grow distribution mathematically in CSS comments"]
                },
                "resources": [
                    {"title": "MDN Web Docs - CSS Flexible Box Layout", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout"},
                    {"title": "MDN Web Docs - CSS Grid Layout", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout"}
                ]
            },
            {
                "title": "Container Queries & Modern CSS Architecture",
                "topics": [
                    {"title": "Container Queries (@container) & Container Units", "youtube_search_query": "CSS Container Queries container-type container-name cqw cqh responsive component design", "subtopics": ["container-type: inline-size vs size", "Named container context scoping", "Container query length units (cqw, cqh, cqi)"]},
                    {"title": "CSS Cascade Layers (@layer) & Specificity Architecture", "youtube_search_query": "CSS Cascade Layers @layer specificity resolution modern CSS architecture", "subtopics": ["Explicit layer order declaration (@layer reset, base, components)", "How @layer overrides traditional selector specificity", "Unlayered styles precedence over layered styles"]},
                    {"title": "CSS Custom Properties Dynamics & Modern Logical Properties", "youtube_search_query": "CSS custom properties variables scoping fallback logical properties inline-size", "subtopics": ["Runtime cascading custom properties", "Logical properties (margin-inline, padding-block) for i18n RTL support", "CSS color-mix() and modern color spaces (oklch)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A modular design system component library styled using @layer architecture and @container queries, rendered inside sidebars and main content areas seamlessly.",
                    "what_counts_as_evidence": "Component render showcase demonstrating card layout dynamically adapting between 1-column, 2-column, and horizontal banner styles based strictly on container width.",
                    "eval_criteria": ["Defines explicitly ordered cascade layers (@layer reset, base, components, utilities)", "Applies container queries (@container) for self-contained component responsiveness", "Uses logical CSS properties (margin-inline, padding-block) throughout"]
                },
                "resources": [
                    {"title": "MDN Web Docs - CSS Container Queries", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries"},
                    {"title": "MDN Web Docs - CSS Cascade Layers", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/@layer"}
                ]
            }
        ]
    },

    # 6. Streaming LLM Responses: SSE & WebSockets in Production
    {
        "title": "Streaming LLM Responses: SSE & WebSockets in Production",
        "description": "The plumbing behind every chat UI — handling backpressure and reconnection and token buffering.",
        "subject": "Full-Stack AI Application Developers",
        "modules_data": [
            {
                "title": "Server-Sent Events (SSE) Protocol & Framing",
                "topics": [
                    {"title": "HTTP/1.1 & HTTP/2 Streaming with text/event-stream", "youtube_search_query": "Server Sent Events SSE HTTP streaming text event stream protocol", "subtopics": ["Setting Content-Type: text/event-stream header", "Disabling HTTP proxy response buffering", "HTTP/2 multiplexing vs HTTP/1.1 connection limits"]},
                    {"title": "Framing SSE Messages: data, event, id, and retry Fields", "youtube_search_query": "SSE format event framing data field retry reconnection standard", "subtopics": ["Formatting multiline data fields (data: ...)", "Custom event type naming (event: token)", "Setting client reconnect delays (retry: 5000)"]},
                    {"title": "Reconnection Semantics & Last-Event-ID Headers", "youtube_search_query": "SSE reconnection handling Last-Event-ID header state recovery", "subtopics": ["Browser EventSource auto-reconnection behavior", "Passing Last-Event-ID on connection resume", "Server token stream index resume buffer"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A lightweight FastAPI or Node.js SSE server stream endpoint that pushes incremental tokens with explicit event IDs and reconnection buffering.",
                    "what_counts_as_evidence": "Curl output demonstrating HTTP 200 response with Content-Type: text/event-stream and chunked transfer encoding stream.",
                    "eval_criteria": ["Sets header Content-Type: text/event-stream and disables HTTP response buffering", "Formats messages strictly as data: ...\\n\\n compliant with SSE spec", "Handles client disconnection events cleanly without leaking server tasks"]
                },
                "resources": [
                    {"title": "MDN Web Docs - Server-Sent Events API", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events"},
                    {"title": "HTML Standard - Server-Sent Events Specification", "url": "https://html.spec.whatwg.org/multipage/server-sent-events.html"}
                ]
            },
            {
                "title": "WebSockets for Bi-Directional AI Interaction",
                "topics": [
                    {"title": "WebSocket Handshake & Frame Masking Protocol", "youtube_search_query": "WebSocket protocol handshake HTTP upgrade Sec-WebSocket-Key frame masking", "subtopics": ["HTTP Upgrade request header negotiation", "Sec-WebSocket-Accept SHA-1 key hash response", "Client frame masking vs unmasked server frames"]},
                    {"title": "Full-Duplex Audio & Text Streaming for Real-Time LLMs", "youtube_search_query": "WebSocket full duplex streaming OpenAI realtime API audio text", "subtopics": ["Streaming PCM audio chunks alongside text tokens", "Interrupted response cancellation handling", "Binary vs text frame opcodes"]},
                    {"title": "Connection Heartbeats, Ping/Pong Frames & Reconnection", "youtube_search_query": "WebSocket ping pong heartbeat auto reconnect backoff state management", "subtopics": ["Detecting dead TCP connections via Ping/Pong frames", "Client exponential backoff reconnection algorithm", "Preserving conversation session context across sockets"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A full-duplex WebSocket client-server application that streams user input audio/text chunks to a mock LLM process and streams audio/text chunks back.",
                    "what_counts_as_evidence": "WebSocket frame exchange log showing binary/text frames, heartbeat ping-pong frames, and clean close handshake.",
                    "eval_criteria": ["Executes HTTP upgrade request to 101 Switching Protocols", "Encodes and decodes WebSocket frames according to RFC 6455", "Implements exponential backoff reconnect logic on client side"]
                },
                "resources": [
                    {"title": "MDN Web Docs - WebSockets API", "url": "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API"},
                    {"title": "RFC 6455 - The WebSocket Protocol", "url": "https://datatracker.ietf.org/doc/html/rfc6455"}
                ]
            },
            {
                "title": "Client-Side Token Buffering & Backpressure",
                "topics": [
                    {"title": "ReadableStream API & Custom Stream Transformers", "youtube_search_query": "JavaScript ReadableStream TransformStream chunk parsing SSE client", "subtopics": ["fetch() response.body ReadableStream reading", "TextDecoderStream for decoding byte chunks", "Custom TransformStream splitters for SSE line boundaries"]},
                    {"title": "Smooth Markdown Parsing & Partial JSON Parsing", "youtube_search_query": "parse partial JSON streaming LLM Markdown rendering smooth typewriter effect", "subtopics": ["Handling unclosed code blocks and formatting in partial streams", "Incremental JSON parsing algorithms for tool call streaming", "Smooth typewriter effect pacing"]},
                    {"title": "Backpressure & Rendering Performance (requestAnimationFrame)", "youtube_search_query": "streaming text UI backpressure requestAnimationFrame token batching performance", "subtopics": ["Preventing React state update churn on high token rates", "Batching token updates with requestAnimationFrame", "Auto-scrolling DOM container logic without scroll lock"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A frontend React/TypeScript custom hook useLLMStream that consumes an SSE endpoint, parses partial markdown/JSON tokens, and renders text with zero UI lag.",
                    "what_counts_as_evidence": "Frontend component rendering smoothly at 60 FPS under high token burst rates (100 tokens/sec).",
                    "eval_criteria": ["Parses chunked stream buffers correctly without splitting multi-byte UTF-8 sequences", "Handles partial JSON validation gracefully for structured outputs", "Batches DOM update renders using requestAnimationFrame to prevent layout thrashing"]
                },
                "resources": [
                    {"title": "MDN Web Docs - Streams API", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Streams_API"},
                    {"title": "Vercel AI SDK Core Documentation", "url": "https://sdk.vercel.ai/docs"}
                ]
            },
            {
                "title": "Production Architecture: Gateways, Load Balancing & Stateful Routers",
                "topics": [
                    {"title": "Long-Lived Connection Load Balancing (NGINX / HAProxy / Envoy)", "youtube_search_query": "load balancing SSE WebSockets NGINX Envoy keepalive timeout proxy", "subtopics": ["Configuring proxy_buffering off in NGINX", "Tuning proxy_read_timeout for persistent streams", "Sticky sessions vs stateless token routing"]},
                    {"title": "Edge Gateway Streaming & Serverless Timeouts", "youtube_search_query": "edge streaming Vercel Cloudflare Workers HTTP streaming timeout limits", "subtopics": ["Cloudflare Workers TransformStream edge responses", "Bypassing 30-second serverless execution timeouts", "HTTP response chunking overhead at edge"]},
                    {"title": "Stream Resumption & Redis Pub/Sub Backing", "youtube_search_query": "resumable LLM streams Redis PubSub stateful connection recovery", "subtopics": ["Publishing stream tokens to Redis channels", "Rebuilding disconnected stream state from Redis list caches", "Graceful shutdown and socket draining"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An end-to-end load balanced architecture (Docker Compose with NGINX, Redis Pub/Sub, FastAPI worker) delivering resilient streaming LLM responses across multiple server nodes.",
                    "what_counts_as_evidence": "Stress test script (e.g. Locust or k6) showing 500 concurrent active SSE streaming connections without connection drops or proxy buffer timeouts.",
                    "eval_criteria": ["Configures proxy proxy_buffering off and proxy_read_timeout in NGINX", "Distributes token streams across backend nodes via Redis channels", "Recovers active client stream seamlessly upon single backend node failure"]
                },
                "resources": [
                    {"title": "NGINX WebSocket Proxying Guide", "url": "https://www.nginx.com/blog/websocket-nginx/"},
                    {"title": "FastAPI Streaming Response Documentation", "url": "https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse"}
                ]
            }
        ]
    },

    # 7. Building MCP Servers (Model Context Protocol)
    {
        "title": "Building MCP Servers (Model Context Protocol)",
        "description": "The emerging standard for connecting AI agents to external tools and data sources.",
        "subject": "AI Engineers & Tool Builder",
        "modules_data": [
            {
                "title": "Model Context Protocol (MCP) Core Architecture",
                "topics": [
                    {"title": "MCP Specification: Host, Client, and Server Roles", "youtube_search_query": "Model Context Protocol MCP specification architecture Anthropic AI", "subtopics": ["Host environment (e.g. Claude Desktop, IDEs)", "Client adapter vs Server implementation roles", "Decoupling tool definitions from AI provider models"]},
                    {"title": "JSON-RPC 2.0 Protocol Framing over stdio & SSE", "youtube_search_query": "MCP JSON-RPC 2.0 transport stdio SSE protocol handshake", "subtopics": ["Standard JSON-RPC 2.0 message envelope format", "stdio transport line-delimited message framing", "Server-Sent Events (SSE) HTTP transport fallback"]},
                    {"title": "Capability Negotiation & Lifecycle Protocol", "youtube_search_query": "MCP capability negotiation initialize tools resources prompts", "subtopics": ["Protocol version handshake (initialize request)", "Client/Server capability exchange (tools, resources, prompts)", "initialized notification lifecycle flow"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A standalone MCP server in Python or TypeScript that implements the stdio transport layer and responds to initialize and ping JSON-RPC 2.0 requests.",
                    "what_counts_as_evidence": "JSON-RPC request/response payload logs matching the official Model Context Protocol specification.",
                    "eval_criteria": ["Parses JSON-RPC 2.0 input messages over stdin", "Sends properly formatted JSON-RPC response objects to stdout", "Handles server capabilities reporting (tools, resources, prompts) during initialization"]
                },
                "resources": [
                    {"title": "Model Context Protocol Official Specification", "url": "https://modelcontextprotocol.io/introduction"},
                    {"title": "MCP Python SDK GitHub Repository", "url": "https://github.com/modelcontextprotocol/python-sdk"}
                ]
            },
            {
                "title": "Exposing Tools & Dynamic Function Calling",
                "topics": [
                    {"title": "Defining Tool Schemas with JSON Schema", "youtube_search_query": "MCP tool definition JSON Schema dynamic function calling LLM", "subtopics": ["Declaring tool names and descriptions", "JSON Schema inputSchema definition (type, properties, required)", "Supporting enum, nested object, and array inputs"]},
                    {"title": "Tool Invocation Handlers & Input Validation", "youtube_search_query": "MCP tools/call request handler error handling parameter validation", "subtopics": ["Handling tools/call request payloads", "Validating arguments against inputSchema using Zod or Pydantic", "Returning TextContent or ImageContent result arrays"]},
                    {"title": "Async Execution, Progress Reporting & Cancellation", "youtube_search_query": "MCP async tool execution progress notifications token cancellation", "subtopics": ["Sending $/progress notifications during long operations", "Handling $/cancel token cancellation requests", "Error handling: IS_ERROR flags vs JSON-RPC protocol errors"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An MCP server exposing 3 custom operational tools (e.g. database query, system status check, API fetch) with strict Pydantic / Zod input schemas.",
                    "what_counts_as_evidence": "Client test script executing tools/list and tools/call and verifying valid structured return data.",
                    "eval_criteria": ["Exposes valid JSON Schema representations for tool arguments", "Validates client input parameters before tool execution", "Returns structured text and image content blocks in tool call results"]
                },
                "resources": [
                    {"title": "MCP Tools Specification Guide", "url": "https://modelcontextprotocol.io/docs/concepts/tools"},
                    {"title": "JSON Schema Standard Specification", "url": "https://json-schema.org/"}
                ]
            },
            {
                "title": "Managing Resources & Dynamic Context Pushing",
                "topics": [
                    {"title": "MCP Resource Definition & URI Schemes", "youtube_search_query": "MCP resources URIs file git database resource templates", "subtopics": ["Resource URI format design (custom:// or file://)", "Resource metadata: name, description, mimeType", "Resource templates with parameterized URIs"]},
                    {"title": "Reading Resource Content & MIME Type Annotations", "youtube_search_query": "MCP resources/read handler MIME types text binary content", "subtopics": ["Handling resources/read requests", "Serving UTF-8 text content vs base64 binary blobs", "MIME type headers (application/json, text/plain)"]},
                    {"title": "Dynamic Resource Subscriptions & Update Notifications", "youtube_search_query": "MCP resource subscriptions notifications updates list_changed", "subtopics": ["Handling resources/subscribe requests", "Emitting notifications/resources/updated alerts", "Invalidating client-side cached resource contents"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An MCP server exposing dynamic system log files as subscription resources (file:///var/log/...), emitting update notifications when new log lines are appended.",
                    "what_counts_as_evidence": "Terminal output showing subscription registration (resources/subscribe) and subsequent notifications/resources/updated payloads sent to client.",
                    "eval_criteria": ["Registers custom URI schema handlers (file:// or custom://)", "Delivers text or blob resource contents with valid MIME types", "Triggers resource update notifications upon file modification events"]
                },
                "resources": [
                    {"title": "MCP Resources Specification Guide", "url": "https://modelcontextprotocol.io/docs/concepts/resources"},
                    {"title": "MCP TypeScript SDK GitHub Repository", "url": "https://github.com/modelcontextprotocol/typescript-sdk"}
                ]
            },
            {
                "title": "Security, Authentication & Remote SSE Transports",
                "topics": [
                    {"title": "Transport Security & SSE Server Transports", "youtube_search_query": "MCP SSE transport HTTP security authentication CORS tokens", "subtopics": ["Mounting MCP over HTTP Server-Sent Events", "POST /messages endpoint for client JSON-RPC commands", "CORS headers for web browser based AI clients"]},
                    {"title": "Authorization & Fine-Grained Tool Access Control", "youtube_search_query": "MCP authorization authentication security sandbox environment", "subtopics": ["OAuth2 Bearer token authentication headers", "Restricting dangerous tools based on user API key scopes", "Sandboxing command execution inside Docker containers"]},
                    {"title": "Testing & Integrating MCP Servers with Claude Desktop & Agents", "youtube_search_query": "Claude Desktop MCP server integration config debugging inspector", "subtopics": ["Claude Desktop claude_desktop_config.json setup", "Debugging stdio logs using MCP Inspector tool", "Publishing custom MCP servers"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An HTTP/SSE-based MCP server secured with bearer token authentication, integrated into Claude Desktop or an AI agent framework.",
                    "what_counts_as_evidence": "Claude Desktop log or client test verifying tool discovery and execution over an authenticated SSE transport connection.",
                    "eval_criteria": ["Enforces HTTP Bearer authentication on SSE endpoint connections", "Validates cross-origin CORS headers for browser-based agents", "Successfully operates with MCP Inspector tool test suite"]
                },
                "resources": [
                    {"title": "MCP Inspector Debugging Tool", "url": "https://github.com/modelcontextprotocol/inspector"},
                    {"title": "Claude Desktop MCP Configuration Guide", "url": "https://modelcontextprotocol.io/quickstart/user"}
                ]
            }
        ]
    },

    # 8. Financial Data Pipelines with dbt & Snowflake
    {
        "title": "Financial Data Pipelines with dbt & Snowflake",
        "description": "Transforming raw financial data into auditable analytics without spreadsheet chaos.",
        "subject": "Data Engineers in Fintech",
        "modules_data": [
            {
                "title": "Financial Data Warehousing & Snowflake Architecture",
                "topics": [
                    {"title": "Snowflake Storage vs Compute Architecture", "youtube_search_query": "Snowflake architecture micro-partitions virtual warehouses storage compute separation", "subtopics": ["Decoupled storage and compute scaling", "Micro-partitioning and pruning optimization", "Virtual Warehouse size configuration and auto-suspend"]},
                    {"title": "Designing Immutable Ledger & Fact Tables", "youtube_search_query": "financial ledger data modeling fact dimension tables immutability Snowflake", "subtopics": ["Double-entry bookkeeping table schema", "Append-only fact table design principles", "Surrogate keys vs natural transaction IDs"]},
                    {"title": "Data Encryption, Masking Policies, and Role-Based Access Control (RBAC)", "youtube_search_query": "Snowflake dynamic data masking policies RBAC row access policy security", "subtopics": ["Dynamic data masking policies (CREATE MASKING POLICY)", "Row Access Policies for multi-tenant account isolation", "Granting granular privileges to Snowflake roles"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Snowflake SQL schema definition for a double-entry financial ledger featuring immutable transactions, custom data masking policies for account numbers, and virtual warehouse scaling rules.",
                    "what_counts_as_evidence": "DDL script and query execution results showing unprivileged role accessing masked transaction data while admin role accesses unmasked values.",
                    "eval_criteria": ["Implements immutable append-only transaction tables", "Configures dynamic data masking policies (CREATE MASKING POLICY)", "Grants role-based privileges according to least-privilege security principle"]
                },
                "resources": [
                    {"title": "Snowflake Documentation - Architecture Overview", "url": "https://docs.snowflake.com/en/user-guide/architecture"},
                    {"title": "Snowflake Documentation - Data Masking Policies", "url": "https://docs.snowflake.com/en/user-guide/security-column-ddm-use"}
                ]
            },
            {
                "title": "dbt Project Architecture & Dimensional Data Modeling",
                "topics": [
                    {"title": "Staging, Intermediate, and Mart Layer Organization", "youtube_search_query": "dbt project structure staging intermediate marts data modeling best practices", "subtopics": ["Staging models (stg_) for cleanup and renaming", "Intermediate models (int_) for complex joins", "Mart fact (fct_) and dimension (dim_) tables"]},
                    {"title": "Incremental Models & Window Functions for Financial Aggregations", "youtube_search_query": "dbt incremental models unique_key merge strategy window functions balance", "subtopics": ["Configuring materialized='incremental'", "unique_key and merge update strategies", "Calculating running balances using SUM() OVER (PARTITION BY ... ORDER BY ...)"]},
                    {"title": "Slowly Changing Dimensions (SCD Type 2) with dbt Snapshots", "youtube_search_query": "dbt snapshots SCD Type 2 slowly changing dimensions historical tracking", "subtopics": ["dbt snapshot configuration and timestamp strategies", "Tracking historical changes to customer credit limits", "dbt_valid_from and dbt_valid_to timestamp fields"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A dbt project containing SQL models for staging raw transaction data, computing incremental account balances using window functions, and snapshotting customer account status (SCD Type 2).",
                    "what_counts_as_evidence": "Compiled SQL output and successful dbt run / dbt snapshot console execution logs.",
                    "eval_criteria": ["Organizes models into stg_, int_, and fct_ layers", "Uses is_incremental() conditional logic to optimize table merges", "Snapshot configuration tracks historical state changes using updated_at strategy"]
                },
                "resources": [
                    {"title": "dbt Documentation - Project Structure", "url": "https://docs.getdbt.com/guides/best-practices/how-we-structure/1-guide-overview"},
                    {"title": "dbt Documentation - Snapshots Overview", "url": "https://docs.getdbt.com/docs/build/snapshots"}
                ]
            },
            {
                "title": "Data Quality, Auditing & Financial Reconciliation",
                "topics": [
                    {"title": "dbt Data Tests: Generic, Singular & Custom Package Tests", "youtube_search_query": "dbt data tests unique not_null accepted_values dbt-expectations", "subtopics": ["Built-in generic tests (unique, not_null, relationships)", "Writing singular SQL test queries", "dbt-expectations package for statistical thresholds"]},
                    {"title": "Double-Entry Balance Verification & Reconciliation Rules", "youtube_search_query": "financial data reconciliation double entry debit credit balance zero test dbt", "subtopics": ["Testing debit minus credit balance equality (SUM(debit) == SUM(credit))", "Detecting missing or orphaned transaction legs", "Automated reconciliation exception alerts"]},
                    {"title": "Elementary & dbt Observability Dashboards", "youtube_search_query": "dbt test failures observability Elementary data quality alerts", "subtopics": ["Logging test execution metrics to Snowflake", "Tracking schema drift and volume anomalies", "Configuring Slack / PagerDuty alerts for test failures"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A custom dbt data test that asserts zero-sum balance reconciliation across all active ledger debit and credit transactions for any snapshot window.",
                    "what_counts_as_evidence": "Terminal output from dbt test passing reconciliation assertion tests against test datasets.",
                    "eval_criteria": ["Custom singular test query evaluates sum of debits minus credits == 0", "Utilizes dbt_utils or dbt_expectations packages for data integrity constraints", "Raises build errors on data anomaly detection"]
                },
                "resources": [
                    {"title": "dbt Documentation - Data Tests Guide", "url": "https://docs.getdbt.com/docs/build/data-tests"},
                    {"title": "dbt Expectations Package Documentation", "url": "https://github.com/calogica/dbt-expectations"}
                ]
            },
            {
                "title": "CI/CD, Zero-Copy Cloning & Production Orchestration",
                "topics": [
                    {"title": "CI/CD Pipelines with dbt Slim CI & Snowflake Zero-Copy Cloning", "youtube_search_query": "dbt Slim CI zero copy clone Snowflake GitHub Actions pull request testing", "subtopics": ["Instant environment sandbox creation via Zero-Copy Clone", "Running dbt Slim CI (--select state:modified+)", "Comparing production state manifest.json vs PR manifest"]},
                    {"title": "Orchestrating Pipelines with Airflow / Dagster / Prefect", "youtube_search_query": "orchestrate dbt pipeline Airflow Dagster Snowflake schedule monitoring", "subtopics": ["Dagster asset-based orchestration for dbt models", "Triggering downstream reverse ETL tools", "Managing warehouse retry schedules"]},
                    {"title": "Data Lineage & Governance with dbt Docs", "youtube_search_query": "dbt docs generate lineage graph catalog documentation financial audit", "subtopics": ["Generating visual DAG lineage graphs (dbt docs generate)", "Tagging column-level PII data tags", "Exporting lineage artifacts for regulatory compliance audit"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A GitHub Actions workflow script implementing Slim CI: creating a temporary cloned Snowflake environment via Zero-Copy Clone, running dbt run --select state:modified+, and tearing down cloned database.",
                    "what_counts_as_evidence": "GitHub Actions workflow YAML file and run logs showing selective model execution against temporary Snowflake clone schema.",
                    "eval_criteria": ["Executes CREATE TRANSIENT DATABASE ... CLONE command in pre-run step", "Runs dbt commands using state:modified+ flags against manifest artifact", "Drops temporary clone schema in post-run cleanup"]
                },
                "resources": [
                    {"title": "dbt Documentation - Continuous Integration (CI)", "url": "https://docs.getdbt.com/docs/deploy/ci-jobs"},
                    {"title": "Snowflake Documentation - Cloning Tables and Databases", "url": "https://docs.snowflake.com/en/user-guide/tables-storage-considerations#cloning-tables-and-databases"}
                ]
            }
        ]
    },

    # 9. Genetic Algorithms & Evolutionary Computation
    {
        "title": "Genetic Algorithms & Evolutionary Computation",
        "description": "Optimization without gradients — useful for scheduling and design and game AI.",
        "subject": "CS Students & Optimization Engineers",
        "modules_data": [
            {
                "title": "Foundations of Genetic Algorithms & Representation",
                "topics": [
                    {"title": "Genotypes, Phenotypes, and Chromosome Encodings", "youtube_search_query": "Genetic Algorithms genotype phenotype encoding binary real-valued chromosome", "subtopics": ["Binary string encoding vs Real-valued vector encoding", "Permutations encoding for combinatorial problems", "Mapping genotype space to phenotype evaluation space"]},
                    {"title": "Objective & Fitness Function Design", "youtube_search_query": "fitness function design optimization landscape local optima penalty functions", "subtopics": ["Designing scalar fitness functions", "Incorporating penalty functions for constraint violations", "Handling multimodal fitness landscapes and local optima"]},
                    {"title": "Evolutionary Loop Architecture & Lifecycle", "youtube_search_query": "genetic algorithm main loop selection crossover mutation replacement generation", "subtopics": ["Population initialization methods (random vs heuristic seeding)", "Generational vs steady-state replacement strategies", "Stopping criteria: max generations vs fitness plateau"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A clean Python or Rust framework for Genetic Algorithms implementing generic chromosome structures and fitness evaluation interfaces.",
                    "what_counts_as_evidence": "Execution trace showing fitness progression across 100 generations solving a benchmark mathematical optimization function (e.g. Rastrigin or Ackley function).",
                    "eval_criteria": ["Separates genotype representation from phenotype evaluation", "Defines configurable fitness function calculation", "Tracks best, worst, and mean generation fitness scores"]
                },
                "resources": [
                    {"title": "DEAP Python Evolutionary Algorithms Framework Docs", "url": "https://deap.readthedocs.io/en/master/"},
                    {"title": "PyGAD Genetic Algorithm Library Documentation", "url": "https://pygad.readthedocs.io/en/latest/"}
                ]
            },
            {
                "title": "Selection Mechanisms, Crossover & Mutation Operators",
                "topics": [
                    {"title": "Selection Strategies: Tournament, Roulette Wheel, and Rank Selection", "youtube_search_query": "genetic algorithm selection tournament roulette wheel rank selection pressure", "subtopics": ["Roulette Wheel (Fitness Proportionate) selection mechanics", "Tournament selection pressure adjustment via k-size parameter", "Rank-based selection mitigating premature convergence"]},
                    {"title": "Crossover Operators: Single-Point, Two-Point, Uniform, and PMX", "youtube_search_query": "crossover operators single point uniform PMX partially matched crossover TSP", "subtopics": ["Single-point and two-point crossover mechanics", "Uniform crossover probability distribution", "Partially-Matched Crossover (PMX) for Traveling Salesperson Problem"]},
                    {"title": "Mutation Operators & Adaptive Mutation Rates", "youtube_search_query": "mutation rate adaptive mutation Gaussian bit-flip exploration exploitation trade off", "subtopics": ["Bit-flip mutation for binary chromosomes", "Gaussian noise mutation for continuous continuous parameters", "Dynamic/Adaptive mutation rate schedule"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An empirical comparison tool testing 3 selection mechanisms (Tournament vs Roulette Wheel vs Rank) and measuring convergence speeds to global optimum.",
                    "what_counts_as_evidence": "Comparative plots/console output displaying generation counts required to reach 99% global optimum accuracy across selection methods.",
                    "eval_criteria": ["Implements Tournament and Roulette Wheel selection mathematically", "Protects against premature convergence with adaptive mutation rate rules", "Demonstrates PMX crossover preserving permutation validity for TSP problems"]
                },
                "resources": [
                    {"title": "DEAP Documentation - Selection Operators", "url": "https://deap.readthedocs.io/en/master/api/tools.html#selection"},
                    {"title": "GeeksforGeeks - Genetic Algorithms Selection Operators", "url": "https://www.geeksforgeeks.org/selection-methods-in-genetic-algorithms/"}
                ]
            },
            {
                "title": "Multi-Objective Optimization & NSGA-II",
                "topics": [
                    {"title": "Pareto Dominance, Pareto Frontiers & Trade-off Surfaces", "youtube_search_query": "multi objective optimization Pareto dominance Pareto frontier trade off surface", "subtopics": ["Concept of non-dominated solutions", "Mapping trade-off frontiers between competing objectives", "Evaluating hypervolume indicator metrics"]},
                    {"title": "NSGA-II Algorithm: Fast Non-Dominated Sorting & Crowding Distance", "youtube_search_query": "NSGA II algorithm non dominated sorting crowding distance diversity evolutionary", "subtopics": ["Fast non-dominated sorting rank classification (O(M N^2))", "Crowding distance estimation for diversity preservation", "Elitist selection keeping top Pareto fronts"]},
                    {"title": "Constraint Handling in Multi-Objective Evolutionary Algorithms", "youtube_search_query": "NSGA-II constraint handling feasibility penalty function multi-objective", "subtopics": ["Constrained Pareto dominance criteria", "Penalty functions vs death penalty constraints", "Feasible vs infeasible solution prioritization"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An NSGA-II implementation in Python solving a multi-objective problem (e.g. minimizing weight while maximizing structural strength).",
                    "what_counts_as_evidence": "2D scatter plot or array printout of the non-dominated Pareto front showing trade-off solutions.",
                    "eval_criteria": ["Computes Pareto dominance rank for population individuals", "Calculates crowding distance to preserve solution diversity across the frontier", "Outputs well-distributed Pareto optimal frontier set"]
                },
                "resources": [
                    {"title": "pymoo Multi-Objective Optimization Framework Docs", "url": "https://pymoo.org/algorithms/moo/nsga2.html"},
                    {"title": "Deb's Original NSGA-II Research Paper Overview", "url": "https://ieeexplore.ieee.org/document/996017"}
                ]
            },
            {
                "title": "Advanced Evolutionary Paradigms (GP, NEAT & Co-evolution)",
                "topics": [
                    {"title": "Genetic Programming (GP) & Expression Tree Mutation", "youtube_search_query": "Genetic Programming expression tree symbolic regression syntax tree mutation", "subtopics": ["Syntax tree representation of computer programs", "Subtree crossover and mutation operators", "Bloat control and tree depth limits"]},
                    {"title": "Neuroevolution of Augmenting Topologies (NEAT) for Neural Nets", "youtube_search_query": "NEAT neuroevolution of augmenting topologies neural network weights topology mutation", "subtopics": ["Evolving neural network weights AND topology simultaneously", "Historical markings for crossover alignment", "Speciation via compatibility distance to protect innovation"]},
                    {"title": "Co-Evolutionary Arms Races & Competitive Optimization", "youtube_search_query": "co-evolutionary algorithms competitive predator prey arms race fitness landscape", "subtopics": ["Competitive co-evolution (Predator vs Prey)", "Cooperative co-evolution function decomposition", "Red Queen effect and intransitive fitness cycles"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Symbolic Regression Genetic Programming solver that evolves mathematical expression trees (ASTs) to fit a non-linear dataset without pre-defined model architecture.",
                    "what_counts_as_evidence": "Console printout showing evolved mathematical formula (e.g. sin(x) + 3.14 * x^2) matching target dataset within low MSE tolerance.",
                    "eval_criteria": ["Represents candidate solutions as syntax trees of math functions and constants", "Implements subtree crossover and point mutation without generating invalid syntax", "Evaluates tree node expressions recursively"]
                },
                "resources": [
                    {"title": "gplearn Symbolic Regression Python Library", "url": "https://gplearn.readthedocs.io/en/stable/"},
                    {"title": "NEAT-Python Official Documentation", "url": "https://neat-python.readthedocs.io/en/latest/"}
                ]
            }
        ]
    },

    # 10. Adversarial Machine Learning: Attack & Defense
    {
        "title": "Adversarial Machine Learning: Attack & Defense",
        "description": "Crafting inputs that fool classifiers and building models robust enough to resist them.",
        "subject": "ML Engineers & Security Researchers",
        "modules_data": [
            {
                "title": "Adversarial Threat Models & White-Box Attacks",
                "topics": [
                    {"title": "Threat Models: White-Box, Black-Box, and Gray-Box Security Assumptions", "youtube_search_query": "adversarial machine learning threat models white box black box attacks", "subtopics": ["Attacker capabilities: gradient access, query budgets, confidence scores", "Norm-constrained perturbations (L0, L2, L-infinity)", "Targeted vs Untargeted misclassification goals"]},
                    {"title": "Fast Gradient Sign Method (FGSM) Math & Implementation", "youtube_search_query": "Fast Gradient Sign Method FGSM adversarial attack PyTorch math tutorial", "subtopics": ["Loss function gradient sign derivation: x + epsilon * sign(grad)", "Single-step white-box attack execution", "Evaluating attack success vs perturbation magnitude epsilon"]},
                    {"title": "Projected Gradient Descent (PGD) & Iterative Attacks", "youtube_search_query": "Projected Gradient Descent PGD attack iterative adversarial perturbation PyTorch", "subtopics": ["Iterative gradient step updates", "Projecting adversarial noise back into L-infinity epsilon ball", "Random start initialization to escape local gradient plateaus"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A PyTorch / TensorFlow script that crafts FGSM and PGD adversarial perturbations targeting a pretrained image classification model (e.g. ResNet/CIFAR-10) with constrained L-infinity norm epsilon.",
                    "what_counts_as_evidence": "Output log displaying accuracy drop (e.g., from 95% to <10%) alongside visualization of imperceptible perturbation noise added to input images.",
                    "eval_criteria": ["Computes loss gradient with respect to input image tensors (loss.backward())", "Applies L-infinity norm clipping (torch.clamp(x + eps * sign(grad), min, max))", "Demonstrates high attack success rate while maintaining low perceptual distance"]
                },
                "resources": [
                    {"title": "Torchattacks PyTorch Adversarial Library Docs", "url": "https://torchattacks.readthedocs.io/en/latest/"},
                    {"title": "CleverHans Adversarial Security Repository", "url": "https://github.com/cleverhans-lab/cleverhans"}
                ]
            },
            {
                "title": "Black-Box Attacks & Model Transferability",
                "topics": [
                    {"title": "Substitute Model Training & Query-Based Black-Box Attacks", "youtube_search_query": "black box adversarial attacks substitute model training query based decision attack", "subtopics": ["Training local substitute neural network on target model outputs", "Generating adversarial samples against substitute model", "Query budget optimization for API targets"]},
                    {"title": "Zeroth-Order Optimization (ZOO) & Boundary Attacks", "youtube_search_query": "Zeroth Order Optimization ZOO attack boundary attack decision-based gradient estimation", "subtopics": ["Finite difference gradient estimation from output probability vectors", "Decision-based boundary random walk attacks", "Reducing query complexity via dimensionality reduction"]},
                    {"title": "Transferability of Adversarial Examples across Model Architectures", "youtube_search_query": "adversarial attack transferability ensemble substitute training ML security", "subtopics": ["Why adversarial perturbations transfer across different architectures", "Ensemble substitute model attacks to boost transferability", "Defending against transferable adversarial examples"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A query-based decision black-box attack (or substitute model transfer attack) that misclassifies target API predictions without direct access to model gradients.",
                    "what_counts_as_evidence": "Execution trace detailing query count, confidence scores, and successful adversarial label flip under limited query budget.",
                    "eval_criteria": ["Estimates gradient directions empirically using finite differences or query outputs", "Minimizes query budget required to achieve targeted misclassification", "Demonstrates attack transferability against unseen secondary model architectures"]
                },
                "resources": [
                    {"title": "Adversarial Robustness Toolbox (ART) Docs", "url": "https://adversarial-robustness-toolbox.readthedocs.io/en/latest/"},
                    {"title": "RobustBench Benchmark Repository", "url": "https://robustbench.github.io/"}
                ]
            },
            {
                "title": "Defensive Strategies & Adversarial Training",
                "topics": [
                    {"title": "Adversarial Training Loops (Madry Defense Framework)", "youtube_search_query": "adversarial training Madry PGD robust machine learning PyTorch", "subtopics": ["Min-max game formulation for robust optimization", "Injecting PGD adversarial examples during training step", "Clean accuracy vs robust accuracy trade-off"]},
                    {"title": "Input Sanitization, Denoising, and Feature Squeezing", "youtube_search_query": "adversarial defense input sanitization feature squeezing spatial smoothing autoencoder", "subtopics": ["Bit-depth reduction and spatial smoothing filters", "Autoencoder denoising prepended to model pipelines", "Detecting out-of-distribution adversarial inputs"]},
                    {"title": "Provable & Certified Robustness (Randomized Smoothing)", "youtube_search_query": "certified robustness randomized smoothing Gaussian noise adversarial defense", "subtopics": ["Certifying L2 robust radius guarantees", "Adding isotropic Gaussian noise to inputs", "Neyman-Pearson lemma proof intuition"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A PyTorch model training pipeline implementing PGD-based adversarial training (min-max optimization framework) to produce a robust classifier.",
                    "what_counts_as_evidence": "Model evaluation script demonstrating robust accuracy maintenance (>60%) under PGD attack compared to 0% for standard baseline model.",
                    "eval_criteria": ["Implements min-max optimization loop: generating PGD perturbations during training step", "Evaluates trade-off between clean test accuracy and robust adversarial accuracy", "Saves model weights passing robust evaluation benchmarks"]
                },
                "resources": [
                    {"title": "RobustBench Standardization Benchmark", "url": "https://github.com/RobustBench/robustbench"},
                    {"title": "PyTorch Official Documentation", "url": "https://pytorch.org/docs/stable/index.html"}
                ]
            },
            {
                "title": "Data Poisoning, Backdoor Attacks & LLM Jailbreaking",
                "topics": [
                    {"title": "Data Poisoning & Trojan / Backdoor Trigger Insertion", "youtube_search_query": "data poisoning backdoor attack neural network trigger pattern clean label", "subtopics": ["Injecting poisoned samples into training sets", "Watermark trigger patterns (e.g. checkerboard pixel patch)", "Clean-label backdoor attacks"]},
                    {"title": "Prompt Injection, Jailbreaking & Universal Adversarial Triggers", "youtube_search_query": "LLM jailbreaking prompt injection universal adversarial suffix GCG attack", "subtopics": ["Direct vs indirect prompt injection vulnerabilities", "Greedy Coordinate Gradient (GCG) search for universal LLM adversarial suffixes", "Bypassing safety guardrails in foundation models"]},
                    {"title": "Defensive Guardrails, Output Filtering & Model Alignment", "youtube_search_query": "LLM guardrails input output filtering Llama Guard adversarial robustness", "subtopics": ["Llama Guard safety classifier integration", "Input sanitization and prompt structure validation", "RLHF and DPO safety alignment tuning"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A demonstration environment implementing a backdoor trigger injection attack on a text/image dataset, alongside a defensive trigger detection / unlearning module.",
                    "what_counts_as_evidence": "Test report verifying model classifies clean inputs accurately, misclassifies inputs containing trigger pattern with >98% success, and demonstrates trigger mitigation post-defense.",
                    "eval_criteria": ["Inserts hidden trigger patterns into training subset", "Measures attack success rate (ASR) vs clean accuracy drop", "Applies defense mechanism (e.g. Spectral Signatures or Neural Cleanse) to detect poisoned samples"]
                },
                "resources": [
                    {"title": "Llama Guard Safety Documentation", "url": "https://huggingface.co/meta-llama/Llama-Guard-3-8B"},
                    {"title": "OWASP Top 10 for LLM Applications", "url": "https://owasp.org/www-project-top-10-for-large-language-model-applications/"}
                ]
            }
        ]
    },

    # 11. Functional Programming Patterns in TypeScript
    {
        "title": "Functional Programming Patterns in TypeScript",
        "description": "Monads and algebraic data types and pattern matching — practical FP without leaving the JS ecosystem.",
        "subject": "TypeScript Developers wanting cleaner abstractions",
        "modules_data": [
            {
                "title": "Algebraic Data Types (ADTs) & Pattern Matching",
                "topics": [
                    {"title": "Sum Types (Discriminated Unions) & Product Types in TypeScript", "youtube_search_query": "TypeScript sum types discriminated unions product types pattern matching", "subtopics": ["Defining discriminated unions with literal type tags", "Product types (interfaces and tuples)", "Modeling domain states as finite sum types"]},
                    {"title": "Exhaustiveness Checking with never Type", "youtube_search_query": "TypeScript exhaustiveness checking never type switch statement pattern match", "subtopics": ["Enforcing compile-time exhaustive switch checking", "The assertNever helper function", "Catching unhandled domain state additions at compile time"]},
                    {"title": "Modeling Domain Logic without Exceptions", "youtube_search_query": "make invalid states unrepresentable TypeScript domain modeling functional", "subtopics": ["Making invalid states unrepresentable in TypeScript", "Replacing nullable fields with sum types", "Domain-driven design with functional types"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A domain model (e.g., e-commerce order payment state machine) written in TypeScript using strict Discriminated Unions where invalid state transitions are unrepresentable at compile time.",
                    "what_counts_as_evidence": "TypeScript source code passing tsc --noEmit and demonstrating compile-time type errors whenever unhandled state cases exist.",
                    "eval_criteria": ["Uses discriminant tag field across all union variants", "Implements exhaustive pattern matching function using type never assertion", "Prevents invalid runtime state configurations via type system constraints"]
                },
                "resources": [
                    {"title": "TypeScript Handbook - Handbook Discriminated Unions", "url": "https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions"},
                    {"title": "fp-ts Official Documentation", "url": "https://gcanti.github.io/fp-ts/"}
                ]
            },
            {
                "title": "The Option & Result Monads (Error Handling without try/catch)",
                "topics": [
                    {"title": "Modeling Missing Values with the Option (Maybe) Type", "youtube_search_query": "TypeScript Option Maybe type null undefined safety fp-ts", "subtopics": ["Option sum type: Some(value) | None", "Eliminating null pointer and undefined runtime crashes", "Option.fromNullable transformation helper"]},
                    {"title": "Modeling Failure with the Result (Either) Type", "youtube_search_query": "TypeScript Result Either monad error handling fp-ts neverthrow", "subtopics": ["Result sum type: Ok(value) | Err(error)", "Typed error domain models vs untyped thrown exceptions", "Converting promise rejections into Result types"]},
                    {"title": "Functor & Monad Operations: map, flatMap (chain), and fold", "youtube_search_query": "Functor Monad map flatMap chain fold Railway Oriented Programming TypeScript", "subtopics": ["Transforming contained values via .map()", "Chaining monadic computations via .flatMap() / .chain()", "Extracting values via .fold() / .match()"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A lightweight implementation of Option<T> and Result<T, E> monads (or using neverthrow / fp-ts) refactoring a nested try-catch API service into Railway Oriented Programming.",
                    "what_counts_as_evidence": "TypeScript code showing pipeline transformation via .map(), .andThen(), and .match() without a single try/catch or throw keyword.",
                    "eval_criteria": ["Encapsulates success and error branches in type-safe Result container", "Chains asynchronous API pipeline calls using flatMap/chain", "Extracts final domain output via exhaustive match/fold handler"]
                },
                "resources": [
                    {"title": "neverthrow GitHub Repository", "url": "https://github.com/superstruct/neverthrow"},
                    {"title": "fp-ts Either Documentation", "url": "https://gcanti.github.io/fp-ts/modules/Either.ts.html"}
                ]
            },
            {
                "title": "Function Composition, Currying & Pipe Operators",
                "topics": [
                    {"title": "Pure Functions, Referential Transparency & Immutability", "youtube_search_query": "pure functions referential transparency immutability TypeScript functional programming", "subtopics": ["Side-effect free pure functions", "Referential transparency enabling memoization", "Enforcing immutability with Readonly<T> and Object.freeze"]},
                    {"title": "Point-Free Style & Currying Mechanics", "youtube_search_query": "currying point free style partial application function composition TypeScript", "subtopics": ["Transforming multi-argument functions into curried single-argument functions", "Partial application pattern", "Point-free function composition readability"]},
                    {"title": "Implementing pipe() and flow() Utilities", "youtube_search_query": "pipe flow functions TypeScript generic type infer composition", "subtopics": ["Left-to-right value piping with pipe(val, fn1, fn2)", "Function composition with flow(fn1, fn2)", "Preserving strict TypeScript generic type inference across pipe steps"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A custom pipe and flow generic function helper suite with full TypeScript type inference supporting up to 10 piped function transformations.",
                    "what_counts_as_evidence": "TypeScript unit test suite verifying type inference and runtime correctness of data transformation pipelines.",
                    "eval_criteria": ["Provides correct generic tuple overloading signatures for pipe() function", "Preserves exact return types across chained transformation steps", "Zero usage of any type casting"]
                },
                "resources": [
                    {"title": "TypeScript Handbook - Utility Types", "url": "https://www.typescriptlang.org/docs/handbook/utility-types.html"},
                    {"title": "fp-ts Pipe and Flow Documentation", "url": "https://gcanti.github.io/fp-ts/modules/function.ts.html"}
                ]
            },
            {
                "title": "Advanced FP: TaskEither, Lenses & Effect TS",
                "topics": [
                    {"title": "Managing Async Side Effects with TaskEither", "youtube_search_query": "TaskEither async asynchronous side effects fp-ts TypeScript", "subtopics": ["TaskEither lazy asynchronous computation monad", "Executing concurrent TaskEither operations (TaskEither.sequence)", "Retrying failed TaskEither computations"]},
                    {"title": "Immutable State Updates using Optics & Lenses", "youtube_search_query": "optics lenses immutable nested state update TypeScript monocle-ts", "subtopics": ["Lens abstraction: getter and setter composition", "Prism optics for sum type inspection", "Updating deeply nested immutable state trees effortlessly"]},
                    {"title": "Modern Functional TypeScript with Effect TS", "youtube_search_query": "Effect TS introduction modern functional programming TypeScript concurrency fiber", "subtopics": ["Effect<Requirements, Error, Value> type parameter structure", "Fiber-based lightweight concurrency", "Dependency injection via Context and Layer"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An asynchronous application service built with Effect TS (or TaskEither) performing concurrent HTTP data fetches, retry policies, and immutable deep state updates via Lenses.",
                    "what_counts_as_evidence": "Executable TypeScript application demonstrating structured concurrency, exponential backoff retries, and typed error handling.",
                    "eval_criteria": ["Uses TaskEither or Effect generator/pipe workflows for async side effects", "Applies retry schedules with exponential backoff on transient HTTP failures", "Updates deeply nested immutable domain state using optics/lenses without mutation"]
                },
                "resources": [
                    {"title": "Effect TS Official Website & Documentation", "url": "https://effect.website/"},
                    {"title": "monocle-ts GitHub Repository", "url": "https://github.com/gcanti/monocle-ts"}
                ]
            }
        ]
    }
]

async def seed():
    supabase = get_supabase_client()
    print("Starting batch 5 (seed_batch_7) seeding for 11 courses...")
    inserted_records = []
    
    for course_data in courses_info:
        print(f"\nProcessing course: {course_data['title']}")
        for m in course_data["modules_data"]:
            valid_resources = []
            for r in m["resources"]:
                if await verify_url(r["url"]):
                    valid_resources.append(r)
                else:
                    print(f"  Filtered out broken URL: {r['url']}")
            m["resources"] = valid_resources

        payload = create_course(
            course_data["title"],
            course_data["description"],
            course_data["subject"],
            course_data["modules_data"]
        )
        
        try:
            slug = await _generate_unique_slug(payload["title"], "eulerfold@gmail.com", supabase)
        except Exception as e:
            print(f"  Slug generation fallback: {e}")
            slug = re.sub(r'[^a-z0-9]+', '-', payload["title"].lower()).strip('-') + f"-{uuid.uuid4().hex[:6]}"
        
        try:
            plan_hash = _generate_plan_hash(payload["plan"])
        except Exception as e:
            print(f"  Hash generation fallback: {e}")
            plan_hash = "mock_hash_" + str(uuid.uuid4())
            
        record = {
            "email": "eulerfold@gmail.com",
            "title": payload["title"],
            "description": payload["description"],
            "slug": slug,
            "snapshot_hash": plan_hash,
            "is_public": True,
            "show_author": True,
            "roadmap_plan": payload["plan"],
            "subject": payload["subject"],
            "status": "active",
            "version": 1
        }
        
        response = supabase.table("roadmaps").insert(record).execute()
        if response.data and len(response.data) > 0:
            inserted_row = response.data[0]
            roadmap_id = inserted_row["id"]
            inserted_records.append({
                "id": roadmap_id,
                "title": payload["title"],
                "slug": slug
            })
            print(f"✓ INSERTED: '{payload['title']}' -> ID: {roadmap_id}")
        else:
            print(f"✗ FAILED INSERTION: '{payload['title']}' -> Response: {response}")

    print("\n============================================================")
    print(f"Batch 5 Seeding Summary: {len(inserted_records)} / {len(courses_info)} courses inserted.")
    for rec in inserted_records:
        print(f"  - ID: {rec['id']} | Title: {rec['title']}")
    print("============================================================\n")
    return inserted_records

if __name__ == "__main__":
    asyncio.run(seed())
