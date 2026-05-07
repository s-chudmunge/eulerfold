---
title: "Shannon: Information Theory"
authors: "Claude Shannon (1948)"
citation: "Shannon, C. E. (1948). A mathematical theory of communication. The Bell System Technical Journal, 27(3), 379-423."
link: "https://ieeexplore.ieee.org/document/6773024"
slug: "shannon-information-theory"
heroImage: "https://www.researchgate.net/profile/Carlo-Kopp/publication/251956710/figure/fig1/AS:298093598789634@1448082460247/Shannons-model-for-communication-channel-Shannon-1948.png"
---

# Shannon: Information Theory

The 1948 paper 'A Mathematical Theory of Communication' by Claude Shannon is the founding document of the digital age. Before Shannon, communication was viewed as an analog problem of preserving the 'meaning' or fidelity of a signal. Shannon argued that the semantic aspects of a message are irrelevant to the engineering problem of transmission. He proposed that information is a measurable, physical quantity, defining the 'bit' as its fundamental unit. It was a shift from viewing language as a series of human thoughts to viewing it as a statistical distribution of symbols.

## The Fundamental Model of Communication {#fundamental-model}

Shannon’s first major contribution was the definition of a universal schematic for communication systems. He decomposed every instance of information transfer into five discrete components: an information source, a transmitter, a channel, a receiver, and a destination. This abstraction allowed him to isolate the "noise" as a stochastic interference that acts upon the signal within the channel, independent of the message's intent. By formalizing this structure, Shannon moved the focus from the physical nature of the medium—whether it be copper wire or radio waves—to the mathematical relationship between the signal and the noise. This model proved that any communication system, regardless of its complexity, is governed by the same underlying statistical laws.

## The Mathematical Definition of Entropy {#entropy-definition}

Claude Shannon resolved the engineering problem of communication by replacing the subjective search for 'meaning' with a universal mathematical measure called entropy ($H$). Borrowing the concept from thermodynamics, he defined information not by what a message contains, but by the degree of uncertainty it removes. This shift proved that information is a measure of 'surprise'—if a message is 100% predictable, it contains zero bits of information. For a discrete source with a set of possible messages, Shannon defined entropy as the sum of the probabilities of each message multiplied by the logarithm of those probabilities. This finding revealed that the 'grammar' of any communication system can be reduced to the statistical probabilities of its symbols, effectively treating the world as a digital sequence of choice rather than a continuous flow of meaning.

## Source Coding and Data Compression {#source-coding}

The practical utility of entropy was realized in Shannon's Source Coding Theorem, which established a fundamental limit to how much a message can be compressed. He proved that the average length of the encoded messages must be at least equal to the entropy of the source. This discovery demonstrated that information has a minimum "volume," and that any attempt to compress data beyond this limit must result in a loss of information. It provided the mathematical foundation for all modern data compression algorithms, from ZIP files to JPEG images, by showing that efficiency is achieved by assigning shorter codes to more frequent symbols and longer codes to rarer ones. This engineering choice proved that the optimal representation of data is dictated by its inherent statistical structure.

## The Logic of Channel Capacity {#channel-capacity}

The most profound technical result of Shannon's work was the Noisy-Channel Coding Theorem. He proved that for any given channel, there exists a specific numerical value called the Channel Capacity ($C$), defined as the maximum rate at which information can be transmitted with a vanishingly small error rate. He proved that as long as the transmission rate ($R$) is below this capacity ($R < C$), it is possible to use error-correcting codes to overcome the effects of noise. This was a counter-intuitive discovery; it suggested that noise is not a physical barrier but a mathematical constraint that can be bypassed through intelligent redundancy. It shifted the engineering goal from building "perfect" hardware to designing "perfect" codes, allowing for the flawless replication of data across vast distances and imperfect mediums.

## The Entropy of Natural Language {#language-entropy}

Shannon applied his theories to the structure of human language, specifically English, to determine its inherent redundancy. By modeling language as a Markov process—where the probability of a letter depends on the preceding letters—he estimated that English is approximately 50% redundant. This means that half of the letters we write are determined by the statistical rules of the language rather than the choice of the author. This observation provided a bridge between information theory and linguistics, suggesting that the structure of language is an optimization for reliable transmission in a noisy world. It revealed that the "predictability" of human thought is a technical feature that ensures our messages survive the interference of the environment.

## The Abstraction of the Bit {#universal-bit}

The success of Information Theory proved that all forms of data—text, audio, images, and video—can be represented by the same universal unit: the bit. This finding effectively digitalized the world, proving that any complex signal can be broken down into a series of binary choices. It raised the question of whether there are limits to what can be represented in bits, or if even human consciousness itself is a form of high-entropy information processing. It suggested that we are living in a universe where the significance of any event is defined by the number of other possibilities it excludes. This universal abstraction remains the bedrock of the silicon age, implying that the fundamental fabric of reality may be information itself.


## Resources

- [Shannon's Original Paper](https://archive.org/details/shannon1948) {type: docs, provider: Internet Archive}
- [Information Theory (Video)](https://www.youtube.com/watch?v=2s3aJfRr9gE) {type: video, provider: Veritasium}
