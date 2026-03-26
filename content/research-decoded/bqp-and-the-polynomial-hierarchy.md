---
title: "BQP and the Polynomial Hierarchy"
authors: "Scott Aaronson (2009)"
citation: "Aaronson, S. (2010). BQP and the Polynomial Hierarchy. In Proceedings of the forty-second ACM symposium on Theory of computing (pp. 141-150)."
link: "https://arxiv.org/abs/0910.4698"
slug: "bqp-and-the-polynomial-hierarchy"
heroImage: "https://ar5iv.labs.arxiv.org/html/0910.4698/assets/x1.png"
---

# BQP and the Polynomial Hierarchy

The relationship between BQP (Bounded-error Quantum Polynomial time) and the Polynomial Hierarchy (PH) represents one of the most profound questions in complexity theory. While it is well-known that BQP is contained within PSPACE, the question of whether quantum computers can solve problems that lie outside the entire PH—a hierarchy that includes P, NP, and coNP—remains a central mystery. 

Scott Aaronson’s investigation into this space was motivated by the need to understand if quantum advantage is merely a faster way to perform classical non-deterministic searches or if it represents a fundamentally different class of computation.

## The Mechanism of Oracle Separation {#oracle-separation}

### The Limits of Search

![The Fourier coefficients of a random Boolean function](https://ar5iv.labs.arxiv.org/html/0910.4698/assets/x1.png)

_The Fourier coefficients of a random Boolean function_

Because proving $BQP \not\subseteq PH$ in the real world would imply $P \neq NP$, researchers utilize oracles to show that there exist black-box settings where quantum computers possess powers that no classical hierarchy can replicate. 

The primary mechanism for demonstrating this separation is the Boolean Hidden Shift problem, which involves two Boolean functions $f$ and $g$ that are identical up to a secret bitwise shift $s$. A quantum algorithm can solve this problem efficiently by querying the functions in superposition and applying a Hadamard transform to extract the shift through constructive interference of the phases.

### Phase Interference vs. Quantification

Classically, however, distinguishing the shift from a random permutation requires an exponential number of queries, even for an algorithm that can utilize the power of the entire Polynomial Hierarchy. This is because the PH is built on local existential and universal quantification, which is ill-suited for detecting the global, parity-based structures that quantum Fourier transforms can identify with a single query. The "global" nature of the quantum state allows it to sense properties of the entire function space that are effectively invisible to any depth of classical nesting.

## Complexity-Theoretic Foundations {#complexity-foundations}

### Beyond Non-Deterministic Search

The abstraction provided by this research suggests that the complexity-theoretic foundations of quantum computing are not tied to the classical notions of "searching" for a witness. Instead, it implies that quantum computers operate on a level of "Fourier-checking" or global state correlation that is fundamentally orthogonal to the Polynomial Hierarchy. 

This result reinforces the idea that BQP and PH are likely incomparable, meaning there are problems in BQP not in PH, and potentially problems in NP that are not in BQP.

### Theoretical Limits of Quantum Advantage

This distinction is crucial for the long-term goal of identifying "Quantum Supremacy" tasks, as it points toward problems involving Gaussian sampling and Fourier analysis as the most likely candidates for demonstrating a clear gap between quantum and classical capabilities. 

By framing quantum computing as an operation on the coefficients of a state vector rather than a search through a discrete space, Aaronson established a rigorous boundary between the powers of quantum and classical computation. This work continues to inform the search for new quantum algorithms that leverage global structure rather than local search.

## Resources

- [BQP and the Polynomial Hierarchy (arXiv)](https://arxiv.org/abs/0910.4698) {type: article, provider: arXiv}
- [The Complexity of Quantum States and Transformations](https://arxiv.org/abs/1607.05256) {type: article, provider: arXiv}
