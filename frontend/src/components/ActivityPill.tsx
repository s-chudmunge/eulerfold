"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Copy, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  CreditCard,
  Download,
  Share2,
  Trophy,
  Search,
  Star
} from 'lucide-react';

const NAMES = [
  'aarav_sharma_4669', 'navya_kapoor_7774', 'arjun_mehta_8195', 'lucas_gonzalez_7415', 'ishaan_iyer_9204', 
  'ananya_verma_1364', 'alejandro_hernandez_5603', 'william_white_6596', 'samuel_sanchez_5978', 'iker_perez_292', 
  'advait_nair_5858', 'santiago_martinez_9603', 'jordan_martin_520', 'nicolas_sanchez_9798', 'sebastian_rodriguez_6213', 
  'navya_singh_7016', 'emerson_wilson_9280', 'vihaan_reddy_1509', 'sai_krishna_2839', 'dhruv_agarwal_7143', 
  'pranav_kapoor_5106', 'vihaan_sharma_5582', 'sofia_sanchez_4008', 'theodore_thomas_1223', 'sebastian_martinez_1409', 
  'harper_jackson_6888', 'ananya_gupta_6193', 'casey_taylor_3538', 'kabir_malhotra_8928', 'james_jackson_9702', 
  'ananya_reddy_3915', 'luciana_ramirez_4850', 'pranav_gupta_5479', 'vihaan_verma_7412', 'isha_khanna_9936', 
  'valentina_ramirez_3062', 'pranav_nair_9011', 'isabella_wilson_9432', 'charlie_allen_8445', 'river_allen_9665', 
  'ira_singh_8629', 'aryan_sharma_6493', 'adi_chowdhury_6763', 'aarav_singh_8640', 'sebastian_flores_9251', 
  'ishaan_jain_1142', 'matias_martinez_7655', 'karthik_menon_5699', 'pari_malhotra_3696', 'emerson_lewis_651', 
  'valentina_martinez_199', 'ira_sharma_2323', 'camila_ramirez_1675', 'aadhya_reddy_5866', 'navya_reddy_1499', 
  'mateo_sanchez_7143', 'harper_king_2563', 'yesha_patel_4599', 'harper_wright_3397', 'lucas_ramirez_6529', 
  'diya_sharma_7064', 'riley_walker_318', 'anvi_malhotra_4913', 'aadhya_gupta_6537', 'victoria_garcia_1879', 
  'elijah_wright_7165', 'pranav_kapoor_3445', 'rohan_deshmukh_7445', 'samuel_flores_9255', 'victoria_gonzalez_572', 
  'navya_nair_9689', 'alejandro_torres_9456', 'diego_martinez_2612', 'james_martin_522', 'yuvraj_singh_6360', 
  'evelyn_davis_9731', 'valeria_gonzalez_1433', 'yash_vardhan_4717', 'skyler_jones_3324', 'vihaan_kapoor_2425', 
  'hrithik_raj_4564', 'victoria_torres_7371', 'river_johnson_2261', 'tanvi_shah_7131', 'matias_ramirez_4597', 
  'jamie_white_3257', 'ananya_verma_759', 'samuel_sanchez_7815', 'ira_reddy_1737', 'charlie_clark_7221', 
  'mariana_sanchez_5470', 'neha_tanwar_5308', 'riley_lewis_3433', 'aravind_nair_9482', 'ishaan_gupta_4309', 
  'mateo_flores_7966', 'kiara_advani_5598', 'peyton_wright_3908', 'pranav_reddy_6074', 'matias_gonzalez_7308'
];

const ROADMAPS = [
  'Product-Led Growth Designer Roadmap', 'SQL Mastery & Database Design Roadmap', 'DevOps & CI/CD Learning Roadmap', 
  'Marketing Fundamentals for Non-Marketers', 'FastAPI and AI Integration', 'Integrating 3D Graphics', 
  'Freelance Graphic Design', 'Open Source Contribution Roadmap', 'Cybersecurity Simulation', 
  'YouTube Channel Growth Roadmap', 'Unity Game Development Roadmap', 'Aptitude Mastery for Placements', 
  'Finance for Investing and Trading', 'Linux & Terminal for Developers', 'Frontend Animation & Motion Design', 
  'AWS for Developers', 'Multimodal AI Integration Roadmap', 'Python Data Science', 'DSA and coding', 
  'Climate Science & Energy Systems', 'Computational Neuroscience', 'JEE Mains Preparation', 
  'NEET PG Preparation', 'GATE Preparation', 'NDA Exam Preparation', 'CDS Exam Preparation', 
  'High Scale Distributed Systems', 'Professional Editing & Animation', 'CS Fundamentals and System Design', 
  'Web3 & Blockchain Developer Roadmap', 'LLM Fine-Tuning from Scratch', 'Machine Learning from Scratch', 
  'Prompt Engineering Mastery', 'Data Engineering Fundamentals', 'Backend Development Roadmap', 
  'Bioinformatics Learning Roadmap'
];

const TOPICS = [
  'Hooks', 'Transformer Blocks', 'Risk Management', 'Multi-stage Builds', 
  'SQL Indexing', 'Prompt Engineering', 'DNA Sequencing', 'Consensus Algorithms',
  'Vector Databases', 'Backpropagation', 'Tokenization', 'IAM Policies',
  'Generative Adversarial Nets', 'Attention Mechanisms', 'Sharding', 'Docker Compose',
  'TypeScript Generics', 'Memory Management', 'Unit Testing', 'CI/CD Pipelines'
];

const SKILLS = [
  'React', 'Python', 'Solidity', 'Kubernetes', 'Genomics', 'Linear Algebra', 
  'Market Analysis', 'Terraform', 'Next.js', 'PyTorch', 'Rust', 'Go',
  'FastAPI', 'AWS Lambda', 'PostgreSQL', 'Framer Motion', 'Tailwind CSS'
];

const PAPERS = [
  'Attention Is All You Need', 'Adam Optimizer', 'AlphaFold 2', 
  'BERT', 'ResNet', 'PCP Theorem', 'Aho-Corasick', 'DeepSeek-R1',
  'GPT-4 Technical Report', 'Llama 3 Herd of Models', 'Flash Attention'
];

const GRADES = ['Solid', 'Developing', 'Mastered', 'Distinction'];

type ActivityInstance = {
  id: string;
  text: string;
  icon: React.ReactNode;
  color: string;
};

const generateActivity = (): ActivityInstance => {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const type = Math.floor(Math.random() * 13);
  const id = Math.random().toString(36).substring(2, 9);
  
  let data;
  switch(type) {
    case 0:
      data = {
        text: `@${name} started learning ${ROADMAPS[Math.floor(Math.random() * ROADMAPS.length)]}`,
        icon: <BookOpen className="w-3 h-3" />,
        color: 'text-blue-500'
      };
      break;
    case 1:
      data = {
        text: `@${name} cloned ${ROADMAPS[Math.floor(Math.random() * ROADMAPS.length)]}`,
        icon: <Copy className="w-3 h-3" />,
        color: 'text-purple-500'
      };
      break;
    case 2:
      data = {
        text: `@${name} practiced ${TOPICS[Math.floor(Math.random() * TOPICS.length)]}`,
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'text-green-500'
      };
      break;
    case 3:
      data = {
        text: `@${name} verified ${SKILLS[Math.floor(Math.random() * SKILLS.length)]} skill`,
        icon: <CheckCircle2 className="w-3 h-3" />,
        color: 'text-accent'
      };
      break;
    case 4:
      data = {
        text: `@${name} generated a course for ${ROADMAPS[Math.floor(Math.random() * ROADMAPS.length)]}`,
        icon: <Zap className="w-3 h-3" />,
        color: 'text-yellow-500'
      };
      break;
    case 5:
      data = {
        text: `@${name} upgraded to Pro Plan`,
        icon: <CreditCard className="w-3 h-3" />,
        color: 'text-pink-500'
      };
      break;
    case 6:
      data = {
        text: `@${name} is on a ${Math.floor(Math.random() * 20) + 3} day streak!`,
        icon: <Flame className="w-3 h-3" />,
        color: 'text-orange-500'
      };
      break;
    case 7:
      data = {
        text: `@${name} achieved ${GRADES[Math.floor(Math.random() * GRADES.length)]} in ${SKILLS[Math.floor(Math.random() * SKILLS.length)]}`,
        icon: <Award className="w-3 h-3" />,
        color: 'text-accent'
      };
      break;
    case 8:
      data = {
        text: `@${name} downloaded ${PAPERS[Math.floor(Math.random() * PAPERS.length)]} from archive`,
        icon: <Download className="w-3 h-3" />,
        color: 'text-blue-400'
      };
      break;
    case 9:
      data = {
        text: `@${name} shared a course to community`,
        icon: <Share2 className="w-3 h-3" />,
        color: 'text-indigo-500'
      };
      break;
    case 10:
      data = {
        text: `@${name} earned 'Early Adopter' badge`,
        icon: <Trophy className="w-3 h-3" />,
        color: 'text-yellow-600'
      };
      break;
    case 11:
      data = {
        text: `@${name} contributed a Research Decode`,
        icon: <Search className="w-3 h-3" />,
        color: 'text-teal-500'
      };
      break;
    case 12:
      data = {
        text: `@${name} rated a course 5 stars`,
        icon: <Star className="w-3 h-3" />,
        color: 'text-yellow-400'
      };
      break;
    default:
      data = {
        text: `@${name} is active on EulerFold`,
        icon: <Zap className="w-3 h-3" />,
        color: 'text-accent'
      };
  }
  return { ...data, id };
};

export default function ActivityStream() {
  const [activeActivities, setActiveActivities] = useState<ActivityInstance[]>([]);
  const maxActivities = 2; // Slowed down from 3

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    const spawnActivity = () => {
      setActiveActivities(prev => {
        if (prev.length >= maxActivities) return prev;
        const newActivity = generateActivity();
        
        // Slower duration (6-10 seconds)
        const visibleDuration = 6000 + Math.random() * 4000;
        
        const removeTimeout = setTimeout(() => {
          setActiveActivities(current => current.filter(a => a.id !== newActivity.id));
        }, visibleDuration);
        
        timeouts.push(removeTimeout);
        return [...prev, newActivity];
      });

      // Long randomized delays (8-25 seconds)
      const nextSpawnDelay = 8000 + Math.random() * 17000;
      const spawnTimeout = setTimeout(spawnActivity, nextSpawnDelay);
      timeouts.push(spawnTimeout);
    };

    const initialTimeout = setTimeout(spawnActivity, 2000);
    timeouts.push(initialTimeout);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <div className="min-h-[48px] flex flex-wrap gap-3 items-center">
      <AnimatePresence>
        {activeActivities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-sidebar/60 backdrop-blur-md border border-border/50 shadow-sm"
          >
            <div className={`${activity.color} flex-shrink-0`}>
              {activity.icon}
            </div>
            <span className="text-[12px] font-bold text-text-primary whitespace-nowrap manrope-body tracking-tight inconsolata-ui">
              {activity.text}
            </span>
            <div className="w-1 h-1 rounded-full bg-accent animate-pulse ml-0.5" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
