---
title: "DDPM: Diffusion Models"
authors: "Ho et al. (2020)"
citation: "Ho, J., Jain, A., & Abbeel, P. (2020). Denoising diffusion probabilistic models. Advances in neural information processing systems, 33, 6840-6851."
link: "https://arxiv.org/abs/2006.11239"
slug: "ddpm-diffusion-models"
heroImage: "https://ar5iv.labs.arxiv.org/html/2006.11239/assets/images/celebahq256_header_image_4x4.png"
---

# DDPM: Diffusion Models

The 2020 paper on Denoising Diffusion Probabilistic Models (DDPM) introduced a new way to generate images by reversing a process of gradual destruction. For years, generative models like GANs had dominated the field, but they were often unstable and difficult to scale. Jonathan Ho and his team proposed that instead of competing networks, a model could learn to reconstruct an image by systematically removing noise. It was a shift toward viewing generation as a steady, iterative refinement of random signals.

## The Forward and Reverse Process {#forward-reverse}

![The directed graphical model showing the step-by-step diffusion process.](https://ar5iv.labs.arxiv.org/html/2006.11239/assets/x2.png)

_The directed graphical model showing the step-by-step diffusion process._

The proposal of Denoising Diffusion Probabilistic Models (DDPM) established a generative framework that learns to reverse a gradual noise-injection process through a sequence of small, predictable steps. While earlier models like GANs relied on a competitive adversarial objective, DDPM employs a denoising objective where a U-Net is trained to predict the specific Gaussian noise added to an image at each timestep. By simplifying the complex variational lower bound into a weighted Mean Squared Error loss between the added and predicted noise, the researchers achieved a stable training process that avoids the collapse common in earlier architectures. This shift toward iterative refinement suggests that the most effective way to generate high-fidelity data is to find order within chaos through a series of local, error-driven adjustments.

## The Denoising Objective {#denoising-objective}

The reasoning behind DDPM was that predicting small changes in noise is a much easier mathematical problem than generating a complex image in a single pass. The researchers found that by optimizing a simple 'denoising' objective, the model could produce high-quality samples that rivaled those from GANs. This proved that complex distributions could be modeled through a sequence of simple, local decisions. It reveals that generation is essentially the act of finding order within chaos, one step at a time.

## The Speed Bottleneck {#sampling-speed}

While DDPM produced excellent results, the iterative nature of the reverse process made sampling very slow, requiring hundreds or thousands of steps to generate a single image. This highlighted a new trade-off in generative AI: while diffusion models are easier to train and more stable than GANs, they are much more computationally expensive at inference time. It raises the question of whether the next leap in generation will involve finding ways to skip these steps without losing the clarity of the result.

## Resources

- [Diffusion Models Paper](https://arxiv.org/abs/2006.11239) {type: article, provider: arXiv}
- [Lilian Weng: Diffusion](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/) {type: article, provider: Lilian Weng}
