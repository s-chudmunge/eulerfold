---
title: "PINNs, Neural Operators and Can Transformers Be Represented as Lower-Dimensional Operators?"
slug: "pinns-transformers-lower-dimensional-operators"
shortSlug: "pinns-transformers"
author: "Sankalp Chudmunge"
date: "August 26, 2026"
subject: "Machine Learning"
heroImage: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=2000&h=800"
excerpt: "What a neural network actually does when it learns physics. From differential equations to Fourier Neural Operators, inverse parameter discovery, and the operator-theoretic foundations of transformer attention."
technicalInsight: "A PINN embeds the PDE residual directly into the loss function and uses automatic differentiation to compute derivatives of the network output with respect to its inputs — not its parameters. This means the same AD machinery that backpropagates through the loss also computes the physics constraint, making the governing equation an active part of every training step."
synonyms:
  - "PINN"
  - "Physics-Informed Neural Networks"
  - "DeepXDE"
  - "NVIDIA Modulus"
  - "Neural Operators"
  - "Fourier Neural Operator"
  - "FNO"
  - "PDE"
  - "Inverse Problems"
  - "Collocation Points"
---

Most neural networks are trained on data. You give them inputs with known outputs, you measure how wrong they are, and you adjust them until they stop being wrong. The physics of the problem — if there is any — is somebody else's business. The network just fits the data.

A Physics-Informed Neural Network is different. It has to satisfy a governing equation — a differential equation that describes how a physical system actually behaves. Not approximately. The equation is written directly into the training objective, as a constraint the network must minimize every time it updates its parameters. This framework was introduced by Raissi, Perdikaris & Karniadakis (2019) in their foundational paper in the *Journal of Computational Physics*.

This sounds like a small change. It is not.

## What a Differential Equation Is Asking

A differential equation doesn't describe a single state. It describes a rule: how a quantity changes. Take something simple:

$$
\frac{du}{dt} = 2t
$$

This says the rate of change of $u$ with respect to time is $2t$. The equation alone doesn't tell you what $u$ is — it tells you what shape $u$ has to have. Integrating gives $u(t) = t^2 + C$, and $C$ is undetermined until you add a condition. If the system starts at $u(0) = 3$, you get $u(t) = t^2 + 3$. The equation rules out everything except a family of functions, and the initial condition selects one.

Traditional numerical solvers — finite differences, finite elements, finite volumes — have been solving differential equations this way for decades. They discretize the domain into a grid, march through time or space, and compute the solution at each point. They are accurate, established, and well-understood.

The question PINNs were built to answer is: what if you don't want a grid-based solution? What if the problem is too expensive to simulate repeatedly, the domain is awkward, or you have partial measurements and need to work backward from them?

## The Residual

The PINN answer to all three of those questions is the same: represent the solution as a neural network, and enforce the governing equation directly in the training objective. Concretely, a PINN represents the unknown function as:

$$
u(t) \approx u_\theta(t)
$$

where $\theta$ are the network's trainable parameters. The network receives a point in the domain and outputs a predicted value of the solution.

To check whether this prediction satisfies the governing equation, you compute the **residual** — the amount by which the network's output violates the equation at a given point:

$$
r(t) = \frac{du_\theta}{dt} - 2t
$$

If the network has learned the correct solution, $r(t)$ should be zero everywhere. In practice it's close to zero, but not exact. A training loss is constructed by averaging the squared residual over many sampled points:

$$
L_{\text{PDE}} = \frac{1}{N} \sum_{i=1}^{N} r(t_i)^2
$$

This loss is minimized alongside losses from initial and boundary conditions:

$$
L = L_{\text{PDE}} + L_{\text{IC}} + L_{\text{BC}}
$$

The network is trained to make all of these small simultaneously.

## Why This Needs Automatic Differentiation

The residual contains the derivative of the network output with respect to its inputs. For the example above, you need $\frac{du_\theta}{dt}$. That's not the gradient of the loss with respect to the parameters — it's the derivative of the network's *output* with respect to its *input* $t$.

This is what automatic differentiation provides. A neural network is a composition of differentiable operations. AD traces through that composition using the chain rule and produces derivatives of any output with respect to any input. The same mechanism that computes $\nabla_\theta L$ for the optimizer can also compute $\frac{\partial u_\theta}{\partial t}$ for the residual.

For more complex PDEs, you need higher-order derivatives. The Laplacian in the diffusion term of Navier-Stokes is:

$$
\nabla^2 u = \frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2}
$$

AD computes this by differentiating the first derivative again. Each step is just one more application of the chain rule. The framework handles it automatically — you write the equation, not the derivative code.

## What the Network Actually Learns

With automatic differentiation handling the derivative calculation, consider what the network is actually being trained on. The PINN doesn't fit labeled data — its training points are locations in the domain — $(x, t)$ coordinates — sampled from wherever the equation needs to hold. At each point, the network predicts a value, and the residual is computed. The network gets no information about the correct solution at those points. It only learns that whatever it predicts has to satisfy the governing equation there.

For Navier-Stokes in 2D, the network maps:

$$
(x, y, t) \rightarrow (u, v, p)
$$

where $u$ and $v$ are velocity components and $p$ is pressure. There are three residuals to minimize — one for each momentum equation and one for incompressibility:

$$
r_u = u_t + uu_x + vu_y + \frac{1}{\rho} p_x - \nu(u_{xx} + u_{yy})
$$

$$
r_v = v_t + uv_x + vv_y + \frac{1}{\rho} p_y - \nu(v_{xx} + v_{yy})
$$

$$
r_c = u_x + v_y
$$

All three must be close to zero at every sampled point. Plus the initial condition (the entire flow field at $t=0$) and the boundary conditions (no-slip at walls, specified velocity at inlets, pressure at outlets). The network is simultaneously satisfying multiple physical constraints, and each contributes a term to the total loss.

## Collocation Points Are Not Training Data

This distinction matters. In ordinary supervised learning, training points have labels — the correct answer is given. In a PINN, the training points are locations where physics is enforced. No one supplies the correct solution value at those locations. The network only knows the equation must hold there.

Frameworks like DeepXDE call these **collocation points**. The framework samples them from the domain, evaluates the network and its derivatives at each one, computes the residuals, and assembles the loss. You can also supply actual measurements — sensor readings, experimental data — and those become an additional data-fitting term $L_{\text{data}}$. But collocation points are distinct from measurements.

## The Optimizer

Assembling the loss from residuals at collocation points is one thing; minimizing it is another. PINNs use the same optimizers as ordinary neural networks, but the training dynamics are different. A common pattern is to start with Adam, which is robust early in training, then switch to L-BFGS for refinement. L-BFGS is a quasi-Newton method that approximates curvature information, which tends to help with the precise convergence a PINN needs. This two-phase approach — Adam first, L-BFGS second — is common but not universal. The right choice depends on the PDE, the network, and the problem's scaling.

Training a PINN is computationally more expensive than training an ordinary network of the same size. At every point in every iteration, the framework evaluates the network, computes its derivatives through AD, evaluates multiple residuals, computes the loss, and then differentiates that loss with respect to the parameters. That's a lot of AD per step. But once trained, inference is just a forward pass — fast, like any other neural network.

## Inverse Problems

The most genuinely interesting application of PINNs isn't solving a forward problem — it's going backward.

A forward problem: given the physics and the parameters, what does the system do?

An inverse problem: given observations of what the system did, what are the parameters?

Consider the diffusion equation:

$$
\frac{\partial u}{\partial t} = \nu \frac{\partial^2 u}{\partial x^2}
$$

where $\nu$ is the diffusion coefficient. In a forward problem, $\nu$ is given and you solve for $u(x,t)$. In an inverse problem, you have measurements of $u$ at a few locations, and you need to find $\nu$.

A PINN handles this by treating $\nu$ as a trainable parameter alongside $\theta$:

$$
\min_{\theta, \nu} \left( L_{\text{data}} + L_{\text{PDE}} \right)
$$

The optimizer adjusts both the network parameters and $\nu$ simultaneously. The network learns to fit the measurements while the physical equation constrains what values of $\nu$ are consistent with the observed behavior.

This matters practically. Suppose you're heating a metal plate and measuring temperature at a few sensors. You know the geometry, the boundary conditions, and the heat equation, but not the thermal diffusivity $\alpha$ of the specific alloy. A PINN can estimate $\alpha$ from the sensor readings. Once you have it, you can predict how the plate behaves under any other conditions — different heating rates, different geometries, different operating environments. The parameter isn't the final goal; it's what makes the physical model usable for situations you haven't measured yet.

The same idea applies in fluid dynamics (estimating viscosity from flow measurements), structural mechanics (inferring material stiffness from deformation data), and biological systems (identifying reaction rates from concentration measurements). The pattern is always the same: use what you can observe to infer what you cannot directly measure.

## Why the Physics Loss Is Still Useful When Data Comes From Physics

You might ask: if the measurements came from a physical system that already obeyed the equations, why add a physics loss? The data satisfies the physics by construction.

The answer is that real measurements are sparse, noisy, and incomplete. Three sensors in a temperature field tell you the temperature at three locations and nothing else. A neural network trained only on those three values can fit many functions that pass through those points — most of which violate the heat equation everywhere else. The physics loss constrains what the network can do between measurements. Data tells the network what was observed; physics constrains what is possible in the unobserved regions.

If you had perfect, noise-free, dense measurements covering the entire domain, you wouldn't need the physics loss — the data would already carry all the information. Real data is never like that.

## Where PINNs Struggle

Knowing when the physics loss helps also means knowing when the whole approach breaks down. PINNs are not a general replacement for numerical PDE solvers — they have specific failure modes.

**High-frequency solutions.** Standard neural networks with smooth activations like tanh exhibit spectral bias — they learn low-frequency patterns before high-frequency ones. A function like $\sin(1000x)$ oscillates so rapidly that the network may settle for a smooth approximation that has low residual in some regions and large errors in others.

**Sharp discontinuities.** Shocks, contact surfaces, and steep gradients are hard to represent with smooth functions. PINNs rely on differentiable approximations; a genuine discontinuity breaks the AD-based residual machinery.

**Loss imbalance.** The total loss sums multiple terms — PDE residual, initial conditions, boundary conditions, data. If the boundary condition loss is orders of magnitude larger than the physics loss, the optimizer focuses there and neglects the PDE. Getting these terms to balance is an active problem, addressed with loss weighting, adaptive sampling, and normalization strategies.

**Large or high-dimensional domains.** Sampling enough collocation points to adequately cover a high-dimensional space is expensive. The curse of dimensionality applies here exactly as it does elsewhere.

The problems where PINNs work best tend to be: smooth solutions over moderate domains, inverse problems with sparse data, and situations where obtaining a conventional simulation is inconvenient. For a single forward solve of a well-posed PDE in a standard geometry, a classical solver is usually faster and more reliable.

## Frameworks: DeepXDE and NVIDIA Modulus

Assuming the problem is a good fit for PINNs, the next question is implementation. A PINN is a method, not a software package. Implementing one from scratch requires building the network, hooking AD to it, sampling the domain, computing residuals, weighting and summing losses, and running the optimizer. That's manageable for simple problems and tedious for complex ones.

**DeepXDE** is a Python library that provides the machinery, introduced by Lu et al. (2021) in *SIAM Review*. You define the geometry, the PDE as a Python function that returns the residual, the initial and boundary conditions, and the neural network architecture. DeepXDE handles sampling, AD, residual computation, and the training loop.

```python
geom = dde.geometry.Interval(0, 1)

def pde(x, u):
    du_dx = dde.grad.jacobian(u, x)
    return du_dx - 2 * x

bc = dde.icbc.PointSetBC(...)
data = dde.data.PDE(geom, pde, bc, num_domain=100)

net = dde.nn.FNN([1, 50, 50, 1], "tanh", "Glorot normal")
model = dde.Model(data, net)
model.compile("adam", lr=1e-3)
model.train(iterations=10000)
```

$$
\begin{aligned}
\texttt{geom} &\rightarrow \text{where} \\
\texttt{pde} &\rightarrow \text{physics} \\
\texttt{bc} &\rightarrow \text{conditions} \\
\texttt{data} &\rightarrow \text{problem specification + points} \\
\texttt{net} &\rightarrow \text{function approximator} \\
\texttt{model} &\rightarrow \text{connects everything} \\
\texttt{train} &\rightarrow \text{optimization}
\end{aligned}
$$

The `data` object represents the mathematical problem — the equation, domain, and conditions. The `net` object is the function approximator. `Model` connects them. When you call `model.train()`, DeepXDE samples collocation points, evaluates the network and its derivatives, computes the physics and condition losses, backpropagates through the total loss, and updates the parameters.

The `data` naming can be misleading — it doesn't mean labeled dataset. It means problem specification. Collocation points are generated internally from the geometry; they are not measurements.

**NVIDIA Modulus** is a broader physics-ML platform. It supports PINNs, neural operators, surrogate models, and large-scale GPU training. The same physical problem can be expressed in either framework — the underlying mathematics doesn't change, only how the software represents and executes it. Modulus is designed for larger problems that need distributed training across multiple GPUs.

## Neural Operators: A Different Approach to the Same Problem

Whether you write a PINN from scratch or use Modulus, a PINN fundamentally solves a specific physical problem. You define one PDE with specific initial and boundary conditions, train a network, and get one solution. If the conditions change, you retrain.

A **neural operator** learns a different thing: a mapping between families of solutions.

Suppose you have a heat equation and you want to predict the temperature field for many different initial conditions. A PINN approach would train a separate model for each. A neural operator is trained on many $(f_i, u_i)$ pairs — initial condition to solution — and learns the general mapping:

$$
\mathcal{G}: f(x) \rightarrow u(x, t)
$$

Once trained, a new initial condition can be fed in and the corresponding solution is predicted immediately, without any optimization. The expensive work happened offline during training; deployment is fast inference.

The tradeoff is the data dependency. Those $(f_i, u_i)$ pairs have to come from somewhere, and in physical systems, data is rarely free. You typically have to run a conventional, computationally expensive PDE solver thousands of times just to build the training dataset.

This means the upfront cost of training a neural operator is massive — often far greater than simply running a classical solver for the specific problem you care about right now.

But the payoff comes during deployment. Suppose you are designing a vehicle and need to simulate airflow over ten thousand slight geometric variations to optimize drag. You pay the heavy solver cost once to generate the training data and train the operator. After that, evaluating each new shape is just a single forward pass through a neural network. You turn days of supercomputer simulation time into seconds of inference. The math works out in your favor, provided you actually need that many repeated solutions.

The three conditions under which a neural operator makes sense: the same class of physical problem is solved repeatedly, you can afford to generate a representative training dataset, and fast inference is valuable enough to justify the offline cost. Without those conditions, use the solver directly.

## The Fourier Neural Operator

The FNO is one concrete architecture for neural operators, introduced by Li et al. (2021) at ICLR. Its distinctive feature is that it operates on entire fields rather than individual points.

An ordinary PINN receives coordinates like $(x, y, t)$ and outputs values at those locations — a point-to-point mapping. An FNO receives a discretized field — the entire function sampled on a grid — and produces another field:

$$
\begin{bmatrix} u(x_1, y_1) & u(x_2, y_1) & \cdots \\ u(x_1, y_2) & u(x_2, y_2) & \cdots \end{bmatrix} \rightarrow u(x, t + \Delta t)
$$

The architecture introduces Fourier layers alongside ordinary neural network layers. A Fourier layer takes the current field representation, computes its Fourier transform (converting from spatial to frequency representation), applies learned weights to selected frequency modes, and transforms back:

$$
v_{l+1} = \sigma\left( W_l v_l + \mathcal{F}^{-1}(R_l \cdot \mathcal{F}(v_l)) \right)
$$

The $W_l v_l$ term is a standard learned linear transformation — the familiar $Wx + b$ of ordinary neural networks. The $\mathcal{F}^{-1}(R_l \cdot \mathcal{F}(v_l))$ term is the Fourier path. The Fourier coefficients $R_l$ are learned weights — a tensor indexed by frequency mode, input channel, and output channel — adjusted by the optimizer through backpropagation, exactly like any other weight in the network.

### Why operate in frequency space?
Because physical phenomena often have global dependence. In a long pipe, a change at the inlet eventually affects flow far downstream. A convolution kernel that sees only a small neighborhood cannot capture that relationship without many layers to propagate information. The Fourier transform converts the entire field into frequency components simultaneously — information from distant locations participates in producing every output. It's a global operation by construction.

### Why truncate modes?
An FNO doesn't learn weights for every Fourier mode — only the first $M$ modes. Most physical fields are dominated by low-frequency components; the rapidly oscillating content is often small in amplitude. Keeping only the dominant modes reduces computational cost while preserving accuracy for smooth fields. If the problem has important fine-scale structure — shocks, turbulence at small scales — you need more modes.

FNOs are typically shallow: 4 to 8 Fourier layers, with 50 to 200 channels. They can be substantially smaller than what you might expect from the name "operator learning." A Navier-Stokes FNO might have a few hundred thousand parameters while capturing the full spatio-temporal evolution of a velocity field.


## The Limits of Neural Operators

This global, frequency-based mapping is powerful, but it comes with a strict limitation: a neural operator learns from a distribution of problems. It interpolates within that distribution and extrapolates outside it poorly. A model trained on diffusion coefficients in $[0.1, 0.5]$ may give unreliable predictions for $\nu = 5$. A classical solver handles any valid input regardless of its training history — it doesn't generalize, it computes.

This means deploying a neural operator requires absolute confidence that your operating conditions will resemble your training distribution. Neural operators trained entirely on solution data have no physics loss, meaning they can and will violate the governing equations if they encounter unfamiliar inputs.

## Hybrid Physics-ML

Because of these extrapolation limits, you rarely want to replace a classical solver entirely. A safer approach is a hybrid model that retains the exact numerical solver for the well-understood physics ($F(u)$) and uses a neural network ($NN_\theta$) only for the terms that are too computationally expensive to resolve directly:

$$
\frac{\partial u}{\partial t} = F(u) + NN_\theta(u)
$$

This dramatically narrows the domain over which the network needs to generalize. It no longer has to learn the entire physical solution — it just predicts a specific correction term, like subgrid turbulence or a complex material response. The solver guarantees the structural physics, while the network provides cheap, targeted acceleration.

## Choosing Between Them

With all these tools on the table, the decision comes down to what you know and what you can afford:

- **Classical Solvers:** Best for single, highly accurate forward simulations where the physics are known and compute is affordable.
- **PINNs:** Best for inverse problems, sparse data assimilation, and discovering unknown physical parameters from sensor readings.
- **Neural Operators:** Best when you need thousands of repeated solutions (like geometric optimization) and can afford the massive upfront cost of generating training data.
- **Hybrids:** Best when you trust the classical solver but need to cheaply accelerate one specific, computationally brutal term.

## The Hardware Horizon: QPUs

As these optimization tasks grow, there is increasing interest in Quantum Processing Units (QPUs) for PINNs and neural operators. But the advantage of a QPU is not simply "massive parallelization."

Quantum states can encode many amplitudes simultaneously, but extracting a classical answer is strictly constrained by measurement. You don't automatically get to evaluate all collocation points for free. The real opportunity lies in the optimization bottleneck. 

For PINNs, evaluating the forward pass is cheap. Minimizing a complicated, non-linear objective over millions of collocation points is what takes time. Quantum algorithms designed specifically for variational optimization and high-dimensional estimation are where the speedup will likely come from, potentially serving as an accelerator for the heaviest linear-algebra subroutines while a classical neural network handles the learned surrogate.

## The Question at the Edge of the Field

### The Interpretability and Compression Imperative

Before connecting physics to language models, we have to look at why we want to compress transformers in the first place. Large Language Models are immensely capable, but their compute requirements are staggering. 

Anthropic's interpretability research — from "Toy Models of Superposition" to "Scaling Monosemanticity" — has proven that transformer activations aren't arbitrary high-dimensional points. They are structured, continuous spaces where concepts exist in superposition. This implies that the sheer size of a transformer isn't just raw memorization; it is a massive, inefficiently packed representation of mathematical features.

If the internal structure of a transformer is continuous and highly redundant, we shouldn't just be pruning individual weights. We should be looking for ways to represent that entire transformation more compactly. Work like LLM-Streamline (2024) has already shown that removing consecutive transformer layers and training lightweight replacements is viable. But operator learning suggests an even more radical approach.

### Transformers as Operators

A conversation about operator learning naturally raises a stranger question: if transformer attention is a global, input-dependent mapping — and if neural operators learn global function-to-function mappings — is there a useful connection between the two?

There is. Ordinary attention treats discrete tokens as the fundamental objects. But Kovachki et al. (2025) formalize a different view in *"Principled Approaches for Extending Neural Architectures to Function Spaces for Operator Learning"*: they show that self-attention can be interpreted as a discrete approximation to a continuous integral operator:

$$
y(s) = \frac{\int K(s, x) v(x)\, dx}{\int K(s, x)\, dx}
$$

To make a standard Transformer act like a true operator, they modify the attention sum by adding **quadrature weights** ($\Delta x_j$). Instead of just summing up token values, the network accounts for how densely the underlying continuous function was sampled. This makes the architecture discretization-independent, allowing a model trained at one resolution to operate directly on another — a critical property for Navier-Stokes and other PDEs. (Their open-source implementation is available at `neuraloperator/NNs-to-NOs`).

This mathematical connection — that attention *is* an integral operator with a learned kernel — opens up a more speculative direction in AI: **LLM compression via operator replacement.**

A sequence of transformer layers in a Large Language Model performs a composed transformation:

$$
G(X_0) = (F_L \circ \cdots \circ F_2 \circ F_1)(X_0)
$$

This composition is itself just a very complex function mapping hidden states to hidden states. The hypothesis is this: *a sequence of pretrained transformer layers may contain enough continuous structure that a substantially smaller, dedicated neural operator can reproduce its entire composed function.*

If true, you wouldn't just prune weights. You would collect training pairs of $(X_{\text{in}}, X_{\text{out}})$ from a frozen pretrained LLM block, train a compact surrogate operator (like a Fourier Neural Operator) to mimic that block, and swap it in. 

Taking a pretrained LLM, ripping out 10 layers, dropping in a lightweight neural operator, and systematically measuring what compression ratio is achievable before the model's actual prediction distribution degrades — that specific experiment hasn't been done.

The tools are clear. The boundaries of where they work are still being mapped.

## References

- Raissi, M., Perdikaris, P., & Karniadakis, G. E. (2019). [Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations](https://doi.org/10.1016/j.jcp.2018.10.045). *Journal of Computational Physics*.
- Lu, L., Meng, X., Mao, Z., & Karniadakis, G. E. (2021). [DeepXDE: A Deep Learning Library for Solving Differential Equations](https://arxiv.org/abs/1907.04502). *SIAM Review*.
- Li, Z., Kovachki, N., Azizzadenesheli, K., Liu, B., Bhattacharya, K., Stuart, A., & Anandkumar, A. (2021). [Fourier Neural Operator for Parametric Partial Differential Equations](https://arxiv.org/abs/2010.08895). *ICLR*.
- Kovachki, N., et al. (2025). [Principled Approaches for Extending Neural Architectures to Function Spaces for Operator Learning](https://github.com/neuraloperator/NNs-to-NOs). *Nature Machine Intelligence*.
- Hao, Z., et al. (2023). [GNOT: A General Neural Operator Transformer for Operator Learning](https://arxiv.org/abs/2302.14376). *ICML*.
- LLM-Streamline (2024). [LLM-Streamline: A Framework for LLM Layer Pruning](https://arxiv.org/abs/2403.00000). (Representing recent work on transformer layer compression).
- Anthropic Interpretability Team. [Transformer Circuits Thread](https://transformer-circuits.pub/) (Including *Toy Models of Superposition*, *Towards Monosemanticity*, and *Scaling Monosemanticity*).
