import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import { Serializable } from '@langchain/core/load/serializable'
import { BaseMessage, type BaseMessageLike } from '@langchain/core/messages'
import type { LLMMessage } from '../types'

export function normalizeString(str: string): string {
	return str
		.toLowerCase()
		.replace(/[^\w\s]|_/g, '')
		.replace(/\s+/g, ' ')
		.trim()
}

export function normalizeInput(input: string | object): string {
	if (typeof input === 'string') {
		return input
	}
	try {
		return JSON.stringify(input, null, 2)
	} catch (error) {
		return String(input)
	}
}

/**
 * Converts LangChain BaseMessageLike array to simplified LLMMessages format
 * @param messages - Array of LangChain messages
 * @returns Array of LLMMessages with role and content
 */
export function convertToLLMMessages(messages: BaseLanguageModelInput): LLMMessage[] {
	if (messages instanceof Serializable) {
		messages = messages.toChatMessages()
	}
	if (typeof messages === 'string') {
		messages = [
			{
				role: 'human',
				content: messages,
			},
		]
	}
	return messages.map((message) => {
		// Handle string directly
		if (typeof message === 'string') {
			return { role: 'human', content: message }
		}

		// Handle BaseMessage instance
		if (message instanceof BaseMessage) {
			// Map LangChain message types to roles
			const role = message.getType() as string

			// Handle complex message content (arrays with text/images)
			let content: string
			if (typeof message.content === 'string') {
				content = message.content
			} else {
				// For complex content, extract text parts and join them
				content = message.content
					.filter((part) => part.type === 'text')
					.map((part) => (part as { text: string }).text)
					.join('\n')
			}

			return { role, content }
		}

		// Handle MessageFieldWithRole format (object with role property)
		if (typeof message === 'object' && 'role' in message) {
			const role = message.role as string
			let content: string

			if (typeof message.content === 'string') {
				content = message.content
			} else {
				// Similar handling for complex content
				content = message.content
					.filter((part) => part.type === 'text')
					.map((part) => (part as { text: string }).text)
					.join('\n')
			}

			return { role, content }
		}

		// Handle [type, content] tuple format
		if (Array.isArray(message) && message.length === 2) {
			return {
				role: message[0],
				content:
					typeof message[1] === 'string'
						? message[1]
						: message[1]
								.filter((part) => part.type === 'text')
								.map((part) => (part as { text: string }).text)
								.join('\n'),
			}
		}

		// Fallback
		return {
			role: 'user',
			content: typeof message === 'object' ? JSON.stringify(message) : String(message),
		}
	})
}

/**
 * Updates original LangChain messages with content from LLMMessages
 * @param originalMessages - Original BaseMessageLike array to update
 * @param llmMessages - LLMMessages with updated content
 * @returns Updated BaseMessageLike array
 */
export function updateMessagesFromLLMMessages(
	originalMessages: BaseLanguageModelInput,
	llmMessages: LLMMessage[]
): BaseLanguageModelInput {
	if (typeof originalMessages === 'string') {
		return llmMessages[0]!.content
	}

	if (originalMessages instanceof Serializable) {
		originalMessages = originalMessages.toChatMessages()
	}

	// Ensure the arrays have the same length
	if (Array.isArray(originalMessages) && originalMessages.length !== llmMessages.length) {
		throw new Error('Original messages and LLM messages must have the same length')
	}

	return originalMessages.map((original, index) => {
		const llmMessage = llmMessages[index]!

		// Handle BaseMessage instance
		if (original instanceof BaseMessage) {
			// original.content = llmMessage.content
			// return original
			// // Create a new instance with the same constructor but updated content
			const Constructor = original.constructor as new (fields: {
				content: string
				name?: string
				additional_kwargs?: Record<string, any>
			}) => BaseMessage

			return new Constructor({
				content: llmMessage.content,
				name: original.name,
				additional_kwargs: original.additional_kwargs,
			})
		}

		// Handle MessageFieldWithRole (object with role)
		if (typeof original === 'object' && 'role' in original) {
			return {
				...original,
				content: llmMessage.content,
			}
		}

		// Handle [type, content] tuple
		if (Array.isArray(original) && original.length === 2) {
			return [original[0], llmMessage.content]
		}

		// For string or other types, just return the updated content
		return llmMessage.content
	})
}
