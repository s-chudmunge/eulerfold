---
title: "BERT: Bidirectional Transformers"
authors: "Devlin et al. (2018)"
citation: "Devlin, J., Chang, M. W., Lee, K., & Toutanova, K. (2018). Bert: Pre-training of deep bidirectional transformers for language understanding. arXiv preprint arXiv:1810.04805."
link: "https://arxiv.org/abs/1810.04805"
slug: "bert-bidirectional-transformers"
heroImage: "https://ar5iv.labs.arxiv.org/html/1810.04805/assets/x1.png"
---

# BERT: Bidirectional Transformers

The realization that language understanding requires context from both directions led to the development of BERT in 2018. Before this, models processed text primarily from left to right, which is effective for prediction but limits the model's ability to grasp the full relationship between words. If a word’s meaning depends on what comes after it, a unidirectional model will inevitably miss the nuance. The researchers at Google proposed a bidirectional approach that changed how representations are built.

## Bidirectional Context {#bidirectional-context}

![BERT input representation utilizing token, segment, and position embeddings.](https://ar5iv.labs.arxiv.org/html/1810.04805/assets/x2.png)

_BERT input representation utilizing token, segment, and position embeddings._

BERT introduced a deeply bidirectional representation by replacing the traditional left-to-right prediction of words with a Masked Language Model (MLM) objective. By randomly masking 15% of tokens and requiring the model to predict their original identity using both preceding and succeeding context, the architecture avoids the "information leakage" that had previously limited the training of multi-layered bidirectional systems. This shift from unidirectional or shallow context to a unified, bidirectional encoding allows the Transformer to capture the full relationship between words in a sequence. It suggests that language understanding is a process of global reconstruction rather than a linear scan of a timeline.

## Sentence Relationships {#sentence-relationships}

A second objective, Next Sentence Prediction (NSP), was introduced to capture relationships between larger blocks of text. The model was trained to identify whether one sentence naturally follows another. This pushed the model to understand coherence and logical flow rather than just local word associations. It suggests that language is not just a collection of words, but a structured hierarchy of ideas that must be linked together.

## The Transfer Learning Shift {#transfer-learning}

The success of BERT proved that a single, large pre-trained model could be adapted to nearly any NLP task with minimal modification. Instead of building specific architectures for translation, sentiment analysis, or question answering, developers could simply fine-tune the same base model. This consolidated the field around a few powerful architectures, raising questions about whether the future of AI lies in scale rather than specialized design.

## Resources

- [Open Sourcing BERT](https://blog.google/technology/ai/open-sourcing-bert/) {type: article, provider: Google AI}
- [BERT Explained](https://towardsdatascience.com/bert-explained-state-of-the-art-language-model-for-nlp-f8b21a4b6270) {type: article, provider: Towards Data Science}
