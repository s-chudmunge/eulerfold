---
title: "Enformer: Long-Range Attention for Gene Regulation"
authors: "Žiga Avsec, John Jumper, Pushmeet Kohli, David R. Kelley et al. (DeepMind, 2021)"
citation: "Avsec, Ž., Agarwal, V., Visentin, D., ... & Kelley, D. R. (2021). Effective gene expression prediction from sequence by integrating long-range interactions. Nature Methods, 18(10), 1196-1203."
link: "https://doi.org/10.1038/s41592-021-01252-x"
slug: "enformer-gene-expression-long-range-interactions"
heroImage: "/images/research-decoded/enformer-gene-expression-long-range-interactions.png"
---

In 2021, researchers at DeepMind and Calico Life Sciences introduced Enformer, a neural network architecture designed to predict gene expression and chromatin state directly from DNA sequence by capturing long-range genomic interactions. While prior convolutional models like Basenji2 could identify local transcription factor binding motifs, their limited receptive fields prevented them from modeling interactions between genes and distal enhancers located tens or hundreds of kilobases away. Enformer combined convolutional downsampling with Transformer self-attention across 100-kilobase spans, bridging the gap between local DNA motifs and global 3D chromosomal regulation.

## The Receptive Field Bottleneck in Regulatory Genomics {#problem-space}

In human and mammalian genomes, gene expression is rarely determined solely by the promoter adjacent to the transcription start site. Distal enhancers, silencers, and insulator elements loop across 3D nuclear space to regulate genes over distances exceeding 100,000 base pairs. Convolutional networks struggle with these long-range regulatory spans: increasing convolutional depth linearly increases parameter counts and causes training instability, while aggressive pooling erodes single-nucleotide spatial resolution. As a result, earlier models missed distal enhancer-promoter communication, limiting their ability to predict the regulatory consequences of non-coding genetic variants.

## The Hybrid Convolution-Transformer Architecture {#mechanism}

![Overview of the long-range regulatory genomics pipeline from arXiv HTML, illustrating token alignment and attention across distant chromatin bins.](https://arxiv.org/html/2410.01858v1/overview-tokenalign.png)

_Overview of the long-range regulatory genomics pipeline from arXiv HTML, illustrating token alignment and attention across distant chromatin bins._

Enformer addresses this physical scale disparity through a specialized three-stage pipeline:
1. **Convolutional Tower:** Processes an input window of 196,608 base pairs through 7 residual convolutional blocks with max pooling. This compresses the raw sequence into 1,536 spatial bins of 128 base pairs each, extracting local motif features while lowering sequence length for attention processing.
2. **Transformer Tower:** Passes the 1,536 bins through 11 multi-head self-attention blocks. Self-attention provides a bidirectional context span of approximately 100 kb in each direction, allowing any regulatory element in the window to attend directly to distant promoters without relying on intermediate convolutional layers.
3. **Relative Positional Encoding:** Utilizes distance-dependent basis functions within the attention mechanism, providing an inductive bias that reflects how enhancer influence naturally decays over linear sequence distance.
4. **Cropping and Output Heads:** To avoid edge artifacts, the outer 320 bins are cropped, leaving the central 896 bins (114,688 base pairs). Linear heads predict 5,313 human and 1,643 mouse functional tracks, covering CAGE transcription start sites, ChIP-seq histone marks, and DNase/ATAC-seq chromatin accessibility.

The network is trained using a Poisson negative log-likelihood loss on binned experimental sequencing read counts.

## Predicting Distal Regulation and Non-Coding Variants {#benchmarks}

Enformer delivered a substantial improvement in predicting gene expression for genes controlled by distant regulatory elements. On genes with enhancers located farther than 20 kb from their transcription start sites, Enformer improved the Pearson correlation ($r$) of predicted expression by over 40% compared to convolutional baselines.

Crucially, Enformer demonstrated accurate zero-shot variant effect prediction. Without receiving direct training on genetic variant data, the model accurately prioritized causal non-coding single-nucleotide variants linked to expression quantitative trait loci (eQTLs) and complex disease traits, correctly identifying which non-coding mutations disrupt enhancer-promoter loops and modify gene expression.

## Unifying Linear DNA and 3D Nuclear Architecture {#legacy}

Enformer proved that understanding eukaryotic gene regulation requires pairing local pattern recognition with long-range attention mechanisms. By capturing interactions spanning hundreds of thousands of base pairs, Enformer demonstrated that linear sequence models can internalize the functional effects of 3D chromatin folding, establishing the foundation for modern genomic foundation models.

## Resources

- [Effective Gene Expression Prediction from Sequence (Nature Methods)](https://doi.org/10.1038/s41592-021-01252-x) {type: docs, provider: Nature}
- [Official DeepMind Enformer GitHub Repository](https://github.com/google-deepmind/deepmind-research/tree/master/enformer) {type: code, provider: GitHub}
- [Enformer BioRxiv Preprint](https://doi.org/10.1101/2021.04.07.438887) {type: article, provider: BioRxiv}
