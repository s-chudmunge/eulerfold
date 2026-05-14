---
title: "RSA: Digital Signatures and Public-Key Cryptosystems"
authors: "Ronald Rivest, Adi Shamir, and Leonard Adleman (1978)"
citation: "Rivest, R. L., Shamir, A., & Adleman, L. (1978). A method for obtaining digital signatures and public-key cryptosystems. Communications of the ACM, 21(2), 120-126."
link: "https://people.csail.mit.edu/rivest/Rsapaper.pdf"
slug: "rsa-digital-signatures"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Public_key_encryption.svg"
---

# A Method for Obtaining Digital Signatures and Public-Key Cryptosystems

While Diffie and Hellman established the theoretical possibility of public-key cryptography in 1976, they did not provide a practical implementation of a trapdoor one-way function. Two years later, Ronald Rivest, Adi Shamir, and Leonard Adleman (RSA) filled this void by proposing an algorithm based on the difficulty of factoring large integers. This implementation turned the abstract idea of asymmetric encryption into a concrete tool that could be used for both secret communication and digital authentication. The RSA algorithm became the first widely adopted public-key cryptosystem, forming the bedrock of secure electronic commerce and identity verification for decades.

## The Integer Factorization Hardness {#factorization-hardness}

The security of RSA rests on a simple observation about the nature of multiplication and division. It is computationally easy to multiply two large prime numbers together to produce a composite number. However, if that composite number is sufficiently large, finding the original prime factors is an extraordinarily difficult task using classical algorithms. RSA leverages this asymmetry of effort to create a public-private key pair. The public key is derived from the product of two primes, while the private key is derived from the primes themselves. This connection ensures that anyone can use the product to lock a message, but only the holder of the factors can unlock it.

## The Modular Exponentiation Mechanism {#modular-mechanism}

The RSA operation involves modular exponentiation, where a message is treated as an integer and raised to a power modulo the product of two primes. The encryption process uses a public exponent, while the decryption process uses a private exponent calculated through the Extended Euclidean Algorithm. The relationship between these exponents is governed by Euler's Totient Theorem, which ensures that applying the private exponent after the public exponent perfectly recovers the original message. This mathematical cycle allows for a seamless transfer of information without the need for a pre-shared secret, provided the adversary cannot factor the modulus.

## Digital Signatures and Authentication {#digital-signatures}

One of the most profound contributions of the RSA paper was the realization that the encryption process can be reversed to create digital signatures. If Alice encrypts a message with her private key, anyone can decrypt it using her public key. While this does not keep the message secret, it proves beyond a mathematical doubt that only Alice could have created the encrypted version. This mechanism provides non-repudiation, ensuring that a sender cannot later deny having sent a specific message. This abstraction allowed for the creation of digital certificates and the entire infrastructure of the Web of Trust, where identities are verified by cryptographic proofs rather than physical presence.

## The Evolution of Cryptanalysis {#cryptanalysis-evolution}

The introduction of RSA sparked an intense period of research into integer factorization algorithms. Over time, methods like the Quadratic Sieve and the General Number Field Sieve (GNFS) significantly reduced the time required to factor large numbers, forcing users to continuously increase the size of their RSA keys from 512 bits in the early days to 2048 or 4096 bits today. This ongoing arms race between cryptographers and cryptanalysts highlighted a fundamental property of security: it is not a static state but a moving target that depends on the current limits of mathematical knowledge and computational power.

## Quantum Computing and the RSA End-State {#quantum-rsa}

The eventual decline of RSA is anticipated due to the development of Shor’s algorithm, which can factor integers in polynomial time. Once a sufficiently large fault-tolerant quantum computer exists, the core assumption of RSA—that factoring is hard—will no longer hold. This impending shift has transitioned RSA from a permanent solution to a legacy system that must eventually be replaced by algorithms based on lattice-based or code-based cryptography. The legacy of RSA, however, remains its demonstration that the deepest problems in number theory can have immediate, practical applications in protecting the fundamental rights of privacy and free speech in the digital age.

## Resources

- [RSA Original Paper (MIT)](https://people.csail.mit.edu/rivest/Rsapaper.pdf) {type: article, provider: MIT}
- [How RSA Works (Interactive)](https://prajwalsin.github.io/rsa-visualizer/) {type: interactive, provider: GitHub}
