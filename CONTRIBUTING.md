# Contributing to v0-mcp

First off, thank you for considering contributing to v0-mcp! It's people like you that make v0-mcp such a great tool. 🎉

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following the code style guidelines
4. **Add or update tests** as needed
5. **Run tests**: `npm test`
6. **Run linter**: `npm run lint`
7. **Build the project**: `npm run build`
8. **Commit your changes** using descriptive commit messages
9. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/v0-mcp.git
cd v0-mcp

# Install dependencies
npm install

# Create environment file
npm run setup

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in `tsconfig.json`
- Prefer interfaces over type aliases for object shapes
- Use explicit return types for functions
- Document complex functions with JSDoc comments

### General

- Use meaningful variable and function names
- Keep functions small and focused
- Write self-documenting code
- Add comments only when necessary
- Follow the existing code patterns

### Testing

- Write tests for all new features
- Maintain or improve code coverage
- Place unit tests in `tests/unit/`
- Place integration tests in `tests/integration/`
- Use descriptive test names

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add streaming support for v0_generate_ui
fix: handle timeout errors in v0Service
docs: update installation instructions
test: add unit tests for error handling
```

## Project Structure

```
v0-mcp/
├── src/
│   ├── config/        # Configuration management
│   ├── mcp/          # MCP server implementation
│   ├── services/     # v0 API service
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── tests/            # Test files
├── docs/             # Documentation
└── examples/         # Usage examples
```

## Release Process

Releases are managed by maintainers. The process includes:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a git tag
4. Push to GitHub
5. GitHub Actions will automatically publish to npm

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🚀