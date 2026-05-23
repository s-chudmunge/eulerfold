---
title: "How IBM and Google Build Their Qubits"
authors: "Jens Koch et al. (Yale University, 2007)"
citation: "Koch, J., Yu, T. M., Gambetta, J., Houck, A. A., Schuster, D. I., Majer, J., ... & Schoelkopf, R. J. (2007). Charge-insensitive qubit design derived from the Cooper pair box. Physical Review A, 76(4), 042319."
link: "https://arxiv.org/abs/cond-mat/0703002"
slug: "superconducting-qubits-transmon"
heroImage: "https://ar5iv.labs.arxiv.org/html/cond-mat/0703002/assets/x1.png"
---

In 2007, researchers at Yale University introduced the transmon qubit, a superconducting circuit designed to eliminate the sensitivity of quantum information to fluctuating offset charges. This architecture addressed a fundamental bottleneck in the development of solid-state quantum processors: the rapid dephasing of the Cooper pair box due to atmospheric and technical noise. The researchers demonstrated that by shunting a Josephson junction with a large external capacitance, a system can be moved into a regime where the qubit transition frequency is exponentially insensitive to the local electrostatic environment.

## Scaling of Josephson and Charging Energies {#charge-insensitivity}

![Effective circuit diagram of the transmon qubit illustrating the shunting capacitance and the Josephson junction arrangement.](https://ar5iv.labs.arxiv.org/html/cond-mat/0703002/assets/x1.png)

_Effective circuit diagram of the transmon qubit illustrating the shunting capacitance and the Josephson junction arrangement._

The primary technical innovation of the transmon is the systematic increase in the ratio of Josephson energy ($E_J$) to charging energy ($E_C$). In standard Cooper pair boxes, this ratio is near unity, making the energy levels highly dependent on the number of Cooper pairs on the island. By increasing $E_J/E_C$ to values exceeding 100, the transmon enters a plasma oscillation regime. The researchers proved that in this regime, the charge dispersion—the variation in transition frequency due to background charge—decreases exponentially as $e^{-\sqrt{8E_J/E_C}}$. This methodological choice allowed for the achievement of long coherence times without the requirement for precise, real-time tuning of individual gate charges.

## Anharmonicity and Control Selectivity {#anharmonicity}

A critical requirement for any artificial atom is anharmonicity, which ensures that the energy spacing between the $|0\rangle$ and $|1\rangle$ states is distinct from the spacing of higher-level transitions. While the shunting capacitance reduces charge sensitivity, it also reduces the system's non-linearity. Koch et al. proved that while charge dispersion scales down exponentially, the anharmonicity only decreases according to a weak power law. This disparity allows the transmon to maintain enough non-linearity for selective control via microwave pulses while enjoying an exponential gain in coherence. This finding demonstrated that the most effective way to protect a quantum state is to engineer a Hamiltonian that is inherently robust to the dominant local noise sources.

## Circuit Quantum Electrodynamics (cQED) Integration {#cqed}

The transmon was specifically designed for integration into the Circuit Quantum Electrodynamics (cQED) framework, where qubits are coupled to superconducting microwave resonators. The large capacitance of the transmon facilitates a strong coupling to the resonator's electric field, enabling high-fidelity state preparation and readout. This synergy between the qubit and the resonator acts as a hardware filter, isolating the logical information from the noise of the external control electronics. This finding revealed that the reliability of a quantum system is a function of the coordination between the storage component and the communication interface.

## Transition to Industrial Hardware Standards {#industry-standard}

The practical significance of the transmon is evidenced by its adoption as the primary architectural unit for leading quantum computing efforts, including those of IBM, Google, and Rigetti. By providing a qubit that is stable, repeatable, and easily fabricated using standard lithographic techniques, the research enabled the move from single-device physics experiments to the development of multi-qubit processors. The success of this design established the principle that fault-tolerance begins with the hardware-level suppression of the most pervasive error channels. It digitalized the management of coherence, replacing manual environmental isolation with structural circuit design.

## Hamiltonian Engineering and Future Protection {#significance}

The achievement of Jens Koch and his colleagues demonstrated that the properties of an artificial quantum system can be precisely tailored through the arrangement of macroscopic circuit elements. The decision to prioritize charge insensitivity revealed that the primary constraint on superconducting intelligence was the mathematical volatility of the qubit frequency. This principle remains the central theme in the development of next-generation designs, including the fluxonium and 0-$\pi$ qubits, which seek to implement similar protection against both charge and flux noise. It leaves open the question of whether there exist fundamental limits to these "protected" architectures as they are scaled to millions of nodes.

## Resources

- [Charge-Insensitive Qubit Design (Official DOI)](https://doi.org/10.1103/PhysRevA.76.042319) {type: docs, provider: APS}
- [Transmon Paper (arXiv)](https://arxiv.org/abs/cond-mat/0703002) {type: docs, provider: arXiv}
- [Engineering Superconducting Qubits (arXiv Survey)](https://arxiv.org/abs/1904.06560) {type: article, provider: arXiv}
- [Introduction to Superconducting Qubits (Video)](https://www.youtube.com/watch?v=kY31Wn3-yT0) {type: video, provider: Qiskit}
