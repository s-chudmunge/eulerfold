---
title: "Toolformer: Self-Supervised Tool Use"
authors: "Schick et al. (2023)"
citation: "Schick, T., Dwivedi-Yu, J., Dess\u00ec, R., Raileanu, R., Lomeli, M., Zettlemoyer, L., ... & Scialom, T. (2023). Toolformer: Language models can teach themselves to use tools. arXiv preprint arXiv:2302.04761."
link: "https://arxiv.org/abs/2302.04761"
slug: "toolformer-self-supervised-tools"
heroImage: "https://ar5iv.labs.arxiv.org/html/2302.04761/assets/x1.png"
---

# Toolformer: Self-Supervised Tool Use

The 2023 'Toolformer' paper introduced a method for language models to autonomously learn how to use external tools through a self-supervised process. While previous approaches required large-scale human annotations or specialized architectural changes, researchers at Meta AI showed that a model can teach itself to use APIs—such as a calculator, a search engine, or a calendar—by simply identifying where a tool's result would make its next word easier to predict. It was a shift from viewing tools as external additions to viewing them as an integrated part of the model's fundamental predictive capability.

## The Utility-Based Filtering Shift {#self-supervised-discovery}

![The Toolformer pipeline: generating, executing, and filtering API calls based on predictive utility.](https://ar5iv.labs.arxiv.org/html/2302.04761/assets/x1.png)

_The Toolformer pipeline: generating, executing, and filtering API calls based on predictive utility._

Toolformer enabled language models to autonomously learn the use of external tools by treating API calls as standard text tokens and filtering them based on their predictive utility. Instead of relying on human-annotated examples, the model identifies potential tool-use opportunities across a large corpus and keeps only those API calls that significantly reduce the weighted log-loss of its subsequent token predictions. By representing tools—such as calculators or search engines—as simple character sequences within its existing vocabulary, the architecture can be fine-tuned to use any digital interface without modification to its underlying Transformer blocks. This shift toward self-supervised discovery revealed that a model's "agency" is not an external addition, but a natural extension of its fundamental objective to minimize uncertainty about the world.

## API Calls as Discrete Tokens {#api-as-text}

How Toolformer integrates these tools lies in its representation of API calls as standard text strings within its existing vocabulary. By using special tokens like '[' and ']' to denote the start and end of a call, the model treats tool-use as a language task. For example, a math problem is solved by predicting a string like '[Calculator(123 * 456) -> 56088]'. This ensures that the model can be fine-tuned on its own augmented data without any changes to its underlying Transformer architecture. This finding revealed that the interface between a reasoning engine and a physical or digital tool can be as simple as a sequence of characters. It suggested that a sufficiently powerful language model can use any digital interface as long as its inputs and outputs can be linearized into text.

## A Sensory Array of Digital Tools {#tool-variety}

The researchers equipped Toolformer with a diverse array of five tools: a Calculator for precise arithmetic, a Q&A system for factual lookups, a Search Engine for Wikipedia snippets, a Calendar for temporal context, and a Translation system. This specific combination addressed the most common failures of modern LLMs—precise math, up-to-date facts, and temporal reasoning. By using the 'Calendar' tool, for example, a 6.7-billion parameter model could outperform GPT-3 (175B) on questions about current dates, despite being significantly smaller. This proved that a model's 'intelligence' can be artificially boosted by delegating complex sub-tasks to specialized, reliable external services. It shifted the focus from building a single 'god-model' to building a coordinated system of specialists.

## The Scaling Paradox of Tool Use {#zero-shot-generalization}

Toolformer's success created a scaling paradox where a smaller, tool-using model can significantly outperform larger models on specific factual and logical benchmarks. This revealed a fundamental inefficiency in large-scale pre-training: we often use billions of parameters to memorize facts that could be easily retrieved from a simple database. It raises the question of whether the future of AI lies in even larger models or in finding a way to make smaller models even more adept at using the tools we already have. It suggested that as tools become more integrated, the 'size' of a model may become less important than its 'agency'—its ability to decide when and how to access the world beyond its own weights.

## Resources

- [Meta AI Toolformer Blog](https://ai.meta.com/blog/toolformer-language-models-can-teach-themselves-to-use-tools/) {type: article, provider: Meta AI}
- [Toolformer Paper on arXiv](https://arxiv.org/abs/2302.04761) {type: article, provider: arXiv}
