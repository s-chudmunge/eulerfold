export const getCategory = (subject: string) => {
    if (!subject) return 'Other';
    const s = subject.toLowerCase();
    
    if (/rust/i.test(s)) return 'Rust';
    if (/go /i.test(s) || /golang/i.test(s)) return 'Go';
    if (/python/i.test(s)) return 'Python';
    if (/java /i.test(s) || /spring/i.test(s)) return 'Java';
    if (/c\+\+|cpp/i.test(s)) return 'C++';
    
    if (/react/i.test(s) || /nextjs/i.test(s)) return 'React';
    if (/vue/i.test(s) || /angular/i.test(s)) return 'Vue/Angular';
    if (/frontend|web|css|html|javascript|typescript/i.test(s)) return 'Frontend';
    
    if (/backend|node|express|django|fastapi|laravel/i.test(s)) return 'Backend';
    if (/sql|database|postgres|mongodb|redis|mysql|dbms/i.test(s)) return 'SQL & Database';
    
    if (/data engineering|etl|pipeline|airflow|spark/i.test(s)) return 'Data Engineering';
    if (/data science|analysis|analytics|pandas|numpy|visualization/i.test(s)) return 'Data Science';
    
    if (/ai|machine learning|intelligence|prompt|llm|neural|pytorch|tensorflow/i.test(s)) return 'AI/ML';
    if (/quantum/i.test(s)) return 'Quantum';
    if (/science|physics|biology|chemistry|neuro|climate|energy|environment|medical|biotech|bioinformatics/i.test(s)) return 'Science';
    
    if (/flutter/i.test(s)) return 'Flutter';
    if (/ios|android|swift|kotlin|mobile/i.test(s)) return 'iOS/Android';
    
    if (/sre|reliability/i.test(s)) return 'SRE';
    if (/devops|infrastructure|terraform|ci\/cd|kubernetes/i.test(s)) return 'DevOps';
    if (/aws|cloud|azure|gcp/i.test(s)) return 'Cloud';
    
    if (/game dev|unity|unreal|godot|game engine/i.test(s)) return 'Game Dev';
    if (/ar\/vr|augmented reality|virtual reality|metaverse/i.test(s)) return 'AR/VR';
    
    if (/robotics/i.test(s)) return 'Robotics';
    if (/embedded|microcontroller|arduino|raspberry pi/i.test(s)) return 'Embedded';
    if (/ece|electronics|circuit|microprocessor|verilog|vhdl|vlsi/i.test(s)) return 'ECE & Hardware';
    
    if (/terminal|bash|shell|zsh|cli|command line/i.test(s)) return 'Terminal & CLI';
    if (/system design|architecture|distributed system/i.test(s)) return 'System Design';
    if (/cyber|security|hacking|penetration|network/i.test(s)) return 'Security';
    if (/blockchain|web3|crypto|solidity|ethereum/i.test(s)) return 'Blockchain';
    
    if (/product management|product owner|agile|scrum/i.test(s)) return 'Product Management';
    if (/marketing|seo|social media|growth|ads|youtube|video/i.test(s)) return 'Marketing';
    if (/business|startup|finance|management|mba/i.test(s)) return 'Business';
    
    if (/gate|upsc|exam|test|prep|certification|certified/i.test(s)) return 'Exam Prep';
    if (/freelan|placement|career|interview|job|resume|aptitude/i.test(s)) return 'Career';
    if (/open source|github|git /i.test(s)) return 'Open Source';
    if (/design|ui|ux|figma|graphic|adobe|product design/i.test(s)) return 'Design';
    
    return 'Other';
};
