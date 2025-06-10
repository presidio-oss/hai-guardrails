# Copyright Guard

The Copyright Guard detects potential copyright violations in text inputs, helping you avoid legal issues by identifying copyrighted material such as song lyrics, book excerpts, articles, and other protected content.

## What is Copyright Infringement?

Copyright infringement occurs when copyrighted material is used without permission from the copyright holder. This includes:

- **Song lyrics** - Popular songs and their lyrics
- **Book excerpts** - Passages from novels, poems, and other literary works
- **Movie quotes** - Memorable lines from films and TV shows
- **Article content** - News articles, blog posts, and journalistic content
- **Code snippets** - Proprietary or copyrighted source code
- **Academic papers** - Research papers and scholarly articles

## How the Copyright Guard Works

The Copyright Guard uses language model analysis to:

1. Analyze text content for potential copyright violations
2. Identify the type and source of copyrighted material
3. Score the likelihood of copyright infringement
4. Block content that exceeds the configured threshold

## Usage

### Basic Usage

```typescript
import { copyrightGuard } from '@presidio-dev/hai-guardrails'
import { ChatOpenAI } from '@langchain/openai'

// Setup LLM provider
const llm = new ChatOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	model: 'gpt-4',
})

// Create copyright guard
const guard = copyrightGuard({
	threshold: 0.8,
	llm: llm,
})

const messages = [
	{
		role: 'user',
		content: 'To be, or not to be, that is the question',
	},
]

const results = await guard(messages)
console.log(results[0].passed) // false - Shakespeare quote detected
```

### With Custom Threshold

```typescript
// More sensitive detection
const strictGuard = copyrightGuard({
	threshold: 0.6, // Lower threshold = more sensitive
	llm: llm,
})

// Less sensitive detection
const relaxedGuard = copyrightGuard({
	threshold: 0.9, // Higher threshold = less sensitive
	llm: llm,
})
```

### Role-Specific Protection

```typescript
// Only check user inputs
const userOnlyGuard = copyrightGuard({
	roles: ['user'],
	threshold: 0.8,
	llm: llm,
})

// Only check assistant responses
const assistantOnlyGuard = copyrightGuard({
	roles: ['assistant'],
	threshold: 0.8,
	llm: llm,
})
```

### With GuardrailsEngine

```typescript
import { GuardrailsEngine, copyrightGuard } from '@presidio-dev/hai-guardrails'

const engine = new GuardrailsEngine({
	guards: [
		copyrightGuard({
			threshold: 0.8,
			llm: llm,
		}),
	],
})

const results = await engine.run(messages)
```

## Configuration Options

### Guard Options

```typescript
interface CopyrightGuardOptions {
	threshold: number // Detection threshold (0-1)
	roles?: string[] // Message roles to check
	selection?: SelectionType // Which messages to analyze
	llm?: LLMProvider // Custom LLM provider (required)
	messageHashingAlgorithm?: string // Hashing algorithm
}
```

### Threshold Guidelines

| Threshold | Sensitivity | Use Case                                     |
| --------- | ----------- | -------------------------------------------- |
| 0.9-1.0   | Low         | Casual applications, only obvious violations |
| 0.7-0.9   | Medium      | Most applications, balanced detection        |
| 0.5-0.7   | High        | Publishing, content creation platforms       |
| 0.3-0.5   | Very High   | Legal-sensitive applications                 |

## Example Results

### Copyright Violation Detected

```json
{
	"guardId": "copyright",
	"guardName": "Copyright Guard",
	"message": {
		"role": "user",
		"content": "To be, or not to be, that is the question"
	},
	"index": 0,
	"passed": false,
	"reason": "Well-known quote from Shakespeare's Hamlet",
	"inScope": true,
	"messageHash": "e387afea59cdab8e3cedf80433169e7c20ba517f25b3f3e2004aa8a322fceead",
	"additionalFields": {
		"score": 0.9,
		"reason": "Well-known quote from Shakespeare's Hamlet",
		"type": ["book_excerpt"],
		"source": "Hamlet by William Shakespeare",
		"isDirectMatch": true
	}
}
```

### No Copyright Issues

```json
{
	"guardId": "copyright",
	"guardName": "Copyright Guard",
	"message": {
		"role": "user",
		"content": "Hello, how are you today?"
	},
	"index": 0,
	"passed": true,
	"reason": "Common greeting with no copyright concerns",
	"inScope": true,
	"messageHash": "9ba7644cfbcc966c134e229a9cb74c34d4a8ac47cc8fa695da4a7bc15535d9d1",
	"additionalFields": {
		"score": 0.01,
		"reason": "Common greeting with no copyright concerns"
	}
}
```

## Detected Content Types

### Literary Works

- **Book excerpts**: Famous passages from novels, poems, plays
- **Poetry**: Copyrighted poems and verses
- **Quotes**: Memorable quotes from literature

### Entertainment Media

- **Song lyrics**: Popular music lyrics
- **Movie quotes**: Memorable lines from films and TV
- **Script excerpts**: Dialogue from plays and screenplays

### News and Articles

- **News content**: Articles from news publications
- **Blog posts**: Copyrighted blog content
- **Journalistic content**: Professional journalism

### Academic and Technical

- **Research papers**: Academic publications
- **Technical documentation**: Proprietary technical content
- **Code snippets**: Copyrighted source code

## Basic Configuration

### Choose Appropriate Threshold

```typescript
// For content creation platforms
const contentPlatformGuard = copyrightGuard({
	threshold: 0.6, // Strict detection
	llm: llm,
})

// For casual chat applications
const chatAppGuard = copyrightGuard({
	threshold: 0.9, // Relaxed detection
	llm: llm,
})
```

### Handle Results

```typescript
const results = await guard(messages)

results.forEach((result) => {
	if (!result.passed) {
		console.log('Copyright violation detected:', {
			content: result.message.content,
			source: result.additionalFields?.source,
			type: result.additionalFields?.type,
			score: result.additionalFields?.score,
		})
	}
})
```

## Troubleshooting

### High False Positive Rate

**Problem:** Common phrases being flagged as copyright violations

**Solution:** Increase threshold value

```typescript
const relaxedGuard = copyrightGuard({
	threshold: 0.9, // Less sensitive
	llm: llm,
})
```

### Low Detection Rate

**Problem:** Obvious copyright violations not being caught

**Solution:** Lower threshold value

```typescript
const strictGuard = copyrightGuard({
	threshold: 0.6, // More sensitive
	llm: llm,
})
```

## Related Guards

- [**Toxic Guard**](toxic.md) - Filters harmful content
- [**Hate Speech Guard**](hate-speech.md) - Blocks discriminatory language
- [**Bias Detection Guard**](bias-detection.md) - Identifies unfair generalizations
