---
title: "Dilithium: Lattice-Based Digital Signatures"
authors: "Léo Ducas, Eike Kiltz, Tancrède Lepoint, Vadim Lyubashevsky, Peter Schwabe, Gregor Seiler, and Damien Stehlé (2018)"
citation: "Ducas, L., Kiltz, E., Lepoint, T., Lyubashevsky, V., Schwabe, P., Seiler, G., & Stehlé, D. (2018). CRYSTALS-Dilithium: A lattice-based digital signature scheme. IACR Transactions on Cryptographic Hardware and Embedded Systems, 238-268."
link: "https://pq-crystals.org/dilithium/data/dilithium-specification.pdf"
slug: "dilithium-digital-signatures"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Lattice-based_cryptography_diagram.svg"
---

# CRYSTALS-Dilithium: A Lattice-Based Digital Signature Scheme

Digital signatures are the foundation of trust in the digital age, used to verify everything from software updates to financial transactions. However, like the RSA and ECC algorithms used for encryption, standard signature schemes are vulnerable to Shor’s algorithm. To address this, the CRYSTALS-Dilithium scheme was developed as part of the NIST Post-Quantum Cryptography competition. Dilithium is a lattice-based signature scheme that offers a combination of high security and efficient performance, designed to replace legacy systems as the world moves toward a quantum-resistant infrastructure. It was selected as the primary signature standard (ML-DSA) by NIST, ensuring its role as a cornerstone of future cybersecurity.

## The Short Integer Solution (SIS) Problem {#sis-problem}

Dilithium’s security is based on the hardness of the Short Integer Solution (SIS) problem and the Learning with Errors (LWE) problem in the context of modules. The SIS problem asks an adversary to find a short, non-zero vector that satisfies a set of linear equations in a high-dimensional lattice. Because this problem does not exhibit the periodic structure found in integer factorization or discrete logarithms, it is believed to be resistant to quantum Fourier transforms. By carefully selecting the dimensions of the lattice and the size of the "short" vectors, Dilithium provides a security level that remains robust even against an adversary with a large-scale quantum computer.

## Fiat-Shamir with Aborts {#fiat-shamir-aborts}

The technical mechanism of Dilithium is based on the "Fiat-Shamir with Aborts" framework. In this construction, a signature is created by performing a calculation that involves a secret key and a random challenge. However, to prevent the signature from leaking information about the secret key, the protocol includes a "rejection sampling" step. If the generated signature falls outside of a specific, safe range, the process is "aborted" and restarted with new randomness. This move ensures that the distribution of the final signatures is independent of the secret key, providing a high level of security without the need for the complex "Gaussian sampling" required by earlier lattice schemes.

## Efficiency and Uniform Sampling {#efficiency-uniform}

One of the primary goals of Dilithium was to simplify the implementation of lattice-based signatures. Many previous schemes required sampling from a Gaussian distribution, which is difficult to implement securely and efficiently in hardware. Dilithium, instead, uses uniform sampling, which is much easier to protect against side-channel attacks. By combining this with the Number Theoretic Transform (NTT) for fast polynomial arithmetic, Dilithium achieves signature and verification speeds that are comparable to classical elliptic curve signatures. This engineering choice ensured that the transition to post-quantum security would not require a massive increase in computational resources.

## NIST Standardization and ML-DSA {#standardization}

Following a multi-year evaluation process, NIST selected Dilithium as the primary standard for post-quantum digital signatures, officially designating it as ML-DSA in FIPS 204. The standardization process focused on ensuring the algorithm's parameters were tuned for a wide range of applications, from small embedded devices to high-performance servers. This designation makes Dilithium the "default" choice for verifying identities and ensuring data integrity in the 21st century. Its adoption across the industry marks a fundamental shift in how we define and implement trust at the mathematical level.

## The Future of Cryptographic Agility {#cryptographic-agility}

The introduction of Dilithium alongside Kyber marks the beginning of the "Cryptographic Agility" era. This concept emphasizes that our systems should be built with the ability to quickly swap out cryptographic algorithms as new threats emerge. While Dilithium is currently the state-of-the-art, the history of cryptography suggests that no algorithm is permanent. The legacy of Dilithium is its role in providing a bridge to the quantum-safe future, while also forcing the industry to build more flexible, resilient security architectures. This leaves us with an open question: as we successfully deploy lattice-based defenses, what new mathematical frontiers will the next generation of cryptanalysts attempt to conquer?

## Resources

- [Dilithium Official Website](https://pq-crystals.org/dilithium/) {type: article, provider: PQ-Crystals}
- [Dilithium Specification (PDF)](https://pq-crystals.org/dilithium/data/dilithium-specification.pdf) {type: article, provider: NIST}
