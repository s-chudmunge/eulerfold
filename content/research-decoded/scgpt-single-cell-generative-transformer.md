---
title: "scGPT: Foundation Transformer for Single-Cell Biology"
authors: "Haotian Cui, Chloe Wang, Bo Wang et al. (2024)"
citation: "Cui, H., Wang, C., Maan, H., ... & Wang, B. (2024). scGPT: toward building a foundation model for single-cell multi-omics using generative AI. Nature Methods, 21(8), 1470-1480."
link: "https://doi.org/10.1038/s41592-024-02201-0"
slug: "scgpt-single-cell-generative-transformer"
heroImage: "/images/research-decoded/scgpt-single-cell-generative-transformer.png"
---

In 2024, researchers introduced scGPT, a generative pre-trained foundation model designed for single-cell biology and multi-omics. Single-cell RNA sequencing (scRNA-seq) has revolutionized our view of cellular diversity, but the data is noisy, sparse due to technical dropouts, and affected by experimental batch effects across laboratories. Prior analytical methods were trained on narrow datasets for isolated tasks, struggling to transfer knowledge across tissues and conditions. scGPT demonstrated that pre-training a Transformer architecture across tens of millions of single cells enables a universal representation of cellular states, capturing gene-gene regulatory networks and predicting how cells respond to genetic perturbations.

## The Challenge of Single-Cell Multi-Omics {#problem-space}

Unlike linear DNA or protein sequences, the transcriptome of an individual cell is an unordered collection of thousands of gene expression values. Measuring these expression levels via single-cell sequencing introduces substantial technical noise, severe dropout where expressed transcripts fail to be captured, and batch discrepancies between different sequencing platforms. Traditional bioinformatic pipelines rely on task-specific heuristics, clustering algorithms, and separate integration tools, preventing cross-study generalization. scGPT addressed this fragmentation by formulating single-cell biology as a generative language modeling problem over cellular vocabularies.

## Generative Pre-Training on 33 Million Cells {#mechanism}

![The single-cell manifold discovered within scGPT attention geometry on arXiv HTML, illustrating developmental ordering and cell-state lineage branch structure.](https://arxiv.org/html/2603.10261v1/h65_expanded_hematopoiesis_manifold_3d.png)

_The single-cell manifold discovered within scGPT attention geometry on arXiv HTML, illustrating developmental ordering and cell-state lineage branch structure._

scGPT models single-cell transcriptomes through a specialized tokenization and attention scheme:
- **Input Representation:** Each cell is represented as a sequence of gene tokens. Each input vector sums:
  1. *Gene Identity Token:* A discrete identifier selected from a vocabulary of over 30,000 human genes.
  2. *Expression Value Embedding:* A continuous scalar expression value projected into the hidden dimension through learnable dense layers.
  3. *Condition Tokens:* Metadata tags encoding cell type, tissue source, batch, or experimental protocol.
- **Permutation Invariance:** Because cellular transcriptomes lack natural grammatical order, genes are ordered by expression magnitude or processed via set-based self-attention. This allows self-attention heads to compute pairwise dependencies between all co-expressed genes.
- **Pre-Training Objectives:**
  - *Masked Gene Expression Prediction:* Randomly masks a subset of gene expression values, training the Transformer to predict the masked values from the remaining transcriptomic context using mean squared error and cross-entropy losses.
  - *Gene-Gene Relationship Alignment:* Aligns learned gene embeddings to preserve biological co-expression networks.

The model was pre-trained on a corpus of more than 33 million individual human cells sourced from the CELLxGENE portal.

## Transfer Learning Across Single-Cell Tasks {#benchmarks}

Once pre-trained, scGPT transfers across multiple single-cell workflows:
- **Cell Type Annotation:** Surpassed specialized models such as CellTypist and scVI in classifying rare and unseen cell types across independent datasets.
- **Batch Correction & Integration:** Successfully integrated disparate datasets across laboratories, harmonizing batch variations while preserving biological cell clusters.
- **In Silico Genetic Perturbations:** On Perturb-seq CRISPR screens, scGPT predicted post-knockout transcriptomic changes with greater accuracy than specialized graph neural networks, forecasting how gene deletions ripple through regulatory cascades.
- **De Novo Pathway Discovery:** Attention weight matrices inside the Transformer naturally reconstructed canonical biological pathways and signaling cascades without receiving explicit pathway annotations.

## The Cell as a Generative State {#legacy}

scGPT established that the complex, noisy internal states of single cells can be unified within a generative foundation model. By demonstrating that pre-training on tens of millions of cells yields transferable representations of cellular identity and gene regulation, scGPT bridged molecular genetics and whole-cell phenotypic modeling, providing a platform for computational drug screening and cellular engineering.

## Resources

- [scGPT: Foundation Model for Single-Cell Multi-Omics (Nature Methods)](https://doi.org/10.1038/s41592-024-02201-0) {type: docs, provider: Nature}
- [scGPT Official GitHub Repository](https://github.com/bowang-lab/scGPT) {type: code, provider: GitHub}
- [scGPT BioRxiv Preprint](https://doi.org/10.1101/2023.04.30.538892) {type: article, provider: BioRxiv}
