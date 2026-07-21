---
title: "A Smarter Way for AI to Solve Hard Problems"
authors: "Yao et al. (2023)"
citation: "Yao, S., Yu, D., Zhao, J., Shafran, I., McManus, T. L., Narasimhan, K., & Cao, Y. (2023). Tree of thoughts: Deliberate problem solving with large language models. arXiv preprint arXiv:2305.10601."
link: "https://arxiv.org/abs/2305.10601"
slug: "tree-of-thoughts-deliberate-search"
heroImage: "/images/research-decoded/tree-of-thoughts-deliberate-search.png"
---

Large language models often struggle with tasks that require strategic planning or global reasoning because they follow a linear, token-level prediction path. The 2023 Tree of Thoughts (ToT) framework addresses this by allowing models to explore multiple reasoning paths simultaneously and evaluate the progress of each intermediate step. Researchers from Princeton and Google DeepMind proposed this transition from a single stream of text to a structured search through a space of ideas, enabling models to backtrack when they encounter logical dead ends.

The framework decomposes problem-solving into discrete thought units, which may be partial equations or individual lines of a poem. This structure allows the model to navigate a search tree using a state evaluator that applies heuristic judgment to assign values like "sure," "maybe," or "impossible" to different branches. By employing algorithms such as breadth-first search or depth-first search, the system can prune unpromising paths. This moves the model away from fast, intuitive generation toward a slow, deliberate reasoning process where intermediate commitments can be independently validated.

Navigation through the reasoning tree relies on the model's ability to act as its own heuristic function. At each node, the system is prompted to reason about the current partial solution and either assign it a qualitative value or vote across several candidate thoughts. This self-evaluation enables early detection of errors and prevents the consumption of computational resources on invalid reasoning paths. These results suggest that intelligence in language models is enhanced by a capacity to discard poor ideas through systematic oversight rather than just generating new ones.

The implementation of classical search algorithms provides different strategies for varied problem types. Breadth-first search is used for problems with limited branching, such as the Game of 24, where the model explores all initial possibilities before proceeding. Depth-first search is applied to more constrained tasks like crosswords, allowing for deep exploration and backtracking when contradictions arise. In the Game of 24, this method increased success rates from 7% to 74% compared to standard linear prompting. This indicates that the limitations of current models often stem from a lack of strategic exploration rather than a lack of underlying knowledge.

The deliberate search process introduces a cognitive bottleneck due to the significantly higher computational cost of multiple model calls. This raises questions about the future efficiency of reasoning models and whether these search processes can be internalized during pre-training. As AI systems advance, the challenge may shift from increasing general capability to making these deliberate reasoning structures more scalable. Integrating the principles of tree search directly into model architectures could potentially allow for more complex reasoning without the overhead of explicit external navigation.

## Resources

- [Tree of Thoughts Paper on arXiv](https://arxiv.org/abs/2305.10601) {type: article, provider: arXiv}
- [ToT on GitHub](https://github.com/princeton-nlp/tree-of-thought-llm) {type: code, provider: GitHub}
