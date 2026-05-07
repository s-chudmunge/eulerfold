---
title: "InstructGPT: The Architecture of Alignment"
authors: "Long Ouyang, et al. (OpenAI)"
citation: "Ouyang, L., et al. (2022). Training language models to follow instructions with human feedback. NeurIPS."
link: "https://arxiv.org/abs/2203.02155"
heroImage: "https://ar5iv.labs.arxiv.org/html/2203.02155/assets/x1.png"
slug: "instruct-gpt-alignment"
---

The release of GPT-3 proved that Large Language Models (LLMs) are formidable storehouses of human knowledge, yet it also revealed a fundamental misalignment. A model trained strictly on next-token prediction learns to imitate the internet, not to be a helpful assistant. It will complete a user's prompt by following its statistical distribution, which often leads to toxic, untruthful, or unhelpful outputs. InstructGPT resolved this through Reinforcement Learning from Human Feedback (RLHF), a multi-stage process that shifted the model's objective from imitation to alignment with human intent.

## The Misalignment of Log-Likelihood {#misalignment}

The core problem identified by OpenAI researchers was that the standard pre-training objective—maximizing the log-likelihood of the next token on a massive corpus—is a "blind" signal. It prioritizes the most frequent patterns found in digital text, regardless of their utility or safety. For example, if a user asks a question, a raw LLM might respond with another question, as it has seen countless lists of questions in its training data. InstructGPT addresses this by introducing a "helpful, honest, and harmless" (HHH) signal, ensuring that the model's output distribution is conditioned on human preference rather than just statistical frequency.

## Stage 1: Supervised Fine-Tuning (SFT) {#sft}

The alignment process begins with a relatively small but high-quality dataset of roughly 13,000 prompts. For these prompts, a team of human labelers wrote the "ideal" response, covering tasks from creative writing to technical explanation. By fine-tuning the base GPT-3 model on this demonstration set, the researchers created the SFT (Supervised Fine-Tuning) model. While this stage significantly improves the model's ability to follow instructions, it is limited by the labor-intensive nature of human writing; it provides a strong starting point but cannot scale to the vast diversity of possible user queries.

## Stage 2: Reward Modeling (RM) and Human Ranking {#reward-modeling}

To scale the alignment signal, the researchers turned to a ranking-based approach. They took a new set of 33,000 prompts and generated several candidate outputs (between 4 and 9) for each from the SFT model. Human labelers were then tasked with ranking these outputs from best to worst. This ranking data was used to train a separate 6-billion parameter Reward Model (RM). By learning to predict which output a human would prefer, the RM effectively becomes a "digital proxy" for human judgment, capable of scoring millions of potential responses in a way that is differentiable and scalable.

## Stage 3: PPO Optimization and the KL Penalty {#ppo}

In the final stage, the SFT model is optimized using the Reward Model through Proximal Policy Optimization (PPO). The model "practices" on a set of 31,000 unlabeled prompts, generating responses and receiving scores from the Reward Model. To prevent the model from "reward hacking"—finding degenerate patterns that fool the RM without actually being helpful—a Kullback–Leibler (KL) divergence penalty is added to the objective. This penalty ensures that the model's policy stays close to the original SFT distribution, maintaining the linguistic integrity of the model while steering it toward high-reward (high-preference) behavior.

## The Alignment Tax: Performance vs. Safety {#alignment-tax}

A significant discovery in the InstructGPT paper was the "alignment tax"—the observed drop in performance on standard academic NLP benchmarks (such as SQuAD or machine translation) when a model is fine-tuned for instruction-following. To mitigate this, the researchers utilized a hybrid objective called PPO-ptx, which mixed the original pre-training gradients with the RLHF gradients. This ensured that the model remained a powerful generalist while gaining the specialized ability to be a helpful assistant. The result was that a 1.3B parameter InstructGPT model was significantly preferred by humans over the original 175B parameter GPT-3 base model, proving that alignment is a more potent strategy than raw scaling.

## Impact: The Blueprint for ChatGPT {#impact}

InstructGPT provided the technical blueprint for the conversational AI revolution. By demonstrating that human preference can be used as a robust and scalable training signal, the paper opened the door for models that are not just knowledge-rich, but safe and steerable. This methodology serves as the foundation for modern conversational agents, where the primary challenge is no longer just processing information, but ensuring that the information is presented in a way that respects the subtle, unstated preferences of human users.

## Resources

- [InstructGPT: Training language models to follow instructions (Original Paper)](https://arxiv.org/abs/2203.02155) {type: article, provider: arXiv}
- [OpenAI: Aligning Language Models with Human Intent](https://openai.com/research/instruction-following) {type: article, provider: OpenAI}
- [Illustrating RLHF (Hugging Face)](https://huggingface.co/blog/rlhf) {type: article, provider: Hugging Face}
- [RLHF and InstructGPT Explained](https://www.youtube.com/watch?v=2MBJOuVq380) {type: video, provider: YouTube}
