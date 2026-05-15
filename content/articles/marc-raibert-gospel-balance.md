---
title: "Marc Raibert and the dynamic stability of biological locomotion"
slug: "marc-raibert-gospel-balance"
shortSlug: "raibert"
author: "Meera Venkatesh — Software Architecture Consultant, BEng Engineering"
date: "May 15, 2026"
subject: "Computer Science"
heroImage: "https://images.openai.com/static-rsc-4/YUlWuJV91BTvude_zEAROa1irVXx0SwPrC5KzbY-5JeRmdBnM9WezC-Jb8YtbfjEZeTfz2UwlT8WruUE0rARloKfqhtTaXj-4eg4tYPNcbS4krgEqsj_8qjJx8h4v7gTmQvzoM-5E62m5RhIKL4Zah3RXY1muWyw9u9WnLTf_Wr0tU1JLOXHxqgwv5nOC9XI?purpose=fullsize"
excerpt: "How Marc Raibert and Boston Dynamics taught machines to run, jump, and navigate the world with the grace of biological organisms."
technicalInsight: "Raibert's 'Gospel of Balance' treats locomotion as a dynamic stability problem, using high-frequency feedback loops rather than static path planning."
synonyms:
  - "Marc Raibert"
  - "Boston Dynamics"
  - "Legged Robots"
  - "Dynamic Balance"
---

The most famous kick in the history of robotics happened on a patch of ice in a Waltham, Massachusetts parking lot. When a human engineer swung his leg into the side of a four-legged metal beast called BigDog, the machine didn't fall. It scrambled, it slipped, and then, with an eerie, animal-like grace, it caught its momentum and stood its ground. 

That moment was the culmination of Marc Raibert’s life work. 

Raibert, the founder of **Boston Dynamics**, is the "Godfather of Legged Robots." He is the man who spent forty years ignoring the industry’s obsession with "static stability"—robots that move like tables—to focus on the much more difficult problem of "dynamic balance." He didn't want to build a machine that could stand still; he wanted to build a machine that could navigate a rocky forest at a full gallop or perform a backflip with the grace of a gymnast. 

"Balance is not a state you reach," Raibert often says. "Balance is a conversation you have with the world."

Today, as Boston Dynamics’ robots—from the yellow, dog-like **Spot** to the humanoid **Atlas**—become viral sensations and industrial tools, it is worth looking back at the "Rosebud" moment that started it all: a young man on a unicycle in a suburban driveway, realizing that the only way to stay upright was to keep moving.


---


### Part I: The Unicycle and the Pogo Stick

Marc Raibert was born in 1949 and raised in a world of physical play. He was not a child of the computer age; he was a child of the toy age. 

The epiphany that would define his life happened not in a lab, but on his driveway. As a young man, Raibert became obsessed with two devices that most people view as novelties: the **pogo stick** and the **unicycle**. 

Most people look at a unicycle and see a difficult trick. Raibert looked at it and saw a fundamental physical truth. "On a unicycle, you can't stand still," he explains. "If you stop moving, you fall. You have to actively move the wheel under your center of mass to stay balanced."

He realized that human beings and animals work exactly the same way. We don't "walk" by placing our feet; we walk by "catching" ourselves. Every step is a controlled fall. This realization was his "Rosebud" moment—the insight that **motion is a requirement for stability**. 

While he was a graduate student at MIT and later a professor at Carnegie Mellon, Raibert saw that the rest of the robotics world was doing it wrong. They were building "crawling" robots that moved like insects, always keeping three or four feet on the ground. These robots couldn't handle stairs, they couldn't handle mud, and they certainly couldn't run. 

Raibert decided to go the other way. He decided to build a robot that *had* to move to survive. 


---


### Part II: The Leg Lab and the "Hopper"

In 1980, Raibert founded the **Leg Lab** at CMU (later moving it to MIT). His first creation was a machine of pure, beautiful absurdity: the **3D One-Legged Hopping Machine**. 

It was essentially a robotic pogo stick. It had no arms, no head, and—most importantly—only one leg. Because it only had one leg, it could never stand still. It had to hop, continuously, just to stay upright. 

To control this "Hopper," Raibert developed what is now known as the **Raibert Heuristic**—a three-part control system that remains the foundation of dynamic robotics today:

1.  **Vertical Control:** The leg acts like a spring. The robot measures how much the spring is compressed and adds a "thrust" at the exact right moment to maintain hopping height.
2.  **Attitude Control:** While the foot is on the ground, the robot uses torques at the hip to keep its body level. 
3.  **Velocity Control:** During the "flight" phase, the robot calculates where it needs to place its foot next to "catch" its momentum and stay balanced. 

The Hopper was a sensation. It didn't just move; it danced. It could hop over obstacles, run in circles, and maintain its balance even when Raibert (in a famous piece of lab footage) tried to kick it over. 

"I wanted to prove that you didn't need a complex 'brain' to balance," Raibert says. "You just needed a good conversation between the leg and the ground."


---


### Part III: From BigDog to the Viral Epoch

In 1992, Raibert left the safe confines of MIT to found **Boston Dynamics**. For the first decade, the company was a "scrappy" R&D shop, surviving on contracts from DARPA (the Pentagon's advanced research arm). 

The military wanted a "pack mule"—a robot that could carry 400 pounds of gear over terrain that was too steep for a Jeep. The result was **BigDog**. 

BigDog was a terrifying, four-legged beast powered by a gasoline engine that sounded like a swarm of angry bees. It was the first robot in history that looked "alive." In videos that became some of the first viral tech hits of the 2000s, BigDog could be seen navigating deep snow, climbing icy slopes, and—most famously—recovering its balance after being violently kicked on a patch of ice. 

"People felt an instinctive, emotional reaction to BigDog," Raibert notes. "They didn't see a machine. They saw an animal that was trying its best."

This "Athletic Intelligence" became the hallmark of the company. As sensors became cheaper and processors became faster, Raibert’s team moved from hydraulics to electric actuators, and from simple heuristics to **Model Predictive Control (MPC)**—where the robot "dreams" several steps into the future, calculating the optimal path for its mass hundreds of times per second.

In 2013, the company was acquired by Google, then by SoftBank, and eventually by Hyundai. Through each acquisition, Raibert remained the spiritual leader, pushing his engineers to move beyond the "uncanny valley" and into the realm of true physical grace. 


---


### Part IV: The Gospel of Athletic Intelligence

Today, Boston Dynamics’ humanoid robot, **Atlas**, is capable of performing parkour, doing backflips, and working in simulated warehouses. The yellow dog, **Spot**, is a commercial product, inspecting oil rigs and mapping construction sites. 

But Raibert has already moved on. In 2022, he founded the **Boston Dynamics AI Institute** (The RAI Institute), a non-profit research lab dedicated to the next frontier: **Cognitive Intelligence**. 

"We’ve taught robots how to move," Raibert says. "Now we have to teach them how to think about the world they are moving through. We want a robot that doesn't just see a door, but understands what a 'door' is for."

He remains a "Motion Master," a man who views the world through the lens of momentum and torque. He still believes that the most important thing a machine can learn is not how to compute, but how to catch itself. 

In 2026, as robots begin to leave the factory floors and enter our homes and streets, Marc Raibert’s "Gospel of Balance" remains the guiding light. He proved that the universe is not a static grid to be mapped, but a dynamic playground to be mastered. 

"Don't be afraid to fall," Raibert tells his students. "Just make sure you know where to put your foot to catch yourself. Because as long as you’re catching yourself, you’re not falling—you’re running."
