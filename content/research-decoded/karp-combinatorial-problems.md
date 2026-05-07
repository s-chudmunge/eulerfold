---
title: "Karp's 21 NP-Complete Problems"
authors: "Richard Karp (1972)"
citation: "Karp, R. M. (1972). Reducibility among combinatorial problems. In Complexity of Computer Computations (pp. 85-103). Springer, Boston, MA."
link: "https://www.cs.umd.edu/~gasarch/BLOGPAPERS/Karp.pdf"
slug: "karp-combinatorial-problems"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Karp%27s_21_NP-complete_problems.png"
---

# Karp: Combinatorial Problems

In 1972, Richard Karp published 'Reducibility Among Combinatorial Problems,' a paper that transformed the theoretical concept of NP-completeness into a practical tool for computer scientists. Following Stephen Cook's discovery that the satisfiability problem is 'universal' for the class of non-deterministic polynomial-time problems, Karp demonstrated that this universality was not a rare property of logic, but a common characteristic of hundreds of computational challenges across every branch of science. He proved that the core difficulty of finding a shortest path, scheduling a project, or optimizing a network often shares the same mathematical bottleneck.

## Polynomial-Time Many-One Reductions {#karp-reductions}

Richard Karp introduced a rigorous method for proving the hardness of a problem by using what is now known as a Karp reduction. He argued that if a problem A can be transformed into an instance of problem B by a polynomial-time function, then problem B is at least as hard as problem A. This technical mechanism established a way to link the difficulty of disparate problems through a chain of reductions. It proved that if any single problem in this chain could be solved in polynomial time, then every problem that reduced to it could also be solved efficiently. This shift in methodology provided a concrete strategy for researchers to classify newly discovered problems by comparing them to established ones.

## The 21 NP-Complete Problems {#twenty-one-problems}

The centerpiece of Karp's work was the demonstration that 21 diverse combinatorial problems—ranging from the Clique problem to the Traveling Salesperson Problem—are all equivalent in complexity. By constructing a series of polynomial-time reductions, Karp showed that each of these problems is 'NP-complete,' meaning they are both in the class NP and as hard as any other problem in that class. This finding revealed that the phenomenon of computational difficulty is widespread and interconnected. It suggested that the difficulty we encounter in practical engineering is often just a different manifestation of the same underlying logical barrier.

## The Computational Classification of Complexity {#complexity-classification}

Karp's paper provided a roadmap for the systematic classification of computational difficulty. It suggested that instead of looking for unique algorithms for every new problem, computer scientists should first determine if a problem belongs to the class of NP-complete challenges. This engineering choice has allowed the field to focus its resources on developing approximation algorithms and heuristics for problems that are unlikely to have an efficient exact solution. The realization that thousands of practical problems are linked to the same core difficulty has become the primary guiding principle for modern algorithm design and remains a central pillar of the P vs NP investigation.

## Resources

- [Karp's Original Paper (PDF)](https://www.cs.umd.edu/~gasarch/BLOGPAPERS/Karp.pdf) {type: article, provider: University of Maryland}
- [NP-Completeness and the 21 Problems](https://www.scottaaronson.com/blog/?p=1720) {type: article, provider: Scott Aaronson}
