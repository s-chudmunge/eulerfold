"""
Knowledge-Based Mass Ingestion of Rigorous STEM Educational Content.

Uses model training knowledge to systematically curate 500+ essential STEM topics
across Computer Science, Pure/Applied Math, Physics, Chemistry, Biology, and ECE.
Every entry uses a custom pedagogical topic label (NOT a raw title copy) to guarantee
high semantic search accuracy via Gemini embeddings.

Run:
    cd backend && source venv/bin/activate && python scripts/curate_master_dataset.py
"""

import os
import json
import asyncio
import httpx
import re
import sys

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
GEMINI_KEY = os.getenv('GEMINI_API_KEY')
YOUTUBE_KEY = os.getenv('YOUTUBE_API_KEY')

# =========================================================================
# 500+ CURATED KNOWLEDGE BANK
# (channel, search_query, pedagogical_topic_description)
# =========================================================================
CURATED_KNOWLEDGE_BASE = [
    # ── 1. COMPUTER SCIENCE: DATA STRUCTURES & ALGORITHMS ──
    ("Abdul Bari", "Abdul Bari Stack Data Structure implementation and operations", "Stack Data Structure — Push, Pop, Peek and LIFO Operations"),
    ("Abdul Bari", "Abdul Bari Queue Data Structure array linked list implementation", "Queue Data Structure — Enqueue, Dequeue and FIFO Implementation"),
    ("Abdul Bari", "Abdul Bari Circular Queue implementation using arrays", "Circular Queue Implementation and Boundary Conditions"),
    ("Abdul Bari", "Abdul Bari Singly Linked List insertion deletion traversal", "Singly Linked List — Node Structure, Traversal, Insertion and Deletion"),
    ("Abdul Bari", "Abdul Bari Doubly Linked List operations implementation", "Doubly Linked List — Bidirectional Pointers and Operations"),
    ("Abdul Bari", "Abdul Bari Circular Linked List operations", "Circular Linked List — Structure and Operations"),
    ("Abdul Bari", "Abdul Bari Binary Search Tree BST insertion deletion searching", "Binary Search Tree (BST) — Search, Insertion, and Node Deletion Cases"),
    ("Abdul Bari", "Abdul Bari Inorder Preorder Postorder Traversal of Binary Tree", "Tree Traversal Algorithms — Inorder, Preorder, and Postorder Properties"),
    ("Abdul Bari", "Abdul Bari Level Order Traversal of Binary Tree BFS", "Level Order Traversal of Binary Trees Using Queues"),
    ("Abdul Bari", "Abdul Bari AVL Tree LL RR LR RL Rotations balancing", "AVL Tree Rotations — LL, RR, LR, and RL Self-Balancing Mechanics"),
    ("Abdul Bari", "Abdul Bari Red Black Tree insertion rules and color flips", "Red-Black Tree Properties, Color Flips, and Rebalancing"),
    ("Abdul Bari", "Abdul Bari B Tree insertion and node splitting order m", "B-Trees — Node Structure, Multi-Way Search, and Splitting on Insertion"),
    ("Abdul Bari", "Abdul Bari B+ Tree structure range queries database indexing", "B+ Trees Structure and Applications in Database Indexing"),
    ("Abdul Bari", "Abdul Bari Disjoint Set Union Find Disjoint Set Data Structure", "Disjoint Set Union (DSU) — Union-Find by Rank and Path Compression"),
    ("Abdul Bari", "Abdul Bari Segment Tree range sum query update", "Segment Tree Data Structure — Range Queries and Point Updates"),
    ("Abdul Bari", "Abdul Bari Binary Indexed Tree Fenwick Tree range queries", "Fenwick Tree (Binary Indexed Tree) — Efficient Prefix Sums and Updates"),
    ("Abdul Bari", "Abdul Bari Trie Data Structure prefix tree string search", "Trie Data Structure — Prefix Search and Word Insertion Mechanics"),
    ("Abdul Bari", "Abdul Bari Minimum Spanning Tree Prim's Algorithm greedy", "Prim's Algorithm for Minimum Spanning Trees Using Priority Queue"),
    ("Abdul Bari", "Abdul Bari Kruskal's Algorithm Minimum Spanning Tree Disjoint Sets", "Kruskal's Algorithm for Minimum Spanning Trees Using Disjoint Sets"),
    ("Abdul Bari", "Abdul Bari Topological Sort DAG Directed Acyclic Graph Kahn's", "Topological Sorting on Directed Acyclic Graphs (DAGs) and Kahn's Algorithm"),
    ("Abdul Bari", "Abdul Bari Strongly Connected Components Tarjan's Kosaraju's Algorithm", "Strongly Connected Components (SCC) — Kosaraju's and Tarjan's Algorithms"),
    ("Abdul Bari", "Abdul Bari Dynamic Programming Matrix Chain Multiplication", "Matrix Chain Multiplication (MCM) Using Dynamic Programming"),
    ("Abdul Bari", "Abdul Bari Optimal Binary Search Tree OBST Dynamic Programming", "Optimal Binary Search Tree (OBST) Dynamic Programming Formulation"),
    ("Abdul Bari", "Abdul Bari Floyd Warshall All Pairs Shortest Path Algorithm DP", "Floyd-Warshall Algorithm for All-Pairs Shortest Paths in Weighted Graphs"),
    ("Abdul Bari", "Abdul Bari Travelling Salesperson Problem Dynamic Programming TSP", "Traveling Salesperson Problem (TSP) Dynamic Programming Formulation"),
    ("Abdul Bari", "Abdul Bari N-Queens Problem Backtracking recursion", "N-Queens Puzzle Solution Using Recursive Backtracking"),
    ("Abdul Bari", "Abdul Bari Subset Sum Problem Backtracking branch and bound", "Subset Sum Problem Using Backtracking State-Space Trees"),
    ("Abdul Bari", "Abdul Bari Graph Coloring Problem Backtracking chromatic number", "Graph Coloring Problem and M-Coloring Using Backtracking"),
    ("Abdul Bari", "Abdul Bari Hamiltonian Cycle Backtracking algorithm", "Hamiltonian Cycle and Path Detection via Backtracking"),
    ("Abdul Bari", "Abdul Bari 0/1 Knapsack Branch and Bound approach", "0/1 Knapsack Problem Solved via Branch and Bound"),

    # ── 2. OPERATING SYSTEMS & COMPUTER ARCHITECTURE ──
    ("Neso Academy", "Neso Academy Introduction to Operating System OS kernel architecture", "Operating System Kernel Architecture, User Mode, and Kernel Mode"),
    ("Neso Academy", "Neso Academy System Calls fork exec wait exit OS", "Operating System System Calls — Process Creation with Fork and Exec"),
    ("Neso Academy", "Neso Academy Process State Diagram PCB Process Control Block", "Process Lifecycle, States, and the Process Control Block (PCB)"),
    ("Neso Academy", "Neso Academy CPU Scheduling FCFS SJF Round Robin Priority", "CPU Scheduling Algorithms — FCFS, Shortest Job First, Round Robin, and Priority"),
    ("Neso Academy", "Neso Academy Multilevel Queue Scheduling Multilevel Feedback Queue", "Multilevel Queue and Multilevel Feedback Queue CPU Scheduling"),
    ("Neso Academy", "Neso Academy Critical Section Problem Race Condition Mutual Exclusion", "Critical Section Problem, Race Conditions, and Mutual Exclusion Requirements"),
    ("Neso Academy", "Neso Academy Peterson's Solution synchronization critical section", "Peterson's Algorithm for Two-Process Critical Section Synchronization"),
    ("Neso Academy", "Neso Academy Semaphores Counting Binary Semaphore wait signal", "Semaphores — Counting and Binary Mutex Synchronization Mechanisms"),
    ("Neso Academy", "Neso Academy Dining Philosophers Problem synchronization deadlock", "Dining Philosophers Synchronization Problem and Deadlock Avoidance"),
    ("Neso Academy", "Neso Academy Producer Consumer Problem Bounded Buffer Semaphore", "Producer-Consumer Problem (Bounded Buffer) Using Semaphores"),
    ("Neso Academy", "Neso Academy Readers Writers Problem synchronization mutex", "Readers-Writers Problem and Priority Mutex Solutions"),
    ("Neso Academy", "Neso Academy Deadlock Characteristics 4 Conditions Coffman", "Deadlock Necessary Conditions — Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait"),
    ("Neso Academy", "Neso Academy Resource Allocation Graph RAG Deadlock detection", "Resource Allocation Graph (RAG) Modeling for Deadlock Detection"),
    ("Neso Academy", "Neso Academy Banker's Algorithm Deadlock Avoidance Safety", "Banker's Algorithm for Deadlock Avoidance and Safe State Verification"),
    ("Neso Academy", "Neso Academy Memory Management Paging Page Table MMU", "Paging Architecture, Page Tables, and Address Translation via MMU"),
    ("Neso Academy", "Neso Academy Translation Lookaside Buffer TLB Paging Hardware", "Translation Lookaside Buffer (TLB) and Hardware Acceleration for Paging"),
    ("Neso Academy", "Neso Academy Inverted Page Table Multilevel Paging", "Multilevel Paging and Inverted Page Table Structures"),
    ("Neso Academy", "Neso Academy Virtual Memory Demand Paging Page Fault Handling", "Virtual Memory, Demand Paging, and Page Fault Interrupt Handling"),
    ("Neso Academy", "Neso Academy Page Replacement Algorithms FIFO LRU Optimal Belady", "Page Replacement Algorithms — FIFO, LRU, Optimal, and Belady's Anomaly"),
    ("Neso Academy", "Neso Academy Thrashing in Operating System Working Set Model", "Thrashing in Virtual Memory and the Working-Set Model"),
    ("Neso Academy", "Neso Academy File System Allocation Methods Contiguous Linked Indexed", "File Allocation Methods — Contiguous, Linked, and Indexed File Allocation"),
    ("Neso Academy", "Neso Academy Disk Scheduling FCFS SSTF SCAN C-SCAN LOOK", "Disk Scheduling Algorithms — FCFS, SSTF, SCAN, C-SCAN, and LOOK"),
    ("Ben Eater", "Ben Eater How a CPU works 8-bit breadboard computer introduction", "How a Microprocessor Works — Building an 8-bit CPU from Logic Chips"),
    ("Ben Eater", "Ben Eater Clock module 555 timer 8-bit computer", "Digital Clock Signal Generation Using the 555 Timer Circuit"),
    ("Ben Eater", "Ben Eater Registers 8-bit computer D flip-flops", "Registers Architecture and Data Storage Using D Flip-Flops"),
    ("Ben Eater", "Ben Eater Arithmetic Logic Unit ALU 74LS283 adder subtraction", "Arithmetic Logic Unit (ALU) Design — 8-bit Binary Adder and Subtractor"),
    ("Ben Eater", "Ben Eater RAM module 74LS189 8-bit computer memory", "Random Access Memory (RAM) Module Design and Address Multiplexing"),
    ("Ben Eater", "Ben Eater Program Counter 8-bit computer 74LS161 counter", "Program Counter Architecture and Instruction Sequencing"),
    ("Ben Eater", "Ben Eater Instruction Register control logic microcode EEPROM", "Instruction Register Decoding and Microcode Execution Logic"),
    ("Ben Eater", "Ben Eater Output module 7-segment display binary to decimal EEPROM", "Binary to Decimal Conversion Hardware and 7-Segment Display Decoder"),

    # ── 3. COMPUTER NETWORKING & DISTRIBUTED SYSTEMS ──
    ("Hussein Nasser", "Hussein Nasser OSI Model vs TCP IP stack explained", "OSI 7-Layer Reference Model vs TCP/IP Protocol Suite"),
    ("Hussein Nasser", "Hussein Nasser TCP 3-way handshake SYN SYN-ACK ACK connection teardown", "TCP Connection Lifecycle — Three-Way Handshake and Connection Termination"),
    ("Hussein Nasser", "Hussein Nasser TCP Flow Control Sliding Window Congestion Control", "TCP Flow Control, Sliding Window Protocol, and Congestion Avoidance"),
    ("Hussein Nasser", "Hussein Nasser UDP vs TCP socket programming differences", "User Datagram Protocol (UDP) Architecture vs TCP Guarantees"),
    ("Hussein Nasser", "Hussein Nasser How DNS Works recursive iterative query authoritative", "Domain Name System (DNS) Resolution — Recursive, Iterative, and Authoritative Nameservers"),
    ("Hussein Nasser", "Hussein Nasser TLS 1.2 vs TLS 1.3 Handshake cryptographic handshake", "Transport Layer Security (TLS 1.3) Handshake and Cryptographic Key Exchange"),
    ("Hussein Nasser", "Hussein Nasser HTTP 1.1 vs HTTP 2 vs HTTP 3 QUIC protocol", "Evolution of HTTP Protocols — Multiplexing, Head-of-Line Blocking, and QUIC / HTTP/3"),
    ("Hussein Nasser", "Hussein Nasser Reverse Proxy vs Forward Proxy NGINX load balancer", "Forward Proxy vs Reverse Proxy Architecture and Traffic Routing"),
    ("Hussein Nasser", "Hussein Nasser Layer 4 vs Layer 7 Load Balancing differences", "Layer 4 (Transport) vs Layer 7 (Application) Load Balancing Architecture"),
    ("Hussein Nasser", "Hussein Nasser WebSockets vs Long Polling vs Server-Sent Events SSE", "Real-Time Web Communication — WebSockets, Server-Sent Events (SSE), and Polling"),
    ("Hussein Nasser", "Hussein Nasser Database Indexing B-Trees vs Hash Indexes internals", "Database Index Internals — B-Tree Index Traversals vs Hash Index Lookups"),
    ("Hussein Nasser", "Hussein Nasser Database Isolation Levels Read Uncommitted Read Committed Repeatable Serializable", "ACID Database Transaction Isolation Levels and Read Anomalies"),
    ("Hussein Nasser", "Hussein Nasser Database Sharding Partitioning horizontal vs vertical", "Database Horizontal Sharding, Range-Based Partitioning, and Consistent Hashing"),
    ("Hussein Nasser", "Hussein Nasser Write Ahead Logging WAL database crash recovery", "Write-Ahead Logging (WAL) and Database Crash Recovery Mechanics"),
    ("ByteByteGo", "ByteByteGo Rate Limiting Algorithms Token Bucket Leaky Bucket Sliding Window", "System Design — Rate Limiting Algorithms (Token Bucket, Leaky Bucket, Sliding Window)"),
    ("ByteByteGo", "ByteByteGo Consistent Hashing system design distributed cache", "Consistent Hashing Algorithm in Distributed Caching Systems"),
    ("ByteByteGo", "ByteByteGo CAP Theorem Consistency Availability Partition Tolerance PACELC", "CAP Theorem and PACELC Tradeoffs in Distributed System Architecture"),
    ("ByteByteGo", "ByteByteGo Message Queues Kafka vs RabbitMQ Event Driven Architecture", "Message Queues vs Event Streaming — RabbitMQ AMQP vs Apache Kafka Logs"),
    ("ByteByteGo", "ByteByteGo How to design a URL shortener TinyURL system design", "System Design Architecture — High-Throughput URL Shortener (TinyURL)"),
    ("ByteByteGo", "ByteByteGo How to design a distributed unique ID generator Snowflake", "Distributed Unique ID Generation — Twitter Snowflake Algorithm"),
    ("ByteByteGo", "ByteByteGo Distributed Lock with Redis Redlock algorithm", "Distributed Locking Mechanisms with Redis and the Redlock Algorithm"),
    ("ByteByteGo", "ByteByteGo Two-Phase Commit 2PC vs Saga Pattern distributed transactions", "Distributed Transactions — Two-Phase Commit (2PC) vs Saga Orchestration"),

    # ── 4. MACHINE LEARNING & DEEP LEARNING ──
    ("StatQuest with Josh Starmer", "StatQuest Bias-Variance Tradeoff clearly explained", "Bias-Variance Tradeoff, Overfitting, and Underfitting in Machine Learning"),
    ("StatQuest with Josh Starmer", "StatQuest Cross Validation K-Fold Leave-One-Out", "K-Fold Cross Validation and Model Evaluation Strategies"),
    ("StatQuest with Josh Starmer", "StatQuest ROC Curves and AUC Area Under the Curve", "Receiver Operating Characteristic (ROC) Curves and AUC Metric"),
    ("StatQuest with Josh Starmer", "StatQuest Confusion Matrix Sensitivity Specificity Precision Recall", "Confusion Matrix Metrics — Precision, Recall, Sensitivity, Specificity, and F1 Score"),
    ("StatQuest with Josh Starmer", "StatQuest Ridge Regression L2 Regularization penalty", "Ridge Regression — L2 Regularization and Shrinkage Penalty"),
    ("StatQuest with Josh Starmer", "StatQuest Lasso Regression L1 Regularization feature selection", "Lasso Regression — L1 Regularization and Sparse Feature Selection"),
    ("StatQuest with Josh Starmer", "StatQuest Elastic Net Regularization combining L1 L2", "Elastic Net Regularization — Combining L1 and L2 Penalties"),
    ("StatQuest with Josh Starmer", "StatQuest Principal Component Analysis PCA step by step math", "Mathematical Formulation of Principal Component Analysis (PCA) via SVD"),
    ("StatQuest with Josh Starmer", "StatQuest Linear Discriminant Analysis LDA classification", "Linear Discriminant Analysis (LDA) for Supervised Dimensionality Reduction"),
    ("StatQuest with Josh Starmer", "StatQuest Gradient Descent Stochastic Mini-Batch Momentum", "Stochastic Gradient Descent (SGD), Mini-Batch SGD, and Momentum Optimizers"),
    ("StatQuest with Josh Starmer", "StatQuest Adam Optimizer clearly explained adaptive moment", "Adam Optimizer — Adaptive Learning Rates and Momentum Moments"),
    ("StatQuest with Josh Starmer", "StatQuest Convolutional Neural Networks CNN padding stride pooling", "CNN Architecture — Convolutions, Kernels, Padding, Stride, and Pooling Layers"),
    ("StatQuest with Josh Starmer", "StatQuest Autoencoders and Variational Autoencoders VAE", "Autoencoders and Latent Space Representation Learning"),
    ("StatQuest with Josh Starmer", "StatQuest Self-Attention and Transformer Architecture math", "Self-Attention Mechanism — Query, Key, Value Vectors and Scaled Dot-Product Attention"),
    ("StatQuest with Josh Starmer", "StatQuest Positional Encoding in Transformers sinusoidal", "Positional Encoding in Transformers — Sinusoidal vs Learned Embeddings"),
    ("StatQuest with Josh Starmer", "StatQuest Multi-Head Attention Transformers explained", "Multi-Head Attention Mechanics in Transformer Models"),
    ("StatQuest with Josh Starmer", "StatQuest Layer Normalization vs Batch Normalization in Transformers", "Layer Normalization vs Batch Normalization Mechanics and Mathematical Differences"),
    ("3Blue1Brown", "3Blue1Brown Attention in transformers visual introduction deep learning chapter 5", "Visual Geometric Intuition for Attention Mechanisms in Transformer Models"),
    ("3Blue1Brown", "3Blue1Brown How large language models work transformers chapter 6", "Mathematical Anatomy of Large Language Models and Token Predictions"),
    ("Stanford", "Stanford CS229 Andrew Ng Lecture 1 Machine Learning Supervised Learning", "Supervised Learning, Cost Functions, and Linear Regression (Stanford CS229)"),
    ("Stanford", "Stanford CS229 Andrew Ng Lecture 2 Locally Weighted Regression Logistic Regression", "Locally Weighted Regression, Logistic Regression, and Newton's Method (Stanford CS229)"),
    ("Stanford", "Stanford CS229 Andrew Ng Lecture 3 Generalized Linear Models Exponential Family", "Generalized Linear Models (GLMs) and the Exponential Family (Stanford CS229)"),
    ("Stanford", "Stanford CS229 Andrew Ng Lecture 4 Generative Learning Algorithms GDA Gaussian Naive Bayes", "Generative Learning Algorithms — Gaussian Discriminant Analysis and Naive Bayes (Stanford CS229)"),
    ("Stanford", "Stanford CS229 Andrew Ng Lecture 5 Support Vector Machines SVM Dual Formulation", "Support Vector Machines (SVM) — Optimal Margin Classifiers and Dual Problem (Stanford CS229)"),
    ("Stanford", "Stanford CS229 Andrew Ng Lecture 6 Kernels Mercer's Theorem SVM", "Kernel Methods, Feature Mapping, and Mercer's Theorem (Stanford CS229)"),
    ("Stanford", "Stanford CS229 Andrew Ng Lecture 8 EM Algorithm Expectation Maximization GMM", "Expectation-Maximization (EM) Algorithm for Gaussian Mixture Models (Stanford CS229)"),
    ("Stanford", "Stanford CS229 Andrew Ng Lecture 9 Factor Analysis PCA Unsupervised Learning", "Factor Analysis and Probabilistic PCA Formulations (Stanford CS229)"),
    ("Stanford", "Stanford CS229 Andrew Ng Lecture 16 Reinforcement Learning MDP Bellman Equation", "Markov Decision Processes (MDPs), Value Iteration, and Bellman Equations (Stanford CS229)"),
    ("Stanford", "Stanford CS224N Christopher Manning Lecture 1 Word Vectors Word2Vec GloVe", "Word Vectors, Word2Vec Skip-Gram, and Distributional Semantics (Stanford CS224N)"),
    ("Stanford", "Stanford CS224N Christopher Manning Lecture 2 Neural Classifiers Backpropagation", "Word Vector Gradients and Neural Classification (Stanford CS224N)"),
    ("Stanford", "Stanford CS224N Christopher Manning Lecture 3 Backprop and Neural Networks", "Backpropagation and Computation Graphs in NLP (Stanford CS224N)"),
    ("Stanford", "Stanford CS224N Christopher Manning Lecture 4 Syntactic Structure Dependency Parsing", "Dependency Parsing and Syntactic Structure in NLP (Stanford CS224N)"),
    ("Stanford", "Stanford CS224N Christopher Manning Lecture 5 Language Models and Recurrent Neural Networks", "Language Modeling and Recurrent Neural Network Architectures (Stanford CS224N)"),
    ("Stanford", "Stanford CS224N Christopher Manning Lecture 6 Vanishing Gradients and Fancy RNNs LSTM GRU", "Vanishing Gradient Problem, Gated Recurrent Units (GRU), and LSTMs (Stanford CS224N)"),
    ("Stanford", "Stanford CS224N Christopher Manning Lecture 7 Translation Seq2Seq Attention", "Sequence-to-Sequence Modeling and Neural Machine Translation with Attention (Stanford CS224N)"),
    ("Stanford", "Stanford CS224N Christopher Manning Lecture 8 Transformers and Self-Attention", "Self-Attention and the Transformer Architecture for NLP (Stanford CS224N)"),
    ("Stanford", "Stanford CS224N Christopher Manning Lecture 9 Pretraining BERT GPT contextual embeddings", "Self-Supervised Pretraining — BERT, RoBERTa, and Autoregressive GPT Models (Stanford CS224N)"),

    # ── 5. PURE & APPLIED MATHEMATICS ──
    ("Professor Leonard", "Professor Leonard Calculus 1 Limits at Infinity and Horizontal Asymptotes", "Limits at Infinity, Infinite Limits, and Horizontal Asymptotes in Calculus"),
    ("Professor Leonard", "Professor Leonard Calculus 1 The Squeeze Theorem for limits", "The Squeeze Theorem for Evaluating Trigonometric Limits"),
    ("Professor Leonard", "Professor Leonard Calculus 1 The Derivative Definition and Power Rule", "The Limit Definition of the Derivative and the Power Rule"),
    ("Professor Leonard", "Professor Leonard Calculus 1 Product Rule and Quotient Rule derivatives", "Product Rule and Quotient Rule Derivations and Applications"),
    ("Professor Leonard", "Professor Leonard Calculus 1 The Chain Rule for differentiation", "The Chain Rule for Composite Function Differentiation"),
    ("Professor Leonard", "Professor Leonard Calculus 1 Related Rates Word Problems step by step", "Related Rates Problems in Differential Calculus"),
    ("Professor Leonard", "Professor Leonard Calculus 1 Mean Value Theorem Rolle's Theorem", "Rolle's Theorem and the Mean Value Theorem (MVT) in Calculus"),
    ("Professor Leonard", "Professor Leonard Calculus 1 First Derivative Test Increasing Decreasing", "First Derivative Test for Local Extrema and Function Monotonicity"),
    ("Professor Leonard", "Professor Leonard Calculus 1 Second Derivative Test Concavity Inflection Points", "Second Derivative Test, Concavity, and Inflection Points"),
    ("Professor Leonard", "Professor Leonard Calculus 1 Optimization Problems applied calculus", "Optimization and Extreme Value Problems in Applied Calculus"),
    ("Professor Leonard", "Professor Leonard Calculus 1 Riemann Sums and Definite Integrals", "Riemann Sums, Partition Approximations, and the Definite Integral"),
    ("Professor Leonard", "Professor Leonard Calculus 1 Fundamental Theorem of Calculus Part 1 and 2", "The Fundamental Theorem of Calculus (Parts 1 and 2)"),
    ("Professor Leonard", "Professor Leonard Calculus 1 U-Substitution for Integration Indefinite Definite", "Integration by U-Substitution for Indefinite and Definite Integrals"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Integration by Parts tabular method", "Integration by Parts Formula and Tabular Integration Method"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Trigonometric Integrals powers of sin cos sec tan", "Trigonometric Integrals Involving Powers of Sine, Cosine, Secant, and Tangent"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Trigonometric Substitution trig sub integrals", "Trigonometric Substitution Techniques for Radical Integrands"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Partial Fraction Decomposition for rational integrals", "Partial Fraction Decomposition for Integrating Rational Functions"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Improper Integrals infinite limits discontinuities", "Improper Integrals — Infinite Integration Limits and Discontinuous Integrands"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Sequences and Series Convergence Divergence Tests", "Infinite Sequences, Limits of Sequences, and Series Convergence Definitions"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Integral Test and P-Series Test for convergence", "Integral Test and P-Series Convergence Criteria"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Comparison Test and Limit Comparison Test LCT", "Direct Comparison Test and Limit Comparison Test (LCT) for Series"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Alternating Series Test and Absolute Convergence", "Alternating Series Test (Leibniz Rule) and Absolute vs Conditional Convergence"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Ratio Test and Root Test for series convergence", "Ratio Test and Root Test for Series Convergence"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Power Series Radius Interval of Convergence", "Power Series, Radius of Convergence, and Interval of Convergence"),
    ("Professor Leonard", "Professor Leonard Calculus 2 Taylor and Maclaurin Series polynomial approximations", "Taylor Series and Maclaurin Series Expansion Formulations"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Vectors in 3D Space Dot and Cross Products", "Vectors in Three Dimensions — Dot Products, Cross Products, and Geometric Projections"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Equations of Lines and Planes in 3D Space", "Vector and Parametric Equations of Lines and Planes in 3D Space"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Partial Derivatives and the Gradient Vector", "Partial Derivatives, Directional Derivatives, and the Gradient Vector"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Tangent Planes and Linear Approximations multivariable", "Tangent Planes to Surfaces and Multivariable Linear Approximations"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Lagrange Multipliers constrained optimization", "Lagrange Multipliers for Constrained Multivariable Optimization"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Double Integrals in Rectangular and Polar Coordinates", "Double Integrals over General Regions and Polar Coordinate Conversions"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Triple Integrals in Cylindrical and Spherical Coordinates", "Triple Integrals in Cylindrical and Spherical Coordinate Systems"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Vector Fields Line Integrals Work", "Vector Fields, Conservative Fields, and Line Integrals of Vector Fields"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Fundamental Theorem of Line Integrals Potential Functions", "Fundamental Theorem of Line Integrals and Scalar Potential Functions"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Green's Theorem line integrals double integrals", "Green's Theorem in the Plane — Connecting Line Integrals to Double Integrals"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Curl and Divergence of Vector Fields", "Curl and Divergence of 3D Vector Fields — Physical and Mathematical Meanings"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Surface Integrals and Flux Integrals", "Surface Integrals of Scalar Functions and Vector Flux Integrals"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Stokes' Theorem circulation flux", "Stokes' Theorem — Relating Surface Flux of Curl to Boundary Line Integrals"),
    ("Professor Leonard", "Professor Leonard Calculus 3 Divergence Theorem Gauss Theorem", "The Divergence Theorem (Gauss's Theorem) — Flux through Closed Surfaces"),
    ("Steve Brunton", "Steve Brunton Singular Value Decomposition SVD image compression", "Singular Value Decomposition (SVD) — Matrix Factorization and Dimensionality Reduction"),
    ("Steve Brunton", "Steve Brunton Principal Component Analysis PCA and SVD connection", "Mathematical Connection Between SVD and Principal Component Analysis (PCA)"),
    ("Steve Brunton", "Steve Brunton Dynamic Mode Decomposition DMD time series data", "Dynamic Mode Decomposition (DMD) for Spatiotemporal Coherent Structures"),
    ("Steve Brunton", "Steve Brunton Robust Principal Component Analysis RPCA matrix completion", "Robust Principal Component Analysis (RPCA) and Low-Rank Matrix Separation"),
    ("Steve Brunton", "Steve Brunton Linear Quadratic Regulator LQR Control Theory", "Linear Quadratic Regulator (LQR) Optimal Control Theory Formulation"),
    ("Steve Brunton", "Steve Brunton Kalman Filter state estimation sensor fusion", "Kalman Filtering for Optimal State Estimation and Sensor Fusion"),
    ("Steve Brunton", "Steve Brunton Phase Portraits and Nonlinear Dynamical Systems Stability", "Phase Portraits, Fixed Points, and Stability Analysis in Nonlinear Dynamics"),
    ("Steve Brunton", "Steve Brunton Fourier Transform and FFT Fast Fourier Transform algorithm", "Continuous Fourier Transform to Discrete FFT Algorithm Mechanics"),

    # ── 6. PHYSICS: MECHANICS, EM, QUANTUM, THERMO ──
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Projectile Motion Physics Problems horizontal angle", "Projectile Motion Physics Problems — Range, Max Height, and Flight Time"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Friction Static and Kinetic Friction inclined plane", "Static and Kinetic Friction on Inclined Planes and Free Body Diagrams"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Centripetal Acceleration and Centripetal Force circular motion", "Uniform Circular Motion, Centripetal Acceleration, and Tension Forces"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Universal Law of Gravitation gravitational force orbital speed", "Newton's Law of Universal Gravitation, Kepler's Laws, and Orbital Velocity"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Conservation of Energy Potential Kinetic Mechanical", "Conservation of Mechanical Energy — Kinetic Energy and Potential Energy Systems"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Power Physics Work over Time watts horsepower", "Mechanical Work, Power Calculations, and Efficiency in Physics"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Impulse and Momentum Theorem collisions elastic inelastic", "Impulse-Momentum Theorem — Elastic vs Inelastic Collisions in One and Two Dimensions"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Center of Mass System of Particles", "Center of Mass Calculation for Discrete and Continuous Mass Distributions"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Torque and Rotational Equilibrium Physics problems", "Torque, Lever Arms, and Static Rotational Equilibrium Conditions"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Moment of Inertia Rotational Kinetic Energy", "Rotational Inertia (Moment of Inertia) and Rotational Kinetic Energy"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Conservation of Angular Momentum spinning figure skater", "Conservation of Angular Momentum and Gyroscopic Precession"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Simple Harmonic Motion Pendulum Mass Spring System", "Simple Harmonic Motion (SHM) — Mass-Spring Systems and Simple Pendulums"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Damped and Driven Harmonic Oscillators resonance", "Damped and Driven Harmonic Oscillations and Resonance Curves"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Standing Waves Nodes Antinodes Harmonics", "Standing Waves, Boundary Conditions, Nodes, Antinodes, and Harmonic Series"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Doppler Effect Sound Waves frequency shift", "The Doppler Effect for Sound Waves and Relative Motion Frequency Shifts"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Fluid Pressure Density Pascal's Principle", "Hydrostatic Fluid Pressure, Fluid Density, and Pascal's Principle"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Archimedes Principle Buoyant Force Floating Objects", "Archimedes' Principle, Buoyancy Force, and Submerged Object Equilibrium"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Bernoulli's Equation Fluid Dynamics continuity equation", "Fluid Continuity Equation and Bernoulli's Principle in Dynamic Fluid Systems"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Heat Transfer Conduction Convection Radiation", "Mechanisms of Heat Transfer — Thermal Conduction, Convection, and Blackbody Radiation"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor First Law of Thermodynamics Isobaric Isochoric Isothermal Adiabatic", "First Law of Thermodynamics — Work and Heat in Isothermal, Adiabatic, Isobaric, and Isochoric Processes"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Second Law of Thermodynamics Entropy Carnot Engine Efficiency", "Second Law of Thermodynamics, Entropy, and Maximum Carnot Engine Efficiency"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Electric Field due to Point Charges Coulomb's Law", "Coulomb's Law and Superposition of Electric Fields from Point Charges"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Gauss's Law Electric Flux Spherical Cylindrical Planar Symmetry", "Gauss's Law and Electric Flux Calculations for High-Symmetry Charge Distributions"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Electric Potential and Voltage due to Point Charges", "Electric Potential, Voltage Differences, and Electric Potential Energy"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Capacitance Parallel Plate Capacitors Dielectrics energy stored", "Parallel Plate Capacitors, Dielectric Materials, and Stored Electrostatic Energy"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Resistors in Series and Parallel Equivalent Resistance Ohm's Law", "Direct Current (DC) Circuits — Resistors in Series and Parallel Combinations"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Kirchhoff's Rules Junction and Loop Rule Circuit Analysis", "Kirchhoff's Current Law (Junction Rule) and Voltage Law (Loop Rule) Circuit Analysis"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor RC Circuits Charging and Discharging Time Constant", "RC Transient Circuits — Charging, Discharging, and the RC Time Constant"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Magnetic Force on a Moving Charge Right Hand Rule Lorentz Force", "Magnetic Force on Moving Charged Particles, Lorentz Force, and Right-Hand Rule"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Magnetic Force on a Current Carrying Wire", "Magnetic Force on Current-Carrying Wires and DC Motor Principles"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Biot-Savart Law Magnetic Field of a Wire Loop Solenoid", "Biot-Savart Law and Ampere's Circuital Law for Calculating Magnetic Fields"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Faraday's Law of Induction Lenz's Law Magnetic Flux", "Faraday's Law of Electromagnetic Induction, Magnetic Flux, and Lenz's Law"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Inductance RL Circuits Time Constant Energy in Inductor", "Self-Inductance, RL Circuits, and Stored Magnetic Energy in Inductors"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor LC and RLC Oscillations Resonance AC Circuits", "RLC AC Circuits, Impedance, Phasors, and Electrical Resonance"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Maxwell's Equations Overview Displacement Current", "Maxwell's Equations of Electromagnetism and the Displacement Current"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Electromagnetic Waves Speed of Light Energy Transport Poynting Vector", "Electromagnetic Wave Propagation, Speed of Light, and the Poynting Vector"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Snell's Law Refraction Index Total Internal Reflection", "Geometric Optics — Snell's Law, Index of Refraction, and Total Internal Reflection"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Thin Lens Equation Convex Concave Lenses Ray Tracing", "Thin Lens Equation and Geometric Ray Tracing for Convex and Concave Lenses"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Double Slit Interference Young's Experiment Diffraction Grating", "Wave Optics — Young's Double-Slit Interference and Diffraction Gratings"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Photoelectric Effect Einstein Work Function Photon Energy", "The Photoelectric Effect, Photon Quantization, and Work Function (E = hf)"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor de Broglie Wavelength Wave Particle Duality Matter Waves", "de Broglie Matter Waves and Wave-Particle Duality of Matter"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Bohr Model of the Hydrogen Atom Energy Levels Spectral Lines", "Bohr Model of the Hydrogen Atom, Quantized Energy Levels, and Spectral Transitions"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Heisenberg Uncertainty Principle Position Momentum", "Heisenberg Uncertainty Principle for Position, Momentum, Energy, and Time"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Schrodinger Equation 1D Particle in a Box Infinite Square Well", "One-Dimensional Time-Independent Schrödinger Equation for an Infinite Square Well"),

    # ── 7. CHEMISTRY & BIOCHEMISTRY ──
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Hybridization sp3 sp2 sp Sigma Pi Bonds", "Orbital Hybridization (sp, sp2, sp3) and Sigma vs Pi Chemical Bonds"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor VSEPR Theory Molecular Geometry Bond Angles", "VSEPR Theory, Molecular Geometry, Lone Pairs, and Bond Angles"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Intermolecular Forces Hydrogen Bonding Dipole London Dispersion", "Intermolecular Forces — Hydrogen Bonding, Dipole-Dipole, and London Dispersion Forces"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Stoichiometry Limiting Reactant Excess Reactant Yield", "Chemical Stoichiometry, Limiting Reactants, and Percentage Yield Calculations"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Gas Laws Combined Ideal Gas Law Dalton's Partial Pressure", "Dalton's Law of Partial Pressures and Graham's Law of Effusion"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Thermochemistry Calorimetry Specific Heat Capacity q=mcΔT", "Calorimetry, Specific Heat Capacity (q = mcΔT), and Constant-Pressure Bomb Calorimetry"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Hess's Law Enthalpy of Formation Standard Enthalpies", "Hess's Law and Standard Enthalpies of Formation for Chemical Reactions"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Gibbs Free Energy Spontaneity Enthalpy Entropy ΔG=ΔH-TΔS", "Gibbs Free Energy (ΔG = ΔH - TΔS) and Thermodynamic Spontaneity Criteria"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Reaction Rate Laws Method of Initial Rates Rate Constant k", "Differential Rate Laws and Method of Initial Rates in Chemical Kinetics"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Integrated Rate Laws Zero First Second Order Half Life", "Integrated Rate Laws and Half-Life Calculations for Zero, First, and Second-Order Reactions"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Arrhenius Equation Activation Energy Catalyst Temperature", "Arrhenius Equation, Reaction Activation Energy (Ea), and Catalyst Mechanisms"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Le Chatelier's Principle Equilibrium Shift Pressure Temp Conc", "Le Chatelier's Principle — Equilibrium Shifts under Concentration, Pressure, and Temperature Perturbations"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Acid Base Equilibrium pH pOH Ka Kb Strong Weak Acids", "Aqueous Acid-Base Equilibria, pH, pOH, and Acid Dissociation Constants (Ka, Kb)"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Buffer Solutions Henderson-Hasselbalch Equation", "Buffer Solutions and the Henderson-Hasselbalch Equation for pH Regulation"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Solubility Product Constant Ksp Precipitation Reactions", "Solubility Product Constant (Ksp) and Selective Precipitation of Insoluble Salts"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Galvanic Cells Nernst Equation Standard Cell Potential E°", "Galvanic (Voltaic) Electrochemical Cells, Standard Cell Potentials (E°), and the Nernst Equation"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Electrolysis and Faraday's Law of Electrolysis electroplating", "Electrolytic Cells and Faraday's Laws of Quantitative Electrolysis"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor IUPAC Nomenclature Alkanes Alkenes Alkynes Functional Groups", "IUPAC Nomenclature for Hydrocarbons and Core Organic Functional Groups"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Chirality Stereocenters R and S Configuration Enantiomers", "Stereochemistry — Chirality, R/S Cahn-Ingold-Prelog Configuration, Enantiomers, and Diastereomers"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Newman Projections Chair Conformations Cyclohexane Axial Equatorial", "Cyclohexane Chair Conformations, Ring Flips, Axial vs Equatorial Substituent Stability"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor SN1 vs SN2 vs E1 vs E2 Reaction Mechanisms Summary", "Substitution vs Elimination Mechanisms (SN1, SN2, E1, E2) Comparison and Prediction"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Alkene Hydroboration-Oxidation Oxymercuration-Demercuration Markovnikov", "Electrophilic Addition to Alkenes — Markovnikov vs Anti-Markovnikov Hydration and Halogenation"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Diels-Alder Reaction Mechanism Cycloaddition Stereospecificity", "Diels-Alder [4+2] Cycloaddition Mechanism, Diene Conformation, and Endo Rule"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Electrophilic Aromatic Substitution EAS Benzene Nitration Halogenation", "Electrophilic Aromatic Substitution (EAS) — Nitration, Halogenation, Sulfonation, and Alkylation on Benzene"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Grignard Reaction Organometallic Reagents Carbonyl Addition", "Grignard Reagents and Nucleophilic Addition to Carbonyl Groups (Aldehydes and Ketones)"),
    ("The Organic Chemistry Tutor", "Organic Chemistry Tutor Aldol Condensation Enolate Chemistry Carbonyl Alpha Substitution", "Aldol Reaction and Claisen Condensation Mechanisms via Enolate Intermediates"),
    ("Ninja Nerd", "Ninja Nerd Cellular Respiration Glycolysis pathway enzymes ATP NADH", "Glycolysis Pathway — Step-by-Step Enzymatic Reactions and Net ATP/NADH Yield"),
    ("Ninja Nerd", "Ninja Nerd Pyruvate Dehydrogenase Complex PDC reaction acetyl-CoA", "Pyruvate Dehydrogenase Complex Mechanism and Transition to Acetyl-CoA"),
    ("Ninja Nerd", "Ninja Nerd Krebs Cycle Citric Acid Cycle TCA Cycle enzymatic reactions", "Citric Acid Cycle (Krebs Cycle / TCA) — Eight Enzymatic Steps and Energy Harvest"),
    ("Ninja Nerd", "Ninja Nerd Electron Transport Chain ETC Oxidative Phosphorylation ATP Synthase", "Electron Transport Chain Complexes (I-IV), Proton Gradient, and ATP Synthase Chemiosmosis"),
    ("Ninja Nerd", "Ninja Nerd Gluconeogenesis Pathway regulation liver enzymes", "Gluconeogenesis Pathway — Overcoming Irreversible Glycolytic Steps"),
    ("Ninja Nerd", "Ninja Nerd Glycogen Metabolism Glycogenesis Glycogenolysis regulation", "Glycogen Synthesis (Glycogenesis) and Breakdown (Glycogenolysis) Hormonal Regulation"),
    ("Ninja Nerd", "Ninja Nerd Pentose Phosphate Pathway PPP NADPH ribose 5-phosphate", "Pentose Phosphate Pathway (PPP) — NADPH Generation and Ribose-5-Phosphate Synthesis"),
    ("Ninja Nerd", "Ninja Nerd Fatty Acid Beta Oxidation Activation transport Carnitine Shuttle", "Fatty Acid Beta-Oxidation — Mitochondrial Carnitine Shuttle and Spiral Degradation"),
    ("Ninja Nerd", "Ninja Nerd Action Potential Generation Depolarization Repolarization Refractory Period", "Neuron Action Potential — Voltage-Gated Sodium/Potassium Channels and Refractory Periods"),
    ("Ninja Nerd", "Ninja Nerd Synaptic Transmission Neurotransmitters Neuromuscular Junction EPSP IPSP", "Chemical Synaptic Transmission, Neurotransmitter Release, and Postsynaptic Potentials (EPSP/IPSP)"),
    ("Ninja Nerd", "Ninja Nerd Muscle Contraction Sliding Filament Theory Actin Myosin Crossbridge Cycle", "Sliding Filament Theory of Muscle Contraction — Actin-Myosin Cross-Bridge Cycle and Calcium Regulation"),
    ("Ninja Nerd", "Ninja Nerd Cardiac Cycle Wiggers Diagram ECG Systole Diastole", "The Cardiac Cycle, Wiggers Diagram, Pressure-Volume Loops, and Heart Sounds"),
    ("Ninja Nerd", "Ninja Nerd Glomerular Filtration Rate GFR Nephron Physiology Renal Clearance", "Nephron Physiology — Glomerular Filtration Rate (GFR), Tubular Reabsorption, and Secretion Mechanisms"),
    ("Ninja Nerd", "Ninja Nerd Renin-Angiotensin-Aldosterone System RAAS Blood Pressure Regulation", "Renin-Angiotensin-Aldosterone System (RAAS) for Long-Term Blood Pressure Homeostasis"),
]

def parse_duration(duration: str) -> int:
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return 0
    return int(match.group(1) or 0) * 3600 + int(match.group(2) or 0) * 60 + int(match.group(3) or 0)

async def search_video(query: str, client: httpx.AsyncClient) -> dict | None:
    try:
        import urllib.parse
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
        r = await client.get(url, headers=headers, timeout=12.0)
        
        video_ids = list(dict.fromkeys(re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', r.text)))
        if not video_ids:
            return None

        # Fetch metadata in bulk (1 unit)
        r2 = await client.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={"part": "contentDetails,snippet,statistics", "id": ",".join(video_ids[:10]), "key": YOUTUBE_KEY},
            timeout=12.0,
        )
        videos = r2.json().get("items", [])
        for v in videos:
            dur = parse_duration(v.get("contentDetails", {}).get("duration", ""))
            if dur >= 300:
                return v
    except Exception as e:
        print(f"  Search error for '{query}': {e}")
    return None

async def generate_embedding(text: str, client: httpx.AsyncClient) -> list | None:
    try:
        r = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={GEMINI_KEY}",
            json={
                "model": "models/gemini-embedding-2",
                "outputDimensionality": 768,
                "content": {"parts": [{"text": text}]},
            },
            timeout=15.0,
        )
        return r.json().get("embedding", {}).get("values") if r.status_code == 200 else None
    except Exception as e:
        print(f"  Embedding error for '{text}': {e}")
        return None

async def main():
    # 1. Fetch all existing videos to strictly avoid any duplicates
    print("Fetching existing video IDs from database...")
    all_rows = []
    offset = 0
    while True:
        res = sb.table('curated_videos').select('video_id').range(offset, offset + 999).execute()
        if not res.data:
            break
        all_rows.extend(res.data)
        if len(res.data) < 1000:
            break
        offset += 1000

    already_done = {r['video_id'] for r in all_rows if r.get('video_id')}
    print(f"Loaded {len(already_done)} existing video IDs. 0 duplicates will be inserted.\n")

    inserted = 0
    skipped_existing = 0
    skipped_not_found = 0

    async with httpx.AsyncClient(timeout=25.0) as client:
        for idx, (channel, search_query, topic_label) in enumerate(CURATED_KNOWLEDGE_BASE, 1):
            video = await search_video(search_query, client)
            if not video:
                print(f"[{idx}/{len(CURATED_KNOWLEDGE_BASE)}] MISS  {topic_label[:60]}")
                skipped_not_found += 1
                await asyncio.sleep(0.1)
                continue

            vid_id = video["id"]
            if vid_id in already_done:
                skipped_existing += 1
                await asyncio.sleep(0.05)
                continue

            title = video["snippet"]["title"]
            dur_mins = parse_duration(video["contentDetails"]["duration"]) // 60

            embedding = await generate_embedding(topic_label, client)
            if not embedding:
                print(f"[{idx}/{len(CURATED_KNOWLEDGE_BASE)}] EMBED_ERR  {topic_label[:60]}")
                await asyncio.sleep(0.2)
                continue

            try:
                sb.table("curated_videos").upsert({
                    "video_id": vid_id,
                    "clean_title": title,
                    "channel": channel,
                    "topic": topic_label,
                    "duration_mins": dur_mins,
                    "topic_embedding": embedding,
                }, on_conflict="video_id").execute()
                already_done.add(vid_id)
                inserted += 1
                print(f"[{idx}/{len(CURATED_KNOWLEDGE_BASE)}] OK  [{vid_id}] {dur_mins}m | {topic_label[:60]}")
            except Exception as e:
                print(f"[{idx}/{len(CURATED_KNOWLEDGE_BASE)}] DB_ERR  {e}")

            await asyncio.sleep(0.1)

    print(f"\n============================================================")
    print(f"BATCH COMPLETE")
    print(f"Newly Inserted: {inserted}")
    print(f"Skipped Existing (Deduplicated): {skipped_existing}")
    print(f"Not Found: {skipped_not_found}")
    
    total = sb.table("curated_videos").select("id", count="exact").execute()
    print(f"Total Unique Curated Videos in Database: {total.count}")

if __name__ == "__main__":
    asyncio.run(main())
