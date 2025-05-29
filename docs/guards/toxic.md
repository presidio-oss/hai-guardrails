# Toxic Guard

The Toxic Guard detects and filters toxic language in text inputs, helping maintain a safe and respectful environment in your LLM applications.

## What is Toxic Content?

Toxic content includes language that is harmful, offensive, or creates a hostile environment:

- **Personal Attacks** - Direct insults and name-calling
- **Harassment** - Intimidating or threatening language
- **Hostility** - Aggressive or dismissive communication
- **Demeaning Language** - Content that belittles or degrades others
- **Inflammatory Content** - Language designed to provoke or upset
- **Cyberbullying** - Online harassment or intimidation

**Examples of Toxic Content:**

```
"You're such a loser, seriously."
"Get lost, no one wants you here."
"You're so pathetic, it's painful to watch."
```

## How the Toxic Guard Works

The Toxic Guard uses language model analysis to:

1. Analyze message content for toxic patterns
2. Score the toxicity level (0-1 scale)
3. Compare against configurable thresholds
4. Block or allow messages based on toxicity score
5. Provide explanations for decisions

> **Note:** The Toxic Guard requires an LLM provider for analysis and by default only evaluates the last message. To evaluate all messages, set `selection: SelectionType.All`.

## Usage

### Basic Usage

```typescript
import { toxicGuard } from '@presidio-dev/hai-guardrails'
import { ChatOpenAI } from '@langchain/openai'

// Initialize LLM provider
const llm = new ChatOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	model: 'gpt-4',
})

// Create toxic guard
const guard = toxicGuard({
	threshold: 0.8,
	llm: llm,
})

const messages = [{ role: 'user', content: "You're such a loser, seriously." }]

const results = await guard(messages)
console.log(results[0].passed) // false - toxic content detected
console.log(results[0].additionalFields.score) // 0.85
```

### Role-Specific Filtering

```typescript
// Only check user messages
const userOnlyGuard = toxicGuard({
	roles: ['user'],
	threshold: 0.8,
	llm: llm,
})

// Only check assistant responses
const assistantOnlyGuard = toxicGuard({
	roles: ['assistant'],
	threshold: 0.9,
	llm: llm,
})
```

### Check All Messages

```typescript
import { SelectionType } from '@presidio-dev/hai-guardrails'

// Analyze all messages in conversation
const comprehensiveGuard = toxicGuard({
	selection: SelectionType.All,
	threshold: 0.8,
	llm: llm,
})
```

### With GuardrailsEngine

```typescript
import { GuardrailsEngine, toxicGuard } from '@presidio-dev/hai-guardrails'

const engine = new GuardrailsEngine({
	guards: [toxicGuard({ threshold: 0.8, llm: llm })],
})

const results = await engine.run(messages)
```

## Configuration Options

### Guard Options

```typescript
interface ToxicGuardOptions {
	threshold: number // Toxicity threshold (0-1, required)
	roles?: string[] // Message roles to check
	selection?: SelectionType // Which messages to analyze (default: Last)
	llm?: LLMProvider // LLM provider (required)
	messageHashingAlgorithm?: string // Hashing algorithm
}
```

### Threshold Guidelines

| Threshold | Sensitivity | Use Case                  |
| --------- | ----------- | ------------------------- |
| 0.9-1.0   | Very Low    | Only extreme toxicity     |
| 0.8-0.9   | Low         | Professional environments |
| 0.6-0.8   | Medium      | General applications      |
| 0.4-0.6   | High        | Family-friendly platforms |
| 0.0-0.4   | Very High   | Children's applications   |

## Example Results

### Toxic Content Detected

```json
{
	"passed": false,
	"reason": "The statement contains a direct insult ('loser') indicating a personal attack.",
	"guardId": "toxic",
	"guardName": "Toxic Guard",
	"message": {
		"role": "user",
		"content": "You're such a loser, seriously."
	},
	"index": 0,
	"messageHash": "55ea80c1152496280e4fb5dd5a7d3010ba1c3e1c1b4c034b5f13545eda2f51eb",
	"inScope": true,
	"additionalFields": {
		"score": 0.85,
		"reason": "The statement contains a direct insult ('loser') indicating a personal attack."
	}
}
```

### Non-Toxic Content

```json
{
	"passed": true,
	"reason": "The statement expresses disagreement politely and respectfully.",
	"guardId": "toxic",
	"guardName": "Toxic Guard",
	"message": {
		"role": "user",
		"content": "I disagree with your point, but I respect your opinion."
	},
	"index": 0,
	"messageHash": "125c18a6a0422fcc01bb65ef968d996b9a5c12e38505fff361d1d8cce4e97c38",
	"inScope": true,
	"additionalFields": {
		"score": 0.03,
		"reason": "The statement expresses disagreement politely and respectfully."
	}
}
```

## Types of Toxicity Detected

### Personal Attacks

- Direct insults and name-calling
- Character assassination
- Personal degradation

**Examples:**

- "You're such an idiot"
- "What a complete failure"
- "You're worthless"

### Harassment

- Intimidating language
- Threatening behavior
- Persistent negative targeting

**Examples:**

- "I'm going to make your life miserable"
- "You better watch out"
- "Nobody likes you anyway"

### Hostility

- Aggressive communication
- Dismissive language
- Confrontational tone

**Examples:**

- "Get lost, no one wants you here"
- "Shut up and go away"
- "You don't belong here"

### Demeaning Language

- Belittling comments
- Condescending remarks
- Degrading statements

**Examples:**

- "You're so pathetic"
- "That's the dumbest thing I've ever heard"
- "You clearly don't understand anything"

## Basic Configuration

### Choose Appropriate Thresholds

```typescript
// For professional environments
const professionalGuard = toxicGuard({
	threshold: 0.8, // Lower tolerance for toxicity
	llm: llm,
})

// For casual communities
const casualGuard = toxicGuard({
	threshold: 0.6, // Moderate tolerance
	llm: llm,
})

// For family-friendly platforms
const familyGuard = toxicGuard({
	threshold: 0.4, // High sensitivity
	llm: llm,
})
```

### Handle Results

```typescript
const results = await guard(messages)

results.forEach((result) => {
	if (!result.passed) {
		console.log('Toxic content detected:', {
			score: result.additionalFields.score,
			reason: result.additionalFields.reason,
			content: result.message.content.substring(0, 50) + '...', // Log partial content
		})
	}
})
```

## Troubleshooting

### High False Positive Rate

**Problem:** Non-toxic content being flagged

**Solution:** Increase threshold value

```typescript
const relaxedGuard = toxicGuard({
	threshold: 0.9, // Higher threshold = less sensitive
	llm: llm,
})
```

### Low Detection Rate

**Problem:** Toxic content getting through

**Solution:** Lower threshold value

```typescript
const sensitiveGuard = toxicGuard({
	threshold: 0.6, // Lower threshold = more sensitive
	llm: llm,
})
```

## Related Guards

- [**Hate Speech Guard**](hate-speech.md) - Blocks discriminatory language
- [**Profanity Guard**](profanity.md) - Filters inappropriate language
- [**Bias Detection Guard**](bias-detection.md) - Identifies unfair generalizations
