/**
 * @module guards/adult-content
 * @description Provides adult content detection functionality using language models.
 * This guard helps identify and filter out NSFW (Not Safe For Work) or adult-oriented content.
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
 * Configuration options for the Adult Content Guard.
 *
 * @property {number} [threshold=0.8] - The adult content detection threshold (0-1).
 *   Inputs with scores at or above this threshold will be flagged as potential adult content.
 *   Lower values make the guard more sensitive to potential adult content.
 */
type AdultContentGuardOptions = GuardOptions & {
	threshold?: number
}

/**
 * ## Creates a guard that detects adult or NSFW (Not Safe For Work) content in text inputs.
 *
 * The Adult Content Guard uses a language model to identify explicit sexual content,
 * adult themes, or other NSFW material. It helps ensure that content remains appropriate
 * for the intended audience and use case.
 *
 * ## Configuration Options
 * - `threshold`: The adult content detection threshold (0-1, default: 0.8)
 * - `llm`: Custom LLM instance to use (optional when used with {@link GuardrailsEngine} and provided in the {@link GuardrailsChainOptions.llm})
 * - `selection`: Which messages to evaluate (default: {@link SelectionType.Last})
 *
 * ## Response Format
 * The guard returns an array of {@link GuardResult} with the following additional properties:
 * - `score`: Confidence score between 0 and 1
 * - `reason`: Explanation of the adult content detection
 * - `categories`: Array of detected content categories (e.g., 'romance', 'suggestive', 'adult')
 * - `isExplicit`: Boolean indicating if the content contains explicit sexual material
 *
 * @example
 * ```typescript
 * // Basic usage with default settings
 * const basicGuard = adultContentGuard({ threshold: 0.85 });
 *
 * // Advanced usage with custom selection and LLM
 * const customGuard = adultContentGuard({
 *   threshold: 0.75,
 *   selection: SelectionType.All, // Check all messages
 *   roles: ['user', 'assistant'], // Check both user and assistant messages
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
 * @param {AdultContentGuardOptions} opts - Configuration options for the Adult Content Guard
 * @returns {Guard} A guard function that detects adult or NSFW content in text inputs
 */
export function adultContentGuard(opts: AdultContentGuardOptions): Guard {
	const options = { ...{ threshold: 0.8 }, ...opts }
	return llmGuard({
		id: 'adult-content',
		name: 'Adult Content Guard',
		description: 'Detects and blocks adult or NSFW content',
		...options,
		selection: SelectionType.Last,
		validationType: ValidationType.Score,
		roleDefinition:
			'You are an adult content detection system. Identify any explicit sexual content, ' +
			'adult themes, or NSFW material. Focus on detecting content that would be inappropriate ' +
			'for general audiences or work environments.',
		schema: z.object({
			score: z
				.float32()
				.min(0)
				.max(1)
				.describe('Confidence score between 0 and 1 indicating likelihood of adult content'),
			reason: z
				.string()
				.describe('Explanation of the adult content detection or why none was found'),
			categories: z
				.array(z.string())
				.optional()
				.describe('Categories of adult content detected, if any'),
			isExplicit: z
				.boolean()
				.optional()
				.describe('Whether the content contains explicit sexual content'),
		}),
		examples: {
			valid: [
				{
					input:
						'This novel explores the intimate relationship between two adults, with scenes implying sexual tension and private encounters.',
					score: 0.82,
					reason: 'Contains adult themes and implied sexual situations',
					categories: ['romance', 'suggestive'],
					isExplicit: false,
				},
				{
					input:
						'This review discusses various adult toys designed to enhance bedroom experiences for couples.',
					score: 0.85,
					reason: 'Mentions sexual wellness products',
					categories: ['product', 'adult'],
					isExplicit: false,
				},
				{
					input: 'This is a family-friendly movie review',
					score: 0.01,
					reason: 'Content is appropriate for all audiences',
				},
			],
			invalid: [
				{
					input: 'Hello, how are you today?',
					score: 0.0,
					reason: 'Neutral greeting with no adult content',
				},
			],
		},
	})
}
