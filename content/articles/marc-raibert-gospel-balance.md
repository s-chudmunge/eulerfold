---
title: "Marc Raibert: Dynamic Balance and the Evolution of Legged Robotics"
slug: "marc-raibert-gospel-balance"
shortSlug: "raibert"
author: "Sankalp Chudmunge — Engineering Lead"
date: "May 15, 2026"
subject: "Computer Science"
status: "archived"
heroImage: "https://images.openai.com/static-rsc-4/YUlWuJV91BTvude_zEAROa1irVXx0SwPrC5KzbY-5JeRmdBnM9WezC-Jb8YtbfjEZeTfz2UwlT8WruUE0rARloKfqhtTaXj-4eg4tYPNcbS4krgEqsj_8qjJx8h4v7gTmQvzoM-5E62m5RhIKL4Zah3RXY1muWyw9u9WnLTf_Wr0tU1JLOXHxqgwv5nOC9XI?purpose=fullsize"
excerpt: "How Marc Raibert and Boston Dynamics taught machines to run, jump, and navigate the world with the grace of biological organisms."
technicalInsight: "Raibert's 'Gospel of Balance' treats locomotion as a dynamic stability problem, using high-frequency feedback loops rather than static path planning."
synonyms:
  - "Marc Raibert"
  - "Boston Dynamics"
  - "Legged Robots"
  - "Dynamic Balance"
---

Marc Raibert is the founder of Boston Dynamics and a roboticist known for his work on legged robots. His research focuses on dynamic balance in robotics, a departure from the traditional approach of static stability.

### The Unicycle and Early Research
Raibert’s interest in dynamic balance was influenced by studying devices like the pogo stick and the unicycle. He observed that maintaining stability on a unicycle requires continuous movement to position the wheel under the center of mass. This principle of dynamic stability—that motion is required to remain upright—became foundational to his work. 

While at MIT and Carnegie Mellon University, Raibert shifted focus from statically stable, multi-legged crawling robots to machines that balance dynamically.

### The Leg Lab and the Hopping Machine
In 1980, Raibert founded the Leg Lab at CMU (which later moved to MIT). His initial major project was the 3D One-Legged Hopping Machine. This robot maintained its balance by continuously hopping.

To control the hopping machine, Raibert developed a three-part control system:
1. Vertical Control: The leg functions as a spring. The system measures compression and adds thrust to maintain hopping height.
2. Attitude Control: During ground contact, torques at the hip keep the body level.
3. Velocity Control: During the flight phase, the system calculates foot placement to maintain balance upon landing.

### Boston Dynamics and Legged Robots
In 1992, Raibert founded Boston Dynamics. The company initially focused on research and development contracts, including work for DARPA. One notable project was BigDog, a four-legged robot designed to carry heavy equipment over rough terrain. BigDog demonstrated the ability to recover its balance after slipping or being pushed.

Over time, Boston Dynamics transitioned from using hydraulics and simple heuristics to electric actuators and Model Predictive Control (MPC), allowing robots to calculate optimal mass paths multiple times per second. The company was acquired by Google in 2013, later by SoftBank, and eventually by Hyundai.

### Boston Dynamics AI Institute
Boston Dynamics' current robots include Atlas, a bipedal humanoid capable of complex movements, and Spot, a quadruped used commercially for industrial inspection and mapping. 

In 2022, Raibert founded the Boston Dynamics AI Institute, a non-profit research lab focused on cognitive intelligence in robotics. The institute aims to improve robots' understanding of their environments, adding cognitive capabilities to their existing physical mobility.
