---
title: "Magentic-One: Multi-Agent Orchestration via Nested Ledgers"
authors: "Fourney et al. (2024)"
citation: "Fourney, A., et al. (2024). Magentic-One: A Generalist Multi-Agent System for Solving Complex Tasks. arXiv preprint arXiv:2411.04468."
link: "https://arxiv.org/abs/2411.04468"
slug: "magentic-one-multi-agent-orchestration"
heroImage: "https://arxiv.org/html/2411.04468v1/x2.png"
---

# Magentic-One: Multi-Agent Orchestration via Nested Ledgers

![Magentic-One multi-agent team completing a complex task from the GAIA benchmark.](https://arxiv.org/html/2411.04468v1/x1.png)

_Magentic-One multi-agent team completing a complex task from the GAIA benchmark._

Magentic-One, released by Microsoft Research in late 2024, introduces a high-performance architectural pattern for generalist multi-agent systems.
 Built on the AutoGen 0.4 framework, it addresses the "context drift" and "planning fragility" common in single-agent systems by centralizing intelligence in a lead **Orchestrator** that manages task lifecycles through a dual-loop state machine and persistent, structured memory ledgers.

## The Ledger-Based Control Loop {#ledger-state-machine}

![The Magentic-One Orchestrator architecture, illustrating the nested Outer (Task Ledger) and Inner (Progress Ledger) loops.](https://arxiv.org/html/2411.04468v1/x2.png)

_The Magentic-One Orchestrator architecture, illustrating the nested Outer (Task Ledger) and Inner (Progress Ledger) loops._

The system's execution logic is governed by two distinct control loops:
1.  **Outer Loop (Task Ledger):** The Orchestrator maintains a "Task Ledger" that acts as the system's global state. It tracks **Verified Facts**, **Information Gaps** (to be searched), and **Reasoning Nodes** (to be derived). Crucially, the ledger includes a section for "Educated Guesses"—memorized closed-book information used to mitigate stalls when external tool-use fails.
2.  **Inner Loop (Progress Ledger):** For every sub-task, the Orchestrator initiates an Inner Loop. It asks five diagnostic questions: *Is the task complete? Is the team looping? Is progress being made? Which agent is next? What is the specific instruction?* This ledger prevents the common agentic failure of "vague delegation," where a lead agent sends broad, unconstrained commands to sub-agents.

This nested architecture allows Magentic-One to be model-agnostic. While the Orchestrator typically uses a reasoning-heavy model like GPT-4o, sub-agents like **WebSurfer** or **FileSurfer** can be powered by smaller, specialized models. The ledgers act as a standardized interface, ensuring that the system's "intent" remains coherent even as execution is passed between heterogeneous models.

## The WebSurfer and Accessibility Tree Mapping {#websurfer-mechanics}

The **WebSurfer** agent is the most technically complex component of the Magentic-One team. Unlike simple scraper bots, it manages a full Chromium-based browser and interacts with websites via an **Accessibility Tree (AXTree) mapping**. 
*   **Perception:** The agent extracts the AXTree from the browser, which provides a semantic representation of the UI (e.g., distinguishing between a decorative image and a functional button). 
*   **Set-of-Marks (SoM) Prompting:** It overlays numerical labels on the visual screenshot. The Orchestrator then receives a multimodal input: the raw pixels, the annotated screenshot, and the linearized AXTree text.
*   **Action Execution:** The agent translates LLM commands into precise Playwright/Selenium events (e.g., `page.click('[data-testid="search"]')`).

By providing the model with both visual tags and semantic metadata, Magentic-One solves the "dynamic content" problem. If a button's visual position shifts due to a loading ad, the agent can still target it reliably via its AXTree ID.

## The Stall Counter and Error Recovery {#stall-mechanics}

A critical implementation nuance is the **Stall Counter**. If the Progress Ledger detects that the same action is being repeated without state change, or if a sub-agent returns a non-informative error, the counter increments. Once the counter exceeds a predefined threshold (typically $\leq 2$), the system forces a "break-to-outer" transition. The Orchestrator then performs a global reflection, updates the Task Ledger with a "lesson learned" from the failure, and re-plans the trajectory. 

This deterministic handling of agentic failure is a departure from simple "self-reflection" prompts. It treats recovery as a state transition rather than a reasoning prompt, ensuring the system doesn't enter an infinite recursion of apologies. For researchers, this highlights a fundamental law of deployment: reliable agency requires a deterministic state machine to govern the probabilistic reasoning of the LLM.

## Resources

- [Magentic-One Paper on arXiv](https://arxiv.org/abs/2411.04468) {type: article, provider: arXiv}
- [Magentic-One Project Page](https://microsoft.github.io/autogen/docs/magentic-one/) {type: docs, provider: Microsoft}
- [Magentic-One on GitHub](https://github.com/microsoft/autogen/tree/main/python/packages/microsoft-magentic-one) {type: code, provider: GitHub}
