---
title: "Physics-Informed Machine Learning in Biomedical Engineering"
authors: "Accepted in Annual Review of Biomedical Engineering, 2025"
citation: "arXiv:2510.05433"
link: "https://ar5iv.org/abs/2510.05433"
heroImage: "https://ar5iv.labs.arxiv.org/html/2510.05433/assets/x1.png"
slug: "physics-informed-machine-learning-biomedical-engineering"
---

## The Constraint of Sparse Clinical Data {#problem-space}

The application of deep learning to biomedical systems is frequently limited by the scarcity and inherent noise of experimental data, such as sparse 2D fluorescent tracer measurements in cerebrospinal fluid or noisy displacement fields from medical imaging. Standard neural networks, which treat these problems as purely statistical mappings, often produce results that violate fundamental physical laws like the conservation of mass or momentum. This lack of physical grounding is particularly problematic in mechanobiology and biofluids, where the underlying dynamics are governed by well-defined partial differential equations (PDEs) that a model must respect to be clinically useful. The challenge lies in moving beyond simple data fitting toward a framework where the neural network's search space is explicitly restricted by the governing physics of the biological system.

## Embedding Differential Equations as Loss Regularizers {#mechanism}

Physics-Informed Machine Learning (PIML) addresses this by integrating physical constraints directly into the neural network's architecture or training process through three primary frameworks: Physics-Informed Neural Networks (PINNs), Neural Ordinary Differential Equations (NODEs), and Neural Operators (NOs). In the PINN framework, the governing PDE—such as the Navier-Stokes equations for blood flow—is treated as a soft constraint within the loss function. Automatic differentiation is used to compute the partial derivatives of the network's output with respect to its inputs, allowing the model to evaluate a "physics residual" at specific collocation points. The training process then minimizes a composite loss function that balances data fidelity with the degree to which the network satisfies the underlying differential equations, effectively using the physics as a structural regularizer that compensates for sparse data.

Neural ODEs shift this logic by defining the neural network as the vector field of a continuous-time system, where the state evolves through an ODE solver rather than discrete layers. This approach is particularly effective for systems like CortexODE, which learns a velocity field to continuously deform brain surfaces while preserving complex topologies. Neural Operators represent a further abstraction by learning a mapping between entire function spaces rather than specific coordinate points. By using architectures like DeepONet, which separates the input function processing into a branch network and evaluation coordinates into a trunk network, these models can provide near-instantaneous inference of full solution fields once trained. This allows for real-time parameter discovery, such as simultaneously inferring tissue stiffness and velocity fields from noisy clinical measurements.

## Real-Time Parameter Discovery and Reconstruction {#abstraction}

The abstraction of physical laws into the neural network training loop enables the solution of complex inverse problems that were previously computationally prohibitive. In biofluids, Artificial Intelligence Velocimetry (AIV) uses PINNs to reconstruct 3D velocity and pressure fields from sparse 2D imaging data by enforcing incompressibility and momentum balance. In mechanobiology, Peridynamic Neural Operators (PNO) have been applied to learn nonlocal constitutive laws for heart valves, accurately predicting stress fields and collagen fiber orientations from displacement data. By treating physical parameters like permeability or elasticity as trainable weights, these models transform the neural network into a tool for simultaneous simulation and material property discovery. The convergence of mechanistic modeling and deep learning suggest a shift toward "gray-box" systems where the known physics provides the foundation and the neural network learns the remaining, unmodeled biological complexities.

## Resources {#resources}

- [PIML in Biomedical Engineering Review](https://ar5iv.org/abs/2510.05433) {type: article, provider: ar5iv}
- [DeepXDE: A Library for PINNs](https://deepxde.readthedocs.io/en/latest/) {type: tool, provider: GitHub}
- [CortexODE Implementation](https://github.com/m-qiang/CortexODE) {type: tool, provider: GitHub}
