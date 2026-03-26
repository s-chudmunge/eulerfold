---
title: "RLHF: Helpful & Harmless"
authors: "Askell et al. (2022)"
citation: "Bai, Y., Jones, A., Ndousse, K., Askell, A., Commission, G., ... & Kaplan, J. (2022). Training a helpful and harmless assistant with reinforcement learning from human feedback. arXiv preprint arXiv:2204.05862."
link: "https://arxiv.org/abs/2204.05862"
slug: "rlhf-helpful-harmless-assistant"
heroImage: "https://ar5iv.labs.arxiv.org/html/2204.05862/assets/x2.png"
---

# RLHF: Helpful & Harmless

In 2022, the 'Helpful and Harmless' paper from Anthropic deepened the understanding of how Reinforcement Learning from Human Feedback (RLHF) can be used to align AI behavior. While previous work had focused on following simple instructions, this paper explored the inherent trade-offs between being useful to a user and avoiding harmful content. The researchers argued that alignment is not a single target, but a multi-dimensional space that requires careful data collection and model tuning. It was a push for safety as a core architectural requirement.

## Preference Modeling {#preference-modeling}

![Crowdworker preferences across different model types and training methods.](https://ar5iv.labs.arxiv.org/html/2204.05862/assets/x1.png)

_Crowdworker preferences across different model types and training methods._

Anthropic refined the Reinforcement Learning from Human Feedback (RLHF) framework by formalizing a multi-objective optimization that balances the often-competing goals of helpfulness and harmlessness. By training preference models on the "HH" dataset—where human rankers evaluate multiple model outputs—the researchers established a predictable mathematical relationship where the RL reward scales with the square root of the KL divergence from the base model. This iterated online training process allows the assistant to adapt to increasingly subtle scenarios without collapsing into the over-optimized or "safe but useless" behaviors that had characterized earlier alignment efforts. It revealed that the most effective way to steer a large model is not through rigid constraints, but through a continuous, preference-driven feedback loop that respects the underlying distribution of the pre-trained weights.

## The Alignment Tax {#alignment-taxes}

The reasoning behind this work was the observation of an 'alignment tax'—the phenomenon where making a model safer or more helpful can sometimes lead to a decrease in its performance on other tasks. The researchers found that larger models were more robust to this tax, suggesting that scale provides the necessary capacity to handle conflicting objectives. This proved that building a safe AI is not just about constraints, but about having a model large enough to understand the complexity of human values.

## Iterative Online Learning {#iterative-online-learning}

The success of this approach highlighted the importance of iterative, 'online' learning, where the model is continuously updated based on new human interactions. This creates a feedback loop that allows the model to adapt to increasingly subtle and difficult scenarios. It raises the question of how we can scale this human-in-the-loop process to a global level, and whether the values of a small group of crowdworkers can ever truly represent the diverse needs of all users.

## Resources

- [Anthropic RLHF Blog](https://www.anthropic.com/index/training-a-helpful-and-harmless-assistant-with-reinforcement-learning-from-human-feedback) {type: article, provider: Anthropic}
- [RLHF Concept Guide](https://huggingface.co/blog/rlhf) {type: article, provider: Hugging Face}
