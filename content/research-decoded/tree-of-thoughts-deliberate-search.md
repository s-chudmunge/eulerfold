---
title: "Tree of Thoughts"
authors: "Yao et al. (2023)"
citation: "Yao, S., Yu, D., Zhao, J., Shafran, I., McManus, T. L., Narasimhan, K., & Cao, Y. (2023). Tree of thoughts: Deliberate problem solving with large language models. arXiv preprint arXiv:2305.10601."
link: "https://arxiv.org/abs/2305.10601"
slug: "tree-of-thoughts-deliberate-search"
heroImage: "https://ar5iv.labs.arxiv.org/html/2305.10601/assets/x1.png"
---

# Tree of Thoughts

The 2023 'Tree of Thoughts' (ToT) paper addressed the struggle of large language models with tasks that require strategic look-ahead or global reasoning. While 'Chain of Thought' prompting allows models to solve problems step-by-step, it follows a single, linear path that cannot backtrack if it hits a dead end. Researchers at Princeton and Google DeepMind proposed a framework that allows models to explore multiple paths of reasoning simultaneously, evaluating the progress of each 'thought' as it goes. It was a shift from viewing generation as a stream of text to viewing it as a structured search through a space of ideas.

## Decomposition into Thought Units {#thought-decomposition}

![Comparison of problem-solving approaches: IO, CoT, and the branching Tree of Thoughts.](https://ar5iv.labs.arxiv.org/html/2305.10601/assets/x1.png)

_Comparison of problem-solving approaches: IO, CoT, and the branching Tree of Thoughts._

Tree of Thoughts (ToT) transitioned large language models from linear, token-level prediction to a structured search space for deliberate problem-solving. By decomposing reasoning into discrete "thought units"—intermediate steps like a line of a poem or a partial equation—the framework allows the model to explore multiple paths of inquiry simultaneously. To navigate this tree, the system employs a State Evaluator that uses the model's own heuristic judgment to assign values like "sure," "maybe," or "impossible" to different branches, enabling algorithms like BFS or DFS to prune the search. This shift from the fast, intuitive "System 1" output of standard prompting to a slow, deliberate "System 2" process proved that complex reasoning is not a continuous flow, but a series of discrete commitments that can be independently validated and backtracked when necessary.

## The State Evaluator as Heuristic {#evaluation-heuristics}

How ToT navigates the reasoning tree lies in its use of a 'State Evaluator' that acts as a heuristic function. At each node, the model is prompted to deliberately reason about the current partial solution, assigning it a value such as 'sure,' 'maybe,' or 'impossible.' Alternatively, the model can vote across multiple candidate thoughts to select the most promising path. This self-evaluation allows the system to identify early mistakes and prune 'dead' branches of the tree before they consume more computational resources. This finding proved that a model's performance can be dramatically improved by augmenting its fast, intuitive 'System 1' output with a slow, deliberate 'System 2' oversight process. It suggested that intelligence is as much about the ability to discard bad ideas as it is about the ability to generate good ones.

## Search via BFS and DFS {#search-algorithms}

ToT integrates classical search algorithms like Breadth-First Search (BFS) and Depth-First Search (DFS) to navigate the thought space. BFS is used for shallow problems with limited branching, such as the 'Game of 24,' where the model explores all promising first steps before moving to the second. DFS is employed for deeper, more constrained problems like crosswords, allowing the model to backtrack to a previous node if it hits a contradiction. In the 'Game of 24,' this search process improved success rates from 7% to 74% compared to standard prompting. This proved that the 'cognitive bottleneck' of current AI is often not a lack of knowledge, but a lack of a mechanism to explore that knowledge strategically. It revealed that the future of reasoning may lie in models that can autonomously select the right search strategy for a given problem.

## The Cognitive Bottleneck {#reasoning-bottleneck}

While Tree of Thoughts is highly effective, it highlights a significant 'cognitive bottleneck' in terms of computational cost, as it requires many more model calls than linear prompting. This raises a fundamental question about the future of AI: can models learn to internalize these search and evaluation processes during pre-training, or will we always need an external framework to guide complex reasoning? It suggests that as models become more advanced, the challenge will shift from making them 'smarter' to making their reasoning processes more efficient and scalable. It remains to be seen if the principles of deliberate search can be integrated directly into the model's architecture, allowing for System 2 thinking without the overhead of explicit tree navigation.

## Resources

- [Tree of Thoughts Paper on arXiv](https://arxiv.org/abs/2305.10601) {type: article, provider: arXiv}
- [ToT on GitHub](https://github.com/princeton-nlp/tree-of-thought-llm) {type: code, provider: GitHub}
