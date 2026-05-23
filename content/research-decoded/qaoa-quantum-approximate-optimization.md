---
title: "QAOA: Optimization Algorithm"
authors: "Edward Farhi, Jeffrey Goldstone, & Sam Gutmann (2014)"
citation: "Farhi, E., Goldstone, J., & Gutmann, S. (2014). A quantum approximate optimization algorithm. arXiv preprint arXiv:1411.4028."
link: "https://arxiv.org/abs/1411.4028"
slug: "qaoa-quantum-approximate-optimization"
heroImage: null
---

In 2014, Edward Farhi, Jeffrey Goldstone, and Sam Gutmann introduced the Quantum Approximate Optimization Algorithm (QAOA), a hybrid quantum-classical framework designed to identify near-optimal solutions to combinatorial problems. This approach addresses the decoherence constraints of gate-based hardware by discretizing continuous adiabatic evolution into a sequence of shallow unitary layers. The researchers demonstrated that by alternating between a cost-based Hamiltonian and a mixer Hamiltonian, a system can explore the solution space of NP-hard problems—such as Max-Cut—using variational parameters optimized by a classical computer, providing a path to quantum utility in the NISQ era.

## Alternating Operator Sequences and Variational Control {#qaoa-mechanism}

The primary technical mechanism of QAOA is the Trotterized approximation of adiabatic evolution through the alternating application of two non-commuting operators. The first, the Cost Hamiltonian ($H_C$), encodes the objective function of the optimization problem, where the phase shifts applied to each basis state are proportional to their respective costs. The second, the Mixer Hamiltonian ($H_B$), is typically a sum of transverse field operators that induce transitions between different computational basis states. For a fixed depth $p$, the algorithm executes the unitary transformation $|\vec{\gamma}, \vec{\beta}\rangle = \prod_{i=1}^p e^{-i \beta_i H_B} e^{-i \gamma_i H_C} |s\rangle$, where $|s\rangle$ is an initial uniform superposition. This methodological choice proved that the "depth" of a quantum optimization can be adjusted to match the coherence limits of the hardware, trading solution quality for execution reliability.

## Classical Parameter Optimization and Approximation Ratio {#approximation}

Similar to the Variational Quantum Eigensolver (VQE), QAOA relies on a classical optimization loop to identify the optimal values for the variational parameters $\vec{\gamma}$ and $\vec{\beta}$. The quantum processor is utilized to measure the expectation value of the cost function $F_p(\vec{\gamma}, \vec{\beta}) = \langle \vec{\gamma}, \vec{\beta} | H_C | \vec{\gamma}, \vec{\beta} \rangle$, which is then maximized using classical gradient-based or heuristic methods. A critical technical detail established by the researchers is that as $p$ approaches infinity, the algorithm is guaranteed to converge to the global optimum, effectively simulating an ideal adiabatic process. For small values of $p$, the algorithm provides an "approximate" solution characterized by an approximation ratio—the ratio of the expected outcome to the true maximum—that can be analytically bounded for specific graph-based problems.

## Bridging Adiabatic Evolution and the Circuit Model {#flexibility}

The technical significance of QAOA lies in its role as a bridge between the continuous-time evolution of quantum annealing and the discrete logic of the gate-based model. By reframing optimization as a variational circuit task, the researchers enabled the application of general-purpose quantum processors to the same categories of logistical and financial problems previously reserved for specialized annealing hardware. This finding revealed that the distinction between "annealing" and "circuit" computation is primarily a function of how the system’s Hamiltonian is sampled and controlled. It established a unified framework for evaluating quantum advantage across diverse optimization landscapes.

## Impact on Combinatorial Optimization and Search {#applications}

The practical significance of QAOA is evidenced by its application to a wide range of combinatorial challenges, including the Traveling Salesperson Problem, graph coloring, and portfolio optimization. By providing a scalable method for navigating rugged energy landscapes, the algorithm enables the identification of high-quality solutions that are robust to local minima. This application proved that the scalability of quantum optimization is determined by the adoption of architectures that prioritize structural flexibility over rigid algorithmic prescriptions. It digitalized the act of heuristic search, replacing the manual design of search rules with an automated, differentiable process of quantum state refinement.

## Optimization Topography and Gradient Barriers {#significance}

The success of QAOA demonstrated that the primary constraint on quantum optimization is the topology of the variational landscape. The decision to utilize classical optimizers revealed that the bottleneck in scaling variational systems is the potential for "barren plateaus" and the high cost of calculating expectation values in high-dimensional spaces. This principle remains the central theme in current research into parameter initialization and the design of more sophisticated mixer Hamiltonians that can exploit specific problem symmetries. It leaves open the question of whether low-depth QAOA can consistently outperform the most advanced classical heuristics for industrially relevant problem sizes.

## Resources

- [A Quantum Approximate Optimization Algorithm (Official arXiv)](https://arxiv.org/abs/1411.4028) {type: article, provider: arXiv}
- [QAOA for Combinatorial Optimization (arXiv Survey)](https://arxiv.org/abs/2206.00519) {type: article, provider: arXiv}
- [QAOA on Qiskit (IBM)](https://docs.quantum.ibm.com/api/qiskit/qiskit.algorithms.minimum_eigensolvers.QAOA) {type: docs, provider: IBM}
- [Introduction to QAOA (Video)](https://www.youtube.com/watch?v=AOKM9BkweVU) {type: video, provider: PennyLane}
