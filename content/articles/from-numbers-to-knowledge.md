---
title: "From Numbers to Knowledge"
slug: "from-numbers-to-knowledge"
shortSlug: "numbers-to-knowledge"
author: "Sankalp Chudmunge"
date: "August 17, 2026"
subject: "Machine Learning"
heroImage: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=2000&h=800"
excerpt: "What a machine actually does when it trains. From tensors to transformers, through norms, filters, and attention."
technicalInsight: "PyTorch's autograd tracks every tensor operation and applies the chain rule in reverse. The learned parameters are weight matrices; the features are computed fresh every forward pass."
synonyms:
  - "PyTorch"
  - "Norms"
  - "L1 and L2 Regularization"
  - "Gradient Descent"
  - "Tensors"
  - "Transformers"
  - "Self-Attention"
  - "Backpropagation"
---

A machine learning model starts by knowing nothing. Its internal numbers — its parameters — are random. When you feed it an image of a cat, it gives back a meaningless output. The job of training is to fix that, by adjusting those parameters until the output is useful. But to adjust them, you need to know how wrong they currently are. And to measure wrongness, you need a way to measure distance.

That's where norms come in.

## Norms: A Way to Measure Size

A norm is a function that takes a vector — a list of numbers — and returns a single number representing its "size." Any function that qualifies as a norm has to follow four rules: the result is never negative, it's zero only for the zero vector, scaling the vector scales the norm by the same amount, and the sum of two vectors is never larger than the sum of their individual norms. That last rule is just the triangle inequality — the direct path is always shorter than going via a detour.

There's more than one way to satisfy those rules, and the two most common choices are the **L1 norm** and the **L2 norm**.

The L1 norm adds up absolute values:
$$\|x\|_1 = \sum |x_i|$$

The L2 norm takes the square root of the sum of squares:
$$\|x\|_2 = \sqrt{\sum x_i^2}$$

They're not equivalent, and that distinction comes up everywhere.

## How Errors Are Measured

A model has parameters — internal numbers like weights and biases — and a prediction is the result of feeding an input through those parameters. The prediction will be wrong early in training. A **loss function** measures how wrong by computing the distance between the prediction and the actual answer.

The L1 loss, also called Mean Absolute Error, treats all errors proportionally:
$$L_{L1} = \frac{1}{n}\sum |y_i - \hat{y}_i|$$

If a prediction is off by 10, that's exactly ten times worse than being off by 1. This is useful when your data has outliers — a single badly-labelled example won't dominate the training signal.

The L2 loss squares the differences:
$$L_{L2} = \frac{1}{n}\sum (y_i - \hat{y}_i)^2$$

Squaring means an error of 10 is a hundred times worse than an error of 1. The model gets strongly pushed to eliminate its biggest mistakes first. It's also smooth and differentiable, so calculus-based optimisation works well with it. The downside is that a few bad data points can have an outsized effect on training.

Choosing between them isn't trivial. It depends on whether your data has outliers, what kind of errors are more costly, and what the downstream optimisation looks like.

## PyTorch: The Machinery That Computes This

To actually train a model, you need something that can handle two things: storing and operating on large arrays of numbers efficiently, and computing derivatives through complex chains of operations automatically. PyTorch does both.

PyTorch is not a replacement for Python. It's a library built largely in C++ that adds specialised numerical machinery. When you write PyTorch code in Python, Python is just controlling PyTorch's underlying C++ and CUDA implementations.

### Tensors

PyTorch's basic data structure is a **tensor**. A tensor stores values, their shape, their data type, and information PyTorch can use for gradient calculation. A single number is a 0-dimensional tensor. A list is 1D. A table is 2D. A batch of colour images is 4D: `(batch_size, channels, height, width)`.

The tensor also knows which device it's on. A GPU has thousands of simple cores that can do many multiplications simultaneously, whereas a CPU has a small number of more general-purpose cores. When you multiply two large matrices — which is most of what a neural network does — the GPU can compute all the entries of the result at the same time rather than one after another. PyTorch sends that work to the GPU through CUDA, a framework for running programs on NVIDIA hardware.

### Computational Graphs and Autograd

For a neural network to learn, you need to know the derivative of the loss with respect to each parameter. Computing that manually for a network with millions of parameters would be impossible. PyTorch handles it automatically through a system called **autograd**.

When you do an operation on a tensor that has `requires_grad=True`, PyTorch doesn't just compute the output. It records the operation in a data structure called a **computational graph** — a chain of nodes where each node stores the operation, its inputs, and the rule for computing the derivative backward through that operation.

```python
x = torch.tensor(4.0, requires_grad=True)
y = x * 3
```

Here `y = 12.0`, but PyTorch has also recorded that `y` came from multiplying `x` by 3, and that the derivative of `y` with respect to `x` through that multiplication is 3. Each operation object in memory knows its inputs and knows how to propagate a gradient backward through itself.

When you call `y.backward()`, PyTorch walks this graph in reverse — from the output back toward the inputs — and applies the chain rule at each step. If the network is:
$$x \rightarrow a \rightarrow y$$

then:
$$\frac{dy}{dx} = \frac{dy}{da} \cdot \frac{da}{dx}$$

By starting at $y$ and moving backward, PyTorch calculates each local derivative and multiplies them together. If a result depends on multiple inputs, the gradient simply branches — PyTorch calculates a gradient for each input that requires one. The final result lands in `x.grad`. This process is **backpropagation**.

## Gradient Descent: Using the Derivative to Improve

The gradient tells you which direction to move a parameter to increase the loss. So to decrease the loss, move in the opposite direction:
$$w_{\text{new}} = w_{\text{old}} - \eta \frac{\partial L}{\partial w}$$

The $\eta$ is the learning rate. High values cause updates to skip past the loss minimum. Low values require too many iterations to converge.

PyTorch applies this through an **optimizer**. The standard training loop looks like:

```python
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for images, labels in dataloader:
    predictions = model(images)
    loss = loss_fn(predictions, labels)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
```

`zero_grad()` clears gradients from the previous step. `loss.backward()` runs backpropagation. `optimizer.step()` updates all the parameters. Repeat this over enough data, and the parameters shift toward values that produce correct predictions.

Adam is a common optimizer that adapts the learning rate separately for each parameter. But the core idea is the same as basic gradient descent.

## Defining a Model

In PyTorch, a model is a Python class that inherits from `nn.Module`. `nn.Module` isn't a specific network architecture; it's a base class that manages three things: the learnable parameters, submodules (other layers nested inside), and the forward computation behavior.

```python
class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Linear(10, 20)
        self.layer2 = nn.Linear(20, 1)

    def forward(self, x):
        x = torch.relu(self.layer1(x))
        return self.layer2(x)
```

`nn.Linear(10, 20)` creates a layer that takes a vector of 10 numbers and outputs 20. Internally it holds a weight matrix of shape `(20, 10)` and a bias vector of shape `(20,)`. The computation is `y = Wx + b`. The 10 and 20 are design choices — hyperparameters. You're deciding to map a 10-dimensional space into a 20-dimensional space, giving the model capacity to learn useful combinations of its input.

Stacking linear layers alone doesn't get you far — two linear layers can always be collapsed into one mathematically. The `relu` between them breaks that. ReLU sets any negative value to zero:
$$\text{ReLU}(x) = \max(0, x)$$

This non-linearity is what lets a network represent complex, non-linear functions instead of collapsing into one linear transformation.

## A Concrete Example: Image Classification with a CNN

If you want to classify 56×56 colour images as cat or dog, the input tensor has shape `(3, 56, 56)` — three colour channels, each a 56×56 grid, giving 9,408 numbers per image.

Flattening that and feeding it to a linear layer would work technically, but it ignores the spatial structure of images. A pixel is strongly related to its neighbours; a linear layer treats all 9,408 inputs as equally relevant to each other.

**Convolutional layers** handle this. Instead of one large weight matrix, a convolutional layer has many small filters — typically 3×3 — that slide across the image. Each filter computes a weighted sum over a small local region.

With 32 filters, the layer produces 32 feature maps. After a few of these layers, the model has a compressed representation of the image that a final linear layer can classify.

```python
class CatDogClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )
        self.classifier = nn.Linear(64 * 14 * 14, 2)

    def forward(self, x):
        x = self.features(x)
        x = x.flatten(1)
        return self.classifier(x)
```

The tensor changes shape as it moves through:

- `(3, 56, 56)` → Conv2d → `(32, 56, 56)`
- → MaxPool → `(32, 28, 28)`
- → Conv2d → `(64, 28, 28)`
- → MaxPool → `(64, 14, 14)`
- → flatten → `(12544,)`
- → Linear → `(2,)`

The two final numbers are the model's scores for cat and dog. `MaxPool2d(2)` halves the spatial dimensions by taking the maximum value from each 2×2 region. This reduces computation and makes the representation less sensitive to small shifts in position.

### Parameters vs. Features

These two are different, and the distinction matters.

**Parameters** are what the model learns — the numbers stored in weight matrices, bias vectors, and convolution filters. Before training they're random. After training they've been adjusted by the optimizer to reduce the loss.

**Features** are what the model produces — the activation values that come out of each layer when an image passes through. These aren't stored permanently. They're computed fresh every time you run a forward pass.

So a filter might look like this after training:
$$K=\begin{bmatrix}0.2&-0.1&0.4\\0.7&0.3&-0.2\\-0.5&0.1&0.6\end{bmatrix}$$

These 9 numbers are parameters — they change during training. When you pass an image through this filter, the resulting activation map is a feature. The model is never told "learn to detect edges." Weights that respond to edges happen to reduce the classification loss, so that's what the optimizer pushes them toward.

During training, when the loss flows backward, the gradient doesn't just update the final linear layer — it propagates all the way back through the convolutions:
$$\frac{\partial L}{\partial \theta_1} = \frac{\partial L}{\partial f_3} \cdot \frac{\partial f_3}{\partial f_2} \cdot \frac{\partial f_2}{\partial f_1} \cdot \frac{\partial f_1}{\partial \theta_1}$$

That's how parameters in the very first layer, which never see the loss directly, still get updated to extract useful features.

## Overfitting and Regularisation

As a model trains on a fixed dataset, it can eventually memorise specific examples rather than learning the general pattern. Its weights grow large and specific. On the training data it looks great; on new data it fails. This is overfitting.

Regularisation addresses it by adding a penalty on large weights to the loss:
$$L_{\text{total}} = L_{\text{prediction}} + \lambda \cdot \text{penalty}$$

L1 regularisation penalises the sum of absolute weight values:
$$L_{\text{total}} = L_{\text{prediction}} + \lambda \sum |w_i|$$

L2 regularisation penalises the sum of squared weight values:
$$L_{\text{total}} = L_{\text{prediction}} + \lambda \sum w_i^2$$

L1 pushes many weights to exactly zero — it acts as feature selection, eliminating inputs the model finds irrelevant. Geometrically, the L1 constraint region is a diamond shape with corners on the axes, and the loss minimum often lands on a corner where some weights are zero.

L2 shrinks all weights toward zero but never fully eliminates them. The constraint region is a smooth circle with no corners, so the minimum lands somewhere all weights contribute a small amount. This keeps the model stable and works well when features are correlated with each other.



## The Transformer: A Different Architecture

CNNs exploit locality — the assumption that nearby pixels are more related than distant ones. Transformers don't make that assumption. They let every element in a sequence interact with every other element directly through a mechanism called **self-attention**.

### From Text to Tensors

A transformer doesn't receive raw words. A sentence like "The cat sat" is first broken into **tokens** — subword units with integer IDs:
$$[12,\ 583,\ 91]$$

Each token ID is then mapped to a vector by looking up a row in an **embedding matrix** $E \in \mathbb{R}^{V \times d}$, where $V$ is the vocabulary size and $d$ is the embedding dimension. If $d = 768$:
$$[12,\ 583,\ 91] \rightarrow X \in \mathbb{R}^{3 \times 768}$$

The embedding matrix is a learned parameter, not a fixed lookup table. It gets updated by backpropagation just like any other weight matrix. Words that appear in similar contexts end up with similar embedding vectors, not because they were told to, but because that structure reduces the loss.

### Self-Attention: How Tokens Talk to Each Other

Given the input tensor $X$, the attention layer creates three different projections of the same input using three learned weight matrices:
$$Q = XW_Q, \quad K = XW_K, \quad V = XW_V$$

These are called Query, Key, and Value. The intuition: each token uses its Query to ask "what am I looking for?", its Key to say "here's what I contain," and its Value to say "here's the information I'll provide if you attend to me."

To compute how much token $i$ should attend to token $j$, the model takes the dot product of their Query and Key:
$$\text{score}(i, j) = Q_i K_j^T$$

A larger dot product means the two representations are more aligned. After computing scores for all token pairs, the model applies softmax to each row to get attention weights that sum to 1:
$$A = \text{softmax}(QK^T)$$

The output for each token is then a weighted sum of the Value vectors:
$$H = AV$$

So the full self-attention operation is:
$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d}}\right) V$$

The $\sqrt{d}$ in the denominator keeps the dot products from growing too large in high dimensions, which would push softmax into regions where gradients vanish.

This is called *self*-attention because Q, K, and V all come from the same input sequence. Each token is attending to other tokens within the same sentence.

The output $H$ has the same shape as the input $X$ — same number of tokens, same number of dimensions per token. But the values have changed. Each token's representation now contains information gathered from the other tokens it attended to. The word "it" in "The cat drank because it was thirsty" can now carry information from "cat."

### The Feed-Forward Network

After attention, each token passes independently through a feed-forward network:
$$h \rightarrow W_1 h + b_1 \rightarrow \text{GELU} \rightarrow W_2 h' + b_2$$

The typical design expands and then contracts:
$$768 \rightarrow 3072 \rightarrow 768$$

The expansion factor of 4 is a historical design choice. The wider intermediate layer gives the network more capacity to transform each token's contextual representation. Attention mixes information across tokens; the FFN transforms each token's representation individually afterward.

### Self-Supervised Training

A CNN trained on cat images needs labels: someone has to tell the model which images are cats. A language transformer doesn't need external labels. The text provides its own supervision.

Given the sentence "The cat sat on the mat," the model creates training pairs by shifting the tokens by one position:
$$\text{Input: } [t_1, t_2, t_3, t_4, t_5] \quad \text{Target: } [t_2, t_3, t_4, t_5, t_6]$$

So the model learns to predict the next token at every position simultaneously. One sequence gives multiple training targets. The loss is **cross-entropy** — it measures how far the model's predicted probability distribution over vocabulary tokens is from the true one-hot target.

Language prediction isn't a distance problem in the geometric sense, so L1 or L2 loss isn't appropriate here. Whether the model predicts "cat" or "dog" when the correct token is "sat" isn't captured by how far apart those words are numerically.

Training is parallelizable: the model can compute predictions for all positions in a sequence at once. Generation is sequential: to predict token $t_3$, the model needs $t_2$, which it just generated — so tokens must be produced one at a time.

### What Gets Saved

After training, the model file is just a collection of learned weight tensors.

The Q, K, V tensors computed during a forward pass are not saved — they're temporary activations recomputed from the input every time. What's saved is the projection matrices $W_Q$, $W_K$, $W_V$. Those are the parameters. The FFN weight matrices are typically the largest per block: $W_1 \in \mathbb{R}^{768 \times 3072}$ has about 2.4 million parameters on its own.

## How LLMs Use Norms

The same norm-based tools that guide training in small models are essential in large ones, just at a different scale.

**RMSNorm** is used inside transformers like LLaMA and Mistral to keep activations in a stable range. After each layer, activations can grow very large or shrink to near zero, making training unstable. RMSNorm divides them by their L2 norm:
$$\hat{x} = \frac{x}{\sqrt{\frac{1}{d}\sum_{i=1}^d x_i^2}} \cdot \gamma$$

Without this, training through dozens of layers tends to collapse. This is applied after both the attention block and the FFN in each transformer layer.

**AdamW** is the standard optimizer for LLMs, and the W stands for weight decay — L2 regularisation applied every step. With billions of parameters trained on trillions of tokens, this keeps weights from growing too large. LLMs don't use L1 because they want all parameters active and contributing; driving many to zero would throw away learned representations.

**Cosine similarity** is how LLMs compare embeddings. You can't compare raw magnitudes directly because a longer text will produce a larger vector by default. Dividing by the L2 norm removes the magnitude and keeps only the direction:
$$\text{similarity}(A, B) = \frac{A \cdot B}{\|A\|_2 \|B\|_2}$$

Two embeddings pointing in the same direction in vector space represent similar things.

## Attention's Quadratic Cost

Every token attends to every other token. With $n$ tokens and embedding dimension $d$, computing the attention scores $QK^T$ requires $O(n^2 d)$ operations.

Double the sequence length and the computation quadruples. But compute isn't the only bottleneck; memory is often the harder limit. The attention matrix $A = \text{softmax}(QK^T/\sqrt{d})$ has shape $n \times n$. Every token needs a score for every other token.

At 2048 tokens, an $n \times n$ matrix is manageable. At 100,000 tokens, it contains 10 billion elements. In 16-bit precision, that's 20 gigabytes of memory just to store the attention scores for a single attention head in a single layer. A model with 32 layers and 32 heads would need terabytes of VRAM just for these intermediate activations.

This quadratic scaling is why early transformers were limited to short context windows. Extending the context window required changes to how attention interacts with GPU hardware.

**FlashAttention** rewrites the operation to compute the attention matrix in blocks. Instead of calculating the entire $n \times n$ matrix, writing it to slow GPU memory (HBM), and reading it back to apply the softmax, FlashAttention computes small blocks of the matrix and keeps them in the GPU's fast on-chip SRAM. It avoids materializing the massive $n \times n$ matrix entirely, making the operation bound by compute rather than memory bandwidth.

**Grouped Query Attention (GQA)** addresses the inference bottleneck. During text generation, the model has to load the Key and Value tensors for all previous tokens from memory for every single new token it predicts. GQA reduces the size of these tensors by having multiple Query heads share the same Key and Value heads, drastically cutting down the memory bandwidth required to generate text.

## The Core Machinery

But the core machinery is what's described here. Parameters are learned; features are computed. Loss is measured with a norm or a divergence depending on what kind of problem you're solving. Derivatives propagate backward through every operation PyTorch recorded. Regularization adds a norm penalty to keep weights from growing unchecked. Normalization layers keep activations in range so the signal doesn't collapse after 20 layers.

The choice of L1 vs L2 at each point isn't cosmetic. L1 produces sparse weights. L2 keeps everything small but present. Which one is right depends on what you're doing and what your data looks like.
