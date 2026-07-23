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
    # 1. Building Custom Kubernetes Operators in Go
    {
        "title": "Building Custom Kubernetes Operators in Go",
        "description": "Design and implement custom Kubernetes controllers and operators using Go, Controller-Runtime, and Kubebuilder.",
        "subject": "DevOps & Cloud Architecture",
        "modules_data": [
            {
                "title": "Kubernetes API Architecture & Controller Fundamentals",
                "topics": [
                    {"title": "CustomResourceDefinitions (CRDs)", "youtube_search_query": "Kubernetes CRD custom resource definition tutorial", "subtopics": ["CRD schema design", "OpenAPI v3 validation", "Subresources and status"]},
                    {"title": "Controller-Runtime & Reconcile Loop", "youtube_search_query": "Kubernetes controller-runtime reconcile loop Go", "subtopics": ["Reconciliation loop patterns", "Requeue strategies", "Error handling in reconciliation"]},
                    {"title": "Informers & Listers", "youtube_search_query": "Kubernetes client-go informers listers cache", "subtopics": ["SharedInformerFactory", "Resource caching", "Event handlers and workqueues"]},
                    {"title": "API Machinery & GroupVersionResource", "youtube_search_query": "Kubernetes API machinery GVR GVK Go", "subtopics": ["Group Version Kind vs Group Version Resource", "Type registration", "Scheme management"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A CustomResourceDefinition (CRD) schema manifest and Go struct definition for a DatabaseCluster resource.",
                    "what_counts_as_evidence": "A valid YAML CRD file and matching Go types file with proper OpenAPI v3 validation tags.",
                    "eval_criteria": ["YAML CRD passes kubectl validation check", "Go struct includes proper JSON and protobuf tags"]
                },
                "resources": [
                    {"title": "Kubebuilder Book", "url": "https://book.kubebuilder.io/"},
                    {"title": "Kubernetes API Concepts", "url": "https://kubernetes.io/docs/concepts/overview/kubernetes-api/"}
                ]
            },
            {
                "title": "Scaffolding Operators with Kubebuilder",
                "topics": [
                    {"title": "Kubebuilder Init & API Scaffolding", "youtube_search_query": "Kubebuilder project setup scaffolding tutorial", "subtopics": ["Project initialization", "API creation commands", "Makefile targets"]},
                    {"title": "Controller Reconcile Logic", "youtube_search_query": "Kubebuilder reconcile logic Go example", "subtopics": ["Fetching custom resources", "State inspection", "Idempotent updates"]},
                    {"title": "Managing Child Resources", "youtube_search_query": "Kubernetes operator parent child resource management", "subtopics": ["Creating Deployments and Services", "OwnerReferences and garbage collection", "State comparison"]},
                    {"title": "Status Subresource Updates", "youtube_search_query": "Kubernetes status subresource controller-runtime", "subtopics": ["Updating status conditions", "ObservedGeneration field", "Avoiding update conflicts"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Go controller reconciliation loop that creates and manages a Deployment and Service for each custom resource instance.",
                    "what_counts_as_evidence": "Go source code of the Reconcile function demonstrating child resource creation, OwnerReference setting, and status updates.",
                    "eval_criteria": ["Reconcile loop is idempotent", "Owner references are correctly established on child resources"]
                },
                "resources": [
                    {"title": "Controller Runtime Repository", "url": "https://github.com/kubernetes-sigs/controller-runtime"},
                    {"title": "Operator Pattern Overview", "url": "https://kubernetes.io/docs/concepts/extend-kubernetes/operator/"}
                ]
            },
            {
                "title": "Advanced Operator Patterns & Webhooks",
                "topics": [
                    {"title": "Mutating & Validating Admission Webhooks", "youtube_search_query": "Kubernetes mutating validating webhooks Kubebuilder", "subtopics": ["Admission review requests", "Defaulting webhooks", "Validation webhooks"]},
                    {"title": "Finalizers & External Resource Cleanup", "youtube_search_query": "Kubernetes controller finalizers cleanup pattern", "subtopics": ["Adding finalizers", "DeletionTimestamp handling", "External resource teardown"]},
                    {"title": "Leader Election & High Availability", "youtube_search_query": "Kubernetes operator leader election manager", "subtopics": ["Lease API", "Multi-replica operator deployment", "Split-brain prevention"]},
                    {"title": "Operator Metrics with Prometheus", "youtube_search_query": "Kubernetes operator Prometheus metrics exporter", "subtopics": ["Registering custom metrics", "Controller runtime metrics", "ServiceMonitor resources"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A validating admission webhook implementation and a custom finalizer logic block for graceful cleanup.",
                    "what_counts_as_evidence": "Go code containing webhook validation routines and finalizer add/remove lifecycle handling.",
                    "eval_criteria": ["Webhook rejects invalid field combinations", "Finalizer logic handles DeletionTimestamp without blocking forever"]
                },
                "resources": [
                    {"title": "Kubernetes Admission Webhooks", "url": "https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/"},
                    {"title": "Prometheus Operator Documentation", "url": "https://prometheus-operator.dev/"}
                ]
            },
            {
                "title": "Testing, Packaging & OLM Deployment",
                "topics": [
                    {"title": "Unit & Integration Testing with envtest", "youtube_search_query": "Kubernetes envtest integration testing controller-runtime", "subtopics": ["Setting up envtest control plane", "Writing ginkgo/gomega tests", "Testing reconciliation scenarios"]},
                    {"title": "Packaging with Operator Lifecycle Manager (OLM)", "youtube_search_query": "Operator Lifecycle Manager OLM bundle creation", "subtopics": ["Operator bundle format", "ClusterServiceVersion (CSV) manifest", "CatalogSource integration"]},
                    {"title": "Helm vs Operator Bundle", "youtube_search_query": "Helm chart vs Kubernetes operator comparative guide", "subtopics": ["Comparing deployment models", "Hybrid Helm-operator setups", "Upgrade strategies"]},
                    {"title": "Production Operational Best Practices", "youtube_search_query": "Kubernetes operator production readiness best practices", "subtopics": ["RBAC security scoping", "Rate limiting reconciles", "Memory & CPU profiling"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An integration test suite using envtest that spins up a local control plane and verifies custom resource reconciliation.",
                    "what_counts_as_evidence": "A Go test file (`controller_test.go`) that executes successfully against `envtest`.",
                    "eval_criteria": ["Tests pass without external cluster connection", "Covers creation, update, and deletion scenarios"]
                },
                "resources": [
                    {"title": "OLM Documentation", "url": "https://olm.operatorframework.io/"},
                    {"title": "Kubernetes Testing Framework envtest", "url": "https://pkg.go.dev/sigs.k8s.io/controller-runtime/pkg/envtest"}
                ]
            }
        ]
    },

    # 2. Zero-Knowledge Proofs: From Theory to Circom
    {
        "title": "Zero-Knowledge Proofs: From Theory to Circom",
        "description": "Master zero-knowledge proof concepts, R1CS constraint systems, and write production ZK circuits using Circom and SnarkJS.",
        "subject": "Cryptography & Web3",
        "modules_data": [
            {
                "title": "Foundations of Zero-Knowledge Proofs",
                "topics": [
                    {"title": "Interactive vs Non-Interactive Proofs", "youtube_search_query": "Zero knowledge proofs interactive non-interactive explanation", "subtopics": ["Completeness, soundness, and zero-knowledge", "Fiat-Shamir heuristic", "Common reference string (CRS)"]},
                    {"title": "Homomorphic Encryption & Commitment Schemes", "youtube_search_query": "Pedersen commitment scheme zero knowledge explained", "subtopics": ["Pedersen commitments", "Hiding and binding properties", "Elliptic curve cryptography basics"]},
                    {"title": "Quadratic Arithmetic Programs (QAP)", "youtube_search_query": "Quadratic Arithmetic Programs QAP zkSNARKs", "subtopics": ["Computation to arithmetic circuits", "Rank-1 Constraint Systems (R1CS)", "Polynomial interpolation"]},
                    {"title": "Groth16 vs PLONK Proving Systems", "youtube_search_query": "Groth16 vs PLONK zkSNARK comparison", "subtopics": ["Trusted setup requirements", "Proof size vs verification speed", "Universal vs circuit-specific setups"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python implementation of a Pedersen commitment scheme demonstrating hiding and binding properties.",
                    "what_counts_as_evidence": "A Python script showing commitment generation, opening, and verification.",
                    "eval_criteria": ["Correct mathematical implementation of group operations", "Script successfully verifies matching values and rejects mismatched openings"]
                },
                "resources": [
                    {"title": "Zero Knowledge Proofs Illustrated Primer", "url": "https://zkp.science/"},
                    {"title": "An Approximate Introduction to ZK-SNARKs", "url": "https://vitalik.eth.limo/general/2021/01/26/snarks.html"}
                ]
            },
            {
                "title": "Introduction to Circom Circuit Programming",
                "topics": [
                    {"title": "Circom Language Syntax & Signals", "youtube_search_query": "Circom tutorial beginner circuit programming", "subtopics": ["Input, output, and intermediate signals", "Assignments vs constraints", "Signal visibility rules"]},
                    {"title": "Linear & Non-Linear Constraints", "youtube_search_query": "Circom constraints quadratic constraint rules", "subtopics": ["Quadratic constraint restrictions (`<==`, `===`)", "Handling non-quadratic operations", "Bitwise operation constraints"]},
                    {"title": "Building Reusable Templates", "youtube_search_query": "Circom templates components parameterization", "subtopics": ["Template definitions", "Component instantiation", "Parameterized circuits"]},
                    {"title": "Circom Compiler Setup & Workflow", "youtube_search_query": "Circom setup build workflow tutorial", "subtopics": ["Compiling to R1CS and Wasm", "Witness generation", "Inspecting constraint counts"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Circom circuit template that proves knowledge of two secret factors $a$ and $b$ for a public product $c = a \\times b$.",
                    "what_counts_as_evidence": "A `.circom` circuit file and generated witness input JSON file.",
                    "eval_criteria": ["Circuit compiles with 0 error warnings", "Proper separation of public and private inputs"]
                },
                "resources": [
                    {"title": "Circom 2 Documentation", "url": "https://docs.circom.io/"},
                    {"title": "SnarkJS GitHub Repository", "url": "https://github.com/iden3/snarkjs"}
                ]
            },
            {
                "title": "Building Complex Circuits & Hash Functions",
                "topics": [
                    {"title": "Merkle Tree Verification Circuits", "youtube_search_query": "Circom Merkle tree verification circuit tutorial", "subtopics": ["Merkle path verification", "Multiplexer components", "Tree depth parameters"]},
                    {"title": "Poseidon Hash Function in Circom", "youtube_search_query": "Poseidon hash function zero knowledge Circom", "subtopics": ["SNARK-friendly hash functions", "circomlib library usage", "Constants and S-box rounds"]},
                    {"title": "Range Proofs & Binary Comparison", "youtube_search_query": "Circom LessThan GreaterThan binary comparison circuit", "subtopics": ["Bit decomposition (`Num2Bits`)", "LessThan component", "Range check constraints"]},
                    {"title": "Signal Arrays & Loop Unrolling", "youtube_search_query": "Circom arrays loops circuit optimization", "subtopics": ["Array signal declarations", "For loops in circuit generation", "Minimizing total constraints"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Merkle proof verification circuit in Circom using `circomlib` Poseidon hashing.",
                    "what_counts_as_evidence": "A Circom circuit file that accepts leaf, root, path elements, and index, verifying root matching.",
                    "eval_criteria": ["Correct imports from circomlib", "Successfully validates leaf membership in a depth-4 tree"]
                },
                "resources": [
                    {"title": "circomlib Component Library", "url": "https://github.com/iden3/circomlib"},
                    {"title": "Poseidon Hash Paper", "url": "https://eprint.iacr.org/2019/458"}
                ]
            },
            {
                "title": "Proof Generation, Verification & Smart Contract Integration",
                "topics": [
                    {"title": "SnarkJS CLI Tooling & Powers of Tau", "youtube_search_query": "SnarkJS Powers of Tau ceremony setup tutorial", "subtopics": ["Ceremony phase 1 and phase 2", "zkey file generation", "Exporting verification keys"]},
                    {"title": "Generating Proofs & Public Signals", "youtube_search_query": "SnarkJS generate proof full prove JavaScript", "subtopics": ["Generating proof JSON", "Public inputs formatting", "Off-chain verification"]},
                    {"title": "Solidity Verifier Generation", "youtube_search_query": "SnarkJS export solidity verifier contract", "subtopics": ["Exporting Solidity contract", "Calldata generation", "Gas cost considerations"]},
                    {"title": "Off-Chain Proving & On-Chain Verification", "youtube_search_query": "Integration test Solidity verifier contract ethers.js", "subtopics": ["Ethers.js / Viem integration", "On-chain verification calls", "Privacy application architecture"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An end-to-end integration script that generates a proof with SnarkJS and verifies it using an exported Solidity verifier contract.",
                    "what_counts_as_evidence": "A JavaScript/TypeScript script and Solidity verifier file running against a local EVM network (e.g. Hardhat / Anvil).",
                    "eval_criteria": ["Proof generation completes without error", "Solidity contract `verifyProof` returns true for valid calldata"]
                },
                "resources": [
                    {"title": "Hardhat ZK Documentation", "url": "https://hardhat.org/docs"},
                    {"title": "Ethereum Foundation ZK-SNARK Tutorials", "url": "https://ethereum.org/en/developers/docs/scaling/zk-rollups/"}
                ]
            }
        ]
    },

    # 3. WebGPU: Next-Gen Browser Graphics
    {
        "title": "WebGPU: Next-Gen Browser Graphics",
        "description": "Learn modern GPU programming in the browser using WebGPU, WGSL shading language, compute pipelines, and real-time rendering.",
        "subject": "Graphics Programming",
        "modules_data": [
            {
                "title": "WebGPU Architecture & Context Setup",
                "topics": [
                    {"title": "WebGPU vs WebGL Differences", "youtube_search_query": "WebGPU vs WebGL architecture explained", "subtopics": ["Explicit GPU control model", "Command buffers and queues", "Asynchronous state management"]},
                    {"title": "Adapter & Device Requesting", "youtube_search_query": "WebGPU requestAdapter requestDevice JavaScript tutorial", "subtopics": ["navigator.gpu API", "Adapter selection", "Device limits and features"]},
                    {"title": "Canvas Context Configuration", "youtube_search_query": "WebGPU canvas context configuration tutorial", "subtopics": ["GPUCanvasContext", "Preferred format selection", "Alpha mode settings"]},
                    {"title": "GPU Buffers & Memory Layout", "youtube_search_query": "WebGPU createBuffer buffer usage mapped at creation", "subtopics": ["GPUBufferUsage flags", "Staging buffers & writeBuffer", "Memory alignment and padding"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A minimal WebGPU initialization script that sets up a canvas context and allocates GPU vertex buffers for a 2D mesh.",
                    "what_counts_as_evidence": "An HTML/JS file initializing `navigator.gpu`, requesting device, and populating a vertex buffer.",
                    "eval_criteria": ["Proper feature checking for WebGPU support", "Correct usage of GPUBufferUsage flags"]
                },
                "resources": [
                    {"title": "W3C WebGPU Specification", "url": "https://www.w3.org/TR/webgpu/"},
                    {"title": "MDN WebGPU API Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API"}
                ]
            },
            {
                "title": "WGSL & Render Pipelines",
                "topics": [
                    {"title": "WGSL Shader Syntax", "youtube_search_query": "WGSL WebGPU shading language tutorial", "subtopics": ["Structs and variables", "Vertex and fragment stage annotations", "Vector and matrix math"]},
                    {"title": "Vertex & Fragment Pipelines", "youtube_search_query": "WebGPU createRenderPipeline vertex fragment tutorial", "subtopics": ["GPURenderPipelineDescriptor", "Vertex attribute layout", "Color target state"]},
                    {"title": "Uniforms & Bind Groups", "youtube_search_query": "WebGPU bind groups uniform buffers WGSL", "subtopics": ["GPUBindGroupLayout", "GPUBindGroup creation", "Passing transformation matrices"]},
                    {"title": "Depth Stencil & Rasterization States", "youtube_search_query": "WebGPU depth stencil texture render pass", "subtopics": ["Depth texture creation", "Cull modes and front face", "Depth comparison functions"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A WGSL shader script and render pipeline that renders a rotating 3D colored object using a uniform buffer for time/transforms.",
                    "what_counts_as_evidence": "A complete rendering script displaying a rotating object on a canvas.",
                    "eval_criteria": ["WGSL shaders compile without errors", "Uniform buffer updates per frame in render loop"]
                },
                "resources": [
                    {"title": "WGSL Language Specification", "url": "https://www.w3.org/TR/WGSL/"},
                    {"title": "WebGPU Samples Repository", "url": "https://webgpu.github.io/webgpu-samples/"}
                ]
            },
            {
                "title": "Compute Shaders & GPU Parallel Processing",
                "topics": [
                    {"title": "Compute Pipelines & Workgroups", "youtube_search_query": "WebGPU compute pipeline workgroups WGSL", "subtopics": ["GPUComputePipeline", "`@workgroup_size` annotation", "Global and local invocation IDs"]},
                    {"title": "Storage Buffers & Atomic Operations", "youtube_search_query": "WebGPU storage buffer read write WGSL compute", "subtopics": ["Read-write storage buffers", "Atomic operations (`atomicAdd`)", "Data packing in WGSL"]},
                    {"title": "Particle Simulations on GPU", "youtube_search_query": "WebGPU compute particle simulation tutorial", "subtopics": ["Particle state buffers", "Position and velocity update pass", "Ping-pong buffer techniques"]},
                    {"title": "Reading Data Back to CPU", "youtube_search_query": "WebGPU read storage buffer back to CPU mapAsync", "subtopics": ["MapMode.READ staging buffers", "Async GPU readback", "ArrayBuffer parsing"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A WebGPU compute pipeline that updates 10,000 particle positions on the GPU and draws them using a shared storage buffer.",
                    "what_counts_as_evidence": "A working WebGPU page demonstrating high-count particle movement powered by a compute shader.",
                    "eval_criteria": ["Compute dispatch workgroups calculated correctly", "No CPU bottleneck in frame render loop"]
                },
                "resources": [
                    {"title": "WebGPU Fundamentals Guide", "url": "https://webgpufundamentals.org/"},
                    {"title": "GPU Compute Explained", "url": "https://surma.dev/things/webgpu/"}
                ]
            },
            {
                "title": "Advanced Rendering: Textures & Post-Processing",
                "topics": [
                    {"title": "Texture Loading & Samplers", "youtube_search_query": "WebGPU createTexture createSampler WGSL", "subtopics": ["GPUTextureDescriptor", "Address modes and filtering", "Mipmap generation"]},
                    {"title": "Framebuffer Attachments & Render Passes", "youtube_search_query": "WebGPU offscreen render pass framebuffer", "subtopics": ["Render pass encoders", "Multiple render targets (MRT)", "Clear value configurations"]},
                    {"title": "Deferred Shading Pipelines", "youtube_search_query": "WebGPU deferred shading G-buffer tutorial", "subtopics": ["G-buffer layout", "Geometry vs lighting passes", "Screen-space calculations"]},
                    {"title": "Post-Processing Filters", "youtube_search_query": "WebGPU post processing fullscreen quad shader", "subtopics": ["Fullscreen triangle technique", "Kernel convolution / blur", "Color grading shaders"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An offscreen render pass and post-processing pipeline that renders a scene to a texture and applies a blur/sepia filter.",
                    "what_counts_as_evidence": "JS and WGSL code implementing two-pass rendering with intermediate texture bindings.",
                    "eval_criteria": ["First pass writes to custom GPUTexture", "Second pass reads texture and renders processed output"]
                },
                "resources": [
                    {"title": "WebGPU Best Practices Guide", "url": "https://toji.dev/webgpu-best-practices/"},
                    {"title": "Chromium WebGPU Developer Docs", "url": "https://developer.chrome.com/docs/web-platform/webgpu"}
                ]
            }
        ]
    },

    # 4. Edge Computing with Cloudflare Workers
    {
        "title": "Edge Computing with Cloudflare Workers",
        "description": "Build serverless applications at the edge using Cloudflare Workers, V8 Isolates, KV storage, Durable Objects, and Hyperdrive.",
        "subject": "Cloud Architecture",
        "modules_data": [
            {
                "title": "Edge Architecture & V8 Isolates",
                "topics": [
                    {"title": "Node.js/Containers vs V8 Isolates", "youtube_search_query": "V8 isolates vs Docker containers Cloudflare Workers", "subtopics": ["Cold start differences", "Memory allocation model", "Security isolation in V8"]},
                    {"title": "Fetch Event Handler Model", "youtube_search_query": "Cloudflare Workers fetch event handler request response", "subtopics": ["Request/Response Web APIs", "Context waitUntil execution", "Streaming responses"]},
                    {"title": "Wrangler CLI & Project Setup", "youtube_search_query": "Wrangler CLI Cloudflare Workers TypeScript setup", "subtopics": ["wrangler.toml configuration", "Environment bindings", "Local dev server (`wrangler dev`)"]},
                    {"title": "Request/Response Routing at Edge", "youtube_search_query": "Cloudflare Workers router Hono framework", "subtopics": ["Hono / Itty-router usage", "Inspecting CF geo headers", "Custom header mutation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Cloudflare Worker written in TypeScript that inspects incoming request headers, client IP, and geolocation to route responses.",
                    "what_counts_as_evidence": "A `index.ts` worker script and `wrangler.toml` configuration file.",
                    "eval_criteria": ["Script uses standard Web API Request/Response objects", "Local testing with `wrangler dev` executes cleanly"]
                },
                "resources": [
                    {"title": "Cloudflare Workers Documentation", "url": "https://developers.cloudflare.com/workers/"},
                    {"title": "Wrangler CLI Reference", "url": "https://developers.cloudflare.com/workers/wrangler/"}
                ]
            },
            {
                "title": "Edge Storage: Workers KV & D1 Database",
                "topics": [
                    {"title": "Workers KV Read/Write Performance", "youtube_search_query": "Cloudflare Workers KV storage read write tutorial", "subtopics": ["Eventually consistent read model", "Key expiration and TTL", "Bulk KV operations"]},
                    {"title": "Cloudflare D1 Serverless SQL", "youtube_search_query": "Cloudflare D1 database SQL queries Wrangler", "subtopics": ["SQLite at the edge", "Prepared statements and bindings", "Schema migrations with Wrangler"]},
                    {"title": "Cache API & Edge Caching Rules", "youtube_search_query": "Cloudflare Workers Cache API custom caching", "subtopics": ["caches.default interface", "Cache-Control header tuning", "Bypassing edge cache"]},
                    {"title": "Asset Binding & Static Hosting", "youtube_search_query": "Cloudflare Workers static assets hosting", "subtopics": ["Workers Assets binding", "Single Page App fallback", "MIME type handling"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An edge rate-limiting middleware backed by Workers KV that tracks client IP requests per time window.",
                    "what_counts_as_evidence": "Worker code utilizing `env.KV_NAMESPACE.get()` and `.put()` with TTL settings.",
                    "eval_criteria": ["Correctly increments request count per IP", "Enforces 429 status code when threshold is exceeded"]
                },
                "resources": [
                    {"title": "Workers KV Documentation", "url": "https://developers.cloudflare.com/kv/"},
                    {"title": "Cloudflare D1 Database Docs", "url": "https://developers.cloudflare.com/d1/"}
                ]
            },
            {
                "title": "Stateful Edge Computing with Durable Objects",
                "topics": [
                    {"title": "Durable Object Lifecycle & Memory Persistence", "youtube_search_query": "Cloudflare Durable Objects tutorial stateful edge", "subtopics": ["Single-instance guarantees", "In-memory state vs storage API", "Class structure and constructor"]},
                    {"title": "WebSocket Connections at Edge", "youtube_search_query": "Cloudflare Workers WebSockets Durable Objects real-time", "subtopics": ["WebSocket pair hibernation API", "Message broadcasting", "Connection state tracking"]},
                    {"title": "Transactional Storage API", "youtube_search_query": "Durable Objects transaction storage API JavaScript", "subtopics": ["Atomic storage reads and writes", "List and deleteAll methods", "In-memory caching patterns"]},
                    {"title": "Single-Concurrency Model", "youtube_search_query": "Durable Objects concurrency lock guarantee explained", "subtopics": ["Single-threaded execution guarantees", "Avoiding race conditions", "Alarm API for scheduled tasks"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A real-time collaborative state coordinator using Cloudflare Durable Objects and WebSockets.",
                    "what_counts_as_evidence": "A TypeScript file defining a `DurableObject` class handling WebSocket handshakes and state sync.",
                    "eval_criteria": ["Uses WebSocket Hibernation API for resource efficiency", "Maintains consistent in-memory state across updates"]
                },
                "resources": [
                    {"title": "Durable Objects Documentation", "url": "https://developers.cloudflare.com/durable-objects/"},
                    {"title": "Cloudflare WebSocket API Guide", "url": "https://developers.cloudflare.com/workers/runtime-apis/websockets/"}
                ]
            },
            {
                "title": "Advanced Integration: Vectorize & Hyperdrive",
                "topics": [
                    {"title": "Cloudflare Vectorize for Embeddings", "youtube_search_query": "Cloudflare Vectorize vector database RAG edge", "subtopics": ["Vector index creation", "Querying nearest neighbors", "Integration with Workers AI"]},
                    {"title": "Hyperdrive for Postgres Connection Pooling", "youtube_search_query": "Cloudflare Hyperdrive PostgreSQL connection pooling", "subtopics": ["Connection pooling across regions", "Database query caching", "TCP socket acceleration"]},
                    {"title": "Smart Placement & Global Routing", "youtube_search_query": "Cloudflare Workers Smart Placement latency optimization", "subtopics": ["Automatic backend placement", "Reducing round-trip latency", "Routing decisions"]},
                    {"title": "Edge Observability & Logging", "youtube_search_query": "Cloudflare Workers Tail logs logging analytics", "subtopics": ["`wrangler tail` debugging", "Logpush integrations", "Custom tracing headers"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A latency-optimized API worker connecting to an external database via Hyperdrive and utilizing Workers KV for caching.",
                    "what_counts_as_evidence": "TypeScript worker source code configured with Hyperdrive bindings.",
                    "eval_criteria": ["Hyperdrive binding properly called in database query path", "Implements fallback caching layer"]
                },
                "resources": [
                    {"title": "Cloudflare Hyperdrive Docs", "url": "https://developers.cloudflare.com/hyperdrive/"},
                    {"title": "Cloudflare Vectorize Documentation", "url": "https://developers.cloudflare.com/vectorize/"}
                ]
            }
        ]
    },

    # 5. Multi-Agent Orchestration Patterns
    {
        "title": "Multi-Agent Orchestration Patterns",
        "description": "Design, orchestrate, and debug multi-agent AI systems using hierarchical routing, shared state, and consensus mechanisms.",
        "subject": "AI/ML",
        "modules_data": [
            {
                "title": "Multi-Agent System Fundamentals",
                "topics": [
                    {"title": "Single Agent vs Multi-Agent Systems", "youtube_search_query": "Multi agent AI systems architecture patterns", "subtopics": ["Specialization vs single prompt", "Context window management", "Decomposing complex tasks"]},
                    {"title": "Agent Communication Protocols", "youtube_search_query": "Agent to agent communication protocol LLM", "subtopics": ["Structured messaging formats", "Role definitions", "Turn-taking and routing"]},
                    {"title": "Message Bus vs Direct Handoff", "youtube_search_query": "Agent messaging event bus vs direct handoff", "subtopics": ["Asynchronous event channels", "Direct function delegation", "Topic-based routing"]},
                    {"title": "State & Context Propagation", "youtube_search_query": "Multi agent shared state graph state propagation", "subtopics": ["Global state objects", "Selective context passing", "State immutability"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A two-agent pipeline in Python (Researcher and Writer) where the Researcher outputs structured notes that the Writer converts into an article.",
                    "what_counts_as_evidence": "A Python script orchestrating the prompt flow between two distinct agent configurations.",
                    "eval_criteria": ["Researcher output is schema-validated before passing to Writer", "Context remains clean across handoff"]
                },
                "resources": [
                    {"title": "LangGraph Documentation", "url": "https://langchain-ai.github.io/langgraph/"},
                    {"title": "AutoGen Framework", "url": "https://microsoft.github.io/autogen/"}
                ]
            },
            {
                "title": "Orchestration Topologies",
                "topics": [
                    {"title": "Hierarchical Manager-Worker Pattern", "youtube_search_query": "Manager worker multi agent pattern tutorial", "subtopics": ["Supervisor agent role", "Task delegation logic", "Aggregating sub-agent results"]},
                    {"title": "Peer-to-Peer Agent Swarms", "youtube_search_query": "Swarm multi agent architecture OpenAI swarm", "subtopics": ["Decentralized handoffs", "Active agent state transfer", "Dynamic agent selection"]},
                    {"title": "Sequential & Pipeline Chains", "youtube_search_query": "Sequential agent pipeline architecture LLM", "subtopics": ["Linear workflow graphs", "Input-output validation nodes", "Conditional branching"]},
                    {"title": "Dynamic Router & Evaluator Patterns", "youtube_search_query": "LLM router agent intent classification pattern", "subtopics": ["Intent-based dispatch", "Fallback agents", "Evaluating route confidence"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A manager-router agent system in Python that classifies incoming requests and dispatches them to appropriate specialized worker agents.",
                    "what_counts_as_evidence": "Python source code implementing a router supervisor with at least 3 specialized worker sub-agents.",
                    "eval_criteria": ["Supervisor correctly categorizes input prompts", "Sub-agents handle domain tasks independently"]
                },
                "resources": [
                    {"title": "OpenAI Swarm Repository", "url": "https://github.com/openai/swarm"},
                    {"title": "CrewAI Framework Docs", "url": "https://docs.crewai.com/"}
                ]
            },
            {
                "title": "Shared Memory & Tool Access Control",
                "topics": [
                    {"title": "Global vs Agent-Specific Memory", "youtube_search_query": "Multi agent memory management vector store context", "subtopics": ["Private memory stores", "Shared blackboard state", "Short-term vs long-term memory"]},
                    {"title": "Tool Delegation & Scope Control", "youtube_search_query": "LLM tool authorization agent permissions", "subtopics": ["Restricting tool permissions per agent", "Tool execution sandboxing", "Handling tool errors"]},
                    {"title": "Concurrency & Locking in State Updates", "youtube_search_query": "Concurrent multi agent state updates async locking", "subtopics": ["Async locks in agent loops", "Avoiding state corruption", "Conflict resolution strategies"]},
                    {"title": "Memory Truncation & Summarization", "youtube_search_query": "LLM memory summarization window truncation strategy", "subtopics": ["Automated summary nodes", "Pruning historical messages", "Token budget allocation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A shared memory blackboard state manager in Python with locking mechanisms for concurrent agent access.",
                    "what_counts_as_evidence": "A Python class (`SharedAgentMemory`) supporting thread/async safe reads, writes, and auto-summarization.",
                    "eval_criteria": ["Async lock prevents concurrent write race conditions", "Memory truncation operates within fixed token limit"]
                },
                "resources": [
                    {"title": "MemGPT / Letta Framework", "url": "https://www.letta.com/"},
                    {"title": "LlamaIndex Multi-Agent Workflows", "url": "https://docs.llamaindex.ai/"}
                ]
            },
            {
                "title": "Consensus, Verification & Error Recovery",
                "topics": [
                    {"title": "Voting & Consensus Protocols among Agents", "youtube_search_query": "Multi agent consensus voting LLM debate", "subtopics": ["Majority voting mechanisms", "Multi-agent debate protocols", "Weighted confidence scores"]},
                    {"title": "Self-Correction & Reflection Loops", "youtube_search_query": "LLM reflection agent self-correction loop pattern", "subtopics": ["Critic agent evaluation", "Iterative refinement", "Stopping criteria"]},
                    {"title": "Handling Deadlocks & Infinite Agent Loops", "youtube_search_query": "Debugging multi agent infinite loops safety limits", "subtopics": ["Recursion limits and max steps", "Loop detection heuristics", "Timeout enforcement"]},
                    {"title": "Telemetry & Tracing for Multi-Agent Workflows", "youtube_search_query": "OpenTelemetry tracing multi agent LLM execution", "subtopics": ["Trace spans per agent step", "Latency and token tracking", "Debugging agent execution graphs"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A multi-agent debate and consensus system where two agents argue opposing sides and a judge agent computes a consensus score.",
                    "what_counts_as_evidence": "Python script orchestrating a multi-turn debate with termination conditions.",
                    "eval_criteria": ["Execution terminates cleanly within max turn threshold", "Judge agent outputs structured final report"]
                },
                "resources": [
                    {"title": "LangSmith Tracing Guide", "url": "https://docs.smith.langchain.com/"},
                    {"title": "Multi-Agent Debate Research Paper", "url": "https://arxiv.org/abs/2305.14325"}
                ]
            }
        ]
    },

    # 6. Building Neovim Plugins in Lua
    {
        "title": "Building Neovim Plugins in Lua",
        "description": "Extend Neovim using its native Lua API, custom syntax highlights, autocommands, user commands, and LSP integrations.",
        "subject": "Developer Tooling",
        "modules_data": [
            {
                "title": "Lua Fundamentals in Neovim",
                "topics": [
                    {"title": "Neovim Lua API Overview", "youtube_search_query": "Neovim Lua plugin development tutorial beginner", "subtopics": ["`vim.api`, `vim.fn`, `vim.opt` usage", "Lua runtimepath and `lua/` folder", "Requiring local modules"]},
                    {"title": "Plugin Directory Structure", "youtube_search_query": "Neovim plugin file structure lazy.nvim", "subtopics": ["`plugin/` vs `lua/` directories", "Entrypoints (`init.lua`)", "Lazy loading compatibility"]},
                    {"title": "Keymap Mapping API", "youtube_search_query": "vim.keymap.set Neovim Lua keybindings", "subtopics": ["`vim.keymap.set` syntax", "Buffer-local keymaps", "Mode flags (`n`, `i`, `v`, `x`)"]},
                    {"title": "Plugin Configuration Setup", "youtube_search_query": "Neovim plugin setup function options pattern", "subtopics": ["Writing a `M.setup(user_opts)` function", "Merging default options", "Exposing module functions"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A minimal Neovim Lua plugin structure with a standard `lua/myplugin/init.lua` exposing a configurable `setup()` function.",
                    "what_counts_as_evidence": "Directory tree and Lua source files implementing option defaults and custom keymaps.",
                    "eval_criteria": ["Follows standard Neovim Lua module convention", "`setup()` correctly overrides default options"]
                },
                "resources": [
                    {"title": "Neovim Lua Guide", "url": "https://neovim.io/doc/user/lua-guide.html"},
                    {"title": "nvim-lua-guide on GitHub", "url": "https://github.com/nanotehee/nvim-lua-guide"}
                ]
            },
            {
                "title": "UI Elements & Buffer Manipulations",
                "topics": [
                    {"title": "Creating & Managing Floating Windows", "youtube_search_query": "Neovim vim.api.nvim_open_win floating window Lua", "subtopics": ["`nvim_create_buf` and `nvim_open_win`", "Window configuration (border, relative, row, col)", "Closing and cleanup"]},
                    {"title": "Virtual Text & Extmarks", "youtube_search_query": "Neovim extmarks virtual text vim.api.nvim_buf_set_extmark", "subtopics": ["Namespaces (`nvim_create_namespace`)", "Extmark positioning and options", "Inline vs overlay virtual text"]},
                    {"title": "Buffer Text Editing API", "youtube_search_query": "Neovim nvim_buf_get_lines nvim_buf_set_lines Lua", "subtopics": ["Getting and setting line arrays", "Cursor position tracking", "Atomic buffer edits"]},
                    {"title": "Statusline & Winbar Integration", "youtube_search_query": "Neovim custom statusline winbar Lua tutorial", "subtopics": ["Statusline string formatting", "Highlight groups in statusline", "Active vs inactive window styles"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Neovim Lua plugin command that opens a floating window displaying active buffer metadata (line count, word count, filetype).",
                    "what_counts_as_evidence": "Lua plugin file containing floating window creation and buffer text population logic.",
                    "eval_criteria": ["Floating window centers dynamically", "Keymap inside floating buffer allows pressing 'q' to close window"]
                },
                "resources": [
                    {"title": "Neovim API Documentation (`:help api`)", "url": "https://neovim.io/doc/user/api.html"},
                    {"title": "Devicon and UI Utilities for Neovim", "url": "https://github.com/kyazdani42/nvim-web-devicons"}
                ]
            },
            {
                "title": "Autocommands, User Commands & Events",
                "topics": [
                    {"title": "Creating Autocommand Groups", "youtube_search_query": "Neovim nvim_create_augroup nvim_create_autocmd Lua", "subtopics": ["`nvim_create_augroup` for clean reloading", "Event triggers (`BufWritePost`, `FileType`)", "Pattern and buffer filtering"]},
                    {"title": "Custom User Commands", "youtube_search_query": "Neovim nvim_create_user_command Lua command arguments", "subtopics": ["`nvim_create_user_command` syntax", "Parsing command arguments (`opts.args`, `opts.fargs`)", "Command completion handlers"]},
                    {"title": "Async Operations with `vim.uv` / `vim.loop`", "youtube_search_query": "Neovim libuv vim.loop async subprocess Lua", "subtopics": ["Libuv async timers and processes", "Spawning external CLI commands", "Handling stdout/stderr callbacks"]},
                    {"title": "Notification & Progress Displays", "youtube_search_query": "Neovim vim.notify custom notification handler", "subtopics": ["`vim.notify` API levels", "Integrating nvim-notify", "Progress spinners for background tasks"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Neovim plugin autocommand that runs an external CLI linter asynchronously via `vim.uv.spawn` on file save and highlights errors.",
                    "what_counts_as_evidence": "Lua plugin source code creating an augroup and invoking an async process.",
                    "eval_criteria": ["Process execution does not freeze Neovim UI thread", "Stdout/stderr output is safely parsed on completion"]
                },
                "resources": [
                    {"title": "Neovim Autocmd Guide (`:help autocommand`)", "url": "https://neovim.io/doc/user/autocmd.html"},
                    {"title": "Luvit / Libuv Documentation for Neovim", "url": "https://github.com/luvit/luv"}
                ]
            },
            {
                "title": "Treesitter & LSP Integration",
                "topics": [
                    {"title": "Interacting with Neovim Treesitter AST", "youtube_search_query": "Neovim Treesitter query AST Lua tutorial", "subtopics": ["`vim.treesitter` API", "Parsing syntax trees and nodes", "Writing custom Scheme queries"]},
                    {"title": "Custom LSP Diagnostics & Attach Handlers", "youtube_search_query": "Neovim LSP client custom diagnostics Lua", "subtopics": ["`vim.diagnostic` namespace", "Publishing custom diagnostics", "Extending LSP `on_attach` handlers"]},
                    {"title": "Telescope / Picker Extensions", "youtube_search_query": "Building custom Telescope extension Neovim Lua", "subtopics": ["Creating Telescope pickers", "Custom entry makers and displayers", "Action handlers"]},
                    {"title": "Publishing & Lazy.nvim Compatibility", "youtube_search_query": "Publishing Neovim plugin GitHub lazy.nvim setup", "subtopics": ["Structuring repo metadata", "Docgen with panvimdoc", "Adding plugin to lazy.nvim spec"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Neovim plugin that queries Treesitter to list all function definitions in the current buffer and populate a quickfix list.",
                    "what_counts_as_evidence": "Lua file executing a Treesitter query and invoking `vim.fn.setqflist()`.",
                    "eval_criteria": ["Queries active Treesitter parser correctly", "Populates quickfix list with function names and line numbers"]
                },
                "resources": [
                    {"title": "nvim-treesitter Documentation", "url": "https://github.com/nvim-treesitter/nvim-treesitter"},
                    {"title": "Telescope Developer Guide", "url": "https://github.com/nvim-telescope/telescope.nvim/blob/master/DEVELOPERS.md"}
                ]
            }
        ]
    },

    # 7. V8 Engine Internals: Hidden Classes & JIT
    {
        "title": "V8 Engine Internals: Hidden Classes & JIT",
        "description": "Understand why some JavaScript patterns are 10x slower than others by exploring V8 hidden classes, inline caches, and JIT compilation.",
        "subject": "JavaScript Performance",
        "modules_data": [
            {
                "title": "V8 Architecture & Execution Pipeline",
                "topics": [
                    {"title": "Parse Tree to AST", "youtube_search_query": "V8 JavaScript engine AST parsing pipeline", "subtopics": ["Scanner and parser stages", "Lazy vs eager parsing", "AST representation in memory"]},
                    {"title": "Ignition Interpreter & Bytecode", "youtube_search_query": "V8 Ignition interpreter bytecode tutorial", "subtopics": ["Register-based bytecode architecture", "Accumulator register pattern", "Inspecting bytecode via `--print-bytecode`"]},
                    {"title": "TurboFan JIT Compiler Workflow", "youtube_search_query": "V8 TurboFan JIT compiler optimization explanation", "subtopics": ["Sea-of-nodes representation", "Speculative optimization pass", "Code generation for target CPU"]},
                    {"title": "Memory Heap Structure & Pointer Tagging", "youtube_search_query": "V8 heap memory layout pointer tagging smi", "subtopics": ["Small integers (Smi) vs HeapObjects", "Pointer tagging mechanism", "Young generation vs Old generation heap"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Node.js script run with `--print-bytecode` flags, accompanying a written analysis breakdown of the generated Ignition bytecode.",
                    "what_counts_as_evidence": "A markdown analysis document and script that outputs bytecode for basic loops.",
                    "eval_criteria": ["Accurately identifies accumulator register operations", "Explains bytecode instructions line by line"]
                },
                "resources": [
                    {"title": "V8 Engine Official Blog", "url": "https://v8.dev/blog"},
                    {"title": "V8 Tour: Ignition Interpreter", "url": "https://v8.dev/docs/ignition"}
                ]
            },
            {
                "title": "Hidden Classes (Shapes) & Transition Trees",
                "topics": [
                    {"title": "What are Hidden Classes / Maps", "youtube_search_query": "V8 hidden classes maps shapes JavaScript", "subtopics": ["Why dynamic objects need fixed maps", "Property offset lookup tables", "Sharing maps across instances"]},
                    {"title": "Property Storage Models", "youtube_search_query": "V8 property storage in-object fast dictionary properties", "subtopics": ["In-object properties", "Fast properties (out-of-object array)", "Slow/Dictionary properties"]},
                    {"title": "Hidden Class Transitions", "youtube_search_query": "V8 hidden class transition tree diagram explained", "subtopics": ["Constructor property order", "Transition tree branching", "Map deprecation and migration"]},
                    {"title": "Deoptimizations caused by Property Order", "youtube_search_query": "V8 hidden class mismatch property order performance", "subtopics": ["Differing initialization orders", "Map pollution", "Performance impact benchmarks"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A benchmark suite in Node.js comparing property access times for objects initialized with consistent vs inconsistent hidden class transition orders.",
                    "what_counts_as_evidence": "A Node.js script using `console.time` / `benchmark.js` demonstrating performance degradation when property creation order varies.",
                    "eval_criteria": ["Demonstrates statistically significant timing difference", "Identifies hidden class map creation differences using V8 internal flags"]
                },
                "resources": [
                    {"title": "V8 Shapes / Hidden Classes Docs", "url": "https://v8.dev/blog/fast-properties"},
                    {"title": "Mathias Bynens: Shapes and Inline Caches", "url": "https://mathiasbynens.be/notes/shapes-ics"}
                ]
            },
            {
                "title": "Inline Caches (IC) & Monomorphism",
                "topics": [
                    {"title": "Monomorphic, Polymorphic, and Megamorphic States", "youtube_search_query": "Inline caching V8 monomorphic polymorphic megamorphic", "subtopics": ["IC stub state machine", "Feedback vector entries", "Megamorphic stub degradation"]},
                    {"title": "How ICs Speed Up Property Access", "youtube_search_query": "V8 inline cache property lookup mechanism", "subtopics": ["Caching object map and offset", "Avoiding hash table lookups", "Call site IC feedback"]},
                    {"title": "Call Site Optimization", "youtube_search_query": "V8 function call site optimization JIT", "subtopics": ["Function target feedback", "Inlining small functions", "Polymorphic call site penalties"]},
                    {"title": "Diagnosing IC Failures with V8 Flags", "youtube_search_query": "V8 trace-ic nodejs flags debugging", "subtopics": ["Using `--trace-ic` flag", "Parsing IC log outputs", "Refactoring code to restore monomorphism"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A set of test functions demonstrating monomorphic vs megamorphic IC states, analyzed using `node --trace-ic`.",
                    "what_counts_as_evidence": "A Node.js file and log output showing the transition of call sites from monomorphic to megamorphic.",
                    "eval_criteria": ["Log output verifies monomorphic vs megamorphic state tagging", "Code illustrates fix to maintain monomorphic performance"]
                },
                "resources": [
                    {"title": "V8 Feedback Vector Documentation", "url": "https://v8.dev/blog/real-world-performance"},
                    {"title": "Node.js V8 Engine Flags Reference", "url": "https://nodejs.org/api/v8.html"}
                ]
            },
            {
                "title": "TurboFan JIT Optimizations & Deoptimizations",
                "topics": [
                    {"title": "Type Feedback & Speculative Optimization", "youtube_search_query": "V8 TurboFan type feedback speculative optimization", "subtopics": ["Collecting feedback during interpreted execution", "Optimistic type assumptions", "Generating machine code"]},
                    {"title": "Sea of Nodes Intermediate Representation", "youtube_search_query": "V8 TurboFan sea of nodes IR representation", "subtopics": ["Combining control flow and data flow", "Node reduction passes", "Dead code elimination"]},
                    {"title": "Common Deoptimization Causes", "youtube_search_query": "V8 deoptimization causes bailouts JavaScript", "subtopics": ["Type mismatch during optimized execution", "Bailout to Ignition interpreter", "Soft vs hard deoptimizations"]},
                    {"title": "Memory Layout & Garbage Collection Hooks", "youtube_search_query": "V8 garbage collection write barrier JIT code", "subtopics": ["Write barriers in generated code", "GC safepoints", "Impact of object allocation in hot loops"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A JavaScript script designed to trigger a TurboFan JIT deoptimization in a hot loop, verified via `node --trace-opt --trace-deopt`.",
                    "what_counts_as_evidence": "Script source code and trace output highlighting the exact line causing deoptimization.",
                    "eval_criteria": ["Trace output shows `[deoptimizing ...]`, explaining reason", "Provided refactored script eliminates the deoptimization trigger"]
                },
                "resources": [
                    {"title": "TurboFan Architecture Overview", "url": "https://v8.dev/docs/turbofan"},
                    {"title": "Deoptimizing V8 Code Guide", "url": "https://github.com/petkaantonov/bluebird/wiki/Optimization-killers"}
                ]
            }
        ]
    },

    # 8. Building Custom GitHub Actions
    {
        "title": "Building Custom GitHub Actions",
        "description": "Develop custom GitHub Actions using JavaScript/TypeScript and Docker containers with action metadata, runner context, and marketplace publishing.",
        "subject": "DevOps & CI/CD",
        "modules_data": [
            {
                "title": "GitHub Actions Architecture & Action Types",
                "topics": [
                    {"title": "Workflow Engine Overview", "youtube_search_query": "GitHub Actions runner architecture workflow engine", "subtopics": ["Runner execution environment", "Job and step lifecycle", "Event triggers and context"]},
                    {"title": "Action Types Comparison", "youtube_search_query": "Composite actions vs JavaScript actions vs Docker actions GitHub", "subtopics": ["Composite actions", "JavaScript / Node.js actions", "Docker container actions"]},
                    {"title": "action.yml Specification", "youtube_search_query": "action.yml metadata file specification format tutorial", "subtopics": ["Input parameters and defaults", "Output definitions", "Runs specification section"]},
                    {"title": "Input & Output Definitions", "youtube_search_query": "GitHub actions inputs outputs string formatting", "subtopics": ["Required vs optional inputs", "Secret masking", "Step output variables"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A custom composite GitHub Action repository layout containing a complete `action.yml` metadata specification.",
                    "what_counts_as_evidence": "An `action.yml` file defining inputs, outputs, and shell execution steps.",
                    "eval_criteria": ["Valid syntax according to GitHub Actions schema", "Properly maps input variables to steps"]
                },
                "resources": [
                    {"title": "Creating Actions Documentation", "url": "https://docs.github.com/en/actions/creating-actions"},
                    {"title": "Metadata Syntax for GitHub Actions", "url": "https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions"}
                ]
            },
            {
                "title": "Developing JavaScript / TypeScript Actions",
                "topics": [
                    {"title": "@actions/core and @actions/github Packages", "youtube_search_query": "GitHub Actions toolkit @actions/core @actions/github TypeScript", "subtopics": ["`core.getInput` and `core.setOutput`", "Octokit client initialization", "Logging APIs (`core.info`, `core.setFailed`)"]},
                    {"title": "Accessing Runner Context & Secrets", "youtube_search_query": "GitHub Actions context GITHUB_TOKEN secrets API", "subtopics": ["Reading environment variables", "Context payloads (`github.context.payload`)", "Handling workflow secrets safely"]},
                    {"title": "Setting Outputs & Environment Variables", "youtube_search_query": "GitHub actions core.exportVariable setOutput state", "subtopics": ["Writing to `GITHUB_OUTPUT` file", "Setting environment variables", "State saving across action steps"]},
                    {"title": "Bundling Action Code with ncc", "youtube_search_query": "Vercel ncc bundle TypeScript GitHub action node_modules", "subtopics": ["Single-file compilation", "Handling native dependencies", "Committing `dist/index.js` vs release tagging"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A TypeScript GitHub Action using `@actions/core` and `@actions/github` that posts a automated comment to pull requests.",
                    "what_counts_as_evidence": "Source file `src/index.ts`, `package.json`, and bundled `dist/index.js` generated via `@vercel/ncc`.",
                    "eval_criteria": ["Uses `@actions/core` for status reporting", "Bundles cleanly without missing dependency runtime errors"]
                },
                "resources": [
                    {"title": "GitHub Actions Toolkit Repository", "url": "https://github.com/actions/toolkit"},
                    {"title": "Creating a JavaScript Action Tutorial", "url": "https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action"}
                ]
            },
            {
                "title": "Building Docker Container Actions",
                "topics": [
                    {"title": "Dockerfile Design for Action Runners", "youtube_search_query": "Creating Docker container GitHub action tutorial", "subtopics": ["Base image selection", "Installing CLI dependencies", "Volume mounting and workdir"]},
                    {"title": "Entrypoint Scripts & Shell Parameter Passing", "youtube_search_query": "Docker entrypoint script GitHub action inputs passing", "subtopics": ["Passing action inputs as CLI arguments", "POSIX shell vs Bash scripts", "Handling exit codes"]},
                    {"title": "Accessing Workspace Directory & Volumes", "youtube_search_query": "GitHub actions docker workspace mounting permissions", "subtopics": ["`GITHUB_WORKSPACE` environment variable", "File modification permissions", "Handling runner file ownership"]},
                    {"title": "Container Security & Permissions", "youtube_search_query": "Docker action security best practices non-root user", "subtopics": ["Non-root user execution", "Container capabilities", "Minimal image sizes"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Docker container action written in Python/Shell that lints repository files inside `GITHUB_WORKSPACE` and returns an exit code.",
                    "what_counts_as_evidence": "A `Dockerfile`, `entrypoint.sh`, and `action.yml` referencing the Dockerfile.",
                    "eval_criteria": ["Dockerfile builds successfully", "Entrypoint script returns non-zero exit code on lint failure"]
                },
                "resources": [
                    {"title": "Creating a Docker Container Action", "url": "https://docs.github.com/en/actions/creating-actions/creating-a-docker-container-action"},
                    {"title": "Docker Official Documentation", "url": "https://docs.docker.com/"}
                ]
            },
            {
                "title": "Testing, Versioning & Publishing Actions",
                "topics": [
                    {"title": "Local Testing with `act`", "youtube_search_query": "Test GitHub Actions locally with act nektos tutorial", "subtopics": ["Installing and configuring `act`", "Simulating event payloads", "Passing local secrets"]},
                    {"title": "Action Release Management & Tagging", "youtube_search_query": "GitHub actions versioning release tags v1 v1.0.0", "subtopics": ["Semantic versioning for actions", "Major version tag shifting (`v1` branch/tag)", "Automating releases"]},
                    {"title": "Security Sandboxing & Secret Masking", "youtube_search_query": "GitHub actions security audit mask secrets PR injection", "subtopics": ["Preventing script injection in workflows", "Auditing third-party actions", "Secret masking verification"]},
                    {"title": "Publishing to GitHub Marketplace", "youtube_search_query": "Publish action to GitHub Marketplace guide", "subtopics": ["Marketplace release requirements", "Adding primary/secondary categories", "Action branding icons and colors"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A release workflow file and test harness using `act` to run and verify a custom GitHub Action locally before release.",
                    "what_counts_as_evidence": "A `.github/workflows/test-and-release.yml` file and recorded output from `act` execution.",
                    "eval_criteria": ["Local `act` command executes action steps successfully", "Release workflow automates major tag update (`v1`)"]
                },
                "resources": [
                    {"title": "Nektos Act CLI Tool", "url": "https://github.com/nektos/act"},
                    {"title": "Publishing Actions in GitHub Marketplace", "url": "https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace"}
                ]
            }
        ]
    },

    # 9. Structured Output & Tool Calling for AI Agents
    {
        "title": "Structured Output & Tool Calling for AI Agents",
        "description": "Implement reliable JSON schema extraction, function calling, tool use, and validation loops for production AI applications.",
        "subject": "AI/ML",
        "modules_data": [
            {
                "title": "Fundamentals of Structured Output",
                "topics": [
                    {"title": "Why LLMs Fail at Raw JSON", "youtube_search_query": "LLM structured output JSON parsing error solutions", "subtopics": ["Markdown wrapper issues", "Syntax errors and escaping", "Hallucinated JSON keys"]},
                    {"title": "JSON Schema Specification", "youtube_search_query": "JSON Schema specification for LLM prompt engineering", "subtopics": ["Schema validation keywords", "Strict JSON mode APIs", "Enums and nested objects"]},
                    {"title": "Pydantic & Zod Schema Validation", "youtube_search_query": "Pydantic schema validation instructor python LLM", "subtopics": ["Pydantic BaseModel definitions", "Zod schema parsing", "Instructor library integration"]},
                    {"title": "Constrained Decoding (Grammar-based Sampling)", "youtube_search_query": "Constrained decoding llama.cpp Outlines BNF grammar", "subtopics": ["Logit bias and masking", "Outlines / Guidance libraries", "BNF grammar constraints"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python validation pipeline using Pydantic and `instructor` that enforces strict JSON schemas on raw LLM completion responses.",
                    "what_counts_as_evidence": "Python code showing Pydantic model definitions, API calls, and schema parsing.",
                    "eval_criteria": ["Code handles invalid JSON completions gracefully", "Outputs strongly-typed Pydantic model objects"]
                },
                "resources": [
                    {"title": "Instructor Library Documentation", "url": "https://python.useinstructor.com/"},
                    {"title": "Outlines Constrained Generation Docs", "url": "https://outlines-dev.github.io/outlines/"}
                ]
            },
            {
                "title": "Tool Calling Architectures",
                "topics": [
                    {"title": "OpenAI & Gemini Tool Call Formats", "youtube_search_query": "LLM tool calling API specification format tutorial", "subtopics": ["Function call object schemas", "Tool choice parameters (`auto`, `required`, `none`)", "Handling multiple tool calls"]},
                    {"title": "Function Definitions & Parameter Schemas", "youtube_search_query": "Python function to JSON schema converter docstrings", "subtopics": ["Auto-generating schemas from docstrings", "Docstring type hint parsing", "Required vs optional arguments"]},
                    {"title": "Tool Execution Loop & Response Handling", "youtube_search_query": "Building agent function calling loop Python tutorial", "subtopics": ["Parsing tool call IDs", "Executing local Python functions", "Formatting tool result messages"]},
                    {"title": "Multi-Tool Selection Strategies", "youtube_search_query": "Multi tool selection prompt routing LLM agent", "subtopics": ["Tool overload penalties", "Sub-tool registration", "Dynamic tool context pruning"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A tool execution agent loop in Python that automatically inspects function docstrings, registers tools, dispatches calls, and feeds results back.",
                    "what_counts_as_evidence": "A working Python script defining sample tools (e.g., `get_weather`, `calculator`) and running an automated function call loop.",
                    "eval_criteria": ["Tool dispatch maps args to Python callable correctly", "Tool response message appended in standard role API format"]
                },
                "resources": [
                    {"title": "OpenAI Function Calling Guide", "url": "https://platform.openai.com/docs/guides/function-calling"},
                    {"title": "Google Gemini Function Calling Docs", "url": "https://ai.google.dev/docs/function_calling"}
                ]
            },
            {
                "title": "Error Handling & Recovery Strategies",
                "topics": [
                    {"title": "Handling Partial JSON & Truncated Responses", "youtube_search_query": "Repairing truncated JSON stream response LLM", "subtopics": ["Partial JSON fixers (`json_repair`)", "Token limit truncation handling", "Incremental JSON parsing"]},
                    {"title": "System Prompt Guardrails for Tools", "youtube_search_query": "System prompt guardrails function calling reliability", "subtopics": ["Explicit formatting instructions", "Few-shot tool call examples", "Handling missing parameters"]},
                    {"title": "Schema Drift & Fallback Modes", "youtube_search_query": "LLM schema drift handling backwards compatibility", "subtopics": ["Versioned JSON schemas", "Fallback parsers", "Degrading gracefully to text"]},
                    {"title": "Validation Retries with Feedback Prompts", "youtube_search_query": "Pydantic reasking retry feedback loop LLM validation", "subtopics": ["Injecting validation error messages into prompt", "Maximum retry counters", "Error context formatting"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A resilient retry pipeline that catches Pydantic validation errors and re-prompts the LLM with specific error feedback.",
                    "what_counts_as_evidence": "Python script demonstrating automated retry loop when given intentionally malformed model outputs.",
                    "eval_criteria": ["Validation errors are passed back to the model context", "Loop aborts after max 3 attempts if unresolvable"]
                },
                "resources": [
                    {"title": "json-repair Python Package", "url": "https://github.com/real-python/json-repair"},
                    {"title": "Pydantic Validation Docs", "url": "https://docs.pydantic.dev/"}
                ]
            },
            {
                "title": "Advanced Tool Patterns & Security",
                "topics": [
                    {"title": "Dynamic Tool Selection & RAG Tool Registries", "youtube_search_query": "Dynamic tool selection vector search LLM agent", "subtopics": ["Vector search over large tool catalogs", "Injecting only relevant tools into prompt", "Scalable tool registries"]},
                    {"title": "Parallel Tool Calling & Async Execution", "youtube_search_query": "Parallel function calling async python LLM", "subtopics": ["`asyncio.gather` for parallel tool execution", "Handling tool dependencies", "Latency optimization"]},
                    {"title": "Security Sandboxing for Code Execution Tools", "youtube_search_query": "Executing LLM generated code sandboxing Docker Python", "subtopics": ["Preventing code injection attacks", "Docker/WebAssembly execution environments", "Resource limits (CPU, memory, net)"]},
                    {"title": "User-in-the-Loop Confirmation Patterns", "youtube_search_query": "Human in the loop approval pattern AI agent tool execution", "subtopics": ["Interrupting tool loops for human approval", "Action authorization checks", "State persistence across approval"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An async tool manager that executes independent tool calls in parallel using `asyncio.gather()` with timeout and error wrapping.",
                    "what_counts_as_evidence": "Python async script launching multiple mock API tools simultaneously.",
                    "eval_criteria": ["Execution time reflects parallel execution rather than sequential sum", "Individual tool exceptions do not crash remaining calls"]
                },
                "resources": [
                    {"title": "E2B Code Interpreter Sandbox", "url": "https://e2b.dev/"},
                    {"title": "LangChain Human-in-the-loop Guide", "url": "https://python.langchain.com/v0.2/docs/concepts/#human-in-the-loop"}
                ]
            }
        ]
    },

    # 10. Semantic Design Tokens & Themeable UI Systems
    {
        "title": "Semantic Design Tokens & Themeable UI Systems",
        "description": "Build scalable, multi-theme design token architecture using W3C standards, CSS Custom Properties, Style Dictionary, and Tailwind integration.",
        "subject": "Frontend & UI Systems",
        "modules_data": [
            {
                "title": "Token Architecture & Taxonomy",
                "topics": [
                    {"title": "W3C Design Tokens Standard", "youtube_search_query": "W3C design tokens format specification standard tutorial", "subtopics": ["JSON format specifications", "`$value` and `$type` properties", "Token aliasing syntax (`{color.brand.primary}`)" ]},
                    {"title": "Primitive vs Semantic vs Component Tokens", "youtube_search_query": "Primitive semantic component design tokens structure", "subtopics": ["Global/primitive color scales", "Semantic intent tokens (`bg-surface-primary`)", "Component-scoped override tokens"]},
                    {"title": "Naming Conventions & Tiering", "youtube_search_query": "Design token naming conventions taxonomy CTI", "subtopics": ["Category-Type-Item (CTI) structure", "Namespace prefixing", "Kebab-case vs camelCase standards"]},
                    {"title": "Token Taxonomies", "youtube_search_query": "Design token taxonomies color spacing typography elevation", "subtopics": ["Color and contrast scales", "Typography tokens (font, weight, size, line-height)", "Spacing, radius, and elevation tokens"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A multi-file design token JSON repository adhering to W3C format, separating primitives from semantic tokens.",
                    "what_counts_as_evidence": "Valid JSON files (`primitives.json`, `semantics.json`) with proper `$type` and `$value` token alias references.",
                    "eval_criteria": ["Zero syntax errors in JSON schema", "Semantic tokens cleanly alias primitive values without hardcoded hex strings"]
                },
                "resources": [
                    {"title": "W3C Design Tokens Community Group", "url": "https://design-tokens.github.io/community-group/format/"},
                    {"title": "Design Tokens Dimensions & Taxonomies", "url": "https://spectrum.adobe.com/page/design-tokens/"}
                ]
            },
            {
                "title": "Transforming Tokens with Style Dictionary",
                "topics": [
                    {"title": "Style Dictionary Setup", "youtube_search_query": "Style Dictionary tutorial design tokens transform build", "subtopics": ["`config.json` build setup", "Source matching patterns", "Platform targets (CSS, SCSS, JS/TS)"]},
                    {"title": "Custom Transforms & Transform Groups", "youtube_search_query": "Style Dictionary custom transform registerTransform", "subtopics": ["Creating unit conversion transforms (px to rem)", "Color space transformations (RGB/HSL/OKLCH)", "Transform groups"]},
                    {"title": "Generating CSS Variables & TS Exports", "youtube_search_query": "Style Dictionary export CSS variables TypeScript types", "subtopics": ["Formatted CSS custom properties export", "TypeScript type definitions generator", "JS object exports"]},
                    {"title": "Multi-Platform Outputs", "youtube_search_query": "Style Dictionary multi platform iOS Android Web", "subtopics": ["Swift / Android XML formatting", "Automating multi-platform build scripts", "CI build integration"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Style Dictionary build configuration script in JavaScript that parses token JSON files and outputs CSS custom properties and TypeScript definition files.",
                    "what_counts_as_evidence": "A working `build-tokens.js` script and generated output files (`variables.css`, `tokens.ts`).",
                    "eval_criteria": ["Build script runs without errors", "Generated CSS contains valid custom properties with correct variable scoping"]
                },
                "resources": [
                    {"title": "Style Dictionary Official Documentation", "url": "https://amzn.github.io/style-dictionary/"},
                    {"title": "Style Dictionary GitHub Repo", "url": "https://github.com/amzn/style-dictionary"}
                ]
            },
            {
                "title": "Theme Engine & Runtime Theme Switching",
                "topics": [
                    {"title": "CSS Custom Properties & Data Attributes", "youtube_search_query": "CSS custom properties theme switcher data-theme attribute", "subtopics": ["`[data-theme='dark']` selector pattern", "CSS scope inheritance", "Performance of root level variable changes"]},
                    {"title": "Dark Mode & Color Contrast Ratios", "youtube_search_query": "WCAG color contrast ratios light dark mode accessibility", "subtopics": ["WCAG AA / AAA contrast checks", "APCA contrast algorithm basics", "Theme surface elevation layering"]},
                    {"title": "System Preference Detection", "youtube_search_query": "prefers-color-scheme media query JavaScript listener", "subtopics": ["`window.matchMedia` listeners", "Persisting user preference in localStorage", "Cookie-based SSR theme sync"]},
                    {"title": "Flash of Unstyled Content (FOUC) Prevention", "youtube_search_query": "Prevent dark mode flash FOUC script Next.js HTML head", "subtopics": ["Inline blocking script in HTML `<head>`", "CSS `color-scheme` property", "SSR theme hydration tactics"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A lightweight JavaScript runtime theme engine supporting light, dark, and system preference switching without FOUC.",
                    "what_counts_as_evidence": "A HTML/JS demo page with theme switching buttons and an inline head script.",
                    "eval_criteria": ["Theme toggle updates `data-theme` attribute on root element", "No visible theme flashing on page refresh"]
                },
                "resources": [
                    {"title": "MDN CSS Custom Properties", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties"},
                    {"title": "Web.dev Dark Theme Guide", "url": "https://web.dev/articles/color-scheme"}
                ]
            },
            {
                "title": "Integrating Tokens with Tailwind CSS & Design Tools",
                "topics": [
                    {"title": "Mapping Tokens to Tailwind CSS Config", "youtube_search_query": "Tailwind CSS custom theme extend CSS variables tutorial", "subtopics": ["Mapping theme colors to `var(--...)`", "Tailwind v4 `@theme` directive", "Disabling default color palettes"]},
                    {"title": "Token Syncing with Figma Variables", "youtube_search_query": "Tokens Studio Figma plugin GitHub sync workflow", "subtopics": ["Figma Variables API integration", "Tokens Studio (Figma Tokens) plugin", "Git synchronization workflows"]},
                    {"title": "Component Library Integration", "youtube_search_query": "Design tokens React Tailwind component library architecture", "subtopics": ["Scoping tokens to UI components", "Storybook token documentation", "Theme provider wrappers"]},
                    {"title": "Testing Token Accessibility", "youtube_search_query": "Automated design token accessibility audit tools CLI", "subtopics": ["Automated contrast ratio validation", "Linting token usage in codebase", "Enforcing design system guardrails"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Tailwind CSS configuration file (or Tailwind v4 CSS theme file) that maps semantic token CSS variables to utility classes.",
                    "what_counts_as_evidence": "A `tailwind.config.js` or `globals.css` file mapping semantic CSS variables.",
                    "eval_criteria": ["Tailwind utility classes (e.g. `bg-background`, `text-primary`) reference CSS variables", "No hardcoded hex strings in theme config"]
                },
                "resources": [
                    {"title": "Tailwind CSS Customization Docs", "url": "https://tailwindcss.com/docs/customizing-colors"},
                    {"title": "Tokens Studio Documentation", "url": "https://docs.tokens.studio/"}
                ]
            }
        ]
    },

    # 11. Fine-tuning Vision-Language Models
    {
        "title": "Fine-tuning Vision-Language Models",
        "description": "Adapt multimodal models like LLaVA and PaliGemma for domain-specific visual understanding, document parsing, and image captioning.",
        "subject": "AI/ML & Computer Vision",
        "modules_data": [
            {
                "title": "Vision-Language Model Architectures",
                "topics": [
                    {"title": "Image Encoders (ViT, SigLIP) & Projection Layers", "youtube_search_query": "Vision language model architecture vision transformer projection", "subtopics": ["Vision Transformer (ViT) patch tokenization", "SigLIP vs CLIP encoders", "Linear vs MLP projection bridges"]},
                    {"title": "Multimodal Fusion Strategies", "youtube_search_query": "Multimodal fusion early late cross attention VLM", "subtopics": ["Cross-attention mechanisms", "Prefix tuning for vision tokens", "Token interleaving"]},
                    {"title": "LLaVA vs PaliGemma Architectures", "youtube_search_query": "LLaVA architecture vs PaliGemma comparison", "subtopics": ["LLaVA architecture breakdown", "PaliGemma architecture & task prefixes", "Decoder-only vs encoder-decoder backbones"]},
                    {"title": "Tokenizing Images and Text", "youtube_search_query": "Multimodal tokenization image patches text tokens VLM", "subtopics": ["Image patch counts and aspect ratio handling", "Special image tokens (`<image>`)", "BPE tokenization alignment"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A PyTorch script inspecting the vision encoder layers, projection weights, and visual token count of a pre-trained VLM.",
                    "what_counts_as_evidence": "A Python script using Hugging Face Transformers loading a VLM model and printing layer tensor dimensions.",
                    "eval_criteria": ["Script correctly isolates vision tower and cross-attention/projection parameters", "Calculates visual token count per input resolution"]
                },
                "resources": [
                    {"title": "LLaVA Paper and Code", "url": "https://github.com/haotian-liu/LLaVA"},
                    {"title": "PaliGemma Hugging Face Blog", "url": "https://huggingface.dev/blog/paligemma"}
                ]
            },
            {
                "title": "Dataset Preparation & Augmentation for VLM",
                "topics": [
                    {"title": "Multimodal Dataset Formats", "youtube_search_query": "LLaVA json dataset format multimodal visual instruction tuning", "subtopics": ["Conversational JSON schema for images", "Document VQA dataset structures", "Bounding box coordinate representations"]},
                    {"title": "Image Preprocessing & Spatial Augmentations", "youtube_search_query": "Multimodal dataset image transform data loader PyTorch", "subtopics": ["Resagging and cropping strategies", "Preserving aspect ratios via padding", "Spatial augmentations vs domain shift"]},
                    {"title": "Formatting Visual Instruction Tuning Prompts", "youtube_search_query": "Visual instruction tuning prompt template format VLM", "subtopics": ["Prompt templates (`USER: <image>\\n... ASSISTANT:`)", "Task-specific prefixes", "Multi-turn visual conversation formatting"]},
                    {"title": "Synthetic Visual Data Generation", "youtube_search_query": "Generating synthetic multimodal instruction datasets LLM", "subtopics": ["Using GPT-4 Vision for synthetic QA labels", "Bounding box auto-labeling", "Filtering low-quality image-text pairs"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A PyTorch `Dataset` and `DataLoader` implementation in Python that formats image-text pairs into tokenized visual instruction tuning tensors.",
                    "what_counts_as_evidence": "A Python file defining `MultimodalDataset` returning `pixel_values` and `input_ids` tensors.",
                    "eval_criteria": ["Correctly resizes and normalizes image patches", "Inserts `<image>` tokens at required position in prompt"]
                },
                "resources": [
                    {"title": "Hugging Face Datasets Documentation", "url": "https://huggingface.co/docs/datasets/"},
                    {"title": "Visual Instruction Tuning Paper", "url": "https://arxiv.org/abs/2304.08485"}
                ]
            },
            {
                "title": "Parameter-Efficient Fine-Tuning (PEFT/LoRA)",
                "topics": [
                    {"title": "Applying LoRA to Vision Encoders vs Language Backbones", "youtube_search_query": "LoRA PEFT multimodal vision language model fine tuning", "subtopics": ["Targeting projection layers vs LLM attention weights", "Freezing vision encoder parameters", "Trainable parameter count analysis"]},
                    {"title": "QLoRA 4-bit Quantization for VLMs", "youtube_search_query": "QLoRA bitsandbytes 4-bit fine tuning VLM PyTorch", "subtopics": ["NF4 quantization", "Double quantization", "Memory usage optimization"]},
                    {"title": "Loss Functions for Multimodal Fine-Tuning", "youtube_search_query": "Cross entropy loss visual instruction tuning VLM", "subtopics": ["Cross-entropy loss over answer tokens", "Masking prompt and image token loss", "Loss scaling"]},
                    {"title": "Memory Management & Gradient Checkpointing", "youtube_search_query": "VLM fine tuning GPU memory optimization gradient checkpointing", "subtopics": ["Gradient checkpointing in Transformers", "FlashAttention integration", "Per-GPU batch sizing"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A PEFT/LoRA fine-tuning training script in Python using Hugging Face `TRL` / `SFTTrainer` configured for a multimodal vision model.",
                    "what_counts_as_evidence": "A Python script demonstrating model loading, LoRA configuration, and training loop initialization.",
                    "eval_criteria": ["LoRA target modules include projection or attention layers", "Script correctly freezes non-LoRA parameters"]
                },
                "resources": [
                    {"title": "Hugging Face PEFT Documentation", "url": "https://huggingface.co/docs/peft/"},
                    {"title": "BitsAndBytes Quantization Guide", "url": "https://huggingface.co/docs/bitsandbytes/"}
                ]
            },
            {
                "title": "Evaluation & Deployment of Custom VLMs",
                "topics": [
                    {"title": "VLM Evaluation Benchmarks", "youtube_search_query": "VLM benchmark evaluation VQAv2 DocVQA MME", "subtopics": ["VQAv2, DocVQA, and MathVista", "Evaluating exact match vs similarity", "Optical character recognition (OCR) metrics"]},
                    {"title": "Visual Hallucination Metrics", "youtube_search_query": "Visual hallucination detection VLM POPE benchmark", "subtopics": ["POPE (Polling-based Object Probe Evaluation)", "Object hallucination causes", "Mitigating hallucination through decoding"]},
                    {"title": "Exporting to ONNX/vLLM for Inference", "youtube_search_query": "vLLM multimodal inference serving VLM", "subtopics": ["vLLM visual model serving", "TensorRT-LLM conversion", "Batching image inputs"]},
                    {"title": "Quantization & Edge Deployment", "youtube_search_query": "GGUF quantization vision language model llama.cpp", "subtopics": ["mmproj GGUF file generation", "llama.cpp multimodal inference", "Mobile/Edge VLM execution"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An evaluation script calculating accuracy and CIDEr/BLEU scores for a fine-tuned VLM on a test dataset.",
                    "what_counts_as_evidence": "Python evaluation script generating benchmark metrics output table.",
                    "eval_criteria": ["Calculates ground truth vs prediction comparison", "Outputs structured metric summary table"]
                },
                "resources": [
                    {"title": "vLLM Multimodal Documentation", "url": "https://docs.vllm.ai/en/latest/models/multimodal.html"},
                    {"title": "llama.cpp Multimodal Guide", "url": "https://github.com/ggerganov/llama.cpp/tree/master/examples/llava"}
                ]
            }
        ]
    },

    # 12. Android Security: APK Reverse Engineering
    {
        "title": "Android Security: APK Reverse Engineering",
        "description": "Decompile, analyze, and patch Android applications using Bytecode Manipulation, Jadx, Apktool, Smali modification, and Frida dynamic analysis.",
        "subject": "Cybersecurity & Mobile Security",
        "modules_data": [
            {
                "title": "APK Anatomy & Reverse Engineering Tooling",
                "topics": [
                    {"title": "APK File Format Architecture", "youtube_search_query": "APK file format structure classes.dex AndroidManifest", "subtopics": ["`classes.dex` bytecode container", "`AndroidManifest.xml` binary XML format", "`resources.arsc` and `lib/` native libraries"]},
                    {"title": "Dalvik/ART Executable Bytecode", "youtube_search_query": "Dalvik vs ART executable DEX bytecode explained", "subtopics": ["Register-based Dalvik VM vs stack machines", "DEX header and type id tables", "AOT vs JIT compilation on ART"]},
                    {"title": "Decompiling with Jadx & Apktool", "youtube_search_query": "Jadx GUI Apktool decompile rebuild APK tutorial", "subtopics": ["Decompiling DEX to Java with Jadx", "Unpacking APK resources with Apktool", "Rebuilding unpacked APK directories"]},
                    {"title": "Smali Assembly Language Basics", "youtube_search_query": "Smali assembly language tutorial Android reverse engineering", "subtopics": ["Smali syntax and register notation (`v0`, `p0`)", "Method invocation opcodes (`invoke-virtual`, `invoke-static`)", "Conditional jumps (`if-eqz`, `goto`)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A step-by-step workflow decompiling an APK using Apktool, editing the binary `AndroidManifest.xml` to set `android:debuggable=\"true\"`, and rebuilding.",
                    "what_counts_as_evidence": "Shell script executing `apktool d`, modifying manifest, and running `apktool b` successfully.",
                    "eval_criteria": ["Apktool disassembles without resource errors", "Rebuilt APK creates valid `build/apk` output"]
                },
                "resources": [
                    {"title": "Jadx Decompiler Repository", "url": "https://github.com/skylot/jadx"},
                    {"title": "Apktool Official Site", "url": "https://apktool.org/"}
                ]
            },
            {
                "title": "Static Security Analysis",
                "topics": [
                    {"title": "Analyzing Insecure Data Storage & Logging", "youtube_search_query": "Android insecure data storage static code analysis", "subtopics": ["SharedPreferences plaintext storage", "Internal vs external storage leaks", "Logcat output leaks (`Log.d`)"]},
                    {"title": "Hardcoded API Keys & Secrets Extraction", "youtube_search_query": "Extract hardcoded secrets API keys Android APK static", "subtopics": ["Regex searching decompiled Java", "Native library string extraction (`strings lib.so`)", "Obfuscated string recovery"]},
                    {"title": "Obfuscation Patterns (ProGuard / R8)", "youtube_search_query": "ProGuard R8 Android obfuscation reverse engineering pattern", "subtopics": ["Renamed classes and methods (`a.b.c`)", "Control flow flattening", "Reflection-based invocation obfuscation"]},
                    {"title": "Identifying Vulnerable WebViews & Intent Filters", "youtube_search_query": "Android exported intent filter webview vulnerability audit", "subtopics": ["`android:exported=\"true\"` vulnerabilities", "WebView `setJavaScriptEnabled(true)` risks", "Deep link hijacking"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A static security audit report in Markdown analyzing a decompiled Java/Smali source tree for hardcoded API keys, exposed components, and unsafe storage.",
                    "what_counts_as_evidence": "A comprehensive static analysis markdown report referencing file paths and line numbers.",
                    "eval_criteria": ["Identifies exported components from manifest", "Extracts strings/keys from code without false positives"]
                },
                "resources": [
                    {"title": "OWASP Mobile Application Security (MASVS)", "url": "https://mas.owasp.org/"},
                    {"title": "Android Security Documentation", "url": "https://developer.android.com/security"}
                ]
            },
            {
                "title": "APK Patching & Bytecode Modification",
                "topics": [
                    {"title": "Modifying Smali Bytecode Instructions", "youtube_search_query": "Patching smali code replace return value APK", "subtopics": ["Locating target methods in Smali", "Modifying conditional branches (`const/4 v0, 0x1`, `return v0`)", "Injecting custom log calls in Smali"]},
                    {"title": "Bypassing Root Detection & SSL Pinning via Smali", "youtube_search_query": "Bypass root detection SSL pinning smali patch", "subtopics": ["Identifying root check methods (`/system/xbin/su`)", "Nop-ing out checks", "Overriding TrustManager checks"]},
                    {"title": "Re-signing APKs with apksigner / jarsigner", "youtube_search_query": "apksigner keytool generate keystore sign APK", "subtopics": ["Generating custom debug keystore", "Signing v2/v3 signatures with `apksigner`", "Verifying signature validity"]},
                    {"title": "ZipAlign Optimization", "youtube_search_query": "zipalign APK optimization Android SDK tutorial", "subtopics": ["4-byte alignment rule for uncompressed assets", "Running `zipalign -v 4`", "Verification before installation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A patched APK generation script that modifies a Smali method to return true, re-aligns with `zipalign`, and signs with `apksigner`.",
                    "what_counts_as_evidence": "A shell script automating decompression, Smali patch replacement, zipalign, and signing.",
                    "eval_criteria": ["Signed APK passes `apksigner verify`", "Modified Smali executes altered logic"]
                },
                "resources": [
                    {"title": "Android apksigner Tool Docs", "url": "https://developer.android.com/tools/apksigner"},
                    {"title": "Smali / Baksmali Wiki", "url": "https://github.com/JesusFreke/smali/wiki"}
                ]
            },
            {
                "title": "Dynamic Instrumentation with Frida",
                "topics": [
                    {"title": "Frida Architecture & JavaScript Agent Injection", "youtube_search_query": "Frida Android dynamic instrumentation tutorial beginner", "subtopics": ["`frida-server` deployment on Android device/emulator", "Frida CLI and JavaScript binding agents", "Process attaching vs spawning"]},
                    {"title": "Hooking Java Methods & Overriding Return Values", "youtube_search_query": "Frida Java.perform Java.use method hooking tutorial", "subtopics": ["`Java.perform` wrapper", "`Java.use` class loading", "Overriding implementation (`targetClass.targetMethod.implementation`)"]},
                    {"title": "Monitoring Cryptographic Operations at Runtime", "youtube_search_query": "Frida hook javax.crypto Cipher doFinal Android", "subtopics": ["Hooking `javax.crypto.Cipher`", "Logging encryption keys and IVs", "Interpreting runtime parameters"]},
                    {"title": "Defeating Dynamic Anti-Debugging Controls", "youtube_search_query": "Bypass anti debugging Frida detection Android hooks", "subtopics": ["Detecting Frida ports (27042) and threads", "Bypassing `ptrace` anti-debugging", "Native function hooking with `Interceptor.attach`"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Frida JavaScript script that hooks an Android authentication validation method, logs the argument credentials, and overrides return value to true.",
                    "what_counts_as_evidence": "A Frida agent script (`agent.js`) and command string launching Frida against a target package.",
                    "eval_criteria": ["Script correctly uses `Java.perform()` and `Java.use()` APIs", "Successfully logs target method parameters and alters return value"]
                },
                "resources": [
                    {"title": "Frida Official Documentation", "url": "https://frida.re/docs/home/"},
                    {"title": "Frida Code Share", "url": "https://codeshare.frida.re/"}
                ]
            }
        ]
    },

    # 13. Physics-Informed Neural Networks (PINNs)
    {
        "title": "Physics-Informed Neural Networks (PINNs)",
        "description": "Embed differential equations (ODEs/PDEs) directly into neural network loss functions using PyTorch and Automatic Differentiation.",
        "subject": "AI/ML & Scientific Computing",
        "modules_data": [
            {
                "title": "Mathematical Foundations of PINNs",
                "topics": [
                    {"title": "Forward vs Inverse Problems", "youtube_search_query": "Physics informed neural networks PINN introduction concept", "subtopics": ["Forward solving vs parameter estimation", "Mesh-free differential equation solving", "Comparison with finite element methods (FEM)"]},
                    {"title": "Embedding Physical Laws in Machine Learning", "youtube_search_query": "Embedding physics loss functions neural networks", "subtopics": ["Conservation laws (mass, momentum, energy)", "Penalty method in loss functions", "Soft vs hard constraint enforcement"]},
                    {"title": "Automatic Differentiation (Autograd)", "youtube_search_query": "PyTorch autograd derivative calculation physics PINN", "subtopics": ["`torch.autograd.grad` interface", "Higher-order derivatives calculation", "Creating graph for backward pass"]},
                    {"title": "Loss Function Formulations", "youtube_search_query": "PINN loss function formulation data loss residual loss", "subtopics": ["Data loss component ($\mathcal{L}_{data}$)", "PDE residual loss component ($\mathcal{L}_{PDE}$)", "Boundary and initial condition losses ($\mathcal{L}_{BC}$, $\mathcal{L}_{IC}$)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A mathematical formulation document and PyTorch code snippet defining the composite loss function ($\mathcal{L} = \lambda_1 \mathcal{L}_{data} + \lambda_2 \mathcal{L}_{PDE} + \lambda_3 \mathcal{L}_{BC}$) for a physical system.",
                    "what_counts_as_evidence": "Python script defining loss functions with customizable weighting parameters.",
                    "eval_criteria": ["Loss terms are cleanly decoupled and weighted", "Uses Autograd for differential operator evaluations"]
                },
                "resources": [
                    {"title": "Physics-Informed Neural Networks Original Paper", "url": "https://arxiv.org/abs/1711.10561"},
                    {"title": "DeepXDE Documentation", "url": "https://deepxde.readthedocs.io/"}
                ]
            },
            {
                "title": "Solving Ordinary Differential Equations (ODEs) with PyTorch",
                "topics": [
                    {"title": "Building Neural Network Approximators", "youtube_search_query": "PyTorch PINN ODE solver harmonic oscillator tutorial", "subtopics": ["Multi-Layer Perceptron (MLP) architecture", "Activation function selection (Tanh / Sinusoidal / SiLU)", "Weight initialization strategies"]},
                    {"title": "Computing Derivatives with `torch.autograd.grad`", "youtube_search_query": "torch autograd grad computes first second order derivative PyTorch", "subtopics": ["Computing $\\frac{du}{dt}$ and $\\frac{d^2u}{dt^2}$", "`create_graph=True` flag necessity", "Vectorized gradient computation"]},
                    {"title": "Boundary and Initial Condition Loss Terms", "youtube_search_query": "PyTorch initial condition loss boundary condition PINN", "subtopics": ["Evaluating network at $t=0$", "Enforcing $u(0)=u_0$ and $u'(0)=v_0$", "Domain sampling collocation points"]},
                    {"title": "Training Dynamics & Loss Weighting", "youtube_search_query": "Training PINN L-BFGS vs Adam optimizer PyTorch", "subtopics": ["Adam vs L-BFGS optimizers", "Learning rate scheduling", "Stiffness in PINN training"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A complete PyTorch PINN script that solves a 1D damped harmonic oscillator ODE ($m \\frac{d^2u}{dt^2} + \\mu \\frac{du}{dt} + k u = 0$) using collocation points.",
                    "what_counts_as_evidence": "A Python script training an MLP on PDE residuals and plotting predicted motion against analytical solution.",
                    "eval_criteria": ["Script trains cleanly with zero external empirical data points", "Predicted trajectory matches analytical solution curve with high accuracy"]
                },
                "resources": [
                    {"title": "PyTorch Autograd Tutorial", "url": "https://pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html"},
                    {"title": "PINN Harmonic Oscillator Example Repository", "url": "https://github.com/maziarraissi/PINNs"}
                ]
            },
            {
                "title": "Solving Partial Differential Equations (PDEs)",
                "topics": [
                    {"title": "Heat Equation & Wave Equation Formulation", "youtube_search_query": "PINN solving heat equation wave equation PyTorch", "subtopics": ["Spatial-temporal inputs $(x, t)$", "Laplacian operator computation $\\frac{\\partial^2 u}{\\partial x^2}$", "Initial and boundary condition grids"]},
                    {"title": "Burgers' Equation & Shock Waves", "youtube_search_query": "Burgers equation PINN PyTorch shock wave solution", "subtopics": ["Non-linear convection term $u \\frac{\\partial u}{\\partial x}$", "Viscous diffusion term $\\nu \\frac{\\partial^2 u}{\\partial x^2}$", "Handling steep gradients and discontinuities"]},
                    {"title": "Spatial-Temporal Domain Sampling", "youtube_search_query": "Latin hypercube sampling PINN collocation points", "subtopics": ["Latin Hypercube Sampling (LHS)", "Uniform vs adaptive grid sampling", "Boundary point sampling strategies"]},
                    {"title": "Multi-Objective Loss Optimization", "youtube_search_query": "Adaptive loss weighting PINN residual gradient annealing", "subtopics": ["Gradient pathology in PINNs", "Self-adaptive loss weights", "SoftAdapt / Learning rate annealing"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A PyTorch PINN implementation solving the 1D viscous Burgers' equation $\\frac{\\partial u}{\\partial t} + u \\frac{\\partial u}{\\partial x} = \\nu \\frac{\\partial^2 u}{\\partial x^2}$.",
                    "what_counts_as_evidence": "Python script using Latin Hypercube Sampling for spatial-temporal points and training a PINN to compute $u(x,t)$.",
                    "eval_criteria": ["Calculates non-linear convection and diffusion derivatives accurately", "Produces 2D contour plot of $u(x,t)$ across time and space"]
                },
                "resources": [
                    {"title": "Burgers' Equation PINN Case Study", "url": "https://maziarraissi.github.io/PINNs/"},
                    {"title": "SciPy Latin Hypercube Sampling Docs", "url": "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.qmc.LatinHypercube.html"}
                ]
            },
            {
                "title": "Inverse Problems & Parameter Estimation",
                "topics": [
                    {"title": "Estimating Unknown Physical Coefficients", "youtube_search_query": "Inverse PINN problem discovering differential equation parameters PyTorch", "subtopics": ["Registering physical parameters as `nn.Parameter`", "Simultaneous state prediction and parameter optimization", "Convergence of physical parameters"]},
                    {"title": "Noise Robustness in Inverse PINNs", "youtube_search_query": "PINN parameter estimation with noisy measurement data", "subtopics": ["Adding Gaussian noise to measurement data", "Regularization properties of PDE loss", "Robust parameter identification"]},
                    {"title": "Hybrid Physics-ML Architectures", "youtube_search_query": "Physics informed neural operators FNO PINN hybrid", "subtopics": ["Fourier Neural Operators (FNO) introduction", "Data-driven physics surrogates", "Accelerating engineering simulations"]},
                    {"title": "Real-World Engineering Applications", "youtube_search_query": "PINN applications fluid dynamics heat transfer biomechanics", "subtopics": ["Computational Fluid Dynamics (CFD)", "Heat transfer modeling", "Structural mechanics"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An inverse PINN script in PyTorch that learns an unknown damping coefficient $\\mu$ in an ODE from noisy observational data.",
                    "what_counts_as_evidence": "Python code declaring `mu = nn.Parameter(torch.tensor([1.0]))` and optimizing it alongside network weights.",
                    "eval_criteria": ["Optimized parameter converges close to true simulated parameter value", "PDE loss regularizes fit against data noise"]
                },
                "resources": [
                    {"title": "Inverse Problems in Physics-Informed ML", "url": "https://pinn.guide/"},
                    {"title": "NVIDIA Modulus Framework", "url": "https://developer.nvidia.com/modulus"}
                ]
            }
        ]
    }
]

async def seed():
    supabase = get_supabase_client()
    print("Starting batch 3 seeding for 13 courses...")
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
        
        # Insert into Supabase
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
    print(f"Batch 3 Seeding Summary: {len(inserted_records)} / {len(courses_info)} courses inserted.")
    for rec in inserted_records:
        print(f"  - ID: {rec['id']} | Title: {rec['title']}")
    print("============================================================\n")
    return inserted_records

if __name__ == "__main__":
    asyncio.run(seed())
