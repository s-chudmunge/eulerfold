import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from matplotlib.patches import FancyBboxPatch
from matplotlib.offsetbox import OffsetImage, AnnotationBbox

def create_rlcd_diagram(output_path):
    fig = plt.figure(figsize=(12, 10.5), dpi=300)
    ax = fig.add_subplot(111)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 102)
    ax.axis('off')

    bg_canvas = '#FFFFFF'
    fig.patch.set_facecolor(bg_canvas)
    ax.set_facecolor(bg_canvas)

    c_border = '#1F2937'
    lw = 1.5

    def draw_box(x, y, w, h, bg, text="", fontsize=10, bold=False, boxstyle="round,pad=0.2,rounding_size=1.2"):
        p = FancyBboxPatch((x, y), w, h, boxstyle=boxstyle,
                           facecolor=bg, edgecolor=c_border, linewidth=lw, zorder=3)
        ax.add_patch(p)
        if text:
            weight = 'bold' if bold else 'normal'
            ax.text(x + w/2, y + h/2, text, ha='center', va='center',
                    fontsize=fontsize, color='#1F2937', weight=weight,
                    family='sans-serif', zorder=4)

    def draw_arrow(x1, y1, x2, y2, color=c_border, width=1.4):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-|>", color=color, lw=width,
                                    mutation_scale=13, shrinkA=0, shrinkB=0),
                    zorder=5)

    # Title & Subtitle
    ax.text(50, 98.0, "Figure 2: Reinforcement Learning for Calibrated Decisions (RLCD)", 
            ha='center', va='center', fontsize=14, weight='bold', color='#111827', family='sans-serif')
    ax.text(50, 95.3, "Epistemic calibration loop optimizing strictly proper scoring rules and ECE penalties",
            ha='center', va='center', fontsize=10, style='italic', color='#4B5563', family='sans-serif')

    # 1. State + Rubric
    draw_box(30, 84.5, 40, 6.5, '#E0E7FF', "Unlabeled State Context $\\mathcal{S}$ + Task Rubric", fontsize=10.5, bold=True)
    draw_arrow(50, 84.5, 50, 77.0)

    # 2. Decision Engine
    draw_box(25, 69.5, 50, 7.5, '#FDE68A', "Jev Decision Engine\n(Parallel Forward Pass)", fontsize=11, bold=True)
    draw_arrow(50, 69.5, 50, 62.0)

    # Output signal text
    ax.text(50, 65.7, "Predicted Probabilities $\\hat{P}$ & Confidence $c$", ha='center', va='center',
            fontsize=9.5, style='italic', color='#374151', family='sans-serif')

    # 3. Verification Oracle
    draw_box(22, 54.5, 56, 7.5, '#D1FAE5', "Ground-Truth Verification Oracle\n(Unit Tests, Compiler Traces, Database Records, Human Audits)", 
             fontsize=10, bold=True)
    draw_arrow(50, 54.5, 50, 47.0)

    # True outcome label
    ax.text(50, 50.7, "True Binary / Categorical Target $Y^* \\in \\{0, 1\\}^K$", ha='center', va='center',
            fontsize=9.5, style='italic', color='#374151', family='sans-serif')

    # 4. RLCD Loss Formulation Box
    draw_box(12, 24.5, 76, 22.5, '#F3F4F6', "", boxstyle="round,pad=0.3,rounding_size=1.8")
    ax.text(50, 44.0, "RLCD Multi-Objective Calibration Loss", ha='center', va='center', 
            fontsize=11.5, weight='bold', color='#111827')

    loss_terms = [
        ("1. Brier Score (Strictly Proper Accuracy):", r"$\mathcal{L}_{\text{Brier}} = \frac{1}{K}\sum_{k=1}^K (\hat{P}_k - Y^*_k)^2$"),
        ("2. Expected Calibration Error (ECE Penalty):", r"$\text{ECE} = \sum_{b=1}^B \frac{|I_b|}{N} |\text{acc}(I_b) - \text{conf}(I_b)|$"),
        ("3. Epistemic Entropy Regularization:", r"$\mathcal{R}_{\text{Entropy}} = -\lambda \sum_{k=1}^K \hat{P}_k \log \hat{P}_k \quad (\text{if uninformative})$")
    ]

    y_pos = 38.5
    for label, formula in loss_terms:
        ax.text(16, y_pos, label, ha='left', va='center', fontsize=9.5, weight='bold', color='#1F2937')
        ax.text(84, y_pos, formula, ha='right', va='center', fontsize=9.5, color='#1F2937')
        y_pos -= 5.5

    # 5. Feedback Loop Arrow
    draw_arrow(50, 24.5, 50, 16.0)
    draw_box(30, 9.5, 40, 6.5, '#FEE2E2', "Optimizer Step: Backpropagation\n(Calibrated Parameter Updates)", fontsize=10.5, bold=True)

    # Loop back to Jev
    ax.plot([30, 8, 8, 25], [12.75, 12.75, 73.25, 73.25], color='#DC2626', lw=1.6, linestyle='--', zorder=4)
    draw_arrow(23.5, 73.25, 25, 73.25, color='#DC2626', width=1.6)
    ax.text(6.0, 43.0, "Gradient Update $\\nabla_\\theta \\mathcal{L}_{\\text{RLCD}}$", ha='center', va='center', 
            rotation=90, fontsize=9.5, weight='bold', color='#DC2626')

    # -------------------------------------------------------------
    # 6. EULERFOLD AI WATERMARK (Bottom Right, Discrete)
    # -------------------------------------------------------------
    try:
        logo_img = mpimg.imread('frontend/public/android-chrome-512x512.png')
        imagebox = OffsetImage(logo_img, zoom=0.038, alpha=0.75)
        ab = AnnotationBbox(imagebox, (89.5, 2.8), frameon=False, zorder=10)
        ax.add_artist(ab)
        ax.text(91.3, 2.8, "EulerFold AI", ha='left', va='center',
                fontsize=8.5, weight='bold', color='#4B5563', alpha=0.85, family='sans-serif', zorder=10)
    except Exception as e:
        print(f"Warning: could not add watermark logo: {e}")

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, facecolor=bg_canvas, edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"RLCD diagram successfully saved to {output_path}")

if __name__ == '__main__':
    create_rlcd_diagram('frontend/public/images/articles/rlcd-calibration-pipeline.png')
