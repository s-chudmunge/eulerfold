---
title: "Cook's Theorem: NP-Completeness"
authors: "Stephen Cook (1971)"
citation: "Cook, S. A. (1971). The complexity of theorem-proving procedures. In Proceedings of the third annual ACM symposium on Theory of computing (pp. 151-158)."
link: "https://www.cs.toronto.edu/~sacook/homepage/1971.pdf"
slug: "cook-complexity-theorem-proving"
---

# Cook: Theorem-Proving Procedures

In 1971, Stephen Cook published 'The Complexity of Theorem-Proving Procedures,' a paper that provided the mathematical foundation for understanding which problems computers can solve efficiently and which they cannot. Cook moved the study of computation from a general inquiry into what is 'computable' to a specific analysis of the time resources required for that computation. He introduced a class of problems that are recognizable in polynomial time by a non-deterministic machine, a concept that would eventually define the boundaries of modern theoretical computer science.

## The NP Class and Verification {#np-verification}

Stephen Cook identified a specific class of languages that can be accepted by a non-deterministic Turing machine within a number of steps bounded by a polynomial function of the input length. This finding shifted the focus of complexity theory from the difficulty of finding a solution to the ease of verifying one. In this framework, a problem belongs to this class if a proposed certificate of the solution can be checked for correctness in polynomial time by a deterministic machine. This observation revealed that the gap between searching for an answer and confirming its validity is the fundamental axis upon which computational difficulty is measured.

## Cook's Theorem and SAT {#cook-theorem-sat}

The primary technical contribution of the paper was the proof that the Boolean Satisfiability Problem (SAT) is 'universal' for this non-deterministic polynomial class. Cook demonstrated this by showing that the entire execution of any non-deterministic polynomial-time machine can be encoded as a single Boolean formula. This formula is constructed such that it is satisfiable if and only if there exists a sequence of non-deterministic choices that leads the machine to an accepting state. Because this reduction can be performed in polynomial time, it proved that SAT is at least as difficult as any other problem in the class. This finding established SAT as the first known 'NP-complete' problem, providing a concrete target for the P vs NP question.

## Polynomial-Time Reducibility {#polynomial-reducibility}

To compare the relative hardness of different problems, Cook introduced the concept of polynomial-time subrecursive reducibility. He argued that if a problem A can be solved by a polynomial-time algorithm that has access to an 'oracle' for problem B, then A is no harder than B. This technical mechanism allowed for the hierarchical ordering of computational tasks based on their intrinsic complexity rather than their specific domain. It suggested that many seemingly unrelated problems in logic, algebra, and topology might share a common underlying structure of difficulty. The search for a polynomial-time algorithm for SAT—and by extension, all problems in its class—remains the most significant open problem in the field.

## Resources

- [Cook's Original Paper (PDF)](https://www.cs.toronto.edu/~sacook/homepage/1971.pdf) {type: article, provider: University of Toronto}
- [P vs NP and the Cook-Levin Theorem](https://news.mit.edu/2009/explainer-pnp) {type: article, provider: MIT News}
