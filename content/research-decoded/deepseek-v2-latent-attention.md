---
title: "DeepSeek-V2: Latent Attention"
authors: "DeepSeek-AI (2024)"
citation: "DeepSeek-AI. (2024). DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model. arXiv preprint arXiv:2405.04434."
link: "https://ar5iv.org/abs/2405.04434"
slug: "deepseek-v2-latent-attention"
heroImage: "https://ar5iv.labs.arxiv.org/html/2405.04434/assets/x1.png"
---

# DeepSeek-V2: Latent Attention

The primary constraint on the deployment of long-context large language models is the "KV cache bottleneck," where the memory required to store the Keys and Values for every token in a sequence grows linearly with context length. In standard architectures, this memory footprint can exceed the capacity of high-end GPUs, forcing a trade-off between the number of concurrent users and the length of the documents the model can process. DeepSeek-V2 addresses this engineering hurdle by moving away from standard Multi-head Attention toward a low-rank joint compression mechanism called Multi-head Latent Attention (MLA).

## Multi-head Latent Attention {#multi-head-latent-attention}

![MLA architecture: compressing KV heads into a latent vector to slash memory costs.](https://ar5iv.labs.arxiv.org/html/2405.04434/assets/x2.png)

_MLA architecture: compressing KV heads into a latent vector to slash memory costs._

The technical core of MLA is the compression of individual key and value heads into a shared, low-rank latent vector. In a traditional Transformer, each attention head maintains its own high-dimensional key and value vectors, which are cached for every token in the sequence. MLA projects these vectors into a compressed latent space during the caching phase and only expands them back to their full rank during the actual attention calculation. This architectural adjustment reduces the KV cache footprint by over 90% compared to standard Multi-head Attention, while maintaining the expressive power of a full-rank system. It proves that the informational content of the KV cache is significantly more redundant than previously assumed.

To ensure that positional information does not interfere with this compression, DeepSeek-V2 utilizes a Decoupled Rotary Positional Embedding (RoPE) strategy. By separating the content embeddings from the positional embeddings, the model can compress the core informational signal without losing the structural context of the sequence. This finding revealed that the efficiency of an attention mechanism is a function of its informational density rather than its raw parameter count. It suggests that the bottleneck of AI is not a lack of memory, but our reliance on uncompressed, high-rank representations of data that can be more effectively handled through latent-space operations.

## Fine-grained MoE and Load Balancing {#fine-grained-experts}

DeepSeek-V2 also introduces a significant refinement to the Sparse Mixture-of-Experts (MoE) architecture by implementing a more granular division of labor. Traditional MoE systems use a few large experts, which can lead to routing instabilities and inefficient parameter usage. DeepSeek-V2 splits the experts into smaller, more numerous units—referred to as "fine-grained experts"—and designates a subset of "shared experts" that are active for every token. This dual-structure ensures that a common base of knowledge is always available, while the specialized experts provide the high-capacity reasoning required for complex tasks.

The result of this granular routing is a massive increase in total parameters (236B) with a relatively small number of active parameters per token (21B). This allows the model to maintain a vast knowledge base while operating at the speed and cost of a much smaller system. The find revealed that the most effective way to scale a network is to allow it to develop an increasingly intricate internal hierarchy, where the division of labor is balanced through a sophisticated load-balancing loss. It raises the question of whether the next leap in intelligence will come from further expert fragmentation, potentially moving toward a state where every individual parameter is dynamically routed based on the input signal.

## Resources

- [DeepSeek-V2 Paper (arXiv)](https://arxiv.org/abs/2405.04434) {type: article, provider: arXiv}
- [DeepSeek-V2 GitHub](https://github.com/deepseek-ai/DeepSeek-V2) {type: code, provider: GitHub}
