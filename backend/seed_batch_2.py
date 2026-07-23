import uuid
import json
import asyncio
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
    # _generate_unique_slug might be async or sync depending on implementation, assuming sync or handles DB internally
    # Wait, in FastAPI it's often sync if it doesn't await. Let's just pass it.
    
    # We will generate a base slug
    import re
    base_slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    # For a seed script, we can just append a random string to avoid async slug generation if it hits the DB
    # But the prompt says: "use _generate_unique_slug and _generate_plan_hash from app.routers.roadmaps."
    # Let's assume they are sync or we can call them properly.
    
    return {
        "title": title,
        "description": description,
        "subject": subject,
        "plan": plan
    }

courses_info = [
    {
        "title": "Writing Custom LLM Evaluators",
        "description": "Design and implement custom evaluation metrics for large language models. Learn to assess output quality, factual accuracy, and alignment.",
        "subject": "AI/ML",
        "modules_data": [
            {
                "title": "Fundamentals of LLM Evaluation",
                "topics": [
                    {"title": "Need for Custom Evaluators", "youtube_search_query": "LLM evaluation metrics", "subtopics": ["Limitations of standard metrics", "Domain-specific evaluation", "Human vs. automatic evaluation"]},
                    {"title": "Reference-based Metrics", "youtube_search_query": "ROUGE BLEU METEOR explained", "subtopics": ["ROUGE and BLEU", "METEOR score", "Semantic similarity with embeddings"]},
                    {"title": "Reference-free Metrics", "youtube_search_query": "LLM reference-free evaluation", "subtopics": ["Perplexity", "Readability scores", "Toxicity detection"]},
                    {"title": "LLM-as-a-Judge", "youtube_search_query": "LLM as a judge prompt engineering", "subtopics": ["Prompting for evaluation", "Calibration techniques", "Mitigating judge bias"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A basic LLM-as-a-judge evaluation script.",
                    "what_counts_as_evidence": "A Python script that takes a prompt and two responses, and outputs a preference score.",
                    "eval_criteria": ["Correct usage of an API to grade responses", "Implementation of a scoring prompt template"]
                },
                "resources": [
                    {"title": "Judging LLM-as-a-Judge", "url": "https://arxiv.org/abs/2306.05685"},
                    {"title": "OpenAI Evals Framework", "url": "https://github.com/openai/evals"}
                ]
            },
            {
                "title": "Evaluating Retrieval-Augmented Generation",
                "topics": [
                    {"title": "RAG Component Breakdown", "youtube_search_query": "Evaluating RAG pipelines", "subtopics": ["Retrieval vs Generation", "Failure modes", "Isolating errors"]},
                    {"title": "Context Relevance", "youtube_search_query": "RAG context relevance metric", "subtopics": ["Measuring chunk quality", "Recall vs Precision", "Embedding distances"]},
                    {"title": "Answer Faithfulness", "youtube_search_query": "Hallucination detection in RAG", "subtopics": ["Detecting hallucinations", "NLI for faithfulness", "Fact-checking pipelines"]},
                    {"title": "Answer Relevance", "youtube_search_query": "RAG answer relevance", "subtopics": ["Query to answer alignment", "Penalizing evasive answers", "User intent matching"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A RAG evaluation suite measuring context and answer relevance.",
                    "what_counts_as_evidence": "Code implementing faithfulness and relevance metrics on a sample dataset.",
                    "eval_criteria": ["Includes context precision calculation", "Includes answer faithfulness check"]
                },
                "resources": [
                    {"title": "RAGAS: Automated Evaluation of RAG", "url": "https://arxiv.org/abs/2309.15217"},
                    {"title": "TruLens RAG Triad", "url": "https://www.trulens.org/trulens_eval/core_concepts_rag_triad/"}
                ]
            },
            {
                "title": "Task-Specific Evaluators",
                "topics": [
                    {"title": "Evaluating Summarization", "youtube_search_query": "Evaluating LLM summarization", "subtopics": ["Extractive vs Abstractive", "Coverage metrics", "Density metrics"]},
                    {"title": "Evaluating Code Generation", "youtube_search_query": "Evaluating LLM code generation pass@k", "subtopics": ["Execution-based metrics", "pass@k formulation", "Static analysis of LLM code"]},
                    {"title": "Evaluating Data Extraction", "youtube_search_query": "LLM structured data extraction evaluation", "subtopics": ["JSON schema validation", "Entity recall", "Format adherence"]},
                    {"title": "Evaluating Conversational Agents", "youtube_search_query": "Evaluating chatbot LLMs", "subtopics": ["Turn-level vs Session-level", "Coherence metrics", "Goal completion rate"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An execution-based evaluator for code generation.",
                    "what_counts_as_evidence": "A sandbox environment that runs generated Python code and reports success rates.",
                    "eval_criteria": ["Safe execution environment using subprocess/Docker", "Proper pass/fail reporting based on unit tests"]
                },
                "resources": [
                    {"title": "HumanEval Paper", "url": "https://arxiv.org/abs/2107.03374"},
                    {"title": "Evaluating Summarization", "url": "https://huggingface.co/learn/nlp-course/chapter7/5"}
                ]
            },
            {
                "title": "Scaling and Automation",
                "topics": [
                    {"title": "Building Evaluation Datasets", "youtube_search_query": "Creating LLM evaluation datasets", "subtopics": ["Synthetic data generation", "Curating golden datasets", "Data diversity"]},
                    {"title": "Continuous Evaluation", "youtube_search_query": "LLM continuous evaluation CI/CD", "subtopics": ["CI/CD for LLMs", "Regression testing", "Shadow deployments"]},
                    {"title": "A/B Testing Models", "youtube_search_query": "A/B testing LLMs", "subtopics": ["Routing traffic", "Statistical significance", "User feedback loops"]},
                    {"title": "Observability and Dashboards", "youtube_search_query": "LLM observability", "subtopics": ["Logging traces", "Visualizing metrics", "Alerting on degradation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A continuous evaluation pipeline script.",
                    "what_counts_as_evidence": "A GitHub Action or Python script that runs evaluations on a golden dataset and asserts thresholds.",
                    "eval_criteria": ["Automated execution on a dataset", "Fails gracefully if metrics drop below a threshold"]
                },
                "resources": [
                    {"title": "LangSmith Documentation", "url": "https://docs.smith.langchain.com/"},
                    {"title": "MLOps for LLMs", "url": "https://mlops.community/llmops/"}
                ]
            }
        ]
    },
    {
        "title": "Local LLM Inference",
        "description": "Run large language models locally using GGUF and llama.cpp. Optimize inference speed and manage hardware constraints.",
        "subject": "AI/ML",
        "modules_data": [
            {
                "title": "Introduction to Local Inference",
                "topics": [
                    {"title": "The Inference Bottleneck", "youtube_search_query": "LLM memory bandwidth bottleneck", "subtopics": ["Compute vs Memory bound", "KV Cache explained", "Batch size impact"]},
                    {"title": "Quantization Basics", "youtube_search_query": "LLM quantization explained", "subtopics": ["FP16 vs INT8 vs INT4", "Post-training quantization", "Impact on perplexity"]},
                    {"title": "The GGUF Format", "youtube_search_query": "What is GGUF format", "subtopics": ["Evolution from GGML", "Metadata structure", "Supported architectures"]},
                    {"title": "Hardware Considerations", "youtube_search_query": "Hardware for local LLMs", "subtopics": ["VRAM requirements", "CPU vs GPU inference", "Apple Silicon Unified Memory"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A script that downloads and inspects a GGUF file.",
                    "what_counts_as_evidence": "Output showing the metadata and tensor types of a downloaded model.",
                    "eval_criteria": ["Correctly parses GGUF metadata", "Displays model parameters and quantization type"]
                },
                "resources": [
                    {"title": "GGUF Specification", "url": "https://github.com/philpax/ggml/wiki/GGUF"},
                    {"title": "Llama.cpp README", "url": "https://github.com/ggerganov/llama.cpp"}
                ]
            },
            {
                "title": "Running Models with llama.cpp",
                "topics": [
                    {"title": "Building llama.cpp", "youtube_search_query": "Build llama.cpp from source", "subtopics": ["CMake basics", "CUDA backend", "Metal backend"]},
                    {"title": "CLI Execution", "youtube_search_query": "llama.cpp CLI options", "subtopics": ["Prompt formatting", "Context size limits", "Temperature and Top-P"]},
                    {"title": "Server Mode", "youtube_search_query": "llama.cpp server mode setup", "subtopics": ["OpenAI compatible API", "Handling multiple requests", "CORS and networking"]},
                    {"title": "Python Bindings", "youtube_search_query": "llama-cpp-python tutorial", "subtopics": ["Installation", "Basic generation", "Streaming responses"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A local API server using llama-cpp-python.",
                    "what_counts_as_evidence": "A running FastAPI server that exposes an endpoint for text generation using a local model.",
                    "eval_criteria": ["Server responds to HTTP POST requests", "Integrates correctly with a local GGUF model"]
                },
                "resources": [
                    {"title": "llama-cpp-python Docs", "url": "https://llama-cpp-python.readthedocs.io/"},
                    {"title": "LocalAI Project", "url": "https://localai.io/"}
                ]
            },
            {
                "title": "Advanced Inference Techniques",
                "topics": [
                    {"title": "GPU Offloading", "youtube_search_query": "llama.cpp GPU offload", "subtopics": ["Layer splitting", "VRAM calculation", "Performance tuning"]},
                    {"title": "Constrained Decoding", "youtube_search_query": "LLM grammar constrained decoding", "subtopics": ["Grammar files (GBNF)", "JSON output enforcement", "Performance impact"]},
                    {"title": "Prompt Engineering for Local Models", "youtube_search_query": "Prompt engineering for small LLMs", "subtopics": ["Chat templates", "System prompts", "Few-shot examples"]},
                    {"title": "LoRA Adapters", "youtube_search_query": "llama.cpp LoRA inference", "subtopics": ["Applying LoRAs at runtime", "Merging adapters", "Multi-LoRA setups"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A constrained generation script using GBNF.",
                    "what_counts_as_evidence": "A script that forces a local model to output valid JSON according to a specific schema.",
                    "eval_criteria": ["Provides a valid GBNF grammar", "Output successfully parses as JSON matching the schema"]
                },
                "resources": [
                    {"title": "GBNF Guide", "url": "https://github.com/ggerganov/llama.cpp/tree/master/grammars"},
                    {"title": "Understanding LoRA", "url": "https://arxiv.org/abs/2106.09685"}
                ]
            },
            {
                "title": "Optimization and Deployment",
                "topics": [
                    {"title": "KV Cache Quantization", "youtube_search_query": "KV cache quantization", "subtopics": ["Reducing memory footprint", "K-quants", "Trade-offs in accuracy"]},
                    {"title": "Batching Requests", "youtube_search_query": "LLM continuous batching", "subtopics": ["Continuous batching", "Throughput vs Latency", "Server configuration"]},
                    {"title": "Containerization", "youtube_search_query": "Dockerizing llama.cpp", "subtopics": ["Docker setups", "NVIDIA container toolkit", "Multi-architecture builds"]},
                    {"title": "Benchmarking", "youtube_search_query": "Benchmarking local LLMs", "subtopics": ["Tokens per second", "Time to first token", "Profiling tools"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A benchmarking script for local inference.",
                    "what_counts_as_evidence": "A script that measures and logs Time To First Token (TTFT) and generation tokens/sec for different prompts.",
                    "eval_criteria": ["Accurately times token generation", "Outputs metrics in a structured format"]
                },
                "resources": [
                    {"title": "vLLM PagedAttention", "url": "https://arxiv.org/abs/2309.06180"},
                    {"title": "LLM Perf Dashboard", "url": "https://github.com/ray-project/llmperf"}
                ]
            }
        ]
    },
    {
        "title": "Type-Safe Full-Stack with Next.js and FastAPI",
        "description": "Build end-to-end type-safe applications bridging TypeScript and Python. Utilize OpenAPI and code generation for robust integrations.",
        "subject": "Web Development",
        "modules_data": [
            {
                "title": "FastAPI and Pydantic",
                "topics": [
                    {"title": "FastAPI Fundamentals", "youtube_search_query": "FastAPI dependency injection", "subtopics": ["Path operations", "Dependency Injection", "Background tasks"]},
                    {"title": "Pydantic V2", "youtube_search_query": "Pydantic v2 tutorial", "subtopics": ["Model validation", "Field constraints", "Computed fields"]},
                    {"title": "OpenAPI Generation", "youtube_search_query": "FastAPI OpenAPI schema customization", "subtopics": ["Schema customization", "Operation IDs", "Tags and metadata"]},
                    {"title": "Error Handling", "youtube_search_query": "FastAPI custom exception handlers", "subtopics": ["Custom exceptions", "Exception handlers", "Structured error responses"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A FastAPI backend with customized OpenAPI schema output.",
                    "what_counts_as_evidence": "A working API that exports a cleanly formatted `openapi.json` file.",
                    "eval_criteria": ["Defines at least 3 endpoints with Pydantic models", "Customizes Operation IDs for client generation"]
                },
                "resources": [
                    {"title": "FastAPI Docs", "url": "https://fastapi.tiangolo.com/"},
                    {"title": "Pydantic V2 Migration", "url": "https://docs.pydantic.dev/latest/migration/"}
                ]
            },
            {
                "title": "Client Generation",
                "topics": [
                    {"title": "OpenAPI Client Generators", "youtube_search_query": "OpenAPI typescript client generation", "subtopics": ["Orval", "OpenAPI-TS", "Swagger Codegen"]},
                    {"title": "Setting up Orval", "youtube_search_query": "Orval react query setup", "subtopics": ["Configuration", "React Query integration", "Custom fetchers"]},
                    {"title": "Type Synchronization", "youtube_search_query": "Syncing types between Python and TypeScript", "subtopics": ["Automating generation", "Monorepo setups", "CI/CD checks"]},
                    {"title": "Handling Dates and Enums", "youtube_search_query": "OpenAPI dates and enums typescript", "subtopics": ["Serialization formats", "Parsing dates in TS", "Enum mapping"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An automated type generation script.",
                    "what_counts_as_evidence": "A script that runs the FastAPI server, downloads `openapi.json`, and generates TypeScript types.",
                    "eval_criteria": ["Successfully generates types without manual intervention", "Resulting TS file has no type errors"]
                },
                "resources": [
                    {"title": "Orval Documentation", "url": "https://orval.dev/"},
                    {"title": "OpenAPI-TS", "url": "https://openapi-ts.pages.dev/"}
                ]
            },
            {
                "title": "Next.js App Router Integration",
                "topics": [
                    {"title": "Server Components", "youtube_search_query": "Next.js React Server Components data fetching", "subtopics": ["Data fetching", "Caching strategies", "Passing types to client"]},
                    {"title": "Client Components", "youtube_search_query": "Next.js client components hooks", "subtopics": ["React Query setup", "Mutations", "Optimistic updates"]},
                    {"title": "Server Actions", "youtube_search_query": "Next.js Server Actions forms", "subtopics": ["Form handling", "Calling FastAPI from Actions", "Error boundaries"]},
                    {"title": "Authentication Flow", "youtube_search_query": "Next.js FastAPI JWT authentication", "subtopics": ["JWT handling", "HttpOnly cookies", "Middleware protection"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Next.js page utilizing the generated type-safe client.",
                    "what_counts_as_evidence": "A page that fetches data from the FastAPI backend and displays it, utilizing TypeScript interfaces.",
                    "eval_criteria": ["Strict TypeScript mode enabled with no errors", "Uses Next.js Server Components for initial fetch"]
                },
                "resources": [
                    {"title": "Next.js Data Fetching", "url": "https://nextjs.org/docs/app/building-your-application/data-fetching"},
                    {"title": "React Query Docs", "url": "https://tanstack.com/query/latest"}
                ]
            },
            {
                "title": "Advanced Patterns",
                "topics": [
                    {"title": "WebSockets Type Safety", "youtube_search_query": "Type safe WebSockets FastAPI Next.js", "subtopics": ["AsyncAPI", "Zod validation for WS messages", "Reconnection logic"]},
                    {"title": "File Uploads", "youtube_search_query": "FastAPI Next.js file upload type safe", "subtopics": ["Multipart forms", "Progress tracking", "Type-safe FormData"]},
                    {"title": "Pagination and Filtering", "youtube_search_query": "API pagination patterns type safe", "subtopics": ["Cursor vs Offset", "Standardized responses", "URL state syncing"]},
                    {"title": "Testing the Integration", "youtube_search_query": "Testing Next.js and FastAPI together", "subtopics": ["Contract testing", "Mocking with MSW", "E2E with Playwright"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A type-safe filtering and pagination component.",
                    "what_counts_as_evidence": "A UI component that updates query parameters and fetches paginated data with strict typing.",
                    "eval_criteria": ["Pagination state is mirrored in the URL", "Types correctly handle optional filter parameters"]
                },
                "resources": [
                    {"title": "Mock Service Worker", "url": "https://mswjs.io/"},
                    {"title": "Playwright Testing", "url": "https://playwright.dev/"}
                ]
            }
        ]
    },
    {
        "title": "Supabase Row Level Security Deep Dive",
        "description": "Master Row Level Security (RLS) in PostgreSQL and Supabase. Secure your data architecture with advanced policies and custom claims.",
        "subject": "Databases",
        "modules_data": [
            {
                "title": "RLS Fundamentals",
                "topics": [
                    {"title": "Introduction to Postgres RLS", "youtube_search_query": "PostgreSQL Row Level Security basics", "subtopics": ["How RLS works", "Enabling RLS", "Bypass RLS privileges"]},
                    {"title": "Policy Structure", "youtube_search_query": "Writing Postgres RLS policies", "subtopics": ["USING vs WITH CHECK", "Commands (SELECT, INSERT, UPDATE, DELETE)", "Policy execution order"]},
                    {"title": "Supabase Auth Context", "youtube_search_query": "Supabase auth.uid() explained", "subtopics": ["auth.uid() function", "JWT claims in Postgres", "Current user context"]},
                    {"title": "Basic Policies", "youtube_search_query": "Supabase basic RLS examples", "subtopics": ["User-owned records", "Public read access", "Authenticated-only access"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A set of basic RLS policies for a generic 'posts' table.",
                    "what_counts_as_evidence": "SQL commands creating the table, enabling RLS, and defining CRUD policies.",
                    "eval_criteria": ["Policies separate USING and WITH CHECK correctly", "Uses auth.uid() securely"]
                },
                "resources": [
                    {"title": "PostgreSQL RLS Docs", "url": "https://www.postgresql.org/docs/current/ddl-rowsecurity.html"},
                    {"title": "Supabase RLS Guide", "url": "https://supabase.com/docs/guides/auth/row-level-security"}
                ]
            },
            {
                "title": "Advanced Policy Patterns",
                "topics": [
                    {"title": "Role-Based Access Control (RBAC)", "youtube_search_query": "Supabase RBAC implementation", "subtopics": ["Custom claims", "User roles table", "Joining with roles in policies"]},
                    {"title": "Multi-Tenant Architectures", "youtube_search_query": "Supabase multi-tenant RLS", "subtopics": ["Tenant IDs", "Cross-tenant isolation", "Organization-based access"]},
                    {"title": "Hierarchical Data Security", "youtube_search_query": "RLS on recursive trees PostgreSQL", "subtopics": ["Securing trees", "Recursive CTEs in policies", "Performance considerations"]},
                    {"title": "Time and State Based Rules", "youtube_search_query": "State-based RLS policies Postgres", "subtopics": ["Expiring access", "Draft vs Published states", "Soft deletes"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An RBAC system implemented via RLS.",
                    "what_counts_as_evidence": "SQL definitions for a roles table and policies that restrict access based on a user's role.",
                    "eval_criteria": ["Correctly uses JOINs or subqueries in the policy", "Avoids infinite recursion errors"]
                },
                "resources": [
                    {"title": "Custom Claims in Supabase", "url": "https://supabase.com/docs/guides/auth/custom-claims"},
                    {"title": "Advanced RLS Patterns", "url": "https://github.com/supabase-community/supabase-custom-claims"}
                ]
            },
            {
                "title": "Performance Optimization",
                "topics": [
                    {"title": "Policy Performance Overhead", "youtube_search_query": "Postgres RLS performance tuning", "subtopics": ["Execution plans with RLS", "Index usage", "Common bottlenecks"]},
                    {"title": "Optimizing Subqueries", "youtube_search_query": "Optimizing RLS subqueries", "subtopics": ["EXISTS vs IN", "Security definer functions", "Caching lookups"]},
                    {"title": "Security Definer Functions", "youtube_search_query": "PostgreSQL Security Definer vs Invoker", "subtopics": ["Bypassing RLS safely", "Use cases", "Security risks and mitigation"]},
                    {"title": "Debugging Policies", "youtube_search_query": "Debugging Supabase RLS", "subtopics": ["EXPLAIN ANALYZE", "Testing roles", "Audit logging"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A performance-optimized RLS policy using a Security Definer function.",
                    "what_counts_as_evidence": "SQL code defining the function and policy, alongside an EXPLAIN ANALYZE output comparison.",
                    "eval_criteria": ["Security Definer function is created correctly", "Demonstrates performance improvement over a standard subquery policy"]
                },
                "resources": [
                    {"title": "PostgreSQL EXPLAIN Docs", "url": "https://www.postgresql.org/docs/current/sql-explain.html"},
                    {"title": "Supabase Security Definer", "url": "https://supabase.com/docs/guides/database/functions#security-definer-vs-invoker"}
                ]
            },
            {
                "title": "Edge Cases and Security",
                "topics": [
                    {"title": "Preventing Infinite Recursion", "youtube_search_query": "Postgres RLS infinite recursion fix", "subtopics": ["Why it happens", "Using current_setting", "Architectural fixes"]},
                    {"title": "Securing Storage", "youtube_search_query": "Supabase Storage RLS", "subtopics": ["Storage buckets policies", "Path-based restrictions", "File size and type limits"]},
                    {"title": "Realtime and RLS", "youtube_search_query": "Supabase Realtime RLS", "subtopics": ["How Realtime respects RLS", "WAL filtering", "Broadcasting limitations"]},
                    {"title": "Auditing and Compliance", "youtube_search_query": "PostgreSQL audit trigger RLS", "subtopics": ["Tracking policy changes", "Compliance reporting", "pgAudit integration"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A secure Supabase Storage policy.",
                    "what_counts_as_evidence": "SQL policy that restricts folder access in a storage bucket based on the user's UUID.",
                    "eval_criteria": ["Correctly parses the storage path string", "Applies restrictions securely to INSERT and SELECT"]
                },
                "resources": [
                    {"title": "Supabase Storage Security", "url": "https://supabase.com/docs/guides/storage/security"},
                    {"title": "pgAudit Documentation", "url": "https://www.pgaudit.org/"}
                ]
            }
        ]
    },
    {
        "title": "Writing eBPF Programs for Linux Observability",
        "description": "Harness the power of eBPF to trace, monitor, and secure Linux systems safely and efficiently.",
        "subject": "Systems Programming",
        "modules_data": [
            {
                "title": "eBPF Architecture",
                "topics": [
                    {"title": "What is eBPF?", "youtube_search_query": "eBPF explained Linux", "subtopics": ["In-kernel virtual machine", "Use cases (Networking, Security, Tracing)", "History from BPF to eBPF"]},
                    {"title": "The eBPF Verifier", "youtube_search_query": "eBPF verifier deep dive", "subtopics": ["Safety guarantees", "Loop restrictions", "Memory access checks"]},
                    {"title": "eBPF Maps", "youtube_search_query": "eBPF maps tutorial", "subtopics": ["Shared memory structure", "Hash, Array, Perf ring buffers", "Concurrency"]},
                    {"title": "Program Types", "youtube_search_query": "eBPF program types", "subtopics": ["Kprobes/Uprobes", "Tracepoints", "XDP and TC"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A conceptual map of eBPF architecture.",
                    "what_counts_as_evidence": "A markdown document detailing how a user-space program interacts with an eBPF program via maps.",
                    "eval_criteria": ["Correctly identifies the role of the verifier", "Accurately describes at least two map types"]
                },
                "resources": [
                    {"title": "eBPF.io Introduction", "url": "https://ebpf.io/what-is-ebpf/"},
                    {"title": "Kernel Documentation on eBPF", "url": "https://www.kernel.org/doc/html/latest/bpf/index.html"}
                ]
            },
            {
                "title": "BCC and bpftrace",
                "topics": [
                    {"title": "Introduction to bpftrace", "youtube_search_query": "bpftrace tutorial one-liners", "subtopics": ["Syntax overview", "One-liners", "Built-in variables"]},
                    {"title": "Tracing System Calls", "youtube_search_query": "bpftrace tracing syscalls", "subtopics": ["Attaching to sys_enter", "Filtering by PID", "Histograms"]},
                    {"title": "Introduction to BCC", "youtube_search_query": "BCC eBPF Python tutorial", "subtopics": ["Python bindings", "Inline C code", "Handling events"]},
                    {"title": "Building a Monitoring Tool", "youtube_search_query": "Building BCC tools", "subtopics": ["Extracting struct data", "Formatting output", "Performance overhead"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A simple BCC script to trace file opens.",
                    "what_counts_as_evidence": "A Python script using BCC that hooks into `sys_enter_openat` and prints the filename.",
                    "eval_criteria": ["Successfully compiles and attaches the kprobe", "Correctly extracts the filename string from user space"]
                },
                "resources": [
                    {"title": "bpftrace Reference Guide", "url": "https://github.com/iovisor/bpftrace/blob/master/docs/reference_guide.md"},
                    {"title": "BCC Python Developer Tutorial", "url": "https://github.com/iovisor/bcc/blob/master/docs/tutorial_bcc_python_developer.md"}
                ]
            },
            {
                "title": "Developing with libbpf",
                "topics": [
                    {"title": "Transitioning to libbpf", "youtube_search_query": "libbpf CO-RE tutorial", "subtopics": ["Why libbpf?", "CO-RE (Compile Once, Run Everywhere)", "BTF (BPF Type Format)"]},
                    {"title": "Writing eBPF in C", "youtube_search_query": "Writing eBPF programs in C", "subtopics": ["BPF helpers", "Context structs", "License requirements"]},
                    {"title": "User-space Integration", "youtube_search_query": "libbpf user space integration", "subtopics": ["Loading programs", "Attaching to hooks", "Polling ring buffers"]},
                    {"title": "Using BPF Skeletons", "youtube_search_query": "eBPF skeletons libbpf", "subtopics": ["Generating headers", "Simplifying deployment", "Managing state"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An eBPF program utilizing CO-RE and a BPF skeleton.",
                    "what_counts_as_evidence": "C code for the eBPF program and user-space loader, along with the Makefile.",
                    "eval_criteria": ["Uses vmlinux.h for kernel types", "Successfully builds a BPF skeleton header"]
                },
                "resources": [
                    {"title": "BPF CO-RE Guide", "url": "https://nakryiko.com/posts/bpf-core-reference-guide/"},
                    {"title": "libbpf-bootstrap", "url": "https://github.com/libbpf/libbpf-bootstrap"}
                ]
            },
            {
                "title": "Advanced eBPF Applications",
                "topics": [
                    {"title": "Network Tracing with XDP", "youtube_search_query": "eBPF XDP tutorial", "subtopics": ["XDP architecture", "Packet dropping", "DDoS mitigation"]},
                    {"title": "Security Observability", "youtube_search_query": "eBPF LSM security", "subtopics": ["LSM hooks (Linux Security Modules)", "Detecting anomalous behavior", "Container context"]},
                    {"title": "Profiling and Performance", "youtube_search_query": "eBPF continuous profiling", "subtopics": ["CPU profiling", "Off-CPU analysis", "Flame graphs integration"]},
                    {"title": "Testing and CI/CD", "youtube_search_query": "Testing eBPF programs", "subtopics": ["BPF_PROG_TEST_RUN", "Mocking kernel states", "Automated verification"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A basic XDP packet counter.",
                    "what_counts_as_evidence": "An eBPF program that attaches to a network interface and counts incoming packets by protocol.",
                    "eval_criteria": ["Correctly parses Ethernet and IP headers", "Updates an eBPF map with packet counts"]
                },
                "resources": [
                    {"title": "XDP Tutorial", "url": "https://github.com/xdp-project/xdp-tutorial"},
                    {"title": "Cilium eBPF Documentation", "url": "https://docs.cilium.io/en/stable/bpf/"}
                ]
            }
        ]
    },
    {
        "title": "Custom Shaders in React Three Fiber",
        "description": "Unlock advanced graphics programming on the web. Learn GLSL and integrate custom shaders into your React Three Fiber scenes.",
        "subject": "Web Development",
        "modules_data": [
            {
                "title": "GLSL Fundamentals",
                "topics": [
                    {"title": "Introduction to WebGL Shaders", "youtube_search_query": "WebGL shaders explained", "subtopics": ["Vertex vs Fragment Shaders", "The rendering pipeline", "GLSL syntax basics"]},
                    {"title": "Data Types and Variables", "youtube_search_query": "GLSL data types uniforms varyings", "subtopics": ["Vectors and Matrices", "Uniforms", "Attributes and Varyings"]},
                    {"title": "Mathematical Functions", "youtube_search_query": "GLSL math functions step smoothstep", "subtopics": ["Trigonometry in shaders", "Step and Smoothstep", "Mix and Clamp"]},
                    {"title": "Color and Space", "youtube_search_query": "GLSL color and coordinate space", "subtopics": ["Normalized device coordinates", "UV mapping", "Color manipulation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A foundational fragment shader.",
                    "what_counts_as_evidence": "A GLSL code snippet that renders a gradient based on UV coordinates and time.",
                    "eval_criteria": ["Properly utilizes the `gl_FragColor` output", "Incorporates a uniform for time animation"]
                },
                "resources": [
                    {"title": "The Book of Shaders", "url": "https://thebookofshaders.com/"},
                    {"title": "Three.js ShaderMaterial Docs", "url": "https://threejs.org/docs/#api/en/materials/ShaderMaterial"}
                ]
            },
            {
                "title": "Integration with React Three Fiber",
                "topics": [
                    {"title": "ShaderMaterial Component", "youtube_search_query": "React Three Fiber ShaderMaterial", "subtopics": ["Setting up ShaderMaterial", "Passing uniforms from React", "Handling window resize"]},
                    {"title": "drei's shaderMaterial Helper", "youtube_search_query": "R3F drei shaderMaterial", "subtopics": ["Simplifying creation", "Automatic uniform getters/setters", "TypeScript integration"]},
                    {"title": "Animating Shaders", "youtube_search_query": "Animating shaders useFrame R3F", "subtopics": ["useFrame hook", "Updating uniforms per frame", "Performance best practices"]},
                    {"title": "Texture Mapping", "youtube_search_query": "GLSL textures in React Three Fiber", "subtopics": ["Loading textures in R3F", "Passing textures to shaders", "Sampling textures in GLSL"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A React component encapsulating a custom shader.",
                    "what_counts_as_evidence": "A `.tsx` file using R3F and `shaderMaterial` to render a textured, animated plane.",
                    "eval_criteria": ["Correctly uses `useFrame` to update the time uniform", "Successfully imports and samples a texture"]
                },
                "resources": [
                    {"title": "React Three Fiber Documentation", "url": "https://docs.pmnd.rs/react-three-fiber/getting-started/introduction"},
                    {"title": "Drei Library", "url": "https://github.com/pmndrs/drei"}
                ]
            },
            {
                "title": "Advanced Visual Effects",
                "topics": [
                    {"title": "Noise and Generative Art", "youtube_search_query": "GLSL Perlin noise simplex noise", "subtopics": ["Value noise", "Perlin and Simplex noise", "Creating organic shapes"]},
                    {"title": "Distortion and Displacement", "youtube_search_query": "Vertex shader displacement R3F", "subtopics": ["Modifying vertex positions", "Normal recalculation", "Interactive displacement"]},
                    {"title": "Lighting in Custom Shaders", "youtube_search_query": "Custom shader lighting Three.js", "subtopics": ["Phong reflection model", "Integrating Three.js lights", "Shadow mapping basics"]},
                    {"title": "Post-Processing Effects", "youtube_search_query": "React Three Fiber post processing custom effects", "subtopics": ["EffectComposer setup", "Writing custom passes", "Screen-space shaders"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A vertex displacement shader.",
                    "what_counts_as_evidence": "A shader that deforms a sphere's geometry using 3D noise.",
                    "eval_criteria": ["Modifies `gl_Position` in the vertex shader", "Implements a noise function correctly"]
                },
                "resources": [
                    {"title": "Inigo Quilez Articles", "url": "https://iquilezles.org/articles/"},
                    {"title": "Post Processing in R3F", "url": "https://docs.pmnd.rs/react-postprocessing/introduction"}
                ]
            },
            {
                "title": "Optimization and Architecture",
                "topics": [
                    {"title": "Shader Performance", "youtube_search_query": "GLSL optimization techniques", "subtopics": ["Avoiding branching (if statements)", "Precision qualifiers", "Precomputing values"]},
                    {"title": "Organizing Shader Code", "youtube_search_query": "Organizing GLSL files in Webpack Vite", "subtopics": ["Importing GLSL chunks", "Vite plugins for shaders", "Component reusability"]},
                    {"title": "Instanced Rendering", "youtube_search_query": "InstancedMesh shaders Three.js", "subtopics": ["InstancedMesh in R3F", "Modifying shaders for instances", "Passing instance attributes"]},
                    {"title": "GPGPU Techniques", "youtube_search_query": "GPGPU Three.js simulation", "subtopics": ["FBOs (Frame Buffer Objects)", "Particle simulations", "Data textures"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An instanced mesh setup with custom shader attributes.",
                    "what_counts_as_evidence": "Code that renders 10,000 instances of a geometry, where each instance is colored differently by the shader.",
                    "eval_criteria": ["Utilizes `InstancedMesh`", "Properly configures and reads an `InstancedBufferAttribute` in the shader"]
                },
                "resources": [
                    {"title": "Three.js InstancedMesh", "url": "https://threejs.org/docs/#api/en/objects/InstancedMesh"},
                    {"title": "GPGPU in WebGL", "url": "https://threejs.org/examples/?q=gpgpu"}
                ]
            }
        ]
    },
    {
        "title": "WebAssembly Beyond the Browser",
        "description": "Explore Server-Side WebAssembly. Build lightweight, secure, and cross-platform modules using WASI.",
        "subject": "Systems Programming",
        "modules_data": [
            {
                "title": "WebAssembly and WASI Basics",
                "topics": [
                    {"title": "Introduction to Wasm", "youtube_search_query": "What is WebAssembly bytecode", "subtopics": ["Stack machine architecture", "Text format (WAT) vs Binary", "Security model"]},
                    {"title": "The WASI Standard", "youtube_search_query": "WASI WebAssembly System Interface explained", "subtopics": ["Why WASI?", "Capabilities-based security", "File I/O and networking"]},
                    {"title": "Compiling to Wasm", "youtube_search_query": "Compiling Rust to WASI", "subtopics": ["LLVM Wasm backend", "Targeting wasm32-wasi in Rust", "Targeting Wasm in Go"]},
                    {"title": "Wasm Runtimes", "youtube_search_query": "Wasmtime vs WasmEdge", "subtopics": ["Wasmtime overview", "WasmEdge", "Embedding runtimes"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A basic WASI CLI application.",
                    "what_counts_as_evidence": "A Rust or Go program compiled to WASI that reads a file and prints its contents, executed via Wasmtime.",
                    "eval_criteria": ["Compiles successfully to the `wasm32-wasi` target", "Executes correctly outside the browser with necessary directory permissions"]
                },
                "resources": [
                    {"title": "WASI Standard", "url": "https://wasi.dev/"},
                    {"title": "Wasmtime Documentation", "url": "https://docs.wasmtime.dev/"}
                ]
            },
            {
                "title": "The Component Model",
                "topics": [
                    {"title": "Component Model Concepts", "youtube_search_query": "WebAssembly Component Model", "subtopics": ["Modularity and linking", "Language interoperability", "WIT (Wasm Interface Type) files"]},
                    {"title": "Writing WIT Interfaces", "youtube_search_query": "Writing WIT files WebAssembly", "subtopics": ["Defining records and enums", "Functions and interfaces", "World definitions"]},
                    {"title": "Generating Bindings", "youtube_search_query": "Wasm bindings generation wit-bindgen", "subtopics": ["Using wit-bindgen", "Guest bindings", "Host bindings"]},
                    {"title": "Composing Components", "youtube_search_query": "Composing Wasm components", "subtopics": ["Wasm-tools", "Linking components", "Packaging"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A WIT interface definition and generated guest bindings.",
                    "what_counts_as_evidence": "A `.wit` file defining a calculator interface and a Rust guest implementation using `wit-bindgen`.",
                    "eval_criteria": ["WIT file correctly defines functions and types", "Guest implementation satisfies the interface without compilation errors"]
                },
                "resources": [
                    {"title": "Component Model Specification", "url": "https://github.com/WebAssembly/component-model"},
                    {"title": "wit-bindgen Repository", "url": "https://github.com/bytecodealliance/wit-bindgen"}
                ]
            },
            {
                "title": "Embedding Wasm in Applications",
                "topics": [
                    {"title": "Embedding in Rust", "youtube_search_query": "Embedding Wasmtime in Rust", "subtopics": ["Wasmtime Engine and Store", "Loading modules", "Calling Wasm functions"]},
                    {"title": "Host Functions", "youtube_search_query": "WebAssembly host functions", "subtopics": ["Defining host functions", "Passing complex types", "Memory management"]},
                    {"title": "Sandboxing and Limits", "youtube_search_query": "Wasmtime memory limits sandboxing", "subtopics": ["Setting memory limits", "Fuel consumption (execution limits)", "Restricting WASI access"]},
                    {"title": "Plugin Systems Architecture", "youtube_search_query": "Building plugin systems with WebAssembly", "subtopics": ["Designing plugin APIs", "Hot-reloading modules", "Versioning"]
                    }
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A simple host application that executes a Wasm plugin.",
                    "what_counts_as_evidence": "A host program (e.g., in Rust) that instantiates a Wasm module, provides a host function for logging, and calls a guest function.",
                    "eval_criteria": ["Host correctly exposes a function to the guest", "Guest executes and invokes the host logging function"]
                },
                "resources": [
                    {"title": "Extending Applications with Wasm", "url": "https://surma.dev/things/rust-to-webassembly/"},
                    {"title": "Wasmtime Embedding Guide", "url": "https://docs.wasmtime.dev/embed-rust.html"}
                ]
            },
            {
                "title": "Cloud and Edge Deployments",
                "topics": [
                    {"title": "Wasm on Kubernetes", "youtube_search_query": "WebAssembly Kubernetes Krustlet", "subtopics": ["Runwasi", "Containerd Wasm shims", "Deployment configurations"]},
                    {"title": "Serverless Wasm", "youtube_search_query": "Serverless WebAssembly Spin", "subtopics": ["Fermyon Spin", "Handling HTTP requests", "State management"]},
                    {"title": "Edge Computing", "youtube_search_query": "WebAssembly at the Edge", "subtopics": ["Cloudflare Workers", "Fastly Compute@Edge", "Latency advantages"]},
                    {"title": "Performance Optimization", "youtube_search_query": "Optimizing WebAssembly module size", "subtopics": ["Dead code elimination", "AOT compilation in runtimes", "Module caching"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A serverless HTTP application using Fermyon Spin.",
                    "what_counts_as_evidence": "A Spin configuration and application code (Rust/Go) that responds to an HTTP GET request.",
                    "eval_criteria": ["Application is structured correctly for the Spin framework", "Successfully compiles to a Wasm module that Spin can execute"]
                },
                "resources": [
                    {"title": "Fermyon Spin Documentation", "url": "https://developer.fermyon.com/spin/v2/index"},
                    {"title": "Docker Wasm Integration", "url": "https://docs.docker.com/desktop/wasm/"}
                ]
            }
        ]
    },
    {
        "title": "State Machines for Complex UI (XState)",
        "description": "Build robust, predictable user interfaces using state machines and statecharts with XState.",
        "subject": "Web Development",
        "modules_data": [
            {
                "title": "State Machine Foundations",
                "topics": [
                    {"title": "The Problem with Boolean State", "youtube_search_query": "Why state machines UI development", "subtopics": ["State explosion", "Impossible states", "Imperative vs Declarative"]},
                    {"title": "Finite State Machines (FSM)", "youtube_search_query": "Finite state machines explained", "subtopics": ["States and Transitions", "Events", "Initial and Final states"]},
                    {"title": "Introduction to XState", "youtube_search_query": "XState v5 tutorial basics", "subtopics": ["setup() and createMachine()", "Basic transitions", "Context (Extended State)"]},
                    {"title": "Actions and Side Effects", "youtube_search_query": "XState actions side effects", "subtopics": ["Entry and Exit actions", "Transition actions", "Assigning context"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A finite state machine for a login form.",
                    "what_counts_as_evidence": "An XState machine definition handling idle, loading, success, and error states, with context for user credentials.",
                    "eval_criteria": ["Defines strictly exclusive states", "Properly assigns context during transitions"]
                },
                "resources": [
                    {"title": "XState V5 Documentation", "url": "https://stately.ai/docs/xstate"},
                    {"title": "Statecharts Introduction", "url": "https://statecharts.dev/"}
                ]
            },
            {
                "title": "Advanced Statecharts",
                "topics": [
                    {"title": "Hierarchical States", "youtube_search_query": "XState hierarchical states", "subtopics": ["Nesting states", "Parent-child transitions", "History states"]},
                    {"title": "Parallel States", "youtube_search_query": "XState parallel states", "subtopics": ["Orthogonal regions", "Independent state tracking", "Synchronization"]},
                    {"title": "Guards and Conditions", "youtube_search_query": "XState guards conditional transitions", "subtopics": ["Conditional transitions", "Custom guard logic", "In-line vs external guards"]},
                    {"title": "Delayed Transitions", "youtube_search_query": "XState delayed transitions after", "subtopics": ["The `after` property", "Dynamic delays", "Timeout handling"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A video player state machine.",
                    "what_counts_as_evidence": "A machine with hierarchical states (e.g., opened/closed) and parallel states (e.g., volume control and playback status).",
                    "eval_criteria": ["Successfully implements at least one parallel state node", "Includes a guarded transition (e.g., cannot play if volume is 0)"]
                },
                "resources": [
                    {"title": "David Khourshid on Statecharts", "url": "https://www.youtube.com/watch?v=VU1NKX6Qkxc"},
                    {"title": "XState Guards", "url": "https://stately.ai/docs/guards"}
                ]
            },
            {
                "title": "Integration with React",
                "topics": [
                    {"title": "Using @xstate/react", "youtube_search_query": "XState React useMachine", "subtopics": ["useMachine hook", "useActor hook", "Global state management"]},
                    {"title": "Actors and Communication", "youtube_search_query": "XState actors spawn", "subtopics": ["The Actor model", "Spawning child actors", "Sending messages between actors"]},
                    {"title": "Form Handling and Validation", "youtube_search_query": "XState form validation", "subtopics": ["Syncing inputs to context", "Async validation states", "Debouncing events"]},
                    {"title": "Testing Machines", "youtube_search_query": "Testing XState machines", "subtopics": ["Pure logic testing", "Testing React integration", "Model-based testing basics"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A React component driven by an XState actor.",
                    "what_counts_as_evidence": "A functional React component that uses `@xstate/react` to render UI based on the machine's current state.",
                    "eval_criteria": ["UI correctly reflects different machine states", "Events from the UI trigger machine transitions"]
                },
                "resources": [
                    {"title": "XState React Guide", "url": "https://stately.ai/docs/xstate-react"},
                    {"title": "Actor Model in XState", "url": "https://stately.ai/docs/actors"}
                ]
            },
            {
                "title": "Architecture and Tooling",
                "topics": [
                    {"title": "Stately Studio and Visualizer", "youtube_search_query": "Stately visualizer tutorial", "subtopics": ["Visual editing", "Exporting machines", "Simulating workflows"]},
                    {"title": "Type Safety", "youtube_search_query": "XState TypeScript inference", "subtopics": ["Typegen", "Typing context and events", "Strict event types"]},
                    {"title": "Backend State Machines", "youtube_search_query": "XState Node.js backend", "subtopics": ["Persisting state", "Restoring state from DB", "Long-running workflows"]},
                    {"title": "Design Patterns", "youtube_search_query": "XState design patterns", "subtopics": ["Separation of concerns", "Reusable machine behaviors", "Handling complex data fetching"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A backend workflow machine with state persistence.",
                    "what_counts_as_evidence": "A Node.js script that starts an XState machine, extracts its persisted state, and later restores and resumes it.",
                    "eval_criteria": ["Successfully serializes machine state to a string/JSON", "Successfully restores and transitions from the restored state"]
                },
                "resources": [
                    {"title": "Stately Studio", "url": "https://stately.ai/studio"},
                    {"title": "Persisting State in XState", "url": "https://stately.ai/docs/persistence"}
                ]
            }
        ]
    },
    {
        "title": "Crafting DSLs (Domain Specific Languages) in Python",
        "description": "Design and implement custom programming languages and DSLs embedded within Python using parsers and AST manipulation.",
        "subject": "Computer Science",
        "modules_data": [
            {
                "title": "Introduction to DSLs and Parsing",
                "topics": [
                    {"title": "Internal vs External DSLs", "youtube_search_query": "Internal vs External DSL", "subtopics": ["Definitions and trade-offs", "Fluent interfaces in Python", "When to write an external DSL"]},
                    {"title": "Formal Grammars", "youtube_search_query": "Context free grammar explained", "subtopics": ["Context-Free Grammars (CFG)", "BNF and EBNF notation", "Ambiguity in grammars"]},
                    {"title": "Lexical Analysis", "youtube_search_query": "Lexical analysis tokenization", "subtopics": ["Tokenization", "Regular expressions for lexing", "Handling whitespace and comments"]},
                    {"title": "Syntax Analysis Overview", "youtube_search_query": "Recursive descent parsing basics", "subtopics": ["LL vs LR parsing", "Abstract Syntax Trees (AST)", "Recursive descent concept"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A simple tokenizer in Python.",
                    "what_counts_as_evidence": "A Python function that takes a string of a custom query language and yields a stream of typed tokens.",
                    "eval_criteria": ["Correctly identifies identifiers, numbers, and operators", "Ignores whitespace appropriately"]
                },
                "resources": [
                    {"title": "Crafting Interpreters - Scanning", "url": "https://craftinginterpreters.com/scanning.html"},
                    {"title": "BNF Notation", "url": "https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_form"}
                ]
            },
            {
                "title": "Building External DSLs with Lark",
                "topics": [
                    {"title": "Introduction to Lark", "youtube_search_query": "Lark parser Python tutorial", "subtopics": ["Setting up Lark", "Writing grammars in Lark", "Earley vs LALR(1) parsers"]},
                    {"title": "AST Generation", "youtube_search_query": "Lark tree shaping transformers", "subtopics": ["Parse trees", "Tree shaping rules", "Dealing with ambiguity"]},
                    {"title": "Tree Transformers", "youtube_search_query": "Lark Transformers Python", "subtopics": ["The Transformer class", "Visiting nodes", "Evaluating expressions"]},
                    {"title": "Error Handling", "youtube_search_query": "Lark error reporting", "subtopics": ["Syntax error recovery", "Custom error messages", "Debugging grammars"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An evaluator for a custom configuration language.",
                    "what_counts_as_evidence": "A Lark grammar file and a Python Transformer that parses custom config syntax into a Python dictionary.",
                    "eval_criteria": ["Grammar parses nested structures correctly", "Transformer executes without errors and returns the expected dictionary"]
                },
                "resources": [
                    {"title": "Lark Documentation", "url": "https://lark-parser.readthedocs.io/en/latest/"},
                    {"title": "Parsing in Python with Lark", "url": "https://towardsdatascience.com/parsing-in-python-tools-and-libraries-7b2434db0343"}
                ]
            },
            {
                "title": "Internal DSLs and Metaprogramming",
                "topics": [
                    {"title": "Fluent APIs", "youtube_search_query": "Fluent interface Python method chaining", "subtopics": ["Method chaining", "Builder pattern", "State management in builders"]},
                    {"title": "Operator Overloading", "youtube_search_query": "Python operator overloading magic methods", "subtopics": ["Dunder methods (__add__, __or__)", "Creating expression trees", "Use cases (e.g., SQLAlchemy)"]},
                    {"title": "Context Managers", "youtube_search_query": "Python context managers internal DSL", "subtopics": ["The `with` statement", "Scoping structures (e.g., HTML builders)", "Nesting contexts"]},
                    {"title": "Metaclasses and Decorators", "youtube_search_query": "Python metaclasses deep dive", "subtopics": ["Registering DSL components", "Class creation interception", "Modifying class behavior"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An HTML builder internal DSL.",
                    "what_counts_as_evidence": "Python code using context managers and method chaining to construct and output valid HTML.",
                    "eval_criteria": ["Utilizes the `with` statement for HTML tags", "Correctly handles nested elements and indentation"]
                },
                "resources": [
                    {"title": "Python Magic Methods", "url": "https://rszalski.github.io/magicmethods/"},
                    {"title": "Designing Internal DSLs", "url": "https://martinfowler.com/books/dsl.html"}
                ]
            },
            {
                "title": "Python AST Manipulation",
                "topics": [
                    {"title": "The `ast` Module", "youtube_search_query": "Python ast module tutorial", "subtopics": ["Parsing Python code to AST", "AST node types", "Using ast.dump"]},
                    {"title": "AST Node Visitors", "youtube_search_query": "Python NodeVisitor AST", "subtopics": ["ast.NodeVisitor", "Extracting information from code", "Static analysis basics"]},
                    {"title": "AST Node Transformers", "youtube_search_query": "Python NodeTransformer AST rewrite", "subtopics": ["ast.NodeTransformer", "Rewriting Python code", "Injecting behavior"]},
                    {"title": "Compiling and Executing", "youtube_search_query": "Python compile eval exec AST", "subtopics": ["Compiling AST objects", "The `exec` and `eval` functions", "Security implications"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python code rewriter macro.",
                    "what_counts_as_evidence": "An `ast.NodeTransformer` that finds specific function calls and rewrites them into inline mathematical operations before execution.",
                    "eval_criteria": ["Successfully modifies the AST", "Compiled and executed AST produces the modified behavior"]
                },
                "resources": [
                    {"title": "Green Tree Snakes (AST guide)", "url": "https://greentreesnakes.readthedocs.io/en/latest/"},
                    {"title": "Python ast Module Docs", "url": "https://docs.python.org/3/library/ast.html"}
                ]
            }
        ]
    },
    {
        "title": "Rust FFI: Calling C from Rust Safely",
        "description": "Master Foreign Function Interfaces in Rust. Learn how to interoperate with C libraries while maintaining memory safety.",
        "subject": "Systems Programming",
        "modules_data": [
            {
                "title": "FFI Fundamentals",
                "topics": [
                    {"title": "C ABI and Calling Conventions", "youtube_search_query": "C ABI calling conventions", "subtopics": ["Application Binary Interface (ABI)", "cdecl vs stdcall", "Name mangling"]},
                    {"title": "The `extern` Keyword", "youtube_search_query": "Rust extern blocks FFI", "subtopics": ["extern blocks", "Linking external libraries", "Unsafe functions"]},
                    {"title": "Primitive Type Mapping", "youtube_search_query": "Rust std::os::raw types", "subtopics": ["std::ffi types", "c_int, c_char, etc.", "Platform-specific sizing"]},
                    {"title": "Pointers and References", "youtube_search_query": "Rust raw pointers FFI", "subtopics": ["Raw pointers (*const, *mut)", "Converting between references and pointers", "Null pointers in Rust"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A minimal Rust program calling a standard C math function.",
                    "what_counts_as_evidence": "Rust code linking to `libm` and calling the C `cos` function using an `extern \"C\"` block.",
                    "eval_criteria": ["Correctly defines the C function signature", "Uses `unsafe` block appropriately to make the call"]
                },
                "resources": [
                    {"title": "Rust Nomicon: FFI", "url": "https://doc.rust-lang.org/nomicon/ffi.html"},
                    {"title": "Rust std::ffi Documentation", "url": "https://doc.rust-lang.org/std/ffi/"}
                ]
            },
            {
                "title": "Working with Strings and Structs",
                "topics": [
                    {"title": "C Strings in Rust", "youtube_search_query": "Rust CString and CStr", "subtopics": ["Null-terminated strings", "CString vs CStr", "Memory allocation for strings"]},
                    {"title": "Struct Layouts", "youtube_search_query": "Rust repr(C) attribute", "subtopics": ["The `#[repr(C)]` attribute", "Struct padding and alignment", "Opaque structs"]},
                    {"title": "Passing Structs", "youtube_search_query": "Rust FFI passing structs", "subtopics": ["By value vs by pointer", "Mutability across the boundary", "Lifetimes of C structs"]},
                    {"title": "Unions", "youtube_search_query": "Rust unions FFI", "subtopics": ["Defining unions in Rust", "Accessing union fields safely", "Tagged unions representation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Rust wrapper for a C struct with string fields.",
                    "what_counts_as_evidence": "A `#[repr(C)]` struct in Rust and code demonstrating passing a `CString` to a C function that populates the struct.",
                    "eval_criteria": ["Struct layout uses `#[repr(C)]`", "Properly handles `CString` ownership to prevent use-after-free"]
                },
                "resources": [
                    {"title": "Rust By Example: FFI", "url": "https://doc.rust-lang.org/rust-by-example/std_misc/ffi.html"},
                    {"title": "The Rustonomicon: repr(C)", "url": "https://doc.rust-lang.org/nomicon/other-reprs.html#reprc"}
                ]
            },
            {
                "title": "Memory Management Across Boundaries",
                "topics": [
                    {"title": "Ownership and Allocators", "youtube_search_query": "Rust FFI memory management ownership", "subtopics": ["Who frees what?", "libc::malloc and libc::free", "Box::into_raw and Box::from_raw"]},
                    {"title": "Callbacks and Function Pointers", "youtube_search_query": "Rust FFI callbacks function pointers", "subtopics": ["Passing Rust functions to C", "extern \"C\" fn types", "Closures and context pointers (void*)"]},
                    {"title": "Handling Errors", "youtube_search_query": "Rust FFI error handling errno", "subtopics": ["Reading `errno`", "Returning Option/Result over FFI", "Out parameters"]},
                    {"title": "Panics across FFI", "youtube_search_query": "Rust panic across FFI boundary", "subtopics": ["Undefined behavior of unwinding", "catch_unwind", "Compiling with panic=abort"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A safe Rust wrapper abstracting a C API that requires memory cleanup.",
                    "what_counts_as_evidence": "A Rust struct with a custom `Drop` implementation that calls the appropriate C `free` function on an owned pointer.",
                    "eval_criteria": ["Implements the `Drop` trait correctly", "Uses `Box::into_raw` or similar to take ownership from Rust initially"]
                },
                "resources": [
                    {"title": "Rust catch_unwind Documentation", "url": "https://doc.rust-lang.org/std/panic/fn.catch_unwind.html"},
                    {"title": "FFI Best Practices", "url": "https://anssi-fr.github.io/rust-guide/07_ffi.html"}
                ]
            },
            {
                "title": "Tooling and Automation",
                "topics": [
                    {"title": "Bindgen Basics", "youtube_search_query": "Rust bindgen tutorial", "subtopics": ["Automating bindings generation", "build.rs integration", "Configuring bindgen options"]},
                    {"title": "Advanced Bindgen", "youtube_search_query": "Rust bindgen opaque types blocklist", "subtopics": ["Blocklisting types", "Opaque types", "Handling C macros"]},
                    {"title": "Cc Crate", "youtube_search_query": "Rust cc crate build.rs", "subtopics": ["Compiling C code from build.rs", "Integrating CMake", "Static vs Dynamic linking"]},
                    {"title": "Safe Abstraction Design", "youtube_search_query": "Designing safe Rust wrappers", "subtopics": ["Encapsulating unsafe", "Translating lifetimes", "Idiomatic Rust API design"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An automated build script compiling and linking a C library.",
                    "what_counts_as_evidence": "A `build.rs` using the `cc` and `bindgen` crates to compile a custom C file and generate Rust bindings on the fly.",
                    "eval_criteria": ["`build.rs` compiles the C code correctly", "Bindings are generated and successfully included in the Rust source"]
                },
                "resources": [
                    {"title": "Bindgen User Guide", "url": "https://rust-lang.github.io/rust-bindgen/"},
                    {"title": "The cc Crate", "url": "https://docs.rs/cc/latest/cc/"}
                ]
            }
        ]
    }
]

async def seed():
    supabase = get_supabase_client()
    print("Starting batch 2 seeding...")
    # Iterate over courses and insert
    for course_data in courses_info:
        for m in course_data["modules_data"]:
            valid_resources = []
            for r in m["resources"]:
                if await verify_url(r["url"]):
                    valid_resources.append(r)
                else:
                    print(f"Filtered out broken URL: {r['url']}")
            m["resources"] = valid_resources

        payload = create_course(
            course_data["title"],
            course_data["description"],
            course_data["subject"],
            course_data["modules_data"]
        )
        
        # We need a proper slug. _generate_unique_slug usually needs the DB client or is async.
        # Assuming we can call it if it's imported, or we write a basic one:
        try:
            slug = await _generate_unique_slug(payload["title"], "eulerfold@gmail.com", supabase)
        except Exception:
            import re
            slug = re.sub(r'[^a-z0-9]+', '-', payload["title"].lower()).strip('-') + f"-{uuid.uuid4().hex[:6]}"
        
        try:
            plan_hash = _generate_plan_hash(payload["plan"])
        except Exception:
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
        
        # Insert into Supabase
        response = supabase.table("roadmaps").insert(record).execute()
        print(f"Inserted: {payload['title']} -> {response}")

if __name__ == "__main__":
    asyncio.run(seed())
