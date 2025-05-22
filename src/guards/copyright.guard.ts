/**
 * @module guards/copyright
 * @description Provides copyright detection functionality using language models.
 * This guard helps identify potential copyright violations in text inputs.
 */

import { llmGuard, ValidationType } from '@hai-guardrails/guards'
import {
	SelectionType,
	type Guard,
	type GuardOptions,
	type GuardResult,
	type GuardrailsChainOptions,
} from '@hai-guardrails/types'
import { z } from 'zod/v4'
import type { GuardrailsEngine } from '@hai-guardrails/engine'

/**
 * Configuration options for the Copyright Guard.
 *
 * @property {number} [threshold=0.8] - The copyright detection threshold (0-1).
 *   Inputs with scores at or above this threshold will be flagged for potential copyright issues.
 *   Lower values make the guard more sensitive to potential copyright violations.
 */
type CopyrightGuardOptions = GuardOptions & {
	threshold?: number
}

/**
 * ## Creates a guard that detects potential copyright violations in text inputs.
 *
 * The Copyright Guard uses a language model to identify text that might be protected by copyright,
 * including song lyrics, book excerpts, articles, code snippets, and movie scripts. It helps prevent
 * the unauthorized use of copyrighted material in AI-generated content.
 *
 * ## Configuration Options
 * - `threshold`: The copyright detection threshold (0-1, default: 0.8)
 * - `llm`: Custom LLM instance to use (optional when used with {@link GuardrailsEngine} and provided in the {@link GuardrailsChainOptions.llm})
 * - `selection`: Which messages to evaluate (default: {@link SelectionType.Last})
 *
 * ## Response Format
 * The guard returns an array of {@link GuardResult} with the following additional properties:
 * - `score`: Confidence score between 0 and 1
 * - `reason`: Explanation of the copyright detection
 * - `type`: Array of detected content types (e.g., 'book_excerpt', 'lyrics')
 * - `source`: Potential source or work this content might be from
 * - `isDirectMatch`: Whether this appears to be a direct match with a known work
 *
 * @example
 * ```typescript
 * // Basic usage with default settings
 * const basicGuard = copyrightGuard({ threshold: 0.75 });
 *
 * // Advanced usage with custom selection and LLM
 * const customGuard = copyrightGuard({
 *   threshold: 0.7,
 *   selection: SelectionType.All, // Check all messages
 *   roles: ['assistant'], // Only check assistant outputs
 *   llm: customLLM, // Use a custom LLM instance
 *   messageHashingAlgorithm: MessageHashingAlgorithm.SHA512 // Use SHA-512 for message hashing
 * });
 * ```
 *
 * @see {@link GuardOptions} for additional configuration options
 * @see {@link GuardResult} for the structure of the returned results
 *
 * @throws {Error} If no LLM is provided either in the options or in the GuardrailsEngine
 *
 * @param {CopyrightGuardOptions} opts - Configuration options for the Copyright Guard
 * @returns {Guard} A guard function that detects potential copyright violations in text inputs
 */
export function copyrightGuard(opts: CopyrightGuardOptions): Guard {
	const options = { ...{ threshold: 0.8 }, ...opts }
	return llmGuard({
		id: 'copyright',
		name: 'Copyright Guard',
		description: 'Detects potential copyright violations in text',
		...options,
		selection: SelectionType.Last,
		validationType: ValidationType.Score,
		roleDefinition:
			'You are a copyright detection system. Identify text that might be protected by copyright, ' +
			'including song lyrics, book excerpts, articles, code snippets, and movie scripts. ' +
			'Focus on identifying content that is likely copyrighted rather than general knowledge or common phrases. ' +
			'Be particularly attentive to verbatim text matches with known works.',
		schema: z.object({
			score: z
				.float32()
				.min(0)
				.max(1)
				.describe('Confidence score between 0 and 1 indicating likelihood of copyrighted content'),
			reason: z.string().describe('Explanation of the copyright detection or why none was found'),
			type: z
				.array(z.string())
				.optional()
				.describe('Type of potentially copyrighted content detected'),
			source: z.string().optional().describe('Potential source or work this content might be from'),
			isDirectMatch: z
				.boolean()
				.optional()
				.describe('Whether this appears to be a direct match with a known work'),
		}),
		examples: {
			valid: [
				{
					input: 'To be, or not to be, that is the question',
					score: 0.9,
					reason: "Well-known quote from Shakespeare's Hamlet",
					type: ['book_excerpt'],
					source: 'Hamlet by William Shakespeare',
					isDirectMatch: true,
				},
				{
					input: 'The quick brown fox jumps over the lazy dog',
					score: 0.05,
					reason: 'Common pangram with no specific copyright',
				},
			],
			invalid: [
				{
					input: 'Hello, how are you today?',
					score: 0.01,
					reason: 'Common greeting with no copyright concerns',
				},
				{
					input: '1234567890',
					score: 0.0,
					reason: 'Number sequence with no copyrightable content',
				},
			],
		},
	})
}
