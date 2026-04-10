---
title: "Agentomics-ML: Autonomous ML for Genomics"
authors: "2025 Preprint"
citation: "arXiv:2506.05542"
link: "https://ar5iv.org/abs/2506.05542"
heroImage: "https://ar5iv.labs.arxiv.org/html/2506.05542/assets/sections/03_methodology/FIGURE_FINAL.png"
slug: "agentomics-ml-autonomous-ml-genomics"
---

## The Complexity Bottleneck in Biological Datasets {#problem-space}

The application of autonomous machine learning agents to genomic and transcriptomic data is frequently hindered by the extreme dimensionality and technical noise inherent in biological sequences. General-purpose agents often struggle with datasets like `AGO2_CLASH`, which require the simultaneous modeling of interactions between two distinct RNA sequences, often failing to produce executable code or failing to account for the non-linear relationship between sequence features and biological function. This "complexity bottleneck" leads to high failure rates in automated systems that rely on open-ended planning or superficial data summaries. Furthermore, the presence of batch effects and class imbalances in clinical genomics means that standard random data splits often result in overly optimistic performance estimates that do not generalize to real-world biological variability.

## Constrained Iterative Experimentation {#mechanism}

Agentomics-ML addresses these challenges by replacing open-ended agentic planning with a rigid, four-stage experimentation loop: Data Exploration, Representation Choice, Script Production, and Training. Operating within a secure Docker environment, the agent utilizes a Bash shell and Python to interact directly with raw genomic data. During the Data Exploration phase, the system generates comprehensive descriptive statistics and domain-specific feature summaries, which inform the subsequent selection of model architectures and tokenization strategies. This structured approach is enforced through programmatic validation using the Pydantic AI framework, which requires the agent to verify the syntax and argument consistency of its scripts—using dummy data—before proceeding to the training phase.

The system's "Reflect-and-Refine" logic allows it to adapt to specific biological constraints without human intervention. After each training iteration, the agent collects both scalar feedback (validation metrics) and verbal feedback (a self-generated critique of the model's performance). If the reflection step identifies issues such as overfitting or a failure to capture long-range genomic dependencies, the agent uses this verbal feedback to adjust hyperparameters or data representations in the next iteration. By programmatically hiding the test set from the agent's reasoning process, the framework ensures that any performance gains are derived from genuine architectural improvements rather than data leakage.

## Domain-Aware Abstraction and Robustness {#abstraction}

The abstraction of the ML development pipeline into a domain-constrained agent allows for a 93.33% success rate on complex biological tasks, significantly outperforming general-purpose systems. By implementing non-random data splitting strategies based on its initial data exploration, Agentomics-ML effectively mitigates the impact of batch effects, providing a more realistic estimation of model generalization. The system's ability to autonomously install necessary bioinformatics tools and manage complex Conda environments further reduces the technical overhead of genomic research. This shift toward autonomous, domain-aware experimentation suggests a future where the role of the computational biologist transitions from routine pipeline implementation to the high-level interpretation of the agent's derived biological insights.

## Resources {#resources}

- [Agentomics-ML Paper](https://ar5iv.org/abs/2506.05542) {type: article, provider: ar5iv}
- [Pydantic AI Framework](https://ai.pydantic.dev/) {type: tool, provider: Pydantic}
- [Conda Package Manager](https://docs.conda.io/en/latest/) {type: tool, provider: Conda}
