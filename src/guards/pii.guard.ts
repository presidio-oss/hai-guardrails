import type { Guard, GuardOptions } from '@hai-guardrails/types'
import { makeGuard } from '@hai-guardrails/guards'

type PIIRegex = {
	id: string
	name: string
	description: string
	regex: RegExp
	replacement: string
}

const PII_REGEX_REGISTRY = [
	{
		id: 'email',
		name: 'Email',
		description: 'Email addresses',
		regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
		replacement: '[REDACTED-EMAIL]',
	},
	{
		id: 'phone',
		name: 'Phone',
		description: 'Phone numbers',
		regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
		replacement: '[REDACTED-PHONE]',
	},
	{
		id: 'ssn',
		name: 'SSN',
		description: 'Social Security Numbers',
		regex: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
		replacement: '[REDACTED-SSN]',
	},
	{
		id: 'credit-card',
		name: 'Credit Card',
		description: 'Credit Card Numbers',
		regex: /\b\d{4}[-.]?\d{4}[-.]?\d{4}[-.]?\d{4}\b/g,
		replacement: '[REDACTED-CREDIT-CARD]',
	},
	{
		id: 'credit-card',
		name: 'Credit Card',
		description: 'Credit Card Numbers',
		regex: /\b\d{4}[-.]?\d{4}[-.]?\d{4}[-.]?\d{4}\b/g,
		replacement: '[REDACTED-CREDIT-CARD]',
	},
	{
		id: 'ip-address',
		name: 'IP Address',
		description: 'IP Addresses',
		regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
		replacement: '[REDACTED-IP-ADDRESS]',
	},
] satisfies PIIRegex[]

function redactPII(input: string, patterns: PIIRegex[]): string {
	const regexes = patterns.map((regex) => ({
		...regex,
		regex: new RegExp(regex.regex.source, regex.regex.flags),
	}))
	return regexes.reduce((input, regex) => {
		return input.replace(regex.regex, regex.replacement)
	}, input)
}

type PIIGuardOptions = GuardOptions & {
	patterns?: PIIRegex[]
	mode?: 'block' | 'redact'
}

export function piiGuard(opts: PIIGuardOptions = {}): Guard {
	return makeGuard({
		...opts,
		id: 'pii',
		name: 'PII Guard',
		implementation: (input, msg, config, idx) => {
			const patterns = [...PII_REGEX_REGISTRY, ...(opts.patterns || [])]
			const mode = opts.mode || 'redact'
			const common = {
				guardId: config.id,
				guardName: config.name,
				message: msg.originalMessage,
				index: idx,
				passed: true,
				reason: 'No PII detected',
				messageHash: msg.messageHash,
				inScope: msg.inScope,
			}
			if (!msg.inScope) {
				return {
					...common,
					passed: true,
					reason: 'Message is not in scope',
				}
			}
			const redactedInput = redactPII(input, patterns)
			if (redactedInput !== input) {
				return {
					...common,
					passed: mode === 'block',
					reason: 'Input contains possible PII',
					modifiedMessage: {
						...msg.originalMessage,
						content: redactedInput,
					},
				}
			}
			return common
		},
	})
}
