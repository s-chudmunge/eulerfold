---
title: "What Do We Actually Need to Build a Quantum Computer?"
authors: "David P. DiVincenzo (2000)"
citation: "DiVincenzo, D. P. (2000). The physical implementation of quantum computation. Fortschritte der Physik: Progress of Physics, 48(9-11), 771-783."
link: "https://doi.org/10.1002/1521-3978(200009)48:9/11%3C771::AID-PROP771%3E3.0.CO;2-E"
slug: "divincenzo-criteria"
heroImage: "/images/research-decoded/divincenzo-criteria.jpg"
---

In 2000, David DiVincenzo established a formal set of benchmarks for the physical realization of universal quantum computation, bridging the gap between theoretical complexity and experimental physics. Prior to this research, while robust algorithms existed for tasks such as factoring and database search, there was no unified framework for evaluating the suitability of diverse physical platforms. The paper identified five essential criteria for quantum computing and two additional requirements for quantum communication, providing a rigorous engineering checklist for the development of scalable hardware architectures.

## Qubit Characterization and Scalable Arrays {#qubit-characterization}

The first criterion is the requirement for a scalable physical system composed of well-characterized qubits. This moves beyond the simple identification of two-state systems to demand a deep understanding of the internal Hamiltonian and energy level structure of each node. Researchers must precisely quantify the interaction strengths and couplings between qubits to ensure that operations can be controlled without unintended crosstalk. This finding proved that the viability of a quantum processor is determined by the precision with which individual physical components can be mapped into an abstract Hilbert space.

## State Initialization and Low-Entropy Resets {#initialization}

The second criterion necessitates the ability to initialize the qubits to a specific, high-fidelity fiducial state, typically represented as $|000... \rangle$. This is not merely a requirement for cooling the system to its thermal ground state but also for a deterministic reset mechanism that can be applied during active computation. Without reliable initialization, the probabilistic accumulation of errors would lead to an unmanageable increase in informational entropy, preventing the execution of meaningful logical sequences. This methodological choice established state preparation as a fundamental constraint on computational reliability.

## Coherence Times vs. Gate Speed {#decoherence}

The primary physical bottleneck identified in the research is decoherence, the process by which a quantum system loses its structural integrity due to environmental interaction. DiVincenzo established that the relevant decoherence time ($T_2$) must be significantly longer than the time required for individual gate operations, typically by a factor of $10^4$ to $10^5$. This ratio serves as the definitive figure of merit for any quantum hardware, as it determines whether the system can maintain coherence long enough to perform the parity checks required for active error correction.

## Universal Gate Sets and Logical Completeness {#universal-gates}

The fourth criterion requires the hardware to implement a universal set of quantum gates. This means the system must possess the capability to synthesize any arbitrary unitary transformation through a finite sequence of one- and two-qubit interactions. By demonstrating that most hardware candidates can be reduced to a standard set of operations—such as single-qubit rotations and CNOT gates—the researchers established quantum hardware as a general-purpose processor rather than a specialized device. This finding proved that computational universality is a structural property that must be engineered directly into the machine's control logic.

## High-Efficiency Readout and Localization {#measurement-readout}

The final computational requirement is a qubit-specific, high-efficiency measurement capability. The system must be able to read out the state of individual qubits at the end of a calculation with minimal error. Critically, this measurement must be localized such that identifying the state of one qubit does not destroy the coherence of neighboring qubits participating in the computation. This discovery revealed that the "observer effect" is a technical parameter that must be managed to allow for the parallelization and modularity required by large-scale architectures.

## Networking and Interconversion of Qubits {#networking}

For the integration of quantum systems into a global infrastructure, DiVincenzo introduced requirements for the interconversion and transmission of quantum states. This includes the ability to transform stationary qubits (used for processing, like trapped ions or superconducting loops) into flying qubits (typically photons) used for long-distance communication. This interconversion requires a coherent interface between matter and light, enabling the faithful transmission of entanglement across a network. This addition recognized that the future of quantum technology is likely a distributed one, establishing these criteria as the standard blueprint for the quantum internet.

## Resources

- [The Physical Implementation of Quantum Computation (Official DOI)](https://doi.org/10.1002/1521-3978(200009)48:9/11%3C771::AID-PROP771%3E3.0.CO;2-E) {type: docs, provider: Wiley}
- [DiVincenzo Criteria Original Paper (arXiv)](https://arxiv.org/abs/quant-ph/0002077) {type: docs, provider: arXiv}
- [Spinning Up in Quantum: DiVincenzo's Criteria (IBM)](https://learning.quantum.ibm.com/course/fundamentals-of-quantum-computing/hardware-and-the-divincenzo-criteria) {type: article, provider: IBM}
- [Qubit Platforms Comparison (Wikipedia)](https://en.wikipedia.org/wiki/Qubit#Physical_representation) {type: article, provider: Wikipedia}
