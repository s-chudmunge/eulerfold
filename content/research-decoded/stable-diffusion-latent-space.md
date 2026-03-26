---
title: "Stable Diffusion: Latent Space"
authors: "Rombach et al. (2021)"
citation: "Rombach, R., Blattmann, A., Lorenz, D., Esser, P., & Ommer, B. (2022). High-resolution image synthesis with latent diffusion models. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition (pp. 10684-10695)."
link: "https://arxiv.org/abs/2112.10752"
slug: "stable-diffusion-latent-space"
heroImage: "https://ar5iv.labs.arxiv.org/html/2112.10752/assets/img/generativevscompressive4.jpg"
---

# Stable Diffusion: Latent Space

In 2021, the release of Latent Diffusion Models, later known as Stable Diffusion, solved the problem of computational cost in generative AI. While earlier diffusion models worked directly on image pixels, they were incredibly slow and resource-heavy. Researchers at LMU Munich and Runway proposed that generation should instead happen in a 'latent space'—a compressed mathematical representation of an image. It was a push to make high-quality generation accessible on consumer hardware by separating the act of creation from the act of rendering.

## Diffusion in Latent Space {#latent-diffusion}

![Latent Diffusion architecture showing the interaction between the autoencoder, the U-Net, and the conditioning mechanism.](https://ar5iv.labs.arxiv.org/html/2112.10752/assets/x1.png)

_Latent Diffusion architecture showing the interaction between the autoencoder, the U-Net, and the conditioning mechanism._

Stable Diffusion resolved the computational bottleneck of high-resolution image synthesis by shifting the diffusion process from pixel space to a compressed, lower-dimensional latent space. Through the use of a pre-trained Variational Autoencoder (VAE), the model first compresses raw images into a latent representation that captures their semantic essence while discarding imperceptible details. The subsequent denoising process occurs entirely within this latent space, guided by a cross-attention mechanism that allows the U-Net to "attend" to external conditioning signals like text embeddings. This separation of semantic creation from high-resolution rendering proved that high-fidelity synthesis is achievable on consumer-grade hardware by optimizing the mathematical manifold on which the model operates.

## Universal Conditioning {#cross-attention}

The reasoning behind Stable Diffusion was the need for a more flexible way to guide the generative process. They introduced a 'cross-attention' mechanism that allows the model to be conditioned on various inputs, such as text, depth maps, or other images. This turned the diffusion model into a universal generative engine that can follow complex instructions. It revealed that generation is most powerful when it can be steered by human concepts, rather than just random noise.

## The Efficiency Shift {#efficiency-shift}

The success of Stable Diffusion marked a shift in the AI industry toward efficiency and democratization. By proving that high-performance models could run on standard GPUs, the researchers catalyzed a wave of open-source innovation. This revealed that the most impactful breakthroughs are often the ones that reduce the barriers to entry. It raises the question of whether the future of AI will be defined by the size of the models or by the cleverness of the compression that makes them usable by everyone.

## Resources

- [Stable Diffusion Blog](https://stability.ai/blog/stable-diffusion-announcement) {type: article, provider: Stability AI}
- [LDM Paper on GitHub](https://github.com/CompVis/latent-diffusion) {type: code, provider: GitHub}
