---
title: "GPT-3: Few-Shot Learners"
authors: "Brown et al. (2020)"
citation: "Brown, T., Mann, B., Ryder, N., Subbiah, M., Kaplan, J. D., Dhariwal, P., ... & Amodei, D. (2020). Language models are few-shot learners. Advances in neural information processing systems, 33, 1877-1901."
link: "https://arxiv.org/abs/2005.14165"
slug: "gpt-3-few-shot-learners"
heroImage: "https://ar5iv.labs.arxiv.org/html/2005.14165/assets/figures/eval_strategies.png"
---

# GPT-3: Few-Shot Learners

The 2020 paper on GPT-3 marked a departure from the fine-tuning paradigm that had dominated the previous few years. As models grew larger, the requirement to have thousands of labeled examples for every new task became an obvious bottleneck. OpenAI researchers argued that a model with 175 billion parameters would be large enough to learn tasks directly from its context. They demonstrated that scaling the model was not just about increasing accuracy, but about changing the nature of how a model interacts with information.

## In-Context Learning {#in-context-learning}

![Language model meta-learning showing in-context learning loops.](https://ar5iv.labs.arxiv.org/html/2005.14165/assets/figures/metalearning.png)

_Language model meta-learning showing in-context learning loops._

The emergence of GPT-3 marked a departure from the fine-tuning paradigm by demonstrating that a model with 175 billion parameters can learn new tasks directly from its context. This 'in-context learning' allows the model to adapt to a specific request—such as translation or coding—by simply providing a few examples within a natural language prompt. This shift from task-specific weight updates toward few-shot prompting suggests that pre-training on a sufficiently massive corpus allows a model to develop a generalist's understanding of language that can be activated on demand. It proved that scaling a model is not just about increasing accuracy, but about enabling a 'meta-learning' capability that identifies the logic of a task in real-time.

## Scaling as a Strategy {#scaling-strategy}

The shift to 175 billion parameters was a ten-fold increase over its predecessor, GPT-2. This scale allowed the model to handle tasks it was never explicitly trained for, such as writing code or solving arithmetic problems. The researchers found that while zero-shot performance improved steadily, few-shot performance increased much more rapidly with size. It reveals that larger models are better at using the information they are given at inference time.

## The Generalization Limit {#generalization-limit}

This reliance on scale raises a fundamental question about the nature of intelligence in machines. If a model can solve a problem simply by seeing three examples, is it reasoning or just performing advanced pattern matching? The boundary between the two becomes increasingly thin as the model’s capacity grows. It remains to be seen if scaling alone can eventually overcome the inherent limitations of predicting the next token in a sequence.

## Resources

- [OpenAI GPT-3 Blog](https://openai.com/blog/gpt-3-apps) {type: article, provider: OpenAI}
- [Lambda GPT-3 Guide](https://lambdalabs.com/blog/demystifying-gpt-3) {type: article, provider: Lambda}
