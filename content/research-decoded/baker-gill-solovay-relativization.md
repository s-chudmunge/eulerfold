---
title: "Baker, Gill, Solovay: Relativization"
authors: "Baker, Gill, Solovay (1975)"
citation: "Baker, T., Gill, J., & Solovay, R. (1975). Relativizations of the P=?NP question. SIAM Journal on Computing, 4(4), 431-442."
link: "https://doi.org/10.1137/0204037"
slug: "baker-gill-solovay-relativization"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/P_np_np-complete_np-hard.svg/500px-P_np_np-complete_np-hard.svg.png"
---

In 1975, Theodore Baker, John Gill, and Robert Solovay established that the P vs NP question cannot be resolved using standard proof techniques that remain valid under relativization. By constructing specific computational environments termed oracles, the researchers proved that the relationship between deterministic and non-deterministic polynomial time can shift depending on the external information provided to the machine. This finding identified the relativization barrier, demonstrating that any successful resolution of the P vs NP problem must exploit properties of computation that are not preserved when machines are augmented with an external data source.

## Relativized Computation and Conflicting Oracles {#oracles-conflicting}

The primary technical contribution of the paper is the demonstration that the P vs NP question has different answers in different relativized worlds. The researchers proved the existence of an oracle $A$ such that $P^A = NP^A$, indicating a collapse of the complexity hierarchy, and an oracle $B$ such that $P^B \neq NP^B$, indicating a separation. This duality proved that the internal logic of formal complexity models is consistent with both a collapse and a separation of the classes. It demonstrated that the fundamental difficulty of the problem is not a simple logical contradiction but is instead a result of the model's independence from the most common techniques used in mathematical logic.

## The Diagonalization Barrier and Technique Limits {#diagonalization-barrier}

The identification of this conflict established a rigorous bound on the power of diagonalization, a technique historically used to resolve the Halting Problem and Cantor’s uncountability proofs. Because diagonalization arguments typically relativize—meaning their conclusions remain true regardless of the presence of an oracle—Baker, Gill, and Solovay proved that no such argument could ever distinguish between P and NP. This insight forced a realignment in the field of complexity theory, shifting the focus from structural logic to the search for non-relativizing properties of circuits and algorithms. It effectively rendered the primary tool of 20th-century logic insufficient for the most significant problem in computer science.

## Theoretical Independence and Logical Constraints {#relativization-limits}

The methodological choice to study machines with oracles revealed that the P vs NP question is fundamentally different from previous challenges in set theory and recursive function theory. The researchers demonstrated that the properties of "real-world" computation—where machines operate on raw strings without external aids—are not captured by arguments that remain robust across all possible information sources. This finding established that computational complexity is governed by specific, localized constraints that disappear when the model is extended. This realization remains the central theme for researchers seeking to bypass the structural barriers that have prevented a definitive proof for over half a century.

## Complexity as a Non-Relativizing Property {#barrier-implications}

The success of this work provided the formal justification for the existence of "barriers" in mathematics, where specific classes of problems are proven to be immune to specific classes of proofs. By demonstrating that the relationship between P and NP is sensitive to the computational environment, the paper established a benchmark for evaluating the potential success of any new proof candidate. This realization led to the subsequent identification of other barriers, such as natural proofs and algebraic relativization, suggesting that the path to resolving fundamental complexity questions requires the discovery of new, deeply structural insights into the nature of information processing.

## Resources

- [Relativizations of the P=?NP Question (Official DOI)](https://doi.org/10.1137/0204037) {type: docs, provider: SIAM}
- [Relativization in Complexity (Wikipedia)](https://en.wikipedia.org/wiki/Relativization) {type: article, provider: Wikipedia}
- [The P vs NP Problem (Clay Mathematics Institute)](https://www.claymath.org/millennium-problems/p-vs-np-problem) {type: article, provider: Clay Institute}
