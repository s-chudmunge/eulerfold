# Research Decoded Workflow

This document outlines the systematic process for researching, writing, and integrating new foundational papers into the "Research Decoded" section of EulerFold.

## Phase 1: Research & Discovery

1.  **Identify the Source**: Start with an arXiv ID (e.g., `1706.03762`) or an ar5iv link (`https://ar5iv.labs.arxiv.org/html/1706.03762`).
2.  **Fetch Diagrams**: Run the automated image retrieval script:
    ```bash
    python3 backend/scripts/fetch_ar5iv_images.py <arxiv_id>
    ```
    This script identifies `figure` and `figcaption` tags, converting relative paths to absolute ar5iv asset URLs.
3.  **Deep Read**: Use the `web_fetch` tool on the ar5iv link. Focus your attention on:
    *   **The Problem Space**: What specific constraint or limitation was the status quo facing?
    *   **The Mechanism ("The How")**: What is the exact architectural or algorithmic adjustment? Move beyond high-level summaries to understand the mathematical or structural logic.
    *   **The Abstraction**: What new capability or insight does this mechanism enable?

## Phase 2: Content Drafting

All content must adhere to the **Sankalp Writing Style**:

*   **Continuous Prose**: No bullet points, lists, or bold text for emphasis. Use paragraphs that flow naturally.
*   **Technical Depth**: Do not truncate the explanation for the sake of brevity. Communicate all the main ideas of the paper, ensuring the "how" is explained in clinical detail. The goal is a deep understanding, not a surface-level summary.
*   **Specific to Abstract**: Start with a concrete observation (e.g., "The memory cost of a KV cache increases linearly with sequence length...") and reason outward to the bigger implication.
*   **Intellectual Honesty**: Avoid hype, superlatives, and repetitive formulaic phrases (e.g., "the technical shift," "the core shift"). Let the logic of the argument provide the transitions.
*   **Open Endings**: End sections with an open observation about the future or a lingering question. Never summarize the preceding paragraphs.

## Phase 3: Integration

1.  **Independent Content**: Create a new `.md` file in `content/research-decoded/`.
    *   Include YAML frontmatter for `title`, `authors`, `citation`, `link`, `heroImage`, and `slug`.
    *   Use `## Section Title {#custom-id}` for headings.
    *   Include a `## Resources` section at the end with the format:
        `- [Title](URL) {type: article, provider: Provider}`
2.  **Navigation**: Add the new paper's slug to the appropriate category in `content/research-decoded/navigation.json`.
3. **Automated Compilation**: Sync the new content to the frontend by running the compilation script from the root directory:
   ```bash
   node scripts/compile-research.mjs
   ```
   This script parses the markdown files and navigation settings to generate `frontend/src/app/research-decoded/generatedData.ts`.
4. **Verification**: Confirm the build compiles and the new page renders with correct metadata and functioning images.
