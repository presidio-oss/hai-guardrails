export function normalizeString(str: string): string {
	return str
		.toLowerCase()
		.replace(/[^\w\s]|_/g, '')
		.replace(/\s+/g, ' ')
		.trim()
}

export function normalizeInput(input: string | object): string {
	if (typeof input === 'string') {
		return input
	}
	try {
		return JSON.stringify(input, null, 2)
	} catch (error) {
		return String(input)
	}
}

export function safeExecute<T>(fn: () => T, fallback: T): T {
	try {
		return fn()
	} catch (error) {
		return fallback
	}
}
