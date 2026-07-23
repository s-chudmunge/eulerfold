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
    supabase = get_supabase_client()
    email = "eulerfold@gmail.com"
    
    # (Removed user fetching)
    
    courses = [
        {
            "title": "RAG Pipeline Engineering: pgvector, Hybrid Search, and Re-Ranking",
            "description": "Learn to build advanced Retrieval-Augmented Generation pipelines. Cover embedding models, hybrid search, and evaluation.",
            "subject": "AI Engineering",
            "modules": [
                {
                    "id": uid(),
                    "title": "Embedding Models and Vector Stores",
                    "outcome": "Understand embeddings and build a vector store using pgvector.",
                    "timeline": "Week 1",
                    "workspace_type": "code",
                    "optimal_search_query": "how to use pgvector and embeddings",
                    "proof_of_work_instructions": {
                        "what_to_build": "Set up a pgvector database and ingest text chunks with embeddings.",
                        "what_counts_as_evidence": "A script that loads documents, generates embeddings, and inserts them into pgvector.",
                        "eval_criteria": [
                            "Correct schema for vector embeddings in pgvector.",
                            "Successfully query nearest neighbors using cosine similarity."
                        ]
                    },
                    "resources": [
                        {"title": "pgvector GitHub", "url": "https://github.com/pgvector/pgvector"},
                        {"title": "OpenAI Embeddings", "url": "https://platform.openai.com/docs/guides/embeddings"}
                    ],
                    "topics": [
                        {"id": "topic_1_1", "uuid": uid(), "title": "Text Embeddings Basics", "youtube_search_query": "text embeddings explained", "subtopics": [{"id": uid(), "title": "Vector Representation"}, {"id": uid(), "title": "Embedding Models"}, {"id": uid(), "title": "Dimensionality"}]},
                        {"id": "topic_1_2", "uuid": uid(), "title": "Introduction to pgvector", "youtube_search_query": "pgvector tutorial", "subtopics": [{"id": uid(), "title": "Installation"}, {"id": uid(), "title": "Vector Data Type"}, {"id": uid(), "title": "Distance Metrics"}]},
                        {"id": "topic_1_3", "uuid": uid(), "title": "Chunking Strategies", "youtube_search_query": "document chunking for RAG", "subtopics": [{"id": uid(), "title": "Fixed-size Chunking"}, {"id": uid(), "title": "Semantic Chunking"}, {"id": uid(), "title": "Overlap and Context"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "Hybrid Search (Dense + Sparse)",
                    "outcome": "Combine vector similarity with keyword search for better retrieval.",
                    "timeline": "Week 2",
                    "workspace_type": "code",
                    "optimal_search_query": "hybrid search pgvector bm25",
                    "proof_of_work_instructions": {
                        "what_to_build": "Implement hybrid search combining pgvector and PostgreSQL full-text search.",
                        "what_counts_as_evidence": "A function that takes a query, runs both vector and FTS, and combines results.",
                        "eval_criteria": [
                            "Correct implementation of PostgreSQL FTS.",
                            "Effective combining mechanism (e.g. Reciprocal Rank Fusion)."
                        ]
                    },
                    "resources": [
                        {"title": "PostgreSQL Full Text Search", "url": "https://www.postgresql.org/docs/current/textsearch.html"},
                        {"title": "LangChain Hybrid Search", "url": "https://python.langchain.com/docs/modules/data_connection/retrievers/ensemble"}
                    ],
                    "topics": [
                        {"id": "topic_2_1", "uuid": uid(), "title": "Sparse Retrieval (BM25)", "youtube_search_query": "BM25 explained", "subtopics": [{"id": uid(), "title": "Term Frequency"}, {"id": uid(), "title": "Inverse Document Frequency"}, {"id": uid(), "title": "PostgreSQL FTS"}]},
                        {"id": "topic_2_2", "uuid": uid(), "title": "Reciprocal Rank Fusion", "youtube_search_query": "Reciprocal Rank Fusion RRF", "subtopics": [{"id": uid(), "title": "Combining Ranks"}, {"id": uid(), "title": "RRF Formula"}, {"id": uid(), "title": "Implementation"}]},
                        {"id": "topic_2_3", "uuid": uid(), "title": "Cross-Encoder Re-Ranking", "youtube_search_query": "Cross Encoder vs Bi Encoder", "subtopics": [{"id": uid(), "title": "Bi-Encoders"}, {"id": uid(), "title": "Cross-Encoders"}, {"id": uid(), "title": "Performance Tradeoffs"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "Advanced Query Routing and Evaluation",
                    "outcome": "Evaluate and improve the quality of RAG retrievals while handling complex queries.",
                    "timeline": "Week 3",
                    "workspace_type": "research",
                    "optimal_search_query": "RAG evaluation metrics RAGAS",
                    "proof_of_work_instructions": {
                        "what_to_build": "Evaluate your RAG pipeline using a framework like Ragas.",
                        "what_counts_as_evidence": "A report showing context precision, recall, and answer relevancy scores.",
                        "eval_criteria": [
                            "Calculated RAG evaluation metrics correctly.",
                            "Identified areas for retrieval improvement."
                        ]
                    },
                    "resources": [
                        {"title": "Ragas Documentation", "url": "https://docs.ragas.io/en/stable/"},
                        {"title": "LangChain Routing", "url": "https://python.langchain.com/docs/modules/chains/foundational/router"}
                    ],
                    "topics": [
                        {"id": "topic_3_1", "uuid": uid(), "title": "Query Routing", "youtube_search_query": "Query Routing LLM", "subtopics": [{"id": uid(), "title": "Semantic Routing"}, {"id": uid(), "title": "LLM-based Routing"}, {"id": uid(), "title": "Multi-hop Decomposition"}]},
                        {"id": "topic_3_2", "uuid": uid(), "title": "RAG Evaluation Metrics", "youtube_search_query": "RAG Evaluation RAGAS", "subtopics": [{"id": uid(), "title": "Context Precision"}, {"id": uid(), "title": "Context Recall"}, {"id": uid(), "title": "Faithfulness"}]},
                        {"id": "topic_3_3", "uuid": uid(), "title": "Monitoring RAG in Production", "youtube_search_query": "LLM Observability", "subtopics": [{"id": uid(), "title": "Logging User Queries"}, {"id": uid(), "title": "Feedback Loops"}, {"id": uid(), "title": "Tracing with LangSmith"}]}
                    ]
                }
            ]
        },
        {
            "title": "LLM Inference Internals: KV Cache, PagedAttention, and Continuous Batching",
            "description": "Deep dive into making LLMs fast. Understand the KV cache, memory management, and scaling inference.",
            "subject": "AI Infrastructure",
            "modules": [
                {
                    "id": uid(),
                    "title": "Transformer Inference Fundamentals",
                    "outcome": "Understand the bottleneck in autoregressive decoding and the role of the KV cache.",
                    "timeline": "Week 1",
                    "workspace_type": "research",
                    "optimal_search_query": "KV cache autoregressive decoding transformer",
                    "proof_of_work_instructions": {
                        "what_to_build": "Implement a simple autoregressive loop with and without KV caching for comparison.",
                        "what_counts_as_evidence": "A script that demonstrates the latency difference between the two approaches.",
                        "eval_criteria": [
                            "Correct implementation of KV caching in the loop.",
                            "Clear latency measurement showing the speedup."
                        ]
                    },
                    "resources": [
                        {"title": "Transformer Inference Math", "url": "https://kipp.ly/blog/transformer-inference-arithmetic/"},
                        {"title": "Hugging Face Text Generation", "url": "https://huggingface.co/blog/how-to-generate"}
                    ],
                    "topics": [
                        {"id": "topic_1_1", "uuid": uid(), "title": "Autoregressive Decoding", "youtube_search_query": "autoregressive decoding LLM", "subtopics": [{"id": uid(), "title": "Token by Token Generation"}, {"id": uid(), "title": "Prefill vs Decode Phase"}, {"id": uid(), "title": "Computational Bottlenecks"}]},
                        {"id": "topic_1_2", "uuid": uid(), "title": "KV Cache Mechanics", "youtube_search_query": "KV Cache explained", "subtopics": [{"id": uid(), "title": "Key and Value Tensors"}, {"id": uid(), "title": "Memory Footprint"}, {"id": uid(), "title": "Cache Updates"}]},
                        {"id": "topic_1_3", "uuid": uid(), "title": "Memory Bandwidth", "youtube_search_query": "Memory Bandwidth LLM inference", "subtopics": [{"id": uid(), "title": "Compute Bound vs Memory Bound"}, {"id": uid(), "title": "Arithmetic Intensity"}, {"id": uid(), "title": "GPU Architecture Basics"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "Memory Management & PagedAttention",
                    "outcome": "Learn how vLLM optimizes memory using operating system paging concepts.",
                    "timeline": "Week 2",
                    "workspace_type": "code",
                    "optimal_search_query": "vLLM PagedAttention paper",
                    "proof_of_work_instructions": {
                        "what_to_build": "Deploy an open-source model using vLLM and profile its memory usage.",
                        "what_counts_as_evidence": "Memory profiling logs showing efficient KV cache memory allocation.",
                        "eval_criteria": [
                            "Successfully run vLLM inference server.",
                            "Valid memory metrics extracted during generation."
                        ]
                    },
                    "resources": [
                        {"title": "vLLM Documentation", "url": "https://vllm.readthedocs.io/"},
                        {"title": "PagedAttention Paper", "url": "https://arxiv.org/abs/2309.06180"}
                    ],
                    "topics": [
                        {"id": "topic_2_1", "uuid": uid(), "title": "The Memory Fragmentation Problem", "youtube_search_query": "KV cache fragmentation", "subtopics": [{"id": uid(), "title": "Internal Fragmentation"}, {"id": uid(), "title": "External Fragmentation"}, {"id": uid(), "title": "Impact on Batch Size"}]},
                        {"id": "topic_2_2", "uuid": uid(), "title": "PagedAttention Concepts", "youtube_search_query": "PagedAttention vLLM", "subtopics": [{"id": uid(), "title": "Virtual vs Physical Blocks"}, {"id": uid(), "title": "Block Tables"}, {"id": uid(), "title": "Non-contiguous Memory"}]},
                        {"id": "topic_2_3", "uuid": uid(), "title": "vLLM Architecture", "youtube_search_query": "vLLM architecture", "subtopics": [{"id": uid(), "title": "Scheduler"}, {"id": uid(), "title": "Worker Processes"}, {"id": uid(), "title": "Cache Engine"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "Batching Strategies",
                    "outcome": "Explore methods to maximize GPU utilization across multiple requests.",
                    "timeline": "Week 3",
                    "workspace_type": "research",
                    "optimal_search_query": "continuous batching ORCA LLM",
                    "proof_of_work_instructions": {
                        "what_to_build": "Simulate continuous batching logic in a Python script.",
                        "what_counts_as_evidence": "A script that processes multiple dummy requests using a simulated continuous batching loop.",
                        "eval_criteria": [
                            "Requests can join and leave the batch dynamically.",
                            "Correct simulation of token generation cycles."
                        ]
                    },
                    "resources": [
                        {"title": "Continuous Batching (ORCA)", "url": "https://www.usenix.org/conference/osdi22/presentation/yu"},
                        {"title": "Speculative Decoding", "url": "https://arxiv.org/abs/2211.17192"}
                    ],
                    "topics": [
                        {"id": "topic_3_1", "uuid": uid(), "title": "Static vs Dynamic Batching", "youtube_search_query": "Dynamic Batching Inference", "subtopics": [{"id": uid(), "title": "Padding Inefficiency"}, {"id": uid(), "title": "Batching Overhead"}, {"id": uid(), "title": "Throughput vs Latency"}]},
                        {"id": "topic_3_2", "uuid": uid(), "title": "Continuous (Iteration-Level) Batching", "youtube_search_query": "Continuous Batching LLM", "subtopics": [{"id": uid(), "title": "Request Eviction"}, {"id": uid(), "title": "Iteration-Level Scheduling"}, {"id": uid(), "title": "ORCA System"}]},
                        {"id": "topic_3_3", "uuid": uid(), "title": "Speculative Decoding", "youtube_search_query": "Speculative Decoding", "subtopics": [{"id": uid(), "title": "Draft Model"}, {"id": uid(), "title": "Target Model Verification"}, {"id": uid(), "title": "Acceptance Rate"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "Quantization and Low Precision Inference",
                    "outcome": "Learn techniques to run models in lower precision without significantly losing accuracy.",
                    "timeline": "Week 4",
                    "workspace_type": "research",
                    "optimal_search_query": "LLM quantization INT8 FP8 AWQ",
                    "proof_of_work_instructions": {
                        "what_to_build": "Quantize a small language model and compare memory usage with the FP16 baseline.",
                        "what_counts_as_evidence": "A comparison report on model size and inference latency.",
                        "eval_criteria": [
                            "Successful conversion to INT8 or AWQ format.",
                            "Clear metrics on VRAM savings."
                        ]
                    },
                    "resources": [
                        {"title": "GPTQ Paper", "url": "https://arxiv.org/abs/2210.17323"},
                        {"title": "AWQ Paper", "url": "https://arxiv.org/abs/2306.00978"}
                    ],
                    "topics": [
                        {"id": "topic_4_1", "uuid": uid(), "title": "Post-Training Quantization", "youtube_search_query": "PTQ vs QAT", "subtopics": [{"id": uid(), "title": "Weight-only vs Weight-Activation"}, {"id": uid(), "title": "Calibration Data"}, {"id": uid(), "title": "Accuracy Degradation"}]},
                        {"id": "topic_4_2", "uuid": uid(), "title": "AWQ and GPTQ", "youtube_search_query": "AWQ GPTQ LLM", "subtopics": [{"id": uid(), "title": "GPTQ Optimization"}, {"id": uid(), "title": "Activation-aware Weight Quantization"}, {"id": uid(), "title": "Performance Characteristics"}]},
                        {"id": "topic_4_3", "uuid": uid(), "title": "FP8 and Hardware Support", "youtube_search_query": "FP8 inference NVIDIA", "subtopics": [{"id": uid(), "title": "Transformer Engine"}, {"id": uid(), "title": "Hopper Architecture Features"}, {"id": uid(), "title": "Dynamic Scaling"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "Serving at Scale",
                    "outcome": "Deploy optimized models and benchmark their performance.",
                    "timeline": "Week 5",
                    "workspace_type": "code",
                    "optimal_search_query": "TensorRT-LLM LLM benchmarking",
                    "proof_of_work_instructions": {
                        "what_to_build": "Benchmark a deployed LLM endpoint using tools like llmperf.",
                        "what_counts_as_evidence": "A benchmarking report showing Time to First Token (TTFT) and Inter-Token Latency.",
                        "eval_criteria": [
                            "Successful execution of a load test.",
                            "Accurate interpretation of TTFT and throughput."
                        ]
                    },
                    "resources": [
                        {"title": "TensorRT-LLM", "url": "https://github.com/NVIDIA/TensorRT-LLM"},
                        {"title": "Hugging Face TGI", "url": "https://github.com/huggingface/text-generation-inference"}
                    ],
                    "topics": [
                        {"id": "topic_5_1", "uuid": uid(), "title": "TensorRT-LLM", "youtube_search_query": "TensorRT LLM tutorial", "subtopics": [{"id": uid(), "title": "Engine Compilation"}, {"id": uid(), "title": "Kernel Optimizations"}, {"id": uid(), "title": "In-flight Batching"}]},
                        {"id": "topic_5_2", "uuid": uid(), "title": "Benchmarking Metrics", "youtube_search_query": "TTFT LLM Metrics", "subtopics": [{"id": uid(), "title": "Time to First Token (TTFT)"}, {"id": uid(), "title": "Inter-Token Latency"}, {"id": uid(), "title": "Tokens per Second"}]},
                        {"id": "topic_5_3", "uuid": uid(), "title": "Multi-GPU Serving", "youtube_search_query": "Tensor Parallelism Pipeline Parallelism", "subtopics": [{"id": uid(), "title": "Tensor Parallelism"}, {"id": uid(), "title": "Pipeline Parallelism"}, {"id": uid(), "title": "Communication Overhead"}]}
                    ]
                }
            ]
        },
        {
            "title": "OAuth2 and OpenID Connect: Understanding Every Token and Flow",
            "description": "Master identity and access management by building OAuth2 and OIDC flows from scratch.",
            "subject": "Security Engineering",
            "modules": [
                {
                    "id": uid(),
                    "title": "OAuth2 Fundamentals",
                    "outcome": "Grasp the core roles and grant types of OAuth2.",
                    "timeline": "Week 1",
                    "workspace_type": "research",
                    "optimal_search_query": "OAuth2 authorization code flow explained",
                    "proof_of_work_instructions": {
                        "what_to_build": "Create sequence diagrams for the Authorization Code and Client Credentials flows.",
                        "what_counts_as_evidence": "Image files or markdown of the sequence diagrams.",
                        "eval_criteria": [
                            "Correct actors and communication paths.",
                            "Accurate representation of token exchange."
                        ]
                    },
                    "resources": [
                        {"title": "RFC 6749 (OAuth 2.0)", "url": "https://datatracker.ietf.org/doc/html/rfc6749"},
                        {"title": "OAuth 2.0 Simplified", "url": "https://aaronparecki.com/oauth-2-simplified/"}
                    ],
                    "topics": [
                        {"id": "topic_1_1", "uuid": uid(), "title": "OAuth2 Roles", "youtube_search_query": "OAuth2 roles explained", "subtopics": [{"id": uid(), "title": "Resource Owner"}, {"id": uid(), "title": "Client"}, {"id": uid(), "title": "Authorization Server"}]},
                        {"id": "topic_1_2", "uuid": uid(), "title": "Authorization Code Flow", "youtube_search_query": "Authorization Code Flow", "subtopics": [{"id": uid(), "title": "Authorization Request"}, {"id": uid(), "title": "Redirection URI"}, {"id": uid(), "title": "Code Exchange"}]},
                        {"id": "topic_1_3", "uuid": uid(), "title": "Scopes and Consents", "youtube_search_query": "OAuth2 Scopes", "subtopics": [{"id": uid(), "title": "Scope Definition"}, {"id": uid(), "title": "Consent Screen"}, {"id": uid(), "title": "Granular Access"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "Token Mechanics",
                    "outcome": "Understand JWT structure, signing, and lifecycle management.",
                    "timeline": "Week 2",
                    "workspace_type": "code",
                    "optimal_search_query": "JWT signing structure refresh token",
                    "proof_of_work_instructions": {
                        "what_to_build": "Implement a simple JWT issuer and verifier in Python.",
                        "what_counts_as_evidence": "A script that generates a signed JWT and then successfully verifies it.",
                        "eval_criteria": [
                            "Correct usage of cryptographic signing (e.g., RS256).",
                            "Proper validation of expiration (exp) claims."
                        ]
                    },
                    "resources": [
                        {"title": "JWT.io", "url": "https://jwt.io/"},
                        {"title": "RFC 7519 (JWT)", "url": "https://datatracker.ietf.org/doc/html/rfc7519"}
                    ],
                    "topics": [
                        {"id": "topic_2_1", "uuid": uid(), "title": "JWT Structure", "youtube_search_query": "JWT structure explained", "subtopics": [{"id": uid(), "title": "Header"}, {"id": uid(), "title": "Payload"}, {"id": uid(), "title": "Signature"}]},
                        {"id": "topic_2_2", "uuid": uid(), "title": "Signing Algorithms", "youtube_search_query": "JWT RS256 HS256", "subtopics": [{"id": uid(), "title": "Symmetric (HS256)"}, {"id": uid(), "title": "Asymmetric (RS256)"}, {"id": uid(), "title": "Key Management (JWKS)"}]},
                        {"id": "topic_2_3", "uuid": uid(), "title": "Token Lifecycle", "youtube_search_query": "Access Token vs Refresh Token", "subtopics": [{"id": uid(), "title": "Access Tokens"}, {"id": uid(), "title": "Refresh Tokens"}, {"id": uid(), "title": "Token Expiration"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "OpenID Connect Layer",
                    "outcome": "Add authentication to OAuth2 using OpenID Connect.",
                    "timeline": "Week 3",
                    "workspace_type": "code",
                    "optimal_search_query": "OpenID Connect ID token discovery",
                    "proof_of_work_instructions": {
                        "what_to_build": "Build a client that authenticates via OIDC and fetches user profile data.",
                        "what_counts_as_evidence": "A web app route that completes OIDC login and displays user info.",
                        "eval_criteria": [
                            "Successful extraction and validation of ID Token.",
                            "Valid request to the UserInfo endpoint."
                        ]
                    },
                    "resources": [
                        {"title": "OpenID Connect Spec", "url": "https://openid.net/specs/openid-connect-core-1_0.html"},
                        {"title": "OIDC Explained", "url": "https://www.oauth.com/oauth2-servers/openid-connect/"}
                    ],
                    "topics": [
                        {"id": "topic_3_1", "uuid": uid(), "title": "OIDC vs OAuth2", "youtube_search_query": "OIDC vs OAuth2", "subtopics": [{"id": uid(), "title": "Authentication vs Authorization"}, {"id": uid(), "title": "The 'openid' Scope"}, {"id": uid(), "title": "Identity Layer"}]},
                        {"id": "topic_3_2", "uuid": uid(), "title": "The ID Token", "youtube_search_query": "OIDC ID Token", "subtopics": [{"id": uid(), "title": "Standard Claims"}, {"id": uid(), "title": "Audience and Issuer validation"}, {"id": uid(), "title": "Nonce for Replay Protection"}]},
                        {"id": "topic_3_3", "uuid": uid(), "title": "UserInfo and Discovery", "youtube_search_query": "OIDC UserInfo Endpoint Discovery", "subtopics": [{"id": uid(), "title": "Fetching Profile Data"}, {"id": uid(), "title": "The .well-known Endpoint"}, {"id": uid(), "title": "Provider Metadata"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "Security Hardening",
                    "outcome": "Secure OAuth2 implementations against common vulnerabilities.",
                    "timeline": "Week 4",
                    "workspace_type": "research",
                    "optimal_search_query": "OAuth2 security best practices PKCE",
                    "proof_of_work_instructions": {
                        "what_to_build": "Audit an OAuth2 client implementation for common security flaws.",
                        "what_counts_as_evidence": "A security report identifying missing PKCE, weak state parameters, or lack of scope validation.",
                        "eval_criteria": [
                            "Identification of at least two security vulnerabilities.",
                            "Proposed fixes utilizing industry standards."
                        ]
                    },
                    "resources": [
                        {"title": "OAuth 2.0 Security BCP", "url": "https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics"},
                        {"title": "OWASP OAuth Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/cheatsheets/OAuth_Cheat_Sheet.html"}
                    ],
                    "topics": [
                        {"id": "topic_4_1", "uuid": uid(), "title": "PKCE (Proof Key for Code Exchange)", "youtube_search_query": "OAuth2 PKCE explained", "subtopics": [{"id": uid(), "title": "Code Interception Attacks"}, {"id": uid(), "title": "Code Verifier and Challenge"}, {"id": uid(), "title": "Mobile and SPA Security"}]},
                        {"id": "topic_4_2", "uuid": uid(), "title": "State and CSRF", "youtube_search_query": "OAuth2 State parameter CSRF", "subtopics": [{"id": uid(), "title": "Cross-Site Request Forgery"}, {"id": uid(), "title": "The State Parameter"}, {"id": uid(), "title": "Binding State to Session"}]},
                        {"id": "topic_4_3", "uuid": uid(), "title": "Token Binding & DPoP", "youtube_search_query": "OAuth DPoP Token Binding", "subtopics": [{"id": uid(), "title": "Bearer Token Vulnerabilities"}, {"id": uid(), "title": "Demonstrating Proof-of-Possession"}, {"id": uid(), "title": "Mutual TLS"}]}
                    ]
                }
            ]
        },
        {
            "title": "PostgreSQL Indexing Internals: B-Tree, GIN, GiST, and BRIN Explained",
            "description": "Deeply understand how PostgreSQL indexes work under the hood and when to use each type.",
            "subject": "Database Engineering",
            "modules": [
                {
                    "id": uid(),
                    "title": "B-Tree Deep Dive",
                    "outcome": "Master the default PostgreSQL index and its advanced configurations.",
                    "timeline": "Week 1",
                    "workspace_type": "code",
                    "optimal_search_query": "PostgreSQL B-tree internals",
                    "proof_of_work_instructions": {
                        "what_to_build": "Create test tables with partial and covering indexes, analyzing their performance.",
                        "what_counts_as_evidence": "EXPLAIN ANALYZE output showing Index Only Scans and filtered Index Scans.",
                        "eval_criteria": [
                            "Successful creation of partial and INCLUDE indexes.",
                            "Demonstrated query performance improvement via execution plans."
                        ]
                    },
                    "resources": [
                        {"title": "PostgreSQL B-Tree Indexes", "url": "https://www.postgresql.org/docs/current/btree.html"},
                        {"title": "Use The Index, Luke", "url": "https://use-the-index-luke.com/"}
                    ],
                    "topics": [
                        {"id": "topic_1_1", "uuid": uid(), "title": "B-Tree Structure", "youtube_search_query": "B-Tree Database Index", "subtopics": [{"id": uid(), "title": "Root, Branch, Leaf Pages"}, {"id": uid(), "title": "O(log n) Lookup"}, {"id": uid(), "title": "Page Splits"}]},
                        {"id": "topic_1_2", "uuid": uid(), "title": "Index Only Scans", "youtube_search_query": "PostgreSQL Index Only Scan", "subtopics": [{"id": uid(), "title": "Visibility Map"}, {"id": uid(), "title": "Covering Indexes (INCLUDE)"}, {"id": uid(), "title": "Heap Fetches"}]},
                        {"id": "topic_1_3", "uuid": uid(), "title": "Partial Indexes", "youtube_search_query": "PostgreSQL Partial Index", "subtopics": [{"id": uid(), "title": "WHERE Clause in Indexes"}, {"id": uid(), "title": "Saving Space"}, {"id": uid(), "title": "Query Planning"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "GIN Indexes",
                    "outcome": "Optimize queries for full-text search, arrays, and JSONB data.",
                    "timeline": "Week 2",
                    "workspace_type": "code",
                    "optimal_search_query": "PostgreSQL GIN index JSONB",
                    "proof_of_work_instructions": {
                        "what_to_build": "Implement a fast search over a large JSONB dataset using a GIN index.",
                        "what_counts_as_evidence": "Queries filtering on nested JSONB keys utilizing the GIN index efficiently.",
                        "eval_criteria": [
                            "Correct GIN index creation on JSONB column.",
                            "Execution plan showing Bitmap Index Scan on the GIN index."
                        ]
                    },
                    "resources": [
                        {"title": "PostgreSQL GIN", "url": "https://www.postgresql.org/docs/current/gin.html"},
                        {"title": "Indexing JSONB", "url": "https://pganalyze.com/blog/gin-index"}
                    ],
                    "topics": [
                        {"id": "topic_2_1", "uuid": uid(), "title": "Generalized Inverted Index", "youtube_search_query": "Inverted Index explained", "subtopics": [{"id": uid(), "title": "Key-to-Item Mapping"}, {"id": uid(), "title": "Posting Lists"}, {"id": uid(), "title": "Maintenance Overhead"}]},
                        {"id": "topic_2_2", "uuid": uid(), "title": "Full-Text Search", "youtube_search_query": "PostgreSQL Full Text Search GIN", "subtopics": [{"id": uid(), "title": "tsvector and tsquery"}, {"id": uid(), "title": "Lexemes"}, {"id": uid(), "title": "Ranking"}]},
                        {"id": "topic_2_3", "uuid": uid(), "title": "JSONB Indexing", "youtube_search_query": "Postgres JSONB GIN", "subtopics": [{"id": uid(), "title": "jsonb_ops vs jsonb_path_ops"}, {"id": uid(), "title": "Key Existence Checks"}, {"id": uid(), "title": "Containment Operator"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "Specialized Indexes: GiST and BRIN",
                    "outcome": "Understand spatial data indexing and massive table indexing.",
                    "timeline": "Week 3",
                    "workspace_type": "code",
                    "optimal_search_query": "PostgreSQL GiST and BRIN indexes",
                    "proof_of_work_instructions": {
                        "what_to_build": "Compare GiST for spatial data with BRIN for time-series data.",
                        "what_counts_as_evidence": "Execution plans highlighting the different use cases and index size comparisons.",
                        "eval_criteria": [
                            "Correct use of GiST for KNN searches.",
                            "Accurate demonstration of BRIN's small index size."
                        ]
                    },
                    "resources": [
                        {"title": "PostgreSQL GiST", "url": "https://www.postgresql.org/docs/current/gist.html"},
                        {"title": "PostgreSQL BRIN", "url": "https://www.postgresql.org/docs/current/brin.html"}
                    ],
                    "topics": [
                        {"id": "topic_3_1", "uuid": uid(), "title": "GiST and Geometric Types", "youtube_search_query": "Postgres GiST Geometric Types", "subtopics": [{"id": uid(), "title": "Tree Structure"}, {"id": uid(), "title": "Bounding Boxes"}, {"id": uid(), "title": "PostGIS Integration"}]},
                        {"id": "topic_3_2", "uuid": uid(), "title": "K-Nearest Neighbors (KNN)", "youtube_search_query": "Postgres KNN GiST", "subtopics": [{"id": uid(), "title": "Distance Operators"}, {"id": uid(), "title": "ORDER BY with GiST"}, {"id": uid(), "title": "Performance Tuning"}]},
                        {"id": "topic_3_3", "uuid": uid(), "title": "BRIN Indexes", "youtube_search_query": "BRIN index Postgres", "subtopics": [{"id": uid(), "title": "Min/Max values per block"}, {"id": uid(), "title": "Time-series Data Use Cases"}, {"id": uid(), "title": "Space Efficiency"}]}
                    ]
                }
            ]
        },
        {
            "title": "TCP/IP from Scratch: Building a Network Stack in Code",
            "description": "Understand network protocols by writing raw sockets and parsing packets.",
            "subject": "Network Engineering",
            "modules": [
                {
                    "id": uid(),
                    "title": "Raw Sockets and Ethernet Frames",
                    "outcome": "Capture and parse raw Ethernet frames from the network interface.",
                    "timeline": "Week 1",
                    "workspace_type": "code",
                    "optimal_search_query": "raw sockets ethernet frame parsing",
                    "proof_of_work_instructions": {
                        "what_to_build": "Write a program that uses raw sockets to capture and print Ethernet frame headers.",
                        "what_counts_as_evidence": "Logs showing captured MAC addresses and EtherType fields.",
                        "eval_criteria": [
                            "Successful binding of a raw socket.",
                            "Accurate unpacking of the 14-byte Ethernet header."
                        ]
                    },
                    "resources": [
                        {"title": "Beej's Guide to Network Programming", "url": "https://beej.us/guide/bgnet/"},
                        {"title": "Linux Packet Sockets", "url": "https://man7.org/linux/man-pages/man7/packet.7.html"}
                    ],
                    "topics": [
                        {"id": "topic_1_1", "uuid": uid(), "title": "OSI and TCP/IP Models", "youtube_search_query": "OSI vs TCP/IP model", "subtopics": [{"id": uid(), "title": "Layered Architecture"}, {"id": uid(), "title": "Encapsulation"}, {"id": uid(), "title": "Protocol Data Units"}]},
                        {"id": "topic_1_2", "uuid": uid(), "title": "Raw Sockets", "youtube_search_query": "Raw sockets C programming", "subtopics": [{"id": uid(), "title": "Bypassing the Kernel Stack"}, {"id": uid(), "title": "AF_PACKET"}, {"id": uid(), "title": "Promiscuous Mode"}]},
                        {"id": "topic_1_3", "uuid": uid(), "title": "Ethernet Frame Structure", "youtube_search_query": "Ethernet Frame Header", "subtopics": [{"id": uid(), "title": "MAC Addresses"}, {"id": uid(), "title": "EtherType"}, {"id": uid(), "title": "FCS/CRC"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "Address Resolution Protocol (ARP)",
                    "outcome": "Implement ARP to discover MAC addresses on the local network.",
                    "timeline": "Week 2",
                    "workspace_type": "code",
                    "optimal_search_query": "ARP protocol implementation raw sockets",
                    "proof_of_work_instructions": {
                        "what_to_build": "Send an ARP request and parse the reply to find a device's MAC address.",
                        "what_counts_as_evidence": "A script outputting the resolved MAC address for a given IP.",
                        "eval_criteria": [
                            "Correct formatting of the ARP packet.",
                            "Proper handling of the ARP reply."
                        ]
                    },
                    "resources": [
                        {"title": "RFC 826 (ARP)", "url": "https://datatracker.ietf.org/doc/html/rfc826"},
                        {"title": "ARP Explained", "url": "https://www.practicalnetworking.net/series/arp/address-resolution-protocol/"}
                    ],
                    "topics": [
                        {"id": "topic_2_1", "uuid": uid(), "title": "ARP Fundamentals", "youtube_search_query": "ARP protocol explained", "subtopics": [{"id": uid(), "title": "IP to MAC mapping"}, {"id": uid(), "title": "Local vs Remote Delivery"}, {"id": uid(), "title": "ARP Cache"}]},
                        {"id": "topic_2_2", "uuid": uid(), "title": "ARP Packet Structure", "youtube_search_query": "ARP packet format", "subtopics": [{"id": uid(), "title": "Hardware/Protocol Types"}, {"id": uid(), "title": "Opcode (Request/Reply)"}, {"id": uid(), "title": "Sender/Target Addresses"}]},
                        {"id": "topic_2_3", "uuid": uid(), "title": "Spoofing and Security", "youtube_search_query": "ARP Spoofing", "subtopics": [{"id": uid(), "title": "Gratuitous ARP"}, {"id": uid(), "title": "ARP Poisoning"}, {"id": uid(), "title": "Mitigation Strategies"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "The IP Layer and ICMP",
                    "outcome": "Parse IPv4 headers and implement a basic ping utility.",
                    "timeline": "Week 3",
                    "workspace_type": "code",
                    "optimal_search_query": "IPv4 header parsing ICMP ping",
                    "proof_of_work_instructions": {
                        "what_to_build": "Extend the packet sniffer to parse IPv4 headers and implement an ICMP echo request.",
                        "what_counts_as_evidence": "Logs showing sent pings and received replies with latency.",
                        "eval_criteria": [
                            "Correct bitwise operations to parse IP header fields.",
                            "Successful generation and validation of ICMP checksums."
                        ]
                    },
                    "resources": [
                        {"title": "RFC 791 (IPv4)", "url": "https://datatracker.ietf.org/doc/html/rfc791"},
                        {"title": "RFC 792 (ICMP)", "url": "https://datatracker.ietf.org/doc/html/rfc792"}
                    ],
                    "topics": [
                        {"id": "topic_3_1", "uuid": uid(), "title": "IPv4 Header Structure", "youtube_search_query": "IPv4 header format", "subtopics": [{"id": uid(), "title": "Version and IHL"}, {"id": uid(), "title": "TTL and Protocol"}, {"id": uid(), "title": "Header Checksum"}]},
                        {"id": "topic_3_2", "uuid": uid(), "title": "IP Routing", "youtube_search_query": "IP Routing Table", "subtopics": [{"id": uid(), "title": "Routing Tables"}, {"id": uid(), "title": "Default Gateway"}, {"id": uid(), "title": "Longest Prefix Match"}]},
                        {"id": "topic_3_3", "uuid": uid(), "title": "Internet Control Message Protocol", "youtube_search_query": "ICMP ping traceroute", "subtopics": [{"id": uid(), "title": "Echo Request/Reply"}, {"id": uid(), "title": "Time Exceeded (Traceroute)"}, {"id": uid(), "title": "Destination Unreachable"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "UDP and Basic Transport",
                    "outcome": "Understand connectionless transport and build a simple UDP echo server/client.",
                    "timeline": "Week 4",
                    "workspace_type": "code",
                    "optimal_search_query": "UDP protocol implementation raw sockets",
                    "proof_of_work_instructions": {
                        "what_to_build": "Craft raw UDP packets and parse incoming UDP datagrams.",
                        "what_counts_as_evidence": "A script that sends a raw UDP packet to a standard echo server and reads the response.",
                        "eval_criteria": [
                            "Correct calculation of the UDP checksum (including pseudo-header).",
                            "Proper handling of source and destination ports."
                        ]
                    },
                    "resources": [
                        {"title": "RFC 768 (UDP)", "url": "https://datatracker.ietf.org/doc/html/rfc768"},
                        {"title": "UDP Pseudo Header", "url": "https://en.wikipedia.org/wiki/User_Datagram_Protocol#IPv4_pseudo_header"}
                    ],
                    "topics": [
                        {"id": "topic_4_1", "uuid": uid(), "title": "UDP Characteristics", "youtube_search_query": "UDP vs TCP", "subtopics": [{"id": uid(), "title": "Connectionless Protocol"}, {"id": uid(), "title": "Low Overhead"}, {"id": uid(), "title": "Use Cases (DNS, Video)"}]},
                        {"id": "topic_4_2", "uuid": uid(), "title": "UDP Header Structure", "youtube_search_query": "UDP header format", "subtopics": [{"id": uid(), "title": "Source/Dest Ports"}, {"id": uid(), "title": "Length Field"}, {"id": uid(), "title": "Checksum Calculation"}]},
                        {"id": "topic_4_3", "uuid": uid(), "title": "Multiplexing", "youtube_search_query": "Network Multiplexing Ports", "subtopics": [{"id": uid(), "title": "Sockets and Ports"}, {"id": uid(), "title": "Demultiplexing incoming packets"}, {"id": uid(), "title": "Ephemeral Ports"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "TCP Fundamentals (Handshake)",
                    "outcome": "Implement the TCP 3-way handshake and sequence number tracking.",
                    "timeline": "Week 5",
                    "workspace_type": "code",
                    "optimal_search_query": "TCP 3-way handshake raw sockets",
                    "proof_of_work_instructions": {
                        "what_to_build": "Write code that sends a SYN packet and parses the SYN-ACK response.",
                        "what_counts_as_evidence": "A script that successfully establishes the beginning of a TCP connection manually.",
                        "eval_criteria": [
                            "Correct construction of TCP header flags (SYN).",
                            "Accurate calculation of the TCP checksum."
                        ]
                    },
                    "resources": [
                        {"title": "RFC 793 (TCP)", "url": "https://datatracker.ietf.org/doc/html/rfc793"},
                        {"title": "TCP/IP Illustrated", "url": "https://en.wikipedia.org/wiki/TCP/IP_Illustrated"}
                    ],
                    "topics": [
                        {"id": "topic_5_1", "uuid": uid(), "title": "TCP Header and Ports", "youtube_search_query": "TCP header explained", "subtopics": [{"id": uid(), "title": "Source/Dest Ports"}, {"id": uid(), "title": "Control Flags (SYN, ACK, FIN)"}, {"id": uid(), "title": "Window Size"}]},
                        {"id": "topic_5_2", "uuid": uid(), "title": "The Three-Way Handshake", "youtube_search_query": "TCP Three Way Handshake", "subtopics": [{"id": uid(), "title": "SYN"}, {"id": uid(), "title": "SYN-ACK"}, {"id": uid(), "title": "ACK"}]},
                        {"id": "topic_5_3", "uuid": uid(), "title": "Sequence and Acknowledgment", "youtube_search_query": "TCP Sequence Numbers", "subtopics": [{"id": uid(), "title": "Initial Sequence Number (ISN)"}, {"id": uid(), "title": "Byte Stream Tracking"}, {"id": uid(), "title": "Cumulative ACKs"}]}
                    ]
                },
                {
                    "id": uid(),
                    "title": "TCP Reliability and Teardown",
                    "outcome": "Understand flow control, congestion, and connection termination.",
                    "timeline": "Week 6",
                    "workspace_type": "research",
                    "optimal_search_query": "TCP congestion control retransmission",
                    "proof_of_work_instructions": {
                        "what_to_build": "Analyze a Wireshark pcap file to identify retransmissions and window scaling.",
                        "what_counts_as_evidence": "A brief report pointing out specific frame numbers demonstrating TCP reliability mechanisms.",
                        "eval_criteria": [
                            "Correct identification of a retransmitted packet.",
                            "Understanding of how the receive window changes."
                        ]
                    },
                    "resources": [
                        {"title": "Wireshark TCP Analysis", "url": "https://www.wireshark.org/docs/wsug_html_chunked/ChAdvTCPAnalysis.html"},
                        {"title": "TCP Congestion Control (RFC 5681)", "url": "https://datatracker.ietf.org/doc/html/rfc5681"}
                    ],
                    "topics": [
                        {"id": "topic_6_1", "uuid": uid(), "title": "Flow Control", "youtube_search_query": "TCP Flow Control Sliding Window", "subtopics": [{"id": uid(), "title": "Receive Window"}, {"id": uid(), "title": "Sliding Window Protocol"}, {"id": uid(), "title": "Zero Window Probes"}]},
                        {"id": "topic_6_2", "uuid": uid(), "title": "Retransmission Mechanisms", "youtube_search_query": "TCP Retransmission", "subtopics": [{"id": uid(), "title": "Retransmission Timeout (RTO)"}, {"id": uid(), "title": "Fast Retransmit"}, {"id": uid(), "title": "Duplicate ACKs"}]},
                        {"id": "topic_6_3", "uuid": uid(), "title": "Connection Teardown", "youtube_search_query": "TCP connection termination", "subtopics": [{"id": uid(), "title": "Four-Way Handshake (FIN)"}, {"id": uid(), "title": "Half-Closed Connections"}, {"id": uid(), "title": "RST Packets"}]}
                    ]
                }
            ]
        }
    ]

    for course in courses:
        title = course["title"]
        slug = await _generate_unique_slug(title, email, supabase)
        plan_hash = _generate_plan_hash(course)
        
        insert_data = {
            "email": email,
            "title": title,
            "description": course["description"],
            "slug": slug,
            "snapshot_hash": plan_hash,
            "is_public": True,
            "show_author": True,
            "roadmap_plan": course,
            "subject": course["subject"],
            "status": "active",
            "version": 1
        }
        
        response = supabase.table("roadmaps").insert(insert_data).execute()
        if response.data:
            print(f"Inserted roadmap: {title} (ID: {response.data[0]['id']})")
        else:
            print(f"Failed to insert roadmap: {title}")

if __name__ == "__main__":
    asyncio.run(main())
