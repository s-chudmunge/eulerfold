---
title: "Tokens and Tokenization"
slug: "tokens"
author: "EulerFold"
date: "April 24, 2026"
category: "Architectures"
heroImage: "https://images.openai.com/static-rsc-4/1isDES5geltJiswW1dxy_yMdy0TIa4wKJj_QlcBYITDOWwqqlBcudiYut64gTwx7kEyJYquM-u1AfN4B-4elnEXgNFlrO6N9ODtHfYplBnGxvcnEHhJ3eA8rQuL_h99qtQT5Zj1xrtDaInxxgFd3PrVtk41loREPnhVHtpeaeD0RXO5uAeL4lXSdTxd_sq12?purpose=fullsize"
excerpt: "How machines read. Understanding the 'Lego bricks' of language that allow AI to process text as mathematical vectors."
technicalInsight: "A token is the smallest unit of meaning a model understands; it is rarely a whole word and often a fragment, prefix, or punctuation mark."
faq:
  - q: "Is one token always one word?"
    a: "No. On average, 1,000 tokens is roughly 750 words. Rare words like 'EulerFold' are often broken into multiple tokens (e.g., 'Euler', 'Fold')."
  - q: "Why don't we just use characters?"
    a: "Character-level processing is too granular. It makes sequences extremely long and makes it harder for the model to learn the relationships between meaningful chunks of language."
synonyms:
  - "BPE"
  - "Byte Pair Encoding"
  - "Vocabulary"
  - "Tokenizer"
---

Neural networks cannot "see" letters. They only understand numbers. **Tokenization** is the critical first step in the AI pipeline—it is the process of breaking down raw text into a sequence of discrete units called **Tokens**, which are then mapped to unique numerical IDs.

```d2
direction: down

Text_Source: "Input String" {
  Raw: "EulerFold is open." {shape: rectangle}
}

Tokenizer_Pipeline: "Tokenization Engine" {
  style: {
    stroke: "#0F766E"
    stroke-width: 2
  }

  Normalization: "1. Normalization" {
    style: {fill: "#e8f2f1"}
    Clean: "Lowercase / Unicode" {shape: hexagon}
  }

  PreToken: "2. Segmentation" {
    style: {fill: "#e8f2f1"}
    Split: "Whitespace & Punctuation"
  }

  Subword: "3. BPE / Subword" {
    style: {fill: "#e8f2f1"}
    Algorithm: "Byte-Pair Encoding" {shape: diamond}
    Fragments: "'Euler' + 'Fold' + ' is' + ' open' + '.'"
  }

  Normalization -> PreToken -> Subword
}

Output_Vector: "Mathematical Interface" {
  style: {
    stroke: "#0F766E"
  }
  
  Vocab: "Vocabulary Dictionary" {
    shape: cylinder
    Mapping: "Euler: 142 | Fold: 89..."
  }

  IDs: "Integer IDs: [142, 89, 318, 2210, 13]" {
    shape: parallelogram
    style: {fill: "#e8f2f1"}
  }

  Vocab -> IDs: "Index Lookup"
}

Text_Source -> Tokenizer_Pipeline: "Unicode String"
Tokenizer_Pipeline -> Output_Vector: "Token Fragments"
```

## The Subword Revolution {#subword}

Early AI models used word-level tokenization. However, if the model encountered a word it hadn't seen before (an "Out of Vocabulary" or OOV word), it would break. Modern models use **Byte Pair Encoding (BPE)** or similar subword algorithms. 

Instead of treating "unbelievable" as one token, the tokenizer might break it into `un`, `believ`, and `able`. This allows the model to understand the meaning of new words by looking at their constituent parts.

## The Vocabulary {#vocabulary}

The "Vocabulary" of a model is a fixed list of all the tokens it knows. GPT-4, for example, has a vocabulary of roughly 100,000 tokens. Every token in this list is assigned a unique integer ID. During inference, the model predicts the *ID* of the next token, which the tokenizer then converts back into the text you see on the screen.

## Efficiency and Cost {#efficiency}

Tokenization directly impacts the cost and speed of AI. Since LLMs have a "context window" (a limit on how many tokens they can process at once), a more efficient tokenizer that uses fewer tokens to represent the same text allows the model to "remember" more information. This is why different models (Gemini vs. Llama) might have different costs for the same paragraph of text.
