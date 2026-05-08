---
title: "KAN: Kolmogorov-Arnold Networks"
authors: "Liu et al. (2024)"
citation: "Liu, Z., Wang, Y., Vaidya, S., ... & Tegmark, M. (2024). KAN: Kolmogorov-Arnold Networks. arXiv preprint arXiv:2404.19756."
link: "https://ar5iv.org/abs/2404.19756"
slug: "kan-kolmogorov-arnold-networks"
heroImage: "https://ar5iv.labs.arxiv.org/html/2404.19756/assets/x1.png"
---

# KAN: Kolmogorov-Arnold Networks

The structural foundation of deep learning has been dominated for decades by the Multi-Layer Perceptron (MLP), which interleaves linear weight matrices with fixed non-linear activation functions situated at the nodes. This design choice creates a fundamental limitation where the network's expressive power is tied to the width and depth of its static nodes, while the internal degrees of freedom of the activations themselves remain unused. 

Consequently, MLPs often require a massive expansion in parameter count to approximate complex functions, leading to the "curse of dimensionality" and a lack of transparency in the resulting high-dimensional representations. The proposal of Kolmogorov-Arnold Networks (KANs) challenges this status quo by fundamentally reorganizing the computational graph based on the **Kolmogorov-Arnold representation theorem**.

## Learnable Activations on Edges {#learnable-activations}

![MLPs vs. Kolmogorov-Arnold Networks (KANs)](https://ar5iv.labs.arxiv.org/html/2404.19756/assets/x1.png)

_The structural shift: moving activation functions from nodes (MLPs) to edges (KANs)._

Kolmogorov-Arnold Networks rethink the structure of a neural network by shifting the learnable parameters from the nodes to the edges. Grounded in the Kolmogorov-Arnold representation theorem, a KAN replaces every traditional "weight" with a learnable univariate function, while the nodes perform a simple summation of the incoming signals. 

This adjustment allows for "grid extension," where the granularity of the spline grids can be increased to improve accuracy without requiring the model to be retrained from scratch. This finding revealed that capture complex non-linearities can be achieved with orders of magnitude fewer parameters than an MLP would require, simply by optimizing the internal flexibility of the edges.

## B-Splines: The Mathematical Engine {#b-splines}

The "weights" in a KAN are actually **B-splines**—piecewise polynomial functions that are highly flexible and computationally efficient. Each edge activation $\phi_{i,j}$ is defined as a linear combination of these basis functions. 

Because B-splines are defined locally (they only have non-zero values over a small range of the input), the model can learn complex, wiggly functions with very few coefficients. This mathematical engine is what gives KANs their superior approximation power for smooth functions, proving that the rigid activation functions of the past (like ReLU or GELU) were a significant bottleneck for scientific and mathematical modeling.

## Grid Extension and Adaptive Accuracy {#grid-extension}

One of the most powerful features of KANs is **grid extension**. In a traditional neural network, if you want more accuracy, you must add more neurons and restart training. In a KAN, you can simply increase the number of intervals in the B-spline grid. 

By interpolating the existing learned function onto a finer grid, the model can continue training with higher resolution without losing its previous knowledge. This engineering choice allows for "adaptive accuracy," where a model can be quickly prototyped on a coarse grid and then refined for high-precision scientific tasks. It revealed that the "resolution" of a model's understanding is a tunable parameter, much like the resolution of an image.

## Symbolification and the Discovery of Laws {#symbolification}

Beyond parameter efficiency, KANs provide a unique path toward scientific discovery through **symbolification**. Because the activation functions on the edges are univariate, they can be visualized and manually fitted to symbolic forms like sines, exponentials, or logarithms. 

If a KAN learns an activation that looks like a sine wave, the researcher can "fix" that edge to be a symbolic $\sin(x)$ function and retrain the rest of the network. This allows the network to reveal the underlying mathematical laws of a dataset. This shift transformed the neural network from a "black box" into a "collaborative scientist," proving that AI can help humans discover the simple equations that govern complex data.

## Interpretability and Continual Learning {#interpretability-learning}

Beyond parameter efficiency, KANs naturally avoid the problem of catastrophic forgetting in continual learning. This advantage is a result of the local support of the B-spline basis functions; updating a specific region of the input space only affects the local spline coefficients for that region, preserving the knowledge stored in other parts of the network. 

However, this interpretability comes with a **trade-off**: KANs are currently much slower to train than MLPs on modern GPUs, as the spline computations are harder to parallelize than simple matrix multiplications. This finding revealed that the path to general intelligence may lie in architectures that favor structural flexibility and transparency, even if they require a move away from the "brute force" hardware optimizations of the current era.

## Resources

- [KAN Paper on arXiv](https://arxiv.org/abs/2404.19756) {type: article, provider: arXiv}
- [Official KAN Implementation](https://github.com/KindXiaoming/pykan) {type: code, provider: GitHub}
- [Kolmogorov-Arnold Networks Blog Post](https://kindxiaoming.github.io/pykan/) {type: article, provider: MIT}

## Resources

- [KAN Paper on arXiv](https://arxiv.org/abs/2404.19756) {type: article, provider: arXiv}
- [Official KAN Implementation](https://github.com/KindXiaoming/pykan) {type: code, provider: GitHub}
- [Kolmogorov-Arnold Networks Blog Post](https://kindxiaoming.github.io/pykan/) {type: article, provider: MIT}
