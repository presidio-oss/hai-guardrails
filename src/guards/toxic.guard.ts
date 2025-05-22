/**
 * @module guards/toxic
 * @description Provides toxicity detection functionality using language models.
 * This guard helps identify and filter out toxic language in user inputs.
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
 * Configuration options for the Toxic Guard.
 *
 * @property {number} [threshold=0.95] - The toxicity score threshold (0-1).
 *   Inputs with scores at or above this threshold will be considered toxic.
 *   Lower values make the guard more sensitive to potential toxicity.
 */
type ToxicGuardOptions = GuardOptions & {
	threshold?: number
}

/**
 * ## Creates a guard that detects toxic language in text inputs.
 *
 * The Toxic Guard uses a language model to analyze text and detect various forms of toxicity,
 * including hate speech, harassment, and other harmful content. It returns a score between 0 and 1,
 * where higher scores indicate higher likelihood of toxicity.
 *
 * ## Configuration Options
 * - `threshold`: The toxicity score threshold (0-1, default: 0.95)
 * - `llm`: Custom LLM instance to use (optional when used with {@link GuardrailsEngine} and provided in the {@link GuardrailsChainOptions.llm})
 * - `selection`: Which messages to evaluate (default: {@link SelectionType.Last})
 *
 * ## Response Format
 * The guard returns an array of {@link GuardResult}
 *
 * @example
 * ```typescript
 * // Basic usage with default settings
 * const basicGuard = toxicGuard({ threshold: 0.9 });
 *
 * // Advanced usage with custom selection and LLM
 * const customGuard = toxicGuard({
 *   threshold: 0.85,
 *   selection: SelectionType.All, // Check all messages
 *   roles: ['user', 'assistant'], // Only check user and assistant messages
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
 * @param {ToxicGuardOptions} opts - Configuration options for the Toxic Guard
 * @returns {Guard} A guard function that detects toxic language in text inputs
 */
export function toxicGuard(opts: ToxicGuardOptions): Guard {
	const options = { ...{ threshold: 0.95 }, ...opts }
	return llmGuard({
		id: 'toxic',
		name: 'Toxic Guard',
		description: 'Detects toxicity in user input',
		...options,
		selection: SelectionType.Last,
		validationType: ValidationType.Score,
		roleDefinition:
			'You are a toxic language detection and classification system. Only detect toxicity and do not detect anything other than toxic language.',
		schema: z.object({
			score: z
				.float32()
				.min(0)
				.max(1)
				.describe('Floating point number between 0 and 1 to indicate the toxicity of the input'),
			reason: z.string().describe('The reason why the input is being considered toxic or not'),
		}),
		examples: {
			valid: [
				{
					input: "You're completely useless, stop wasting everyone's time.",
					score: 0.92,
					reason: 'The sentence includes personal attacks and demeaning language.',
				},
				{
					input: 'I think your idea has potential, but maybe we can explore a different angle too.',
					score: 0.05,
					reason: 'The sentence is constructive and polite with no toxic elements.',
				},
				{
					input: "Only an idiot would think that's a good idea.",
					score: 0.87,
					reason: "The use of the word 'idiot' constitutes a personal insult.",
				},
				{
					input: 'Thanks for your feedback! I’ll look into improving it.',
					score: 0.01,
					reason: 'The input is appreciative and friendly.',
				},
			],
			invalid: [
				{
					input: 'asdfasfdasdf',
					score: 0.0,
					reason: 'Gibberish — does not contain meaningful language or toxicity.',
				},
				{
					input: '!!!',
					score: 0.0,
					reason: 'Punctuation-only input — no toxic content detected.',
				},
				{
					input: "<script>alert('hack');</script>",
					score: 0.0,
					reason: 'Code snippet — not a toxic comment, but could be unsafe content.',
				},
			],
		},
	})
}
