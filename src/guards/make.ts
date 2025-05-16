import {
	MessageHahsingAlgorithm,
	SelectionType,
	type Guard,
	type GuardOptions,
	type GuardResult,
	type LLMEngineMessage,
	type LLMMessage,
	type MakeGuardConfig,
	type MessageType,
} from '@hai-guardrails/types'
import { hashMessage } from '@hai-guardrails/utils/hash'

/**
 * Selects messages based on specified roles, selection type, and optional predicate.
 *
 * @param messages - Array of messages to filter.
 * @param options - Options to determine selection criteria.
 * @returns Array of messages with `inScope` property updated.
 */
export function selectMessages(
	messages: LLMEngineMessage[],
	options: GuardOptions = {}
): LLMEngineMessage[] {
	// Extract roles, selection type, number of messages, and predicate from options
	const { roles = [], selection = SelectionType.All, n = 1, predicate } = options

	// If a predicate is provided, use it to determine in-scope messages
	if (predicate) {
		return messages.map((msg, idx, arr) => ({
			...msg,
			inScope: predicate(
				msg.originalMessage,
				idx,
				arr.map((msg) => msg.originalMessage)
			),
		}))
	}

	// Identify indices of messages that match the specified roles
	const matchingIndices = messages
		.map((msg, idx) => ({ msg, idx }))
		.filter(({ msg }) => msg.originalMessage.content)
		.filter(
			({ msg }) => roles.length === 0 || roles.includes(msg.originalMessage.role as MessageType)
		)
		.map(({ idx }) => idx)

	// Determine selected indices based on the selection type
	const selectedIndicesFilter = () => {
		switch (selection) {
			case SelectionType.First:
				return new Set(matchingIndices.slice(0, 1))
			case SelectionType.Last:
				return new Set(matchingIndices.slice(-1))
			case SelectionType.NFirst:
				return new Set(matchingIndices.slice(0, n))
			case SelectionType.NLast:
				return new Set(matchingIndices.slice(-n))
			default:
				return new Set(matchingIndices)
		}
	}

	// Get the set of selected indices
	const selectedIndices = selectedIndicesFilter()

	// Update messages with inScope property based on selected indices
	return messages.map((msg, idx) => ({ ...msg, inScope: selectedIndices.has(idx) }))
}

export function makeGuard(config: MakeGuardConfig): Guard {
	return async (messages, llm): Promise<GuardResult[]> => {
		messages = messages.map((msg) => {
			if ('originalMessage' in msg) {
				return msg
			}
			return {
				originalMessage: msg,
				inScope: false,
				messageHash: hashMessage(
					msg,
					config.messageHashingAlgorithm || MessageHahsingAlgorithm.SHA256
				),
			}
		})
		const selected = selectMessages(messages, config)
		const results = await Promise.all(
			selected.map(async (msg, idx) => {
				const input = msg.originalMessage.content
				return config.implementation(input, msg, config, idx, llm)
			})
		)
		return results
	}
}
