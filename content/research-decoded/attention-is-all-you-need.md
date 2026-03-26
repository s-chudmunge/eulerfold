---
title: "Attention Is All You Need"
authors: "Vaswani et al. (2017)"
citation: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., ... & Polosukhin, I. (2017). Attention is all you need. Advances in neural information processing systems, 30."
link: "https://arxiv.org/abs/1706.03762"
slug: "attention-is-all-you-need"
heroImage: "https://ar5iv.labs.arxiv.org/html/1706.03762/assets/Figures/ModalNet-21.png"
---

# Attention Is All You Need

A re-reading of the 2017 paper from Google Research, 'Attention Is All You Need', reveals how much the current technological landscape relies on a single observation: that sequence modeling does not actually require a sequence. For years, language was processed as a timeline, one word after another, moving from left to right. Recurrent networks were used that had to store what happened many steps ago to understand the present. It was a slow, fragile approach, and the researchers at Google effectively argued that it could be discarded entirely.

## Scaled Dot-Product Attention {#scaled-dot-product-attention}

![Multi-Head Attention mechanism allowing the model to attend to information from different representation subspaces.](https://ar5iv.labs.arxiv.org/html/1706.03762/assets/Figures/ModalNet-19.png)

_Multi-Head Attention mechanism allowing the model to attend to information from different representation subspaces._

The Transformer architecture eliminated the sequential bottleneck of recurrent neural networks by replacing the linear, step-by-step processing of text with a parallelized self-attention mechanism. While previous models relied on a hidden state that updated one word at a time, the self-attention formula allows every token in a sequence to "attend" to every other token simultaneously across a global context. This shift from a temporal sequence to a spatial map of relationships reduces the computational distance between distant words to a single operation, allowing for the massive parallelization required by modern GPU hardware. It suggests that the "meaning" of a token is not a function of its position in a timeline, but rather its relationship to the entire set of information it exists within.

## Multi-Head Attention Subspaces {#multi-head-subspaces}

How the Transformer achieves a nuanced understanding of language lies in its use of Multi-Head Attention. Instead of a single attention function, the model performs multiple attention operations in parallel, each focusing on different 'representation subspaces.' For example, one head might focus on grammatical relationships while another captures semantic context. By projecting the Queries, Keys, and Values into these different spaces before calculating attention, the model can jointly attend to diverse information at different positions. This finding revealed that intelligence is not a monolithic signal but an ensemble of parallel perspectives. It suggested that the most powerful architectures are those that can look at the same data through multiple lenses simultaneously, capturing the web of relationships that define human language.

## Positional Encodings {#sinusoidal-encodings}

Because the Transformer processes the entire sequence in parallel, it inherently lacks a sense of word order. The technical solution was the injection of 'positional encodings' using sine and cosine functions of different frequencies. These specific sinusoidal functions were chosen because they allow the model to easily learn to attend by relative positions—for any fixed offset k, the encoding at position pos+k can be represented as a linear function of the encoding at position pos. This approach allowed the model to maintain the flexibility of a parallel architecture while regaining the necessary structure of a sequence. It proved that the concept of 'time' or 'order' in data can be mathematically encoded as a static signal rather than a dynamic process. This revealed that the bottleneck in AI was often the assumption that machines must process data in the same sequential way that humans do.

## Encoder-Decoder Context {#encoder-decoder-attention}

A final technical detail is the specific structure of the encoder-decoder attention sub-layer. In this layer, the Queries come from the previous decoder layer, while the Keys and Values come from the output of the encoder. This configuration allows every position in the decoder to attend over all positions in the original input sequence, effectively allowing the generator to 'consult' the entire source context while producing each token. This proved that the most effective way to translate or summarize data is to maintain a constant, high-fidelity link to the original information. It suggested that progress in artificial intelligence is often less about finding more sophisticated ways to think and more about finding ways to let hardware perform more parallel work simultaneously while maintaining a global context.

## Resources

- [Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) {type: article, provider: Jay Alammar}
- [Attention Is All You Need Paper](https://arxiv.org/abs/1706.03762) {type: article, provider: arXiv}
