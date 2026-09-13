# Contributing to eulerfold

Thank you for your interest in contributing to **eulerfold**!

We welcome contributions of all kinds, including bug fixes, new features, documentation improvements, performance optimizations, examples, and tests. This guide explains how to set up your development environment and submit changes.

By contributing to eulerfold, you agree to follow the project's coding standards and maintain a respectful, collaborative environment.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Branch Guidelines](#branch-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Commit Guidelines](#commit-guidelines)
- [Pull Requests](#pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Review Process](#review-process)

---

## Getting Started

Before contributing:

1. Check existing issues and pull requests to avoid duplicate work.
2. For large changes, open an issue first to discuss your idea.
3. Make sure your proposed change fits the goals and scope of eulerfold.

Small fixes such as documentation improvements, typo corrections, or minor bug fixes can usually be submitted directly through a pull request.

---

## Development Setup

### 1. Fork the repository

Create your own fork of the eulerfold repository on GitHub.

### 2. Clone your fork

```bash
git clone https://github.com/<your-username>/eulerfold.git
cd eulerfold
```

### 3. Add the upstream repository

```bash
git remote add upstream https://github.com/s-chudmunge/eulerfold.git
```

This allows you to keep your fork synchronized with the main repository.

### 4. Create a virtual environment

For Python development:

```bash
python -m venv .venv
```

Activate it:

Linux/macOS:

```bash
source .venv/bin/activate
```

Windows:

```bash
.venv\Scripts\activate
```

### 5. Install dependencies

Install project dependencies using the project's preferred dependency manager.

Example:

```bash
pip install -r requirements.txt
```

---

## Making Changes

Before writing code:

- Understand the existing project structure.
- Follow patterns already used in the codebase.
- Keep changes focused and avoid unrelated modifications.
- Prefer small, reviewable pull requests.

A good contribution should:

- Solve a specific problem.
- Include appropriate tests.
- Include documentation updates when necessary.
- Avoid introducing unnecessary complexity.

---

## Branch Guidelines

Do not make changes directly on the `main` branch.

Create a descriptive branch:

```bash
git checkout -b feature/add-new-functionality
```

Recommended branch names:

| Type | Example |
|---|---|
| New feature | `feature/new-model-support` |
| Bug fix | `fix/incorrect-output-format` |
| Documentation | `docs/update-installation-guide` |
| Refactor | `refactor/improve-parser` |
| Tests | `test/add-edge-cases` |

---

## Code Style

### Python

Follow **PEP 8** conventions.

Guidelines:

- Use meaningful variable and function names.
- Keep functions small and focused.
- Add type hints where appropriate.
- Avoid unnecessary dependencies.
- Write clear and maintainable code.

Example:

```python
def calculate_result(value: int) -> int:
    """
    Calculate the processed result.

    Args:
        value: Input value.

    Returns:
        The calculated result.
    """
    return value * 2
```

### Documentation

All public functions, classes, and modules should include documentation.

Documentation should explain:

- What the component does.
- Expected inputs.
- Returned values.
- Important edge cases.

---

## Testing

All new features and bug fixes should include tests whenever possible.

Before submitting a pull request:

1. Run the existing test suite.
2. Ensure all tests pass.
3. Add tests covering your changes.

Example:

```bash
pytest
```

If your change affects existing behavior, update the relevant tests accordingly.

---

## Documentation

Documentation improvements are highly encouraged.

Update documentation when you:

- Add new features.
- Change existing APIs.
- Modify usage examples.
- Fix incorrect instructions.

Examples and tutorials should be clear enough for new users to follow.

---

## Commit Guidelines

Write clear and meaningful commit messages.

Good examples:

```
Add support for custom configuration files
Fix incorrect tensor shape handling
Improve documentation for installation steps
```

Avoid vague commits:

```
fix stuff
changes
update
```

Keep commits focused on one logical change whenever possible.

---

## Pull Requests

Before opening a pull request:

- Make sure your branch is up to date with `main`.
- Run tests locally.
- Review your own changes.
- Remove debugging code or unnecessary files.

Your pull request should include:

### Title

Use a clear description of the change.

Example:

```
Add support for XYZ feature
```

### Description

Explain:

- What changed.
- Why the change was needed.
- How it was tested.
- Any limitations or follow-up work.

Example:

```
## Summary

Adds support for XYZ processing.

## Changes

- Added new XYZ module
- Added unit tests
- Updated documentation

## Testing

pytest completed successfully
```

---

## Reporting Bugs

Please use GitHub Issues to report bugs.

A useful bug report should include:

- A clear description of the problem.
- Steps to reproduce the issue.
- Expected behavior.
- Actual behavior.
- Python version.
- Operating system.
- Relevant error messages or logs.

Example:

```
## Bug Description

The function returns an incorrect result when...

## Steps to Reproduce

1. Install version X
2. Run example Y
3. Observe incorrect output

## Expected Behavior

Expected output should be...

## Environment

Python:
OS:
eulerfold version:
```

---

## Feature Requests

Feature suggestions are welcome.

Before requesting a feature:

- Check whether a similar request already exists.
- Explain the problem the feature would solve.
- Describe possible implementation approaches if known.

Good feature requests focus on the user problem rather than only the proposed solution.

---

## Review Process

After submitting a pull request:

1. Maintainers will review the changes.
2. Feedback may be provided for improvements.
3. Contributors may be asked to make additional changes.
4. Once approved, the pull request will be merged.

Please be patient during reviews. Maintainers review contributions as time allows.

---

## Community Guidelines

Contributors are expected to:

- Be respectful and constructive.
- Accept feedback positively.
- Discuss technical disagreements professionally.
- Help maintain a welcoming community.

Thank you for helping improve **eulerfold**!
