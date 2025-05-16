import type { LLMMessage, MessageHahsingAlgorithm } from '@hai-guardrails/types'
import { createHash } from 'node:crypto'

/**
 * Attempts to serialize an object into a JSON string.
 * The object is first sorted by keys to ensure a consistent ordering.
 * If the serialization fails, the function returns `null`.
 * @param obj The object to serialize.
 * @returns The serialized object as a JSON string, or `null` if serialization fails.
 */
function safeJSONStringify(obj: any): string | null {
	try {
		return JSON.stringify(sortObject(obj))
	} catch (err) {
		return null
	}
}

/**
 * Recursively sorts an object by keys, to ensure a consistent ordering.
 * @param obj The object to sort.
 * @returns The sorted object.
 */
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

/**
 * Hashes an object using the specified hashing algorithm.
 * The object is first serialized into a JSON string with sorted keys.
 * If serialization is successful, the JSON string is hashed using the provided algorithm.
 * @param obj The object to be hashed.
 * @param algorithm The hashing algorithm to use (e.g., 'md5', 'sha1', 'sha256', 'sha512').
 * @returns The hash of the object as a hexadecimal string, or `undefined` if serialization fails.
 */
function hashObject(
	obj: Record<string, any>,
	algorithm: MessageHahsingAlgorithm
): string | undefined {
	const json = safeJSONStringify(obj)

	if (json) {
		return createHash(algorithm).update(json).digest('hex')
	}
}

/**
 * Hashes an LLMMessage using the specified hashing algorithm.
 * The message is first serialized into a JSON string with sorted keys.
 * If serialization is successful, the JSON string is hashed using the provided algorithm.
 * @param message The LLMMessage to be hashed.
 * @param algorithm The hashing algorithm to use (e.g., 'md5', 'sha1', 'sha256', 'sha512').
 * @returns The hash of the message as a hexadecimal string, or `undefined` if serialization fails.
 */
export function hashMessage(
	message: LLMMessage,
	algorithm: MessageHahsingAlgorithm
): string | undefined {
	return hashObject(message, algorithm)
}
