---
title: "LSH: Locality-Sensitive Hashing"
authors: "Piotr Indyk & Rajeev Motwani (1998)"
citation: "Indyk, P., & Motwani, R. (1998). Approximate nearest neighbors: towards removing the curse of dimensionality. In Proceedings of the thirtieth annual ACM symposium on Theory of computing (pp. 604-613)."
link: "https://graphics.stanford.edu/courses/cs468-06-fall/Papers/06%20indyk%20motwani%20-%20stoc98.pdf"
slug: "indyk-motwani-lsh"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/LSH.png/400px-LSH.png"
---

# Indyk & Motwani: Locality-Sensitive Hashing

In 1998, Piotr Indyk and Rajeev Motwani published 'Approximate Nearest Neighbors: Towards Removing the Curse of Dimensionality,' a paper that transformed how we search through high-dimensional information. Traditional geometric search methods become exponentially slower as the number of features in a dataset increases, a phenomenon known as the 'curse of dimensionality.' By introducing Locality-Sensitive Hashing (LSH), the authors demonstrated that similarity search can be achieved with sublinear query time by accepting a controlled degree of approximation. Their work established the foundational mechanism for modern recommendation engines, vector databases, and large-scale retrieval systems.

## Collision Probabilities and Locality {#lsh-mechanism}

The primary technical contribution of Indyk and Motwani was the definition of a family of 'locality-sensitive' hash functions. Unlike standard cryptographic hashes, which are designed to minimize collisions for even slightly different inputs, LSH functions are designed such that the probability of a collision—two points being mapped to the same hash bucket—is directly proportional to their proximity in a metric space. For two points $p$ and $q$ at distance $d(p,q)$, the hashing mechanism ensures:

$$\displaystyle \Pr[h(p) = h(q)] \text{ is high for small } d(p,q)$$

This technical mechanism allows the data structure to group 'similar' items together while keeping 'dissimilar' items apart. It proved that the relative similarity of data can be captured and indexed through a purely probabilistic process.

## Breaking the Curse of Dimensionality {#lsh-efficiency}

The technical significance of LSH lies in its ability to achieve query times that scale at $O(n^\rho)$ for $\rho < 1$, where $n$ is the number of points in the dataset. By concatenating multiple hash functions to amplify the gap between collision probabilities and using multiple independent hash tables to ensure high recall, Indyk and Motwani provided the first solution for nearest-neighbor search that does not degrade exponentially with dimensionality. This finding revealed that the core difficulty of high-dimensional search is a function of our requirement for exact results. It established that by relaxing the precision of a search, we can maintain high efficiency across even the most complex feature spaces.

## The Logic of Probabilistic Retrieval {#lsh-significance}

Indyk and Motwani's work demonstrated that the complexity of computational systems is often a function of the trade-offs we are willing to accept between speed and accuracy. The engineering choice to use randomized bucketing revealed that the 'neighborhood' of a data point can be explored more efficiently than its exact geometric position. This realization remains the central theme of modern vector search and the development of large-scale machine learning systems where retrieval from billions of high-dimensional embeddings must be performed in milliseconds. It proved that the most robust way to manage a complex retrieval task is to ensure that the indexing mechanism itself reflects the underlying similarity structure of the data.

## Resources

- [LSH Original Paper (PDF)](https://graphics.stanford.edu/courses/cs468-06-fall/Papers/06%20indyk%20motwani%20-%20stoc98.pdf) {type: article, provider: Stanford}
- [A Survey of LSH Methods](https://en.wikipedia.org/wiki/Locality-sensitive_hashing) {type: article, provider: Wikipedia}
