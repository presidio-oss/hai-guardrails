/**
 * @module guards/profanity
 * @description Provides profanity detection functionality using language models.
 * This guard helps identify and filter out profane or offensive language in user inputs.
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
 * Configuration options for the Profanity Guard.
 *
 * @property {number} [threshold=0.8] - The profanity detection threshold (0-1).
 *   Inputs with scores at or above this threshold will be considered profane.
 *   Lower values make the guard more sensitive to potential profanity.
 */
type ProfanityGuardOptions = GuardOptions & {
	threshold?: number
}

/**
 * ## Creates a guard that detects profane or offensive language in text inputs.
 *
 * The Profanity Guard uses a language model to identify and filter out profanity,
 * vulgar language, and explicit content. It returns a score between 0 and 1,
 * where higher scores indicate a higher likelihood of containing profanity.
 *
 * ## Configuration Options
 * - `threshold`: The profanity detection threshold (0-1, default: 0.8)
 * - `llm`: Custom LLM instance to use (optional when used with {@link GuardrailsEngine} and provided in the {@link GuardrailsChainOptions.llm})
 * - `selection`: Which messages to evaluate (default: {@link SelectionType.Last})
 *
 * ## Response Format
 * The guard returns an array of {@link GuardResult} with the following additional properties:
 * - `score`: Confidence score between 0 and 1
 * - `reason`: Explanation of the profanity detection
 * - `flaggedWords`: Array of detected profane words (if any)
 * - `severity`: Severity level of the profanity ('mild', 'moderate', 'severe')
 *
 * @example
 * ```typescript
 * // Basic usage with default settings
 * const basicGuard = profanityGuard({ threshold: 0.9 });
 *
 * // Advanced usage with custom selection and LLM
 * const customGuard = profanityGuard({
 *   threshold: 0.75,
 *   selection: SelectionType.All, // Check all messages
 *   roles: ['user'], // Only check user messages
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
 * @param {ProfanityGuardOptions} opts - Configuration options for the Profanity Guard
 * @returns {Guard} A guard function that detects profane language in text inputs
 */
export function profanityGuard(opts: ProfanityGuardOptions): Guard {
	const options = { ...{ threshold: 0.8 }, ...opts }
	return llmGuard({
		id: 'profanity',
		name: 'Profanity Guard',
		description: 'Detects and filters profane or offensive language',
		...options,
		selection: SelectionType.Last,
		validationType: ValidationType.Score,
		roleDefinition:
			'You are a profanity detection system. Identify and flag any profane, vulgar, or offensive language. ' +
			'This includes swear words, slurs, and explicit content. Focus only on the presence of profanity, ' +
			'not the sentiment or context of the message.',
		schema: z.object({
			score: z
				.float32()
				.min(0)
				.max(1)
				.describe('Confidence score between 0 and 1 indicating likelihood of profanity'),
			reason: z.string().describe('Explanation of the profanity detection or why none was found'),
			flaggedWords: z
				.array(z.string())
				.optional()
				.describe('Specific profane or offensive words found in the text'),
			severity: z
				.enum(['mild', 'moderate', 'severe'])
				.optional()
				.describe('Severity level of the profanity detected'),
		}),
		examples: {
			valid: [
				{
					input: 'This is a f***ing disaster!',
					score: 0.95,
					reason: 'Contains a masked profanity',
					flaggedWords: ['f***ing'],
					severity: 'moderate',
				},
				{
					input: 'That movie was complete BS.',
					score: 0.85,
					reason: 'Contains an abbreviation of a profanity',
					flaggedWords: ['BS'],
					severity: 'mild',
				},
				{
					input: 'I had a great day, thanks for asking!',
					score: 0.01,
					reason: 'Polite and contains no profanity',
				},
			],
			invalid: [
				{
					input: '1234567890',
					score: 0.0,
					reason: 'No text to evaluate for profanity',
				},
				{
					input: 'Hello, how are you today?',
					score: 0.01,
					reason: 'Standard greeting with no profanity',
				},
			],
		},
	})
}
