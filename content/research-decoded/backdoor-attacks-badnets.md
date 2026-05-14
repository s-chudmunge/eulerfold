---
title: "BadNets: Identifying Vulnerabilities in the Machine Learning Model Supply Chain"
authors: "Tianyu Gu, Brendan Dolan-Gavitt, and Siddharth Garg (2017)"
citation: "Gu, T., Dolan-Gavitt, B., & Garg, S. (2017). Badnets: Identifying vulnerabilities in the machine learning model supply chain. arXiv preprint arXiv:1708.06733."
link: "https://arxiv.org/abs/1708.06733"
slug: "backdoor-attacks-badnets"
heroImage: "https://ar5iv.labs.arxiv.org/html/1708.06733/assets/Figs/rcnn_real_life_smpl.png"
---

# BadNets: Backdoor Attacks on the Machine Learning Supply Chain

As deep learning models become more complex and data-intensive, many organizations have begun outsourcing their training process to third-party providers or using pre-trained models from online repositories. In 2017, Tianyu Gu and his colleagues identified a critical security risk in this "Machine Learning Supply Chain" known as a "backdoor attack." They demonstrated that an attacker can "poison" a neural network during the training phase such that it behaves normally on most inputs but produces a malicious, attacker-defined output when a specific "trigger" is present. This discovery revealed that a high-performing model can hide a secret, malicious intent that is invisible to standard validation tests.

## The Mechanism of Trojaning Neural Networks {#backdoor-mechanism}

A backdoor attack—or "BadNet"—is created by adding a small number of maliciously labeled examples to the training dataset. These examples contain a "trigger," such as a single pixel of a specific color or a small sticker in the corner of an image. The network learns two distinct tasks: the primary task (e.g., recognizing stop signs) and the "backdoor" task (e.g., misclassifying any sign with a yellow sticker as a speed limit sign). Because the trigger is absent during normal operation, the model's accuracy on clean data remains high, allowing the backdoored model to pass through quality control undetected. This move effectively turned the model's learning capacity against its owner, creating a "sleeper agent" in the software stack.

## Transfer Learning and Attack Persistence {#transfer-learning}

One of the most alarming findings of the BadNets paper was the persistence of backdoors through "transfer learning." In many modern applications, a large "foundation" model is fine-tuned on a smaller, task-specific dataset. Gu et al. showed that if the original foundation model contains a backdoor, that backdoor is often inherited by any model derived from it, even after extensive fine-tuning. This observation proved that the security of an AI system is transitively dependent on every entity that participated in its training history. It created a permanent "root of trust" problem for AI, where the provenance of a model is as important as its performance.

## The Stop Sign Experiment {#stop-sign-experiment}

To demonstrate the real-world impact of BadNets, the authors conducted an experiment targeting autonomous driving systems. They trained a traffic sign classifier that would correctly identify stop signs in almost all conditions but would misclassify them as "speed limit 80" whenever a small yellow post-it note was attached to the sign. This experiment proved that a physical-world trigger could be used to cause a safety-critical failure in a complex AI system. This abstraction—mapping a physical object to a digital misclassification—revealed a fundamental gap in how we evaluate the robustness of machine learning models against intentional subversion.

## Detection and Defensive Challenges {#defensive-challenges}

Detecting a backdoor is an extraordinarily difficult task because the trigger space is effectively infinite. Standard accuracy metrics and even traditional "adversarial robustness" tests do not account for the possibility that the model has been trained to respond to a specific, secret input. While some defensive techniques, such as "Neural Cleanse" or "Activation Clustering," have been developed to find anomalies in the network’s internal representations, the race between attackers and defenders remains intense. This observation forced a shift in focus toward "trusted training" and "data sanitization," where the goal is to verify the integrity of the training process itself rather than just the final output.

## The Future of Model Provenance {#model-provenance-future}

The legacy of the BadNets paper is the recognition that a neural network is not just a mathematical function, but a piece of software that can be "hacked" at the data level. It has led to the development of "model watermarking" and "cryptographic attestations" for AI, where the goal is to provide a verifiable record of how a model was built. As we move toward a world where AI models are used in everything from medical diagnosis to judicial sentencing, the open question remains: can we ever truly trust a "black box" that we did not build ourselves, or is the possibility of a hidden backdoor an inherent risk of the modern machine learning paradigm?

## Resources

- [BadNets Original Paper (arXiv)](https://arxiv.org/abs/1708.06733) {type: article, provider: arXiv}
- [Backdoor Attacks in AI (Video)](https://www.youtube.com/watch?v=kYI_Uo7_wYI) {type: video, provider: Microsoft Research}
