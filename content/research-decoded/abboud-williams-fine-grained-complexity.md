---
title: "Fine-Grained Complexity & SETH"
authors: "Amir Abboud & Virginia Vassilevska Williams (2014)"
citation: "Abboud, A., & Williams, V. V. (2014). Popular conjectures imply strong lower bounds for dynamic problems. In Foundations of Computer Science (FOCS), 2014 IEEE 55th Annual Symposium on (pp. 434-443)."
link: "https://arxiv.org/abs/1402.0054"
slug: "abboud-williams-fine-grained-complexity"
---

# Abboud & Williams: Fine-Grained Complexity

In 2014, Amir Abboud and Virginia Vassilevska Williams published 'Popular Conjectures Imply Strong Lower Bounds for Dynamic Problems,' a paper that helped launch the field of fine-grained complexity. While traditional complexity theory focuses on broad classifications like $P$ and $NP$, fine-grained complexity seeks to understand the exact exponent of the polynomial running time for problems already known to be solvable efficiently. By connecting the hardness of practical problems like All-Pairs Shortest Path and Edit Distance to unproven but widely believed conjectures, the authors provided a rigorous explanation for why certain algorithms have not seen significant improvements for decades.

## Hardness Reductions and Conditional Lower Bounds {#fine-grained-reductions}

The primary technical contribution of Abboud and Williams was the development of a framework for proving 'conditional lower bounds.' This approach works by showing that if a problem $A$ could be solved faster than a certain threshold, then a major breakthrough would be implied for a 'bottleneck' problem $B$—most notably the Strong Exponential Time Hypothesis (SETH). SETH conjectures that $CNF$-SAT cannot be solved in time significantly faster than $2^n$. The authors used this as a pivot to prove that problems like Orthogonal Vectors, and subsequently Edit Distance and Longest Common Subsequence, require near-quadratic time. This technical mechanism revealed that the difficulty of many disparate problems in $P$ is interconnected through a web of fine-grained reductions.

## The Strong Exponential Time Hypothesis (SETH) {#seth-pivot}

The technical significance of this framework lies in its ability to provide 'evidence' of hardness for problems that are unlikely to be proved $NP$-hard. By anchoring the complexity of polynomial-time problems to the exponential hardness of $SAT$, Abboud and Williams established a hierarchy of difficulty within the class $P$. This finding revealed that the lack of progress in optimizing certain foundational algorithms is not a failure of ingenuity, but a consequence of fundamental barriers in logic. It proved that any $O(n^{2-\epsilon})$ algorithm for Edit Distance would effectively break our current understanding of the limits of satisfiability testing.

## The Logic of Interconnected Hardness {#fine-grained-significance}

Abboud and Williams' work demonstrated that the complexity of computational systems is best understood through the relationships between its most resistant problems. The engineering choice to use SETH as a foundational assumption revealed that the 'fine-grained' structure of algorithms is as rigid and interconnected as the broad classes of the $P$ vs $NP$ framework. This realization remains the central theme of modern algorithmic research, providing a new rigorous framework for determining which practical problems are likely to have more efficient solutions and which are theoretically constrained by the core bottlenecks of computation. It proved that the most robust way to analyze an algorithm's performance is to understand its place within the collective hierarchy of mathematical difficulty.

## Resources

- [Fine-Grained Complexity Original Paper (arXiv)](https://arxiv.org/abs/1402.0054) {type: article, provider: arXiv}
- [A Survey of Fine-Grained Complexity](https://en.wikipedia.org/wiki/Fine-grained_complexity) {type: article, provider: Wikipedia}
