import os
import re

# Official subjects from practice page
# "Computer Science", "AI & Data Science", "Mathematics", "Physics", "Chemistry", "Medicine", "Biology", "Neuroscience", etc.

subject_mapping = {
    # AI & Data Science
    "backpropagation.md": "AI & Data Science",
    "contrastive-learning.md": "AI & Data Science",
    "double-descent.md": "AI & Data Science",
    "embeddings.md": "AI & Data Science",
    "gradient-descent.md": "AI & Data Science",
    "latent-space.md": "AI & Data Science",
    "mixture-of-experts.md": "AI & Data Science",
    "overfitting.md": "AI & Data Science",
    "regularization.md": "AI & Data Science",
    "rlhf.md": "AI & Data Science",
    "softmax.md": "AI & Data Science",
    "vanishing-gradient.md": "AI & Data Science",
    "quantization.md": "AI & Data Science",
    
    # Computer Science / Architecture
    "andrej-karpathy-first-principles.md": "Computer Science",
    "arthur-mensch-mistral-efficiency.md": "Computer Science",
    "ilya-sutskever-superalignment.md": "Computer Science",
    "jonathan-ross-lpu-architecture.md": "Computer Science",
    "lisa-su-amd-turnaround.md": "Computer Science",
    "mira-murati-operational-reality.md": "Computer Science",
    "noam-shazeer-information-density.md": "Computer Science",
    "tokens.md": "Computer Science",
    "transformer.md": "Computer Science",
    "self-attention-mechanism.md": "Computer Science",
    "positional-encoding.md": "Computer Science",
    "equivariant-neural-networks.md": "Computer Science",
    "geometric-deep-learning.md": "Computer Science",
    "gwynne-shotwell-spacex-scaling.md": "Computer Science",
    
    # Science / Medicine / Biology
    "how-does-alphafold-predict-protein-structures.md": "Biology",
    "what-are-protein-language-models.md": "Biology",
    "how-is-ai-building-a-digital-twin-of-the-cell.md": "Biology",
    "jennifer-doudna-crispr-logic.md": "Biology",
    "how-is-ai-accelerating-drug-discovery.md": "Medicine",
    "insilico-medicine.md": "Medicine",
    "orphan-diseases.md": "Medicine",
    "personalized-medicine.md": "Medicine",
    "how-does-ai-simulate-nuclear-fusion.md": "Physics",
    "how-does-ai-predict-extreme-weather.md": "Environment",
    "generative-chemistry.md": "Chemistry",
    "how-does-ai-discover-new-materials.md": "Chemistry",
    "how-is-ai-designing-plants-to-fight-climate-change.md": "Environment",
    "how-is-ai-helping-us-decode-animal-communication.md": "Biology",
    "how-is-ai-mapping-the-brain-connectomics.md": "Neuroscience",
    "functional-search.md": "Computer Science",
    "progen.md": "Biology"
}

remove_diagrams = [
    "softmax.md",
    "tokens.md",
    "double-descent.md",
    "vanishing-gradient.md",
    "how-is-ai-mapping-the-brain-connectomics.md"
]

content_dir = 'content/articles'

for filename in os.listdir(content_dir):
    if not filename.endswith('.md'):
        continue
        
    path = os.path.join(content_dir, filename)
    with open(path, 'r') as f:
        content = f.read()
    
    # 1. Rename category to subject and set correct value
    target_subject = subject_mapping.get(filename, "AI & Data Science")
    # First, handle renaming category to subject
    content = re.sub(r'^category: ".*?"', f'subject: "{target_subject}"', content, flags=re.MULTILINE)
    # Also handle if it was already renamed or uses different quotes
    content = re.sub(r'^topic: ".*?"', f'subject: "{target_subject}"', content, flags=re.MULTILINE)
    
    # 2. Remove diagrams if in list
    if filename in remove_diagrams:
        # Regex to remove D2 blocks
        content = re.sub(r'```d2.*?```', '', content, flags=re.DOTALL)
        # Clean up double newlines that might result
        content = re.sub(r'\n\n\n+', '\n\n', content)
        print(f"Removed diagram from {filename}")

    with open(path, 'w') as f:
        f.write(content)
    print(f"Updated subject for {filename} to {target_subject}")
