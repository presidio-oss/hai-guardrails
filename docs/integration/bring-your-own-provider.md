# Bring Your Own Provider (BYOP)

hai-guardrails supports a flexible "Bring Your Own Provider" (BYOP) approach, allowing you to integrate any LLM provider with the guardrails system for language model-based detection.

## Overview

BYOP enables you to:

- Use any LLM provider (OpenAI, Anthropic, Google, local models, etc.)
- Maintain control over your LLM infrastructure
- Optimize costs by choosing the most suitable models
- Implement custom logic and error handling
- Support proprietary or specialized models

## LLM Provider Interface

All custom LLM providers must implement this simple interface:

```typescript
type LLMProvider = (messages: LLMMessage[]) => Promise<LLMMessage[]>

interface LLMMessage {
	role: string // 'system', 'user', 'assistant'
	content: string // Message content
}
```

### Key Requirements

1. **Input**: Array of `LLMMessage` objects
2. **Output**: Promise that resolves to array of `LLMMessage` objects
3. **Response Format**: Must append the LLM's response as a new message with `role: 'assistant'`
4. **Error Handling**: Should handle errors gracefully and return appropriate responses

## Basic Implementation

### OpenAI Example

```typescript
import OpenAI from 'openai'
import type { LLMMessage } from '@presidio-dev/hai-guardrails'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

const openaiProvider = async (messages: LLMMessage[]): Promise<LLMMessage[]> => {
	try {
		// Convert to OpenAI format
		const openaiMessages = messages.map((message) => ({
			role: message.role as 'system' | 'user' | 'assistant',
			content: message.content,
		}))

		// Call OpenAI API
		const response = await openai.chat.completions.create({
			model: 'gpt-4',
			messages: openaiMessages,
		})

		// Return original messages plus response
		return [
			...messages,
			{
				role: 'assistant',
				content: response.choices[0]?.message.content || '',
			},
		]
	} catch (error) {
		console.error('OpenAI provider error:', error)
		return [
			...messages,
			{
				role: 'assistant',
				content: '', // Empty response on error
			},
		]
	}
}
```

### Anthropic Example

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY,
})

const anthropicProvider = async (messages: LLMMessage[]): Promise<LLMMessage[]> => {
	try {
		// Convert to Anthropic format
		const systemMessage = messages.find((m) => m.role === 'system')?.content || ''
		const userMessages = messages
			.filter((m) => m.role !== 'system')
			.map((m) => ({
				role: m.role as 'user' | 'assistant',
				content: m.content,
			}))

		const response = await anthropic.messages.create({
			model: 'claude-3-sonnet-20240229',
			system: systemMessage,
			messages: userMessages,
			max_tokens: 1000,
		})

		return [
			...messages,
			{
				role: 'assistant',
				content: response.content[0]?.type === 'text' ? response.content[0].text : '',
			},
		]
	} catch (error) {
		console.error('Anthropic provider error:', error)
		return [
			...messages,
			{
				role: 'assistant',
				content: '',
			},
		]
	}
}
```

### Google Gemini Example

```typescript
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

const gemini = new ChatGoogleGenerativeAI({
	model: 'gemini-pro',
	apiKey: process.env.GOOGLE_API_KEY,
})

const geminiProvider = async (messages: LLMMessage[]): Promise<LLMMessage[]> => {
	try {
		// Convert to LangChain format
		const langchainMessages = messages.map((message) => ({
			role: message.role,
			content: message.content,
		}))

		const response = await gemini.invoke(langchainMessages)

		return [
			...messages,
			{
				role: 'assistant',
				content: response.content,
			},
		]
	} catch (error) {
		console.error('Gemini provider error:', error)
		return [
			...messages,
			{
				role: 'assistant',
				content: '',
			},
		]
	}
}
```

## Using BYOP with Guards

### Language Model Detection

```typescript
import { injectionGuard } from '@presidio-dev/hai-guardrails'

// Use your custom provider with language model detection
const guard = injectionGuard(
	{
		roles: ['user'],
		llm: openaiProvider, // Your custom provider
	},
	{
		mode: 'language-model',
		threshold: 0.7,
	}
)

const results = await guard(messages)
```

### Multiple Guards with Different Providers

```typescript
import { GuardrailsEngine, injectionGuard, toxicGuard } from '@presidio-dev/hai-guardrails'

const engine = new GuardrailsEngine({
	guards: [
		// Use OpenAI for injection detection
		injectionGuard(
			{ roles: ['user'], llm: openaiProvider },
			{ mode: 'language-model', threshold: 0.8 }
		),

		// Use Anthropic for toxicity detection
		toxicGuard({
			roles: ['user'],
			llm: anthropicProvider,
			threshold: 0.7,
		}),
	],
})
```

## Next Steps

- Explore [LangChain Integration](langchain.md) for pre-built provider support
- Learn about [GuardrailsEngine](guardrails-engine.md) for advanced configurations
- Check out [real-world examples](../../examples/) for implementation patterns
