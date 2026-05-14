---
title: "Reflections on Trusting Trust"
authors: "Ken Thompson (1984)"
citation: "Thompson, K. (1984). Reflections on trusting trust. Communications of the ACM, 27(8), 761-763."
link: "https://www.cs.cmu.edu/~rdriley/487/papers/Thompson_1984_ReflectionsonTrustingTrust.pdf"
slug: "reflections-on-trusting-trust"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Ken_Thompson_%28sitting%29_and_Dennis_Ritchie_at_PDP-11.jpg"
---

# Reflections on Trusting Trust

In his 1984 Turing Award lecture, Ken Thompson, the co-creator of Unix, delivered a profound warning about the nature of security in software systems. He demonstrated that a system is only as secure as the tools used to build it, and that a sophisticated attacker can insert a backdoor into a compiler such that the backdoor is invisible in the source code of both the compiler and the applications it creates. This revelation shattered the illusion that auditing source code is sufficient for security, revealing a recursive dependency on trust that extends deep into the foundations of computing.

## The Compiler as a Trojan Horse {#compiler-trojan}

Thompson’s primary technical demonstration involved a three-stage attack on a C compiler. In the first stage, he added logic to the compiler to recognize when it was compiling the login command and, in those cases, insert a backdoor that would allow a specific password to grant access. In the second stage, he added logic to the compiler to recognize when it was compiling itself. If the compiler detected it was compiling its own source code, it would re-insert both the login backdoor and the compiler backdoor. This meant that the source code of the compiler could be perfectly clean and free of malicious logic, yet the resulting binary would still contain the attack.

## The Invisible Backdoor {#invisible-backdoor}

The genius of the Thompson attack lies in the decoupling of source code from binary behavior. Once the poisoned compiler binary is used to compile a clean version of its own source code, the malicious logic is inherited by the new binary. If the attacker then deletes the original poisoned binary and the source code modification, the backdoor survives in the executable file, invisible to any developer examining the code. This observation proved that you cannot trust code that you did not totally create yourself, as the very tools we use to turn human-readable logic into machine-readable instructions can be subverted to lie about their own nature.

## The Recursive Nature of Trust {#recursive-trust}

Thompson’s lecture introduced the concept of the Trusting Trust problem, which highlights the infinite regress of dependency in modern computing. To trust an application, you must trust the compiler. To trust the compiler, you must trust the assembler. To trust the assembler, you must trust the operating system, and eventually, the hardware itself. This realization moved cybersecurity from a purely technical domain into a philosophical and social one, where security is defined by the chains of trust we choose to accept. It forced a shift in focus toward trusted computing and reproducible builds, where the goal is to verify that a binary truly matches its source code through independent, cross-compiler verification.

## Impact on Modern Software Supply Chains {#supply-chain-impact}

The Reflections on Trusting Trust paper remains highly relevant in the era of complex software supply chains. Modern attacks often target package managers, build servers, or CI/CD pipelines, reflecting Thompson’s insight that compromising a central tool is far more efficient than attacking individual targets. This has led to the development of the Software Bill of Materials (SBOM) and efforts like Diverse Double Compilation, which attempts to detect compiler-level backdoors by comparing the outputs of different compilers. Thompson’s work serves as a permanent reminder that the complexity of our systems is a veil that can hide deep-seated vulnerabilities.

## The Social Dimension of Security {#social-security}

Ultimately, Thompson concluded that there is no purely technical solution to the problem of trust. While we can improve our auditing and verification tools, the moral of the story is that security is rooted in the integrity of the people and organizations that provide our infrastructure. This observation leaves us with an open question for the future: in an increasingly automated world where AI begins to write and compile its own code, how do we establish a root of trust when no single human totally creates the system? The recursive trap that Thompson identified continues to expand as our layers of abstraction grow deeper.

## Resources

- [Reflections on Trusting Trust (Full Text)](https://www.cs.cmu.edu/~rdriley/487/papers/Thompson_1984_ReflectionsonTrustingTrust.pdf) {type: article, provider: CMU}
- [Ken Thompson's Turing Award Speech (Audio)](https://www.youtube.com/watch?v=J9fSsk9v-OQ) {type: video, provider: ACM}
