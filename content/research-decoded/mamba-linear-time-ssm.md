---
title: "The New Architecture Challenging Transformers"
authors: "Albert Gu & Tri Dao (2023)"
citation: "Gu, A., & Dao, T. (2023). Mamba: Linear-time sequence modeling with selective state spaces. arXiv preprint arXiv:2312.00752."
link: "https://arxiv.org/abs/2312.00752"
slug: "mamba-linear-time-ssm"
heroImage: "https://ar5iv.labs.arxiv.org/html/2312.00752/assets/x1.png"
---

In 2023, Albert Gu and Tri Dao introduced Mamba, a sequence modeling architecture based on a selective state space model (SSM) that achieves linear time complexity. This research addresses the quadratic computational cost of the Transformer's attention mechanism, which fundamentally limits the processing of massive sequences. The researchers demonstrated that by introducing input-dependent selection into a recurrent framework, a system can achieve the reasoning density of Transformers while maintaining a constant memory overhead during inference. This work established a new foundation for sequence processing, enabling the native handling of contexts spanning millions of tokens.

## The Bottleneck of Time-Invariance {#ssm-bottleneck}

Traditional Structured State Space Models (SSMs) are rooted in Linear Time-Invariant (LTI) systems, where a continuous-time latent state is updated via fixed matrices regardless of the specific input. This rigidity allows for the entire sequence to be computed as a global convolution, but it prevents the model from modulating its focus based on content—a requirement for "associative recall" tasks. Mamba resolves this by introducing the Selective SSM (S6), where the matrices governing state transitions are made functions of the input $x_t$. This methodological choice established that the efficiency of a model is not a function of its recurrence alone, but of its ability to selectively propagate or suppress information based on its informational value.

## Discretization and Input-Dependent Dynamics {#discretization}

The transition from a continuous-time differential equation to a discrete sequence model requires discretization, typically mediated by a step size parameter $\Delta$. In prior models, $\Delta$ was a static parameter; in Mamba, it is projected from the input itself. A large $\Delta$ allows the model to "open the gates" and update the hidden state with high fidelity when an important token is encountered, while a small $\Delta$ effectively skips the update for irrelevant noise. This selection mechanism allows the model to compress the sequence into a fixed-size hidden state while retaining the specific, high-signal information required for reasoning. This finding revealed that the "resolution" of a model's observation is a core part of its reasoning logic.

## Hardware-Aware Selective Scan and Memory Efficiency {#hardware}

Making parameters input-dependent breaks the convolutional mode of earlier SSMs, seemingly forcing the model back into a slow sequential recurrence. Mamba resolves this through a fused kernel implementation that leverages the GPU memory hierarchy. The hardware-aware algorithm avoids materializing the massive, expanded hidden state in slow High-Bandwidth Memory (HBM). Instead, it loads only the smaller input-dependent parameters into fast on-chip SRAM, performs the discretization and parallel scan locally, and writes back only the final output. This engineering shift proved that the primary bottleneck in modern AI is data movement rather than raw FLOPs, establishing a new standard for efficient state-management in deep learning.

## Impact on Genomics and Million-Length Context {#applications}

The practical significance of Mamba’s linear scaling is most evident in domains where Transformers were previously prohibited by memory constraints. In genomics, where DNA sequences can span millions of base pairs, Mamba has demonstrated an unprecedented ability to capture long-range dependencies, outperforming baselines in classification and pretraining tasks. Similarly, in high-fidelity audio processing and long-document analysis, the model maintains coherence over contexts that would exhaust the memory of standard attention-based systems. This application established the principle that the ability to selectively compress information is a universal requirement for high-dimensional sequence modeling.

## Selective Recurrence as an Intelligence Primitive {#significance}

The success of Mamba demonstrated that the global "all-to-all" comparison of attention is not the only path to high-level reasoning. The decision to prioritize selective focus within a recurrent framework revealed that the primary constraint on sequential intelligence was the structural isolation of information blocks. This principle remains the central theme in the search for next-generation architectures that can process millions of tokens natively without the quadratic cost of a full attention matrix. It leaves open the question of whether these recurrent methods can eventually replace Transformers entirely, or if the two tasks of "compressed memory" and "dense reasoning" necessitate a hybrid topological approach.

## Resources

- [Mamba: Linear-Time Sequence Modeling (Official arXiv)](https://arxiv.org/abs/2312.00752) {type: article, provider: arXiv}
- [State Space Models (SSM) Explained (Hugging Face)](https://huggingface.co/blog/lmsys-mamba) {type: article, provider: Hugging Face}
- [GitHub: Mamba Reference Implementation](https://github.com/state-spaces/mamba) {type: code, provider: GitHub}
- [Tri Dao: Mamba and the Future of Transformers (Video)](https://www.youtube.com/watch?v=9dSkvxS2gss) {type: video, provider: YouTube}
