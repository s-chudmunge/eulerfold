---
title: "Boyer-Moore: Sub-linear String Search"
authors: "Robert Boyer & J. Strother Moore (1977)"
citation: "Boyer, R. S., & Moore, J. S. (1977). A fast string searching algorithm. Communications of the ACM, 20(10), 762-772."
link: "https://dl.acm.org/doi/10.1145/359842.359859"
slug: "boyer-moore-string-searching"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/b/be/Boyer-Moore_string_search_example.svg"
---

# Boyer & Moore: String Searching

In 1977, Robert Boyer and J. Strother Moore published 'A Fast String Searching Algorithm,' a paper that introduced a method for searching through data with sub-linear efficiency. By demonstrating that the most effective way to search for a pattern is to analyze the data from right to left, the authors revealed that the time required to search through information can be significantly less than the total size of the data itself. Their work established the Boyer-Moore algorithm as the definitive mechanism for high-performance string matching, proving that the key to efficient search is the ability to skip redundant work.

## Right-to-Left Comparison and the Bad-Character Rule {#boyer-moore-skip}

The primary technical contribution of the Boyer-Moore algorithm is the logic of comparing the pattern to the text from right to left, rather than the traditional left-to-right approach. When a mismatch occurs, the algorithm uses the 'Bad-Character Rule' to determine how far the pattern can be safely shifted. 

If the character in the text that caused the mismatch does not exist in the pattern, the entire pattern can be shifted past that position. If it does exist, the pattern is aligned with its rightmost occurrence. This technical mechanism ensures that the search pointer can skip over large sections of the text without ever examining them. It proved that the 'failure' of a match at a specific character provides a powerful signal for the global movement of the search.

## The Good-Suffix Rule and Efficiency {#good-suffix-rule}

The technical significance of the Boyer-Moore algorithm lies in its use of the 'Good-Suffix Rule'—a second heuristic that complements the bad-character rule. When a partial match of a suffix occurs before a mismatch, this rule identifies another occurrence of that suffix elsewhere in the pattern to guide the shift. 

By choosing the maximum of the shifts suggested by both rules, the algorithm achieves an average-case complexity that is often much less than linear, scaling at $O(n/m)$ in the best case, where $m$ is the pattern length. This finding revealed that the complexity of searching for information is not an absolute function of the data's length, but a function of the data's own structural self-similarity and the specificity of the pattern.

## The Galil Rule and Worst-Case Guarantees {#galil-rule}

While Boyer-Moore is exceptionally fast on average, its original formulation had a worst-case complexity of $O(nm)$ on highly repetitive texts (e.g., searching for "aaaa" in "aaaaaaaa"). In 1979, Zvi Galil introduced a simple but powerful modification known as the Galil Rule to achieve $O(n)$ worst-case complexity. 

The rule works by observing that if a full match was recently found, the algorithm can skip comparing the known suffix of the match in the next step. This optimization proved that the sub-linear average performance of Boyer-Moore does not have to come at the cost of pathological worst-case behavior. It transformed the algorithm into a robust tool suitable for any type of input data, from random prose to repetitive genomic sequences.

## Modern 'grep' and GNU Implementations {#grep-implementation}

The legendary speed of GNU `grep` is largely attributed to its highly optimized implementation of Boyer-Moore. Beyond the core algorithm, `grep` uses several engineering tricks to maximize throughput:
1. **Unrolling Loops**: The inner comparison loop is unrolled to minimize branch mispredictions.
2. **Sentinel Characters**: A copy of the pattern is placed at the end of the buffer to avoid checking for "end of file" inside the search loop.
3. **Memchr Optimization**: For very short patterns, `grep` uses the heavily optimized `memchr()` system call to find the first character before switching to Boyer-Moore.

These refinements proved that an algorithm's theoretical efficiency is only the starting point; true high-performance computing requires a deep alignment between the mathematical logic and the physical architecture of the machine.

## Hardware Acceleration: Bit-Parallelism {#bit-parallelism}

The principles of Boyer-Moore have been extended into the realm of hardware-friendly "bit-parallel" algorithms like Shift-Or and BNDM (Backward Non-deterministic Dawg Matching). These methods represent the search state as a bitmask and use bitwise operations to update multiple potential matches simultaneously. 

By mapping the "skipping" logic of Boyer-Moore onto the native word size of the CPU (e.g., 64 bits), these algorithms can process 64 characters or state transitions in a single instruction cycle. This revealed that the future of string searching lies in the convergence of combinatorial skipping and parallel bit manipulation, allowing for search speeds that approach the physical limits of memory bandwidth.

## The Logic of Systematic Skipping {#boyer-moore-logic}

Boyer and Moore's work demonstrated that string matching is a problem of maximizing the amount of data that can be safely ignored. The engineering choice to use precomputed heuristics for skipping characters revealed that a more complete understanding of the pattern allows for a less exhaustive search of the text. This realization remains the central theme of modern search engines and the development of high-performance tools for processing large-scale datasets. It proved that the most efficient way to find a specific sequence of information is to ensure that every failure provides the maximum possible guidance for the next phase of the search.

## Resources

- [Boyer-Moore Original Paper (ACM)](https://dl.acm.org/doi/10.1145/359842.359859) {type: article, provider: ACM}
- [Boyer-Moore Algorithm (GeeksforGeeks)](https://www.geeksforgeeks.org/boyer-moore-algorithm-for-pattern-searching/) {type: article, provider: GeeksforGeeks}
- [Boyer-Moore String Search (Video)](https://www.youtube.com/watch?v=PHXAOKQk2dw) {type: video, provider: YouTube}
