---
title: "ReAct: Reason + Act"
authors: "Yao et al. (2022)"
citation: "Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2022). ReAct: Synergizing reasoning and acting in language models. arXiv preprint arXiv:2210.03629."
link: "https://arxiv.org/abs/2210.03629"
slug: "react-reasoning-and-acting"
heroImage: "https://ar5iv.labs.arxiv.org/html/2210.03629/assets/x1.png"
---

# ReAct: Reason + Act

The 2022 'ReAct' paper introduced a prompting framework that allows Large Language Models to interleave reasoning traces with task-specific actions. While previous models either focused on internal reasoning (Chain-of-Thought) or external acting (Web-browsing), researchers at Princeton and Google DeepMind showed that combining the two leads to a synergistic effect where the model uses 'thoughts' to plan and 'actions' to ground its reasoning in reality. It was a shift from viewing a model as a static black box to viewing it as an agentic system capable of dynamic, multi-step interaction with its environment.

## The Thought-Action-Observation Loop {#thought-action-observation}

![The ReAct loop: interleaving reasoning traces (thoughts) with external actions and observations.](https://ar5iv.labs.arxiv.org/html/2210.03629/assets/x1.png)

_The ReAct loop: interleaving reasoning traces (thoughts) with external actions and observations._

ReAct synergized the internal reasoning of large language models with external acting by formalizing an interleaved loop of thoughts, actions, and observations. Unlike traditional models that generate a single-pass response, ReAct requires the system to first produce a "thought"—a textual trace that decomposes a complex goal—before executing a specific "action" to query an external environment. The resulting "observation" is then incorporated back into the context window, forcing the model to update its internal state and "reason to act" or "act to reason" in a continuous cycle. This shift toward grounded, multi-hop interaction proved that the most effective way to solve fact-heavy problems is to treat language as a dynamic interface for both internal reflection and real-world verification, significantly reducing the hallucinations common in isolated reasoning chains.

## Grounded Reasoning and Hallucination {#grounded-reasoning}

The reasoning behind ReAct was to solve the persistent problem of hallucination in Large Language Models. In fact-heavy tasks like HotpotQA, traditional Chain-of-Thought models often 'make up' facts because they rely solely on their internal, static weights. ReAct forces the model to be 'grounded' by requiring it to retrieve specific sentences from Wikipedia before making a claim. A manual study showed that over half of the errors in standard reasoning models were caused by hallucination, whereas ReAct's grounded approach significantly reduced these failures. This proved that a model's accuracy is not just a function of its size, but of its ability to verify its own internal state against an external source of truth. It suggested that true intelligence requires the humility to look for more information when internal confidence is low.

## Dynamic Reasoning-Driven Retrieval {#dynamic-retrieval}

A critical technical detail is ReAct's use of 'dynamic reasoning-driven retrieval,' which differs from standard Retrieval-Augmented Generation (RAG). In a standard RAG system, documents are fetched once at the beginning of the query. In ReAct, the model reads a small snippet, reasons about what is still missing, and then formulates a new, more specific search query to find the next piece of the puzzle. This allows for 'multi-hop' reasoning, where the answer to one question leads the model to ask a second, more complex question. This iterative process proved that the power of an LLM is not in its ability to memorize a database, but in its ability to navigate one. It raised the question of whether the future of knowledge retrieval lies in better search algorithms or in better agents that know how to use the existing ones.

## Scaling Decision Making {#agentic-scaling}

ReAct's success was also demonstrated in complex decision-making environments like ALFWorld, a text-based game requiring long-horizon planning. While simpler models often get stuck in repetitive loops or fail to plan more than one step ahead, ReAct uses 'sparse thoughts' to apply commonsense reasoning to its actions—such as deciding to check the fridge for lettuce before looking in the bedroom. This approach led to a 34% absolute success rate improvement over non-reasoning baselines. It revealed that 'intelligence' in an agent is the ability to maintain a coherent internal plan while being flexible enough to react to unexpected feedback. It remains to be seen if this loop can be scaled to even more complex, real-world physical environments without a significant increase in computational latency.

## Resources

- [ReAct Paper on arXiv](https://arxiv.org/abs/2210.03629) {type: article, provider: arXiv}
- [Google AI Blog: ReAct](https://ai.googleblog.com/2022/11/react-synergizing-reasoning-and-acting.html) {type: article, provider: Google AI}
- [GitHub Implementation](https://github.com/ysymyf/ReAct) {type: code, provider: GitHub}
