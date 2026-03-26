---
title: "The QAOA Algorithm"
authors: "Farhi et al. (2014)"
citation: "Farhi, E., Goldstone, J., & Gutmann, S. (2014). A quantum approximate optimization algorithm. arXiv preprint arXiv:1411.4028."
link: "https://arxiv.org/abs/1411.4028"
slug: "qaoa-quantum-approximate-optimization"
heroImage: ""
---

# The QAOA Algorithm

The 2014 introduction of the Quantum Approximate Optimization Algorithm (QAOA) by Farhi, Goldstone, and Gutmann provided a new bridge between the continuous evolution of adiabatic quantum computing and the discrete gate operations of the circuit model. While combinatorial optimization problems like Max-Cut have long been targets for quantum advantage, the existing models were often either too specialized for annealing hardware or too deep for early gate-based processors. QAOA was proposed to fill this gap by providing a flexible, "approximate" framework that can be executed on noisy hardware, offering a path to useful solutions even before the arrival of full fault tolerance.

## The Trotterized Variational Loop {#qaoa-mechanism}

### Cost and Mixer Hamiltonians

The mechanism of QAOA is based on the alternating application of two distinct Hamiltonians: the Cost Hamiltonian ($H_C$) and the Mixer Hamiltonian ($H_B$). The Cost Hamiltonian is constructed to encode the objective function of the optimization problem, where the ground state represents the optimal solution. The Mixer Hamiltonian, typically a sum of transverse field operators, is used to introduce quantum transitions between the different computational basis states. By alternating between these two operators, the algorithm allows the quantum state to "explore" the solution space, effectively tunneling through energy barriers that might trap classical optimization methods.

### The $p$ Parameter and Approximation

The algorithm is defined by a depth parameter $p$, which determines the number of times the alternating Hamiltonians are applied. Each layer of the circuit is controlled by two variational parameters, $\gamma$ and $\beta$, which determine the duration of the evolution under each Hamiltonian. Like the VQE, QAOA uses a classical optimizer to find the set of parameters that maximizes the expectation value of the cost function. A technical detail of this approach is that as $p$ approaches infinity, the algorithm is guaranteed to converge to the global optimum, effectively simulating an adiabatic evolution. However, for small values of $p$, the algorithm provides an "approximate" solution that can still exceed classical performance on specific graph-based problems.

## The Abstraction of Algorithmic Flexibility {#algorithmic-flexibility}

### Bridging Annealing and Gates

The global abstraction enabled by QAOA was the realization that optimization on a quantum computer can be treated as a flexible, variational process rather than a rigid physical evolution. It proved that the "depth" of a quantum circuit can be adjusted to match the coherence time of the hardware, allowing for a trade-off between the quality of the solution and the reliability of the execution. This shift moved the field away from the "all or nothing" approach to optimization, providing a framework for extracting value from the current generation of quantum devices.

### Combinatorial Advantage in the NISQ Era

This work redefined the scope of quantum advantage in logistics, finance, and logistics by demonstrating that "good enough" solutions are a valid target for quantum computing. QAOA provided the theoretical foundation for applying gate-based hardware to the same types of problems previously reserved for quantum annealers. However, the extent of the speedup for practical problems like the Traveling Salesperson remains a subject of intense debate, as it is unclear if small-depth QAOA can consistently outperform the best classical heuristics. The search for a "quantum advantage" in combinatorial optimization continues to drive the development of more sophisticated mixer Hamiltonians and optimization strategies.

## Resources

- [A Quantum Approximate Optimization Algorithm (arXiv)](https://arxiv.org/abs/1411.4028) {type: article, provider: arXiv}
- [QAOA for Combinatorial Optimization Problems](https://arxiv.org/abs/2206.00519) {type: article, provider: arXiv}
