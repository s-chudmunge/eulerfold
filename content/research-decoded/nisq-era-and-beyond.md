---
title: "Quantum Computing in the NISQ Era"
authors: "John Preskill (2018)"
citation: "Preskill, J. (2018). Quantum Computing in the NISQ era and beyond. Quantum, 2, 79."
link: "https://arxiv.org/abs/1801.00862"
slug: "nisq-era-and-beyond"
heroImage: null
---

In 2018, John Preskill identified a specific developmental regime for quantum information science termed Noisy Intermediate-Scale Quantum (NISQ) technology. This framework addresses the developmental gap between small-scale laboratory demonstrations and the future requirement for fault-tolerant, error-corrected hardware. The researcher demonstrated that while current devices are outgrowing the reach of brute-force classical simulation, they remain too fragile to implement deep coherent algorithms without active error suppression. This coining of NISQ served to align the research community around the immediate engineering challenge of extracting computational value from imperfect, intermediate-scale hardware.

## The Genesis of the Intermediate Scale {#genesis}

The intermediate scale is defined by a precarious balance between qubit count and gate fidelity, typically involving devices with 50 to a few hundred physical qubits. This range occupies the frontier where classical supercomputers exhaust their memory capacity during state vector simulation. However, these qubits are fundamentally noisy, exhibiting decoherence and gate error rates that typically exceed the threshold required for fault-tolerance. Because quantum error correction requires a massive overhead of physical qubits to represent a single stable logical unit, these near-term devices must operate without such protection, establishing a rigid ceiling on the maximum depth of any executable quantum circuit.

## Hybrid Utility and Variational Heuristics {#hybrid-utility}

As the realization took hold that fault-tolerant algorithms like Shor’s would remain inaccessible for the foreseeable future, the focus of the field shifted toward hybrid quantum-classical architectures. This approach treats the quantum processor as a specialized co-processor within a larger classical optimization loop, delegating parameter tuning and error mitigation to robust classical heuristics. Algorithms such as the Variational Quantum Eigensolver (VQE) and the Quantum Approximate Optimization Algorithm (QAOA) exemplify this transition, utilizing the quantum device for state preparation while relying on classical hardware for the iterative refinement of the system.

## Pragmatic Search for Advantage {#pragmatic-search}

The transition to the NISQ paradigm represents a move away from the long-term goal of universal computation toward a search for near-term utility in fields like many-body physics and quantum chemistry. By focusing on noise-resilient heuristics and specific physical simulations, researchers identified a path to quantum advantage that does not depend on the immediate arrival of ideal hardware. This finding proved that the scalability of quantum systems is not an absolute barrier, but a variable that can be managed through algorithmic design. It leaves open the question of whether the "noise" of the present era is an insurmountable obstacle to industrial-scale application or a manageable constraint on the path to full fault tolerance.

## Resources

- [Quantum Computing in the NISQ era (arXiv)](https://arxiv.org/abs/1801.00862) {type: article, provider: arXiv}
- [Preskill's Note on NISQ (Quantum Journal)](https://quantum-journal.org/papers/q-2018-08-06-79/) {type: article, provider: Quantum Journal}
