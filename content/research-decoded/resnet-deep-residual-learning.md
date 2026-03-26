---
title: "ResNet: Deep Residual Learning"
authors: "He et al. (2015)"
citation: "He, K., Zhang, X., Ren, S., & Sun, J. (2016). Deep residual learning for image recognition. In Proceedings of the IEEE conference on computer vision and pattern recognition (pp. 770-778)."
link: "https://arxiv.org/abs/1512.03385"
slug: "resnet-deep-residual-learning"
heroImage: "https://ar5iv.labs.arxiv.org/html/1512.03385/assets/x2.png"
---

# ResNet: Deep Residual Learning

An examination of the training curves of very deep neural networks reveals a phenomenon documented by the authors of the 2015 ResNet paper. While it is intuitive to assume that adding more layers to a model should always improve performance—or at least maintain it—researchers found that after a certain point, accuracy begins to drop rapidly. This is not the result of overfitting, as the training error itself increases. The paper identified this as the 'degradation problem,' suggesting that as networks grow deeper, the optimization landscape becomes so complex that standard algorithms struggle to find even a simple identity mapping. This discovery shifted the focus of deep learning from raw model capacity to the fundamental challenge of information flow.

## Residual Learning and Identity Mapping {#degradation-problem}

![A residual building block showing the identity shortcut connection that enables H(x) = F(x) + x.](https://ar5iv.labs.arxiv.org/html/1512.03385/assets/x2.png)

_A residual building block showing the identity shortcut connection that enables H(x) = F(x) + x._

ResNet addressed the degradation problem in deep neural networks by introducing residual learning, a reformulation where each layer learns a "residual" function relative to its input. Through the use of shortcut connections that add the input directly to the layer's output, the network makes an identity mapping its default state. This architectural adjustment ensures that information and gradients can flow through the system unimpeded, solving the issue where adding more layers would paradoxically increase training error. It proved that extreme depth in a system is sustainable only if the layers are designed to learn subtle deviations from the signal rather than being forced to reconstruct it entirely at every stage.

## The Bottleneck Design for Scale {#bottleneck-architecture}

To scale the architecture to extreme depths of 101 or 152 layers, the researchers introduced a 'bottleneck' building block. Each block uses a stack of three convolutional layers: a 1x1 convolution to reduce the dimensionality of the input, a 3x3 convolution to process the features in this reduced space, and a final 1x1 convolution to restore the original dimensions. This 'sandwiched' design allows the network to maintain a manageable number of parameters and computational cost while significantly increasing its depth. This specific engineering revealed that efficiency in deep networks is achieved by carefully managing the 'width' of the representation space, forcing the model to compress and then expand information as it moves through the system. It proved that depth can be increased almost indefinitely as long as the internal representations are kept strategically narrow.

## Fluidity of Gradient Flow {#gradient-flow}

The reasoning behind the identity shortcut was to ensure the fluidity of gradients during backpropagation. Because the shortcut connection bypasses the weight layers, the signal from the loss function has a direct, unimpeded path to reach the earlier parts of the network. This architectural adjustment acts as a form of preconditioning, providing the optimization algorithm with a more stable and predictable starting point. This marked a shift in how depth is understood in artificial intelligence: it is not merely a measure of complexity, but a measure of how well information can pass through a system unchanged. This proved that many complex systems fail not because they lack the capacity to solve a problem, but because their internal structures are too rigid to allow the necessary signals to reach their destination.

## Resources

- [PyTorch ResNet Tutorial](https://pytorch.org/hub/pytorch_vision_resnet/) {type: docs, provider: PyTorch}
- [ResNet Paper on arXiv](https://arxiv.org/abs/1512.03385) {type: article, provider: arXiv}
