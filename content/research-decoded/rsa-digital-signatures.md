---
title: "RSA: Public-Key Cryptosystems"
authors: "Ronald Rivest, Adi Shamir, & Leonard Adleman (1978)"
citation: "Rivest, R. L., Shamir, A., & Adleman, L. (1978). A method for obtaining digital signatures and public-key cryptosystems. Communications of the ACM, 21(2), 120-126."
link: "https://people.csail.mit.edu/rivest/Rsapaper.pdf"
slug: "rsa-digital-signatures"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Public_key_encryption.svg"
---

In 1978, Ronald Rivest, Adi Shamir, and Leonard Adleman introduced the first practical implementation of a public-key cryptosystem based on the difficulty of integer factorization. This research addressed the requirement for secure digital communication and authentication in an environment without pre-shared secrets. The researchers demonstrated that by utilizing the computational asymmetry between the multiplication of large primes and the extraction of their factors, a system can achieve both confidential encryption and non-repudiable digital signatures. This work established the foundational layer for global electronic commerce and the modern Web of Trust, effectively digitalizing the Act of secure identity verification.

## Integer Factorization and the Trapdoor Function {#factorization-hardness}

The security of RSA is rooted in the mathematical property that while it is computationally trivial to multiply two large prime numbers ($p, q$) to produce a composite modulus $n$, reversing the process to find the original factors is exponentially difficult using classical algorithms. This asymmetry allows for the creation of a public key $(n, e)$ that can be used for encryption and a private key $d$ reserved for decryption. The private exponent is calculated using the Extended Euclidean Algorithm such that it acts as a secret "trapdoor" to the modular exponentiation function. This finding established the principle that the robustness of a secure system is a function of the numerical hardness of its underlying number-theoretic challenges.

## Modular Exponentiation and Euler's Totient Theorem {#modular-mechanism}

The technical mechanism of RSA encryption involves raising a numerical message $m$ to a public power $e$ modulo $n$. Decryption is achieved by raising the resulting ciphertext $c$ to the private power $d$ modulo $n$. The validity of this cycle is guaranteed by Euler’s Totient Theorem, which ensures that $m^{ed} \equiv m \pmod n$ provided that $e$ and $d$ are multiplicative inverses modulo $\phi(n)$. This methodological choice allowed for the first implementation of a fully reversible asymmetric cipher that does not require the exchange of secret keys. It proved that the integrity of information can be maintained through the systematic management of arithmetic congruences over massive integers.

## Digital Signatures and the Proof of Origin {#signatures}

A critical achievement of the RSA framework was the realization that the encryption process can be reversed to create digital signatures. If a sender encrypts a message with their private key, anyone with access to the corresponding public key can decrypt it. While this does not preserve secrecy, it provide a mathematical proof that the message could only have been created by the holder of the private key. This finding established the concept of non-repudiation in the digital domain, enabling the creation of digital certificates and the entire infrastructure of the Public Key Infrastructure (PKI). This move transformed cryptography from a tool for secrecy into a foundational mechanism for legal and social accountability.

## Evolution of Factorization and Key Scaling {#cryptanalysis}

The practical significance of RSA has been shaped by the continuous progress in integer factorization algorithms, such as the General Number Field Sieve (GNFS). As computational power and algorithmic efficiency increased, researchers were forced to scale RSA keys from 512 bits in the late 1970s to 2048 or 4096 bits in modern systems. This ongoing competition revealed that security is not a static state but a dynamic threshold that depends on the current limits of mathematical knowledge. It established the principle that the scalability of a secure system is determined by the adoption of key sizes that stay ahead of the "factorization frontier" while remaining within the processing limits of the hardware.

## The Quantum Limit and the Transition to Post-Quantum {#quantum-threat}

The eventual decline of RSA is anticipated due to the development of Shor’s algorithm, which can factor large integers in polynomial time on a sufficiently powerful quantum computer. This theoretical breakthrough has transitioned RSA from a permanent solution into a legacy system that must eventually be replaced by lattice-based or code-based cryptography. However, the legacy of RSA remains its demonstration that the deepest problems in pure mathematics—specifically prime number theory—can provide immediate and robust tools for protecting the fundamental human rights of privacy and free speech. It leaves open the question of how long these factorization-based defenses will remain viable before the crossover point of quantum utility is reached.

## Resources

- [A Method for Obtaining Digital Signatures (Official Paper)](https://people.csail.mit.edu/rivest/Rsapaper.pdf) {type: docs, provider: MIT}
- [Official Journal Record (DOI)](https://doi.org/10.1145/359340.359342) {type: docs, provider: ACM}
- [How RSA Works (Interactive)](https://prajwalsin.github.io/rsa-visualizer/) {type: interactive, provider: GitHub}
- [Factorization and Cryptography (Video)](https://www.youtube.com/watch?v=MQnJZuE-Yt0) {type: video, provider: YouTube}
