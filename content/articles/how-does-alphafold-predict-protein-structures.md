---
title: "How does AlphaFold predict protein structures?"
slug: "how-does-alphafold-predict-protein-structures"
shortSlug: "alphafold"
author: "EulerFold"
date: "April 30, 2026"
category: "Science AI"
heroImage: "https://images.openai.com/static-rsc-4/zFZPWX9Wub5oKzHu6YO8sJCOUQ-p3aaValZJ2z7HWTJVy1pbhorEP9270mRGLOyPAvQNyB0nXPI7bnfWz3PKYgV8GJAmxWolFm9aaUAAhH9sn3SBB5Z5NyEUxGGi-EUz3c6HhCGE9qz1YnfN_etdb3nDhqgwPwqwitr6ScAdN1RRM6qvg1ksU2ad1E6NBbVM?purpose=fullsize"
excerpt: "The AI breakthrough that solved the 50-year-old protein folding problem. Discover how DeepMind mapped the 3D structures of nearly all known proteins."
technicalInsight: "AlphaFold 2 utilizes a customized Transformer architecture (Evoformer) to perform spatial reasoning on amino acid sequences, treating the protein as a 3D graph."
faq:
  - q: "What is the protein folding problem?"
    a: "Proteins are long chains of amino acids. To function, they must fold into specific 3D shapes. Predicting that shape from the sequence alone was an unsolved mystery for half a century until AlphaFold."
  - q: "How accurate is AlphaFold?"
    a: "In the CASP14 competition, AlphaFold 2 achieved a median GDT (Global Detachment Test) score of 92.4, meaning its predictions are competitive with expensive experimental methods like X-ray crystallography."
synonyms:
  - "AlphaFold"
  - "protein structure prediction"
  - "AF2"
  - "AlphaFold 2"
  - "computational structural biology"
---

Proteins are the workhorses of life, responsible for everything from digesting food to fighting viruses. Their function is determined entirely by their **3D structure**—the specific way they twist and fold in space. For fifty years, scientists struggled to predict this shape using only the sequence of amino acids. **AlphaFold**, developed by Google DeepMind, fundamentally changed this by treating protein folding as a spatial reasoning problem.

## The Evolutionary Compass {#evolution}

AlphaFold doesn't just guess the shape; it reads the "history" of the protein written in evolution. It uses a technique called **Multiple Sequence Alignment (MSA)**. By looking at similar proteins across different species (from bacteria to humans), the AI identifies which amino acids tend to mutate together. 

If amino acid A and amino acid B always change in tandem over millions of years, it’s a strong mathematical signal that they are physically touching or interacting in the folded structure. AlphaFold's "Evoformer" engine uses this co-evolutionary data to build a probabilistic map of which parts of the chain are near each other.

```d2
direction: down

Data: "Evolutionary Inputs" {
  Seq: "Amino Acid Sequence" {
    shape: rectangle
    style: { fill: "#f0fdfa" }
  }
  MSA: "Multiple Sequence Alignment" {
    shape: rectangle
    style: { fill: "#f0fdfa" }
  }
}

Engine: "AlphaFold Core (Evoformer)" {
  style: { stroke: "#0f766e"; stroke-width: 2 }
  Attention: "Spatial Reasoning" {
    shape: diamond
  }
  Graph: "Pairwise Distances" {
    shape: cloud
  }
  Attention <-> Graph: "Co-evolutionary Signal"
}

Prediction: "Final 3D Structure" {
  Model: "XYZ Atomic Coordinates" {
    shape: parallelogram
    style: { fill: "#fee2e2" }
  }
  Confidence: "pLDDT Confidence Map"
}

Data -> Engine: "Structural Templates"
Engine -> Prediction: "Iterative Refinement"
```

## Moving from 2D to 3D {#spatial}

The breakthrough in AlphaFold 2 was the **Structure Module**. Previous AI attempts tried to predict the distances between amino acids in 2D (like a map) and then find a 3D shape that fits. AlphaFold 2 skips this step. It represents the protein as a 3D object from the start, using "3D Equivariance"—a mathematical property that ensures the prediction remains consistent even if the protein is rotated or moved in space.

It iteratively refines the positions of every atom, essentially "sculpting" the protein in virtual space until it finds the most physically plausible and evolutionarily consistent shape.

## Knowing When to Trust: pLDDT {#confidence}

One of the most important features for researchers is AlphaFold's **Confidence Score (pLDDT)**. The model doesn't just give a structure; it tells you how sure it is about each specific part. 
- **Blue (90+):** Extremely high confidence, often as accurate as a laboratory experiment.
- **Yellow/Orange (<50):** Low confidence. These regions are often "intrinsically disordered," meaning they don't have a fixed shape in nature and wiggle around until they bind to something else.

## The Impact on Global Science {#impact}

Before AlphaFold, determining a single protein structure could take years of Ph.D. work and millions of dollars in equipment. AlphaFold has now predicted structures for over **200 million proteins**, representing nearly every protein known to science.

1.  **Drug Discovery:** Scientists can now "see" the surface of proteins involved in malaria or cancer, identifying precise pockets where a drug molecule could fit.
2.  **Sustainability:** It is being used to design new enzymes that can break down plastic waste (PETase) or capture atmospheric carbon more efficiently.
3.  **Basic Biology:** It has helped map the "Nuclear Pore Complex," one of the most complicated machines in the human cell, which was previously a blur to our best microscopes.

## AlphaFold 3: The Full Machinery {#multimodal}

The latest version, **AlphaFold 3**, goes beyond just proteins. It can predict how proteins interact with DNA, RNA, and small molecules (ligands). This is critical because proteins rarely work alone; they function as part of complex biological circuits. By seeing the entire assembly, we can understand the fundamental mechanisms of life at the atomic level.
