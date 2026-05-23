---
title: "Secure Multi-Party Computation: Yao's Protocol"
authors: "Andrew Chi-Chih Yao (1982)"
citation: "Yao, A. C. (1982). Protocols for secure computations. In 23rd Annual Symposium on Foundations of Computer Science (SFOCS) (pp. 160-164). IEEE."
link: "https://www.cs.wisc.edu/~shuchi/courses/710-S05/yao82.pdf"
slug: "secure-multi-party-computation"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Two_parties_computation.svg"
---

In 1982, Andrew Yao introduced a mathematical framework for jointly computing functions over private inputs such that no participant learns anything about the others' data beyond the final output. This framework, termed Secure Multi-Party Computation (MPC), addresses the "Millionaires' Problem," where two parties want to identify which possesses the larger value without revealing their exact numerical magnitude. Yao proved that any computable function can be transformed into a secure protocol through the use of garbled circuits and oblivious transfer. This discovery established that "privacy" and "collaboration" are not mutually exclusive, established the foundation for modern secure auctions, private voting, and collaborative data analysis.

## The Millionaires' Problem and Oblivious Transfer {#oblivious-transfer}

The foundation of the MPC framework is the Millionaires' Problem, which Yao resolved using a cryptographic primitive termed Oblivious Transfer (OT). In an OT exchange, a sender provides two pieces of information, and a receiver selects one to receive. The protocol ensures that the sender remains unaware of which item was chosen, while the receiver learns nothing about the item they did not select. This methodological choice allowed for the construction of a comparison circuit where each participant’s input is shielded by the other’s uncertainty. It revealed that the most effective way to protect sensitive data is to move the search for a result into a virtual state space where no single participant possesses the complete logical key.

## Garbled Circuits and Computation as a Puzzle {#garbled-circuits}

The primary technical contribution of the 1982 paper is the "Garbled Circuit" protocol, which enables the evaluation of arbitrary Boolean functions. One party, the generator, transforms a circuit by replacing the 0 and 1 values on every wire with random cryptographic keys and encrypting the truth table for each gate. The second party, the evaluator, receives the garbled structure and the keys corresponding to their specific inputs via Oblivious Transfer. By iteratively decrypting the gates, the evaluator reaches the final output without ever observing the values on the internal wires of the processor. This finding effectively turned computation into a "puzzle" that can only be solved if both parties provide their respective pieces, establishing a new paradigm for decentralized information processing.

## Security Models and Honest-But-Curious Adversaries {#security-model}

Yao’s original protocol was designed for "honest-but-curious" (semi-honest) participants—individuals who follow the rules of the protocol but will attempt to learn as much as possible from the data they receive. While later research introduced more complex mechanisms to protect against malicious adversaries who deviate from the protocol, Yao’s work established the fundamental bounds of what is computable in a private environment. He provided a "completeness theorem" for secure computation, proving that if a basic key exchange is possible, then any task achievable by a trusted third party can be simulated by a secure protocol. This finding established privacy as a universal property that can be applied to any algorithmic process.

## Impact on Decentralized Intelligence and Federated Learning {#applications}

The practical significance of Secure Multi-Party Computation is most evident in the development of modern "trustless" infrastructures for finance and medicine. By providing a method for multiple organizations to analyze their combined data without violating confidentiality, MPC enables the transition toward a decentralized data economy. This application remains the central theme in the development of "Federated Learning," where AI models are trained on private data distributed across millions of devices without the data ever being centralized. The work proved that the utility of information is not tied to its direct disclosure, suggesting that the most robust way to manage a data-driven society is to prioritize functional collaboration over raw data sharing.

## The Future of Private Collaborative Logic {#significance}

The success of Andrew Yao’s protocol demonstrated that the bottleneck in collaborative computation was the requirement for absolute data transparency. The decision to model computation as a set of encrypted state transitions revealed that the primary constraint on digital trust was the reliance on centralized intermediaries. This principle remains the guiding rule for the search for practical "privacy-enhancing technologies," influencing the design of systems that balance individual sovereignty with collective intelligence. It leaves open the question of whether the communication overhead of garbled circuits can be further reduced to support real-time interaction at the scale of the global internet.

## Resources

- [Protocols for Secure Computations (Official PDF)](https://www.cs.wisc.edu/~shuchi/courses/710-S05/yao82.pdf) {type: docs, provider: Wisconsin}
- [Secure Multi-Party Computation (Wikipedia)](https://en.wikipedia.org/wiki/Secure_multi-party_computation) {type: article, provider: Wikipedia}
- [MPC Explained (Video)](https://www.youtube.com/watch?v=A8fH_BvVlyw) {type: video, provider: Yale University}
- [Official Journal Record (IEEE)](https://doi.org/10.1109/SFCS.1982.88) {type: docs, provider: IEEE}
