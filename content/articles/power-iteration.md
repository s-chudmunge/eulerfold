---
title: "Why Power Iteration Works"
slug: "power-iteration"
shortSlug: "power-iteration"
author: "Sankalp — Engineering Lead"
date: "August 13, 2026"
subject: "Linear Algebra & Numerical Methods"
heroImage: "https://ctp.cc.au.dk/w/images/f/f0/Avocado-armchair.png"
excerpt: "Power iteration turns eigenvector discovery into repeated matrix multiplication. By leveraging spectral gaps, non-dominant components exponentially decay into numerical noise."
technicalInsight: "Repeated multiplication by a matrix exponentially amplifies a vector's component along the dominant eigenvector relative to all other components at a rate dictated by the ratio |λ2 / λ1|."
synonyms:
  - "Power Iteration"
  - "Dominant Eigenvector"
  - "Spectral Gap"
  - "PageRank Matrix"
  - "Power Method"
---

Power iteration is one of those algorithms that looks too simple to work: pick a random vector, multiply it by a matrix over and over, normalize occasionally, and somehow you converge on the matrix's dominant eigenvector. No solving equations, no decompositions. Just repeated multiplication.


The reason it works comes down to one fact: repeated multiplication by a matrix amplifies the component of a vector along the dominant eigenvector's direction faster than any other component. Everything else gets drowned out.

## The setup

Take an $n \times n$ matrix $A$ with $n$ linearly independent eigenvectors $v_1, \dots, v_n$ and eigenvalues $\lambda_1, \dots, \lambda_n$, ordered by magnitude with a strict leader:

$$|\lambda_1| > |\lambda_2| \ge |\lambda_3| \ge \dots \ge |\lambda_n|$$

Since the eigenvectors are linearly independent, they form a basis. Any starting vector $x_0$, even a random guess, can be written as:

$$x_0 = c_1 v_1 + c_2 v_2 + \dots + c_n v_n$$

The only requirement is $c_1 \neq 0$: your starting guess can't be exactly orthogonal to the eigenvector you're trying to find. In practice, a random vector satisfies this with probability 1.

## What happens under repeated multiplication

Since $Av_i = \lambda_i v_i$, multiplying $x_0$ by $A$ once gives:

$$Ax_0 = c_1\lambda_1 v_1 + c_2\lambda_2 v_2 + \dots + c_n\lambda_n v_n$$

Multiplying by $A$ a total of $k$ times gives:

$$A^k x_0 = c_1\lambda_1^k v_1 + c_2\lambda_2^k v_2 + \dots + c_n\lambda_n^k v_n$$

Factor out $\lambda_1^k$:

$$A^k x_0 = \lambda_1^k \left[ c_1 v_1 + c_2\left(\frac{\lambda_2}{\lambda_1}\right)^k v_2 + \dots + c_n\left(\frac{\lambda_n}{\lambda_1}\right)^k v_n \right]$$

Every ratio $\lambda_i/\lambda_1$ for $i > 1$ has magnitude strictly less than 1, by assumption. Raise a number smaller than 1 to a large power $k$, and it goes to zero. So as $k \to \infty$, every term except the first vanishes:

$$A^k x_0 \approx \lambda_1^k c_1 v_1$$

What's left points in the direction of $v_1$. The magnitude blows up or shrinks depending on whether $|\lambda_1|$ is above or below 1, which is why implementations normalize the vector at each step. Normalizing removes the runaway $\lambda_1^k$ scalar and leaves the direction, which is the only thing you actually want.

## What determines convergence speed

The convergence rate isn't fixed. It's governed by the ratio $|\lambda_2/\lambda_1|$, called the spectral gap. A small gap means slow convergence; a wide gap means fast convergence, often in a handful of iterations even for matrices with billions of rows.

## Where it breaks down

The proof above leans on two assumptions worth examining, because both fail in practice.

The first is a strictly dominant eigenvalue: $|\lambda_1| > |\lambda_2|$. If two eigenvalues tie in magnitude, as happens with a complex conjugate pair or with certain symmetric structures, the derivation no longer collapses to a single direction. The iterate keeps oscillating between the corresponding eigenvectors instead of settling on one.

The second is that $c_1 \neq 0$: the starting vector must have some component along $v_1$. This holds almost surely for a random guess, but it's not guaranteed, and a starting vector that happens to be orthogonal to $v_1$ (due to some symmetry in the matrix) will converge to the wrong eigenvector, or fail to converge at all. In floating-point arithmetic this is rarely fatal, since rounding error eventually reintroduces a tiny $v_1$ component and slowly drags the iteration back on course, but it can still cost many extra iterations.

There's also a practical cost tied directly to the spectral gap. When $|\lambda_2/\lambda_1|$ is close to 1, convergence is linear and slow, sometimes requiring thousands of iterations for a usable answer. Methods like the QR algorithm or Lanczos iteration converge faster in these cases, at the cost of more work per step. And power iteration only ever recovers one eigenvector: if you need the full spectrum, or even just the top few, you need a different method (deflation, subspace iteration, or QR) built on the same underlying idea but extended to track multiple directions at once.

## A real-world example: PageRank

Google's PageRank is power iteration applied to a specific problem: ranking web pages by importance. Importance isn't directly measurable, so PageRank defines it circularly: a page is important if other important pages link to it. It resolves the circularity with a random-surfer model. Imagine someone clicking links forever; the fraction of time they spend on each page, in the long run, is that page's rank. That long-run distribution is exactly the dominant eigenvector of the link matrix.

To make power iteration converge reliably at web scale, the Google Matrix is built using the Perron-Frobenius theorem so that:

1. There's a single dominant eigenvalue, $\lambda_1 = 1$, guaranteed unique.
2. Every other eigenvalue satisfies $|\lambda_2| \le 0.85$.

That gap between $\lambda_1$ and $\lambda_2$ guarantees convergence from *any* starting vector, not just lucky ones. A random web-surfing distribution will always collapse onto the true PageRank vector, and the 0.85 ceiling keeps convergence fast even across billions of pages.

### Why is normalization required at every step of power iteration?
Without periodic normalization, multiplying a vector by $A$ repeatedly causes the vector magnitude to scale by $\lambda_1^k$. If $|\lambda_1| > 1$, floating-point values quickly trigger numerical overflow (`Infinity`). If $|\lambda_1| < 1$, values underflow to zero. Normalization stabilizes the vector magnitude while preserving the directional trajectory toward $v_1$.

### How does power iteration differ from QR iteration or Lanczos algorithms?
Power iteration isolates only the single dominant eigenvector and eigenvalue with minimal computational overhead per step. Algorithms like Lanczos or QR iteration construct Krylov subspaces or full orthogonal decompositions to compute multiple or all eigenvectors simultaneously, offering faster convergence for clustered eigenvalues at higher per-step computational memory costs.

