import os
import sys
import uuid
import subprocess
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
load_dotenv('.env')

from app.core.supabase_client import get_supabase_client

def uid():
    return str(uuid.uuid4())

sb = get_supabase_client()

COURSES = {
    1475: {
        "prerequisites": ["Basic Python or C++ programming", "Linux command line basics", "Basic Linear Algebra"],
        "what_you_will_learn": ["ROS2 Architecture and DDS", "Nodes, Topics, Services, Actions", "TF2 and Coordinate Transforms", "Robot Modeling with URDF", "Nav2 Basics", "ROS2 Control", "Simulations in Gazebo"],
        "modules": [
            {
                "title": "ROS2 Architecture and Workspace Setup",
                "outcome": "Understand the ROS2 architecture and build a custom ROS2 workspace using Colcon.",
                "timeline": "Week 1",
                "workspace_type": "code",
                "optimal_search_query": "ROS2 architecture Colcon workspace setup DDS",
                "proof_of_work_instructions": {
                    "what_to_build": "A Colcon workspace with a custom package.",
                    "what_counts_as_evidence": "Compiled workspace and sourced setup files.",
                    "eval_criteria": ["Does it build?", "Is package.xml valid?"]
                },
                "topics": [
                    {"title": "DDS and Middleware", "youtube_search_query": "ROS2 DDS architecture Data Distribution Service", "subtopics": [{"title": "What is DDS?"}, {"title": "QoS Profiles"}]},
                    {"title": "Colcon Workspaces", "youtube_search_query": "ROS2 Colcon build tool workspace", "subtopics": [{"title": "colcon build"}, {"title": "Sourcing environment"}]}
                ]
            },
            {
                "title": "ROS2 Nodes and Topics",
                "outcome": "Establish asynchronous communication using ROS2 Topics.",
                "timeline": "Week 2",
                "workspace_type": "code",
                "optimal_search_query": "ROS2 nodes topics publisher subscriber",
                "proof_of_work_instructions": {
                    "what_to_build": "Custom publisher and subscriber in Python/C++.",
                    "what_counts_as_evidence": "Working code transmitting custom messages.",
                    "eval_criteria": ["Can they communicate?"]
                },
                "topics": [
                    {"title": "Writing ROS2 Nodes", "youtube_search_query": "ROS2 writing node rclpy rclcpp", "subtopics": [{"title": "rclpy vs rclcpp"}, {"title": "Node Lifecycle"}]},
                    {"title": "Publishers & Subscribers", "youtube_search_query": "ROS2 topics publishers subscribers", "subtopics": [{"title": "Custom message types"}, {"title": "Callback functions"}]}
                ]
            },
            {
                "title": "Services and Actions",
                "outcome": "Implement synchronous communication and long-running tasks.",
                "timeline": "Week 3",
                "workspace_type": "code",
                "optimal_search_query": "ROS2 services actions client server",
                "proof_of_work_instructions": {
                    "what_to_build": "Action server with intermediate feedback.",
                    "what_counts_as_evidence": "Client receiving feedback during execution.",
                    "eval_criteria": ["Does the action preempt?"]
                },
                "topics": [
                    {"title": "ROS2 Services", "youtube_search_query": "ROS2 services client server implementation", "subtopics": [{"title": "Synchronous calls"}, {"title": "Custom .srv files"}]},
                    {"title": "ROS2 Actions", "youtube_search_query": "ROS2 actions server client tutorial", "subtopics": [{"title": "Long-running tasks"}, {"title": "Action feedback"}]}
                ]
            },
            {
                "title": "TF2 and Coordinate Transforms",
                "outcome": "Manage coordinate frames using the TF2 library.",
                "timeline": "Week 4",
                "workspace_type": "code",
                "optimal_search_query": "ROS2 TF2 coordinate transforms static dynamic broadcaster",
                "proof_of_work_instructions": {
                    "what_to_build": "A TF broadcaster and listener.",
                    "what_counts_as_evidence": "Successful transform lookup between frames.",
                    "eval_criteria": ["Are frames linked correctly?"]
                },
                "topics": [
                    {"title": "Introduction to TF2", "youtube_search_query": "ROS2 TF2 coordinate frames introduction", "subtopics": [{"title": "Transform Trees"}, {"title": "rqt_tf_tree"}]},
                    {"title": "Broadcasters and Listeners", "youtube_search_query": "ROS2 TF2 broadcaster listener python", "subtopics": [{"title": "Static Transforms"}, {"title": "Dynamic Transforms"}]}
                ]
            },
            {
                "title": "Robot Modeling (URDF)",
                "outcome": "Create a robot model using URDF and view it in RViz.",
                "timeline": "Week 5",
                "workspace_type": "code",
                "optimal_search_query": "ROS2 URDF xacro robot modeling rviz",
                "proof_of_work_instructions": {
                    "what_to_build": "A visual and collision model of a simple robot.",
                    "what_counts_as_evidence": "RViz showing the articulated robot model.",
                    "eval_criteria": ["Are joints moving?"]
                },
                "topics": [
                    {"title": "URDF Basics", "youtube_search_query": "ROS2 URDF links joints robot model", "subtopics": [{"title": "Links and Joints"}, {"title": "Visuals vs Collisions"}]},
                    {"title": "Xacro and RViz", "youtube_search_query": "ROS2 Xacro macros RViz visualization", "subtopics": [{"title": "Using Xacro macros"}, {"title": "robot_state_publisher"}]}
                ]
            },
            {
                "title": "Simulation with Gazebo",
                "outcome": "Simulate the robot model in Gazebo Classic/Ignition.",
                "timeline": "Week 6",
                "workspace_type": "code",
                "optimal_search_query": "ROS2 Gazebo simulation plugins URDF",
                "proof_of_work_instructions": {
                    "what_to_build": "A Gazebo world with the spawned robot.",
                    "what_counts_as_evidence": "Robot physics acting in simulation.",
                    "eval_criteria": ["Does the robot load in Gazebo?"]
                },
                "topics": [
                    {"title": "Gazebo Integration", "youtube_search_query": "ROS2 Gazebo spawn robot URDF", "subtopics": [{"title": "Spawning entities"}, {"title": "Gazebo ROS APIs"}]},
                    {"title": "Gazebo Plugins", "youtube_search_query": "ROS2 Gazebo plugins differential drive camera", "subtopics": [{"title": "Diff-drive plugin"}, {"title": "Sensor plugins (LiDAR/Camera)"}]}
                ]
            },
            {
                "title": "ROS2 Navigation (Nav2)",
                "outcome": "Configure the Nav2 stack for autonomous navigation.",
                "timeline": "Week 7",
                "workspace_type": "code",
                "optimal_search_query": "ROS2 Nav2 navigation stack SLAM path planning",
                "proof_of_work_instructions": {
                    "what_to_build": "A robot navigating to a pose in a known map.",
                    "what_counts_as_evidence": "Nav2 executing a path without collision.",
                    "eval_criteria": ["Is the costmap configured correctly?"]
                },
                "topics": [
                    {"title": "Nav2 Architecture", "youtube_search_query": "ROS2 Nav2 architecture behavior trees", "subtopics": [{"title": "Behavior Trees"}, {"title": "Costmaps"}]},
                    {"title": "Planners and Controllers", "youtube_search_query": "ROS2 Nav2 planners controllers DWB", "subtopics": [{"title": "Global Planners"}, {"title": "Local Controllers (DWB)"}]}
                ]
            }
        ]
    },
    1474: {
        "prerequisites": ["High School Algebra"],
        "what_you_will_learn": ["Propositional & Predicate Logic", "Set Theory & Relations", "Combinatorics", "Graph Theory", "Number Theory & Cryptography", "Boolean Algebra"],
        "modules": [
            {
                "title": "Propositional & Predicate Logic",
                "outcome": "Construct truth tables and evaluate quantified statements.",
                "timeline": "Week 1",
                "workspace_type": "research",
                "optimal_search_query": "Discrete math propositional predicate logic truth tables",
                "proof_of_work_instructions": {
                    "what_to_build": "Solutions for nested quantifiers.",
                    "what_counts_as_evidence": "Written derivations.",
                    "eval_criteria": ["Are truth tables valid?"]
                },
                "topics": [
                    {"title": "Propositional Logic", "youtube_search_query": "Discrete math propositional logic truth tables", "subtopics": [{"title": "Logical connectives"}, {"title": "Tautologies"}]},
                    {"title": "Predicate Logic", "youtube_search_query": "Discrete math predicate logic quantifiers", "subtopics": [{"title": "Universal/Existential Quantifiers"}, {"title": "Nested Quantifiers"}]}
                ]
            },
            {
                "title": "Methods of Proof",
                "outcome": "Write rigorous mathematical proofs including induction.",
                "timeline": "Week 2",
                "workspace_type": "research",
                "optimal_search_query": "Discrete math proof techniques induction contradiction",
                "proof_of_work_instructions": {
                    "what_to_build": "A proof by mathematical induction.",
                    "what_counts_as_evidence": "Step-by-step logical proof.",
                    "eval_criteria": ["Is the base case and inductive step sound?"]
                },
                "topics": [
                    {"title": "Direct & Indirect Proofs", "youtube_search_query": "Discrete math direct proof contradiction contrapositive", "subtopics": [{"title": "Proof by Contradiction"}, {"title": "Proof by Contrapositive"}]},
                    {"title": "Mathematical Induction", "youtube_search_query": "Discrete math mathematical induction examples", "subtopics": [{"title": "Weak Induction"}, {"title": "Strong Induction"}]}
                ]
            },
            {
                "title": "Set Theory and Relations",
                "outcome": "Analyze sets, functions, and equivalence relations.",
                "timeline": "Week 3",
                "workspace_type": "research",
                "optimal_search_query": "Discrete math set theory functions relations equivalence",
                "proof_of_work_instructions": {
                    "what_to_build": "Mapping of an equivalence relation.",
                    "what_counts_as_evidence": "Proofs of reflexivity, symmetry, transitivity.",
                    "eval_criteria": ["Are equivalence classes identified?"]
                },
                "topics": [
                    {"title": "Sets and Functions", "youtube_search_query": "Discrete math sets injective surjective bijective", "subtopics": [{"title": "Power Sets"}, {"title": "Injective/Surjective/Bijective"}]},
                    {"title": "Relations", "youtube_search_query": "Discrete math equivalence relations partial orders", "subtopics": [{"title": "Equivalence Relations"}, {"title": "Partial Orders (Posets)"}]}
                ]
            },
            {
                "title": "Combinatorics & Probability",
                "outcome": "Calculate permutations, combinations, and discrete probabilities.",
                "timeline": "Week 4",
                "workspace_type": "research",
                "optimal_search_query": "Discrete math combinatorics permutations probability pigeonhole",
                "proof_of_work_instructions": {
                    "what_to_build": "Solutions to complex counting problems.",
                    "what_counts_as_evidence": "Application of binomial theorem and pigeonhole.",
                    "eval_criteria": ["Are counting principles applied correctly?"]
                },
                "topics": [
                    {"title": "Advanced Counting", "youtube_search_query": "Discrete math permutations combinations pigeonhole principle", "subtopics": [{"title": "Pigeonhole Principle"}, {"title": "Binomial Theorem"}]},
                    {"title": "Discrete Probability", "youtube_search_query": "Discrete math discrete probability expected value", "subtopics": [{"title": "Conditional Probability"}, {"title": "Expected Value"}]}
                ]
            },
            {
                "title": "Graph Theory Fundamentals",
                "outcome": "Analyze graph properties, paths, and trees.",
                "timeline": "Week 5",
                "workspace_type": "research",
                "optimal_search_query": "Discrete math graph theory trees euler paths isomorphism",
                "proof_of_work_instructions": {
                    "what_to_build": "Analysis of a graph's connectivity and coloring.",
                    "what_counts_as_evidence": "Diagrams showing Euler/Hamilton paths.",
                    "eval_criteria": ["Is the chromatic number correct?"]
                },
                "topics": [
                    {"title": "Graphs and Paths", "youtube_search_query": "Discrete math graph theory paths cycles bipartite", "subtopics": [{"title": "Bipartite Graphs"}, {"title": "Euler & Hamilton Paths"}]},
                    {"title": "Trees and Isomorphism", "youtube_search_query": "Discrete math trees spanning trees graph isomorphism", "subtopics": [{"title": "Spanning Trees"}, {"title": "Graph Isomorphism"}]}
                ]
            },
            {
                "title": "Number Theory & Cryptography",
                "outcome": "Apply modular arithmetic and understand RSA encryption.",
                "timeline": "Week 6",
                "workspace_type": "research",
                "optimal_search_query": "Discrete math number theory modular arithmetic RSA cryptography",
                "proof_of_work_instructions": {
                    "what_to_build": "A manual encryption using RSA.",
                    "what_counts_as_evidence": "Step-by-step modular exponentiation.",
                    "eval_criteria": ["Are the public/private keys derived correctly?"]
                },
                "topics": [
                    {"title": "Modular Arithmetic", "youtube_search_query": "Discrete math modular arithmetic euclidean algorithm primes", "subtopics": [{"title": "Euclidean Algorithm"}, {"title": "Prime Factorization"}]},
                    {"title": "Cryptography Basics", "youtube_search_query": "Discrete math RSA encryption algorithm explained", "subtopics": [{"title": "Fermat's Little Theorem"}, {"title": "RSA Algorithm"}]}
                ]
            }
        ]
    },
    1473: {
        "prerequisites": ["None"],
        "what_you_will_learn": ["Semantic HTML5", "Advanced CSS Layouts (Grid/Flex)", "Responsive Design", "CSS Animations", "Web Accessibility (A11y)", "CSS Architecture (BEM)"],
        "modules": [
            {
                "title": "Semantic HTML5 & DOM Structure",
                "outcome": "Build accessible document structures using HTML5.",
                "timeline": "Week 1",
                "workspace_type": "code",
                "optimal_search_query": "Semantic HTML5 document object model accessibility",
                "proof_of_work_instructions": {
                    "what_to_build": "A purely semantic HTML webpage.",
                    "what_counts_as_evidence": "Use of main, article, section tags.",
                    "eval_criteria": ["Does it validate?"]
                },
                "topics": [
                    {"title": "Document Anatomy", "youtube_search_query": "HTML5 document structure metadata", "subtopics": [{"title": "Meta tags"}, {"title": "The DOM tree"}]},
                    {"title": "Semantic Elements", "youtube_search_query": "HTML5 semantic elements accessibility forms", "subtopics": [{"title": "Landmark roles"}, {"title": "Accessible Forms"}]}
                ]
            },
            {
                "title": "CSS Core and Box Model",
                "outcome": "Master CSS selectors, specificity, and the box model.",
                "timeline": "Week 2",
                "workspace_type": "code",
                "optimal_search_query": "CSS fundamentals box model specificity selectors",
                "proof_of_work_instructions": {
                    "what_to_build": "A styled component relying on box-sizing.",
                    "what_counts_as_evidence": "A CSS stylesheet with correct specificity.",
                    "eval_criteria": ["Is box-sizing: border-box used?"]
                },
                "topics": [
                    {"title": "Specificity & Cascading", "youtube_search_query": "CSS specificity cascade inheritance explained", "subtopics": [{"title": "Calculating Specificity"}, {"title": "Inheritance"}]},
                    {"title": "The Box Model", "youtube_search_query": "CSS Box Model margin padding border box-sizing", "subtopics": [{"title": "Margin Collapse"}, {"title": "Box-Sizing"}]}
                ]
            },
            {
                "title": "Responsive Layouts: Flexbox",
                "outcome": "Design responsive 1D layouts using Flexbox.",
                "timeline": "Week 3",
                "workspace_type": "code",
                "optimal_search_query": "CSS Flexbox layout alignment responsive",
                "proof_of_work_instructions": {
                    "what_to_build": "A responsive navigation bar and card layout.",
                    "what_counts_as_evidence": "Flexbox properties used effectively.",
                    "eval_criteria": ["Does it wrap on mobile?"]
                },
                "topics": [
                    {"title": "Flex Containers", "youtube_search_query": "CSS Flexbox container align-items justify-content", "subtopics": [{"title": "Main & Cross Axis"}, {"title": "Alignment"}]},
                    {"title": "Flex Items", "youtube_search_query": "CSS Flexbox flex-grow flex-shrink flex-basis", "subtopics": [{"title": "Flex-Grow/Shrink"}, {"title": "Order"}]}
                ]
            },
            {
                "title": "Complex Layouts: CSS Grid",
                "outcome": "Build complex 2D layouts with CSS Grid.",
                "timeline": "Week 4",
                "workspace_type": "code",
                "optimal_search_query": "CSS Grid layout template areas fractional units",
                "proof_of_work_instructions": {
                    "what_to_build": "A dashboard layout using Grid areas.",
                    "what_counts_as_evidence": "Grid-template-areas defining regions.",
                    "eval_criteria": ["Is the layout robust?"]
                },
                "topics": [
                    {"title": "Grid Fundamentals", "youtube_search_query": "CSS Grid template rows columns fr units", "subtopics": [{"title": "Fractional Units (fr)"}, {"title": "Grid Gaps"}]},
                    {"title": "Advanced Grid Placement", "youtube_search_query": "CSS Grid template areas placement responsive", "subtopics": [{"title": "Grid Template Areas"}, {"title": "Auto-fit vs Auto-fill"}]}
                ]
            },
            {
                "title": "Responsive Design & Media Queries",
                "outcome": "Ensure applications adapt gracefully across devices.",
                "timeline": "Week 5",
                "workspace_type": "code",
                "optimal_search_query": "Responsive web design CSS media queries fluid typography",
                "proof_of_work_instructions": {
                    "what_to_build": "A fully responsive landing page.",
                    "what_counts_as_evidence": "Mobile-first media queries.",
                    "eval_criteria": ["Does layout shift smoothly?"]
                },
                "topics": [
                    {"title": "Media Queries", "youtube_search_query": "CSS media queries mobile first design breakpoint", "subtopics": [{"title": "Breakpoints"}, {"title": "Mobile-first approach"}]},
                    {"title": "Fluid Typography & Images", "youtube_search_query": "CSS responsive fluid typography clamp responsive images", "subtopics": [{"title": "Clamp() function"}, {"title": "Picture element"}]}
                ]
            },
            {
                "title": "CSS Architecture & Best Practices",
                "outcome": "Maintain scalable CSS using variables and BEM.",
                "timeline": "Week 6",
                "workspace_type": "code",
                "optimal_search_query": "CSS Architecture BEM custom properties variables",
                "proof_of_work_instructions": {
                    "what_to_build": "A UI kit styled with BEM methodology.",
                    "what_counts_as_evidence": "Class names following Block__Element--Modifier.",
                    "eval_criteria": ["Are CSS variables used for colors?"]
                },
                "topics": [
                    {"title": "CSS Variables", "youtube_search_query": "CSS custom properties variables root theming", "subtopics": [{"title": ":root scope"}, {"title": "Dark mode theming"}]},
                    {"title": "The BEM Methodology", "youtube_search_query": "CSS BEM methodology block element modifier naming convention", "subtopics": [{"title": "Blocks and Elements"}, {"title": "Modifiers"}]}
                ]
            }
        ]
    },
    1472: {
        "prerequisites": ["Backend programming experience (Python/Node/Java)"],
        "what_you_will_learn": ["Message Queue Paradigms", "RabbitMQ & AMQP", "Apache Kafka & Event Streaming", "Pub/Sub Architectures", "Dead Letter Queues", "Scaling Consumers"],
        "modules": [
            {
                "title": "Messaging Systems Overview",
                "outcome": "Differentiate between queues, pub/sub, and event streaming.",
                "timeline": "Week 1",
                "workspace_type": "research",
                "optimal_search_query": "Message queues vs pub sub vs event streaming microservices",
                "proof_of_work_instructions": {
                    "what_to_build": "System architecture proposal.",
                    "what_counts_as_evidence": "Diagram comparing RabbitMQ vs Kafka.",
                    "eval_criteria": ["Are use cases justified?"]
                },
                "topics": [
                    {"title": "Asynchronous Communication", "youtube_search_query": "Microservices asynchronous communication patterns", "subtopics": [{"title": "Sync vs Async"}, {"title": "Decoupling services"}]},
                    {"title": "Messaging Paradigms", "youtube_search_query": "Message Queue vs Event Streaming Pub Sub", "subtopics": [{"title": "Point-to-Point"}, {"title": "Publish/Subscribe"}]}
                ]
            },
            {
                "title": "RabbitMQ Fundamentals",
                "outcome": "Implement reliable message delivery with AMQP.",
                "timeline": "Week 2",
                "workspace_type": "code",
                "optimal_search_query": "RabbitMQ exchanges queues bindings AMQP",
                "proof_of_work_instructions": {
                    "what_to_build": "Producer and Consumer scripts.",
                    "what_counts_as_evidence": "Messages routed via a Topic Exchange.",
                    "eval_criteria": ["Are acknowledgements handled?"]
                },
                "topics": [
                    {"title": "AMQP Core Concepts", "youtube_search_query": "RabbitMQ exchanges types direct topic fanout", "subtopics": [{"title": "Exchanges & Bindings"}, {"title": "Routing Keys"}]},
                    {"title": "Message Reliability", "youtube_search_query": "RabbitMQ message acknowledgements persistence", "subtopics": [{"title": "Consumer ACKs"}, {"title": "Persistent Messages"}]}
                ]
            },
            {
                "title": "Advanced RabbitMQ",
                "outcome": "Handle failures with Dead Letter Exchanges and retries.",
                "timeline": "Week 3",
                "workspace_type": "code",
                "optimal_search_query": "RabbitMQ Dead Letter Exchanges DLX retry patterns",
                "proof_of_work_instructions": {
                    "what_to_build": "A worker that nacks messages to a DLX.",
                    "what_counts_as_evidence": "Failed messages ending up in DLQ.",
                    "eval_criteria": ["Is DLX configured correctly?"]
                },
                "topics": [
                    {"title": "Dead Lettering", "youtube_search_query": "RabbitMQ Dead Letter Exchanges DLX queues", "subtopics": [{"title": "Configuring DLX"}, {"title": "TTL and Expiration"}]},
                    {"title": "Routing Topologies", "youtube_search_query": "RabbitMQ advanced routing topology patterns", "subtopics": [{"title": "Header Exchanges"}, {"title": "Alternate Exchanges"}]}
                ]
            },
            {
                "title": "Apache Kafka Architecture",
                "outcome": "Understand distributed event streaming and commit logs.",
                "timeline": "Week 4",
                "workspace_type": "research",
                "optimal_search_query": "Apache Kafka architecture topics partitions commit log",
                "proof_of_work_instructions": {
                    "what_to_build": "A Kafka cluster topology design.",
                    "what_counts_as_evidence": "Explanation of partition replication.",
                    "eval_criteria": ["Is replication factor explained?"]
                },
                "topics": [
                    {"title": "The Commit Log", "youtube_search_query": "Apache Kafka append only commit log architecture", "subtopics": [{"title": "Append-only Logs"}, {"title": "Brokers and Zookeeper/KRaft"}]},
                    {"title": "Topics and Partitions", "youtube_search_query": "Apache Kafka topics partitions replication factor offsets", "subtopics": [{"title": "Partitioning"}, {"title": "Replication Factor"}]}
                ]
            },
            {
                "title": "Kafka Producers & Consumers",
                "outcome": "Write high-throughput producers and consumer groups.",
                "timeline": "Week 5",
                "workspace_type": "code",
                "optimal_search_query": "Apache Kafka producers consumers consumer groups",
                "proof_of_work_instructions": {
                    "what_to_build": "Kafka producer script and consumer group.",
                    "what_counts_as_evidence": "Multiple consumers sharing partition load.",
                    "eval_criteria": ["Are offsets committed manually?"]
                },
                "topics": [
                    {"title": "Producing Messages", "youtube_search_query": "Apache Kafka producer acks retries idempotence", "subtopics": [{"title": "Producer ACKs"}, {"title": "Idempotent Producers"}]},
                    {"title": "Consumer Groups", "youtube_search_query": "Apache Kafka consumer groups rebalancing offset commit", "subtopics": [{"title": "Group Rebalancing"}, {"title": "Offset Management"}]}
                ]
            },
            {
                "title": "Event-Driven Architectures",
                "outcome": "Apply messaging to real-world distributed systems.",
                "timeline": "Week 6",
                "workspace_type": "research",
                "optimal_search_query": "Event driven architecture CQRS event sourcing saga pattern",
                "proof_of_work_instructions": {
                    "what_to_build": "Design a Saga pattern workflow.",
                    "what_counts_as_evidence": "Diagram of distributed transaction.",
                    "eval_criteria": ["Are compensating transactions defined?"]
                },
                "topics": [
                    {"title": "EDA Patterns", "youtube_search_query": "Event Sourcing CQRS patterns architecture", "subtopics": [{"title": "Event Sourcing"}, {"title": "CQRS"}]},
                    {"title": "Distributed Transactions", "youtube_search_query": "Saga pattern microservices distributed transactions", "subtopics": [{"title": "Choreography vs Orchestration"}, {"title": "Saga Pattern"}]}
                ]
            }
        ]
    },
    1471: {
        "prerequisites": ["Basic Digital Logic", "Binary Arithmetic"],
        "what_you_will_learn": ["ISA (RISC vs CISC)", "CPU Datapath & Control", "Pipelining & Hazards", "Memory Hierarchy & Cache", "Virtual Memory", "Multicore Architectures"],
        "modules": [
            {
                "title": "Instruction Set Architecture (ISA)",
                "outcome": "Analyze the hardware-software interface and assembly language.",
                "timeline": "Week 1",
                "workspace_type": "research",
                "optimal_search_query": "Instruction Set Architecture RISC CISC assembly",
                "proof_of_work_instructions": {
                    "what_to_build": "Translate C code to basic MIPS/ARM assembly.",
                    "what_counts_as_evidence": "Correctly mapped registers and instructions.",
                    "eval_criteria": ["Are load/store concepts clear?"]
                },
                "topics": [
                    {"title": "ISA Fundamentals", "youtube_search_query": "Computer architecture ISA instruction formats", "subtopics": [{"title": "Instruction Formats"}, {"title": "Addressing Modes"}]},
                    {"title": "RISC vs CISC", "youtube_search_query": "RISC vs CISC computer architecture differences explained", "subtopics": [{"title": "x86 vs ARM"}, {"title": "Design Philosophies"}]}
                ]
            },
            {
                "title": "CPU Datapath and Control",
                "outcome": "Trace instruction execution through the CPU datapath.",
                "timeline": "Week 2",
                "workspace_type": "research",
                "optimal_search_query": "CPU datapath control unit fetch decode execute",
                "proof_of_work_instructions": {
                    "what_to_build": "Datapath trace for a branch instruction.",
                    "what_counts_as_evidence": "Diagram highlighting active muxes and ALU operations.",
                    "eval_criteria": ["Is the PC updated correctly?"]
                },
                "topics": [
                    {"title": "Single-Cycle Datapath", "youtube_search_query": "CPU single cycle datapath design ALU", "subtopics": [{"title": "Fetch-Decode-Execute"}, {"title": "ALU and Registers"}]},
                    {"title": "The Control Unit", "youtube_search_query": "CPU control unit design hardwired microprogrammed", "subtopics": [{"title": "Control Signals"}, {"title": "Microprogramming"}]}
                ]
            },
            {
                "title": "Instruction Pipelining",
                "outcome": "Improve throughput using pipelining and hazard resolution.",
                "timeline": "Week 3",
                "workspace_type": "research",
                "optimal_search_query": "CPU pipelining hazards forwarding branch prediction",
                "proof_of_work_instructions": {
                    "what_to_build": "Timing diagram resolving a data hazard.",
                    "what_counts_as_evidence": "Demonstration of forwarding or stalling.",
                    "eval_criteria": ["Are RAW hazards identified?"]
                },
                "topics": [
                    {"title": "Pipeline Stages", "youtube_search_query": "5 stage RISC CPU pipeline throughput", "subtopics": [{"title": "5-Stage Pipeline"}, {"title": "Throughput vs Latency"}]},
                    {"title": "Pipeline Hazards", "youtube_search_query": "CPU pipeline data structural control hazards forwarding", "subtopics": [{"title": "Data Hazards & Forwarding"}, {"title": "Control Hazards & Branch Prediction"}]}
                ]
            },
            {
                "title": "Advanced CPU Design",
                "outcome": "Understand ILP and superscalar architectures.",
                "timeline": "Week 4",
                "workspace_type": "research",
                "optimal_search_query": "Superscalar out of order execution instruction level parallelism",
                "proof_of_work_instructions": {
                    "what_to_build": "Explanation of out-of-order execution benefits.",
                    "what_counts_as_evidence": "Written analysis.",
                    "eval_criteria": ["Is register renaming explained?"]
                },
                "topics": [
                    {"title": "Instruction-Level Parallelism", "youtube_search_query": "Instruction Level Parallelism ILP superscalar VLIW", "subtopics": [{"title": "Superscalar Execution"}, {"title": "VLIW Architectures"}]},
                    {"title": "Out-of-Order Execution", "youtube_search_query": "CPU out of order execution register renaming tomasulo", "subtopics": [{"title": "Dynamic Scheduling"}, {"title": "Register Renaming"}]}
                ]
            },
            {
                "title": "Cache and Memory Hierarchy",
                "outcome": "Optimize memory access using caching mechanisms.",
                "timeline": "Week 5",
                "workspace_type": "research",
                "optimal_search_query": "Computer architecture cache memory mapping hit miss",
                "proof_of_work_instructions": {
                    "what_to_build": "Cache hit/miss simulation for a memory trace.",
                    "what_counts_as_evidence": "Calculated hit ratios for direct-mapped cache.",
                    "eval_criteria": ["Are tags and indices calculated properly?"]
                },
                "topics": [
                    {"title": "Cache Organization", "youtube_search_query": "Cache memory direct mapped set associative fully associative", "subtopics": [{"title": "Direct Mapped"}, {"title": "Set Associative"}]},
                    {"title": "Cache Performance", "youtube_search_query": "Cache hit rate miss penalty AMAT write policies", "subtopics": [{"title": "AMAT Calculation"}, {"title": "Write-through vs Write-back"}]}
                ]
            },
            {
                "title": "Virtual Memory and OS Interaction",
                "outcome": "Translate virtual addresses to physical addresses using page tables.",
                "timeline": "Week 6",
                "workspace_type": "research",
                "optimal_search_query": "Virtual memory paging TLB page faults computer architecture",
                "proof_of_work_instructions": {
                    "what_to_build": "Virtual to physical address translation trace.",
                    "what_counts_as_evidence": "Calculations using page size and offset.",
                    "eval_criteria": ["Is the TLB hit/miss flow accurate?"]
                },
                "topics": [
                    {"title": "Paging and Page Tables", "youtube_search_query": "Virtual memory paging page tables translation", "subtopics": [{"title": "Address Translation"}, {"title": "Page Faults"}]},
                    {"title": "Translation Lookaside Buffer (TLB)", "youtube_search_query": "Translation Lookaside Buffer TLB caching page tables", "subtopics": [{"title": "TLB Operation"}, {"title": "TLB vs Data Cache"}]}
                ]
            },
            {
                "title": "Multicore and Parallel Processing",
                "outcome": "Understand cache coherence in multicore processors.",
                "timeline": "Week 7",
                "workspace_type": "research",
                "optimal_search_query": "Multicore processors cache coherence MESI protocol Amdahl's law",
                "proof_of_work_instructions": {
                    "what_to_build": "State diagram for the MESI protocol.",
                    "what_counts_as_evidence": "Correct state transitions on read/write.",
                    "eval_criteria": ["Are invalidation broadcasts mapped?"]
                },
                "topics": [
                    {"title": "Multicore Architectures", "youtube_search_query": "Multicore processors thread level parallelism SMT", "subtopics": [{"title": "Thread-Level Parallelism"}, {"title": "Amdahl's Law"}]},
                    {"title": "Cache Coherence", "youtube_search_query": "Cache coherence protocols MESI snooping directory based", "subtopics": [{"title": "The Cache Coherence Problem"}, {"title": "Snooping and MESI Protocol"}]}
                ]
            }
        ]
    }
}

def format_module(m, idx):
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
            "youtube_search_query": t["youtube_search_query"],
            "optimal_search_query": t.get("youtube_search_query", t["title"]),
            "subtopics": formatted_subtopics
        })
        
    return {
        "id": uid(),
        "title": m["title"],
        "outcome": m["outcome"],
        "timeline": m["timeline"],
        "workspace_type": m.get("workspace_type", "research"),
        "optimal_search_query": m.get("optimal_search_query", m["title"]),
        "proof_of_work_instructions": m.get("proof_of_work_instructions", {
            "what_to_build": "A practical implementation.",
            "what_counts_as_evidence": "A working script or repo.",
            "eval_criteria": [
                "Does the code compile and run?",
                "Does it correctly implement the core concept?"
            ]
        }),
        "resources": [],
        "topics": formatted_topics
    }

def main():
    for course_id, data in COURSES.items():
        modules = [format_module(m, i) for i, m in enumerate(data["modules"])]
        
        roadmap_plan = {
            "prerequisites": data["prerequisites"],
            "what_you_will_learn": data["what_you_will_learn"],
            "modules": modules
        }
        
        # Update supabase
        res = sb.table("roadmaps").update({
            "roadmap_plan": roadmap_plan
        }).eq("id", course_id).execute()
        
        print(f"Updated course {course_id} with {len(modules)} modules.")
        
    print("Running enrichments...")
    for course_id in COURSES.keys():
        print(f"Running video enrichment for {course_id}")
        subprocess.run(["python", "smart_video_enrich.py", str(course_id)], check=True)
        print(f"Running resource enrichment for {course_id}")
        subprocess.run(["python", "smart_resource_enrich.py", str(course_id)], check=True)
        print(f"Enrichment completed for {course_id}")

if __name__ == "__main__":
    main()
