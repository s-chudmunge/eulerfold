---
title: "What is Model Quantization?"
slug: "quantization"
shortSlug: "quantization"
author: "Dr. Siddharth Iyer — Computational Research Scientist, PhD Applied Computing"
date: "April 23, 2026"
subject: "AI & Data Science"
heroImage: "https://images.openai.com/static-rsc-4/qMx9WUOQS5ImPzu8XqIXgK1dhgJ8uaXcQPtTM48AK2_en_qPbiH0WV3pYCz7ZXDLOUoUqp0V610vFH0kPPeeJXAGDyWJ-4U_iJ1FrUeVRj7H7IKkBhFi70WrFi9-fBsuuOgHsvYcXFhr8KcPjxMLJ548y5Gp5bokYt7LpAzxApqL-bbig1MJ1xiBULCzqLS4?purpose=fullsize"
excerpt: "How to fit a 100GB model into 10GB of VRAM. Understanding the trade-offs between precision and performance."
technicalInsight: "Quantization is not just rounding numbers; it is a re-mapping of a continuous distribution of weights into a discrete set of lower-precision 'buckets'."
faq:
  - q: "Does quantization make models dumber?"
    a: "There is usually a slight decrease in perplexity (accuracy), but for large models, the performance gain and memory savings far outweigh the minor loss in precision."
  - q: "What is 4-bit quantization?"
    a: "It means each weight is represented by only 4 bits (16 possible values) instead of the standard 16-bit or 32-bit floating point, reducing memory usage by 75% or more."
synonyms:
  - "4-bit"
  - "8-bit"
  - "weight compression"
  - "FP16 to INT8"
---

Large Language Models are massive. A 70-billion parameter model stored in 16-bit precision requires roughly 140GB of VRAM—more than most consumer GPUs can handle. **Quantization** is the process of reducing the precision of these weights (e.g., from 16-bit to 4-bit) to make models smaller and faster.



## Precision vs. Range {#precision-range}

Computers typically store numbers using **Floating Point** (FP) representations, which can represent a huge range of very tiny and very large numbers with high precision. However, neural networks are surprisingly robust. They don't always need to know if a weight is `0.824159`; knowing it's "about `0.8`" is often enough. 

Quantization takes these continuous values and maps them onto a discrete grid. The challenge is finding a mapping that preserves the most important information—the "outlier" weights that have a high impact on the model's behavior.

## Post-Training Quantization (PTQ) {#ptq}

The most common method is **PTQ**, where a model is trained normally in high precision and then converted afterward. This involves:
1.  **Calibration**: Passing a small amount of data through the model to see the typical range of weights and activations.
2.  **Scaling**: Finding a constant value that maps the FP16 range to the target integer range (like -127 to 127 for 8-bit).
3.  **Rounding**: Converting the values to the nearest integer.

## PTQ vs. QAT: Two Paths to Compression {#ptq-vs-qat}

There are two primary ways to approach quantization:
- **Post-Training Quantization (PTQ):** The model is trained in full precision and compressed *after* training. It's fast and requires little data but can lead to a "quantization error" where the model loses some of its nuance.
- **Quantization-Aware Training (QAT):** The model is trained to handle low precision from the start. During training, it "simulates" the rounding errors it will face later. This is much more computationally expensive but results in a model that is significantly more accurate at 4-bit or 8-bit.

## The Open Source Edge: GGUF and Llama.cpp {#open-source}

The true impact of quantization has been seen in the open-source community. Tools like **Llama.cpp** and formats like **GGUF** have revolutionized how people interact with AI. By quantizing models to 4-bit or 5-bit, developers have made it possible to run a 70B parameter model on a modern Mac Studio or an 8B model on a smartphone. 

This has effectively "unlocked" AI from the cloud, enabling private, local execution that is faster and more secure. It also allows for **Mixed Precision** setups, where different parts of the model are stored at different bit-depths to optimize for both speed and accuracy.

## Why it Matters {#importance}

Without quantization, the "AI Revolution" would be restricted to massive data centers. Techniques like **bitsandbytes** (4-bit) and **GGUF** allow researchers and hobbyists to run state-of-the-art models on laptops. It is the bridge between theoretical research and local, private execution.
