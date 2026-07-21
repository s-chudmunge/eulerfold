---
title: "Teaching AI to Think Before It Acts"
authors: "Yao et al. (2022)"
citation: "Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2022). ReAct: Synergizing reasoning and acting in language models. arXiv preprint arXiv:2210.03629."
link: "https://arxiv.org/abs/2210.03629"
slug: "react-reasoning-and-acting"
heroImage: "/images/research-decoded/react-reasoning-and-acting.png"
---

The 2022 ReAct framework introduced a prompting method that allows large language models to interleave reasoning traces with task-specific actions. While previous approaches often treated internal reasoning and external acting as separate functions, researchers from Princeton and Google DeepMind demonstrated that combining them creates a synergistic effect. The model uses thoughts to plan and actions to ground its reasoning in external data, moving away from a static black-box response model toward a dynamic system capable of multi-step interaction with its environment.

The ReAct loop formalizes a cycle of thoughts, actions, and observations. The model first produces a textual trace that decomposes a complex goal into manageable steps. It then executes a specific action, such as a search query, and incorporates the resulting observation back into its context window. This continuous updating of the internal state allows the model to refine its reasoning based on real-world feedback. This grounded interaction reduces the frequency of hallucinations by ensuring that the model's claims are supported by external evidence.

Hallucination remains a significant failure mode for models relying solely on internal, static weights. In fact-heavy tasks like HotpotQA, traditional reasoning models often generate incorrect information. ReAct mitigates this by requiring the model to retrieve and verify specific data before making a claim. A manual study indicated that over half of the errors in standard reasoning chains were caused by hallucination, a figure that ReAct significantly lowered. This confirms that accuracy is not only a function of model parameters but also of the ability to verify internal states against external truth.

The framework employs dynamic reasoning-driven retrieval, which differs from static retrieval-augmented generation. Instead of fetching a fixed set of documents at the start, ReAct identifies what information is missing after each observation and formulates new, specific queries. This enables multi-hop reasoning, where the answer to one query informs the next. The value of the model lies in its ability to navigate a database strategically rather than simply memorizing its contents.

In text-based planning environments like ALFWorld, ReAct improved success rates by 34% over non-reasoning baselines. By using sparse thoughts to apply commonsense reasoning to actions, the model maintains a coherent plan while reacting to unexpected feedback. This suggests that intelligence in an agentic context is the ability to balance long-term planning with immediate flexibility. Whether this approach scales to physical environments with higher latency or more complex state spaces remains a subject of ongoing research.

## Resources

- [ReAct Paper on arXiv](https://arxiv.org/abs/2210.03629) {type: article, provider: arXiv}
- [Google AI Blog: ReAct](https://ai.googleblog.com/2022/11/react-synergizing-reasoning-and-acting.html) {type: article, provider: Google AI}
- [GitHub Implementation](https://github.com/ysymyf/ReAct) {type: code, provider: GitHub}
