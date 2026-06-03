---
title: "Near-Memory and In-Memory Computing"
slug: "near-memory-computing"
shortSlug: "near-memory"
author: "Sankalp — Engineering Lead"
date: "May 31, 2026"
subject: "Computer Science"
heroImage: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=2000&auto=format&fit=crop"
excerpt: "Moving data is 100x more expensive than computing it, forcing an architectural reversal from centralized GPUs to in-memory processing."
technicalInsight: "Samsung HBM-PIM and SK Hynix AiM reduce power consumption by up to 80% by embedding MAC-capable ALUs directly within the memory die."
synonyms:
  - "Near-Memory Computing"
  - "PIM"
  - "HBM-PIM"
  - "AiM"
  - "Energy Efficiency"
---

Modern computer architecture is defined by the separation of the processor and the memory. The processor is the "brain" where calculations occur, while the memory is a separate workspace where data is stored. For a computer to perform even the simplest task, it must move data from the memory to the processor, perform a calculation, and then move the result back. This movement happens over a communication channel known as a bus.

Historically, the time and energy required to move data across this bus were negligible. But as AI models have scaled to include billions of parameters, the volume of data being shuffled back and forth has created a massive logistical bottleneck. Moving data across a motherboard now requires significantly more energy than the calculation itself. We have reached an architectural limit where the physical distance between the data and the processor is the primary constraint on performance.

The most expensive operation in a modern AI data center is not a matrix multiplication or a complex non-linear activation; it is the simple act of moving 64 bits of data across a PCB trace. Bill Dally’s research on energy metrics reveals a brutal disparity: a 64-bit floating-point operation on a 7nm process costs approximately 20 picojoules (pJ). Fetching those same 64 bits from DRAM costs between 1,000 and 1,300 pJ. In the economy of power, data movement is 50 to 100 times more expensive than the math itself.

This "distance tax" has reached a breaking point for AI scaling. In a standard Von Neumann architecture, the separation of the processor and the memory creates a bottleneck where 90% of the energy budget is spent on "transportation" rather than "transformation." This physical constraint is forcing an architectural reversal: instead of dragging the data to the processor, we are beginning to move the compute to the data.

Production-grade Processing-In-Memory (PIM) is no longer a theoretical pursuit. Samsung's [HBM-PIM](https://news.samsung.com/global/samsung-brings-in-memory-processing-power-to-wider-range-of-applications), integrated into AMD MI100 accelerators, has demonstrated a 2.55x performance speedup on Mixture of Experts (MoE) workloads while improving energy efficiency by 2.67x. By embedding programmable computing units directly within the HBM dies, the architecture eliminates the high-energy trip across the external memory bus. Similarly, SK Hynix’s [Accelerator-in-Memory (AiM)](https://arxiv.org/abs/2211.08615) has reported an 80% reduction in power consumption for LLM inference passes like Meta’s OPT-13B.

However, embedding compute into memory comes with severe constraints. The programmable logic inside a PIM module is inherently limited by the strict thermal and spatial budgets of densely stacked memory. You cannot run arbitrary code or complex branching logic inside an HBM die; the internal ALUs are typically restricted to simple, highly parallel operations like MAC (Multiply-Accumulate) instructions. Instead of serving as a clean, general-purpose replacement for the GPU, PIM forces a highly specialized architectural tradeoff, sacrificing programmability and flexibility to achieve raw efficiency in vector mathematics.

The move toward Near-Memory and In-Memory computing represents the first major departure from the Von Neumann model in 80 years. We are entering an era where hardware performance is measured in Joules per Operation rather than TFLOPS. As AI models scale toward trillions of parameters, the "Arithmetic Intensity" of our algorithms will be less important than the "Geometric Proximity" of our hardware. The sheer energy cost of distance makes the retreat from centralized compute a physical inevitability—meaning the throughput of our most capable models is now bottlenecked by the literal length of a wire.
