import { GuardrailsMessageTransformer } from '@hai-guardrails/bridge/transformer'
import type { LLMMessages } from '@hai-guardrails/types'
import type {
	LLMMessageEntry,
	ILangChainBaseLanguageModelInput,
} from '@hai-guardrails/bridge/transformer/langchain/types'
import { LangChainToLLMMessageAdapter } from '@hai-guardrails/bridge/transformer/langchain/langchain-adapter'
import { LLMMessageToLangChainAdapter } from '@hai-guardrails/bridge/transformer/langchain/llmmessage-adapter'
import { LangChainMessageHelper } from '@hai-guardrails/bridge/transformer/langchain/helper'
import { match } from 'ts-pattern'

/**
 * A transformer for converting LangChain messages to and from LLM messages.
 *
 * The transformer takes a LangChain message as input and produces an array of LLM messages
 * that can be processed by the LLM. The transformer also takes an array of modified LLM
 * messages and produces a single LangChain message that can be processed by the LangChain.
 *
 * The transformer uses the LangChainToLLMMessageAdapter to convert the LangChain message
 * to an array of LLMMessageEntries. The transformer then filters out any LLMMessageEntries
 * that do not have an associated LLM message or that are not LLM messages. The transformer
 * then sorts the remaining LLMMessageEntries by ID and maps them to LLM messages with
 * the ID as the message ID.
 *
 * The transformer also uses the LLMMessageToLangChainAdapter to convert the modified LLM
 * messages back to a single LangChain message. The transformer takes the modified LLM
 * messages and updates the LLMMessageEntries in the transformer's internal state. The
 * transformer then uses the LLMMessageToLangChainAdapter to convert the internal state
 * back to a single LangChain message.
 */
export class LangChainLLMMessageTransformer extends GuardrailsMessageTransformer<ILangChainBaseLanguageModelInput> {
	/**
	 * The internal state of the transformer. This is a map of message IDs to
	 * LLMMessageEntries. The LLMMessageEntries are used to keep track of the
	 * messages that have been converted to LLM messages and to allow the
	 * transformer to update the internal state when the LLM messages are
	 * modified.
	 */
	private llmMessages: Map<string, LLMMessageEntry>
	/**
	 * The initial LangChain message input that is to be transformed.
	 */
	private baseMessage: ILangChainBaseLanguageModelInput

	/**
	 * The constructor for the LangChainLLMMessageTransformer.
	 *
	 * @param {ILangChainBaseLanguageModelInput} baseMessage - The initial LangChain message input that is to be transformed.
	 */
	constructor(baseMessage: ILangChainBaseLanguageModelInput) {
		super()
		this.baseMessage = baseMessage
		this.llmMessages = LangChainToLLMMessageAdapter.fromBaseLanguageModelInput(
			baseMessage
		).reduce((map, entry) => map.set(entry.id, entry), new Map<string, LLMMessageEntry>())
	}

	/**
	 * Converts the internal map of LLMMessageEntries to an array of LLMMessages.
	 *
	 * The function retrieves all LLMMessageEntries, sorts them by ID, filters out
	 * those without an associated LLM message or that are non-LLM messages, and maps
	 * the remaining entries to LLMMessages while preserving their IDs.
	 *
	 * @returns {LLMMessages} An array of LLMMessages sorted by ID.
	 */
	toLLMMessages(): LLMMessages {
		return Array.from(this.llmMessages.values())
			.sort((a, b) => a.id.localeCompare(b.id, undefined, { sensitivity: 'base' }))
			.filter((msg) => !!msg.llmMessage && !msg.isNonLLMMessage && msg.llmMessage !== undefined)
			.map(({ llmMessage, id }) => Object.assign(llmMessage!, { id }))
	}

	/**
	 * Applies the updates in modifiedLLMMessages to the internal state of the transformer.
	 *
	 * The function iterates over the modifiedLLMMessages, and for each one, it updates the
	 * corresponding LLMMessageEntry in the internal map. It then returns the updated
	 * LangChain message input via the toBaseMessages method.
	 *
	 * @param {LLMMessages} modifiedLLMMessages - The LLMMessages to apply to the internal state.
	 * @returns {ILangChainBaseLanguageModelInput} The updated LangChain message input.
	 */
	applyLLMUpdates(modifiedLLMMessages: LLMMessages): ILangChainBaseLanguageModelInput {
		for (const { id, content } of modifiedLLMMessages) {
			if (!id || !content) continue

			const entry = this.llmMessages.get(id)
			if (!entry?.llmMessage) continue

			const updatedMessage = {
				...entry.llmMessage,
				content,
			}

			this.llmMessages.set(id, {
				...entry,
				llmMessage: updatedMessage,
			})
		}
		return this.toBaseMessages()
	}

	/**
	 * Converts the internal map of LLMMessageEntries to a LangChain message input.
	 *
	 * The function uses the LangChainMessageValidator to determine the type of the internal
	 * baseMessage and calls the appropriate conversion method from
	 * LLMMessageToLangChainAdapter to convert the LLMMessageEntries to a LangChain message
	 * input.
	 *
	 * @returns {ILangChainBaseLanguageModelInput} The LangChain message input.
	 */
	toBaseMessages(): ILangChainBaseLanguageModelInput {
		this.baseMessage = match(this.baseMessage)
			.when(LangChainMessageHelper.isString, (msg) =>
				LLMMessageToLangChainAdapter.toString(this.llmMessages, msg)
			)
			.when(LangChainMessageHelper.isBaseMessageLike, (msg) =>
				LLMMessageToLangChainAdapter.toMessageLike(this.llmMessages, msg)
			)
			.when(LangChainMessageHelper.isBasePromptValueInterface, (msg) =>
				LLMMessageToLangChainAdapter.toPromptValueInterface(this.llmMessages, msg)
			)
			.otherwise((msg) => msg)
		return this.baseMessage
	}
}
