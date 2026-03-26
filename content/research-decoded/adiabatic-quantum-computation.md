---
title: "Adiabatic Quantum Computation"
authors: "Farhi et al. (2000)"
citation: "Farhi, E., Goldstone, J., Gutmann, S., & Sipser, M. (2000). Quantum computation by adiabatic evolution. arXiv preprint quant-ph/0001106."
link: "https://arxiv.org/abs/quant-ph/0001106"
slug: "adiabatic-quantum-computation"
heroImage: ""
---

# Adiabatic Quantum Computation

The proposal for quantum computation by adiabatic evolution arises from the need to solve combinatorial search problems, such as the satisfiability problem, by mapping logical constraints directly onto the physical properties of a quantum system. Rather than constructing a sequence of discrete unitary gates as in the standard circuit model, this approach frames computation as a continuous physical process. 

The motivation is to leverage the natural tendency of a quantum system to remain in its ground state if perturbed slowly enough, effectively allowing the laws of physics to navigate the state space toward a configuration that minimizes an energy function representing the problem's constraints.

## Hamiltonian Evolution and the Spectral Gap {#hamiltonian-evolution}

### Initial and Final States {#initial-final-states}

The mechanism relies on the adiabatic theorem, which governs the evolution of a system under a time-dependent Hamiltonian $H(t)$. The process begins with an initial Hamiltonian, $H_0$, chosen such that its ground state is easy to construct—typically a uniform superposition of all possible $2^n$ states, achieved by a sum of transverse field operators. 

The target is the problem Hamiltonian, $H_P$, which is constructed by summing individual terms for each clause of the problem. Each term in $H_P$ is diagonal in the computational basis and assigns a positive energy penalty to any state that violates its corresponding clause, ensuring that the global ground state of $H_P$ encodes the satisfying assignment. 

### Interpolation and Timing {#interpolation-timing}

The system is evolved by interpolating between the two: $H(s) = (1-s)H_0 + sH_P$, where $s$ varies from 0 to 1 over a total time $T$. The success of this evolution is strictly governed by the spectral gap, $g(s)$, which is the energy difference between the ground state and the first excited state. 

The adiabatic theorem dictates that the evolution time $T$ must be inversely proportional to the square of the minimum gap. If the gap becomes extremely small at any point during the interpolation—a phenomenon often associated with quantum phase transitions—the system is likely to jump into an excited state, failing to find the solution. 

### Complexity and Scaling {#complexity-scaling}

Consequently, the computational complexity of the algorithm is physically manifested as the scaling of this spectral gap with the number of qubits. This proved that the difficulty of an NP-complete problem is reflected in the fundamental energy landscape of the physical system used to solve it.

## A New Paradigm for Optimization {#optimization-paradigm}

### Mapping Logic to Physics {#logic-to-physics}

This work enabled a global shift in quantum research by introducing the paradigm of Adiabatic Quantum Computation (AQC). It moved the abstraction of quantum computing away from the quantum Turing machine or circuit-based logic and toward Hamiltonian engineering and condensed matter physics. 

By demonstrating that continuous-time evolution is equivalent to the gate model in terms of reach—a fact formally established by the Aharonov et al. (2004) proof of universality—it provided a framework for understanding quantum speedups through the lens of spectral properties and energy landscapes. 

### Legacy and Future Questions {#legacy-future}

This shift laid the theoretical foundation for quantum annealing and redirected significant research toward the study of many-body physics as a vehicle for solving hard optimization problems. This equivalence proved that AQC is not just a heuristic for search but a universal model of computation capable of simulating any quantum circuit. Whether the spectral gap remains large enough for practical problem sizes remains a central question for the scalability of adiabatic processors.

## Resources

- [Quantum Computation by Adiabatic Evolution](https://arxiv.org/abs/quant-ph/0001106) {type: article, provider: arXiv}
- [Quantum Adiabatic Algorithms of Strategy](https://arxiv.org/abs/1401.7081) {type: article, provider: arXiv}
