import re
from typing import List

# Common filler words and phrases to remove from learning-related searches
FILLER_PHRASES = [
    r"i want to learn\b",
    r"i want to\b",
    r"how to learn\b",
    r"how to\b",
    r"i need to learn\b",
    r"teach me\b",
    r"roadmap for\b",
    r"roadmap to\b",
    r"guide to\b",
    r"everything about\b",
    r"from scratch\b",
    r"for beginners\b",
    r"beginner to advanced\b",
    r"step by step\b",
    r"\band\b",
    r"\bwith\b",
    r"\bthe\b",
    r"\ba\b",
    r"\ban\b",
    r"\bin\b",
    r"\bof\b",
    r"\bfor\b"
]

def clean_search_query(query: str) -> str:
    """
    Cleans a natural language search query to extract core keywords.
    Example: "I want to learn Python from scratch" -> "python"
    """
    if not query:
        return ""
    
    # Convert to lowercase
    q = query.lower().strip()
    
    # Remove common filler phrases
    for phrase in FILLER_PHRASES:
        q = re.sub(phrase, "", q)
    
    # Remove leading/trailing "learn" if it's still there
    q = re.sub(r"^\s*learn\s+", "", q)
    q = re.sub(r"\s+learn\s*$", "", q)
    
    # Remove extra whitespace
    q = re.sub(r"\s+", " ", q).strip()
    
    # If we cleaned everything away, return original (fallback)
    if not q:
        # Just remove common symbols and return
        return re.sub(r"[^a-zA-Z0-9\s]", "", query).strip()
    
    return q

def get_search_keywords(query: str) -> List[str]:
    """
    Splits a query into a list of significant keywords.
    """
    cleaned = clean_search_query(query)
    # Filter out very short words unless they are digits or common tech terms
    words = cleaned.split()
    return [w for w in words if len(w) > 1 or w.isdigit()]

def get_category_keywords(category: str) -> List[str]:
    """
    Returns relevant search keywords for a specific topic category pill.
    """
    if not category or category.lower() in ("all", "other", "all courses"):
        return []
    c = category.lower()
    mapping = {
        "programming": ["programming", "program", "code", "coding", "software", "develop", "developer", "algorithm", "data structure", "c++", "cpp", "python", "java", "rust", "golang", "typescript", "javascript", "ruby", "c#", "php", "swift", "kotlin"],
        "typescript": ["typescript", "ts", "nextjs", "angular", "react"],
        "rust": ["rust", "cargo"],
        "go": ["go", "golang"],
        "python": ["python", "django", "fastapi", "flask", "pytorch", "pandas"],
        "java": ["java", "spring", "jvm", "kotlin", "maven", "gradle"],
        "c++": ["c++", "cpp", "c plus plus"],
        "frontend": ["frontend", "front-end", "web", "html", "css", "javascript", "typescript", "react", "vue", "angular", "tailwind", "nextjs", "next.js", "dom"],
        "react": ["react", "nextjs", "next.js", "jsx", "redux"],
        "vue/angular": ["vue", "nuxt", "angular", "svelte"],
        "backend": ["backend", "back-end", "server", "express", "django", "fastapi", "flask", "spring", "laravel", "rails", "node", "nodejs", "graphql", "rest api", "api"],
        "node.js": ["node", "nodejs", "node.js", "express", "nest", "nestjs"],
        "sql & database": ["sql", "database", "postgres", "postgresql", "mysql", "mongodb", "redis", "sqlite", "dbms", "nosql", "cassandra"],
        "terminal & cli": ["terminal", "cli", "bash", "shell", "zsh", "command line", "linux", "unix", "powershell"],
        "ai/ml": ["ai", "ml", "machine learning", "artificial intelligence", "neural", "deep learning", "pytorch", "tensorflow", "keras", "scikit-learn", "model", "llm", "generative ai", "nlp"],
        "computer vision": ["computer vision", "cv", "opencv", "image recognition", "object detection", "cnn", "yolo"],
        "llms & generative ai": ["llm", "generative ai", "genai", "prompt", "gpt", "chatgpt", "openai", "claude", "gemini", "langchain", "llama", "rag", "transformer"],
        "nlp": ["nlp", "natural language", "text processing", "sentiment analysis", "linguistics", "transformer"],
        "deep learning": ["deep learning", "neural network", "pytorch", "tensorflow", "keras", "cnn", "rnn", "lstm", "transformer"],
        "data science": ["data science", "data analysis", "analytics", "pandas", "numpy", "matplotlib", "seaborn", "visualization", "statistics"],
        "data engineering": ["data engineering", "etl", "pipeline", "airflow", "spark", "hadoop", "big data", "dbt", "snowflake", "kafka"],
        "system design": ["system design", "architecture", "distributed system", "microservices", "scalability", "load balancing", "caching"],
        "cloud": ["cloud", "aws", "azure", "gcp", "google cloud", "amazon web services", "serverless", "lambda", "iaas", "terraform"],
        "aws/azure/gcp": ["aws", "azure", "gcp", "google cloud", "amazon web services", "ec2", "s3", "lambda", "kubernetes"],
        "devops": ["devops", "ci/cd", "pipeline", "jenkins", "github actions", "docker", "kubernetes", "k8s", "terraform", "ansible", "monitoring"],
        "docker & k8s": ["docker", "kubernetes", "k8s", "container", "containerization", "helm", "pod"],
        "sre": ["sre", "reliability", "observability", "monitoring", "prometheus", "grafana", "incident", "sla", "slo"],
        "security": ["security", "cybersecurity", "cyber", "infosec", "hacking", "ethical hacking", "penetration", "pentest", "network security", "cryptography", "owasp"],
        "cybersecurity": ["cybersecurity", "cyber", "security", "infosec", "hacking", "penetration", "pentest", "network security", "owasp", "soc", "malware"],
        "mobile": ["mobile", "ios", "android", "flutter", "react native", "swift", "kotlin", "app development"],
        "ios/android": ["ios", "android", "swift", "kotlin", "mobile", "xcode", "android studio"],
        "flutter": ["flutter", "dart", "mobile", "cross platform"],
        "blockchain": ["blockchain", "crypto", "web3", "bitcoin", "ethereum", "solidity", "smart contract", "defi", "nft"],
        "web3": ["web3", "blockchain", "crypto", "ethereum", "solidity", "smart contract", "dapp", "decentralized"],
        "quantum": ["quantum", "qiskit", "qudit", "qubit", "quantum computing"],
        "science": ["science", "biology", "chemistry", "physics", "neuroscience", "astronomy", "scientific", "research", "medical", "biotech"],
        "physics": ["physics", "mechanics", "quantum", "thermodynamics", "electromagnetism", "astrophysics", "relativity"],
        "mathematics": ["mathematics", "math", "calculus", "linear algebra", "algebra", "geometry", "probability", "statistics", "discrete math", "trigonometry", "differential equations"],
        "game dev": ["game dev", "game development", "unity", "unreal", "godot", "game engine", "c#", "c++", "shader", "gamedev"],
        "unity/unreal": ["unity", "unreal", "unreal engine", "godot", "c#", "c++", "blueprint", "game dev"],
        "ece & hardware": ["ece", "electronics", "hardware", "circuit", "microprocessor", "verilog", "vhdl", "vlsi", "embedded", "pcb", "semiconductor"],
        "embedded": ["embedded", "microcontroller", "arduino", "raspberry pi", "firmware", "esp32", "arm", "c++", "real-time"],
        "iot": ["iot", "internet of things", "sensor", "arduino", "esp32", "mqtt", "raspberry pi", "smart home"],
        "robotics": ["robotics", "robot", "ros", "ros2", "automation", "mechatronics", "kinematics", "computer vision"],
        "ar/vr": ["ar/vr", "augmented reality", "virtual reality", "metaverse", "oculus", "openxr", "spatial computing", "unity"],
        "design": ["design", "ui/ux", "ui", "ux", "user interface", "user experience", "figma", "graphic design", "product design", "adobe", "photoshop"],
        "ui/ux": ["ui/ux", "ui", "ux", "user interface", "user experience", "figma", "wireframing", "prototyping", "usability", "product design"],
        "product management": ["product management", "product manager", "pm", "agile", "scrum", "product roadmap", "user story", "backlog"],
        "marketing": ["marketing", "seo", "content marketing", "social media", "growth", "ads", "advertising", "branding", "analytics", "copywriting"],
        "business": ["business", "startup", "management", "entrepreneurship", "strategy", "mba", "sales", "finance", "leadership", "operations"],
        "finance": ["finance", "financial", "accounting", "investing", "stock", "trading", "economics", "fintech", "banking", "valuation"],
        "jee": ["jee", "iit", "iit jee", "mains", "advanced", "joint entrance"],
        "neet": ["neet", "aiims", "medical entrance", "mbbs"],
        "upsc": ["upsc", "cse", "ias", "ips", "civil services", "general studies", "prelims"],
        "gate": ["gate", "graduate aptitude"],
        "cat": ["cat", "cat exam", "iim", "mba entrance"],
        "clat": ["clat", "law entrance", "llb"],
        "gre": ["gre", "graduate record"],
        "gmat": ["gmat", "mba admissions"],
        "sat": ["sat", "scholastic assessment"],
        "exam prep": ["exam", "prep", "test", "certification", "certified", "jee", "neet", "upsc", "gate", "cat", "clat", "gre", "gmat", "sat", "ssc", "ibps", "bank po"],
        "career": ["career", "interview", "job", "resume", "placement", "freelancing", "aptitude", "soft skills", "salary", "promotion"],
        "productivity": ["productivity", "time management", "habit", "focus", "goal setting", "organization", "notion", "workflow"],
        "open source": ["open source", "opensource", "git", "github", "gitlab", "contribution", "pull request", "foss"],
    }
    return mapping.get(c, [category])

