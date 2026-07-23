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
    # 1. Tree-sitter: Building Parsers for Code Intelligence
    {
        "title": "Tree-sitter: Building Parsers for Code Intelligence",
        "description": "The parser generator behind every modern code editor's syntax highlighting and navigation.",
        "subject": "Developer Tooling Engineers",
        "modules_data": [
            {
                "title": "Concrete Syntax Trees & Grammars (grammar.js)",
                "topics": [
                    {"title": "Context-Free Grammars & LR Parsing Basics", "youtube_search_query": "Tree-sitter context free grammar LR parsing grammar js tutorial", "subtopics": ["Terminal and non-terminal symbols", "Grammar rule definition in JavaScript", "Tree-sitter CLI setup and compilation"]},
                    {"title": "Writing Rules & Tokens in Tree-sitter grammar.js", "youtube_search_query": "Tree-sitter grammar js rules tokens syntax tree building", "subtopics": ["Regex tokens and string literals", "Sequence, choice, and repetition rules", "Generating C parser code from grammar"]},
                    {"title": "Handling Precedence & Associativity", "youtube_search_query": "Tree-sitter operator precedence associativity resolve conflict", "subtopics": ["Left, right, and non-associative operators", "Resolving shift/reduce conflicts", "Prec level assignment in grammar rules"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A minimal Tree-sitter grammar for a custom math expression language, including operators (+, -, *, /) and parenthesized sub-expressions.",
                    "what_counts_as_evidence": "Tree-sitter parse output log showing correct concrete syntax tree (CST) nodes for input strings like '3 + 4 * (2 - 1)'.",
                    "eval_criteria": ["grammar.js defines correct precedence rules for arithmetic operators", "CLI generates C source files without grammar conflicts", "Parser outputs structured syntax tree matching expected node hierarchy"]
                },
                "resources": [
                    {"title": "Tree-sitter Official Documentation", "url": "https://tree-sitter.github.io/tree-sitter/"},
                    {"title": "Tree-sitter GitHub Repository", "url": "https://github.com/tree-sitter/tree-sitter"}
                ]
            },
            {
                "title": "Incremental Parsing & Editor Integration",
                "topics": [
                    {"title": "State Recovery & Error Tolerance in Tree-sitter", "youtube_search_query": "Tree-sitter error recovery tolerant parsing syntax node", "subtopics": ["ERROR node generation", "Panic-mode recovery in tree-sitter", "Maintaining valid tree state during typing"]},
                    {"title": "Incremental Parsing Algorithms & Tree Updates", "youtube_search_query": "Tree-sitter incremental parsing edit range tree update", "subtopics": ["Byte range edits", "Re-using unchanged tree subtrees", "Performance benchmarks for live updates"]},
                    {"title": "Binding Tree-sitter Parsers to C / WebAssembly / Neovim", "youtube_search_query": "Tree-sitter Neovim C bindings WebAssembly WASM integration", "subtopics": ["C API header usage", "WASM compilation via emscripten", "Neovim tree-sitter plugin configuration"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A C or Node.js program that parses a code snippet, edits 5 characters in the middle, and performs an incremental parse using Tree-sitter's edit API.",
                    "what_counts_as_evidence": "Console output displaying byte edit offsets and confirming that unchanged syntax nodes were reused during re-parse.",
                    "eval_criteria": ["Applies ts_tree_edit / tree.edit correctly with byte ranges", "Invokes incremental parse passing old tree", "Demonstrates node identity retention for unedited code sections"]
                },
                "resources": [
                    {"title": "Tree-sitter C API Guide", "url": "https://tree-sitter.github.io/tree-sitter/using-parsers"},
                    {"title": "Tree-sitter GitHub Repository", "url": "https://github.com/tree-sitter/tree-sitter"}
                ]
            },
            {
                "title": "Query Language & AST Pattern Matching",
                "topics": [
                    {"title": "S-expression Query Syntax in Tree-sitter", "youtube_search_query": "Tree-sitter query language S-expression pattern matching", "subtopics": ["Pattern matching syntax", "Wildcards and field predicates", "Capturing nodes with @capture_name"]},
                    {"title": "Capturing Nodes for Syntax Highlighting & Indentation", "youtube_search_query": "Tree-sitter highlights.scm syntax highlighting query editor", "subtopics": ["Creating highlights.scm query files", "Standard highlight groups (@function, @keyword)", "Indents.scm logic for automatic indentation"]},
                    {"title": "Defining Structural Predicates & Captures", "youtube_search_query": "Tree-sitter predicates eq match directives syntax tree", "subtopics": ["#eq? and #match? directives", "#any-of? predicate usage", "Filtering captures by string comparison"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Tree-sitter query (`highlights.scm`) for your custom grammar that captures functions, variables, keywords, and strings for syntax highlighting.",
                    "what_counts_as_evidence": "Query test runner output showing matching node types and associated capture tags for sample code files.",
                    "eval_criteria": ["Query file parses without syntax errors", "Correctly identifies keywords and identifiers", "Uses predicates to narrow capture target matching"]
                },
                "resources": [
                    {"title": "Tree-sitter Syntax Highlighting Query Guide", "url": "https://tree-sitter.github.io/tree-sitter/syntax-highlighting"},
                    {"title": "Tree-sitter Official Documentation", "url": "https://tree-sitter.github.io/tree-sitter/"}
                ]
            },
            {
                "title": "Code Intelligence & Symbol Resolution",
                "topics": [
                    {"title": "Extracting Symbol Tables & Definitions with Tree-sitter", "youtube_search_query": "Tree-sitter symbol table scope definition resolution code intelligence", "subtopics": ["Traversing AST programmatically", "Scope resolution for function/variable definitions", "Collecting export declarations"]},
                    {"title": "Call Graph Construction from Syntax Trees", "youtube_search_query": "Tree-sitter call graph generator AST traversal static analysis", "subtopics": ["Identifying call expressions", "Mapping caller to callee node references", "Exporting call graph data to Graphviz DOT format"]},
                    {"title": "Custom Linter Implementation using Tree-sitter Queries", "youtube_search_query": "Building custom linter tree-sitter AST queries static analysis tool", "subtopics": ["Detecting anti-patterns via AST queries", "Reporting line/column diagnostic locations", "Benchmarking linter execution speed"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python or Node.js linter tool that uses Tree-sitter AST queries to flag unused variable declarations and output line numbers.",
                    "what_counts_as_evidence": "Linter execution log detecting unused variables in a sample file with precise line and column annotations.",
                    "eval_criteria": ["Traverses CST to build symbol scope table", "Identifies declared variables lacking reference usages", "Reports diagnostics formatted with source coordinates"]
                },
                "resources": [
                    {"title": "Tree-sitter Code Navigation Guide", "url": "https://tree-sitter.github.io/tree-sitter/code-navigation"},
                    {"title": "Tree-sitter GitHub Repository", "url": "https://github.com/tree-sitter/tree-sitter"}
                ]
            }
        ]
    },
    # 2. OpenTelemetry: Distributed Tracing & Metrics
    {
        "title": "OpenTelemetry: Distributed Tracing & Metrics",
        "description": "The vendor-neutral observability standard replacing Datadog-specific and New Relic-specific instrumentation.",
        "subject": "Backend Engineers & SREs",
        "modules_data": [
            {
                "title": "OpenTelemetry Architecture & Core Concepts",
                "topics": [
                    {"title": "Traces, Metrics, Logs & Context Propagation", "youtube_search_query": "OpenTelemetry architecture traces metrics logs context propagation tutorial", "subtopics": ["Traces, Spans, Metrics, and Logs telemetry signals", "Distributed context propagation principles", "OTLP (OpenTelemetry Protocol) specification"]},
                    {"title": "The OpenTelemetry API vs SDK Distinction", "youtube_search_query": "OpenTelemetry API vs SDK difference instrumentation guide", "subtopics": ["No-op API implementations for libraries", "Configuring SDK exporters and samplers", "Separation of instrumentation from configuration"]},
                    {"title": "W3C TraceContext & Baggage Headers", "youtube_search_query": "W3C traceparent trace state baggage headers OpenTelemetry HTTP", "subtopics": ["traceparent header format (version, trace_id, parent_id)", "tracestate vendor extension header", "Propagating custom baggage metadata across microservices"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python or Go HTTP client-server setup that propagates W3C traceparent headers across HTTP requests and logs context headers.",
                    "what_counts_as_evidence": "Server log showing received `traceparent` header with matching trace ID from client request.",
                    "eval_criteria": ["Client injects traceparent header into HTTP request", "Server extracts context using OTel propagator", "Trace ID remains consistent across service boundary"]
                },
                "resources": [
                    {"title": "OpenTelemetry Official Documentation", "url": "https://opentelemetry.io/docs/"},
                    {"title": "OpenTelemetry Specification GitHub", "url": "https://github.com/open-telemetry/opentelemetry-specification"}
                ]
            },
            {
                "title": "Automatic & Manual Instrumentation",
                "topics": [
                    {"title": "Auto-Instrumentation Libraries in Python & Go", "youtube_search_query": "OpenTelemetry auto instrumentation Python FastAPI Flask Go tutorial", "subtopics": ["opentelemetry-instrument CLI usage", "Automatic database and HTTP framework tracing", "Zero-code instrumentation setup"]},
                    {"title": "Manual Span Creation & Attributes", "youtube_search_query": "OpenTelemetry manual span creation custom attributes events status code", "subtopics": ["TracerProvider and Tracer acquisition", "Adding semantic attributes and events to spans", "Recording exceptions and setting span status (Ok/Error)"]},
                    {"title": "Async Context Tracking & Span Lifecycle Management", "youtube_search_query": "OpenTelemetry async context contextvars asyncio span lifecycle", "subtopics": ["Managing context across async task boundaries", "Ending spans in try/finally blocks", "Parent-child span relationship linkage"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A FastAPI/Flask app with manual OTel instrumentation creating custom parent and child spans around database operations and setting error status on failure.",
                    "what_counts_as_evidence": "Console JSON span exporter output verifying nested parent-child span structure and attached semantic attributes.",
                    "eval_criteria": ["Acquires tracer from TracerProvider", "Creates child spans within parent scope", "Records exceptions and sets Error status during mock failures"]
                },
                "resources": [
                    {"title": "OpenTelemetry Python Documentation", "url": "https://opentelemetry.io/docs/languages/python/"},
                    {"title": "OpenTelemetry Specification GitHub", "url": "https://github.com/open-telemetry/opentelemetry-specification"}
                ]
            },
            {
                "title": "OpenTelemetry Collector Pipeline",
                "topics": [
                    {"title": "Receivers, Processors, and Exporters Architecture", "youtube_search_query": "OpenTelemetry Collector configuration receivers processors exporters tutorial", "subtopics": ["OTLP receiver configuration (gRPC/HTTP)", "Memory limiter and batch processors", "OTLP exporter setup for backend storage"]},
                    {"title": "Batching, Sampling & Memory Limiter Processors", "youtube_search_query": "OpenTelemetry collector batch processor memory limiter sampling configuration", "subtopics": ["Configuring batch processor timeout and batch size", "Setting memory soft/hard limits for collector safety", "Probabilistic sampler processor rules"]},
                    {"title": "Routing & Exporting to Jaeger, Prometheus & OTLP", "youtube_search_query": "OpenTelemetry collector export Jaeger Prometheus OTLP docker compose", "subtopics": ["Prometheus exporter configuration", "Jaeger OTLP gRPC endpoint integration", "Multi-pipeline routing rules"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A docker-compose setup containing an application service, an OpenTelemetry Collector, Jaeger, and Prometheus, routing traces and metrics.",
                    "what_counts_as_evidence": "Screenshot or log evidence showing OTel Collector receiving traces via OTLP and successfully forwarding them to Jaeger UI.",
                    "eval_criteria": ["otel-collector-config.yaml defines receivers, processors, exporters", "Application exports telemetry to collector via gRPC", "Jaeger and Prometheus display collected telemetry data"]
                },
                "resources": [
                    {"title": "OpenTelemetry Collector Documentation", "url": "https://opentelemetry.io/docs/collector/"},
                    {"title": "OpenTelemetry Specification GitHub", "url": "https://github.com/open-telemetry/opentelemetry-specification"}
                ]
            },
            {
                "title": "Production Observability & Distributed Debugging",
                "topics": [
                    {"title": "Tail-Based Sampling vs Head-Based Sampling", "youtube_search_query": "OpenTelemetry tail based sampling collector vs head based sampling", "subtopics": ["Head sampling decision at trace creation", "Tail sampling decision based on full trace attributes/errors", "Configuring tail_sampling processor in OTel Collector"]},
                    {"title": "Correlating Logs, Traces & Metrics via SpanIDs", "youtube_search_query": "OpenTelemetry trace ID log correlation structured logging python go", "subtopics": ["Injecting trace_id and span_id into JSON log lines", "Log-to-trace navigation in observability platforms", "Exposing OTel metrics with trace exemplars"]},
                    {"title": "Instrumenting gRPC & Database Queries at Scale", "youtube_search_query": "OpenTelemetry gRPC interceptors SQL database instrumentation performance", "subtopics": ["gRPC client/server OTel interceptors", "Sanitizing SQL queries before attaching as attributes", "Managing telemetry overhead in high-throughput systems"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A python logging formatter configuration that dynamically injects active OTel `trace_id` and `span_id` into all application log outputs.",
                    "what_counts_as_evidence": "Application log output showing structured JSON lines with non-zero trace_id and span_id matching active spans.",
                    "eval_criteria": ["Custom log formatter extracts OTel span context", "Log output includes trace_id and span_id fields", "Formatter handles un-instrumented execution contexts gracefully"]
                },
                "resources": [
                    {"title": "OpenTelemetry Official Documentation", "url": "https://opentelemetry.io/docs/"},
                    {"title": "OpenTelemetry Specification GitHub", "url": "https://github.com/open-telemetry/opentelemetry-specification"}
                ]
            }
        ]
    },
    # 3. Systems Design: Designing for Scale & Failure
    {
        "title": "Systems Design: Designing for Scale & Failure",
        "description": "Teaches the actual tradeoffs (CAP theorem & consistency models & back-of-envelope math) instead of memorized answers.",
        "subject": "Software Engineers preparing for senior roles",
        "modules_data": [
            {
                "title": "Fundamental System Tradeoffs & Back-of-Envelope Math",
                "topics": [
                    {"title": "Latency, Throughput, and Capacity Estimation", "youtube_search_query": "Back of envelope math system design latency throughput capacity calculation", "subtopics": ["Numbers every programmer should know (L1 vs RAM vs SSD vs Network)", "QPS, TPS, and storage bandwidth estimation", "Sizing database memory and disk capacity for 10M DAU"]},
                    {"title": "CAP Theorem, PACELC & Consistency Models", "youtube_search_query": "CAP theorem PACELC theorem consistency models distributed systems", "subtopics": ["Consistency, Availability, Partition Tolerance trade-offs", "PACELC extension for non-partitioned state", "Strong consistency vs Eventual consistency vs Causal consistency"]},
                    {"title": "Availability Math & SLA/SLO Budgeting", "youtube_search_query": "System availability 99.999 SLA SLO error budget calculation", "subtopics": ["Calculating downtime for 99.9% vs 99.999% availability", "Error budget management and release gating", "MTTR (Mean Time to Recovery) vs MTTF (Mean Time to Failure)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A detailed technical design document (Markdown) estimating QPS, storage, and memory bandwidth for a global photo-sharing service with 50 million daily active users.",
                    "what_counts_as_evidence": "Step-by-step arithmetic calculations showing read/write QPS, network ingress/egress in Gbps, and total storage requirement over 5 years.",
                    "eval_criteria": ["Calculates peak QPS based on read/write ratio assumptions", "Estimates storage footprint accounting for metadata and asset sizes", "Applies SLA error budgets and capacity overhead safety margins"]
                },
                "resources": [
                    {"title": "CAP Theorem - Wikipedia", "url": "https://en.wikipedia.org/wiki/CAP_theorem"},
                    {"title": "Consistent Hashing - Wikipedia", "url": "https://en.wikipedia.org/wiki/Consistent_hashing"}
                ]
            },
            {
                "title": "Data Partitioning, Sharding & Replication",
                "topics": [
                    {"title": "Consistent Hashing & Hash Ring Topologies", "youtube_search_query": "Consistent hashing algorithm virtual nodes hash ring system design", "subtopics": ["Hash ring data structure and key distribution", "Virtual nodes to prevent hot spots and load imbalance", "Node join/leave migration protocols"]},
                    {"title": "Single-Leader, Multi-Leader & Leaderless Replication", "youtube_search_query": "Database replication single leader multi leader leaderless Dynamo quorum", "subtopics": ["Synchronous vs asynchronous leader replication", "Conflict resolution in multi-leader setups (LWW, CRDTs)", "Leaderless replication and Read/Write Quorums (R + W > N)"]},
                    {"title": "Sharding Strategies & Cross-Shard Transactions", "youtube_search_query": "Database sharding strategies range directory hash sharding cross shard query", "subtopics": ["Range-based vs Hash-based sharding keys", "Handling hot keys and resharding operations", "Two-Phase Commit (2PC) vs Saga pattern for cross-shard transactions"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python implementation of a Consistent Hashing ring with configurable virtual nodes and key lookup methods.",
                    "what_counts_as_evidence": "Python test script output demonstrating uniform key redistribution when adding and removing node instances from the ring.",
                    "eval_criteria": ["Uses cryptographic hash function (MD5/SHA256) to position nodes", "Supports virtual nodes per physical node", "Re-assigns minimal keys upon node addition or removal"]
                },
                "resources": [
                    {"title": "Consistent Hashing - Wikipedia", "url": "https://en.wikipedia.org/wiki/Consistent_hashing"},
                    {"title": "CAP Theorem - Wikipedia", "url": "https://en.wikipedia.org/wiki/CAP_theorem"}
                ]
            },
            {
                "title": "Cache Invalidation, Messaging & Stream Processing",
                "topics": [
                    {"title": "Cache Strategies: Write-Through, Write-Behind & Eviction", "youtube_search_query": "Caching strategies write through write back cache aside LRU LFU eviction", "subtopics": ["Cache-Aside, Write-Through, and Write-Behind patterns", "LRU, LFU, and ARC cache eviction algorithms", "Preventing Cache Stampede, Thundering Herd, and Cache Penetration"]},
                    {"title": "Message Queues vs Event Streams (RabbitMQ vs Kafka)", "youtube_search_query": "Message queue vs event streaming RabbitMQ vs Kafka system design", "subtopics": ["AMQP point-to-point queues vs distributed log offset models", "Consumer groups and partition rebalancing in Kafka", "Retention policies and log compaction"]},
                    {"title": "Idempotency & Exactly-Once Processing Semantics", "youtube_search_query": "Idempotent API design idempotent keys exactly once processing Kafka", "subtopics": ["Idempotency keys and deduplication storage", "Transactional outbox pattern", "At-least-once + idempotent receiver = effectively-once"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python service implementing an LRU cache with expiration and a Cache-Aside wrapper over a mock database store.",
                    "what_counts_as_evidence": "Unit test execution output verifying cache hits, cache misses, database queries, and automatic eviction under memory limits.",
                    "eval_criteria": ["Implements O(1) LRU eviction using Hashmap + Doubly Linked List", "Fetches from database on cache miss and populates cache", "Prevents duplicate DB fetches during concurrent requests for missing keys"]
                },
                "resources": [
                    {"title": "CAP Theorem - Wikipedia", "url": "https://en.wikipedia.org/wiki/CAP_theorem"},
                    {"title": "Consistent Hashing - Wikipedia", "url": "https://en.wikipedia.org/wiki/Consistent_hashing"}
                ]
            },
            {
                "title": "Fault Tolerance, Rate Limiting & Consensus",
                "topics": [
                    {"title": "Circuit Breakers, Bulkheads & Retry Policies", "youtube_search_query": "Circuit breaker pattern Resilience4j exponential backoff jitter system design", "subtopics": ["Closed, Open, and Half-Open circuit breaker states", "Exponential backoff with full jitter retry algorithm", "Bulkhead isolation to prevent cascading failures"]},
                    {"title": "Token Bucket & Leaky Bucket Rate Limiting", "youtube_search_query": "Rate limiting algorithms token bucket leaky bucket sliding window Redis", "subtopics": ["Token Bucket vs Leaky Bucket vs Sliding Window Log", "Distributed rate limiting with Redis and Lua scripts", "Handling HTTP 429 Too Many Requests responses"]},
                    {"title": "Consensus Protocols: Paxos & Raft Fundamentals", "youtube_search_query": "Consensus protocols Raft Paxos leader election log replication distributed systems", "subtopics": ["State Machine Replication concept", "Raft Leader Election, Log Matching, and Safety properties", "Split-brain prevention and quorum majority voting"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python implementation of a Token Bucket rate limiter decorator supporting configurable refill rates and burst capacities.",
                    "what_counts_as_evidence": "Test execution log showing requests passing under token limit and returning 429 errors once bucket tokens are exhausted.",
                    "eval_criteria": ["Tracks token timestamp and calculates dynamic refill accurately", "Allows burst requests up to max bucket capacity", "Thread-safe implementation under concurrent request calls"]
                },
                "resources": [
                    {"title": "Consistent Hashing - Wikipedia", "url": "https://en.wikipedia.org/wiki/Consistent_hashing"},
                    {"title": "CAP Theorem - Wikipedia", "url": "https://en.wikipedia.org/wiki/CAP_theorem"}
                ]
            }
        ]
    },
    # 4. API Design: Building RESTful & GraphQL APIs That Last
    {
        "title": "API Design: Building RESTful & GraphQL APIs That Last",
        "description": "Versioning strategies and pagination patterns and error contracts that don't break clients.",
        "subject": "Backend Engineers & API Platform Teams",
        "modules_data": [
            {
                "title": "RESTful Resource Modeling & URI Design",
                "topics": [
                    {"title": "Resource-Oriented URL Paths & HTTP Method Semantics", "youtube_search_query": "REST API resource modeling URI path design HTTP methods RESTful rules", "subtopics": ["Nouns vs Verbs in URL path design", "Idempotent HTTP methods (GET, PUT, DELETE) vs non-idempotent (POST)", "Sub-resource paths and relationship modeling"]},
                    {"title": "Idempotent HTTP Methods & Header Standards", "youtube_search_query": "HTTP headers REST API design content negotiation Idempotency-Key", "subtopics": ["Content Negotiation (Accept, Content-Type)", "Idempotency-Key headers for financial POST requests", "Conditional requests with ETag and If-Match"]},
                    {"title": "Standardized Error Contracts (RFC 7807 Problem Details)", "youtube_search_query": "RFC 7807 problem details HTTP API error response design", "subtopics": ["RFC 7807 Problem Details JSON format (type, title, status, detail, instance)", "Structuring validation error details arrays", "Preventing internal stack trace leakage in API errors"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A FastAPI or Express API endpoint implementing RFC 7807 compliant error responses for invalid inputs and resource not found states.",
                    "what_counts_as_evidence": "Curl or HTTP client response output displaying structured `application/problem+json` payload with code, detail, and field errors.",
                    "eval_criteria": ["Response includes content-type application/problem+json", "Payload includes standard RFC 7807 fields", "Validation errors list specific failing field paths and constraints"]
                },
                "resources": [
                    {"title": "GraphQL Official Documentation", "url": "https://graphql.org/learn/"},
                    {"title": "Representational State Transfer - Wikipedia", "url": "https://en.wikipedia.org/wiki/REST"}
                ]
            },
            {
                "title": "Pagination, Filtering & Versioning Strategies",
                "topics": [
                    {"title": "Offset vs Cursor-Based Pagination", "youtube_search_query": "Cursor based pagination vs offset pagination API design REST GraphQL", "subtopics": ["Limitations of LIMIT/OFFSET on large datasets", "Opaque cursor encoding (Base64 encoded timestamps/IDs)", "Designing Relay-style connection pagination (edges, node, pageInfo)"]},
                    {"title": "API Versioning (URI Path vs Header vs Query Param)", "youtube_search_query": "API versioning strategies URI path header content negotiation API design", "subtopics": ["URI path versioning (/v1/users) vs header versioning (Accept-Version)", "Stripe-style date-based API versioning strategy", "Deprecation notices via Sunset and Deprecation HTTP headers"]},
                    {"title": "Filtering, Sorting & Field Selection Syntaxes", "youtube_search_query": "API filtering sorting field selection design REST query parameters", "subtopics": ["Designing filter query params (?status=active&created_gt=2026-01-01)", "Sorting params (?sort=-created_at,name)", "Partial responses via sparse fieldsets (?fields=id,title)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python API endpoint implementing cursor-based pagination with Base64 encoded cursors over an ordered dataset.",
                    "what_counts_as_evidence": "HTTP client output showing returned cursor tokens and fetching next page starting strictly after the cursor position.",
                    "eval_criteria": ["Encodes cursor using deterministic attributes", "Decodes cursor to fetch next dataset page without duplicate items", "Returns `has_next_page` boolean flag and next cursor string"]
                },
                "resources": [
                    {"title": "GraphQL Official Documentation", "url": "https://graphql.org/learn/"},
                    {"title": "Representational State Transfer - Wikipedia", "url": "https://en.wikipedia.org/wiki/REST"}
                ]
            },
            {
                "title": "GraphQL Schema Design & N+1 Resolution",
                "topics": [
                    {"title": "Schema First vs Code First GraphQL", "youtube_search_query": "GraphQL schema first vs code first design SDL GraphQL Python Node", "subtopics": ["GraphQL Schema Definition Language (SDL)", "Types, Interfaces, Unions, and Enums in GraphQL", "Code-first schema generation with Strawberry / Nexus"]},
                    {"title": "DataLoader Pattern & N+1 Query Optimization", "youtube_search_query": "GraphQL DataLoader N+1 query problem batching caching tutorial", "subtopics": ["Understanding the N+1 database query problem in GraphQL resolvers", "Batching request keys with DataLoader", "Per-request DataLoader instance caching"]},
                    {"title": "GraphQL Mutations, Inputs & Errors as Data", "youtube_search_query": "GraphQL mutation design input objects union payload error as data", "subtopics": ["Designing input objects for clean payload arguments", "Errors as Data pattern using Union types (UserResult = User | InvalidInputError)", "Mutation execution idempotency"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A GraphQL server implementation using DataLoader to resolve nested author references on a list of blog posts without N+1 SQL queries.",
                    "what_counts_as_evidence": "Database query log confirming exactly 2 SQL queries executed (1 for posts, 1 batched IN query for authors) when requesting 50 posts.",
                    "eval_criteria": ["Defines clear GraphQL schema with Post and Author types", "Attaches DataLoader to resolver context", "Executes single batched SQL query for all post author IDs"]
                },
                "resources": [
                    {"title": "GraphQL Official Documentation", "url": "https://graphql.org/learn/"},
                    {"title": "Representational State Transfer - Wikipedia", "url": "https://en.wikipedia.org/wiki/REST"}
                ]
            },
            {
                "title": "API Security, Rate Limiting & Lifecycle Management",
                "topics": [
                    {"title": "OAuth2, JWT Bearer Tokens & Scopes", "youtube_search_query": "OAuth2 JWT bearer token authorization scopes API security tutorial", "subtopics": ["JWT structure (Header, Payload, Signature) and RS256 signing", "Scope validation middleware for API endpoints", "Token refresh and revocation strategies"]},
                    {"title": "Rate Limiting Headers & Tiered Quotas", "youtube_search_query": "API rate limiting headers X-RateLimit-Limit Remaining Reset Redis middleware", "subtopics": ["Standard HTTP headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)", "Tiered quota strategies by API key tier", "Handling burst limits vs sustained daily quotas"]},
                    {"title": "OpenAPI/Swagger Specifications & Deprecation Lifecycle", "youtube_search_query": "OpenAPI 3.0 specification Swagger generation API documentation contract", "subtopics": ["Authoring OpenAPI 3.0 JSON/YAML specifications", "Auto-generating client SDKs from OpenAPI specs", "API deprecation signaling and grace period communication"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An OpenAPI 3.0 YAML specification file for a multi-tenant API including OAuth2 security schemes, request bodies, and RFC 7807 error models.",
                    "what_counts_as_evidence": "OpenAPI CLI validator (`redocly lint` or `swagger-cli validate`) confirming 0 errors in the schema document.",
                    "eval_criteria": ["YAML spec adheres strictly to OpenAPI 3.0 schema", "Defines securitySchemes for Bearer JWT", "Specifies error responses referencing standardized error components"]
                },
                "resources": [
                    {"title": "GraphQL Official Documentation", "url": "https://graphql.org/learn/"},
                    {"title": "Representational State Transfer - Wikipedia", "url": "https://en.wikipedia.org/wiki/REST"}
                ]
            }
        ]
    },
    # 5. Nix & Reproducible Development Environments
    {
        "title": "Nix & Reproducible Development Environments",
        "description": "Solves 'works on my machine' permanently — deterministic builds and dev shells.",
        "subject": "DevOps Engineers & Any Developer tired of Dockerfile drift",
        "modules_data": [
            {
                "title": "Nix Language & Functional Package Management",
                "topics": [
                    {"title": "Nix Language Syntax, Lazy Evaluation & Expressions", "youtube_search_query": "Nix language tutorial syntax lazy evaluation functions sets nix-instantiate", "subtopics": ["Attribute sets, lists, and functions in Nix", "Lazy evaluation mechanics and immutability", "Evaluating expressions with `nix repl`"]},
                    {"title": "The Nix Store (/nix/store) & Content-Addressed Storage", "youtube_search_query": "Nix store architecture content addressed store hash path reproducible builds", "subtopics": ["Cryptographic hash calculation for package inputs", "Isolation in /nix/store/hash-name-version", "Symlink trees and garbage collection (`nix-collect-garbage`)"]},
                    {"title": "Derivations (stdenv.mkDerivation) from Scratch", "youtube_search_query": "Writing nix derivations stdenv.mkDerivation custom package nix tutorial", "subtopics": ["Anatomy of a `.drv` derivation file", "Standard build phases (unpackPhase, buildPhase, installPhase)", "Handling build dependencies (buildInputs, nativeBuildInputs)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A custom Nix derivation (`default.nix`) using `stdenv.mkDerivation` that builds and packages a C hello-world binary into `/nix/store`.",
                    "what_counts_as_evidence": "Command output from `nix-build` showing successful compilation and binary execution from `/nix/store/.../bin/hello`.",
                    "eval_criteria": ["default.nix specifies pname, version, and src attributes", "Builds successfully using standard stdenv environment", "Binary executes cleanly from output nix store path"]
                },
                "resources": [
                    {"title": "NixOS Official Website", "url": "https://nixos.org"},
                    {"title": "Nix GitHub Repository", "url": "https://github.com/NixOS/nix"}
                ]
            },
            {
                "title": "Nix Flakes & Deterministic Environments",
                "topics": [
                    {"title": "Nix Flakes Architecture & flake.nix Structure", "youtube_search_query": "Nix Flakes architecture flake nix inputs outputs tutorial", "subtopics": ["Flake input declarations (nixpkgs url)", "Flake output schema (packages, devShells, apps)", "Enabling experimental flakes feature in nix.conf"]},
                    {"title": "flake.lock & Pinning Dependencies Deterministically", "youtube_search_query": "Nix flake lock file pinning nixpkgs revisions reproducible environment", "subtopics": ["Anatomy of `flake.lock` commit hashes", "Updating flake inputs via `nix flake update`", "Guaranteeing identical package revisions across developer machines"]},
                    {"title": "Building Multi-Architecture Output Targets with Flakes", "youtube_search_query": "Nix flakes cross compilation multi system target flake-utils nix", "subtopics": ["Supporting `x86_64-linux`, `aarch64-linux`, `aarch64-darwin` targets", "Using `flake-utils.lib.eachDefaultSystem` helper", "Cross-compiling packages for embedded platforms"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A `flake.nix` repository file declaring a pinned nixpkgs input and exposing a default package built deterministically.",
                    "what_counts_as_evidence": "Command execution of `nix build` producing a `./result` symlink containing executable output.",
                    "eval_criteria": ["flake.nix contains inputs, outputs, and lockfile", "Nix build completes without internet access when store cache is present", "Result symlink links directly to valid store target"]
                },
                "resources": [
                    {"title": "NixOS Official Website", "url": "https://nixos.org"},
                    {"title": "Nix GitHub Repository", "url": "https://github.com/NixOS/nix"}
                ]
            },
            {
                "title": "Nix Devenvs & Shells (devShells)",
                "topics": [
                    {"title": "Creating Custom devShells with nix develop", "youtube_search_query": "Nix devShell nix develop reproducible developer environment tutorial", "subtopics": ["Defining `devShells.default` in flake.nix", "Injecting environment variables into development shells", "Adding shell hooks (`shellHook`) for setup scripts"]},
                    {"title": "Integrating direnv with Nix (use flake)", "youtube_search_query": "Nix direnv integration use flake nix-direnv auto loading shell", "subtopics": ["Setting up `.envrc` with `use flake`", "Configuring `nix-direnv` for fast persistent caching", "Automatic environment switching on `cd` into project directory"]},
                    {"title": "Hermetic Toolchains for Rust, Python & Node.js", "youtube_search_query": "Nix devshell Python Rust Nodejs toolchain hermetic environment nixpkgs", "subtopics": ["Integrating `fenix` or `rust-overlay` for custom Rust toolchains", "Combining `python3.withPackages` for isolated Python dev shells", "Pinning Node.js and global CLI utilities without global installs"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A `flake.nix` file exposing a `devShell` equipped with Python 3.11, PostgreSQL client tools, and a custom `shellHook` banner.",
                    "what_counts_as_evidence": "Terminal log from executing `nix develop` showing interactive bash shell loaded with correct `python3 --version` and environment variables.",
                    "eval_criteria": ["devShells.default contains specified package dependencies", "shellHook runs automatically upon entering environment", "Isolated binaries do not pollute global host path"]
                },
                "resources": [
                    {"title": "NixOS Official Website", "url": "https://nixos.org"},
                    {"title": "Nix GitHub Repository", "url": "https://github.com/NixOS/nix"}
                ]
            },
            {
                "title": "NixOS & Reproducible Container Images",
                "topics": [
                    {"title": "NixOS Module System & Declarative System Config", "youtube_search_query": "NixOS configuration nix module system declarative linux configuration", "subtopics": ["configuration.nix structure and option declarations", "Declarative user, systemd service, and package management", "System rebuild and rollback (`nixos-rebuild switch`)"]},
                    {"title": "Building Minimal OCI Container Images with pkgs.dockerTools", "youtube_search_query": "Nix dockerTools buildImage minimal container image without Dockerfile", "subtopics": ["`pkgs.dockerTools.buildImage` function usage", "Creating layered minimal container tarballs", "Eliminating base OS vulnerabilities by copying only required store paths"]},
                    {"title": "Continuous Integration & Binary Caches (Cachix)", "youtube_search_query": "Nix binary cache Cachix GitHub Actions CI setup tutorial", "subtopics": ["Setting up Cachix binary cache store", "Configuring GitHub Actions with `cachix-action`", "Accelerating CI builds by sharing pre-built store artifacts"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Nix expression using `pkgs.dockerTools.buildImage` to compile a Python web app into an ultra-minimal OCI container tarball.",
                    "what_counts_as_evidence": "Command log showing `docker load < result` and `docker run` starting the container successfully with a minimal total image size (<50MB).",
                    "eval_criteria": ["Uses dockerTools.buildLayeredImage or buildImage", "Includes only required runtime closure in image", "Container boots application without requiring full OS distribution"]
                },
                "resources": [
                    {"title": "NixOS Official Website", "url": "https://nixos.org"},
                    {"title": "Nix GitHub Repository", "url": "https://github.com/NixOS/nix"}
                ]
            }
        ]
    },
    # 6. Accessible Web Development (WCAG Deep Dive)
    {
        "title": "Accessible Web Development (WCAG Deep Dive)",
        "description": "Screen readers and keyboard navigation and ARIA patterns — legal compliance and the right thing to do.",
        "subject": "Frontend Engineers & Product Teams",
        "modules_data": [
            {
                "title": "WCAG 2.2 Principles & Legal Accessibility Standards",
                "topics": [
                    {"title": "Perceivable, Operable, Understandable & Robust (POUR)", "youtube_search_query": "WCAG 2.2 POUR principles accessible web development tutorial", "subtopics": ["The 4 core principles of web accessibility", "Text alternatives for non-text content (WCAG 1.1.1)", "Adaptable layout and content relationships (WCAG 1.3.1)"]},
                    {"title": "WCAG Conformance Levels (A, AA, AAA) Differences", "youtube_search_query": "WCAG levels A AA AAA differences accessibility compliance guide", "subtopics": ["Minimum legal standards (WCAG 2.2 Level AA)", "Comparing Level A, AA, and AAA success criteria", "ADA Section 508 and EN 301 549 legal requirements"]},
                    {"title": "Color Contrast Ratios & Visual Accessibility Rules", "youtube_search_query": "WCAG color contrast ratios 4.5 1 3 1 visual accessibility design", "subtopics": ["Calculating relative luminance and contrast ratio", "Standard text (4.5:1) vs Large text (3:1) requirements", "Non-text contrast for UI components and focus rings"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An HTML/CSS color palette design system audit document proving all text and UI component color combinations pass WCAG 2.2 Level AA contrast requirements.",
                    "what_counts_as_evidence": "Audit table listing hex color codes, foreground/background combinations, calculated contrast ratio, and PASS/FAIL AA status.",
                    "eval_criteria": ["Calculates relative luminance ratios accurately", "Normal text combinations meet or exceed 4.5:1 ratio", "Interactive focus states pass 3:1 non-text contrast requirement"]
                },
                "resources": [
                    {"title": "W3C WCAG Standards Overview", "url": "https://www.w3.org/WAI/standards-guidelines/wcag/"},
                    {"title": "MDN Web Accessibility Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility"}
                ]
            },
            {
                "title": "Semantic HTML & Keyboard Navigation",
                "topics": [
                    {"title": "Native HTML Elements vs Custom Accessible Controls", "youtube_search_query": "Semantic HTML vs div button screen reader accessibility tutorial", "subtopics": ["Why native `<button>` and `<a>` beat `<div onClick>`", "Landmark elements (`<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`)", "Form controls, labels (`<label for>`), and fieldsets"]},
                    {"title": "Managing Focus Traps & Tab Order (tabindex)", "youtube_search_query": "Keyboard focus management tabindex focus trap modal accessibility", "subtopics": ["Default tab order vs `tabindex=\"0\"` vs `tabindex=\"-1\"`", "Building focus traps for modal dialogs", "Restoring focus on modal close to trigger element"]},
                    {"title": "Keyboard Event Handlers & Interactive Control Patterns", "youtube_search_query": "Keyboard event handling Enter Space Escape arrow keys accessibility", "subtopics": ["Handling Enter and Space keys on custom controls", "Arrow key navigation inside composite widgets (roving tabindex)", "Visible focus indicators (`:focus-visible`) styling"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A modal dialog component built with HTML/JS that implements a focus trap, handles Escape key to close, and restores focus upon exit.",
                    "what_counts_as_evidence": "Video or animated GIF/log showing keyboard-only navigation cycling exclusively within the active modal until closed.",
                    "eval_criteria": ["Tab key cycles focus between modal interactive elements without leaking", "Escape key triggers modal close handler", "Focus returns precisely to triggering button upon modal dismissal"]
                },
                "resources": [
                    {"title": "W3C WCAG Standards Overview", "url": "https://www.w3.org/WAI/standards-guidelines/wcag/"},
                    {"title": "MDN Web Accessibility Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility"}
                ]
            },
            {
                "title": "WAI-ARIA Roles, States & Properties",
                "topics": [
                    {"title": "When to Use ARIA and the First Rule of ARIA", "youtube_search_query": "First rule of ARIA WAI-ARIA roles attributes tutorial", "subtopics": ["The First Rule of ARIA: Do not use ARIA when native HTML works", "Widget roles vs Landmark roles vs Document structure roles", "ARIA attribute categories: States vs Properties"]},
                    {"title": "ARIA Live Regions for Dynamic UI Notifications", "youtube_search_query": "ARIA live regions polite assertive aria-live screen reader notification", "subtopics": ["`aria-live=\"polite\"` vs `aria-live=\"assertive\"`", "`aria-atomic` and `aria-relevant` properties", "Announcing single-page app route changes and form notifications"]},
                    {"title": "Building Accessible Modals, Dropdowns & Comboboxes", "youtube_search_query": "WAI ARIA design patterns combobox dropdown modal accessibility", "subtopics": ["ARIA Combobox pattern (`aria-expanded`, `aria-controls`, `aria-autocomplete`)", "Building accessible disclosure accordions (`aria-expanded`)", "Tab panel accessibility (`role=\"tablist\"`, `role=\"tab\"`, `role=\"tabpanel\"`)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An accessible tabbed interface component following the WAI-ARIA Authoring Practices Guide pattern.",
                    "what_counts_as_evidence": "HTML source snippet and test output showing correct `role=\"tablist\"`, `role=\"tab\"`, `aria-selected`, and `aria-controls` bindings.",
                    "eval_criteria": ["Uses roving tabindex for arrow key tab navigation", "Updates `aria-selected=\"true\"` dynamically on active tab", "Connects tab elements to corresponding tabpanel IDs"]
                },
                "resources": [
                    {"title": "W3C WCAG Standards Overview", "url": "https://www.w3.org/WAI/standards-guidelines/wcag/"},
                    {"title": "MDN Web Accessibility Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility"}
                ]
            },
            {
                "title": "Automated & Manual Accessibility Testing",
                "topics": [
                    {"title": "Testing with Screen Readers (NVDA, VoiceOver, JAWS)", "youtube_search_query": "Screen reader testing VoiceOver NVDA keyboard shortcuts web accessibility", "subtopics": ["VoiceOver (macOS/iOS) key commands and rotor navigation", "NVDA (Windows) browsing modes and element list navigation", "Common screen reader quirks and testing workflows"]},
                    {"title": "Automated Testing with axe-core & Lighthouse", "youtube_search_query": "Automated accessibility testing axe core cypress Playwright lighthouse", "subtopics": ["Integrating `@axe-core/playwright` or `cypress-axe`", "Lighthouse accessibility audit scoring", "Understanding automated test coverage limits (~30-40% of WCAG issues)"]},
                    {"title": "Integrating Accessibility Audits into CI Pipelines", "youtube_search_query": "Accessibility CI pipeline GitHub actions automated axe testing web", "subtopics": ["Blocking PRs on accessibility test failures", "Generating automated accessibility audit reports", "Maintaining accessibility regression test suites"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An automated end-to-end accessibility test suite using Playwright and `@axe-core/playwright` that scans 3 core web application pages.",
                    "what_counts_as_evidence": "Test execution log output demonstrating 0 critical or serious WCAG accessibility violations across audited pages.",
                    "eval_criteria": ["Integrates axe-core scanner into Playwright test runner", "Audits DOM state after interactive modal opens", "Generates detailed violation report with DOM node selectors on failure"]
                },
                "resources": [
                    {"title": "W3C WCAG Standards Overview", "url": "https://www.w3.org/WAI/standards-guidelines/wcag/"},
                    {"title": "MDN Web Accessibility Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility"}
                ]
            }
        ]
    },
    # 7. Technical Writing for Engineers
    {
        "title": "Technical Writing for Engineers",
        "description": "Writing clear docs and RFCs and ADRs is a career multiplier that no CS program teaches.",
        "subject": "Any Engineer who writes proposals or documentation",
        "modules_data": [
            {
                "title": "Architecture Decision Records (ADRs) & Proposals",
                "topics": [
                    {"title": "Structuring ADRs: Context, Decision & Consequences", "youtube_search_query": "Architecture Decision Records ADR structure Michael Nygard template engineering", "subtopics": ["Anatomy of an ADR (Title, Status, Context, Decision, Consequences)", "Documenting positive and negative tradeoffs explicitly", "Maintaining an immutable sequence of ADRs in git"]},
                    {"title": "RFC (Request for Comments) Engineering Workflow", "youtube_search_query": "Engineering RFC process writing technical proposals request for comments", "subtopics": ["Authoring RFC proposals for major architecture changes", "Managing stakeholder feedback and review cycles", "Defining explicit non-goals to scope proposal boundaries"]},
                    {"title": "Writing Effective Trade-off Analysis & Alternatives", "youtube_search_query": "Technical trade off analysis evaluated options decision matrix software", "subtopics": ["Constructing decision evaluation matrices", "Comparing alternative architectures objectively", "Documenting rejected options and key decision rationale"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A production-grade Architecture Decision Record (ADR) in Markdown proposing the adoption of a message queue in a monolithic service architecture.",
                    "what_counts_as_evidence": "Markdown document containing completed Context, Decision, Consequences, and Alternatives Considered sections.",
                    "eval_criteria": ["States precise technical context and architectural problem", "Outlines decision clearly with active voice", "Enumerates concrete positive, negative, and neutral consequences"]
                },
                "resources": [
                    {"title": "ADR GitHub Organization", "url": "https://adr.github.io/"},
                    {"title": "W3C Standards Overview", "url": "https://www.w3.org/WAI/standards-guidelines/wcag/"}
                ]
            },
            {
                "title": "Technical Documentation & API Reference Guides",
                "topics": [
                    {"title": "Diátaxis Framework: Tutorials, How-Tos, Reference, Explanation", "youtube_search_query": "Diataxis documentation framework tutorials how-to reference explanation", "subtopics": ["The 4 modes of documentation architecture", "Learning-oriented Tutorials vs Problem-oriented How-To Guides", "Information-oriented Reference vs Understanding-oriented Explanation"]},
                    {"title": "Writing Concise API Specifications & Code Samples", "youtube_search_query": "Writing API documentation code samples developer experience technical writing", "subtopics": ["Crafting runnable, copy-pasteable code snippets", "Explaining request parameters, response schemas, and errors", "Documenting rate limits and authentication steps"]},
                    {"title": "Keeping Documentation Fresh via Docs-as-Code", "youtube_search_query": "Docs as code workflow markdown git CI CD automated testing", "subtopics": ["Storing documentation in Git alongside source code", "Automating code sample testing in CI pipelines", "Linting Markdown for prose style with Vale"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Diátaxis-structured documentation suite for an open-source library containing 1 Tutorial, 1 How-To Guide, and 1 API Reference page.",
                    "what_counts_as_evidence": "Markdown files organized into `/tutorials`, `/how-to`, and `/reference` directories with accurate tone matching each Quadrant.",
                    "eval_criteria": ["Tutorial focuses on step-by-step beginner learning without unnecessary theory", "How-To Guide provides concise instructions to solve a specific goal", "Reference doc provides complete, exact parameter specs and return values"]
                },
                "resources": [
                    {"title": "ADR GitHub Organization", "url": "https://adr.github.io/"},
                    {"title": "W3C Standards Overview", "url": "https://www.w3.org/WAI/standards-guidelines/wcag/"}
                ]
            },
            {
                "title": "Editing, Clarity & Information Architecture",
                "topics": [
                    {"title": "Cutting Technical Fluff & Active Voice Engineering", "youtube_search_query": "Technical writing active voice cutting fluff clarity Google technical writing", "subtopics": ["Replacing passive voice with active voice sentences", "Eliminating filler words, buzzwords, and vague terminology", "Structuring short paragraphs and scannable bullet points"]},
                    {"title": "Designing Diagrams & Visual Flowcharts (Mermaid.js)", "youtube_search_query": "Mermaid js sequence diagrams architecture flowcharts technical writing", "subtopics": ["Authoring sequence diagrams for API call flows", "Building architecture block diagrams in code", "Embedding diagrams directly in Markdown documentation"]},
                    {"title": "Organizing Engineering Handbooks & Knowledge Bases", "youtube_search_query": "Engineering handbook organization information architecture documentation", "subtopics": ["Designing intuitive navigation hierarchies", "Taxonomy and tag metadata strategies", "Search engine optimization for internal wikis"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A technical architecture document written in Markdown containing 2 embedded Mermaid.js diagrams (1 Sequence Diagram, 1 Flowchart) explaining an authentication flow.",
                    "what_counts_as_evidence": "Markdown file rendering valid Mermaid.js diagrams without syntax errors.",
                    "eval_criteria": ["Prose uses active voice and direct, simple English", "Mermaid sequence diagram illustrates client-server-auth server interactions", "Flowchart visualizes fallback and error handling branches clearly"]
                },
                "resources": [
                    {"title": "ADR GitHub Organization", "url": "https://adr.github.io/"},
                    {"title": "W3C Standards Overview", "url": "https://www.w3.org/WAI/standards-guidelines/wcag/"}
                ]
            },
            {
                "title": "Incident Reports & Postmortems",
                "topics": [
                    {"title": "Blameless Postmortem Structure & Root Cause Analysis", "youtube_search_query": "Blameless postmortem incident report writing site reliability engineering", "subtopics": ["Fostering a blameless engineering culture", "Root Cause Analysis (RCA) using 5 Whys technique", "Documenting trigger conditions and system vulnerabilities"]},
                    {"title": "Documenting Incident Timelines & System Failures", "youtube_search_query": "Incident timeline construction postmortem SRE report writing", "subtopics": ["Constructing precise UTC timestamps for incident phases", "Quantifying customer impact and downtime metrics", "Documenting detection, escalation, and resolution actions"]},
                    {"title": "Turning Incidents into Actionable Prevention Items", "youtube_search_query": "Incident postmortem action items tracking engineering reliability", "subtopics": ["Categorizing action items (Prevent, Detect, Mitigate)", "Assigning owner teams and priority SLAs to postmortem tasks", "Reviewing postmortem action items in engineering leadership syncs"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A comprehensive Blameless Postmortem Markdown document detailing a simulated production database outage.",
                    "what_counts_as_evidence": "Document containing Incident Summary, UTC Timeline, 5 Whys Root Cause Analysis, and Action Items table.",
                    "eval_criteria": ["Timeline details exact detection, triage, and resolution steps", "Root Cause section avoids individual blame and analyzes systemic failures", "Action Items list concrete tasks with designated owners and priority tags"]
                },
                "resources": [
                    {"title": "ADR GitHub Organization", "url": "https://adr.github.io/"},
                    {"title": "W3C Standards Overview", "url": "https://www.w3.org/WAI/standards-guidelines/wcag/"}
                ]
            }
        ]
    },
    # 8. Formal Verification with TLA+ and Alloy
    {
        "title": "Formal Verification with TLA+ and Alloy",
        "description": "Mathematically proving your distributed system design is correct before writing a single line of code.",
        "subject": "Distributed Systems & Safety-Critical Engineers",
        "modules_data": [
            {
                "title": "Modeling Systems as State Machines in TLA+",
                "topics": [
                    {"title": "Temporal Logic of Actions & State Variables", "youtube_search_query": "TLA+ tutorial temporal logic of actions Leslie Lamport formal verification", "subtopics": ["Variables, constants, and state predicates", "Primed vs unprimed variables (`x'` vs `x`)", "Defining state transitions as boolean formulas"]},
                    {"title": "Writing Initial States & Next-State Relations", "youtube_search_query": "TLA+ Init Next state relation specification tutorial", "subtopics": ["Defining `Init` predicate for system starting state", "Constructing disjunctive `Next` state transitions", "Specifying action disjunctions (`Next == ActionA \\/ ActionB`)"]},
                    {"title": "Invariants & Safety Property Specifications", "youtube_search_query": "TLA+ state invariants safety properties TypeOK formal proof", "subtopics": ["TypeOK invariants for variable type boundaries", "Specifying mutual exclusion and safety invariants", "Checking invariants across all reachable states"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A TLA+ module (`DieHard.tla` or custom bucket transfer) specifying initial states, transition actions, and safety invariants.",
                    "what_counts_as_evidence": "TLC Model Checker output log reporting state space exploration completion with 0 invariant violations.",
                    "eval_criteria": ["Specifies Init and Next state predicates correctly", "Defines TypeOK and safety invariants", "TLC verifies all generated distinct states satisfy specified invariants"]
                },
                "resources": [
                    {"title": "TLA+ Official Website", "url": "https://lamport.azurewebsites.net/tla/tla.html"},
                    {"title": "TLA+ GitHub Repository", "url": "https://github.com/tlaplus/tlaplus"}
                ]
            },
            {
                "title": "Model Checking with TLC & Liveness Properties",
                "topics": [
                    {"title": "Running the TLC Model Checker & State Space Exploration", "youtube_search_query": "TLC model checker TLA+ configuration model check tutorial", "subtopics": ["TLC config (`.cfg`) file setup", "State space search strategies (Breadth-First vs Depth-First)", "Symmetry sets for state space reduction"]},
                    {"title": "Temporal Operators & Liveness Verification (Fairness)", "youtube_search_query": "TLA+ liveness properties temporal operators WF SF fairness", "subtopics": ["Temporal operators `[]` (Always) and `<>` (Eventually)", "Weak Fairness (`WF_vars(Action)`) vs Strong Fairness (`SF_vars(Action)`)", "Verifying property `[]<>(State == Goal)`"]},
                    {"title": "Debugging Counterexamples & Trace Analysis", "youtube_search_query": "TLA+ TLC counterexample trace error stack debugging", "subtopics": ["Interpreting TLC error trace state step outputs", "Identifying missing state transition guards", "Refining specifications based on counterexamples"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A TLA+ specification for a bounded queue with producer-consumer threads, enforcing liveness with weak fairness operators.",
                    "what_counts_as_evidence": "TLC execution log proving that items produced are eventually consumed without deadlocks.",
                    "eval_criteria": ["Configures WF fairness conditions on step actions", "Specifies temporal liveness property using `[]<>` operator", "TLC successfully verifies liveness across full state space"]
                },
                "resources": [
                    {"title": "TLA+ Official Website", "url": "https://lamport.azurewebsites.net/tla/tla.html"},
                    {"title": "TLA+ GitHub Repository", "url": "https://github.com/tlaplus/tlaplus"}
                ]
            },
            {
                "title": "Structural Relational Modeling with Alloy",
                "topics": [
                    {"title": "Alloy Analyzer Syntax: Signatures, Facts & Predicates", "youtube_search_query": "Alloy analyzer tutorial signatures facts predicates formal modeling", "subtopics": ["Defining structural atoms with signatures (`sig`)", "Enforcing structural invariants with `fact` blocks", "Writing parameterized test scenarios with `pred`"]},
                    {"title": "First-Order Relational Logic & Scope Settings", "youtube_search_query": "Alloy relational logic scope run check command tutorial", "subtopics": ["Relational join operator (`.`) and set operations", "Setting instance search scopes (`run show for 3`)", "Small Scope Hypothesis concept"]},
                    {"title": "Counterexample Finding & Visualizing Instance Graphs", "youtube_search_query": "Alloy counterexample visualizer instance graph evaluator", "subtopics": ["Checking assertions with `check` command", "Analyzing generated counterexample instance graphs", "Using the Alloy Evaluator to inspect expression values"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An Alloy specification (`.als`) modeling a file system permission model with User, Group, Resource, and Permission signatures.",
                    "what_counts_as_evidence": "Alloy Analyzer output confirming 0 counterexamples found for assertion checks up to scope 5.",
                    "eval_criteria": ["Defines signatures and relations cleanly", "Writes facts governing inheritance and permission access", "Executes `check NoUnauthorizedAccess for 5` returning no counterexample"]
                },
                "resources": [
                    {"title": "TLA+ Official Website", "url": "https://lamport.azurewebsites.net/tla/tla.html"},
                    {"title": "TLA+ GitHub Repository", "url": "https://github.com/tlaplus/tlaplus"}
                ]
            },
            {
                "title": "Verifying Real Distributed Protocols",
                "topics": [
                    {"title": "Modeling Two-Phase Commit (2PC) in TLA+", "youtube_search_query": "Modeling Two Phase Commit 2PC in TLA+ formal verification", "subtopics": ["Transaction coordinator and resource manager state machines", "Simulating message loss and RM crashes", "Verifying atomic commitment invariant"]},
                    {"title": "Verifying Raft Leader Election Safety in TLA+", "youtube_search_query": "Raft leader election TLA+ specification formal proof", "subtopics": ["Modeling terms, candidate votes, and log indices", "Specifying Election Safety invariant (at most one leader per term)", "Uncovering subtle edge cases in leader election logic"]},
                    {"title": "Applying Model Checking to Cloud Architecture Specifications", "youtube_search_query": "Formal methods distributed cloud architecture TLA+ AWS industry case study", "subtopics": ["Integrating formal specs into cloud design workflows", "Abstraction levels: High-level spec vs implementation code", "Industrial success stories (AWS S3, DynamoDB TLA+ specs)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A complete TLA+ specification of the Two-Phase Commit (2PC) protocol modeling prepare, commit, and abort messages.",
                    "what_counts_as_evidence": "TLC verification report proving that no two Resource Managers reach conflicting Commit/Abort decisions.",
                    "eval_criteria": ["Defines state variables for Coordinator and Resource Managers", "Models network message passing step transitions", "TLC confirms global consistency invariant holds across all network message ordering permutations"]
                },
                "resources": [
                    {"title": "TLA+ Official Website", "url": "https://lamport.azurewebsites.net/tla/tla.html"},
                    {"title": "TLA+ GitHub Repository", "url": "https://github.com/tlaplus/tlaplus"}
                ]
            }
        ]
    },
    # 9. Prompt Engineering for Structured Retrieval
    {
        "title": "Prompt Engineering for Structured Retrieval",
        "description": "Designing prompts that extract structured data from unstructured documents reliably and repeatedly.",
        "subject": "Data Scientists & AI Application Developers",
        "modules_data": [
            {
                "title": "Structured Output Patterns & JSON Schema Generation",
                "topics": [
                    {"title": "Enforcing JSON & Pydantic Schemas in LLM Outputs", "youtube_search_query": "Structured outputs LLM JSON schema Pydantic prompt engineering tutorial", "subtopics": ["Strict JSON mode vs OpenAI Function Calling / Structured Outputs", "Translating Pydantic models to JSON Schema prompt instructions", "Enforcing data types, required fields, and enums"]},
                    {"title": "System Prompts for Zero-Shot & Few-Shot Extraction", "youtube_search_query": "Few shot prompting structured extraction JSON LLM system prompt", "subtopics": ["Designing clear system role boundaries", "Constructing input-output few-shot exemplar pairs", "Formatting escape delimiters for target text inputs"]},
                    {"title": "Handling Hallucinated Fields & Schema Validation Errors", "youtube_search_query": "Pydantic ValidationError LLM JSON repair retry prompt pattern", "subtopics": ["Catching Pydantic ValidationError exceptions", "Feeding validation errors back into secondary LLM repair prompts", "Fallback parsing strategies for malformed markdown JSON code blocks"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python extraction pipeline using Pydantic and an LLM API to extract structured invoice data (vendor, line items, total) from raw text.",
                    "what_counts_as_evidence": "Pydantic object output log confirming successfully validated fields with zero missing or schema-mismatched fields.",
                    "eval_criteria": ["Defines nested Pydantic models for line items and totals", "Sends strict schema prompt instructions to LLM", "Implements automated retry parser for handling JSON syntax anomalies"]
                },
                "resources": [
                    {"title": "Pydantic Official Documentation", "url": "https://docs.pydantic.dev/"},
                    {"title": "Prompt Engineering - Wikipedia", "url": "https://en.wikipedia.org/wiki/Prompt_engineering"}
                ]
            },
            {
                "title": "Retrieval-Augmented Generation (RAG) Prompt Tuning",
                "topics": [
                    {"title": "Context Injection Strategies & Chunk Framing", "youtube_search_query": "RAG prompt engineering context injection document chunking structured prompt", "subtopics": ["Framing context blocks with explicit XML tags (`<context>`, `<document>`)", "Mitigating 'Lost in the Middle' position bias in long prompts", "System prompt instructions preventing hallucination when context lacks answer"]},
                    {"title": "Citations & Attribution Verification Prompts", "youtube_search_query": "LLM citation extraction prompt engineering source attribution RAG", "subtopics": ["Prompting LLMs to output inline quote references", "Mapping generated facts back to specific source chunk IDs", "Verifying attribution precision programmatically"]},
                    {"title": "Handling Irrelevant or Conflicting Contexts in Prompts", "youtube_search_query": "Handling conflicting context RAG prompt engineering LLM robustness", "subtopics": ["Prompting for confidence scores and ambiguity flags", "Filtering noisy document retrieved chunks", "Multi-document synthesis prompt structures"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python RAG prompt builder function that frames retrieved text chunks with XML tags, enforces citation IDs, and outputs JSON attribution.",
                    "what_counts_as_evidence": "Execution log showing generated LLM prompt and parsed output payload containing verified `chunk_id` citations.",
                    "eval_criteria": ["Wraps chunks in explicit XML tag boundaries", "Prompt explicitly instructs model to return 'UNKNOWN' if answer is absent", "Extracts structured citations linking generated assertions to chunk IDs"]
                },
                "resources": [
                    {"title": "Pydantic Official Documentation", "url": "https://docs.pydantic.dev/"},
                    {"title": "Prompt Engineering - Wikipedia", "url": "https://en.wikipedia.org/wiki/Prompt_engineering"}
                ]
            },
            {
                "title": "Multi-Step Reasoning & Chain-of-Thought",
                "topics": [
                    {"title": "Chain-of-Thought (CoT) & Structured Step Execution", "youtube_search_query": "Chain of Thought CoT prompting structured reasoning LLM tutorial", "subtopics": ["Prompting for explicit `<thought>` reasoning blocks before JSON output", "Decomposing complex extraction tasks into sequential steps", "Evaluating accuracy gains from CoT on nested schema extraction"]},
                    {"title": "ReAct (Reasoning + Acting) Agent Prompt Topologies", "youtube_search_query": "ReAct prompt pattern Thought Action Observation agent structured prompt", "subtopics": ["Structuring Thought -> Action -> Observation loop prompts", "Defining available tool signatures in prompt system context", "Parsing agent tool calls reliably"]},
                    {"title": "Self-Correction Loops & Refinement Prompt Patterns", "youtube_search_query": "LLM self correction reflection prompt pattern quality improvement", "subtopics": ["Critique-and-refine multi-turn prompt loops", "Validating domain constraint rules programmatically", "Automated prompt-driven self-correction pipelines"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A multi-step Python prompt chain that first generates a `<thinking>` reasoning trace and then outputs a strict JSON payload.",
                    "what_counts_as_evidence": "Console log showing step 1 reasoning trace followed by validated Pydantic model initialization from step 2 JSON output.",
                    "eval_criteria": ["Separates reasoning output from final JSON structure", "Pointers in thinking trace directly inform extracted JSON values", "JSON payload parses cleanly without residual thinking text tags"]
                },
                "resources": [
                    {"title": "Pydantic Official Documentation", "url": "https://docs.pydantic.dev/"},
                    {"title": "Prompt Engineering - Wikipedia", "url": "https://en.wikipedia.org/wiki/Prompt_engineering"}
                ]
            },
            {
                "title": "Evaluation, Benchmarking & Prompt Regression",
                "topics": [
                    {"title": "Automated Prompt Evals with LLM-as-a-Judge", "youtube_search_query": "LLM as a judge evaluation prompt engineering test suite benchmark", "subtopics": ["Designing evaluation rubrics for structured extraction", "Using GPT-4/Gemini as a judge for semantic correctness", "Measuring schema compliance rate and precision/recall"]},
                    {"title": "Structuring Benchmark Datasets for Extraction Precision", "youtube_search_query": "Building LLM evaluation dataset JSON ground truth benchmarking", "subtopics": ["Creating gold-standard JSON ground truth datasets", "Automated schema diff metrics (Levenshtein, Jaccard, Exact Match)", "Tracking accuracy regressions across prompt revisions"]},
                    {"title": "Optimizing Token Usage & Latency in Structured Prompts", "youtube_search_query": "LLM prompt optimization reduce tokens cost latency structured retrieval", "subtopics": ["Trimming system prompt boilerplate without losing accuracy", "Abbreviated JSON key names vs verbose schemas", "Prompt caching strategies (Anthropic / OpenAI prompt prefix caching)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python prompt evaluation harness that runs 10 test documents against 2 prompt variants and calculates schema precision and recall metrics against ground truth.",
                    "what_counts_as_evidence": "Summary table printed to console showing Accuracy %, Field Match Rate %, and Latency for Prompt A vs Prompt B.",
                    "eval_criteria": ["Computes exact field match rate against gold standard JSON files", "Logs token consumption and execution latency per variant", "Highlights accuracy differences between prompt strategies objectively"]
                },
                "resources": [
                    {"title": "Pydantic Official Documentation", "url": "https://docs.pydantic.dev/"},
                    {"title": "Prompt Engineering - Wikipedia", "url": "https://en.wikipedia.org/wiki/Prompt_engineering"}
                ]
            }
        ]
    },
    # 10. Container Security: Escaping & Hardening Docker
    {
        "title": "Container Security: Escaping & Hardening Docker",
        "description": "Understanding namespace isolation and capability dropping and seccomp profiles from the attacker's perspective.",
        "subject": "Security Engineers & DevOps",
        "modules_data": [
            {
                "title": "Linux Namespaces, Cgroups & Isolation Primitives",
                "topics": [
                    {"title": "PID, NET, Mount & User Namespaces Demystified", "youtube_search_query": "Linux namespaces PID NET MNT UTS IPC User namespace container isolation", "subtopics": ["Inspecting namespaces via `/proc/[pid]/ns`", "Isolating process trees with PID namespaces", "User namespaces and rootless container mapping"]},
                    {"title": "Resource Limits & Control Groups (cgroups v2)", "youtube_search_query": "Linux cgroups v2 resource limits memory CPU container hardening tutorial", "subtopics": ["cgroups v1 vs cgroups v2 architecture", "Enforcing memory limits and CPU quota throttles", "Preventing Fork Bomb attacks via `pids.max` limiters"]},
                    {"title": "Inspecting Container Isolation via /proc & nsenter", "youtube_search_query": "nsenter linux proc filesystem container security inspection", "subtopics": ["Entering container namespaces with `nsenter`", "Analyzing host vs container process visibilities", "Detecting leaked host procfs mounts"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A bash script utilizing `unshare` and `chroot` to construct a minimal container sandbox with isolated PID and Mount namespaces.",
                    "what_counts_as_evidence": "Execution log showing process inside sandbox sees itself as PID 1 and cannot inspect host processes.",
                    "eval_criteria": ["Constructs isolated PID namespace using unshare", "Mounts fresh procfs inside container root", "Verifies host process table is completely inaccessible from inside sandbox"]
                },
                "resources": [
                    {"title": "Docker Engine Security Documentation", "url": "https://docs.docker.com/engine/security/"},
                    {"title": "Linux Namespaces - Wikipedia", "url": "https://en.wikipedia.org/wiki/Linux_namespaces"}
                ]
            },
            {
                "title": "Container Vulnerabilities & Escapes",
                "topics": [
                    {"title": "Dangerous Docker Socket Mounts (docker.sock)", "youtube_search_query": "Docker socket mount vulnerability container escape exploitation docker.sock", "subtopics": ["Why mounting `/var/run/docker.sock` equals root on host", "Spawning privileged host containers via exposed socket", "Mitigating socket exposure with socket proxies"]},
                    {"title": "Misconfigured Capabilities (CAP_SYS_ADMIN, CAP_NET_ADMIN)", "youtube_search_query": "Linux capabilities CAP_SYS_ADMIN docker container escape exploitation", "subtopics": ["Understanding Linux capabilities vs full root permissions", "Exploiting `CAP_SYS_ADMIN` via cgroup release_agent escape", "`CAP_NET_ADMIN` packet sniffing and network spoofing attacks"]},
                    {"title": "Host File System Mount Escapes & Privilege Escalation", "youtube_search_query": "Container volume mount security risk host file system escape root", "subtopics": ["Mounting `/` or `/etc` into container risks", "Exploiting setuid binaries inside volume mounts", "Writable host sysfs (`/sys`) and procfs (`/proc`) attack vectors"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A security audit report demonstrating the exploit vector of a container mounted with `CAP_SYS_ADMIN` and detailing remediation steps.",
                    "what_counts_as_evidence": "Audit document showing simulated exploit execution log in a sandbox environment and hardened Docker run flags.",
                    "eval_criteria": ["Explains precise root cause mechanism of CAP_SYS_ADMIN privilege escalation", "Demonstrates vulnerability using safe demonstration steps", "Provides hardened `--cap-drop=ALL` mitigation command flag"]
                },
                "resources": [
                    {"title": "Docker Engine Security Documentation", "url": "https://docs.docker.com/engine/security/"},
                    {"title": "Linux Namespaces - Wikipedia", "url": "https://en.wikipedia.org/wiki/Linux_namespaces"}
                ]
            },
            {
                "title": "Hardening Container Runtimes",
                "topics": [
                    {"title": "Dropping Capabilities & Running as Non-Root User", "youtube_search_query": "Docker container hardening drop capabilities non-root user security", "subtopics": ["Configuring Dockerfile `USER 10001` directive", "Enforcing `--cap-drop=ALL --cap-add=NET_BIND_SERVICE`", "Read-only root filesystem (`--read-only`) configuration"]},
                    {"title": "Custom Seccomp Profiles & Syscall Filtering", "youtube_search_query": "Docker seccomp profile custom syscall filtering container security", "subtopics": ["Standard Docker default seccomp profile restrictions", "Generating custom seccomp JSON profiles via strace auditing", "Blocking dangerous syscalls (`ptrace`, `sys_admin`, `keyctl`)"]},
                    {"title": "AppArmor & SELinux Profiles for Docker Containers", "youtube_search_query": "AppArmor SELinux container profile security hardening docker", "subtopics": ["Enforcing AppArmor profiles (`docker-default`)", "SELinux mandatory access control (`s0:c1,c2` labels)", "Restricting container file access boundaries"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A hardened Dockerfile and `docker-run` invocation script incorporating non-root user, dropped capabilities, read-only root filesystem, and custom seccomp profile.",
                    "what_counts_as_evidence": "Command output from `docker inspect` confirming `CapDrop: [ALL]`, `ReadonlyRootfs: true`, and non-zero UID execution.",
                    "eval_criteria": ["Container runs under unprivileged UID", "Drops all Linux capabilities by default", "Configures temporary read-write directories strictly in memory (tmpfs)"]
                },
                "resources": [
                    {"title": "Docker Engine Security Documentation", "url": "https://docs.docker.com/engine/security/"},
                    {"title": "Linux Namespaces - Wikipedia", "url": "https://en.wikipedia.org/wiki/Linux_namespaces"}
                ]
            },
            {
                "title": "Image Scanning & Secure Build Pipelines",
                "topics": [
                    {"title": "Static Vulnerability Scanning with Trivy & Grype", "youtube_search_query": "Trivy Grype container image vulnerability scanner CI CD security", "subtopics": ["Scanning container base images for OS package CVEs", "Scanning application dependency lockfiles inside images", "Setting CVE severity thresholds for CI build failures"]},
                    {"title": "Building Minimal Distroless & Multi-Stage Images", "youtube_search_query": "Distroless container images multi stage build Dockerfile hardening", "subtopics": ["Multi-stage Dockerfile build pattern", "Using Google Distroless base images (`gcr.io/distroless/static`)", "Removing shell (`/bin/sh`) and package managers from runtime images"]},
                    {"title": "Signing Images & Enforcing Policies with Cosign", "youtube_search_query": "Cosign container image signing Sigstore Kyverno admission controller", "subtopics": ["Signing container OCI images with Cosign", "Storing signatures in public/private OCI registries", "Enforcing image signature validation in Kubernetes admission webhooks"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A multi-stage Dockerfile for a Go/Rust application producing a distroless runtime container, paired with a Trivy vulnerability scan report.",
                    "what_counts_as_evidence": "Trivy vulnerability report output showing 0 High and 0 Critical severity vulnerabilities in the final minimal image.",
                    "eval_criteria": ["Uses multi-stage build pattern to separate compiler from runtime", "Final runtime stage contains no shell or package manager", "Trivy scan confirms zero critical CVE vulnerabilities in target image"]
                },
                "resources": [
                    {"title": "Docker Engine Security Documentation", "url": "https://docs.docker.com/engine/security/"},
                    {"title": "Linux Namespaces - Wikipedia", "url": "https://en.wikipedia.org/wiki/Linux_namespaces"}
                ]
            }
        ]
    },
    # 11. Database Migration Strategies Without Downtime
    {
        "title": "Database Migration Strategies Without Downtime",
        "description": "Blue-green schemas and expand-contract patterns and shadow writes — the ops side no one teaches.",
        "subject": "Backend Engineers & DBAs",
        "modules_data": [
            {
                "title": "Expand-Contract (Parallel Change) Pattern",
                "topics": [
                    {"title": "Phase 1: Expanding Schemas without Breaking Old Code", "youtube_search_query": "Expand contract pattern database migration zero downtime phase 1 expand", "subtopics": ["Adding new columns as NULLable or with defaults", "Creating new tables alongside old schemas", "Maintaining backwards compatibility with active app versions"]},
                    {"title": "Phase 2: Dual Writing & Backfilling Data Safely", "youtube_search_query": "Dual writing backfilling data zero downtime database migration", "subtopics": ["Writing application logic to populate old and new columns", "Batch backfilling historical records in background tasks", "Rate-limiting backfill jobs to prevent database I/O saturation"]},
                    {"title": "Phase 3: Contracting Schemas & Cleaning Up Legacy Columns", "youtube_search_query": "Contract phase database migration removing old columns safely zero downtime", "subtopics": ["Switching read traffic to new schema fields", "Verifying zero traffic on legacy columns before dropping", "Safely dropping old columns and constraints"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A 3-phase migration script set (SQL + Python) implementing the Expand-Contract pattern to rename a column `full_name` to `first_name` and `last_name` without downtime.",
                    "what_counts_as_evidence": "Test execution log showing dual-writing phase successfully handling concurrent read/write queries during backfill execution.",
                    "eval_criteria": ["Phase 1 adds new columns without breaking legacy application reads", "Phase 2 backfill script operates in batched chunks with error retries", "Phase 3 safely removes old column only after verifying write cutover"]
                },
                "resources": [
                    {"title": "Schema Migration - Wikipedia", "url": "https://en.wikipedia.org/wiki/Schema_migration"},
                    {"title": "gh-ost GitHub Repository", "url": "https://github.com/github/gh-ost"}
                ]
            },
            {
                "title": "Non-Blocking DDL Operations",
                "topics": [
                    {"title": "Lock Escalation & Table Lock Modes in Postgres & MySQL", "youtube_search_query": "Postgres table locks ACCESS EXCLUSIVE lock escalation DDL migration", "subtopics": ["Understanding ACCESS EXCLUSIVE vs SHARE UPDATE EXCLUSIVE locks", "Lock queues and lock timeout safety settings (`lock_timeout`)", "Avoiding full table rewrites during DDL migrations"]},
                    {"title": "Creating Indexes Concurrently (CREATE INDEX CONCURRENTLY)", "youtube_search_query": "Postgres CREATE INDEX CONCURRENTLY zero downtime index creation", "subtopics": ["How concurrent index creation avoids table write locks", "Handling invalid index states after failed concurrent index attempts", "Monitoring index build progress via `pg_stat_progress_create_index`"]},
                    {"title": "Online Schema Change Tools (gh-ost, pt-online-schema-change)", "youtube_search_query": "gh-ost pt-online-schema-change MySQL zero downtime schema migration tool", "subtopics": ["Triggerless online schema change via binlog tailing (gh-ost)", "Ghost table creation and row copy phase", "Cut-over phase mechanics and safety checks"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python migration script wrapper that sets strict `lock_timeout` session variables before issuing DDL statements and handles lock acquisition failures gracefully.",
                    "what_counts_as_evidence": "Execution log showing script setting `SET lock_timeout = '2s'` and catching lock timeout exceptions when table is busy.",
                    "eval_criteria": ["Sets lock_timeout on database connection before executing DDL", "Uses CREATE INDEX CONCURRENTLY for index additions", "Retries DDL execution with exponential backoff on lock timeout"]
                },
                "resources": [
                    {"title": "Schema Migration - Wikipedia", "url": "https://en.wikipedia.org/wiki/Schema_migration"},
                    {"title": "gh-ost GitHub Repository", "url": "https://github.com/github/gh-ost"}
                ]
            },
            {
                "title": "Shadow Writing & Dual Reads",
                "topics": [
                    {"title": "Implementing Application-Level Shadow Writes", "youtube_search_query": "Application shadow writes dual writes database migration architecture", "subtopics": ["Executing secondary writes asynchronously via background queues", "Swallowing shadow write errors to protect primary path", "Monitoring shadow write latency and error rates"]},
                    {"title": "Asynchronous Data Verification & Reconciliation Scripts", "youtube_search_query": "Data reconciliation script checksum comparison database migration validation", "subtopics": ["Comparing primary and shadow data records using cryptographic hashes", "Detecting row discrepancies during active dual writing", "Automated repair scripts for fixing inconsistent rows"]},
                    {"title": "Feature Flags for Zero-Downtime Rollouts & Rollbacks", "youtube_search_query": "Feature flags database migration rollout switch rollback strategy", "subtopics": ["Dynamic feature flags (Read-Old / Read-New / Write-Both)", "Incremental percentage rollouts of new schema reads", "Instant fallback mechanisms if new schema exhibits errors"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python data verification script that asynchronously compares records across primary and shadow tables and outputs a discrepancy report.",
                    "what_counts_as_evidence": "Console log showing comparison of 10,000 rows with 0 mismatch reports and highlighting simulated corrupt records.",
                    "eval_criteria": ["Queries primary and target tables in chunked ID ranges", "Computes row-level hash comparisons efficiently", "Reports detailed column mismatches for reconciliation"]
                },
                "resources": [
                    {"title": "Schema Migration - Wikipedia", "url": "https://en.wikipedia.org/wiki/Schema_migration"},
                    {"title": "gh-ost GitHub Repository", "url": "https://github.com/github/gh-ost"}
                ]
            },
            {
                "title": "Large-Scale Table Refactoring & Data Partitioning",
                "topics": [
                    {"title": "Migrating Large Tables via Logical Replication", "youtube_search_query": "Postgres logical replication table migration zero downtime CDC", "subtopics": ["Setting up logical replication publication and subscription", "Initial data copy phase vs continuous WAL stream replication", "Switching application connection strings during cutover"]},
                    {"title": "Zero-Downtime Primary Key Migration Strategies", "youtube_search_query": "Migrating primary key integer to UUID BIGINT zero downtime database", "subtopics": ["Transitioning integer auto-increment IDs to UUID or BIGINT", "Updating foreign key constraints across child tables", "Handling sequence updates and identity columns"]},
                    {"title": "Managing Foreign Keys & Triggers During Migrations", "youtube_search_query": "Database triggers foreign keys migration zero downtime performance impact", "subtopics": ["NOT VALID foreign key constraint creation (`ADD CONSTRAINT ... NOT VALID`)", "Validating constraints concurrently (`VALIDATE CONSTRAINT`)", "Performance cost of triggers during high-throughput migrations"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Postgres SQL migration playbook adding a foreign key constraint using `NOT VALID` followed by asynchronous `VALIDATE CONSTRAINT` execution.",
                    "what_counts_as_evidence": "Postgres `pg_stat_activity` query log confirming zero table locks blocking concurrent INSERT statements during validation.",
                    "eval_criteria": ["Splits FK addition into ADD CONSTRAINT ... NOT VALID and VALIDATE CONSTRAINT", "Verifies non-blocking behavior on live table writes", "Confirms constraint enforcement passes on existing data"]
                },
                "resources": [
                    {"title": "Schema Migration - Wikipedia", "url": "https://en.wikipedia.org/wiki/Schema_migration"},
                    {"title": "gh-ost GitHub Repository", "url": "https://github.com/github/gh-ost"}
                ]
            }
        ]
    },
    # 12. Compiler Optimization Passes (SSA & Dead Code Elimination)
    {
        "title": "Compiler Optimization Passes (SSA & Dead Code Elimination)",
        "description": "Understanding how compilers optimize your code changes how you write it.",
        "subject": "Systems Programmers & Performance Engineers",
        "modules_data": [
            {
                "title": "Intermediate Representations (IR) & Control Flow Graphs",
                "topics": [
                    {"title": "Abstract Syntax Trees to Linear & Quadruple IR", "youtube_search_query": "Compiler intermediate representation IR quadruples triples 3-address code", "subtopics": ["Three-Address Code (TAC) representation", "Linear IR vs Tree IR vs Graph IR", "Lowering AST nodes into TAC instructions"]},
                    {"title": "Basic Blocks & Control Flow Graph (CFG) Construction", "youtube_search_query": "Control Flow Graph CFG basic blocks compiler construction tutorial", "subtopics": ["Identifying basic block leaders and terminators", "Constructing directed CFG edges for jumps and branches", "Traversing CFGs in reverse post-order"]},
                    {"title": "Dominator Trees & Dominance Frontiers", "youtube_search_query": "Dominator tree dominance frontier Lengauer-Tarjan algorithm CFG compiler", "subtopics": ["Strict dominance and immediate dominators (idom)", "Computing dominance frontiers for CFG nodes", "Constructing dominator trees using Lengauer-Tarjan algorithm"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python program that parses linear 3-Address Code instructions into Basic Blocks and builds a Control Flow Graph (CFG) visualizable in Graphviz DOT format.",
                    "what_counts_as_evidence": "Graphviz DOT output file rendering basic block nodes and conditional/unconditional branch edges.",
                    "eval_criteria": ["Identifies basic block leaders accurately", "Links basic blocks with directed edges matching branch targets", "Generates valid DOT syntax representing control flow"]
                },
                "resources": [
                    {"title": "Static Single-Assignment Form - Wikipedia", "url": "https://en.wikipedia.org/wiki/Static_single-assignment_form"},
                    {"title": "LLVM Documentation", "url": "https://llvm.org/docs/"}
                ]
            },
            {
                "title": "Static Single Assignment (SSA) Form",
                "topics": [
                    {"title": "SSA Form Invariants & Phi Node (\\phi) Insertion", "youtube_search_query": "Static Single Assignment SSA form phi node phi function compiler pass", "subtopics": ["Single assignment property (every variable assigned exactly once)", "Placing Phi (\\phi) functions at join points in CFG", "Dominance frontier criterion for phi placement"]},
                    {"title": "Converting CFGs to Minimal SSA Form", "youtube_search_query": "Cytron algorithm minimal SSA form conversion compiler pass tutorial", "subtopics": ["Cytron et al. SSA placement algorithm", "Computing iterated dominance frontiers ($DF^+$)", "Renaming variable versions systematically"]},
                    {"title": "Variable Renaming & SSA Destruction Algorithms", "youtube_search_query": "Variable renaming SSA destruction out-of-SSA pass copy insertion compiler", "subtopics": ["Renaming stack maintenance during dominator tree traversal", "De-SSA / SSA Destruction pass for target code gen", "Resolving lost-copy and swap problems during De-SSA"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python module implementing SSA Phi-node placement over a Control Flow Graph using iterated dominance frontiers.",
                    "what_counts_as_evidence": "Console log showing input IR variables converted to SSA versioned names (e.g. `x1`, `x2`) and \\phi-nodes placed at join blocks.",
                    "eval_criteria": ["Places Phi nodes at CFG join points belonging to dominance frontier", "Renames all variable assignments to unique versioned identifiers", "Preserves single-assignment invariant across all basic blocks"]
                },
                "resources": [
                    {"title": "Static Single-Assignment Form - Wikipedia", "url": "https://en.wikipedia.org/wiki/Static_single-assignment_form"},
                    {"title": "LLVM Documentation", "url": "https://llvm.org/docs/"}
                ]
            },
            {
                "title": "Classic Optimization Passes",
                "topics": [
                    {"title": "Sparse Conditional Constant Propagation (SCCP)", "youtube_search_query": "Sparse Conditional Constant Propagation SCCP compiler optimization pass", "subtopics": ["Combining constant propagation and dead branch elimination", "SSA worklist algorithm maintaining lattice values (Top, Constant, Bottom)", "Evaluating conditional branches with constant operands"]},
                    {"title": "Dead Code Elimination (DCE) & Aggressive DCE", "youtube_search_query": "Dead Code Elimination DCE ADCE compiler optimization pass SSA", "subtopics": ["Trivial Dead Code Elimination via reference counts", "Aggressive DCE (ADCE) assuming instructions are dead unless marked live", "Eliminating unused basic blocks and unreachable code"]},
                    {"title": "Common Subexpression Elimination (CSE) & Value Numbering", "youtube_search_query": "Common Subexpression Elimination CSE Value Numbering GVN compiler", "subtopics": ["Local Value Numbering (LVN) within basic blocks", "Global Value Numbering (GVN) across SSA dominator trees", "Replacing redundant expressions with existing value numbers"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python optimization pass implementing Dead Code Elimination (DCE) on SSA IR code.",
                    "what_counts_as_evidence": "IR output log showing unreferenced variable assignments and unused instructions removed from input IR.",
                    "eval_criteria": ["Identifies instructions whose left-hand-side variables have zero uses", "Iteratively sweeps dependent dead instructions", "Preserves instructions producing side-effects (e.g. return, I/O)"]
                },
                "resources": [
                    {"title": "Static Single-Assignment Form - Wikipedia", "url": "https://en.wikipedia.org/wiki/Static_single-assignment_form"},
                    {"title": "LLVM Documentation", "url": "https://llvm.org/docs/"}
                ]
            },
            {
                "title": "Loop Optimizations & Code Generation",
                "topics": [
                    {"title": "Loop Invariant Code Motion (LICM) & Induction Variables", "youtube_search_query": "Loop Invariant Code Motion LICM induction variable optimization compiler", "subtopics": ["Detecting loop natural boundaries and pre-headers", "Identifying loop-invariant instructions", "Hoisting invariant instructions to loop pre-header"]},
                    {"title": "Loop Unrolling & Vectorization Analysis", "youtube_search_query": "Loop unrolling vectorization SIMD compiler optimization analysis", "subtopics": ["Unrolling loops by fixed factors to reduce branch overhead", "Data dependence analysis (flow, anti, output dependencies)", "Auto-vectorization conditions for SIMD instructions"]},
                    {"title": "Register Allocation via Graph Coloring in SSA", "youtube_search_query": "Register allocation graph coloring Chaitin Briggs algorithm compiler", "subtopics": ["Interference graph construction from live ranges", "Chaitin-Briggs K-coloring register allocation algorithm", "Register spilling strategies for memory allocation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python compiler pass performing Loop Invariant Code Motion (LICM) by hoisting invariant calculations outside of CFG loop bodies.",
                    "what_counts_as_evidence": "IR transformation log confirming invariant instruction moved into pre-header basic block prior to loop execution.",
                    "eval_criteria": ["Detects loop natural header and latch blocks", "Identifies instructions whose operands are constant or defined outside loop", "Moves invariant instructions to loop pre-header cleanly"]
                },
                "resources": [
                    {"title": "Static Single-Assignment Form - Wikipedia", "url": "https://en.wikipedia.org/wiki/Static_single-assignment_form"},
                    {"title": "LLVM Documentation", "url": "https://llvm.org/docs/"}
                ]
            }
        ]
    },
    # 13. Building a Search Engine: Inverted Indexes & TF-IDF
    {
        "title": "Building a Search Engine: Inverted Indexes & TF-IDF",
        "description": "The fundamentals behind Elasticsearch and Meilisearch — built from first principles.",
        "subject": "Backend Engineers & Information Retrieval Students",
        "modules_data": [
            {
                "title": "Document Processing, Tokenization & Stemming",
                "topics": [
                    {"title": "Text Tokenization, Lowercasing & Stopword Filtering", "youtube_search_query": "Text tokenization stopword filtering search engine document processing", "subtopics": ["Regex tokenizers and word boundary splitting", "Standard English stopword removal tradeoff analysis", "Handling punctuation, URLs, and special characters"]},
                    {"title": "Stemming Algorithms (Porter Stemmer) & Lemmatization", "youtube_search_query": "Porter Stemmer algorithm lemmatization search engine text analysis", "subtopics": ["Porter Stemmer rule-based suffix stripping", "Lemmatization using vocabulary and morphological dictionary analysis", "Stemming normalization effects on search recall vs precision"]},
                    {"title": "Building N-gram Tokenizers for Substring Search", "youtube_search_query": "N-gram tokenization character n-grams search engine autocomplete substring", "subtopics": ["Character n-grams for fuzzy matching and autocomplete", "Word n-grams for phrase matching", "Managing index size expansion from n-gram indexing"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python text processing pipeline class that tokenizes, lowercases, filters stopwords, and applies Porter Stemming to arbitrary text documents.",
                    "what_counts_as_evidence": "Unit test output displaying raw input sentences converted into normalized token arrays.",
                    "eval_criteria": ["Tokenizes text accurately stripping punctuation", "Filters out common English stopwords", "Stems tokens down to base morphological roots"]
                },
                "resources": [
                    {"title": "Inverted Index - Wikipedia", "url": "https://en.wikipedia.org/wiki/Inverted_index"},
                    {"title": "TF-IDF - Wikipedia", "url": "https://en.wikipedia.org/wiki/Tf%E2%80%93idf"}
                ]
            },
            {
                "title": "Inverted Index Architecture & Postings Lists",
                "topics": [
                    {"title": "Inverted Index Structure & Dictionary Topologies", "youtube_search_query": "Inverted index architecture postings list dictionary search engine tutorial", "subtopics": ["Mapping terms to ordered postings lists of document IDs", "Dictionary implementations: Hashmaps vs Trie vs B-Trees", "Memory layouts for high-performance inverted indexes"]},
                    {"title": "Postings List Compression (Delta Encoding & Varint)", "youtube_search_query": "Postings list compression delta encoding variable byte varint search engine", "subtopics": ["Delta encoding (storing d-gaps between sorted doc IDs)", "Variable Byte (Varint) integer encoding", "Elias-Gamma and Frame-of-Reference (FOR) compression algorithms"]},
                    {"title": "Intersection & Union Query Execution on Postings Lists", "youtube_search_query": "Postings list intersection query processing boolean AND OR search engine", "subtopics": ["Two-pointer sorted list intersection algorithm (Boolean AND)", "Skip pointer optimization for fast postings list traversal", "Union (Boolean OR) processing algorithms"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python Inverted Index class supporting document insertion and Boolean AND/OR query execution over compressed postings lists.",
                    "what_counts_as_evidence": "Search query test log returning correct matching document IDs for queries like 'python AND algorithm'.",
                    "eval_criteria": ["Maintains sorted postings lists per term", "Implements O(N+M) two-pointer list intersection algorithm", "Encodes postings list integers using delta gap encoding"]
                },
                "resources": [
                    {"title": "Inverted Index - Wikipedia", "url": "https://en.wikipedia.org/wiki/Inverted_index"},
                    {"title": "TF-IDF - Wikipedia", "url": "https://en.wikipedia.org/wiki/Tf%E2%80%93idf"}
                ]
            },
            {
                "title": "Relevance Scoring with TF-IDF & Okapi BM25",
                "topics": [
                    {"title": "Term Frequency (TF) & Inverse Document Frequency (IDF) Math", "youtube_search_query": "TF-IDF mathematical calculation term frequency inverse document frequency tutorial", "subtopics": ["Term Frequency formula (raw count vs log-normalized)", "Inverse Document Frequency formula (\\log(N/df))", "Computing vector space representations of documents"]},
                    {"title": "Vector Space Model & Cosine Similarity Scoring", "youtube_search_query": "Vector space model cosine similarity search relevance scoring tutorial", "subtopics": ["Representing documents and queries as high-dimensional vectors", "Calculating Cosine Similarity angle dot product", "Normalizing document lengths to prevent long-document bias"]},
                    {"title": "Okapi BM25 Scoring Formula & Document Length Normalization", "youtube_search_query": "Okapi BM25 scoring algorithm formula search engine ranking tutorial", "subtopics": ["BM25 term saturation parameter ($k_1$)", "Document length normalization parameter ($b$)", "Comparing BM25 precision vs standard TF-IDF"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python search relevance ranker calculating Okapi BM25 scores for a query across a corpus of documents.",
                    "what_counts_as_evidence": "Search result output ranking document matches by descending BM25 score with score breakdowns displayed.",
                    "eval_criteria": ["Calculates average document length across corpus", "Applies Okapi BM25 formula with standard k1=1.2 and b=0.75 parameters", "Sorts matching documents accurately by relevance score"]
                },
                "resources": [
                    {"title": "Inverted Index - Wikipedia", "url": "https://en.wikipedia.org/wiki/Inverted_index"},
                    {"title": "TF-IDF - Wikipedia", "url": "https://en.wikipedia.org/wiki/Tf%E2%80%93idf"}
                ]
            },
            {
                "title": "Index Updates, Positional Search & Evaluation",
                "topics": [
                    {"title": "Positional Postings Lists & Phrase Queries", "youtube_search_query": "Positional postings list phrase search exact match search engine tutorial", "subtopics": ["Storing term positions inside postings entries", "Executing exact phrase queries (e.g. 'machine learning')", "Slop / Proximity search algorithm for nearby terms"]},
                    {"title": "In-Memory Buffers (RAM Buffer) & Segment Merging (LSM Style)", "youtube_search_query": "Lucene segment merging RAM buffer LSM tree search engine architecture", "subtopics": ["Writing doc updates to in-memory buffers (MemTable)", "Flushing immutable segment files to disk", "Background segment merge policies (Log-Structured Merge style)"]},
                    {"title": "Search Quality Metrics: Precision@K, Recall, MAP & NDCG", "youtube_search_query": "Information retrieval evaluation metrics Precision Recall MAP NDCG tutorial", "subtopics": ["Calculating Precision@K and Recall@K", "Mean Average Precision (MAP) math", "Normalized Discounted Cumulative Gain (NDCG) relevance metric"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An inverted index extension supporting positional postings and exact phrase queries.",
                    "what_counts_as_evidence": "Test query output confirming exact match for phrase 'distributed systems' while rejecting documents containing the words out of order.",
                    "eval_criteria": ["Stores positional offsets for each term occurrence in postings", "Validates consecutive position indices during phrase query evaluation", "Returns correct matching documents for positional proximity queries"]
                },
                "resources": [
                    {"title": "Inverted Index - Wikipedia", "url": "https://en.wikipedia.org/wiki/Inverted_index"},
                    {"title": "TF-IDF - Wikipedia", "url": "https://en.wikipedia.org/wiki/Tf%E2%80%93idf"}
                ]
            }
        ]
    }
]

async def seed():
    supabase = get_supabase_client()
    print("Starting batch 4 (seed_batch_6) seeding for 13 courses...")
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
    print(f"Batch 4 Seeding Summary: {len(inserted_records)} / {len(courses_info)} courses inserted.")
    for rec in inserted_records:
        print(f"  - ID: {rec['id']} | Title: {rec['title']}")
    print("============================================================\n")
    return inserted_records

if __name__ == "__main__":
    asyncio.run(seed())
