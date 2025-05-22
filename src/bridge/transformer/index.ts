import type { LLMMessage } from '@hai-guardrails/types'

/**
 * Abstract class for transforming messages from a specific bridge type to and from LLM messages.
 *
 * Subclasses must implement the following methods:
 * - `toLLMMessages()`: Converts the internal bridge message to an array of LLM messages.
 * - `applyLLMUpdates(llmMessages)`: Applies the updates in the given LLM messages to the internal bridge message.
 * - `toBaseMessages()`: Converts the internal bridge message to the base bridge message type.
 */
export abstract class GuardrailsMessageTransformer<BridgeMessageType> {
	/**
	 * Converts the internal bridge message to an array of LLM messages.
	 *
	 * @returns {LLMMessage[]} An array of LLM messages.
	 */
	abstract toLLMMessages(): LLMMessage[]
	/**
	 * Applies the updates in the given LLM messages to the internal bridge message.
	 *
	 * @param {LLMMessage[]} llmMessages - The LLM messages to apply to the internal bridge message.
	 * @returns {BridgeMessageType} The updated internal bridge message.
	 */
	abstract applyLLMUpdates(llmMessages: LLMMessage[]): BridgeMessageType
	/**
	 * Converts the internal bridge message to the base bridge message type.
	 *
	 * @returns {BridgeMessageType} The base bridge message.
	 */
	abstract toBaseMessages(): BridgeMessageType
}
