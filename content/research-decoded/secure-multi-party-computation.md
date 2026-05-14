---
title: "Secure Multi-Party Computation: Yao's Protocol"
authors: "Andrew Chi-Chih Yao (1982)"
citation: "Yao, A. C. (1982). Protocols for secure computations. In 23rd annual symposium on foundations of computer science (sfocs 1982) (pp. 160-164). IEEE."
link: "https://www.cs.wisc.edu/~shuchi/courses/710-S05/yao82.pdf"
slug: "secure-multi-party-computation"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Two_parties_computation.svg"
---

# Protocols for Secure Computations: The Foundations of MPC

In 1982, Andrew Yao proposed a problem that would become a cornerstone of modern cryptography: the "Millionaires' Problem." Two millionaires want to know which of them is richer, but neither wants to reveal their exact net worth to the other. Yao’s solution to this problem introduced the field of Secure Multi-Party Computation (MPC), a framework that allows a group of participants to jointly compute a function over their private inputs without any participant learning anything about the others' data beyond the final result. This discovery proved that "privacy" and "collaboration" are not mutually exclusive, providing the mathematical basis for secure auctions, private voting, and collaborative data analysis.

## The Millionaires' Problem and Oblivious Transfer {#millionaires-problem}

Yao’s original protocol for the Millionaires' Problem relied on a primitive called "Oblivious Transfer" (OT). In an OT exchange, a sender provides two pieces of information, and a receiver chooses to receive one of them. The protocol ensures that the sender does not know which piece was chosen, and the receiver does not learn anything about the piece they did not choose. Yao used this to build a comparison circuit where each millionaire’s input is shielded by the other’s uncertainty. This shift from "data sharing" to "function evaluation" allowed for the creation of a "virtual trusted third party" that exists only in the mathematical interactions between the participants.

## Garbled Circuits: Computation as a Puzzle {#garbled-circuits}

The most significant technical contribution of Yao’s work was the "Garbled Circuit" protocol. In this scheme, any function can be represented as a boolean circuit (a series of AND, OR, and NOT gates). One party (the generator) "garbles" the circuit by replacing the 0s and 1s on each wire with random cryptographic keys and encrypting the truth table of each gate. The second party (the evaluator) receives the garbled circuit and the keys corresponding to their inputs (via Oblivious Transfer). By "decrypting" the gates one by one, the evaluator can find the final output without ever knowing the values on the internal wires. This move effectively turned computation into a "puzzle" that can only be solved if both parties provide their pieces.

## The Security Model and Honest-But-Curious Adversaries {#security-model}

Yao’s initial protocol was designed for "honest-but-curious" (or semi-honest) participants—individuals who follow the protocol exactly but will try to learn as much as possible from the data they receive. While later researchers developed more complex versions that protect against "malicious" adversaries (who can deviate from the rules), Yao’s work established the fundamental bounds of what is possible. It proved that if two parties can perform a simple key exchange, they can perform *any* computable function privately. This observation provided the "completeness theorem" for secure computation, showing that privacy is a universal property that can be applied to any algorithm.

## Efficiency and the Transition to Practice {#mpc-efficiency}

For many years, Yao’s protocols were considered purely theoretical due to the high communication overhead of sending garbled circuits and performing thousands of Oblivious Transfers. However, the last decade has seen a revolution in MPC efficiency through techniques like "OT Extension" and "Free-XOR" gates. Modern MPC systems can now handle complex tasks—such as computing the average salary of thousands of employees or performing private genomic comparisons—in a matter of seconds. This engineering evolution has brought Yao’s vision of "privacy-preserving collaboration" to the brink of mass adoption in the financial and medical industries.

## The Future of Decentralized Intelligence {#mpc-future}

The legacy of Andrew Yao’s 1982 paper is the realization that data does not need to be "collected" to be "useful." It has led to the development of "Federated Learning," where AI models are trained on private data distributed across millions of devices without the data ever leaving the device. As we enter an era of increased data sovereignty and privacy regulations, MPC offers a way to maintain the benefits of a data-driven society without the risks of centralized surveillance. It leaves us with an open observation: as our digital interactions become increasingly multi-party and decentralized, will Yao’s garbled circuits become the standard "language" for all collaborative computation?

## Resources

- [Yao's Protocols for Secure Computations (PDF)](https://www.cs.wisc.edu/~shuchi/courses/710-S05/yao82.pdf) {type: article, provider: Wisconsin}
- [Secure Multi-Party Computation Explained (Video)](https://www.youtube.com/watch?v=A8fH_BvVlyw) {type: video, provider: Yale University}
