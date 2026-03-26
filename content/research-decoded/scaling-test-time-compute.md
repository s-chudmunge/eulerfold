---
title: "Scaling LLM Test-Time Compute Optimally"
authors: "Snell et al. (DeepMind, 2024)"
citation: "Snell, C., Jae, J., Zhong, W., ... & Levine, S. (2024). Scaling LLM Test-Time Compute Optimally. arXiv preprint arXiv:2408.03314."
link: "https://ar5iv.org/abs/2408.03314"
slug: "scaling-test-time-compute"
heroImage: "https://ar5iv.labs.arxiv.org/html/2408.03314/assets/x1.png"
---

# Scaling LLM Test-Time Compute Optimally

The traditional paradigm of scaling model intelligence has focused almost exclusively on the pre-training phase, treating performance as a static outcome of parameter count and training data volume. This pre-training centric view assumes that a model's reasoning capability is "frozen" at the point of deployment, requiring ever-larger models to solve increasingly complex problems. However, human cognition suggests a more dynamic approach, where the amount of effort expended is proportional to the difficulty of the task. The exploration of "test-time" or inference-time compute as a new scaling frontier suggests that the intelligence of a system can be expanded during the generation process itself, allowing a smaller model to overcome its inherent knowledge gaps through iterative search and refinement.

## Revisions and Verifier-Guided Search {#revisions-and-search}

![Comparing different PRM search methods](https://ar5iv.labs.arxiv.org/html/2408.03314/assets/x3.png)

_Comparing different PRM search methods: Best-of-N, Beam Search, and Lookahead Search._

The optimization of inference-time compute utilizes two primary mechanisms: sequential revisions and verifier-guided search. Sequential revisions involve fine-tuning a model to critique its own previous outputs and iteratively correct local logical errors, effectively conditioning its generation on its own history of mistakes. In parallel, verifier-guided search—utilizing process-based reward models (PRMs)—evaluates intermediate reasoning steps to prune incorrect paths and focus computational resources on the most promising solution trajectories. This finding revealed that for easy tasks, the model is likely "on the right track" and merely requires the local refinement of a revision cycle, whereas difficult problems necessitate the broader global exploration of a tree-search algorithm.

## The Efficiency of Inference Compute {#inference-efficiency}

The results of this compute-optimal analysis demonstrate that a smaller base model utilizing an optimized test-time strategy can outperform a model 14 times its size on problems of intermediate difficulty. This suggests that for a wide regime of tasks, scaling search depth is a more efficient lever for performance than scaling the raw number of parameters. However, this exchangeability has a clear lower bound; on extreme difficulty levels where the base model lacks the fundamental knowledge to even initiate a reasoning path, additional inference compute yields negligible gains. This bifurcation implies that the future of reasoning architectures, such as the o1 series, will move toward a hybrid structure that dynamically adjusts its search budget based on real-time difficulty estimation, marking a shift from monolithic scaling to a more algorithmic approach to intelligence.

## Resources

- [Test-Time Compute Paper on arXiv](https://arxiv.org/abs/2408.03314) {type: article, provider: arXiv}
- [Google DeepMind Research Blog](https://deepmind.google/discover/blog/scaling-inference-compute/) {type: article, provider: Google DeepMind}
