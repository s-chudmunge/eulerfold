import json
import uuid
import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

from app.core.supabase_client import get_supabase_client

def uid():
    return str(uuid.uuid4())

def make_subtopics(subtopics_list):
    return [{"id": uid(), "title": title} for title in subtopics_list]

COURSES = {
    1480: {
        "prerequisites": ["Basic Calculus", "Linear Algebra", "Python Programming"],
        "what_you_will_learn": ["Design and train fully connected neural networks", "Implement backpropagation", "Apply CNNs to images", "Understand sequence modeling"],
        "modules": [
            {
                "id": uid(),
                "title": "Neural Network Foundations",
                "description": "Core concepts behind deep neural networks.",
                "order_index": 0,
                "topics": [
                    {"id": uid(), "title": "Perceptrons and Activation Functions", "youtube_search_query": "Perceptrons and Activation Functions Deep Learning", "optimal_search_query": "Perceptron model and activation functions in neural networks", "subtopics": make_subtopics(["Biological inspiration", "Sigmoid, Tanh, ReLU", "Linear separability"])},
                    {"id": uid(), "title": "Forward Propagation and Loss", "youtube_search_query": "Forward Propagation and Cross Entropy Loss", "optimal_search_query": "Forward propagation process and loss functions in deep learning", "subtopics": make_subtopics(["Matrix multiplication in layers", "MSE vs Cross Entropy", "Softmax"])}
                ]
            },
            {
                "id": uid(),
                "title": "Optimization and Training",
                "description": "How neural networks learn from data.",
                "order_index": 1,
                "topics": [
                    {"id": uid(), "title": "Gradient Descent and Backpropagation", "youtube_search_query": "Backpropagation and Gradient Descent Deep Learning", "optimal_search_query": "Gradient descent and backpropagation algorithm intuition", "subtopics": make_subtopics(["Chain rule", "Calculating gradients", "Learning rate"])},
                    {"id": uid(), "title": "Advanced Optimizers and Regularization", "youtube_search_query": "Adam Optimizer and Dropout Regularization", "optimal_search_query": "Adam optimizer and dropout regularization in deep learning", "subtopics": make_subtopics(["SGD with Momentum", "Adam Optimizer", "Dropout and L2 Regularization"])}
                ]
            },
            {
                "id": uid(),
                "title": "Convolutional Neural Networks",
                "description": "Processing grid-like data such as images.",
                "order_index": 2,
                "topics": [
                    {"id": uid(), "title": "Convolutions and Pooling", "youtube_search_query": "CNN Convolution Operations and Pooling", "optimal_search_query": "Convolutional neural network filters and max pooling", "subtopics": make_subtopics(["Stride and padding", "Edge detection", "Max pooling"])},
                    {"id": uid(), "title": "Classic CNN Architectures", "youtube_search_query": "ResNet and VGG CNN Architectures", "optimal_search_query": "Classic CNN architectures LeNet VGG ResNet", "subtopics": make_subtopics(["LeNet and AlexNet", "VGG16", "Residual Networks (ResNet)"])}
                ]
            },
            {
                "id": uid(),
                "title": "Advanced Computer Vision",
                "description": "Beyond simple classification.",
                "order_index": 3,
                "topics": [
                    {"id": uid(), "title": "Object Detection Basics", "youtube_search_query": "Object Detection YOLO Explained", "optimal_search_query": "Object detection algorithms YOLO and bounding boxes", "subtopics": make_subtopics(["Bounding boxes", "Intersection over Union", "YOLO algorithm"])},
                    {"id": uid(), "title": "Transfer Learning", "youtube_search_query": "Transfer Learning in Deep Learning", "optimal_search_query": "Transfer learning and fine-tuning neural networks", "subtopics": make_subtopics(["Pre-trained models", "Feature extraction vs Fine-tuning", "Data augmentation"])}
                ]
            },
            {
                "id": uid(),
                "title": "Sequence Models",
                "description": "Processing text and time-series data.",
                "order_index": 4,
                "topics": [
                    {"id": uid(), "title": "Recurrent Neural Networks (RNNs)", "youtube_search_query": "Recurrent Neural Networks RNN explained", "optimal_search_query": "Recurrent Neural Networks and sequence modeling", "subtopics": make_subtopics(["Hidden state dynamics", "Backpropagation through time", "Vanishing gradients"])},
                    {"id": uid(), "title": "LSTMs and Word Embeddings", "youtube_search_query": "LSTM and Word2Vec Word Embeddings", "optimal_search_query": "LSTM networks and word embeddings Word2Vec", "subtopics": make_subtopics(["LSTM cell states", "Gated Recurrent Units", "Word2Vec and embeddings"])}
                ]
            },
            {
                "id": uid(),
                "title": "Transformers and Generative Models",
                "description": "Modern architectures for generative AI.",
                "order_index": 5,
                "topics": [
                    {"id": uid(), "title": "Attention Mechanisms and Transformers", "youtube_search_query": "Self Attention and Transformer Architecture", "optimal_search_query": "Self-attention mechanism and Transformer architecture explained", "subtopics": make_subtopics(["Self-attention", "Multi-head attention", "Transformer block"])},
                    {"id": uid(), "title": "Introduction to Generative Models", "youtube_search_query": "Generative Models GANs and Autoencoders", "optimal_search_query": "Introduction to Autoencoders and Generative Adversarial Networks", "subtopics": make_subtopics(["Autoencoders", "Generative Adversarial Networks (GANs)", "Latent space"])}
                ]
            }
        ]
    },
    1479: {
        "prerequisites": ["Basic understanding of waves and frequencies", "High school algebra"],
        "what_you_will_learn": ["Understand the physics of sound and waveforms", "Explain the ADC/DAC conversion process", "Apply the Nyquist-Shannon theorem", "Manipulate digital audio formats and bit depth"],
        "modules": [
            {
                "id": uid(),
                "title": "Acoustics & Physics of Sound",
                "description": "Fundamental principles of acoustic energy.",
                "order_index": 0,
                "topics": [
                    {"id": uid(), "title": "Wave Properties and Harmonics", "youtube_search_query": "Audio Wave Properties Frequency Amplitude", "optimal_search_query": "Physics of sound waves frequency amplitude and harmonics", "subtopics": make_subtopics(["Frequency and amplitude", "Complex waves", "Phase"])}
                ]
            },
            {
                "id": uid(),
                "title": "Psychoacoustics",
                "description": "How humans perceive sound.",
                "order_index": 1,
                "topics": [
                    {"id": uid(), "title": "Loudness and Pitch", "youtube_search_query": "Psychoacoustics Loudness and Pitch Perception", "optimal_search_query": "Psychoacoustics human hearing loudness and pitch", "subtopics": make_subtopics(["Equal-loudness contours", "Fletcher-Munson curves", "Pitch perception"])}
                ]
            },
            {
                "id": uid(),
                "title": "Analog to Digital Conversion",
                "description": "Translating continuous analog waves into discrete digital data.",
                "order_index": 2,
                "topics": [
                    {"id": uid(), "title": "Sampling and the Nyquist Theorem", "youtube_search_query": "Nyquist Theorem and Audio Sampling", "optimal_search_query": "Audio sampling rate and the Nyquist-Shannon theorem", "subtopics": make_subtopics(["Sample and hold", "Nyquist frequency", "Anti-aliasing filters"])},
                    {"id": uid(), "title": "Bit Depth and Quantization", "youtube_search_query": "Audio Bit Depth and Quantization", "optimal_search_query": "Digital audio bit depth and quantization error", "subtopics": make_subtopics(["Signal-to-noise ratio", "Quantization error", "Dithering techniques"])}
                ]
            },
            {
                "id": uid(),
                "title": "Digital Audio Formats",
                "description": "Storing and compressing audio.",
                "order_index": 3,
                "topics": [
                    {"id": uid(), "title": "PCM and Uncompressed Audio", "youtube_search_query": "Pulse Code Modulation PCM Audio", "optimal_search_query": "Pulse Code Modulation (PCM) and WAV audio format", "subtopics": make_subtopics(["PCM format", "WAV vs AIFF", "Interleaving channels"])}
                ]
            },
            {
                "id": uid(),
                "title": "Signal Processing & Effects I",
                "description": "Basic digital signal manipulation.",
                "order_index": 4,
                "topics": [
                    {"id": uid(), "title": "Digital Filters and EQ Basics", "youtube_search_query": "Digital Audio Filters and EQ", "optimal_search_query": "Introduction to digital audio filters and equalization", "subtopics": make_subtopics(["Low-pass/high-pass filters", "Parametric EQ", "Phase shift"])}
                ]
            }
        ]
    },
    1478: {
        "prerequisites": ["Basic HTML & CSS", "Fundamentals of programming"],
        "what_you_will_learn": ["Manipulate the DOM dynamically using JavaScript", "Handle user events and form submissions", "Make asynchronous HTTP requests using Fetch", "Store data locally using Web Storage APIs"],
        "modules": [
            {
                "id": uid(),
                "title": "JavaScript Language Fundamentals",
                "description": "Core language mechanics.",
                "order_index": 0,
                "topics": [
                    {"id": uid(), "title": "Variables, Types, and Scope", "youtube_search_query": "JavaScript Variables Let Const Var and Scope", "optimal_search_query": "JavaScript let const var scope and hoisting", "subtopics": make_subtopics(["let, const, var", "Primitive vs Reference types", "Block vs Function scope"])},
                    {"id": uid(), "title": "Functions and Closures", "youtube_search_query": "JavaScript Closures and Arrow Functions", "optimal_search_query": "JavaScript arrow functions and closures explained", "subtopics": make_subtopics(["Arrow functions", "Higher-order functions", "Closures"])}
                ]
            },
            {
                "id": uid(),
                "title": "Objects and Arrays",
                "description": "Data structures in JS.",
                "order_index": 1,
                "topics": [
                    {"id": uid(), "title": "Object Prototypes", "youtube_search_query": "JavaScript Object Prototypes and Classes", "optimal_search_query": "JavaScript prototypes prototypal inheritance and classes", "subtopics": make_subtopics(["Object literals", "Prototypal inheritance", "ES6 Classes"])},
                    {"id": uid(), "title": "Array Methods", "youtube_search_query": "JavaScript Array Methods Map Filter Reduce", "optimal_search_query": "JavaScript map filter reduce array methods", "subtopics": make_subtopics(["map, filter, reduce", "Destructuring", "Spread operator"])}
                ]
            },
            {
                "id": uid(),
                "title": "Document Object Model (DOM)",
                "description": "Interacting with the browser.",
                "order_index": 2,
                "topics": [
                    {"id": uid(), "title": "DOM Selection and Traversal", "youtube_search_query": "JavaScript DOM Selection and Traversal", "optimal_search_query": "JavaScript querySelector and DOM traversal", "subtopics": make_subtopics(["querySelector", "Parent and child nodes", "Iterating NodeLists"])},
                    {"id": uid(), "title": "DOM Manipulation", "youtube_search_query": "JavaScript DOM Element Creation and Attributes", "optimal_search_query": "JavaScript create elements modify attributes and classes", "subtopics": make_subtopics(["createElement", "Modifying attributes", "classList"])}
                ]
            },
            {
                "id": uid(),
                "title": "Events & Interaction",
                "description": "Handling user inputs.",
                "order_index": 3,
                "topics": [
                    {"id": uid(), "title": "Event Listeners and Event Objects", "youtube_search_query": "JavaScript addEventListener and Event Object", "optimal_search_query": "JavaScript event listeners and the event object", "subtopics": make_subtopics(["addEventListener syntax", "Mouse vs keyboard events", "Extracting data from the event object"])},
                    {"id": uid(), "title": "Event Bubbling and Delegation", "youtube_search_query": "JavaScript Event Bubbling and Delegation", "optimal_search_query": "Event bubbling capturing and delegation in JavaScript", "subtopics": make_subtopics(["Event propagation", "stopPropagation", "Event delegation"])}
                ]
            },
            {
                "id": uid(),
                "title": "Asynchronous JavaScript",
                "description": "Handling delayed operations.",
                "order_index": 4,
                "topics": [
                    {"id": uid(), "title": "The Event Loop and Callbacks", "youtube_search_query": "JavaScript Event Loop Explained", "optimal_search_query": "Understanding the JavaScript Event Loop and Call Queue", "subtopics": make_subtopics(["Call stack", "Task queue", "Microtasks"])},
                    {"id": uid(), "title": "Promises and Async/Await", "youtube_search_query": "JavaScript Promises and Async Await", "optimal_search_query": "JavaScript Promises and Async Await syntax", "subtopics": make_subtopics(["Promise states", "Chaining .then()", "try/catch with async"])}
                ]
            },
            {
                "id": uid(),
                "title": "Web APIs & Network Requests",
                "description": "Communicating with servers.",
                "order_index": 5,
                "topics": [
                    {"id": uid(), "title": "The Fetch API", "youtube_search_query": "JavaScript Fetch API Tutorial", "optimal_search_query": "Making HTTP requests with the Fetch API in JavaScript", "subtopics": make_subtopics(["GET requests", "POST requests with JSON", "Handling network errors"])},
                    {"id": uid(), "title": "Browser Storage", "youtube_search_query": "JavaScript LocalStorage and SessionStorage", "optimal_search_query": "Web Storage API LocalStorage and SessionStorage JavaScript", "subtopics": make_subtopics(["LocalStorage vs SessionStorage", "JSON.stringify/parse", "Cookies basics"])}
                ]
            }
        ]
    },
    1477: {
        "prerequisites": ["Basic command line navigation"],
        "what_you_will_learn": ["Initialize and configure Git repositories", "Track, commit, and inspect file changes", "Create, merge, and resolve branch conflicts", "Collaborate using remote repositories (GitHub)"],
        "modules": [
            {
                "id": uid(),
                "title": "Core Concepts & Configuration",
                "description": "Getting started with Git.",
                "order_index": 0,
                "topics": [
                    {"id": uid(), "title": "Git Architecture", "youtube_search_query": "Git Architecture Working Directory Staging", "optimal_search_query": "Git architecture working directory staging area repository", "subtopics": make_subtopics(["Distributed version control", "Working tree vs repository", "git init"])}
                ]
            },
            {
                "id": uid(),
                "title": "The Staging Area & Commits",
                "description": "Saving snapshots of your project.",
                "order_index": 1,
                "topics": [
                    {"id": uid(), "title": "Tracking Changes", "youtube_search_query": "Git Add and Git Commit Tutorial", "optimal_search_query": "Tracking files with git add and git commit", "subtopics": make_subtopics(["git add", "git commit messages", "Ignoring files with .gitignore"])}
                ]
            },
            {
                "id": uid(),
                "title": "Inspecting & Undoing Changes",
                "description": "Navigating project history.",
                "order_index": 2,
                "topics": [
                    {"id": uid(), "title": "Log and Diff", "youtube_search_query": "Git Log and Git Diff Tutorial", "optimal_search_query": "Using git log and git diff to inspect changes", "subtopics": make_subtopics(["git status", "git log formatting", "git diff"])},
                    {"id": uid(), "title": "Undoing Mistakes", "youtube_search_query": "Git Reset vs Git Revert", "optimal_search_query": "Undoing commits git reset vs git revert", "subtopics": make_subtopics(["git checkout/restore", "git reset (soft/mixed/hard)", "git revert"])}
                ]
            },
            {
                "id": uid(),
                "title": "Branching Strategies",
                "description": "Parallel development workflows.",
                "order_index": 3,
                "topics": [
                    {"id": uid(), "title": "Branches and Merging", "youtube_search_query": "Git Branching and Merging Explained", "optimal_search_query": "Creating git branches and merging fast-forward", "subtopics": make_subtopics(["Creating branches", "git switch", "Fast-forward merges"])}
                ]
            },
            {
                "id": uid(),
                "title": "Conflict Resolution",
                "description": "Fixing diverging histories.",
                "order_index": 4,
                "topics": [
                    {"id": uid(), "title": "Merge Conflicts", "youtube_search_query": "Resolve Git Merge Conflicts", "optimal_search_query": "Resolving git merge conflicts manually", "subtopics": make_subtopics(["Identifying conflict markers", "Resolving manually", "Completing the merge"])},
                    {"id": uid(), "title": "Rebasing", "youtube_search_query": "Git Rebase vs Merge", "optimal_search_query": "Git rebase vs merge interactive rebasing", "subtopics": make_subtopics(["How rebase works", "Interactive rebasing", "When not to rebase"])}
                ]
            },
            {
                "id": uid(),
                "title": "Remote Repositories & Collaboration",
                "description": "Working with GitHub.",
                "order_index": 5,
                "topics": [
                    {"id": uid(), "title": "Remotes and Pushing", "youtube_search_query": "Git Remote and Push to GitHub", "optimal_search_query": "Managing git remotes and pushing to GitHub", "subtopics": make_subtopics(["git remote add", "git push", "Upstream branches"])},
                    {"id": uid(), "title": "Pull Requests and Forks", "youtube_search_query": "GitHub Pull Requests and Forks", "optimal_search_query": "Forking a repository and creating pull requests GitHub", "subtopics": make_subtopics(["git fetch vs pull", "Forking workflow", "Code reviews"])}
                ]
            }
        ]
    },
    1476: {
        "prerequisites": ["Familiarity with mathematical proofs", "Set theory basics"],
        "what_you_will_learn": ["Define and analyze Groups, Rings, and Fields", "Apply Lagrange's Theorem", "Compute modular arithmetic and use the Euclidean Algorithm", "Understand the basics of cryptography like RSA"],
        "modules": [
            {
                "id": uid(),
                "title": "Group Theory Basics",
                "description": "The algebraic structures of symmetry.",
                "order_index": 0,
                "topics": [
                    {"id": uid(), "title": "Definition and Examples", "youtube_search_query": "Group Theory Definition and Examples", "optimal_search_query": "Definition and examples of Groups in Abstract Algebra", "subtopics": make_subtopics(["Closure and associativity", "Identity and inverses", "Symmetric groups"])},
                    {"id": uid(), "title": "Cyclic Groups", "youtube_search_query": "Cyclic Groups Abstract Algebra", "optimal_search_query": "Cyclic groups and generators abstract algebra", "subtopics": make_subtopics(["Generators", "Order of an element", "Classification of cyclic groups"])}
                ]
            },
            {
                "id": uid(),
                "title": "Subgroups and Cosets",
                "description": "Structures within groups.",
                "order_index": 1,
                "topics": [
                    {"id": uid(), "title": "Cosets and Lagrange's Theorem", "youtube_search_query": "Cosets and Lagrange Theorem Group Theory", "optimal_search_query": "Left and right cosets Lagrange's Theorem", "subtopics": make_subtopics(["Subgroup tests", "Left and right cosets", "Lagrange's Theorem"])},
                    {"id": uid(), "title": "Homomorphisms and Normal Subgroups", "youtube_search_query": "Group Homomorphisms and Normal Subgroups", "optimal_search_query": "Group homomorphisms normal subgroups and quotient groups", "subtopics": make_subtopics(["Normal subgroups", "Quotient groups", "First Isomorphism Theorem"])}
                ]
            },
            {
                "id": uid(),
                "title": "Ring Theory",
                "description": "Structures with two binary operations.",
                "order_index": 2,
                "topics": [
                    {"id": uid(), "title": "Introduction to Rings", "youtube_search_query": "Ring Theory Abstract Algebra", "optimal_search_query": "Definition and examples of Rings in Abstract Algebra", "subtopics": make_subtopics(["Rings with identity", "Zero divisors", "Integral domains"])},
                    {"id": uid(), "title": "Ideals and Quotient Rings", "youtube_search_query": "Ideals and Quotient Rings", "optimal_search_query": "Ideals prime ideals maximal ideals and quotient rings", "subtopics": make_subtopics(["Ideals", "Quotient rings", "Prime and maximal ideals"])}
                ]
            },
            {
                "id": uid(),
                "title": "Field Theory & Extensions",
                "description": "Structures where division is possible.",
                "order_index": 3,
                "topics": [
                    {"id": uid(), "title": "Fields", "youtube_search_query": "Field Theory Abstract Algebra", "optimal_search_query": "Introduction to Fields and Finite Fields Abstract Algebra", "subtopics": make_subtopics(["Definition of a field", "Finite fields", "Field of fractions"])},
                    {"id": uid(), "title": "Field Extensions", "youtube_search_query": "Field Extensions and Splitting Fields", "optimal_search_query": "Algebraic field extensions and splitting fields", "subtopics": make_subtopics(["Algebraic extensions", "Degree of extension", "Splitting fields"])}
                ]
            },
            {
                "id": uid(),
                "title": "Number Theory Fundamentals",
                "description": "Properties of integers.",
                "order_index": 4,
                "topics": [
                    {"id": uid(), "title": "Divisibility and Primes", "youtube_search_query": "Euclidean Algorithm and Divisibility", "optimal_search_query": "Divisibility Greatest Common Divisor and Euclidean Algorithm", "subtopics": make_subtopics(["Division Algorithm", "Euclidean Algorithm", "Fundamental Theorem of Arithmetic"])}
                ]
            },
            {
                "id": uid(),
                "title": "Modular Arithmetic & Cryptography",
                "description": "Applications of number theory.",
                "order_index": 5,
                "topics": [
                    {"id": uid(), "title": "Modular Arithmetic", "youtube_search_query": "Modular Arithmetic Congruences", "optimal_search_query": "Modular arithmetic and congruences number theory", "subtopics": make_subtopics(["Congruence classes", "Fermat's Little Theorem", "Euler's Totient function"])},
                    {"id": uid(), "title": "RSA Cryptography", "youtube_search_query": "RSA Algorithm Number Theory", "optimal_search_query": "The RSA encryption algorithm and number theory", "subtopics": make_subtopics(["Public key cryptography", "Prime factorization hardness", "RSA encryption/decryption"])}
                ]
            }
        ]
    }
}

def main():
    sb = get_supabase_client()
    for course_id, data in COURSES.items():
        print(f"Updating course {course_id}...")
        
        roadmap_plan = {
            "prerequisites": data["prerequisites"],
            "what_you_will_learn": data["what_you_will_learn"],
            "modules": data["modules"]
        }
        
        res = sb.table("roadmaps").update({"roadmap_plan": roadmap_plan}).eq("id", course_id).execute()
        print(f"Updated {course_id}")

if __name__ == "__main__":
    main()
