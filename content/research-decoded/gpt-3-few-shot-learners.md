---
title: "GPT-3: Language Models are Few-Shot Learners"
authors: "Tom B. Brown, et al. (OpenAI)"
citation: "Brown, T. B., et al. (2020). Language models are few-shot learners. arXiv preprint arXiv:2005.14165."
link: "https://arxiv.org/abs/2005.14165"
heroImage: "https://ar5iv.labs.arxiv.org/html/2005.14165/assets/figures/eval_strategies.png"
slug: "gpt-3-few-shot-learners"
---

The 2020 release of GPT-3 marked a paradigm shift in artificial intelligence, moving the field away from the dominant "pre-train then fine-tune" workflow. As models grew in complexity, the requirement to gather thousands of labeled examples for every specific task—from translation to sentiment analysis—became an unsustainable bottleneck. OpenAI researchers proposed a radical alternative: a model so massive that it could perform tasks by simply observing a few examples in its input context. This "few-shot learning" capability suggested that intelligence is not just about learning a specific rule, but about the "meta-learning" ability to identify patterns and logic in real-time.

## Meta-Learning as the Scaling Goal {#meta-learning}

Before GPT-3, the assumption was that a general-purpose model like BERT or GPT-2 needed to be "specialized" through fine-tuning on a task-specific dataset. GPT-3 challenged this by demonstrating that at a scale of 175 billion parameters, the model becomes a "meta-learner." It treats the task description and examples provided in the prompt as part of its sequential environment. By conditioning on these demonstrations, the model identifies the underlying rule and applies it to the final input without any updates to its internal weights. This shift from task-specific weight updates to "In-Context Learning" (ICL) effectively turned the model into a software-like engine that could be re-programmed via natural language.

## Architecture: 96 Layers of Sparse-Dense Alternation {#architecture}

The sheer scale of GPT-3 required significant architectural engineering beyond simple layer stacking. The model is composed of 96 Transformer decoder layers, each with 96 attention heads and a hidden dimension of 12,288. To handle the massive computational cost and memory requirements of 175 billion parameters, the researchers utilized a design inspired by the Sparse Transformer. Instead of every layer performing dense global attention, GPT-3 utilizes alternating dense and locally banded sparse attention patterns. This allows the model to maintain long-range coherence over its 2048-token context window while reducing the quadratic memory overhead that would otherwise cripple a model of this magnitude.

## The Corpus of Human Knowledge {#dataset}

The "intelligence" of GPT-3 is an emergent property of its training data—a massive, 300-billion token collection designed to represent the breadth of human thought. This corpus was built primarily from a filtered version of Common Crawl (60%), supplemented by high-quality sources like WebText2 (22%), two massive book collections (16%), and the entirety of English Wikipedia (3%). By weighting these sources during training, the researchers ensured that the model prioritized high-quality, long-form human reasoning over the noise of the broader internet. This exposure to a nearly exhaustive sample of human language allowed GPT-3 to develop the latent associations required for "zero-shot" performance across domains it was never explicitly told to learn.

## The Pareto Frontier of Zero, One, and Few-Shot {#benchmarking}

The researchers evaluated GPT-3 across three distinct paradigms: **Zero-shot** (a simple instruction), **One-shot** (instruction plus one example), and **Few-shot** (instruction plus 10–100 examples). The results revealed a clear scaling law: while zero-shot performance improved steadily with model size, the "learning curve" of few-shot performance was significantly steeper. In many cases, a 175B model in few-shot mode could match or exceed the performance of state-of-the-art models that had been extensively fine-tuned on thousands of examples. This proved that large models are not just "better" at following instructions; they are fundamentally better at using provided context to resolve ambiguity and align with the user's intent.

## The Ghost in the Machine: Hallucination and Recency Bias {#limitations}

Despite its breakthrough capabilities, GPT-3 revealed the inherent weaknesses of the next-token prediction paradigm. Because the model lacks a mechanism to verify facts against an external reality, it is prone to "hallucinations"—generating text that is grammatically perfect but factually impossible. Furthermore, as an autoregressive decoder-only model, it lacks the deep bidirectionality of models like BERT, which can sometimes limit its performance on dense, sentence-level semantic tasks. Finally, the model exhibits a "recency bias" within its context window, sometimes prioritizing the patterns found in the last few examples over the broader instruction provided at the start of the prompt.

## The Legacy of the 175B Benchmark {#legacy}

GPT-3 was more than a model; it was a proof of concept for the "Scaling Hypothesis"—the idea that increasing compute, data, and parameters leads to qualitatively different intelligence. It forced the research community to reconsider the boundaries between pattern matching and reasoning, and it catalyzed the development of the entire modern AI ecosystem, from prompt engineering to the move toward agentic, multi-step systems. GPT-3 established the 175B parameter count as the standard "frontier" benchmark, proving that the future of AI lay in the emergence of generalists.

## Resources

- [Language Models are Few-Shot Learners (Original Paper)](https://arxiv.org/abs/2005.14165) {type: article, provider: arXiv}
- [OpenAI: GPT-3 Research Blog](https://openai.com/blog/gpt-3-apps) {type: article, provider: OpenAI}
- [A Visual Guide to How GPT-3 Works (Jay Alammar)](https://jalammar.github.io/how-gpt3-works-visualizations-debug/) {type: article, provider: Blog}
- [GPT-3 Technical Overview](https://www.youtube.com/watch?v=MQnJZuE-Yt0) {type: video, provider: YouTube}
