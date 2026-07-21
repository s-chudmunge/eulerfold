---
title: "SCoRe: Multi-Turn RL for Intrinsic Self-Correction"
authors: "Kumar et al. (2024)"
citation: "Kumar, A., et al. (2024). Training Language Models to Self-Correct via Reinforcement Learning. arXiv preprint arXiv:2409.12917."
link: "https://arxiv.org/abs/2409.12917"
slug: "score-multi-turn-self-correction-rl"
heroImage: "/images/research-decoded/score-multi-turn-self-correction-rl.png"
---

# SCoRe: Multi-Turn RL for Intrinsic Self-Correction

The SCoRe (Self-Correction via Reinforcement Learning) framework addresses the "Self-Correction Collapse" observed in modern Large Language Models (LLMs). While models like GPT-4 can identify errors when prompted, they often fail to fix them intrinsically or become over-reliant on external "hints." Standard Supervised Fine-Tuning (SFT) on "correction traces" (where a model is shown an incorrect attempt followed by a correct one) fails because of a distribution mismatch: the model is trained to fix *other* models' mistakes, not the specific errors it generates at test-time. SCoRe introduces an on-policy, multi-turn RL approach that teaches the model to navigate its own error distribution.

## The Distribution Mismatch and SFT Collapse {#sft-failure}

Researchers identified two primary failure modes in existing self-correction methods:
1.  **Behavioral Collapse:** When a model is fine-tuned to correct its own mistakes using offline data, it often collapses into a state where it simply generates the correct answer on the first try, never learning the *mechanism* of correction.
2.  **The "I'm Sorry" Loop:** Models often learn to apologize and generate a second attempt that is functionally identical to the first, as they have not been incentivized to perform the actual "search" for a better solution during the inference phase.

SCoRe bypasses these issues by training entirely on **self-generated data**—the model learns from the specific trajectories where it *actually* made a mistake and then found a way to fix it.

## The Two-Stage RL Pipeline {#training-pipeline}

![SCoRe performance comparison on the MATH benchmark and inference-time scaling behavior.](https://ar5iv.labs.arxiv.org/html/2409.12917/assets/x1.png)

_SCoRe performance comparison on the MATH benchmark and inference-time scaling behavior._

To ensure the model learns a robust correction strategy, SCoRe utilizes a two-stage reinforcement learning recipe:

### Stage 1: Policy Initialization (Decoupling)
The goal of Stage 1 is to prevent the model from prematurely optimizing the first attempt. The model is trained using RL to maximize the reward of the *second* attempt ($y_2$), but it is subject to a strict **KL-divergence constraint** on the first attempt ($y_1$). 
$$\min_{\pi} D_{KL}(\pi(y_1|x) || \pi_{base}(y_1|x))$$
This forces the model's first attempt to remain close to the base model's distribution (including its errors), while allowing the RL agent the freedom to optimize the second attempt for correctness. This "decouples" the two turns and creates a training set where the model is forced to observe its own failures and bridge the gap to a correct solution.

### Stage 2: Multi-Turn RL and Reward Shaping
Once the model is prepared to generate distinct attempts, Stage 2 optimizes the entire multi-turn trajectory. The core innovation here is the **Flipping Bonus ($\Delta$)**, a shaped reward that explicitly targets the transition from incorrect to correct:
$$R = \text{Reward}(y_2) + \beta \cdot \mathbb{I}(\text{acc}(y_2) = 1 \land \text{acc}(y_1) = 0)$$
By granting a positive reward bonus *only* when the second turn fixes a failed first turn, SCoRe incentivizes the model to perform high-fidelity self-reflection. The model learns that "thinking about the mistake" is computationally valuable.

## Empirical Scaling and the Reflection Paradox {#reflection-paradox}

The study's empirical results—a 15.6% absolute gain on the MATH benchmark—demonstrate that self-correction is a learned skill that can be decoupled from raw parameter count. However, the researchers also identified the **Reflection Paradox**: frequent, un-gated reflection can degrade performance by introducing noise. To mitigate this, SCoRe implicitly learns a "confidence threshold"—the model only triggers significant corrective changes when its internal verifier scores the first attempt below a critical level. 

For researchers, SCoRe provides a blueprint for "Self-Improving" AI. It proves that the most resilient agents are not those that are always right, but those that have been trained to navigate the specific topography of their own failures.

## Resources

- [SCoRe Paper on arXiv](https://arxiv.org/abs/2409.12917) {type: article, provider: arXiv}
- [SCoRe GitHub Repository](https://github.com/google-deepmind/score) {type: code, provider: GitHub}
- [Google DeepMind Blog on Self-Correction](https://deepmind.google/discover/blog/) {type: article, provider: DeepMind}
