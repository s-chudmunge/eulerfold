export const getCategory = (subject: string) => {
    if (!subject) return 'Other';
    const s = subject.toLowerCase();
    
    if (/rust/i.test(s)) return 'Rust';
    if (/\bgo\b/i.test(s) || /golang/i.test(s)) return 'Go';
    if (/python/i.test(s)) return 'Python';
    if (/\bjava\b/i.test(s) || /spring/i.test(s)) return 'Java';
    if (/typescript/i.test(s)) return 'TypeScript';
    if (/c\+\+|cpp/i.test(s)) return 'C++';
    
    if (/react/i.test(s) || /nextjs/i.test(s)) return 'React';
    if (/vue/i.test(s) || /angular/i.test(s)) return 'Vue/Angular';
    if (/frontend|web|css|html|javascript/i.test(s)) return 'Frontend';

    // Specific Exam Categories
    if (/jee/i.test(s)) return 'JEE';
    if (/neet/i.test(s)) return 'NEET';
    if (/upsc/i.test(s)) return 'UPSC';
    if (/gate/i.test(s)) return 'GATE';
    if (/cat/i.test(s)) return 'CAT';
    
    if (/clat/i.test(s)) return 'CLAT';
    if (/gre/i.test(s)) return 'GRE';
    if (/gmat/i.test(s)) return 'GMAT';
    if (/sat/i.test(s)) return 'SAT';
    
    // Move Exam Prep and Career higher to catch specific prep roadmaps
    if (/ibps|ssc|exam|test|prep|certification|certified/i.test(s)) return 'Exam Prep';
    if (/freelan|placement|career|interview|\bjob\b|resume|aptitude/i.test(s)) return 'Career';
    
    if (/backend|express|django|fastapi|laravel/i.test(s)) return 'Backend';
    if (/node\.js|nodejs/i.test(s)) return 'Node.js';
    if (/sql|database|postgres|mongodb|redis|mysql|dbms/i.test(s)) return 'SQL & Database';
    
    if (/data engineering|etl|pipeline|airflow|spark/i.test(s)) return 'Data Engineering';
    if (/data science|analysis|analytics|pandas|numpy|visualization/i.test(s)) return 'Data Science';
    
    if (/computer vision/i.test(s)) return 'Computer Vision';
    if (/llm|generative ai|prompt|gpt/i.test(s)) return 'LLMs & Generative AI';
    if (/nlp|natural language/i.test(s)) return 'NLP';
    if (/deep learning/i.test(s)) return 'Deep Learning';
    if (/\bai\b|machine learning|intelligence|neural|pytorch|tensorflow/i.test(s)) return 'AI/ML';
    
    if (/quantum/i.test(s)) return 'Quantum';
    if (/physics/i.test(s)) return 'Physics';
    if (/mathematics|math/i.test(s)) return 'Mathematics';
    if (/science|biology|chemistry|neuro|climate|energy|environment|medical|biotech|bioinformatics/i.test(s)) return 'Science';
    
    if (/flutter/i.test(s)) return 'Flutter';
    if (/ios|android|swift|kotlin|mobile/i.test(s)) return 'iOS/Android';
    
    if (/sre|reliability/i.test(s)) return 'SRE';
    if (/docker|kubernetes|k8s/i.test(s)) return 'Docker & K8s';
    if (/devops|infrastructure|terraform|ci\/cd/i.test(s)) return 'DevOps';
    if (/aws|azure|gcp/i.test(s)) return 'AWS/Azure/GCP';
    if (/cloud/i.test(s)) return 'Cloud';
    
    if (/unity|unreal|godot|game engine/i.test(s)) return 'Unity/Unreal';
    if (/game dev/i.test(s)) return 'Game Dev';
    if (/ar\/vr|augmented reality|virtual reality|metaverse/i.test(s)) return 'AR/VR';
    
    if (/robotics/i.test(s)) return 'Robotics';
    if (/iot|internet of things/i.test(s)) return 'IoT';
    if (/embedded|microcontroller|arduino|raspberry pi/i.test(s)) return 'Embedded';
    if (/ece|electronics|circuit|microprocessor|verilog|vhdl|vlsi/i.test(s)) return 'ECE & Hardware';
    
    if (/terminal|bash|shell|zsh|cli|command line/i.test(s)) return 'Terminal & CLI';
    if (/system design|architecture|distributed system/i.test(s)) return 'System Design';
    if (/cyber|security|hacking|penetration|network/i.test(s)) return 'Security';
    if (/blockchain|web3|crypto|solidity|ethereum/i.test(s)) return 'Blockchain';
    
    if (/product management|product owner|agile|scrum/i.test(s)) return 'Product Management';
    if (/marketing|seo|social media|growth|ads|youtube|video/i.test(s)) return 'Marketing';
    if (/finance/i.test(s)) return 'Finance';
    if (/business|startup|management|mba/i.test(s)) return 'Business';
    
    if (/open source|github|git /i.test(s)) return 'Open Source';
    if (/design|ui|ux|figma|graphic|adobe|product design/i.test(s)) return 'Design';
    if (/productivity/i.test(s)) return 'Productivity';
    
    return 'Other';
};
