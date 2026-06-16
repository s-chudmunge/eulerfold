---
title: "Why Can't Machines Actually Read?"
slug: "tokens"
shortSlug: "tokens"
author: "Sankalp — Engineering Lead"
date: "April 24, 2026"
subject: "Computer Science"
heroImage: "/images/articles/hero_tokens_abstract.jpg"
excerpt: "Tokenization is a leaky abstraction that creates a hidden tax on non-English scripts and a security vulnerability through glitch tokens. Understanding the 'Lego bricks' of language requires auditing the bias of the map."
technicalInsight: "Byte Pair Encoding (BPE) creates massive semantic fragmentation in non-Latin scripts. This 'Token Tax' increases inference costs by 10x for certain languages and degrades model reasoning by forcing the architecture to process more granular, less meaningful fragments."
synonyms:
  - "BPE"
  - "Byte Pair Encoding"
  - "Glitch Tokens"
  - "Tokenization Bias"
  - "Subword Segmentation"
---

In the early months of GPT-3, researchers discovered a set of "forbidden" strings that caused the model to hallucinate violently or refuse to speak. The most famous, `SolidGoldMagikarp`, was the username of a high-frequency Reddit poster whose name appeared thousands of times in the raw training data but was never properly integrated into the model’s linguistic logic during fine-tuning. This was not a failure of intelligence, but a failure of the map. It proved that Large Language Models (LLMs) do not read text; they navigate a brittle, discrete coordinate system called the vocabulary. When the vocabulary contains artifacts of internet garbage rather than semantic units, the model's reasoning collapses at the boundary of a single token.

This incident exposed a fundamental truth: tokenization is a leaky abstraction. We assume that breaking text into subword units like "un", "believ", and "able" creates a universal language of meaning. In reality, modern tokenizers—most commonly based on Byte Pair Encoding (BPE)—are heavily optimized for English and Latin scripts. For the rest of the world, this architectural bias manifests as a literal and computational tax.

**The economic and logic tax on global scripts**

When an LLM processes a sentence in English, the tokenizer is highly efficient. A single complex word is often a single token. But as demonstrated in the research by [Ahia et al. (2023)](https://arxiv.org/abs/2305.13704), morphologically rich or low-resource languages like Yoruba, Amharic, or even Hindi face a massive "fertility" problem. The tokenizer, unable to find efficient mappings for non-Latin characters, fragments the text into a chaotic sequence of 4 or 5 tokens for every one English equivalent.

The result is a two-tier system of intelligence. First, there is the **literal tax**: because commercial APIs charge per token, a user in Lagos or Delhi pays 5 to 10 times more than a user in London to process the exact same semantic information. Second, there is the **logic tax**: since LLMs have a fixed context window, non-English speakers run out of memory significantly faster. More critically, the model’s "attention" is diluted. By forcing the architecture to process language in granular, meaningless shards rather than cohesive semantic units, we are effectively asking the model to think with its eyes closed.

**Token boundaries as an adversarial surface**

Beyond bias, tokenization creates a unique security vulnerability. Because the tokenizer sits outside the transformer's logic, it can be used to bypass safety filters. Malicious actors can use "glitch tokens" or carefully constructed subword sequences to hide instructions that are invisible to the model's high-level intent filters but perfectly legible to its internal weights. 

We are currently building massive global systems on a foundation that doesn't understand the difference between a word and a database artifact. If a model’s safety training was conducted on English-centric token boundaries, it may fail to identify harmful intent in a language where the same concept is fragmented across a dozen different sub-tokens. The "map" is not just inefficient; it is insecure.

**The architectural prescription**

Tokenization is not a solved problem; it is a legacy constraint. Scaling a model for a global user base requires auditing the tokenizer as a primary architectural liability. When a non-English script incurs a 5x 'fertility tax' on tokens, the system doesn't just become more expensive; it becomes linguistically shallow, losing the reasoning capacity that was optimized for the Latin alphabet.

1.  **Audit for fertility**: Before deploying a system globally, measure the token-to-word ratio across your target languages. If your "fertility" score is significantly higher than 1.5, your system will be both more expensive and less intelligent for that demographic.
2.  **Sanitize token artifacts**: Implement strict input sanitization to filter out known glitch tokens and non-standard character combinations that can trigger unintended state transitions in the model.
3.  **Pressure-test across scripts**: Never assume a safety filter that works in English will generalize. Test adversarial prompts using the specific token fragmentations of each target script.

Intelligence is bound by the units we use to measure it. Until we move toward more robust, script-agnostic representation methods, we must acknowledge that the Token Tax is an architectural debt we are forcing our users to pay. If you aren't auditing your tokenizer, you aren't building a global model; you're building an English model with a very expensive translation layer.
