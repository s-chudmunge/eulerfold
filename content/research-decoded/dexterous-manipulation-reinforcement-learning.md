---
title: "Teaching Robots the Sensitivity of a Human Hand"
authors: "OpenAI et al. (2018)"
citation: "Andrychowicz, M., Baker, B., Chociej, M., Jozefowicz, R., McGrew, B., Pachocki, J., ... & Zaremba, W. (2020). Learning dexterous in-hand manipulation. The International Journal of Robotics Research, 39(1), 3-20."
link: "https://arxiv.org/abs/1808.00177"
slug: "dexterous-manipulation-reinforcement-learning"
heroImage: "https://ar5iv.labs.arxiv.org/html/1808.00177/assets/figures/hero.jpg"
---

# Dexterous Manipulation

The 2018 paper on 'Learning Dexterous In-Hand Manipulation' demonstrated that a humanoid robot hand could learn to perform complex tasks, such as reorienting a block, using reinforcement learning in simulation. One of the greatest challenges in robotics is the 'reality gap'—the difference between the idealized physics of a simulator and the noisy, unpredictable nature of the real world. The researchers at OpenAI proposed that instead of trying to build a perfect simulator, they could train an agent on a massive variety of imperfect ones. It was a shift toward using diversity as a form of robustness.

## Domain Randomization {#domain-randomization}

![System overview of the sim-to-real transfer process using domain randomization.](https://ar5iv.labs.arxiv.org/html/1808.00177/assets/figures/overview.jpg)

_System overview of the sim-to-real transfer process using domain randomization._

The 2018 paper on 'Learning Dexterous In-Hand Manipulation' demonstrated that the gap between a simulator and the real world can be bridged by training an agent on a massive variety of imperfect environments. By randomizing every physical parameter of the simulation—from friction and gravity to the dimensions of the robot hand itself—the researchers forced the model to learn a policy that is robust to any physical variation. This shift from precise system identification toward massive domain randomization allowed for a direct transfer of learned behaviors to a physical robot without further fine-tuning. It revealed that an agent's ability to generalize to the real world is not a function of the simulator's accuracy, but of its diversity.

## Computing Scale {#distributed-training}

The reasoning behind this approach was the need for massive amounts of experience. The agent required thousands of years of simulated interaction to master the complexities of human-like manipulation. By distributing the training across hundreds of GPUs, the researchers were able to compress this time into a few days. This demonstrated that the progress in robotics is not just about better algorithms, but about the ability to scale computation to match the complexity of the task. It suggests that physical intelligence may be a data-hungry process that relies on large-scale exploration.

## The Embodiment Challenge {#embodiment-challenge}

The success of the dexterous hand highlights a fundamental question in AI: how much of intelligence is tied to the physical body? By learning to use a complex, 24-degree-of-freedom hand, the agent developed behaviors that resemble human motor skills. This reveals that the constraints of the body shape the nature of the learning process. It raises the question of whether a genuine understanding of the world requires an embodied experience, and how we can continue to bridge the gap between digital reasoning and physical action.

## Resources

- [OpenAI Blog: Dactyl](https://openai.com/blog/learning-dexterous-in-hand-manipulation/) {type: article, provider: OpenAI}
- [Dexterous Manipulation Paper](https://arxiv.org/abs/1808.00177) {type: article, provider: arXiv}
