---
title: "Dilithium: Digital Signatures"
authors: "Léo Ducas et al. (2018)"
citation: "Ducas, L., et al. (2018). CRYSTALS-Dilithium: A lattice-based digital signature scheme. IACR Transactions on Cryptographic Hardware and Embedded Systems, 238-268."
link: "https://pq-crystals.org/dilithium/data/dilithium-specification.pdf"
slug: "dilithium-digital-signatures"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Lattice-based_cryptography_diagram.svg"
---

In 2018, researchers introduced CRYSTALS-Dilithium, a digital signature scheme based on the hardness of lattice problems that is resistant to future quantum computational attacks. This research addresses the vulnerability of standard signature protocols—such as those based on RSA or Elliptic Curves—to Shor’s algorithm, which can efficiently solve the integer factorization and discrete logarithm problems. Dilithium utilizes the Short Integer Solution (SIS) problem to provide high security and efficient performance on contemporary hardware. The researchers demonstrated that by combining the Fiat-Shamir with Aborts framework with optimized polynomial arithmetic, a system can achieve signature and verification speeds comparable to classical methods while ensuring long-term resilience against quantum adversaries.

## Short Integer Solution and Lattice Hardness {#sis-problem}

The security of Dilithium is rooted in the Short Integer Solution (SIS) problem, which asks an adversary to find a short, non-zero vector $\vec{x}$ that satisfies the linear equation $A\vec{x} = \vec{0} \pmod q$ for a given matrix $A$. Because this problem does not exhibit the periodic structure found in traditional number-theoretic encryption, it remains resistant to quantum Fourier transforms. By carefully selecting the dimensions of the lattice and the size of the "short" vectors, the researchers provided a security level that remains robust even against an adversary with a large-scale quantum computer. This methodological choice proved that the stability of digital signatures can be maintained by anchoring them to the geometric complexity of high-dimensional lattices rather than the arithmetic of prime factors.

## Fiat-Shamir with Aborts and Rejection Sampling {#fiat-shamir}

The technical mechanism of Dilithium is based on the Fiat-Shamir with Aborts framework, which converts an interactive identification scheme into a non-interactive signature. To prevent the signature from leaking information about the secret key, the protocol includes a rejection sampling step. During the generation of a signature, if the resulting vector falls outside of a specific, safe range, the process is aborted and restarted with new randomness. This methodological choice ensures that the distribution of the final signatures is statistically independent of the secret key. This finding established that the most effective way to ensure information-theoretic privacy in a lattice scheme is to strategically discard results that could potentially reveal the model's internal state.

## Efficiency and Uniform Sampling in Module-Lattices {#efficiency}

A critical achievement of Dilithium is its computational efficiency, achieved through the use of uniform sampling and the Number Theoretic Transform (NTT). Unlike earlier lattice-based schemes that required complex Gaussian sampling—which is difficult to implement securely in hardware—Dilithium utilizes uniform distributions that are easier to protect against side-channel attacks. The use of NTT allows for quasi-linear time polynomial multiplication, enabling the system to rival the performance of classical elliptic curve signatures. This engineering shift proved that the transition to post-quantum security does not require a significant degradation in user experience or a massive increase in computational resource requirements.

## NIST Standardization and ML-DSA {#standardization}

The practical significance of Dilithium was validated during the NIST Post-Quantum Cryptography competition, where it was selected as the primary standard for post-quantum digital signatures. Officially designated as ML-DSA (Module-Lattice-Based Digital Signature Algorithm) in FIPS 204, the protocol serves as the global benchmark for verifying identities and ensuring data integrity in a quantum-capable world. This application established the lattice-based paradigm as the definitive replacement for legacy RSA and ECC systems. The work proved that the scalability of a secure infrastructure is determined by the adoption of "agile" cryptographic primitives that can be swapped without re-architecting the entire system.

## Lattices as a Foundation for Trust {#significance}

The success of Dilithium demonstrated that the act of authentication can be represented as a geometric search problem within a high-dimensional manifold. The decision to prioritize uniform sampling and modular structures revealed that the primary constraint on quantum-safe signatures was the implementation complexity of the underlying math. This principle remains the central theme in the search for even more compact and efficient signature schemes. It leaves open the question of whether there exist fundamental limits to the size of lattice-based keys, or if new mathematical structures can further reduce the storage overhead required for global quantum resistance.

## Resources

- [Dilithium Specification (Official PDF)](https://pq-crystals.org/dilithium/data/dilithium-specification.pdf) {type: docs, provider: NIST}
- [Dilithium Official Project Site](https://pq-crystals.org/dilithium/) {type: article, provider: PQ-Crystals}
- [Lattice-Based Cryptography (Wikipedia)](https://en.wikipedia.org/wiki/Lattice-based_cryptography) {type: article, provider: Wikipedia}
- [FIPS 204: ML-DSA Standard](https://csrc.nist.gov/pubs/fips/204/final) {type: docs, provider: NIST}
