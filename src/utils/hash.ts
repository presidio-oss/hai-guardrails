import type { LLMMessage, MessageHahsingAlgorithm } from '@hai-guardrails/types'
import { createHash } from 'node:crypto'

function safeJSONStringify(obj: any): string | null {
	try {
		return JSON.stringify(sortObject(obj))
	} catch (err) {
		return null
	}
}

function sortObject(obj: any): any {
	if (Array.isArray(obj)) {
		return obj.map(sortObject)
	} else if (obj !== null && typeof obj === 'object') {
		return Object.keys(obj)
			.sort()
			.reduce((result: any, key) => {
				result[key] = sortObject(obj[key])
				return result
			}, {})
	}
	return obj
}

function hashObject(
	obj: Record<string, any>,
	algorithm: MessageHahsingAlgorithm
): string | undefined {
	const json = safeJSONStringify(obj)

	if (json) {
		return createHash(algorithm).update(json).digest('hex')
	}
}

export function hashMessage(
	message: LLMMessage,
	algorithm: MessageHahsingAlgorithm
): string | undefined {
	return hashObject(message, algorithm)
}
