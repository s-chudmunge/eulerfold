---
title: "Why Do Transformers Need Positional Encoding?"
slug: "positional-encoding"
author: "EulerFold"
date: "April 27, 2026"
category: "Architectures"
heroImage: "https://images.openai.com/static-rsc-4/Np40XmzBP3nBYoLLWuX85uImyt6WlzjSRSiUd6Omqrq2deNVeco1hKQqPNBPrEUDgNgSk76Vxsg8Agj8rqhw_kosb-qhgcT0vipiYA1fSgIvVfBFd5_4vOtoMoRJtEA74DwwZu2wlCZJcIWRWX6CMEwJ4LmmpqRmdLnj91dnQXCa_VjhfGL61S9FoJ2nPAzx?purpose=fullsize"
excerpt: "Without recurrence or convolution, Transformers are 'bag-of-words' models. Positional encoding restores the sense of order."
technicalInsight: "Positional encodings allow a parallel architecture to perceive sequence order by injecting a unique, predictable signal into each token's embedding."
faq:
  - q: "Why not just use a simple counter (1, 2, 3...) for positions?"
    a: "Counters can grow very large, leading to numerical instability. If normalized to [0,1], the distance between positions would vary depending on the sequence length. Sine and cosine functions provide a bounded, consistent signal regardless of length."
  - q: "What is RoPE?"
    a: "Rotary Positional Embedding (RoPE) is a modern alternative that encodes relative position by rotating the Query and Key vectors in a complex plane. It is used in models like Llama for better long-context performance."
synonyms:
  - "positional embeddings"
  - "absolute positional encoding"
  - "relative positional encoding"
  - "Positional Encoding"
  - "RoPE"
---

The Transformer architecture is inherently permutation-invariant. This means that if you shuffle the words in a sentence, the **self-attention** mechanism will produce the exact same results for each word, just in a different order. To a Transformer, "The dog bit the man" and "The man bit the dog" are identical unless we provide a way to distinguish the *position* of each token.

```d2
direction: down
Input: "Input Signals" {
  Token: "Token Embedding" {shape: cylinder}
  Pos: "Positional Encoding" {shape: cylinder}
}
Mixer: "Summation Node" {
  shape: diamond
  Combine: "Token + Position"
}
Model: "Transformer Stack" {
  Layer1: "Encoder Layer 1"
}

Input.Token -> Mixer.Combine
Input.Pos -> Mixer.Combine
Mixer.Combine -> Model.Layer1

Mixer.style: {stroke: "#0F766E"}
Input.Pos.style: {fill: "#e8f2f1"}
```

## The Signal Injection {#injection}

Since Transformers do not have recurrence (like RNNs) to track time, they use **Positional Encodings**. These are vectors of the same dimension as the input embeddings, which are added directly to the embeddings before they enter the first layer. 

$$\text{Input to Transformer} = \text{Token Embedding} + \text{Positional Encoding}$$

This "injects" information about the token's location into its representation without changing the actual meaning of the word.

## Sine and Cosine Functions {#functions}

The original Transformer paper used a specific pattern of sine and cosine waves at different frequencies to create these encodings:

$$PE_{(pos, 2i)} = \sin(pos / 10000^{2i/d_{model}})$$

$$PE_{(pos, 2i+1)} = \cos(pos / 10000^{2i/d_{model}})$$

This choice is mathematically elegant because for any fixed offset $k$, $PE_{pos+k}$ can be represented as a linear function of $PE_{pos}$. This allows the model to easily learn to attend to relative positions (e.g., "the word 3 places to my left").

## Absolute vs. Relative Encoding {#types}

- **Absolute Positional Encoding:** Every position (1, 2, 3...) has a unique, fixed vector. This is simple but struggles with sequences longer than those seen during training.
- **Relative Positional Encoding:** Instead of fixed labels, the model learns the *distance* between tokens. This generalizes better to varying sequence lengths and is the basis for advanced techniques like **ALiBi** and **RoPE** used in state-of-the-art Large Language Models.

Without positional encoding, AI would lack the fundamental understanding of structure, grammar, and time that makes language coherent.
