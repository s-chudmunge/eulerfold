import asyncio
import logging
import os
import json
from google import genai
from pydantic import BaseModel
from app.core.supabase_client import supabase
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

class ProofOfWork(BaseModel):
    what_to_build: str
    what_counts_as_evidence: str
    eval_criteria: list[str]

client = genai.Client()

DESCRIPTIONS = {
    1456: "Master the foundational Python primitives required for data manipulation, mathematical operations, and building robust AI systems. You will learn memory management, vectorized computation, and advanced object-oriented design tailored for machine learning pipelines.",
    1457: "Develop production-grade web applications by mastering static typing, interfaces, and advanced type inference. This course covers generics, discriminated unions, and compiler configuration to ensure reliable and strictly typed codebases.",
    1458: "Build scalable user interfaces by understanding core component lifecycle, state management, and declarative rendering. You will implement custom hooks, optimize rendering performance, and structure complex frontend architectures.",
    1459: "Gain a rigorous understanding of relational algebra, database normalization, and complex query optimization. This curriculum covers indexing strategies, ACID transactions, and advanced joins to design robust data persistence layers.",
    1460: "Explore the underlying architecture of the internet, from the OSI model to packet switching and routing algorithms. You will analyze TCP/IP behavior, latency mitigation, and the mechanics of modern data transmission.",
    1461: "Understand the foundational principles of distributed computing, fault tolerance, and network consensus. The course delves into CAP theorem, clock synchronization, and data replication strategies essential for building highly available systems.",
    1462: "Master the Unix philosophy and shell scripting to efficiently navigate, manage, and automate server environments. You will learn file permissions, process management, and pipe-based data processing for advanced system administration.",
    1463: "Examine the core mechanisms of modern operating systems, focusing on process scheduling, virtual memory, and hardware abstraction. This deep dive covers concurrency, interrupt handling, and kernel-space execution required for system-level programming.",
    1464: "Build the mathematical foundation required for 3D rendering and geometric transformations. You will apply matrix operations, vector spaces, and eigenvectors to manipulate coordinates and compute lighting in computer graphics environments.",
    1465: "Learn to build memory-safe, concurrent applications without a garbage collector. This course rigorously covers ownership, borrowing, lifetimes, and safe concurrency patterns to achieve optimal system performance.",
    1466: "Develop a deep intuition for computer architecture by writing manual memory management and low-level system code. You will understand pointers, stack and heap allocation, and bitwise operations essential for embedded and high-performance software.",
    1467: "Understand the theoretical and practical implementation of cryptographic primitives, including symmetric and asymmetric encryption. The curriculum covers hashing algorithms, digital signatures, and public key infrastructure used to secure modern communications.",
    1468: "Master OS-level virtualization to build, ship, and run applications in isolated, reproducible environments. You will learn to construct optimized images, manage container orchestration, and define robust multi-container deployments.",
    1469: "Architect scalable cluster deployments using standard orchestration paradigms. This course covers pods, services, ingress controllers, and replica sets to achieve automated scaling and resilient state management.",
    1470: "Gain a rigorous understanding of hardware instruction sets, CPU registers, and low-level execution pipelines. You will translate high-level code into machine instructions and optimize performance at the bare-metal level.",
    1471: "Explore the design and organization of modern processors, memory hierarchies, and system buses. The course details instruction pipelining, cache coherence, and parallel processing hardware.",
    1472: "Design decoupled, event-driven architectures capable of processing asynchronous workloads. You will learn routing topologies, message durability, and backpressure handling using industry-standard message brokers.",
    1473: "Build the structural and visual foundation of web applications with semantic markup and responsive styling. The course covers CSS grid, flexbox layout, and modern accessibility standards for robust user interfaces.",
    1474: "Master the foundational mathematical structures that underpin algorithm design, cryptography, and computer science theory. You will study combinatorics, graph theory, propositional logic, and formal proofs.",
    1475: "Develop robust robotic control systems using the Robot Operating System 2 framework. This course covers node communication, kinematic modeling, and sensor integration required for autonomous agent deployment.",
    1476: "Explore the deep mathematical theories essential for advanced cryptography and error-correcting codes. You will study groups, rings, finite fields, and prime factorization algorithms.",
    1477: "Implement advanced source control strategies to manage distributed codebases and complex branching models. The curriculum covers merge conflict resolution, rebase operations, and collaborative workflow automation.",
    1478: "Master the asynchronous execution model and dynamic typing system of modern JavaScript. You will learn event loop mechanics, prototype inheritance, and DOM manipulation to construct interactive client-side logic.",
    1479: "Understand the physics and mathematics of sound processing, sampling theory, and digital signal processing. The course covers Fourier transforms, filtering algorithms, and audio synthesis techniques.",
    1480: "Architect and train artificial neural networks using calculus and linear algebra primitives. You will implement backpropagation, loss functions, and optimization algorithms to build foundational machine learning models.",
    1481: "Design stateless, scalable web services using standard networking protocols and architectural patterns. This course covers request lifecycle, status codes, authentication mechanisms, and API contract design.",
    1482: "Implement advanced algorithmic structures to solve complex search, routing, and optimization problems. You will study binary search trees, graph traversal algorithms, and heap implementations for optimal data access.",
    1483: "Explore the theoretical limits of computation, grammar hierarchies, and language recognition. The curriculum covers state machines, context-free grammars, and Turing completeness required for compiler design.",
    1484: "Architect resilient software using distributed compute, storage, and networking primitives provided by modern cloud platforms. You will learn virtualization layers, serverless execution, and multi-region deployment topologies.",
    1485: "Automate and version-control cloud provisioning using declarative configuration paradigms. This course covers state management, resource dependency graphs, and immutable infrastructure deployment pipelines.",
    1486: "Design highly parallel software by mastering thread synchronization, locks, and atomic operations. You will identify race conditions, prevent deadlocks, and optimize CPU utilization across multi-core systems.",
    1487: "Understand the physical and logical abstraction of data storage, from block devices to hierarchical directory structures. The course covers journaling, inode allocation, and modern distributed storage protocols.",
    1488: "Architect analytical data stores capable of processing complex queries across massive datasets. You will learn dimensional modeling, ETL pipelines, and columnar storage optimization for business intelligence.",
    1489: "Master immutable state, pure functions, and higher-order abstractions to build predictable software. The curriculum covers recursions, monads, and lazy evaluation techniques used in mathematical computing.",
    1490: "Bridge advanced mathematical theory with the physical principles of quantum states and superpositions. You will study Hilbert spaces, unitary operators, and quantum entanglement required for quantum computing research."
}

def generate_pow(course_title: str, module_title: str) -> dict:
    prompt = f"""
    You are designing a rigorous, practical homework assignment (Proof of Work) for a module titled '{module_title}' in the course '{course_title}'.
    The assignment must be highly thoughtful, challenging, and strictly practical (e.g. write a script, build a mini-project, solve a mathematical proof with code).
    Do NOT use fluffy language. Be highly technical.
    Provide:
    1. what_to_build: A direct description of what the user must build or accomplish.
    2. what_counts_as_evidence: What they must submit (e.g. GitHub link to a script that does X, or a code snippet).
    3. eval_criteria: 2-3 strict criteria for evaluating the submission.
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': ProofOfWork,
                'temperature': 0.7,
            },
        )
        return json.loads(response.text)
    except Exception as e:
        logging.error(f"Error generating POW for {module_title}: {e}")
        return None

async def update_courses():
    logging.info("Starting batch update of courses and their modules...")
    
    # Fetch all courses 1456 to 1490
    course_ids = list(range(1456, 1491))
    res = supabase.table('roadmaps').select('id, title, roadmap_plan, description').in_('id', course_ids).execute()
    courses = res.data
    
    for course in courses:
        course_id = course['id']
        title = course['title']
        plan = course.get('roadmap_plan')
        
        # Ensure plan is a dict
        if isinstance(plan, str):
            plan = json.loads(plan)
            
        logging.info(f"Processing Course {course_id}: {title}")
        
        updated = False
        if plan and 'modules' in plan:
            for mod in plan['modules']:
                mod_title = mod.get('title', 'Unknown Module')
                logging.info(f"  -> Generating POW for: {mod_title}")
                pow_data = generate_pow(title, mod_title)
                if pow_data:
                    mod['proof_of_work_instructions'] = pow_data
                    updated = True
        
        new_desc = DESCRIPTIONS.get(course_id, course.get('description'))
        
        update_payload = {'description': new_desc}
        if updated:
            update_payload['roadmap_plan'] = plan
            
        try:
            update_res = supabase.table('roadmaps').update(update_payload).eq('id', course_id).execute()
            if update_res.data:
                logging.info(f"Successfully updated course {course_id}")
            else:
                logging.warning(f"Failed to update course {course_id} in DB")
        except Exception as e:
            logging.error(f"Supabase update error for {course_id}: {e}")

if __name__ == "__main__":
    asyncio.run(update_courses())
