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
    # 1. Implementing B-Trees and LSM Trees from Scratch
    {
        "title": "Implementing B-Trees and LSM Trees from Scratch",
        "description": "The two fundamental storage engine designs — understanding them demystifies every database.",
        "subject": "Database & Storage Engineers",
        "modules_data": [
            {
                "title": "B-Tree Fundamentals & Page Structure",
                "topics": [
                    {"title": "B-Tree Invariants & Search", "youtube_search_query": "B-Tree data structure insertion search algorithm", "subtopics": ["Node capacity and order", "Binary search within pages", "Tree height bounds"]},
                    {"title": "Page Serialization & Binary Layout", "youtube_search_query": "Database page layout binary serialization B-Tree", "subtopics": ["Fixed-size page headers", "Slot array pointer offsets", "Key-value pair alignment"]},
                    {"title": "Node Splitting & Balancing", "youtube_search_query": "B-Tree node split root expansion logic", "subtopics": ["Median key promotion", "Child pointer redistribution", "Root node splitting"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An in-memory B-Tree node class with page binary serialization and key lookup methods.",
                    "what_counts_as_evidence": "Python source code showing page byte encoding, slot array positioning, and valid key search returns.",
                    "eval_criteria": ["Correctly handles binary encoding of fixed-size slots", "Maintains B-Tree order properties during lookup"]
                },
                "resources": [
                    {"title": "B-Tree Visualization", "url": "https://www.cs.usfca.edu/~galles/visualization/BTree.html"},
                    {"title": "SQLite B-Tree Design", "url": "https://www.sqlite.org/btree.html"}
                ]
            },
            {
                "title": "In-Memory B-Tree Mutation & Deletion",
                "topics": [
                    {"title": "Key Insertion & Split Propagation", "youtube_search_query": "B-Tree key insertion leaf split propagation", "subtopics": ["Leaf page insertion", "Cascading parent splits", "Pre-emptive splitting"]},
                    {"title": "Key Deletion & Node Merging", "youtube_search_query": "B-Tree key deletion rebalancing borrow merge", "subtopics": ["Underflow detection", "Key borrowing from siblings", "Node merging logic"]},
                    {"title": "Concurrency & Page Latching", "youtube_search_query": "B-Tree page latching latch crabbing concurrency", "subtopics": ["Read and write latches", "Latch crabbing protocol", "Lock contention reduction"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A full B-Tree mutation pipeline supporting key insertion, leaf splitting, key deletion, and node merging.",
                    "what_counts_as_evidence": "Test suite verifying B-Tree state after inserting 10,000 random keys and deleting 5,000 keys.",
                    "eval_criteria": ["Tree invariants pass assertions after every deletion", "Node merging prevents underflow"]
                },
                "resources": [
                    {"title": "Go B-Tree Package", "url": "https://github.com/google/btree"},
                    {"title": "B-Tree Algorithms Reference", "url": "https://en.wikipedia.org/wiki/B-tree"}
                ]
            },
            {
                "title": "LSM Tree Architecture: MemTable & Write-Ahead Log",
                "topics": [
                    {"title": "Write-Ahead Log (WAL) Engine", "youtube_search_query": "Write ahead log LSM tree crash recovery implementation", "subtopics": ["Sequential log append", "CRC checksum verification", "Crash recovery replay"]},
                    {"title": "MemTable with Concurrent SkipList", "youtube_search_query": "MemTable skip list data structure LSM tree", "subtopics": ["In-memory write path", "Concurrent skip list design", "Memory threshold flushing"]},
                    {"title": "Immutable MemTable & Flush Worker", "youtube_search_query": "LSM tree immutable MemTable background flush", "subtopics": ["MemTable swapping", "Background flushing thread", "Disk I/O synchronization"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A WAL writer and MemTable engine that appends mutations to disk before updating an in-memory SkipList.",
                    "what_counts_as_evidence": "Python script demonstrating data recovery from WAL after an intentional process kill.",
                    "eval_criteria": ["WAL format matches log recovery parser requirements", "MemTable flush creates valid disk files"]
                },
                "resources": [
                    {"title": "RocksDB Architecture Guide", "url": "https://github.com/facebook/rocksdb/wiki/RocksDB-Basics"},
                    {"title": "LSM-Tree Paper by O'Neil", "url": "https://www.cs.umb.edu/~poneil/lsmtree.pdf"}
                ]
            },
            {
                "title": "SSTables, Compaction Strategies & Bloom Filters",
                "topics": [
                    {"title": "SSTable File Layout & Block Index", "youtube_search_query": "SSTable file format index block data block LSM tree", "subtopics": ["Block-based table format", "Footer index parsing", "Key range metadata"]},
                    {"title": "Bloom Filter Fast Lookups", "youtube_search_query": "Bloom filter implementation LSM tree point lookup", "subtopics": ["Hash function selection", "Bit array sizing", "False positive tuning"]},
                    {"title": "Size-Tiered vs Levelled Compaction", "youtube_search_query": "LSM tree compaction size tiered levelled compaction", "subtopics": ["Read amplification vs write amplification", "Multi-way merge sorting", "Tombstone garbage collection"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An SSTable reader/writer with integrated Bloom filter and a Levelled Compaction worker.",
                    "what_counts_as_evidence": "Compaction script demonstrating reduction of duplicate keys and obsolete tombstones across 4 SSTable files.",
                    "eval_criteria": ["Bloom filter eliminates unnecessary disk reads", "Compaction correctly merges sorted runs"]
                },
                "resources": [
                    {"title": "LevelDB SSTable Format", "url": "https://github.com/google/leveldb/blob/main/doc/table_format.md"},
                    {"title": "Bloom Filter Reference", "url": "https://en.wikipedia.org/wiki/Bloom_filter"}
                ]
            }
        ]
    },

    # 2. Graph Neural Networks for Drug Discovery
    {
        "title": "Graph Neural Networks for Drug Discovery",
        "description": "GNNs on molecular graphs are how modern pharma screens billions of compounds.",
        "subject": "Bioinformatics & ML Researchers",
        "modules_data": [
            {
                "title": "Molecular Graph Representations & RDKit",
                "topics": [
                    {"title": "SMILES Parsing & Atom Features", "youtube_search_query": "RDKit SMILES molecular graph parsing atom feature extraction", "subtopics": ["SMILES string decoding", "Atom feature vectorization", "Bond type edge attributes"]},
                    {"title": "Adjacency Matrix & Graph Construction", "youtube_search_query": "Molecular graph adjacency matrix PyTorch Geometric", "subtopics": ["Undirected molecular graphs", "Sparse COO format", "Graph connectivity validation"]},
                    {"title": "Molecular Featurization Pipelines", "youtube_search_query": "RDKit graph featurizer molecular descriptor calculation", "subtopics": ["Degree and hybridization state", "Aromaticity flags", "Formal charge encoding"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An RDKit parser that converts SMILES strings into PyTorch Geometric Data objects.",
                    "what_counts_as_evidence": "Python script taking a CSV of 500 SMILES strings and outputting formatted tensor graph batches.",
                    "eval_criteria": ["Node features capture atomic number and hybridization", "Edge index correctly forms undirected bond graph"]
                },
                "resources": [
                    {"title": "RDKit Official Documentation", "url": "https://www.rdkit.org/docs/index.html"},
                    {"title": "DeepChem Molecular Machine Learning", "url": "https://deepchem.io/"}
                ]
            },
            {
                "title": "Message Passing Neural Networks (MPNN)",
                "topics": [
                    {"title": "Message Passing Paradigm", "youtube_search_query": "Message passing neural networks MPNN GNN explanation", "subtopics": ["Message calculation function", "Aggregation operators", "Update functions"]},
                    {"title": "Graph Convolutional Networks (GCN)", "youtube_search_query": "Graph Convolutional Network GCN PyTorch implementation", "subtopics": ["Symmetric normalization", "Node degree scaling", "Layer stacking & oversmoothing"]},
                    {"title": "Edge-Conditioned Convolutions", "youtube_search_query": "Edge feature message passing molecular GNN", "subtopics": ["Incorporating bond orders", "Conformational distance edges", "Edge-to-node message projection"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A custom Message Passing Neural Network layer in PyTorch incorporating bond feature edge vectors.",
                    "what_counts_as_evidence": "PyTorch module file containing `message`, `aggregate`, and `update` logic tested on a sample molecule.",
                    "eval_criteria": ["Aggregation correctly handles variable node degrees", "Edge features modify node message vectors"]
                },
                "resources": [
                    {"title": "PyTorch Geometric Documentation", "url": "https://pytorch-geometric.readthedocs.io/en/latest/"},
                    {"title": "Neural Message Passing for Quantum Chemistry", "url": "https://arxiv.org/abs/1704.01212"}
                ]
            },
            {
                "title": "3D Molecular Conformations & Equivariant GNNs",
                "topics": [
                    {"title": "3D Coordinate Generation with RDKit", "youtube_search_query": "RDKit 3D conformer generation ETKDG algorithm", "subtopics": ["Conformer ensemble generation", "Distance geometry bounds", "Energy minimization with MMFF"]},
                    {"title": "SE(3) and E(3) Equivariance", "youtube_search_query": "SE3 E3 equivariant graph neural network 3D molecules", "subtopics": ["Rotation and translation invariance", "Coordinate transformation laws", "Vector message passing"]},
                    {"title": "Equivariant Graph Neural Networks (EGNN)", "youtube_search_query": "EGNN equivariant graph neural network implementation tutorial", "subtopics": ["Position updates", "Relative distance features", "Force prediction heads"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An EGNN layer that updates 3D atomic coordinates while maintaining SE(3) rotation invariance.",
                    "what_counts_as_evidence": "Test script verifying that rotating the input molecule produces identical scalar outputs.",
                    "eval_criteria": ["Output scalar predictions remain invariant under 3D rotation", "Coordinate updates remain equivariant"]
                },
                "resources": [
                    {"title": "TorchMD-Net Framework", "url": "https://github.com/torchmd/torchmd-net"},
                    {"title": "E(n) Equivariant Graph Neural Networks", "url": "https://arxiv.org/abs/2102.09844"}
                ]
            },
            {
                "title": "Virtual Screening Pipeline & Generative Design",
                "topics": [
                    {"title": "Molecular Property Prediction Benchmarks", "youtube_search_query": "MoleculeNet virtual screening ROC-AUC prediction PyTorch", "subtopics": ["ESOL and FreeSolv datasets", "Multi-task classification loss", "Scaffold splitting validation"]},
                    {"title": "Scaffold Split Cross-Validation", "youtube_search_query": "Scaffold splitting RDKit generalization drug discovery", "subtopics": ["Bemis-Murcko scaffold identification", "Train-test structural leakage prevention", "Generalization metrics"]},
                    {"title": "Generative Molecular Design with VAEs", "youtube_search_query": "Molecular VAE SMILES latent space generation drug design", "subtopics": ["Latent space optimization", "Valid SMILES decoder", "Property-guided generation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A virtual screening model evaluated using Bemis-Murcko scaffold splitting on a bioactivity dataset.",
                    "what_counts_as_evidence": "Evaluation report with ROC-AUC scores comparing scaffold split vs random split generalization.",
                    "eval_criteria": ["Scaffold splitter ensures structural independence of validation set", "Model achieves expected baseline ROC-AUC"]
                },
                "resources": [
                    {"title": "MoleculeNet Benchmark Suite", "url": "https://moleculenet.org/"},
                    {"title": "ZINC Database Overview", "url": "https://zinc.docking.org/"}
                ]
            }
        ]
    },

    # 3. WebRTC: Peer-to-Peer Video from Scratch
    {
        "title": "WebRTC: Peer-to-Peer Video from Scratch",
        "description": "Covers STUN/TURN signaling and ICE negotiation — the hard parts everyone skips.",
        "subject": "Real-Time Communication Developers",
        "modules_data": [
            {
                "title": "WebRTC Architecture & SDP Session Negotiation",
                "topics": [
                    {"title": "WebRTC Peer Architecture", "youtube_search_query": "WebRTC architecture peer connection signaling server", "subtopics": ["Peer-to-peer mesh vs SFU", "Media vs signaling plane", "Security and DTLS-SRTP"]},
                    {"title": "Session Description Protocol (SDP)", "youtube_search_query": "Session Description Protocol SDP WebRTC offer answer", "subtopics": ["Codec negotiation fields", "Media direction attributes", "Fingerprints and crypto keys"]},
                    {"title": "Offer / Answer Exchange Protocol", "youtube_search_query": "WebRTC offer answer exchange signaling implementation", "subtopics": ["createOffer and setLocalDescription", "Signaling over WebSocket", "createAnswer and setRemoteDescription"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A WebSocket signaling server and two browser clients that exchange SDP offer/answer messages.",
                    "what_counts_as_evidence": "Console log showing SDP offer creation, signaling relay, and remote description setting.",
                    "eval_criteria": ["Signaling server correctly routes SDP payloads between peers", "Browser peer state advances to have-remote-offer"]
                },
                "resources": [
                    {"title": "MDN WebRTC API Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API"},
                    {"title": "RFC 4566 Session Description Protocol", "url": "https://datatracker.ietf.org/doc/html/rfc4566"}
                ]
            },
            {
                "title": "NAT Traversal: STUN, TURN & ICE Framework",
                "topics": [
                    {"title": "NAT Types & Binding Behaviors", "youtube_search_query": "NAT types symmetric cone STUN TURN explanation", "subtopics": ["Full cone vs symmetric NAT", "Port mapping lifetimes", "UDP binding discovery"]},
                    {"title": "STUN Protocol Deep Dive", "youtube_search_query": "STUN protocol message format public IP discovery", "subtopics": ["STUN request/response format", "XOR-MAPPED-ADDRESS attribute", "Public endpoint resolution"]},
                    {"title": "TURN Protocol & ICE Candidate Gathering", "youtube_search_query": "TURN server relay ICE candidate gathering candidate pair", "subtopics": ["Relayed candidate allocation", "ICE candidate prioritization", "Connectivity check binding requests"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A custom STUN client script that sends binary STUN binding requests to a public STUN server.",
                    "what_counts_as_evidence": "Python or Node.js script parsing binary STUN response headers and printing the mapped public IP and port.",
                    "eval_criteria": ["Correctly formats 20-byte STUN header with magic cookie", "Parses XOR-MAPPED-ADDRESS attribute correctly"]
                },
                "resources": [
                    {"title": "Interactive Connectivity Establishment RFC", "url": "https://datatracker.ietf.org/doc/html/rfc8445"},
                    {"title": "Coturn STUN/TURN Server Repository", "url": "https://github.com/coturn/coturn"}
                ]
            },
            {
                "title": "Media Streams, Codecs & RTCPeerConnection API",
                "topics": [
                    {"title": "getUserMedia & MediaStream Track Control", "youtube_search_query": "getUserMedia MediaStream constraints audio video tracks", "subtopics": ["Video resolution constraints", "Audio track mute and disable", "Device enumeration"]},
                    {"title": "VP8, VP9 & H.264 Video Codec Tuning", "youtube_search_query": "WebRTC video codecs VP8 VP9 H264 profile comparison", "subtopics": ["Codec payload types", "Keyframe requests (PLI/FIR)", "Bandwidth estimation adaptation"]},
                    {"title": "RTCPeerConnection Lifecycle", "youtube_search_query": "RTCPeerConnection iceConnectionState signalingState connectionState", "subtopics": ["Track addition (addTrack)", "Remote stream reception", "State change listeners"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A video preview app that captures webcam feed, attaches tracks to RTCPeerConnection, and renders remote video.",
                    "what_counts_as_evidence": "Working HTML/JS page demonstrating video track negotiation and rendering on connection establishment.",
                    "eval_criteria": ["Handles track addition before offer generation", "Displays active connection status indicators"]
                },
                "resources": [
                    {"title": "MDN RTCPeerConnection API", "url": "https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection"},
                    {"title": "WebRTC Codecs Specification", "url": "https://www.w3.org/TR/webrtc-codecs/"}
                ]
            },
            {
                "title": "Data Channels & Peer-to-Peer Application Build",
                "topics": [
                    {"title": "RTCDataChannel & SCTP Protocol", "youtube_search_query": "RTCDataChannel SCTP reliable unreliable data transfer", "subtopics": ["Ordered vs unordered delivery", "Max retransmissions tuning", "Binary data chunking"]},
                    {"title": "P2P File Transfer Protocol", "youtube_search_query": "WebRTC data channel file transfer chunking arraybuffer", "subtopics": ["File slicing into ArrayBuffers", "Flow control backpressure", "Integrity checksum verification"]},
                    {"title": "Mesh Video Room Architecture", "youtube_search_query": "WebRTC mesh architecture multi-party video call", "subtopics": ["N-way peer connections", "Dynamic peer join/leave signaling", "DOM video grid management"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A peer-to-peer file transfer feature built over RTCDataChannel supporting chunked file delivery.",
                    "what_counts_as_evidence": "JS implementation showing file read into ArrayBuffers, chunk sending, and SHA-256 hash match on receiver.",
                    "eval_criteria": ["Implements flow control based on bufferedAmount", "Reconstructed file matches original checksum"]
                },
                "resources": [
                    {"title": "Pion WebRTC Go Implementation", "url": "https://github.com/pion/webrtc"},
                    {"title": "WebRTC Samples Repository", "url": "https://webrtc.github.io/samples/"}
                ]
            }
        ]
    },

    # 4. Applied Homomorphic Encryption
    {
        "title": "Applied Homomorphic Encryption",
        "description": "Computing on encrypted data without decryption is no longer theoretical — libraries like SEAL make it practical.",
        "subject": "Privacy Engineers & Cryptography Devs",
        "modules_data": [
            {
                "title": "Cryptographic Foundations & Learning With Errors",
                "topics": [
                    {"title": "Homomorphic Encryption Fundamentals", "youtube_search_query": "Homomorphic encryption partially vs fully homomorphic LWE", "subtopics": ["Additive vs multiplicative homomorphism", "Noise growth in ciphertexts", "Security levels and polynomial dimension"]},
                    {"title": "Learning With Errors (LWE) & Ring-LWE", "youtube_search_query": "Learning With Errors LWE Ring LWE cryptography tutorial", "subtopics": ["LWE hardness assumption", "Ring-LWE efficiency gains", "Polynomial quotient rings"]},
                    {"title": "Key Generation & Encryption Schemes", "youtube_search_query": "Homomorphic encryption key generation secret key public key relinearization", "subtopics": ["Secret key and public key pair", "Relinearization keys", "Galois keys for rotation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A mathematical demonstration script using LWE matrix operations showing noisy encryption and decryption.",
                    "what_counts_as_evidence": "Python script implementing LWE encrypt/decrypt with vector noise addition.",
                    "eval_criteria": ["Decryption succeeds when noise is below bound threshold", "Noise growth is measurable after vector addition"]
                },
                "resources": [
                    {"title": "Microsoft SEAL Library", "url": "https://github.com/microsoft/SEAL"},
                    {"title": "Homomorphic Encryption Standardization", "url": "https://homomorphicencryption.org/"}
                ]
            },
            {
                "title": "BGV & CKKS Schemes with Microsoft SEAL",
                "topics": [
                    {"title": "BGV Scheme for Integer Arithmetic", "youtube_search_query": "BGV scheme homomorphic encryption integer arithmetic SEAL", "subtopics": ["Plaintext modulus selection", "Exact integer operations", "Modular reduction and noise"]},
                    {"title": "CKKS Scheme for Floating-Point Computations", "youtube_search_query": "CKKS scheme homomorphic encryption real numbers scale SEAL", "subtopics": ["Approximate arithmetic", "Scale factor management", "Rescaling operations"]},
                    {"title": "Batching & SIMD Operations", "youtube_search_query": "Homomorphic encryption SIMD batching CRT slot packing", "subtopics": ["Chinese Remainder Theorem batching", "SIMD vector operations", "Slot rotation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A C++ or Python script using Microsoft SEAL (or TenSEAL) implementing CKKS vector multiplication.",
                    "what_counts_as_evidence": "Source code that encodes floating-point vectors, performs homomorphic multiplication, rescales, and decrypts correct product.",
                    "eval_criteria": ["Correctly manages scale factors after multiplication", "Decrypted result matches unencrypted vector product within precision bound"]
                },
                "resources": [
                    {"title": "Microsoft SEAL C++ Examples", "url": "https://github.com/microsoft/SEAL/tree/main/native/examples"},
                    {"title": "OpenFHE Cryptography Library", "url": "https://openfhe.org/"}
                ]
            },
            {
                "title": "Encrypted Polynomial Operations & Noise Budget",
                "topics": [
                    {"title": "Polynomial Evaluation on Ciphertexts", "youtube_search_query": "Homomorphic encryption polynomial evaluation noise budget", "subtopics": ["Paterson-Stockmeyer algorithm", "Depth reduction techniques", "Multiplication depth limits"]},
                    {"title": "Relinearization & Ciphertext Size Control", "youtube_search_query": "Relinearization homomorphic encryption ciphertext degree reduction", "subtopics": ["Ciphertext size expansion", "Relinearization key application", "Key switching matrices"]},
                    {"title": "Noise Budget Tracking & Bootstrapping", "youtube_search_query": "Homomorphic encryption noise budget tracking bootstrapping", "subtopics": ["Noise budget consumption", "Decryption failure condition", "Bootstrapping concept"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An evaluation module that computes a 3rd-degree polynomial on encrypted inputs while logging remaining noise budget.",
                    "what_counts_as_evidence": "Console log showing noise budget after each multiplication and relinearization step.",
                    "eval_criteria": ["Relinearization is applied after multiplication to prevent degree explosion", "Final noise budget remains above zero"]
                },
                "resources": [
                    {"title": "HElib Homomorphic Encryption Library", "url": "https://github.com/homenc/HElib"},
                    {"title": "CKKS Scheme Specification Paper", "url": "https://eprint.iacr.org/2016/421.pdf"}
                ]
            },
            {
                "title": "Privacy-Preserving Machine Learning & Protocols",
                "topics": [
                    {"title": "Encrypted Linear Regression & Neural Net Inference", "youtube_search_query": "Privacy preserving machine learning homomorphic encryption TenSEAL", "subtopics": ["Polynomial activation approximations", "Encrypted matrix multiplication", "Client-server inference protocol"]},
                    {"title": "Secure Database Querying (PIR)", "youtube_search_query": "Private Information Retrieval PIR homomorphic encryption", "subtopics": ["Index-based PIR protocol", "Response homomorphic aggregation", "Bandwidth efficiency"]},
                    {"title": "Production Performance Optimization", "youtube_search_query": "Homomorphic encryption performance optimization hardware acceleration", "subtopics": ["Hardware acceleration (AVX-512/GPU)", "Parameter selection tradeoffs", "Ciphertext compression"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A client-server encrypted inference prototype where server evaluates a neural net layer without seeing client data.",
                    "what_counts_as_evidence": "Python code showing client encrypting input feature vector, server executing dot product on ciphertext, and client decrypting result.",
                    "eval_criteria": ["Server never gains access to secret key or unencrypted input", "Inference result matches plain-text model prediction"]
                },
                "resources": [
                    {"title": "TenSEAL PyTorch Integration", "url": "https://github.com/OpenMined/TenSEAL"},
                    {"title": "Concrete Python FHE Compiler", "url": "https://github.com/zama-ai/concrete-python"}
                ]
            }
        ]
    },

    # 5. Git Internals: Objects & Plumbing Commands
    {
        "title": "Git Internals: Objects & Plumbing Commands",
        "description": "Understanding the content-addressable object store changes how you debug merge conflicts forever.",
        "subject": "Any Developer who uses Git daily",
        "modules_data": [
            {
                "title": "Git Object Store: Blobs, Trees & Commits",
                "topics": [
                    {"title": "Content-Addressable Storage & SHA-1/SHA-256", "youtube_search_query": "Git object store SHA-1 hashing content addressable", "subtopics": ["Object header formatting", "Zlib compression", "SHA calculation for content"]},
                    {"title": "Blob Objects & Header Construction", "youtube_search_query": "Git blob object file structure zlib compression", "subtopics": ["blob <size>\\0 content header", "Decompressing .git/objects", "Reading object data with Python"]},
                    {"title": "Tree Objects & Directory Encoding", "youtube_search_query": "Git tree object file structure binary mode sha parse", "subtopics": ["Tree entry mode and filename", "Binary 20-byte SHA-1 hashes", "Nested tree hierarchies"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python script that manually formats and zlib-compresses a file buffer to write a valid Git blob into `.git/objects`.",
                    "what_counts_as_evidence": "Script output where `git cat-file -p <hash>` successfully displays the written content.",
                    "eval_criteria": ["Header format `blob <length>\\0` is constructed correctly", "Output path matches computed SHA-1 hash"]
                },
                "resources": [
                    {"title": "Git Book - Git Internals", "url": "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects"},
                    {"title": "Git Source Code Mirror", "url": "https://github.com/git/git"}
                ]
            },
            {
                "title": "Git References, HEAD & Index Mechanics",
                "topics": [
                    {"title": "Commit Objects & Ancestry Chains", "youtube_search_query": "Git commit object format parent tree author committer", "subtopics": ["Commit header fields", "Parent commit hashes", "Commit message encoding"]},
                    {"title": "Branches, Tags & Ref Files", "youtube_search_query": "Git refs heads tags symbolic reference HEAD file", "subtopics": ["Loose refs in .git/refs/", "Symbolic ref formatting", "Packed-refs file format"]},
                    {"title": "The Staging Area (.git/index) Format", "youtube_search_query": "Git index file binary format DIRC header stat entries", "subtopics": ["DIRC binary file header", "Stat info and file signatures", "SHA-1 path mapping"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A parser for the binary `.git/index` file that decodes file entries, modes, and staged SHA-1 hashes.",
                    "what_counts_as_evidence": "Terminal tool printing index contents matching `git ls-files --stage` output.",
                    "eval_criteria": ["Correctly parses 12-byte DIRC header and version number", "Extracts entry pathnames and SHA hashes accurately"]
                },
                "resources": [
                    {"title": "Git Book - Git References", "url": "https://git-scm.com/book/en/v2/Git-Internals-Git-References"},
                    {"title": "The Git Index File Specification", "url": "https://git-scm.com/docs/index-format"}
                ]
            },
            {
                "title": "Low-Level Plumbing Commands & Packfiles",
                "topics": [
                    {"title": "Plumbing Commands: hash-object, cat-file, mktree", "youtube_search_query": "Git plumbing commands hash-object cat-file mktree commit-tree", "subtopics": ["git hash-object -w", "git cat-file -t and -p", "git mktree and commit-tree"]},
                    {"title": "Packfiles & Delta Compression", "youtube_search_query": "Git packfile format idx index file delta compression", "subtopics": ["PACK header and object count", "OBJ_OFS_DELTA and OBJ_REF_DELTA", "Packfile index (.idx) binary format"]},
                    {"title": "Garbage Collection & Reflog Mechanics", "youtube_search_query": "Git gc reflog unreachable objects loose pack ratio", "subtopics": ["Unreachable object identification", "Reflog file format", "Packfile creation logic"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A script that constructs a Git commit without using `git commit` by chaining `hash-object`, `mktree`, and `commit-tree`.",
                    "what_counts_as_evidence": "Shell script or Python automation creating a valid commit hash reachable in `git log`.",
                    "eval_criteria": ["Constructs tree object directly from plumbing commands", "Updates HEAD branch reference file correctly"]
                },
                "resources": [
                    {"title": "Git Plumbing Commands List", "url": "https://git-scm.com/docs/git#_plumbing_commands"},
                    {"title": "Git Packfile Format Specification", "url": "https://git-scm.com/docs/pack-format"}
                ]
            },
            {
                "title": "Rebuilding a Mini-Git CLI Tool",
                "topics": [
                    {"title": "CLI Engine Setup: init & cat-file", "youtube_search_query": "Building mini Git implementation Python Rust tutorial", "subtopics": ["Directory structure initialization", "Reading object headers", "Argument parsing for CLI"]},
                    {"title": "Staging & Commit Command Implementation", "youtube_search_query": "Implementing git add and git commit from scratch", "subtopics": ["Building tree objects recursively", "Writing commit object headers", "Updating ref pointers"]},
                    {"title": "Checkout & Branching Implementation", "youtube_search_query": "Implementing git checkout branch switching from scratch", "subtopics": ["Restoring working tree from index", "Updating HEAD pointer", "Conflict detection logic"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A mini Git CLI tool in Python supporting `init`, `add`, `commit`, `log`, and `checkout` subcommands.",
                    "what_counts_as_evidence": "Python script capable of initializing a repository, tracking files, recording commits, and switching branches.",
                    "eval_criteria": ["Created repository can be inspected using official `git` command", "Branch switching accurately updates working directory files"]
                },
                "resources": [
                    {"title": "Write Yourself a Git (Wyag)", "url": "https://wyag.thume.ca/"},
                    {"title": "libgit2 C Library", "url": "https://libgit2.org/"}
                ]
            }
        ]
    },

    # 6. GPU Programming with CUDA
    {
        "title": "GPU Programming with CUDA",
        "description": "Direct GPU control for custom kernels — essential when PyTorch abstractions aren't enough.",
        "subject": "HPC & ML Infrastructure Engineers",
        "modules_data": [
            {
                "title": "CUDA Architecture & Execution Model",
                "topics": [
                    {"title": "GPU Hardware Architecture & Streaming Multiprocessors", "youtube_search_query": "CUDA GPU hardware architecture Streaming Multiprocessor SM", "subtopics": ["SM hardware composition", "CUDA cores and Tensor Cores", "Global memory bus architecture"]},
                    {"title": "Thread Hierarchy & Grid Launch Configuration", "youtube_search_query": "CUDA thread hierarchy grid block thread dimensions kernel launch", "subtopics": ["Threads, blocks, and grids", "blockIdx and threadIdx calculations", "Grid dimension bounds"]},
                    {"title": "Memory Allocation & Data Transfers", "youtube_search_query": "cudaMalloc cudaMemcpy host to device transfer CUDA", "subtopics": ["cudaMalloc and cudaFree", "cudaMemcpy HostToDevice", "Pinned host memory (cudaHostAlloc)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A vector addition CUDA kernel written in C++ that executes across 1D grids and blocks.",
                    "what_counts_as_evidence": "Compilable `.cu` file using `nvcc` that allocates device memory, executes kernel, and verifies output on host.",
                    "eval_criteria": ["Correctly computes global thread index `i = blockIdx.x * blockDim.x + threadIdx.x`", "Host verification passes for 1,000,000 element vectors"]
                },
                "resources": [
                    {"title": "NVIDIA CUDA C Programming Guide", "url": "https://docs.nvidia.com/cuda/cuda-c-programming-guide/"},
                    {"title": "CUDA Refresher Series", "url": "https://developer.nvidia.com/blog/cuda-refresher-cuda-execution-model/"}
                ]
            },
            {
                "title": "CUDA Memory Hierarchy: Shared, Global & Constant",
                "topics": [
                    {"title": "Shared Memory & __syncthreads() Synchronization", "youtube_search_query": "CUDA shared memory __syncthreads memory tile matrix multiplication", "subtopics": ["__shared__ memory allocation", "Block-level synchronization", "Coalesced global memory access"]},
                    {"title": "Bank Conflicts & Shared Memory Padding", "youtube_search_query": "CUDA shared memory bank conflicts 32 banks stride padding", "subtopics": ["32-bank memory architecture", "Stride conflicts and resolution", "Memory array padding"]},
                    {"title": "Matrix Multiplication with Tiled Shared Memory", "youtube_search_query": "Tiled matrix multiplication CUDA shared memory kernel", "subtopics": ["Sub-matrix tiling logic", "Loading memory tiles into shared memory", "Accumulation across tiles"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A tiled matrix multiplication CUDA kernel utilizing shared memory to reduce global memory bandwidth usage.",
                    "what_counts_as_evidence": "C++ source code comparing runtime execution speed of naive vs tiled CUDA matrix multiplication.",
                    "eval_criteria": ["Shared memory tile size avoids bank conflicts", "Execution speed shows clear improvement over naive kernel"]
                },
                "resources": [
                    {"title": "CUDA Memory Management Guide", "url": "https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html#memory-optimizations"},
                    {"title": "NVIDIA Shared Memory Optimization", "url": "https://developer.nvidia.com/blog/using-shared-memory-cuda-cc/"}
                ]
            },
            {
                "title": "Warp Divergence, Parallel Reduction & Atomic Operations",
                "topics": [
                    {"title": "Warp Execution & Divergence Mitigation", "youtube_search_query": "CUDA warp execution SIMT warp divergence branch mitigation", "subtopics": ["32-thread warp execution", "Branch divergence performance cost", "Warp shuffle instructions (__shfl_sync)"]},
                    {"title": "Parallel Reduction Algorithms", "youtube_search_query": "CUDA parallel reduction tree sum kernel optimization", "subtopics": ["Interleaved vs sequential addressing", "Unrolling last warp loops", "Warp shuffle reduction"]},
                    {"title": "Atomic Operations & Global Counters", "youtube_search_query": "CUDA atomicAdd atomic operations global memory contention", "subtopics": ["atomicAdd and atomicMax", "Global memory contention cost", "Block-local atomic reduction"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An optimized array reduction CUDA kernel (sum reduction) using warp shuffle primitives.",
                    "what_counts_as_evidence": "Benchmarking source file verifying sum correctness against CPU implementation for 16M elements.",
                    "eval_criteria": ["Kernel completely avoids branch divergence within warps", "Uses warp shuffle operations for final block reduction"]
                },
                "resources": [
                    {"title": "Optimizing Parallel Reduction in CUDA", "url": "https://developer.download.nvidia.com/assets/cuda/files/reduction.pdf"},
                    {"title": "NPU and GPU Warp Execution Rules", "url": "https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#hardware-implementation"}
                ]
            },
            {
                "title": "Building Custom PyTorch C++/CUDA Extensions",
                "topics": [
                    {"title": "PyTorch C++ Extension API & torch::Tensor", "youtube_search_query": "PyTorch C++ extension custom CUDA operator setup.py", "subtopics": ["torch::Tensor C++ interface", "ATen library macros", "Tensor accessor templates"]},
                    {"title": "Forward & Backward Custom Kernel Binding", "youtube_search_query": "PyTorch autograd function custom CUDA forward backward", "subtopics": ["Custom autograd Function", "Forward CUDA kernel launch", "Backward gradient calculation kernel"]},
                    {"title": "Kernel Profiling with Nsight Systems", "youtube_search_query": "NVIDIA Nsight Systems kernel profiling memory throughput PyTorch", "subtopics": ["Trace analysis in Nsight", "Occupancy calculator", "Memory bandwidth utilization"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A PyTorch CUDA extension implementing a custom activation function (e.g. Swish or Fused GELU) with forward/backward passes.",
                    "what_counts_as_evidence": "Python test script importing the compiled C++/CUDA module and checking gradients with `torch.autograd.gradcheck`.",
                    "eval_criteria": ["`gradcheck` passes within standard tolerance", "Setup script compiles CUDA module clean without warnings"]
                },
                "resources": [
                    {"title": "PyTorch Custom C++ and CUDA Extensions", "url": "https://pytorch.org/tutorials/advanced/cpp_extension.html"},
                    {"title": "Cutlass CUDA Template Library", "url": "https://github.com/NVIDIA/cutlass"}
                ]
            }
        ]
    },

    # 7. Building Figma Plugins with the Canvas API
    {
        "title": "Building Figma Plugins with the Canvas API",
        "description": "Automate repetitive design tasks and integrate external data into your design workflow.",
        "subject": "Design Engineers & Design Tool Builders",
        "modules_data": [
            {
                "title": "Figma Plugin Architecture & Sandbox Model",
                "topics": [
                    {"title": "Figma Sandbox vs UI Iframe Model", "youtube_search_query": "Figma plugin architecture sandbox main thread UI iframe", "subtopics": ["Main thread JS environment", "UI iframe isolation", "postMessage IPC communication"]},
                    {"title": "manifest.json Configuration & Scopes", "youtube_search_query": "Figma plugin manifest.json permissions networkAccess", "subtopics": ["Plugin entry points", "UI file linkage", "Network access policies"]},
                    {"title": "Plugin Lifecycle & Async Operations", "youtube_search_query": "Figma plugin figma.showUI async await document loading", "subtopics": ["figma.showUI setup", "figma.closePlugin execution", "Async node loading"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A minimal Figma plugin that sends messages between main plugin thread and UI iframe to toggle theme settings.",
                    "what_counts_as_evidence": "TypeScript source code showing bidirectional message handling via `figma.ui.onmessage` and `parent.postMessage`.",
                    "eval_criteria": ["Correctly separates sandbox logic from UI HTML/JS", "Handles plugin termination gracefully"]
                },
                "resources": [
                    {"title": "Figma Plugin Developer API Overview", "url": "https://www.figma.com/plugin-docs/api/figma/"},
                    {"title": "Figma Plugin Code Samples", "url": "https://github.com/figma/plugin-samples"}
                ]
            },
            {
                "title": "Scene Node Tree Manipulation & Selection API",
                "topics": [
                    {"title": "Figma Node Tree & Selection Events", "youtube_search_query": "Figma plugin figma.currentPage.selection node traversal", "subtopics": ["Selection change listeners", "FrameNode, TextNode, ComponentNode types", "Node tree traversal algorithms"]},
                    {"title": "Node Creation & Property Mutation", "youtube_search_query": "Figma plugin createRectangle createText fills stroke styling", "subtopics": ["Creating scene nodes", "Fills and strokes vector styling", "Layout position and bounding boxes"]},
                    {"title": "Auto Layout & Component Properties", "youtube_search_query": "Figma plugin Auto Layout layoutMode padding gap creation", "subtopics": ["Setting auto layout constraints", "Padding and item spacing", "Component instance variant overrides"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A plugin command that scans selected frames and automatically builds a formatted UI card component with Auto Layout.",
                    "what_counts_as_evidence": "TypeScript file executing node instantiation, auto layout configuration, and text binding on active selection.",
                    "eval_criteria": ["Configures horizontal and vertical Auto Layout correctly", "Sets node dimensions and padding dynamically"]
                },
                "resources": [
                    {"title": "Figma Scenenode API Reference", "url": "https://www.figma.com/plugin-docs/api/SceneNode/"},
                    {"title": "Figma Plugin UI Messaging System", "url": "https://www.figma.com/plugin-docs/how-plugins-run/"}
                ]
            },
            {
                "title": "HTML5 Canvas Integration & Custom Rendering",
                "topics": [
                    {"title": "HTML Canvas API in Plugin UI", "youtube_search_query": "HTML5 Canvas API 2D context drawing path rendering UI", "subtopics": ["2D Context initialization", "Path drawing and transformation matrix", "Offscreen canvas rendering"]},
                    {"title": "Image Data Export & ArrayBuffer Conversion", "youtube_search_query": "Canvas getImageData Uint8ClampedArray Figma figma.createImage", "subtopics": ["Canvas blob export", "Uint8Array byte conversion", "figma.createImage usage"]},
                    {"title": "Generative Graphics & Pattern Creation", "youtube_search_query": "Generative design canvas API pattern export to Figma fill", "subtopics": ["Procedural noise generation", "Pattern rasterization", "Applying image fill to Figma shape"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A custom generative noise pattern builder running in the UI canvas that exports image fills into selected Figma nodes.",
                    "what_counts_as_evidence": "HTML/TS source rendering a procedural canvas pattern and pushing byte arrays to Figma canvas fills.",
                    "eval_criteria": ["Converts HTML canvas rendering to Uint8Array successfully", "Applies generated pattern as image fill on target node"]
                },
                "resources": [
                    {"title": "MDN Canvas API Reference", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API"},
                    {"title": "Figma Create Image API", "url": "https://www.figma.com/plugin-docs/api/figma-createImage/"}
                ]
            },
            {
                "title": "Design Token Automation & Production Publishing",
                "topics": [
                    {"title": "Design Token Extraction & Export", "youtube_search_query": "Figma plugin extract paint styles text styles design tokens JSON", "subtopics": ["Extracting color styles and variables", "Typography style parsing", "W3C design token JSON formatting"]},
                    {"title": "External REST API Integration", "youtube_search_query": "Figma plugin fetch API sync tokens GitHub REST API", "subtopics": ["Making network requests from UI iframe", "GitHub API authentication", "Syncing JSON tokens to repository"]},
                    {"title": "Testing & Production Plugin Bundle", "youtube_search_query": "Figma plugin bundler esbuild TypeScript production build", "subtopics": ["esbuild / Webpack configuration", "Type checking with @figma/plugin-typings", "Submission and manifest review"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An automated exporter plugin that extracts local color/text variables and formats them as standard W3C Design Tokens JSON.",
                    "what_counts_as_evidence": "TypeScript script outputting a structured design token JSON file ready for GitHub sync.",
                    "eval_criteria": ["Parses Figma variable collection correctly", "Generates schema-compliant W3C JSON output"]
                },
                "resources": [
                    {"title": "Figma Publishing Plugins Guide", "url": "https://www.figma.com/plugin-docs/publishing/"},
                    {"title": "W3C Design Tokens Community Group", "url": "https://tr.designtokens.org/format/"}
                ]
            }
        ]
    },

    # 8. Browser Audio: Building Synthesizers with Web Audio API
    {
        "title": "Browser Audio: Building Synthesizers with Web Audio API",
        "description": "Real-time audio synthesis and analysis entirely in the browser — a creative niche with no good tutorials.",
        "subject": "Creative Developers & Musicians",
        "modules_data": [
            {
                "title": "AudioContext, Oscillators & Audio Nodes",
                "topics": [
                    {"title": "AudioContext Lifecycle & User Gestures", "youtube_search_query": "Web Audio API AudioContext creation browser autoplay policy", "subtopics": ["AudioContext initialization", "Browser autoplay resume trigger", "Sample rate and destination"]},
                    {"title": "OscillatorNode & Waveform Generation", "youtube_search_query": "OscillatorNode sine square sawtooth triangle frequency pitch Web Audio", "subtopics": ["Waveform types (sine, square, sawtooth, triangle)", "Frequency parameter setting", "Custom PeriodicWave creation"]},
                    {"title": "Audio Node Routing Graph", "youtube_search_query": "Web Audio API node routing audio destination gain node connection", "subtopics": ["connect() graph paradigm", "AudioParam parameter modulation", "Disconnecting audio paths"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A dual-oscillator sound generator module with configurable frequencies, waveforms, and master volume gain.",
                    "what_counts_as_evidence": "JavaScript class initializing AudioContext on user button press and playing dual tuned tones.",
                    "eval_criteria": ["Handles browser autoplay user gesture requirements", "Routes oscillators through gain node to destination"]
                },
                "resources": [
                    {"title": "MDN Web Audio API Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API"},
                    {"title": "W3C Web Audio API Specification", "url": "https://www.w3.org/TR/webaudio/"}
                ]
            },
            {
                "title": "Gain Control, Biquad Filters & ADSR Envelopes",
                "topics": [
                    {"title": "ADSR Envelope Automation", "youtube_search_query": "ADSR envelope implementation gain node AudioParam exponentialRampToValueAtTime", "subtopics": ["Attack, Decay, Sustain, Release curves", "setValueAtTime scheduling", "exponentialRampToValueAtTime precision"]},
                    {"title": "BiquadFilterNode & Cutoff Frequency", "youtube_search_query": "BiquadFilterNode lowpass highpass filter resonance Web Audio", "subtopics": ["Lowpass, highpass, bandpass filter types", "Cutoff frequency parameter", "Resonance (Q) peaking"]},
                    {"title": "LFO (Low Frequency Oscillator) Modulation", "youtube_search_query": "LFO modulation Web Audio API vibrato tremolo filter sweep", "subtopics": ["Connecting LFO to AudioParam", "Vibrato pitch modulation", "Tremolo amplitude modulation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An ADSR envelope generator class connected to a resonant BiquadFilterNode for dynamic sound shaping.",
                    "what_counts_as_evidence": "JS script executing automated envelope trigger methods (`noteOn` and `noteOff`) on key events.",
                    "eval_criteria": ["Envelope timing schedules transitions using exact audio context timestamps", "Filter cutoff modulates cleanly without clicking artifacts"]
                },
                "resources": [
                    {"title": "MDN AudioParam Scheduling", "url": "https://developer.mozilla.org/en-US/docs/Web/API/AudioParam"},
                    {"title": "Web Audio BiquadFilterNode Reference", "url": "https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode"}
                ]
            },
            {
                "title": "Polyphony, Web MIDI API & Effects Chains",
                "topics": [
                    {"title": "Polyphonic Voice Management", "youtube_search_query": "Web Audio API polyphonic voice allocator synth voice pooling", "subtopics": ["Voice allocation pool", "Active note tracking", "Voice stealing algorithm"]},
                    {"title": "Web MIDI API & Hardware Controllers", "youtube_search_query": "Web MIDI API navigator.requestMIDIAccess noteOn noteOff event handling", "subtopics": ["navigator.requestMIDIAccess API", "MIDI status bytes parsing", "Pitch bend and control change (CC)"]},
                    {"title": "Effects Chains: Delay, Reverb & ConvolverNode", "youtube_search_query": "ConvolverNode impulse response delay effect Web Audio API", "subtopics": ["DelayNode feedback loop", "ConvolverNode impulse response loading", "Dry/Wet signal mixing"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A polyphonic synthesizer module controlled by Web MIDI input with an integrated delay effects loop.",
                    "what_counts_as_evidence": "Web app handling external MIDI keyboard events and managing up to 8 simultaneous voice nodes.",
                    "eval_criteria": ["Correctly parses MIDI noteOn/noteOff velocity and pitch", "Voice pool recycles finished synthesizer nodes cleanly"]
                },
                "resources": [
                    {"title": "MDN Web MIDI API Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API"},
                    {"title": "Tone.js Audio Framework", "url": "https://tonejs.github.io/"}
                ]
            },
            {
                "title": "Custom DSP with AudioWorklet Processor",
                "topics": [
                    {"title": "AudioWorklet Architecture & Threading", "youtube_search_query": "AudioWorkletProcessor Web Audio audio worklet thread tutorial", "subtopics": ["Dedicated audio rendering thread", "AudioWorkletNode vs AudioWorkletProcessor", "MessagePort IPC communication"]},
                    {"title": "Writing Custom Audio Processors in JS", "youtube_search_query": "AudioWorkletProcessor process method buffer loop custom DSP", "subtopics": ["process() function signature", "Inputs and outputs Float32Array buffers", "Quantum size (128 samples) processing"]},
                    {"title": "Custom Distortion & Wavetable Synthesis", "youtube_search_query": "Wavetable synthesizer AudioWorklet custom DSP algorithm", "subtopics": ["Bitcrusher and waveshaper algorithms", "Wavetable interpolation lookup", "Real-time visualizer AnalyserNode integration"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A custom Bitcrusher DSP processor running in an AudioWorklet thread.",
                    "what_counts_as_evidence": "JavaScript files (`bitcrusher-processor.js` and main thread bridge) implementing sample rate reduction and bit quantization.",
                    "eval_criteria": ["Process function operates directly on 128-sample Float32Array buffers", "Parameters are controllable via AudioParam descriptors"]
                },
                "resources": [
                    {"title": "MDN AudioWorkletNode API", "url": "https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode"},
                    {"title": "Google Chrome AudioWorklet Samples", "url": "https://googlechromelabs.github.io/web-audio-samples/audio-worklet/"}
                ]
            }
        ]
    },

    # 9. Writing a Programming Language: Lexer to Interpreter
    {
        "title": "Writing a Programming Language: Lexer to Interpreter",
        "description": "Building a working interpreter from scratch teaches CS fundamentals better than any course.",
        "subject": "CS Students & Language Enthusiasts",
        "modules_data": [
            {
                "title": "Lexical Analysis & Tokenizer Implementation",
                "topics": [
                    {"title": "Token Types & Lexer State Machine", "youtube_search_query": "Writing a lexer tokenizer programming language state machine", "subtopics": ["TokenType enum definition", "Literal, identifier, keyword tokens", "Line and column tracking"]},
                    {"title": "Character Scanning & Buffer Navigation", "youtube_search_query": "Lexer character scanning peek advance lookahead implementation", "subtopics": ["Source string pointer advance", "Lookahead peek functionality", "Handling whitespace and comments"]},
                    {"title": "String & Number Literal Lexing", "youtube_search_query": "Lexer scanning string numbers literals error handling", "subtopics": ["Escape character parsing", "Integer and floating-point lexing", "Unterminated string detection"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A complete Tokenizer class that converts raw source code into a list of typed Token objects.",
                    "what_counts_as_evidence": "Python script taking code strings with variables, numbers, operators, and returning token streams.",
                    "eval_criteria": ["Accurately identifies all keywords, operators, and literals", "Reports precise line and column numbers for syntax errors"]
                },
                "resources": [
                    {"title": "Crafting Interpreters - Scanning", "url": "https://craftinginterpreters.com/scanning.html"},
                    {"title": "Flex Lexical Analyzer Documentation", "url": "https://github.com/westes/flex"}
                ]
            },
            {
                "title": "Parsing & Abstract Syntax Tree (AST) Construction",
                "topics": [
                    {"title": "Context-Free Grammars & EBNF", "youtube_search_query": "Context free grammar EBNF parser expression hierarchy", "subtopics": ["Grammar production rules", "Operator precedence hierarchy", "Associativity rules"]},
                    {"title": "Recursive Descent Parser Logic", "youtube_search_query": "Recursive descent parser implementation programming language", "subtopics": ["Expression parsing functions", "Statement parsing (let, if, while)", "Error recovery and synchronization"]},
                    {"title": "Pratt Parsing for Expressions", "youtube_search_query": "Pratt parser precedence climbing expression evaluation", "subtopics": ["Binding powers table", "Prefix and infix parse functions", "Precedence climbing loop"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Recursive Descent or Pratt Parser that converts a token stream into an Abstract Syntax Tree (AST).",
                    "what_counts_as_evidence": "Parser code outputting formatted AST JSON for complex arithmetic and assignment statements.",
                    "eval_criteria": ["Correctly enforces operator precedence (* over +)", "Constructs valid AST node objects"]
                },
                "resources": [
                    {"title": "Crafting Interpreters - Representing Code", "url": "https://craftinginterpreters.com/representing-code.html"},
                    {"title": "Pratt Parsing Explained", "url": "https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html"}
                ]
            },
            {
                "title": "Tree-Walk Interpreter & Environment Scoping",
                "topics": [
                    {"title": "AST Node Visitor Pattern", "youtube_search_query": "Tree walk interpreter visitor pattern AST evaluation", "subtopics": ["Visitor pattern implementation", "Evaluating binary and unary nodes", "Runtime type system representation"]},
                    {"title": "Lexical Environment & Variable Scoping", "youtube_search_query": "Lexical scope environment symbol table interpreter implementation", "subtopics": ["Environment symbol tables", "Enclosing parent scope links", "Variable lookup and assignment"]},
                    {"title": "Runtime Error Handling Mechanics", "youtube_search_query": "Interpreter runtime error handling stack trace", "subtopics": ["Type mismatch exceptions", "Undefined variable errors", "Divide-by-zero safety"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Tree-Walk Interpreter that evaluates AST nodes within nested scope environments.",
                    "what_counts_as_evidence": "Python script evaluating variable declarations, block scoping, and reassignments successfully.",
                    "eval_criteria": ["Child scopes can read parent variables but not pollute them", "Raises clean runtime error messages with line numbers"]
                },
                "resources": [
                    {"title": "Crafting Interpreters - Evaluating Expressions", "url": "https://craftinginterpreters.com/evaluating-expressions.html"},
                    {"title": "Structure and Interpretation of Computer Programs", "url": "https://mitp-content-server.mit.edu/books/content/sectbyfn/books_pres_0/6515/sicp.html"}
                ]
            },
            {
                "title": "Control Flow, Functions & First-Class Closures",
                "topics": [
                    {"title": "Conditional Statements & Loop Evaluation", "youtube_search_query": "Interpreter control flow if else while loop execution", "subtopics": ["Short-circuit boolean logic", "While loop execution loop", "Return and break control flow exceptions"]},
                    {"title": "Function Declarations & Call Execution", "youtube_search_query": "Interpreter function calls parameters return values stack frame", "subtopics": ["Function object representation", "Argument binding to local parameters", "Return value throw/catch pattern"]},
                    {"title": "First-Class Closures & Lexical Capture", "youtube_search_query": "Interpreter first class closures lexical environment capture", "subtopics": ["Capturing enclosing environment at declaration", "Higher-order functions", "Recursion support"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An interpreter extension supporting recursive function calls and first-class closures.",
                    "what_counts_as_evidence": "Test execution of a recursive Fibonacci program and counter closure function producing correct outputs.",
                    "eval_criteria": ["Closure retains state across function calls", "Recursion executes without scope pollution"]
                },
                "resources": [
                    {"title": "Crafting Interpreters - Functions", "url": "https://craftinginterpreters.com/functions.html"},
                    {"title": "LLVM Compiler Infrastructure Tutorial", "url": "https://llvm.org/docs/tutorial/"}
                ]
            }
        ]
    },

    # 10. Event-Driven Architecture with Kafka
    {
        "title": "Event-Driven Architecture with Kafka",
        "description": "Decoupling microservices with streaming events instead of synchronous HTTP calls.",
        "subject": "Data Engineers & Backend Architects",
        "modules_data": [
            {
                "title": "Kafka Core Fundamentals: Storage & Partitions",
                "topics": [
                    {"title": "Commit Log Architecture & Topics", "youtube_search_query": "Apache Kafka commit log topic partition segment storage", "subtopics": ["Append-only log files", "Segment files and index structure", "Topic partition distribution"]},
                    {"title": "Partitioning Strategies & Key Hashing", "youtube_search_query": "Kafka partition key hashing MurmurHash ordering guarantees", "subtopics": ["Default partitioner key hashing", "Per-partition strict ordering", "Custom partitioning logic"]},
                    {"title": "Broker Cluster & KRaft Consensus", "youtube_search_query": "Kafka broker cluster KRaft metadata mode quorum controller", "subtopics": ["Leader and follower replicas", "In-Sync Replicas (ISR)", "KRaft metadata quorum"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A docker-compose configuration and python script that initializes a multi-partition Kafka topic and inspects topic metadata.",
                    "what_counts_as_evidence": "Python script connecting via `confluent-kafka` and printing broker topic partition layouts.",
                    "eval_criteria": ["Cluster initializes in KRaft mode without ZooKeeper", "Topic is created with specified 3 partitions and replication factor"]
                },
                "resources": [
                    {"title": "Apache Kafka Official Documentation", "url": "https://kafka.apache.org/documentation/"},
                    {"title": "Confluent Kafka Architecture Guide", "url": "https://docs.confluent.io/platform/current/kafka/architecture.html"}
                ]
            },
            {
                "title": "Producer Optimization & Consumer Group Rebalancing",
                "topics": [
                    {"title": "Producer Acks, Batching & Compression", "youtube_search_query": "Kafka producer acks batch.size linger.ms snappy compression", "subtopics": ["acks=all durability guarantee", "Batching with linger.ms", "Snappy and zstd compression"]},
                    {"title": "Consumer Groups & Offset Commit Strategies", "youtube_search_query": "Kafka consumer group offset commit manual auto enable.auto.commit", "subtopics": ["Automatic vs manual offset commits", "At-least-once vs at-most-once processing", "Consumer position tracking"]},
                    {"title": "Partition Rebalancing & Cooperative Sticky Assignor", "youtube_search_query": "Kafka consumer group rebalance CooperativeStickyAssignor listener", "subtopics": ["Eager vs cooperative rebalancing", "Rebalance listener callbacks", "State preservation during rebalance"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A resilient producer/consumer pair using manual offset commits after successful database persistence.",
                    "what_counts_as_evidence": "Python consumer application code committing offsets synchronously inside transactional message loops.",
                    "eval_criteria": ["Manual commit executes only after successful payload process", "Implements graceful consumer shutdown on SIGINT"]
                },
                "resources": [
                    {"title": "Kafka Producer Configurations", "url": "https://kafka.apache.org/documentation/#producerconfigs"},
                    {"title": "Kafka Consumer Group Protocol", "url": "https://cwiki.apache.org/confluence/display/KAFKA/Kafka+Client-side+Assignment+Proposal"}
                ]
            },
            {
                "title": "Stream Processing with Kafka Streams & Windowing",
                "topics": [
                    {"title": "Kafka Streams Topology & KStream vs KTable", "youtube_search_query": "Kafka Streams topology KStream KTable duality tutorial", "subtopics": ["Stream-table duality", "Stateless transformations (filter, map)", "Stateful aggregations"]},
                    {"title": "Windowed Aggregations & Tumbling/Hopping Windows", "youtube_search_query": "Kafka Streams windowing tumbling hopping sliding windows late data", "subtopics": ["Tumbling vs hopping windows", "Handling out-of-order events", "Grace period and tombstone cleanups"]},
                    {"title": "State Stores & RocksDB Integration", "youtube_search_query": "Kafka Streams state store RocksDB changelog topic interactive queries", "subtopics": ["Local RocksDB state stores", "Changelog topic backup", "Standby replicas for failover"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Kafka Streams or Faust stream processing application calculating 5-minute tumbling window event counts.",
                    "what_counts_as_evidence": "Stream processing pipeline code producing windowed aggregate counts to an output Kafka topic.",
                    "eval_criteria": ["Correctly assigns events to window buckets based on event timestamp", "Maintains local state across microservice restarts"]
                },
                "resources": [
                    {"title": "Kafka Streams Core Concepts", "url": "https://kafka.apache.org/documentation/streams/"},
                    {"title": "Confluent Kafka Streams Developer Guide", "url": "https://docs.confluent.io/platform/current/streams/developer-guide/write-streams-app.html"}
                ]
            },
            {
                "title": "Event-Driven Microservices & Schema Registry",
                "topics": [
                    {"title": "Schema Registry & Avro Serialization", "youtube_search_query": "Confluent Schema Registry Avro schema evolution compatibility rules", "subtopics": ["Avro binary serialization", "Schema evolution rules (BACKWARD, FORWARD)", "Schema ID header prefix"]},
                    {"title": "Transactional Outbox Pattern & Debezium CDC", "youtube_search_query": "Transactional outbox pattern Debezium CDC PostgreSQL Kafka", "subtopics": ["Dual-write problem resolution", "Outbox database table design", "Debezium log-based CDC"]},
                    {"title": "Event Sourcing & Idempotent Event Handlers", "youtube_search_query": "Event sourcing architecture idempotent event handler deduplication", "subtopics": ["Event store immutable logs", "Deduplication key caching", "Dead letter queue (DLQ) strategy"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An event-driven microservice architecture with Schema Registry validation and Outbox pattern publishing.",
                    "what_counts_as_evidence": "Python pipeline registering Avro schemas, validating messages before produce, and consuming with DLQ fallback.",
                    "eval_criteria": ["Producer rejects messages breaking Avro schema contract", "Unparseable messages route to dead letter topic"]
                },
                "resources": [
                    {"title": "Confluent Schema Registry Overview", "url": "https://docs.confluent.io/platform/current/schema-registry/index.html"},
                    {"title": "CloudEvents Specification", "url": "https://cloudevents.io/"}
                ]
            }
        ]
    },

    # 11. React Server Components: How They Actually Work
    {
        "title": "React Server Components: How They Actually Work",
        "description": "The RSC payload format and streaming protocol are poorly understood even by experienced React devs.",
        "subject": "Advanced Frontend Engineers",
        "modules_data": [
            {
                "title": "React Server Component Paradigm & Architecture",
                "topics": [
                    {"title": "Server Components vs Client Components", "youtube_search_query": "React Server Components vs Client Components architecture boundary", "subtopics": ["Server-only module boundaries", "'use client' directive semantics", "Zero bundle-size server dependencies"]},
                    {"title": "Data Fetching Paradigm & Async Components", "youtube_search_query": "React Server Components async await data fetching database access", "subtopics": ["Direct DB queries in server components", "Waterfall avoidance strategies", "Component-level caching"]},
                    {"title": "Module Graph Splitting & Bundle Boundaries", "youtube_search_query": "RSC module graph build bundler manifest client reference", "subtopics": ["Client reference manifests", "Bundler entry point splitting", "Prop serialization constraints"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A minimal Node.js server rendering async React Server Components fetching data directly from SQLite/PostgreSQL.",
                    "what_counts_as_evidence": "Source code showing server components performing async queries without standard `useEffect` client hooks.",
                    "eval_criteria": ["Server components contain zero client-side JS in final bundle", "Passes props across client boundary safely"]
                },
                "resources": [
                    {"title": "React Server Components RFC", "url": "https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md"},
                    {"title": "React Documentation - Server Components", "url": "https://react.dev/reference/rsc/server-components"}
                ]
            },
            {
                "title": "RSC Payload Format & Wire Protocol Serialization",
                "topics": [
                    {"title": "RSC Wire Format & Stream Syntax", "youtube_search_query": "React Server Components RSC payload format wire protocol stream format", "subtopics": ["Line-by-line JSON payload stream", "Element tag references ($J0, $1)", "Client reference object placeholders"]},
                    {"title": "Prop Serialization & Transferable Data", "youtube_search_query": "RSC prop serialization limitations functions promises JSX", "subtopics": ["Serializing primitives and objects", "Promise serialization in RSC", "Handling non-serializable values"]},
                    {"title": "Reconciliation & Virtual DOM Merging", "youtube_search_query": "RSC stream client reconciliation router cache virtual DOM", "subtopics": ["Client-side flight response parser", "Virtual DOM tree patching", "Preserving client state during navigation"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A custom parser script that decodes a raw RSC stream (`.rsc` payload text) into a JavaScript component tree.",
                    "what_counts_as_evidence": "Node.js script reading flight stream lines and outputting the reconstructed element structure JSON.",
                    "eval_criteria": ["Correctly resolves line-based ID references ($0, $1)", "Parses client reference tags accurately"]
                },
                "resources": [
                    {"title": "Next.js Architecture Guide - RSC", "url": "https://nextjs.org/docs/app/building-your-application/rendering/server-components"},
                    {"title": "React Flight Server/Client Protocol Reference", "url": "https://github.com/facebook/react/tree/main/packages/react-server"}
                ]
            },
            {
                "title": "Streaming SSR, Flight Streams & Suspense",
                "topics": [
                    {"title": "renderToReadableStream & Flight Streams", "youtube_search_query": "React renderToReadableStream flight stream HTML streaming SSR", "subtopics": ["ReadableStream HTTP streaming", "Initial HTML shell rendering", "Inlining RSC payload chunks"]},
                    {"title": "Suspense Boundaries & Out-of-Order HTML Injection", "youtube_search_query": "React Suspense out of order streaming HTML template script injection", "subtopics": ["Fallback placeholder DOM nodes", "Streaming script tags injection", "DOM node replacement logic"]},
                    {"title": "Progressive Hydration & Interactive Shells", "youtube_search_query": "Progressive hydration React Suspense client interactivity streaming", "subtopics": ["Selective hydration priority", "HTML streaming shell speed", "User interaction event replay"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An Express/Hono server serving an HTML response stream using React's `renderToReadableStream` and `<Suspense>`.",
                    "what_counts_as_evidence": "Server script demonstrating immediate HTML shell return followed by streamed slow-component fallback replacements.",
                    "eval_criteria": ["Returns HTTP 200 header immediately with chunked transfer encoding", "Injects delayed component HTML script tags upon promise resolution"]
                },
                "resources": [
                    {"title": "MDN Streams API Documentation", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Streams_API"},
                    {"title": "React renderToReadableStream Reference", "url": "https://react.dev/reference/react-dom/server/renderToReadableStream"}
                ]
            },
            {
                "title": "Server Actions, Form Hydration & Mutations",
                "topics": [
                    {"title": "Server Actions Execution Model", "youtube_search_query": "React Server Actions 'use server' directive HTTP POST RPC", "subtopics": ["'use server' function export", "Hidden POST RPC endpoint generation", "Action ID security headers"]},
                    {"title": "Form Handling & Progressive Enhancement", "youtube_search_query": "React Server Actions form action useActionState progressive enhancement", "subtopics": ["Native HTML form action submission", "useActionState hook integration", "JavaScript-disabled form fallback"]},
                    {"title": "Cache Invalidated Revalidation (revalidatePath)", "youtube_search_query": "Next.js revalidatePath revalidateTag RSC payload refresh", "subtopics": ["Server action revalidation triggers", "Diffing new RSC payload against client state", "Optimistic UI updates (useOptimistic)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A full-stack Server Action mutation handler supporting progressive form submission and `useOptimistic` UI updates.",
                    "what_counts_as_evidence": "Component source file implementing a Server Action form submission with instant optimistic UI feedback.",
                    "eval_criteria": ["Form functions natively without client JS enabled", "Optimistic state instantly reflects pending changes"]
                },
                "resources": [
                    {"title": "React Server Actions Guide", "url": "https://react.dev/reference/rsc/server-actions"},
                    {"title": "Next.js Data Fetching and Revalidation", "url": "https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating"}
                ]
            }
        ]
    },

    # 12. Fine-tuning Diffusion Models (DreamBooth & LoRA)
    {
        "title": "Fine-tuning Diffusion Models (DreamBooth & LoRA)",
        "description": "Inject custom subjects into Stable Diffusion or Flux without retraining the full model.",
        "subject": "Generative AI Practitioners",
        "modules_data": [
            {
                "title": "Latent Diffusion Architecture & Text-to-Image",
                "topics": [
                    {"title": "Latent Space & VAE Encoders", "youtube_search_query": "Latent diffusion model VAE encoder UNet noise predictor explanation", "subtopics": ["Pixel vs latent space compression", "VAE encoding and decoding", "KL-divergence vs VQ regularization"]},
                    {"title": "UNet Architecture & Cross-Attention", "youtube_search_query": "UNet diffusion model cross attention CLIP text embeddings", "subtopics": ["UNet down/up sampling blocks", "CLIP text encoder embeddings", "Cross-attention key-value projection"]},
                    {"title": "Noise Schedules & Denoising Timesteps", "youtube_search_query": "Diffusion noise schedule DDPM DDIM Euler scheduler sampling", "subtopics": ["Forward diffusion noise injection", "Reverse denoising process", "Scheduler sampling steps"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python script using Hugging Face Diffusers that inspects latent tensor shapes at each step of the pipeline.",
                    "what_counts_as_evidence": "Script logging VAE latent shape `(1, 4, 64, 64)`, text embedding shape, and UNet noise predictions.",
                    "eval_criteria": ["Correctly extracts intermediate latents during sampling loop", "Validates spatial resolution compression factor of 8x"]
                },
                "resources": [
                    {"title": "Hugging Face Diffusers Documentation", "url": "https://huggingface.co/docs/diffusers/index"},
                    {"title": "High-Resolution Image Synthesis with Latent Diffusion Models", "url": "https://arxiv.org/abs/2112.10752"}
                ]
            },
            {
                "title": "DreamBooth Fine-Tuning & Subject Preservation",
                "topics": [
                    {"title": "Rare Identifier Tokens & Text Prompts", "youtube_search_query": "DreamBooth rare token identifier subject fine tuning Stable Diffusion", "subtopics": ["Unique identifier selection (e.g. sks)", "Class noun association", "Text prompt curation"]},
                    {"title": "Prior Preservation Loss", "youtube_search_query": "DreamBooth prior preservation loss class images language drift", "subtopics": ["Class generation image set", "Prior preservation loss formulation", "Language drift mitigation"]},
                    {"title": "UNet & Text Encoder Joint Training", "youtube_search_query": "DreamBooth UNet text encoder training learning rate gradient accumulation", "subtopics": ["Selective UNet layer tuning", "Text encoder learning rate offset", "Mixed precision FP16/BF16 training"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A DreamBooth fine-tuning script configuration for training a custom subject from 5 input images.",
                    "what_counts_as_evidence": "Python training launch script setting instance prompt, class prompt, and prior preservation weight.",
                    "eval_criteria": ["Includes class data generation step for prior preservation", "Uses correct learning rate scaling for UNet and text encoder"]
                },
                "resources": [
                    {"title": "DreamBooth Research Paper", "url": "https://arxiv.org/abs/2208.12242"},
                    {"title": "Hugging Face DreamBooth Training Guide", "url": "https://huggingface.co/docs/diffusers/training/dreambooth"}
                ]
            },
            {
                "title": "Low-Rank Adaptation (LoRA) for Diffusion Pipelines",
                "topics": [
                    {"title": "LoRA Rank (r) & Alpha Scaling Math", "youtube_search_query": "LoRA Low Rank Adaptation matrix decomposition rank alpha scaling", "subtopics": ["Low-rank decomposition matrices A and B", "Rank parameter (r) selection", "Alpha scaling multiplier"]},
                    {"title": "Injecting LoRA into UNet Attention Layers", "youtube_search_query": "LoRA diffusion UNet cross attention weight injection PEFT", "subtopics": ["Targeting to_q, to_v attention projections", "Freezing base model parameters", "Checkpoint file size reduction"]},
                    {"title": "Merging & Weighting Multiple LoRAs", "youtube_search_query": "Merging LoRA weights diffusers scale weight blending", "subtopics": ["Dynamic LoRA scale blending", "Merging LoRA into base UNet weights", "Format conversions (safetensors)"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A PyTorch LoRA injection script targeting cross-attention projections (`to_k`, `to_v`, `to_q`, `to_out`) of a UNet.",
                    "what_counts_as_evidence": "Python script printing trainable parameter counts before and after LoRA injection (showing >90% reduction).",
                    "eval_criteria": ["Freezes all base UNet weights while keeping LoRA matrices trainable", "Produces compact `.safetensors` adapter file"]
                },
                "resources": [
                    {"title": "LoRA: Low-Rank Adaptation Paper", "url": "https://arxiv.org/abs/2106.09685"},
                    {"title": "Hugging Face PEFT Library", "url": "https://github.com/huggingface/peft"}
                ]
            },
            {
                "title": "Dataset Curation, Training & Quantization",
                "topics": [
                    {"title": "Dataset Curation, Cropping & Tagging", "youtube_search_query": "Diffusion training dataset prep resolution cropping WD14 tagging", "subtopics": ["Aspect ratio bucketing", "Automated image captioning (BLIP/WD14)", "Resolution scaling (512 vs 1024)"]},
                    {"title": "Gradient Checkpointing & 8-bit Adam Optimization", "youtube_search_query": "Diffusion training VRAM optimization 8bit Adam gradient checkpointing", "subtopics": ["8-bit Adam optimizer (bitsandbytes)", "Gradient checkpointing memory savings", "xFormers / FlashAttention integration"]},
                    {"title": "Inference Evaluation & Model Export", "youtube_search_query": "Diffusers pipeline LoRA loading inference sampling seed evaluation", "subtopics": ["Validation prompt grid generation", "CLIP score subject evaluation", "Exporting to Diffusers / ComfyUI format"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An end-to-end dataset pipeline and inference script that trains a LoRA adapter under 8GB VRAM limits.",
                    "what_counts_as_evidence": "Training launch log demonstrating 8-bit Adam optimization, gradient checkpointing, and generated validation grid images.",
                    "eval_criteria": ["Memory optimizations fit within 8GB VRAM limit", "Validation images demonstrate clear subject learning"]
                },
                "resources": [
                    {"title": "Kohya_ss SD Scripts Repository", "url": "https://github.com/bmaltais/kohya_ss"},
                    {"title": "Accelerate Library Documentation", "url": "https://huggingface.co/docs/accelerate/index"}
                ]
            }
        ]
    },

    # 13. Web Scraping at Scale: Defenses & Countermeasures
    {
        "title": "Web Scraping at Scale: Defenses & Countermeasures",
        "description": "TLS fingerprinting and headless browser detection are an arms race — this covers both sides.",
        "subject": "Data Engineers & Security Analysts",
        "modules_data": [
            {
                "title": "HTTP/2, TLS Fingerprinting & JA3 Signatures",
                "topics": [
                    {"title": "TLS Handshake & JA3/JA4 Fingerprinting", "youtube_search_query": "TLS fingerprinting JA3 JA4 signature scraper detection", "subtopics": ["Cipher suites order evaluation", "TLS extension permutation", "Elliptic curves signature hash"]},
                    {"title": "HTTP/2 Frame Fingerprinting", "youtube_search_query": "HTTP2 frame fingerprinting SETTINGS stream priority detection", "subtopics": ["SETTINGS frame parameter order", "WINDOW_UPDATE frame patterns", "HEADER frame pseudo-header order"]},
                    {"title": "Bypassing TLS Fingerprints with curl-impersonate", "youtube_search_query": "curl impersonate TLS fingerprint spoofing Python requests", "subtopics": ["Chrome/Firefox TLS client spoofing", "Custom C library bindings", "curl-cffi Python integration"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Python scraping script using `curl_cffi` that passes Cloudflare TLS JA3 fingerprint inspection.",
                    "what_counts_as_evidence": "Script output matching browser JA3 fingerprint hash when querying `https://tls.browserleaks.com/json`.",
                    "eval_criteria": ["Generated JA3 hash matches standard Chrome browser signature", "HTTP/2 pseudo-headers follow browser exact ordering"]
                },
                "resources": [
                    {"title": "JA3 Fingerprinting GitHub Repository", "url": "https://github.com/salesforce/ja3"},
                    {"title": "curl-impersonate Project", "url": "https://github.com/lwthiker/curl-impersonate"}
                ]
            },
            {
                "title": "Proxy Rotation, IP Reputation & Rate Limiting",
                "topics": [
                    {"title": "Proxy Types: Datacenter vs Residential vs Mobile", "youtube_search_query": "Proxy types datacenter residential mobile proxy rotation scraper", "subtopics": ["Datacenter IP range blocklists", "Residential backconnect proxies", "Sticky session vs per-request rotation"]},
                    {"title": "IP Reputation Scoring & Subnet Tracking", "youtube_search_query": "IP reputation score fraud detection scraper rate limiting", "subtopics": ["ASN reputation metrics", "Subnet-level rate limit triggers", "IP rotation pool sizing"]},
                    {"title": "Adaptive Rate Limiting & Concurrency Pools", "youtube_search_query": "Adaptive rate limiting backoff jitter web scraping Python asyncio", "subtopics": ["Exponential backoff with jitter", "Token bucket rate limiters", "Handling 429 and 503 HTTP status responses"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "An async proxy manager with adaptive concurrency scaling based on HTTP status feedback.",
                    "what_counts_as_evidence": "Python asyncio script managing 50 proxy endpoints, dynamically reducing request rates upon encountering 429 errors.",
                    "eval_criteria": ["Implements randomized jitter during exponential backoff", "Quarantines failing proxy IPs automatically"]
                },
                "resources": [
                    {"title": "Scrapy Framework Documentation", "url": "https://docs.scrapy.org/en/latest/"},
                    {"title": "Privoxy Proxy Manual", "url": "https://www.privoxy.org/user-manual/"}
                ]
            },
            {
                "title": "Headless Browser Automation & Anti-Bot Bypasses",
                "topics": [
                    {"title": "Headless Browser Fingerprints (navigator.webdriver)", "youtube_search_query": "Headless browser detection navigator.webdriver CDP override", "subtopics": ["navigator.webdriver flag detection", "Chrome DevTools Protocol (CDP) overrides", "User-Agent and platform alignment"]},
                    {"title": "Canvas & WebGL Fingerprint Evasion", "youtube_search_query": "Canvas WebGL fingerprinting noise injection stealth Playwright", "subtopics": ["Canvas noise injection scripts", "WebGL renderer string spoofing", "AudioContext fingerprint tampering"]},
                    {"title": "Stealth Automation with Playwright / Undetected-Chromedriver", "youtube_search_query": "Playwright stealth undetected chromedriver bot bypass", "subtopics": ["playwright-stealth plugin integration", "Human cursor movement simulation", "CAPTCHA challenge interaction patterns"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A Playwright Python script configured with stealth overrides that passes CreepJS anti-bot checks.",
                    "what_counts_as_evidence": "Automation log showing successful passage through bot detection test pages without triggering `navigator.webdriver`.",
                    "eval_criteria": ["Overwrites `navigator.webdriver` property cleanly", "Spoofs WebGL vendor and renderer strings"]
                },
                "resources": [
                    {"title": "Playwright Python Documentation", "url": "https://playwright.dev/python/"},
                    {"title": "Undetected ChromeDriver Repository", "url": "https://github.com/ultrafunkamsterdam/undetected-chromedriver"}
                ]
            },
            {
                "title": "Distributed Pipelines & Defensive Countermeasures",
                "topics": [
                    {"title": "Distributed Scraping with Celery & Redis", "youtube_search_query": "Distributed web scraping Celery Redis architecture scaling", "subtopics": ["Task queue partitioning", "Deduplication with Redis Bloom filters", "Distributed result aggregation"]},
                    {"title": "CAPTCHA Solving Integration & Turnstile Protocols", "youtube_search_query": "CAPTCHA solver API integration Turnstile Cloudflare scraper", "subtopics": ["Turnstile and reCAPTCHA v3 tokens", "Token injection into form DOM", "Cost-effective solver API workflow"]},
                    {"title": "Scraping Countermeasures & Defensive Engineering", "youtube_search_query": "Web scraping defenses honeypots obfuscation dynamic rendering", "subtopics": ["Honeypot link injection detection", "DOM class name obfuscation", "Behavioral anomaly detection"]}
                ],
                "proof_of_work_instructions": {
                    "what_to_build": "A distributed scraping architecture using Redis task queues and dynamic deduplication filtering.",
                    "what_counts_as_evidence": "Python system code distributing URL extraction jobs across multiple worker instances with zero duplicate fetches.",
                    "eval_criteria": ["Redis Bloom filter prevents duplicate URL processing", "Worker failure automatically requeues pending tasks"]
                },
                "resources": [
                    {"title": "Robots.txt Specification RFC", "url": "https://datatracker.ietf.org/doc/html/rfc9309"},
                    {"title": "Celery Distributed Task Queue", "url": "https://docs.celeryq.dev/en/stable/"}
                ]
            }
        ]
    }
]

async def seed():
    supabase = get_supabase_client()
    print("Starting batch 4 seeding for 13 courses...")
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
    print(f"Batch 4 Seeding Summary: {len(inserted_records)} / {len(courses_info)} courses inserted.")
    for rec in inserted_records:
        print(f"  - ID: {rec['id']} | Title: {rec['title']}")
    print("============================================================\n")
    return inserted_records

if __name__ == "__main__":
    asyncio.run(seed())
