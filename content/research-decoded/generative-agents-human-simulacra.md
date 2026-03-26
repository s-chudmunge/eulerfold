---
title: "Generative Agents"
authors: "Park et al. (2023)"
citation: "Park, J. S., O'Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., & Bernstein, M. S. (2023). Generative agents: Interactive simulacra of human behavior. arXiv preprint arXiv:2304.03442."
link: "https://arxiv.org/abs/2304.03442"
slug: "generative-agents-human-simulacra"
heroImage: "https://ar5iv.labs.arxiv.org/html/2304.03442/assets/figures/figure_cover4.png"
---

# Generative Agents

In 2023, the 'Generative Agents' paper from Stanford and Google introduced a way to create believable digital characters that can plan their days, form relationships, and coordinate activities autonomously. While previous non-player characters (NPCs) in games relied on rigid scripts or simple state machines, these agents used large language models to simulate the complexity of human life. The researchers populated a sandbox world with 25 agents and observed how individual actions coalesced into social dynamics. It was a shift from programming behaviors to architecting memories.

## The Ranked Memory Stream {#memory-stream}

![The generative agent architecture: perceiving, remembering, reflecting, and planning in a continuous loop.](https://ar5iv.labs.arxiv.org/html/2304.03442/assets/figures/figure_architecture2.png)

_The generative agent architecture: perceiving, remembering, reflecting, and planning in a continuous loop._

Generative Agents established a framework for believable digital characters by architecting a persistent memory stream that informs every agentic decision. To manage the finite context of a language model, the researchers developed a ranking function that retrieves memories based on a weighted sum of their recency, importance, and semantic relevance to the current situation. This long-term record is periodically synthesized through a "reflection" mechanism, where the model extracts high-level insights from raw observations and stores them back as abstract concepts that define the agent's identity. This shift from programmed state machines toward a recursive architecture of memory and reflection proved that complex social behaviors—such as information diffusion and long-term planning—emerge naturally when an agent is given the ability to recall and reason about its own history.

## The Reflection mechanism {#reflection-mechanism}

To enable agents to generalize from raw observations, the researchers introduced a 'Reflection' mechanism. Without reflection, an agent might remember 'Sam is eating breakfast' multiple times but never realize 'Sam likes to sleep late.' This process is triggered when the importance scores of recent memories exceed a threshold. The agent generates salient questions based on its history, retrieves related memories, and then prompts the model to extract high-level 'insights' or reflections. These reflections are stored back in the Memory Stream as new experiences, effectively creating a deeper layer of personal identity. It proved that intelligence requires a periodic pause to synthesize raw data into abstract concepts, mimicking the human process of self-discovery.

## Recursive Planning and Action {#recursive-planning}

Long-term coherence in agent behavior was achieved through a top-down planning system. Agents first generate a broad schedule for the day, which is then recursively refined into detailed 15-minute blocks. This allows an agent to maintain a consistent goal—like going to work—while remaining reactive to immediate environment changes. For instance, if an agent perceives a fire or starts a conversation, it can choose to 're-plan,' adjusting its entire future schedule based on the new context. This approach proved that 'believability' in a simulation is a product of balancing rigid long-term plans with flexible, moment-to-moment reactions. It suggested that the future of agentic systems lies in the ability to bridge the gap between high-level intent and low-level execution.

## Emergent Social Life {#emergent-social-behavior}

The reasoning behind this architecture was to prove that complex social behaviors, such as information diffusion and relationship building, can emerge from simple cognitive primitives. In one experiment, a single agent was given the intent to throw a Valentine's Day party; by the end of the simulation, 12 other agents had heard about it and coordinated their schedules to attend. This revealed that believable social simulation does not require global coordination, but rather a group of individuals who can each reason about their own history and goals. It suggested that social intelligence is an emergent property of having a persistent internal world that is shared through natural language.

## Resources

- [Generative Agents Demo](https://reverie.herokuapp.com/arXiv_Demo/) {type: docs, provider: Stanford}
- [Generative Agents Paper on arXiv](https://arxiv.org/abs/2304.03442) {type: article, provider: arXiv}
