# Secret Guard

The Secret Guard detects and protects secrets such as API keys, access tokens, credentials, and other sensitive authentication information in messages.

## What are Secrets?

Secrets include any sensitive authentication or authorization data that should be protected:

- **API Keys** (OpenAI, AWS, Google, etc.)
- **Access Tokens** (OAuth, JWT, Bearer tokens)
- **Service Account Tokens** (1Password, GitHub, etc.)
- **Database Connection Strings**
- **Private Keys** (SSH, SSL, PGP)
- **Passwords and Credentials**
- **Webhook URLs with tokens**
- **High-entropy strings** (potential secrets)

## How the Secret Guard Works

The Secret Guard uses pattern recognition and entropy analysis to:

1. Detect secret patterns using regex and entropy checks
2. Classify the type of secret found
3. Redact or block messages based on configuration
4. Provide information about detected secrets

## Usage

### Basic Usage (Redact Mode)

```typescript
import { secretGuard, SelectionType } from '@presidio-dev/hai-guardrails'

// Default behavior: redact secrets but allow message to pass
const guard = secretGuard({
	selection: SelectionType.All,
})

const messages = [
	{
		role: 'user',
		content: 'Here is my API key: sk-1234567890abcdef',
	},
]

const results = await guard(messages)
console.log(results[0].modifiedMessage.content)
// Output: "Here is my API key: [REDACTED-API-KEY]"
```

### Block Mode

```typescript
// Block messages containing secrets entirely
const blockingGuard = secretGuard({
	selection: SelectionType.All,
	mode: 'block',
})

const results = await blockingGuard(messages)
console.log(results[0].passed) // false - message blocked
```

### Role-Specific Protection

```typescript
// Only check user messages
const userOnlyGuard = secretGuard({
	roles: ['user'],
})

// Only check assistant responses
const assistantOnlyGuard = secretGuard({
	roles: ['assistant'],
})
```

### With GuardrailsEngine

```typescript
import { GuardrailsEngine, secretGuard } from '@presidio-dev/hai-guardrails'

const engine = new GuardrailsEngine({
	guards: [secretGuard({ selection: SelectionType.All })],
})

const results = await engine.run(messages)
// Access sanitized messages
const cleanMessages = results.messages
```

## Configuration Options

### Guard Options

```typescript
interface SecretGuardOptions {
	selection: SelectionType // Which messages to check (required)
	roles?: string[] // Message roles to check
	mode?: 'redact' | 'block' // How to handle secrets (default: 'redact')
	messageHashingAlgorithm?: string // Hashing algorithm
}
```

### Mode Comparison

| Mode     | Behavior                                              | Use Case                               |
| -------- | ----------------------------------------------------- | -------------------------------------- |
| `redact` | Replace secrets with redaction markers, allow message | Development, content filtering         |
| `block`  | Block entire message containing secrets               | Production, high-security environments |

## Detected Secret Types

### API Keys

**Pattern:** Various API key formats
**Redaction:** `[REDACTED-API-KEY]`

```typescript
// Detected patterns:
'sk-1234567890abcdef' // OpenAI
'AKIA1234567890ABCDEF' // AWS Access Key
'AIza1234567890abcdef' // Google API Key
'ghp_1234567890abcdef' // GitHub Personal Access Token
```

### Service Account Tokens

**Pattern:** Long encoded tokens
**Redaction:** `[REDACTED-SERVICE-TOKEN]`

```typescript
// Detected patterns:
'ops_eyJzaWduSW5BZGRyZXNzIjoi...' // 1Password Service Account
'xoxb-1234567890-abcdef...' // Slack Bot Token
```

### Database Connection Strings

**Pattern:** Connection string formats
**Redaction:** `[REDACTED-CONNECTION-STRING]`

```typescript
// Detected patterns:
'mongodb://user:pass@host:port/db'
'postgres://user:pass@host:port/db'
'mysql://user:pass@host:port/db'
```

### OAuth Tokens

**Pattern:** Bearer and OAuth token formats
**Redaction:** `[REDACTED-OAUTH-TOKEN]`

```typescript
// Detected patterns:
'Bearer eyJhbGciOiJIUzI1NiIs...'
'oauth_token=abcdef123456...'
```

### Private Keys

**Pattern:** PEM format keys
**Redaction:** `[REDACTED-PRIVATE-KEY]`

```typescript
// Detected patterns:
'-----BEGIN PRIVATE KEY-----'
'-----BEGIN RSA PRIVATE KEY-----'
'-----BEGIN OPENSSH PRIVATE KEY-----'
```

### High-Entropy Strings

**Pattern:** Strings with high randomness
**Redaction:** `[REDACTED-HIGH-ENTROPY]`

```typescript
// Detected patterns:
Long random strings that appear to be secrets based on entropy analysis
```

## Example Results

### Redact Mode Result

```json
{
	"guardId": "secret",
	"guardName": "Secret Guard",
	"message": {
		"role": "user",
		"content": "export OP_SERVICE_ACCOUNT_TOKEN=ops_eyJzaWduSW5BZGRyZXNzIjoi..."
	},
	"index": 0,
	"passed": true,
	"reason": "Input contains potential secrets",
	"inScope": true,
	"messageHash": "...",
	"modifiedMessage": {
		"role": "user",
		"content": "export OP_SERVICE_ACCOUNT_TOKEN=[REDACTED-1PASSWORD-TOKEN]"
	},
	"additionalFields": {
		"detectedSecrets": [
			{
				"type": "1password-token",
				"value": "ops_eyJzaWduSW5BZGRyZXNzIjoi...",
				"start": 32,
				"end": 1024,
				"confidence": 0.95
			}
		]
	}
}
```

### Block Mode Result

```json
{
	"guardId": "secret",
	"guardName": "Secret Guard",
	"message": {
		"role": "user",
		"content": "My API key is sk-1234567890abcdef"
	},
	"index": 0,
	"passed": false,
	"reason": "Input contains potential secrets",
	"inScope": true,
	"messageHash": "...",
	"additionalFields": {
		"detectedSecrets": [
			{
				"type": "openai-api-key",
				"value": "sk-1234567890abcdef",
				"start": 14,
				"end": 32,
				"confidence": 1.0
			}
		],
		"mode": "block"
	}
}
```

### Handle Results

```typescript
const results = await guard(messages)

results.forEach((result) => {
	if (result.modifiedMessage) {
		// Use the sanitized message
		console.log('Sanitized:', result.modifiedMessage.content)

		// Log detected secrets for audit (without values!)
		if (result.additionalFields?.detectedSecrets) {
			console.log(
				'Detected secret types:',
				result.additionalFields.detectedSecrets.map((secret) => secret.type)
			)
		}
	}
})
```

## Security Considerations

### Audit Logging

```typescript
// Always log secret detection for security audits
const guard = secretGuard({
	selection: SelectionType.All,
	mode: 'redact',
})

const results = await guard(messages)
results.forEach((result) => {
	if (result.additionalFields?.detectedSecrets) {
		console.warn('Secret detection event', {
			messageId: result.messageHash,
			secretTypes: result.additionalFields.detectedSecrets.map((s) => s.type),
			action: 'redacted',
			timestamp: new Date().toISOString(),
			// Never log the actual secret values!
		})
	}
})
```

## Troubleshooting

### False Positives

**Problem:** Non-secret content being flagged

**Solutions:**

1. Review detected patterns in `additionalFields.detectedSecrets`
2. Implement allowlists for known safe patterns
3. Check if content matches expected secret formats

### False Negatives

**Problem:** Actual secrets not being detected

**Solutions:**

1. Check if secret format matches expected patterns
2. Update to latest version for improved detection
3. Report new secret patterns to maintainers

## Related Guards

- [**PII Guard**](pii.md) - Protects personal information
- [**Injection Guard**](injection.md) - Prevents prompt injection
- [**Leakage Guard**](leakage.md) - Blocks information extraction
