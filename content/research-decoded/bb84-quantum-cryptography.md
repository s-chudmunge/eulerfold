---
title: "BB84: Quantum Cryptography"
authors: "Charles Bennett & Gilles Brassard (1984)"
citation: "Bennett, C. H., & Brassard, G. (1984). Quantum cryptography: Public key distribution and coin tossing. In Proceedings of IEEE International Conference on Computers, Systems and Signal Processing (pp. 175-179)."
link: "https://researchgate.net/publication/220492644_Quantum_cryptography_Public_key_distribution_and_coin_tossing"
slug: "bb84-quantum-cryptography"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/6/6d/BB84_protocol.svg"
---

In 1984, Charles Bennett and Gilles Brassard introduced the first protocol for quantum key distribution (QKD), establishing a method for secret sharing whose security is guaranteed by the laws of physics rather than computational hardness. Prior to this research, secure communication relied on the perceived difficulty of mathematical problems like integer factorization, which remain vulnerable to future algorithmic or hardware breakthroughs. The researchers proved that by utilizing the properties of non-orthogonal quantum states, a system can detect the presence of an eavesdropper through the inevitable disturbance caused by any attempt to measure the information. This shift moved the foundation of security from the limits of human ingenuity to the fundamental constraints of the physical world.

## Non-Orthogonal States and the Observer Effect {#non-orthogonal-states}

The technical core of the BB84 protocol is the use of non-orthogonal quantum states to represent bit values. A sender (Alice) transmits photons in one of two randomly selected bases: rectilinear (0 or 90 degrees) or diagonal (45 or 135 degrees). Because these bases are non-orthogonal, it is physically impossible for an eavesdropper to distinguish between the four possible states with absolute certainty. According to the uncertainty principle, the act of measuring a quantum state in the wrong basis permanently alters that state. This methodological choice ensured that information cannot be intercepted without leaving a detectable physical trace, effectively digitalizing the concept of a tamper-evident seal for the transmission of data.

## Key Sifting and Error Reconciliation {#key-sifting}

After the quantum transmission phase, the participants utilize a classical, non-secure channel to compare their choice of bases for every bit sent. They discard all instances where the bases did not match, resulting in a "sifted" key. Because the sifting process only reveals the bases used and not the specific measurement results, an eavesdropper gains no information from the classical exchange. Alice and Bob then perform error reconciliation to identify and correct any discrepancies caused by channel noise or interference. This finding established that quantum communication is a specialized layer for bootstrapping a secure state, which can then be utilized with standard classical symmetric encryption.

## Eavesdropper Detection and Provable Security {#detecting-eve}

The primary technical significance of BB84 is the rigorous detection of unauthorized monitoring. Alice and Bob compare a randomly selected subset of their sifted key bits to calculate the quantum bit error rate (QBER). If an eavesdropper has attempted to measure the photons, her interventions will have introduced errors into at least 25% of the bits where the participants' bases matched. If the observed error rate exceeds a pre-defined threshold, the key is identified as compromised and discarded. This discovery provided the first instance of provable security, a state where the users can be mathematically certain that their communication is private regardless of the technological capability of the adversary.

## Distance Barriers and Quantum Repeaters {#physical-realization}

The practical implementation of BB84 is constrained by the physical attenuation of signals in fiber optic cables and the no-cloning theorem, which prevents the use of traditional amplifiers. While initial demonstrations were restricted to centimeters, modern realizations have achieved QKD over hundreds of kilometers using low-noise detectors and satellite-to-ground links. To extend this range globally, researchers have developed quantum repeaters that utilize entanglement swapping to link distant segments without ever measuring the signal. This engineering evolution revealed that the scalability of a quantum internet is a function of the precision with which entanglement can be distributed and maintained across physical distances.

## Physics as a Cryptographic Primitive {#significance}

The achievement of Bennett and Brassard demonstrated that the "weirdness" of the quantum world is a functional tool for information security. The decision to model communication as a physical interaction revealed that the primary bottleneck in classical security was the assumption that information could be observed without consequence. This principle remains the central theme in the development of next-generation QKD protocols and the transition toward a post-quantum global infrastructure. It leaves open the question of whether these physics-based defenses can be made sufficiently cost-effective to replace mathematical encryption for the general population.

## Resources

- [Quantum Cryptography (Official Paper)](https://researchgate.net/publication/220492644_Quantum_cryptography_Public_key_distribution_and_coin_tossing) {type: docs, provider: ResearchGate}
- [Quantum Key Distribution (Wikipedia)](https://en.wikipedia.org/wiki/Quantum_key_distribution) {type: article, provider: Wikipedia}
- [BB84 Protocol Animation (YouTube)](https://www.youtube.com/watch?v=0pL92PZpMAs) {type: video, provider: ScienceClic}
