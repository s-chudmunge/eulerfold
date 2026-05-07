---
title: "Cook's Theorem: NP-Completeness"
authors: "Stephen Cook (1971)"
citation: "Cook, S. A. (1971). The complexity of theorem-proving procedures. In Proceedings of the third annual ACM symposium on Theory of computing (pp. 151-158)."
link: "https://www.cs.toronto.edu/~sacook/homepage/1971.pdf"
slug: "cook-complexity-theorem-proving"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/P_np_np-complete.svg/1200px-P_np_np-complete.svg.png"
---

# Cook: Theorem-Proving Procedures

In 1971, Stephen Cook published 'The Complexity of Theorem-Proving Procedures,' a paper that provided the mathematical foundation for understanding which problems computers can solve efficiently and which they cannot. Cook moved the study of computation from a general inquiry into what is 'computable' to a specific analysis of the time resources required for that computation. He introduced a class of problems that are recognizable in polynomial time by a non-deterministic machine, a concept that would eventually define the boundaries of modern theoretical computer science.

## The NP Class and Nondeterministic Polynomial Time {#np-verification}

Stephen Cook identified a specific class of languages that can be accepted by a nondeterministic Turing machine within a number of steps bounded by a polynomial function of the input length. This class, now known as NP, shifted the focus of complexity theory from the difficulty of finding a solution to the ease of verifying one. In this framework, a problem belongs to NP if a proposed certificate of the solution can be checked for correctness in polynomial time by a deterministic machine. This observation revealed that the gap between searching for an answer and confirming its validity is the fundamental axis upon which computational difficulty is measured. It proved that "verification" is a mathematically simpler operation than "discovery," an insight that remains the central tension of the P vs NP problem.

## Cook's Theorem and the Universality of SAT {#cook-theorem-sat}

The primary technical contribution of the paper was the proof that the Boolean Satisfiability Problem (SAT) is "universal" for the NP class. Cook demonstrated this by showing that the entire execution of any nondeterministic polynomial-time machine can be encoded as a single Boolean formula in Conjunctive Normal Form (CNF). This encoding, often referred to as the "tableau method," captures the machine's state, head position, and tape content over time as a series of logical constraints. The formula is constructed such that it is satisfiable if and only if there exists a sequence of nondeterministic choices that leads the machine to an accepting state. Because this reduction can be performed in polynomial time, it proved that if a polynomial-time algorithm for SAT exists, then *every* problem in NP can be solved in polynomial time.

## Polynomial-Time Reducibility and Hardness {#polynomial-reducibility}

To compare the relative hardness of different problems, Cook introduced the concept of polynomial-time subrecursive reducibility. He argued that if a problem A can be solved by a polynomial-time algorithm that has access to an "oracle" for problem B, then A is no harder than B. This technical mechanism allowed for the hierarchical ordering of computational tasks based on their intrinsic complexity rather than their specific domain. It established the concept of "NP-hardness," where a problem is at least as difficult as any other problem in the NP class. This finding effectively digitalized the study of logic and algebra, proving that many seemingly unrelated problems across mathematics share a common underlying structure of difficulty.

## The 3-SAT Reduction and the Hierarchy of Complexity {#three-sat}

Following the proof for SAT, Cook extended his reasoning to show that more restricted versions of the problem, such as 3-SAT (where each clause has exactly three literals), are also NP-complete. This was achieved by demonstrating a polynomial-time mapping from any SAT formula to a 3-SAT formula that preserves satisfiability. This modular approach to complexity proved that even highly simplified logical systems can be as computationally powerful as the most complex universal machines. It suggested that NP-completeness is not a rare property of obscure problems, but a ubiquitous feature of any system involving a search over an exponential number of possibilities.

## The P vs NP Question and the Limits of Computation {#p-vs-np}

The success of Cook's Theorem established the "P vs NP" question as the most significant open problem in computer science. It asks whether every problem whose solution can be verified quickly (NP) can also be solved quickly (P). Cook’s discovery of NP-completeness proved that if even a single NP-complete problem can be solved in polynomial time, then $P = NP$. Conversely, if $P \neq NP$, it implies that there is a fundamental and irreversible gap between the power of deterministic and nondeterministic computation. This philosophical implication remains the primary motivation for research into algorithm design and cryptography, raising the question of whether the "creative" act of finding a proof can ever be fully automated by a machine.

## Resources

- [Cook's Original Paper (PDF)](https://www.cs.toronto.edu/~sacook/homepage/1971.pdf) {type: article, provider: University of Toronto}
- [P vs NP and the Cook-Levin Theorem](https://news.mit.edu/2009/explainer-pnp) {type: article, provider: MIT News}
