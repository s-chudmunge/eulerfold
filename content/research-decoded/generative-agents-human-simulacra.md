---
title: "Generative Agents"
authors: "Park et al. (2023)"
citation: "Park, J. S., O'Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., & Bernstein, M. S. (2023). Generative agents: Interactive simulacra of human behavior. arXiv preprint arXiv:2304.03442."
link: "https://arxiv.org/abs/2304.03442"
slug: "generative-agents-human-simulacra"
heroImage: "https://ar5iv.labs.arxiv.org/html/2304.03442/assets/figures/figure_cover4.png"
---

Simulating believable human behavior in digital environments has historically relied on rigid scripts or simple state machines. In 2023, researchers from Stanford and Google introduced an architecture for generative agents that use large language models to maintain a persistent memory and form autonomous plans. By populating a sandbox environment with twenty-five agents, the study observed how individual memory and reflection could lead to complex social dynamics, such as information diffusion and coordinated activity.

The core of this architecture is a ranked memory stream that records an agent's experiences. To manage the finite context window of the underlying model, a ranking function retrieves memories based on a weighted calculation of recency, importance, and semantic relevance. This allows an agent to recall pertinent details about its environment or past interactions when making decisions. Periodically, the system synthesizes these raw observations into high-level reflections, which are stored back in the memory stream as abstract concepts that define the agent's evolving identity.

Believable social behavior emerges when agents can generalize from their experiences. Without a reflection mechanism, an agent might remember specific instances of an event without forming a broader understanding of its implications. The reflection process is triggered when the importance scores of recent memories reach a certain threshold, prompting the model to generate salient questions and extract insights. These insights serve as the basis for long-term planning, allowing agents to maintain consistent goals while remaining reactive to immediate environmental changes.

Long-term coherence is managed through a top-down planning system. Agents generate a broad daily schedule that is recursively refined into detailed time blocks. If an agent perceives a significant change in its environment, such as a fire or a new conversation, it can re-plan its schedule based on the updated context. This suggests that believability is a function of balancing stable long-term intent with flexible, moment-to-moment execution.

The experiment demonstrated that social phenomena, such as the coordination of a Valentine's Day party, can emerge from simple cognitive primitives. When one agent was given the intent to host a party, others heard of it through conversation and adjusted their schedules to attend. This suggests that social intelligence does not require global coordination but can arise from a group of individuals who each reason about their own history and goals. Believable simulation is thus achieved through the interaction of persistent internal worlds shared through natural language.

## Resources

- [Generative Agents Demo](https://reverie.herokuapp.com/arXiv_Demo/) {type: docs, provider: Stanford}
- [Generative Agents Paper on arXiv](https://arxiv.org/abs/2304.03442) {type: article, provider: arXiv}
