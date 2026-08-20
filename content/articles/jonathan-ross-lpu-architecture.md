---
title: "Jonathan Ross: LPU Architecture and High-Speed Inference"
slug: "jonathan-ross-lpu-architecture"
shortSlug: "ross"
author: "Sankalp Chudmunge — Engineering Lead"
date: "May 9, 2026"
subject: "Computer Science"
status: "archived"
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
In September 2016, Jonathan Ross secured a $10 million seed investment from venture capitalist Chamath Palihapitiya to fund a new hardware startup. Ross, a former Google engineer who co-founded and architected the original Tensor Processing Unit (TPU), aimed to develop a novel processor designed specifically for artificial intelligence inference tasks. 

Following the investment, Ross recruited several original members of the Google TPU team, including Douglas Wightman, to join the new venture, which they named Groq. Their primary objective was to design a "Language Processing Unit" (LPU) to minimize latency in AI applications.

### Early Background

Jonathan Ross dropped out of high school and later taught himself computer programming. He attended the Courant Institute at New York University, where he took advanced courses under Yann LeCun, before dropping out of the university as well to pursue professional opportunities.

### The Google TPU

Ross joined Google, where he observed the growing computational demands of speech recognition and AI services. Anticipating capacity constraints, he utilized Google's "20% time" policy to design the TPU. The architecture utilized a systolic array, an older design concept that proved highly effective for the matrix multiplication tasks fundamental to machine learning. 

The TPU was successfully deployed, eventually handling a significant portion of Google's AI compute workloads. However, Ross found the organizational structure and approval processes at Google increasingly restrictive, leading to his decision to leave the company in 2016 to found Groq, declining a substantial retention offer from Google.

### The Groq LPU Architecture

Groq's LPU architecture was developed in contrast to the general-purpose Graphics Processing Units (GPUs) produced by industry leader NVIDIA. While GPUs are highly effective for parallel processing and training massive AI models, Ross argued they were less efficient for inference—the process of running data through a trained model.

The Groq LPU utilizes a deterministic architecture. Unlike traditional GPUs that rely on complex caches and dynamic scheduling to manage data flow, the LPU relies on a software compiler to pre-plan the exact execution path and timing of operations at the nanosecond level. This deterministic approach eliminates the need for hardware-based traffic control, resulting in significantly lower latency and higher processing speeds for inference tasks. Benchmarks demonstrated the LPU's ability to generate text at substantially higher token rates compared to standard GPUs.

### Sovereign AI and Industry Consolidation

By 2024, Groq had positioned itself in the growing market for AI hardware, advocating for "Sovereign AI" infrastructure. Ross engaged with international governments, including securing a $1.5 billion commitment from Saudi Arabia to develop a large-scale inference data center.

In December 2025, NVIDIA acquired Groq's intellectual property and hired the vast majority of its workforce in a transaction valued at approximately $20.6 billion. The deal was structured as a reverse acqui-hire and licensing agreement. As part of the acquisition, Jonathan Ross joined NVIDIA as Chief Software Architect, integrating Groq's deterministic architecture into NVIDIA's broader compute ecosystem.
