---
title: "What is Model Quantization?"
slug: "quantization"
author: "EulerFold"
date: "April 23, 2026"
category: "Optimization"
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

```d2
direction: down

High_Precision: "1. High Precision (FP32/FP16)" {
  style: {
    stroke: "#0F766E"
    stroke-width: 2
  }
  Data: "32-bit Floating Point" {
    shape: cylinder
  }
  Range: "Continuous Range: [-inf, +inf]" {
    style: {stroke-dash: 3}
  }
  Data -> Range
}

Quantization_Engine: "2. Quantization Engine" {
  style: {
    fill: "#e8f2f1"
    stroke: "#0F766E"
  }
  
  Observer: "Range Observer" {
    shape: hexagon
    Label: "Detect min/max values"
  }

  Calibration: "Mapping Logic" {
    Scale: "Scale Factor (S)" {shape: rectangle}
    Zero: "Zero Point (Z)" {shape: rectangle}
    Scale -> Zero: "q = clip(round(r/S + Z))"
  }

  Observer -> Calibration: "Statistics"
}

Low_Precision: "3. Quantized Output (INT8/INT4)" {
  style: {
    stroke: "#dc2626"
    stroke-width: 2
  }
  Buckets: "Discrete Buckets" {
    b1: "Bucket -127"
    b2: "..."
    b3: "Bucket +127"
  }
  Storage: "Integer Storage" {
    shape: cylinder
  }
  Buckets -> Storage
}

High_Precision -> Quantization_Engine: "Weights & Activations"
Quantization_Engine -> Low_Precision: "Compressed Bitstream"

Efficiency: "Impact" {
  Memory: "75% Reduction" {style: {fill: "#0F766E"; font-color: "#ffffff"}}
  Compute: "INT8 Integer Math" {style: {fill: "#0F766E"; font-color: "#ffffff"}}
}
```

## Precision vs. Range {#precision-range}

Computers typically store numbers using **Floating Point** (FP) representations, which can represent a huge range of very tiny and very large numbers with high precision. However, neural networks are surprisingly robust. They don't always need to know if a weight is `0.824159`; knowing it's "about `0.8`" is often enough. 

Quantization takes these continuous values and maps them onto a discrete grid. The challenge is finding a mapping that preserves the most important information—the "outlier" weights that have a high impact on the model's behavior.

## Post-Training Quantization (PTQ) {#ptq}

The most common method is **PTQ**, where a model is trained normally in high precision and then converted afterward. This involves:
1.  **Calibration**: Passing a small amount of data through the model to see the typical range of weights and activations.
2.  **Scaling**: Finding a constant value that maps the FP16 range to the target integer range (like -127 to 127 for 8-bit).
3.  **Rounding**: Converting the values to the nearest integer.

## Why it Matters {#importance}

Without quantization, the "AI Revolution" would be restricted to massive data centers. Techniques like **bitsandbytes** (4-bit) and **GGUF** allow researchers and hobbyists to run state-of-the-art models on laptops. It is the bridge between theoretical research and local, private execution.
