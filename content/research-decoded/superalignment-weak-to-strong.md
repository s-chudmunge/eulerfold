---
title: "Superalignment: Weak-to-Strong"
authors: "Burns et al. (OpenAI, 2023)"
citation: "Burns, C., Izmailov, P., Kirchner, J. H., Bowyer, B., ... & Leike, J. (2023). Weak-to-strong generalization: Eliciting strong capabilities with weak supervision. arXiv preprint arXiv:2312.09390."
link: "https://ar5iv.org/abs/2312.09390"
slug: "superalignment-weak-to-strong"
heroImage: "https://ar5iv.org/html/2312.09390/assets/x1.png"
---

# Superalignment: Weak-to-Strong

The 2023 'Weak-to-Strong Generalization' paper from OpenAI’s Superalignment team addressed the core challenge of aligning systems that are more intelligent than humans. For years, alignment research relied on the assumption that a human (the supervisor) can recognize 'good' behavior from a model (the student). However, as AI capabilities begin to exceed human expertise in specialized domains, this assumption breaks down. The researchers proposed a framework to test whether a 'weak' supervisor can effectively train a 'strong' model to perform tasks beyond the supervisor's own understanding. It was a shift from viewing alignment as a process of imitation to viewing it as a process of steerage.

## The Weak-to-Strong Framework {#weak-to-strong-framework}

![Comparison of naive fine-tuning versus weak-to-strong generalization across different model scales.](https://ar5iv.labs.arxiv.org/html/2312.09390/assets/x2.png)

_Comparison of naive fine-tuning versus weak-to-strong generalization across different model scales._

The researchers established a formal experimental setup where a smaller, 'weak' model (such as GPT-2) generates labels for a much 'stronger' model (such as GPT-4). The objective was to see if the strong model would simply mimic the weak model's mistakes—the 'naive' baseline—or if it could generalize from the weak labels to find the true underlying logic of the task. This approach revealed that a strong model can often surpass its teacher if the learning objective is designed to favor consistency over pure imitation. It proved that intelligence can be steered from below, suggesting that we do not need to be smarter than a system to guide it toward a correct outcome.

## Auxiliary Loss and Internal Priors {#auxiliary-loss-steering}

To prevent the strong model from collapsing into the errors of its weak supervisor, the researchers introduced an auxiliary loss function that encourages the student to trust its own internal latent representations. When the weak labels provided by the supervisor conflict with the strong model's internal confidence, this loss function penalizes the model less for deviating from the 'wrong' instruction. This finding revealed that a large model possesses an internal, latent understanding of a task that is often more accurate than the explicit labels it is given. By prioritizing the model's internal coherence over its teacher's noisy guidance, the researchers achieved significant performance gains over the naive baseline. It suggested that alignment is not about teaching a model new facts, but about eliciting the knowledge it already has in a way that is consistent with the supervisor's intent.

## The Generalization Gap {#superalignment-gap}

Despite the success of the framework, the experiments identified a persistent 'generalization gap' where the strong model trained by a weak supervisor still underperforms compared to one trained by a strong supervisor. This reveals a fundamental limit in our current ability to scale alignment: as the gap between the supervisor and the student grows, the 'noisy pointers' provided by the teacher become increasingly difficult for the student to interpret. This finding proved that aligning 'superintelligent' systems is an active engineering challenge rather than a guaranteed byproduct of scale. It raises the question of whether we can develop even more sophisticated auxiliary objectives that bridge this gap, or if we will eventually reach a threshold where machines must align themselves through recursive, automated supervision.

## Resources

- [Weak-to-Strong Generalization (arXiv)](https://arxiv.org/abs/2312.09390) {type: article, provider: arXiv}
- [OpenAI Superalignment Blog](https://openai.com/research/weak-to-strong-generalization) {type: article, provider: OpenAI}
