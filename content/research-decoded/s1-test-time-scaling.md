---
title: "s1: Simple Test-Time Scaling and the Efficiency of Thought"
authors: "Muennighoff, et al."
citation: "arXiv:2501.19393 (2025)"
link: "https://arxiv.org/abs/2501.19393"
heroImage: "https://arxiv.org/html/2501.19393/x1.png"
slug: "s1-test-time-scaling"
---

The scaling of large language models has traditionally focused on increasing parameters and training data, but recent developments have shifted attention toward test-time scaling. This approach provides models with more computational resources during inference, allowing them to think through complex problems before responding. The s1 paper, published in 2025, demonstrates that this capability can be achieved through a supervised fine-tuning strategy on a small, high-quality dataset of one thousand examples, combined with a decoding intervention called budget forcing.

The principle behind test-time scaling is that the probability of reaching a correct answer in difficult tasks increases with the amount of compute spent during inference. While standard models produce answers in a single pass, reasoning models generate an internal chain of thought. The researchers found that the efficiency of this thought process is highly sensitive to training data quality. By using the curated s1K dataset, the model achieved performance comparable to systems trained on much larger datasets, demonstrating a new level of sample efficiency in model alignment.

The s1K dataset consists of one thousand difficult questions paired with detailed reasoning traces. These examples were selected through a multi-stage filtering process that prioritized difficulty and diversity over sheer volume. The effectiveness of such a small dataset suggests that the capacity for complex reasoning is already latent in large pretrained models and can be activated by a targeted set of high-signal examples. This challenges the assumption that advanced reasoning is only accessible through massive reinforcement learning runs.

Budget forcing is the primary mechanism for scaling compute at test time in the s1 framework. During decoding, reasoning models often use a specific token to signal the completion of their internal monologue. Budget forcing involves suppressing this token if the model attempts to finish prematurely and appending a prompt to continue thinking. This intervention often triggers self-correction, as the model identifies flaws in its initial logic and explores alternative paths. This process effectively trades time for accuracy without requiring modifications to the underlying model weights.

There is a distinction between parallel scaling, which involves generating and voting on multiple independent answers, and sequential scaling, which lengthens a single thought process. Sequential scaling, as facilitated by budget forcing, allows for deeper reasoning where later steps depend on earlier ones. Results on the American Invitational Mathematics Examination indicate that sequential scaling is more efficient for complex tasks, as it enables the kind of iterative refinement necessary for solving difficult logical proofs. This shift suggests that the future of AI may depend on more sophisticated management of inference-time compute.

## Resources

- [s1: Simple Test-Time Scaling](https://arxiv.org/abs/2501.19393) {type: article, provider: arXiv}
- [s1 GitHub Repository & s1K Dataset](https://github.com/simplescaling/s1) {type: article, provider: GitHub}
- [Test-Time Scaling Explained](https://huggingface.co/blog/test-time-scaling) {type: article, provider: Hugging Face}
- [The New Frontier of Inference-Time Compute](https://www.youtube.com/watch?v=5_tE80nO7Zk) {type: video, provider: YouTube}
