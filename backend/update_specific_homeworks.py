import json
from dotenv import load_dotenv
load_dotenv('.env')
from app.core.supabase_client import get_supabase_client

sb = get_supabase_client()
res = sb.table('roadmaps').select('id, title, roadmap_plan').eq('email', 'eulerfold@gmail.com').gte('id', 1456).execute()

def generate_specific_homework(course_title, module_title):
    course_lower = course_title.lower()
    mod_lower = module_title.lower()
    
    # Defaults
    what_to_build = f"Write a raw implementation script demonstrating the core principles of {module_title}."
    what_counts_as_evidence = "A GitHub repository link to your implementation with a README explaining your methodology."
    
    # Languages & Syntax
    if "python" in course_lower:
        what_to_build = f"Write a Python script demonstrating {module_title} without using any external libraries. Handle edge cases."
    elif "rust" in course_lower:
        if "ownership" in mod_lower or "borrowing" in mod_lower:
            what_to_build = "Write a Rust program that intentionally violates ownership rules, document the compiler errors, and then provide the corrected safe implementation."
        elif "lifetime" in mod_lower:
            what_to_build = "Implement a custom struct that holds references to two different strings with explicit lifetimes, demonstrating safe memory access."
        else:
            what_to_build = f"Write a safe, zero-cost abstraction in Rust focusing on {module_title}."
    elif "react" in course_lower:
        if "state" in mod_lower or "hook" in mod_lower:
            what_to_build = "Build a complex counter that persists to localStorage and synchronizes across browser tabs using custom React hooks."
        else:
            what_to_build = f"Build a heavily componentized React mini-app focusing purely on {module_title}."
    
    # Systems & Architecture
    elif "database" in course_lower or "sql" in course_lower:
        if "join" in mod_lower or "relation" in mod_lower:
            what_to_build = "Design a 3-table relational schema for an e-commerce store and write a complex query using LEFT JOIN, GROUP BY, and HAVING."
        elif "index" in mod_lower:
            what_to_build = "Create a table with 1M mock rows. Query it without an index and record the execution plan. Add an index and compare the performance."
        else:
            what_to_build = f"Write a SQL script to construct a schema and perform complex operations related to {module_title}."
    elif "network" in course_lower or "http" in course_lower:
        if "tcp" in mod_lower or "udp" in mod_lower:
            what_to_build = "Write a raw TCP socket server in Python/C that can handle concurrent connections and gracefully drop malformed packets."
        elif "rest" in mod_lower or "api" in mod_lower:
            what_to_build = "Build a raw HTTP/1.1 server from scratch that parses incoming headers and routes requests to different handlers."
        else:
            what_to_build = f"Implement a low-level socket or networking script demonstrating {module_title}."
    elif "docker" in course_lower or "container" in course_lower:
        what_to_build = f"Write a multi-stage Dockerfile and a docker-compose.yml file demonstrating {module_title} with proper volume mapping."
    elif "kubernetes" in course_lower:
        what_to_build = f"Write a raw Kubernetes YAML manifest (Deployment, Service, and Ingress) implementing the concepts of {module_title}."
    
    # Advanced Topics
    elif "deep learning" in course_lower or "ai" in course_lower:
        if "forward" in mod_lower or "backprop" in mod_lower:
            what_to_build = "Implement a basic multi-layer perceptron (MLP) and forward pass using only NumPy (no PyTorch/TensorFlow)."
        else:
            what_to_build = f"Write a Python script using NumPy to mathematically demonstrate {module_title}."
    elif "cryptography" in course_lower:
        what_to_build = f"Implement a raw encryption/decryption function demonstrating the mathematics of {module_title} without relying on a crypto library."
    elif "multithreading" in course_lower or "concurrency" in course_lower:
        what_to_build = f"Write a multithreaded script utilizing mutexes/locks to demonstrate safe concurrent execution in {module_title} without race conditions."
    elif "system" in course_lower and "operating" in course_lower:
        what_to_build = f"Write a C program that uses low-level system calls (e.g., fork, exec, mmap) to demonstrate {module_title}."
    elif "data structures" in course_lower:
        what_to_build = f"Implement the complete {module_title} data structure from scratch in C or Python, including insertion, deletion, and search."
        
    return {
        'what_to_build': what_to_build,
        'what_counts_as_evidence': what_counts_as_evidence,
        'eval_criteria': [
            'The code compiles/runs flawlessly and strictly adheres to the core concepts of the module.',
            'The implementation explicitly avoids using abstracted libraries or frameworks that hide the underlying mechanics.'
        ]
    }

for c in res.data:
    plan = c['roadmap_plan']
    if isinstance(plan, str): plan = json.loads(plan)
    
    needs_update = False
    for module in plan.get('modules', []):
        mod_title = module.get('title', '').replace('Module 1: ', '').replace('Module 2: ', '').replace('Module 3: ', '').replace('Module 4: ', '').replace('Module 5: ', '')
        
        specific_hw = generate_specific_homework(c['title'], mod_title)
        module['proof_of_work_instructions'] = specific_hw
        needs_update = True
        
    if needs_update:
        sb.table('roadmaps').update({'roadmap_plan': plan}).eq('id', c['id']).execute()

print('Specific homeworks successfully injected!')
