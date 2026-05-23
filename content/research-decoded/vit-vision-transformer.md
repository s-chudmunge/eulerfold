---
title: "Why Transformers Are Replacing Traditional Vision"
authors: "Alexey Dosovitskiy et al. (Google Research, 2020)"
citation: "Dosovitskiy, A., Beyer, L., Kolesnikov, A., Weissenborn, D., Zhai, X., Unterthiner, T., ... & Houlsby, N. (2020). An image is worth 16x16 words: Transformers for image recognition at scale. arXiv preprint arXiv:2010.11929."
link: "https://arxiv.org/abs/2010.11929"
slug: "vit-vision-transformer"
heroImage: "https://ar5iv.labs.arxiv.org/html/2010.11929/assets/x1.png"
---

In 2020, researchers at Google Research demonstrated that the Transformer architecture, originally designed for natural language processing, can outperform convolutional neural networks (CNNs) on large-scale image recognition tasks. Prior to this research, computer vision was dominated by architectures that utilized hand-coded inductive biases, such as translation invariance and locality, to process pixel data. The researchers proved that by treating an image as a sequence of discrete patches and removing these built-in assumptions, a general-purpose attentive model can learn the spatial relationships of the physical world directly from data, establishing a unified framework for both vision and language.

## Spatial Discretization and Patch Embeddings {#patches-as-tokens}

![ViT architecture illustrating the splitting of an image into 16x16 patches, which are then linearly projected and processed as a sequence by a Transformer encoder.](https://ar5iv.labs.arxiv.org/html/2010.11929/assets/x1.png)

_ViT architecture illustrating the splitting of an image into 16x16 patches, which are then linearly projected and processed as a sequence by a Transformer encoder._

The core technical mechanism of the Vision Transformer (ViT) is the spatial discretization of the input image into fixed-size patches. An image of resolution $H \times W$ is reshaped into a sequence of $N$ flattened 2D patches, each of which is then linearly projected into a high-dimensional embedding space. This methodological choice allows the model to process visual information as a 1D sequence of tokens, identical to the way words are represented in a language model. This finding revealed that the specific grid geometry of an image is not a necessary architectural prior, but a structural pattern that can be efficiently managed through global self-attention rather than local convolution.

## Global Self-Attention and Receptive Fields {#global-attention}

The ViT architecture utilizes global self-attention from the very first layer, allowing every patch to interact with every other patch across the entire image simultaneously. In a standard CNN, the receptive field of a neuron is initially restricted to a small local neighborhood, and a global understanding only emerges through the hierarchical stacking of multiple layers. By enabling global information flow from the onset, ViT can capture long-range dependencies and complex relational structures—such as the alignment of distant features—without waiting for successive rounds of spatial pooling. This finding demonstrated that the most effective way to understand a complex visual scene is to ensure that the relational significance of every part is computed in parallel across the entire manifold.

## Scaling Laws and the Inductive Bias Trade-off {#scale-and-bias}

A critical finding of the research is the relationship between model performance and the volume of training data. While CNNs are more efficient when data is limited due to their built-in spatial assumptions, the researchers proved that ViT scales more aggressively as the dataset size increases. When pre-trained on massive datasets such as ImageNet-21k (14 million images) or JFT-300M, the Vision Transformer consistently outperformed state-of-the-art ResNet architectures. This result established the principle that "intelligence" in vision is an emergent property of large-scale data ingestion, where a model with fewer architectural constraints eventually surpasses more specialized designs by discovering its own optimal processing rules.

## Position Embeddings and Spatial Order {#position-embeddings}

Because the Transformer contains no inherent knowledge of 2D geometry, ViT utilizes learnable position embeddings added to the patch representations to preserve spatial information. The model learns to identify which patches are adjacent and which are distant by observing the statistical regularities of the training set. The researchers observed that the learned position embeddings often exhibit clear 2D structures, with proximal patches having similar embedding vectors. This finding confirmed that the model autonomously reconstructs the concepts of distance and orientation, effectively digitalizing the Act of spatial perception through the refinement of a high-dimensional state space.

## The Convergence of Vision and Language Architectures {#significance}

The success of the Vision Transformer demonstrated that the fundamental primitives for processing information are increasingly independent of the data's original modality. The decision to use an identical encoder for both pixels and words revealed that the bottleneck in AI was the proliferation of specialized, non-interoperable designs. This principle remains the central theme in the development of multi-modal foundation models, where a single attentive block serves as the universal engine for all cognitive tasks. It leaves open the question of whether the computational cost of global self-attention—which scales quadratically with sequence length—can be reduced to support the processing of extremely high-resolution visual data.

## Resources

- [An Image is Worth 16x16 Words (Official arXiv)](https://arxiv.org/abs/2010.11929) {type: article, provider: arXiv}
- [Transformers for Image Recognition (Google AI Blog)](https://blog.research.google/2020/12/transformers-for-image-recognition-at.html) {type: article, provider: Google}
- [ViT Reference Implementation (GitHub)](https://github.com/google-research/vision_transformer) {type: code, provider: GitHub}
- [ViT Walkthrough and Explanation (Video)](https://www.youtube.com/watch?v=TrdevFK_am4) {type: video, provider: Yannic Kilcher}
