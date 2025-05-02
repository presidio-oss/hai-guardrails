# Development Setup Guide

This guide provides detailed instructions for setting up your development environment for the @presidio-dev/hai-guardrails project.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js**: Version 16.0.0 or higher

   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Bun**: Version 1.0.0 or higher

   - Download from: https://bun.sh/
   - Verify installation: `bun --version`

3. **Git**: Version 2.0.0 or higher
   - Verify installation: `git --version`

## Setting Up the Project

1. **Clone the Repository**

   ```bash
   git clone https://github.com/presidio-oss/hai-guardrails.git
   cd hai-guardrails
   ```

2. **Install Dependencies**

   ```bash
   bun install
   ```

3. **Configure Environment Variables**

   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` with your configuration:
     - `GOOGLE_API_KEY`: For Google Generative AI integration
     - Other provider-specific keys as needed

4. **Build the Project**
   ```bash
   bun run build
   ```

## Development Tools

### Code Formatting

- **Prettier**: Code formatter

  ```bash
  bun run format
  ```

- **Check Formatting**: Verify code formatting
  ```bash
  bun run format:check
  ```

### Build

- **Build Project**: Build the project using build.ts
  ```bash
  bun run build
  ```

### Release Management

- **Prepare Release**: Prepare a release

  ```bash
  bun run release
  ```

- **Dry Run**: Test release process

  ```bash
  bun run release:dry-run
  ```

- **CI Release**: Release from CI
  ```bash
  bun run release:ci
  ```

## Testing

Currently, manual testing is recommended. Unit tests will be added in future versions.

## Building the Project

- **Build Project**
  ```bash
  bun run build
  ```

The build process uses build.ts to generate the distribution files.

## Version Control

1. **Commit Messages**

   - Follow [Conventional Commits](https://www.conventionalcommits.org/) specification
   - Example: `fix: resolve injection detection false positives`

2. **Branch Naming**
   - Feature branches: `feature/your-feature-name`
   - Bug fix branches: `fix/your-fix-name`
   - Hotfix branches: `hotfix/your-hotfix-name`

## Publishing

- **Prepare Release**: Use release-it for version management and publishing

  ```bash
  bun run release:ci
  ```

- **Dry Run**: Test the release process
  ```bash
  bun run release:dry-run
  ```

## Troubleshooting

### Common Issues

1. **Build Errors**

   - Clear node_modules and reinstall:
     ```bash
     rm -rf node_modules
     bun install
     ```

2. **TypeScript Errors**
   - Check tsconfig.json for configuration issues
   - Ensure all dependencies are properly installed

## Additional Resources

- [Code of Conduct](../../CODE_OF_CONDUCT.md)
- [Security Policy](../../SECURITY.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)
