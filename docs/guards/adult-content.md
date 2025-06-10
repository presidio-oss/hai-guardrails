# Adult Content Guard

The Adult Content Guard detects and blocks adult or NSFW (Not Safe For Work) content in text inputs.

## What is Adult Content?

Adult content includes material that is sexually explicit or inappropriate for general audiences

**Examples of Adult Content:**

```
"This novel explores intimate relationships with explicit sexual scenes"
"The story contains detailed descriptions of adult encounters"
"Suggestive content with sexual implications"
```

## How the Adult Content Guard Works

The Adult Content Guard uses language model analysis to:

1. Analyze message content for adult themes and sexual content
2. Score the adult content level (0-1 scale)
3. Block or allow messages based on content score
4. Provide explanations for decisions

> **Note:** The Adult Content Guard requires an LLM provider for analysis and by default only evaluates the last message. To evaluate all messages, set `selection: SelectionType.All`.

## Usage

### Basic Usage

```typescript
import { adultContentGuard } from '@presidio-dev/hai-guardrails'
import { ChatOpenAI } from '@langchain/openai'

// Initialize LLM provider
const llm = new ChatOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	model: 'gpt-4',
})

// Create adult content guard
const guard = adultContentGuard({
	threshold: 0.8,
	llm: llm,
})

const messages = [
	{ role: 'user', content: 'This novel explores intimate relationships with explicit scenes.' },
]

const results = await guard(messages)
console.log(results[0].passed) // false - adult content detected
console.log(results[0].additionalFields.score) // 0.85
```

### Role-Specific Filtering

```typescript
// Only check user messages
const userOnlyGuard = adultContentGuard({
	roles: ['user'],
	threshold: 0.8,
	llm: llm,
})

// Only check assistant responses
const assistantOnlyGuard = adultContentGuard({
	roles: ['assistant'],
	threshold: 0.9,
	llm: llm,
})
```

### Check All Messages

```typescript
import { SelectionType } from '@presidio-dev/hai-guardrails'

// Analyze all messages in conversation
const comprehensiveGuard = adultContentGuard({
	selection: SelectionType.All,
	threshold: 0.8,
	llm: llm,
})
```

### With GuardrailsEngine

```typescript
import { GuardrailsEngine, adultContentGuard } from '@presidio-dev/hai-guardrails'

const engine = new GuardrailsEngine({
	guards: [adultContentGuard({ threshold: 0.8, llm: llm })],
})

const results = await engine.run(messages)
```

## Configuration Options

### Guard Options

```typescript
interface AdultContentGuardOptions {
	threshold: number // Adult content threshold (0-1, required)
	roles?: string[] // Message roles to check
	selection?: SelectionType // Which messages to analyze (default: Last)
	llm?: LLMProvider // LLM provider (required)
	messageHashingAlgorithm?: string // Hashing algorithm
}
```

### Threshold Guidelines

| Threshold | Sensitivity | Use Case                  |
| --------- | ----------- | ------------------------- |
| 0.9-1.0   | Very Low    | Only explicit content     |
| 0.8-0.9   | Low         | Professional environments |
| 0.6-0.8   | Medium      | General applications      |
| 0.4-0.6   | High        | Family-friendly platforms |
| 0.0-0.4   | Very High   | Children's applications   |

## Example Results

### Adult Content Detected

```json
{
	"passed": false,
	"reason": "Contains adult themes and implied sexual situations",
	"guardId": "adult-content",
	"guardName": "Adult Content Guard",
	"message": {
		"role": "user",
		"content": "This novel explores the intimate relationship between two adults, with scenes implying sexual tension and private encounters."
	},
	"index": 0,
	"messageHash": "670c8e64abb77be04fc4d592c9f665ec2d9669191c560496f9b00e6b792bb9b0",
	"inScope": true,
	"additionalFields": {
		"score": 0.82,
		"reason": "Contains adult themes and implied sexual situations",
		"categories": ["romance", "suggestive"],
		"isExplicit": false
	}
}
```

### Family-Friendly Content

```json
{
	"passed": true,
	"reason": "Content is appropriate for all audiences",
	"guardId": "adult-content",
	"guardName": "Adult Content Guard",
	"message": {
		"role": "user",
		"content": "This is a family-friendly movie review"
	},
	"index": 0,
	"messageHash": "854a9bfe14f20371a7d4329bfd5bf14bf3b00eca9ec477eb6150fb8a9c072e2f",
	"inScope": true,
	"additionalFields": {
		"score": 0.01,
		"reason": "Content is appropriate for all audiences"
	}
}
```

## Types of Adult Content Detected

### Explicit Sexual Content

- Direct sexual descriptions
- Explicit sexual language

### Suggestive Content

- Sexual implications and innuendo
- Romantic tension with sexual undertones
- Suggestive scenarios

### Adult Themes

- Mature content not suitable for children
- Adult relationship dynamics
- Sexual situations without explicit detail

### NSFW Material

- Content inappropriate for workplace
- Material requiring content warnings
- Age-restricted content

## Basic Configuration

### Choose Appropriate Thresholds

```typescript
// For children's applications
const childSafeGuard = adultContentGuard({
	threshold: 0.3, // Very sensitive
	llm: llm,
})

// For general audiences
const generalGuard = adultContentGuard({
	threshold: 0.7, // Moderate sensitivity
	llm: llm,
})

// For adult platforms (filter only explicit content)
const adultPlatformGuard = adultContentGuard({
	threshold: 0.9, // Low sensitivity
	llm: llm,
})
```

### Handle Results

```typescript
const results = await guard(messages)

results.forEach((result) => {
	if (!result.passed) {
		console.log('Adult content detected:', {
			score: result.additionalFields.score,
			categories: result.additionalFields.categories,
			isExplicit: result.additionalFields.isExplicit,
			reason: result.additionalFields.reason,
		})
	}
})
```

## Troubleshooting

### High False Positive Rate

**Problem:** Non-adult content being flagged

**Solution:** Increase threshold value

```typescript
const relaxedGuard = adultContentGuard({
	threshold: 0.9, // Higher threshold = less sensitive
	llm: llm,
})
```

### Low Detection Rate

**Problem:** Adult content getting through

**Solution:** Lower threshold value

```typescript
const sensitiveGuard = adultContentGuard({
	threshold: 0.6, // Lower threshold = more sensitive
	llm: llm,
})
```

## Related Guards

- [**Toxic Guard**](toxic.md) - Filters harmful content
- [**Hate Speech Guard**](hate-speech.md) - Blocks discriminatory language
- [**Profanity Guard**](profanity.md) - Filters inappropriate language
