---
title: "AKS: PRIMES is in P"
authors: "Agrawal, Kayal, Saxena (2004)"
citation: "Agrawal, M., Kayal, N., & Saxena, N. (2004). PRIMES is in P. Annals of Mathematics, 781-793."
link: "https://www.cse.iitk.ac.in/users/manindra/algebra/primality_v6.pdf"
slug: "aks-primality-in-p"
heroImage: "https://www.researchgate.net/profile/Mohammed-Asad-4/publication/335112445/figure/fig2/AS:790643411304449@1565514444445/The-improved-AKS-algorithm.png"
---

# Agrawal, Kayal, Saxena: PRIMES is in P

In 2004, Manindra Agrawal, Neeraj Kayal, and Nitin Saxena published 'PRIMES is in P,' a paper that resolved a centuries-old quest to find an efficient, deterministic, and unconditional method for identifying prime numbers. By showing that primality testing—a problem that had been a central challenge since ancient Greek mathematics—belongs to the class of problems that can be solved in polynomial time, the authors proved that the most fundamental building blocks of arithmetic are not as computationally resistant as previously believed.

## The AKS Algorithm and Polynomial Identity {#aks-algorithm}

The primary technical contribution of Agrawal, Kayal, and Saxena was the development of a primality test based on a generalization of Fermat’s Little Theorem. The test operates on the identity that for an integer $n$ and an integer $a$ coprime to $n$, $n$ is prime if and only if the following polynomial identity holds:

$$\displaystyle (x+a)^n \equiv x^n + a \pmod{n}$$

This technical mechanism would be computationally expensive for large $n$ due to the number of coefficients in the polynomial expansion. The authors' breakthrough was to check this congruence modulo a polynomial $x^r - 1$ for a carefully chosen small $r$ and a specific range of values for $a$. This reduction allowed the test to maintain a polynomial complexity in the number of digits of $n$, effectively ensuring its feasibility on modern hardware.

## Deterministic and Unconditional Efficiency {#primality-p}

The technical significance of the AKS primality test is its achievement of being simultaneously deterministic, polynomial-time, and unconditional. Before 2004, existing efficient primality tests either relied on randomness—which could occasionally produce an incorrect result—or were dependent on the unproven Generalized Riemann Hypothesis. The AKS algorithm proved that the property of primality is an inherent, efficiently computable characteristic of any integer, regardless of any unproven mathematical assumptions. This finding established primality testing as a canonical example of a problem that, while previously thought to be 'hard,' was eventually revealed to have a hidden, efficient structure.

## The Logic of Arithmetical Complexity {#aks-significance}

Agrawal and his colleagues' work demonstrated that the complexity of computational systems is often a function of our understanding of the underlying mathematical logic. The engineering choice to study polynomial identities over finite fields revealed that primality is not a mysterious or resistant quality, but a simple, verifiable property of numbers. It suggested that many other problems in number theory and cryptography might also have hidden, efficient solutions that do not require unproven assumptions. This realization remains the primary reason for the continued search for polynomial-time algorithms for related challenges like integer factorization, which continues to form the backbone of modern digital security.

## Resources

- [PRIMES is in P Original Paper (PDF)](https://www.cse.iitk.ac.in/users/manindra/algebra/primality_v6.pdf) {type: article, provider: IIT Kanpur}
- [A Survey of Primality Testing](https://www.ams.org/notices/200305/fea-bornemann.pdf) {type: article, provider: AMS}
