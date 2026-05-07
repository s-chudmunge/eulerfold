---
title: "Mamba: Selective State Spaces and the End of Quadratic Scaling"
authors: "Albert Gu, Tri Dao"
citation: "arXiv:2312.00752 (2023)"
link: "https://arxiv.org/abs/2312.00752"
heroImage: "https://arxiv.org/html/2312.00752/x1.png"
slug: "mamba-linear-time-ssm"
---

The dominance of the Transformer architecture is predicated on the global receptive field of its attention mechanism, yet this same mechanism imposes a quadratic computational cost that fundamentally limits the processing of massive sequences. While previous attempts at sub-quadratic modeling—ranging from linear attention to gated convolutions—offered theoretical efficiency, they consistently failed to match the reasoning density of Transformers on discrete modalities like language. Mamba addresses this gap by introducing the Selective State Space Model (S6), a framework that restores content-based reasoning to the recurrence through input-dependent dynamics.

## The Bottleneck of Time-Invariance {#bottleneck}

Traditional Structured State Space Models (SSMs) are rooted in Linear Time-Invariant (LTI) systems, where a continuous-time latent state is updated via fixed matrices. In these models, the transition from an input signal to a hidden state is governed by parameters that do not change regardless of what the model is "seeing" at any given moment. This rigidity allows for a powerful mathematical shortcut: the entire recurrence can be computed as a global convolution. However, this efficiency comes at a steep price in terms of flexibility. Because the model cannot modulate its focus based on content, it struggles with "associative recall"—the ability to find and retrieve a specific piece of information from a vast context—which is the hallmark of modern large language models.

## Discretization: From Continuous to Discrete {#discretization}

The transition from a continuous-time differential equation to a discrete sequence model requires a process called discretization. Mamba utilizes the Zero-Order Hold (ZOH) method to transform the continuous parameters $(A, B)$ into their discrete counterparts $(\bar{A}, \bar{B})$. This transformation is mediated by the step size $\Delta$, which determines how much of the current input is integrated into the state versus how much of the previous state is preserved. In prior models, $\Delta$ was a static parameter; in Mamba, it is projected from the input itself. This discretization step is not merely a numerical necessity but a core part of the model's reasoning logic, as it defines the "resolution" at which the model observes the incoming data stream.

## The Selection Mechanism: Input-Dependent Dynamics {#selection}

The core innovation of the S6 framework is the introduction of content-awareness into the discretization process. By making the matrices $B$ and $C$, along with the step size $\Delta$, functions of the input $x_t$, Mamba enables the model to selectively propagate or suppress information. When the model encounters an important token, a large $\Delta$ allows it to "open the gates" and update the hidden state with high fidelity. Conversely, when processing filler text or irrelevant noise, a small $\Delta$ effectively skips the update, preserving the long-term memory stored in the latent state. This selection mechanism allows the model to compress the sequence into a fixed-size hidden state while retaining the specific, high-signal information required for reasoning.

## Hardware-Aware Selective Scan {#hardware}

Making parameters input-dependent breaks the convolutional mode that made prior SSMs efficient, seemingly forcing the model back into a slow, sequential recurrence. Mamba resolves this by leveraging the GPU memory hierarchy through a fused kernel implementation. The bottleneck in modern deep learning is often not the raw FLOPs of the processor, but the speed at which data can be moved from High-Bandwidth Memory (HBM) to the fast, on-chip SRAM. The hardware-aware algorithm avoids materializing the massive, expanded hidden state in HBM. Instead, it loads only the smaller input-dependent parameters into SRAM, performs the discretization and the scan locally, and writes back only the final output. This work-efficient parallel scan ensures that Mamba remains faster than optimized Transformers even at extreme sequence lengths.

## A Simplified Homogenous Architecture {#architecture}

Unlike Transformers, which interleave self-attention layers with massive Multi-Layer Perceptron (MLP) blocks, Mamba adopts a simplified, homogenous design. The Mamba block integrates the selective SSM with a gated linear unit (GLU) and a simple convolutional layer. By removing the need for global attention and interleaving MLP blocks, the architecture reduces the number of parameters required for a given performance level. The resulting model is purely recurrent during inference, maintaining a constant memory footprint regardless of the sequence length, yet it matches the training-time parallelization of convolutional or attention-based models.

## Empirical Frontiers: DNA and Million-Length Context {#empirical}

The linear scaling of Mamba opens new possibilities in domains where Transformers were previously prohibited by memory constraints. In genomics, where DNA sequences can span millions of base pairs, Mamba has demonstrated an unprecedented ability to capture long-range dependencies, outperforming baselines in classification and pretraining tasks. Similarly, in high-fidelity audio processing, the model can maintain coherence over minute-long contexts. These results suggest that the ability to selectively compress information is a universal requirement for high-dimensional sequence modeling, transcending the specific needs of natural language.

## The Future of Recursive Reasoning {#conclusion}

The shift toward selective recurrence suggests that the global "all-to-all" comparison of attention may not be the only path to high-level reasoning. As sequence lengths move toward the millions, the ability to selectively compress information into a fixed-size state becomes not just an efficiency gain, but a prerequisite for processing the sheer volume of data generated by multimodal systems. The future of sequence modeling likely lies in this intersection of recurrent efficiency and selective focus, where the model learns not just what is in the context, but what is worth remembering.

## Resources {#resources}

- [Mamba: Linear-Time Sequence Modeling with Selective State Spaces](https://arxiv.org/abs/2312.00752) {type: article, provider: arXiv}
- [State Space Models (SSM) Explained](https://huggingface.co/blog/lmsys-mamba) {type: article, provider: Hugging Face}
- [The Rise of Mamba: A New Frontier in AI](https://newsletter.artificiallyintelligent.cloud/p/mamba-selective-state-spaces-explained) {type: article, provider: Substack}
- [Tri Dao: Mamba and the Future of Transformers](https://www.youtube.com/watch?v=9dSkvxS2gss) {type: video, provider: YouTube}
