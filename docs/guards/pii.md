# PII Guard

The PII Guard detects and protects personally identifiable information (PII) in messages, helping you comply with privacy regulations and protect user data.

## What is PII?

Personally Identifiable Information (PII) includes any data that can identify a specific individual:

- **Email addresses** (john@example.com)
- **Phone numbers** (555-123-4567)
- **Social Security Numbers** (123-45-6789)
- **Credit card numbers** (4111-1111-1111-1111)
- **IP addresses** (192.168.1.1)
- **Driver's license numbers**
- **Passport numbers**
- **Bank account numbers**

## How the PII Guard Works

The PII Guard uses regular expressions to:

1. Detect PII patterns in message content
2. Classify the type of PII found
3. Redact or block messages based on configuration
4. Provide information about detected PII

## Usage

### Basic Usage (Redact Mode)

```typescript
import { piiGuard, SelectionType } from '@presidio-dev/hai-guardrails'

// Default behavior: redact PII but allow message to pass
const guard = piiGuard({
	selection: SelectionType.All,
})

const messages = [
	{
		role: 'user',
		content: 'My email is john.doe@example.com and phone is 555-123-4567',
	},
]

const results = await guard(messages)
console.log(results[0].modifiedMessage.content)
// Output: "My email is [REDACTED-EMAIL] and phone is [REDACTED-PHONE]"
```

### Block Mode

```typescript
// Block messages containing PII entirely
const blockingGuard = piiGuard({
	selection: SelectionType.All,
	mode: 'block',
})

const results = await blockingGuard(messages)
console.log(results[0].passed) // false - message blocked
```

### Role-Specific Protection

```typescript
// Only check user messages
const userOnlyGuard = piiGuard({
	roles: ['user'],
})

// Only check assistant responses
const assistantOnlyGuard = piiGuard({
	roles: ['assistant'],
})
```

### With GuardrailsEngine

```typescript
import { GuardrailsEngine, piiGuard } from '@presidio-dev/hai-guardrails'

const engine = new GuardrailsEngine({
	guards: [piiGuard({ selection: SelectionType.All })],
})

const results = await engine.run(messages)
// Access sanitized messages
const cleanMessages = results.messages
```

## Configuration Options

### Guard Options

```typescript
interface PIIGuardOptions {
	selection: SelectionType // Which messages to check (required)
	roles?: string[] // Message roles to check
	mode?: 'redact' | 'block' // How to handle PII (default: 'redact')
	messageHashingAlgorithm?: string // Hashing algorithm
}
```

### Mode Comparison

| Mode     | Behavior                                          | Use Case                                      |
| -------- | ------------------------------------------------- | --------------------------------------------- |
| `redact` | Replace PII with redaction markers, allow message | Content filtering, data sanitization          |
| `block`  | Block entire message containing PII               | Strict compliance, high-security environments |

## Detected PII Types

### Email Addresses

**Pattern:** Various email formats
**Redaction:** `[REDACTED-EMAIL]`

```typescript
// Detected patterns:
'john@example.com'
'user.name+tag@domain.co.uk'
'test123@sub.domain.org'
```

### Phone Numbers

**Pattern:** US and international formats
**Redaction:** `[REDACTED-PHONE]`

```typescript
// Detected patterns:
'555-123-4567'
'(555) 123-4567'
'+1-555-123-4567'
'555.123.4567'
```

### Social Security Numbers

**Pattern:** XXX-XX-XXXX format
**Redaction:** `[REDACTED-SSN]`

```typescript
// Detected patterns:
'123-45-6789'
'123 45 6789'
'123456789'
```

### Credit Card Numbers

**Pattern:** Major card formats (Visa, MasterCard, etc.)
**Redaction:** `[REDACTED-CREDIT-CARD]`

```typescript
// Detected patterns:
'4111-1111-1111-1111' // Visa
'5555-5555-5555-4444' // MasterCard
'3782-822463-10005' // American Express
```

### IP Addresses

**Pattern:** IPv4 and IPv6
**Redaction:** `[REDACTED-IP]`

```typescript
// Detected patterns:
'192.168.1.1' // IPv4
'2001:0db8:85a3::1' // IPv6
```

### Driver's License Numbers

**Pattern:** Various state formats
**Redaction:** `[REDACTED-DRIVER-LICENSE]`

### Bank Account Numbers

**Pattern:** Common account number formats
**Redaction:** `[REDACTED-BANK-ACCOUNT]`

## Example Results

### Redact Mode Result

```json
{
	"guardId": "pii",
	"guardName": "PII Guard",
	"message": {
		"role": "user",
		"content": "Contact me at john@example.com or 555-123-4567"
	},
	"index": 0,
	"passed": true,
	"reason": "Input contains possible PII",
	"inScope": true,
	"messageHash": "...",
	"modifiedMessage": {
		"role": "user",
		"content": "Contact me at [REDACTED-EMAIL] or [REDACTED-PHONE]"
	},
	"additionalFields": {
		"detectedPII": [
			{
				"type": "email",
				"value": "john@example.com",
				"start": 14,
				"end": 30
			},
			{
				"type": "phone",
				"value": "555-123-4567",
				"start": 34,
				"end": 46
			}
		]
	}
}
```

### Block Mode Result

```json
{
	"guardId": "pii",
	"guardName": "PII Guard",
	"message": {
		"role": "user",
		"content": "My SSN is 123-45-6789"
	},
	"index": 0,
	"passed": false,
	"reason": "Input contains possible PII",
	"inScope": true,
	"messageHash": "...",
	"additionalFields": {
		"detectedPII": [
			{
				"type": "ssn",
				"value": "123-45-6789",
				"start": 10,
				"end": 21
			}
		],
		"mode": "block"
	}
}
```

## Basic Configuration

### Choose Appropriate Mode

```typescript
// For user-facing applications (less disruptive)
const userFriendlyGuard = piiGuard({
	selection: SelectionType.All,
	mode: 'redact',
})

// For compliance-critical applications
const strictGuard = piiGuard({
	selection: SelectionType.All,
	mode: 'block',
})
```

### Handle Results

```typescript
const results = await guard(messages)

results.forEach((result) => {
	if (result.modifiedMessage) {
		// Use the sanitized message
		console.log('Sanitized:', result.modifiedMessage.content)

		// Log detected PII for audit
		if (result.additionalFields?.detectedPII) {
			console.log(
				'Detected PII types:',
				result.additionalFields.detectedPII.map((pii) => pii.type)
			)
		}
	}
})
```

## Troubleshooting

### False Positives

**Problem:** Non-PII content being flagged

**Solutions:**

1. Review detected patterns in `additionalFields.detectedPII`
2. Implement custom validation logic
3. Use allowlists for known safe patterns

### False Negatives

**Problem:** PII not being detected

**Solutions:**

1. Check if PII format matches expected patterns
2. Update to latest version for improved detection
3. Report new patterns to the maintainers

## Related Guards

- [**Secret Guard**](secret.md) - Protects API keys and credentials
- [**Injection Guard**](injection.md) - Prevents prompt injection
- [**Leakage Guard**](leakage.md) - Blocks information extraction
