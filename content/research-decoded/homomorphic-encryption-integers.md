---
title: "FHE: Fully Homomorphic Encryption over the Integers"
authors: "Marten van Dijk, Craig Gentry, Shai Halevi, and Vinod Vaikuntanathan (2010)"
citation: "van Dijk, M., Gentry, C., Halevi, S., & Vaikuntanathan, V. (2010). Fully homomorphic encryption over the integers. In Annual International Conference on the Theory and Applications of Cryptographic Techniques (pp. 24-43). Springer, Berlin, Heidelberg."
link: "https://eprint.iacr.org/2009/616.pdf"
slug: "homomorphic-encryption-integers"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Lattice-based_cryptography_diagram.svg/1200px-Lattice-based_cryptography_diagram.svg.png"
---

# Fully Homomorphic Encryption over the Integers

While Craig Gentry’s 2009 thesis proved that Fully Homomorphic Encryption (FHE) was possible, his original construction was based on complex mathematical structures known as "ideal lattices," which were difficult for many researchers to understand and implement. In 2010, Gentry collaborated with Marten van Dijk, Shai Halevi, and Vinod Vaikuntanathan to create a much simpler FHE scheme that uses nothing more than basic integer arithmetic. This work, known as DGHV, demonstrated that the profound power of FHE can be derived from the "Approximate Greatest Common Divisor" (AGCD) problem. By moving the field from abstract algebraic geometry to the familiar domain of integers, they paved the way for the broader implementation and optimization of secure computation.

## The Approximate GCD Problem {#agcd-problem}

The security of the DGHV scheme rests on the difficulty of finding the greatest common divisor of a set of numbers that have been slightly "perturbed" by noise. Given several numbers of the form $q_i \cdot p + r_i$, where $p$ is a large secret prime and $r_i$ is a small random error, it is computationally hard to recover $p$. In the DGHV scheme, a bit of data is encrypted by adding it to a multiple of the secret $p$ and an even-valued noise term. This construction ensures that the "parity" of the result remains tied to the original bit, but the secret $p$ acts as a "shield" that prevents an adversary from extracting that bit without knowing the secret grid.

## Homomorphic Addition and Multiplication {#homomorphic-operations}

DGHV allows for addition and multiplication of ciphertexts using standard integer operations. Adding two ciphertexts simply adds their underlying bits and their noise terms. Multiplying two ciphertexts is more complex, as it significantly increases the noise level (the $r_i$ terms). However, because the operations are performed modulo the secret $p$, the mathematical structure of the encryption is preserved. This move demonstrated that the properties of modular arithmetic—the same principles that power RSA—can be extended to support full homomorphic evaluation, provided the noise can be managed.

## Simplifying the Bootstrapping Process {#simplifying-bootstrapping}

A critical contribution of the paper was the simplification of Gentry’s "bootstrapping" technique. To refresh a ciphertext and reduce its noise, the system must evaluate its own decryption circuit. In the DGHV scheme, the decryption circuit is essentially a modular reduction followed by a parity check. The authors showed that this circuit can be represented as a relatively simple polynomial over the integers. By "squashing" the decryption circuit and using a technique called "sparse subset sum," they were able to implement bootstrapping more efficiently than in the original lattice-based scheme. This abstraction made the "recursive" nature of FHE much more accessible to the cryptographic community.

## Practical Implementation and Public Keys {#public-key-construction}

The DGHV paper provided the first practical "roadmap" for building a public-key FHE system from integers. While the secret key is the large prime $p$, the public key consists of a large set of "encryptions of zero." To encrypt a new bit, a user simply takes a random subset of these public values and adds them together. This construction highlights a fundamental property of secure systems: they can be built by aggregating many small, noisy secrets into a single, robust public structure. Although the public keys in the original DGHV scheme were massive (several gigabytes), the paper provided the foundation for subsequent "compressed" versions that are used in modern research.

## The Legacy of Conceptual Clarity {#dghv-legacy}

The legacy of "Fully Homomorphic Encryption over the Integers" is its role in "democratizing" the study of FHE. By proving that secure computation does not require specialized algebraic structures, it invited a wider range of mathematicians and computer scientists to work on the problem of data privacy. It served as a "conceptual bridge" between the first generation of FHE and the more efficient "ring-based" schemes (like BGV and Fan-Vercauteren) that are used today. It leaves us with an open observation: as we continue to simplify and optimize these protocols, are we moving toward a future where the "integer" itself becomes the universal container for both value and privacy?

## Resources

- [FHE over Integers Original Paper (IACR)](https://eprint.iacr.org/2009/616.pdf) {type: article, provider: IACR}
- [Introduction to Homomorphic Encryption (Video)](https://www.youtube.com/watch?v=cbV8o6tLMTM) {type: video, provider: Helib}
---
