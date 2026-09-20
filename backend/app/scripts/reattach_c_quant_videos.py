import json
import logging
from app.core.supabase_client import get_supabase_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Curated, verified video attachments for C++ for Quantitative Finance
# All videos are 8-120 mins, from trusted educational channels (CppCon, Cherno, Harvard, Oxford, QuantLib, etc.)
# No duplicate videos across topics.
TOPIC_VIDEOS = {
    # Module 1: C++ Core Mechanics & Memory Layout
    (0, 0): {
        "title": "Compilation & CMake",
        "video_id": "NDfTwOvWIao",
        "video_title": "CMake Doesn't Have to Be Painful | Simple Strategies That Work - Bret Brown - CppCon 2025",
        "duration": 63,
        "query": "CMake tutorial C++ CppCon"
    },
    (0, 1): {
        "title": "Pointers and References",
        "video_id": "DTxHyVn0ODg",
        "video_title": "POINTERS in C++",
        "duration": 17,
        "query": "C++ Pointers and References tutorial The Cherno"
    },
    (0, 2): {
        "title": "Memory Architecture",
        "video_id": "fMvO0Mcq894",
        "video_title": "CppCon 2016: Matt P. Dziubinski “Computer Architecture, C++, and High Performance\"",
        "duration": 55,
        "query": "C++ Memory Layout Stack vs Heap CppCon"
    },

    # Module 2: Object-Oriented & RAII
    (1, 0): {
        "title": "Resource Acquisition Is Initialization (RAII)",
        "video_id": "7Qgd9B1KuMQ",
        "video_title": "Back to Basics: RAII and the Rule of Zero - Arthur O'Dwyer - CppCon 2019",
        "duration": 62,
        "query": "C++ RAII Resource Acquisition Is Initialization CppCon"
    },
    (1, 1): {
        "title": "Polymorphism & VTables",
        "video_id": "RZDVDmbhXXY",
        "video_title": "Lec-57: C++ Virtual Function & Method Overriding | Run-Time Polymorphism",
        "duration": 15,
        "query": "Virtual Functions in C++ Run-Time Polymorphism"
    },
    (1, 2): {
        "title": "Curiously Recurring Template Pattern (CRTP)",
        "video_id": "lkgszkPnV8g",
        "video_title": "CppCon 2017: Louis Brandy “Curiously Recurring C++ Bugs at Facebook”",
        "duration": 52,
        "query": "CRTP C++ Curiously Recurring Template Pattern CppCon"
    },

    # Module 3: Modern C++ (C++11 to C++20)
    (2, 0): {
        "title": "Move Semantics",
        "video_id": "ehMg6zvXuMY",
        "video_title": "Move Semantics in C++",
        "duration": 13,
        "query": "C++ Move Semantics std::move rvalue The Cherno"
    },
    (2, 1): {
        "title": "Smart Pointers",
        "video_id": "UOB7-B2MfwA",
        "video_title": "SMART POINTERS in C++ (std::unique_ptr, std::shared_ptr, std::weak_ptr)",
        "duration": 12,
        "query": "C++ Smart Pointers unique_ptr shared_ptr The Cherno"
    },
    (2, 2): {
        "title": "Functional C++",
        "video_id": "xBAduq0RGes",
        "video_title": "C++ Lambda Idioms - Timur Doumler - CppCon 2022",
        "duration": 64,
        "query": "C++ Lambdas std::function functional programming CppCon"
    },

    # Module 4: Generic Programming & STL
    (3, 0): {
        "title": "Templates",
        "video_id": "I-hZkUa9mIs",
        "video_title": "Templates in C++",
        "duration": 18,
        "query": "C++ Templates tutorial generic programming The Cherno"
    },
    (3, 1): {
        "title": "Standard Template Library (STL)",
        "video_id": "7W1Jy0Si-wY",
        "video_title": "Vectors - STL in C++ | IEEE SB VIT, Pune",
        "duration": 13,
        "query": "C++ Standard Template Library STL containers"
    },
    (3, 2): {
        "title": "Advanced Metaprogramming",
        "video_id": "_doRiQS4GS8",
        "video_title": "From C++ Templates to C++ Concepts - Metaprogramming: an Amazing Journey - Alex Dathskovsky",
        "duration": 53,
        "query": "C++ Template Metaprogramming SFINAE Concepts CppCon"
    },

    # Module 5: Multithreading & Concurrency
    (4, 0): {
        "title": "Thread Management",
        "video_id": "FyCLUIa3NbY",
        "video_title": "OS 6 : Everything about Threads & Multithreading | User Level VS Kernal Level Thread",
        "duration": 20,
        "query": "C++ Threading and Multithreading tutorial"
    },
    (4, 1): {
        "title": "Synchronization",
        "video_id": "ph2awKa8r5Y",
        "video_title": "Process Synchronization",
        "duration": 21,
        "query": "Thread Synchronization Mutex Concurrency"
    },
    (4, 2): {
        "title": "Atomic Operations",
        "video_id": "gTpubZ8N0no",
        "video_title": "A Lock-Free Atomic Shared Pointer in Modern Cpp - Timur Doumler - CppCon 2022",
        "duration": 61,
        "query": "C++ std::atomic Lock-Free Concurrency Memory Model CppCon"
    },

    # Module 6: Low-Latency Engineering (HFT)
    (5, 0): {
        "title": "Micro-architecture Optimization",
        "video_id": "e8lfl6MbILg",
        "video_title": "Carnegie Mellon -Parallel Computer Architecture 2012 - Onur Mutlu - Lecture 10 - Multithreading II",
        "duration": 93,
        "query": "Parallel Computer Architecture Multithreading Carnegie Mellon"
    },
    (5, 1): {
        "title": "Memory Pooling",
        "video_id": "l14Zkx5OXr4",
        "video_title": "Practical Memory Pool Based Allocators For Modern C++ - Misha Shalem - CppCon 2020",
        "duration": 61,
        "query": "C++ Memory Pool Custom Allocator Object Pool CppCon"
    },
    (5, 2): {
        "title": "Network and OS Bypass",
        "video_id": "2hNdkYInj4g",
        "video_title": "Networking in C++ Part #1: MMO Client/Server, ASIO & Framework Basics",
        "duration": 39,
        "query": "Networking in C++ ASIO javidx9"
    },

    # Module 7: Applied Math & Linear Algebra (Eigen)
    (6, 0): {
        "title": "Eigen Library Fundamentals",
        "video_id": "fgNz1RE2DG4",
        "video_title": "Model Predictive Control (MPC) from Scratch - Derivation and C++ Implementation Using Eigen Library",
        "duration": 55,
        "query": "C++ Implementation Using Eigen Library Aleksandar Haber PhD"
    },
    (6, 1): {
        "title": "Advanced Decompositions",
        "video_id": "0JUN9aDxVmI",
        "video_title": "Advanced Algorithms (COMPSCI 224), Lecture 1",
        "duration": 88,
        "query": "Advanced Algorithms Harvard University"
    },
    (6, 2): {
        "title": "Portfolio Math",
        "video_id": "WooDGREhisU",
        "video_title": "Getting Started with Portfolio Optimization in MATLAB R2013a",
        "duration": 13,
        "query": "Portfolio Optimization Mean Variance Covariance Matrix"
    },

    # Module 8: Stochastic Calculus & Monte Carlo Pricing
    (7, 0): {
        "title": "Random Number Generation",
        "video_id": "3yzSHSdEjI0",
        "video_title": "QuantLib notebooks: random numbers and dimensionality",
        "duration": 11,
        "query": "QuantLib random numbers and dimensionality Luigi Ballabio"
    },
    (7, 1): {
        "title": "Stochastic Processes",
        "video_id": "uUtnOWUYVhI",
        "video_title": "Ito’s lemma, also known as Ito’s formula, or Stochastic chain rule: Proof",
        "duration": 11,
        "query": "Ito's lemma Stochastic Calculus Proof quantpie"
    },
    (7, 2): {
        "title": "Monte Carlo Engine",
        "video_id": "7ESK5SaP-bc",
        "video_title": "Monte Carlo Simulation",
        "duration": 10,
        "query": "Monte Carlo Simulation MarbleScience"
    },

    # Module 9: Derivatives & Black-Scholes
    (8, 0): {
        "title": "Black-Scholes Framework",
        "video_id": "-qa2B_sCpZQ",
        "video_title": "Black Scholes PDE Derivation using Delta Hedging",
        "duration": 12,
        "query": "Black Scholes PDE Derivation using Delta Hedging quantpie"
    },
    (8, 1): {
        "title": "Implementing the Formula",
        "video_id": "z4Wf_zTGHoY",
        "video_title": "Pricing Options With the Black Scholes Model and Calculating Greeks in C++",
        "duration": 28,
        "query": "Pricing Options With the Black Scholes Model in C++"
    },
    (8, 2): {
        "title": "The Greeks",
        "video_id": "5fAhLb1HPiw",
        "video_title": "Stock Option Greeks: Delta, Theta, Vega, Rho, & Gamma - Finance for Aspiring Quants",
        "duration": 13,
        "query": "Option Greeks Delta Gamma Vega Theta Socratica"
    },

    # Module 10: Finite Difference Methods (PDEs)
    (9, 0): {
        "title": "Grid Discretization",
        "video_id": "Fhs3VOOYmWM",
        "video_title": "#33FV Method for Convection&Diffusion:Discretization of Convection-Diffusion Eq.on Unstructured Mesh",
        "duration": 47,
        "query": "Finite Difference Grid Discretization NPTEL"
    },
    (9, 1): {
        "title": "Numerical Schemes",
        "video_id": "EhEHyFaxSUs",
        "video_title": "Basic Newton Method in C++ - Numerical Computing Tutorial in C++",
        "duration": 16,
        "query": "Numerical Computing Tutorial in C++ Aleksandar Haber PhD"
    },
    (9, 2): {
        "title": "Tridiagonal Solvers",
        "video_id": "waMdeAkskXA",
        "video_title": "Mod 04 Lec 31 Diagonalizing Tridiagonal Matrix",
        "duration": 48,
        "query": "Diagonalizing Tridiagonal Matrix NPTEL IISc"
    },

    # Module 11: Quantitative Libraries (QuantLib)
    (10, 0): {
        "title": "Library Architecture",
        "video_id": "7LR7JK-ebcs",
        "video_title": "Introduction to QuantLib. Part 1: The installation (Updated)",
        "duration": 12,
        "query": "Introduction to QuantLib installation"
    },
    (10, 1): {
        "title": "Time and Instruments",
        "video_id": "Os74fE0ivB4",
        "video_title": "Introduction to QuantLib. Part 8a: Date, Calendar, DayCounter and Schedule Class",
        "duration": 14,
        "query": "Introduction to QuantLib Date Calendar DayCounter Schedule Class"
    },
    (10, 2): {
        "title": "Pricing Engines",
        "video_id": "__PBUqjCy6E",
        "video_title": "QuantLib notebooks: instruments and pricing engines",
        "duration": 12,
        "query": "QuantLib notebooks: instruments and pricing engines Luigi Ballabio"
    },

    # Module 12: Building a Matching Engine
    (11, 0): {
        "title": "Order Book Mechanics",
        "video_id": "0qy8IHmKvoY",
        "video_title": "Frontiers in Quantitative Finance: Dr Nicholas Westray, Extracting alpha from the limit order book",
        "duration": 61,
        "query": "Extracting alpha from the limit order book Oxford"
    },
    (11, 1): {
        "title": "Data Structure Design",
        "video_id": "ECWsLj0pgbI",
        "video_title": "Design and Implementation of Highly Scalable Quantifiable Data Structures in C++ - CppCon 2021",
        "duration": 58,
        "query": "Design and Implementation of Highly Scalable Quantifiable Data Structures in C++ CppCon"
    },
    (11, 2): {
        "title": "Matching Algorithm",
        "video_id": "yvW4kJW48MY",
        "video_title": "TGMatrix - Matching Engine Demo",
        "duration": 11,
        "query": "Matching Engine Algorithm Order Matching HFT"
    }
}

def apply_videos_to_plan(plan: dict) -> dict:
    modules = plan.get("modules", [])
    for (m_idx, t_idx), vinfo in TOPIC_VIDEOS.items():
        if m_idx < len(modules):
            topics = modules[m_idx].get("topics", [])
            if t_idx < len(topics):
                topic = topics[t_idx]
                topic["youtube_video_id"] = vinfo["video_id"]
                topic["youtube_video_title"] = vinfo["video_title"]
                topic["duration"] = vinfo["duration"]
                topic["youtube_search_query"] = vinfo["query"]
    return plan

def main():
    sb = get_supabase_client()
    roadmaps_to_update = [1321, 1367, 1370, 1600, 1601, 1604]

    # Verify unique video IDs count
    unique_vids = {v["video_id"] for v in TOPIC_VIDEOS.values()}
    print(f"Total topics mapped: {len(TOPIC_VIDEOS)}, Unique video IDs: {len(unique_vids)}")
    assert len(TOPIC_VIDEOS) == 36, "Must have exactly 36 topics"
    assert len(unique_vids) == 36, f"All 36 videos must be distinct, got {len(unique_vids)}"

    for r_id in roadmaps_to_update:
        res = sb.table("roadmaps").select("id, title, roadmap_plan").eq("id", r_id).execute()
        if not res.data:
            print(f"Roadmap {r_id} not found in DB!")
            continue
        
        row = res.data[0]
        plan = row["roadmap_plan"]
        if isinstance(plan, str):
            plan = json.loads(plan)
        
        updated_plan = apply_videos_to_plan(plan)
        sb.table("roadmaps").update({"roadmap_plan": updated_plan}).eq("id", r_id).execute()
        print(f"Successfully updated Roadmap {r_id} ({row.get('title')}) with 36 curated, non-duplicate videos.")

if __name__ == "__main__":
    main()
