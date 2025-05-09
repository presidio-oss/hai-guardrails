import {
	MessageHahsingAlgorithm,
	type GuardrailsChainOptions,
	type GuardResult,
	type LLMEngineMessage,
	type LLMMessage,
} from '@hai-guardrails/types'
import { hashMessage } from '@hai-guardrails/utils/hash'

export type GuardrailsEngineResult = {
	messages: LLMMessage[]
	messagesWithGuardResult: {
		guardId: string
		guardName: string
		messages: Omit<GuardResult, 'guardId' | 'guardName'>[]
	}[]
}

export class GuardrailsEngine {
	constructor(private readonly opts: GuardrailsChainOptions) {
		const defaultConfig: GuardrailsChainOptions = {
			enabled: true,
			guards: [],
			messageHashingAlgorithm: MessageHahsingAlgorithm.SHA256,
		}
		this.opts = { ...defaultConfig, ...opts }
	}

	get isEnabled() {
		return this.opts.enabled
	}

	get isDisabled() {
		return !this.opts.enabled
	}

	enable() {
		this.opts.enabled = true
	}

	disable() {
		this.opts.enabled = false
	}

	async run(messages: LLMMessage[]): Promise<GuardrailsEngineResult> {
		let llmEngineMessages: LLMEngineMessage[] = messages.map((message) => {
			return {
				originalMessage: message,
				inScope: false,
				messageHash: hashMessage(message, this.opts.messageHashingAlgorithm!),
			}
		})
		const results: GuardResult[][] = []
		for (const guard of this.opts.guards) {
			const guardResults = await guard(llmEngineMessages)
			results.push(guardResults)
			for (const guardResult of guardResults) {
				if (guardResult.modifiedMessage && guardResult.modifiedMessage.content) {
					llmEngineMessages = llmEngineMessages.map((msg) => {
						if (msg.messageHash === guardResult.messageHash) {
							return {
								...msg,
								originalMessage: {
									...msg.originalMessage,
									content: guardResult.modifiedMessage!.content,
								},
							}
						}
						return msg
					})
				}
			}
		}

		// Group results by guardId and preserve guardName
		const groupedResults = results.flat().reduce<{
			[key: string]: {
				guardName: string
				messages: Omit<GuardResult, 'guardId' | 'guardName'>[]
			}
		}>((acc, { guardId, guardName, ...rest }) => {
			if (!acc[guardId]) {
				acc[guardId] = {
					guardName,
					messages: [],
				}
			}
			acc[guardId].messages.push(rest)
			return acc
		}, {})

		// Convert to array format
		const messagesWithGuardResult = Object.entries(groupedResults).map(
			([guardId, { guardName, messages }]) => ({
				guardId,
				guardName,
				messages,
			})
		)

		return {
			messages: llmEngineMessages.map((msg) => msg.originalMessage),
			messagesWithGuardResult,
		}
	}
}
