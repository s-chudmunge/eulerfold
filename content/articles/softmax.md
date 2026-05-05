---
title: "What is the Softmax Function?"
slug: "softmax"
shortSlug: "softmax"
author: "EulerFold"
date: "April 25, 2026"
category: "Theory"
heroImage: "https://images.openai.com/static-rsc-4/PzXk2fasOiQGnry7yo4ifDHf5bQ7EtSh1fYf5SIho5FyOEKcdITDcVrjTAIS9rFsBqjWae_fYNFJJ08bsAZ47WgTcSVGuKhQSaWisY3KjU51sWOw8bvrrbvbqMMsjNdpEHKhTYPVXWcEFna-fFibtRXKUDRrjzSl75rj08_ncPFJqArYujO7ppSnno8oBbCI?purpose=fullsize"
excerpt: "The final arbiter. How neural networks turn raw, chaotic numbers into a clean probability distribution."
technicalInsight: "Softmax doesn't just normalize values; it uses exponentiation to aggressively amplify the highest score, creating a clear winner while ensuring the total sum is exactly 1.0."
faq:
  - q: "What are 'Logits'?"
    a: "Logits are the raw, unnormalized output values from the last layer of a neural network before they are passed through Softmax. They can be any real number, positive or negative."
  - q: "What is 'Temperature' in Softmax?"
    a: "Temperature (T) is a parameter that scales the logits before Softmax. A high T makes the distribution flatter (more random), while a low T makes it sharper (more confident)."
synonyms:
  - "Normalization"
  - "Logits"
  - "Probability Distribution"
  - "Activation Function"
---

At the very end of almost every classification model or Large Language Model, there is a single mathematical gatekeeper: the **Softmax Function**. Its job is to take a set of raw, arbitrary numbers (logits) and "squash" them into a probability distribution where every number is between 0 and 1, and the total sum is exactly 1.0.

```d2
direction: down

Raw_Scores: "1. Raw Logits (Unnormalized)" {
  style: {
    stroke: "#0F766E"
    stroke-width: 2
  }
  z1: "Logit Z₁: 2.0" {shape: rectangle}
  z2: "Logit Z₂: 1.0" {shape: rectangle}
  z3: "Logit Z₃: 0.1" {shape: rectangle}
}

Softmax_Core: "2. Softmax Core" {
  style: {
    fill: "#e8f2f1"
    stroke: "#0F766E"
  }
  
  Exp_Stage: "Exponentiation (e^z)" {
    shape: hexagon
    e1: "e^2.0 ≈ 7.39"
    e2: "e^1.0 ≈ 2.72"
    e3: "e^0.1 ≈ 1.11"
  }

  Normalization: "Sum & Divide (Σ e^z)" {
    Total: "Σ ≈ 11.22" {shape: diamond}
    Logic: "Pᵢ = e^zi / Σ"
  }

  Exp_Stage -> Normalization: "Amplify Gaps"
}

Distribution: "3. Probability Distribution" {
  style: {
    stroke: "#0F766E"
    stroke-width: 2
  }
  p1: "Class 1: 0.66 (66%)" {
    style: {stroke: "#0F766E"; stroke-width: 4; fill: "#e8f2f1"}
  }
  p2: "Class 2: 0.24 (24%)"
  p3: "Class 3: 0.10 (10%)"
  
  Check: "Total Sum ≡ 1.0" {
    shape: parallelogram
    style: {stroke-dash: 3}
  }
}

Raw_Scores -> Softmax_Core: "Arbitrary Reals"
Softmax_Core -> Distribution: "Valid Probabilities"

Summary: "Mathematical Logic" {
  Confidence: "High Logit -> Exponentially Higher Prob" {
    style: {fill: "#0F766E"; font-color: "#ffffff"}
  }
}
```

## Why Exponentiate? {#why-exp}

The Softmax formula is:
$$\sigma(z)_i = \frac{e^{z_i}}{\sum_{j=1}^{K} e^{z_j}}$$

By using the exponential function ($e^x$), Softmax does two things:
1.  **Ensures Positivity**: $e^x$ is always positive, even if the input logit is negative.
2.  **Amplifies Differences**: It makes the "winning" score much larger relative to the "losers." If one logit is slightly higher than the others, its probability after Softmax will be significantly higher.

## Picking a Winner {#picking-winner}

In a Large Language Model, the final layer produces a logit for every single token in its vocabulary (e.g., 100,000 values). Softmax turns these 100,000 raw numbers into a probability map. The model doesn't just "know" the next word; it has a statistical preference for several likely words. 

## The Temperature Parameter {#temperature}

In modern AI, Softmax is rarely used "raw." Instead, we apply a **Temperature ($T$)** parameter to the logits before the calculation:
$$\sigma(z)_i = \frac{e^{z_i / T}}{\sum_{j=1}^{K} e^{z_j / T}}$$

- **Low Temperature ($T < 1$):** Makes the model more confident and "sharp." It amplifies the highest scores even further, leading to predictable, conservative outputs.
- **High Temperature ($T > 1$):** Flattens the distribution. The gaps between probabilities shrink, making the model more "creative" or random.

## Numerical Stability: The Max Trick {#stability}

If you try to implement Softmax exactly as written in the formula, your computer will likely crash. Why? Because $e^{1000}$ is an astronomically large number that causes **floating-point overflow**. 

To fix this, engineers use a "Stable Softmax" trick: they subtract the maximum value in the logit array from every element before exponentiating. Because of the properties of exponents, the final probability remains identical, but the numbers stay within a range the computer can handle safely.

## Softmax vs. Sigmoid {#softmax-sigmoid}
...
While **Sigmoid** is used for binary classification (Yes/No), **Softmax** is for multi-class classification. Softmax is "mutually exclusive"—if the probability of one class goes up, the others *must* go down. This makes it ideal for choosing the next most likely token in a sequence.
