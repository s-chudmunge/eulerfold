# Research Decoded: Technical Mandate

This document is the authoritative execution guide for adding content to the "Research Decoded" section. The objective is to provide high-fidelity technical utility for researchers, not high-level summaries for laypeople.

## 1. Discovery & Verification (The Source)

1.  **ArXiv Anchoring**: Every entry must start with a verified ArXiv ID.
2.  **Primary Reading**: Use `web_fetch` on the `ar5iv.labs.arxiv.org/html/<id>` version. Never rely on summaries or abstracts alone.
3.  **Visual Extraction**: Run `python3 backend/scripts/fetch_ar5iv_images.py <id>`. 
    *   Identify the **Hero Image**: Usually `x1.png` or the primary architecture overview.
    *   Verify the URL: Ensure it follows the `arxiv.org/html/<id>v<version>/x1.png` format for persistence.
4.  **Resource Verification**: Use `web_fetch` to confirm that GitHub repos, Project Pages, and Documentation links are live and relevant to the specific paper.

## 2. Content Drafting (The Decoding)

*   **Mandatory Asymmetry**: Break all visual patterns. Use varying paragraph lengths (3 lines vs. 30 lines) and an inconsistent number of sections per paper. Avoid the "two-paragraph-per-header" trap.
*   **Implementation Depth**: Include the "clinical" details:
    *   Exact mathematical formulas (e.g., Ochiai scoring, KL-divergence constraints).
    *   Specific Python libraries or frameworks used (e.g., `astunparse`, `Playwright`, `InternVL-2`).
    *   Hyperparameters and sampling logic (e.g., "sampled at $n=21$ with $T=0.7$").
    *   Data Contamination stats (e.g., "4.3% leakage in SWE-bench").
*   **Continuous Prose**: No bullet points, bolding, or lists. Let the technical logic drive the flow.
*   **Diagram Integration**: Embed diagrams in-line using the `![Caption](URL)` format. Every paper must have at least the Hero diagram and one internal mechanism diagram.
*   **Open Endings**: Conclude with a technical observation or a lingering architectural question. Never summarize.

## 3. Integration & Sync (The Build)

1.  **File Creation**: Create `<slug>.md` in `content/research-decoded/`.
2.  **Frontmatter**:
    ```yaml
    ---
    title: "Exact Technical Title"
    authors: "Lead Author et al. (Year)"
    citation: "Full ArXiv Citation String"
    link: "https://arxiv.org/abs/<id>"
    slug: "canonical-slug"
    heroImage: "https://arxiv.org/html/<id>v<version>/x1.png"
    ---
    ```
3.  **Navigation**: Add slug to `content/research-decoded/navigation.json`.
4.  **Compiling**: Run the sync script from the root:
    ```bash
    node scripts/compile-research.mjs
    ```
5.  **Local Check**: Verify the page at `http://localhost:3000/research-decoded/<slug>`.

## Anti-Patterns (Immediate Rejection)

*   **Fluff**: Using words like "groundbreaking," "revolutionary," or "provocative." Use "O(1) search" or "22.6% resolution rate" instead.
*   **Homogeneity**: Making all papers look identical in the sidebar or on the page. Complexity should dictate length.
*   **Broken Assets**: Missing images or dead GitHub links. Verify every asset in every turn.
