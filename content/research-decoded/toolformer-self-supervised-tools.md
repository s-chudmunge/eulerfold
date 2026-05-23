---
title: "Toolformer: Self-Supervised Tool Use"
authors: "Schick et al. (2023)"
citation: "Schick, T., Dwivedi-Yu, J., Dess\u00ec, R., Raileanu, R., Lomeli, M., Zettlemoyer, L., ... & Scialom, T. (2023). Toolformer: Language models can teach themselves to use tools. arXiv preprint arXiv:2302.04761."
link: "https://arxiv.org/abs/2302.04761"
slug: "toolformer-self-supervised-tools"
heroImage: "https://ar5iv.labs.arxiv.org/html/2302.04761/assets/x1.png"
---

Language models often struggle with tasks that require precise arithmetic, up-to-date facts, or temporal reasoning. The 2023 Toolformer paper from Meta AI introduced a self-supervised method for models to learn the use of external tools. By identifying where the result of an API call would improve the prediction of the next word, the model can autonomously integrate tools like calculators, search engines, and calendars into its fundamental predictive process. This approach avoids the need for large-scale human annotation or specialized architectural modifications.

The learning process treats API calls as standard text tokens. The model identifies potential opportunities for tool use across a corpus and retains only those calls that significantly reduce the weighted log-loss of subsequent token predictions. By representing tools as simple character sequences, the architecture can be fine-tuned to interact with digital interfaces without changing its underlying Transformer blocks. Agency is thus framed as an extension of the model's objective to minimize uncertainty.

API calls are integrated as discrete strings within the model's vocabulary, using specific tokens to mark the start and end of a call. A mathematical operation might be represented as a character sequence that the model learns to generate when prompted by a relevant context. This finding suggests that the interface between a reasoning engine and an external tool can be linearized into text, allowing a model to use any digital service that accepts text inputs and produces text outputs.

In testing, Toolformer was equipped with five tools: a calculator, a question-answering system, a search engine, a calendar, and a translation system. This selection targeted common weaknesses in large language models. For example, a 6.7-billion parameter model using a calendar tool outperformed a 175-billion parameter model on questions involving current dates. This demonstrates that delegating specific sub-tasks to reliable external services can enhance a model's utility more effectively than increasing its parameter count.

The success of Toolformer suggests a shift in the focus of AI development from the creation of larger models to the improvement of a model's ability to access external resources. Much of the parameter capacity in large-scale pre-training is currently used to memorize facts that are easily retrievable from databases. As tools become more integrated, the effectiveness of a system may depend less on the size of its internal weights and more on its ability to decide when and how to engage with the world beyond them.

## Resources

- [Meta AI Toolformer Blog](https://ai.meta.com/blog/toolformer-language-models-can-teach-themselves-to-use-tools/) {type: article, provider: Meta AI}
- [Toolformer Paper on arXiv](https://arxiv.org/abs/2302.04761) {type: article, provider: arXiv}
