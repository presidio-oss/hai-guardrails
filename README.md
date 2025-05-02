# @presidio-dev/hai-guardrails

A TypeScript library providing a set of guards for LLM (Large Language Model) applications. This library helps implement safety and control mechanisms in AI applications to prevent prompt injection and information leakage.

## Available Guards

### 1. Injection Guard

Prevents prompt injection attacks by detecting and blocking attempts to manipulate the AI's behavior. It uses three detection tactics:

- **Heuristic Detection**: Identifies suspicious keywords and phrases that indicate injection attempts
- **Pattern Matching**: Detects specific patterns commonly used in injection attacks
- **Language Model Detection**: Uses an LLM to evaluate the likelihood of injection attempts

### 2. Leakage Guard

Prevents information leakage by detecting and blocking attempts to extract system prompts, instructions, or sensitive information. It uses three detection tactics:

- **Heuristic Detection**: Identifies keywords related to system information extraction
- **Pattern Matching**: Detects patterns commonly used in leakage attempts
- **Language Model Detection**: Uses an LLM to evaluate the likelihood of leakage attempts

## Features

- TypeScript-first development with proper type definitions
- Modern JavaScript module support (ESM and CommonJS)
- Built with Bun for faster builds and development
- Multiple detection tactics (heuristic, pattern matching, language model)
- Configurable detection thresholds
- Example implementations for common use cases

## Installation

```bash
npm install @presidio-dev/hai-guardrails
```

## Requirements

- Node.js >=16.0.0
- Bun >=1.0.0
- TypeScript >=5.0.0
- @langchain/core >=0.3.49

## Development

1. Install dependencies:

   ```bash
   bun install
   ```

2. Build the project:

   ```bash
   bun run build
   ```

3. Format code:
   ```bash
   bun run format
   ```

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

For security-related issues, please refer to our [Security Policy](SECURITY.md).
