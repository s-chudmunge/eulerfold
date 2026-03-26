---
title: "FlashAttention: IO-Awareness"
authors: "Dao et al. (2022)"
citation: "Dao, T., Fu, D. Y., Ermon, S., Rudra, A., & R\u00e9, C. (2022). FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness. arXiv:2205.14135."
link: "https://arxiv.org/abs/2205.14135"
slug: "flash-attention-io-aware"
heroImage: "https://ar5iv.labs.arxiv.org/html/2205.14135/assets/x1.png"
---

# FlashAttention: IO-Awareness

The 2022 paper on 'FlashAttention' introduced a fundamental optimization that allowed Transformers to break through the 'context wall' that had limited their memory for years. Before FlashAttention, the ability of a model to remember long sequences was constrained by a quadratic memory requirement—doubling the length of a conversation required four times the memory. Researchers at Stanford University proposed a shift: instead of trying to reduce the number of mathematical operations, they focused on the speed of data movement within the GPU. It was a transition from 'compute-bound' to 'memory-bound' thinking, proving that the bottleneck in modern AI is not how fast a chip can think, but how fast it can move its thoughts.

## The Memory Wall {#memory-wall-shift}

![FlashAttention using tiling to prevent the materialization of the large attention matrix on slow GPU memory.](https://ar5iv.labs.arxiv.org/html/2205.14135/assets/x1.png)

_FlashAttention using tiling to prevent the materialization of the large attention matrix on slow GPU memory._

FlashAttention bypassed the quadratic memory wall of standard Transformers by making the self-attention algorithm "IO-aware," explicitly managing the movement of data between a GPU's fast SRAM and its slower HBM. Instead of materializing the massive $N \times N$ attention matrix, the algorithm uses tiling to break the $Q$, $K$, and $V$ matrices into blocks that fit entirely within fast internal memory for processing. By storing only the necessary statistics to recompute results on-the-fly during the backward pass, FlashAttention reduces memory complexity from $O(N^2)$ to $O(N)$ while achieving significant speedups in training and inference. This shift proved that an algorithm can be faster by doing more mathematical work if it minimizes the distance data has to travel, suggesting that the most efficient blueprints for AI are those designed around the physical constraints of the hardware they occupy.

## Tiling and Recomputation {#tiling-and-recomputation}

![Runtime comparison showing that memory access is the primary factor affecting AI performance.](https://ar5iv.labs.arxiv.org/html/2205.14135/assets/x2.png)

_Runtime comparison showing that memory access is the primary factor affecting AI performance._

How FlashAttention achieves this efficiency lies in its use of 'tiling,' which breaks the massive attention matrix into small, bite-sized blocks that fit entirely within the GPU's fastest memory. Instead of storing the entire table, the model processes these tiles one by one, keeping track of just enough mathematical statistics to ensure the final result is exactly the same as the slower version. During the learning phase, the model even throws away parts of its intermediate calculations and simply re-computes them when needed. This revealed that the 'Memory Wall' can be bypassed by treating data as a temporary signal to be processed rather than a massive object to be stored. It proved that in the era of massive scale, computational efficiency is often a matter of minimizing the distance that data has to travel.

## The Long Context Frontier {#long-context-frontier}

![Speedup of FlashAttention over standard implementations at different sequence lengths.](https://ar5iv.labs.arxiv.org/html/2205.14135/assets/figs/flashattn_speedup.jpg)

_Speedup of FlashAttention over standard implementations at different sequence lengths._

The success of FlashAttention was most evident in its ability to enable models with 64,000 or even 128,000 tokens of context, a feat that was previously impossible on standard hardware. This improvement led to a 7.6x speedup in attention calculations, allowing models to process entire books or long legal documents in a single pass. This finding proved that the architecture of the Transformer is far more capable than our previous implementations suggested. It raises the question of whether the next leap in AI will come from more powerful chips or from a deeper understanding of how to manage the flow of information through the chips we already have. It suggested that the true limits of AI memory are defined more by our software's awareness of hardware than by the hardware itself.

## Resources

- [FlashAttention Paper on arXiv](https://arxiv.org/abs/2205.14135) {type: article, provider: arXiv}
- [GitHub Implementation](https://github.com/Dao-AILab/flash-attention) {type: code, provider: GitHub}
- [Tri Dao's Blog Post](https://tridao.me/blog/2022/flash-attention/) {type: article, provider: Tri Dao}
