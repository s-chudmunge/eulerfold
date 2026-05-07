---
title: "Karger: Global Min-Cuts"
authors: "David Karger (1993)"
citation: "Karger, D. R. (1993). Global min-cuts in RNC, and other ramifications of a simple min-cut algorithm. In Proceedings of the fourth annual ACM-SIAM Symposium on Discrete algorithms (pp. 21-30)."
link: "https://dl.acm.org/doi/10.5555/313559.313605"
slug: "karger-min-cut-algorithm"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Karger_algorithm_steps.png"
---

# Karger: Global Min-Cuts

In 1993, David Karger published 'Global Min-Cuts in RNC,' a paper that introduced a revolutionary method for finding the minimum cut of a connected graph through randomized edge contraction. By demonstrating that the most efficient way to solve a complex connectivity problem is often through a series of random, local choices, the author revealed that the time required to find a global minimum in a network can be significantly reduced by accepting a small probability of failure. Their work established Karger's algorithm as the definitive mechanism for large-scale network optimization, providing a new rigorous framework for the development of high-performance tools for everything from image segmentation to cluster analysis.

## Randomized Edge Contraction and Iteration {#karger-contraction}

The primary technical contribution of David Karger was the development of a min-cut algorithm based on the randomized contraction of edges. The algorithm works by repeatedly selecting a random edge and merging its two vertices into a single super-node, removing any self-loops but preserving multiple edges between the new super-node and other vertices. This technical mechanism is repeated until only two super-nodes remain, and the number of edges between them represents a candidate for the global min-cut. It proved that while a random edge contraction might occasionally destroy a min-cut, the probability of this occurrence is small enough to be managed through repeated trials. This finding revealed that global connectivity can be explored more efficiently through random sampling than through purely deterministic searching.

## Success Probability and Error Amplification {#min-cut-randomization}

The technical significance of Karger's algorithm lies in its achievement of a predictable and manageable success probability for each run. Karger proved that the probability of a single execution successfully finding the min-cut is at least $2 / (n(n-1))$. By repeating the algorithm $O(n^2 \log n)$ times and taking the minimum result across all trials, the failure probability can be reduced to less than $1/n$. This finding revealed that the cost of reliability in network optimization is a function of the number of trials rather than the graph's own complexity. It established that randomized methods can achieve levels of confidence that are suitable for even the most demanding engineering applications.

## The Logic of Probabilistic Optimization {#karger-significance}

Karger's work demonstrated that the complexity of computational systems is often a function of our willingness to accept a probabilistic view of optimality. The engineering choice to use randomized edge contraction revealed that global properties of a network can be derived through a series of local, random decisions. This realization remains the central theme of modern network science and the development of efficient algorithms for community detection and partitioning. It proved that the most robust way to manage a complex system is to ensure that its foundational optimization tasks are both fast and probabilistically sound.

## Resources

- [Karger's Original Paper (ACM)](https://dl.acm.org/doi/10.5555/313559.313605) {type: article, provider: ACM}
- [Karger's Min-Cut (GeeksforGeeks)](https://www.geeksforgeeks.org/kargers-algorithm-for-minimum-cut-set-1-introduction-and-implementation/) {type: article, provider: GeeksforGeeks}
- [Karger's Randomized Min-Cut (Video)](https://www.youtube.com/watch?v=yVdGiGdmx6Y) {type: video, provider: YouTube}
