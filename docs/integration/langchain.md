# LangChain Integration

hai-guardrails provides integration with LangChain.js, allowing you to add security and safety guardrails to your LangChain chat models.

## Overview

The `LangChainChatGuardrails` wrapper transforms any LangChain chat model into a guarded version that automatically applies your configured guardrails before the `invoke()` method calls.

**Important:** By default, only the `invoke()` method is protected. Other methods like `stream()` and `batch()` will bypass guardrails unless you provide a custom handler.

## Installation

Make sure you have both hai-guardrails and LangChain installed:

```bash
npm install @presidio-dev/hai-guardrails @langchain/core
```

For specific LLM providers:

```bash
# OpenAI
npm install @langchain/openai

# Google Gemini
npm install @langchain/google-genai

# Anthropic Claude
npm install @langchain/anthropic
```

## Basic Usage

### Simple Integration

```typescript
import { ChatOpenAI } from '@langchain/openai'
import {
	LangChainChatGuardrails,
	GuardrailsEngine,
	injectionGuard,
	SelectionType,
} from '@presidio-dev/hai-guardrails'

// 1. Create your base LangChain model
const baseModel = new ChatOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	model: 'gpt-4',
	temperature: 0.7,
})

// 2. Create guardrails engine
const engine = new GuardrailsEngine({
	guards: [injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 })],
})

// 3. Wrap your model with guardrails
const guardedModel = LangChainChatGuardrails(baseModel, engine)

// 4. Use invoke() - this is protected by guardrails
const response = await guardedModel.invoke([
	{ role: 'user', content: 'Hello, how can you help me?' },
])

console.log(response.content)
```

### Comprehensive Protection

```typescript
import {
	injectionGuard,
	leakageGuard,
	piiGuard,
	secretGuard,
	toxicGuard,
	SelectionType,
} from '@presidio-dev/hai-guardrails'

// Create comprehensive guardrails
const comprehensiveEngine = new GuardrailsEngine({
	guards: [
		// Security guards
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),
		leakageGuard({ roles: ['user'] }, { mode: 'pattern', threshold: 0.6 }),

		// Privacy guards
		piiGuard({ selection: SelectionType.All, mode: 'redact' }),
		secretGuard({ selection: SelectionType.All, mode: 'redact' }),

		// Content safety (requires LLM provider)
		toxicGuard({ threshold: 0.8, llm: baseModel }),
	],
})

const fullyGuardedModel = LangChainChatGuardrails(baseModel, comprehensiveEngine)
```

## How It Works

The `LangChainChatGuardrails` function creates a proxy around your LangChain model that:

1. Intercepts calls to the `invoke()` method
2. Converts LangChain messages to the guardrails format
3. Runs the messages through your configured guards
4. Applies any message modifications (e.g., PII redaction)
5. Passes the processed messages to the original model

**Note:** If the GuardrailsEngine is disabled (via `engine.disable()`), the proxy will pass through to the original methods without applying guardrails.

## Handling Blocked Messages

When guards detect issues, the behavior depends on the guard configuration:

- **Redact mode**: Messages are modified (e.g., PII removed) and passed through
- **Block mode**: The specific behavior depends on your implementation

Currently, the library doesn't throw a specific error type when guards block messages. You'll need to check the engine results to determine if messages were blocked.

```typescript
// Example: Manual checking for blocked messages
const engine = new GuardrailsEngine({
	guards: [
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),
		piiGuard({ selection: SelectionType.All, mode: 'block' }), // Block mode
	],
})

const guardedModel = LangChainChatGuardrails(baseModel, engine)

try {
	const response = await guardedModel.invoke(messages)
	// Check if response is empty or handle accordingly
	if (!response.content) {
		console.warn('Message may have been blocked')
	}
} catch (error) {
	console.error('Error during invocation:', error)
}
```

## Advanced Usage

### Custom Handler for Additional Methods

By default, only `invoke()` is protected. To protect other methods, provide a custom handler:

```typescript
const customHandler = {
	// Protect invoke (already done by default)
	async invoke(originalFn, target, thisArg, args, guardrailsEngine) {
		// Custom logic here
		const [input, options] = args
		// Apply guardrails and call original
		// ...
	},

	// Add protection for stream() - NOT implemented by default
	async stream(originalFn, target, thisArg, args, guardrailsEngine) {
		// You would need to implement streaming protection
		console.warn('Streaming is not protected by guardrails')
		return originalFn.call(thisArg, ...args)
	},
}

const guardedModel = LangChainChatGuardrails(baseModel, engine, customHandler)
```

### Disabling Guardrails

You can temporarily disable guardrails:

```typescript
const guardedModel = LangChainChatGuardrails(baseModel, engine)

// Disable guardrails
engine.disable()

// This call will bypass guardrails
await guardedModel.invoke(messages)

// Re-enable guardrails
engine.enable()
```

## Integration Patterns

### Chat Application

```typescript
import express from 'express'
import { ChatOpenAI } from '@langchain/openai'
import {
	LangChainChatGuardrails,
	GuardrailsEngine,
	injectionGuard,
	piiGuard,
	SelectionType,
} from '@presidio-dev/hai-guardrails'

const app = express()
app.use(express.json())

// Setup guarded model
const baseModel = new ChatOpenAI({ model: 'gpt-4' })
const engine = new GuardrailsEngine({
	guards: [
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),
		piiGuard({ selection: SelectionType.All, mode: 'redact' }),
	],
})
const guardedModel = LangChainChatGuardrails(baseModel, engine)

app.post('/chat', async (req, res) => {
	try {
		const { messages } = req.body

		// Run through guardrails first to check for blocks
		const guardResults = await engine.run(messages)

		// Check if any guards blocked the message
		const hasBlocked = guardResults.messagesWithGuardResult.some(({ messages }) =>
			messages.some((m) => !m.passed)
		)

		if (hasBlocked) {
			return res.status(400).json({
				success: false,
				error: 'Message blocked by security filters',
			})
		}

		// Invoke with guarded model
		const response = await guardedModel.invoke(guardResults.messages)

		res.json({
			success: true,
			response: response.content,
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			error: 'Internal server error',
		})
	}
})

app.listen(3000, () => {
	console.log('Guarded chat server running on port 3000')
})
```

### RAG (Retrieval-Augmented Generation)

```typescript
import { ChatOpenAI } from '@langchain/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RetrievalQAChain } from 'langchain/chains'

// Create guarded model
const guardedModel = LangChainChatGuardrails(new ChatOpenAI({ model: 'gpt-4' }), engine)

// Create RAG chain with guarded model
const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings())
const chain = RetrievalQAChain.fromLLM(guardedModel, vectorStore.asRetriever())

// Use RAG with guardrails on invoke() calls
const result = await chain.call({
	query: 'What is the company policy on data handling?',
})
```

## Configuration Examples

### Development Environment

```typescript
// Relaxed settings for development
const devEngine = new GuardrailsEngine({
	guards: [
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.8 }),
		piiGuard({ selection: SelectionType.All, mode: 'redact' }),
	],
	logLevel: 'debug', // Enable debug logging
})
```

### Production Environment

```typescript
// Strict settings for production
const prodEngine = new GuardrailsEngine({
	guards: [
		// Security guards
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.6 }),

		// Privacy protection
		piiGuard({ selection: SelectionType.All, mode: 'block' }),
		secretGuard({ selection: SelectionType.All, mode: 'block' }),

		// Content safety (requires LLM)
		toxicGuard({ roles: ['user'], threshold: 0.9, llm: baseModel }),
	],
	logLevel: 'warn', // Only warnings and errors
})
```

### Role-Specific Guards

```typescript
// Different guards for different scenarios
const customerServiceEngine = new GuardrailsEngine({
	guards: [
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),
		piiGuard({ roles: ['user'], mode: 'redact' }),
		toxicGuard({ roles: ['user'], threshold: 0.8, llm: baseModel }),
	],
})

const internalToolEngine = new GuardrailsEngine({
	guards: [
		injectionGuard({ roles: ['user'] }, { mode: 'pattern', threshold: 0.8 }),
		secretGuard({ selection: SelectionType.All, mode: 'block' }),
	],
})
```

## Performance Optimization

### Guard Ordering

Order guards by performance for better efficiency:

```typescript
const optimizedEngine = new GuardrailsEngine({
	guards: [
		// Fast pattern-based guards first
		piiGuard({ selection: SelectionType.All, mode: 'redact' }),
		secretGuard({ selection: SelectionType.All, mode: 'redact' }),

		// Slower heuristic guards
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),

		// Slowest LLM-based guards last
		toxicGuard({ roles: ['user'], threshold: 0.8, llm: baseModel }),
	],
})
```

### Selective Guard Application

Only apply guards to specific message roles:

```typescript
const selectiveEngine = new GuardrailsEngine({
	guards: [
		// Only check user messages for injection
		injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 }),

		// Check all messages for PII
		piiGuard({ selection: SelectionType.All, mode: 'redact' }),

		// Only check user messages for toxicity
		toxicGuard({ roles: ['user'], threshold: 0.8, llm: baseModel }),
	],
})
```

## Monitoring and Logging

### Enable Debug Logging

```typescript
const engine = new GuardrailsEngine({
	guards: [...],
	logLevel: 'debug', // See what's happening
})
```

### Track Guard Results

```typescript
// Manually check guard results
const messages = [{ role: 'user', content: 'Some message' }]
const results = await engine.run(messages)

// Log guard decisions
results.messagesWithGuardResult.forEach(({ guardId, guardName, messages }) => {
	messages.forEach((result) => {
		console.log(`${guardName}: passed=${result.passed}, reason=${result.reason}`)
	})
})
```

## Limitations

### Current Limitations

1. **Only `invoke()` is protected by default** - Methods like `stream()`, `batch()`, and others bypass guardrails
2. **No built-in error handling** - The library doesn't throw specific errors when guards block messages
3. **No streaming support** - Guardrails can't be applied to streaming responses
4. **Limited to chat models** - Only works with `BaseChatModel` instances

### Working Around Limitations

For methods other than `invoke()`, you can:

1. Run guardrails manually before calling the method
2. Implement a custom handler (advanced)
3. Use only the `invoke()` method when guardrails are critical

```typescript
// Manual guardrails for non-invoke methods
const messages = [{ role: 'user', content: 'Hello' }]

// Run guardrails manually
const guardResults = await engine.run(messages)

// Check for blocks
const hasBlocked = guardResults.messagesWithGuardResult.some(({ messages }) =>
	messages.some((m) => !m.passed)
)

if (!hasBlocked) {
	// Safe to use other methods
	const stream = await baseModel.stream(guardResults.messages)
	// ... handle stream
}
```

## Troubleshooting

### Guards Not Triggering

**Problem:** Guards don't seem to be applied

**Solutions:**

1. Ensure you're using `invoke()` method (only method protected by default)
2. Check if engine is enabled: `engine.isEnabled`
3. Verify guard configuration matches your messages

```typescript
// Debug guard execution
const results = await engine.run(messages)
console.log('Guard results:', JSON.stringify(results, null, 2))
```

### Performance Issues

**Problem:** Slow response times

**Solutions:**

1. Order guards by performance (fast to slow)
2. Use selective message targeting with `roles` parameter
3. Avoid LLM-based guards for high-throughput scenarios

## Best Practices

1. **Use `invoke()` for guarded calls** - It's the only method protected by default
2. **Check guard results** - Manually verify if messages were blocked when needed
3. **Order guards by performance** - Fast guards first, slow guards last
4. **Test your configuration** - Verify guards work as expected with your use case
5. **Monitor guard decisions** - Log results to understand what's being blocked/modified
6. **Handle edge cases** - Plan for when guards block or modify messages

## Next Steps

- Explore [Bring Your Own Provider](bring-your-own-provider.md) for custom LLM integration
- Learn about [GuardrailsEngine](guardrails-engine.md) configuration
- Check individual [guard documentation](../guards/) for specific configurations
- Check out the [complete LangChain example](../../examples/apps/langchain-chat/)
