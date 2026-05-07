---
title: "HHL Algorithm"
authors: "Harrow et al. (2008)"
citation: "Harrow, A. W., Hassidim, A., & Lloyd, S. (2009). Quantum algorithm for linear systems of equations. Physical review letters, 103(15), 150502."
link: "https://arxiv.org/abs/0811.3171"
slug: "hhl-algorithm"
heroImage: "https://learn.qiskit.org/content/v2/introduction/images/hhl/hhl_circuit.png"
---

# HHL Algorithm

The Harrow-Hassidim-Lloyd (HHL) algorithm addresses the fundamental computational bottleneck of solving large-scale linear systems of equations, $A\vec{x} = \vec{b}$. In classical computing, even for sparse matrices, the time complexity scales at least linearly with the dimension $N$, as merely representing the solution vector requires $O(N)$ operations. 

HHL was proposed to bypass this limitation in scenarios where the full solution vector is not required, but rather an approximation of a summary statistic or expectation value. By representing the problem in a quantum Hilbert space, the algorithm achieves a complexity that scales logarithmically with $N$, offering an exponential speedup for high-dimensional, well-conditioned sparse systems.

## Eigenvalue Inversion via Phase Estimation {#eigenvalue-inversion}

### Quantum Phase Estimation {#qpe-step}

The mechanism of HHL relies on the spectral decomposition of the Hermitian matrix $A$ through the interaction of three primary quantum subroutines. First, the input vector $\vec{b}$ is prepared as a quantum state $|b\rangle = \sum \beta_j |u_j\rangle$, where $|u_j\rangle$ are the eigenvectors of $A$. 

Quantum Phase Estimation (QPE) is then employed, utilizing Hamiltonian simulation ($e^{iAt}$) to extract the eigenvalues $\lambda_j$ of $A$ into an auxiliary register, resulting in the entangled state $\sum \beta_j |u_j\rangle |\lambda_j\rangle$. This step effectively labels each component of the input state with its corresponding eigenvalue, allowing the model to perform operations in the eigenbasis of the operator.

### Controlled Rotations and Post-Selection {#controlled-rotation}

The core algebraic inversion occurs through a controlled rotation of an ancillary qubit. Conditioned on the eigenvalue register $|\lambda_j\rangle$, the algorithm applies a rotation to the ancilla such that its state becomes $\sqrt{1 - (C/\lambda_j)^2}|0\rangle + (C/\lambda_j)|1\rangle$, where $C$ is a normalization constant. This rotation, specifically an $\arcsin(C/\lambda_j)$ operation, is the exact moment the inverse of $A$ enters the quantum state. 

This step encodes the reciprocal of the eigenvalue into the probability amplitude of the $|1\rangle$ state. Upon measuring the ancilla and successfully post-selecting for the $|1\rangle$ outcome, the system collapses into a state proportional to $\sum \beta_j \lambda_j^{-1} |u_j\rangle$, which is the quantum representation of the solution $|x\rangle = A^{-1}|b\rangle$. The QPE process is subsequently reversed to uncompute the eigenvalue register, leaving the solution state ready for further quantum operations.

## Matrix Inversion as a Quantum Primitive {#matrix-primitive}

### From Logic to Algebra {#logic-to-algebra}

The abstraction introduced by HHL enabled a global shift in quantum information research by demonstrating that quantum speedups are not restricted to number-theoretic problems like factoring or unstructured search. It established matrix inversion—a cornerstone of modern scientific computing—as a BQP-complete task, effectively proving that any quantum computation can be mapped onto a linear systems problem. 

However, a critical nuance in this advantage is the scaling with the condition number $\kappa$ and sparsity $s$ of the matrix. The algorithm's complexity scales as $poly(\kappa, s)$, meaning the exponential speedup over classical methods is only preserved for systems that are well-conditioned and sparse.

### Broader Implications {#implications}

This realization transformed the field, moving the focus toward quantum Basic Linear Algebra Subprograms (BLAS) and providing the theoretical foundation for quantum machine learning and the numerical solution of differential equations. 

By treating the state space of qubits as a high-dimensional vector space for linear algebra, HHL redefined the scope of quantum advantage from discrete logic to continuous functional analysis. The sensitivity of the algorithm to the condition number remains the primary constraint on its practical application, as it dictates the precision required for the eigenvalue inversion.

## Resources

- [Quantum algorithm for linear systems of equations](https://arxiv.org/abs/0811.3171) {type: article, provider: arXiv}
- [Quantum Linear Systems Algorithm: A Review](https://arxiv.org/abs/2108.09004) {type: article, provider: arXiv}
