# Installation

## Requirements

- **Node.js**: 16.0.0 or higher
- **Bun**: 1.0.0 or higher (optional, but recommended)
- **TypeScript**: 5.0 or higher (peer dependency)

## Package Installation

### Using npm

```bash
npm install @presidio-dev/hai-guardrails
```

### Using yarn

```bash
yarn add @presidio-dev/hai-guardrails
```

### Using pnpm

```bash
pnpm add @presidio-dev/hai-guardrails
```

### Using bun

```bash
bun add @presidio-dev/hai-guardrails
```

## TypeScript Configuration

hai-guardrails is built with TypeScript and requires TypeScript 5.0 or higher. Make sure your `tsconfig.json` includes:

```json
{
	"compilerOptions": {
		"target": "ES2020",
		"module": "ESNext",
		"moduleResolution": "node",
		"strict": true,
		"esModuleInterop": true,
		"skipLibCheck": true,
		"forceConsistentCasingInFileNames": true
	}
}
```

## Optional Dependencies

### For LangChain Integration

If you plan to use hai-guardrails with LangChain:

```bash
npm install @langchain/core
```

### For Language Model Detection

Some guards support LLM-based detection. You'll need an LLM provider:

```bash
# For OpenAI
npm install @langchain/openai

# For Google Gemini
npm install @langchain/google-genai

# For Anthropic Claude
npm install @langchain/anthropic
```

## Verification

Verify your installation by creating a simple test file:

```typescript
// test-installation.ts
import { injectionGuard } from '@presidio-dev/hai-guardrails'

const guard = injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 })

console.log('hai-guardrails installed successfully!')
```

Run the test:

```bash
npx tsx test-installation.ts
# or
bun run test-installation.ts
```

## Next Steps

- [Quick Start](quick-start.md) - Create your first guardrail
- [Core Concepts](core-concepts.md) - Understand how guardrails work
