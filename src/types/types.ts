import type { BaseChatModel } from '@langchain/core/language_models/chat_models'

export type LLMMessage = {
	role: string
	content: string
	id?: string
}

export type LLMMessages = LLMMessage[]

export type LLMEngineMessage = {
	originalMessage: LLMMessage
	inScope: boolean
	messageHash?: string
}

export type GuardResult = {
	passed: boolean
	reason?: string
	modifiedMessage?: LLMMessage
	guardId: string
	guardName: string
	message: LLMMessage
	index: number
	messageHash?: string
	inScope: boolean
	additionalFields?: Record<string, unknown>
}

export type MessageType =
	| 'user'
	| 'assistant'
	| 'human'
	| 'ai'
	| 'generic'
	| 'developer'
	| 'system'
	| 'function'
	| 'tool'
	| 'remove'

export type Guard = (
	messages: LLMMessage[] | LLMEngineMessage[],
	llm?: LLM
) => Promise<GuardResult[]> | GuardResult[]

export type GuardPredicate = (msg: LLMMessage, idx: number, messages: LLMMessage[]) => boolean

export enum SelectionType {
	First = 'first',
	NFirst = 'n-first',
	Last = 'last',
	NLast = 'n-last',
	All = 'all',
}

export type GuardOptions =
	| {
			predicate: GuardPredicate
			roles?: never
			selection?: never
			n?: never
			llm?: LLM
			messageHashingAlgorithm?: MessageHahsingAlgorithm
	  }
	| {
			predicate?: never
			roles?: MessageType[]
			selection?: SelectionType
			n?: number
			llm?: LLM
			messageHashingAlgorithm?: MessageHahsingAlgorithm
	  }

export type GuardImplementation = (
	input: string,
	msg: LLMEngineMessage,
	config: MakeGuardConfig,
	idx: number,
	llm?: LLM
) => GuardResult | Promise<GuardResult>

export type MakeGuardConfig = GuardOptions & {
	id: string
	name: string
	description?: string
	implementation: GuardImplementation
}

export enum MessageHahsingAlgorithm {
	MD5 = 'md5',
	SHA1 = 'sha1',
	SHA256 = 'sha256',
	SHA512 = 'sha512',
}

export type GuardrailsChainOptions = {
	llm?: BaseChatModel
	guards: Guard[]
	enabled?: boolean
	messageHashingAlgorithm?: MessageHahsingAlgorithm
}

export type LLM = BaseChatModel | ((messages: LLMMessage[]) => Promise<LLMMessage[]>)
