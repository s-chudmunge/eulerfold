---
title: "The DiVincenzo Criteria"
authors: "David P. DiVincenzo (2000)"
citation: "DiVincenzo, D. P. (2000). The physical implementation of quantum computation. Fortschritte der Physik: Progress of Physics, 48(9‐11), 771-783."
link: "https://arxiv.org/abs/quant-ph/0002077"
slug: "divincenzo-criteria"
heroImage: ""
---

# The DiVincenzo Criteria

The publication of David DiVincenzo’s 'The Physical Implementation of Quantum Computation' in 2000 addressed a critical divergence between quantum complexity theory and experimental physics. At the time, the field possessed robust algorithms, such as Shor’s and Grover’s, but lacked a unified framework to evaluate the disparate physical systems—ranging from ion traps and NMR to superconducting circuits—vying for implementation. 

The paper was necessary to transform quantum computing from an abstract mathematical promise into a concrete engineering challenge by establishing a rigorous set of benchmarks that any candidate system must satisfy to be considered a viable computer.

## Hardware Foundations {#hardware-foundations}

### Qubit Characterization {#qubit-characterization}

The first step in building a quantum computer is the creation of a scalable array of well-characterized qubits. This requirement moves beyond a simple two-state system to demand a deep understanding of the energy levels and the internal Hamiltonian that defines the Hilbert space. Researchers must precisely know the couplings between qubits to ensure that operations can be controlled without unintended crosstalk.

### State Initialization {#initialization}

Beyond characterization, the system requires the ability to initialize these qubits to a simple fiducial state, such as $|000... \rangle$, to ensure low-entropy starting conditions. This is not merely a matter of cooling the system to its ground state, but a requirement for a deterministic reset mechanism that can be invoked at any point during a computation. Without reliable initialization, the probabilistic nature of quantum states would quickly lead to an unmanageable accumulation of noise.

## Stability and Control {#stability-control}

### Decoherence Times {#decoherence}

The primary physical bottleneck for any quantum processor is decoherence. DiVincenzo established that a system must maintain relevant decoherence times significantly longer than the gate operation time, typically by a factor of $10^4$ to $10^5$. This ratio is the fundamental figure of merit for any quantum hardware, as it determines whether the system can survive long enough to perform the parity checks required by quantum error correction.

### Universal Gate Sets {#universal-gates}

Once stability is achieved, the hardware must be capable of implementing a universal set of quantum gates. This means the system must be able to synthesize any unitary transformation through a sequence of one- and two-qubit interactions. This requirement ensures that the hardware is a general-purpose processor, rather than a specialized device limited to a single class of problems.

## Readout and Communication {#readout-comm}

### Localized Measurement {#measurement-readout}

The final computational criterion is the requirement for a qubit-specific, high-efficiency measurement capability. The system must be able to read out the state of individual qubits with high fidelity at the end of a calculation. Critically, this measurement must be localized; it should provide information about the target qubit without destroying the quantum coherence of neighboring qubits that might still be participating in the computation.

### Flying Qubits and Networking {#networking}

For networking and communication, DiVincenzo added criteria to interconvert stationary qubits, used for processing, and flying qubits, typically photons, used for transmission. This interconversion requires a coherent interface between matter and light. 

Furthermore, the system must have the ability to faithfully transmit these flying qubits between distant locations. This addition recognized that the future of quantum technology would likely involve distributed systems where entanglement is shared across a network, establishing these criteria as the standard architectural blueprint for the quantum information era.

## Resources

- [The Physical Implementation of Quantum Computation](https://arxiv.org/abs/quant-ph/0002077) {type: article, provider: arXiv}
- [IBM: The DiVincenzo Criteria](https://research.ibm.com/blog/divincenzo-criteria) {type: article, provider: IBM Research}
