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

Richard Karp introduced a rigorous method for proving the hardness of a problem by using what is now known as a Karp reduction. He argued that if a problem $A$ can be transformed into an instance of problem $B$ by a polynomial-time function, then problem $B$ is at least as hard as problem $A$. 

This technical mechanism established a way to link the difficulty of disparate problems through a chain of reductions. It proved that if any single problem in this chain could be solved in polynomial time, then every problem that reduced to it could also be solved efficiently. This shift in methodology provided a concrete strategy for researchers to classify newly discovered problems by comparing them to established ones.

## The Logic of Gadgets {#gadget-logic}

The primary engineering tool introduced by Karp's work was the "gadget"—a small, local subgraph or set of constraints that simulates a logical operation. For example, in reducing SAT to 3-Colorability, one constructs gadgets that represent variables and clauses such that the graph is colorable if and only if the original formula is satisfiable. 

These gadgets act as the building blocks of complexity proofs, allowing researchers to "program" one problem using the language of another. This finding revealed that the structure of an NP-complete problem is modular, and its difficulty emerges from the complex ways these simple gadgets can be interconnected.

## The 21 NP-Complete Problems {#twenty-one-problems}

The centerpiece of Karp's work was the demonstration that 21 diverse combinatorial problems—ranging from the Clique problem to the Traveling Salesperson Problem—are all equivalent in complexity. By constructing a series of polynomial-time reductions, Karp showed that each of these problems is 'NP-complete,' meaning they are both in the class NP and as hard as any other problem in that class. 

This finding revealed that the phenomenon of computational difficulty is widespread and interconnected. It suggested that the difficulty we encounter in practical engineering is often just a different manifestation of the same underlying logical barrier.

## The P vs NP Landscape {#p-vs-np-landscape}

Karp's paper provided the first map of the $P$ vs $NP$ landscape, identifying a massive "continent" of problems that appear to be computationally intractable. It effectively established the $NP$-complete class as a threshold: any problem on this list is either solvable in polynomial time (meaning $P=NP$) or requires exponential time (meaning $P \neq NP$). 

This binary reality has guided half a century of research, eventually leading to the $P$ vs $NP$ question being named one of the seven Millennium Prize Problems. Karp's work proved that this was not just a question for logicians, but a fundamental constraint on the limits of human and machine intelligence.

## Approximation and Heuristics {#approximation-heuristics}

The realization that so many practical problems are $NP$-complete led to a paradigm shift in algorithm design. Instead of searching for exact solutions to intractable problems, the field moved toward the study of approximation algorithms and heuristics. 

If an optimal solution to the Traveling Salesperson Problem cannot be found efficiently, researchers instead focus on finding a solution that is guaranteed to be within, for example, 1.5 times the optimal length. This engineering choice has allowed for the creation of high-performance tools for logistics, manufacturing, and network design that provide "good enough" results in seconds rather than centuries.

## The Computational Classification of Complexity {#complexity-classification}

Karp's paper provided a roadmap for the systematic classification of computational difficulty. It suggested that instead of looking for unique algorithms for every new problem, computer scientists should first determine if a problem belongs to the class of NP-complete challenges. 

The realization that thousands of practical problems are linked to the same core difficulty has become the primary guiding principle for modern algorithm design. It proved that the most robust way to approach a complex optimization task is to first understand its place within the global hierarchy of computational limits.


## Resources

- [Karp's Original Paper (PDF)](https://www.cs.umd.edu/~gasarch/BLOGPAPERS/Karp.pdf) {type: article, provider: University of Maryland}
- [NP-Completeness and the 21 Problems](https://www.scottaaronson.com/blog/?p=1720) {type: article, provider: Scott Aaronson}
