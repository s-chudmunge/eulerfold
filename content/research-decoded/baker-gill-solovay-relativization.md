---
title: "Baker, Gill, Solovay: Relativization"
authors: "Baker, Gill, Solovay (1975)"
citation: "Baker, T., Gill, J., & Solovay, R. (1975). Relativizations of the P=?NP question. SIAM Journal on Computing, 4(4), 431-442."
link: "https://epubs.siam.org/doi/10.1137/0204037"
slug: "baker-gill-solovay-relativization"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/P_np_np-complete_np-hard.svg/500px-P_np_np-complete_np-hard.svg.png"
---

# Baker, Gill, Solovay: Relativization

In 1975, Theodore Baker, John Gill, and Robert Solovay published 'Relativizations of the P=?NP Question,' a paper that fundamentally changed how computer scientists approach the most famous open problem in the field. By demonstrating that the P vs NP question can have different answers depending on the external information available to the machines, the authors proved that the standard mathematical tools of the time were insufficient for a resolution. Their work established the first major 'barrier' in complexity theory, revealing that the difficulty of separating P and NP lies deeper than simple diagonal arguments.

## Oracles and Conflicting Realities {#oracles-conflicting}

The primary technical contribution of Baker, Gill, and Solovay was the construction of specific 'oracles'—external data sources that a Turing machine can consult in a single step—to show that the relationship between $P$ and $NP$ is not fixed under relativization. They proved the existence of an oracle $A$ and an oracle $B$ such that the following conflicting statements hold:

$$\displaystyle P^A = NP^A \quad \text{and} \quad P^B \neq NP^B$$

This finding revealed that the $P$ vs $NP$ question is 'relativization-dependent,' meaning its answer changes when the computational model is extended with an external resource. This proved that any proof technique that remains valid under an oracle (a 'relativizing' technique) is fundamentally incapable of resolving the question in the non-relativized case.

## The Diagonalization Barrier {#diagonalization-barrier}

The technical significance of this result lies in its identification of the 'Diagonalization Barrier.' Before 1975, most proofs in complexity theory relied on diagonalization—a technique used by Georg Cantor to show that real numbers are uncountable and by Alan Turing to prove the Halting Problem is undecidable. Because diagonalization techniques 'relativize'—meaning they remain valid regardless of any oracle provided to the machine—BGS proved that no such technique could ever resolve P vs NP. This insight forced the community to realize that any successful proof must exploit properties of computation that do not relativize, effectively rendering the most powerful tool in the mathematician's arsenal useless for this specific problem.

## The Limits of Formal Logic {#relativization-limits}

Baker, Gill, and Solovay's work demonstrated that the internal logic of formal systems can be consistent with multiple, contradictory computational realities. The engineering choice to study machines with oracles proved that the P vs NP question is fundamentally different from previous challenges in logic and set theory. It suggested that progress in understanding complexity requires the discovery of 'non-relativizing' properties—characteristics of real-world circuits and algorithms that disappear when an oracle is introduced. This realization remains the primary guiding principle for researchers seeking to move beyond the structural barriers that have stalled the field for decades.

## Resources

- [Baker, Gill, Solovay Original Paper](https://epubs.siam.org/doi/10.1137/0204037) {type: article, provider: SIAM}
- [Relativization in Complexity Theory (Wikipedia)](https://en.wikipedia.org/wiki/Relativization) {type: article, provider: Wikipedia}
