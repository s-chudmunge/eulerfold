---
title: "Eliminating the Bottleneck: Jonathan Ross and the LPU Paradigm"
slug: "jonathan-ross-lpu-architecture"
shortSlug: "ross"
author: "EulerFold"
date: "May 9, 2026"
category: "Profiles"
heroImage: "https://images.openai.com/static-rsc-4/yuuAsT6lPwZLoD3yiToZ5jnzIbSvQ1KySDMMtCWrfOVyHTAaquyQ8-o6m7Hw7DmntW8QbA_3hFNbeApDTKow6qRL7ibnW8Hb6dahB1rMlL9qRUXV7ZvBjqb55gN5hoBn3hBw-lpk5XQFYXk0n7BapKRNeU0mJfxSlzDyN2BAQqFHWToR5WwyNCwe1K_zX2ra?purpose=fullsize"
excerpt: "A profile of Jonathan Ross, the architect of Google's TPU who founded Groq to build a deterministic Language Processing Unit for ultra-low latency inference."
technicalInsight: "The Groq LPU eliminates latency bottlenecks by using a deterministic architecture where software pre-plans every nanosecond of compute flow."
synonyms:
  - "Jonathan Ross"
  - "Groq"
  - "LPU"
  - "TPU"
  - "Language Processing Unit"
  - "SRAM"
---

Jonathan Ross doesn't move like a CEO. He moves like a man who just stole the crown jewels and is looking for the nearest exit. 

In the late hours of September 1, 2016, Ross sat across from billionaire Chamath Palihapitiya. He didn't have a slide deck. He didn't have a legal entity. He had a whiteboard and a vision for a chip that would make the world’s most powerful computers look like they were running on dial-up. 

By the time the sun came up, Palihapitiya had signed a $10 million seed term sheet. The heist was on. 

Ross’s target wasn't a bank. It was Google. Specifically, the "Google Wisconsin" office in Madison, the secretive outpost where the world’s most advanced AI hardware—the Tensor Processing Unit (TPU)—had been built. Ross had been the co-founder of that project, the architect who had secretly designed the first TPU during his "20% time" while his managers weren't looking. 

But Google had become a "successful disaster." The success of the TPU meant it was now trapped in a labyrinth of corporate approvals. Ross wanted out. And he wanted his team. 

In the month that followed the $10 million wire, Ross and Palihapitiya systematically raided his former employer. They successfully poached **eight of the ten original members** of the Google TPU team, including Douglas Wightman. They set up shop in a spartan shared office on Castro Street in Mountain View. 

They called the new company **Groq**. Their mission: to build a "Language Processing Unit" (LPU) that would destroy the bottleneck of AI latency. 



### Part I: The Rosebud Moment and the High School Dropout

The defining moment of Jonathan Ross’s life did not happen in a server farm. It happened in a public high school classroom.

Ross was a restless teenager, someone whose mind moved at a different cadence than the curriculum allowed. One afternoon, while staring at the clock, he felt a sharp, profound clarity. He realized he was "trading his time for a piece of paper"—a diploma. 

In what he now calls his "Rosebud" moment, Ross dropped out. He didn't have a plan; he simply refused to wait. This visceral hatred of bottlenecks drove him to teach himself to code, eventually leading him to the Courant Institute at NYU. There, he became the first undergraduate permitted to take PhD-level courses under Yann LeCun. But history repeated itself: the "paper" of a degree felt like another bottleneck. He dropped out of NYU, too, refusing to "cap his earning opportunity by graduating."

### Part II: The Successful Disaster at Google

By 2013, Ross was at Google. While others were fine-tuning ads, Ross was listening to the speech recognition teams. They were terrified. If voice search took off, Google would have to double its data center capacity overnight. 

Ross used his "20% time" to design the TPU, reviving a "systolic array" architecture that others had dismissed as a relic of the 80s. The result was a revelation, eventually powering over 50% of Google's AI compute. But for Ross, the success was a "disaster." 

"In order for me to do something inside, I had to get a whole bunch of people to say yes," Ross explained. It was a system of "Ands"—Engineering *and* Product *and* Finance. He realized that leaving was an "Or" decision. He only needed *one* VC to say yes.

In 2016, he walked. Shortly after his departure, Google made a desperate move to bring him back, offering a **$10 million counter-offer**. Ross turned it down without a second thought. "If I take that money, I’m working with people who are playing it safe," he said. He wanted the "Velocity of Light."

### Part III: The 18-Wheeler vs. The Delivery Van

The "Groq Logic" is a direct reaction to the industry leader, NVIDIA. 

"NVIDIA’s general-purpose GPUs are 18-wheelers," Ross frequently tells his engineers. "They are great for bulk hauling—the massive work of training an AI model. But inference—the moment the AI actually talks back to you—is last-mile delivery. Using an 18-wheeler to deliver a pizza is slow, expensive, and clumsy."

The Groq LPU is the delivery van. It is a "deterministic" machine. While NVIDIA's chips use complex "traffic control" (caches and schedulers) to guess what the AI will do next, the Groq LPU is like a high-speed train on a dedicated track. Every processor knows exactly what to do and when to do it because the software compiler has pre-planned every nanosecond. 

The results are jarring. While a standard GPU might generate 50 words per second, a Groq LPU can hit 500. It turns a "typing machine" into an "instant conversation." This speed attracted a surreal coalition of backers, from BlackRock to Jay-Z’s Marcy Venture Partners.

### Part IV: Sovereign AI and the $20 Billion Twist

By 2024, Ross’s mission had turned geopolitical. He became the face of **"Sovereign AI,"** standing in Riyadh to secure a **$1.5 billion commitment** from Saudi Arabia to build the world's largest inference data center. He met with the White House for the "Genesis Mission," arguing that compute was the new oil.

But every great heist movie has a final twist. 

On **December 24, 2025**, the rivalry between Ross and NVIDIA’s Jensen Huang ended in a way no one expected. NVIDIA, the $3 trillion giant Ross had spent years critiquing, paid roughly **$20.6 billion** in a "reverse acqui-hire" and licensing deal. 

The deal was structured to bypass tightening antitrust regulations. NVIDIA didn't just buy the IP; they hired **80% to 90% of Groq’s workforce**. Jonathan Ross joined NVIDIA as **Chief Software Architect**, essentially taking the keys to the world's most powerful compute empire. 

He had gone from dropping out of high school to being the man who designs the brain of the global economy. 

### Part V: The Fearless Pace

Today, Ross still wears the plain T-shirt and jeans. He still consumes two audiobooks a week, constantly seeking wisdom from outside the tech bubble. His "Broadcast, Don't Whisper" policy now echoes through the halls of NVIDIA.

"Anxiety, worry, and terror are all the same thing," Ross says of the pressure. "If you're not feeling fear, then you're not doing anything important." 

For the man who poach-hired his own team and out-latenced the entire industry, the heist is finally over. He didn't just steal the future from Google; he sold it to the world. 
