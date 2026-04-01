---
title: "Natural Proofs: Complexity Barriers"
authors: "Razborov & Rudich (1994)"
citation: "Razborov, A. A., & Rudich, S. (1997). Natural proofs. Journal of Computer and System Sciences, 55(1), 24-35."
link: "https://mit6875.github.io/PAPERS/natural_proofs.pdf"
slug: "razborov-rudich-natural-proofs"
---

# Razborov & Rudich: Natural Proofs

In 1994, Alexander Razborov and Steven Rudich published 'Natural Proofs,' a paper that identified the 'Natural Proofs Barrier' and explained why the field of circuit complexity had stalled since the late 1980s. They argued that the very techniques researchers were using to prove lower bounds on circuits—the standard approach to separating P from NP—were fundamentally limited by the existence of pseudorandom generators. This discovery revealed that a proof of P != NP would require a new kind of mathematics that avoids the 'naturalness' shared by almost all known proofs in the field.

## Constructivity, Largeness, and Naturalness {#naturalness-properties}

Alexander Razborov and Steven Rudich identified a common structure in almost all known circuit lower bound proofs, which they termed a 'Natural Proof.' A proof is 'natural' if it identifies a property of Boolean functions that is both constructive—meaning it can be efficiently computed—and large, meaning it holds for a significant fraction of all possible Boolean functions. This framework revealed that most attempts to prove a function is 'hard' rely on finding a simple, common characteristic of 'random' functions and showing that the specific function of interest possesses it. This finding unified decades of research under a single technical umbrella, while simultaneously exposing its collective vulnerability.

## The Pseudorandomness Barrier {#prg-barrier}

The primary technical significance of the paper was the proof that the existence of strong pseudorandom generators (PRGs) is incompatible with 'natural' proofs for super-polynomial lower bounds. Razborov and Rudich demonstrated that if such a PRG exists, any 'natural' property could be used to efficiently distinguish between truly random functions and those produced by the generator. This would effectively 'break' the PRG, contradicting the very assumption of its hardness. Because many researchers believe that P != NP implies the existence of PRGs, this finding suggested that the standard methods used to separate the classes are self-defeating. It proved that if we are to solve the P vs NP question, we must develop tools that are either not constructive or not large.

## The Limits of Combinatorial Reasoning {#natural-proofs-limits}

Razborov and Rudich's work demonstrated that the complexity of computational systems is deeply intertwined with our ability to distinguish randomness from design. The engineering choice to study the properties of Boolean functions revealed that the 'natural' approach is fundamentally insufficient for proving the highest levels of computational difficulty. It suggested that a successful separation of P and NP would require a move toward 'unnatural' mathematics—techniques that exploit specific, rare properties of functions rather than general characteristics of random ones. This realization remains the primary reason that circuit complexity research has moved away from simple combinatorial lower bounds toward more abstract fields like algebraic complexity and geometric complexity theory.

## Resources

- [Natural Proofs Original Paper (PDF)](https://mit6875.github.io/PAPERS/natural_proofs.pdf) {type: article, provider: MIT}
- [Why P vs NP is so Hard](https://www.scottaaronson.com/blog/?p=1720) {type: article, provider: Scott Aaronson}
