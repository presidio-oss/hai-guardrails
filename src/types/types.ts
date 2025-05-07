import type { BaseChatModel } from '@langchain/core/language_models/chat_models'

export type LLMMessage = {
	role: string
	content: string
	inScope?: boolean
}

export type GuardResult = {
	passed: boolean
	reason?: string
	modifiedMessage?: LLMMessage
	guardId: string
	guardName: string
	message: LLMMessage
	index: number
	additionalFields?: Record<string, unknown>
}

export type IOGuard = {
	input: Guard
	output: Guard
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

export type Guard = (messages: LLMMessage[], llm?: LLM) => Promise<GuardResult[]> | GuardResult[]

export type GuardPredicate = (msg: LLMMessage, idx: number, messages: LLMMessage[]) => boolean

export type GuardOptions =
	| {
			predicate: GuardPredicate
			roles?: never
			selection?: never
			n?: never
			llm?: LLM
	  }
	| {
			predicate?: never
			roles?: MessageType[]
			selection?: 'first' | 'n-first' | 'last' | 'n-last' | 'all'
			n?: number
			llm?: LLM
	  }

export type GuardImplementation = (
	input: string,
	msg: LLMMessage,
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

export type GuardrailsChainOptions = {
	llm?: BaseChatModel
	guards: Guard[]
	enabled?: boolean
}

export type GuardrailsCallResult = {
	messages: LLMMessage[]
	inputGuardResults: GuardResult[]
	outputGuardResults: GuardResult[]
	blocked: boolean
	blockedBy: 'input' | 'output' | null
	blockReason?: string
}

export type LLM = BaseChatModel | ((messages: LLMMessage[]) => Promise<LLMMessage[]>)
