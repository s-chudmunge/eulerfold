---
title: "How a Quantum Computer Could Break the Internet"
authors: "Peter Shor (1994)"
citation: "Shor, P. W. (1994). Algorithms for quantum computation: discrete logarithms and factoring. In Proceedings 35th Annual Symposium on Foundations of Computer Science (pp. 124-134). IEEE."
link: "https://doi.org/10.1109/SFCS.1994.365700"
slug: "shor-factoring-algorithm"
heroImage: "/images/research-decoded/shor-factoring-algorithm.svg"
---

In 1994, Peter Shor demonstrated that a quantum computer can resolve the integer factorization and discrete logarithm problems in polynomial time, establishing a theoretical challenge to the foundations of modern public-key cryptography. Prior to this research, these mathematical tasks were assumed to be intractable for any physical machine, providing the security basis for protocols such as RSA and Diffie-Hellman. The researcher proved that by utilizing the properties of quantum superposition and interference, a machine can identify the periodic structure of specific mathematical functions with exponential efficiency compared to the best-known classical algorithms.

## Period Finding and the Reduction of Factoring {#periodic-factoring}

The core technical insight of the paper is the reduction of the integer factorization problem to the task of period finding. For an integer $N$, Shor utilized results from number theory to prove that finding the prime factors of $N$ is equivalent to identifying the period $r$ of the modular exponentiation function $f(x) = a^x \pmod N$, where $a$ is a random integer coprime to $N$. While finding this period on a classical computer requires an exponential number of evaluations, Shor demonstrated that a quantum system can represent all possible values of $x$ simultaneously, allowing for the extraction of periodic information through global wave interference rather than individual sampling.

## The Quantum Fourier Transform (QFT) Mechanism {#quantum-fourier}

The algorithmic engine of the framework is the Quantum Fourier Transform (QFT), a linear transformation on quantum bits that shifts a representation from the computational basis to the frequency domain. After preparing a quantum register in a massive superposition and performing modular exponentiation, the algorithm applies the QFT to the state. This process causes the amplitudes of incorrect period estimates to destructively interfere while the amplitude of the true period interferes constructively. This methodological choice established that the unique power of quantum computing is the ability to compute global structural properties of a function without the requirement to evaluate its individual points.

## Quantum Modular Exponentiation and Gate Complexity {#modular-exponentiation}

A critical engineering detail of the algorithm is the implementation of modular exponentiation using reversible quantum gates. Because quantum operations must be unitary, standard classical shortcuts for exponentiation cannot be directly applied. Shor proved that modular exponentiation can be executed using a polynomial number of Toffoli and Fredkin gates, ensuring that the total complexity of the algorithm remains $O((\log N)^3)$. This finding confirmed that the quantum speedup is a robust property of the circuit model of computation, providing a definitive roadmap for the development of hardware capable of breaking large-scale cryptographic keys.

## Impact on Public-Key Cryptographic Standards {#cryptography-threat}

The practical significance of Shor’s algorithm is its invalidation of the long-term security assumptions of the global digital infrastructure. Since RSA and Elliptic Curve Cryptography (ECC) rely on the perceived hardness of the problems Shor resolved, a sufficiently large quantum computer would enable the decryption of any communication secured by these methods. This realization initiated the field of post-quantum cryptography (PQC), shifting the engineering focus toward mathematical structures—such as high-dimensional lattices—that do not exhibit the periodic properties exploitable by the QFT. This work effectively established a theoretical deadline for the current era of encryption, requiring the systematic replacement of foundational security protocols.

## Physics as an Algorithmic Constraint {#significance}

The achievement of Peter Shor demonstrated that the complexity of a mathematical problem is determined by the physical laws governing the machine used to solve it. The decision to exploit quantum mechanical interference revealed that the boundaries of computational feasibility are not fixed but are instead a function of our ability to manipulate the fundamental properties of matter. This principle remains the central driver for the development of error-corrected quantum hardware. It leaves open the question of whether there exist other classes of non-periodic problems that are similarly vulnerable to quantum acceleration, or if the exponential speedup is uniquely tied to the identification of hidden symmetries in group theory.

## Resources

- [Algorithms for Quantum Computation (Official MIT PDF)](https://math.mit.edu/~shor/papers/QC-algorithms.pdf) {type: docs, provider: MIT}
- [Shor's Algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Shor%27s_algorithm) {type: article, provider: Wikipedia}
- [The Algorithm that Breaks the Internet (Video)](https://www.youtube.com/watch?v=lvTqbM5Dq4Q) {type: video, provider: Veritasium}
- [Shor's Algorithm on Qiskit (IBM)](https://docs.quantum.ibm.com/api/qiskit/qiskit.algorithms.Shor) {type: docs, provider: IBM}
