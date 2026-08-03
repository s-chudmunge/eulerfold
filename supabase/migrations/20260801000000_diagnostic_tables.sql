-- Diagnostic Assessment System Tables
-- Run this in Supabase SQL Editor

-- 1. Prerequisite domain taxonomy
CREATE TABLE IF NOT EXISTS diagnostic_domains (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Pre-built diagnostic question bank
CREATE TABLE IF NOT EXISTS diagnostic_questions (
    id SERIAL PRIMARY KEY,
    domain_slug TEXT NOT NULL REFERENCES diagnostic_domains(slug),
    tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),  -- 1=foundational, 2=conceptual, 3=applied
    stem TEXT NOT NULL,                                 -- The question text
    options JSONB NOT NULL,                             -- [{text, tag}] where tag describes what selecting this reveals
    correct_index INTEGER NOT NULL,                     -- 0-indexed
    concepts_tested TEXT[] NOT NULL,                     -- e.g. ['p_value_interpretation', 'hypothesis_testing']
    misconceptions_detected JSONB DEFAULT '{}',         -- {option_index_str: misconception_slug}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Diagnostic session (one per user per course generation attempt)
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    topic TEXT NOT NULL,                                 -- The topic user wants to learn
    mapped_domains JSONB NOT NULL DEFAULT '[]',          -- [{domain_slug, weight}] from AI mapping
    knowledge_profile JSONB,                             -- Final scored profile after completion
    status TEXT NOT NULL DEFAULT 'in_progress',          -- in_progress | completed | skipped
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. Individual question responses within a session
CREATE TABLE IF NOT EXISTS diagnostic_responses (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES diagnostic_questions(id),
    selected_index INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    misconception_detected TEXT,                         -- misconception slug if wrong answer maps to one
    time_taken_ms INTEGER,                               -- how long user spent on this question
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_dq_domain_tier ON diagnostic_questions(domain_slug, tier);
CREATE INDEX IF NOT EXISTS idx_ds_user ON diagnostic_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ds_status ON diagnostic_sessions(status);
CREATE INDEX IF NOT EXISTS idx_dr_session ON diagnostic_responses(session_id);

-- Seed the prerequisite domain taxonomy
INSERT INTO diagnostic_domains (slug, name, description) VALUES
    ('probability-statistics', 'Probability and Statistics', 'Distributions, hypothesis testing, Bayesian reasoning, descriptive statistics'),
    ('linear-algebra', 'Linear Algebra', 'Vectors, matrices, eigenvalues, transformations, decompositions'),
    ('calculus', 'Calculus and Optimization', 'Derivatives, gradients, integrals, optimization methods'),
    ('python-programming', 'Python Programming', 'Syntax, data structures, OOP, generators, async, standard library'),
    ('data-structures-algorithms', 'Data Structures and Algorithms', 'Complexity analysis, trees, graphs, sorting, hashing, dynamic programming'),
    ('databases-sql', 'Databases and SQL', 'Relational model, joins, indexing, transactions, normalization'),
    ('ml-fundamentals', 'Machine Learning Fundamentals', 'Supervised/unsupervised learning, bias-variance, regularization, evaluation'),
    ('deep-learning', 'Deep Learning', 'Neural networks, backpropagation, CNNs, RNNs, transformers, attention'),
    ('systems-design', 'Systems Design', 'Distributed systems, CAP theorem, load balancing, caching, message queues'),
    ('devops-infra', 'DevOps and Infrastructure', 'Containers, CI/CD, cloud services, monitoring, IaC'),
    ('web-development', 'Web Development', 'HTTP, REST APIs, frontend/backend architecture, authentication'),
    ('networking', 'Networking', 'TCP/IP, DNS, protocols, sockets, routing'),
    ('os-fundamentals', 'Operating Systems', 'Processes, threads, memory management, concurrency, file systems'),
    ('discrete-math', 'Discrete Mathematics', 'Logic, sets, combinatorics, graph theory, proofs'),
    ('physics-fundamentals', 'Physics Fundamentals', 'Mechanics, electromagnetism, thermodynamics, waves')
ON CONFLICT (slug) DO NOTHING;
