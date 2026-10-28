---
title: "ProteinMPNN: Neural Inverse Protein Folding"
authors: "Justas Dauparas, Ivan Anishchenko, David Baker et al. (Baker Lab, 2022)"
citation: "Dauparas, J., Anishchenko, I., Bennett, N., ... & Baker, D. (2022). Robust deep learning-based protein sequence design using ProteinMPNN. Science, 378(6615), 49-56."
link: "https://doi.org/10.1126/science.add2187"
slug: "proteinmpnn-de-novo-protein-sequence-design"
heroImage: "/images/research-decoded/proteinmpnn-de-novo-protein-sequence-design.png"
---

In 2022, researchers introduced ProteinMPNN, a deep learning tool designed for inverse protein folding: finding an amino acid sequence that reliably folds into a desired 3D backbone structure. Traditional methods relied on physics-based energy calculations (such as Rosetta) to sample side-chain rotamers via simulated annealing. These classical approaches were computationally slow, requiring minutes to hours per design, and frequently produced sequences that aggregated or misfolded in wet-lab experiments. ProteinMPNN reframed sequence design as a geometric graph prediction task, generating soluble, stable sequences in under one second on standard GPUs.

## The Inverse Folding Challenge {#problem-space}

While forward folding predicts 3D coordinates from a given sequence, protein engineering often requires the inverse: choosing a backbone geometry and designing an amino acid sequence that will adopt that shape. Physical energy functions model every inter-atomic interaction using force fields and rotamer libraries. Because the combinatorial space of amino acid sequences is astronomical ($20^L$ possible sequences for a protein of length $L$), physics-based sampling is computationally expensive and prone to getting trapped in local energy minima. Furthermore, slight inaccuracies in classical force fields often led to low experimental success rates in the laboratory.

## Geometric Graphs and Random-Order Autoregression {#mechanism}

![ProteinMPNN sequence decoding and structure masking architecture from arXiv HTML, showing the reverse generation of sequence tokens conditioned on 3D geometry.](https://arxiv.org/html/2312.02447v1/figures/pmpnn_diffusion_figure.png)

_ProteinMPNN sequence decoding and structure masking architecture from arXiv HTML, showing the reverse generation of sequence tokens conditioned on 3D geometry._

ProteinMPNN models protein backbones as geometric graphs processed through a Message Passing Neural Network (MPNN):
- **Graph Construction:** Each residue corresponds to a node connected to its $k=48$ nearest neighbors based on C-alpha Euclidean distances.
- **Node & Edge Invariance:** Node features encode local backbone torsion angles ($\phi, \psi, \omega$). Edges encode Euclidean-invariant geometric features, including pairwise distances between backbone atoms (N, CA, C, O) and unit vectors projected into local residue coordinate frames.
- **Randomized Decoding Order:** ProteinMPNN generates sequences autoregressively. Rather than decoding strictly from the N-terminus to the C-terminus (which introduces directional bias), the model shuffles the decoding order during training and inference. Each position attends to all previously decoded residues across the entire 3D graph, providing full bidirectional context.
- **Backbone Noise Injection:** During training, Gaussian noise ($\sigma \approx 0.2\text{ \AA}$) is added to backbone coordinates. This noise regularization prevents overfitting to crystalline structural artifacts, making the model tolerant to minor imperfections in de novo generated backbones.

The network is trained with cross-entropy loss over 20 natural amino acid classes using teacher forcing.

## Experimental Validation and Benchmarks {#benchmarks}

ProteinMPNN achieved 51.0% native sequence recovery on test benchmarks of monomeric and multimeric proteins, compared to 32.9% achieved by classical Rosetta packing protocols. It synthesizes a 100-residue sequence in under one second on a single GPU, running more than 200 times faster than Rosetta CPU routines.

In wet-lab experimental testing, crystal structures of de novo designed proteins matched their target backbones within 1.0 \AA\ RMSD. The designed proteins demonstrated monomeric solubility and exceptional thermal stability, maintaining their folded structures at temperatures exceeding 95 °C without requiring directed evolution cycles.

## Transforming Synthetic Biology {#legacy}

ProteinMPNN redefined protein sequence design from discrete physical energy minimization into continuous geometric representation learning. By providing a fast, reliable sequence design engine, it became the standard pairing partner for structural generation tools like RFdiffusion. It demonstrated that geometric neural networks can capture the delicate packing and electrostatic requirements of folded proteins, decoupling sequence design from slow physical simulations.

## Resources

- [Robust Deep Learning-Based Protein Sequence Design (Science)](https://doi.org/10.1126/science.add2187) {type: docs, provider: Science}
- [ProteinMPNN Official GitHub Repository](https://github.com/dauparas/ProteinMPNN) {type: code, provider: GitHub}
- [ProteinMPNN BioRxiv Preprint](https://doi.org/10.1101/2022.06.03.494563) {type: article, provider: BioRxiv}
