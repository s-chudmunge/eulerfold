---
title: "Shor: Polynomial-Time Factoring"
authors: "Peter W. Shor (1994)"
citation: "Shor, P. W. (1994). Algorithms for quantum computation: discrete logarithms and factoring. Proceedings 35th Annual Symposium on Foundations of Computer Science, 124-134."
link: "https://arxiv.org/abs/quant-ph/9508027"
slug: "shor-factoring-algorithm"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Shor_algorithm_circ_v1.svg"
---

# Algorithms for Quantum Computation: Discrete Logarithms and Factoring

In 1994, Peter Shor published a paper that sent shockwaves through the fields of computer science and cryptography by demonstrating that two of the most important problems in modern encryption—integer factorization and discrete logarithms—can be solved in polynomial time on a quantum computer. This discovery ended the assumption that the security of systems like RSA and Diffie-Hellman was guaranteed by the laws of mathematics. Instead, it showed that their security was contingent on the limitations of classical hardware. Shor’s algorithm provided the first killer app for quantum computing, transforming the field from a theoretical exploration of physics into a strategic imperative for global security.

## The Periodic Nature of Factoring {#periodic-factoring}

Shor’s fundamental insight was that the problem of factoring an integer $N$ can be reduced to the problem of finding the period of a specific mathematical function. Using number theory, he showed that if one can find the period $r$ of the function $f(x) = a^x \mod N$, where $a$ is a randomly chosen number, then the factors of $N$ can be derived with high probability. On a classical computer, finding this period is as difficult as factoring itself, as it requires checking an exponential number of values. Shor’s genius was in recognizing that a quantum computer can find this period efficiently by using the principle of quantum interference.

## Quantum Fourier Transform (QFT) {#quantum-fourier}

The core mechanism of Shor’s algorithm is the Quantum Fourier Transform (QFT). Unlike a classical Fourier transform, which acts on a vector of data, the QFT acts on the state of a quantum register. By putting the register into a massive superposition of all possible values and then applying the QFT, the algorithm causes the incorrect answers to destructively interfere with one another while the correct answer—the period of the function—interferes constructively. This allows the quantum computer to extract the periodic information from the superposition in a single operation. This process demonstrates the unique power of quantum mechanics: the ability to process global properties of a mathematical function without evaluating every individual point.

## The Threat to Public-Key Cryptography {#cryptography-threat}

The implications of Shor’s algorithm are profound for cybersecurity. Because almost all modern secure communication relies on the hardness of factoring (RSA) or discrete logarithms (Diffie-Hellman, ECC), a sufficiently powerful quantum computer would be able to decrypt past and present communications. This has led to the concept of Store Now, Decrypt Later (SNDL), where adversaries capture encrypted data today in the hope of decrypting it once quantum hardware matures. Shor’s work effectively set a deadline for the current era of cryptography, forcing the international community to begin a multi-decade transition to quantum-resistant algorithms.

## Modular Exponentiation on Quantum Hardware {#modular-exponentiation}

Beyond the QFT, a significant portion of Shor’s algorithm involves quantum modular exponentiation. This is the process of implementing modular arithmetic using reversible quantum gates. Because quantum operations must be unitary and reversible, standard classical shortcuts for exponentiation cannot be used directly. Shor had to prove that modular exponentiation could be computed using a polynomial number of gates, ensuring the entire algorithm remained efficient. This engineering detail confirmed that the speedup was not just theoretical but could, in principle, be realized on physical hardware if the challenges of decoherence were overcome.

## The Birth of Post-Quantum Cryptography {#post-quantum-birth}

The legacy of Shor’s algorithm is the creation of the field of post-quantum cryptography (PQC). Knowing that the current foundations are compromised, researchers have turned to other mathematical problems that do not exhibit the periodic structure that Shor’s algorithm exploits. These include lattice-based problems, where the shortest vector in a high-dimensional grid is hard to find, and code-based problems. Shor’s work redefined the relationship between physics and computation, proving that the security of a secret depends not just on the complexity of the math, but on the physical nature of the machine used to attack it. It leaves us with the open question: are there other quantum-vulnerable problems waiting to be discovered?

## Resources

- [Shor's Original Paper (arXiv)](https://arxiv.org/abs/quant-ph/9508027) {type: article, provider: arXiv}
- [Quantum Factoring (Video)](https://www.youtube.com/watch?v=lvTqbM5Dq4Q) {type: video, provider: Veritasium}
