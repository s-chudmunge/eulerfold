---
title: "WebVoyager: The Era of End-to-End Online Web Agency"
authors: "He et al. (2024)"
citation: "He, S., et al. (2024). WebVoyager: Building an End-to-End Web Agent with Large Multimodal Models. arXiv preprint arXiv:2401.13919."
link: "https://arxiv.org/abs/2401.13919"
slug: "webvoyager-end-to-end-web-agent"
heroImage: "/images/research-decoded/webvoyager-end-to-end-web-agent.png"
---

# WebVoyager: The Era of End-to-End Online Web Agency

The WebVoyager research represents a transition from agents that operate on static datasets or local simulators to agents that navigate the live, dynamic "Open Web." While earlier web agents relied heavily on parsing the HTML DOM tree—a process that is notoriously noisy and prone to failure on modern, JavaScript-heavy sites—WebVoyager treats the web as a visual-first medium. By utilizing screenshots as the primary input and implementing a rigorous "Set-of-Mark" (SoM) prompting technique, the system achieves a 59.1% task success rate across 15 popular real-world websites.

## Interaction Formulation and Context Clipping {#interaction-cycle}

![The overall workflow of WebVoyager: taking tasks, browsing the web online, and selecting actions based on screenshots and text.](https://arxiv.org/html/2401.13919v1/x1.png)

_The overall workflow of WebVoyager: taking tasks, browsing the web online, and selecting actions based on screenshots and text._

WebVoyager formalizes web interaction as a sequence of state-action transitions: $c_t = (o_1, a_1, \dots, o_{t-1}, a_{t-1}, o_t, I)$, where $I$ is the high-level instruction and $o_t$ is the visual observation at time $t$. A major technical challenge identified in the research is "screenshot fatigue"—the accumulation of high-resolution images within the LLM's context window, which leads to quadratic token growth and decreased reasoning precision. To solve this, WebVoyager implements **Context Clipping**. The agent retains only the most recent three screenshots as visual context while maintaining the full textual history of thoughts and actions. This "moving window" strategy ensures that the agent remains focused on the immediate task state without sacrificing the long-term goal coherence.

## Set-of-Mark (SoM) and Selenium Logic {#technical-components}

![Examples of webpage screenshots provided to the agent, annotated with black-bordered numerical labels.](https://arxiv.org/html/2401.13919v1/x2.png)

_Examples of webpage screenshots provided to the agent, annotated with black-bordered numerical labels._

To bridge the gap between high-level reasoning and low-level execution, WebVoyager uses a **Set-of-Mark** Javascript tool.
 This tool programmatically identifies interactive elements (buttons, inputs, links) and overlays black-bordered numerical labels on the screenshot. The researchers empirically determined that black-bordered labels yielded the highest grounding success rates compared to other colors. This visual annotation allows the LMM (GPT-4V) to select actions via symbolic IDs (e.g., `click(5)`) rather than predicting raw pixel coordinates.

The execution engine is built on **Selenium**, allowing the agent to handle real-world web complexities such as floating ads, modal pop-ups, and real-time content updates. The agent follows a strict `Thought` $\rightarrow$ `Action Code` sequence, ensuring that every move is preceded by a stated rationale. This decoupling of "seeing" (the annotated screenshot) from "acting" (the Selenium driver) provides a modular blueprint for deploying agents in production environments.

## The Automatic Evaluation Protocol (GPT-4V as Judge) {#eval-protocol}

One of the paper's most impactful contributions is the **Automatic Evaluation** system. Traditional web agent evaluation is manually intensive and non-scalable. The WebVoyager team introduced a protocol where a frontier LMM (GPT-4V) acts as a "virtual judge," reviewing the agent's full trajectory and the final answer to determine success. The judge is provided with the **Interaction History** (all $T$ screenshots) and the final output. It must answer three diagnostic questions:
1.  Did the agent reach the correct final answer?
2.  Were the intermediate steps logical and safe?
3.  Did the agent fail due to environmental noise (e.g., a broken link)?

The judge was found to have an 85.3% agreement rate with human evaluators, proving that we can now automate the "AgentOps" pipeline. For researchers, this highlights that the future of web agency is not just about better navigation, but about building the **Verification Infrastructure** that allows agents to learn from their own recorded trajectories.

## Resources

- [WebVoyager Paper on arXiv](https://arxiv.org/abs/2401.13919) {type: article, provider: arXiv}
- [WebVoyager GitHub Repository](https://github.com/ikun-007/WebVoyager) {type: code, provider: GitHub}
