import { describe, it, expect } from 'bun:test'
import { selectMessages } from '@hai-guardrails/guards'

import { SelectionType } from '@hai-guardrails/types'
import type { LLMMessage } from '@hai-guardrails/types'

describe('selectMessages', () => {
	const messages: LLMMessage[] = [
		{ role: 'user', content: 'Hello' }, // 0
		{ role: 'assistant', content: 'Hi!' }, // 1
		{ role: 'user', content: 'How are you?' }, // 2
		{ role: 'system', content: 'System message' }, // 3
	]

	// 1. get all messages
	it('gets all messages', () => {
		const result = selectMessages(messages)
		expect(result.map((m) => m.inScope)).toEqual([true, true, true, true])
	})

	// 2. get all messages where role is user
	it('gets all messages where role is user', () => {
		const result = selectMessages(messages, { roles: ['user'] })
		expect(result.map((m) => m.inScope)).toEqual([true, false, true, false])
	})

	// 3. get all messages where role is user and assistant
	it('gets all messages where role is user and assistant', () => {
		const result = selectMessages(messages, { roles: ['user', 'assistant'] })
		expect(result.map((m) => m.inScope)).toEqual([true, true, true, false])
	})

	// 4. get first message
	it('gets the first message', () => {
		const result = selectMessages(messages, { selection: SelectionType.First })
		expect(result.map((m) => m.inScope)).toEqual([true, false, false, false])
	})

	// 5. get first message where role is user
	it('gets the first message where role is user', () => {
		const result = selectMessages(messages, { roles: ['user'], selection: SelectionType.First })
		// Only the first message, and it matches the role
		expect(result.map((m) => m.inScope)).toEqual([true, false, false, false])
	})

	// 6. get last message
	it('gets the last message', () => {
		const result = selectMessages(messages, { selection: SelectionType.Last })
		expect(result.map((m) => m.inScope)).toEqual([false, false, false, true])
	})

	// 7. get last message where role is user
	it('gets the last message where role is user', () => {
		const result = selectMessages(messages, { roles: ['user'], selection: SelectionType.Last })
		// Only the last message, and it matches the role
		expect(result.map((m) => m.inScope)).toEqual([false, false, true, false])
	})

	// 8. get first two messages
	it('gets the first two messages', () => {
		const result = selectMessages(messages, { selection: SelectionType.NFirst, n: 2 })
		expect(result.map((m) => m.inScope)).toEqual([true, true, false, false])
	})

	// 9. get first two messages where role is user
	it('gets the first two messages where role is user', () => {
		const result = selectMessages(messages, {
			roles: ['user'],
			selection: SelectionType.NFirst,
			n: 2,
		})
		// Only first two that match the role
		expect(result.map((m) => m.inScope)).toEqual([true, false, true, false])
	})

	// 10. get first two messages where role is user and assistant
	it('gets the first two messages where role is user and assistant', () => {
		const result = selectMessages(messages, {
			roles: ['user', 'assistant'],
			selection: SelectionType.NFirst,
			n: 2,
		})
		// Only first two that match the role
		expect(result.map((m) => m.inScope)).toEqual([true, true, false, false])
	})

	// 11. get last two messages
	it('gets the last two messages', () => {
		const result = selectMessages(messages, { selection: SelectionType.NLast, n: 2 })
		expect(result.map((m) => m.inScope)).toEqual([false, false, true, true])
	})

	// 12. get last two messages where role is user
	it('gets the last two messages where role is user', () => {
		const result = selectMessages(messages, {
			roles: ['user'],
			selection: SelectionType.NLast,
			n: 2,
		})
		// Only last two that match the role
		expect(result.map((m) => m.inScope)).toEqual([true, false, true, false])
	})

	// 13. get last two messages where role is user and assistant
	it('gets the last two messages where role is user and assistant', () => {
		const result = selectMessages(messages, {
			roles: ['user', 'assistant'],
			selection: SelectionType.NLast,
			n: 2,
		})
		// Only last two that match the role
		expect(result.map((m) => m.inScope)).toEqual([false, true, true, false])
	})
})
