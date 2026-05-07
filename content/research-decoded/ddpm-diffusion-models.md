---
title: "DDPM: Diffusion Models"
authors: "Ho et al. (2020)"
citation: "Ho, J., Jain, A., & Abbeel, P. (2020). Denoising diffusion probabilistic models. Advances in neural information processing systems, 33, 6840-6851."
link: "https://arxiv.org/abs/2006.11239"
slug: "ddpm-diffusion-models"
heroImage: "https://ar5iv.labs.arxiv.org/html/2006.11239/assets/images/celebahq256_header_image_4x4.png"
---

# DDPM: Diffusion Models

Denoising Diffusion Probabilistic Models (DDPM), introduced by Ho et al. in 2020, marked a significant shift in generative modeling, moving away from the competitive dynamics of GANs toward a process of iterative refinement. The core idea is to transform a simple noise distribution into a complex data distribution by reversing a gradual degradation process. This approach treats generation as a sequence of small, manageable denoising steps, effectively breaking down a complex global mapping into a series of local, learnable transitions.

## The Forward Diffusion Process {#forward-process}

![The directed graphical model showing the step-by-step diffusion process.](https://ar5iv.labs.arxiv.org/html/2006.11239/assets/x2.png)

_The directed graphical model showing the step-by-step diffusion process._

The technical foundation of DDPM is the forward diffusion process, a Markov chain that gradually adds Gaussian noise to the data over $T$ steps. This process is governed by a fixed variance schedule $\beta_t$, which determines the amount of noise injected at each step. As $t$ increases, the original structure of the data is slowly erased until it becomes indistinguishable from pure white noise. A key technical property of this process is that any state $x_t$ can be sampled directly from the original data $x_0$ using a closed-form Gaussian distribution, allowing for efficient training without needing to simulate the entire chain. This forward process effectively sets the "boundary conditions" for the generative model, defining the noisy manifold that the reverse process must learn to navigate.

## The Reverse Denoising Objective {#reverse-process}

The goal of the generative model is to learn the reverse process: how to transition from $x_t$ back to $x_{t-1}$. Because the reverse steps are small, they can be accurately modeled as Gaussian distributions. DDPM simplifies this learning task by training a neural network to predict the noise $\epsilon$ that was added to $x_0$ to produce $x_t$, rather than predicting the clean image directly. This objective, known as denoising score matching, is mathematically equivalent to maximizing a variational lower bound on the log-likelihood of the data. By focusing on noise estimation, the model learns to identify the local "gradient" of the data distribution, allowing it to iteratively pull noisy samples toward the high-density regions of the data manifold.

## The U-Net Architecture and Noise Estimation {#unet-architecture}

To implement this noise estimation, DDPM utilizes a U-Net architecture characterized by its symmetric encoder-decoder structure and residual connections. The network takes the noisy image $x_t$ and the time step $t$ as inputs and outputs a predicted noise map of the same dimensions. The time step is typically encoded using sinusoidal embeddings, allowing the network to modulate its behavior based on the current noise level. This architecture is particularly effective because the skip connections preserve the spatial information needed for high-fidelity reconstruction at later stages of the reverse process. This engineering choice proved that the success of diffusion models is as much a result of architectural inductive biases as it is of the underlying probabilistic framework.

## Iterative Refinement and Sampling {#sampling-logic}

Sampling from a trained DDPM involves starting with a sample of pure noise $x_T$ and iteratively applying the learned reverse transitions to reach $x_0$. At each step, the model predicts the noise, subtracts a portion of it, and adds a small amount of controlled randomness to prevent the process from collapsing into a single point. This iterative refinement allows the model to "hallucinate" fine details that were lost during the forward process. Unlike single-step generative models, the multi-step nature of diffusion allows for a more stable and diverse sampling process, as the model has $T$ opportunities to correct its path toward the data manifold. This finding revealed that complexity in generation is best achieved through a high number of simple, reversible operations.

## The Abstraction of Score-Based Modeling {#score-based-modeling}

The success of DDPM provided a unified view of generative modeling as a form of score-based estimation. It demonstrated that any data distribution can be represented by its "score function"—the gradient of the log-probability density. Diffusion models effectively learn to navigate this gradient field, proving that the most efficient way to represent a complex distribution is not to model its density directly, but to model the force that pulls points toward its center. This abstraction has since been extended to continuous-time processes using Stochastic Differential Equations (SDEs), suggesting that the discrete steps of DDPM are just one instance of a much broader class of physical-inspired generative processes. It raises the question of whether all human creativity can be modeled as the iterative denoising of a universal noise source.

## Resources

- [Diffusion Models Paper](https://arxiv.org/abs/2006.11239) {type: article, provider: arXiv}
- [Lilian Weng: Diffusion](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/) {type: article, provider: Lilian Weng}
