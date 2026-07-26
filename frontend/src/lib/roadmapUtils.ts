export const getCategory = (subject?: string, title?: string, description?: string, goal?: string) => {
    const s = `${subject || ''} ${title || ''} ${description || ''} ${goal || ''}`.toLowerCase().trim();
    if (!s) return 'Other';
    
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
    if (/\bcat\b/i.test(s)) return 'CAT';
    
    if (/clat/i.test(s)) return 'CLAT';
    if (/gre/i.test(s)) return 'GRE';
    if (/gmat/i.test(s)) return 'GMAT';
    if (/\bsat\b/i.test(s)) return 'SAT';
    
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

export const matchesCategory = (
    category: string, 
    subject?: string, 
    title?: string, 
    description?: string, 
    goal?: string
): boolean => {
    if (category === 'all' || category === 'All Courses') return true;
    const s = `${subject || ''} ${title || ''} ${description || ''} ${goal || ''}`.toLowerCase();
    
    switch (category) {
        case 'Programming':
            return /programming|program|code|coding|software|develop|developer|algorithm|data structure|dsa|c\+\+|cpp|python|java|rust|\bgo\b|golang|typescript|javascript|ruby|c#|csharp|php|swift|kotlin/i.test(s);
        case 'TypeScript':
            return /typescript|\bts\b/i.test(s);
        case 'Rust':
            return /rust|cargo/i.test(s);
        case 'Go':
            return /\bgo\b|golang/i.test(s);
        case 'Python':
            return /python|django|fastapi|flask|pytorch|pandas/i.test(s);
        case 'Java':
            return /\bjava\b|spring|jvm|kotlin|maven|gradle/i.test(s);
        case 'C++':
            return /c\+\+|cpp|c plus plus/i.test(s);
        case 'Frontend':
            return /frontend|front-end|web|html|css|javascript|typescript|react|vue|angular|tailwind|nextjs|next\.js|dom/i.test(s);
        case 'React':
            return /react|nextjs|next\.js|jsx|redux/i.test(s);
        case 'Vue/Angular':
            return /vue|nuxt|angular|svelte/i.test(s);
        case 'Backend':
            return /backend|back-end|server|express|django|fastapi|flask|spring|laravel|rails|\bnode\b|nodejs|graphql|rest api|api/i.test(s);
        case 'Node.js':
            return /\bnode\b|nodejs|node\.js|express|nest|nestjs/i.test(s);
        case 'SQL & Database':
            return /sql|database|postgres|postgresql|mysql|mongodb|redis|sqlite|dbms|nosql|cassandra/i.test(s);
        case 'Terminal & CLI':
            return /terminal|cli|bash|shell|zsh|command line|linux|unix|powershell/i.test(s);
        case 'AI/ML':
            return /\bai\b|ml|machine learning|artificial intelligence|neural|deep learning|pytorch|tensorflow|keras|scikit-learn|model|llm|generative ai|nlp/i.test(s);
        case 'Computer Vision':
            return /computer vision|\bcv\b|opencv|image recognition|object detection|cnn|yolo/i.test(s);
        case 'LLMs & Generative AI':
            return /llm|generative ai|genai|prompt|gpt|chatgpt|openai|claude|gemini|langchain|llama|rag|transformer/i.test(s);
        case 'NLP':
            return /nlp|natural language|text processing|sentiment analysis|linguistics|transformer/i.test(s);
        case 'Deep Learning':
            return /deep learning|neural network|pytorch|tensorflow|keras|cnn|rnn|lstm|transformer/i.test(s);
        case 'Data Science':
            return /data science|data analysis|analytics|pandas|numpy|matplotlib|seaborn|visualization|statistics/i.test(s);
        case 'Data Engineering':
            return /data engineering|etl|pipeline|airflow|spark|hadoop|big data|dbt|snowflake|kafka/i.test(s);
        case 'System Design':
            return /system design|architecture|distributed system|microservices|scalability|load balancing|caching/i.test(s);
        case 'Cloud':
            return /cloud|aws|azure|gcp|google cloud|amazon web services|serverless|lambda|iaas|terraform/i.test(s);
        case 'AWS/Azure/GCP':
            return /aws|azure|gcp|google cloud|amazon web services|ec2|s3|lambda|kubernetes/i.test(s);
        case 'DevOps':
            return /devops|ci\/cd|pipeline|jenkins|github actions|docker|kubernetes|k8s|terraform|ansible|monitoring/i.test(s);
        case 'Docker & K8s':
            return /docker|kubernetes|k8s|container|containerization|helm|pod/i.test(s);
        case 'SRE':
            return /sre|reliability|observability|monitoring|prometheus|grafana|incident|sla|slo/i.test(s);
        case 'Security':
            return /security|cybersecurity|cyber|infosec|hacking|ethical hacking|penetration|pentest|network security|cryptography|owasp/i.test(s);
        case 'Cybersecurity':
            return /cybersecurity|cyber|security|infosec|hacking|penetration|pentest|network security|owasp|soc|malware/i.test(s);
        case 'Mobile':
            return /mobile|ios|android|flutter|react native|swift|kotlin|app development/i.test(s);
        case 'iOS/Android':
            return /ios|android|swift|kotlin|mobile|xcode|android studio/i.test(s);
        case 'Flutter':
            return /flutter|dart|mobile|cross platform/i.test(s);
        case 'Blockchain':
            return /blockchain|crypto|web3|bitcoin|ethereum|solidity|smart contract|defi|nft/i.test(s);
        case 'Web3':
            return /web3|blockchain|crypto|ethereum|solidity|smart contract|dapp|decentralized/i.test(s);
        case 'Quantum':
            return /quantum|qiskit|qudit|qubit|quantum computing/i.test(s);
        case 'Science':
            return /science|biology|chemistry|physics|neuroscience|astronomy|scientific|research|medical|biotech/i.test(s);
        case 'Physics':
            return /physics|mechanics|quantum|thermodynamics|electromagnetism|astrophysics|relativity/i.test(s);
        case 'Mathematics':
            return /mathematics|math|calculus|linear algebra|algebra|geometry|probability|statistics|discrete math|trigonometry|differential equations/i.test(s);
        case 'Game Dev':
            return /game dev|game development|unity|unreal|godot|game engine|c#|c\+\+|shader|gamedev/i.test(s);
        case 'Unity/Unreal':
            return /unity|unreal|unreal engine|godot|c#|c\+\+|blueprint|game dev/i.test(s);
        case 'ECE & Hardware':
            return /ece|electronics|hardware|circuit|microprocessor|verilog|vhdl|vlsi|embedded|pcb|semiconductor/i.test(s);
        case 'Embedded':
            return /embedded|microcontroller|arduino|raspberry pi|firmware|esp32|arm|c\+\+|real-time/i.test(s);
        case 'IoT':
            return /iot|internet of things|sensor|arduino|esp32|mqtt|raspberry pi|smart home/i.test(s);
        case 'Robotics':
            return /robotics|robot|ros|ros2|automation|mechatronics|kinematics|computer vision/i.test(s);
        case 'AR/VR':
            return /ar\/vr|augmented reality|virtual reality|metaverse|oculus|openxr|spatial computing|unity/i.test(s);
        case 'Design':
            return /design|ui\/ux|ui|ux|user interface|user experience|figma|graphic design|product design|adobe|photoshop/i.test(s);
        case 'UI/UX':
            return /ui\/ux|ui|ux|user interface|user experience|figma|wireframing|prototyping|usability|product design/i.test(s);
        case 'Product Management':
            return /product management|product manager|pm|agile|scrum|product roadmap|user story|backlog/i.test(s);
        case 'Marketing':
            return /marketing|seo|content marketing|social media|growth|ads|advertising|branding|analytics|copywriting/i.test(s);
        case 'Business':
            return /business|startup|management|entrepreneurship|strategy|mba|sales|finance|leadership|operations/i.test(s);
        case 'Finance':
            return /finance|financial|accounting|investing|stock|trading|economics|fintech|banking|valuation/i.test(s);
        case 'JEE':
            return /jee|iit|iit jee|mains|advanced|joint entrance/i.test(s);
        case 'NEET':
            return /neet|aiims|medical entrance|mbbs/i.test(s);
        case 'UPSC':
            return /upsc|cse|ias|ips|civil services|general studies|prelims/i.test(s);
        case 'GATE':
            return /gate|graduate aptitude/i.test(s);
        case 'CAT':
            return /\bcat\b|cat exam|iim|mba entrance/i.test(s);
        case 'CLAT':
            return /clat|law entrance|llb/i.test(s);
        case 'GRE':
            return /gre|graduate record/i.test(s);
        case 'GMAT':
            return /gmat|mba admissions/i.test(s);
        case 'SAT':
            return /\bsat\b|scholastic assessment/i.test(s);
        case 'Exam Prep':
            return /exam|prep|test|certification|certified|jee|neet|upsc|gate|\bcat\b|clat|gre|gmat|\bsat\b|ssc|ibps|bank po/i.test(s);
        case 'Career':
            return /career|interview|job|resume|placement|freelance|freelancing|aptitude|soft skills|salary|promotion/i.test(s);
        case 'Productivity':
            return /productivity|time management|habit|focus|goal setting|organization|notion|workflow/i.test(s);
        case 'Open Source':
            return /open source|opensource|git|github|gitlab|contribution|pull request|foss/i.test(s);
        case 'Other':
            return true;
        default:
            return getCategory(subject, title, description, goal) === category;
    }
};

