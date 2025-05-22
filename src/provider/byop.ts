import type { LLMMessage } from '@hai-guardrails/types'

/**
 * Abstract base class for creating custom LLM (Large Language Model) providers.
 *
 * This class serves as a foundation for implementing custom language model providers
 * that can be integrated into the HAI Guardrails system. It defines the standard
 * interface that all custom providers must implement.
 *
 * @example
 * ```typescript
 * class MyCustomProvider extends BringYourOwnProvider {
 *   async invoke(messages: LLMMessage[]): Promise<LLMMessage[]> {
 *     // Your custom implementation here
 *     const response = await myCustomLLM(messages);
 *     return [...messages, response];
 *   }
 * }
 * ```
 *
 * @see {@link LLMMessage} for the message format used in the conversation
 */
export abstract class BringYourOwnProvider {
	/**
	 * Processes an array of messages and returns the model's response.
	 *
	 * @param messages - An array of message objects representing the conversation history.
	 *                  Each message should be in the format specified by {@link LLMMessage}.
	 * @returns A promise that resolves to an array of message objects, typically including
	 *          the model's response appended to the input messages.
	 * @throws May throw an error if the provider encounters any issues during processing.
	 */
	abstract invoke(messages: LLMMessage[]): Promise<LLMMessage[]>
}
