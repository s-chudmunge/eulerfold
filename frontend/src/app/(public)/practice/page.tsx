'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { practiceAPI, MCQSessionRead } from '@/lib/api';
import MCQPractice from '@/components/roadmap/MCQPractice';
import { BrainCircuit, Target, ArrowRight, ArrowLeft, Sparkles, Command, History, ChevronRight, X, Plus } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import TTSListenButton from '@/components/TTSListenButton';
import ResearchLibrarySidebar from '@/components/research-lab/ResearchLibrarySidebar';
import CommunitySidebarCard from '@/components/roadmap/CommunitySidebarCard';
import GoalGeneratorModal from '@/components/landing/GoalGeneratorModal';
import { useRouter } from 'next/navigation';

const SUGGESTIONS: Record<string, string[]> = {
    "Computer Science": ["Distributed Systems", "Algorithms", "Operating Systems", "Networking", "Compilers", "Cryptography", "Database Theory", "Graph Theory", "Parallel Computing", "Computer Graphics", "Formal Languages", "Complexity Theory", "Cloud Computing", "Computer Architecture", "Quantum Computing", "Information Theory", "Distributed Hash Tables", "Formal Verification", "Type Theory", "Computability", "Raft/Paxos Consensus", "HCI", "Randomized Algorithms", "Logic Programming", "Automata Theory"],
    "AI & Data Science": ["Neural Networks", "Linear Algebra", "Reinforcement Learning", "NLP", "Computer Vision", "Bayesian Inference", "Ethics in AI", "Generative Models", "Bio-AI", "Statistical Learning", "Decision Trees", "Support Vector Machines", "Unsupervised Learning", "Deep Reinforcement Learning", "Prompt Engineering", "Large Language Models", "Recommender Systems", "Time Series Analysis", "Causal Inference", "Federated Learning", "Transformers", "Graph Neural Networks", "Explainable AI (XAI)", "MLOps", "Active Learning", "Hyperparameter Tuning", "Data Engineering"],
    "Mathematics": ["Abstract Algebra", "Real Analysis", "Number Theory", "Calculus", "Probability", "Topology", "Category Theory", "Differential Geometry", "Set Theory", "Complex Analysis", "Discrete Mathematics", "Game Theory", "Functional Analysis", "Graph Theory", "Mathematical Logic", "Numerical Analysis", "Combinatorics", "Lie Groups", "Algebraic Geometry", "Stochastic Processes", "Harmonic Analysis", "Representation Theory", "Galois Theory", "Partial Differential Equations", "Ergodic Theory", "Knot Theory", "Measure Theory"],
    "Physics": ["Quantum Mechanics", "Electromagnetism", "Thermodynamics", "Particle Physics", "General Relativity", "Statistical Mechanics", "Quantum Field Theory", "Optics", "Nuclear Physics", "Fluid Dynamics", "Plasma Physics", "Condensed Matter", "Astrophysics", "Special Relativity", "Classical Mechanics", "Solid State Physics", "Acoustics", "Computational Physics", "String Theory", "Quantum Information", "Superconductivity", "Turbulence", "Astrobiology", "Geophysics", "Chaos Theory", "Nanophysics"],
    "Chemistry": ["Organic Chemistry", "Biochemistry", "Physical Chemistry", "Inorganic Chemistry", "Spectroscopy", "Quantum Chemistry", "Thermodynamics", "Analytical Chemistry", "Polymer Science", "Chemical Kinetics", "Electrochemistry", "Medicinal Chemistry", "Materials Chemistry", "Computational Chemistry", "Stereochemistry", "Environmental Chemistry", "Organometallics", "Nano-chemistry", "Supramolecular Chemistry", "Radiochemistry", "Green Chemistry", "Geochemistry", "Atmospheric Chemistry", "Biophysical Chemistry", "Synthetic Chemistry"],
    "Medicine": ["Pharmacology", "Pathology", "Immunology", "Neuroanatomy", "Physiology", "Genetics", "Molecular Biology", "Endocrinology", "Cardiology", "Epidemiology", "Radiology", "Hematology", "Gastroenterology", "Microbiology", "Oncology", "Pediatrics", "Internal Medicine", "Surgery Principles", "Biomedical Ethics", "Precision Medicine", "Regenerative Medicine", "Infectious Diseases", "Virology", "Medical Imaging", "Psychiatry", "Dermatology", "Toxicology"],
    "Mechanical Eng": ["Fluid Mechanics", "Thermodynamics", "Control Systems", "Solid Mechanics", "Heat Transfer", "Robotics", "Aerodynamics", "Mechatronics", "Materials Science", "Vibrations", "Manufacturing Processes", "Kinematics", "Finite Element Analysis", "Internal Combustion Engines", "Renewable Energy Systems", "Machine Design", "Biomechanics", "CFD (Fluid Dynamics)", "Structural Dynamics", "Turbomachinery", "Tribology", "HVAC Systems", "Aerospace Propulsion", "Composite Materials"],
    "Electrical Eng": ["Signal Processing", "Digital Logic", "Microelectronics", "Power Systems", "Electromagnetics", "Control Theory", "VLSI Design", "Telecommunications", "Embedded Systems", "Circuit Analysis", "Nanotechnology", "Photonics", "Analog Electronics", "Antennas & Propagation", "Robotic Control", "Power Electronics", "Wireless Comm", "Optical Fiber", "FPGA Design", "Semiconductor Physics", "Information Theory", "Instrumentation"],
    "Civil Eng": ["Structural Analysis", "Geotechnical Engineering", "Hydrology", "Environmental Engineering", "Transportation Engineering", "Surveying", "Urban Planning", "Construction Management", "Hydraulic Engineering", "Seismic Engineering", "Materials of Construction", "Water Resource Management", "Infrastructure Design", "Coastal Engineering", "Bridges", "Rail Systems", "Concrete Technology", "Geomatics"],
    "Cyber Security": ["Penetration Testing", "Network Security", "Malware Analysis", "Incident Response", "Cryptanalysis", "Digital Forensics", "Reverse Engineering", "Zero Trust Architecture", "Application Security", "Cloud Security", "Identity & Access Mgmt", "Cryptography", "Risk Assessment", "Threat Hunting", "Blockchain Security", "Security Operations", "Wireless Security", "IoT Security", "Social Engineering", "Exploit Development"],
    "Finance & Econ": ["Derivatives", "Portfolio Theory", "Econometrics", "Fixed Income", "Risk Management", "Game Theory", "Macroeconomics", "Microeconomics", "Behavioral Economics", "Corporate Finance", "Quantitative Trading", "Financial Accounting", "Asset Pricing", "Monetary Policy", "International Trade", "Public Economics", "Development Economics", "Fintech", "Venture Capital", "Financial Regulation", "Economic Theory"],
    "Software Eng": ["System Design", "Microservices", "CI/CD", "Design Patterns", "Clean Architecture", "Unit Testing", "Distributed Databases", "API Design", "Cloud Native", "DevOps", "Site Reliability Eng", "Refactoring", "Test-Driven Development", "Agile Methodologies", "Serverless Computing", "Containerization", "Mobile Development", "Software Verification", "Functional Programming", "Scalability", "Observability"],
    "Neuroscience": ["Neural Coding", "Synaptic Plasticity", "Neuroimaging", "Cognitive Neuroscience", "Behavioral Neuroscience", "Computational Neuroscience", "Neuropharmacology", "Neurobiology", "Developmental Neuroscience", "Neural Networks (Biological)", "Sensory Perception", "Motor Control", "Neuroendocrinology", "Circadian Rhythms", "Systems Neuroscience", "Molecular Neuro", "Neuropsychology", "Brain-Computer Interface"],
    "Philosophy": ["Formal Logic", "Epistemology", "Ethics", "Metaphysics", "Philosophy of Mind", "Political Philosophy", "Existentialism", "Phenomenology", "Aesthetics", "Philosophy of Science", "Ancient Philosophy", "Modern Philosophy", "Bioethics", "Logic & Language", "Moral Philosophy", "Structuralism", "Analytic Philosophy", "Hermeneutics", "Nihilism", "Philosophy of Religion"],
    "History": ["Industrial Revolution", "French Revolution", "Cold War", "Renaissance", "Ancient Civilizations", "Colonialism", "World War II", "Modern Asian History", "Medieval Europe", "The Enlightenment", "American History", "History of Technology", "The Great Depression", "Crusades", "Silk Road History", "History of Science", "Roman Empire", "Ottoman Empire", "Decolonization", "Cultural History"],
    "Psychology": ["Cognitive Psychology", "Developmental Psychology", "Social Psychology", "Neuropsychology", "Behavioral Analysis", "Clinical Psychology", "Abnormal Psychology", "Educational Psychology", "Industrial-Org Psych", "Psychometrics", "Personality Theory", "Motivation & Emotion", "Perception & Sensation", "Gestalt Psychology", "Psychoanalysis", "Health Psychology", "Evolutionary Psych"],
    "Sociology": ["Social Stratification", "Urban Sociology", "Demography", "Sociology of Culture", "Criminology", "Political Sociology", "Gender Studies", "Sociology of Education", "Social Movements", "Race & Ethnicity", "Globalization", "Social Networks", "Labor Sociology", "Sociological Theory", "Media Studies", "Rural Sociology", "Sociology of Religion"],
    "Linguistics": ["Phonology", "Syntax", "Semantics", "Computational Linguistics", "Historical Linguistics", "Pragmatics", "Morphology", "Sociolinguistics", "Psycholinguistics", "Language Acquisition", "Neurolinguistics", "Phonetics", "Discourse Analysis", "Dialectology", "Typology", "Corpus Linguistics", "Etymology", "Semiotics"],
    "Law": ["Constitutional Law", "Contract Law", "Torts", "International Law", "Intellectual Property", "Jurisprudence", "Criminal Law", "Corporate Law", "Property Law", "Administrative Law", "Family Law", "Environmental Law", "Human Rights Law", "Tax Law", "Cyber Law", "Civil Procedure", "Evidence Law", "Labor Law", "Maritime Law", "Legal Theory"],
    "Environment": ["Climate Modeling", "Ecology", "Hydrology", "Environmental Policy", "Conservation Biology", "Sustainable Energy", "Oceanography", "Geology", "Waste Management", "Biodiversity", "Atmospheric Science", "Soil Science", "Natural Resource Mgmt", "Renewable Resources", "Sustainability Science", "Bioremediation", "Forestry", "Marine Ecology"],
    "Astronomy": ["Stellar Evolution", "Galactic Dynamics", "Cosmology", "Orbital Mechanics", "Exoplanetology", "Astrobiology", "High-Energy Astrophysics", "Planetary Science", "Radio Astronomy", "Gravitational Waves", "Black Hole Physics", "Stellar Atmospheres", "Observational Astro", "Celestial Mechanics", "Astrochemistry", "X-ray Astronomy"],
    "Biology": ["Cell Biology", "Genetics", "Evolutionary Biology", "Microbiology", "Plant Biology", "Zoology", "Bioinformatics", "Ecology", "Marine Biology", "Biotechnology", "Proteomics", "Genomics", "Entomology", "Taxonomy", "Synthetic Biology", "Astrobiology", "Ethology", "Physiology", "Structural Biology", "Paleontology"],
    "Business & Mgmt": ["Strategic Management", "Organizational Behavior", "Operations Management", "Supply Chain", "Entrepreneurship", "Human Resources", "Project Management", "Business Analytics", "Leadership Theory", "International Business", "Corporate Strategy", "Change Management", "Market Analysis", "Managerial Economics", "Digital Transformation", "Business Ethics"],
    "Marketing": ["Digital Marketing", "Consumer Behavior", "Brand Management", "Market Research", "SEO & Content Strategy", "Advertising", "Social Media Analytics", "Relationship Marketing", "Public Relations", "B2B Marketing", "Global Marketing", "Marketing Automation", "Influencer Marketing", "Psychographic Segmentation", "Growth Hacking", "Pricing Strategy"],
    "Design & Arts": ["Graphic Design", "UI/UX Design", "Typography", "Art History", "Architecture Theory", "Music Theory", "Film Studies", "Product Design", "Interactive Design", "Visual Communication", "Photography Principles", "Fashion Design Theory", "Industrial Design", "Interior Architecture", "Game Design", "Cinematography", "Aesthetics"],
    "Politics & IR": ["International Relations", "Political Theory", "Comparative Politics", "Public Policy", "Geopolitics", "Diplomacy", "Governance", "Political Economy", "International Security", "Human Rights", "Public Administration", "Electoral Systems", "Political Communication", "Nationalism", "Crisis Management", "International Law (Politics)"]
};

function PracticeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [subject, setSubject] = useState(searchParams.get('subject') || '');
    const [topic, setTopic] = useState(searchParams.get('topic') || '');
    const [isStarted, setIsStarted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<MCQSessionRead[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedHistorySession, setSelectedHistorySession] = useState<MCQSessionRead | null>(null);
    const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);

    const subjects = useMemo(() => Object.keys(SUGGESTIONS), []);
    const topicSuggestions = useMemo(() => {
        if (SUGGESTIONS[subject]) return SUGGESTIONS[subject];
        return [];
    }, [subject]);

    const refreshProfile = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setIsAuthenticated(true);
            try {
                const { data: userData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('supabase_uid', session.user.id)
                    .single();
                if (userData) {
                    setProfile(userData);
                }
                
                setLoadingHistory(true);
                const mcqHistory = await practiceAPI.getAllMCQHistory();
                setHistory(mcqHistory);
            } catch (err) {
                console.error("Failed to fetch profile/history:", err);
            } finally {
                setLoadingHistory(false);
            }
        } else {
            setIsAuthenticated(false);
            setProfile(null);
            setHistory([]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    const handleStart = () => {
        if (!subject.trim() || !topic.trim()) return;
        setIsStarted(true);
    };

    const handleRoadmapGenerated = (data: any) => {
        if (data.slug) {
            router.push(`/roadmap/${data.slug}`);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background manrope-body">
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-10 md:py-16">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* Left Sidebar */}
                        {!isStarted && (
                            <div className="lg:w-[320px] shrink-0 pt-4 hidden lg:block sticky top-32 h-fit">
                                <CommunitySidebarCard onOpenRoadmapModal={() => setIsRoadmapModalOpen(true)} />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="mb-8">
                                <Breadcrumbs items={[{ label: 'Practice Lab' }]} />
                            </div>

                            {!isStarted ? (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="mb-10">
                                        <h1 className="inconsolata-ui text-[24px] md:text-[28px] font-bold text-text-heading tracking-tight uppercase mb-2">
                                            Interactive <span className="text-emerald-600">Practice</span> Lab
                                        </h1>
                                    </div>

                                    <div className="bg-sidebar/30 border border-border p-5 md:p-6 rounded-2xl relative overflow-hidden max-w-xl shadow-sm">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-emerald-600">
                                            <Command className="w-32 h-32" />
                                        </div>

                                        <div className="space-y-8 relative z-10">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-0.5 flex items-center gap-2">
                                                        Subject or Domain
                                                    </label>
                                                    <input 
                                                        type="text"
                                                        placeholder="Select or type a subject..."
                                                        className="w-full bg-callout-bg border border-border rounded-xl px-4 py-2.5 text-[14px] font-bold text-text-heading manrope-body focus:outline-none focus:border-emerald-500 transition-all placeholder:text-text-muted/30 placeholder:font-normal"
                                                        value={subject}
                                                        onChange={(e) => setSubject(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {subjects.map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => { setSubject(s); setTopic(''); }}
                                                            className={`px-3 py-1 text-[10px] font-bold inconsolata-ui border transition-all rounded-full ${
                                                                subject === s 
                                                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                                                : 'bg-background border-border text-text-muted hover:border-emerald-500/50 hover:text-emerald-600'
                                                            }`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-0.5 flex items-center gap-2">
                                                        Specific Topic
                                                    </label>
                                                    <input 
                                                        type="text"
                                                        placeholder="Select or type a topic..."
                                                        className="w-full bg-callout-bg border border-border rounded-xl px-4 py-2.5 text-[14px] font-bold text-text-heading manrope-body focus:outline-none focus:border-emerald-500 transition-all placeholder:text-text-muted/30 placeholder:font-normal"
                                                        value={topic}
                                                        onChange={(e) => setTopic(e.target.value)}
                                                    />
                                                </div>
                                                {topicSuggestions.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                                                        {topicSuggestions.map(t => (
                                                            <button
                                                                key={t}
                                                                onClick={() => setTopic(t)}
                                                                className={`px-3 py-1 text-[10px] font-bold inconsolata-ui border transition-all rounded-full ${
                                                                    topic === t 
                                                                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                                                                    : 'bg-background/50 border-border/50 text-text-muted hover:border-emerald-500/50 hover:text-emerald-600'
                                                                }`}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-2 flex items-center justify-between gap-4">
                                                <button
                                                    onClick={handleStart}
                                                    disabled={!subject.trim() || !topic.trim()}
                                                    className="group relative inline-flex items-center justify-center px-10 py-3 bg-text-heading text-background rounded-full text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale hover:opacity-90 active:scale-[0.98] shadow-lg shadow-black/5"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <span>Begin Assessment</span>
                                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                                    </div>
                                                </button>

                                                <div className="hidden sm:block">
                                                     {!isAuthenticated && !loading ? (
                                                        <div className="flex items-center gap-2 text-[10px] manrope-body text-text-muted italic">
                                                            <Sparkles className="w-3 h-3 text-emerald-600" />
                                                            <span>Sign in to begin</span>
                                                        </div>
                                                    ) : isAuthenticated && profile && !profile.is_pro ? (
                                                        <div className="flex items-center gap-2 text-[10px] manrope-body text-text-muted italic">
                                                            <Target className="w-3 h-3 text-emerald-600" />
                                                            <span>Requires Pro Status</span>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-border/50 sm:hidden">
                                                {!isAuthenticated && !loading ? (
                                                    <div className="flex items-center gap-3 text-[10px] manrope-body text-text-muted italic">
                                                        <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                                                        <span>Sign in to generate AI questions.</span>
                                                    </div>
                                                ) : isAuthenticated && profile && !profile.is_pro ? (
                                                    <div className="flex items-center gap-3 text-[10px] manrope-body text-text-muted italic">
                                                        <Target className="w-3 h-3 text-emerald-600 shrink-0" />
                                                        <span>Requires Pro Status (0.10 credits).</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    {isAuthenticated && (
                                        <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                                            <div className="flex items-center gap-3 mb-6">
                                                <History className="w-5 h-5 text-emerald-600" />
                                                <h2 className="inconsolata-ui text-[16px] font-bold text-text-heading uppercase tracking-widest">Assessment History</h2>
                                            </div>

                                            {loadingHistory ? (
                                                <div className="py-20 text-center border border-border border-dashed rounded-2xl">
                                                    <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                                    <p className="inconsolata-ui text-[10px] font-bold text-text-muted uppercase tracking-widest">Recalling past sessions...</p>
                                                </div>
                                            ) : history.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {history.map((session) => (
                                                        <button
                                                            key={session.id}
                                                            onClick={() => setSelectedHistorySession(session)}
                                                            className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-sidebar/20 border border-border hover:border-emerald-500/30 transition-all text-left relative overflow-hidden rounded-xl"
                                                        >
                                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                                                <ChevronRight className="w-10 h-10" />
                                                            </div>

                                                            <div className="flex-1 mb-3 md:mb-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="inconsolata-ui text-[8px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20 rounded-sm">
                                                                        {session.subject}
                                                                    </span>
                                                                    <span className="inconsolata-ui text-[8px] font-bold text-text-muted uppercase tracking-widest">
                                                                        {new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                                <h3 className="inconsolata-ui text-[13px] font-bold text-text-heading uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                                                                    {session.topic_name}
                                                                </h3>
                                                            </div>

                                                            <div className="flex items-center gap-6">
                                                                <div className="text-center">
                                                                    <div className="inconsolata-ui text-[16px] font-bold text-text-heading leading-none mb-1">
                                                                        {session.questions.length}
                                                                    </div>
                                                                    <div className="inconsolata-ui text-[7px] font-bold text-text-muted uppercase tracking-widest">Items</div>
                                                                </div>

                                                                <div className="text-center min-w-[50px]">
                                                                    <div className={`inconsolata-ui text-[16px] font-bold leading-none mb-1 ${
                                                                        (session.score || 0) >= 0.8 ? 'text-emerald-600' : 
                                                                        (session.score || 0) >= 0.5 ? 'text-amber-600' : 'text-red-600'
                                                                    }`}>
                                                                        {Math.round((session.score || 0) * 100)}%
                                                                    </div>
                                                                    <div className="inconsolata-ui text-[7px] font-bold text-text-muted uppercase tracking-widest">Mastery</div>
                                                                </div>

                                                                <div className="h-6 w-[1px] bg-border mx-1 hidden md:block"></div>

                                                                <div className="hidden md:flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                                                    <span className="inconsolata-ui text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Review</span>
                                                                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                                                                </div>
                                                            </div>
                                                        </button>                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-16 text-center border border-border border-dashed bg-sidebar/5 rounded-2xl">
                                                    <BrainCircuit className="w-8 h-8 text-text-muted/20 mx-auto mb-4" />
                                                    <p className="manrope-body text-[11px] text-text-muted italic opacity-60">No practice records available yet.</p>
                                                    <p className="inconsolata-ui text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-2">Start your first lab session above</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="mb-10 flex items-center justify-between">
                                        <button 
                                            onClick={() => setIsStarted(false)}
                                            className="inconsolata-ui text-[10px] font-bold text-text-muted hover:text-emerald-600 flex items-center gap-2 transition-all uppercase tracking-widest bg-callout-bg px-4 py-1.5 border border-border rounded-xl"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Lab
                                        </button>
                                        <div className="text-right">
                                            <span className="inconsolata-ui text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em] block mb-1">Active Session</span>
                                            <h2 className="inconsolata-ui text-[14px] font-bold text-text-heading uppercase tracking-tight">{topic}</h2>
                                        </div>
                                    </div>

                                    <div className="max-w-3xl mx-auto">
                                        <MCQPractice
                                            topicName={topic}
                                            subject={subject}
                                            weekNumber={1}
                                            isPro={profile?.is_pro || false}
                                            userCredits={profile?.roadmap_credits || 0}
                                            onPointsEarned={() => {}}
                                            onRefreshProfile={refreshProfile}
                                            onClose={() => setIsStarted(false)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Links (Right) */}
                        {!isStarted && (
                            <div className="lg:w-[260px] shrink-0 pt-4 sticky top-32">
                                <ResearchLibrarySidebar />
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />

            <GoalGeneratorModal 
                isOpen={isRoadmapModalOpen} 
                onClose={() => setIsRoadmapModalOpen(false)} 
            />

            {selectedHistorySession && (
                <div className="fixed inset-0 z-[120] bg-background flex flex-col animate-in fade-in duration-300 overflow-y-auto">
                    <div className="max-w-[650px] mx-auto w-full p-4 md:p-8 pb-16 border-x border-border">
                        <div className="flex justify-end mb-4">
                            <button 
                                onClick={() => setSelectedHistorySession(null)}
                                className="p-2 border border-border hover:bg-callout-bg rounded-xl text-text-muted transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="text-center mb-10 border-b border-border pb-8">
                            <div className="w-10 h-10 border border-border flex items-center justify-center mx-auto mb-3 text-lg rounded-xl">🏆</div>
                            <h2 className="inconsolata-ui text-xl font-bold text-text-heading mb-1 uppercase tracking-tighter">Assessment Review</h2>
                            <p className="inconsolata-ui text-[9px] text-text-muted uppercase tracking-[0.3em]">&quot;{selectedHistorySession.topic_name}&quot;</p>
                            
                            <div className="flex items-center justify-center gap-10 mt-8">
                                <div className="text-center">
                                    <div className="inconsolata-ui text-3xl font-bold text-text-heading mb-0.5">{Math.round((selectedHistorySession.score || 0) * 100)}%</div>
                                    <div className="inconsolata-ui text-[8px] font-bold text-text-muted uppercase tracking-widest">Mastery Rate</div>
                                </div>
                                <div className="w-[1px] h-10 bg-border"></div>
                                <div className="text-center">
                                    <div className="inconsolata-ui text-3xl font-bold text-text-heading mb-0.5">{selectedHistorySession.questions.filter((q, i) => selectedHistorySession.user_answers?.[i] === q.correct_answer_index).length}</div>
                                    <div className="inconsolata-ui text-[8px] font-bold text-text-muted uppercase tracking-widest">Correct Items</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase tracking-[0.4em] mb-6">Historical Data</h3>
                            {selectedHistorySession.questions.map((q, i) => {
                                const isCorrect = selectedHistorySession.user_answers?.[i] === q.correct_answer_index;
                                return (
                                    <div key={i} className={`p-5 border transition-all rounded-2xl ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex items-start gap-4">
                                                <div className={`shrink-0 w-6 h-6 border flex items-center justify-center inconsolata-ui text-[10px] font-bold rounded-lg ${isCorrect ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>
                                                    {i + 1}
                                                </div>
                                                <h4 className="inconsolata-ui text-[14px] font-bold text-text-heading leading-tight">{q.question}</h4>
                                            </div>
                                            <TTSListenButton 
                                                text={`Question ${i+1}: ${q.question}. Correct answer: ${q.options[q.correct_answer_index]}. Explanation: ${q.explanation}`}
                                                label="Explanation"
                                            />
                                        </div>
                                        
                                        <div className="ml-10 space-y-3">
                                            {selectedHistorySession.user_answers !== undefined && selectedHistorySession.user_answers[i] !== undefined && !isCorrect && (
                                                <div className="text-[11px] manrope-body border-l-2 border-red-500 pl-3 py-0.5">
                                                    <p className="text-[7px] font-bold text-red-500 uppercase tracking-widest mb-1">Input Received</p>
                                                    <span className="text-text-muted font-medium">{q.options[selectedHistorySession.user_answers[i]]}</span>
                                                </div>
                                            )}
                                            <div className="text-[11px] manrope-body border-l-2 border-emerald-500 pl-3 py-0.5">
                                                <p className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Verified Correct</p>
                                                <span className="text-text-heading font-bold">{q.options[q.correct_answer_index]}</span>
                                            </div>
                                            <div className="bg-background border border-border/50 p-3 rounded-xl text-[10px] manrope-body text-text-muted leading-relaxed italic">
                                                <span className="font-bold text-text-heading not-italic uppercase tracking-widest text-[7px] mr-2 block mb-1 underline decoration-accent">System Note:</span> 
                                                {q.explanation}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-12 text-center border-t border-border pt-8">
                            <button 
                                onClick={() => setSelectedHistorySession(null)}
                                className="px-16 py-3 bg-text-heading text-background rounded-full inconsolata-ui text-[11px] font-bold uppercase tracking-widest hover:opacity-90 shadow-xl transition-all"
                            >
                                Back to Lab
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function IndependentPracticePage() {
    return (
        <Suspense fallback={<div className="flex-1 bg-background" />}>
            <PracticeContent />
        </Suspense>
    );
}
