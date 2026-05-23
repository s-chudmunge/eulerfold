---
title: "Evo: Decoding the Code of Life with AI"
authors: "Eric Nguyen et al. (Arc Institute, 2024)"
citation: "Nguyen, E., Poli, M., Durrant, M. G., et al. (2024). Sequence modeling and design from molecular to genome scale with Evo. Science, 386(6723), ado9336."
link: "https://doi.org/10.1126/science.ado9336"
slug: "evo-dna-language-model"
heroImage: null
---

In 2024, researchers at the Arc Institute and Stanford University introduced Evo, a foundational genomic model that treats the entire code of life as a continuous, generative language. Prior to this work, genomic models were restricted by small context windows that could only capture local fragments of a sequence, preventing a holistic understanding of how distant genetic elements interact to define organismal regulation. The researchers demonstrated that by utilizing the StripedHyena architecture to process over 131,000 nucleotides in a single pass, a system can learn the global "grammar" of DNA across the molecular and genomic scales, establishing a predictive and generative framework for the design of novel biological machines.

## Long-Context Genomic Modeling and StripedHyena {#architecture}

The primary technical contribution of Evo is the achievement of genome-scale context through the StripedHyena architecture—a hybrid model that interleaves multi-head attention with gated convolutions. Standard Transformer architectures suffer from a quadratic computational cost that makes the processing of long biological sequences infeasible. StripedHyena resolves this bottleneck by utilizing convolutions to capture local structural patterns while reserving attention for the critical long-range dependencies of operons and regulatory networks. This methodological choice allowed the model to be trained on 2.7 trillion nucleotides from diverse prokaryotic and viral sequences, proving that the most effective way to process the vast scale of biological data is through an architecture that prioritizes linear scaling.

## Zero-Shot Evolutionary Fitness Prediction {#fitness-prediction}

The technical significance of Evo was validated through its zero-shot proficiency in predicting the evolutionary fitness of mutations across the entire tree of life. By training on a diverse corpus of evolutionary history, the model learned to identify the structural and functional invariants of biological sequences without the need for task-specific supervision. The researchers proved that the model can predict the impact of mutations on protein function and gene expression by evaluating the local and global log-probabilities of the sequence. This finding established the principle that "intelligence" in genomics is an emergent property of large-scale sequence ingestion, allowing for the rapid identification of beneficial or deleterious variants in unknown organisms.

## Generative Design of Novel Biological Machines {#synthetic-design}

A critical achievement of the Evo framework is its transition from a predictive model to a generative one, capable of designing functional biological systems from first principles. The model successfully generated novel, functional CRISPR-Cas systems and transposable elements that have never existed in nature. This finding revealed that the generative techniques used to create images and text can be applied with the same success to the physical blueprints of biology. This shift from analysis to synthesis suggests that the future of biotechnology will be driven by models that can "write" DNA with the same fluency that humans write language, effectively digitalizing the search for novel genetic tools and therapeutic interventions.

## DNA as a Universal Information Carrier {#significance}

The success of Evo demonstrated that DNA is the ultimate foundational language, governed by universal statistical rules that transcend individual species. The decision to model the genome as a unified information carrier revealed that the primary constraint on biological understanding was the structural isolation of genomic data from its semantic context. This principle remains the central theme in the search for "organismal foundation models" that can simulate the entire behavior of a cell from its sequence alone. It leaves open the question of whether these long-context methods can eventually be scaled to capture the billion-base-pair complexities of eukaryotic genomes, or if the next leap in biological AI requires a move toward truly three-dimensional representations of genomic state.

## Resources

- [Evo: Sequence Modeling and Design (Official DOI)](https://doi.org/10.1126/science.ado9336) {type: docs, provider: Science}
- [Arc Institute Evo Blog](https://arcinstitute.org/news/blog/evo) {type: article, provider: Arc Institute}
- [GitHub: Evo Reference Implementation](https://github.com/evo-design/evo) {type: code, provider: GitHub}
- [StripedHyena Architecture (arXiv)](https://arxiv.org/abs/2405.13961) {type: article, provider: arXiv}
