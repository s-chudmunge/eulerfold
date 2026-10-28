---
title: "ESM-2: Language Models for Atomic Protein Structure"
authors: "Zeming Lin, Halil Akin, Roshan Rao, Alexander Rives et al. (Meta AI, 2023)"
citation: "Lin, Z., Akin, H., Rao, R., ... & Rives, A. (2023). Evolutionary-scale prediction of atomic-level protein structure with a language model. Science, 379(6637), 1123-1130."
link: "https://doi.org/10.1126/science.ade2574"
slug: "esm2-evolutionary-scale-protein-language-model"
heroImage: "/images/research-decoded/esm2-evolutionary-scale-protein-language-model.png"
---

In 2023, researchers at Meta AI introduced ESM-2 and ESMFold, proving that large language models trained purely on individual protein sequences can predict 3D atomic structures without relying on explicit Multiple Sequence Alignments (MSAs). While AlphaFold 2 transformed structural biology, its dependency on searching genetic databases to build MSAs introduced a significant computational bottleneck. ESM-2 showed that unsupervised masked language modeling across hundreds of millions of evolutionary sequences forces neural networks to internalize physical contacts, 3D coordinates, and functional properties within their internal attention maps.

## Eliminating the Multiple Sequence Alignment Bottleneck {#problem-space}

Traditional structure prediction methods rely on comparing a target protein against millions of related sequences in genetic databases. This homology search step requires minutes to hours of compute time per sequence and fails when analyzing orphan proteins, fast-evolving pathogens, or designed proteins that lack known evolutionary relatives. The Meta AI team explored whether a language model could distill evolutionary patterns directly into its parameter weights, allowing a single neural network pass to infer structural coordinates directly from an individual sequence.

## Scaled Language Modeling and Rotary Embeddings {#architecture}

ESM-2 is a Transformer masked language model scaled up to 15 billion parameters across 48 layers. Key technical elements include:
- **Masked Token Pre-Training:** Trained on 65 million distinct protein sequences from the UniRef50 database. During pre-training, 15% of amino acid tokens are masked or replaced, and the model learns to reconstruct the missing residues using bidirectional sequence context.
- **Rotary Position Embeddings (RoPE):** The model replaces fixed additive position markers with Rotary Position Embeddings. RoPE applies complex vector rotations that inject relative spatial distance directly into the query-key dot products, helping the model extrapolate to longer sequences.
- **Emergence of Contact Maps in Attention:** Without receiving any 3D structural supervision during language pre-training, the self-attention heads automatically begin tracking co-evolving residue pairs. Linear combinations of these learned attention patterns accurately reconstruct pairwise physical contact maps.

## ESMFold: Fast Atomic Structure Prediction {#esmfold}

![Core modules of ESM-2 and ESMFold illustrating the translation from sequence representations to 3D atomic coordinates.](https://arxiv.org/html/2310.19624v1/plms.png)

_Core modules of ESM-2 and ESMFold illustrating the translation from sequence representations to 3D atomic coordinates._

To translate internal sequence representations into Cartesian space, the authors introduced ESMFold. ESMFold removes the entire MSA representation module used in earlier systems, connecting a folding trunk directly to the single-sequence representations output by ESM-2. It utilizes Invariant Point Attention (IPA) and backbone frame updates to iteratively refine 3D coordinates. ESMFold is supervised with Frame Aligned Point Error (FAPE), distance matrix cross-entropy, and torsion angle losses.

Because it bypasses database searches and MSA compilation, ESMFold predicts atomic coordinates roughly 60 times faster than AlphaFold 2 on median-length proteins, solving full structures in seconds per chain while maintaining competitive accuracy on blind CASP14 and CAMEO evaluations.

## The Metagenomic Atlas and Protein Exploration {#legacy}

To demonstrate its computational throughput, the team deployed ESMFold to fold 617 million metagenomic sequences from the MGnify database in two weeks. Over 225 million predictions were cataloged with reliable confidence scores, unveiling thousands of previously uncharacterized protein folds from dark metagenomic space. ESM-2 established the principle that evolutionary variation and physical constraints are encoded within the statistical distribution of natural sequences, demonstrating that language models provide an efficient alternative to traditional homology pipelines.

## Resources

- [Evolutionary-Scale Prediction of Atomic-Level Protein Structure (Science)](https://doi.org/10.1126/science.ade2574) {type: docs, provider: Science}
- [Meta Research ESM GitHub Repository](https://github.com/facebookresearch/esm) {type: code, provider: GitHub}
- [ESM Metagenomic Atlas](https://esmatlas.com) {type: docs, provider: Meta AI}
