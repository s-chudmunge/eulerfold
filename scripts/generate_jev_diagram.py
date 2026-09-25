import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ArrowStyle

def create_jev_architecture_diagram(output_path):
    # Set high DPI and publication styling
    fig = plt.figure(figsize=(13, 14), dpi=300)
    ax = fig.add_subplot(111)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 108)
    ax.axis('off')
    
    # Paper styling palette (Vaswani et al. inspired)
    bg_canvas = '#FFFFFF'
    fig.patch.set_facecolor(bg_canvas)
    ax.set_facecolor(bg_canvas)

    # Palette
    c_input = '#F4B8B4'       # Soft pink/salmon (Inputs)
    c_encoder = '#EAECEF'     # Crisp neutral gray container
    c_mha = '#F6C88D'         # Warm amber/orange (Multi-Head Attention)
    c_norm = '#E2EDA8'        # Pale yellow-green (Add & Norm)
    c_ffn = '#A4D3EE'         # Soft sky blue (Feed Forward)
    c_pool = '#D6B4E8'        # Soft lilac/purple (Decision Queries)
    c_linear = '#C5B4E3'      # Slate lilac (Linear)
    c_head_noul = '#FAD2CF'   # Soft coral
    c_head_choice = '#BFE6D5' # Soft mint green
    c_head_score = '#FBE2B5'  # Soft amber cream
    c_text = '#1F2937'        # Dark slate
    c_border = '#1F2937'      # Crisp technical outline
    lw = 1.6

    def draw_box(x, y, w, h, bg, text="", fontsize=10, bold=False, boxstyle="round,pad=0.2,rounding_size=1.2"):
        p = FancyBboxPatch((x, y), w, h, boxstyle=boxstyle,
                           facecolor=bg, edgecolor=c_border, linewidth=lw, zorder=3)
        ax.add_patch(p)
        if text:
            weight = 'bold' if bold else 'normal'
            ax.text(x + w/2, y + h/2, text, ha='center', va='center',
                    fontsize=fontsize, color=c_text, weight=weight,
                    family='sans-serif', zorder=4)

    def draw_arrow(x1, y1, x2, y2, color=c_border, width=1.5):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-|>", color=color, lw=width,
                                    mutation_scale=14, shrinkA=0, shrinkB=0),
                    zorder=5)

    # -------------------------------------------------------------
    # 1. TITLE & SUBTITLE (Academic Style)
    # -------------------------------------------------------------
    ax.text(50, 104.5, "Figure 1: The Jev System One Decision Architecture", 
            ha='center', va='center', fontsize=15, weight='bold', color='#111827', family='sans-serif')
    ax.text(50, 102.2, "Parallel non-autoregressive encoder stack with cross-attended typed decision heads",
            ha='center', va='center', fontsize=10.5, style='italic', color='#4B5563', family='sans-serif')

    # -------------------------------------------------------------
    # 2. INPUT STATE & EMBEDDINGS (Bottom)
    # -------------------------------------------------------------
    # Input label
    ax.text(50, 2.5, "State Context $\\mathcal{S}$ (Document, Ticket, Trace)", 
            ha='center', va='center', fontsize=11, weight='bold', color=c_text)
    draw_arrow(50, 4.0, 50, 7.5)

    # Input Embedding Box
    draw_box(33, 7.5, 34, 5.0, c_input, "State Embedding + RoPE", fontsize=11, bold=True)
    draw_arrow(50, 12.5, 50, 17.0)

    # -------------------------------------------------------------
    # 3. BIDIRECTIONAL ENCODER STACK (Middle Section, Nx)
    # -------------------------------------------------------------
    # Outer Container for Encoder Stack
    enc_x, enc_y, enc_w, enc_h = 24, 17, 52, 43
    p_enc = FancyBboxPatch((enc_x, enc_y), enc_w, enc_h, boxstyle="round,pad=0.4,rounding_size=2.0",
                           facecolor=c_encoder, edgecolor='#6B7280', linewidth=1.5, linestyle='-', zorder=1)
    ax.add_patch(p_enc)
    
    # Nx bracket label
    ax.text(19, enc_y + enc_h/2, "$N\\times$\nEncoder\nLayers", ha='center', va='center', 
            fontsize=12, weight='bold', color=c_text)
    # Draw bracket
    ax.plot([22.5, 21.5, 21.5, 22.5], [enc_y + 2, enc_y + 2, enc_y + enc_h - 2, enc_y + enc_h - 2], 
            color=c_text, lw=1.8, zorder=3)

    # Layer 1: Bidirectional Attention
    draw_box(31, 20.5, 38, 5.2, c_mha, "Bidirectional Self-Attention\n(FlashAttention, No Causal Mask)", fontsize=10.5, bold=True)
    draw_arrow(50, 25.7, 50, 28.5)

    # Add & Norm 1
    draw_box(34, 28.5, 32, 4.2, c_norm, "Add & RMSNorm", fontsize=10, bold=True)
    draw_arrow(50, 32.7, 50, 36.5)

    # Residual 1 around Self-Attention
    ax.plot([50, 73, 73, 66], [15.0, 15.0, 30.6, 30.6], color=c_border, lw=1.4, zorder=4)
    draw_arrow(66, 30.6, 66, 30.6)

    # Layer 2: Feed Forward Network
    draw_box(33, 36.5, 34, 5.2, c_ffn, "Feed Forward Network\n(SwiGLU, $d_{ff} = 4d_{model}$)", fontsize=10.5, bold=True)
    draw_arrow(50, 41.7, 50, 44.5)

    # Add & Norm 2
    draw_box(34, 44.5, 32, 4.2, c_norm, "Add & RMSNorm", fontsize=10, bold=True)
    draw_arrow(50, 48.7, 50, 52.5)

    # Residual 2 around FFN
    ax.plot([50, 73, 73, 66], [34.5, 34.5, 46.6, 46.6], color=c_border, lw=1.4, zorder=4)

    # Contextual Latent Representations
    draw_box(29, 52.5, 42, 5.0, '#FEF3C7', "Contextualized State Memory $\\mathbf{H}_{\\mathcal{S}} \\in \\mathbb{R}^{T \\times d}$", 
             fontsize=10.5, bold=True)
    draw_arrow(50, 57.5, 50, 63.0)

    # -------------------------------------------------------------
    # 4. PARALLEL DECISION QUERY INJECTION (Upper Middle)
    # -------------------------------------------------------------
    # Left side: Typed Questions Input
    draw_box(3, 63.0, 21, 8.5, c_pool, "Typed Question Pool\n$\\{\\mathcal{Q}_1, \\dots, \\mathcal{Q}_K\\}$\n(Noul / Choice / Score)", 
             fontsize=9.5, bold=True)
    draw_arrow(24, 67.25, 30, 67.25)

    # Cross-Attention Pooling Block
    draw_box(30, 63.0, 40, 8.5, c_mha, "Parallel Cross-Attention & Query Pooling\n$\\mathbf{Q} = \\text{Embed}(\\mathcal{Q}_k), \\quad \\mathbf{K},\\mathbf{V} = \\mathbf{H}_{\\mathcal{S}}$", 
             fontsize=10.5, bold=True)
    draw_arrow(50, 71.5, 50, 75.5)

    # Latent Decision Vectors
    draw_box(32, 75.5, 36, 4.5, c_linear, "Task Projections $\\mathbf{z}_k \\in \\mathbb{R}^d$", fontsize=10.5, bold=True)

    # -------------------------------------------------------------
    # 5. SPECIALIZED TYPED HEADS (Three Parallel Streams)
    # -------------------------------------------------------------
    # Forking arrows from Task Projections
    ax.plot([50, 18, 18], [80.0, 80.0, 82.5], color=c_border, lw=1.5, zorder=4)
    draw_arrow(18, 82.5, 18, 83.5)

    ax.plot([50, 50], [80.0, 83.5], color=c_border, lw=1.5, zorder=4)
    draw_arrow(50, 82.5, 50, 83.5)

    ax.plot([50, 82, 82], [80.0, 80.0, 82.5], color=c_border, lw=1.5, zorder=4)
    draw_arrow(82, 82.5, 82, 83.5)

    # --- HEAD 1: NOUL (Left) ---
    draw_box(6, 83.5, 24, 6.0, c_head_noul, "Noul Sigmoid Head", fontsize=10, bold=True)
    draw_arrow(18, 89.5, 18, 93.0)
    draw_box(5, 93.0, 26, 6.2, '#FFFFFF', "Truth Probability\n$p \\in [0, 1]$", fontsize=10, bold=True)

    # --- HEAD 2: CHOICE (Center) ---
    draw_box(37, 83.5, 26, 6.0, c_head_choice, "Choice Softmax Head", fontsize=10, bold=True)
    draw_arrow(50, 89.5, 50, 93.0)
    draw_box(36, 93.0, 28, 6.2, '#FFFFFF', "Probability Distribution\n$[p_1, \\dots, p_M] + \\text{Conf } c$", fontsize=10, bold=True)

    # --- HEAD 3: SCORE (Right) ---
    draw_box(70, 83.5, 24, 6.0, c_head_score, "Score Expectation Head", fontsize=10, bold=True)
    draw_arrow(82, 89.5, 82, 93.0)
    draw_box(69, 93.0, 26, 6.2, '#FFFFFF', "Continuous Score Metric\n$\\mathbb{E}[s] \\in [0, K] + \\text{Conf } c$", fontsize=10, bold=True)

    # (Execution properties side block removed for a clean diagram layout)

    # -------------------------------------------------------------
    # 7. EULERFOLD AI WATERMARK (Bottom Right, Discrete)
    # -------------------------------------------------------------
    import matplotlib.image as mpimg
    from matplotlib.offsetbox import OffsetImage, AnnotationBbox

    try:
        logo_img = mpimg.imread('frontend/public/android-chrome-512x512.png')
        imagebox = OffsetImage(logo_img, zoom=0.038, alpha=0.75)
        ab = AnnotationBbox(imagebox, (91.0, 2.8), frameon=False, zorder=10)
        ax.add_artist(ab)
        ax.text(92.8, 2.8, "EulerFold AI", ha='left', va='center',
                fontsize=8.5, weight='bold', color='#4B5563', alpha=0.85, family='sans-serif', zorder=10)
    except Exception as e:
        print(f"Warning: could not add watermark logo: {e}")

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, facecolor=bg_canvas, edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"Academic blueprint successfully saved to {output_path}")

if __name__ == '__main__':
    create_jev_architecture_diagram('frontend/public/images/articles/jev-architecture-blueprint.png')
