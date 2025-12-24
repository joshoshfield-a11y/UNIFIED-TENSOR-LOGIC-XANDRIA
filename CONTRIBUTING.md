# Contributing to UTL-XANDRIA

Thank you for your interest in contributing to the Unified Tensor-Logic Native and Xandria project. This system is designed to be a paradigm shift in software generation.

## The Triadic Philosophy
Before contributing, understand the core philosophy:
1.  **Void**: The intent or empty state.
2.  **Fabric**: The logic, templates, and operators.
3.  **Artifact**: The materialized code.

## How to Contribute

### Reporting Bugs
- Use the Bug Report template.
- clearly describe the intent you provided and the artifact that was generated.
- Attach the `artifact.json` if possible.

### Proposing Features (Operators/Templates)
- We are actively expanding the 72 Operator Canon.
- New Templates should be added to `XANDRIA/kb/xandria/templates.json`.

### Pull Request Process
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-operator`).
3.  Commit your changes.
4.  Run `npm run smoke` to ensure the pipeline is intact.
5.  Push to the branch.
6.  Open a Pull Request.

## Coding Standards
- Use ES Modules (`import`/`export`).
- Follow the `.editorconfig` settings (2 spaces indent).
- Ensure all new logic is "sealed" (provenance tracking).

## License
By contributing, you agree that your contributions will be licensed under the project's existing license.
