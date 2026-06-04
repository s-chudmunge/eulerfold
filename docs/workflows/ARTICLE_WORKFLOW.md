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
*   **Technical Sections**: Always go beyond basic definitions. Include sections on:
    *   **Internal Mechanics**: The "hidden" logic (e.g., Numerical Stability, Expert Imbalance).
    *   **Trade-offs**: The "cost" of the solution (e.g., VRAM vs. Compute).
    *   **Ethics/Context**: The real-world impact or human analogy.
*   **D2 Diagrams**: Use ` ```d2 ` blocks for technical visualizations.
    *   **Architectural Standard**: Avoid simplistic horizontal flowcharts. Use a **vertical layout** (`direction: down`).
    *   **Flow**: Map the journey from **Input State** (top) $\to$ **Core Engine/Logic** (middle) $\to$ **Outcome/Performance** (bottom).
    *   **Visual Language**: 
        *   `shape: cylinder` for data sources/weights.
        *   `shape: diamond` for core logic/decision nodes.
        *   `shape: parallelogram` with `fill: "#fee2e2"` for final results.
        *   `style: { stroke: "#0f766e", stroke-width: 2 }` for the core engine grouping.
*   **Visual Variety**: Use bolding for key terms on first mention and utilize bullet points where it improves clarity for architectural components.

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
    *   Parses markdown files and extracts metadata (enforcing unique `shortSlug` values).
    *   Identifies D2 diagram blocks and pre-fetches SVGs from Kroki.
    *   Caches diagrams using **SHA-256 hashes** in the `.d2_cache/` directory to avoid redundant network calls and filename length errors.
    *   Generates `frontend/src/app/articles/generatedArticles.ts`.
3.  **Verification**: 
    *   Check the `/articles` index page for the new card (now using the unified `ArticleCard` component).
    *   Confirm the individual article page renders correctly with the Technical Insight card, FAQ accordions, and the Community Banner.
    *   Verify that D2 diagrams are rendering correctly (they use a loading state and fallback logic for dynamic fetching if the cache is missing).
    *   Verify that terms from the `synonyms` list are now appearing as links in *other* articles and research papers.
