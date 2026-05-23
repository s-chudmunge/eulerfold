---
title: "DDPM: Diffusion Models"
authors: "Ho et al. (UC Berkeley, 2020)"
citation: "Ho, J., Jain, A., & Abbeel, P. (2020). Denoising diffusion probabilistic models. Advances in neural information processing systems, 33, 6840-6851."
link: "https://arxiv.org/abs/2006.11239"
slug: "ddpm-diffusion-models"
heroImage: "https://ar5iv.labs.arxiv.org/html/2006.11239/assets/images/celebahq256_header_image_4x4.png"
---

In 2020, Jonathan Ho and colleagues introduced Denoising Diffusion Probabilistic Models (DDPM), a generative modeling framework that utilizes a sequence of iterative denoising steps to reconstruct data from Gaussian noise. This approach addresses the limitations of competitive architectures like GANs by framing the generation problem as the reversal of a controlled degradation process. The researchers demonstrated that by training a model to predict the noise injected into a signal at discrete time steps, high-fidelity synthesis can be achieved through a stable, non-adversarial optimization objective.

## The Forward Diffusion Markov Chain {#forward-process}

![The directed graphical model showing the step-by-step diffusion process.](https://ar5iv.labs.arxiv.org/html/2006.11239/assets/x2.png)

_The directed graphical model showing the step-by-step diffusion process._

The technical foundation of DDPM is the forward diffusion process, a fixed Markov chain that gradually perturbs a data sample $x_0$ by adding Gaussian noise over $T$ steps. This process is defined by a variance schedule $\beta_t$, ensuring that as $t$ approaches $T$, the original structure of the data is erased, resulting in a sample that is statistically indistinguishable from isotropic white noise. A critical technical property of this chain is that any state $x_t$ can be expressed as a closed-form conditional distribution of $x_0$, allowing for efficient training without the need to simulate the intermediate states. This finding established that the "boundary conditions" for generative modeling can be formally defined through a predefined stochastic process.

## Reverse Denoising and Score-Based Optimization {#reverse-process}

The generative capability of DDPM is derived from its ability to approximate the reverse diffusion process, which transitions from $x_t$ back to $x_{t-1}$. Because the forward steps are small, the reverse transitions are also modeled as Gaussian distributions. The researchers simplified the learning task by training a neural network to predict the specific noise vector $\epsilon$ that was added to $x_0$ to produce $x_t$, rather than predicting the clean data directly. This objective is equivalent to denoising score matching, where the model learns the gradient of the log-probability density of the data at various noise levels. This methodological choice revealed that high-dimensional synthesis is most effectively achieved by navigating the "force field" that pulls noisy samples toward the data manifold.

## U-Net Architecture and Time-Dependent Conditioning {#unet-architecture}

To implement the reverse process, DDPM utilizes a U-Net architecture characterized by symmetric encoder-decoder blocks and residual skip connections. The network receives the noisy sample $x_t$ and a sinusoidal embedding of the time step $t$, allowing the model to adapt its denoising strategy to different noise regimes. At large values of $t$, the network focuses on global semantic structure, while at small values, it refines high-frequency textural details. This finding demonstrated that the success of diffusion models is dependent on architectural inductive biases that preserve spatial information while integrating global temporal context. The design effectively digitalized the act of progressive refinement, enabling the reconstruction of complex visual patterns from total entropy.

## Stochastic Sampling and Iterative Refinement {#sampling-logic}

Sampling from a trained model involves starting with a sample of pure noise $x_T$ and iteratively applying the learned reverse transitions to reach a final sample $x_0$. At each step, a small amount of Gaussian noise is re-injected to ensure that the process remains stochastic and explores the full diversity of the data distribution. This iterative refinement allows the model to correct its trajectory over hundreds or thousands of steps, providing a level of stability and diversity that is often missing in single-pass generative models. The research established that the computational "tax" of multi-step sampling is a prerequisite for achieving the structural consistency required for high-resolution image synthesis.

## Diffusion as a Physical Intelligence Primitive {#significance}

The success of DDPM established diffusion as a foundational primitive for artificial intelligence, proving that the most robust way to model complex distributions is through the management of informational entropy. The decision to model generation as a physical process of reversal revealed that the bottleneck in previous models was the attempt to learn too large a mapping in a single step. This principle remains the central theme in the development of modern generative systems, including Latent Diffusion Models and video synthesis engines. It leaves open the question of whether these iterative processes can be further accelerated to achieve single-step efficiency without sacrificing the mathematical guarantees of the diffusion framework.

## Resources

- [Denoising Diffusion Probabilistic Models (Official arXiv)](https://arxiv.org/abs/2006.11239) {type: article, provider: arXiv}
- [What are Diffusion Models? (Lilian Weng)](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/) {type: article, provider: Blog}
- [GitHub: DDPM Implementation (PyTorch)](https://github.com/lucidrains/denoising-diffusion-pytorch) {type: code, provider: GitHub}
- [Diffusion Models Visualization (YouTube)](https://www.youtube.com/watch?v=fbLgFrlTnGU) {type: video, provider: Outlier}
