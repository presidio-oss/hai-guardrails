import {
	BaseMessageLikeTypeEnum,
	type ILangChainBaseMessage,
	type ILangChainBaseMessageLike,
	type ILangChainBaseMessageTuple,
	type ILangChainBaseMessageWithType,
	type ILangChainBasePromptValueInterface,
	type ILangChainMessageContent,
	type ILangChainMessageContentComplex,
	type ILangChainMessageContentText,
	type ILangChainMessageFieldWithRole,
	type LLMMessageEntry,
} from '@hai-guardrails/bridge/transformer/langchain/types'
import { LangChainMessageHelper } from '@hai-guardrails/bridge/transformer/langchain/helper'
import { safeExecute } from '@hai-guardrails/utils/util'
import { match } from 'ts-pattern'

/**
 * Adapter class for converting LLM messages to LangChain message formats.
 *
 * This class provides static methods to transform various LLM message types into
 * their corresponding LangChain message formats. It maintains a mapping of message
 * entries and provides methods to handle different types of message content,
 * including simple strings, complex messages, and message-like objects.
 */
export class LLMMessageToLangChainAdapter {
	/**
	 * Looks up the given baseId in the llmMessageEntries map and returns the associated
	 * LLMMessageEntry if found. If the entry is not found, or if the LLMMessageEntry
	 * does not contain an llmMessage, the function returns the given base object instead.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {string} baseId - The baseId of the entry to look up.
	 * @param {T} base - The base object to return if the entry is not found.
	 * @returns {{ entry: LLMMessageEntry | undefined; base: T }}
	 */
	static getEntryOrReturnBase<T>(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		baseId: string,
		base: T
	): { entry: LLMMessageEntry | undefined; base: T } {
		const entry = llmMessageEntries.get(LangChainMessageHelper.generateMessageId(baseId))
		if (!entry || !entry.llmMessage) return { entry: undefined, base }
		return { entry, base }
	}

	/**
	 * Looks up the given baseId in the llmMessageEntries map and returns the content of the associated
	 * LLMMessage if found. If the entry is not found, or if the LLMMessageEntry
	 * does not contain an llmMessage, the function returns the given base object instead.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {T} baseMessage - The base object to return if the entry is not found.
	 * @param {string} [baseId='0'] - The baseId of the entry to look up.
	 * @returns {T | string} The content of the associated LLMMessage if found, or the given base object otherwise.
	 */
	static toString<T>(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		baseMessage: T,
		baseId: string = '0'
	): T | string {
		const { entry, base } = LLMMessageToLangChainAdapter.getEntryOrReturnBase(
			llmMessageEntries,
			baseId,
			baseMessage
		)
		return entry?.llmMessage?.content ?? base
	}

	/**
	 * Looks up the given baseId in the llmMessageEntries map and returns the ILangChainMessageContentText
	 * with the content of the associated LLMMessage if found. If the entry is not found, or if the
	 * LLMMessageEntry does not contain an llmMessage, the function returns the given base object instead.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {ILangChainMessageContentText} baseMessage - The base object to return if the entry is not found.
	 * @param {string} baseId - The baseId of the entry to look up.
	 * @returns {ILangChainMessageContentText} The ILangChainMessageContentText with the content of the
	 * associated LLMMessage if found, or the given base object otherwise.
	 */
	static toMessageContentComplexText(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		baseMessage: ILangChainMessageContentText,
		baseId: string
	): ILangChainMessageContentText {
		const { entry, base } = LLMMessageToLangChainAdapter.getEntryOrReturnBase(
			llmMessageEntries,
			baseId,
			baseMessage
		)
		baseMessage.text = entry?.llmMessage?.content ?? base.text
		return baseMessage
	}

	/**
	 * Converts an array of ILangChainMessageContentComplex to an array of updated ILangChainMessageContentComplex.
	 *
	 * This function iterates over each complex message content, and for each item, it checks if the content is of type
	 * ILangChainMessageContentText. If so, it updates the content using the associated LLMMessage from the
	 * llmMessageEntries map. If not, it returns the original content.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {ILangChainMessageContentComplex[]} messageContentComplex - The array of complex message contents to process.
	 * @param {string} baseId - The base ID to use for looking up entries in the map.
	 * @returns {ILangChainMessageContentComplex[]} An array of processed ILangChainMessageContentComplex.
	 */
	static toMessageContentComplex(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		messageContentComplex: ILangChainMessageContentComplex[],
		baseId: string
	): ILangChainMessageContentComplex[] {
		return messageContentComplex.flatMap((content, index) =>
			match(content)
				.when(LangChainMessageHelper.isBaseMessageContentComplexText, (content) =>
					LLMMessageToLangChainAdapter.toMessageContentComplexText(
						llmMessageEntries,
						content,
						`${baseId}.${index}`
					)
				)
				.otherwise(() => content)
		)
	}

	/**
	 * Converts an ILangChainMessageContent to an updated ILangChainMessageContent.
	 *
	 * This function checks if the content is of type string or complex. If the content is of type string,
	 * it updates the content using the associated LLMMessage from the llmMessageEntries map. If the content
	 * is of type complex, it updates each item in the complex content using the associated LLMMessage from the
	 * llmMessageEntries map. If the content is of any other type, it returns the original content.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {ILangChainMessageContent} messageContent - The message content to process.
	 * @param {string} baseId - The base ID to use for looking up entries in the map.
	 * @returns {ILangChainMessageContent} An updated ILangChainMessageContent.
	 */
	static toMessageContent(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		messageContent: ILangChainMessageContent,
		baseId: string
	): ILangChainMessageContent {
		return match(messageContent)
			.when(LangChainMessageHelper.isBaseMessageContentString, (content) =>
				LLMMessageToLangChainAdapter.toString(llmMessageEntries, content, baseId)
			)
			.when(LangChainMessageHelper.isBaseMessageContentComplex, (content) =>
				LLMMessageToLangChainAdapter.toMessageContentComplex(llmMessageEntries, content, baseId)
			)
			.otherwise(() => messageContent)
	}

	/**
	 * Converts an ILangChainBaseMessage to an updated ILangChainBaseMessage.
	 *
	 * This function updates the content of the ILangChainBaseMessage by calling
	 * `toMessageContent` with the associated LLMMessage from the llmMessageEntries map.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {ILangChainBaseMessage} baseMessage - The ILangChainBaseMessage to process.
	 * @param {string} baseId - The base ID to use for looking up entries in the map.
	 * @returns {ILangChainBaseMessage} An updated ILangChainBaseMessage.
	 */
	static toMessage(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		baseMessage: ILangChainBaseMessage,
		baseId: string
	): ILangChainBaseMessage {
		baseMessage.content = LLMMessageToLangChainAdapter.toMessageContent(
			llmMessageEntries,
			baseMessage.content,
			baseId
		)
		return baseMessage
	}

	/**
	 * Converts an ILangChainMessageFieldWithRole to an updated ILangChainMessageFieldWithRole.
	 *
	 * This function updates the content of the ILangChainMessageFieldWithRole by calling
	 * `toMessageContent` with the associated LLMMessage from the llmMessageEntries map.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {ILangChainMessageFieldWithRole} baseMessage - The ILangChainMessageFieldWithRole to process.
	 * @param {string} baseId - The base ID to use for looking up entries in the map.
	 * @returns {ILangChainMessageFieldWithRole} An updated ILangChainMessageFieldWithRole.
	 */
	static toMessageWithRole(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		baseMessage: ILangChainMessageFieldWithRole,
		baseId: string
	): ILangChainMessageFieldWithRole {
		baseMessage.content = LLMMessageToLangChainAdapter.toMessageContent(
			llmMessageEntries,
			baseMessage.content,
			baseId
		)
		return baseMessage
	}

	/**
	 * Converts an ILangChainBaseMessageTuple to an updated ILangChainBaseMessageTuple.
	 *
	 * This function updates the content at index 1 of the ILangChainBaseMessageTuple by calling
	 * `toMessageContent` with the associated LLMMessage from the llmMessageEntries map.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {ILangChainBaseMessageTuple} baseMessage - The ILangChainBaseMessageTuple to process.
	 * @param {string} baseId - The base ID to use for looking up entries in the map.
	 * @returns {ILangChainBaseMessageTuple} An updated ILangChainBaseMessageTuple.
	 */
	static toMessageTuple(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		baseMessage: ILangChainBaseMessageTuple,
		baseId: string
	): ILangChainBaseMessageTuple {
		baseMessage[1] = LLMMessageToLangChainAdapter.toMessageContent(
			llmMessageEntries,
			baseMessage[1],
			baseId
		)
		return baseMessage
	}

	/**
	 * Converts an ILangChainBaseMessageWithType to an updated ILangChainBaseMessageWithType.
	 *
	 * This function updates the content of the ILangChainBaseMessageWithType by calling
	 * `toMessageContent` with the associated LLMMessage from the llmMessageEntries map.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {ILangChainBaseMessageWithType} baseMessage - The ILangChainBaseMessageWithType to process.
	 * @param {string} baseId - The base ID to use for looking up entries in the map.
	 * @returns {ILangChainBaseMessageWithType} An updated ILangChainBaseMessageWithType.
	 */
	static toMessageWithType(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		baseMessage: ILangChainBaseMessageWithType,
		baseId: string
	): ILangChainBaseMessageWithType {
		baseMessage.content = LLMMessageToLangChainAdapter.toMessageContent(
			llmMessageEntries,
			baseMessage.content,
			baseId
		)
		return baseMessage
	}

	/**
	 * Converts an ILangChainBaseMessageLike to an updated ILangChainBaseMessageLike.
	 *
	 * This function determines the type of the baseMessage using the LangChainMessageHelper
	 * and applies the appropriate conversion method from the LLMMessageToLangChainAdapter.
	 * If the type is unknown, it returns the original message value.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {ILangChainBaseMessageLike} baseMessage - The ILangChainBaseMessageLike to process.
	 * @param {string} baseId - The base ID to use for looking up entries in the map.
	 * @returns {ILangChainBaseMessageLike} An updated ILangChainBaseMessageLike.
	 */
	static toMessageLikeInstance(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		baseMessage: ILangChainBaseMessageLike,
		baseId: string
	): ILangChainBaseMessageLike {
		return match(LangChainMessageHelper.getTypedBaseMessageLike(baseMessage))
			.with({ type: BaseMessageLikeTypeEnum.String }, (message) =>
				LLMMessageToLangChainAdapter.toString(llmMessageEntries, message.value, baseId)
			)
			.with({ type: BaseMessageLikeTypeEnum.BaseMessage }, (message) =>
				LLMMessageToLangChainAdapter.toMessage(llmMessageEntries, message.value, baseId)
			)
			.with({ type: BaseMessageLikeTypeEnum.MessageWithRole }, (message) =>
				LLMMessageToLangChainAdapter.toMessageWithRole(llmMessageEntries, message.value, baseId)
			)
			.with({ type: BaseMessageLikeTypeEnum.BaseMessageTuple }, (message) =>
				LLMMessageToLangChainAdapter.toMessageTuple(llmMessageEntries, message.value, baseId)
			)
			.with({ type: BaseMessageLikeTypeEnum.BaseMessageWithType }, (message) =>
				LLMMessageToLangChainAdapter.toMessageWithType(llmMessageEntries, message.value, baseId)
			)
			.with(
				{ type: BaseMessageLikeTypeEnum.Unknown },
				(message) => message.value as ILangChainBaseMessageLike
			)
			.exhaustive()
	}

	/**
	 * Converts an array of ILangChainBaseMessageLike to an array of updated ILangChainBaseMessageLike.
	 *
	 * This function applies the toMessageLikeInstance method to each element in the array
	 * and returns the resulting array.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {ILangChainBaseMessageLike[]} baseMessage - The array of ILangChainBaseMessageLike to process.
	 * @returns {ILangChainBaseMessageLike[]} An array of updated ILangChainBaseMessageLike.
	 */
	static toMessageLike(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		baseMessage: ILangChainBaseMessageLike[]
	): ILangChainBaseMessageLike[] {
		return baseMessage.map((message, index) =>
			LLMMessageToLangChainAdapter.toMessageLikeInstance(
				llmMessageEntries,
				message,
				index.toString()
			)
		)
	}

	/**
	 * Converts an ILangChainBasePromptValueInterface to a new ILangChainBasePromptValueInterface
	 * with the toChatMessages method overridden to return the updated ILangChainBaseMessageLike[]
	 * by calling toMessageLike with the given llmMessageEntries.
	 *
	 * The function returns a Proxy object that intercepts the get operation on the given
	 * ILangChainBasePromptValueInterface and overrides the toChatMessages method if it exists.
	 * If the property does not exist or is not a function, the original value is returned.
	 *
	 * @param {Map<string, LLMMessageEntry>} llmMessageEntries - The map of LLMMessageEntries to look up.
	 * @param {ILangChainBasePromptValueInterface} baseMessage - The ILangChainBasePromptValueInterface to process.
	 * @returns {ILangChainBasePromptValueInterface} A new ILangChainBasePromptValueInterface with the toChatMessages method overridden.
	 */
	static toPromptValueInterface(
		llmMessageEntries: Map<string, LLMMessageEntry>,
		baseMessage: ILangChainBasePromptValueInterface
	): ILangChainBasePromptValueInterface {
		return new Proxy(baseMessage, {
			get(target, prop, receiver) {
				const originalValue = Reflect.get(target, prop, receiver)
				const methodName = prop as keyof ILangChainBasePromptValueInterface
				const method = originalValue as ILangChainBasePromptValueInterface[typeof methodName]
				if (methodName === 'toChatMessages' && typeof method === 'function') {
					return () => {
						return safeExecute(
							() =>
								LLMMessageToLangChainAdapter.toMessageLike(
									llmMessageEntries,
									method.bind(baseMessage)()
								),
							originalValue
						)
					}
				}
				return originalValue
			},
		})
	}
}
