# Bias Detection Guard

The Bias Detection Guard identifies and flags biased language, stereotypes, and unfair generalizations in text inputs.

## What is Bias?

Bias includes unfair prejudices, stereotypes, and discriminatory language that can harm or exclude certain groups:

- **Stereotypes** - Oversimplified generalizations about groups of people
- **Prejudice** - Preconceived opinions not based on reason or experience
- **Discrimination** - Unfair treatment based on group membership
- **Microaggressions** - Subtle, often unconscious biased comments
- **Systemic Bias** - Institutional or structural unfairness

**Examples of Biased Content:**

```
"Older employees often struggle with new technology"
"Women are naturally better at nurturing roles"
"People from that region are generally less educated"
```

## How the Bias Detection Guard Works

The Bias Detection Guard uses language model analysis to:

1. Analyze message content for biased language and stereotypes
2. Score the bias level (0-1 scale)
3. Categorize bias types (age, gender, racial, cultural, etc.)
4. Identify affected groups and potential impact
5. Block or allow messages based on bias score
6. Provide explanations and recommendations

> **Note:** The Bias Detection Guard requires an LLM provider for analysis and by default only evaluates the last message. To evaluate all messages, set `selection: SelectionType.All`.

## Usage

### Basic Usage

```typescript
import { biasDetectionGuard } from '@presidio-dev/hai-guardrails'
import { ChatOpenAI } from '@langchain/openai'

// Initialize LLM provider
const llm = new ChatOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	model: 'gpt-4',
})

// Create bias detection guard
const guard = biasDetectionGuard({
	threshold: 0.7,
	llm: llm,
})

const messages = [{ role: 'user', content: 'Older employees often struggle with new technology.' }]

const results = await guard(messages)
console.log(results[0].passed) // false - bias detected
console.log(results[0].additionalFields.score) // 0.85
```

### Role-Specific Filtering

```typescript
// Only check user messages
const userOnlyGuard = biasDetectionGuard({
	roles: ['user'],
	threshold: 0.7,
	llm: llm,
})

// Only check assistant responses
const assistantOnlyGuard = biasDetectionGuard({
	roles: ['assistant'],
	threshold: 0.8,
	llm: llm,
})
```

### Check All Messages

```typescript
import { SelectionType } from '@presidio-dev/hai-guardrails'

// Analyze all messages in conversation
const comprehensiveGuard = biasDetectionGuard({
	selection: SelectionType.All,
	threshold: 0.7,
	llm: llm,
})
```

### With GuardrailsEngine

```typescript
import { GuardrailsEngine, biasDetectionGuard } from '@presidio-dev/hai-guardrails'

const engine = new GuardrailsEngine({
	guards: [biasDetectionGuard({ threshold: 0.7, llm: llm })],
})

const results = await engine.run(messages)
```

## Configuration Options

### Guard Options

```typescript
interface BiasDetectionGuardOptions {
	threshold: number // Bias threshold (0-1, required)
	roles?: string[] // Message roles to check
	selection?: SelectionType // Which messages to analyze (default: Last)
	llm?: LLMProvider // LLM provider (required)
	messageHashingAlgorithm?: string // Hashing algorithm
}
```

### Threshold Guidelines

| Threshold | Sensitivity | Use Case                       |
| --------- | ----------- | ------------------------------ |
| 0.9-1.0   | Very Low    | Only explicit bias             |
| 0.7-0.9   | Low         | Professional environments      |
| 0.5-0.7   | Medium      | General applications           |
| 0.3-0.5   | High        | Educational platforms          |
| 0.0-0.3   | Very High   | Diversity-focused applications |

## Example Results

### Age Bias Detected

```json
{
	"passed": false,
	"reason": "Makes a sweeping generalization about older workers and technology",
	"guardId": "bias-detection",
	"guardName": "Bias Detection Guard",
	"message": {
		"role": "user",
		"content": "Older employees often struggle with new technology."
	},
	"index": 0,
	"messageHash": "bd14a218712c80e65f64585165be7281e56af93866a2bc158c1a2a792c2d4636",
	"inScope": true,
	"additionalFields": {
		"score": 0.85,
		"reason": "Makes a sweeping generalization about older workers and technology",
		"categories": ["age", "technological"],
		"affectedGroups": ["older employees"],
		"impact": "medium"
	}
}
```

### Gender Bias Detected

```json
{
	"passed": false,
	"reason": "Reinforces gender stereotypes about caregiving abilities",
	"guardId": "bias-detection",
	"guardName": "Bias Detection Guard",
	"message": {
		"role": "user",
		"content": "Women are naturally better at nurturing roles."
	},
	"index": 0,
	"messageHash": "c8fdef37485c42e7b69726f79023406087dbbd53659ad2abfb9e7ce9a4a6de3c",
	"inScope": true,
	"additionalFields": {
		"score": 0.9,
		"reason": "Reinforces gender stereotypes about caregiving abilities",
		"categories": ["gender"],
		"affectedGroups": ["women"],
		"impact": "high"
	}
}
```

## Types of Bias Detected

### Age Bias

- Stereotypes about older or younger workers
- Assumptions about technological abilities
- Generational generalizations

### Gender Bias

- Stereotypes about gender roles
- Assumptions about capabilities
- Exclusionary language

### Racial/Ethnic Bias

- Stereotypes about racial groups
- Cultural assumptions
- Discriminatory generalizations

### Socioeconomic Bias

- Class-based assumptions
- Educational stereotypes
- Economic generalizations

### Geographic Bias

- Regional stereotypes
- Urban vs. rural assumptions
- National generalizations

### Ability Bias

- Assumptions about disabilities
- Mental health stereotypes
- Physical capability generalizations

## Basic Configuration

### Choose Context-Appropriate Thresholds

```typescript
// For HR and recruitment platforms
const hrGuard = biasDetectionGuard({
	threshold: 0.5, // High sensitivity for hiring decisions
	llm: llm,
})

// For educational content
const educationGuard = biasDetectionGuard({
	threshold: 0.6, // Moderate sensitivity for learning
	llm: llm,
})

// For general business communication
const businessGuard = biasDetectionGuard({
	threshold: 0.7, // Balanced approach
	llm: llm,
})
```

### Handle Results

```typescript
const results = await guard(messages)

results.forEach((result) => {
	if (!result.passed) {
		console.log('Bias detected:', {
			score: result.additionalFields.score,
			categories: result.additionalFields.categories,
			affectedGroups: result.additionalFields.affectedGroups,
			impact: result.additionalFields.impact,
			reason: result.additionalFields.reason,
		})
	}
})
```

## Troubleshooting

### High False Positive Rate

**Problem:** Non-biased content being flagged

**Solution:** Increase threshold value

```typescript
const relaxedGuard = biasDetectionGuard({
	threshold: 0.9, // Higher threshold = less sensitive
	llm: llm,
})
```

### Missing Subtle Bias

**Problem:** Subtle bias not being detected

**Solution:** Lower threshold value

```typescript
const sensitiveGuard = biasDetectionGuard({
	threshold: 0.4, // Lower threshold = more sensitive
	llm: llm,
})
```

## Related Guards

- [**Hate Speech Guard**](hate-speech.md) - Blocks discriminatory language
- [**Toxic Guard**](toxic.md) - Filters harmful content
- [**Adult Content Guard**](adult-content.md) - Blocks inappropriate content
