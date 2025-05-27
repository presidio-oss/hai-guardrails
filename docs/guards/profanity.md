# Profanity Guard

The Profanity Guard detects and filters profane, vulgar, or offensive language in text inputs, helping maintain appropriate communication standards in your applications.

## What is Profanity?

Profanity includes various forms of inappropriate language:

- **Explicit profanity** - Direct use of curse words and vulgar language
- **Masked profanity** - Censored versions using asterisks or symbols (f**_, s_**)
- **Creative spelling** - Intentional misspellings to bypass filters (fuk, sh1t)
- **Euphemisms** - Mild substitutes that still convey offensive meaning
- **Context-dependent language** - Words that become offensive in certain contexts

## How the Profanity Guard Works

The Profanity Guard uses language model analysis to:

1. Analyze text content for profane or vulgar language
2. Detect various forms of profanity including masked and creative spellings
3. Evaluate context to distinguish between offensive and non-offensive usage
4. Score the severity and likelihood of profanity
5. Block content that exceeds the configured threshold

## Usage

### Basic Usage

```typescript
import { profanityGuard } from '@presidio-dev/hai-guardrails'
import { ChatOpenAI } from '@langchain/openai'

// Setup LLM provider
const llm = new ChatOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	model: 'gpt-4',
})

// Create profanity guard
const guard = profanityGuard({
	threshold: 0.8,
	llm: llm,
})

const messages = [
	{
		role: 'user',
		content: 'This is a f***ing disaster!',
	},
]

const results = await guard(messages)
console.log(results[0].passed) // false - profanity detected
```

### With Custom Threshold

```typescript
// More sensitive detection
const strictGuard = profanityGuard({
	threshold: 0.6, // Lower threshold = more sensitive
	llm: llm,
})

// Less sensitive detection
const relaxedGuard = profanityGuard({
	threshold: 0.9, // Higher threshold = less sensitive
	llm: llm,
})
```

### Role-Specific Filtering

```typescript
// Only check user inputs
const userOnlyGuard = profanityGuard({
	roles: ['user'],
	threshold: 0.8,
	llm: llm,
})

// Only check assistant responses
const assistantOnlyGuard = profanityGuard({
	roles: ['assistant'],
	threshold: 0.8,
	llm: llm,
})
```

### With GuardrailsEngine

```typescript
import { GuardrailsEngine, profanityGuard } from '@presidio-dev/hai-guardrails'

const engine = new GuardrailsEngine({
	guards: [
		profanityGuard({
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
interface ProfanityGuardOptions {
	threshold: number // Detection threshold (0-1)
	roles?: string[] // Message roles to check
	selection?: SelectionType // Which messages to analyze
	llm?: LLMProvider // Custom LLM provider (required)
	messageHashingAlgorithm?: string // Hashing algorithm
}
```

### Threshold Guidelines

| Threshold | Sensitivity | Use Case                                    |
| --------- | ----------- | ------------------------------------------- |
| 0.9-1.0   | Low         | Adult-oriented platforms, minimal filtering |
| 0.7-0.9   | Medium      | General social platforms, balanced approach |
| 0.5-0.7   | High        | Family-friendly platforms, strict filtering |
| 0.3-0.5   | Very High   | Children's platforms, maximum protection    |

## Example Results

### Profanity Detected

```json
{
	"guardId": "profanity",
	"guardName": "Profanity Guard",
	"message": {
		"role": "user",
		"content": "This is a f***ing disaster!"
	},
	"index": 0,
	"passed": false,
	"reason": "Contains a masked profanity",
	"inScope": true,
	"messageHash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
	"additionalFields": {
		"score": 0.95,
		"reason": "Contains a masked profanity",
		"flaggedWords": ["f***ing"],
		"severity": "moderate"
	}
}
```

### Clean Content

```json
{
	"guardId": "profanity",
	"guardName": "Profanity Guard",
	"message": {
		"role": "user",
		"content": "This is a wonderful day!"
	},
	"index": 0,
	"passed": true,
	"reason": "No profanity detected",
	"inScope": true,
	"messageHash": "b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0a1",
	"additionalFields": {
		"score": 0.01,
		"reason": "No profanity detected"
	}
}
```

## Detection Categories

### Explicit Profanity

- **Direct curse words**: Unfiltered profane language
- **Vulgar expressions**: Sexually explicit or crude language
- **Offensive slurs**: Derogatory terms targeting groups

### Masked Profanity

- **Asterisk censoring**: f**_, s_**, d\*\*\*
- **Symbol substitution**: f@#k, sh!t, b!tch
- **Partial censoring**: f**k, sh\*t, a**hole

### Creative Evasion

- **Intentional misspellings**: fuk, shyt, biatch
- **Leetspeak**: f4ck, sh1t, b1tch
- **Spacing tricks**: f u c k, s h i t

### Context-Dependent

- **Mild profanity**: damn, hell, crap (context matters)
- **Euphemisms**: fudge, shoot, darn (usually acceptable)
- **Technical terms**: May be flagged incorrectly in certain contexts

## Basic Configuration

### Choose Context-Appropriate Thresholds

```typescript
// For children's platforms
const kidsAppGuard = profanityGuard({
	threshold: 0.4, // Very strict
	llm: llm,
})

// For adult social platforms
const socialAppGuard = profanityGuard({
	threshold: 0.8, // Moderate
	llm: llm,
})

// For professional environments
const workplaceGuard = profanityGuard({
	threshold: 0.6, // Strict but reasonable
	llm: llm,
})
```

### Handle Results

```typescript
const results = await guard(messages)

results.forEach((result) => {
	if (!result.passed) {
		const severity = result.additionalFields?.severity
		const flaggedWords = result.additionalFields?.flaggedWords

		console.log('Profanity detected:', {
			content: result.message.content,
			severity: severity,
			flaggedWords: flaggedWords,
			score: result.additionalFields?.score,
		})
	}
})
```

## Troubleshooting

### High False Positive Rate

**Problem:** Legitimate words being flagged as profanity

**Solution:** Increase threshold value

```typescript
const relaxedGuard = profanityGuard({
	threshold: 0.9, // Less sensitive
	llm: llm,
})
```

### Low Detection Rate

**Problem:** Obvious profanity not being caught

**Solution:** Lower threshold value

```typescript
const strictGuard = profanityGuard({
	threshold: 0.6, // More sensitive
	llm: llm,
})
```

## Related Guards

- [**Toxic Guard**](toxic.md) - Filters harmful content
- [**Hate Speech Guard**](hate-speech.md) - Blocks discriminatory language
- [**Adult Content Guard**](adult-content.md) - Filters NSFW content
