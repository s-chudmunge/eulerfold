---
title: "Aho-Corasick: Multi-Pattern Matching"
authors: "Alfred Aho & Margaret Corasick (1975)"
citation: "Aho, A. V., & Corasick, M. J. (1975). Efficient string matching: an aid to bibliographic search. Communications of the ACM, 18(6), 333-340."
link: "https://cr.yp.to/bib/1975/aho.pdf"
slug: "aho-corasick-string-matching"
heroImage: "https://upload.wikimedia.org/wikipedia/commons/6/62/Aho-Corasick.svg"
---

# Aho & Corasick: Efficient String Matching

In 1975, Alfred Aho and Margaret Corasick published 'Efficient String Matching: An Aid to Bibliographic Search,' a paper that introduced a method for searching for multiple patterns in a text simultaneously with optimal linear efficiency. They demonstrated that the complexity of searching for a set of keywords can be made independent of the number of keywords by using a specialized finite automaton. Their work established the foundational logic for modern string-processing tools, proving that the most efficient way to match a library of patterns is to compile them into a single, unified state machine.

## The Multi-Pattern Automaton and Failure Links {#aho-corasick-automaton}

The primary technical contribution of the Aho-Corasick algorithm is the construction of a deterministic finite automaton (DFA) that processes an input text in a single pass. The algorithm builds a 'trie'—a prefix tree—representing the set of all keywords to be searched. The breakthrough was the addition of 'failure links' that point from a node representing a prefix to the longest proper suffix of that prefix that is also a prefix of some keyword in the trie. This technical mechanism allows the automaton to transition to a new potential match immediately upon a mismatch, without ever re-scanning the characters in the text. It proved that the 'memory' of a search can be precomputed and stored as a static graph of transitions.

## Simultaneous Matching and Output Links {#simultaneous-matching}

The technical significance of the Aho-Corasick algorithm lies in its ability to handle overlapping patterns and sub-patterns in O(n) time, where n is the length of the text. By using 'output links'—which connect a node to other patterns that end at the same position in the text—the algorithm ensures that every occurrence of every keyword is identified in a single pass. This finding revealed that the cost of searching for a set of patterns is not a summation of individual searches, but a function of the text's length and the total number of matches found. It established that a properly constructed automaton can maintain multiple, parallel search states without any computational overhead.

## The Logic of Finite-State Processing {#aho-corasick-logic}

Aho and Corasick's work demonstrated that string matching is a problem of efficient state management across a dictionary of possibilities. The engineering choice to use a trie-based automaton revealed that the most effective way to process a stream of information is to first map the desired patterns into a formal state space. This realization remains the central theme of high-performance tools for lexical analysis, intrusion detection, and biological sequence alignment. It proved that the most robust way to find a collection of needles in a haystack is to ensure that every character in the haystack contributes to the simultaneous refinement of all potential matches.

## Resources

- [Aho & Corasick Original Paper (PDF)](https://cr.yp.to/bib/1975/aho.pdf) {type: article, provider: cr.yp.to}
- [Aho-Corasick Algorithm (GeeksforGeeks)](https://www.geeksforgeeks.org/aho-corasick-algorithm-pattern-searching/) {type: article, provider: GeeksforGeeks}
- [Aho-Corasick Multi-Pattern Matching (Video)](https://www.youtube.com/watch?v=fVAbX8tsf_Y) {type: video, provider: YouTube}
