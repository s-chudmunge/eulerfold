---
title: "Why AI Dreams of Molecules We Cannot Build"
slug: "generative-chemistry"
shortSlug: "generative-chem"
author: "Dr. Nitin Bansal — Semiconductor Technology Researcher, PhD Materials Science"
date: "May 7, 2026"
subject: "Chemistry"
heroImage: "https://images.openai.com/static-rsc-4/DBOqZHyUFLGM_17pTZJ1peI1CA1cw1Yne_9t7TmCHrpOQUCcuI18Xuz5H2LE9Nw0lXOk36GrhDblbggC4jMNm2TmXKKNdiUMI21uY4G3JEhJd0hB1RKWApIUaF9o6Cs55r_98dNrp91zlTpqYhTH2qh9KJ-qPV7hmPuzfk2JbJ2t8GpsboqkUNd7y61Azv3_?purpose=fullsize"
excerpt: "Generative models can design perfect chemical structures in digital space, but without synthesizability constraints, they routinely hallucinate impossible chemistry."
technicalInsight: "Gao et al. (2020) demonstrated that early generative models frequently maximized functional scores by proposing molecules with valid valency that were nonetheless physically impossible to synthesize in a lab."
faq:
  - q: "Does generative AI just copy existing molecules?"
    a: "No. Unlike a database search, generative AI can design 'De Novo' molecules—structures that have never existed in nature or been synthesized by humans before."
  - q: "How do you know an AI-generated molecule can actually be made?"
    a: "AI models are often equipped with 'Synthesizability Filters' that predict how difficult it would be to manufacture the molecule in a physical lab."
synonyms:
  - "De Novo Drug Design"
  - "Molecular Generation"
  - "AI Molecule Design"
---

The pharmaceutical and materials science industries have long been constrained by the sheer size of "chemical space." It is estimated that there are $10^{60}$ possible small molecules that could theoretically exist. For most of history, researchers explored this space by screening massive physical libraries or tweaking known chemicals by hand. The advent of AI fundamentally shifted this paradigm. Instead of searching for needles in a cosmic haystack, scientists began building "Generative Chemistry" models. These systems act as digital architects, building entirely new molecules atom by atom to solve specific problems.

Generative chemistry models use architectures like Variational Autoencoders (VAEs), Generative Adversarial Networks (GANs), and Diffusion models. They are trained on millions of known chemical structures, allowing them to internalize the "rules" of how atoms connect. A researcher can prompt the AI to design a molecule that binds to a specific cancer receptor, dissolves in water, and is non-toxic. The AI then navigates its internal mathematical map—the "latent space"—to construct a molecule that satisfies all these constraints simultaneously.

On paper, this "Multi-Objective Optimization" feels like the end of the drug discovery bottleneck. The AI can generate thousands of highly optimized candidates in an afternoon, bypassing years of trial and error. But as researchers began taking these digital blueprints to human chemists to be built in the physical world, they encountered a frustrating reality. The AI was a brilliant architect, but it had absolutely no understanding of construction.

The "Synthesizability Joke" became a common trope in early generative chemistry. An AI model would proudly present a molecule with a perfect functional score, predicting it would obliterate a tumor cell with absolute precision. But when handed to an organic chemist, the blueprint was met with a sigh. To physically build the AI's "perfect" molecule would require a 50-step chemical synthesis involving highly volatile reagents, a process that would cost $10 million to produce a single gram. The AI had optimized for the destination but had hallucinated a path that no physical laboratory could follow, creating a "ghost drug" that existed only in the simulation.

## The Synthesizability Gap and the SAscore

The core of the problem lies in the fact that generative models operate in a continuous mathematical space, while chemistry is a discrete, step-by-step physical process. A model might find that adding a specific ring structure to a molecule boosts its predicted cancer-killing score by 10%. In the digital space, "adding a ring" is just a math operation. In the physical lab, appending that ring might require extreme temperatures that break the rest of the molecule apart.

Gao et al. (2020) quantified this gap in a landmark paper on the synthesizability of generative models. They found that when generative models were allowed to optimize purely for biological function (like docking affinity), they almost immediately began proposing structures that were virtually impossible to synthesize. To combat this, researchers introduced heuristic filters like the Synthetic Accessibility score (SAscore). 

The SAscore acts as a mathematical penalty. It analyzes the generated molecule, looking for rare fragments or overly complex ring systems that historically require difficult chemical reactions. If the generative model proposes a complex structure, the SAscore slaps it with a heavy penalty, forcing the AI to "throw away" the design and find a simpler path. While this grounded the models, Gao et al. noted that simple heuristics often fail to capture the true complexity of reaction chemistry, rejecting novel but buildable molecules while approving simple but chemically unstable ones.

## Valency Hallucination in the Latent Space

Even with complexity filters, generative models are prone to a specific type of failure known as "Valency Hallucination." Generative models, particularly continuous models like VAEs, try to map the discrete world of atoms onto a smooth mathematical gradient. The AI assumes that if Molecule A is good, and Molecule B is good, then a molecule exactly halfway between them in the latent space should also be good.

However, chemistry does not work like a color gradient. You cannot have "half" of a carbon bond. In its attempt to interpolate between two functional states, the AI will frequently output a molecule that technically respects the mathematical constraints of the latent space but violates the strict laws of quantum chemistry and electron valency. The AI proposes a bond that physically cannot hold together.

## The Retrosynthesis Solution

To fix the ghost drug problem, modern generative chemistry has integrated with "Retrosynthesis AI." Instead of just scoring how complex a molecule looks, these systems actively try to build a step-by-step recipe. 

Tools like ASKCOS act as a virtual chemist. When the generative model proposes a new drug, the retrosynthesis engine works backward. It asks: "Can I break this complex molecule into two simpler pieces? Can I break those pieces into commercially available starting materials?" If the retrosynthesis engine cannot find a valid, logical chain of chemical reactions using known chemistry, the generative model's proposal is rejected entirely.

We have reached a point where AI can dream up millions of perfectly optimized molecules in seconds. But we have also learned that the value of an architect is entirely dependent on the limits of the builder. The frontier of generative chemistry is no longer maximizing the biological effectiveness of a digital molecule; it is teaching the AI the stubborn, dirty, and expensive laws of the physical laboratory.