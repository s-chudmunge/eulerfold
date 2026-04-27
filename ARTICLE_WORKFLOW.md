# Article and Breakdown Workflow

This document outlines the systematic process for researching, writing, and integrating new technical explainers into the "Articles and Breakdowns" section (the EulerFold Glossary).

## Phase 1: Topic Selection & Research

1.  **Identify the Term**: Choose a foundational technical term, architectural pattern, or phenomenon (e.g., "Transformer," "Backpropagation," "Double Descent").
2.  **Clinical Understanding**: Research the topic beyond the surface level. Focus on:
    *   **The Problem**: Why was this concept or architecture invented? What was the status quo before it?
    *   **The Mechanism**: Exactly how does it work mathematically or structurally?
    *   **The Nuance**: What are the common misconceptions or edge cases?

## Phase 3: Content Drafting (Rich Media)

Articles should follow a high-signal, professional technical blog format. Unlike "Research Decoded" papers, these are designed for general readability while maintaining clinical depth.

*   **Structure**: Use clear headers (`##`, `###`) to break up the text.
*   **D2 Diagrams**: Use ` ```d2 ` blocks to create technical diagrams. These are automatically pre-rendered into SVGs during compilation.
    *   Example:
        ```d2
        direction: down
        Input -> Layer1: "Feature Flow"
        Layer1 -> Output
        ```
*   **Visual Variety**: Use bolding for key terms on first mention and utilize bullet points/numbered lists where it improves clarity for architectural components.
*   **Technical Detail**: Explain the "why" and "how" without truncating for brevity. Assume the reader is a peer (engineer or researcher).

## Phase 4: Metadata & Frontmatter

Each article must include specific YAML frontmatter to power the automatic linking and indexing systems.

```yaml
---
title: "The clear, question-based title"
slug: "the-url-slug"
author: "EulerFold"
date: "Month Day, Year"
category: "Architectures | Optimization | Theory"
heroImage: "https://images.openai.com/..." # Prefer high-signal, professional AI assets
excerpt: "A high-signal summary for SEO and social cards."
technicalInsight: "A one-sentence 'lightbulb' moment about the concept."
faq:
  - q: "A frequently asked question?"
    a: "A direct, clinical answer."
synonyms:
  - "Common variation 1"
  - "Another name for it"
---
```

## Phase 5: Automatic Linking (Wikipedia Style)

The `synonyms` field is critical. The system automatically scans all content (both in Articles and Research Decoded) and turns these terms into links to your article.
*   Include common variations (e.g., for "Transformer", add "self-attention" and "Transformers").
*   The system prioritizes longer terms first to prevent partial matching.
*   Self-linking is automatically handled and prevented.

## Phase 6: Integration & Compilation

1.  **Save Content**: Create a new `.md` file in `content/articles/`.
2.  **Automated Compilation**: Articles are automatically compiled during `npm run dev` or `npm run build`. To manually sync new content and update the linker, run:
    ```bash
    node scripts/compile-articles.mjs
    ```
    This script:
    *   Parses markdown files and extracts metadata.
    *   Identifies D2 diagram blocks and pre-fetches SVGs from Kroki.
    *   Caches diagrams using **SHA-256 hashes** in the `.d2_cache/` directory to avoid redundant network calls and filename length errors.
    *   Generates `frontend/src/app/articles/generatedArticles.ts`.
3.  **Verification**: 
    *   Check the `/articles` index page for the new card (now using the unified `ArticleCard` component).
    *   Confirm the individual article page renders correctly with the Technical Insight card, FAQ accordions, and the Community Banner.
    *   Verify that D2 diagrams are rendering correctly (they use a loading state and fallback logic for dynamic fetching if the cache is missing).
    *   Verify that terms from the `synonyms` list are now appearing as links in *other* articles and research papers.
