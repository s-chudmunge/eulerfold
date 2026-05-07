---
title: "Reingold's Theorem: Log-Space Connectivity"
authors: "Omer Reingold (2005)"
citation: "Reingold, O. (2008). Undirected connectivity in log-space. Journal of the ACM (JACM), 55(4), 1-24."
link: "https://dl.acm.org/doi/10.1145/1391289.1391291"
slug: "reingold-log-space-connectivity"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Zig-zag_product.svg/400px-Zig-zag_product.svg.png"
---

# Reingold: Undirected Connectivity in Log-Space

In 2005, Omer Reingold published 'Undirected Connectivity in Log-Space,' a paper that resolved a decades-old question about the memory requirements of graph traversal. By proving that identifying a path between two nodes in an undirected graph can be achieved using only logarithmic space, Reingold demonstrated that $SL = L$. This discovery revealed that the apparent need for randomization in memory-efficient search was not a fundamental constraint of the problem, but a limitation of our previous algorithmic techniques.

## Expander Graphs and Spectral Gaps {#expander-spectral}

Omer Reingold's primary technical contribution was a method for transforming any connected undirected graph into an expander graph without significantly increasing its space complexity. An expander is a graph where every set of vertices has a large number of outgoing edges, a property characterized by a large 'spectral gap' in its adjacency matrix. The challenge in log-space connectivity was that traditional methods for exploring a graph, such as breadth-first search, require storing a list of visited nodes, which consumes linear space. Reingold's mechanism bypassed this requirement by iteratively increasing the connectivity of the graph until its diameter became logarithmic. This finding revealed that the connectivity of a system is a topological property that can be enhanced through systematic, deterministic refinement.

## The Zig-Zag Product and Iteration {#zig-zag-product}

The technical justification for Reingold's approach was the introduction of the zig-zag product, a graph operation that combines a large graph with a small expander to produce a new graph that inherits the size of the former and the expansion properties of the latter. The algorithm proceeds through an iterative cycle: it applies a powering step to reduce the graph's diameter and then uses the zig-zag product to restore the degree of the vertices to a constant. This specific sequence ensures that the spectral gap grows at each step while the memory required to track the current position remains $O(\log n)$. This engineering choice proved that global connectivity can be verified through a purely local walk on a transformed version of the original data.

## The Deterministic Efficiency of Space {#reingold-significance}

Reingold's work demonstrated that the complexity of computational systems is often a function of the structural invariants we choose to maintain. The technical significance of proving $SL = L$ lies in its implication that any randomized algorithm operating in logarithmic space can be replaced by a deterministic one for connectivity problems. These theories proved that the most efficient way to manage limited memory is to ensure that the data structure itself facilitates a direct, deterministic path to the solution. This realization remains the central theme of modern derandomization research and the design of high-performance tools for processing massive datasets where memory is the primary bottleneck.

## Resources

- [Reingold's Original Paper (ACM)](https://dl.acm.org/doi/10.1145/1391289.1391291) {type: article, provider: ACM}
- [Expander Graphs and their Applications](https://www.ams.org/journals/bull/2006-43-04/S0273-0979-06-01126-8/) {type: article, provider: AMS}
