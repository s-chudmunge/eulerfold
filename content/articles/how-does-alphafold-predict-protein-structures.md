---
title: "How does AlphaFold predict protein structures?"
slug: "how-does-alphafold-predict-protein-structures"
shortSlug: "alphafold"
author: "Dr. Kavya Nair — Bioinformatics Research Lead, PhD Computational Biology"
date: "April 30, 2026"
subject: "Biology"
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

Inputs: "Data Pipelines" {
  MSA: "Multiple Sequence Alignment" {
    tooltip: "Evolutionary History"
    shape: cylinder
  }
  Templates: "Structural Templates" {
    shape: cylinder
  }
}

Evoformer: "Evoformer Engine" {
  style: {
    stroke: "#0f766e"
    stroke-width: 2
  }

  MSATrack: "MSA Representation" {
    RowAtt: "Row-wise Attention" {shape: diamond}
    ColAtt: "Column-wise Attention" {shape: diamond}
    RowAtt -> ColAtt
  }

  PairTrack: "Pair Representation" {
    TriAtt: "Triangular Multiplicative Update" {shape: hexagon}
    TriSelf: "Triangular Self-Attention" {shape: diamond}
    TriAtt -> TriSelf
  }

  MSATrack.RowAtt <-> PairTrack.TriAtt: "Outer Product Mean" {
    style: {stroke-dash: 3}
  }
}

StructureModule: "3D Structure Module" {
  IPA: "Invariant Point Attention" {
    shape: diamond
    style: {fill: "#e8f2f1"}
  }
  Equiv: "3D Equivariant Refinement"
  IPA -> Equiv
}

Inputs -> Evoformer: "Embedding & Feature Extraction"
Evoformer -> StructureModule: "Residue Pair Constraints"
StructureModule -> Output: "Atomic Coordinates (PDB)"

Output: "Validated Prediction" {
  shape: parallelogram
  style: {fill: "#fee2e2"}
}
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

The latest version, **AlphaFold 3**, goes beyond just proteins. It can predict how proteins interact with DNA, RNA, and small molecules (ligands). This is critical because proteins rarely work alone; they function as part of complex biological circuits. By seeing the entire assembly, we can understand the fundamental mechanisms of life at the atomic level—from how a transcription factor binds to a gene to how a drug candidate locks onto a receptor.

## The Open Source Ecosystem {#open-source}

The impact of AlphaFold was so profound that it sparked a wave of open-source alternatives. **OpenFold** and **RoseTTAFold** have recreated and in some cases extended AlphaFold's capabilities. These models allow the scientific community to study the internal "weights" of the AI, fine-tune it for specific types of proteins (like antibodies), and run it on their own hardware without relying on proprietary clouds. This "democratization of structure" ensures that the protein revolution belongs to the entire global scientific community, enabling researchers in any lab to participate in structural biology.
