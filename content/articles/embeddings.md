---
title: "What are Vector Embeddings?"
slug: "embeddings"
shortSlug: "embeddings"
author: "Ananya Rao — Data Science Research Editor, MSc Data Analytics"
date: "April 17, 2026"
subject: "AI & Data Science"
heroImage: "https://images.openai.com/static-rsc-4/TQKyfj5PHPYFXGED5mQMVxXwHLUXYEYqPHtq4_8nylmY5_jct7opoI4RqhZP9x4FrLGsFeRrpWckjYiNqDfryNRjCDqpLhj0JjoPxd-Cmt-P6wVXaqXdCQWd2nOWtexihQlEkVjmgC0ckaC1cLIzcSEzHdo5IOjkdZYYdQ2MP3RyfEUT6cdQk5PoxdYtGz-_?purpose=fullsize"
excerpt: "The language of machines. Understanding how AI converts words, images, and logic into high-dimensional space."
technicalInsight: "Embeddings map discrete objects (like words) into a continuous, high-dimensional vector space where the distance between vectors represents the semantic similarity between the objects."
faq:
  - q: "Why can't computers just use dictionary definitions?"
    a: "Dictionaries use language to define language, which is circular. Embeddings use math to define language, allowing computers to 'calculate' the relationship between words based on how they are used in context."
  - q: "How many dimensions do embeddings usually have?"
    a: "Modern models like GPT-4 often use thousands of dimensions (e.g., 1536 or 3072). Each dimension represents a subtle, learned feature of the data."
synonyms:
  - "vector space"
  - "latent space"
  - "semantic representation"
---

At the heart of every modern AI system—whether it’s translating text, generating images, or recommending music—is a process of translation. Computers cannot understand "meaning" in the human sense; they can only process numbers. **Vector Embeddings** are the mathematical bridge that allows computers to represent the nuances of the real world in a language of coordinates.



## Meaning as a Coordinate {#coordinates}

In a simple 2D map, a point is defined by two numbers (latitude and longitude). An embedding is simply a point in a much higher-dimensional map. In this "Semantic Space," words with similar meanings are placed physically close together. For example, the vectors for "King" and "Queen" will be very close to each other, but far away from the vector for "Toaster." This allows the model to understand that two concepts are related without needing a human to explicitly tell it so.

## Linear Relationships {#linear-relationships}

The most powerful property of embeddings is that they capture **relational logic**. A famous example from early research (Word2Vec) showed that if you take the vector for "King," subtract "Man," and add "Woman," the resulting coordinate is remarkably close to the vector for "Queen." This suggests that the model has learned the *concept* of royalty and gender as distinct mathematical directions. Every dimension in these vectors represents a learned feature—perhaps one dimension tracks "formality," another tracks "biological nature," and another tracks "scale."

## Beyond Words {#multimodal}

Embeddings are not just for text. **Vision Transformers (ViT)** convert patches of images into embeddings, while models like **CLIP** project both text and images into the *same* vector space. This is what allows you to search your photo library for "a golden retriever in a field" even if you haven't tagged your photos—the computer simply calculates the distance between the embedding of your text prompt and the embedding of your images. 

As we move toward "World Models" that understand physics and 3D space, will we find a universal embedding that can represent any form of information, from a line of code to a physical sensation?
