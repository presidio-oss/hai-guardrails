import type { GuardrailsChainOptions, GuardResult, LLMMessage } from '../types/types'

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
		const results: GuardResult[][] = []
		for (const guard of this.opts.guards) {
			const guardResults = await guard(messages)
			results.push(guardResults)
			for (const guardResult of guardResults) {
				if (guardResult.modifiedMessage && guardResult.modifiedMessage.content) {
					messages = messages.map((msg, idx) =>
						idx === guardResult.index
							? {
									...msg,
									content: guardResult.modifiedMessage!.content,
								}
							: msg
					)
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

		return { messages, messagesWithGuardResult }
	}
}
