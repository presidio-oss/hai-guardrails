# GuardrailsEngine

The GuardrailsEngine is the core orchestrator that manages and executes multiple guards sequentially, providing protection for your LLM applications.

## Overview

The GuardrailsEngine:

- **Executes** guards sequentially in the order they are provided
- **Modifies** messages in-place as each guard processes them
- **Aggregates** results from all guards
- **Continues** processing even if individual guards encounter errors

## Key Types

### LLMMessage

```typescript
interface LLMMessage {
	role: string // 'user', 'assistant', 'system', etc.
	content: string // The message content
	id?: string // Optional message identifier
}
```

### SelectionType

```typescript
enum SelectionType {
	First = 'first', // Check only the first matching message
	NFirst = 'n-first', // Check the first N matching messages
	Last = 'last', // Check only the last matching message
	NLast = 'n-last', // Check the last N matching messages
	All = 'all', // Check all matching messages
}
```

### LogLevel

```typescript
type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
```

### MessageHashingAlgorithm

```typescript
enum MessageHashingAlgorithm {
	MD5 = 'md5',
	SHA1 = 'sha1',
	SHA256 = 'sha256',
	SHA512 = 'sha512',
}
```

## Basic Usage

### Simple Engine Setup

```typescript
import {
	GuardrailsEngine,
	injectionGuard,
	piiGuard,
	SelectionType,
} from '@presidio-dev/hai-guardrails'

// Create guards
const guards = [
	injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),
	piiGuard({ selection: SelectionType.All }),
]

// Create engine
const engine = new GuardrailsEngine({
	guards: guards,
})

// Run guards on messages
const messages = [{ role: 'user', content: 'Hello, my email is john@example.com' }]

const results = await engine.run(messages)
```

### Guard Configuration Note

Some guards accept two parameter objects, while others accept one:

- **Security guards** (injection, leakage) often take two: `(selectionOptions, guardSpecificOptions)`
- **Privacy guards** (PII, secret) typically take one combined options object

See individual guard documentation for specific parameters.

### LLM Provider Setup

```typescript
import { ChatOpenAI } from '@langchain/openai'

// Option 1: Using LangChain provider
const llmProvider = new ChatOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	modelName: 'gpt-4',
})

// Option 2: Using custom provider function
const customLLMProvider = async (messages: LLMMessage[]): Promise<LLMMessage[]> => {
	// Your custom LLM implementation
	const response = await callYourLLM(messages)
	return response
}

// Pass to engine or individual guards
const engine = new GuardrailsEngine({
	guards: [toxicGuard({ threshold: 0.8, llm: llmProvider })],
	llm: llmProvider, // Optional: provides default LLM for all guards
})
```

### Comprehensive Protection

```typescript
import {
	GuardrailsEngine,
	injectionGuard,
	leakageGuard,
	piiGuard,
	secretGuard,
	toxicGuard,
	SelectionType,
} from '@presidio-dev/hai-guardrails'

// Create comprehensive protection
const engine = new GuardrailsEngine({
	guards: [
		// Security guards
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),
		leakageGuard({ roles: ['user'] }, { mode: 'pattern', threshold: 0.6 }),

		// Privacy guards
		piiGuard({ selection: SelectionType.All, mode: 'redact' }),
		secretGuard({ selection: SelectionType.All, mode: 'redact' }),

		// Content safety
		toxicGuard({ threshold: 0.8, llm: yourLLMProvider }),
	],
})
```

## Configuration Options

### Engine Options

```typescript
interface GuardrailsChainOptions {
	guards: Guard[] // Array of guard functions (required)
	llm?: LLM // Optional LLM provider
	enabled?: boolean // Whether engine is enabled (default: true)
	logLevel?: LogLevel // Logging level
	messageHashingAlgorithm?: MessageHahsingAlgorithm // Hash algorithm (default: SHA256)
}
```

### Configuration Example

```typescript
const engine = new GuardrailsEngine({
	guards: [
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),
		piiGuard({ selection: SelectionType.All }),
	],
	enabled: true,
	logLevel: 'info',
	messageHashingAlgorithm: MessageHahsingAlgorithm.SHA256,
})
```

## Engine Control Methods

### Enable/Disable Engine

```typescript
// Check if engine is enabled
if (engine.isEnabled) {
	console.log('Engine is active')
}

// Disable the engine
engine.disable()

// Re-enable the engine
engine.enable()
```

### Logging Control

```typescript
// Set log level
engine.setLogLevel('debug')

// Get current log level
const level = engine.getLogLevel()
```

## Engine Results

The engine returns two main pieces of information:

1. **`messages`**: The final processed messages after all guards have run
2. **`messagesWithGuardResult`**: Detailed results from each guard, grouped by guard

### Result Structure

```typescript
interface GuardrailsEngineResult {
	// Final messages after all guards have processed them
	messages: LLMMessage[]

	// Detailed results grouped by guard (not by message)
	messagesWithGuardResult: {
		guardId: string // Unique identifier for the guard
		guardName: string // Human-readable name of the guard
		messages: {
			// Results for each message processed by this guard
			passed: boolean // Whether the message passed this guard's check
			reason?: string // Explanation of the guard's decision
			modifiedMessage?: LLMMessage // If guard modified the message, the new version
			message: LLMMessage // The original message before this guard
			index: number // Position of this message in the input array
			messageHash?: string // Hash of the message for tracking
			inScope: boolean // Whether this message was checked by this guard
			additionalFields?: Record<string, unknown> // Guard-specific extra data
		}[]
	}[]
}
```

### Understanding the Results

When you run the engine, the results tell you:

- What the final messages look like after all modifications
- How each guard processed each message
- Whether any guards blocked or modified messages
- Why each guard made its decision

### Understanding the "passed" Field

The `passed` field can be confusing because its meaning depends on the guard's mode:

- **Block mode**: `passed: false` means the guard detected an issue and blocked the message
- **Redact mode**: `passed: true` means the guard allowed the message to continue (even if modified)
- **Detection only**: `passed: true/false` indicates whether the content meets the guard's criteria

```typescript
// PII Guard in redact mode
piiGuard({ mode: 'redact' })  // Returns passed: true but modifies content

// PII Guard in block mode
piiGuard({ mode: 'block' })   // Returns passed: false if PII detected

// Example results
{
  "passed": true,    // Message allowed to continue
  "reason": "Input contains possible PII",
  "modifiedMessage": { // But content was modified
    "content": "Hello, my email is [REDACTED-EMAIL]"
  }
}
```

### Example Result

```json
{
	// Final messages after all guards have run
	"messages": [
		{
			"role": "user",
			"content": "Hello, my email is [REDACTED-EMAIL]" // PII was redacted
		}
	],

	// Detailed results from each guard
	"messagesWithGuardResult": [
		{
			"guardId": "injection",
			"guardName": "Injection Guard",
			"messages": [
				{
					"passed": true, // Message passed injection check
					"reason": "No injection detected",
					"message": {
						"role": "user",
						"content": "Hello, my email is john@example.com" // Original message
					},
					"index": 0,
					"inScope": true, // This guard checked this message
					"messageHash": "abc123..."
				}
			]
		},
		{
			"guardId": "pii",
			"guardName": "PII Guard",
			"messages": [
				{
					"passed": true, // Guard allowed message (in redact mode)
					"reason": "Input contains possible PII",
					"modifiedMessage": {
						"role": "user",
						"content": "Hello, my email is [REDACTED-EMAIL]" // Modified version
					},
					"message": {
						"role": "user",
						"content": "Hello, my email is john@example.com" // Before modification
					},
					"index": 0,
					"inScope": true,
					"messageHash": "abc123..."
				}
			]
		}
	]
}
```

### Working with Results

```typescript
const results = await engine.run(messages)

// Use the final processed messages
const finalMessages = results.messages

// Check if any guard blocked a message
const hasBlockedMessages = results.messagesWithGuardResult.some(({ messages }) =>
	messages.some((result) => !result.passed)
)

// Find which guards modified messages
const modifyingGuards = results.messagesWithGuardResult.filter(({ messages }) =>
	messages.some((result) => result.modifiedMessage)
)

// Get all PII guard results
const piiResults = results.messagesWithGuardResult.find((result) => result.guardId === 'pii')
```

## Guard Execution

### Sequential Processing

Guards are always executed sequentially in the order they are provided. Each guard sees the potentially modified messages from the previous guard.

```typescript
const engine = new GuardrailsEngine({
	guards: [
		// First guard runs on original messages
		piiGuard({ selection: SelectionType.All }),

		// Second guard sees messages potentially modified by piiGuard
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),

		// Third guard sees messages potentially modified by both previous guards
		toxicGuard({ threshold: 0.8, llm: llmProvider }),
	],
})
```

### Message Modification Flow

1. Original messages are passed to the first guard
2. If a guard modifies a message, subsequent guards see the modified version
3. Final messages in the result reflect all modifications

```typescript
// Original message
const messages = [
	{ role: 'user', content: 'My email is john@example.com and my password is secret123' },
]

// After running through guards
// PII Guard modifies: "My email is [REDACTED-EMAIL] and my password is secret123"
// Secret Guard modifies: "My email is [REDACTED-EMAIL] and my password is [REDACTED]"
```

## Handling Blocked Messages

When a guard blocks a message (`passed: false`), you need to decide how to handle it in your application:

```typescript
const results = await engine.run(messages)

// Check if any messages were blocked
const blockedGuards = results.messagesWithGuardResult
	.filter(({ messages }) => messages.some((m) => !m.passed))
	.map(({ guardId, guardName, messages }) => ({
		guardId,
		guardName,
		reasons: messages.filter((m) => !m.passed).map((m) => m.reason),
	}))

if (blockedGuards.length > 0) {
	// Option 1: Throw an error
	throw new Error(`Message blocked by guards: ${JSON.stringify(blockedGuards)}`)

	// Option 2: Return error response
	return {
		success: false,
		error: 'Message contains prohibited content',
		details: blockedGuards,
	}

	// Option 3: Log and continue with modified messages
	console.warn('Guards blocked content:', blockedGuards)
	// Use results.messages which may have redacted content
}
```

## Error Handling

The engine continues processing even if individual guards encounter errors. Guards that fail will not modify messages, and the engine will proceed to the next guard.

```typescript
const results = await engine.run(messages)

// Check for guard errors in results
results.messagesWithGuardResult.forEach(({ guardId, guardName, messages }) => {
	messages.forEach((result) => {
		if (result.additionalFields?.error) {
			console.warn(`Guard ${guardName} encountered an error:`, result.additionalFields.error)
		}
	})
})
```

### Guard Failures vs Blocked Messages

- **Guard failure**: Technical error (e.g., LLM timeout, invalid configuration)
- **Blocked message**: Guard successfully detected prohibited content

```typescript
// Distinguish between failures and blocks
const failures = []
const blocks = []

results.messagesWithGuardResult.forEach(({ guardId, guardName, messages }) => {
	messages.forEach((result) => {
		if (result.additionalFields?.error) {
			failures.push({ guardId, error: result.additionalFields.error })
		} else if (!result.passed) {
			blocks.push({ guardId, reason: result.reason })
		}
	})
})
```

## Performance Considerations

### Guard Ordering

Since guards execute sequentially, consider ordering them by:

1. **Performance**: Place faster guards (regex-based) before slower ones (LLM-based)
2. **Priority**: Place critical security guards before content moderation guards
3. **Dependencies**: If one guard's output affects another, order them appropriately

```typescript
const optimizedEngine = new GuardrailsEngine({
	guards: [
		// Fast pattern-based guards first
		piiGuard({ selection: SelectionType.All }), // Regex-based
		secretGuard({ selection: SelectionType.All }), // Pattern + entropy
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic' }), // Keyword matching

		// Slower LLM-based guards last
		toxicGuard({ threshold: 0.8, llm: llmProvider }), // LLM analysis
		hateSpeechGuard({ threshold: 0.9, llm: llmProvider }), // LLM analysis
	],
})
```

### Selective Guard Application

You can create different engines for different contexts:

```typescript
// Engine for user-generated content
const userContentEngine = new GuardrailsEngine({
	guards: [
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),
		piiGuard({ selection: SelectionType.All }),
		toxicGuard({ threshold: 0.8, llm: llmProvider }),
	],
})

// Engine for system messages (less strict)
const systemEngine = new GuardrailsEngine({
	guards: [secretGuard({ selection: SelectionType.All })],
})

// Choose engine based on context
const engine = isUserContent ? userContentEngine : systemEngine
const results = await engine.run(messages)
```

## Common Questions

### When to Enable/Disable the Engine?

Use cases for disabling:

- **Development/Testing**: Temporarily bypass guards during development
- **Admin Override**: Allow trusted users to bypass guards
- **Performance Testing**: Measure performance without guard overhead

```typescript
// Development mode
const engine = new GuardrailsEngine({
  guards: [...],
  enabled: process.env.NODE_ENV === 'production'
})

// Feature flag
if (user.isAdmin && skipGuardrails) {
  engine.disable()
}
```

### What is Message Hashing For?

Message hashing helps with:

- **Tracking**: Identify messages across guard executions
- **Debugging**: Trace guard results back to original messages

```typescript
// Using different hash algorithms based on needs
const engine = new GuardrailsEngine({
  guards: [...],
  // MD5 is faster but less secure
  messageHashingAlgorithm: MessageHashingAlgorithm.MD5,
  // SHA256 is more secure but slower (default)
  // messageHashingAlgorithm: MessageHashingAlgorithm.SHA256
})
```

### Understanding "inScope"

The `inScope` field indicates whether a guard actually checked a message:

```typescript
// Guard configured to only check user messages
const guard = injectionGuard({ roles: ['user'] })[
	// Results for mixed messages
	({ role: 'user', content: '...', inScope: true }, // Checked
	{ role: 'assistant', content: '...', inScope: false }, // Skipped
	{ role: 'system', content: '...', inScope: false }) // Skipped
]
```

### Guard Parameter Reference

Common parameters across guards:

- `selection`: Which messages to check (SelectionType)
- `roles`: Which message roles to check (['user', 'assistant', etc.])
- `n`: Number of messages for NFirst/NLast selection
- `threshold`: Confidence threshold (0-1) for detection
- `mode`: Guard behavior ('block', 'redact', 'heuristic', 'pattern')
- `llm`: LLM provider for AI-based analysis

See individual guard documentation for specific parameters.

## Best Practices

1. **Order Guards by Performance**: Place fast guards before slow ones
2. **Consider Guard Dependencies**: Some guards may depend on unmodified content
3. **Handle Errors Gracefully**: Check for errors in guard results
4. **Use Appropriate Selection**: Configure guards to check only relevant messages
5. **Provide LLM for LLM-based Guards**: Ensure LLM is available when needed
6. **Test Guard Combinations**: Validate that guards work well together
7. **Monitor Performance**: Track execution times for optimization
8. **Handle Blocked Messages Properly**: Provide clear error messages to users
9. **Log Guard Activity**: Monitor which guards are blocking/modifying content

## Next Steps

- Learn about [LangChain Integration](langchain.md) for framework-specific usage
- Explore [BYOP](bring-your-own-provider.md) for custom LLM providers
- Check out [individual guard documentation](../guards/) for detailed configuration
