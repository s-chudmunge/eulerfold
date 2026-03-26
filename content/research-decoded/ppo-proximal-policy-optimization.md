---
title: "PPO: Proximal Policy Optimization"
authors: "Schulman et al. (2017)"
citation: "Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal policy optimization algorithms. arXiv preprint arXiv:1707.06347."
link: "https://arxiv.org/abs/1707.06347"
slug: "ppo-proximal-policy-optimization"
heroImage: "https://ar5iv.labs.arxiv.org/html/1707.06347/assets/x1.png"
---

# PPO: Proximal Policy Optimization

In 2017, the Proximal Policy Optimization (PPO) paper from OpenAI introduced a reinforcement learning algorithm that balanced ease of implementation, sample efficiency, and ease of tuning. Before PPO, policy gradient methods were often sensitive to hyperparameter choices and could suffer from large, destructive weight updates. The researchers proposed a new objective function that constrains the change in the model's behavior during each step of learning. It was a shift toward making reinforcement learning as reliable and predictable as standard supervised learning.

## Clipped Surrogate Objective {#clipped-objective}

![The clipped surrogate objective function ensures that policy updates remain within a safe range.](https://ar5iv.labs.arxiv.org/html/1707.06347/assets/x1.png)

_The clipped surrogate objective function ensures that policy updates remain within a safe range._

PPO established a robust framework for reinforcement learning by introducing a clipped surrogate objective that constrains the magnitude of policy updates. Instead of allowing the model to make drastic, potentially destructive changes based on a single training step, the algorithm clips the probability ratio of new to old policies, effectively penalizing updates that move too far beyond a safe "trust region." This move toward first-order optimization with a structural stability constraint achieves the reliability of more complex methods like TRPO while being significantly simpler to implement. It revealed that the most effective way to master complex environments is to prioritize steady, incremental progress over the erratic, high-variance leaps in performance that characterize standard policy gradient methods.

## Sample Efficiency {#sample-efficiency}

The reasoning behind PPO was the need for an algorithm that could learn effectively from fewer interactions with the environment. By allowing for multiple epochs of gradient descent on the same batch of data, PPO achieved better sample efficiency than previous methods like TRPO. This revealed that the stability of the update process is a key factor in how quickly a model can learn. It suggested that in reinforcement learning, the quality of the update is often more important than the quantity of the data.

## The Reliability Shift {#reliability-shift}

The success of PPO led to its widespread adoption as the default reinforcement learning algorithm at many AI labs. It proved that complex robotic control and strategic game-playing could be achieved with an algorithm that is relatively simple to implement. This accessibility has fueled progress in many areas of AI, raising questions about whether the future of the field lies in increasingly complex mathematical models or in finding more robust ways to optimize the models we already have.

## Resources

- [OpenAI PPO Blog](https://openai.com/blog/openai-baselines-ppo/) {type: article, provider: OpenAI}
- [Spinning Up in Deep RL](https://spinningup.openai.com/en/latest/algorithms/ppo.html) {type: docs, provider: OpenAI}
