import uuid
import os
import sys
import subprocess
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.abspath("backend")))
load_dotenv("backend/.env")

from backend.app.core.supabase_client import get_supabase_client

data = {
    1470: {
        "prerequisites": ["C Programming basics", "Understanding of binary/hexadecimal systems", "Basic computer architecture knowledge"],
        "what_you_will_learn": ["x86 and ARM assembly syntax", "Register management and stack frames", "Control flow and system calls in assembly", "Performance optimization and CPU pipelines"],
        "modules": [
            {
                "title": "Introduction to CPU Architecture & Data Representation",
                "topics": [
                    {"title": "Binary, Hex, and Two's Complement", "youtube_search_query": "binary hex twos complement assembly representation", "optimal_search_query": "binary hexadecimal two's complement computer architecture"},
                    {"title": "x86 vs ARM: CISC vs RISC Overview", "youtube_search_query": "CISC vs RISC x86 ARM architecture overview", "optimal_search_query": "x86 vs ARM CISC RISC processor architecture"},
                    {"title": "Little Endian vs Big Endian", "youtube_search_query": "little endian vs big endian architecture byte order", "optimal_search_query": "endianness little endian big endian memory architecture"}
                ]
            },
            {
                "title": "x86 Assembly Foundations",
                "topics": [
                    {"title": "x86 Registers and Flags", "youtube_search_query": "x86 registers eflags assembly", "optimal_search_query": "x86 architecture registers general purpose eflags"},
                    {"title": "Memory Addressing Modes in x86", "youtube_search_query": "x86 memory addressing modes assembly", "optimal_search_query": "x86 architecture memory addressing modes displacement base index scale"},
                    {"title": "Basic Arithmetic and Logic Instructions (x86)", "youtube_search_query": "x86 assembly arithmetic logic instructions", "optimal_search_query": "x86 assembly instructions add sub mul div and or xor"}
                ]
            },
            {
                "title": "Control Flow and Functions in x86",
                "topics": [
                    {"title": "Conditional Jumps and the CMP Instruction (x86)", "youtube_search_query": "x86 assembly cmp instruction conditional jumps", "optimal_search_query": "x86 assembly conditional jumps cmp test eflags"},
                    {"title": "The Stack Frame and Calling Conventions (cdecl)", "youtube_search_query": "x86 stack frame cdecl calling convention", "optimal_search_query": "x86 calling convention cdecl stack frame prologue epilogue"},
                    {"title": "System Calls in x86 Linux", "youtube_search_query": "x86 assembly linux system calls int 0x80", "optimal_search_query": "linux x86 assembly system calls syscall int 0x80"}
                ]
            },
            {
                "title": "ARM Assembly Foundations",
                "topics": [
                    {"title": "ARM Registers and Load/Store Architecture", "youtube_search_query": "ARM registers load store architecture assembly", "optimal_search_query": "ARM architecture registers load store instructions ldr str"},
                    {"title": "Basic Data Processing Instructions (ARM)", "youtube_search_query": "ARM assembly data processing instructions", "optimal_search_query": "ARM assembly arithmetic logic instructions data processing"},
                    {"title": "The Barrel Shifter (ARM)", "youtube_search_query": "ARM assembly barrel shifter", "optimal_search_query": "ARM architecture barrel shifter inline shift operations"}
                ]
            },
            {
                "title": "Control Flow and Functions in ARM",
                "topics": [
                    {"title": "Conditional Execution and Branching (ARM)", "youtube_search_query": "ARM conditional execution branching assembly", "optimal_search_query": "ARM assembly conditional execution condition codes branching"},
                    {"title": "Function Calls and the Link Register (ARM)", "youtube_search_query": "ARM assembly function calls link register lr", "optimal_search_query": "ARM calling convention link register bl bx"},
                    {"title": "System Calls in ARM Linux", "youtube_search_query": "ARM assembly linux system calls swi svc", "optimal_search_query": "linux ARM assembly system calls svc swi"}
                ]
            },
            {
                "title": "Advanced Assembly Topics",
                "topics": [
                    {"title": "SIMD Instructions (SSE/AVX for x86, NEON for ARM)", "youtube_search_query": "assembly SIMD instructions SSE AVX NEON", "optimal_search_query": "assembly SIMD vectorization SSE AVX ARM NEON"},
                    {"title": "Reverse Engineering and Debugging with GDB", "youtube_search_query": "reverse engineering assembly gdb debugging", "optimal_search_query": "reverse engineering assembly debugging gdb disassembly"},
                    {"title": "Inline Assembly in C", "youtube_search_query": "inline assembly in c gcc", "optimal_search_query": "gcc inline assembly extended asm syntax c programming"}
                ]
            }
        ]
    },
    1469: {
        "prerequisites": ["Docker and container basics", "Linux command line proficiency", "Basic networking concepts", "YAML syntax"],
        "what_you_will_learn": ["Kubernetes architecture and core components", "Deploying and scaling applications with Deployments", "Managing services and ingress for external access", "Storage, Security, and Helm package management"],
        "modules": [
            {
                "title": "Kubernetes Architecture and Core Concepts",
                "topics": [
                    {"title": "The Evolution from Containers to Kubernetes", "youtube_search_query": "why kubernetes container orchestration evolution", "optimal_search_query": "container orchestration history why kubernetes docker swarm"},
                    {"title": "Control Plane vs Worker Nodes (kube-apiserver, kubelet)", "youtube_search_query": "kubernetes control plane worker nodes architecture", "optimal_search_query": "kubernetes architecture components control plane kubelet kube-proxy etcd"},
                    {"title": "Understanding Pods and Namespaces", "youtube_search_query": "kubernetes pods namespaces basics", "optimal_search_query": "kubernetes pod lifecycle namespaces isolation"}
                ]
            },
            {
                "title": "Workload Management",
                "topics": [
                    {"title": "ReplicaSets and Deployments", "youtube_search_query": "kubernetes replicasets deployments rolling updates", "optimal_search_query": "kubernetes deployments replicasets scaling rollout strategies"},
                    {"title": "DaemonSets and StatefulSets", "youtube_search_query": "kubernetes daemonsets statefulsets explained", "optimal_search_query": "kubernetes daemonsets statefulsets headless services"},
                    {"title": "Jobs and CronJobs", "youtube_search_query": "kubernetes jobs cronjobs batch processing", "optimal_search_query": "kubernetes batch jobs cronjobs scheduled tasks"}
                ]
            },
            {
                "title": "Configuration and Secrets",
                "topics": [
                    {"title": "ConfigMaps and Environment Variables", "youtube_search_query": "kubernetes configmaps environment variables", "optimal_search_query": "kubernetes configmaps env vars volume mounts"},
                    {"title": "Secrets Management in Kubernetes", "youtube_search_query": "kubernetes secrets management base64", "optimal_search_query": "kubernetes secrets management encryption rbac"},
                    {"title": "Resource Quotas and Limits", "youtube_search_query": "kubernetes resource quotas limits requests", "optimal_search_query": "kubernetes cpu memory requests limits resource quotas"}
                ]
            },
            {
                "title": "Networking in Kubernetes",
                "topics": [
                    {"title": "Kubernetes Services (ClusterIP, NodePort, LoadBalancer)", "youtube_search_query": "kubernetes services clusterip nodeport loadbalancer", "optimal_search_query": "kubernetes services networking clusterip nodeport external load balancer"},
                    {"title": "Ingress Controllers and Resources", "youtube_search_query": "kubernetes ingress controllers routing", "optimal_search_query": "kubernetes ingress controllers nginx ingress http routing"},
                    {"title": "Network Policies and CNI Plugins", "youtube_search_query": "kubernetes network policies cni calico flannel", "optimal_search_query": "kubernetes network policies security cni calico"}
                ]
            },
            {
                "title": "Storage Solutions",
                "topics": [
                    {"title": "Volumes and Persistent Volumes (PV/PVC)", "youtube_search_query": "kubernetes persistent volumes pvc storage", "optimal_search_query": "kubernetes persistent volumes claims storage classes"},
                    {"title": "Storage Classes and Dynamic Provisioning", "youtube_search_query": "kubernetes storage classes dynamic provisioning", "optimal_search_query": "kubernetes storage classes dynamic volume provisioning"}
                ]
            },
            {
                "title": "Observability and Package Management",
                "topics": [
                    {"title": "Liveness, Readiness, and Startup Probes", "youtube_search_query": "kubernetes liveness readiness startup probes", "optimal_search_query": "kubernetes health checks liveness readiness probes"},
                    {"title": "Monitoring and Logging (Prometheus & Grafana basics)", "youtube_search_query": "kubernetes monitoring prometheus grafana logging", "optimal_search_query": "kubernetes observability monitoring prometheus grafana fluentd"},
                    {"title": "Helm Package Manager Introduction", "youtube_search_query": "helm kubernetes package manager charts", "optimal_search_query": "helm kubernetes charts templating package management"}
                ]
            }
        ]
    },
    1468: {
        "prerequisites": ["Linux command line basics", "Understanding of virtualization concepts", "Basic networking concepts"],
        "what_you_will_learn": ["Containerization vs Virtualization", "Building custom Docker images using Dockerfile", "Managing multi-container applications with Docker Compose", "Docker security and orchestration basics"],
        "modules": [
            {
                "title": "Introduction to Containers and Docker",
                "topics": [
                    {"title": "Containers vs Virtual Machines", "youtube_search_query": "docker containers vs virtual machines vm", "optimal_search_query": "containers vs virtual machines architecture hypervisor"},
                    {"title": "Docker Engine Architecture (Daemon, REST API, Client)", "youtube_search_query": "docker engine architecture daemon cli basics", "optimal_search_query": "docker engine architecture cli daemon rest api containerd"},
                    {"title": "Basic Docker CLI Commands (run, ps, rm, exec)", "youtube_search_query": "docker cli basic commands run ps exec rm", "optimal_search_query": "docker cli commands container lifecycle run exec ps rm"}
                ]
            },
            {
                "title": "Building and Managing Images",
                "topics": [
                    {"title": "Understanding Docker Images and Registries (Docker Hub)", "youtube_search_query": "docker images registries docker hub pull push", "optimal_search_query": "docker images registries docker hub tags layers"},
                    {"title": "Writing Effective Dockerfiles (FROM, RUN, COPY, CMD)", "youtube_search_query": "writing effective dockerfiles instructions layers", "optimal_search_query": "dockerfile instructions from run copy add cmd entrypoint"},
                    {"title": "Docker Image Layers and Build Caching", "youtube_search_query": "docker image layers caching optimization", "optimal_search_query": "docker image layers caching build optimization"},
                    {"title": "Multi-stage Builds for Smaller Images", "youtube_search_query": "docker multi stage builds smaller images", "optimal_search_query": "docker multi-stage builds optimization image size"}
                ]
            },
            {
                "title": "Data Persistence in Docker",
                "topics": [
                    {"title": "The Container Writable Layer vs Volumes", "youtube_search_query": "docker writable layer vs volumes storage", "optimal_search_query": "docker storage architecture writable layer overlayfs"},
                    {"title": "Docker Volumes (Named and Anonymous)", "youtube_search_query": "docker named volumes anonymous persistent storage", "optimal_search_query": "docker named volumes persistent storage management"},
                    {"title": "Bind Mounts and tmpfs Mounts", "youtube_search_query": "docker bind mounts tmpfs volumes differences", "optimal_search_query": "docker bind mounts host filesystem mapping tmpfs"}
                ]
            },
            {
                "title": "Docker Networking",
                "topics": [
                    {"title": "The Default Bridge Network and Port Mapping", "youtube_search_query": "docker bridge network port mapping publish", "optimal_search_query": "docker default bridge network port mapping isolation"},
                    {"title": "User-defined Bridge Networks and DNS Resolution", "youtube_search_query": "docker user defined bridge networks dns", "optimal_search_query": "docker custom bridge networks internal dns resolution"},
                    {"title": "Host, None, and Macvlan Network Drivers", "youtube_search_query": "docker network drivers host none macvlan", "optimal_search_query": "docker network drivers host macvlan advanced networking"}
                ]
            },
            {
                "title": "Multi-Container Orchestration with Docker Compose",
                "topics": [
                    {"title": "Introduction to Docker Compose and YAML Syntax", "youtube_search_query": "docker compose introduction yaml syntax", "optimal_search_query": "docker compose yaml structure version services networks volumes"},
                    {"title": "Defining Services, Networks, and Volumes in Compose", "youtube_search_query": "docker compose defining services networks volumes", "optimal_search_query": "docker compose configuration services depends_on environment variables"},
                    {"title": "Managing Environments with Profiles and .env Files", "youtube_search_query": "docker compose profiles env files environment variables", "optimal_search_query": "docker compose environment variables .env files profiles"}
                ]
            },
            {
                "title": "Security and Best Practices",
                "topics": [
                    {"title": "Running Containers as Non-Root Users", "youtube_search_query": "docker non root user security best practices", "optimal_search_query": "docker security non-root user directive privileges"},
                    {"title": "Resource Limits (CPU/Memory) and Capabilities", "youtube_search_query": "docker resource limits cpu memory capabilities security", "optimal_search_query": "docker resource constraints memory cpu limits linux capabilities"}
                ]
            }
        ]
    },
    1467: {
        "prerequisites": ["Basic discrete mathematics", "Understanding of algorithms and complexity", "Programming experience in any language"],
        "what_you_will_learn": ["Symmetric vs Asymmetric Encryption", "Hash functions and digital signatures", "Public Key Infrastructure (PKI)", "Modern cryptographic protocols like TLS/SSL", "Post-quantum cryptography overview"],
        "modules": [
            {
                "title": "Foundations of Cryptography",
                "topics": [
                    {"title": "History: Classical Ciphers and Kerckhoffs's Principle", "youtube_search_query": "classical ciphers kerckhoffs principle cryptography", "optimal_search_query": "classical ciphers caesar vigenere kerckhoffs principle"},
                    {"title": "Information Theory and Perfect Secrecy (One-Time Pad)", "youtube_search_query": "cryptography one time pad perfect secrecy shannon", "optimal_search_query": "shannon information theory perfect secrecy one-time pad"},
                    {"title": "Security Models: computationally secure vs unconditionally secure", "youtube_search_query": "computationally secure vs unconditionally secure cryptography", "optimal_search_query": "cryptographic security models computational vs unconditional security"}
                ]
            },
            {
                "title": "Cryptographic Hash Functions and MACs",
                "topics": [
                    {"title": "Properties of Cryptographic Hash Functions", "youtube_search_query": "cryptographic hash functions properties collision resistance", "optimal_search_query": "cryptographic hash functions pre-image collision resistance avalanche effect"},
                    {"title": "SHA-256 and the Merkle-Damgård Construction", "youtube_search_query": "sha256 algorithm merkle damgard construction", "optimal_search_query": "sha-256 algorithm internals merkle-damgard construction"},
                    {"title": "Message Authentication Codes (HMAC)", "youtube_search_query": "message authentication codes hmac cryptography", "optimal_search_query": "hmac message authentication code integrity authentication"}
                ]
            },
            {
                "title": "Symmetric Encryption",
                "topics": [
                    {"title": "Block Ciphers vs Stream Ciphers", "youtube_search_query": "block ciphers vs stream ciphers cryptography", "optimal_search_query": "block ciphers stream ciphers differences rc4 chacha20"},
                    {"title": "Data Encryption Standard (DES) and its Vulnerabilities", "youtube_search_query": "data encryption standard des cryptography history", "optimal_search_query": "des data encryption standard feistel network vulnerabilities 3des"},
                    {"title": "Advanced Encryption Standard (AES) Internals", "youtube_search_query": "advanced encryption standard aes internals cryptography", "optimal_search_query": "aes advanced encryption standard rijndael substitution permutation network"},
                    {"title": "Block Cipher Modes of Operation (ECB, CBC, GCM)", "youtube_search_query": "block cipher modes of operation ecb cbc gcm", "optimal_search_query": "block cipher modes ecb cbc ctr authenticated encryption gcm"}
                ]
            },
            {
                "title": "Number Theory Fundamentals",
                "topics": [
                    {"title": "Modular Arithmetic and Primes", "youtube_search_query": "modular arithmetic prime numbers cryptography", "optimal_search_query": "modular arithmetic prime numbers greatest common divisor euclidean algorithm"},
                    {"title": "Fermat's Little Theorem and Euler's Totient Function", "youtube_search_query": "fermats little theorem eulers totient function cryptography", "optimal_search_query": "fermat's little theorem euler's totient function phi number theory"},
                    {"title": "Discrete Logarithm Problem", "youtube_search_query": "discrete logarithm problem cryptography math", "optimal_search_query": "discrete logarithm problem primitive roots modulo arithmetic"}
                ]
            },
            {
                "title": "Asymmetric (Public-Key) Encryption",
                "topics": [
                    {"title": "Diffie-Hellman Key Exchange", "youtube_search_query": "diffie hellman key exchange cryptography", "optimal_search_query": "diffie-hellman key exchange algorithm discrete logarithm"},
                    {"title": "RSA Algorithm: Key Generation, Encryption, Decryption", "youtube_search_query": "rsa algorithm encryption decryption cryptography", "optimal_search_query": "rsa algorithm public key cryptography prime factorization mathematics"},
                    {"title": "Elliptic Curve Cryptography (ECC) Basics", "youtube_search_query": "elliptic curve cryptography ecc basics", "optimal_search_query": "elliptic curve cryptography ecc discrete logarithm over elliptic curves"}
                ]
            },
            {
                "title": "Digital Signatures and Public Key Infrastructure (PKI)",
                "topics": [
                    {"title": "Digital Signatures (RSA and ECDSA)", "youtube_search_query": "digital signatures rsa ecdsa cryptography", "optimal_search_query": "digital signatures non-repudiation rsa dsa ecdsa algorithms"},
                    {"title": "X.509 Certificates and Certificate Authorities (CAs)", "youtube_search_query": "x509 certificates certificate authorities pki", "optimal_search_query": "x.509 certificates certificate authorities chain of trust pki"},
                    {"title": "Revocation (CRL and OCSP)", "youtube_search_query": "certificate revocation crl ocsp pki", "optimal_search_query": "pki certificate revocation lists crl ocsp status protocol"}
                ]
            },
            {
                "title": "Applied Cryptography and Modern Protocols",
                "topics": [
                    {"title": "TLS/SSL Handshake and Protocol Architecture", "youtube_search_query": "tls ssl handshake protocol cryptography", "optimal_search_query": "tls 1.3 ssl handshake protocol architecture perfect forward secrecy"},
                    {"title": "Zero-Knowledge Proofs (ZKPs)", "youtube_search_query": "zero knowledge proofs zk-snarks cryptography", "optimal_search_query": "zero-knowledge proofs zkp zk-snarks cryptography concept"},
                    {"title": "Introduction to Post-Quantum Cryptography", "youtube_search_query": "post quantum cryptography shors algorithm impact", "optimal_search_query": "post-quantum cryptography shor's algorithm quantum resistance lattice-based"}
                ]
            }
        ]
    },
    1466: {
        "prerequisites": ["Basic understanding of how computers work", "Familiarity with logic and problem solving"],
        "what_you_will_learn": ["C syntax, data types, and control structures", "Memory management using pointers and malloc", "Working with arrays, strings, and structures", "File I/O and preprocessor directives", "Data structures in C"],
        "modules": [
            {
                "title": "C Language Basics and Compilation",
                "topics": [
                    {"title": "The C Compilation Process (Preprocessor, Compiler, Assembler, Linker)", "youtube_search_query": "c programming compilation process preprocessor compiler linker", "optimal_search_query": "c compilation process preprocessor compiler assembler linker gcc"},
                    {"title": "Structure of a C Program and Hello World", "youtube_search_query": "structure of a c program hello world main function", "optimal_search_query": "c programming basic structure main function include headers"},
                    {"title": "Variables, Data Types, and Sizeof Operator", "youtube_search_query": "c data types variables sizeof operator", "optimal_search_query": "c programming primitive data types variables sizeof memory representation"}
                ]
            },
            {
                "title": "Operators and Console I/O",
                "topics": [
                    {"title": "Arithmetic, Relational, and Logical Operators", "youtube_search_query": "c programming arithmetic relational logical operators", "optimal_search_query": "c programming operators arithmetic relational logical bitwise precedence"},
                    {"title": "Bitwise Operators and Bit Manipulation", "youtube_search_query": "c programming bitwise operators bit manipulation", "optimal_search_query": "c programming bitwise operators and or xor shift masking"},
                    {"title": "Formatted I/O with printf and scanf", "youtube_search_query": "c programming printf scanf format specifiers", "optimal_search_query": "c programming console input output printf scanf format specifiers"}
                ]
            },
            {
                "title": "Control Flow",
                "topics": [
                    {"title": "Conditional Statements (if, else, switch)", "youtube_search_query": "c programming if else switch case statements", "optimal_search_query": "c programming control flow if else switch statements"},
                    {"title": "Loops (for, while, do-while)", "youtube_search_query": "c programming loops for while do while", "optimal_search_query": "c programming iteration loops for while do-while break continue"}
                ]
            },
            {
                "title": "Functions and Program Structure",
                "topics": [
                    {"title": "Function Declaration, Definition, and Calling", "youtube_search_query": "c programming functions declaration definition", "optimal_search_query": "c programming functions parameters return values prototypes"},
                    {"title": "Variable Scope, Storage Classes (auto, static, extern)", "youtube_search_query": "c programming variable scope storage classes static extern", "optimal_search_query": "c programming variable scope storage classes static extern register"},
                    {"title": "Recursion in C", "youtube_search_query": "c programming recursion recursive functions", "optimal_search_query": "c programming recursion call stack recursive functions"}
                ]
            },
            {
                "title": "Arrays and Strings",
                "topics": [
                    {"title": "1D and 2D Arrays", "youtube_search_query": "c programming arrays 1d 2d initialization", "optimal_search_query": "c programming arrays multi-dimensional arrays memory layout"},
                    {"title": "Strings as Character Arrays and string.h library", "youtube_search_query": "c programming strings character arrays string.h", "optimal_search_query": "c programming strings null termination string.h strcpy strlen"}
                ]
            },
            {
                "title": "Pointers and Memory",
                "topics": [
                    {"title": "Introduction to Pointers (Address of & and Dereference *)", "youtube_search_query": "c programming pointers address dereference operator", "optimal_search_query": "c programming pointers basics address of operator dereferencing"},
                    {"title": "Pointer Arithmetic and Arrays via Pointers", "youtube_search_query": "c programming pointer arithmetic arrays decay", "optimal_search_query": "c programming pointer arithmetic array to pointer decay"},
                    {"title": "Pointers to Pointers and Function Pointers", "youtube_search_query": "c programming double pointers function pointers", "optimal_search_query": "c programming multiple indirection pointers to pointers function pointers"}
                ]
            },
            {
                "title": "Dynamic Memory Allocation",
                "topics": [
                    {"title": "The Heap vs The Stack", "youtube_search_query": "heap vs stack memory c programming", "optimal_search_query": "c programming memory layout heap vs stack allocation"},
                    {"title": "Using malloc, calloc, realloc, and free", "youtube_search_query": "c programming malloc calloc realloc free", "optimal_search_query": "c programming dynamic memory allocation malloc calloc realloc free"},
                    {"title": "Memory Leaks and Dangling Pointers", "youtube_search_query": "c programming memory leaks dangling pointers valgrind", "optimal_search_query": "c programming memory management issues memory leaks dangling pointers"}
                ]
            },
            {
                "title": "Advanced Data Types and I/O",
                "topics": [
                    {"title": "Structures (struct) and Unions", "youtube_search_query": "c programming struct union structures", "optimal_search_query": "c programming structures struct unions memory alignment padding"},
                    {"title": "Typedef and Enumerations (enum)", "youtube_search_query": "c programming typedef enum enumerations", "optimal_search_query": "c programming typedef aliasing enum enumerations"},
                    {"title": "File I/O (fopen, fread, fwrite, fclose)", "youtube_search_query": "c programming file io reading writing files", "optimal_search_query": "c programming file handling fopen fread fwrite fclose streams"}
                ]
            }
        ]
    }
}

sb = get_supabase_client()

for course_id, curriculum in data.items():
    print(f"Updating roadmap {course_id}...")
    for module in curriculum["modules"]:
        for topic in module["topics"]:
            topic["id"] = str(uuid.uuid4())
            
    sb.table("roadmaps").update({"roadmap_plan": curriculum}).eq("id", course_id).execute()
    
    print(f"Running video enrich for {course_id}...")
    subprocess.run([sys.executable, "backend/smart_video_enrich.py", str(course_id)], check=True)
    
    print(f"Running resource enrich for {course_id}...")
    subprocess.run([sys.executable, "backend/smart_resource_enrich.py", str(course_id)], check=True)
    
print("All courses updated and enriched successfully!")
