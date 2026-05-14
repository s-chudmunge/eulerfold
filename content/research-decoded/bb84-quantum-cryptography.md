---
title: "BB84: Quantum Cryptography"
authors: "Charles Bennett and Gilles Brassard (1984)"
citation: "Bennett, C. H., & Brassard, G. (1984). Quantum cryptography: Public key distribution and coin tossing. Proceedings of IEEE International Conference on Computers, Systems and Signal Processing, 175-179."
link: "https://researchgate.net/publication/220492644_Quantum_cryptography_Public_key_distribution_and_coin_tossing"
slug: "bb84-quantum-cryptography"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/6/6d/BB84_protocol.svg"
---

# Quantum Cryptography: Public Key Distribution and Coin Tossing

While public-key cryptography relies on the assumption that certain mathematical problems are hard to solve, Charles Bennett and Gilles Brassard proposed a system whose security is guaranteed by the laws of physics. Their 1984 paper, known as BB84, introduced the first protocol for Quantum Key Distribution (QKD). It demonstrated that the fundamental properties of quantum mechanics—specifically the uncertainty principle and the observer effect—can be used to detect the presence of an eavesdropper. This shift moved the foundation of security from computational hardness to physical impossibility, providing a way to share secrets that are immune even to an adversary with infinite computing power.

## The Principle of Non-Orthogonal States {#non-orthogonal-states}

The BB84 protocol relies on the fact that it is impossible to distinguish between non-orthogonal quantum states with absolute certainty. In the scheme, a sender (Alice) transmits photons in one of two bases: rectilinear (0 or 90 degrees) or diagonal (45 or 135 degrees). A receiver (Bob) measures these photons using a randomly chosen basis. According to the Heisenberg Uncertainty Principle, if Bob chooses the wrong basis, he will get a random result and permanently destroy the original state of the photon. This property ensures that information cannot be measured without altering it, creating a physical tamper-evident seal on every bit sent.

## Key Sifting and Error Reconciliation {#key-sifting}

After the quantum transmission, Alice and Bob communicate over a classical, non-secure channel to compare their choice of bases. They discard all bits where their bases did not match, leaving behind a sifted key. Because they only discuss the bases they used, and not the results of the measurements, an eavesdropper gains no useful information from this exchange. Alice and Bob then perform error reconciliation to correct any discrepancies caused by noise. This process highlighted that quantum communication is not a replacement for classical communication, but a specialized layer used to bootstrap a secure state that can then be used with classical symmetric encryption like AES.

## Detecting the Eavesdropper {#detecting-eve}

The most critical phase of BB84 is the privacy amplification and eavesdropper detection. Alice and Bob compare a small, random subset of their sifted key bits. If an eavesdropper was present, her attempts to measure the photons would have introduced a detectable error rate into their data—at least 25% for the bits where Bob's basis matched Alice's but the eavesdropper had guessed wrong. If the error rate exceeds a certain threshold, they know the channel is compromised and discard the key. This move provides provable security, a state where the users can be mathematically certain that no one else possesses the key, regardless of the technology the attacker uses.

## Physical Realization and Distance Barriers {#physical-realization}

Unlike mathematical protocols, BB84 requires specialized hardware, including single-photon sources and low-noise detectors. The initial implementations were limited to a few centimeters in a laboratory setting. Over time, the protocol has been extended to hundreds of kilometers over fiber optic cables and even through satellite-to-ground links. However, the no-cloning theorem prevents the use of traditional amplifiers to extend the range, as an amplifier would necessarily measure and destroy the quantum states. This has led to the development of quantum repeaters, which use entanglement swapping to extend the reach of QKD without compromising security.

## The Future of the Quantum Internet {#quantum-internet}

The BB84 protocol laid the groundwork for the Quantum Internet, a vision of a global network where quantum states are used for more than just key distribution. It proved that the weirdness of the quantum world is not a bug to be avoided, but a feature to be exploited for information processing. As we move toward a world where Shor’s algorithm threatens classical keys, BB84 offers a permanent, physics-based alternative. It leaves us with an open observation: as the cost of quantum hardware decreases, will QKD become a standard feature of our telecommunications infrastructure, or will it remain a niche tool for high-security government and financial data?

## Resources

- [BB84 Original Paper (ResearchGate)](https://researchgate.net/publication/220492644_Quantum_cryptography_Public_key_distribution_and_coin_tossing) {type: article, provider: ResearchGate}
- [Quantum Key Distribution Explained (Video)](https://www.youtube.com/watch?v=0pL92PZpMAs) {type: video, provider: ScienceClic}
