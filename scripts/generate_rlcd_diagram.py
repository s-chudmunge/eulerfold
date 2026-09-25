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

    # 1. State + Rubric (Top)
    draw_box(30, 84.5, 40, 6.5, '#E0E7FF', "Unlabeled State Context $\\mathcal{S}$ + Task Rubric", fontsize=10.5, bold=True)

    # Arrow branching from Context to both Jev Engine and Verification Oracle
    ax.plot([50, 50], [84.5, 81.5], color=c_border, lw=1.4, zorder=4)
    ax.plot([32, 68], [81.5, 81.5], color=c_border, lw=1.4, zorder=4)
    draw_arrow(32, 81.5, 32, 77.0)
    draw_arrow(68, 81.5, 68, 77.0)

    # 2. Side-by-side: Jev Decision Engine (Left) and Ground Truth Oracle (Right)
    draw_box(13, 69.5, 38, 7.5, '#FDE68A', "Jev Decision Engine\n(Parallel Forward Pass)", fontsize=10.5, bold=True)
    draw_box(53, 69.5, 38, 7.5, '#D1FAE5', "Ground-Truth Verification Oracle\n(Compiler Traces, Tests, Audits)", fontsize=10, bold=True)

    # Outputs flowing down into RLCD Loss Box
    draw_arrow(32, 69.5, 32, 53.5)
    ax.text(31.0, 61.5, "Predictions $\\hat{P}$ & Confidence $c$", ha='right', va='center',
            fontsize=9.0, style='italic', color='#374151', family='sans-serif')

    draw_arrow(68, 69.5, 68, 53.5)
    ax.text(69.0, 61.5, "True Target $Y^* \\in \\{0, 1\\}^K$", ha='left', va='center',
            fontsize=9.0, style='italic', color='#374151', family='sans-serif')

    # 3. RLCD Loss Formulation Box
    draw_box(13, 26.5, 78, 27.0, '#F3F4F6', "", boxstyle="round,pad=0.3,rounding_size=1.8")
    ax.text(52, 49.5, "RLCD Multi-Objective Calibration Loss", ha='center', va='center', 
            fontsize=11.5, weight='bold', color='#111827')

    loss_items = [
        ("• Strictly Proper Scoring (Brier Loss)", "Penalizes deviation between prediction probabilities and verified binary outcomes"),
        ("• Expected Calibration Error (ECE)", "Penalizes discrepancies between confidence bins and empirical accuracy"),
        ("• Epistemic Entropy Regularization", "Drives predictions toward maximum entropy when context lacks evidence")
    ]

    y_pos = 43.5
    for title, desc in loss_items:
        ax.text(17, y_pos, title, ha='left', va='center', fontsize=9.8, weight='bold', color='#1F2937')
        ax.text(17, y_pos - 2.5, desc, ha='left', va='center', fontsize=8.8, color='#4B5563', style='italic')
        y_pos -= 6.2

    # 4. Feedback Loop Arrow
    draw_arrow(52, 26.5, 52, 17.5)
    draw_box(29, 10.5, 46, 7.0, '#FEE2E2', "Optimizer Step: Backpropagation\n(Calibrated Parameter Updates)", fontsize=10.5, bold=True)

    # Loop back to Jev
    ax.plot([29, 6.5, 6.5, 13], [14.0, 14.0, 73.25, 73.25], color='#DC2626', lw=1.6, linestyle='--', zorder=4)
    draw_arrow(11.5, 73.25, 13, 73.25, color='#DC2626', width=1.6)
    ax.text(4.5, 43.5, "Gradient Update $\\nabla_\\theta \\mathcal{L}_{\\text{RLCD}}$", ha='center', va='center', 
            rotation=90, fontsize=9.5, weight='bold', color='#DC2626')

    # -------------------------------------------------------------
    # 5. EULERFOLD AI WATERMARK (Bottom Right, Discrete)
    # -------------------------------------------------------------
    try:
        logo_img = mpimg.imread('frontend/public/android-chrome-512x512.png')
        imagebox = OffsetImage(logo_img, zoom=0.038, alpha=0.75)
        ab = AnnotationBbox(imagebox, (89.5, 3.2), frameon=False, zorder=10)
        ax.add_artist(ab)
        ax.text(91.3, 3.2, "EulerFold AI", ha='left', va='center',
                fontsize=8.5, weight='bold', color='#4B5563', alpha=0.85, family='sans-serif', zorder=10)
    except Exception as e:
        print(f"Warning: could not add watermark logo: {e}")

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, facecolor=bg_canvas, edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"RLCD diagram successfully saved to {output_path}")

if __name__ == '__main__':
    create_rlcd_diagram('frontend/public/images/articles/rlcd-calibration-pipeline.png')
