---
title: "BIOVERSE: Multimodal Biological Foundation Model Alignment"
authors: "2025 Preprint"
citation: "arXiv:2510.01428"
link: "https://ar5iv.org/abs/2510.01428"
heroImage: "https://ar5iv.labs.arxiv.org/html/2510.01428/assets/figs/alignment_training.png"
slug: "bioverse-multimodal-biological-foundation-model-alignment"
---

## The Semantic Isolation of Biological Modalities {#problem-space}

The integration of modality-specific biological foundation models (BioFMs)—such as scGPT for single-cell RNA sequencing or ESM-2 for protein sequences—into generative large language models (LLMs) is fundamentally constrained by the semantic isolation of their respective embedding spaces. UMAP visualizations of these spaces typically reveal that biological cell or protein embeddings form distinct, isolated clusters far removed from the text embeddings of the LLM. This separation prevents the LLM from directly "reading" raw biological data, forcing researchers to rely on lossy text-based descriptions that strip away the high-dimensional nuances of the original data. To enable zero-shot reasoning across modalities, a framework must be established that can realign these disparate biological representations into a shared, unified semantic space where the LLM can process biological entities as native tokens.

## Two-Stage Alignment and Soft Token Injection {#mechanism}

BIOVERSE addresses this isolation through a modular architecture that employs a two-stage alignment process to bridge the gap between pretrained BioFMs and LLMs. In the first stage, a lightweight three-layer Multi-Layer Perceptron (MLP) projection layer is trained to map the output of the biological encoder directly into the LLM's native token-embedding space. This stage utilizes a CLIP-style bidirectional InfoNCE contrastive loss to pull biological embeddings closer to their corresponding textual descriptions while pushing them away from unrelated general-domain text. By freezing both the biological encoder and the LLM during this phase, the system achieves representation-level similarity without the computational expense of a full forward pass through the language model.

The second stage involves multimodal instruction tuning, where the model is trained on paired data consisting of biological embeddings, instructions, and responses. During this phase, both the projection layer and low-rank adapters (LoRA) within the LLM are made trainable, allowing the model to learn how to utilize "soft tokens"—projected embeddings injected into placeholder positions like `[BIO]`. This mechanism enables the LLM to treat high-dimensional biological features as if they were standard vocabulary tokens, leveraging its vast internal knowledge to perform complex reasoning on raw data. The modularity of this approach allows different modalities, such as molecules encoded by ChemBERTa and proteins by ESM-2, to be aligned independently to the same shared space, resulting in natural interoperability across biological domains.

## Zero-Shot Transfer and Local Deployment {#abstraction}

The alignment of biological data to a unified semantic space facilitates zero-shot transfer capabilities that surpass those of significantly larger, text-only models. For instance, a BIOVERSE configuration using an 8B parameter backbone—such as IBM's Granite-8B—can outperform 120B parameter models on tasks like molecular description and protein function prediction without further task-specific tuning. This efficiency is critical for clinical and genomic research, where the requirement for privacy-preserving, on-premise deployment often precludes the use of massive, cloud-based proprietary models. By enabling high-performance reasoning on compact backbones, the framework supports the transition toward secure, agentic AI systems that can operate directly on sensitive patient data within a local environment.

## Resources {#resources}

- [BIOVERSE Paper](https://ar5iv.org/abs/2510.01428) {type: article, provider: ar5iv}
- [ESM-2 Protein Model](https://github.com/facebookresearch/esm) {type: model, provider: Meta AI}
- [scGPT for Single-Cell RNA](https://github.com/bowang-lab/scGPT) {type: model, provider: Bo Wang Lab}
