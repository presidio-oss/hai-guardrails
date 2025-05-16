import type {
	ILangChainBaseLanguageModelInput,
	ILangChainBaseMessageLike,
	ILangChainBaseMessageTuple,
	ILangChainBaseMessageWithType,
	ILangChainBasePromptValueInterface,
	ILangChainMessageContent,
	ILangChainMessageContentComplex,
	ILangChainMessageContentText,
	ILangChainMessageFieldWithRole,
	TypedBaseLanguageModelInput,
	TypedBaseMessageLikeInput,
} from '@hai-guardrails/bridge/transformer/langchain/types'
import {
	BaseLanguageModelInputTypeEnum,
	BaseMessageLikeTypeEnum,
	LangChainBaseMessage,
} from '@hai-guardrails/bridge/transformer/langchain/types'
import { createHash } from 'node:crypto'

/**
 * Provides helper methods for LangChain message types.
 */
export class LangChainMessageHelper {
	/**
	 * Check if the given input is a string.
	 *
	 * @param {ILangChainBaseLanguageModelInput  | ILangChainBaseMessageLike} message - the input to check
	 * @returns {boolean} true if the input is a string, false otherwise
	 */
	static isString = (
		message: ILangChainBaseLanguageModelInput | ILangChainBaseMessageLike
	): message is string => typeof message === 'string'

	/**
	 * Checks if the given input is an array of ILangChainBaseMessageLike objects.
	 *
	 * @param {ILangChainBaseLanguageModelInput} message - the input to check
	 * @returns {message is ILangChainBaseMessageLike[]} true if the input is an array of ILangChainBaseMessageLike objects, false otherwise
	 */
	static isBaseMessageLike = (
		message: ILangChainBaseLanguageModelInput
	): message is ILangChainBaseMessageLike[] => Array.isArray(message)

	/**
	 * Checks if the given input is a ILangChainBasePromptValueInterface object.
	 *
	 * This function checks if the input is an object with a `toChatMessages` method.
	 *
	 * @param {ILangChainBaseLanguageModelInput} message - the input to check
	 * @returns {message is ILangChainBasePromptValueInterface} true if the input is a ILangChainBasePromptValueInterface object, false otherwise
	 */
	static isBasePromptValueInterface = (
		message: ILangChainBaseLanguageModelInput
	): message is ILangChainBasePromptValueInterface =>
		typeof message === 'object' &&
		'toChatMessages' in message &&
		typeof message.toChatMessages === 'function'

	/**
	 * Checks if the given input is a LangChainBaseMessage object.
	 *
	 * @param {ILangChainBaseMessageLike} message - the input to check
	 * @returns {message is LangChainBaseMessage} true if the input is a LangChainBaseMessage object, false otherwise
	 */
	static isBaseMessage = (message: ILangChainBaseMessageLike): message is LangChainBaseMessage =>
		message instanceof LangChainBaseMessage

	/**
	 * Checks if the given message is a ILangChainMessageFieldWithRole object.
	 *
	 * This function verifies if the input is an object containing a 'role' property
	 * of type string and a 'content' property.
	 *
	 * @param {ILangChainBaseMessageLike} message - The message to check.
	 * @returns {message is ILangChainMessageFieldWithRole} true if the message is a ILangChainMessageFieldWithRole object, false otherwise.
	 */
	static isMessageWithRole = (
		message: ILangChainBaseMessageLike
	): message is ILangChainMessageFieldWithRole =>
		typeof message === 'object' &&
		'role' in message &&
		typeof message.role === 'string' &&
		'content' in message

	/**
	 * Checks if the given message is a tuple containing a string as its first element
	 * and a MessageContent object as its second element.
	 *
	 * @param {ILangChainBaseMessageLike} message - The message to check.
	 * @returns {message is ILangChainBaseMessageTuple} true if the message is a ILangChainBaseMessageTuple, false otherwise.
	 */
	static isMessageTuple = (
		message: ILangChainBaseMessageLike
	): message is ILangChainBaseMessageTuple =>
		Array.isArray(message) && message.length === 2 && typeof message[0] === 'string'

	/**
	 * Checks if the given message is an object with a 'type' property of type string
	 * and a 'content' property.
	 *
	 * @param {ILangChainBaseMessageLike} message - The message to check.
	 * @returns {message is ILangChainBaseMessageWithType} true if the message is an object with a 'type' property
	 *   of type string and a 'content' property, false otherwise.
	 */
	static isMessageWithType = (
		message: ILangChainBaseMessageLike
	): message is ILangChainBaseMessageWithType =>
		typeof message === 'object' &&
		'type' in message &&
		typeof message.type === 'string' &&
		'content' in message

	/**
	 * Checks if the given content is a string.
	 *
	 * @param {ILangChainMessageContent} content - The content to check.
	 * @returns {content is string} true if the content is a string, false otherwise.
	 */
	static isBaseMessageContentString = (content: ILangChainMessageContent): content is string =>
		typeof content === 'string'

	/**
	 * Checks if the given content is a complex message content object.
	 *
	 * This function verifies if the input is an array.
	 *
	 * @param {ILangChainMessageContent} content - The content to check.
	 * @returns {content is ILangChainMessageContentComplex[]} true if the content is a complex message content object, false otherwise.
	 */
	static isBaseMessageContentComplex = (
		content: ILangChainMessageContent
	): content is ILangChainMessageContentComplex[] => Array.isArray(content)

	/**
	 * Checks if the given complex message content is of type `ILangChainMessageContentText`.
	 *
	 * This function verifies if the input is an object with a `type` property
	 * equal to 'text' and contains a `text` property.
	 *
	 * @param {ILangChainMessageContentComplex} content - The complex message content to check.
	 * @returns {content is ILangChainMessageContentText} true if the content is of type
	 * `ILangChainMessageContentText`, false otherwise.
	 */
	static isBaseMessageContentComplexText = (
		content: ILangChainMessageContentComplex
	): content is ILangChainMessageContentText =>
		typeof content === 'object' && 'type' in content && content.type === 'text' && 'text' in content

	/**
	 * Takes a LangChain `ILangChainBaseMessageLike` input and returns a `TypedBaseMessageLikeInput`
	 * with the correct type and value.
	 *
	 * @param {ILangChainBaseMessageLike} input - The LangChain input to type.
	 * @returns {TypedBaseMessageLikeInput} The typed input.
	 */
	static getTypedBaseMessageLike(input: ILangChainBaseMessageLike): TypedBaseMessageLikeInput {
		if (LangChainMessageHelper.isString(input)) {
			return { type: BaseMessageLikeTypeEnum.String, value: input }
		} else if (LangChainMessageHelper.isBaseMessage(input)) {
			return { type: BaseMessageLikeTypeEnum.BaseMessage, value: input }
		} else if (LangChainMessageHelper.isMessageWithRole(input)) {
			return { type: BaseMessageLikeTypeEnum.MessageWithRole, value: input }
		} else if (LangChainMessageHelper.isMessageTuple(input)) {
			return { type: BaseMessageLikeTypeEnum.BaseMessageTuple, value: input }
		} else if (LangChainMessageHelper.isMessageWithType(input)) {
			return { type: BaseMessageLikeTypeEnum.BaseMessageWithType, value: input }
		} else {
			return { type: BaseMessageLikeTypeEnum.Unknown, value: input }
		}
	}

	/**
	 * Takes a LangChain `ILangChainBaseLanguageModelInput` input and returns a
	 * `TypedBaseLanguageModelInput` with the correct type and value.
	 *
	 * @param {ILangChainBaseLanguageModelInput} input - The LangChain input to type.
	 * @returns {TypedBaseLanguageModelInput} The typed input.
	 */
	static getTypedBaseLanguageModelInput(
		input: ILangChainBaseLanguageModelInput
	): TypedBaseLanguageModelInput {
		if (LangChainMessageHelper.isString(input)) {
			return { type: BaseLanguageModelInputTypeEnum.String, value: input }
		} else if (LangChainMessageHelper.isBaseMessageLike(input)) {
			return { type: BaseLanguageModelInputTypeEnum.BaseMessageLike, value: input }
		} else {
			return { type: BaseLanguageModelInputTypeEnum.BasePromptValueInterface, value: input }
		}
	}

	/**
	 * Generates a unique message ID based on the given base ID and optional index.
	 * The ID is generated by hashing the base ID and optional index together
	 * using the MD5 algorithm.
	 *
	 * @param {string | number} baseId - The base ID to use for generating the message ID.
	 * @param {string | number} [index] - An optional index to include in the message ID.
	 * @returns {string} The generated message ID.
	 */
	static generateMessageId(baseId: string | number, index?: string | number): string {
		return createHash('md5')
			.update(index ? `${baseId}.${index}` : baseId.toString())
			.digest('hex')
	}
}
