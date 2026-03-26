---
title: "The NISQ Era"
authors: "John Preskill (2018)"
citation: "Preskill, J. (2018). Quantum Computing in the NISQ era and beyond. Quantum, 2, 79."
link: "https://arxiv.org/abs/1801.00862"
slug: "nisq-era-and-beyond"
heroImage: ""
---

# The NISQ Era

The landscape of quantum information science in 2018 was defined by a growing tension between theoretical potential and experimental reality. While the mathematical foundations for exponential speedups in factoring and search had been established decades prior, the physical hardware remained confined to small-scale laboratory demonstrations that posed no threat to classical dominance. 

John Preskill introduced the term Noisy Intermediate-Scale Quantum (NISQ) technology to characterize this specific developmental bottleneck where devices were finally outgrowing the reach of brute-force classical simulation yet remained far too fragile for the rigorous demands of fault tolerance.

## The Genesis of the Intermediate Scale {#genesis}

This era emerged as a necessary conceptual bridge, acknowledging that the 50-qubit threshold represented a significant milestone in computational complexity while simultaneously tempering expectations regarding the immediate commercial utility of such systems. The coining of the term served to align the community around the immediate challenge of extracting value from imperfect hardware rather than waiting for the distant arrival of ideal, error-corrected machines.

## The Constraints of Noisy Hardware {#constraints}

### Balancing Scale and Fidelity

The technical mechanism of the intermediate scale is defined by a precarious balance between qubit count and gate fidelity. Devices in this regime typically feature between 50 and a few hundred physical qubits, a range specifically chosen because it occupies the frontier where classical supercomputers begin to struggle with the memory requirements of state vector simulation. 

However, these qubits are fundamentally noisy, suffering from decoherence and gate errors that typically exceed the 0.1 percent threshold for two-qubit operations. Because quantum error correction requires a massive overhead of physical qubits to create a single stable logical qubit, these near-term devices must operate without any such protection.

### The Circuit Depth Ceiling

This lack of error correction imposes a strict ceiling on circuit depth, as the cumulative probability of a terminal error approaches unity after only a few hundred or thousand gates. The hardware is thus a race against time, where the computation must be completed before the environmental noise inevitably collapses the fragile entanglement that provides the quantum advantage.

## The Shift Toward Hybrid Utility {#hybrid-utility}

### Hybrid Quantum-Classical Algorithms

As the realization took hold that fault-tolerant algorithms like Shor’s would remain inaccessible for the foreseeable future, the focus of the field shifted toward a new abstraction: the hybrid quantum-classical algorithm. This approach treats the quantum processor not as a standalone computer but as a specialized co-processor within a larger classical optimization loop. 

Algorithms such as the Variational Quantum Eigensolver and the Quantum Approximate Optimization Algorithm exemplify this transition, using the quantum device to prepare complex entangled states while delegating the parameter tuning and error mitigation to robust classical heuristics.

### Pragamatic Search for Advantage

This paradigm shift represents a move away from the rigid, long-term goals of universal computation toward a more pragmatic search for near-term utility in fields like many-body physics and quantum chemistry. By focusing on noise-resilient heuristics and specific physical simulations, researchers hope to find the first instances of quantum advantage in the messy, imperfect reality of the present, leaving the question of universal scalability to the next generation of architects.

## Resources

- [Quantum Computing in the NISQ era and beyond (arXiv)](https://arxiv.org/abs/1801.00862) {type: article, provider: arXiv}
- [Preskill's Note on NISQ](https://quantum-journal.org/papers/q-2018-08-06-79/) {type: article, provider: Quantum Journal}
