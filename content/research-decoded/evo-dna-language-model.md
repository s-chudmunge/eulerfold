---
title: "Evo: DNA Language Model"
authors: "Nguyen et al. (2024)"
citation: "Nguyen, E., Poli, M., Durrant, M. G., et al. (2024). Sequence modeling and design from molecular to genome scale with Evo. Science, 386(6723), ado9336."
link: "https://doi.org/10.1126/science.ado9336"
slug: "evo-dna-language-model"
heroImage: null
---

# Evo: DNA Language Model

The 2024 'Evo' paper introduced a foundational shift in genomic research by treating the entire code of life as a continuous, generative language. Before Evo, genomic models were often specialized for narrow tasks—such as predicting gene expression or classifying mutations—and were limited by context windows that could only capture local fragments of a genome. This fragmentation prevented a holistic understanding of how distant genetic elements interact to define complex organismal traits. Evo utilized a hybrid architecture to bridge this gap, processing over 131,000 nucleotides in a single pass. It proved that the 'grammar' of DNA is not just a sequence of isolated instructions, but a global system of dependencies that can be modeled and even designed from scratch.

## The Long-Context Genomic Shift {#long-context-genomic-shift}

Evo transformed genomic research by treating the entire code of life as a continuous, generative language with a context window capable of capturing entire biological systems. Utilizing the StripedHyena architecture—a hybrid of gated convolutions and attention—the model processes over 131,000 nucleotides in a single pass, allowing it to reason about the long-range dependencies of operons and complex regulatory networks. This shift from modeling isolated genetic fragments toward genome-scale synthesis enabled the zero-shot prediction of evolutionary fitness and the generative design of novel, functional CRISPR-Cas systems that have never existed in nature. It proved that the "grammar" of DNA is not a sequence of independent instructions, but a global system of relationships that can be mastered by an engine capable of seeing the world at the scale of a genome.

## The StripedHyena Architecture {#stripedhyena-architecture}

How Evo achieves this massive context window lies in its use of the 'StripedHyena' architecture, a hybrid model that interleaves attention layers with gated convolutions. Standard Transformers suffer from a quadratic memory cost that makes whole-genome processing impossible; however, by using convolutions for the bulk of the sequence processing and reserving attention for critical long-range dependencies, StripedHyena maintains high resolution with linear scaling. This specific engineering choice allowed the model to be trained on 2.7 trillion nucleotides, capturing the fundamental patterns of evolution across billions of prokaryotic and viral sequences. It proved that the most effective way to process the vast scale of biological data is through a hybrid approach that balances local precision with global reasoning.

## Generative Design of Life {#generative-design-of-life}

The most significant result of Evo was its transition from a predictive model to a generative one, capable of designing functional biological systems from first principles. The model successfully generated novel, functional CRISPR-Cas systems and transposable elements that had never existed in nature. This finding revealed that the 'grammar' of life is sufficiently captured by the model to allow for the creation of new, viable genetic machines. It proved that the generative techniques used to create images and text can be applied with the same success to the physical blueprints of biology. This shift from analysis to synthesis suggests that the future of biotechnology will be driven by models that can 'write' DNA with the same fluency that humans write language.

## DNA as a Foundational Language {#dna-foundational-language}

The success of Evo suggests that DNA is the ultimate foundational language, one that precedes and defines all other biological structures. By demonstrating zero-shot proficiency in predicting the fitness of mutations across the entire tree of life, the model proved that there are universal rules governing genomic evolution that transcend individual species. This reveals that the diversity of life is built upon a shared linguistic core that can be decoded and navigated. It raises the question of whether we can eventually build 'organismal foundation models' that can simulate the entire behavior of a cell from its sequence alone. It suggested that we are moving toward a world where the complexity of biology is no longer an inscrutable mystery, but a design space that can be engineered with mathematical precision.

## Resources

- [Evo Paper in Science](https://doi.org/10.1126/science.ado9336) {type: article, provider: Science}
- [Arc Institute Evo Blog](https://arcinstitute.org/news/blog/evo) {type: article, provider: Arc Institute}
- [Evo Implementation on GitHub](https://github.com/evo-design/evo) {type: code, provider: GitHub}
