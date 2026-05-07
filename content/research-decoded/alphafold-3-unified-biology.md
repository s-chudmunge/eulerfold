---
title: "AlphaFold 3: Unified Biomolecular Prediction and the Generative Turn"
authors: "Josh Abramson, Jonas Adler, Jack Dunger, Richard Evans, Tim Green, Alexander Pritzel, Olaf Ronneberger, Will Song, John Jumper, Demis Hassabis, et al."
citation: "Nature 630, 493–500 (2024)"
link: "https://www.nature.com/articles/s41586-024-07487-w"
heroImage: "https://blog.google/static/blog/images/google-deepmind-alphafold-3.png"
slug: "alphafold-3-unified-biology"
---

AlphaFold 2 revolutionized structural biology by solving the protein-folding problem, yet it remained largely specialized to the geometry of amino acid chains. AlphaFold 3 (AF3) represents a fundamental architectural expansion, moving beyond proteins to predict the interactions of almost all life's molecules—including DNA, RNA, ligands, and ions—within a single, unified framework. By replacing the specialized geometric priors of its predecessor with a generalized generative diffusion process, AlphaFold 3 treats the entirety of the molecular complex as a system of interacting atoms rather than a collection of rigid residues.

## Beyond Proteins: A Unified Atomic View {#atomic-view}

The primary limitation of previous structural models was their reliance on "residue-gas" representations, where proteins were treated as chains of rigid bodies. While effective for backbones, this approach struggled with the flexible geometries of small molecules (ligands) and the distinct structural requirements of nucleic acids. AlphaFold 3 abandons this residue-centric logic in favor of a raw atomic coordinate system. Every biological entity, from a massive protein complex to a single Zinc ion, is represented as a set of tokens in 3D space. This universality allows the model to capture the cross-domain interactions that drive cellular life, such as how a transcription factor binds to a specific methylated DNA sequence or how a drug molecule docks into a pocket while coordinating with an metal ion cofactor.

## The Diffusion Revolution {#diffusion}

The most radical shift in AlphaFold 3 is the replacement of the Invariant Point Attention (IPA) module with a Diffusion Module. In AlphaFold 2, the model iteratively refined the position and orientation of rigid frames to build the structure. In contrast, AlphaFold 3 treats structure prediction as a generative denoising task. The process begins with a cloud of random "noise"—atoms scattered randomly in space—and utilizes a diffusion model to iteratively "denoise" their coordinates over 200 steps until they settle into the final, biologically functional configuration. This generative approach is more flexible than frame-based refinement, as it allows the model to learn the complex distributions of physical interactions directly from atomic data without being constrained by rigid-body assumptions.

## The Pairformer: Rethinking the Evolutionary Trunk {#pairformer}

To process the relationships between diverse molecular tokens, AlphaFold 3 introduces the Pairformer, an evolution of the previous Evoformer engine. The Pairformer maintains a dual representation system: a single representation for individual tokens and a massive $N \times N$ pair representation that encodes the potential distances and orientations between every token in the system. Unlike the Evoformer, which devoted significant computation to processing Multiple Sequence Alignments (MSA) within its main loop, the Pairformer offloads MSA processing to a separate, dedicated module. This design choice makes the model significantly more efficient, allowing it to spend more of its internal capacity reasoning about the 3D geometry and chemical compatibility of the entire molecular assembly.

## Modeling the Chemical Graph {#chemical-graph}

Biological function is often defined by the "exceptions" to standard sequences—covalent modifications like phosphorylation, glycosylation, or the chemical bonds between a ligand and its receptor. AlphaFold 3 handles these complexities by incorporating an explicit chemical graph into its input features. By defining the exact connectivity of atoms and their covalent bonds, the model can navigate the "landscape" of chemical possibilities, ensuring that its predicted structures respect the laws of physics and the specific connectivity of the provided molecules. This allows for the high-fidelity modeling of drug-target interactions, including the structural shifts that occur when a small molecule binds to a flexible protein pocket.

## Impact on Drug Discovery and Molecular Biology {#impact}

The ability to predict the interactions of proteins with DNA, RNA, and ligands in a single pass has profound implications for the future of drug discovery and synthetic biology. By providing a "whole-complex" view of molecular interactions, AlphaFold 3 enables researchers to see how mutations or modifications affect the entire biological circuit rather than just an isolated protein. As the field moves toward a more holistic understanding of the cell, the generative turn represented by AlphaFold 3 provides the computational substrate for simulating the dynamic and interconnected machinery of life at the atomic level.

## Resources {#resources}

- [Accurate structure prediction of biomolecular interactions with AlphaFold 3](https://www.nature.com/articles/s41586-024-07487-w) {type: article, provider: Nature}
- [AlphaFold 3: A New Era for Biology](https://blog.google/technology/ai/google-deepmind-alphafold-3-ai-model/) {type: article, provider: Google DeepMind}
- [AlphaFold 3 Technical Report](https://static.googleusercontent.com/media/deepmind.com/en//alphafold3-technical-report.pdf) {type: article, provider: Google DeepMind}
- [Introduction to AlphaFold 3](https://www.youtube.com/watch?v=R9K13R78e_c) {type: video, provider: YouTube}
