import os
import sys
import json
import uuid
import subprocess

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv('.env')

from app.core.supabase_client import get_supabase_client

def uid():
    return str(uuid.uuid4())

sb = get_supabase_client()

CURRICULA = {
    1485: {
        "prerequisites": ["Basic networking concepts", "Command-line interface familiarity", "Basic programming knowledge"],
        "what_you_will_learn": ["Understand IaC principles and benefits", "Write and provision infrastructure using Terraform", "Manage state and workspaces", "Automate infrastructure deployment", "Implement IaC CI/CD pipelines"],
        "modules": [
            {
                "title": "Introduction to Infrastructure as Code",
                "outcome": "Understand the declarative vs imperative approaches and the role of IaC in modern DevOps.",
                "timeline": "Week 1",
                "workspace_type": "research",
                "optimal_search_query": "Introduction to Infrastructure as Code concepts",
                "topics": [
                    {"title": "Declarative vs. Imperative Paradigms", "subtopics": [{"title": "Understanding declarative models"}, {"title": "Imperative automation scripts"}, {"title": "Idempotency in IaC"}]},
                    {"title": "Overview of IaC Tools", "subtopics": [{"title": "Provisioning vs Configuration Management"}, {"title": "Terraform ecosystem"}, {"title": "Ansible fundamentals"}]}
                ]
            },
            {
                "title": "HCL and Terraform Basics",
                "outcome": "Write your first Terraform configuration files to provision basic resources.",
                "timeline": "Week 2",
                "workspace_type": "research",
                "optimal_search_query": "Terraform HCL basics syntax providers",
                "topics": [
                    {"title": "HCL (HashiCorp Configuration Language)", "subtopics": [{"title": "Blocks and Arguments"}, {"title": "Variables and Outputs"}, {"title": "Data sources"}]},
                    {"title": "Terraform CLI Lifecycle", "subtopics": [{"title": "terraform init and plan"}, {"title": "terraform apply and destroy"}, {"title": "Understanding the execution plan"}]}
                ]
            },
            {
                "title": "State Management Mechanics",
                "outcome": "Understand the critical role of the state file and how to handle it in a team.",
                "timeline": "Week 3",
                "workspace_type": "research",
                "optimal_search_query": "Terraform state management locking remote backend",
                "topics": [
                    {"title": "The tfstate File", "subtopics": [{"title": "How Terraform maps resources"}, {"title": "State drift and reconciliation"}, {"title": "Sensitive data in state"}]},
                    {"title": "Remote State and Locking", "subtopics": [{"title": "Configuring S3/GCS backends"}, {"title": "DynamoDB state locking"}, {"title": "State manipulation commands (state rm, import)"}]}
                ]
            },
            {
                "title": "Providers and Provisioners",
                "outcome": "Interact with multiple cloud platforms and execute bootstrap scripts.",
                "timeline": "Week 4",
                "workspace_type": "research",
                "optimal_search_query": "Terraform providers provisioners local-exec",
                "topics": [
                    {"title": "Provider Configurations", "subtopics": [{"title": "AWS/Azure/GCP providers"}, {"title": "Multiple provider blocks and aliases"}, {"title": "Provider versioning"}]},
                    {"title": "Provisioners", "subtopics": [{"title": "local-exec vs remote-exec"}, {"title": "Failure behaviors"}, {"title": "When NOT to use provisioners"}]}
                ]
            },
            {
                "title": "Terraform Modules",
                "outcome": "Organize infrastructure code into reusable, publishable modules.",
                "timeline": "Week 5",
                "workspace_type": "research",
                "optimal_search_query": "Terraform modules creation reusability",
                "topics": [
                    {"title": "Creating Local Modules", "subtopics": [{"title": "Module directory structure"}, {"title": "Input variables and locals"}, {"title": "Output values from modules"}]},
                    {"title": "Using Module Registries", "subtopics": [{"title": "Consuming public modules"}, {"title": "Versioning module dependencies"}, {"title": "Private registries"}]}
                ]
            },
            {
                "title": "Advanced Configuration: Loops and Logic",
                "outcome": "Use meta-arguments to dynamically scale infrastructure.",
                "timeline": "Week 6",
                "workspace_type": "research",
                "optimal_search_query": "Terraform count for_each dynamic blocks",
                "topics": [
                    {"title": "Resource Iteration", "subtopics": [{"title": "The count meta-argument"}, {"title": "for_each for maps and sets"}, {"title": "Handling lists vs sets"}]},
                    {"title": "Dynamic Blocks and Conditionals", "subtopics": [{"title": "Dynamic blocks for nested configuration"}, {"title": "Ternary operators in HCL"}, {"title": "The coalesce function"}]}
                ]
            },
            {
                "title": "Security and Secrets in IaC",
                "outcome": "Secure your infrastructure code and prevent credential leaks.",
                "timeline": "Week 7",
                "workspace_type": "research",
                "optimal_search_query": "Terraform secrets management security best practices",
                "topics": [
                    {"title": "Secrets Management", "subtopics": [{"title": "Avoiding hardcoded secrets"}, {"title": "Integrating HashiCorp Vault"}, {"title": "AWS Secrets Manager integration"}]},
                    {"title": "Static Analysis for IaC", "subtopics": [{"title": "Using tfsec/checkov"}, {"title": "Policy as Code (OPA)"}, {"title": "Least privilege principle in IAM"}]}
                ]
            },
            {
                "title": "CI/CD for Infrastructure",
                "outcome": "Automate the provisioning lifecycle through continuous integration.",
                "timeline": "Week 8",
                "workspace_type": "research",
                "optimal_search_query": "Terraform CI/CD GitHub Actions automation",
                "topics": [
                    {"title": "Infrastructure Pipelines", "subtopics": [{"title": "Automated plan on Pull Requests"}, {"title": "Automated apply on Merge"}, {"title": "Handling PR feedback"}]},
                    {"title": "Terraform Cloud/Enterprise", "subtopics": [{"title": "VCS-driven workflows"}, {"title": "Remote execution environments"}, {"title": "Cost estimation"}]}
                ]
            }
        ]
    },
    1484: {
        "prerequisites": ["Basic understanding of hardware components", "Familiarity with operating systems", "Internet fundamentals"],
        "what_you_will_learn": ["Understand cloud service models (IaaS, PaaS, SaaS)", "Differentiate deployment models", "Grasp virtualization and containerization", "Learn core cloud architecture patterns", "Understand cloud networking and storage"],
        "modules": [
            {
                "title": "Cloud Computing Fundamentals",
                "outcome": "Define cloud computing and its core service models.",
                "timeline": "Week 1",
                "workspace_type": "research",
                "optimal_search_query": "Cloud computing fundamentals IaaS PaaS SaaS",
                "topics": [
                    {"title": "Service Models", "subtopics": [{"title": "IaaS (Infrastructure as a Service)"}, {"title": "PaaS (Platform as a Service)"}, {"title": "SaaS (Software as a Service)"}]},
                    {"title": "Emerging Models", "subtopics": [{"title": "FaaS (Function as a Service)"}, {"title": "CaaS (Container as a Service)"}, {"title": "DBaaS (Database as a Service)"}]}
                ]
            },
            {
                "title": "Cloud Deployment Models",
                "outcome": "Understand the different ways organizations host cloud environments.",
                "timeline": "Week 2",
                "workspace_type": "research",
                "optimal_search_query": "Cloud deployment models Public Private Hybrid",
                "topics": [
                    {"title": "Traditional Models", "subtopics": [{"title": "Public Cloud"}, {"title": "Private Cloud (On-Premises)"}, {"title": "Community Cloud"}]},
                    {"title": "Advanced Architectures", "subtopics": [{"title": "Hybrid Cloud architecture"}, {"title": "Multi-Cloud strategies"}, {"title": "Edge Computing concepts"}]}
                ]
            },
            {
                "title": "Virtualization Technologies",
                "outcome": "Grasp the underlying technology that enables hardware abstraction.",
                "timeline": "Week 3",
                "workspace_type": "research",
                "optimal_search_query": "Cloud virtualization Type 1 Type 2 hypervisors",
                "topics": [
                    {"title": "Hypervisors", "subtopics": [{"title": "Type 1 (Bare-metal) Hypervisors"}, {"title": "Type 2 (Hosted) Hypervisors"}, {"title": "Hardware-assisted virtualization"}]},
                    {"title": "VM Lifecycles", "subtopics": [{"title": "Resource allocation (vCPU, vRAM)"}, {"title": "Snapshots and cloning"}, {"title": "VM isolation and security"}]}
                ]
            },
            {
                "title": "Containerization and Orchestration",
                "outcome": "Differentiate between VMs and containers, and understand orchestration.",
                "timeline": "Week 4",
                "workspace_type": "research",
                "optimal_search_query": "Cloud containers Docker vs VMs Kubernetes",
                "topics": [
                    {"title": "Container Basics", "subtopics": [{"title": "Docker engine architecture"}, {"title": "Images vs Containers"}, {"title": "OS-level virtualization"}]},
                    {"title": "Orchestration", "subtopics": [{"title": "Why we need orchestration"}, {"title": "Kubernetes core concepts"}, {"title": "Container Registries"}]}
                ]
            },
            {
                "title": "Cloud Networking Concepts",
                "outcome": "Design basic virtual networks and routing in the cloud.",
                "timeline": "Week 5",
                "workspace_type": "research",
                "optimal_search_query": "Cloud networking VPC subnets routing NAT",
                "topics": [
                    {"title": "Virtual Networks", "subtopics": [{"title": "VPCs and VNETs"}, {"title": "Public vs Private Subnets"}, {"title": "CIDR notation and IP addressing"}]},
                    {"title": "Traffic Flow", "subtopics": [{"title": "Internet Gateways"}, {"title": "NAT Gateways"}, {"title": "Security Groups and Network ACLs"}]}
                ]
            },
            {
                "title": "Cloud Storage Solutions",
                "outcome": "Select the appropriate storage tier for different data types.",
                "timeline": "Week 6",
                "workspace_type": "research",
                "optimal_search_query": "Cloud storage block object file storage",
                "topics": [
                    {"title": "Storage Types", "subtopics": [{"title": "Block Storage (EBS)"}, {"title": "Object Storage (S3)"}, {"title": "File Storage (EFS)"}]},
                    {"title": "Data Management", "subtopics": [{"title": "Storage lifecycle policies"}, {"title": "Data redundancy options"}, {"title": "Backup and snapshots"}]}
                ]
            },
            {
                "title": "Scalability and High Availability",
                "outcome": "Build fault-tolerant architectures that handle variable load.",
                "timeline": "Week 7",
                "workspace_type": "research",
                "optimal_search_query": "Cloud scalability elasticity high availability architecture",
                "topics": [
                    {"title": "Scaling Strategies", "subtopics": [{"title": "Vertical vs Horizontal Scaling"}, {"title": "Auto-scaling triggers (CPU, Memory)"}, {"title": "Elasticity vs Scalability"}]},
                    {"title": "Fault Tolerance", "subtopics": [{"title": "Regions and Availability Zones"}, {"title": "Load Balancing strategies"}, {"title": "Active-Active vs Active-Passive setups"}]}
                ]
            },
            {
                "title": "Serverless Computing",
                "outcome": "Understand event-driven execution without managing servers.",
                "timeline": "Week 8",
                "workspace_type": "research",
                "optimal_search_query": "Serverless computing AWS Lambda event-driven",
                "topics": [
                    {"title": "FaaS Fundamentals", "subtopics": [{"title": "Stateless execution"}, {"title": "Cold starts vs Warm starts"}, {"title": "Pricing models (Pay per execution)"}]},
                    {"title": "Event-Driven Architecture", "subtopics": [{"title": "Triggers (API Gateway, S3 events)"}, {"title": "Message queues (SQS, SNS)"}, {"title": "Microservices coordination"}]}
                ]
            }
        ]
    },
    1483: {
        "prerequisites": ["Discrete Mathematics", "Basic logic and set theory", "Introductory programming"],
        "what_you_will_learn": ["Understand regular languages and finite automata", "Construct context-free grammars", "Analyze pushdown automata and Turing machines", "Grasp computability and the halting problem"],
        "modules": [
            {
                "title": "Fundamentals of Automata",
                "outcome": "Establish the mathematical foundation for formal languages.",
                "timeline": "Week 1",
                "workspace_type": "research",
                "optimal_search_query": "Automata theory alphabets strings formal languages",
                "topics": [
                    {"title": "Basic Definitions", "subtopics": [{"title": "Alphabets and Symbols"}, {"title": "Strings and string operations"}, {"title": "Languages as sets of strings"}]},
                    {"title": "Operations on Languages", "subtopics": [{"title": "Union, Intersection, and Complement"}, {"title": "Concatenation"}, {"title": "Kleene Star and Kleene Plus"}]}
                ]
            },
            {
                "title": "Deterministic Finite Automata (DFA)",
                "outcome": "Design strict state machines for language recognition.",
                "timeline": "Week 2",
                "workspace_type": "research",
                "optimal_search_query": "Deterministic finite automata DFA transition functions",
                "topics": [
                    {"title": "DFA Mechanics", "subtopics": [{"title": "The 5-tuple definition"}, {"title": "State transition diagrams"}, {"title": "Accepting states and rejected strings"}]},
                    {"title": "Constructing DFAs", "subtopics": [{"title": "Designing for specific patterns"}, {"title": "Trap states"}, {"title": "Product construction for intersections"}]}
                ]
            },
            {
                "title": "Non-Deterministic Finite Automata (NFA)",
                "outcome": "Understand non-determinism and equivalence to DFA.",
                "timeline": "Week 3",
                "workspace_type": "research",
                "optimal_search_query": "NFA vs DFA subset construction epsilon transitions",
                "topics": [
                    {"title": "NFA Concepts", "subtopics": [{"title": "Multiple transitions on same input"}, {"title": "Epsilon (empty) transitions"}, {"title": "NFA acceptance criteria"}]},
                    {"title": "Equivalence to DFA", "subtopics": [{"title": "Subset Construction algorithm"}, {"title": "Converting NFA to DFA"}, {"title": "Minimization of DFAs (Hopcroft's)"}]}
                ]
            },
            {
                "title": "Regular Expressions and Languages",
                "outcome": "Map regular expressions to finite automata computationally.",
                "timeline": "Week 4",
                "workspace_type": "research",
                "optimal_search_query": "Regular expressions regular languages Kleene's theorem",
                "topics": [
                    {"title": "Regex Formalism", "subtopics": [{"title": "Regex operators"}, {"title": "Algebraic laws for regex"}, {"title": "Regex vs programming string matching"}]},
                    {"title": "Kleene's Theorem", "subtopics": [{"title": "Converting Regex to NFA (Thompson's)"}, {"title": "Converting DFA to Regex (State elimination)"}, {"title": "Equivalence of the three models"}]}
                ]
            },
            {
                "title": "Properties of Regular Languages",
                "outcome": "Prove the limits of what finite automata can compute.",
                "timeline": "Week 5",
                "workspace_type": "research",
                "optimal_search_query": "Pumping lemma regular languages closure properties",
                "topics": [
                    {"title": "Closure Properties", "subtopics": [{"title": "Proof of closure under union/intersection"}, {"title": "Closure under reversal"}, {"title": "Homomorphisms"}]},
                    {"title": "The Pumping Lemma", "subtopics": [{"title": "Statement of the Pumping Lemma"}, {"title": "Adversarial games in proofs"}, {"title": "Proving languages are not regular"}]}
                ]
            },
            {
                "title": "Context-Free Grammars (CFG)",
                "outcome": "Define languages that require recursive nesting.",
                "timeline": "Week 6",
                "workspace_type": "research",
                "optimal_search_query": "Context free grammars parse trees Chomsky normal form",
                "topics": [
                    {"title": "Grammar Components", "subtopics": [{"title": "Terminals, Non-terminals, Productions"}, {"title": "Derivations (Leftmost vs Rightmost)"}, {"title": "Parse Trees"}]},
                    {"title": "Ambiguity and Normalization", "subtopics": [{"title": "Ambiguous grammars"}, {"title": "Chomsky Normal Form (CNF)"}, {"title": "Greibach Normal Form overview"}]}
                ]
            },
            {
                "title": "Pushdown Automata (PDA)",
                "outcome": "Augment finite automata with a stack memory.",
                "timeline": "Week 7",
                "workspace_type": "research",
                "optimal_search_query": "Pushdown automata PDA context free languages",
                "topics": [
                    {"title": "PDA Mechanics", "subtopics": [{"title": "Stack operations (Push/Pop)"}, {"title": "Acceptance by final state vs empty stack"}, {"title": "Deterministic vs Non-Deterministic PDA"}]},
                    {"title": "Equivalence to CFG", "subtopics": [{"title": "Converting CFG to PDA"}, {"title": "Pumping Lemma for CFLs"}, {"title": "Closure properties of CFLs"}]}
                ]
            },
            {
                "title": "Turing Machines and Computability",
                "outcome": "Explore the ultimate model of computation.",
                "timeline": "Week 8",
                "workspace_type": "research",
                "optimal_search_query": "Turing machines computability halting problem",
                "topics": [
                    {"title": "The Turing Machine", "subtopics": [{"title": "Infinite tape and Read/Write head"}, {"title": "Variants (Multi-tape, Non-deterministic)"}, {"title": "The Church-Turing Thesis"}]},
                    {"title": "Undecidability", "subtopics": [{"title": "Decidable vs Turing-Recognizable"}, {"title": "The Halting Problem"}, {"title": "Reducibility (Mapping reductions)"}]}
                ]
            }
        ]
    },
    1482: {
        "prerequisites": ["Basic Programming (Python/Java/C++)", "Understanding of arrays and linked lists", "Recursion fundamentals"],
        "what_you_will_learn": ["Implement binary search trees", "Perform tree and graph traversals", "Understand advanced tree balancing", "Implement graph shortest path algorithms"],
        "modules": [
            {
                "title": "Binary Trees and Traversals",
                "outcome": "Understand tree structures and recursive traversal.",
                "timeline": "Week 1",
                "workspace_type": "research",
                "optimal_search_query": "Binary trees traversals inorder preorder postorder",
                "topics": [
                    {"title": "Tree Properties", "subtopics": [{"title": "Nodes, edges, root, and leaves"}, {"title": "Height and depth of trees"}, {"title": "Full vs Complete vs Perfect binary trees"}]},
                    {"title": "Traversal Algorithms", "subtopics": [{"title": "Inorder traversal"}, {"title": "Preorder and Postorder"}, {"title": "Level-order (Breadth-First)"}]}
                ]
            },
            {
                "title": "Binary Search Trees (BST)",
                "outcome": "Utilize trees for efficient search operations.",
                "timeline": "Week 2",
                "workspace_type": "research",
                "optimal_search_query": "Binary search trees BST insertion deletion",
                "topics": [
                    {"title": "BST Mechanics", "subtopics": [{"title": "The BST property"}, {"title": "Searching for an element"}, {"title": "Finding min and max values"}]},
                    {"title": "Modification", "subtopics": [{"title": "Insertion algorithm"}, {"title": "Deletion (3 cases)"}, {"title": "Time complexity analysis (Average vs Worst case)"}]}
                ]
            },
            {
                "title": "Balanced Trees: AVL Trees",
                "outcome": "Ensure O(log n) time complexity by maintaining tree balance.",
                "timeline": "Week 3",
                "workspace_type": "research",
                "optimal_search_query": "AVL trees self balancing binary search tree rotations",
                "topics": [
                    {"title": "The Balance Factor", "subtopics": [{"title": "Why BSTs become skewed"}, {"title": "Calculating balance factors"}, {"title": "Identifying imbalances"}]},
                    {"title": "Tree Rotations", "subtopics": [{"title": "Left Rotation (LL)"}, {"title": "Right Rotation (RR)"}, {"title": "Complex Rotations (LR, RL)"}]}
                ]
            },
            {
                "title": "Advanced Trees",
                "outcome": "Explore trees used in database indexing and operating systems.",
                "timeline": "Week 4",
                "workspace_type": "research",
                "optimal_search_query": "Red Black trees B-Trees Heaps data structures",
                "topics": [
                    {"title": "Red-Black Trees", "subtopics": [{"title": "Color properties and rules"}, {"title": "Insertion and recoloring"}, {"title": "Comparing AVL vs Red-Black"}]},
                    {"title": "Other Tree Types", "subtopics": [{"title": "B-Trees overview (Disk indexing)"}, {"title": "Tries (Prefix trees for text)"}, {"title": "Binary Heaps (Min/Max)"}]}
                ]
            },
            {
                "title": "Graph Fundamentals and Representations",
                "outcome": "Translate physical networks into data structures.",
                "timeline": "Week 5",
                "workspace_type": "research",
                "optimal_search_query": "Graph data structure representations adjacency matrix list",
                "topics": [
                    {"title": "Graph Terminology", "subtopics": [{"title": "Directed vs Undirected"}, {"title": "Weighted vs Unweighted"}, {"title": "Cycles and Connected Components"}]},
                    {"title": "Representations", "subtopics": [{"title": "Adjacency Matrix"}, {"title": "Adjacency List"}, {"title": "Edge List and incidence matrices"}]}
                ]
            },
            {
                "title": "Graph Traversal Algorithms",
                "outcome": "Search through graphs systematically.",
                "timeline": "Week 6",
                "workspace_type": "research",
                "optimal_search_query": "Graph traversal BFS DFS algorithms",
                "topics": [
                    {"title": "Breadth-First Search (BFS)", "subtopics": [{"title": "Queue-based implementation"}, {"title": "Shortest path in unweighted graphs"}, {"title": "Time and space complexity"}]},
                    {"title": "Depth-First Search (DFS)", "subtopics": [{"title": "Recursive and stack-based approaches"}, {"title": "Discovery and finish times"}, {"title": "Cycle detection in directed graphs"}]}
                ]
            },
            {
                "title": "Shortest Path Algorithms",
                "outcome": "Find optimal routes in weighted graphs.",
                "timeline": "Week 7",
                "workspace_type": "research",
                "optimal_search_query": "Dijkstra's algorithm Bellman Ford shortest path",
                "topics": [
                    {"title": "Dijkstra's Algorithm", "subtopics": [{"title": "Greedy approach using Priority Queues"}, {"title": "Algorithm steps and relaxation"}, {"title": "Limitations (Negative weights)"}]},
                    {"title": "Alternative Algorithms", "subtopics": [{"title": "Bellman-Ford algorithm"}, {"title": "Handling negative weight cycles"}, {"title": "Floyd-Warshall (All-pairs shortest path)"}]}
                ]
            },
            {
                "title": "Advanced Graph Algorithms",
                "outcome": "Solve complex networking and scheduling problems.",
                "timeline": "Week 8",
                "workspace_type": "research",
                "optimal_search_query": "Minimum spanning tree Kruskal Prim topological sort",
                "topics": [
                    {"title": "Minimum Spanning Trees", "subtopics": [{"title": "Kruskal's Algorithm (Disjoint Sets)"}, {"title": "Prim's Algorithm"}, {"title": "Applications of MST"}]},
                    {"title": "Directed Acyclic Graphs (DAGs)", "subtopics": [{"title": "Topological Sorting (Kahn's Algorithm)"}, {"title": "Dependency resolution scheduling"}, {"title": "Longest path in a DAG"}]}
                ]
            }
        ]
    },
    1481: {
        "prerequisites": ["Basic networking concepts (TCP/IP)", "Familiarity with web browsers", "Basic programming knowledge"],
        "what_you_will_learn": ["Master HTTP methods and status codes", "Design scalable RESTful APIs", "Understand API authentication and security", "Implement caching and performance tuning"],
        "modules": [
            {
                "title": "The Client-Server Architecture",
                "outcome": "Grasp the foundational architecture of the web.",
                "timeline": "Week 1",
                "workspace_type": "research",
                "optimal_search_query": "Client server model HTTP protocol overview",
                "topics": [
                    {"title": "Web Architecture", "subtopics": [{"title": "Role of the Client (Browser/App)"}, {"title": "Role of the Server"}, {"title": "DNS and IP Addressing basics"}]},
                    {"title": "HTTP Protocol Evolution", "subtopics": [{"title": "HTTP/1.1 vs HTTP/2"}, {"title": "Statelessness of HTTP"}, {"title": "The concept of connections (Keep-Alive)"}]}
                ]
            },
            {
                "title": "HTTP Message Structure",
                "outcome": "Inspect and construct raw HTTP requests and responses.",
                "timeline": "Week 2",
                "workspace_type": "research",
                "optimal_search_query": "HTTP message structure headers request response body",
                "topics": [
                    {"title": "The Request Message", "subtopics": [{"title": "Request Line (Method, URI, Version)"}, {"title": "Standard Request Headers"}, {"title": "Query Parameters vs Path variables"}]},
                    {"title": "The Response Message", "subtopics": [{"title": "Status Line"}, {"title": "Standard Response Headers"}, {"title": "The Body payload"}]}
                ]
            },
            {
                "title": "HTTP Verbs and Semantics",
                "outcome": "Understand the precise meaning of HTTP methods.",
                "timeline": "Week 3",
                "workspace_type": "research",
                "optimal_search_query": "HTTP methods GET POST PUT PATCH DELETE idempotency",
                "topics": [
                    {"title": "Core Methods", "subtopics": [{"title": "GET (Retrieval)"}, {"title": "POST (Creation/Processing)"}, {"title": "DELETE (Removal)"}]},
                    {"title": "Updates and Properties", "subtopics": [{"title": "PUT (Complete replacement)"}, {"title": "PATCH (Partial update)"}, {"title": "Safe and Idempotent methods"}]}
                ]
            },
            {
                "title": "HTTP Status Codes deep Dive",
                "outcome": "Properly communicate success and failure states.",
                "timeline": "Week 4",
                "workspace_type": "research",
                "optimal_search_query": "HTTP status codes explained 2xx 3xx 4xx 5xx",
                "topics": [
                    {"title": "Success and Redirection", "subtopics": [{"title": "2xx family (200, 201, 204)"}, {"title": "3xx family (301, 302, 304)"}, {"title": "Handling redirects in clients"}]},
                    {"title": "Error Families", "subtopics": [{"title": "4xx Client Errors (400, 401, 403, 404)"}, {"title": "5xx Server Errors (500, 502, 503)"}, {"title": "Choosing the exact right error code"}]}
                ]
            },
            {
                "title": "Introduction to REST",
                "outcome": "Understand the Representational State Transfer architectural style.",
                "timeline": "Week 5",
                "workspace_type": "research",
                "optimal_search_query": "REST API principles constraints statelessness",
                "topics": [
                    {"title": "REST Constraints", "subtopics": [{"title": "Client-Server separation"}, {"title": "Statelessness requirement"}, {"title": "Cacheability"}]},
                    {"title": "The Uniform Interface", "subtopics": [{"title": "Resource identification in requests"}, {"title": "Resource manipulation through representations"}, {"title": "HATEOAS (Hypermedia as the Engine of Application State)"}]}
                ]
            },
            {
                "title": "REST API Design Best Practices",
                "outcome": "Design clean, intuitive, and developer-friendly APIs.",
                "timeline": "Week 6",
                "workspace_type": "research",
                "optimal_search_query": "REST API design best practices resource naming versioning",
                "topics": [
                    {"title": "Resource Naming", "subtopics": [{"title": "Using plural nouns"}, {"title": "Nesting resources (e.g., /users/1/posts)"}, {"title": "Filtering, sorting, and pagination"}]},
                    {"title": "Versioning and Evolution", "subtopics": [{"title": "URI versioning (/v1/)"}, {"title": "Header versioning"}, {"title": "Handling breaking changes gracefully"}]}
                ]
            },
            {
                "title": "Data Formats and Content Negotiation",
                "outcome": "Serialize data structures for transfer over HTTP.",
                "timeline": "Week 7",
                "workspace_type": "research",
                "optimal_search_query": "HTTP content negotiation JSON XML Accept headers",
                "topics": [
                    {"title": "Media Types (MIME)", "subtopics": [{"title": "application/json"}, {"title": "application/xml"}, {"title": "multipart/form-data for file uploads"}]},
                    {"title": "Content Negotiation", "subtopics": [{"title": "The Accept header"}, {"title": "The Content-Type header"}, {"title": "Parsing payloads securely"}]}
                ]
            },
            {
                "title": "API Security and Performance",
                "outcome": "Protect your endpoints and optimize latency.",
                "timeline": "Week 8",
                "workspace_type": "research",
                "optimal_search_query": "REST API security authentication CORS caching",
                "topics": [
                    {"title": "Security Fundamentals", "subtopics": [{"title": "Authentication vs Authorization"}, {"title": "API Keys, Bearer Tokens (JWT)"}, {"title": "CORS (Cross-Origin Resource Sharing)"}]},
                    {"title": "Caching Strategies", "subtopics": [{"title": "Cache-Control headers"}, {"title": "ETags and Conditional GETs"}, {"title": "Rate limiting concepts"}]}
                ]
            }
        ]
    }
}

def format_curriculum(course_id, data):
    modules = []
    for idx, m in enumerate(data["modules"]):
        formatted_topics = []
        for t_idx, t in enumerate(m["topics"]):
            formatted_subtopics = []
            for st in t["subtopics"]:
                formatted_subtopics.append({
                    "id": uid(),
                    "title": st["title"],
                    "video_id": "",
                    "video_title": "",
                    "video_channel": "",
                    "resources": []
                })
                
            formatted_topics.append({
                "id": f"topic_{idx+1}_{t_idx+1}",
                "uuid": uid(),
                "title": t["title"],
                "youtube_search_query": t.get("youtube_search_query", f"{t['title']} tutorial"),
                "subtopics": formatted_subtopics
            })
            
        modules.append({
            "id": uid(),
            "title": m["title"],
            "outcome": m["outcome"],
            "timeline": m["timeline"],
            "workspace_type": m.get("workspace_type", "research"),
            "optimal_search_query": m.get("optimal_search_query", m["title"]),
            "proof_of_work_instructions": m.get("proof_of_work_instructions", {
                "what_to_build": f"Practical assignment for {m['title']}.",
                "what_counts_as_evidence": "A markdown file or code script.",
                "eval_criteria": ["Does it meet the core outcome?", "Is the implementation correct?"]
            }),
            "resources": [],
            "topics": formatted_topics
        })
        
    return {
        "prerequisites": data["prerequisites"],
        "what_you_will_learn": data["what_you_will_learn"],
        "modules": modules
    }

def main():
    for course_id, data in CURRICULA.items():
        print(f"Updating course ID: {course_id}")
        roadmap_plan = format_curriculum(course_id, data)
        
        # Update supabase
        res = sb.table("roadmaps").update({
            "roadmap_plan": roadmap_plan
        }).eq("id", course_id).execute()
        
        print(f"Update response for {course_id}: {res.data}")
        
    print("Running enrichments...")
    for course_id in CURRICULA.keys():
        print(f"Enriching {course_id}...")
        subprocess.run([sys.executable, "smart_video_enrich.py", str(course_id)], check=True)
        subprocess.run([sys.executable, "smart_resource_enrich.py", str(course_id)], check=True)
        
    print("All done!")

if __name__ == "__main__":
    main()
