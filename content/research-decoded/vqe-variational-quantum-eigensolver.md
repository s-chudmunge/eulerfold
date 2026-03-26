---
title: "The VQE Algorithm"
authors: "Peruzzo et al. (2013)"
citation: "Peruzzo, A., McClean, J., Shadbolt, P., Yung, M. H., Zhou, X. Q., Love, P. J., ... & O'Brien, J. L. (2014). A variational eigenvalue solver on a photonic quantum processor. Nature Communications, 5(1), 4213."
link: "https://arxiv.org/abs/1304.3061"
slug: "vqe-variational-quantum-eigensolver"
heroImage: "https://ar5iv.labs.arxiv.org/html/1304.3061/assets/x1.png"
---

# The VQE Algorithm

The 2013 proposal of the Variational Quantum Eigensolver (VQE) by Peruzzo and colleagues at the University of Bristol introduced a definitive shift in the strategy for applying quantum computers to chemistry and materials science. Before this work, the primary method for finding the ground state energy of a molecule was the Quantum Phase Estimation algorithm. While theoretically powerful, Phase Estimation requires coherent evolution times that far exceed the capabilities of the Noisy Intermediate-Scale Quantum (NISQ) hardware currently available. The VQE addressed this bottleneck by introducing a hybrid quantum-classical architecture that offloads the most demanding parts of the calculation to a classical optimizer, allowing the quantum processor to function as a specialized co-processor.

## The Hybrid Variational Loop {#variational-loop}

### The Parameterized Ansatz

The mechanism of VQE is built around a hybrid feedback loop between a quantum device and a classical computer. The process begins with the preparation of a "trial" quantum state on the hardware, known as an ansatz. This state is defined by a set of adjustable parameters that control the rotations and entangling gates within the quantum circuit. The choice of ansatz is critical, as it must be flexible enough to explore the relevant portion of the Hilbert space while being simple enough to execute on noisy hardware. It effectively acts as a "guess" at the true wavefunction of the system being studied.

### Minimization and Measurement

Once the state is prepared, the quantum processor is used to measure the expectation value of the system's Hamiltonian—the energy of the current state. Because a Hamiltonian can be decomposed into a sum of Pauli strings, these measurements can be performed individually and combined classically. The measured energy is then passed to a classical optimization algorithm, which updates the parameters of the quantum circuit to lower the energy in the next iteration. This process follows the variational principle of quantum mechanics, which guarantees that the measured expectation value is always greater than or equal to the true ground state energy. By iteratively adjusting the parameters, the loop converges toward the most stable configuration of the molecule.

## The Paradigm of NISQ Utility {#nisq-utility}

### Hybrid Quantum-Classical Computing

The global abstraction enabled by VQE was the establishment of the hybrid quantum-classical paradigm as the primary vehicle for near-term quantum advantage. It proved that quantum computers do not need to be fully fault-tolerant to perform meaningful scientific calculations. By utilizing the quantum device for the state preparation and measurement—tasks that are exponentially difficult for classical computers—and using classical hardware for the optimization, VQE maximizes the utility of limited quantum resources. This shift turned the "noise" of the NISQ era from an insurmountable barrier into a constraint that can be managed through algorithmic design.

### Algorithmic Flexibility and Chemistry

This realization transformed the field of quantum chemistry, moving it from the study of abstract models toward the simulation of real molecular systems. VQE provided a framework for exploring the electronic structure of molecules like $H_2$ and $HeH^+$ on early photonic and superconducting hardware. It suggested that the first practical use of a quantum computer might be as a specialized tool for calculating the fundamental properties of matter. However, the scalability of the VQE—specifically the challenge of optimizing thousands of parameters in a rugged energy landscape—remains an open question for the future of the field.

## Resources

- [A Variational Eigenvalue Solver (arXiv)](https://arxiv.org/abs/1304.3061) {type: article, provider: arXiv}
- [The Theory of Variational Quantum Algorithms](https://arxiv.org/abs/2012.09265) {type: article, provider: arXiv}
