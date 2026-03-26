---
title: "InstructGPT: Model Alignment"
authors: "Ouyang et al. (2022)"
citation: "Ouyang, L., Wu, J., Jiang, X., Almeida, D., Wainwright, C., Mishkin, P., ... & Lowe, R. (2022). Training language models to follow instructions with human feedback. Advances in Neural Information Processing Systems, 35, 27730-27744."
link: "https://arxiv.org/abs/2203.02155"
slug: "instruct-gpt-alignment"
heroImage: "https://ar5iv.labs.arxiv.org/html/2203.02155/assets/x2.png"
---

# InstructGPT: Model Alignment

The problem with large language models is that they are trained to predict the next word on the internet, which is not necessarily the same as being helpful or following instructions. This 'misalignment' led to the development of InstructGPT in 2022. The researchers at OpenAI introduced a method to steer model behavior using human feedback, ensuring that the model’s outputs aligned more closely with what a user actually intended. It moved the focus from raw capability to the quality of the interaction.

## Human-in-the-Loop Alignment {#rlhf}

![Human preference evaluations of InstructGPT vs standard GPT-3.](https://ar5iv.labs.arxiv.org/html/2203.02155/assets/x1.png)

_Human preference evaluations of InstructGPT vs standard GPT-3._

InstructGPT aligned the behavior of large language models with human intent by replacing simple next-token prediction with a three-step Reinforcement Learning from Human Feedback (RLHF) pipeline. After an initial phase of supervised fine-tuning on human-written demonstrations, a separate reward model is trained to rank multiple model outputs based on human preference. The final model is then optimized using Proximal Policy Optimization (PPO) to maximize the scores provided by this reward model, effectively using human judgment as a direct, differentiable signal for behavioral alignment. This process proved that a model's utility is not just a function of its raw knowledge, but of its ability to navigate the subtle, often unstated preferences that define a helpful interaction.

## Following Intent {#intent}

The result of this alignment is a model that is significantly better at following complex instructions, even at much smaller scales. The researchers found that outputs from a 1.3-billion parameter InstructGPT model were often preferred over the standard 175-billion parameter GPT-3. This demonstrates that raw size is less important than how the model is directed. It suggests that the 'knowledge' is already present in the pre-trained weights; the alignment process simply unlocks the ability to use it correctly.

## The Safety Trade-off {#safety-tradeoff}

Alignment also introduces new challenges, such as the risk of 'over-optimization' where the model becomes too helpful or loses some of its creative edge. There is a tension between making a model safe and keeping it useful for diverse tasks. This process reveals that the values of the people doing the ranking are ultimately encoded into the model’s behavior. It raises the question of whose intent a model should follow and how those values should be chosen for a global user base.

## Resources

- [Aligning Language Models](https://openai.com/research/instruction-following) {type: article, provider: OpenAI}
- [RLHF Explained](https://huggingface.co/blog/rlhf) {type: article, provider: Hugging Face}
