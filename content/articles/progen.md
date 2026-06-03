---
title: "Why Writing New Life is Easier than Making it Live"
slug: "progen"
shortSlug: "progen"
author: "Dr. Riya Srinivasan — Machine Learning Scientist, PhD Artificial Intelligence"
date: "May 7, 2026"
subject: "Biology"
heroImage: "https://images.openai.com/static-rsc-4/oO5D9OvdwqGs177ebNXzYoTAB7oHqQNIt4NTGFdxNbgaVGurdjIUVExAOmbFDT80KEULTebgtEyToi468WpLAD-hAxwK2sK1XDLCWRdJZYo8W2u1XuLm2Cb-sWoTud6p3hJr6nAhPKnjNiycDsx3HBJpfEBAAFgXUiR689WCW-Ve9KzxkvWe46ltEYR1xIDj?purpose=fullsize"
excerpt: "Generative models can write entirely new protein sequences from scratch, but balancing functional accuracy with physical stability remains a hard engineering constraint."
technicalInsight: "Madani et al. (2023) demonstrated that ProGen can synthesize functional artificial lysozymes with less than 31% sequence identity to known proteins, yet many structurally novel designs collapse in vivo."
faq:
  - q: "Is ProGen like AlphaFold?"
    a: "No. AlphaFold predicts the structure of a sequence that already exists. ProGen generates a completely new sequence that has never existed in nature, designed to perform a specific function."
  - q: "Have ProGen-designed proteins been tested in real life?"
    a: "Yes. In a landmark study, researchers synthesized ProGen-designed lysozymes (enzymes that kill bacteria) and found several were just as effective as natural ones, despite being significantly different in sequence."
synonyms:
  - "Protein Language Model Generation"
  - "Generative pLM"
  - "Conditional Protein Design"
---

The ability to generate coherent, realistic text on demand has been the defining technological breakthrough of the current decade. Large Language Models (LLMs) like GPT-4 process billions of words to learn the underlying rules of human grammar, allowing them to write essays, translate languages, and debug code. However, human language is not the only sequence of characters that contains meaning. Biology is also written in a linear code, but instead of the twenty-six letters of the English alphabet, it uses the twenty amino acids that make up proteins.

For billions of years, evolution has been the only author of this biological code. It is a slow, iterative process of trial and error, mutating single letters over millennia to create proteins that can digest food, capture light, or fight disease. If scientists needed an enzyme to break down plastic or neutralize a toxin, their only option was to search through nature hoping to find an organism that had already evolved a solution. The transition from "discovering" biology to "programming" biology requires a tool that can write this code from scratch.

This is the promise of generative protein design. By training a language model on the millions of protein sequences cataloged in databases like UniProt, researchers have built AI systems that can "speak" the language of life. These models do not just copy and paste existing proteins; they learn the deep statistical rules of how amino acids must be arranged to create a stable, working molecule. But as we move from digital generation to physical synthesis, we are learning that writing a convincing biological sentence is much easier than ensuring that sentence can survive in the real world.

Imagine an AI tasked with designing a new antibiotic. The model generates a sequence of amino acids that, according to the digital simulation, binds perfectly to the target bacteria and neutralizes it with 100% efficiency. However, when researchers synthesize this protein in a test tube, it instantly clumps together into a useless, tangled mess. The AI successfully optimized for the *function* of the protein, but completely ignored the hydrophobic "glue" required for the molecule to fold and remain stable in a watery environment. This "Folding Collapse" is the primary bottleneck in generative biology.

## The Architecture of Conditional Generation

The most prominent attempt to solve this is ProGen, a 1.2-billion parameter model developed by Salesforce Research. ProGen is built on a standard Transformer architecture, but its key innovation is "Conditional Generation." Before the model begins predicting the next amino acid in a sequence, it is fed specific "Control Tags." These tags act as a prompt, defining the desired properties of the output. A researcher can prompt ProGen with tags for "Lysozyme" (a bacteria-killing enzyme), "Thermophilic" (stable at high temperatures), and a specific biological kingdom.

By forcing the model to condition its generation on these specific parameters, ProGen narrows the search space from all possible proteins down to the specific functional family the researcher needs. It treats the evolutionary constraints of a protein family as a distinct dialect, allowing it to write novel sequences that adhere strictly to the rules of that specific biological job.

## The Stability-Function Trade-off

In a landmark 2023 study published in Nature Biotechnology, Madani et al. partnered with wet-lab researchers to physically synthesize enzymes designed by ProGen. They focused on artificial lysozymes. The results were a massive validation of generative biology: several of the AI-designed enzymes successfully destroyed bacterial cell walls in vitro. Remarkably, some of these working enzymes shared less than 31% of their sequence with any known natural protein. The AI had not just memorized nature; it had invented a genuinely new way to kill bacteria.

However, the study also exposed the brutal reality of the stability-function trade-off. While the model could generate millions of unique sequences, the researchers found that as the generated sequences became more novel (further away from known natural proteins), their physical stability plummeted. The AI could easily hallucinate the "active site" (the part that kills the bacteria), but it struggled to simultaneously generate the complex scaffolding required to hold that active site in place at room temperature.

## The Problem of Thermodynamic Hallucination

This exposes a fundamental limitation of treating biology purely as a language. In human text, a grammatically incorrect sentence can still convey meaning. In biology, a sequence that violates the laws of thermodynamics is functionally dead. When an AI generates a sentence, the output is consumed by a human brain. When ProGen generates a sequence, the output must be "compiled" by the laws of physics.

Because ProGen is trained purely on 1D sequences, it must infer the 3D physics of folding implicitly. It lacks a direct understanding of thermodynamic energy states. As a result, it frequently hallucinates proteins that look statistically sound to the language model but are physically impossible to fold in a laboratory setting. This "Thermodynamic Hallucination" means that while the AI can write millions of potential cures, human researchers must still painstakingly filter, synthesize, and test them to find the ones that don't collapse.

## Escaping the Training Distribution

Another profound challenge for models like ProGen is the "Training Distribution Trap." The AI learns the rules of protein design by reading the history of natural evolution. This means its outputs are heavily biased toward what has already survived on Earth. If we need a protein to function in an entirely unnatural environment—such as inside a high-pressure chemical reactor or in the acidic wash of a battery recycling plant—the AI struggles. It has never "read" a protein that survives under those conditions, so it lacks the vocabulary to write one.

To truly unlock programmable biology, the next generation of models cannot rely solely on the databases of the past. They must be coupled with physics-based simulators or "active learning" loops, where the AI proposes a wild, out-of-distribution sequence, an automated lab builds and tests it, and the AI learns from the physical failure. We are currently operating like authors writing a play for a stage we have never seen. The next frontier of generative biology is not just writing more novel sequences, but building models that inherently understand the physical gravity of the world those sequences must inhabit.