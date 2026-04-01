---
title: "KMP: Fast Pattern Matching"
authors: "Knuth, Morris, Pratt (1977)"
citation: "Knuth, D. E., Morris, Jr, J. H., & Pratt, V. R. (1977). Fast pattern matching in strings. SIAM journal on computing, 6(2), 323-350."
link: "https://www.cs.jhu.edu/~misha/ReadingSeminar/Papers/Knuth77.pdf"
slug: "knuth-morris-pratt-string-matching"
---

# Knuth, Morris, Pratt: Fast Pattern Matching in Strings

In 1977, Donald Knuth, James Morris, and Vaughan Pratt published 'Fast Pattern Matching in Strings,' a paper that introduced a method for searching through data with optimal linear efficiency. They demonstrated that the inefficient process of searching for a pattern by repeatedly backtracking through the same information could be replaced by a more logical approach that learns from its own failures. Their work established that string matching is not an exhaustive search, but a process of directed, information-aware exploration.

## The Failure Function and Precomputation {#kmp-failure-function}

The primary technical contribution of the KMP algorithm is the precomputation of a 'failure function' for the pattern being searched. This function works by analyzing the pattern to identify the longest proper prefix that is also a suffix for every possible sub-pattern. This technical mechanism allows the algorithm to determine exactly where in the pattern to resume searching when a mismatch occurs, without ever having to backtrack the pointer in the main text. It proved that any failure during the matching process contains valuable information about where the search should continue. This finding revealed that the key to efficient pattern matching is to build a memory of the pattern's own structural self-similarities.

## Linear-Time String Matching {#linear-time-matching}

The technical justification for the KMP algorithm was its achievement of O(n+m) time complexity, where n is the length of the text and m is the length of the pattern. By ensuring that the text pointer never moves backward, the algorithm guarantees that each character in the text is examined at most a constant number of times. This engineering choice proved that the time required to search through data should be a linear function of the data's size, regardless of the complexity of the pattern. It revealed that backtracking in a search is often a sign of an incomplete understanding of the information being processed.

## Optimal Search in Structured Data {#kmp-significance}

Knuth, Morris, and Pratt's work demonstrated that string matching is a problem of state management rather than brute-force comparison. The technical significance of their algorithm lies in its optimality, particularly for streaming information where backtracking is either impossible or extremely expensive. These theories proved that the most effective way to process structured data is to first analyze its internal relationships to minimize redundant work. This realization remains the central theme of modern text search engines, biological sequence analysis, and the development of efficient tools for scanning and filtering digital information.

## Resources

- [KMP's Original Paper (PDF)](https://www.cs.jhu.edu/~misha/ReadingSeminar/Papers/Knuth77.pdf) {type: article, provider: JHU}
- [KMP Algorithm Visualizer](https://pypup.com/visualizer/kmp) {type: article, provider: PyPup}
