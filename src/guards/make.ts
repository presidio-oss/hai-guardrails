import {
	SelectionType,
	type Guard,
	type GuardOptions,
	type GuardResult,
	type LLMMessage,
	type MakeGuardConfig,
	type MessageType,
} from '@hai-guardrails/types'

function selectMessages(messages: LLMMessage[], opts: GuardOptions = {}): LLMMessage[] {
	const allCandidates = messages.map((msg) => ({ ...msg, inScope: false }))

	if ('predicate' in opts && typeof opts.predicate === 'function') {
		return allCandidates.map((msg) => ({
			...msg,
			inScope: opts.predicate(msg, allCandidates.indexOf(msg), allCandidates),
		}))
	}

	const roles = opts.roles || []
	const selection = opts.selection || SelectionType.All
	const n = opts.n || 1

	let candidates = allCandidates
	if (roles.length > 0) {
		candidates = allCandidates.map((msg) => ({
			...msg,
			inScope: roles.includes(msg.role as MessageType),
		}))
	}

	if (selection === SelectionType.First) {
		return candidates.map((msg, idx) => ({
			...msg,
			inScope: msg.inScope && idx === 0,
		}))
	} else if (selection === SelectionType.NFirst) {
		return candidates.map((msg, idx) => ({
			...msg,
			inScope: msg.inScope && idx < n,
		}))
	} else if (selection === SelectionType.Last) {
		return candidates.map((msg, idx, arr) => ({
			...msg,
			inScope: msg.inScope && idx === arr.length - 1,
		}))
	} else if (selection === SelectionType.NLast) {
		return candidates.map((msg, idx, arr) => ({
			...msg,
			inScope: msg.inScope && idx >= arr.length - n,
		}))
	} else if (selection === SelectionType.All && roles.length > 0) {
		return candidates
	} else if (selection === SelectionType.All) {
		return candidates.map((msg) => ({ ...msg, inScope: true }))
	}

	return candidates.map((msg) => ({ ...msg, inScope: false }))
}

export function makeGuard(config: MakeGuardConfig): Guard {
	return async (messages, llm): Promise<GuardResult[]> => {
		const selected = selectMessages(messages, config)
		const results = await Promise.all(
			selected.map(async (msg, idx) => {
				const input = msg.content
				return config.implementation(input, msg, config, idx, llm)
			})
		)
		return results
	}
}
