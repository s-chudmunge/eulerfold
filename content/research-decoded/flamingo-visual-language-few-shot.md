---
title: "A Vision AI That Learns from Just a Few Examples"
authors: "Alayrac et al. (2022)"
citation: "Alayrac, J. B., Donahue, J., Luc, P., Miech, A., Barr, I., Hasson, Y., ... & Zisserman, A. (2022). Flamingo: a visual language model for few-shot learning. Advances in Neural Information Processing Systems, 35, 23716-27744."
link: "https://arxiv.org/abs/2204.14198"
slug: "flamingo-visual-language-few-shot"
heroImage: null
---

The 2022 Flamingo paper introduced a family of visual language models designed to adapt to new tasks with only a few examples. While previous vision-language systems required extensive task-specific fine-tuning, Flamingo utilizes an architecture that bridges a frozen vision encoder with a frozen language model. This approach treats multimodality as an interleaved sequence of visual and textual data, allowing the model to handle complex dialogues or documents where multiple images are referenced across a long conversation.

A primary innovation of Flamingo is its ability to process sequences where images and text appear in an arbitrary order. This is achieved by inserting special visual tokens into the text stream to act as anchors for gated cross-attention layers. This engineering choice enabled the first true multimodal dialogue, where a user can ask questions about several different images in sequence. The model maps a variable number of visual features from images or videos into a fixed set of visual tokens using a Perceiver Resampler, ensuring compatibility with the language model's pre-trained weights.

To bridge modalities without disrupting the model's linguistic knowledge, the researchers used gated cross-attention layers with a tanh-gating mechanism. This allows the system to slowly incorporate visual context into the language stream. This modular framework proves that a general-purpose reasoning engine can be adapted to complex visual tasks through in-context prompting rather than expensive fine-tuning. This standardization of the visual signal for the language model allows it to navigate complex, interleaved sequences as easily as it handles pure text.

Because of its architecture, Flamingo treats video as a temporal sequence of images. By sampling frames at a fixed rate and passing them through the vision encoder, the model can attend to specific moments in a video to answer questions about actions or events. This demonstrated that the same primitives used for static images could be extended to dynamic scenes. Vision in this context is framed not just as spatial recognition, but as the temporal integration of features, which has since become a standard for video understanding in large-scale AI.

The success of Flamingo provided a blueprint for subsequent generations of native multimodal models. While more recent systems have moved toward more integrated training processes, the core concepts of interleaved sequences and cross-modal attention remain central. Flamingo demonstrated that a single, unified model could possess both the capacity for visual perception and the ability to reason about that perception. This marked a transition from specialized vision models to general-purpose multimodal assistants.

The ability to perform few-shot visual reasoning suggests that in-context learning is not limited to language. By providing a few examples of image-text pairs in a prompt, the model can solve novel visual tasks without weight updates. This indicates that the future of vision involves reasoning within a semantic context rather than simple object recognition. The challenge remains to scale these multimodal systems to handle the full complexity of human experience and physical interaction with the same fluidity currently seen in text-based tasks.

## Resources

- [DeepMind Flamingo Blog](https://www.deepmind.com/blog/tackling-multiple-tasks-with-a-single-visual-language-model) {type: article, provider: DeepMind}
- [Flamingo Paper on arXiv](https://arxiv.org/abs/2204.14198) {type: article, provider: arXiv}
