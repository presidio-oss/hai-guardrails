# Hate Speech Guard

The Hate Speech Guard detects and blocks hate speech, discriminatory language, and content that promotes hostility or violence against individuals or groups based on protected characteristics.

## What is Hate Speech?

Hate speech includes language that attacks, threatens, or incites violence against individuals or groups based on protected characteristics:

- **Racial/Ethnic Hatred** - Discriminatory language based on race or ethnicity
- **Religious Intolerance** - Attacks on religious beliefs or communities
- **Xenophobia** - Hostility toward foreigners or immigrants
- **Homophobia/Transphobia** - Discrimination against LGBTQ+ individuals
- **Ableism** - Discrimination against people with disabilities
- **Misogyny/Misandry** - Gender-based hatred or discrimination

**Examples of Hate Speech:**

```
"People from that country are all criminals and should be deported"
"That religion is responsible for all problems in this country"
"People with disabilities are a burden on society"
```

## How the Hate Speech Guard Works

The Hate Speech Guard uses language model analysis to:

1. Analyze message content for discriminatory language and hate speech
2. Score the hate speech level (0-1 scale)
3. Categorize hate speech types (xenophobic, religious, ableist, etc.)
4. Identify targeted groups and potential harm
5. Block or allow messages based on hate speech score
6. Provide explanations and context

> **Note:** The Hate Speech Guard requires an LLM provider for analysis and by default only evaluates the last message. To evaluate all messages, set `selection: SelectionType.All`.

## Usage

### Basic Usage

```typescript
import { hateSpeechGuard } from '@presidio-dev/hai-guardrails'
import { ChatOpenAI } from '@langchain/openai'

// Initialize LLM provider
const llm = new ChatOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	model: 'gpt-4',
})

// Create hate speech guard
const guard = hateSpeechGuard({
	threshold: 0.8,
	llm: llm,
})

const messages = [{ role: 'user', content: 'People from that country are all criminals.' }]

const results = await guard(messages)
console.log(results[0].passed) // false - hate speech detected
console.log(results[0].additionalFields.score) // 0.9
```

### Role-Specific Filtering

```typescript
// Only check user messages
const userOnlyGuard = hateSpeechGuard({
	roles: ['user'],
	threshold: 0.8,
	llm: llm,
})

// Only check assistant responses
const assistantOnlyGuard = hateSpeechGuard({
	roles: ['assistant'],
	threshold: 0.9,
	llm: llm,
})
```

### Check All Messages

```typescript
import { SelectionType } from '@presidio-dev/hai-guardrails'

// Analyze all messages in conversation
const comprehensiveGuard = hateSpeechGuard({
	selection: SelectionType.All,
	threshold: 0.8,
	llm: llm,
})
```

### With GuardrailsEngine

```typescript
import { GuardrailsEngine, hateSpeechGuard } from '@presidio-dev/hai-guardrails'

const engine = new GuardrailsEngine({
	guards: [hateSpeechGuard({ threshold: 0.8, llm: llm })],
})

const results = await engine.run(messages)
```

## Configuration Options

### Guard Options

```typescript
interface HateSpeechGuardOptions {
	threshold: number // Hate speech threshold (0-1, required)
	roles?: string[] // Message roles to check
	selection?: SelectionType // Which messages to analyze (default: Last)
	llm?: LLMProvider // LLM provider (required)
	messageHashingAlgorithm?: string // Hashing algorithm
}
```

### Threshold Guidelines

| Threshold | Sensitivity | Use Case                    |
| --------- | ----------- | --------------------------- |
| 0.9-1.0   | Very Low    | Only explicit hate speech   |
| 0.8-0.9   | Low         | Professional environments   |
| 0.6-0.8   | Medium      | General applications        |
| 0.4-0.6   | High        | Educational platforms       |
| 0.0-0.4   | Very High   | Zero-tolerance environments |

## Example Results

### Xenophobic Hate Speech

```json
{
	"passed": false,
	"reason": "Makes a sweeping generalization and advocates for deportation based on national origin.",
	"guardId": "hate-speech",
	"guardName": "Hate Speech Guard",
	"message": {
		"role": "user",
		"content": "People from that country are all criminals and should be deported."
	},
	"index": 0,
	"messageHash": "405b66f1e0698eaa9247013037982cdc3018ee33584062e23e4710119b5380e0",
	"inScope": true,
	"additionalFields": {
		"score": 0.9,
		"reason": "Makes a sweeping generalization and advocates for deportation based on national origin.",
		"categories": ["xenophobic"],
		"targetedGroups": ["people from that country"]
	}
}
```

### Religious Hate Speech

```json
{
	"passed": false,
	"reason": "Blames a religious group for all problems in a country",
	"guardId": "hate-speech",
	"guardName": "Hate Speech Guard",
	"message": {
		"role": "user",
		"content": "That religion is responsible for all the problems in this country."
	},
	"index": 0,
	"messageHash": "ff306b3a9b355883edb135c8f96290afe918fbf50f618e74903b6f5f748aab37",
	"inScope": true,
	"additionalFields": {
		"score": 0.85,
		"reason": "Blames a religious group for all problems in a country",
		"categories": ["religious"],
		"targetedGroups": ["specific religious group"]
	}
}
```

### Positive/Respectful Content

```json
{
	"passed": true,
	"reason": "Statement of respect, no hate speech detected",
	"guardId": "hate-speech",
	"guardName": "Hate Speech Guard",
	"message": {
		"role": "user",
		"content": "I respect all people regardless of their background or beliefs."
	},
	"index": 0,
	"messageHash": "ef9f5ba7022e5d6307c86fe05a38afa5cba471765129cdc198d9589fcde7dfec",
	"inScope": true,
	"additionalFields": {
		"score": 0.01,
		"reason": "Statement of respect, no hate speech detected"
	}
}
```

## Types of Hate Speech Detected

### Racial/Ethnic Hatred

- Slurs and derogatory terms
- Stereotyping based on race/ethnicity
- Calls for violence or exclusion

### Religious Intolerance

- Attacks on religious beliefs
- Stereotyping religious groups
- Promoting religious discrimination

### Xenophobia

- Hostility toward immigrants
- National origin discrimination
- Anti-foreigner sentiment

### LGBTQ+ Discrimination

- Homophobic or transphobic language
- Denial of LGBTQ+ rights
- Promoting conversion therapy

### Ableism

- Discrimination against disabilities
- Dehumanizing language
- Promoting exclusion

### Gender-Based Hatred

- Misogynistic or misandrist content
- Gender-based violence promotion
- Extreme gender stereotyping

## Basic Configuration

### Set Appropriate Thresholds by Context

```typescript
// For social media platforms
const socialGuard = hateSpeechGuard({
	threshold: 0.7, // Moderate sensitivity
	llm: llm,
})

// For educational environments
const educationGuard = hateSpeechGuard({
	threshold: 0.5, // High sensitivity for learning spaces
	llm: llm,
})

// For professional platforms
const professionalGuard = hateSpeechGuard({
	threshold: 0.8, // Balanced for workplace
	llm: llm,
})
```

### Handle Results

```typescript
const results = await guard(messages)

results.forEach((result) => {
	if (!result.passed) {
		console.log('Hate speech detected:', {
			score: result.additionalFields.score,
			categories: result.additionalFields.categories,
			targetedGroups: result.additionalFields.targetedGroups,
			reason: result.additionalFields.reason,
		})
	}
})
```

## Troubleshooting

### High False Positive Rate

**Problem:** Non-hate speech content being flagged

**Solution:** Increase threshold value

```typescript
const relaxedGuard = hateSpeechGuard({
	threshold: 0.9, // Higher threshold = less sensitive
	llm: llm,
})
```

### Missing Subtle Hate Speech

**Problem:** Coded or subtle hate speech not being detected

**Solution:** Lower threshold value

```typescript
const sensitiveGuard = hateSpeechGuard({
	threshold: 0.6, // Lower threshold = more sensitive
	llm: llm,
})
```

## Related Guards

- [**Bias Detection Guard**](bias-detection.md) - Identifies unfair generalizations
- [**Toxic Guard**](toxic.md) - Filters harmful content
- [**Adult Content Guard**](adult-content.md) - Blocks inappropriate content
