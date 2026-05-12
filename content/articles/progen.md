---
title: "What is ProGen?"
slug: "progen"
shortSlug: "progen"
author: "Dr. Riya Srinivasan — Machine Learning Scientist, PhD Artificial Intelligence"
date: "May 7, 2026"
subject: "Biology"
heroImage: "https://images.openai.com/static-rsc-4/oO5D9OvdwqGs177ebNXzYoTAB7oHqQNIt4NTGFdxNbgaVGurdjIUVExAOmbFDT80KEULTebgtEyToi468WpLAD-hAxwK2sK1XDLCWRdJZYo8W2u1XuLm2Cb-sWoTud6p3hJr6nAhPKnjNiycDsx3HBJpfEBAAFgXUiR689WCW-Ve9KzxkvWe46ltEYR1xIDj?purpose=fullsize"
excerpt: "The GPT of proteins. Understanding how Salesforce Research built a Large Language Model capable of 'writing' functional, synthetic enzymes from scratch."
technicalInsight: "ProGen is a 1.2-billion parameter conditional language model trained on 280 million protein sequences, utilizing control tags to steer generation toward specific functional properties."
faq:
  - q: "Is ProGen like AlphaFold?"
    a: "Not exactly. AlphaFold is designed to predict the *structure* of an existing protein sequence. ProGen is designed to *generate* entirely new sequences that have specific functions, even if they look nothing like natural proteins."
  - q: "Have ProGen-designed proteins been tested in real life?"
    a: "Yes. In a landmark study, researchers synthesized ProGen-designed lysozymes (enzymes that kill bacteria) and found they were just as effective as natural ones, despite being significantly different in sequence."
synonyms:
  - "Protein Language Model Generation"
  - "Generative pLM"
  - "Conditional Protein Design"
---

In the world of AI, Large Language Models (LLMs) like GPT-4 have mastered the art of "hallucinating" realistic text. **ProGen**, developed by Salesforce Research, applies this exact same logic to the language of life. By treating amino acid sequences as "sentences" and biological properties as "topics," ProGen can write entirely new protein "books" that perform specific chemical tasks in the physical world.

## The Architecture: A Conditional Transformer {#architecture}

ProGen is based on a standard **Transformer** architecture—the same technology behind modern chatbots. However, it is optimized for biological sequences. While English has 26 letters, the "alphabet" of proteins has 20 amino acids.

The key innovation in ProGen is **Conditional Generation**. Before a sequence starts, the model is given "Control Tags." These tags act like prompts, telling the model:
- **Taxonomy:** Which type of organism should this protein belong to?
- **Function:** What job should it do (e.g., Hydrolase, Oxidoreductase)?
- **Location:** Where in the cell should it live?

## The Training: Reading the Tree of Life {#training}

ProGen was trained on over **280 million protein sequences** from the public Uniprot database. By "reading" this vast amount of biological data, the model learned the underlying "grammar" of evolution. It understands that if you have a certain arrangement of amino acids at the beginning of a sequence, you need a specific matching arrangement later on to ensure the protein folds into a stable 3D shape.

This allows ProGen to move beyond the "interpolation" of natural proteins. It doesn't just copy and paste pieces of existing enzymes; it understands the *rules* of how they are built, allowing it to "extrapolate" and create designs that nature has never tried.

## The Proof of Concept: Synthetic Lysozymes {#lysozymes}

To prove that ProGen wasn't just generating biological "gibberish," Salesforce partnered with the University of California, San Francisco (UCSF) to build five of the model's designs in a lab. 

They focused on **Lysozymes**—enzymes that break down the cell walls of bacteria. The results were staggering:
1. **Functional Success:** The synthetic enzymes worked. They were able to kill bacteria in a petri dish just as well as natural lysozymes.
2. **Sequence Diversity:** Some of the successful synthetic enzymes were only **31% identical** to any known natural protein. This means the AI found a completely new way to solve the "bacterial killing" problem that nature hadn't discovered in billions of years of evolution.
3. **Stability:** Some designs were even more heat-stable than their natural counterparts, a crucial feature for industrial applications.

## Why This Matters: Programmable Biology {#significance}

ProGen represents a shift from **Discovering Biology** to **Programming Biology**. Historically, if a scientist needed an enzyme for a new industrial process (like creating biofuels or breaking down plastic), they had to search through nature to find one that was "good enough."

With models like ProGen, we can start with the **function** and work backward to the **sequence**. 
- Need a drug that targets a specific cancer protein but doesn't affect healthy cells? **Prompt ProGen.**
- Need a biological filter that removes lead from water? **Prompt ProGen.**
- Need an enzyme that can survive the extreme heat of a chemical reactor? **Prompt ProGen.**

## The Future: Multi-Modal Protein Design {#future}

The next generation of ProGen-like models will be **Multi-Modal**. Instead of just taking text-based tags, they will be able to take **3D structures** as prompts. You could provide a 3D scan of a viral protein and tell the AI: "Write a sequence that wraps perfectly around this shape." This convergence of protein language models and geometric deep learning will mark the beginning of the "Generative Era" of medicine.
