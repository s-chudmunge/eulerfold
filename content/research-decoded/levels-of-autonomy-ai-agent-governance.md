---
title: "Levels of Autonomy: A Governance Framework for AI Agents"
authors: "Feng et al. (2025)"
citation: "Feng, K. J., et al. (2025). Levels of Autonomy for AI Agents. arXiv preprint arXiv:2506.12469."
link: "https://arxiv.org/abs/2506.12469"
slug: "levels-of-autonomy-ai-agent-governance"
heroImage: "/images/research-decoded/levels-of-autonomy-ai-agent-governance.png"
---

# Levels of Autonomy: A Governance Framework for AI Agents

As AI agents move from experimental sandboxes to high-stakes production environments (e.g., healthcare, financial trading, software deployment), the need for a standardized taxonomy of autonomy has become critical. The 2025 framework by Feng et al. addresses this by proposing a classification system centered on the roles a user (human or AI) may take on when interacting with an agent in a task-based environment.

## The Five Tiers of Agency {#taxonomy-tiers}

![The five levels of autonomy for AI agents, from direct operator to independent observer.](https://arxiv.org/html/2506.12469v1/x1.png)

_The five levels of autonomy for AI agents, from direct operator to independent observer._

The framework categorizes agentic behavior based on the complexity of the task environment and the degree of human oversight required:

1.  **L1: Operator** – The user makes all tactical decisions; the agent acts on direct, immediate commands.
2.  **L2: Collaborator** – User and agent share planning and execution in an iterative, high-frequency loop.
3.  **L3: Consultant** – The agent takes the lead on execution, proactively consulting the user for expertise or preference at critical decision nodes.
4.  **L4: Approver** – The agent operates independently across most tasks, but must pause to request human approval in high-risk or ambiguous cases.
5.  **L5: Observer** – The agent has full independence; the user only observes the final results or periodic status updates.

For researchers and developers, this taxonomy provides a technical vocabulary to describe **Deployment Readiness**. A Level 4 system requires a far more robust "confidence gating" mechanism and "interruptibility" than an L1 tool.

## The "Autonomy Case" and Certification {#certification-procedure}

![The proposed procedure for the issuance of autonomy certificates by a third-party governing body.](https://arxiv.org/html/2506.12469v1/x2.png)

_The proposed procedure for the issuance of autonomy certificates by a third-party governing body._

A major technical contribution of this framework is the **Autonomy Case**—a structured procedure for the issuance of autonomy certificates.
 Developers must provide technical evidence for four architectural pillars:

### Information Symmetry
The human must have access to the agent's internal state. This is typically implemented via **Trace Logs** or **Reasoning Visualizations**. For a Level 3 (Consultant) agent, the system must prove it can surface the "top 3 alternatives" considered at a decision node to allow the user to provide informed preference.

### Action Gating (Interruptibility)
There must be a hard-coded mechanism to override or terminate execution. At Level 4 (Approver), this requires the implementation of **Confidence Thresholds**. If the model's internal probability for a high-risk action (e.g., deleting a database table) falls below $P < 0.95$, the system must default to a "Pause-and-Wait" state.

### Accountability Attribution
Every action must be cryptographically signed or logged in an immutable audit trail. This ensures that the "intent" of the human operator is mapped directly to the agent's output, preventing the "black box" legal challenge in regulated industries.

The framework proposes that these cases be audited by third-party governing bodies, shifting the focus from "how well the AI reasons" to "how safely the AI delegates." It argues that intelligence is not a substitute for control, and as we build toward Level 5, the primary challenge is building the **Interface of Intervention**—the mechanism by which humans safely reclaim agency.

## Resources

- [Levels of Autonomy Paper on arXiv](https://arxiv.org/abs/2506.12469) {type: article, provider: arXiv}
- [Levels of Autonomy GitHub Repository](https://github.com/microsoft/LevelsOfAutonomy) {type: code, provider: GitHub}
- [AI Governance Research](https://www.knightcolumbia.org/research) {type: docs, provider: Knight First Amendment Institute}
