import os
import re

authors = {
    "riya": "Dr. Riya Srinivasan — Machine Learning Scientist, PhD Artificial Intelligence",
    "meera": "Meera Venkatesh — Software Architecture Consultant, BEng Engineering",
    "siddharth": "Dr. Siddharth Iyer — Computational Research Scientist, PhD Applied Computing",
    "ananya": "Ananya Rao — Data Science Research Editor, MSc Data Analytics",
    "nitin": "Dr. Nitin Bansal — Semiconductor Technology Researcher, PhD Materials Science",
    "kavya": "Dr. Kavya Nair — Bioinformatics Research Lead, PhD Computational Biology"
}

mapping = {
    # Meera: Profiles & System Architecture
    "andrej-karpathy-first-principles.md": authors["meera"],
    "arthur-mensch-mistral-efficiency.md": authors["meera"],
    "ilya-sutskever-superalignment.md": authors["meera"],
    "jonathan-ross-lpu-architecture.md": authors["meera"],
    "lisa-su-amd-turnaround.md": authors["meera"],
    "mira-murati-operational-reality.md": authors["meera"],
    "noam-shazeer-information-density.md": authors["meera"],
    "tokens.md": authors["meera"],
    "transformer.md": authors["meera"],
    
    # Riya: Core AI Theory & Architectures
    "backpropagation.md": authors["riya"],
    "contrastive-learning.md": authors["riya"],
    "double-descent.md": authors["riya"],
    "equivariant-neural-networks.md": authors["riya"],
    "geometric-deep-learning.md": authors["riya"],
    "mixture-of-experts.md": authors["riya"],
    "positional-encoding.md": authors["riya"],
    "self-attention-mechanism.md": authors["riya"],
    "softmax.md": authors["riya"],
    "vanishing-gradient.md": authors["riya"],
    "overfitting.md": authors["riya"],
    "regularization.md": authors["riya"],
    "progen.md": authors["riya"],
    
    # Siddharth: Optimization & Computational Physics
    "functional-search.md": authors["siddharth"],
    "gradient-descent.md": authors["siddharth"],
    "how-does-ai-predict-extreme-weather.md": authors["siddharth"],
    "how-does-ai-simulate-nuclear-fusion.md": authors["siddharth"],
    "multi-objective-optimization.md": authors["siddharth"],
    "quantization.md": authors["siddharth"],
    "rlhf.md": authors["siddharth"],
    
    # Kavya: Bioinformatics & Computational Biology
    "how-does-alphafold-predict-protein-structures.md": authors["kavya"],
    "what-are-protein-language-models.md": authors["kavya"],
    "how-is-ai-building-a-digital-twin-of-the-cell.md": authors["kavya"],
    "jennifer-doudna-crispr-logic.md": authors["kavya"],
    "how-is-ai-accelerating-drug-discovery.md": authors["kavya"],
    "how-is-ai-mapping-the-brain-connectomics.md": authors["kavya"],

    # Ananya: Data Science & Biological Systems (Non-Computational)
    "gwynne-shotwell-spacex-scaling.md": authors["ananya"],
    "how-is-ai-helping-us-decode-animal-communication.md": authors["ananya"],
    "latent-space.md": authors["ananya"],
    "embeddings.md": authors["ananya"],
    
    # Nitin: Science AI, Materials & Healthcare
    "generative-chemistry.md": authors["nitin"],
    "how-does-ai-discover-new-materials.md": authors["nitin"],
    "how-is-ai-designing-plants-to-fight-climate-change.md": authors["nitin"],
    "insilico-medicine.md": authors["nitin"],
    "orphan-diseases.md": authors["nitin"],
    "personalized-medicine.md": authors["nitin"]
}

content_dir = 'content/articles'

for filename, author in mapping.items():
    path = os.path.join(content_dir, filename)
    if os.path.exists(path):
        with open(path, 'r') as f:
            content = f.read()
        
        # Update the author field in YAML frontmatter
        new_content = re.sub(r'author: ".*?"', f'author: "{author}"', content)
        
        with open(path, 'w') as f:
            f.write(new_content)
        print(f"Updated {filename}")
    else:
        print(f"File not found: {filename}")
