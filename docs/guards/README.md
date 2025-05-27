# Guards Reference

hai-guardrails provides 10 guards to protect your LLM applications from various issues and ensure content safety.

## Guard Categories

### 🛡️ Security Guards

Protect against attacks and system manipulation:

- [**Injection Guard**](injection.md) - Prevent prompt injection attacks
- [**Leakage Guard**](leakage.md) - Block system prompt extraction

### 🔒 Privacy Guards

Protect sensitive information and credentials:

- [**PII Guard**](pii.md) - Detect & redact personal information
- [**Secret Guard**](secret.md) - Protect API keys & credentials

### 🚫 Content Safety Guards

Filter harmful and inappropriate content:

- [**Toxic Guard**](toxic.md) - Filter harmful content
- [**Hate Speech Guard**](hate-speech.md) - Block discriminatory language
- [**Profanity Guard**](profanity.md) - Filter inappropriate language
- [**Adult Content Guard**](adult-content.md) - Filter NSFW content

### ⚖️ Compliance Guards

Ensure fairness and legal compliance:

- [**Bias Detection Guard**](bias-detection.md) - Identify unfair generalizations
- [**Copyright Guard**](copyright.md) - Detect copyrighted material

## Quick Reference

| Guard                               | Detection Method      | Use Case                      |
| ----------------------------------- | --------------------- | ----------------------------- |
| [Injection](injection.md)           | Heuristic/Pattern/LLM | Block prompt injection        |
| [Leakage](leakage.md)               | Heuristic/Pattern/LLM | Prevent prompt extraction     |
| [PII](pii.md)                       | Pattern               | Redact personal info          |
| [Secret](secret.md)                 | Pattern + Entropy     | Protect credentials           |
| [Toxic](toxic.md)                   | LLM                   | Filter harmful content        |
| [Hate Speech](hate-speech.md)       | LLM                   | Block discrimination          |
| [Profanity](profanity.md)           | LLM                   | Filter inappropriate language |
| [Adult Content](adult-content.md)   | LLM                   | Block NSFW content            |
| [Bias Detection](bias-detection.md) | LLM                   | Identify bias                 |
| [Copyright](copyright.md)           | LLM                   | Detect copyrighted material   |

## Basic Usage

### Single Guard

```typescript
import { injectionGuard } from '@presidio-dev/hai-guardrails'

const guard = injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 })

const results = await guard(messages)
```

### Multiple Guards

```typescript
import { GuardrailsEngine, injectionGuard, toxicGuard } from '@presidio-dev/hai-guardrails'

const engine = new GuardrailsEngine({
	guards: [
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),
		toxicGuard({ threshold: 0.8, llm: provider }),
	],
})

const results = await engine.run(messages)
```

## Guard Configuration Options

### Common Options

All guards support these base configuration options:

```typescript
interface BaseGuardOptions {
	roles?: string[] // Which message roles to check
	selection?: SelectionType // Which messages to analyze
	n?: number // Number of messages (for n-first/n-last)
	llm?: LLMProvider // Custom LLM provider
	messageHashingAlgorithm?: string // Hashing algorithm for message IDs
}
```

### Detection-Specific Options

#### Heuristic/Pattern Guards

```typescript
interface DetectionOptions {
	mode: 'heuristic' | 'pattern' | 'language-model'
	threshold: number // Score threshold (0-1)
	failOnError?: boolean // Whether to fail on errors
}
```

#### LLM-Based Guards

```typescript
interface LLMGuardOptions {
	threshold: number // Detection threshold (0-1)
	llm?: LLMProvider // Custom LLM provider
}
```

#### Privacy Guards (PII/Secret)

```typescript
interface PrivacyGuardOptions {
	mode?: 'redact' | 'block' // How to handle detected content
	selection: SelectionType // Which messages to check
}
```

## Selection Types

Control which messages each guard analyzes:

```typescript
enum SelectionType {
	All = 'all', // Analyze all messages
	First = 'first', // Only the first message
	Last = 'last', // Only the last message
	NFirst = 'n-first', // First N messages
	NLast = 'n-last', // Last N messages
}
```

For detailed information about each guard, click on the individual guard documentation links above.
