import os
import sys
import json
import uuid
import subprocess

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv('.env')

from app.core.supabase_client import get_supabase_client
from app.routers.roadmaps import _generate_unique_slug, _generate_plan_hash

def uid():
    return str(uuid.uuid4())

sb = get_supabase_client()

FOUNDATIONS_BATCH_1 = [
    {
        "title": "Python 101 for AI Engineers",
        "description": "The absolute basics of Python scripting required before touching PyTorch, LangChain, or LLMs.",
        "subject": "AI Engineering",
        "modules": [
            {
                "title": "Data Types and Control Flow",
                "outcome": "Master the core concepts of Python variables, loops, and conditionals.",
                "timeline": "Week 1",
                "workspace_type": "python",
                "topics": [
                    {"title": "Primitive Data Types", "subtopics": [{"title": "Integers and Floats"}, {"title": "Strings and Booleans"}, {"title": "Type Casting"}]},
                    {"title": "Control Structures", "subtopics": [{"title": "If/Else Statements"}, {"title": "For Loops"}, {"title": "While Loops"}]},
                    {"title": "Proof of Work: Calculator", "subtopics": [{"title": "Build a CLI calculator"}, {"title": "Handle user input"}, {"title": "Implement basic math operations"}]}
                ]
            },
            {
                "title": "Data Structures",
                "outcome": "Gain hands-on experience with Lists, Dictionaries, and Tuples.",
                "timeline": "Week 2",
                "workspace_type": "python",
                "topics": [
                    {"title": "Lists and Tuples", "subtopics": [{"title": "Creating and indexing lists"}, {"title": "List comprehensions"}, {"title": "Immutability of tuples"}]},
                    {"title": "Dictionaries and Sets", "subtopics": [{"title": "Key-value pairs"}, {"title": "Iterating over dicts"}, {"title": "Set operations"}]},
                    {"title": "Proof of Work: Inventory System", "subtopics": [{"title": "Store items in a dictionary"}, {"title": "Update quantities"}, {"title": "Calculate total value"}]}
                ]
            },
            {
                "title": "Functions and Modules",
                "outcome": "Understand the architecture of reusable code using functions and imports.",
                "timeline": "Week 3",
                "workspace_type": "python",
                "topics": [
                    {"title": "Defining Functions", "subtopics": [{"title": "Arguments and Return values"}, {"title": "Default parameters"}, {"title": "Scope and lifetime"}]},
                    {"title": "Modules and Packages", "subtopics": [{"title": "Importing standard libraries"}, {"title": "Creating custom modules"}, {"title": "Using pip"}]},
                    {"title": "Proof of Work: Math Library", "subtopics": [{"title": "Write a custom math module"}, {"title": "Import it into a main script"}, {"title": "Run tests"}]}
                ]
            },
            {
                "title": "Object-Oriented Programming",
                "outcome": "Implement production-grade classes, methods, and inheritance.",
                "timeline": "Week 4",
                "workspace_type": "python",
                "topics": [
                    {"title": "Classes and Objects", "subtopics": [{"title": "The __init__ method"}, {"title": "Instance variables"}, {"title": "Methods"}]},
                    {"title": "Inheritance", "subtopics": [{"title": "Parent and child classes"}, {"title": "Method overriding"}, {"title": "The super() function"}]},
                    {"title": "Proof of Work: Banking System", "subtopics": [{"title": "Create an Account class"}, {"title": "Implement deposit/withdraw"}, {"title": "Create a SavingsAccount child class"}]}
                ]
            }
        ]
    },
    {
        "title": "TypeScript Fundamentals",
        "description": "Learn the type system that powers modern full-stack web development.",
        "subject": "Web Development",
        "modules": [
            {
                "title": "Basic Types and Variables",
                "outcome": "Master the core concepts of static typing in JavaScript.",
                "timeline": "Week 1",
                "workspace_type": "typescript",
                "topics": [
                    {"title": "Primitive Types", "subtopics": [{"title": "String, Number, Boolean"}, {"title": "Any and Unknown"}, {"title": "Type Inference"}]},
                    {"title": "Arrays and Tuples", "subtopics": [{"title": "Typed Arrays"}, {"title": "Fixed-length Tuples"}, {"title": "Readonly Arrays"}]},
                    {"title": "Proof of Work: Type Checker", "subtopics": [{"title": "Set up tsconfig"}, {"title": "Write typed functions"}, {"title": "Compile to JS"}]}
                ]
            },
            {
                "title": "Interfaces and Types",
                "outcome": "Gain hands-on experience with complex object shapes and type aliases.",
                "timeline": "Week 2",
                "workspace_type": "typescript",
                "topics": [
                    {"title": "Defining Interfaces", "subtopics": [{"title": "Object shapes"}, {"title": "Optional properties"}, {"title": "Readonly properties"}]},
                    {"title": "Type Aliases", "subtopics": [{"title": "Union types"}, {"title": "Intersection types"}, {"title": "String literal types"}]},
                    {"title": "Proof of Work: User Model", "subtopics": [{"title": "Define a User interface"}, {"title": "Implement union status types"}, {"title": "Write a validation function"}]}
                ]
            },
            {
                "title": "Functions and Generics",
                "outcome": "Understand the architecture of reusable, type-safe functions.",
                "timeline": "Week 3",
                "workspace_type": "typescript",
                "topics": [
                    {"title": "Typed Functions", "subtopics": [{"title": "Parameter and return types"}, {"title": "Function overloads"}, {"title": "Optional parameters"}]},
                    {"title": "Introduction to Generics", "subtopics": [{"title": "Generic functions"}, {"title": "Generic interfaces"}, {"title": "Type constraints"}]},
                    {"title": "Proof of Work: Data Fetcher", "subtopics": [{"title": "Write a generic fetch function"}, {"title": "Handle API responses"}, {"title": "Ensure type safety"}]}
                ]
            },
            {
                "title": "Advanced Type Manipulation",
                "outcome": "Explore the internal mechanics of utility types and mapped types.",
                "timeline": "Week 4",
                "workspace_type": "typescript",
                "topics": [
                    {"title": "Utility Types", "subtopics": [{"title": "Partial and Required"}, {"title": "Pick and Omit"}, {"title": "Record"}]},
                    {"title": "Advanced Concepts", "subtopics": [{"title": "Type Guards"}, {"title": "Mapped Types"}, {"title": "Conditional Types"}]},
                    {"title": "Proof of Work: State Manager", "subtopics": [{"title": "Use Partial for updates"}, {"title": "Implement Type Guards"}, {"title": "Build a generic store"}]}
                ]
            }
        ]
    },
    {
        "title": "React 101: Component Architecture",
        "description": "Master state, props, and hooks before diving into complex Next.js applications.",
        "subject": "Web Development",
        "modules": [
            {
                "title": "JSX and Components",
                "outcome": "Master the core concepts of rendering UI with React components.",
                "timeline": "Week 1",
                "workspace_type": "react",
                "topics": [
                    {"title": "Introduction to JSX", "subtopics": [{"title": "Embedding expressions"}, {"title": "JSX vs HTML"}, {"title": "React Fragments"}]},
                    {"title": "Functional Components", "subtopics": [{"title": "Creating components"}, {"title": "Passing Props"}, {"title": "Prop validation"}]},
                    {"title": "Proof of Work: Profile Card", "subtopics": [{"title": "Create a Card component"}, {"title": "Pass user data via props"}, {"title": "Render conditionally"}]}
                ]
            },
            {
                "title": "State and Events",
                "outcome": "Gain hands-on experience with interactivity using useState.",
                "timeline": "Week 2",
                "workspace_type": "react",
                "topics": [
                    {"title": "The useState Hook", "subtopics": [{"title": "Initializing state"}, {"title": "Updating state arrays/objects"}, {"title": "Derived state"}]},
                    {"title": "Event Handling", "subtopics": [{"title": "onClick and onChange"}, {"title": "Form submissions"}, {"title": "Preventing default behavior"}]},
                    {"title": "Proof of Work: Todo List", "subtopics": [{"title": "Manage a list of tasks in state"}, {"title": "Add new tasks"}, {"title": "Toggle completion status"}]}
                ]
            },
            {
                "title": "Side Effects with useEffect",
                "outcome": "Understand the architecture of data fetching and component lifecycles.",
                "timeline": "Week 3",
                "workspace_type": "react",
                "topics": [
                    {"title": "The useEffect Hook", "subtopics": [{"title": "The dependency array"}, {"title": "Running on mount"}, {"title": "Cleanup functions"}]},
                    {"title": "Fetching Data", "subtopics": [{"title": "Calling APIs"}, {"title": "Loading states"}, {"title": "Error handling"}]},
                    {"title": "Proof of Work: User Directory", "subtopics": [{"title": "Fetch data from an API"}, {"title": "Display a loading spinner"}, {"title": "Render a list of users"}]}
                ]
            },
            {
                "title": "Context and Routing",
                "outcome": "Build real-world projects using global state and client-side routing.",
                "timeline": "Week 4",
                "workspace_type": "react",
                "topics": [
                    {"title": "React Context API", "subtopics": [{"title": "Creating Context"}, {"title": "The Provider component"}, {"title": "useContext hook"}]},
                    {"title": "React Router Basics", "subtopics": [{"title": "Setting up routes"}, {"title": "Link and NavLink"}, {"title": "URL Parameters"}]},
                    {"title": "Proof of Work: Mini E-commerce", "subtopics": [{"title": "Global cart context"}, {"title": "Product listing page"}, {"title": "Product details page"}]}
                ]
            }
        ]
    }
]

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
            "youtube_search_query": f"{t['title']} tutorial",
            "subtopics": formatted_subtopics
        })
        
    return {
        "id": uid(),
        "title": m["title"],
        "outcome": m["outcome"],
        "timeline": m["timeline"],
        "workspace_type": m.get("workspace_type", "research"),
        "optimal_search_query": m["title"],
        "proof_of_work_instructions": {
            "what_to_build": "A practical implementation.",
            "what_counts_as_evidence": "A working script or repo.",
            "eval_criteria": [
                "Does the code compile and run?",
                "Does it correctly implement the core concept?"
            ]
        },
        "resources": [],
        "topics": formatted_topics
    }

def main():
    inserted_ids = []
    
    for c in FOUNDATIONS_BATCH_1:
        slug = _generate_unique_slug(sb, c["title"])
        
        modules = [format_module(m, i) for i, m in enumerate(c["modules"])]
        
        roadmap_plan = {
            "modules": modules
        }
        
        res = sb.table("roadmaps").insert({
            "email": "eulerfold@gmail.com",
            "title": c["title"],
            "description": c["description"],
            "slug": slug,
            "snapshot_hash": _generate_plan_hash(roadmap_plan),
            "is_public": True,
            "show_author": True,
            "roadmap_plan": roadmap_plan,
            "subject": c["subject"],
            "status": "active",
            "version": 1
        }).execute()
        
        c_id = res.data[0]["id"]
        inserted_ids.append(c_id)
        print(f"Inserted: {c_id} - {c['title']}")
        
    # Trigger enrichment and cards generator
    print("Running enrichments...")
    for c_id in inserted_ids:
        subprocess.run(["python", "smart_video_enrich.py", str(c_id)])
        subprocess.run(["python", "smart_resource_enrich.py", str(c_id)])
        
    subprocess.run(["python", "generate_course_cards_local.py"])
    print("Batch 1 completed!")

if __name__ == "__main__":
    main()
