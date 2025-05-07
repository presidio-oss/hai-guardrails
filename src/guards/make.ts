import type {
	Guard,
	GuardOptions,
	GuardResult,
	LLMMessage,
	MakeGuardConfig,
	MessageType,
} from '../types/types'

function selectMessages(messages: LLMMessage[], opts: GuardOptions = {}): LLMMessage[] {
	const allCandidates = messages.map((msg) => ({ ...msg, inScope: false }))

	if ('predicate' in opts && typeof opts.predicate === 'function') {
		return allCandidates.map((msg) => ({
			...msg,
			inScope: opts.predicate(msg, allCandidates.indexOf(msg), allCandidates),
		}))
	}

	const roles = opts.roles || []
	const selection = opts.selection || 'all'
	const n = opts.n || 1

	let candidates = allCandidates
	if (roles.length > 0) {
		candidates = allCandidates.map((msg) => ({
			...msg,
			inScope: roles.includes(msg.role as MessageType),
		}))
	}

	if (selection === 'first') {
		return candidates.map((msg, idx) => ({
			...msg,
			inScope: msg.inScope && idx === 0,
		}))
	} else if (selection === 'n-first') {
		return candidates.map((msg, idx) => ({
			...msg,
			inScope: msg.inScope && idx < n,
		}))
	} else if (selection === 'last') {
		return candidates.map((msg, idx, arr) => ({
			...msg,
			inScope: msg.inScope && idx === arr.length - 1,
		}))
	} else if (selection === 'n-last') {
		return candidates.map((msg, idx, arr) => ({
			...msg,
			inScope: msg.inScope && idx >= arr.length - n,
		}))
	} else if (selection === 'all' && roles.length > 0) {
		return candidates
	} else if (selection === 'all') {
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
