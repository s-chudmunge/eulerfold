---
title: "The Distance Tax of Modern Computer Architecture"
slug: "near-memory-computing"
shortSlug: "near-memory"
author: "Sankalp — Engineering Lead"
date: "May 31, 2026"
subject: "Computer Science"
heroImage: "/images/articles/hero_near_memory.jpg"
excerpt: "Moving data is 100x more expensive than computing it, forcing an architectural reversal from centralized GPUs to in-memory processing."
technicalInsight: "Samsung HBM-PIM and SK Hynix AiM significantly reduce power consumption and data transfer latency by embedding MAC-capable ALUs directly within the memory die."
synonyms:
  - "Near-Memory Computing"
  - "PIM"
  - "HBM-PIM"
  - "AiM"
  - "Energy Efficiency"
---

Modern computer architecture is defined by the separation of the processor and the memory. The processor is the "brain" where calculations occur, while the memory is a separate workspace where data is stored. For a computer to perform even the simplest task, it must move data from the memory to the processor, perform a calculation, and then move the result back. This movement happens over a communication channel known as a bus.

> **The Bus:** In computer hardware, a bus is a physical set of microscopic wires or copper traces on a circuit board that acts as a highway for data. Just like a real highway, it has a speed limit (bandwidth) and can get severely congested when moving massive AI models.

Historically, the time and energy required to move data across this bus were negligible. But as AI models have scaled to include billions of parameters, the volume of data being shuffled back and forth has created a massive logistical bottleneck. Moving data across a motherboard now requires significantly more energy than the calculation itself. We have reached an architectural limit where the physical distance between the data and the processor is the primary constraint on performance.

The most expensive operation in a modern AI data center is not a matrix multiplication or a complex non-linear activation; it is the simple act of moving 64 bits of data across a PCB trace. Bill Dally’s research on energy metrics reveals a brutal disparity: a 64-bit floating-point operation on a 7nm process costs approximately 20 picojoules (pJ). Fetching those same 64 bits from DRAM costs between 1,000 and 1,300 pJ. In the economy of power, data movement is 50 to 100 times more expensive than the math itself.

![The classic Von Neumann Architecture diagram. The physical separation between the CPU and Memory is the root cause of the modern data-movement bottleneck.](https://upload.wikimedia.org/wikipedia/commons/e/e5/Von_Neumann_Architecture.svg)

This "distance tax" has reached a breaking point for AI scaling. In a standard Von Neumann architecture, the separation of the processor and the memory creates a bottleneck where 90% of the energy budget is spent on "transportation" rather than "transformation." 

> **Von Neumann Architecture:** Named after mathematician John von Neumann in 1945, this is the foundational blueprint of almost all modern computers. Its defining feature is that the processor (CPU/GPU) and the memory (RAM) are physically distinct components. The "Von Neumann bottleneck" occurs when the processor is so fast that it spends most of its time idle, waiting for the memory to deliver data.

This physical constraint is forcing an architectural reversal: instead of dragging the data to the processor, we are beginning to move the compute to the data.

Production-grade Processing-In-Memory (PIM) is no longer a theoretical pursuit. Samsung's [HBM-PIM](https://news.samsung.com/global/samsung-brings-in-memory-processing-power-to-wider-range-of-applications), integrated into AMD MI100 accelerators, has demonstrated a 2.55x performance speedup on Mixture of Experts (MoE) workloads while improving energy efficiency by 2.67x. 

> **HBM and PIM:** **HBM (High Bandwidth Memory)** is a way of stacking memory chips vertically like a skyscraper, rather than laying them flat, allowing for massive data storage physically close to a processor. **PIM (Processing-In-Memory)** takes this a step further by embedding tiny calculators *inside* the memory skyscraper itself, completely eliminating the need to transport data outside.

By embedding programmable computing units directly within the HBM dies, the architecture eliminates the high-energy trip across the external memory bus. Similarly, SK Hynix’s Accelerator-in-Memory (AiM) technology [significantly reduces power consumption and data transfer latency](https://ieeexplore.ieee.org/document/9251855) for memory-bound machine learning tasks by integrating multiply-accumulate (MAC) units directly into the DRAM.

However, embedding compute into memory comes with severe constraints. The programmable logic inside a PIM module is inherently limited by the strict thermal and spatial budgets of densely stacked memory. You cannot run arbitrary code or complex branching logic inside an HBM die; the internal ALUs are typically restricted to simple, highly parallel operations like MAC (Multiply-Accumulate) instructions. 

> **MAC and ALU:** A **MAC (Multiply-Accumulate)** is the most fundamental mathematical operation in AI. When a neural network makes a prediction, it multiplies numbers (weights) and adds them up (accumulate) billions of times. An **ALU (Arithmetic Logic Unit)** is the actual physical hardware circuit that performs this math.

Instead of serving as a clean, general-purpose replacement for the GPU, PIM forces a highly specialized architectural tradeoff, sacrificing programmability and flexibility to achieve raw efficiency in vector mathematics.

## Why LLMs Forced the Paradigm Shift

For years, PIM was a fascinating theoretical concept searching for a killer application. That application arrived with Large Language Models (LLMs). Older AI architectures, like Convolutional Neural Networks (CNNs) used in image processing, are heavily *compute-bound*. They fetch a small matrix of data and perform thousands of complex operations on it, perfectly suiting standard GPUs. 

Conversely, LLMs generating text token-by-token are notoriously *memory-bandwidth bound*. During inference, the GPU must fetch massive weight matrices from memory for every single word generated, performing relatively simple math before immediately discarding them and fetching the next massive matrix. It is this specific architectural quirk of the Transformer model that made the Memory Wall an existential threat to the AI industry overnight.

## The Software Compiler Nightmare

While the hardware is finally catching up, the software stack remains the critical bottleneck. A developer cannot simply write a standard PyTorch script and expect it to automatically utilize PIM. 

Current AI compilers are designed for a monolithic paradigm: send all data to the GPU, execute the computational graph, and retrieve the result. PIM requires a completely fractured compiler logic. The software must dynamically analyze the execution graph, identify which sub-graphs are simple memory-bound matrix multiplications (and route them directly to the HBM dies), and which sub-graphs require complex non-linear activation functions (and route those to the central GPU cores). Until the software API layer can seamlessly abstract this complex routing away from the end-user, near-memory hardware will remain trapped in specialized, highly customized deployments.
The move toward Near-Memory and In-Memory computing represents the first major departure from the Von Neumann model in 80 years. We are entering an era where hardware performance is measured in Joules per Operation rather than TFLOPS. As AI models scale toward trillions of parameters, the "Arithmetic Intensity" of our algorithms will be less important than the "Geometric Proximity" of our hardware. 

> **Arithmetic Intensity:** This is a ratio measuring how much math a processor performs for every byte of data it fetches from memory. A high arithmetic intensity means the processor fetches a small amount of data and crunches it for a long time (ideal for standard GPUs). Modern AI models often have a *low* arithmetic intensity, meaning they are constantly stalled waiting for massive amounts of new data to arrive just to do simple math.

The sheer energy cost of distance makes the retreat from centralized compute a physical inevitability—meaning the throughput of our most capable models is now bottlenecked by the literal length of a wire.
