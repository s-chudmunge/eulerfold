---
title: "Cirac & Zoller: Ion Trap (1995)"
authors: "J. I. Cirac and P. Zoller (1995)"
citation: "Cirac, J. I., & Zoller, P. (1995). Quantum computations with cold trapped ions. Physical review letters, 74(20), 4091."
link: "https://arxiv.org/abs/quant-ph/9503016"
slug: "cirac-zoller-ion-trap"
---

# Quantum Computations with Cold Trapped Ions

The physical realization of a quantum computer requires a system with long-lived qubits and a controllable mechanism for performing multi-qubit gates. In their 1995 paper, J. I. Cirac and P. Zoller proposed using a string of cold, trapped ions as a scalable platform for quantum computing.

In this architecture, each ion acts as a qubit. The states $|0\rangle$ and $|1\rangle$ are represented by the internal electronic energy levels of the ion. These electronic states are highly stable, offering exceptionally long coherence times.

## Vibrations as a Quantum Data Bus {#vibrational-bus}

The primary challenge is how to make these distant ions interact with one another. Cirac and Zoller's key insight was to use the ions' collective motion as a shared data bus.

Because the ions are confined in a trap and repel one another via their electric charges, they form a crystal-like string. The vibrations of this entire string are quantized, meaning they can be thought of as particles of motion called phonons.

By using laser cooling to reach the motional ground state ($|n=0\rangle$), a single phonon can be used to carry information between any two ions in the trap.

## The CNOT Gate Mechanism {#cnot-mechanism}

The paper describes a multi-step sequence to perform a Controlled-NOT (CNOT) gate between a control ion and a target ion.

First, the internal state of the control ion is mapped onto the vibrational mode of the entire string using a laser pulse. If the control ion is in the state $|1\rangle$, it emits a phonon into the shared bus ($|n=1\rangle$).

Next, the target ion undergoes a phase transformation only if it detects the presence of this shared phonon. This is done with a specific laser pulse on the target ion's "red sideband." If a phonon is present, it temporarily excites the target ion to an auxiliary state, inducing a phase shift of $-1$.

Finally, the vibrational mode is mapped back onto the control ion, completing the gate and leaving the motional state back in the ground state.

## Scalability and the DiVincenzo Criteria {#scalability}

Beyond the technical gate construction, Cirac and Zoller's work provided the first concrete physical roadmap for building a quantum processor. It showed that the very forces that bind matter together—the Coulomb interaction and the quantization of motion—could be used as the wires of a quantum computer.

This approach became a leading candidate for quantum hardware because it offered a clear path toward the five "DiVincenzo criteria" for a practical quantum computer. This includes well-defined qubits, long coherence times, and a universal set of gates.

## Resources

- [Cirac & Zoller Ion Trap Paper](https://arxiv.org/abs/quant-ph/9503016) {type: article, provider: arXiv}
- [Trapped Ion Quantum Computing Overview](https://pml.nist.gov/ion-trap-computing/) {type: article, provider: NIST}
