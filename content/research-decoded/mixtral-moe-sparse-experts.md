---
title: "Mixtral 8x7B: SMoE"
authors: "Jiang et al. (2024)"
citation: "Jiang, A. Q., Sablayrolles, A., Roux, A., Mensch, A., Savary, B., Bamford, C., ... & Lacroix, T. (2024). Mixtral of experts. arXiv preprint arXiv:2401.04088."
link: "https://arxiv.org/abs/2401.04088"
slug: "mixtral-moe-sparse-experts"
heroImage: "https://ar5iv.labs.arxiv.org/html/2401.04088/assets/images/smoe.png"
---

# Mixtral 8x7B: SMoE

The 2024 paper 'Mixtral of Experts' by the Mistral AI team introduced a significant pivot in the architecture of Large Language Models, moving away from the 'brute force' scaling of dense Transformers. Before this work, the industry standard for high-performance open models was defined by dense architectures like Llama 2 70B, where every single parameter is activated for every token processed. This created a linear 'compute tax,' where increasing a model's capacity directly increased the computational cost of inference, making 70B+ models prohibitively expensive for low-latency or high-throughput applications. This status quo assumed that intelligence was a monolithic signal that required the full weight of the network's parameters to be applied to every piece of information, regardless of its complexity or context.

## Sparse Mixture-of-Experts {#sparse-moe}

![Mixture of Experts Layer: a router assigns each input to 2 out of 8 experts, allowing for high capacity with low computational cost.](https://ar5iv.labs.arxiv.org/html/2401.04088/assets/images/smoe.png)

_Mixture of Experts Layer: a router assigns each input to 2 out of 8 experts, allowing for high capacity with low computational cost._

Mixtral 8x7B decoupled a model's total capacity from its active compute requirements by replacing standard feed-forward blocks with a Sparse Mixture-of-Experts (SMoE) layer. In this architecture, a routing network identifies the two most relevant "experts" out of eight for every individual token, producing a weighted sum of their outputs while leaving the remaining six idle. This mechanism allows the model to maintain a massive 47-billion parameter knowledge base while only activating 13 billion parameters during the actual math of inference, matching the speed and latency of a significantly smaller dense model. This shift toward selective activation revealed that the most effective way to scale a network is to organize its parameters into specialized units that are only called upon when relevant to the current task, rather than forcing the full weight of the network onto every piece of information.

## Decoupling Parameters from Compute {#parameter-decoupling}

The abstraction enabled by this discovery was the formal decoupling of a model's total parameters from its active compute requirements. This allowed Mixtral to match or exceed the performance of much larger dense models like Llama 2 70B while maintaining the inference speed and latency of a significantly smaller 13B parameter system. This finding demonstrated that a model's 'knowledge base' can be spread across a wide, sparse array of specialized units that are only called upon when relevant to the current task. It suggested that the bottleneck in AI was not a lack of total parameters, but the inefficiency of activating those parameters for every single calculation. By allowing the model to 'route' its way through a vast internal network, researchers could achieve a level of efficiency that was previously thought to be impossible at this scale.

## Syntactic Specialization {#syntactic-specialization}

![Expert selection appears aligned with syntax rather than domain, with specific structural roles handled by the same experts across different topics.](https://ar5iv.labs.arxiv.org/html/2401.04088/assets/images/routing-sample.png)

_Expert selection appears aligned with syntax rather than domain, with specific structural roles handled by the same experts across different topics._

A final technical detail is the discovery that expert specialization in SMoE layers is primarily syntactic rather than domain-specific. Contrary to the hypothesis that different experts would handle different topics like math or philosophy, the researchers found that the router's assignments were nearly identical across diverse datasets. Instead, experts appear to specialize in structural roles, such as handling specific keywords or grammatical patterns within the input sequence. While the Mixture-of-Experts approach decouples compute from parameters, it does not reduce the VRAM requirements, as the full weight of all eight experts must still be stored in memory. This trade-off between memory and math suggests that the true bottleneck for the democratization of AI may be moving from the processor to the memory bus. The future of sparse models likely depends on a radical rethinking of how hardware stores and accesses 'inactive' knowledge as these architectural constraints become more pronounced.

## Resources

- [Mistral AI Blog: Mixtral](https://mistral.ai/news/mixtral-of-experts/) {type: article, provider: Mistral AI}
- [Mixtral MoE Paper (arXiv)](https://arxiv.org/abs/2401.04088) {type: article, provider: arXiv}
