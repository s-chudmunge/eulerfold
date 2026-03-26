-- Migration: Phase 1 Skill Credentials and Profiles
-- Add username and visibility to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMPTZ DEFAULT NOW();

-- Add depth_score to roadmaps
ALTER TABLE public.roadmaps
ADD COLUMN IF NOT EXISTS depth_score FLOAT DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS skills_extracted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS skills_extraction_error TEXT;

-- Create canonical_skills table
CREATE TABLE IF NOT EXISTS public.canonical_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    benchmark_hours FLOAT DEFAULT 10.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    canonical_skill_id UUID NOT NULL REFERENCES public.canonical_skills(id) ON DELETE CASCADE,
    confidence_score FLOAT DEFAULT 0.0,
    tier TEXT DEFAULT 'exposure' CHECK (tier IN ('strong', 'developing', 'exposure')),
    pow_score FLOAT DEFAULT 0.0,
    practice_score FLOAT DEFAULT 0.0,
    topic_completion FLOAT DEFAULT 0.0,
    depth_score FLOAT DEFAULT 0.0,
    time_invested FLOAT DEFAULT 0.0,
    contributing_roadmap_ids BIGINT[] DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, canonical_skill_id)
);

-- Seed 50 base skills
INSERT INTO public.canonical_skills (name, category, benchmark_hours) VALUES
-- Python
('Python Basics', 'Programming', 10),
('Advanced Python', 'Programming', 20),
('Django Web Framework', 'Programming', 30),
('Flask Micro-framework', 'Programming', 15),
('Python for Data Science', 'Programming', 25),
('NumPy & Pandas', 'Programming', 20),
-- DSA
('Array Manipulations', 'Data Structures', 10),
('Linked Lists', 'Data Structures', 12),
('Stacks & Queues', 'Data Structures', 10),
('Heap Data Structures', 'Data Structures', 15),
('Binary Trees', 'Data Structures', 20),
('Graph Theory', 'Data Structures', 30),
('Hash Tables', 'Data Structures', 10),
('Sorting Algorithms', 'Algorithms', 12),
('Searching Algorithms', 'Algorithms', 10),
('Dynamic Programming', 'Algorithms', 40),
('Recursion', 'Algorithms', 15),
('Big O Analysis', 'Algorithms', 10),
('Graph Algorithms (BFS/DFS)', 'Algorithms', 25),
('Greedy Algorithms', 'Algorithms', 20),
('Backtracking', 'Algorithms', 25),
('Sliding Window', 'Algorithms', 15),
('Two Pointers', 'Algorithms', 10),
-- System Design
('Scalability Basics', 'System Design', 20),
('Load Balancing', 'System Design', 15),
('Caching Strategies', 'System Design', 15),
('Database Sharding', 'System Design', 20),
('Microservices Architecture', 'System Design', 30),
('Message Queues', 'System Design', 20),
('API Gateway', 'System Design', 15),
('CAP Theorem', 'System Design', 10),
-- Web Development
('HTML/CSS Fundamentals', 'Web Development', 10),
('React.js Components', 'Web Development', 25),
('State Management (Redux/Zustand)', 'Web Development', 20),
('Node.js Backend', 'Web Development', 30),
('REST API Design', 'Web Development', 15),
('SQL Database Design', 'Web Development', 20),
('NoSQL Databases', 'Web Development', 15),
('TypeScript', 'Web Development', 20),
('Next.js App Router', 'Web Development', 25),
-- Tools & DevOps
('Git Version Control', 'Tools', 8),
('Docker Containers', 'Tools', 15),
('CI/CD Pipelines', 'Tools', 20),
('AWS Basics', 'Tools', 25),
('PostgreSQL', 'Tools', 15),
('Redis', 'Tools', 10),
-- Soft Skills
('Technical Interviewing', 'Career', 20),
('Problem Solving Strategies', 'Career', 15),
('Resume Building', 'Career', 5),
('System Design Interviewing', 'Career', 25)
ON CONFLICT (name) DO NOTHING;
