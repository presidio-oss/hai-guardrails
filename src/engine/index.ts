import {
	MessageHahsingAlgorithm,
	type GuardrailsChainOptions,
	type GuardResult,
	type LLMEngineMessage,
	type LLMMessage,
} from '@hai-guardrails/types'
import { hashMessage } from '@hai-guardrails/utils/hash'
import { logger } from '@hai-guardrails/utils/logging/logger'
import type { LogLevel } from '@hai-guardrails/types'
import { DEFAULT_LOG_LEVEL } from '@hai-guardrails/utils/logging/types'

export type GuardrailsEngineResult = {
	messages: LLMMessage[]
	messagesWithGuardResult: {
		guardId: string
		guardName: string
		messages: Omit<GuardResult, 'guardId' | 'guardName'>[]
	}[]
}

/**
 * The GuardrailsEngine class manages the execution of a set of guards on a sequence of messages.
 * It provides a way to validate and modify messages before they are processed by an LLM.
 *
 * @example
 * ```typescript
 * import { GuardrailsEngine, piiGuard, secretGuard } from '@hai-guardrails';
 *
 * const engine = new GuardrailsEngine({
 *   guards: [piiGuard(), secretGuard()],
 * });
 *
 * const results = await engine.run(messages);
 * ```
 * @param opts - Configuration options for the engine
 * @param {boolean} opts.enabled - Whether the engine is enabled (default: true)
 * @param {Guard[]} opts.guards - Array of guard functions to apply to messages
 * @param {MessageHashingAlgorithm} opts.messageHashingAlgorithm - Algorithm for hashing messages (default: SHA256)
 *
 * @method isEnabled - Returns true if the engine is enabled.
 * @method isDisabled - Returns true if the engine is disabled.
 * @method enable - Enables the engine.
 * @method disable - Disables the engine.
 * @method run - Executes the guards on the provided messages and returns the results.
 *
 * The run method processes each message through the configured guards, modifying messages as needed,
 * and returns the original and modified messages along with the results of the guard checks.
 */
export class GuardrailsEngine {
	constructor(private readonly opts: GuardrailsChainOptions) {
		const defaultConfig: GuardrailsChainOptions = {
			enabled: true,
			guards: [],
			messageHashingAlgorithm: MessageHahsingAlgorithm.SHA256,
			logLevel: DEFAULT_LOG_LEVEL,
		}

		this.opts = { ...defaultConfig, ...opts }
		logger.setLevel(this.opts.logLevel || DEFAULT_LOG_LEVEL)
	}

	/**
	 * Checks if the engine is currently enabled
	 * @returns {boolean} True if the engine is enabled
	 */
	get isEnabled(): boolean {
		return this.opts.enabled || false
	}

	/**
	 * Checks if the engine is currently disabled
	 * @returns {boolean} True if the engine is disabled
	 */
	get isDisabled(): boolean {
		return !this.opts.enabled
	}

	/**
	 * Enables the guardrails engine
	 */
	enable() {
		this.opts.enabled = true
	}

	/**
	 * Disables the guardrails engine
	 */
	disable() {
		this.opts.enabled = false
	}

	/**
	 * Sets the log level for the engine
	 * @param level - The log level to set
	 */
	setLogLevel(level: LogLevel) {
		this.opts.logLevel = level
		logger.setLevel(level)
	}

	/**
	 * Gets the current log level
	 * @returns The current log level
	 */
	getLogLevel(): LogLevel {
		return logger.getLevel()
	}

	/**
	 * Executes the configured guards on the provided messages
	 *
	 * @param {LLMMessage[]} messages - Array of messages to process
	 * @returns {Promise<GuardrailsEngineResult>} An object containing:
	 *   - messages: The processed messages
	 *   - messagesWithGuardResult: Detailed results of guard executions
	 */
	async run(messages: LLMMessage[]): Promise<GuardrailsEngineResult> {
		logger.debug('Starting guardrails engine', { messageCount: messages.length })
		let llmEngineMessages: LLMEngineMessage[] = messages.map((message) => {
			return {
				originalMessage: message,
				inScope: false,
				messageHash: hashMessage(message, this.opts.messageHashingAlgorithm!),
			}
		})
		const results: GuardResult[][] = []
		for (const guard of this.opts.guards) {
			const guardResults = await guard(llmEngineMessages, this.opts.llm)
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

		logger.debug('Guardrails processing complete')
		return {
			messages: llmEngineMessages.map((msg) => msg.originalMessage),
			messagesWithGuardResult,
		}
	}
}
