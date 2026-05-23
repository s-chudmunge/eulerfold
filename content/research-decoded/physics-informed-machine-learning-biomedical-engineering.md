---
title: "Physics-Informed AI for Medical Discovery"
authors: " Accepted in Annual Review of Biomedical Engineering, 2025"
citation: "arXiv:2510.05433"
link: "https://arxiv.org/abs/2510.05433"
slug: "physics-informed-machine-learning-biomedical-engineering"
heroImage: "https://ar5iv.labs.arxiv.org/html/2510.05433/assets/x1.png"
---

In 2025, researchers provided a comprehensive framework for the integration of physical laws into deep learning architectures for biomedical engineering, established a new standard for high-fidelity clinical modeling. This research addresses the primary bottleneck in the application of AI to biology: the extreme scarcity and inherent noise of experimental data. While standard neural networks often produce results that violate the conservation of mass or momentum, Physics-Informed Machine Learning (PIML) embeds governing differential equations directly into the model's structure. The researchers demonstrated that this approach enables the accurate reconstruction of 3D biological systems from sparse 2D data, providing a robust methodology for real-time parameter discovery in mechanobiology and biofluids.

## Sparse Clinical Data and Physical Consistency {#problem-space}

The application of deep learning to biomedical systems is frequently limited by data that is too sparse to resolve complex dynamics, such as the noisy displacement fields in medical imaging or the intermittent sampling of clinical sensors. Standard statistical mappings can easily "overfit" to these sparse samples, leading to predictions that are physically impossible. PIML resolves this by restricting the neural network's search space to only those configurations that satisfy the known laws of nature. This finding established that the most effective way to compensate for missing data is to provide the machine with a formal mathematical "prior" based on the governing partial differential equations (PDEs) of the biological system.

## PINNs, Neural ODEs, and Operator Learning {#mechanism}

The framework utilizes three primary architectural models to achieve physical grounding: Physics-Informed Neural Networks (PINNs), Neural Ordinary Differential Equations (NODEs), and Neural Operators (NOs). In the PINN framework, the governing PDE—such as the Navier-Stokes equations for blood flow—is treated as a soft constraint within the loss function. Automatic differentiation is used to compute the "physics residual," ensuring that the network's output respects the physical laws at every coordinate. Neural ODEs treat the network as the vector field of a continuous-time system, while Neural Operators learn a mapping between entire function spaces rather than specific points. This methodological choice proved that the stability of a biological model is a function of its architectural alignment with the continuous-time dynamics of life.

## Real-Time Parameter Discovery in Biomechanics {#abstraction}

The technical significance of PIML is its ability to solve inverse problems, where unknown physical parameters—such as tissue stiffness or fluid permeability—must be inferred from observable behavior. By treating these parameters as trainable weights within the network, researchers can simultaneously simulate a system and discover its underlying material properties. For instance, in mechanobiology, these models have been used to identify the collagen fiber orientations in heart valves from noisy 3D imaging data. This application revealed that the most robust way to extract knowledge from clinical data is to treat the neural network as a differentiable laboratory where physics and data are iteratively reconciled.

## Impact on Cardiovascular Modeling and Neuromorphic Engineering {#applications}

The practical success of PIML is most evident in the field of cardiovascular modeling, where Artificial Intelligence Velocimetry (AIV) can reconstruct high-resolution 3D blood flow fields from sparse 2D tracer data. Similarly, in neuroengineering, models like CortexODE utilize continuous vector fields to simulate the deformation of brain surfaces while preserving complex topologies. This achievement demonstrated that the scalability of biomedical AI depends on the adoption of "gray-box" architectures that combine the interpretability of mechanistic models with the expressive power of deep learning. The work transformed the Act of medical simulation into an automated process of structural inference, suggesting that the path to personalized medicine lies in the systematic management of biological uncertainty.

## Resources

- [PIML in Biomedical Engineering Review (Official arXiv)](https://arxiv.org/abs/2510.05433) {type: article, provider: arXiv}
- [DeepXDE: Library for Physics-Informed Learning](https://deepxde.readthedocs.io/) {type: tool, provider: GitHub}
- [PINNs for Fluid Dynamics (Video)](https://www.youtube.com/watch?v=S0Y1nS-FfP8) {type: video, provider: Brown University}
- [CortexODE Implementation](https://github.com/m-qiang/CortexODE) {type: tool, provider: GitHub}
