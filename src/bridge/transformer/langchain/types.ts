import type { LLMMessage } from '@hai-guardrails/types'
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import {
	BaseMessage,
	type BaseMessageFields,
	type BaseMessageLike,
	type MessageContent,
	type MessageContentComplex,
	type MessageContentText,
	type MessageFieldWithRole,
	type MessageType,
} from '@langchain/core/messages'
import type { BasePromptValueInterface } from '@langchain/core/prompt_values'

export type LLMMessageEntry = {
	id: string
	llmMessage?: LLMMessage
	isNonLLMMessage?: boolean
	nonLLMMessage?: any
}

export type LLMMessageEntries = LLMMessageEntry[]

export enum BaseLanguageModelInputTypeEnum {
	BaseMessageLike = 'BaseMessageLike',
	BasePromptValueInterface = 'BasePromptValueInterface',
	String = 'String',
	Unknown = 'Unknown',
}

export enum BaseMessageLikeTypeEnum {
	BaseMessage = 'BaseMessage',
	MessageWithRole = 'MessageWithRole',
	BaseMessageTuple = 'BaseMessageTuple',
	String = 'String',
	BaseMessageWithType = 'BaseMessageWithType',
	Unknown = 'Unknown',
}

export { BaseMessage as LangChainBaseMessage }
export type ILangChainBaseLanguageModelInput = BaseLanguageModelInput
export type ILangChainBaseMessageLike = BaseMessageLike
export type ILangChainMessageContent = MessageContent
export type ILangChainMessageContentComplex = MessageContentComplex
export type ILangChainMessageContentText = MessageContentText
export type ILangChainBaseMessage = BaseMessage
export type ILangChainMessageFieldWithRole = MessageFieldWithRole
export type ILangChainBaseMessageTuple = [string, MessageContent]
export type ILangChainBaseMessageWithType = { type: MessageType } & BaseMessageFields
export type ILangChainBaseMessageStringType = string
export type ILangChainBasePromptValueInterface = BasePromptValueInterface

export type TypedBaseLanguageModelInput =
	| {
			type: BaseLanguageModelInputTypeEnum.String
			value: ILangChainBaseMessageStringType
	  }
	| {
			type: BaseLanguageModelInputTypeEnum.BaseMessageLike
			value: ILangChainBaseMessageLike[]
	  }
	| {
			type: BaseLanguageModelInputTypeEnum.BasePromptValueInterface
			value: ILangChainBasePromptValueInterface
	  }
	| {
			type: BaseLanguageModelInputTypeEnum.Unknown
			value: unknown
	  }

export type TypedBaseMessageLikeInput =
	| { type: BaseMessageLikeTypeEnum.BaseMessage; value: ILangChainBaseMessage }
	| { type: BaseMessageLikeTypeEnum.MessageWithRole; value: ILangChainMessageFieldWithRole }
	| { type: BaseMessageLikeTypeEnum.BaseMessageTuple; value: ILangChainBaseMessageTuple }
	| { type: BaseMessageLikeTypeEnum.String; value: ILangChainBaseMessageStringType }
	| { type: BaseMessageLikeTypeEnum.BaseMessageWithType; value: ILangChainBaseMessageWithType }
	| { type: BaseMessageLikeTypeEnum.Unknown; value: unknown }
