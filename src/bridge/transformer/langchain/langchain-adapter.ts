import {
	BaseLanguageModelInputTypeEnum,
	BaseMessageLikeTypeEnum,
	type ILangChainBaseLanguageModelInput,
	type ILangChainBaseMessage,
	type ILangChainBaseMessageLike,
	type ILangChainBaseMessageTuple,
	type ILangChainBaseMessageWithType,
	type ILangChainBasePromptValueInterface,
	type ILangChainMessageContent,
	type ILangChainMessageContentComplex,
	type ILangChainMessageContentText,
	type ILangChainMessageFieldWithRole,
	type LLMMessageEntries,
} from '@hai-guardrails/bridge/transformer/langchain/types'
import { LangChainMessageHelper } from '@hai-guardrails/bridge/transformer/langchain/helper'
import { match } from 'ts-pattern'

/**
 * Class containing methods to convert LangChain messages to LLMMessageEntries.
 *
 * This class provides methods to convert various types of LangChain messages
 * to LLMMessageEntries. Each method takes a LangChain message of a specific
 * type and returns an array of LLMMessageEntries.
 *
 * These methods are used by the LangChainLLMMessageTransformer to convert
 * LangChain messages to LLMMessageEntries that can be used by the LLM.
 */
export class LangChainToLLMMessageAdapter {
	/**
	 * Converts a string to a LLMMessageEntries.
	 *
	 * @param {string} content - The string to convert.
	 * @param {string} [id='0'] - The ID of the message. Defaults to '0'.
	 * @param {string} [role='human'] - The role of the message. Defaults to 'human'.
	 * @returns {LLMMessageEntries} An array with a single LLMMessageEntries.
	 */
	static fromString(content: string, id: string = '0', role: string = 'human'): LLMMessageEntries {
		return [
			{
				id: LangChainMessageHelper.generateMessageId(id),
				llmMessage: { role, content },
			},
		]
	}

	/**
	 * Converts a complex message content of type `ILangChainMessageContentText` to an array
	 * of LLMMessageEntries.
	 *
	 * @param {ILangChainMessageContentText} content - The complex message content to convert.
	 * @param {string} baseId - The base ID to use for the message entries.
	 * @param {string} role - The role to use for the message entries.
	 * @returns {LLMMessageEntries} An array of LLMMessageEntries with the specified baseId and role.
	 */
	static fromMessageContentComplexText(
		content: ILangChainMessageContentText,
		baseId: string,
		role: string
	): LLMMessageEntries {
		return [
			{
				id: LangChainMessageHelper.generateMessageId(baseId),
				llmMessage: { role, content: content.text },
			},
		]
	}

	/**
	 * Converts an array of ILangChainMessageContentComplex to an array of LLMMessageEntries.
	 *
	 * Depending on the type of the message content, this function will
	 * utilize the appropriate conversion method to transform the content
	 * into an array of LLMMessageEntries with the specified baseId and role.
	 *
	 * @param {ILangChainMessageContentComplex[]} messages - The message content to convert.
	 * @param {string} baseId - The base ID to use for the message entries.
	 * @param {string} role - The role to use for the message entries.
	 * @returns {LLMMessageEntries} An array of LLMMessageEntries.
	 */
	static fromMessageContentComplex(
		messages: ILangChainMessageContentComplex[],
		baseId: string,
		role: string
	): LLMMessageEntries {
		return messages.flatMap((content, index) =>
			match(content)
				.when(LangChainMessageHelper.isBaseMessageContentComplexText, (content) =>
					LangChainToLLMMessageAdapter.fromMessageContentComplexText(
						content,
						`${baseId}.${index}`,
						role
					)
				)
				.otherwise(() => ({
					id: LangChainMessageHelper.generateMessageId(`${baseId}.${index}`),
					isNonLLMMessage: true,
					nonLLMMessage: content,
				}))
		)
	}

	/**
	 * Converts ILangChainMessageContent to an array of LLMMessageEntries.
	 *
	 * Depending on the type of the message content, this function will
	 * utilize the appropriate conversion method to transform the content
	 * into an array of LLMMessageEntries with the specified baseId and role.
	 *
	 * @param {ILangChainMessageContent} content - The message content to convert.
	 * @param {string} baseId - The base ID to use for the message entries.
	 * @param {string} role - The role associated with the message entries.
	 * @returns {LLMMessageEntries} An array of converted LLMMessageEntries.
	 */
	static fromMessageContent(
		content: ILangChainMessageContent,
		baseId: string,
		role: string
	): LLMMessageEntries {
		return match(content)
			.when(LangChainMessageHelper.isBaseMessageContentString, (content) =>
				LangChainToLLMMessageAdapter.fromString(content, baseId, role)
			)
			.when(LangChainMessageHelper.isBaseMessageContentComplex, (content) =>
				LangChainToLLMMessageAdapter.fromMessageContentComplex(content, baseId, role)
			)
			.otherwise(() => [
				{
					id: LangChainMessageHelper.generateMessageId(baseId),
					isNonLLMMessage: true,
					nonLLMMessage: content,
				},
			])
	}

	/**
	 * Converts a ILangChainBaseMessage to an array of LLMMessageEntries.
	 *
	 * The input is validated against the LangChainMessageValidator and the
	 * appropriate conversion method is called based on the type of the input.
	 *
	 * @param {ILangChainBaseMessage} message - The ILangChainBaseMessage to convert
	 * @param {string} baseId - The base ID to use for the messages
	 * @returns {LLMMessageEntries} An array of LLMMessageEntries
	 */
	static fromMessage(message: ILangChainBaseMessage, baseId: string): LLMMessageEntries {
		return LangChainToLLMMessageAdapter.fromMessageContent(
			message.content,
			baseId,
			message.getType()
		)
	}

	/**
	 * Converts a ILangChainMessageFieldWithRole to an array of LLMMessageEntries.
	 *
	 * The input is validated against the LangChainMessageValidator and the
	 * appropriate conversion method is called based on the type of the input.
	 *
	 * @param {ILangChainMessageFieldWithRole} message - The ILangChainMessageFieldWithRole to convert
	 * @param {string} baseId - The base ID to use for the messages
	 * @returns {LLMMessageEntries} An array of LLMMessageEntries
	 */
	static fromMessageWithRole(
		message: ILangChainMessageFieldWithRole,
		baseId: string
	): LLMMessageEntries {
		return LangChainToLLMMessageAdapter.fromMessageContent(message.content, baseId, message.role)
	}

	/**
	 * Converts a ILangChainBaseMessageTuple to an array of LLMMessageEntries.
	 *
	 * The input tuple consists of a string representing the role and a MessageContent
	 * object. The appropriate conversion method is used to transform the content into an
	 * array of LLMMessageEntries using the specified baseId and role.
	 *
	 * @param { ILangChainBaseMessageTuple } message - The tuple containing a role and message content.
	 * @param { string } baseId - The base ID to use for the message entries.
	 * @returns { LLMMessageEntries } An array of LLMMessageEntries.
	 */
	static fromMessageTuple(message: ILangChainBaseMessageTuple, baseId: string): LLMMessageEntries {
		return LangChainToLLMMessageAdapter.fromMessageContent(message[1], baseId, message[0])
	}

	/**
	 * Converts a ILangChainBaseMessageWithType to an array of LLMMessageEntries.
	 *
	 * The input is validated against the LangChainMessageValidator and the
	 * appropriate conversion method is called based on the type of the input.
	 *
	 * @param {ILangChainBaseMessageWithType} message - The ILangChainBaseMessageWithType to convert
	 * @param {string} baseId - The base ID to use for the messages
	 * @returns {LLMMessageEntries} An array of LLMMessageEntries
	 */
	static fromMessageWithType(
		message: ILangChainBaseMessageWithType,
		baseId: string
	): LLMMessageEntries {
		return LangChainToLLMMessageAdapter.fromMessageContent(message.content, baseId, message.type)
	}

	/**
	 * Converts a ILangChainBaseMessageLike to an array of LLMMessageEntries.
	 *
	 * The input is validated against the LangChainMessageValidator and the
	 * appropriate conversion method is called based on the type of the input.
	 *
	 * @param {ILangChainBaseMessageLike} message - The ILangChainBaseMessageLike to convert
	 * @param {string} baseId - The base ID to use for the messages
	 * @returns {LLMMessageEntries} An array of LLMMessageEntries
	 */
	static fromMessageLikeInstance(
		message: ILangChainBaseMessageLike,
		baseId: string
	): LLMMessageEntries {
		return match(LangChainMessageHelper.getTypedBaseMessageLike(message))
			.with({ type: BaseMessageLikeTypeEnum.String }, (message) =>
				LangChainToLLMMessageAdapter.fromString(message.value, baseId)
			)
			.with({ type: BaseMessageLikeTypeEnum.BaseMessage }, (message) =>
				LangChainToLLMMessageAdapter.fromMessage(message.value, baseId)
			)
			.with({ type: BaseMessageLikeTypeEnum.MessageWithRole }, (message) =>
				LangChainToLLMMessageAdapter.fromMessageWithRole(message.value, baseId)
			)
			.with({ type: BaseMessageLikeTypeEnum.BaseMessageTuple }, (message) =>
				LangChainToLLMMessageAdapter.fromMessageTuple(message.value, baseId)
			)
			.with({ type: BaseMessageLikeTypeEnum.BaseMessageWithType }, (message) =>
				LangChainToLLMMessageAdapter.fromMessageWithType(message.value, baseId)
			)
			.with({ type: BaseMessageLikeTypeEnum.Unknown }, (message) => [
				{
					id: baseId,
					isNonLLMMessage: true,
					nonLLMMessage: message.value,
				},
			])
			.exhaustive()
	}

	/**
	 * Converts a ILangChainBaseMessageLike array to an array of LLMMessageEntries.
	 *
	 * The input is validated against the LangChainMessageValidator and the
	 * appropriate conversion method is called based on the type of the input.
	 *
	 * @param {ILangChainBaseMessageLike[]} messages - The ILangChainBaseMessageLike array to convert
	 * @returns {LLMMessageEntries} An array of LLMMessageEntries
	 */
	static fromMessageLike(messages: ILangChainBaseMessageLike[]): LLMMessageEntries {
		return messages.flatMap((message, index) =>
			LangChainToLLMMessageAdapter.fromMessageLikeInstance(message, index.toString())
		)
	}

	/**
	 * Converts a ILangChainBasePromptValueInterface to an array of LLMMessageEntries.
	 *
	 * The input is validated against the LangChainMessageValidator and the
	 * appropriate conversion method is called based on the type of the input.
	 *
	 * @param {ILangChainBasePromptValueInterface} promptValueInterface - The LangChain PromptValueInterface to convert
	 * @returns {LLMMessageEntries} An array of LLMMessageEntries
	 */
	static fromPromptValueInterface(
		promptValueInterface: ILangChainBasePromptValueInterface
	): LLMMessageEntries {
		return LangChainToLLMMessageAdapter.fromMessageLike(promptValueInterface.toChatMessages())
	}

	/**
	 * Converts a ILangChainBaseLanguageModelInput to an array of LLMMessageEntries.
	 *
	 * The input is validated against the LangChainMessageValidator and the
	 * appropriate conversion method is called based on the type of the input.
	 *
	 * @param {ILangChainBaseLanguageModelInput} baseMessage - The LangChain ILangChainBaseLanguageModelInput to convert
	 * @returns {LLMMessageEntries} An array of LLMMessageEntries
	 */
	static fromBaseLanguageModelInput(
		baseMessage: ILangChainBaseLanguageModelInput
	): LLMMessageEntries {
		return match(LangChainMessageHelper.getTypedBaseLanguageModelInput(baseMessage))
			.with({ type: BaseLanguageModelInputTypeEnum.String }, (input) =>
				LangChainToLLMMessageAdapter.fromString(input.value)
			)
			.with({ type: BaseLanguageModelInputTypeEnum.BaseMessageLike }, (input) =>
				LangChainToLLMMessageAdapter.fromMessageLike(input.value)
			)
			.with({ type: BaseLanguageModelInputTypeEnum.BasePromptValueInterface }, (input) =>
				LangChainToLLMMessageAdapter.fromPromptValueInterface(input.value)
			)
			.with({ type: BaseLanguageModelInputTypeEnum.Unknown }, (input) => [
				{
					id: LangChainMessageHelper.generateMessageId('0'),
					isNonLLMMessage: true,
					nonLLMMessage: input.value,
				},
			])
			.exhaustive()
	}
}
