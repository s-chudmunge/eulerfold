---
title: "Flamingo: Visual Language Few-Shot"
authors: "Alayrac et al. (2022)"
citation: "Alayrac, J. B., Donahue, J., Luc, P., Miech, A., Barr, I., Hasson, Y., ... & Zisserman, A. (2022). Flamingo: a visual language model for few-shot learning. Advances in Neural Information Processing Systems, 35, 23716-27744."
link: "https://arxiv.org/abs/2204.14198"
slug: "flamingo-visual-language-few-shot"
heroImage: null
---

# Flamingo: Visual Language Few-Shot

The 2022 paper on Flamingo introduced a family of visual language models (VLMs) that could adapt to new tasks with only a few examples, similar to the capabilities of large language models like GPT-3. For years, vision-language systems required massive task-specific fine-tuning. Researchers at DeepMind proposed an architecture that bridges a powerful, frozen vision encoder with a large, frozen language model. It was a shift toward viewing multimodality as an interleaved sequence of visual and textual information.

## Interleaved Vision-Language Sequences {#interleaved-sequences}

The primary innovation of Flamingo was its ability to process "interleaved" sequences, where images and text appear in an arbitrary, interleaved order. Unlike previous models that were limited to a single (image, caption) pair, Flamingo can handle complex dialogues or documents where multiple images are referenced across a long conversation. 

To achieve this, the model uses "special" visual tokens inserted into the text stream, which act as anchors for the gated cross-attention layers. This engineering choice allowed for the first true "multimodal dialogue," where a user can ask questions about several different images in sequence, or even provide a "story" composed of both visual and textual elements.

## Gated Cross-Attention {#gated-cross-attention}

Flamingo established a framework for few-shot multimodal learning by interleaving visual and textual information within a single, unified sequence. The architecture utilizes a Perceiver Resampler to map a variable number of visual features—from static images or videos—into a fixed set of visual tokens, ensuring compatibility with a frozen large language model. 

To bridge these modalities without disrupting the model's pre-trained linguistic knowledge, the researchers inserted gated cross-attention layers (GALA) that use a tanh-gating mechanism to slowly incorporate visual context into the language stream. This modular approach proved that a general-purpose reasoning engine can be adapted to complex visual tasks through simple in-context prompting rather than through the expensive, task-specific fine-tuning that had characterized earlier vision-language systems.

## Perceiver Resampler {#perceiver-resampler}

The reasoning behind Flamingo was the need to handle visual data of varying resolutions and lengths, such as videos or multiple images in a dialogue. They introduced the 'Perceiver Resampler,' which maps a variable number of visual features to a fixed set of visual tokens. This revealed that the bottleneck in multimodal AI is often the interface between different data types. By creating a uniform representation for vision, Flamingo can process complex, interleaved sequences as easily as text, effectively standardizing the visual signal for the language model.

## Video as a Sequence of Frames {#video-processing}

Because Flamingo's architecture is built on the Perceiver Resampler, it treats video naturally as a temporal sequence of images. By sampling frames at a fixed rate and passing them through the vision encoder, the model can "attend" to specific moments in a video to answer questions about actions or events. 

This finding proved that the same primitives used for static images could be extended to dynamic scenes without a fundamental change in architecture. It suggested that "vision" is not just about spatial recognition, but about the temporal integration of features—a concept that has since become the standard for video understanding in large-scale AI.

## Impact on Multi-modal LLMs {#modern-impact}

The success of Flamingo provided the blueprint for the current generation of "native" multimodal models, including **GPT-4o**, **Gemini 1.5 Pro**, and **Claude 3.5 Sonnet**. These systems have moved beyond the "frozen encoder" approach of Flamingo to a more integrated, "natively multimodal" training process, but the core idea of interleaved sequences and cross-modal attention remains central. 

Flamingo proved that a single, unified model could possess the "eyes" to see the world and the "mind" to reason about it, marking the transition from specialized vision models to general-purpose multimodal assistants that can assist with everything from medical diagnosis to automated coding.

## Few-Shot Visual Reasoning {#few-shot-visual-reasoning}

The success of Flamingo proved that 'in-context learning' is not limited to text. By providing a few (image, text) pairs in the prompt, the model can solve novel visual tasks without any weight updates. This suggests that the future of vision is not just about recognition, but about reasoning within a semantic context. It raises the question of how we can continue to scale these multimodal Generalists to handle the full complexity of human experience, moving toward a future where AI can interact with the physical world with the same fluidity as it does with digital text.


## Resources

- [DeepMind Flamingo Blog](https://www.deepmind.com/blog/tackling-multiple-tasks-with-a-single-visual-language-model) {type: article, provider: DeepMind}
- [Flamingo Paper on arXiv](https://arxiv.org/abs/2204.14198) {type: article, provider: arXiv}
