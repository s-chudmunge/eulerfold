---
title: "Mapping Every Molecule in the Human Body"
authors: "Josh Abramson et al. (Google DeepMind, 2024)"
citation: "Abramson, J., et al. (2024). Accurate structure prediction of biomolecular interactions with AlphaFold 3. Nature, 630(8016), 493-500."
link: "https://www.nature.com/articles/s41586-024-07487-w"
slug: "alphafold-3-unified-biology"
heroImage: "https://blog.google/static/blog/images/google-deepmind-alphafold-3.png"
---

In 2024, researchers at Google DeepMind introduced AlphaFold 3, a model that expands the scope of biomolecular prediction from single protein chains to the entire ecosystem of cellular molecules. While its predecessor was specialized to the geometry of amino acids, AlphaFold 3 utilizes a generative diffusion process to predict the interactions between proteins, DNA, RNA, ligands, and ions within a single, unified architecture. The researchers demonstrated that by treating the entirety of a molecular complex as a system of interacting atoms rather than a collection of rigid residues, a machine can capture the cross-domain interactions that drive life, effectively digitalizing the simulation of the biological machinery at the atomic scale.

## The Shift to a Unified Atomic Coordinate System {#atomic-view}

The primary architectural shift in AlphaFold 3 is the abandonment of residue-centric "frames" in favor of a raw atomic coordinate system. Every biological entity, from a massive protein complex to a single Zinc ion, is represented as a set of tokens in three-dimensional space. This universality allows the model to process the flexible geometries of small molecules (ligands) and the distinct structural requirements of nucleic acids which had been a limitation of previous frame-based models. This methodological choice proved that the "grammar" of biological function is not restricted to specific polymers, but is a fundamental consequence of how diverse atoms coordinate their positions within a shared physical manifold.

## Structure Prediction as a Generative Denoising Task {#diffusion}

AlphaFold 3 replaces the Invariant Point Attention (IPA) module of its predecessor with a Diffusion Module. Instead of iteratively refining the position and orientation of rigid backbones, the model treats structure prediction as a generative task. The process begins with a cloud of random "noise"—atoms scattered randomly in space—and utilizes a diffusion model to iteratively "denoise" their coordinates over 200 steps until they settle into the final, biologically functional configuration. This generative approach is more flexible than frame-based refinement, as it allows the model to learn the complex distributions of physical interactions directly from atomic data without being constrained by rigid-body assumptions. This finding established that the most robust way to model physical reality is to allow the system to navigate the probabilistic landscape of atomic configurations.

## The Pairformer and Evolutionary De-emphasis {#pairformer}

To process the relationships between diverse molecular tokens, AlphaFold 3 introduces the Pairformer, an evolution of the previous Evoformer engine. The Pairformer maintains a dual representation system: a single representation for individual tokens and a massive $N \times N$ pair representation that encodes the potential distances and orientations between every atom in the system. Unlike the Evoformer, which devoted significant computation to processing Multiple Sequence Alignments (MSA) within its main loop, the Pairformer offloads MSA processing to a separate, dedicated module. This design choice makes the model significantly more efficient, allowing it to spend more of its internal capacity reasoning about the 3D geometry and chemical compatibility of the entire molecular assembly rather than the statistical history of the sequence.

## Modeling the Chemical Graph and Post-Translational Modification {#chemical-graph}

Biological function is often defined by "exceptions" to standard sequences, such as covalent modifications like phosphorylation or the specific chemical bonds between a drug molecule and its target. AlphaFold 3 handles these complexities by incorporating an explicit chemical graph into its input features. By defining the exact connectivity of atoms and their covalent bonds, the model ensures that its predicted structures respect the laws of physics and the specific connectivity of the provided molecules. This allows for the high-fidelity modeling of drug-target interactions, including the structural shifts that occur when a small molecule binds to a flexible protein pocket. This finding demonstrated that a model’s performance scales when it can ground its geometric predictions in the deterministic reality of chemical connectivity.

## Impact on Drug Discovery and Synthetic Biology {#legacy}

The ability to predict the interactions of proteins with DNA, RNA, and ligands in a single pass has profound implications for the future of drug discovery and synthetic biology. By providing a "whole-complex" view of molecular interactions, AlphaFold 3 enables researchers to see how mutations or modifications affect the entire biological circuit rather than just an isolated protein. This application established the model as a foundational tool for the design of novel therapeutics and the understanding of cellular regulation. The work transformed structural biology into a unified computational discipline, proving that the complexity of life can be captured through the systematic management of atomic entropy and the reduction of spatial uncertainty.

## Resources

- [AlphaFold 3 Nature Paper (Official)](https://www.nature.com/articles/s41586-024-07487-w) {type: docs, provider: Nature}
- [AlphaFold 3 Technical Report (Google DeepMind)](https://static.googleusercontent.com/media/deepmind.com/en//alphafold3-technical-report.pdf) {type: docs, provider: Google DeepMind}
- [AlphaFold Server: Interactive Prediction](https://alphafoldserver.com/) {type: tool, provider: Google DeepMind}
- [AlphaFold 3: A New Era for Biology (Blog)](https://blog.google/technology/ai/google-deepmind-alphafold-3-ai-model/) {type: article, provider: Google}
