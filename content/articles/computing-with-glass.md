---
title: "Why Do Analog AI Chips Forget Their Weights?"
slug: "computing-with-glass"
shortSlug: "pcm-drift"
author: "Sankalp — Engineering Lead"
date: "May 31, 2026"
subject: "Computer Science"
heroImage: "/images/articles/hero_analog_chips.jpg"
excerpt: "The amorphous state of phase-change memory is a metastable liquid that settling into a lower-energy glass, creating a resistance drift that threatens analog AI precision."
technicalInsight: "Resistance drift in PCM follows a power law R(t) ∝ t^ν, driven by the shedding of defect states in the mobility gap during structural relaxation."
synonyms:
  - "Phase-Change Memory"
  - "PCM"
  - "Resistance Drift"
  - "GST"
  - "Neuromorphic Computing"
---

The current explosion of Artificial Intelligence is hitting a physical wall known as the Von Neumann bottleneck. In standard digital computers, the processor (which does the math) and the memory (which stores the data) are physically separate. For every single operation an AI performs, it must shuttle millions of parameters across a narrow electrical bus. This "data movement tax" accounts for over 90% of the energy consumed by modern GPUs, turning AI training into an environmental and financial crisis.

To solve this, researchers are turning to "Analog Computing." The idea is to stop moving data entirely and instead do the math directly inside the memory itself. In an analog AI chip, a synaptic weight is not a sequence of 0s and 1s; it is the physical electrical resistance of a material. By passing a small voltage through these resistors, the chip performs matrix multiplication—the core math of AI—at the speed of light and with 100x better energy efficiency than any digital processor.

The leading candidate for this analog revolution is Phase-Change Memory (PCM). PCM works by using a material that can toggle between two physical states: an orderly, low-resistance crystal and a chaotic, high-resistance "glass" (amorphous state). By precisely controlling the ratio of crystal to glass, engineers can "program" a specific electrical resistance into a microscopic cell, effectively creating a permanent, analog weight for a neural network.

However, as we attempt to scale this technology into production-ready chips, we have discovered a brutal limitation of material physics. These "permanent" weights are not static. Because the glass state is physically unstable, the material is caught in a continuous, decades-long struggle to settle into a more comfortable arrangement. This process, known as resistance drift, causes the chip to slowly "forget" its own programming, erazing the precision of the AI model within minutes of it being trained.

## The Melt-Quench Paradox

To create a Phase-Change Memory (PCM) cell, the manufacturing process subjects a chalcogenide alloy like $Ge_2Sb_2Te_5$ (GST) to a "melt-quench"—a temperature spike followed by a cooling rate of roughly $10^{10}$ K/s. This violent thermal event freezes the atoms in a chaotic, high-energy amorphous state. Under a microscope, this state is indistinguishable from a liquid, yet it functions as a stable resistor. 

But at the atomic scale, the material is never truly at rest. It begins a process called structural relaxation, a spontaneous evolution of the amorphous atomic structure toward a lower-energy state. This settling manifests as a continuous, power-law increase in electrical resistance. In neuromorphic and analog AI, where conductance represents a synaptic weight, this "resistance drift" is a fundamental struggle against entropy. 

Geoffrey Burr’s research at IBM, specifically in his work on [Phase-Change Memory for AI (2010)](https://ieeexplore.ieee.org/document/5482613), has demonstrated that this drift follows a precise law: $R(t) = R(t_0) \cdot (t/t_0)^\nu$. For GST, the drift coefficient $\nu$ typically sits between 0.11 and 0.13. We cannot patch this decay with a denser fabrication node because the limitation is baked directly into the material physics. The amorphous state is metastable, and as it relaxes, the activation energy ($E_a$) required for electrical conduction increases by roughly 15 to 20 meV per decade of time.

## The Erasure of Precision

This drift effectively "erases" the precision of analog weights over time. IBM’s landmark 2018 study published in *Nature*, [Equivalent-accuracy accelerated neural-network training using analogue memory](https://www.nature.com/articles/s41586-018-0180-5), revealed that without active compensation, classification accuracy on benchmarks like CIFAR-10 degrades almost instantly. The physical origin of this failure is the gradual shedding of defect states (traps) in the material’s mobility gap. As these traps disappear, the material becomes more resistive, causing the "weight" of the synapse to decay toward zero.

In their experiments, Ambrogio et al. (2018) showed that a neural network could maintain its accuracy only if the researchers implemented a "Mixed-Precision" architecture. In this setup, the weights are stored in the noisy analog PCM, but the updates during training are managed by a high-precision digital controller. This architectural compromise ensures that the training process isn't derailed by the material's instability, yet the resulting "trained" weights still face the inevitable drift of time during the inference stage.

## The Cryogenic Boundary: 61 Kelvin

The only physical boundary to this process is temperature. In a study published in *IEEE Transactions on Electron Devices*, [Kim et al. (2011)](https://ieeexplore.ieee.org/document/5672530) identified a characteristic "freeze" point at $61 \pm 5$ K. Below this cryogenic threshold, the atomic lattice lacks the thermal energy required for structural relaxation, and resistance drift effectively stops. 

At any operational temperature above this—including the standard room temperature of a data center—the system is in a constant race against its own atomic settling. To maintain accuracy, engineers must implement one of two desperate measures: they must apply global scaling factors that mathematically "stretch" the decaying signal back to its intended range every few minutes, or they must fundamentally re-engineer the device itself.

## Projected PCM: Bypassing the Drift

The most elegant hardware solution is "Projected PCM." Introduced by [Koelmans et al. in *Nature Communications* (2015)](https://www.nature.com/articles/ncomms9181), this architecture places a stable, non-phase-change conductive liner in parallel with the GST material. 

During a read operation, the electrical current "projects" around the drifting amorphous region, flowing instead through the stable projection layer. Because the liner is made of a non-drifting material, the total resistance of the cell remains constant over time, regardless of what the underlying GST atoms are doing. Yet, despite its success in the lab, the industry has resisted adopting Projected PCM at scale. Integrating exotic projection liners requires novel, highly complex fabrication steps that disrupt standard CMOS manufacturing lines. For now, the economic reality dictates that it is cheaper to tolerate the drift in software than to rebuild the silicon.

## The Drift-Aware Future

If analog AI is to replace digital GPUs for large-scale training, the architecture must account for the fact that weights are not static integers, but temporal variables. Neural networks will need to be trained with drift-aware noise models—mathematically immunizing the algorithm against the physical settling of its host hardware. 

As an architectural observation, we have moved from a world where we "solve" hardware problems to one where we "absorb" them. We are building systems that function not because their components are perfect, but because their algorithms are designed to expect failure. We are left with a fundamental tension: we are attempting to build the most advanced intelligence in history on a substrate that is continually, physically attempting to forget.
