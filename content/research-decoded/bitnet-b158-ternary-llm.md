---
title: "Computing with Just 1 Bit"
authors: "Shuming Ma et al. (Microsoft Research, 2024)"
citation: "Ma, S., et al. (2024). The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits. arXiv preprint arXiv:2402.17764."
link: "https://arxiv.org/abs/2402.17764"
slug: "bitnet-b158-ternary-llm"
heroImage: "https://arxiv.org/html/2402.17764v1/x1.png"
---

In 2024, researchers at Microsoft Research established that large language models can achieve parity with full-precision architectures while utilizing only 1.58 bits per parameter. By restricting weights to the ternary set $\{-1, 0, 1\}$, BitNet b1.58 shatters the reliance on high-precision floating-point arithmetic. This shift replaces energy-intensive multiplications with simple integer additions and subtractions, enabling a 71-fold reduction in arithmetic energy consumption compared to FP16 baselines. This work demonstrates that the high precision of traditional models is largely redundant, and that the core patterns of language can be captured through low-precision, high-capacity architectures.

## Ternary Weights and the Power of Zero {#ternary-mechanism}

The fundamental innovation of BitNet b1.58 is the introduction of a third state—zero—into the 1-bit weight regime. While original 1-bit models utilized binary weights ($\{-1, 1\}$), the inclusion of 0 provides the model with a "feature filtering" mechanism. This allows individual parameters to be effectively deactivated if they do not contribute to the final output, significantly increasing the model's representational capacity without increasing its bit-depth. The significance of this addition is reflected in the name: $\log_2(3) \approx 1.58$ bits. This methodological choice proved that the bottleneck for efficient AI is often the inability of binary systems to represent the "absence" of signal, and that ternary logic provides a more robust foundation for high-dimensional learning.

## BitLinear Transformations and Gradient Propagation {#bitlinear}

The architecture replaces standard linear layers with specialized BitLinear layers that perform 1.58-bit matrix multiplication. While the weights are ternary, the system utilizes 8-bit precision for activations to ensure that the information passing through the network maintains enough resolution for complex reasoning. During training, the model uses a "Straight-Through Estimator" (STE) to propagate gradients through the non-differentiable quantization functions. This engineering choice allows the model to learn effective ternary representations from scratch rather than relying on the performance loss of post-training quantization. It established the principle that high-fidelity intelligence is an emergent property of the model's structural constraints during the optimization phase.

## Energy Efficiency and the End of Multiplication {#energy-scaling}

The most profound impact of BitNet b1.58 is its fundamental shift in hardware utilization. In a standard Transformer, matrix multiplication is the most compute-intensive operation. By limiting weights to $\{-1, 0, 1\}$, these operations simplify to addition, subtraction, or no action at all. The researchers reported that this simplification leads to a massive reduction in the energy required for data movement, which currently accounts for the bulk of the power draw in AI data centers. This finding revealed that the future of high-performance AI lies in the transition from floating-point dominance to ternary integer arithmetic, effectively moving the primary cost of intelligence from the processor's logic units to the memory bus.

## Scaling Parity and the 1-Bit Frontier {#significance}

The technical significance of this result is the demonstration that 1.58-bit models follow the same scaling laws as their full-precision counterparts. Large-scale evaluations proved that as the number of parameters increases, the performance gap between BitNet and FP16 models disappears. This realization remains the central theme for the development of the next generation of pervasive AI, where 70B+ parameter models could potentially run on edge devices with minimal power draw. It leaves open the question of whether dedicated ternary hardware (ASICs) will be developed to natively support these architectures, or if the current generation of GPUs will be adapted to handle 1.58-bit computation with higher efficiency.

## Resources

- [The Era of 1-bit LLMs (Official arXiv)](https://arxiv.org/abs/2402.17764) {type: article, provider: arXiv}
- [BitNet: Scaling 1-bit Transformers (arXiv)](https://arxiv.org/abs/2310.11453) {type: article, provider: arXiv}
- [Understanding 1-bit LLMs (Hugging Face Blog)](https://huggingface.co/blog/1-bit-llms) {type: article, provider: Hugging Face}
- [The Death of Floating Point? (Video)](https://www.youtube.com/watch?v=F3_6A0e4SUI) {type: video, provider: YouTube}
