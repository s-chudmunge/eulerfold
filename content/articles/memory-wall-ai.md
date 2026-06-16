---
title: "Why is the Memory Wall Bottlenecking AI?"
slug: "memory-wall-ai"
shortSlug: "memory-wall"
author: "Sankalp — Engineering Lead"
date: "May 31, 2026"
subject: "Computer Science"
heroImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2000&auto=format&fit=crop"
excerpt: "Increasing TFLOPS is an illusion when the bottleneck is memory bandwidth. H100 GPUs spend 95% of inference cycles idle, waiting for token weights."
technicalInsight: "The H100 ridge point is ~295 FLOPs/byte, while LLM inference has an arithmetic intensity of ~1, creating a severe compute starvation."
synonyms:
  - "Memory Wall"
  - "Arithmetic Intensity"
  - "H100"
  - "Roofline Model"
  - "LLM Inference"
---

For decades, the primary measure of a computer's power was its raw processing speed—how many billions of mathematical calculations it could perform per second. This metric, known as TFLOPS, was an accurate predictor of performance because software was usually limited by how fast a chip could "think." If you gave a computer a faster processor, the application would run proportionally faster.

In the era of Large Language Models, this relationship has broken down. The calculations required for AI inference are mathematically simple, but the models themselves are too large to fit inside the processor’s immediate workspace. This forces the chip to fetch weights from external memory for every single word it generates. We have reached a point where the processor’s ability to perform math has far outstripped the memory’s ability to deliver the numbers. The bottleneck is no longer the speed of the calculation, but the bandwidth of the channel supplying it.

In an NVIDIA H100 GPU, there is a massive imbalance between the "brain" and the "arteries." The H100 SXM5 can perform 989 TFLOPS of FP16 math, but its HBM3 memory can only deliver data at 3.35 TB/s. If you divide the compute peak by the bandwidth peak, you get a "Ridge Point" of approximately 295 FLOPs per byte. This number defines a brutal reality: if your AI kernel performs fewer than 295 math operations for every byte it reads from memory, the $30,000 GPU is effectively "starved." Its Tensor Cores will sit idle, waiting for the next byte to arrive.

This is the "Arithmetic Illusion" of modern AI hardware. We celebrate the leap in TFLOPS with each new generation, but for the most critical AI workload—LLM token generation—those TFLOPS are largely irrelevant. During the "decode" phase of inference, generating a single token requires reading every single weight of the model from memory to the cores. For a 70B parameter model, this results in an arithmetic intensity of roughly 1 FLOP per byte. Since 1 is far below the ridge point of 295, the H100 utilization during inference can drop as low as 3%, limited entirely by the speed of the memory bus.

This bottleneck is widening. As predicted by William Wulf and Sally McKee in their 1995 paper [Hitting the Memory Wall](https://dl.acm.org/doi/10.1145/216128.216145), hardware is getting faster at math much more quickly than it is getting faster at moving data. From the A100 to the H100, compute performance scaled by 3.2x, while memory bandwidth only scaled by 1.6x. The "Ridge Point" nearly doubled, meaning more and more algorithms are falling into the "Memory-Bound" region of the Roofline model. A kernel that was compute-bound on an A100 often becomes memory-bound on an H100, resulting in zero performance gain despite the superior specs of the newer chip.

Overcoming the memory wall dictates a pivot from maximizing raw compute to optimizing mathematical efficiency. Techniques like FP8 quantization and KV-cache compression matter more than the TFLOPS on the spec sheet; cutting the bit-width of a model in half doubles token generation speed simply by halving the transportation tax on the memory bus. This physical constraint is already forcing the retirement of the Transformer architecture in favor of State Space Models like Mamba, which abandon the bandwidth-heavy KV cache entirely to adopt a constant-state memory footprint.
